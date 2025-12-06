import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { fabric } from 'fabric';

// Keyboard Shortcuts Help Modal
const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'General', items: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Ctrl', 'S'], description: 'Save current design' },
      { keys: ['Ctrl', 'E'], description: 'Export creative' },
      { keys: ['Esc'], description: 'Deselect all / Close modal' }
    ]},
    { category: 'Canvas', items: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'C'], description: 'Copy selected object' },
      { keys: ['Ctrl', 'V'], description: 'Paste' },
      { keys: ['Del'], description: 'Delete selected object' },
      { keys: ['Ctrl', 'A'], description: 'Select all objects' }
    ]},
    { category: 'Object Manipulation', items: [
      { keys: ['↑', '↓', '←', '→'], description: 'Move object (1px)' },
      { keys: ['Shift', '↑↓←→'], description: 'Move object (10px)' },
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom to 100%' }
    ]},
    { category: 'Layers', items: [
      { keys: ['Ctrl', '['], description: 'Send backward' },
      { keys: ['Ctrl', ']'], description: 'Bring forward' },
      { keys: ['Ctrl', 'Shift', '['], description: 'Send to back' },
      { keys: ['Ctrl', 'Shift', ']'], description: 'Bring to front' }
    ]}
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {shortcuts.map((category, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
                  >
                    <span className="text-sm text-gray-600">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded shadow-sm">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-2 py-1 text-xs bg-gray-200 rounded">?</kbd> anytime to view shortcuts
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook for keyboard shortcuts functionality
const useKeyboardShortcuts = () => {
  const { canvas, saveCanvas, exportCanvas } = useCanvas();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Moved helper function to top so it's defined before usage
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 text-sm';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 1500);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Show shortcuts modal with '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Close modal with Esc
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        if (canvas) {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        return;
      }

      if (!canvas) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const activeObject = canvas.getActiveObject();

      // Ctrl/Cmd + S: Save
      if (isCtrlOrCmd && e.key === 's') {
        e.preventDefault();
        if (saveCanvas) {
          saveCanvas();
          showNotification('✓ Design saved');
        }
        return;
      }

      // Ctrl/Cmd + E: Export
      if (isCtrlOrCmd && e.key === 'e') {
        e.preventDefault();
        if (exportCanvas) {
          exportCanvas();
        }
        return;
      }

      // Delete: Remove selected object
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeObject) {
        e.preventDefault();
        canvas.remove(activeObject);
        canvas.renderAll();
        showNotification('✓ Object deleted');
        return;
      }

      // Ctrl/Cmd + A: Select all
      if (isCtrlOrCmd && e.key === 'a') {
        e.preventDefault();
        const objects = canvas.getObjects();
        const selection = new fabric.ActiveSelection(objects, { canvas });
        canvas.setActiveObject(selection);
        canvas.renderAll();
        return;
      }

      // Ctrl/Cmd + C: Copy
      if (isCtrlOrCmd && e.key === 'c' && activeObject) {
        e.preventDefault();
        activeObject.clone((cloned) => {
          window._clipboard = cloned;
        });
        showNotification('✓ Copied to clipboard');
        return;
      }

      // Ctrl/Cmd + V: Paste
      if (isCtrlOrCmd && e.key === 'v' && window._clipboard) {
        e.preventDefault();
        window._clipboard.clone((clonedObj) => {
          canvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
          });
          if (clonedObj.type === 'activeSelection') {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject((obj) => {
              canvas.add(obj);
            });
            clonedObj.setCoords();
          } else {
            canvas.add(clonedObj);
          }
          canvas.setActiveObject(clonedObj);
          canvas.requestRenderAll();
        });
        showNotification('✓ Pasted');
        return;
      }

      // Arrow keys: Move object
      if (activeObject && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const left = activeObject.left;
        const top = activeObject.top;

        switch (e.key) {
          case 'ArrowUp':
            activeObject.set('top', top - step);
            break;
          case 'ArrowDown':
            activeObject.set('top', top + step);
            break;
          case 'ArrowLeft':
            activeObject.set('left', left - step);
            break;
          case 'ArrowRight':
            activeObject.set('left', left + step);
            break;
        }
        activeObject.setCoords();
        canvas.renderAll();
        return;
      }

      // Ctrl/Cmd + [: Send backward
      if (isCtrlOrCmd && e.key === '[' && activeObject) {
        e.preventDefault();
        canvas.sendBackwards(activeObject);
        canvas.renderAll();
        return;
      }

      // Ctrl/Cmd + ]: Bring forward
      if (isCtrlOrCmd && e.key === ']' && activeObject) {
        e.preventDefault();
        canvas.bringForward(activeObject);
        canvas.renderAll();
        return;
      }

      // Ctrl/Cmd + Shift + [: Send to back
      if (isCtrlOrCmd && e.shiftKey && e.key === '{' && activeObject) {
        e.preventDefault();
        canvas.sendToBack(activeObject);
        canvas.renderAll();
        return;
      }

      // Ctrl/Cmd + Shift + ]: Bring to front
      if (isCtrlOrCmd && e.shiftKey && e.key === '}' && activeObject) {
        e.preventDefault();
        canvas.bringToFront(activeObject);
        canvas.renderAll();
        return;
      }

      // Zoom controls
      if (isCtrlOrCmd && e.key === '+') {
        e.preventDefault();
        const zoom = canvas.getZoom();
        canvas.setZoom(Math.min(zoom * 1.1, 3));
        return;
      }

      if (isCtrlOrCmd && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        const zoom = canvas.getZoom();
        canvas.setZoom(Math.max(zoom * 0.9, 0.1));
        return;
      }

      if (isCtrlOrCmd && e.key === '0') {
        e.preventDefault();
        canvas.setZoom(1);
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canvas, saveCanvas, exportCanvas]);

  return { showShortcuts, setShowShortcuts };
};

// Component to add to your main App
const KeyboardShortcutsManager = () => {
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  return (
    <>
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      
      {/* Floating help button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-4 left-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg z-40 transition-colors"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    </>
  );
};

export default KeyboardShortcutsManager;