import { Undo, Redo, Trash2, Download } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import './CanvasToolbar.css';

function CanvasToolbar({ isReady }) {
  const { canvas, clearCanvas, undo, redo } = useCanvasStore();

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  const handleDelete = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const handleClear = () => {
    if (!canvas) return;
    if (confirm('Clear entire canvas?')) {
      clearCanvas();
    }
  };

  return (
    <div className="canvas-toolbar">
      {/* Logo */}
      <div className="toolbar-logo">
        <div className="logo-icon">RF</div>
        <span className="logo-text">Retail Forge AI</span>
      </div>

      {/* Tools */}
      <div className="toolbar-tools">
        <button
          onClick={handleUndo}
          disabled={!isReady}
          className="toolbar-btn"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!isReady}
          className="toolbar-btn"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={20} />
        </button>

        <div className="toolbar-divider" />

        <button
          onClick={handleDelete}
          disabled={!isReady}
          className="toolbar-btn"
          title="Delete (Del)"
        >
          <Trash2 size={20} />
        </button>

        <button
          onClick={handleClear}
          disabled={!isReady}
          className="toolbar-btn-text"
        >
          Clear Canvas
        </button>
      </div>

      {/* Spacer */}
      <div className="toolbar-spacer" />

      {/* Export button */}
      <button
        disabled={!isReady}
        className="toolbar-export"
      >
        <Download size={18} />
        <span>Export</span>
      </button>
    </div>
  );
}

export default CanvasToolbar;