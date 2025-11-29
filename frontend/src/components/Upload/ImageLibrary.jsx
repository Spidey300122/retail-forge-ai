import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

function ImageLibrary({ onSelectImage }) {
  const [images, setImages] = useState([]);

  // Load images from localStorage
  useEffect(() => {
    console.log('🎬 ImageLibrary mounted');
    
    // Load images function
    const loadImages = () => {
      try {
        const stored = localStorage.getItem('uploaded_images');
        console.log('🔍 ImageLibrary: Loading from localStorage');
        console.log('📦 Raw data:', stored ? 'exists' : 'null');
        
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('✅ Parsed:', parsed.length, 'images');
          setImages(parsed);
        } else {
          console.log('⚠️ No images found');
          setImages([]);
        }
      } catch (error) {
        console.error('❌ Error loading images:', error);
        setImages([]);
      }
    };

    // Initial load
    loadImages();

    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      loadImages();
    }, 3000);

    return () => {
      console.log('👋 ImageLibrary unmounting');
      clearInterval(interval);
    };
  }, []);

  const handleAddToCanvas = (image) => {
    console.log('➕ Adding image to canvas:', image.filename);
    if (onSelectImage) {
      onSelectImage(image);
    }
  };

  const handleDelete = (imageId, e) => {
    e.stopPropagation();
    if (confirm('Delete this image?')) {
      const updated = images.filter(img => img.imageId !== imageId);
      setImages(updated);
      localStorage.setItem('uploaded_images', JSON.stringify(updated));
      console.log('🗑️ Deleted image:', imageId);
    }
  };

  console.log('🎨 ImageLibrary rendering with', images.length, 'images');

  if (images.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="font-medium">No images uploaded yet</p>
        <p className="text-sm mt-2">Upload some images to get started</p>
        <p className="text-xs mt-4 text-gray-400">
          Debug: {localStorage.getItem('uploaded_images') ? 'Data exists' : 'No data'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {images.map((image, index) => (
        <div
          key={image.imageId || index}
          className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
          onClick={() => handleAddToCanvas(image)}
        >
          <img
            src={image.url}
            alt={image.filename || 'Image'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('❌ Failed to load image:', image.imageId);
              e.target.style.display = 'none';
            }}
          />

          {/* Image filename overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
            {image.filename || image.imageId}
          </div>

          {/* Hover controls */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCanvas(image);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100 transition-opacity"
              title="Add to canvas"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={(e) => handleDelete(image.imageId, e)}
              className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full hover:bg-gray-100 transition-opacity"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageLibrary;