// frontend/src/components/UI/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Upload, Layers, Sparkles, MessageSquare, Image as ImageIcon, Palette, Type } from 'lucide-react';
import ImageUpload from '../Upload/ImageUpload';
import ImageLibrary from '../Upload/ImageLibrary';
import LayersPanel from '../Canvas/LayersPanel';
import LayoutSuggestions from '../AI/LayoutSuggestions';
import CopySuggestions from '../AI/CopySuggestions';
import BackgroundGenerator from '../AI/BackgroundGenerator';
import BackgroundColorPicker from '../Canvas/BackgroundColorPicker';
import './Sidebar.css';

function Sidebar({ onAddToCanvas, onAddText }) {
  const [activeTab, setActiveTab] = useState('uploads');
  const [extractedColors, setExtractedColors] = useState([]);

  // Listen for color extraction events to update the palette in BackgroundColorPicker
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

    // Load initially
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
      {/* Tabs Header */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
          title="Upload & Text"
        >
          <Upload size={20} />
          <span>Upload</span>
        </button>

        {/* NEW IMAGES TAB */}
        <button
          className={`sidebar-tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
          title="Library & Colors"
        >
          <Palette size={20} />
          <span>Images</span>
        </button>
        
        <button
          className={`sidebar-tab ${activeTab === 'layers' ? 'active' : ''}`}
          onClick={() => setActiveTab('layers')}
          title="Layers & Objects"
        >
          <Layers size={20} />
          <span>Layers</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'ai-layout' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-layout')}
          title="AI Layouts"
        >
          <Sparkles size={20} />
          <span>Layouts</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'ai-copy' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-copy')}
          title="AI Copywriting"
        >
          <MessageSquare size={20} />
          <span>Copy</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'ai-background' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-background')}
          title="AI Background Generator"
        >
          <ImageIcon size={20} />
          <span>Gen BG</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="sidebar-content">
        {/* UPLOADS TAB: Cleaned up to just be Upload + Text */}
        {activeTab === 'uploads' && (
          <div className="space-y-6">
            <section>
              <h3 className="sidebar-heading">Upload New</h3>
              <ImageUpload onUploadComplete={(data) => {
                console.log('Upload complete:', data);
                // Optionally switch to images tab to see library after upload
                // setActiveTab('images'); 
              }} />
            </section>
            
            <div className="border-t border-gray-200 my-4" />

            <section>
              <h3 className="sidebar-heading">Add Text</h3>
              <div className="text-buttons">
                <button 
                  onClick={() => onAddText({ text: 'Add a heading', fontSize: 32, fontWeight: 'bold' })}
                  className="text-btn text-btn-primary"
                >
                  <div className="text-btn-icon"><Type size={20} /></div>
                  <span className="text-btn-title">Add a heading</span>
                </button>
                <button 
                  onClick={() => onAddText({ text: 'Add a subheading', fontSize: 24, fontWeight: 'medium' })}
                  className="text-btn text-btn-secondary"
                >
                  <div className="text-btn-icon"><Type size={16} /></div>
                  <span className="text-btn-title">Add a subheading</span>
                </button>
                <button 
                  onClick={() => onAddText({ text: 'Add body text', fontSize: 16, fontWeight: 'normal' })}
                  className="text-btn text-btn-tertiary"
                >
                  <div className="text-btn-icon"><Type size={14} /></div>
                  <span className="text-btn-title">Add body text</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* NEW IMAGES TAB: Library + Colors */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <section>
              <h3 className="sidebar-heading">Your Library</h3>
              <ImageLibrary onSelectImage={onAddToCanvas} />
            </section>

            <div className="border-t border-gray-200 my-4" />

            <section>
              {/* This component handles Extracted Colors, Recent Colors, and Background Application */}
              <BackgroundColorPicker extractedColors={extractedColors} />
            </section>
          </div>
        )}

        {activeTab === 'layers' && (
          <div>
            <h3 className="sidebar-heading">Layers</h3>
            <LayersPanel />
          </div>
        )}

        {activeTab === 'ai-layout' && (
          <LayoutSuggestions />
        )}

        {activeTab === 'ai-copy' && (
          <CopySuggestions />
        )}

        {activeTab === 'ai-background' && (
          <BackgroundGenerator />
        )}
      </div>
    </div>
  );
}

export default Sidebar;