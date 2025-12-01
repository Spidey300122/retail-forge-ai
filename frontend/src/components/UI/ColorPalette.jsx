import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import './ColorPalette.css';

function ColorPalette({ colors, onSelectColor, selectedColor, title = "Color Palette" }) {
  const [_hoveredColor, setHoveredColor] = useState(null);

  const handleColorClick = (color) => {
    if (onSelectColor) {
      onSelectColor(color);
    }
  };

  if (!colors || colors.length === 0) {
    return (
      <div className="colors-empty">
        <Palette size={48} className="colors-empty-icon" />
        <p className="colors-empty-text">
          No colors extracted yet.<br />
          Select an image and click "Extract Colors"
        </p>
      </div>
    );
  }

  return (
    <div className="color-palette">
      <div className="color-palette-header">
        <div>
          <h4 className="palette-title">{title}</h4>
          <p className="palette-subtitle">{colors.length} colors</p>
        </div>
      </div>

      <div className="color-grid">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`color-swatch ${selectedColor === color.hex ? 'selected' : ''}`}
            onClick={() => handleColorClick(color)}
            onMouseEnter={() => setHoveredColor(index)}
            onMouseLeave={() => setHoveredColor(null)}
            title={`${color.name} - ${color.hex}`}
          >
            <div 
              className="color-preview"
              style={{ backgroundColor: color.hex }}
            >
              <div className="color-info">
                <p className="color-hex">{color.hex}</p>
                <p className="color-name">{color.name}</p>
                {color.usage && (
                  <p className="color-usage">{color.usage}</p>
                )}
              </div>
            </div>

            {selectedColor === color.hex && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <Check size={16} color="#2563eb" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColorPalette;