// frontend/src/components/UI/Sidebar.jsx - UPDATED VERSION
import { useState } from 'react';
import { Upload, Layers, Sparkles, MessageSquare, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../Upload/ImageUpload';
import ImageLibrary from '../Upload/ImageLibrary';
import LayersPanel from '../Canvas/LayersPanel';
import LayoutSuggestions from '../AI/LayoutSuggestions';
import CopySuggestions from '../AI/CopySuggestions';
import BackgroundGenerator from '../AI/BackgroundGenerator'; // NEW
import './Sidebar.css';

function Sidebar({ onAddToCanvas, onAddText }) {
  const [activeTab, setActiveTab] = useState('uploads');

  return (
    <div className="sidebar-root">
      {/* Tabs Header */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
          title="Uploads & Library"
        >
          <Upload size={20} />
          <span>Uploads</span>
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

        {/* NEW TAB */}
        <button
          className={`sidebar-tab ${activeTab === 'ai-background' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-background')}
          title="AI Background Generator"
        >
          <ImageIcon size={20} />
          <span>Backgrounds</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="sidebar-content">
        {activeTab === 'uploads' && (
          <div className="space-y-6">
            <section>
              <h3 className="sidebar-heading">Upload Image</h3>
              <ImageUpload onUploadComplete={(data) => {
                console.log('Upload complete:', data);
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
                  <span className="text-btn-title">Add a heading</span>
                </button>
                <button 
                  onClick={() => onAddText({ text: 'Add a subheading', fontSize: 24, fontWeight: 'medium' })}
                  className="text-btn text-btn-secondary"
                >
                  <span className="text-btn-title">Add a subheading</span>
                </button>
                <button 
                  onClick={() => onAddText({ text: 'Add body text', fontSize: 16, fontWeight: 'normal' })}
                  className="text-btn text-btn-tertiary"
                >
                  <span className="text-btn-title">Add body text</span>
                </button>
              </div>
            </section>

            <div className="border-t border-gray-200 my-4" />
            
            <section>
              <h3 className="sidebar-heading">Your Library</h3>
              <ImageLibrary onSelectImage={onAddToCanvas} />
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

        {/* NEW TAB CONTENT */}
        {activeTab === 'ai-background' && (
          <BackgroundGenerator />
        )}
      </div>
    </div>
  );
}

export default Sidebar;