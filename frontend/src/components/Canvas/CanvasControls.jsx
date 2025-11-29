import { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import './CanvasControls.css';
import ImageControls from './ImageControls';

function CanvasControls({ isReady }) {
  const { canvas } = useCanvasStore();
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!canvas) return;

    const handleWheel = (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;

      if (newZoom > 3) newZoom = 3;
      if (newZoom < 0.1) newZoom = 0.1;

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      setZoom(Math.round(newZoom * 100));
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    canvas.on('mouse:wheel', handleWheel);

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
    <div className="canvas-controls">
      <h3 className="controls-heading">Canvas Controls</h3>

      <div className="controls-section">
        <div className="zoom-control">
          <label className="control-label">Zoom</label>
          <div className="zoom-buttons">
            <button
              onClick={handleZoomOut}
              disabled={!isReady}
              className="zoom-btn"
            >
              <ZoomOut size={18} />
            </button>
            <div className="zoom-display">{zoom}%</div>
            <button
              onClick={handleZoomIn}
              disabled={!isReady}
              className="zoom-btn"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={handleResetZoom}
          disabled={!isReady}
          className="reset-btn"
        >
          <Maximize size={18} />
          <span>Reset View</span>
        </button>

        <div className="tips-box">
          <p className="tips-heading">Tips:</p>
          <ul className="tips-list">
            <li>• Scroll to zoom</li>
            <li>• Alt/Cmd + drag to pan</li>
            <li>• Click object to select</li>
          </ul>
        </div>

        {/* Added Image Controls Section */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <ImageControls />
        </div>
      </div>
    </div>
  );
}

export default CanvasControls;
