import { useState, useEffect } from 'react';
import { Pipette, Check } from 'lucide-react';
import toast from 'react-hot-toast';
// Note: The external import for useCanvasStore has been removed and mocked internally 
// to resolve the compilation error in this single-file environment.

// Mocking the useCanvasStore hook for single-file compilation
// This placeholder allows the component logic to run without the external store definition.
const useCanvasStore = () => {
  // In a real application, this would fetch the Fabric.js canvas instance from a global store.
  // We return a simple object structure, relying on the null check in handleApplyColor.
  return {
    canvas: null
  };
};

function BackgroundColorPicker({ extractedColors = [] }) {
  const { canvas } = useCanvasStore();
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [recentColors, setRecentColors] = useState([]); // New state for recent colors

  // useEffect to load recent colors
  useEffect(() => {
    const loadRecentColors = async () => {
      try {
        // NOTE: This URL is hardcoded for demonstration and assumes a local API server is running
        // This fetch will likely fail without a running backend, but the code is functionally correct.
        const response = await fetch('http://localhost:3000/api/color/recent?userId=1&limit=8');
        const data = await response.json();

        if (response.ok && data.success) {
          setRecentColors(data.data);
          console.log('🕐 Loaded recent colors:', data.data.length);
        } else if (!response.ok) {
           // Handle non-200 responses if necessary
           console.warn('Failed to load recent colors. Server returned:', data);
        }
      } catch (error) {
        // This usually catches network errors
        console.warn('Failed to load recent colors (Network Error):', error);
      }
    };
    loadRecentColors();
  }, []);

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

  const quickColors = extractedColors.length > 0
    ? extractedColors
    : defaultColors;

  const handleColorChange = (e) => {
    // Basic validation for hex color format
    const newValue = e.target.value.toUpperCase();
    if (newValue.match(/^#?([0-9A-F]{1,6})$/i) || newValue === '') {
        setSelectedColor(newValue.startsWith('#') ? newValue : `#${newValue}`);
    } else if (newValue.length > 7) {
        // Prevent typing more than 7 characters
        setSelectedColor(newValue.substring(0, 7));
    } else {
        setSelectedColor(newValue); // Allow temporary non-hex input
    }
  };

  const handleQuickColorSelect = (color) => {
    setSelectedColor(color.hex);
  };

  const handleApplyColor = () => {
    // This check is now crucial as the mock returns canvas: null
    if (!canvas) {
      toast.error("Canvas is not ready. (Mocked environment)");
      return;
    }

    // Simple validation to ensure it looks like a hex code before applying
    if (!selectedColor.match(/^#([0-9A-F]{6})$/i)) {
        toast.error("Invalid hex color code.");
        return;
    }
    
    // These lines rely on a Fabric.js canvas instance being present
    canvas.backgroundColor = selectedColor;
    canvas.renderAll();
    
    toast.success(`Background changed to ${selectedColor}`);
    console.log('🎨 Background color applied:', selectedColor);
    
    // --- Future improvement: Add applied color to recentColors API ---
  };
  
  // New function to apply color to selected text element
  const handleApplyToText = () => {
    if (!canvas) {
      toast.error("Canvas is not ready. (Mocked environment)");
      return;
    }

    const activeObject = canvas.getActiveObject();

    if (!activeObject) {
      toast.error('Please select a text element first');
      return;
    }

    // Check if the object is a Fabric.js IText or Text object
    if (activeObject.type !== 'i-text' && activeObject.type !== 'text') {
      toast.error('Please select a text element');
      return;
    }

    // Apply the selected color to the text fill property
    activeObject.set('fill', selectedColor);
    canvas.renderAll();
    toast.success(`Text color changed to ${selectedColor}`);
  };

  const renderColorSwatches = (colors) => (
    <div className="bg-quick-colors grid grid-cols-8 gap-1 p-2 bg-gray-50 rounded-lg">
      {colors.slice(0, 8).map((color, index) => (
        <div
          key={index}
          className={`bg-quick-color w-8 h-8 rounded-full cursor-pointer relative shadow-md transition-all duration-150 transform hover:scale-105 ${selectedColor === color.hex ? 'ring-2 ring-blue-500' : ''}`}
          style={{ backgroundColor: color.hex }}
          onClick={() => handleQuickColorSelect(color)}
          title={color.name || color.hex}
        >
          {selectedColor === color.hex && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-0.5 flex items-center justify-center border border-blue-500">
              <Check size={12} color={
                // Check color contrast for visibility
                parseInt(color.hex.substring(1), 16) > 0xffffff / 2 ? '#1e40af' : '#ffffff'
              } />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-color-picker p-4 bg-white shadow-lg rounded-xl flex flex-col space-y-4 max-w-xs mx-auto">
      
      {/* Background Color Input */}
      <div>
        <label className="bg-color-picker-label flex items-center text-sm font-semibold text-gray-700 mb-2">
          <Pipette size={14} className="mr-1" />
          Color Selector
        </label>

        <div className="bg-color-input-wrapper flex space-x-2">
          <div
            className="bg-color-preview w-12 h-12 rounded-lg cursor-pointer border border-gray-300 shadow-inner"
            style={{ backgroundColor: selectedColor }}
            onClick={() => {
              // Programmatically opening the color picker via an invisible input
              const colorInput = document.createElement('input');
              colorInput.type = 'color';
              colorInput.value = selectedColor;
              colorInput.onchange = (e) => setSelectedColor(e.target.value);
              colorInput.click();
            }}
            title="Click to pick color"
          />
          
          <input
            id="bg-color-input"
            type="text"
            value={selectedColor}
            onChange={handleColorChange}
            className="bg-color-input flex-grow p-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            placeholder="#FFFFFF"
            maxLength={7}
          />
        </div>
      </div>

      {/* Quick Colors Section (Default/Extracted) */}
      <div className="space-y-2">
        <label className="bg-color-picker-label text-sm font-semibold text-gray-700">
          Quick Colors
        </label>
        {renderColorSwatches(quickColors)}
      </div>

      {/* Recently Used Colors Section */}
      {recentColors.length > 0 && (
        <div className="space-y-2">
          <label className="bg-color-picker-label text-sm font-semibold text-gray-700">
            Recently Used
          </label>
          {renderColorSwatches(recentColors)}
        </div>
      )}

      {/* Apply Buttons */}
      <button
        onClick={handleApplyColor}
        className="bg-apply-btn w-full py-2 px-4 mt-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Apply Background Color
      </button>
      
      {/* New Button: Apply to Selected Text */}
      <button
        onClick={handleApplyToText}
        className="bg-apply-btn w-full py-2 px-4 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        style={{ marginTop: '8px' }}
      >
        Apply to Selected Text
      </button>

    </div>
  );
}

export default BackgroundColorPicker;