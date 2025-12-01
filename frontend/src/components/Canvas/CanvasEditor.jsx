import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import useCanvasStore from '../../store/canvasStore';
import CanvasToolbar from './CanvasToolbar';
import CanvasControls from './CanvasControls';
import Sidebar from '../UI/Sidebar';
import useKeyboard from '../../hooks/useKeyboard';
import { optimizeImageForCanvas } from '../../utils/imageOptimizer';
import toast from 'react-hot-toast';
import './canvas.css';
import './CanvasEditor.css';
import { enableSnapping } from '../../utils/snapGuides';

function CanvasEditor() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const { setCanvas, saveState } = useCanvasStore();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- ADDED

  // Enable keyboard shortcuts
  useKeyboard();

  useEffect(() => {
    if (fabricCanvasRef.current || !canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 1080,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      enableRetinaScaling: true,
      imageSmoothingEnabled: true,
    });

    fabric.Object.prototype.set({
      borderColor: '#2563eb',
      cornerColor: '#2563eb',
      cornerStyle: 'circle',
      cornerSize: 10,
      transparentCorners: false,
      borderScaleFactor: 2,
    });

    // Performance optimizations
    fabricCanvas.on('object:moving', () => {
      fabricCanvas.renderOnAddRemove = false;
    });

    fabricCanvas.on('object:modified', () => {
      fabricCanvas.renderOnAddRemove = true;
    });

    fabricCanvasRef.current = fabricCanvas;
    window.__canvas__ = fabricCanvas;
    enableSnapping(fabricCanvas, 10);

    console.log('✅ Canvas initialized');

    setTimeout(() => {
      setCanvas(fabricCanvas);
      setIsReady(true);
      setIsLoading(false); // <-- ADDED
    }, 0);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [setCanvas]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleSelection = (e) => {
      console.log('Object selected:', e.selected);
    };

    const handleModified = (e) => {
      console.log('Object modified:', e.target);
      saveState();
    };

    const handleObjectAdded = (e) => {
      console.log('Object added:', e.target);
      saveState();
    };

    const handleObjectRemoved = (e) => {
      console.log('Object removed:', e.target);
      saveState();
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('object:modified', handleModified);
    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:removed', handleObjectRemoved);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('object:modified', handleModified);
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:removed', handleObjectRemoved);
    };
  }, [isReady, saveState]);

  const handleAddToCanvas = async (uploadData) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !uploadData.url) return;

    try {
      console.log('📥 Adding image to canvas...');

      const optimizedUrl = await optimizeImageForCanvas(uploadData.url, 2000);

      fabric.Image.fromURL(
        optimizedUrl,
        (img) => {
          const maxSize = 800;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

          img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          saveState();

          console.log('✅ Image added to canvas');
        },
        { crossOrigin: 'anonymous' }
      );
    } catch (error) {
      console.error('❌ Failed to add image:', error);
      toast.error('Failed to add image to canvas');
    }
  };

  const handleAddText = (textConfig) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText(textConfig.text, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: textConfig.fontSize,
      fontWeight: textConfig.fontWeight,
      fill: '#000000',
      fontFamily: 'Arial',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();

    text.enterEditing();
    text.selectAll();

    saveState();
  };

  return (
    <div className="canvas-editor-root">

      {/* LOADING OVERLAY ADDED */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div className="animate-spin" style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              margin: '0 auto 16px'
            }} />
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Initializing Canvas...
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <CanvasToolbar isReady={isReady} />

      {/* Main Content */}
      <div className="canvas-editor-content">

        {/* Left Sidebar */}
        <Sidebar 
          onAddToCanvas={handleAddToCanvas}
          onAddText={handleAddText}
        />

        {/* Canvas Area */}
        <div ref={containerRef} className="canvas-editor-center">
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right Controls */}
        <CanvasControls isReady={isReady} />
      </div>

      {/* Status Bar */}
      <div className="canvas-editor-status">
        <span>Canvas: 1080x1080px</span>
        <span className="separator">|</span>
        <span>{isReady ? '✅ Ready' : '⏳ Initializing...'}</span>
      </div>
    </div>
  );
}

export default CanvasEditor;
