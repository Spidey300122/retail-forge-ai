import { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { fabric } from 'fabric';
import useCanvasStore from '../../store/canvasStore';
import './CropTool.css';

function CropTool({ image, onComplete, onCancel }) {
  const { canvas } = useCanvasStore();
  const cropRectRef = useRef(null);
  const overlayRef = useRef(null);
  const originalStateRef = useRef(null);

  // Initialize Crop Tool
  useEffect(() => {
    if (!canvas || !image) return;

    console.log('🔪 Starting crop tool');

    // 1. Save original state
    originalStateRef.current = {
      angle: image.angle,
      flipX: image.flipX,
      flipY: image.flipY,
      left: image.left,
      top: image.top,
      scaleX: image.scaleX,
      scaleY: image.scaleY,
      selectable: image.selectable, // Save these specifically
      evented: image.evented
    };

    // 2. Straighten and LOCK the image
    image.set({
      angle: 0,
      flipX: false,
      flipY: false,
      selectable: false, // Lock it
      evented: false     // Ignore clicks
    });
    image.setCoords();
    
    // Note: We do NOT call canvas.discardActiveObject() here, 
    // because we want ImageControls to keep the reference.

    // 3. Create crop rectangle
    const rect = new fabric.Rect({
      left: image.left - (image.width * image.scaleX) / 4,
      top: image.top - (image.height * image.scaleY) / 4,
      width: (image.width * image.scaleX) / 2,
      height: (image.height * image.scaleY) / 2,
      fill: 'rgba(0,0,0,0)', 
      stroke: '#2563eb',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      cornerColor: '#2563eb',
      cornerSize: 12,
      transparentCorners: false,
      lockRotation: true,
      hasRotatingPoint: false,
    });

    // 4. Create overlay
    const overlayRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: canvas.width,
      height: canvas.height,
      fill: 'rgba(0, 0, 0, 0.5)',
      selectable: false,
      evented: false,
    });

    canvas.add(overlayRect);
    canvas.add(rect);
    
    // Ordering: Background -> Overlay -> Image -> CropBox
    canvas.sendToBack(overlayRect);
    image.bringToFront();
    rect.bringToFront();

    canvas.setActiveObject(rect);
    canvas.renderAll();
    
    cropRectRef.current = rect;
    overlayRef.current = overlayRect;

    // Cleanup function - THIS RESTORES YOUR DRAGGING ABILITY
    return () => {
      if (cropRectRef.current) canvas.remove(cropRectRef.current);
      if (overlayRef.current) canvas.remove(overlayRef.current);

      // Restore image state immediately on unmount
      if (image && originalStateRef.current) {
        const og = originalStateRef.current;
        image.set({
          angle: og.angle,
          flipX: og.flipX,
          flipY: og.flipY,
          selectable: true, // <--- IMPORTANT: Re-enable selection
          evented: true     // <--- IMPORTANT: Re-enable events
        });
        image.setCoords();
        
        // Re-select the image so blue box comes back
        canvas.setActiveObject(image);
      }
      canvas.renderAll();
    };
  }, [canvas, image]);

  const handleCrop = () => {
    const cropRect = cropRectRef.current;
    if (!cropRect || !image) return;

    // 1. Calculate relative coordinates
    const cropLeft = cropRect.left;
    const cropTop = cropRect.top;
    const cropWidth = cropRect.width * cropRect.scaleX;
    const cropHeight = cropRect.height * cropRect.scaleY;

    const imgLeft = image.left - (image.width * image.scaleX) / 2;
    const imgTop = image.top - (image.height * image.scaleY) / 2;

    const relativeLeft = (cropLeft - imgLeft) / image.scaleX;
    const relativeTop = (cropTop - imgTop) / image.scaleY;
    const relativeWidth = cropWidth / image.scaleX;
    const relativeHeight = cropHeight / image.scaleY;

    // 2. Crop logic
    const sourceImage = new Image();
    sourceImage.crossOrigin = 'anonymous';
    sourceImage.src = image.getSrc();

    sourceImage.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = relativeWidth;
      tempCanvas.height = relativeHeight;
      const ctx = tempCanvas.getContext('2d');

      ctx.drawImage(
        sourceImage,
        relativeLeft, relativeTop, relativeWidth, relativeHeight,
        0, 0, relativeWidth, relativeHeight
      );

      fabric.Image.fromURL(tempCanvas.toDataURL(), (newImg) => {
        const og = originalStateRef.current;
        
        newImg.set({
          left: cropRect.left + (cropRect.width * cropRect.scaleX) / 2,
          top: cropRect.top + (cropRect.height * cropRect.scaleY) / 2,
          originX: 'center',
          originY: 'center',
          scaleX: image.scaleX,
          scaleY: image.scaleY,
          angle: og.angle,
          flipX: og.flipX,
          flipY: og.flipY,
        });

        // The useEffect cleanup will handle removing the old UI
        // We just need to remove the old image and add the new one
        
        // Prevent useEffect from restoring old image properties
        originalStateRef.current = null; 
        
        canvas.remove(image);
        canvas.add(newImg);
        canvas.setActiveObject(newImg);
        onComplete(newImg);
      });
    };
  };

  const handleCancel = () => {
    // The useEffect return function handles the restoration
    onCancel();
  };

  return (
    <div className="crop-tool-overlay">
      <p className="crop-tool-message">Adjust crop area</p>
      <div className="crop-tool-buttons">
        <button onClick={handleCrop} className="crop-confirm-btn">
          <Check size={18} /> Confirm
        </button>
        <button onClick={handleCancel} className="crop-cancel-btn">
          <X size={18} /> Cancel
        </button>
      </div>
    </div>
  );
}

export default CropTool;