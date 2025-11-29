import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import useCanvasStore from '../../store/canvasStore';
import CanvasToolbar from './CanvasToolbar';
import CanvasControls from './CanvasControls';
import useKeyboard from '../../hooks/useKeyboard'; // ADD THIS
import './canvas.css';

function CanvasEditor() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const { setCanvas, saveState } = useCanvasStore(); // ADD saveState
  const [isReady, setIsReady] = useState(false);

  // ADD THIS - Enable keyboard shortcuts
  useKeyboard();

  useEffect(() => {
    // Prevent double initialization
    if (fabricCanvasRef.current || !canvasRef.current) return;

    // Initialize Fabric.js canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 400,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    // Set default controls styling
    fabric.Object.prototype.set({
      borderColor: '#2563eb',
      cornerColor: '#2563eb',
      cornerStyle: 'circle',
      cornerSize: 10,
      transparentCorners: false,
      borderScaleFactor: 2,
    });

    // Store canvas in ref
    fabricCanvasRef.current = fabricCanvas;
    
    // For debugging only
    window.__canvas__ = fabricCanvas;

    console.log('✅ Canvas initialized');

    // Update state in next tick to avoid sync state update warning
    setTimeout(() => {
      setCanvas(fabricCanvas);
      setIsReady(true);
    }, 0);

    // Cleanup on unmount
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [setCanvas]);

  // Canvas event handlers
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleSelection = (e) => {
      console.log('Object selected:', e.selected);
    };

    const handleModified = (e) => {
      console.log('Object modified:', e.target);
      saveState(); // SAVE STATE FOR UNDO/REDO
    };

    const handleObjectAdded = (e) => {
      console.log('Object added:', e.target);
      saveState(); // SAVE STATE WHEN OBJECT ADDED
    };

    const handleObjectRemoved = (e) => {
      console.log('Object removed:', e.target);
      saveState(); // SAVE STATE WHEN OBJECT REMOVED
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Toolbar */}
      <CanvasToolbar isReady={isReady} />

      {/* Main canvas area - Using inline styles to force layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Canvas container */}
        <div
          ref={containerRef}
          style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '32px', 
            backgroundColor: '#e5e7eb',
            overflow: 'auto'
          }}
        >
          <div className="canvas-wrapper shadow-2xl">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Side controls - Fixed right sidebar */}
        <div style={{ 
          width: '256px', 
          flexShrink: 0,
          backgroundColor: 'white',
          borderLeft: '1px solid #e5e7eb',
          overflowY: 'auto'
        }}>
          <CanvasControls isReady={isReady} />
        </div>
      </div>

      {/* Status bar */}
      <div style={{ 
        height: '32px', 
        backgroundColor: '#1f2937', 
        color: 'white', 
        padding: '0 16px', 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '14px',
        flexShrink: 0
      }}>
        <span>Canvas: 500x400px</span>
        <span style={{ margin: '0 16px' }}>|</span>
        <span>{isReady ? '✅ Ready' : '⏳ Initializing...'}</span>
      </div>
    </div>
  );
}

export default CanvasEditor;