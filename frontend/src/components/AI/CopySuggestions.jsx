import { useState } from 'react';
import { MessageSquare, Loader, Copy, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useCanvasStore from '../../store/canvasStore';
import { fabric } from 'fabric';
import './CopySuggestions.css';

function CopySuggestions() {
  const { canvas } = useCanvasStore();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  // Form state
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('beverages');
  const [features, setFeatures] = useState('');
  const [style, setStyle] = useState('energetic');

  const categories = [
    { value: 'beverages', label: 'Beverages' },
    { value: 'food', label: 'Food & Snacks' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'home', label: 'Home & Garden' },
  ];

  const styles = [
    { value: 'energetic', label: 'Energetic', desc: 'Exciting & dynamic' },
    { value: 'elegant', label: 'Elegant', desc: 'Sophisticated & refined' },
    { value: 'minimal', label: 'Minimal', desc: 'Simple & clean' },
    { value: 'playful', label: 'Playful', desc: 'Fun & lighthearted' },
    { value: 'professional', label: 'Professional', desc: 'Confident & trustworthy' },
  ];

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('✍️ AI is writing copy...');

    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productInfo: {
            name: productName,
            category: category,
            features: features.split(',').map(f => f.trim()).filter(Boolean),
            audience: 'general consumers'
          },
          style: style,
          userId: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data.suggestions || []);
        setSelectedIndex(null);
        toast.success(`✨ Generated ${data.data.suggestions.length} copy options!`, {
          id: loadingToast
        });
      } else {
        throw new Error(data.error?.message || 'Failed to generate copy');
      }
    } catch (error) {
      console.error('Copy generation failed:', error);
      toast.error('Failed to generate copy', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCanvas = (suggestion, isHeadline) => {
    if (!canvas) {
      toast.error('Canvas not ready');
      return;
    }

    const text = isHeadline ? suggestion.headline : suggestion.subhead;
    const fontSize = isHeadline ? 48 : 24;
    const fontWeight = isHeadline ? 'bold' : 'normal';

    const textObj = new fabric.IText(text, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: fontSize,
      fontWeight: fontWeight,
      fill: '#000000',
      fontFamily: 'Arial',
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();

    textObj.enterEditing();
    textObj.selectAll();

    toast.success(`Added ${isHeadline ? 'headline' : 'subhead'} to canvas`);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="copy-suggestions">
      <div className="suggestions-header">
        <h3 className="suggestions-title">
          <MessageSquare size={18} className="inline mr-2" />
          AI Copy Generator
        </h3>
        <p className="suggestions-subtitle">
          Create compliant, compelling ad copy
        </p>
      </div>

      {/* Input Form */}
      <div className="suggestions-form">
        <div className="form-group">
          <label className="form-label">Product Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Fresh Orange Juice"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
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
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Features (comma-separated)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., 100% natural, no sugar, fresh"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
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
              <MessageSquare size={18} />
              Generate Copy
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="suggestions-loading">
          <div className="loading-spinner" />
          <p className="loading-text">AI is crafting your copy...</p>
        </div>
      )}

      {/* Suggestions */}
      {!isLoading && suggestions.length > 0 && (
        <div className="copy-suggestions-list">
          <h4 className="list-title">Copy Variations</h4>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`copy-card ${selectedIndex === index ? 'selected' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="copy-header">
                <span className="copy-number">Option {index + 1}</span>
                {selectedIndex === index && (
                  <Check size={18} className="text-blue-600" />
                )}
              </div>

              <div className="copy-content">
                <div className="copy-item">
                  <div className="copy-label">Headline</div>
                  <div className="copy-text headline">{suggestion.headline}</div>
                  <div className="copy-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCanvas(suggestion, true);
                      }}
                      className="action-btn add"
                      title="Add to canvas"
                    >
                      Add
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyText(suggestion.headline);
                      }}
                      className="action-btn copy"
                      title="Copy text"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className="copy-item">
                  <div className="copy-label">Subheadline</div>
                  <div className="copy-text subhead">{suggestion.subhead}</div>
                  <div className="copy-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCanvas(suggestion, false);
                      }}
                      className="action-btn add"
                      title="Add to canvas"
                    >
                      Add
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyText(suggestion.subhead);
                      }}
                      className="action-btn copy"
                      title="Copy text"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="copy-meta">
                <div className="meta-item">
                  <AlertCircle size={14} />
                  <span>{suggestion.complianceNotes}</span>
                </div>
                <div className="meta-rationale">
                  💡 {suggestion.rationale}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && suggestions.length === 0 && (
        <div className="suggestions-empty">
          <MessageSquare size={48} className="empty-icon" />
          <p className="empty-text">
            Enter product details and click<br />
            "Generate Copy" for AI suggestions
          </p>
        </div>
      )}
    </div>
  );
}

export default CopySuggestions;