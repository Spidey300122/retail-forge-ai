import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import { fabric } from 'fabric';

// Keyboard Shortcuts Help Modal
const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { 
      category: 'General', 
      items: [
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Ctrl', 'S'], description: 'Save current design' },
        { keys: ['Ctrl', 'E'], description: 'Export creative' },
        { keys: ['Esc'], description: 'Deselect all / Close modal' }
      ]
    },
    { 
      category: 'Canvas', 
      items: [
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
        { keys: ['Ctrl', 'Y'], description: 'Redo (Windows alternative)' },
        { keys: ['Ctrl', 'C'], description: 'Copy selected object' },
        { keys: ['Ctrl', 'V'], description: 'Paste' },
        { keys: ['Del'], description: 'Delete selected object' },
        { keys: ['Backspace'], description: 'Delete selected object (alternative)' },
        { keys: ['Ctrl', 'A'], description: 'Select all objects' }
      ]
    },
    { 
      category: 'Object Manipulation', 
      items: [
        { keys: ['↑', '↓', '←', '→'], description: 'Move object (1px)' },
        { keys: ['Shift', '↑↓←→'], description: 'Move object (10px)' },
        { keys: ['Ctrl', '+'], description: 'Zoom in' },
        { keys: ['Ctrl', '-'], description: 'Zoom out' },
        { keys: ['Ctrl', '0'], description: 'Reset zoom to 100%' },
        { keys: ['Scroll'], description: 'Zoom in/out' },
        { keys: ['Alt', 'Drag'], description: 'Pan canvas' },
        { keys: ['Cmd', 'Drag'], description: 'Pan canvas (Mac)' }
      ]
    },
    { 
      category: 'Layers', 
      items: [
        { keys: ['Ctrl', '['], description: 'Send backward' },
        { keys: ['Ctrl', ']'], description: 'Bring forward' },
        { keys: ['Ctrl', 'Shift', '['], description: 'Send to back' },
        { keys: ['Ctrl', 'Shift', ']'], description: 'Bring to front' }
      ]
    }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '672px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Keyboard style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#4b5563'}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            title="Close (Esc)"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 120px)'
        }}>
          {shortcuts.map((category, idx) => (
            <div key={idx} style={{ marginBottom: idx < shortcuts.length - 1 ? '24px' : 0 }}>
              <h3 style={{
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {category.category}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {category.items.map((shortcut, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>
                      {shortcut.description}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          <kbd style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            backgroundColor: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}>
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>+</span>
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
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Press <kbd style={{
              padding: '2px 8px',
              fontSize: '12px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px'
            }}>?</kbd> anytime to view shortcuts
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook for keyboard shortcuts functionality
const useKeyboardShortcuts = () => {
  const { canvas } = useCanvasStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      background-color: #1f2937;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 9999;
      font-size: 14px;
    `;
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
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (canvas) {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
        return;
      }

      if (!canvas) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const activeObject = canvas.getActiveObject();

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
  }, [canvas, showShortcuts]);

  return { showShortcuts, setShowShortcuts };
};

// Main Component - FIXED BUTTON AT BOTTOM RIGHT
const KeyboardShortcutsManager = () => {
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  return (
    <>
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      
      {/* Floating help button - BOTTOM RIGHT - INLINE STYLES FOR MAXIMUM VISIBILITY */}
      <button
        onClick={() => setShowShortcuts(true)}
        title="Keyboard shortcuts (?)"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 9999
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
        }}
        onMouseDown={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseUp={(e) => {
          e.target.style.transform = 'scale(1.1)';
        }}
      >
        <Keyboard style={{ width: '24px', height: '24px' }} />
      </button>
    </>
  );
};

export default KeyboardShortcutsManager;