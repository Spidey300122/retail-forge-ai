import { useState, useEffect } from 'react';
import { 
  RotateCw, FlipHorizontal, FlipVertical, Scissors, Loader, Maximize2, Crop
} from 'lucide-react';
import { fabric } from 'fabric';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';
import api from '../../services/api';
import CropTool from './CropTool';
import './ImageControls.css';

function ImageControls() {
  const { canvas, saveState } = useCanvasStore();
  const [selectedObject, setSelectedObject] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      if (active && active.type === 'image') {
        setSelectedObject(active);
        setDimensions({
          width: Math.round(active.width * active.scaleX),
          height: Math.round(active.height * active.scaleY),
        });
      } else {
        setSelectedObject(null);
      }
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => setSelectedObject(null));

    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared');
    };
  }, [canvas]);

  // Update dimensions when object is scaled manually
  useEffect(() => {
    if (!canvas || !selectedObject) return;

    const updateDimensions = () => {
      if (selectedObject) {
        setDimensions({
          width: Math.round(selectedObject.width * selectedObject.scaleX),
          height: Math.round(selectedObject.height * selectedObject.scaleY),
        });
      }
    };

    canvas.on('object:scaling', updateDimensions);
    canvas.on('object:modified', updateDimensions);

    return () => {
      canvas.off('object:scaling', updateDimensions);
      canvas.off('object:modified', updateDimensions);
    };
  }, [canvas, selectedObject]);

  // Rotate functions
  const handleRotate = (degrees) => {
    if (!selectedObject) return;
    
    const currentAngle = selectedObject.angle || 0;
    selectedObject.rotate(currentAngle + degrees);
    canvas.renderAll();
    saveState();
  };

  // Flip functions
  const handleFlipHorizontal = () => {
    if (!selectedObject) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    canvas.renderAll();
    saveState();
  };

  const handleFlipVertical = () => {
    if (!selectedObject) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    canvas.renderAll();
    saveState();
  };

  // Scale functions
  const handleScale = (factor) => {
    if (!selectedObject) return;
    
    const currentScaleX = selectedObject.scaleX || 1;
    const currentScaleY = selectedObject.scaleY || 1;
    
    selectedObject.set({
      scaleX: currentScaleX * factor,
      scaleY: currentScaleY * factor,
    });
    
    setDimensions({
      width: Math.round(selectedObject.width * selectedObject.scaleX),
      height: Math.round(selectedObject.height * selectedObject.scaleY),
    });
    
    canvas.renderAll();
    saveState();
  };

  // Dimension change handler
  const handleDimensionChange = (dimension, value) => {
    if (!selectedObject) return;
    
    const newValue = parseInt(value) || 0;
    
    if (lockAspectRatio) {
      const aspectRatio = selectedObject.width / selectedObject.height;
      
      if (dimension === 'width') {
        const newScaleX = newValue / selectedObject.width;
        const newScaleY = newScaleX;
        selectedObject.set({ scaleX: newScaleX, scaleY: newScaleY });
        setDimensions({
          width: newValue,
          height: Math.round(newValue / aspectRatio),
        });
      } else {
        const newScaleY = newValue / selectedObject.height;
        const newScaleX = newScaleY;
        selectedObject.set({ scaleX: newScaleX, scaleY: newScaleY });
        setDimensions({
          width: Math.round(newValue * aspectRatio),
          height: newValue,
        });
      }
    } else {
      if (dimension === 'width') {
        const newScaleX = newValue / selectedObject.width;
        selectedObject.set({ scaleX: newScaleX });
        setDimensions({ ...dimensions, width: newValue });
      } else {
        const newScaleY = newValue / selectedObject.height;
        selectedObject.set({ scaleY: newScaleY });
        setDimensions({ ...dimensions, height: newValue });
      }
    }
    
    canvas.renderAll();
    saveState();
  };

  // Alignment functions
  const handleAlign = (type) => {
    if (!selectedObject || !canvas) return;
    
    const obj = selectedObject;
    
    switch (type) {
      case 'left':
        obj.set({ left: obj.width * obj.scaleX / 2 });
        break;
      case 'center-h':
        obj.set({ left: canvas.width / 2 });
        break;
      case 'right':
        obj.set({ left: canvas.width - obj.width * obj.scaleX / 2 });
        break;
      case 'top':
        obj.set({ top: obj.height * obj.scaleY / 2 });
        break;
      case 'center-v':
        obj.set({ top: canvas.height / 2 });
        break;
      case 'bottom':
        obj.set({ top: canvas.height - obj.height * obj.scaleY / 2 });
        break;
    }
    
    obj.setCoords();
    canvas.renderAll();
    saveState();
  };

  // Reset transformations
  const handleReset = () => {
    if (!selectedObject) return;
    
    selectedObject.set({
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      flipX: false,
      flipY: false,
    });
    
    setDimensions({
      width: selectedObject.width,
      height: selectedObject.height,
    });
    
    canvas.renderAll();
    saveState();
  };

  // Crop handlers
  const handleStartCrop = () => {
    console.log('🔪 Starting crop mode');
    setIsCropping(true);
  };

  const handleCropComplete = (croppedImage) => {
    console.log('✅ Crop completed');
    setIsCropping(false);
    setSelectedObject(croppedImage);
    saveState();
  };

  const handleCropCancel = () => {
    console.log('❌ Crop cancelled');
    setIsCropping(false);
  };

  // Remove background
  const handleRemoveBackground = async () => {
    if (!selectedObject || !selectedObject.getSrc) return;

    setIsProcessing(true);
    const loadingToast = toast.loading('Removing background...', {
      duration: Infinity,
    });

    try {
      // Show progress updates
      setTimeout(() => {
        toast.loading('Analyzing image...', { id: loadingToast });
      }, 2000);
      
      setTimeout(() => {
        toast.loading('Processing (this may take 30 seconds)...', { id: loadingToast });
      }, 5000);

      // Get image source
      const imageSrc = selectedObject.getSrc();
      
      // Fetch image as blob
      const response = await fetch(imageSrc);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      
      // Validate file size
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('Image too large (max 10MB)');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('method', 'simple'); // Using GrabCut for faster processing

      // Send to backend
      const result = await api.post('/image/remove-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000, // 3 minutes
      });

      if (result.success) {
        // Load new image
        const downloadUrl = result.data.downloadUrl;
        
        fabric.Image.fromURL(downloadUrl, (newImg) => {
          // Copy all properties from old image
          newImg.set({
            left: selectedObject.left,
            top: selectedObject.top,
            scaleX: selectedObject.scaleX,
            scaleY: selectedObject.scaleY,
            angle: selectedObject.angle,
            flipX: selectedObject.flipX,
            flipY: selectedObject.flipY,
          });

          // Replace old image
          canvas.remove(selectedObject);
          canvas.add(newImg);
          canvas.setActiveObject(newImg);
          canvas.renderAll();

          setSelectedObject(newImg);
          saveState();
          
          toast.success('Background removed successfully!', { id: loadingToast });
        }, { crossOrigin: 'anonymous' });
      } else {
        throw new Error(result.error?.message || 'Failed to remove background');
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      
      let errorMessage = 'Failed to remove background';
      if (error.message.includes('timeout')) {
        errorMessage = 'Processing timed out. Try a smaller image.';
      } else if (error.message.includes('too large')) {
        errorMessage = 'Image too large (max 10MB)';
      }
      
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedObject) {
    return (
      <div className="no-selection">
        Select an image to edit
      </div>
    );
  }

  return (
    <div className="image-controls">
      <h4 className="image-controls-heading">Image Tools</h4>

      {/* Dimensions */}
      <div className="control-section">
        <label className="control-section-label">Dimensions</label>
        <div className="dimensions-lock">
          <input
            type="checkbox"
            checked={lockAspectRatio}
            onChange={(e) => setLockAspectRatio(e.target.checked)}
          />
          <span>Lock aspect ratio</span>
        </div>
        <div className="dimensions-inputs">
          <div className="dimension-input-group">
            <label className="dimension-input-label">Width</label>
            <input
              type="number"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className="dimension-input"
            />
          </div>
          <div className="dimension-separator">×</div>
          <div className="dimension-input-group">
            <label className="dimension-input-label">Height</label>
            <input
              type="number"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              className="dimension-input"
            />
          </div>
        </div>
      </div>

      {/* Rotate */}
      <div className="control-section">
        <label className="control-section-label">Rotate</label>
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
      </div>

      {/* Flip */}
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

      {/* Scale */}
      <div className="control-section">
        <label className="control-section-label">Scale</label>
        <div className="button-group">
          <button onClick={() => handleScale(0.9)} className="control-btn">
            90%
          </button>
          <button onClick={() => handleScale(1.1)} className="control-btn">
            110%
          </button>
        </div>
        <button onClick={() => handleScale(0.5)} className="control-btn control-btn-full">
          50%
        </button>
      </div>

      {/* Align */}
      <div className="control-section">
        <label className="control-section-label">Align</label>
        <div className="align-grid">
          <button onClick={() => handleAlign('left')} className="align-btn">Left</button>
          <button onClick={() => handleAlign('center-h')} className="align-btn">Center</button>
          <button onClick={() => handleAlign('right')} className="align-btn">Right</button>
        </div>
        <div className="align-grid">
          <button onClick={() => handleAlign('top')} className="align-btn">Top</button>
          <button onClick={() => handleAlign('center-v')} className="align-btn">Middle</button>
          <button onClick={() => handleAlign('bottom')} className="align-btn">Bottom</button>
        </div>
      </div>

      {/* Crop */}
      <div className="control-section">
        <label className="control-section-label">Crop</label>
        <button onClick={handleStartCrop} className="control-btn control-btn-full" disabled={isCropping}>
          <Crop size={16} />
          Crop Image
        </button>
      </div>

      {/* Background Removal */}
      <div className="control-section">
        <label className="control-section-label">Background</label>
        <button onClick={handleRemoveBackground} disabled={isProcessing} className="bg-remove-btn">
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
          Uses AI to remove background (may take 10-30 seconds)
        </p>
      </div>

      {/* Reset */}
      <button onClick={handleReset} className="reset-btn">
        <Maximize2 size={16} />
        Reset All
      </button>

      {/* Crop Tool Overlay */}
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