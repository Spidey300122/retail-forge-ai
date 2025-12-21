// frontend/src/components/UI/Sidebar.jsx - REORGANIZED TABS
import { useState, useEffect } from 'react';
import { 
  Upload, Layers, Sparkles, MessageSquare, 
  Image as ImageIcon, Palette, Type, Wand2, FileImage, 
  Package, Award, DollarSign
} from 'lucide-react';

import ImageUpload from '../Upload/ImageUpload';
import ImageLibrary from '../Upload/ImageLibrary';
import LayersPanel from '../Canvas/LayersPanel';
import LayoutSuggestions from '../AI/LayoutSuggestions';
import CopySuggestions from '../AI/CopySuggestions';
import BackgroundGenerator from '../AI/BackgroundGenerator';
import BackgroundColorPicker from '../Canvas/BackgroundColorPicker';
import SmartAssistant from '../AI/SmartAssistant';
import ValueTileSelector from '../Upload/ValueTileSelector';
import useCanvasStore from '../../store/canvasStore';
import { addValueTileToCanvas } from '../../utils/valueTileUtils';
import toast from 'react-hot-toast';

import './Sidebar.css';

function Sidebar({ onAddToCanvas, onAddText }) {
  const { canvas } = useCanvasStore();
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

  const handleAddValueTile = (tileData) => {
    if (!canvas) {
      toast.error('Canvas not ready');
      return;
    }

    const tile = addValueTileToCanvas(canvas, tileData);
    
    if (tile) {
      toast.success(`${tileData.name} added to canvas (top-right, locked)`);
    } else {
      toast.error('Failed to add value tile');
    }
  };

  return (
    <div className="sidebar-root">
      
      {/* Tabs Header - REORGANIZED ORDER */}
      <div className="sidebar-tabs">
        {/* Row 1 */}
        <button
          className={`sidebar-tab ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
          title="Upload Images"
        >
          <Upload size={18} />
          <span>Upload</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
          title="Add Text"
        >
          <Type size={18} />
          <span>Text</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
          title="Image Library"
        >
          <FileImage size={18} />
          <span>Library</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
          title="Colors & Palette"
        >
          <Palette size={18} />
          <span>Colors</span>
        </button>

        {/* Row 2 */}
        <button
          className={`sidebar-tab ${activeTab === 'layers' ? 'active' : ''}`}
          onClick={() => setActiveTab('layers')}
          title="Canvas Layers"
        >
          <Layers size={18} />
          <span>Layers</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'tiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('tiles')}
          title="Value Tiles"
        >
          <DollarSign size={18} />
          <span>Tiles</span>
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

        {/* Row 3 */}
        <button
          className={`sidebar-tab ${activeTab === 'ai-background' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-background')}
          title="AI Background Generator"
        >
          <ImageIcon size={18} />
          <span>Gen BG</span>
        </button>

        <button
          className={`sidebar-tab ${activeTab === 'ai-assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-assistant')}
          title="AI Smart Assistant"
        >
          <Wand2 size={18} />
          <span>Assistant</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="sidebar-content">

        {/* UPLOAD TAB - Image uploads only */}
        {activeTab === 'uploads' && (
          <div className="space-y-6">
            
            {/* PACKSHOTS SECTION - MAX 3, FIRST IS LEAD */}
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <Package size={14} />
                📦 Product Packshots
              </h3>
              <div style={{
                padding: '12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '12px',
                lineHeight: '1.5'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1e40af' }}>
                  📋 Packshot Rules:
                </div>
                <ul style={{ paddingLeft: '16px', margin: 0, color: '#1e40af' }}>
                  <li>Maximum: <strong>3 packshots</strong></li>
                  <li>First upload is automatically the <strong>LEAD</strong> product</li>
                  <li>Lead product is mandatory for compliance</li>
                </ul>
              </div>
              <ImageUpload 
                onUploadComplete={(data) => {
                  console.log('Packshot uploaded:', data);
                  onAddToCanvas(data);
                }}
                imageType="packshot"
                maxUploads={3}
              />
            </section>

            <div className="sidebar-divider" />

            {/* LOGOS SECTION - UNLIMITED */}
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <Award size={14} />
                🏷️ Brand Logo
              </h3>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                fontSize: '11px',
                marginBottom: '12px',
                color: '#15803d'
              }}>
                💡 Upload your brand logo (typically smaller, placed in corner)
              </div>
              <ImageUpload 
                onUploadComplete={(data) => {
                  console.log('Logo uploaded:', data);
                  onAddToCanvas(data);
                }}
                imageType="logo"
                maxUploads={null}
              />
            </section>

            <div className="sidebar-divider" />

            {/* BACKGROUND IMAGE SECTION - MAX 1 */}
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <ImageIcon size={14} />
                🎨 Background Image
              </h3>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde047',
                borderRadius: '8px',
                fontSize: '11px',
                marginBottom: '12px',
                color: '#854d0e'
              }}>
                ℹ️ Upload a background image (lifestyle photo, texture, etc.)
              </div>
              <ImageUpload 
                onUploadComplete={(data) => {
                  console.log('Background uploaded:', data);
                  onAddToCanvas(data);
                }}
                imageType="background"
                maxUploads={1}
              />
            </section>

            <div className="sidebar-divider" />

            {/* DECORATIVE ELEMENTS SECTION - UNLIMITED */}
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <Sparkles size={14} />
                ✨ Decorative Elements
              </h3>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f5f3ff',
                border: '1px solid #d8b4fe',
                borderRadius: '8px',
                fontSize: '11px',
                marginBottom: '12px',
                color: '#6b21a8'
              }}>
                💫 Upload icons, badges, patterns, or other design elements (unlimited)
              </div>
              <ImageUpload 
                onUploadComplete={(data) => {
                  console.log('Decorative element uploaded:', data);
                  onAddToCanvas(data);
                }}
                imageType="decorative"
                maxUploads={null}
              />
            </section>
          </div>
        )}

        {/* TEXT TAB - Text tools only */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <Type size={14} />
                Add Text Elements
              </h3>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                fontSize: '11px',
                marginBottom: '12px',
                color: '#0c4a6e'
              }}>
                💡 Click any text style to add it to canvas. Text is editable after placement.
              </div>
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

                <button 
                  onClick={() => onAddText({ text: 'Small text', fontSize: 12, fontWeight: 'normal' })}
                  className="text-btn text-btn-small"
                >
                  <div className="text-btn-icon">
                    <Type size={14} />
                  </div>
                  <div className="text-content">
                    <span className="text-label">Small Text</span>
                    <span className="text-sublabel">Fine print (12px)</span>
                  </div>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <FileImage size={14} />
                Image Library
              </h3>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                fontSize: '11px',
                marginBottom: '12px',
                color: '#15803d'
              }}>
                📚 All your uploaded images organized by type
              </div>
              <ImageLibrary onSelectImage={onAddToCanvas} />
            </section>
          </div>
        )}

        {/* COLORS TAB */}
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

        {/* LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="sidebar-section">
            <h3 className="sidebar-heading">
              <Layers size={14} />
              Canvas Layers
            </h3>
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fde047',
              borderRadius: '8px',
              fontSize: '11px',
              marginBottom: '12px',
              color: '#854d0e'
            }}>
              🔄 Drag to reorder • 👁️ Toggle visibility • 🔒 Lock/unlock
            </div>
            <LayersPanel />
          </div>
        )}

        {/* TILES TAB - Value Tiles only */}
        {activeTab === 'tiles' && (
          <div className="space-y-6">
            <section className="sidebar-section">
              <h3 className="sidebar-heading">
                <DollarSign size={14} />
                Value Tiles
              </h3>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '11px',
                marginBottom: '12px',
                color: '#1e40af'
              }}>
                💰 Add Tesco brand tiles, white value tiles, or Clubcard price tiles
              </div>
              <ValueTileSelector onAddTile={handleAddValueTile} />
            </section>
          </div>
        )}

        {/* AI LAYOUT TAB */}
        {activeTab === 'ai-layout' && (
          <div className="sidebar-section">
            <LayoutSuggestions />
          </div>
        )}

        {/* AI COPY TAB */}
        {activeTab === 'ai-copy' && (
          <div className="sidebar-section">
            <CopySuggestions />
          </div>
        )}

        {/* AI BACKGROUND TAB */}
        {activeTab === 'ai-background' && (
          <div className="sidebar-section">
            <BackgroundGenerator />
          </div>
        )}

        {/* AI ASSISTANT TAB - Now at the end */}
        {activeTab === 'ai-assistant' && (
          <div className="sidebar-section">
            <SmartAssistant />
          </div>
        )}

      </div>
    </div>
  );
}

export default Sidebar;