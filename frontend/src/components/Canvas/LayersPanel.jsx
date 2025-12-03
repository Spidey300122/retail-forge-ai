// frontend/src/components/Canvas/LayersPanel.jsx
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import './LayersPanel.css';

function LayersPanel() {
  const { canvas, saveState } = useCanvasStore();
  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draggedLayer, setDraggedLayer] = useState(null);

  const getLayerName = (obj, index) => {
    if (obj.type === 'i-text' || obj.type === 'text') {
      return obj.text?.substring(0, 20) || `Text ${index + 1}`;
    }
    if (obj.type === 'image') {
      return `Image ${index + 1}`;
    }
    return `${obj.type} ${index + 1}`;
  };

  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      const objects = canvas.getObjects();
      const activeObject = canvas.getActiveObject();
      
      setLayers(objects.map((obj, index) => ({
        id: obj.id || `layer-${index}`,
        type: obj.type,
        name: getLayerName(obj, index),
        visible: obj.visible !== false,
        locked: obj.selectable === false,
        object: obj,
        index: index,
      })));
      
      if (activeObject) {
        const activeIndex = objects.indexOf(activeObject);
        setSelectedId(`layer-${activeIndex}`);
      } else {
        setSelectedId(null);
      }
    };

    updateLayers();

    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);
    canvas.on('selection:created', updateLayers);
    canvas.on('selection:updated', updateLayers);
    canvas.on('selection:cleared', updateLayers);

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
      canvas.off('selection:created', updateLayers);
      canvas.off('selection:updated', updateLayers);
      canvas.off('selection:cleared', updateLayers);
    };
  }, [canvas]);

  const handleSelectLayer = (layer) => {
    if (!canvas) return;
    canvas.setActiveObject(layer.object);
    canvas.renderAll();
    setSelectedId(layer.id);
  };

  const handleToggleVisibility = (layer, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!canvas) return;
    
    const newVisible = !layer.visible;
    layer.object.set('visible', newVisible);
    canvas.renderAll();
    
    // Force immediate state update
    setLayers(prevLayers => 
      prevLayers.map(l => 
        l.id === layer.id ? { ...l, visible: newVisible } : l
      )
    );
  };

  const handleToggleLock = (layer, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!canvas) return;
    
    const newLocked = !layer.locked;
    layer.object.set('selectable', !newLocked);
    layer.object.set('evented', !newLocked);
    canvas.renderAll();
    
    // Force immediate state update
    setLayers(prevLayers => 
      prevLayers.map(l => 
        l.id === layer.id ? { ...l, locked: newLocked } : l
      )
    );
  };

  const handleDeleteLayer = (layer, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!canvas) return;
    canvas.remove(layer.object);
    canvas.renderAll();
    saveState();
  };

  // Drag and drop handlers
  const handleDragStart = (e, layer) => {
    e.stopPropagation();
    setDraggedLayer(layer);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetLayer) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canvas || !draggedLayer || draggedLayer.id === targetLayer.id) {
      setDraggedLayer(null);
      return;
    }

    const objects = canvas.getObjects();
    const fromIndex = draggedLayer.index;
    const toIndex = targetLayer.index;

    // Reorder objects in canvas
    const movedObject = objects[fromIndex];
    canvas.remove(movedObject);
    canvas.insertAt(movedObject, toIndex);
    canvas.renderAll();
    saveState();

    setDraggedLayer(null);
  };

  const handleDragEnd = () => {
    setDraggedLayer(null);
  };

  return (
    <div className="layers-panel">
      {layers.length === 0 ? (
        <div className="layers-empty">
          <p className="layers-empty-text">
            No layers yet.<br />
            Add content to the canvas.
          </p>
        </div>
      ) : (
        // FIX: Reverse the layers array for rendering so the top visual layer is the top canvas object
        [...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            draggable
            onDragStart={(e) => handleDragStart(e, layer)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, layer)}
            onDragEnd={handleDragEnd}
            onClick={() => handleSelectLayer(layer)}
            className={`layer-card ${selectedId === layer.id ? 'selected' : ''} ${draggedLayer?.id === layer.id ? 'dragging' : ''}`}
          >
            <div className="layer-content">
              {/* Drag handle */}
              <div className="layer-drag-handle">
                <GripVertical size={16} />
              </div>

              <div className="layer-info">
                <p className="layer-name">{layer.name}</p>
                <p className="layer-type">{layer.type}</p>
              </div>

              <div className="layer-controls">
                <button
                  onClick={(e) => handleToggleVisibility(layer, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="layer-btn"
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                <button
                  onClick={(e) => handleToggleLock(layer, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="layer-btn"
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>

                <button
                  onClick={(e) => handleDeleteLayer(layer, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="layer-btn layer-btn-delete"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default LayersPanel;