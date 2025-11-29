import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';

function LayersPanel() {
  const { canvas } = useCanvasStore();
  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // MOVE getLayerName BEFORE useEffect
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
      })));
      
      // Update selected layer
      if (activeObject) {
        const activeIndex = objects.indexOf(activeObject);
        setSelectedId(`layer-${activeIndex}`);
      } else {
        setSelectedId(null);
      }
    };

    // Initial update
    updateLayers();

    // Listen to all canvas events
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
    layer.object.set('visible', !layer.visible);
    canvas.renderAll();
    setLayers([...layers]);
  };

  const handleToggleLock = (layer, e) => {
    e.stopPropagation();
    const newLocked = !layer.locked;
    layer.object.set('selectable', !newLocked);
    layer.object.set('evented', !newLocked);
    canvas.renderAll();
    setLayers([...layers]);
  };

  const handleDeleteLayer = (layer, e) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.remove(layer.object);
    canvas.renderAll();
  };

  return (
    <div className="space-y-2">
      {layers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No layers yet. Add some content to the canvas.
        </p>
      ) : (
        layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => handleSelectLayer(layer)}
            className={`
              p-3 rounded border cursor-pointer transition-colors
              ${selectedId === layer.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {/* Layer name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {layer.name}
                </p>
                <p className="text-xs text-gray-500">{layer.type}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleToggleVisibility(layer, e)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                <button
                  onClick={(e) => handleToggleLock(layer, e)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>

                <button
                  onClick={(e) => handleDeleteLayer(layer, e)}
                  className="p-1 hover:bg-red-100 text-red-600 rounded"
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