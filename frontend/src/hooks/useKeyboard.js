import { fabric } from 'fabric';
import { useEffect } from 'react';
import useCanvasStore from '../store/canvasStore';

function useKeyboard() {
  const { canvas, undo, redo } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        redo();
      }

      // Redo: Ctrl+Y (Windows alternative)
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!canvas) return;
        
        e.preventDefault();
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          canvas.remove(activeObject);
          canvas.discardActiveObject();
          canvas.renderAll();
          console.log('🗑️ Object deleted');
        }
      }

      // Select All: Ctrl+A or Cmd+A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (!canvas) return;
        
        const objects = canvas.getObjects();
        if (objects.length === 0) return;
        
        // Select all objects
        canvas.discardActiveObject();
        const sel = new fabric.ActiveSelection(objects, {
          canvas: canvas,
        });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
        console.log(`✅ Selected ${objects.length} objects`);
      }

      // Deselect: Escape
      if (e.key === 'Escape') {
        if (!canvas) return;
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        console.log('❌ Selection cleared');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, undo, redo]);
}

export default useKeyboard;