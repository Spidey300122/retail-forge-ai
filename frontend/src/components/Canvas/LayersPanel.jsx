import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { useCanvas } from '../context/CanvasContext';
import { generateLayouts } from '../services/aiService';

const LayoutsPanel = () => {
  const { canvas, addImageToCanvas, addTextToCanvas } = useCanvas();
  const [productImageUrl, setProductImageUrl] = useState('');
  const [category, setCategory] = useState('Beverages');
  const [style, setStyle] = useState('Modern');
  const [layouts, setLayouts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [hasCanvasImage, setHasCanvasImage] = useState(false);

  // Auto-detect images on canvas
  useEffect(() => {
    if (!canvas) return;

    const detectImages = () => {
      const objects = canvas.getObjects();
      const imageObject = objects.find(obj => obj.type === 'image');
      
      if (imageObject) {
        setHasCanvasImage(true);
        // Auto-populate URL if not already set
        if (!productImageUrl && imageObject.getSrc) {
          const src = imageObject.getSrc();
          setProductImageUrl(src);
        }
      } else {
        setHasCanvasImage(false);
      }
    };

    detectImages();

    // Listen for canvas changes
    canvas.on('object:added', detectImages);
    canvas.on('object:removed', detectImages);

    return () => {
      canvas.off('object:added', detectImages);
      canvas.off('object:removed', detectImages);
    };
  }, [canvas, productImageUrl]);

  const detectCanvasImage = () => {
    if (!canvas) {
      setError('Canvas not initialized');
      return;
    }

    const objects = canvas.getObjects();
    const imageObject = objects.find(obj => obj.type === 'image');

    if (imageObject && imageObject.getSrc) {
      const src = imageObject.getSrc();
      setProductImageUrl(src);
      setError('');
      // Show success feedback
      const notification = document.createElement('div');
      notification.textContent = '✓ Image detected from canvas';
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    } else {
      setError('No image found on canvas. Please upload an image first in the UPLOAD tab.');
    }
  };

  const handleGenerateLayouts = async () => {
    if (!productImageUrl) {
      setError('Please provide a product image URL or detect from canvas');
      return;
    }

    setIsGenerating(true);
    setError('');
    setLayouts([]);

    try {
      const result = await generateLayouts({
        imageUrl: productImageUrl,
        category,
        style
      });

      if (result.success) {
        setLayouts(result.layouts);
      } else {
        setError(result.error || 'Failed to generate layouts');
      }
    } catch (err) {
      setError('Error generating layouts: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyLayout = async (layout) => {
    if (!canvas) return;

    try {
      // Clear canvas
      canvas.clear();

      // Apply background color if specified
      if (layout.backgroundColor) {
        canvas.setBackgroundColor(layout.backgroundColor, canvas.renderAll.bind(canvas));
      }

      // Add product image
      if (productImageUrl) {
        await addImageToCanvas(productImageUrl, {
          left: layout.productPosition?.x || 200,
          top: layout.productPosition?.y || 150,
          scaleX: layout.productPosition?.scale || 0.8,
          scaleY: layout.productPosition?.scale || 0.8
        });
      }

      // Add headline
      if (layout.headline) {
        addTextToCanvas(layout.headline, {
          left: layout.headlinePosition?.x || 100,
          top: layout.headlinePosition?.y || 50,
          fontSize: layout.headlinePosition?.fontSize || 36,
          fontWeight: 'bold',
          fill: layout.headlinePosition?.color || '#000000'
        });
      }

      // Add subheadline
      if (layout.subheadline) {
        addTextToCanvas(layout.subheadline, {
          left: layout.subheadlinePosition?.x || 100,
          top: layout.subheadlinePosition?.y || 100,
          fontSize: layout.subheadlinePosition?.fontSize || 24,
          fill: layout.subheadlinePosition?.color || '#666666'
        });
      }

      canvas.renderAll();

      // Success notification
      const notification = document.createElement('div');
      notification.textContent = '✓ Layout applied successfully';
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);

    } catch (err) {
      setError('Error applying layout: ' + err.message);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Layout Suggestions
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Let AI suggest optimal layouts for your product
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Product Image URL Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={productImageUrl}
              onChange={(e) => {
                setProductImageUrl(e.target.value);
                setError('');
              }}
              placeholder="https://example.com/product.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={detectCanvasImage}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md flex items-center gap-2 transition-colors"
              title="Detect image from canvas"
            >
              <ImageIcon className="w-4 h-4" />
              Detect
            </button>
          </div>
          {hasCanvasImage && !productImageUrl && (
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Image detected on canvas - click "Detect" to use it
            </p>
          )}
          {!hasCanvasImage && !productImageUrl && (
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: Upload an image in the UPLOAD tab first, or paste a URL above
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Beverages">Beverages</option>
            <option value="Food">Food</option>
            <option value="Beauty">Beauty & Personal Care</option>
            <option value="Household">Household</option>
            <option value="Snacks">Snacks</option>
            <option value="Fresh">Fresh Produce</option>
          </select>
        </div>

        {/* Style Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Modern">Modern</option>
            <option value="Minimal">Minimal</option>
            <option value="Bold">Bold</option>
            <option value="Elegant">Elegant</option>
            <option value="Vibrant">Vibrant</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateLayouts}
          disabled={isGenerating || !productImageUrl}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Layouts...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Layouts
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Layout Suggestions */}
        {layouts.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Suggested Layouts</h3>
            {layouts.map((layout, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">{layout.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{layout.description}</p>
                  </div>
                </div>

                {/* Layout Preview Details */}
                <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-1">
                  <p><strong>Background:</strong> {layout.backgroundColor || 'White'}</p>
                  <p><strong>Headline:</strong> {layout.headline}</p>
                  {layout.subheadline && (
                    <p><strong>Subhead:</strong> {layout.subheadline}</p>
                  )}
                </div>

                <button
                  onClick={() => applyLayout(layout)}
                  className="mt-3 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Apply Layout
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && layouts.length === 0 && !error && (
          <div className="mt-8 text-center text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enter a product image URL and click Generate Layouts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutsPanel;