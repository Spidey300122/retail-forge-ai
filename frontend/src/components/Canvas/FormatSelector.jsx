// frontend/src/components/Canvas/FormatSelector.jsx
import { useState, useRef, useEffect } from 'react';
import { Maximize2, Check, ChevronDown } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';

const CANVAS_FORMATS = [
  { id: 'instagram_post', name: 'Instagram Post', width: 1080, height: 1080, icon: '📱' },
  { id: 'instagram_story', name: 'Instagram Story', width: 1080, height: 1920, icon: '📲' },
  { id: 'facebook_feed', name: 'Facebook Feed', width: 1200, height: 628, icon: '👍' },
  { id: 'instore_display', name: 'In-Store Display', width: 1920, height: 1080, icon: '🏪' },
  { id: 'custom', name: 'Custom Size', width: 1080, height: 1080, icon: '⚙️' },
];

function FormatSelector({ onDimensionsChange }) {
  const { canvas } = useCanvasStore();
  const [selectedFormat, setSelectedFormat] = useState('instagram_post');
  const [isOpen, setIsOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFormatChange = (format) => {
    if (!canvas) return;

    setSelectedFormat(format.id);

    if (format.id === 'custom') {
      // Don't close dropdown for custom, wait for input
      return;
    }

    // Resize canvas
    canvas.setDimensions({
      width: format.width,
      height: format.height
    });

    canvas.renderAll();
    
    // Notify parent of dimension change
    if (onDimensionsChange) {
      onDimensionsChange({ width: format.width, height: format.height });
    }
    
    setIsOpen(false);
    toast.success(`Canvas resized to ${format.name}`);
  };

  const handleCustomResize = () => {
    if (!canvas) return;

    const width = parseInt(customWidth);
    const height = parseInt(customHeight);

    if (width < 100 || height < 100) {
      toast.error('Minimum size is 100x100px');
      return;
    }

    if (width > 5000 || height > 5000) {
      toast.error('Maximum size is 5000x5000px');
      return;
    }

    canvas.setDimensions({ width, height });
    canvas.renderAll();
    
    // Notify parent of dimension change
    if (onDimensionsChange) {
      onDimensionsChange({ width, height });
    }
    
    setIsOpen(false);
    toast.success(`Canvas resized to ${width}x${height}`);
  };

  const getCurrentFormatLabel = () => {
    const format = CANVAS_FORMATS.find(f => f.id === selectedFormat);
    if (!format) return 'Select Format';
    
    if (selectedFormat === 'custom') {
      return `Custom (${canvas?.width || 1080}×${canvas?.height || 1080})`;
    }
    
    return `${format.icon} ${format.name}`;
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '500',
          color: '#1f2937',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '200px',
          justifyContent: 'space-between'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Maximize2 size={14} />
          <span>{getCurrentFormatLabel()}</span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          minWidth: '320px',
          maxHeight: '500px',
          overflowY: 'auto',
          animation: 'slideDown 0.2s ease-out'
        }}>
          {/* Format Options */}
          <div style={{ padding: '8px' }}>
            {CANVAS_FORMATS.map(format => (
              <button
                key={format.id}
                onClick={() => handleFormatChange(format)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: selectedFormat === format.id ? '#eff6ff' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (selectedFormat !== format.id) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFormat !== format.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{format.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {format.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280'
                    }}>
                      {format.width} × {format.height}
                    </div>
                  </div>
                </div>
                {selectedFormat === format.id && (
                  <Check size={16} color="#2563eb" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Size Form */}
          {selectedFormat === 'custom' && (
            <div style={{
              padding: '12px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>Width (px)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    min="100"
                    max="5000"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500'
                  }}>Height (px)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    min="100"
                    max="5000"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleCustomResize}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                Apply Custom Size
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default FormatSelector;