import { useState, useEffect } from 'react';
import { Trash2, Plus, XCircle } from 'lucide-react';
import './ImageLibrary.css';

function ImageLibrary({ onSelectImage }) {
  const [images, setImages] = useState([]);

  // Load images from localStorage
  useEffect(() => {
    console.log('🎬 ImageLibrary mounted');
    
    const loadImages = () => {
      try {
        const stored = localStorage.getItem('uploaded_images');
        console.log('🔍 ImageLibrary: Loading from localStorage');
        
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

  const handleClearAll = () => {
    if (confirm('Delete all images? This cannot be undone.')) {
      setImages([]);
      localStorage.removeItem('uploaded_images');
      console.log('🗑️ Cleared all images');
    }
  };

  console.log('🎨 ImageLibrary rendering with', images.length, 'images');

  return (
    <div>
      {images.length > 0 && (
        <div className="image-library-header">
          <span className="image-count">{images.length} image(s)</span>
          <button onClick={handleClearAll} className="clear-all-btn">
            <XCircle size={16} />
            Clear All
          </button>
        </div>
      )}

      {images.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No images uploaded yet</p>
          <p className="empty-subtitle">Upload some images to get started</p>
        </div>
      ) : (
        <div className="image-grid">
          {images.map((image, index) => (
            <div
              key={image.imageId || index}
              className="image-card"
              onClick={() => handleAddToCanvas(image)}
            >
              <img
                src={image.url}
                alt={image.filename || 'Image'}
                className="image-thumbnail"
                onError={(e) => {
                  console.error('❌ Failed to load image:', image.imageId);
                  e.target.style.display = 'none';
                }}
              />

              {/* Filename overlay */}
              <div className="image-filename">
                {image.filename || image.imageId}
              </div>

              {/* Hover controls */}
              <div className="image-overlay">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCanvas(image);
                  }}
                  className="overlay-btn overlay-btn-add"
                  title="Add to canvas"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={(e) => handleDelete(image.imageId, e)}
                  className="overlay-btn overlay-btn-delete"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageLibrary;