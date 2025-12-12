// frontend/src/components/AI/SmartAssistant.jsx - COMPLETE REWRITE
import { useState, useEffect } from 'react';
import { Sparkles, Loader, MessageSquare, Lightbulb, CheckCircle, AlertCircle, Info, Wand2, Image as ImageIcon } from 'lucide-react';
import useOrchestrator from '../../hooks/useOrchestrator';
import useAIStore from '../../store/aiStore';
import useCanvasStore from '../../store/canvasStore';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

function SmartAssistant() {
  const { processCompleteAd, isProcessing } = useOrchestrator();
  const { canvas } = useCanvasStore();
  
  const { 
    assistantInput, 
    setAssistantInput, 
    assistantResults, 
    setAssistantResults,
    setGeneratedLayouts, 
    setGeneratedCopy 
  } = useAIStore();

  const [localInput, setLocalInput] = useState(assistantInput);
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalInput(val);
    setAssistantInput(val);
  };

  const examplePrompts = [
    'Generate a complete ad for this mobile phone',
    'Create a beverage ad campaign',
    'Make a professional product advertisement',
    'Design a modern ad for electronics',
    'Create a vibrant ad for snacks',
    'Generate an elegant beauty product ad',
  ];

  const getAllImagesFromCanvas = () => {
    if (!canvas) return [];
    const images = canvas.getObjects('image');
    return images.map(img => ({
      src: img.getSrc(),
      width: img.width,
      height: img.height,
      area: img.width * img.height,
    }));
  };

  const getBestImageForLayout = () => {
    const images = getAllImagesFromCanvas();
    if (images.length === 0) return null;
    images.sort((a, b) => b.area - a.area);
    return images[0].src;
  };

  const extractProductInfo = () => {
    const textObjects = canvas?.getObjects().filter(obj => 
      obj.type === 'i-text' || obj.type === 'text'
    ) || [];
    
    const productName = textObjects[0]?.text || 'Product';
    return {
      name: productName,
      hasImage: getAllImagesFromCanvas().length > 0
    };
  };

  const detectCategory = (prompt) => {
    const categories = {
      beverages: /drink|juice|soda|beverage|water|coffee|tea|beer|wine|alcohol/i,
      food: /food|snack|meal|bread|cheese/i,
      beauty: /beauty|makeup|cosmetic|skincare/i,
      electronics: /electronic|phone|laptop|tech|gadget|mobile/i,
      fashion: /fashion|clothing|apparel|shirt|dress/i,
    };

    for (const [category, regex] of Object.entries(categories)) {
      if (regex.test(prompt)) return category;
    }
    return 'general';
  };

  const detectStyle = (prompt) => {
    const styles = {
      modern: /modern|contemporary|sleek/i,
      minimal: /minimal|simple|clean/i,
      vibrant: /vibrant|colorful|bold/i,
      elegant: /elegant|sophisticated|premium/i,
      playful: /playful|fun|casual/i,
      professional: /professional|corporate|business/i,
    };

    for (const [style, regex] of Object.entries(styles)) {
      if (regex.test(prompt)) return style;
    }
    return 'modern';
  };

  const generateCompleteAd = async () => {
    if (!localInput.trim()) {
      toast.error('Please describe the ad you want to create');
      return;
    }

    const productInfo = extractProductInfo();
    const productImage = getBestImageForLayout();

    if (!productImage && !productInfo.hasImage) {
      toast.error('⚠️ Please upload a product image first!', {
        duration: 4000,
        icon: '📸'
      });
      return;
    }

    setIsGeneratingAd(true);
    setGenerationProgress({ step: 'Starting', progress: 0 });

    try {
      const category = detectCategory(localInput);
      const style = detectStyle(localInput);

      // Step 1: Generate Background (20%)
      setGenerationProgress({ step: 'Generating background...', progress: 20 });
      const backgroundPrompt = `${style} background for ${category} product advertisement`;
      
      let backgroundUrl = null;
      try {
        const bgResponse = await fetch('http://localhost:3000/api/image/generate-background', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: backgroundPrompt,
            style: style,
            width: 1080,
            height: 1080
          }),
        });

        const bgData = await bgResponse.json();
        if (bgData.success) {
          backgroundUrl = bgData.data.download_url.startsWith('http') 
            ? bgData.data.download_url 
            : `http://localhost:8000${bgData.data.download_url}`;
        }
      } catch (bgError) {
        console.warn('Background generation skipped:', bgError);
      }

      // Step 2: Generate Layout (40%)
      setGenerationProgress({ step: 'Suggesting optimal layouts...', progress: 40 });
      let layoutData = null;
      
      try {
        const layoutResponse = await fetch('http://localhost:3000/api/ai/suggest-layouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productImageUrl: productImage,
            category: category,
            style: style
          })
        });

        const layoutResult = await layoutResponse.json();
        if (layoutResult.success) {
          layoutData = layoutResult.data.suggestions.layouts;
          setGeneratedLayouts(layoutData);
        }
      } catch (layoutError) {
        console.warn('Layout generation skipped:', layoutError);
      }

      // Step 3: Generate Copy (60%)
      setGenerationProgress({ step: 'Writing compelling copy...', progress: 60 });
      let copyData = null;
      
      try {
        const copyResponse = await fetch('http://localhost:3000/api/ai/generate-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productInfo: {
              name: productInfo.name,
              category: category,
              features: [],
              audience: 'general consumers'
            },
            style: style
          })
        });

        const copyResult = await copyResponse.json();
        if (copyResult.success) {
          copyData = copyResult.data.suggestions;
          setGeneratedCopy(copyData);
        }
      } catch (copyError) {
        console.warn('Copy generation skipped:', copyError);
      }

      // Step 4: Apply to Canvas (80%)
      setGenerationProgress({ step: 'Composing your ad...', progress: 80 });
      
      // Clear canvas first
      const existingObjects = canvas.getObjects();
      existingObjects.forEach(obj => {
        if (!obj.isProductImage) {
          canvas.remove(obj);
        }
      });

      // Apply background
      if (backgroundUrl) {
        fabric.Image.fromURL(backgroundUrl, (img) => {
          const scale = Math.max(
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
          canvas.add(img);
          canvas.sendToBack(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
      }

      // Apply layout to existing product image
      if (layoutData && layoutData.length > 0 && productImage) {
        const layout = layoutData[0]; // Use first layout
        const elements = layout.elements;

        // Find and reposition product image
        const productImg = canvas.getObjects('image').find(img => 
          img.getSrc() === productImage
        );

        if (productImg && elements.product) {
          productImg.set({
            left: elements.product.x,
            top: elements.product.y,
            originX: 'center',
            originY: 'center',
            scaleX: elements.product.width / productImg.width,
            scaleY: elements.product.height / productImg.height,
            isProductImage: true
          });
          productImg.setCoords();
        }
      }

      // Add copy text
      if (copyData && copyData.length > 0) {
        const copy = copyData[0]; // Use first copy variant

        // Add headline
        const headline = new fabric.IText(copy.headline, {
          left: canvas.width / 2,
          top: 100,
          originX: 'center',
          originY: 'center',
          fontSize: 48,
          fontWeight: 'bold',
          fill: '#000000',
          fontFamily: 'Arial',
        });
        canvas.add(headline);

        // Add subhead
        const subhead = new fabric.IText(copy.subhead, {
          left: canvas.width / 2,
          top: 900,
          originX: 'center',
          originY: 'center',
          fontSize: 24,
          fill: '#333333',
          fontFamily: 'Arial',
        });
        canvas.add(subhead);
      }

      canvas.renderAll();

      // Step 5: Complete (100%)
      setGenerationProgress({ step: 'Complete!', progress: 100 });

      // Compile results
      const results = {
        success: true,
        background: backgroundUrl ? { url: backgroundUrl } : null,
        layout: layoutData,
        copy: copyData,
        recommendations: [
          {
            type: 'success',
            message: `✨ Complete ${category} ad generated successfully!`
          },
          ...(backgroundUrl ? [{
            type: 'success',
            message: '🎨 Custom background applied'
          }] : []),
          ...(layoutData ? [{
            type: 'success',
            message: `📐 ${layoutData.length} layout option(s) available`
          }] : []),
          ...(copyData ? [{
            type: 'success',
            message: `✍️ ${copyData.length} copy variation(s) ready`
          }] : []),
          {
            type: 'info',
            message: '💡 Check Layouts, Copy, and Colors tabs for variations'
          }
        ]
      };

      setAssistantResults(results);
      toast.success('🎉 Your ad is ready!', { duration: 4000 });

      setLocalInput('');
      setAssistantInput('');

    } catch (error) {
      console.error('❌ Complete ad generation failed:', error);
      toast.error('Failed to generate complete ad. Please try again.');
      setAssistantResults({
        success: false,
        recommendations: [{
          type: 'error',
          message: `Error: ${error.message}`
        }]
      });
    } finally {
      setIsGeneratingAd(false);
      setTimeout(() => setGenerationProgress(null), 2000);
    }
  };

  const handleExampleClick = (prompt) => {
    setLocalInput(prompt);
    setAssistantInput(prompt);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          marginBottom: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: '#1f2937'
        }}>
          <Sparkles size={20} color="#8b5cf6" />
          AI Smart Assistant
        </h3>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Complete ad generation: Background + Layout + Copy
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); generateCompleteAd(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={localInput}
          onChange={handleInputChange}
          placeholder="E.g., 'Generate a complete ad for this mobile phone' or 'Create a vibrant beverage ad campaign'"
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />

        <button
          type="submit"
          disabled={isGeneratingAd || !localInput.trim()}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isGeneratingAd ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isGeneratingAd ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {isGeneratingAd ? (
            <>
              <Loader size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Generate Complete Ad
            </>
          )}
        </button>
      </form>

      {/* Progress Bar */}
      {generationProgress && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
              {generationProgress.step}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {generationProgress.progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${generationProgress.progress}%`,
              height: '100%',
              backgroundColor: '#8b5cf6',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      )}

      {/* Example Prompts */}
      {!assistantResults && !isGeneratingAd && (
        <div>
          <label style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            fontWeight: '500', 
            marginBottom: '8px', 
            display: 'block' 
          }}>
            Try these examples:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e0e7ff';
                  e.target.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Display */}
      {assistantResults && !isGeneratingAd && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb' 
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#1f2937'
          }}>
            <Lightbulb size={16} color="#8b5cf6" />
            Generation Results
          </h4>

          {/* Recommendations */}
          {assistantResults.recommendations && assistantResults.recommendations.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {assistantResults.recommendations.map((rec, index) => {
                const isSuccess = rec.type === 'success';
                const isWarning = rec.type === 'warning';
                const isInfo = rec.type === 'info';
                const isError = rec.type === 'error';
                
                const icon = isSuccess ? (
                  <CheckCircle size={16} color="#10b981" />
                ) : isWarning ? (
                  <AlertCircle size={16} color="#f59e0b" />
                ) : isError ? (
                  <AlertCircle size={16} color="#ef4444" />
                ) : (
                  <Info size={16} color="#3b82f6" />
                );

                const bgColor = isSuccess ? '#f0fdf4' : isWarning ? '#fffbeb' : isError ? '#fef2f2' : '#eff6ff';
                const borderColor = isSuccess ? '#bbf7d0' : isWarning ? '#fcd34d' : isError ? '#fca5a5' : '#bfdbfe';

                return (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1, color: '#1f2937', whiteSpace: 'pre-line' }}>
                      {rec.message}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button 
             onClick={() => setAssistantResults(null)}
             style={{
               width: '100%',
               marginTop: '12px',
               padding: '8px',
               fontSize: '12px',
               color: '#6b7280',
               border: '1px solid #e5e7eb',
               backgroundColor: 'white',
               borderRadius: '6px',
               cursor: 'pointer',
               transition: 'background-color 0.2s',
             }}
             onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
             onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Instructions */}
      {!assistantResults && !isGeneratingAd && (
        <div style={{
          padding: '12px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#1e40af'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <ImageIcon size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>How it works:</strong>
              <ol style={{ marginTop: '4px', paddingLeft: '16px' }}>
                <li>Upload your product image first</li>
                <li>Describe the ad you want</li>
                <li>AI generates background, layout & copy</li>
                <li>Everything appears on your canvas!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartAssistant;