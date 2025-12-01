import { useState, useEffect } from 'react';
import { Upload as UploadIcon, Image as ImageIcon, Type, Layers, Palette } from 'lucide-react';
import ImageUpload from '../Upload/ImageUpload';
import ImageLibrary from '../Upload/ImageLibrary';
import LayersPanel from '../Canvas/LayersPanel';
import BackgroundColorPicker from '../Canvas/BackgroundColorPicker';
import './Sidebar.css';

function Sidebar({ onAddToCanvas, onAddText }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [extractedColors, setExtractedColors] = useState([]);

  const tabs = [
    { id: 'upload', label: 'Upload', icon: UploadIcon },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'layers', label: 'Layers', icon: Layers },
  ];

  // Load colors ONCE + listen for events (no polling)
  useEffect(() => {
    const loadColors = () => {
      try {
        const stored = localStorage.getItem('extracted_colors');
        if (stored) {
          const parsed = JSON.parse(stored);
          const colors = parsed.colors || parsed;

          if (Array.isArray(colors) && colors.length > 0) {
            setExtractedColors(colors);
            console.log('🎨 Sidebar: Loaded', colors.length, 'colors');
          }
        }
      } catch (error) {
        console.error('Failed to load colors:', error);
      }
    };

    // Load on mount
    loadColors();

    // Listen for color extraction events
    const handleColorsExtracted = (event) => {
      console.log('🎨 Sidebar: Received colorsExtracted event', event.detail);
      if (Array.isArray(event.detail) && event.detail.length > 0) {
        setExtractedColors(event.detail);
      }
    };

    window.addEventListener('colorsExtracted', handleColorsExtracted);

    return () => {
      window.removeEventListener('colorsExtracted', handleColorsExtracted);
    };
  }, []); // Only run once

  const handleUploadComplete = (uploadData) => {
    console.log('Upload complete:', uploadData);
    if (onAddToCanvas) {
      onAddToCanvas(uploadData);
    }
  };

  const handleAddText = (type) => {
    const textConfig = {
      heading: { text: 'Heading Text', fontSize: 48, fontWeight: 'bold' },
      subheading: { text: 'Subheading Text', fontSize: 32, fontWeight: '600' },
      body: { text: 'Body Text', fontSize: 24, fontWeight: 'normal' },
    };

    if (onAddText) onAddText(textConfig[type]);
  };

  return (
    <div className="sidebar-root">
      <div className="sidebar-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-content">
        {activeTab === 'upload' && (
          <div>
            <h3 className="sidebar-heading">Upload Images</h3>
            <ImageUpload onUploadComplete={handleUploadComplete} type="product" />
          </div>
        )}

        {activeTab === 'images' && (
          <div>
            <h3 className="sidebar-heading">Your Images</h3>
            <ImageLibrary onSelectImage={onAddToCanvas} />
          </div>
        )}

        {activeTab === 'text' && (
          <div className="text-buttons">
            <h3 className="sidebar-heading">Add Text</h3>
            <button onClick={() => handleAddText('heading')} className="text-btn text-btn-primary">
              <div className="text-btn-title">Add Heading</div>
              <div className="text-btn-subtitle">Large title text</div>
            </button>
            <button onClick={() => handleAddText('subheading')} className="text-btn text-btn-secondary">
              <div className="text-btn-title">Add Subheading</div>
              <div className="text-btn-subtitle">Medium subtitle text</div>
            </button>
            <button onClick={() => handleAddText('body')} className="text-btn text-btn-tertiary">
              <div className="text-btn-title">Add Body Text</div>
              <div className="text-btn-subtitle">Regular paragraph text</div>
            </button>
          </div>
        )}

        {activeTab === 'colors' && (
          <div>
            <h3 className="sidebar-heading">Colors</h3>
            {extractedColors.length > 0 && (
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#92400e',
              }}>
                ✨ {extractedColors.length} colors extracted from image
              </div>
            )}
            <BackgroundColorPicker extractedColors={extractedColors} />
          </div>
        )}

        {activeTab === 'layers' && (
          <div>
            <h3 className="sidebar-heading">Layers</h3>
            <LayersPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;