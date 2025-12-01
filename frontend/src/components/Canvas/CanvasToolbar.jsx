import { Undo, Redo, Trash2, Download } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import './CanvasToolbar.css';
import Tooltip from '../UI/Tooltip';
import KeyboardHelp from '../UI/KeyboardHelp';

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
        <Tooltip text="Undo (Ctrl+Z)">
          <button
            onClick={handleUndo}
            disabled={!isReady}
            className="toolbar-btn"
          >
            <Undo size={20} />
          </button>
        </Tooltip>

        <Tooltip text="Redo (Ctrl+Shift+Z)">
          <button
            onClick={handleRedo}
            disabled={!isReady}
            className="toolbar-btn"
          >
            <Redo size={20} />
          </button>
        </Tooltip>

        <div className="toolbar-divider" />

        <Tooltip text="Delete Selected (Del)">
          <button
            onClick={handleDelete}
            disabled={!isReady}
            className="toolbar-btn"
          >
            <Trash2 size={20} />
          </button>
        </Tooltip>

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

      <KeyboardHelp />

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