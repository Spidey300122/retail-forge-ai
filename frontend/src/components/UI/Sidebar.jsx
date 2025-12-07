// frontend/src/components/UI/Sidebar.jsx
import { useState, useEffect } from 'react';
import { 
  Upload, Layers, Sparkles, MessageSquare, 
  Image as ImageIcon, Palette, Type, Wand2, FileImage
} from 'lucide-react';

import ImageUpload from '../Upload/ImageUpload';
import ImageLibrary from '../Upload/ImageLibrary';
import LayersPanel from '../Canvas/LayersPanel';
import LayoutSuggestions from '../AI/LayoutSuggestions';
import CopySuggestions from '../AI/CopySuggestions';
import BackgroundGenerator from '../AI/BackgroundGenerator';
import BackgroundColorPicker from '../Canvas/BackgroundColorPicker';
import SmartAssistant from '../AI/SmartAssistant';

import './Sidebar.css';

function Sidebar({ onAddToCanvas, onAddText }) {
  const [activeTab, setActiveTab] = useState('uploads');
  const [extractedColors, setExtractedColors] = useState([]);

  // Listen for color extraction events
  useEffect(() => {
    const loadSavedColors = () => {
      try {
        const saved = localStorage.getItem('extracted_colors');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.colors) {
            setExtractedColors(parsed.colors);
          }
        }
      } catch (e) {
        console.error('Failed to load saved colors', e);
      }
    };

    loadSavedColors();

    const handleColorsExtracted = (e) => {
      if (e.detail) {
        setExtractedColors(e.detail);
      } else {
        loadSavedColors();
      }
    };

    window.addEventListener('colorsExtracted', handleColorsExtracted);
    return () => window.removeEventListener('colorsExtracted', handleColorsExtracted);
  }, []);

  return (
    <div className="sidebar-root">
      
      {/* Tabs Header - 4 columns grid for better spacing */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
          title="Upload & Text"
        >
          <Upload size={18} />
          <span>Upload</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
          title="Library & Colors"
        >
          <FileImage size={18} />
          <span>Library</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'layers' ? 'active' : ''}`}
          onClick={() => setActiveTab('layers')}
          title="Layers & Objects"
        >
          <Layers size={18} />
          <span>Layers</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'ai-assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-assistant')}
          title="AI Smart Assistant"
        >
          <Wand2 size={18} />
          <span>Assistant</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'ai-layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-layout')}
          title="AI Layouts"
        >
          <Sparkles size={18} />
          <span>Layouts</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'ai-copy' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-copy')}
          title="AI Copywriting"
        >
          <MessageSquare size={18} />
          <span>Copy</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'ai-background' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-background')}
          title="AI Background Generator"
        >
          <ImageIcon size={18} />
          <span>Gen BG</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
          title="Colors & Palette"
        >
          <Palette size={18} />
          <span>Colors</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="sidebar-content">

        {activeTab === 'uploads' && (
          <div className="space-y-6">
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <Upload size={14} />
                Upload Image
              </h3>
              <ImageUpload onUploadComplete={(data) => {
                console.log('Upload complete:', data);
              }} />
            </section>

            <div className="sidebar-divider" />

            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <Type size={14} />
                Add Text
              </h3>
              <div className="text-buttons">
                <button 
                  onClick={() => onAddText({ text: 'Add a heading', fontSize: 32, fontWeight: 'bold' })}
                  className="text-btn text-btn-heading"
                >
                  <div className="text-btn-icon">
                    <Type size={20} />
                  </div>
                  <div className="text-content">
                    <span className="text-label">Heading</span>
                    <span className="text-sublabel">Large title text (32px)</span>
                  </div>
                </button>

                <button 
                  onClick={() => onAddText({ text: 'Add a subheading', fontSize: 24, fontWeight: 'medium' })}
                  className="text-btn text-btn-subheading"
                >
                  <div className="text-btn-icon">
                    <Type size={18} />
                  </div>
                  <div className="text-content">
                    <span className="text-label">Subheading</span>
                    <span className="text-sublabel">Medium subtitle (24px)</span>
                  </div>
                </button>

                <button 
                  onClick={() => onAddText({ text: 'Add body text', fontSize: 16, fontWeight: 'normal' })}
                  className="text-btn text-btn-body"
                >
                  <div className="text-btn-icon">
                    <Type size={16} />
                  </div>
                  <div className="text-content">
                    <span className="text-label">Body Text</span>
                    <span className="text-sublabel">Regular paragraph (16px)</span>
                  </div>
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-6">
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <FileImage size={14} />
                Image Library
              </h3>
              <ImageLibrary onSelectImage={onAddToCanvas} />
            </section>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-6">
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <Palette size={14} />
                Color Palette
              </h3>
              <BackgroundColorPicker extractedColors={extractedColors} />
            </section>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="sidebar-section">
            <h3 className="sidebar-heading">
              <Layers size={14} />
              Canvas Layers
            </h3>
            <LayersPanel />
          </div>
        )}

        {activeTab === 'ai-assistant' && (
          <div className="sidebar-section">
            <SmartAssistant />
          </div>
        )}

        {activeTab === 'ai-layout' && (
          <div className="sidebar-section">
            <LayoutSuggestions />
          </div>
        )}

        {activeTab === 'ai-copy' && (
          <div className="sidebar-section">
            <CopySuggestions />
          </div>
        )}

        {activeTab === 'ai-background' && (
          <div className="sidebar-section">
            <BackgroundGenerator />
          </div>
        )}

      </div>
    </div>
  );
}

export default Sidebar;