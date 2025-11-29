import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';

function CanvasControls({ isReady }) {
  const { canvas } = useCanvasStore();
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!canvas) return;

    // Enable zoom with mouse wheel
    const handleWheel = (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;

      // Limit zoom
      if (newZoom > 3) newZoom = 3;
      if (newZoom < 0.1) newZoom = 0.1;

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      setZoom(Math.round(newZoom * 100));
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    canvas.on('mouse:wheel', handleWheel);

    // Enable panning
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    const handleMouseDown = (opt) => {
      const evt = opt.e;
      if (evt.altKey === true || evt.metaKey === true) {
        isPanning = true;
        canvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    };

    const handleMouseMove = (opt) => {
      if (isPanning) {
        const evt = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += evt.clientX - lastPosX;
        vpt[5] += evt.clientY - lastPosY;
        canvas.requestRenderAll();
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    };

    const handleMouseUp = () => {
      isPanning = false;
      canvas.selection = true;
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:wheel', handleWheel);
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas]);

  const handleZoomIn = () => {
    if (!canvas) return;
    const newZoom = canvas.getZoom() * 1.1;
    if (newZoom <= 3) {
      canvas.setZoom(newZoom);
      canvas.requestRenderAll();
      setZoom(Math.round(newZoom * 100));
    }
  };

  const handleZoomOut = () => {
    if (!canvas) return;
    const newZoom = canvas.getZoom() * 0.9;
    if (newZoom >= 0.1) {
      canvas.setZoom(newZoom);
      canvas.requestRenderAll();
      setZoom(Math.round(newZoom * 100));
    }
  };

  const handleResetZoom = () => {
    if (!canvas) return;
    canvas.setZoom(1);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.requestRenderAll();
    setZoom(100);
  };

  return (
    <div className="w-64 h-full bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-gray-800 mb-4">Canvas Controls</h3>

      {/* Zoom controls */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Zoom</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              disabled={!isReady}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ZoomOut size={18} />
            </button>
            <div className="flex-1 text-center font-mono text-sm">
              {zoom}%
            </div>
            <button
              onClick={handleZoomIn}
              disabled={!isReady}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={handleResetZoom}
          disabled={!isReady}
          className="w-full px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Maximize size={18} />
          Reset View
        </button>

        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p className="font-semibold mb-1">Tips:</p>
          <ul className="space-y-1">
            <li>• Scroll to zoom</li>
            <li>• Alt/Cmd + drag to pan</li>
            <li>• Click object to select</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CanvasControls;