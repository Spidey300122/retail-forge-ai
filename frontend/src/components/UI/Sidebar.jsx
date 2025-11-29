import { useState } from 'react';
import { Upload as UploadIcon, Image as ImageIcon, Type, Layers } from 'lucide-react';
import ImageUpload from '../Upload/ImageUpload';
import ImageLibrary from '../Upload/ImageLibrary';
import LayersPanel from '../Canvas/LayersPanel';
import './Sidebar.css';

function Sidebar({ onAddToCanvas, onAddText }) {
  const [activeTab, setActiveTab] = useState('upload');

  const tabs = [
    { id: 'upload', label: 'Upload', icon: UploadIcon },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'text', label: 'Text', icon: Type },
    { id: 'layers', label: 'Layers', icon: Layers },
  ];

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
      {/* Tabs Header */}
      <div className="sidebar-tabs">
        {tabs.map(tab => {
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

      {/* Content Area */}
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