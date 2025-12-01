import { useState } from 'react';
import { Upload, Layers, Sparkles } from 'lucide-react';
import ImageUpload from '../Upload/ImageUpload';
import ImageLibrary from '../Upload/ImageLibrary';
import LayersPanel from '../Canvas/LayersPanel';
import LayoutSuggestions from '../AI/LayoutSuggestions';
import './Sidebar.css';

function Sidebar({ onAddToCanvas, onAddText }) {
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads', 'layers', 'ai'

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
          className={`sidebar-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
          title="AI Tools"
        >
          <Sparkles size={20} />
          <span>AI</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="sidebar-content">
        {activeTab === 'uploads' && (
          <div className="space-y-6">
            {/* 1. Upload Section */}
            <section>
              <h3 className="sidebar-heading">Upload Image</h3>
              <ImageUpload onUploadComplete={(data) => {
                console.log('Upload complete:', data);
              }} />
            </section>
            
            <div className="border-t border-gray-200 my-4" />

            {/* 2. Text Section (Moved Up) */}
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
            
            {/* 3. Library Section (Moved Down) */}
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

        {activeTab === 'ai' && (
          <LayoutSuggestions />
        )}
      </div>
    </div>
  );
}

export default Sidebar;