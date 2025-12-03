// frontend/src/components/AI/BackgroundGenerator.jsx
import { useState } from 'react';
import { Sparkles, Loader, Image as ImageIcon, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import useCanvasStore from '../../store/canvasStore';
import { fabric } from 'fabric';
import './BackgroundGenerator.css';

function BackgroundGenerator() {
  const { canvas } = useCanvasStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional');

  const styles = [
    { value: 'professional', label: 'Professional', desc: 'Clean, corporate look' },
    { value: 'modern', label: 'Modern', desc: 'Contemporary & sleek' },
    { value: 'minimal', label: 'Minimal', desc: 'Simple & elegant' },
    { value: 'vibrant', label: 'Vibrant', desc: 'Bold & colorful' },
    { value: 'abstract', label: 'Abstract', desc: 'Creative patterns' },
    { value: 'gradient', label: 'Gradient', desc: 'Smooth color blends' },
    { value: 'textured', label: 'Textured', desc: 'Subtle depth' },
  ];

  const promptSuggestions = [
    'Soft pastel gradient',
    'Modern geometric patterns',
    'Warm summer sunset',
    'Cool blue abstract waves',
    'Minimalist white studio',
    'Vibrant tropical colors',
    'Professional gray backdrop',
    'Elegant marble texture',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading('🎨 Generating background...');

    try {
      // Show progress messages
      setTimeout(() => {
        toast.loading('Creating your design...', { id: loadingToast });
      }, 3000);
      
      setTimeout(() => {
        toast.loading('Almost there...', { id: loadingToast });
      }, 8000);

      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('style', style);
      formData.append('width', 1080);
      formData.append('height', 1080);

      const response = await fetch('http://localhost:8000/process/generate-background', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const downloadUrl = `http://localhost:8000${data.download_url}`;
        
        const newImage = {
          id: data.file_id,
          url: downloadUrl,
          prompt: prompt,
          style: style,
          metadata: data.metadata,
          timestamp: Date.now()
        };
        
        setGeneratedImages(prev => [newImage, ...prev]);
        setSelectedImage(newImage);
        
        toast.success('✨ Background generated!', { id: loadingToast });
        
        console.log('🎨 Background generated:', newImage);
      } else {
        throw new Error(data.error || 'Failed to generate background');
      }
    } catch (error) {
      console.error('Background generation failed:', error);
      
      let errorMessage = 'Failed to generate background';
      if (error.message.includes('filtered')) {
        errorMessage = '🔒 Content filtered. Try a different description.';
      } else if (error.message.includes('timeout')) {
        errorMessage = '⏱️ Generation timed out. Please try again.';
      }
      
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAsBackground = (image) => {
    if (!canvas) {
      toast.error('Canvas not ready');
      return;
    }

    fabric.Image.fromURL(
      image.url,
      (img) => {
        // Scale to fit canvas
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );

        img.set({
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });

        // Send to back
        canvas.add(img);
        canvas.sendToBack(img);
        canvas.renderAll();

        toast.success('Background applied to canvas');
        console.log('✅ Background applied');
      },
      { crossOrigin: 'anonymous' }
    );
  };

  const handleAddToCanvas = (image) => {
    if (!canvas) {
      toast.error('Canvas not ready');
      return;
    }

    fabric.Image.fromURL(
      image.url,
      (img) => {
        const scale = Math.min(400 / img.width, 400 / img.height);

        img.set({
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();

        toast.success('Added to canvas');
      },
      { crossOrigin: 'anonymous' }
    );
  };

  const handleDownload = (image) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `background-${image.id}.jpg`;
    link.click();
    toast.success('Downloaded!');
  };

  return (
    <div className="background-generator">
      <div className="generator-header">
        <h3 className="generator-title">
          <Sparkles size={18} className="inline mr-2" />
          AI Background Generator
        </h3>
        <p className="generator-subtitle">
          Create custom backgrounds with AI
        </p>
      </div>

      {/* Input Form */}
      <div className="generator-form">
        <div className="form-group">
          <label className="form-label">Describe Your Background</label>
          <textarea
            className="form-textarea"
            placeholder="E.g., Soft gradient from blue to purple, modern abstract shapes, warm sunset colors..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          
          <div className="prompt-suggestions">
            <span className="suggestions-label">Try:</span>
            {promptSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="suggestion-chip"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Style</label>
          <div className="style-grid">
            {styles.map(s => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`style-btn ${style === s.value ? 'active' : ''}`}
              >
                <span className="style-label">{s.label}</span>
                <span className="style-desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="generate-btn"
        >
          {isGenerating ? (
            <>
              <Loader size={18} className="animate-spin" />
              Generating... (~10-15s)
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Background
            </>
          )}
        </button>
      </div>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="generated-gallery">
          <h4 className="gallery-title">Generated Backgrounds</h4>
          <div className="gallery-grid">
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className={`gallery-card ${selectedImage?.id === image.id ? 'selected' : ''}`}
                onClick={() => setSelectedImage(image)}
              >
                <div className="card-image-wrapper">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="card-image"
                  />
                  <div className="card-overlay">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyAsBackground(image);
                      }}
                      className="overlay-btn overlay-btn-primary"
                      title="Set as background"
                    >
                      <ImageIcon size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCanvas(image);
                      }}
                      className="overlay-btn overlay-btn-secondary"
                      title="Add to canvas"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                      className="overlay-btn overlay-btn-tertiary"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="card-info">
                  <p className="card-prompt">{image.prompt}</p>
                  <div className="card-meta">
                    <span className="meta-badge">{image.style}</span>
                    <span className="meta-size">
                      {image.metadata?.file_size_kb}KB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedImages.length === 0 && !isGenerating && (
        <div className="generator-empty">
          <Sparkles size={48} className="empty-icon" />
          <p className="empty-text">
            Describe your ideal background<br />
            and let AI create it for you
          </p>
        </div>
      )}
    </div>
  );
}

export default BackgroundGenerator;