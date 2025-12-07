// frontend/src/components/Canvas/LayersPanel.jsx
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import './LayersPanel.css';

function LayersPanel() {
  const { canvas, saveState } = useCanvasStore();
  const [layers, setLayers] = useState([]);
  const [selectedRef, setSelectedRef] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      if (!canvas) return;
      // Get all objects and reverse them so the top-most object is first in the list
      const objects = canvas.getObjects().filter(obj => !obj.excludeFromLayers);
      setLayers([...objects].reverse());
      
      // Update selection reference
      const active = canvas.getActiveObject();
      setSelectedRef(active);
    };

    // Initial load
    updateLayers();

    // Fabric.js event listeners
    const events = [
      'object:added',
      'object:removed',
      'object:modified',
      'selection:created',
      'selection:updated',
      'selection:cleared'
    ];

    events.forEach(event => {
      canvas.on(event, updateLayers);
    });

    return () => {
      events.forEach(event => {
        canvas.off(event, updateLayers);
      });
    };
  }, [canvas]);

  const getLayerName = (obj) => {
    if (!obj) return 'Object';
    if (obj.type === 'image') return 'Image';
    if (obj.type === 'i-text' || obj.type === 'text') {
      return obj.text ? `"${obj.text.substring(0, 15)}${obj.text.length > 15 ? '...' : ''}"` : 'Text';
    }
    if (obj.type === 'rect') return 'Rectangle';
    if (obj.type === 'circle') return 'Circle';
    if (obj.type === 'path') return 'Path';
    if (obj.type === 'group') return 'Group';
    return obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
  };

  const handleSelectLayer = (obj) => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  };

  const toggleVisibility = (e, obj) => {
    e.stopPropagation();
    if (!canvas) return;
    
    obj.set('visible', !obj.visible);
    
    // If hiding the currently selected object, deselect it
    if (!obj.visible && canvas.getActiveObject() === obj) {
      canvas.discardActiveObject();
    }
    
    canvas.requestRenderAll();
    saveState();
  };

  const toggleLock = (e, obj) => {
    e.stopPropagation();
    if (!canvas) return;

    // Toggle lock state
    const shouldLock = !obj.lockMovementX;
    
    obj.set({
      lockMovementX: shouldLock,
      lockMovementY: shouldLock,
      lockRotation: shouldLock,
      lockScalingX: shouldLock,
      lockScalingY: shouldLock,
    });

    canvas.requestRenderAll();
    saveState();
  };

  const handleDelete = (e, obj) => {
    e.stopPropagation();
    if (!canvas) return;
    
    if (confirm('Delete this layer?')) {
      canvas.remove(obj);
      canvas.requestRenderAll();
      saveState();
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (!canvas) return;

    // Get all objects in their current order
    const allObjects = canvas.getObjects();
    
    // layers array is reversed, so we need to convert indices
    const fromCanvasIndex = allObjects.length - 1 - draggedIndex;
    const toCanvasIndex = allObjects.length - 1 - dropIndex;
    
    const draggedObject = allObjects[fromCanvasIndex];
    
    // Remove from old position
    allObjects.splice(fromCanvasIndex, 1);
    
    // Insert at new position
    allObjects.splice(toCanvasIndex, 0, draggedObject);
    
    // Clear canvas
    canvas.remove(...canvas.getObjects());
    
    // Re-add in new order
    allObjects.forEach(obj => canvas.add(obj));
    
    canvas.renderAll();
    saveState();
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (!layers.length) {
    return (
      <div className="layers-empty">
        <p className="layers-empty-text">No layers yet</p>
      </div>
    );
  }

  return (
    <div className="layers-panel">
      {layers.map((obj, index) => {
        const isSelected = selectedRef === obj;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div 
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`layer-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
            onClick={() => handleSelectLayer(obj)}
            style={{
              opacity: isDragging ? 0.5 : 1,
              borderTop: isDragOver && draggedIndex < index ? '3px solid #2563eb' : undefined,
              borderBottom: isDragOver && draggedIndex > index ? '3px solid #2563eb' : undefined,
            }}
          >
            <div className="layer-content">
              <div className="layer-drag-handle">
                <GripVertical size={14} />
              </div>
              <div className="layer-info">
                <p className="layer-name">{getLayerName(obj)}</p>
                <p className="layer-type">{obj.type}</p>
              </div>
            </div>
            
            <div className="layer-controls">
              <button 
                className="layer-btn" 
                onClick={(e) => toggleVisibility(e, obj)}
                title={obj.visible ? "Hide" : "Show"}
              >
                {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              
              <button 
                className="layer-btn" 
                onClick={(e) => toggleLock(e, obj)}
                title={obj.lockMovementX ? "Unlock" : "Lock"}
              >
                {obj.lockMovementX ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              
              <button 
                className="layer-btn layer-btn-delete" 
                onClick={(e) => handleDelete(e, obj)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LayersPanel;