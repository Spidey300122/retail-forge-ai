import { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { fabric } from 'fabric';
import useCanvasStore from '../../store/canvasStore';
import './CropTool.css';

function CropTool({ image, onComplete, onCancel }) {
  const { canvas } = useCanvasStore();
  const cropRectRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!canvas || !image) return;

    console.log('🔪 Starting crop tool');

    // Create crop rectangle
    const rect = new fabric.Rect({
      left: image.left - (image.width * image.scaleX) / 4,
      top: image.top - (image.height * image.scaleY) / 4,
      width: (image.width * image.scaleX) / 2,
      height: (image.height * image.scaleY) / 2,
      fill: 'transparent',
      stroke: '#2563eb',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      cornerColor: '#2563eb',
      cornerSize: 10,
      transparentCorners: false,
      lockRotation: true,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    cropRectRef.current = rect;

    // Create overlay to dim the rest
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
    canvas.sendToBack(overlayRect);
    overlayRef.current = overlayRect;

    console.log('✅ Crop tool initialized');

    return () => {
      if (cropRectRef.current) {
        canvas.remove(cropRectRef.current);
        console.log('🗑️ Removed crop rectangle');
      }
      if (overlayRef.current) {
        canvas.remove(overlayRef.current);
        console.log('🗑️ Removed overlay');
      }
      canvas.renderAll();
    };
  }, [canvas, image]);

  const handleCrop = () => {
    const cropRect = cropRectRef.current;
    if (!cropRect || !image) return;

    console.log('🔪 Starting crop operation');

    // Get crop dimensions
    const cropLeft = cropRect.left;
    const cropTop = cropRect.top;
    const cropWidth = cropRect.width * cropRect.scaleX;
    const cropHeight = cropRect.height * cropRect.scaleY;

    // Calculate relative position to image
    const imgLeft = image.left - (image.width * image.scaleX) / 2;
    const imgTop = image.top - (image.height * image.scaleY) / 2;

    const relativeLeft = (cropLeft - imgLeft) / image.scaleX;
    const relativeTop = (cropTop - imgTop) / image.scaleY;
    const relativeWidth = cropWidth / image.scaleX;
    const relativeHeight = cropHeight / image.scaleY;

    console.log('📐 Crop dimensions:', {
      relativeLeft,
      relativeTop,
      relativeWidth,
      relativeHeight,
    });

    // Create cropped image
    const croppedImage = new Image();
    croppedImage.crossOrigin = 'anonymous';
    croppedImage.src = image.getSrc();

    croppedImage.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = relativeWidth;
      tempCanvas.height = relativeHeight;
      const ctx = tempCanvas.getContext('2d');

      // Draw cropped portion
      ctx.drawImage(
        croppedImage,
        relativeLeft,
        relativeTop,
        relativeWidth,
        relativeHeight,
        0,
        0,
        relativeWidth,
        relativeHeight
      );

      // Create new fabric image from cropped data
      fabric.Image.fromURL(tempCanvas.toDataURL(), (newImg) => {
        newImg.set({
          left: cropLeft + cropWidth / 2,
          top: cropTop + cropHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: image.scaleX,
          scaleY: image.scaleY,
        });

        // Remove old image and overlay
        canvas.remove(image);
        if (overlayRef.current) canvas.remove(overlayRef.current);
        if (cropRectRef.current) canvas.remove(cropRectRef.current);

        // Add new cropped image
        canvas.add(newImg);
        canvas.setActiveObject(newImg);
        canvas.renderAll();

        console.log('✅ Crop complete');
        onComplete(newImg);
      });
    };

    croppedImage.onerror = (error) => {
      console.error('❌ Crop failed:', error);
      onCancel();
    };
  };

  const handleCancel = () => {
    console.log('❌ Crop cancelled');
    if (cropRectRef.current) canvas.remove(cropRectRef.current);
    if (overlayRef.current) canvas.remove(overlayRef.current);
    canvas.renderAll();
    onCancel();
  };

  return (
    <div className="crop-tool-overlay">
      <p className="crop-tool-message">
        Adjust the crop area, then click confirm
      </p>
      <div className="crop-tool-buttons">
        <button onClick={handleCrop} className="crop-confirm-btn">
          <Check size={18} />
          Confirm Crop
        </button>
        <button onClick={handleCancel} className="crop-cancel-btn">
          <X size={18} />
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CropTool;