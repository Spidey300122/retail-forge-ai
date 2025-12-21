import { useState, useEffect } from 'react';
import { Trash2, Plus, XCircle, Crown, Package, Award, ImageIcon, Sparkles } from 'lucide-react';
import './ImageLibrary.css';

function ImageLibrary({ onSelectImage }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    console.log('🎬 ImageLibrary mounted');
    
    const loadImages = () => {
      try {
        const stored = localStorage.getItem('uploaded_images');
        
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

    // Load immediately
    loadImages();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'uploaded_images') {
        console.log('🔄 Storage changed, reloading images');
        loadImages();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll every 5 seconds as backup
    const interval = setInterval(loadImages, 5000);

    return () => {
      console.log('👋 ImageLibrary unmounting');
      window.removeEventListener('storage', handleStorageChange);
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

  const getImageTypeIcon = (imageType) => {
    switch (imageType) {
      case 'packshot':
        return <Package size={12} />;
      case 'logo':
        return <Award size={12} />;
      case 'background':
        return <ImageIcon size={12} />;
      case 'decorative':
        return <Sparkles size={12} />;
      default:
        return null;
    }
  };

  const getImageTypeBadge = (imageType, isLead) => {
    const colors = {
      packshot: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
      logo: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
      background: { bg: '#fef3c7', text: '#854d0e', border: '#fde047' },
      decorative: { bg: '#f5f3ff', text: '#6b21a8', border: '#d8b4fe' }
    };

    const color = colors[imageType] || colors.packshot;

    return (
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: color.bg,
          color: color.text,
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          border: `1px solid ${color.border}`,
          textTransform: 'uppercase',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {getImageTypeIcon(imageType)}
          {imageType === 'decorative' ? 'DECOR' : imageType}
        </div>
        
        {isLead && (
          <div style={{
            backgroundColor: '#fbbf24',
            color: '#78350f',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid #f59e0b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Crown size={12} />
            LEAD
          </div>
        )}
      </div>
    );
  };

  // Group images by type
  const groupedImages = {
    packshot: images.filter(img => img.imageType === 'packshot'),
    logo: images.filter(img => img.imageType === 'logo'),
    background: images.filter(img => img.imageType === 'background'),
    decorative: images.filter(img => img.imageType === 'decorative'),
    other: images.filter(img => !img.imageType)
  };

  console.log('🎨 ImageLibrary rendering with', images.length, 'images');

  return (
    <div>
      {images.length > 0 && (
        <div className="image-library-header">
          <span className="image-count">
            {images.length} image(s)
            {groupedImages.packshot.length > 0 && ` • ${groupedImages.packshot.length} Packshots`}
            {groupedImages.logo.length > 0 && ` • ${groupedImages.logo.length} Logos`}
            {groupedImages.background.length > 0 && ` • ${groupedImages.background.length} BG`}
            {groupedImages.decorative.length > 0 && ` • ${groupedImages.decorative.length} Decor`}
          </span>
          <button onClick={handleClearAll} className="clear-all-btn">
            <XCircle size={16} />
            Clear All
          </button>
        </div>
      )}

      {images.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No images uploaded yet</p>
          <p className="empty-subtitle">Upload packshots, logos, backgrounds, or decorative elements</p>
        </div>
      ) : (
        <div className="image-grid">
          {images.map((image, index) => (
            <div
              key={image.imageId || index}
              className="image-card"
              onClick={() => handleAddToCanvas(image)}
            >
              {/* Type & Lead Badges */}
              {getImageTypeBadge(image.imageType, image.isLead)}

              <img
                src={image.url}
                alt={image.filename || 'Image'}
                className="image-thumbnail"
                onError={(e) => {
                  console.error('❌ Failed to load image:', image.imageId);
                  e.target.style.display = 'none';
                }}
              />

              <div className="image-filename">
                {image.filename || image.imageId}
              </div>

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