import { fabric } from 'fabric';
import { useEffect } from 'react';
import useCanvasStore from '../store/canvasStore';

function useKeyboard() {
  const { canvas, undo, redo } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // CRITICAL FIX: Check if user is typing in any input field
      const isTyping = 
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.isContentEditable ||
        e.target.closest('[contenteditable="true"]') ||
        e.target.closest('input') ||
        e.target.closest('textarea');

      // If user is typing, don't trigger any keyboard shortcuts
      if (isTyping) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z
      if (isCtrlOrCmd && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
        return;
      }

      // Redo: Ctrl+Y (Windows alternative)
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // REMOVED: Zoom controls (Ctrl +, Ctrl -, Ctrl 0)
      // These were interfering with browser zoom

      // Delete: Delete or Backspace (only when canvas object is selected)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!canvas) return;
        
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          e.preventDefault();
          canvas.remove(activeObject);
          canvas.discardActiveObject();
          canvas.renderAll();
          console.log('🗑️ Object deleted');
        }
        return;
      }

      // Select All: Ctrl+A or Cmd+A
      if (isCtrlOrCmd && e.key === 'a') {
        e.preventDefault();
        if (!canvas) return;
        
        const objects = canvas.getObjects();
        if (objects.length === 0) return;
        
        canvas.discardActiveObject();
        const sel = new fabric.ActiveSelection(objects, {
          canvas: canvas,
        });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
        console.log(`✅ Selected ${objects.length} objects`);
        return;
      }

      // Copy: Ctrl+C or Cmd+C
      if (isCtrlOrCmd && e.key === 'c') {
        if (!canvas) return;
        
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          e.preventDefault();
          activeObject.clone((cloned) => {
            window._clipboard = cloned;
          });
          console.log('📋 Copied to clipboard');
        }
        return;
      }

      // Paste: Ctrl+V or Cmd+V
      if (isCtrlOrCmd && e.key === 'v') {
        if (!canvas || !window._clipboard) return;
        
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
          console.log('📌 Pasted');
        });
        return;
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        if (!canvas) return;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        console.log('❌ Selection cleared');
        return;
      }

      // Arrow keys: Move object
      if (!canvas) return;
      const activeObject = canvas.getActiveObject();
      
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
      if (isCtrlOrCmd && e.key === '[') {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          e.preventDefault();
          canvas.sendBackwards(activeObject);
          canvas.renderAll();
        }
        return;
      }

      // Ctrl/Cmd + ]: Bring forward
      if (isCtrlOrCmd && e.key === ']') {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          e.preventDefault();
          canvas.bringForward(activeObject);
          canvas.renderAll();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas, undo, redo]);
}

export default useKeyboard;