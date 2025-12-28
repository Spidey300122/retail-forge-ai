import { useState, useEffect } from 'react';
import { Pipette, Check, Bold, Italic } from 'lucide-react';
import toast from 'react-hot-toast';
import useCanvasStore from '../../store/canvasStore';
import { buildApiUrl } from '../../utils/apiConfig';

function BackgroundColorPicker({ extractedColors = [] }) {
  // Don't destructure canvas from the hook - get it directly when needed
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [recentColors, setRecentColors] = useState([]);

  // Load recent colors ONCE on mount + listen for updates
  useEffect(() => {
    const loadRecentColors = async () => {
      try {
        const response = await fetch(buildApiUrl('/color/recent?userId=1&limit=8'));
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.data)) {
          setRecentColors(data.data);
        }
      } catch (error) {
        console.warn('Failed to load recent colors:', error);
      }
    };

    // Load on mount
    loadRecentColors();

    // Listen for color extraction events
    const handleColorsExtracted = () => {
      loadRecentColors();
    };

    window.addEventListener('colorsExtracted', handleColorsExtracted);

    return () => {
      window.removeEventListener('colorsExtracted', handleColorsExtracted);
    };
  }, []); // Only run once on mount

  const defaultColors = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Light Gray', hex: '#f3f4f6' },
    { name: 'Dark Gray', hex: '#374151' },
    { name: 'Black', hex: '#000000' },
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Yellow', hex: '#fbbf24' },
  ];

  const quickColors = Array.isArray(extractedColors) && extractedColors.length > 0
    ? extractedColors
    : defaultColors;

  const handleColorChange = (e) => {
    const newValue = e.target.value.toUpperCase();
    if (newValue.match(/^#?([0-9A-F]{0,6})$/i)) {
      setSelectedColor(newValue.startsWith('#') ? newValue : `#${newValue}`);
    }
  };

  const handleQuickColorSelect = (color) => {
    if (color && color.hex) {
      setSelectedColor(color.hex);
    }
  };

  const handleApplyColor = (colorToApply) => {
    const finalColor = colorToApply || selectedColor;
    const canvasInstance = useCanvasStore.getState().canvas;

    if (!canvasInstance) {
      toast.error("Canvas is not ready.");
      return;
    }

    if (!finalColor.match(/^#([0-9A-F]{6})$/i)) {
      toast.error("Invalid hex color code.");
      return;
    }
    
    canvasInstance.backgroundColor = finalColor;
    canvasInstance.renderAll();
    canvasInstance.fire('object:modified');
    
    toast.success(`Background changed to ${finalColor}`);
  };
  
  const handleApplyToText = () => {
    const canvasInstance = useCanvasStore.getState().canvas;

    if (!canvasInstance) {
      toast.error("Canvas is not ready.");
      return;
    }

    const activeObject = canvasInstance.getActiveObject();

    if (!activeObject) {
      toast.error('Please select a text element first');
      return;
    }

    if (activeObject.type !== 'i-text' && activeObject.type !== 'text') {
      toast.error('Please select a text element');
      return;
    }

    activeObject.set('fill', selectedColor);
    canvasInstance.renderAll();
    canvasInstance.fire('object:modified');
    toast.success(`Text color changed to ${selectedColor}`);
  };

  const handleToggleBold = () => {
    const canvasInstance = useCanvasStore.getState().canvas;
    const activeObject = canvasInstance?.getActiveObject();

    if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text')) {
      toast.error('Please select a text element first');
      return;
    }

    const currentWeight = activeObject.fontWeight;
    const newWeight = currentWeight === 'bold' ? 'normal' : 'bold';
    
    activeObject.set('fontWeight', newWeight);
    canvasInstance.renderAll();
    canvasInstance.fire('object:modified');
    toast.success(`Text ${newWeight === 'bold' ? 'bolded' : 'unbolded'}`);
  };

  const handleToggleItalic = () => {
    const canvasInstance = useCanvasStore.getState().canvas;
    const activeObject = canvasInstance?.getActiveObject();

    if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text')) {
      toast.error('Please select a text element first');
      return;
    }

    const currentStyle = activeObject.fontStyle;
    const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
    
    activeObject.set('fontStyle', newStyle);
    canvasInstance.renderAll();
    canvasInstance.fire('object:modified');
    toast.success(`Text ${newStyle === 'italic' ? 'italicized' : 'un-italicized'}`);
  };

  const renderColorSwatches = (colors) => {
    if (!colors || colors.length === 0) {
      return <div className="text-gray-400 text-xs italic">No colors available</div>;
    }

    return (
      <div className="grid grid-cols-5 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200" style={{ minHeight: '60px' }}>
        {colors.slice(0, 10).map((color, index) => {
          if (!color || !color.hex) return null;
          return (
            <div
              key={index}
              className={`rounded-full cursor-pointer relative shadow-sm border border-gray-200 transition-transform hover:scale-110 ${selectedColor === color.hex ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
              style={{ backgroundColor: color.hex, width: '32px', height: '32px' }}
              onClick={() => handleQuickColorSelect(color)}
              title={color.name || color.hex}
            >
              {selectedColor === color.hex && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-0.5 shadow-sm">
                    <Check size={12} className="text-blue-600" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white flex flex-col space-y-6 h-full overflow-y-auto">
      
      <div>
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
          <Pipette size={14} className="mr-2 text-blue-500" />
          Color Selector
        </label>

        <div className="flex space-x-2">
          <div
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 shadow-sm flex-shrink-0"
            style={{ backgroundColor: selectedColor }}
            onClick={() => {
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = selectedColor;
              colorInput.onchange = (e) => setSelectedColor(e.target.value);
              colorInput.click();
            }}
            title="Click to pick color"
          />
          
          <input
            type="text"
            value={selectedColor}
            onChange={handleColorChange}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="#FFFFFF"
            maxLength={7}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Quick Colors
        </label>
        {renderColorSwatches(quickColors)}
      </div>

      {recentColors.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recently Used
          </label>
          {renderColorSwatches(recentColors)}
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={() => handleApplyColor()}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Apply Background Color
        </button>
        
        <button
          onClick={handleApplyToText}
          className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
        >
          Apply to Selected Text
        </button>
      </div>

      {/* NEW: Text Formatting Section */}
      <div className="pt-4 border-t border-gray-200">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
          Text Formatting
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleToggleBold}
            className="py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 flex items-center justify-center gap-2"
            title="Toggle Bold (Ctrl+B)"
          >
            <Bold size={16} />
            <span className="font-bold">Bold</span>
          </button>
          
          <button
            onClick={handleToggleItalic}
            className="py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 flex items-center justify-center gap-2"
            title="Toggle Italic (Ctrl+I)"
          >
            <Italic size={16} />
            <span className="italic">Italic</span>
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 italic">
          Select a text element, then click Bold or Italic to toggle formatting
        </p>
      </div>
    </div>
  );
}

export default BackgroundColorPicker;