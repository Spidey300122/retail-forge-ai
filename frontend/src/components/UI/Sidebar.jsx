import { useState } from 'react';
import { Upload as UploadIcon, Image as ImageIcon, Type, Layers } from 'lucide-react';
import ImageUpload from '../Upload/ImageUpload';
// 1. Import the missing components
import ImageLibrary from '../Upload/ImageLibrary';
import LayersPanel from '../Canvas/LayersPanel';

function Sidebar({ onAddToCanvas, onAddText }) {
  const [activeTab, setActiveTab] = useState('upload');

  // ... existing tabs config and handlers ... 
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
    // ... existing text logic ...
    const textConfig = {
      heading: { text: 'Heading Text', fontSize: 48, fontWeight: 'bold' },
      subheading: { text: 'Subheading Text', fontSize: 32, fontWeight: '600' },
      body: { text: 'Body Text', fontSize: 24, fontWeight: 'normal' },
    };
    if (onAddText) onAddText(textConfig[type]);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium
                transition-colors
                ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'upload' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Upload Images</h3>
            <ImageUpload onUploadComplete={handleUploadComplete} type="product" />
          </div>
        )}

        {/* 2. Fix Images Tab */}
        {activeTab === 'images' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Your Images</h3>
            {/* Replace placeholder with component */}
            <ImageLibrary onSelectImage={onAddToCanvas} />
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Add Text</h3>
            {/* ... existing text buttons ... */}
            <button onClick={() => handleAddText('heading')} className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-left">
              <div className="font-semibold">Add Heading</div>
              <div className="text-sm opacity-90">Large title text</div>
            </button>
            <button onClick={() => handleAddText('subheading')} className="w-full px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 text-left">
              <div className="font-semibold">Add Subheading</div>
              <div className="text-sm opacity-90">Medium subtitle text</div>
            </button>
            <button onClick={() => handleAddText('body')} className="w-full px-4 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 text-left">
              <div className="font-semibold">Add Body Text</div>
              <div className="text-sm opacity-90">Regular paragraph text</div>
            </button>
          </div>
        )}

        {/* 3. Fix Layers Tab */}
        {activeTab === 'layers' && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Layers</h3>
            {/* Replace placeholder with component */}
            <LayersPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;