import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical, Image as ImageIcon, Type, Square, Triangle, Circle } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import './LayersPanel.css';

function LayersPanel() {
  const { canvas, saveState } = useCanvasStore();
  const [layers, setLayers] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Sync layers with Fabric canvas
  const updateLayers = () => {
    if (!canvas) return;
    
    // Get objects and reverse them (so top layer is first in list)
    const objects = canvas.getObjects();
    const reversedObjects = objects.map((obj, index) => ({
      id: obj.id || `layer-${index}`, // Ensure ID exists
      type: obj.type,
      name: obj.name || obj.text || `${obj.type} ${index + 1}`,
      visible: obj.visible,
      locked: obj.lockMovementX && obj.lockMovementY,
      objectRef: obj, // Store reference to actual fabric object
      index: index // Store original z-index
    })).reverse();

    setLayers(reversedObjects);

    // Sync selection
    const activeObjects = canvas.getActiveObjects();
    setSelectedIds(activeObjects.map(obj => obj.id));
  };

  useEffect(() => {
    if (!canvas) return;

    // Initial load
    updateLayers();

    // Event listeners to keep UI in sync
    const events = [
      'object:added', 
      'object:removed', 
      'object:modified', 
      'selection:created', 
      'selection:updated', 
      'selection:cleared'
    ];

    events.forEach(e => canvas.on(e, updateLayers));

    return () => {
      events.forEach(e => canvas.off(e, updateLayers));
    };
  }, [canvas]);

  // --- Handlers ---

  const handleSelect = (layer) => {
    if (!canvas) return;
    
    canvas.discardActiveObject();
    
    // Handle locked objects differently if needed, but usually we allow selection in panel
    const obj = layer.objectRef;
    
    if (obj.visible) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  const toggleVisibility = (e, layer) => {
    e.stopPropagation();
    const obj = layer.objectRef;
    obj.set('visible', !obj.visible);
    
    // If hiding selected object, deselect it
    if (!obj.visible) {
      canvas.discardActiveObject();
    }
    
    canvas.renderAll();
    saveState();
    updateLayers();
  };

  const toggleLock = (e, layer) => {
    e.stopPropagation();
    const obj = layer.objectRef;
    const isLocked = !layer.locked;
    
    obj.set({
      lockMovementX: isLocked,
      lockMovementY: isLocked,
      lockRotation: isLocked,
      lockScalingX: isLocked,
      lockScalingY: isLocked,
      selectable: !isLocked, // Optional: make unselectable on canvas when locked
      evented: !isLocked     // Optional: ignore events when locked
    });

    canvas.discardActiveObject();
    canvas.renderAll();
    saveState();
    updateLayers();
  };

  const handleDelete = (e, layer) => {
    e.stopPropagation();
    if (confirm('Delete this layer?')) {
      canvas.remove(layer.objectRef);
      canvas.discardActiveObject();
      canvas.renderAll();
      saveState();
      // updateLayers triggered by event listener
    }
  };

  // --- Drag and Drop Logic ---

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move'; 
    // Use a transparent image or styling if desired
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // Necessary to allow dropping
    if (index === draggedIndex) return;
    // Optional: Add visual indicator logic here
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newLayers = [...layers];
    const [movedLayer] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(dropIndex, 0, movedLayer);

    // Update Fabric.js Z-Index
    // Note: 'layers' state is reversed (Top -> Bottom). 
    // Fabric stack is (Bottom -> Top).
    // We need to re-stack everything according to the new list order.
    
    // Iterate from bottom of list (which is bottom of stack)
    for (let i = newLayers.length - 1; i >= 0; i--) {
      const obj = newLayers[i].objectRef;
      // Move to top repeatedly to stack them in correct order
      obj.bringToFront(); 
    }

    setLayers(newLayers);
    setDraggedIndex(null);
    canvas.renderAll();
    saveState();
  };

  // Helper for icons
  const getLayerIcon = (type) => {
    switch (type) {
      case 'image': return <ImageIcon size={14} />;
      case 'i-text': 
      case 'text': return <Type size={14} />;
      case 'rect': return <Square size={14} />;
      case 'triangle': return <Triangle size={14} />;
      case 'circle': return <Circle size={14} />;
      default: return <Square size={14} />;
    }
  };

  if (layers.length === 0) {
    return (
      <div className="layers-empty">
        <div className="layers-empty-text">No layers yet</div>
      </div>
    );
  }

  return (
    <div className="layers-panel">
      {layers.map((layer, index) => (
        <div
          key={layer.id || index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => handleSelect(layer)}
          className={`layer-card ${selectedIds.includes(layer.id) ? 'selected' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
        >
          <div className="layer-content">
            <div className="layer-drag-handle">
              <GripVertical size={14} />
            </div>
            
            <div className="text-gray-500">
              {getLayerIcon(layer.type)}
            </div>

            <div className="layer-info">
              <p className="layer-name">{layer.name}</p>
              <p className="layer-type">{layer.type}</p>
            </div>

            <div className="layer-controls">
              <button 
                onClick={(e) => toggleVisibility(e, layer)} 
                className="layer-btn"
                title={layer.visible ? "Hide" : "Show"}
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              
              <button 
                onClick={(e) => toggleLock(e, layer)} 
                className="layer-btn"
                title={layer.locked ? "Unlock" : "Lock"}
              >
                {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              
              <button 
                onClick={(e) => handleDelete(e, layer)} 
                className="layer-btn layer-btn-delete"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LayersPanel;