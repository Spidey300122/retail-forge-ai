import { useState, useEffect } from 'react';
import { 
  RotateCw, FlipHorizontal, FlipVertical, Scissors, Loader, 
  Maximize2, Crop, Move, ArrowLeftRight
} from 'lucide-react';
import { fabric } from 'fabric';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';
import CropTool from './CropTool';
import './ImageControls.css';

function ImageControls() {
  const { canvas, saveState } = useCanvasStore();
  const [selectedObject, setSelectedObject] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [customRotation, setCustomRotation] = useState('');

  // Helper function to update dimensions
  const updateDimensions = (obj) => {
    if (!obj) return;
    setDimensions({
      width: Math.round(obj.width * obj.scaleX),
      height: Math.round(obj.height * obj.scaleY),
    });
  };

  // Update selected object when selection changes
  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      if (active && active.type === 'image') {
        setSelectedObject(active);
        updateDimensions(active);
      } else {
        setSelectedObject(null);
        setDimensions({ width: 0, height: 0 });
      }
    };

    const handleDeselection = () => {
      setSelectedObject(null);
      setDimensions({ width: 0, height: 0 });
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleDeselection);

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleDeselection);
    };
  }, [canvas]);

  // Track dimension changes during scaling
  useEffect(() => {
    if (!canvas || !selectedObject) return;

    const handleScaling = () => {
      updateDimensions(selectedObject);
    };

    const handleModified = () => {
      updateDimensions(selectedObject);
      saveState();
    };

    canvas.on('object:scaling', handleScaling);
    canvas.on('object:modified', handleModified);
    canvas.on('object:rotating', handleModified);

    return () => {
      canvas.off('object:scaling', handleScaling);
      canvas.off('object:modified', handleModified);
      canvas.off('object:rotating', handleModified);
    };
  }, [canvas, selectedObject, saveState]);

  // ROTATION FUNCTIONS
  const handleRotate = (degrees) => {
    if (!selectedObject || !canvas) return;
    
    const currentAngle = selectedObject.angle || 0;
    selectedObject.rotate(currentAngle + degrees);
    canvas.renderAll();
    saveState();
    toast.success(`Rotated ${degrees > 0 ? '+' : ''}${degrees}°`);
  };

  const handleCustomRotation = () => {
    if (!selectedObject || !canvas) return;
    
    const angle = parseFloat(customRotation);
    if (isNaN(angle)) {
      toast.error('Please enter a valid number');
      return;
    }

    const currentAngle = selectedObject.angle || 0;
    selectedObject.rotate(currentAngle + angle);
    canvas.renderAll();
    saveState();
    setCustomRotation('');
    toast.success(`Rotated ${angle}°`);
  };

  // FLIP FUNCTIONS
  const handleFlipHorizontal = () => {
    if (!selectedObject || !canvas) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    canvas.renderAll();
    saveState();
    toast.success('Flipped horizontally');
  };

  const handleFlipVertical = () => {
    if (!selectedObject || !canvas) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    canvas.renderAll();
    saveState();
    toast.success('Flipped vertically');
  };

  // SCALE FUNCTIONS
  const handleScalePercent = (factor) => {
    if (!selectedObject || !canvas) return;
    
    const currentScaleX = selectedObject.scaleX || 1;
    const currentScaleY = selectedObject.scaleY || 1;
    
    selectedObject.set({
      scaleX: currentScaleX * factor,
      scaleY: currentScaleY * factor,
    });
    
    updateDimensions(selectedObject);
    selectedObject.setCoords();
    canvas.renderAll();
    saveState();
    
    const percentage = Math.round(factor * 100);
    toast.success(`Scaled to ${percentage}%`);
  };

  // RESIZE FUNCTIONS
  const handleDimensionChange = (dimension, value) => {
    if (!selectedObject || !canvas) return;
    
    const newValue = parseInt(value) || 0;
    if (newValue <= 0) return;
    
    const originalWidth = selectedObject.width;
    const originalHeight = selectedObject.height;
    const aspectRatio = originalWidth / originalHeight;
    
    if (lockAspectRatio) {
      if (dimension === 'width') {
        const newScaleX = newValue / originalWidth;
        selectedObject.set({
          scaleX: newScaleX,
          scaleY: newScaleX,
        });
        setDimensions({
          width: newValue,
          height: Math.round(newValue / aspectRatio),
        });
      } else {
        const newScaleY = newValue / originalHeight;
        selectedObject.set({
          scaleX: newScaleY,
          scaleY: newScaleY,
        });
        setDimensions({
          width: Math.round(newValue * aspectRatio),
          height: newValue,
        });
      }
    } else {
      if (dimension === 'width') {
        const newScaleX = newValue / originalWidth;
        selectedObject.set({ scaleX: newScaleX });
        setDimensions({ ...dimensions, width: newValue });
      } else {
        const newScaleY = newValue / originalHeight;
        selectedObject.set({ scaleY: newScaleY });
        setDimensions({ ...dimensions, height: newValue });
      }
    }
    
    selectedObject.setCoords();
    canvas.renderAll();
  };

  const handleDimensionBlur = () => {
    saveState();
  };

  // ALIGNMENT FUNCTIONS
  const handleAlign = (type) => {
    if (!selectedObject || !canvas) return;
    
    const obj = selectedObject;
    const objWidth = obj.width * obj.scaleX;
    const objHeight = obj.height * obj.scaleY;
    
    switch (type) {
      case 'left':
        obj.set({ left: objWidth / 2 });
        break;
      case 'center-h':
        obj.set({ left: canvas.width / 2 });
        break;
      case 'right':
        obj.set({ left: canvas.width - objWidth / 2 });
        break;
      case 'top':
        obj.set({ top: objHeight / 2 });
        break;
      case 'center-v':
        obj.set({ top: canvas.height / 2 });
        break;
      case 'bottom':
        obj.set({ top: canvas.height - objHeight / 2 });
        break;
    }
    
    obj.setCoords();
    canvas.renderAll();
    saveState();
    toast.success('Aligned');
  };

  // CROP FUNCTIONS
  const handleStartCrop = () => {
    if (!selectedObject) return;
    console.log('🔪 Starting crop mode');
    setIsCropping(true);
  };

  const handleCropComplete = (croppedImage) => {
    console.log('✅ Crop completed');
    setIsCropping(false);
    setSelectedObject(croppedImage);
    updateDimensions(croppedImage);
    saveState();
    toast.success('Image cropped');
  };

  const handleCropCancel = () => {
    console.log('❌ Crop cancelled');
    setIsCropping(false);
  };

  // BACKGROUND REMOVAL
  const handleRemoveBackground = async () => {
    if (!selectedObject || !selectedObject.getSrc) return;

    setIsProcessing(true);
    const loadingToast = toast.loading('Removing background...', {
      duration: Infinity,
    });

    try {
      setTimeout(() => {
        toast.loading('📸 Analyzing image...', { id: loadingToast });
      }, 2000);
      
      setTimeout(() => {
        toast.loading('🎨 Removing background (30 seconds)...', { id: loadingToast });
      }, 5000);
      
      setTimeout(() => {
        toast.loading('⏳ Almost done...', { id: loadingToast });
      }, 15000);

      const imageSrc = selectedObject.getSrc();
      const response = await fetch(imageSrc);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      
      const sizeMB = blob.size / (1024 * 1024);
      if (sizeMB > 10) {
        throw new Error(`Image too large (${sizeMB.toFixed(1)}MB, max 10MB)`);
      }
      
      console.log(`📏 Image size: ${sizeMB.toFixed(2)}MB`);
      
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('method', 'simple');

      const result = await fetch('http://localhost:8000/process/remove-background', {
        method: 'POST',
        body: formData,
      });

      const data = await result.json();

      if (data.success) {
        const downloadUrl = `http://localhost:8000${data.download_url}`;
        
        fabric.Image.fromURL(downloadUrl, (newImg) => {
          newImg.set({
            left: selectedObject.left,
            top: selectedObject.top,
            scaleX: selectedObject.scaleX,
            scaleY: selectedObject.scaleY,
            angle: selectedObject.angle,
            flipX: selectedObject.flipX,
            flipY: selectedObject.flipY,
          });

          canvas.remove(selectedObject);
          canvas.add(newImg);
          canvas.setActiveObject(newImg);
          canvas.renderAll();

          setSelectedObject(newImg);
          updateDimensions(newImg);
          saveState();
          
          toast.success('✨ Background removed!', { id: loadingToast });
        }, { crossOrigin: 'anonymous' });
      } else {
        throw new Error(data.error || 'Failed to remove background');
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      
      let errorMessage = 'Failed to remove background';
      if (error.message.includes('timeout')) {
        errorMessage = '⏱️ Processing timed out. Try a smaller image.';
      } else if (error.message.includes('too large')) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  // RESET FUNCTION
  const handleReset = () => {
    if (!selectedObject || !canvas) return;
    
    if (confirm('Reset all transformations?')) {
      selectedObject.set({
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        flipX: false,
        flipY: false,
      });
      
      updateDimensions(selectedObject);
      selectedObject.setCoords();
      canvas.renderAll();
      saveState();
      toast.success('Reset to original');
    }
  };

  if (!selectedObject) {
    return (
      <div className="no-selection">
        <Move size={48} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium mb-1">No Image Selected</p>
        <p className="text-xs">Select an image on the canvas to edit</p>
      </div>
    );
  }

  return (
    <div className="image-controls">
      <h4 className="image-controls-heading">Image Tools</h4>

      {/* DIMENSIONS */}
      <div className="control-section">
        <label className="control-section-label">
          <ArrowLeftRight size={14} className="inline mr-1" />
          Dimensions (px)
        </label>
        <div className="dimensions-lock">
          <input
            type="checkbox"
            checked={lockAspectRatio}
            onChange={(e) => setLockAspectRatio(e.target.checked)}
            id="lock-aspect"
          />
          <label htmlFor="lock-aspect" className="cursor-pointer">
            Lock aspect ratio
          </label>
        </div>
        <div className="dimensions-inputs">
          <div className="dimension-input-group">
            <label className="dimension-input-label">Width</label>
            <input
              type="number"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              onBlur={handleDimensionBlur}
              className="dimension-input"
              min="1"
            />
          </div>
          <div className="dimension-separator">×</div>
          <div className="dimension-input-group">
            <label className="dimension-input-label">Height</label>
            <input
              type="number"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              onBlur={handleDimensionBlur}
              className="dimension-input"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* QUICK SCALE */}
      <div className="control-section">
        <label className="control-section-label">Quick Scale</label>
        <div className="button-group">
          <button onClick={() => handleScalePercent(0.5)} className="control-btn">
            50%
          </button>
          <button onClick={() => handleScalePercent(0.75)} className="control-btn">
            75%
          </button>
          <button onClick={() => handleScalePercent(1.5)} className="control-btn">
            150%
          </button>
          <button onClick={() => handleScalePercent(2)} className="control-btn">
            200%
          </button>
        </div>
      </div>

      {/* ROTATE */}
      <div className="control-section">
        <label className="control-section-label">
          <RotateCw size={14} className="inline mr-1" />
          Rotate
        </label>
        <div className="button-group">
          <button onClick={() => handleRotate(-90)} className="control-btn" title="Rotate -90°">
            <RotateCw size={16} style={{ transform: 'scaleX(-1)' }} />
            -90°
          </button>
          <button onClick={() => handleRotate(90)} className="control-btn" title="Rotate 90°">
            <RotateCw size={16} />
            90°
          </button>
        </div>
        <button onClick={() => handleRotate(180)} className="control-btn control-btn-full">
          Rotate 180°
        </button>
        
        {/* Custom rotation */}
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={customRotation}
            onChange={(e) => setCustomRotation(e.target.value)}
            placeholder="Custom angle"
            className="dimension-input flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomRotation()}
          />
          <button 
            onClick={handleCustomRotation}
            className="control-btn"
            disabled={!customRotation}
          >
            Apply
          </button>
        </div>
      </div>

      {/* FLIP */}
      <div className="control-section">
        <label className="control-section-label">Flip</label>
        <div className="button-group">
          <button onClick={handleFlipHorizontal} className="control-btn">
            <FlipHorizontal size={16} />
            Horizontal
          </button>
          <button onClick={handleFlipVertical} className="control-btn">
            <FlipVertical size={16} />
            Vertical
          </button>
        </div>
      </div>

      {/* ALIGN */}
      <div className="control-section">
        <label className="control-section-label">
          <Move size={14} className="inline mr-1" />
          Align
        </label>
        <div className="align-grid">
          <button onClick={() => handleAlign('left')} className="align-btn">←</button>
          <button onClick={() => handleAlign('center-h')} className="align-btn">↔</button>
          <button onClick={() => handleAlign('right')} className="align-btn">→</button>
          <button onClick={() => handleAlign('top')} className="align-btn">↑</button>
          <button onClick={() => handleAlign('center-v')} className="align-btn">↕</button>
          <button onClick={() => handleAlign('bottom')} className="align-btn">↓</button>
        </div>
      </div>

      {/* CROP */}
      <div className="control-section">
        <label className="control-section-label">
          <Crop size={14} className="inline mr-1" />
          Crop
        </label>
        <button 
          onClick={handleStartCrop} 
          className="control-btn control-btn-full" 
          disabled={isCropping}
        >
          <Crop size={16} />
          {isCropping ? 'Cropping...' : 'Crop Image'}
        </button>
      </div>

      {/* BACKGROUND REMOVAL */}
      <div className="control-section">
        <label className="control-section-label">
          <Scissors size={14} className="inline mr-1" />
          Background
        </label>
        <button 
          onClick={handleRemoveBackground} 
          disabled={isProcessing} 
          className="bg-remove-btn"
        >
          {isProcessing ? (
            <>
              <Loader size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Scissors size={16} />
              Remove Background
            </>
          )}
        </button>
        <p className="bg-remove-note">
          AI-powered background removal (10-30 seconds)
        </p>
      </div>

      {/* RESET */}
      <button onClick={handleReset} className="reset-btn">
        <Maximize2 size={16} />
        Reset All Transformations
      </button>

      {/* CROP TOOL OVERLAY */}
      {isCropping && (
        <CropTool
          image={selectedObject}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default ImageControls;