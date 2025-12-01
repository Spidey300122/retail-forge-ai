import { useState } from 'react';
import { Sparkles, Loader, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useCanvasStore from '../../store/canvasStore';
import { fabric } from 'fabric';
import './LayoutSuggestions.css';

function LayoutSuggestions() {
  const { canvas } = useCanvasStore();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  
  // Form state
  const [category, setCategory] = useState('beverages');
  const [style, setStyle] = useState('modern');
  const [productImageUrl, setProductImageUrl] = useState('');

  const categories = [
    'beverages', 'food', 'beauty', 'electronics', 
    'fashion', 'home', 'sports', 'toys'
  ];

  const styles = [
    'modern', 'minimal', 'vibrant', 'elegant', 
    'playful', 'professional', 'bold', 'clean'
  ];

  const handleGenerate = async () => {
    if (!productImageUrl) {
      toast.error('Please provide a product image URL');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('🎨 AI is analyzing your product...');

    try {
      const response = await fetch('http://localhost:3000/api/ai/suggest-layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImageUrl,
          category,
          style,
          userId: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data.suggestions.layouts || []);
        toast.success(`✨ Generated ${data.data.suggestions.layouts.length} layouts!`, {
          id: loadingToast
        });
      } else {
        throw new Error(data.error?.message || 'Failed to generate layouts');
      }
    } catch (error) {
      console.error('Layout generation failed:', error);
      toast.error('Failed to generate layouts', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyLayout = (layout) => {
    if (!canvas) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      // Clear canvas
      canvas.clear();
      canvas.backgroundColor = '#ffffff';

      // Apply layout elements
      const elements = layout.elements;

      // Add product image placeholder
      if (elements.product && productImageUrl) {
        fabric.Image.fromURL(productImageUrl, (img) => {
          img.set({
            left: elements.product.x,
            top: elements.product.y,
            originX: 'center',
            originY: 'center',
            scaleX: elements.product.width / img.width,
            scaleY: elements.product.height / img.height
          });
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
      }

      // Add headline text
      if (elements.headline) {
        const headline = new fabric.IText('Your Headline Here', {
          left: elements.headline.x,
          top: elements.headline.y,
          fontSize: elements.headline.fontSize || 48,
          fontWeight: 'bold',
          fill: '#000000',
          originX: elements.headline.align === 'center' ? 'center' : 'left',
          originY: 'center'
        });
        canvas.add(headline);
      }

      // Add logo placeholder
      if (elements.logo) {
        const logoRect = new fabric.Rect({
          left: elements.logo.x,
          top: elements.logo.y,
          width: elements.logo.width,
          height: elements.logo.height,
          fill: '#e5e7eb',
          stroke: '#d1d5db',
          strokeWidth: 2,
          rx: 8,
          ry: 8
        });
        
        const logoText = new fabric.Text('Logo', {
          left: elements.logo.x + elements.logo.width / 2,
          top: elements.logo.y + elements.logo.height / 2,
          fontSize: 14,
          fill: '#6b7280',
          originX: 'center',
          originY: 'center'
        });

        canvas.add(logoRect, logoText);
      }

      canvas.renderAll();
      setSelectedLayout(layout);
      toast.success(`Applied "${layout.name}" layout`);
    } catch (error) {
      console.error('Failed to apply layout:', error);
      toast.error('Failed to apply layout');
    }
  };

  return (
    <div className="layout-suggestions">
      <div className="suggestions-header">
        <h3 className="suggestions-title">
          <Sparkles size={18} className="inline mr-2" />
          AI Layout Suggestions
        </h3>
        <p className="suggestions-subtitle">
          Let AI suggest optimal layouts for your product
        </p>
      </div>

      {/* Input Form */}
      <div className="suggestions-form">
        <div className="form-group">
          <label className="form-label">Product Image URL</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://example.com/product.jpg"
            value={productImageUrl}
            onChange={(e) => setProductImageUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Style</label>
          <select
            className="form-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            {styles.map(s => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="generate-btn"
        >
          {isLoading ? (
            <>
              <Loader size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Generate Layouts
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="suggestions-loading">
          <div className="loading-spinner" />
          <p className="loading-text">AI is analyzing your product...</p>
        </div>
      )}

      {/* Suggestions Grid */}
      {!isLoading && suggestions.length > 0 && (
        <div className="layout-grid">
          {suggestions.map((layout, index) => (
            <div
              key={index}
              className={`layout-card ${selectedLayout === layout ? 'selected' : ''}`}
              onClick={() => setSelectedLayout(layout)}
            >
              <div className="layout-header">
                <h4 className="layout-name">{layout.name}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyLayout(layout);
                  }}
                  className="apply-btn"
                >
                  Apply
                </button>
              </div>
              <p className="layout-description">{layout.description}</p>
              <div className="layout-rationale">
                💡 {layout.rationale}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && suggestions.length === 0 && (
        <div className="suggestions-empty">
          <Sparkles size={48} className="empty-icon" />
          <p className="empty-text">
            Enter a product image URL and click<br />
            "Generate Layouts" to get AI suggestions
          </p>
        </div>
      )}
    </div>
  );
}

export default LayoutSuggestions;