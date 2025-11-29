import { Undo, Redo, Trash2, Download } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';

function CanvasToolbar({ isReady }) {
  const { canvas, clearCanvas, undo, redo } = useCanvasStore(); // ← ADDED undo, redo

  const handleUndo = () => {
    undo(); // ← FIXED
  };

  const handleRedo = () => {
    redo(); // ← FIXED
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
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-8">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
          RF
        </div>
        <span className="font-semibold text-gray-800">Retail Forge AI</span>
      </div>

      {/* Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUndo}
          disabled={!isReady}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!isReady}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={20} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={handleDelete}
          disabled={!isReady}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Delete (Del)"
        >
          <Trash2 size={20} />
        </button>

        <button
          onClick={handleClear}
          disabled={!isReady}
          className="px-3 py-2 text-sm rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Clear Canvas
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export button */}
      <button
        disabled={!isReady}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        <Download size={18} />
        Export
      </button>
    </div>
  );
}

export default CanvasToolbar;