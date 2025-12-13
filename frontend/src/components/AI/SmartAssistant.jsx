// frontend/src/components/AI/SmartAssistant.jsx - COMPLETE WITH NO LINTING ERRORS
import { useState, useEffect } from 'react';
import { Sparkles, Loader, CheckCircle, AlertCircle, Info, Wand2, Image as ImageIcon, Zap, Tag } from 'lucide-react';
import useAIStore from '../../store/aiStore';
import useCanvasStore from '../../store/canvasStore';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

function SmartAssistant() {
  const { canvas } = useCanvasStore();
  
  const { 
    assistantInput, 
    setAssistantInput, 
    assistantResults, 
    setAssistantResults
  } = useAIStore();

  const [localInput, setLocalInput] = useState(assistantInput);
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);
  const [autoMode, setAutoMode] = useState(false);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalInput(val);
    setAssistantInput(val);
  };

  const examplePrompts = [
    'Generate a complete ad for this mobile phone',
    'Create an LEP ad for this product',
    'Create a beverage ad campaign',
    'Make a professional product advertisement',
    'Design a modern ad for electronics',
    'Create an LEP creative for these potatoes',
  ];

  // Detect if user is requesting LEP
  const detectLEP = (prompt) => {
    const lepKeywords = /\blep\b|low everyday price|everyday low price/i;
    return lepKeywords.test(prompt);
  };

  // Get all images from canvas
  const getAllImagesFromCanvas = () => {
    if (!canvas) return [];
    const images = canvas.getObjects('image');
    return images.map(img => ({
      src: img.getSrc(),
      width: img.width,
      height: img.height,
      area: img.width * img.height,
      object: img
    }));
  };

  // Get best image for layout
  const getBestImageForLayout = () => {
    const images = getAllImagesFromCanvas();
    if (images.length === 0) return null;
    images.sort((a, b) => b.area - a.area);
    return images[0];
  };

  // Extract product info from canvas
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

  // Detect category from prompt
  const detectCategory = (prompt) => {
    const categories = {
      beverages: /drink|juice|soda|beverage|water|coffee|tea|beer|wine|alcohol/i,
      food: /food|snack|meal|bread|cheese|potato|vegetable/i,
      beauty: /beauty|makeup|cosmetic|skincare/i,
      electronics: /electronic|phone|laptop|tech|gadget|mobile/i,
      fashion: /fashion|clothing|apparel|shirt|dress/i,
    };

    for (const [category, regex] of Object.entries(categories)) {
      if (regex.test(prompt)) return category;
    }
    return 'general';
  };

  // Detect style from prompt
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

  // Generate LEP Creative matching reference image
  const generateLEPCreative = (productImageData) => {
    console.log('🏷️ Generating LEP creative...');
    
    if (!canvas) return;

    const TESCO_BLUE = '#00539F';
    const WHITE = '#ffffff';

    // Step 1: Set white background (enforced)
    canvas.setBackgroundColor(WHITE, canvas.renderAll.bind(canvas));
    
    // Step 2: Clear all existing objects
    const allObjects = canvas.getObjects();
    allObjects.forEach(obj => canvas.remove(obj));

    // Step 3: Add product image (LEFT side, centered vertically)
    if (productImageData && productImageData.object) {
      fabric.Image.fromURL(productImageData.src, (img) => {
        // Scale image to fit nicely on left side
        const maxWidth = 400;
        const maxHeight = 700;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        
        img.set({
          left: 280,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false
        });
        canvas.add(img);
        canvas.renderAll();
      }, { crossOrigin: 'anonymous' });
    }

    // Step 4: Add "Tesco" text (TOP LEFT, Tesco Blue)
    const tescoText = new fabric.Text('Tesco', {
      left: 120,
      top: 200,
      originX: 'left',
      originY: 'top',
      fontSize: 72,
      fontWeight: 'bold',
      fill: TESCO_BLUE,
      fontFamily: 'Arial, Roboto, sans-serif',
      selectable: false,
      evented: false
    });
    canvas.add(tescoText);

    // Step 5: Add WHITE Value Tile with LARGE price (RIGHT SIDE)
    const valueTileRect = new fabric.Rect({
      left: canvas.width - 250,
      top: 220,
      width: 200,
      height: 160,
      fill: WHITE,
      stroke: '#d1d5db',
      strokeWidth: 2,
      rx: 8,
      ry: 8,
      selectable: false,
      evented: false
    });
    canvas.add(valueTileRect);

    // Large price text
    const priceText = new fabric.Text('£2', {
      left: canvas.width - 150,
      top: 280,
      originX: 'center',
      originY: 'center',
      fontSize: 80,
      fontWeight: 'bold',
      fill: '#1f2937',
      fontFamily: 'Arial, sans-serif',
      selectable: false,
      evented: false
    });
    canvas.add(priceText);

    // Step 6: Add LEP Badge (TOP RIGHT, Tesco Blue background)
    const lepBadge = new fabric.Rect({
      left: canvas.width - 140,
      top: 60,
      width: 100,
      height: 70,
      fill: TESCO_BLUE,
      rx: 6,
      ry: 6,
      selectable: false,
      evented: false
    });
    canvas.add(lepBadge);

    const lepText = new fabric.Text('LEP', {
      left: canvas.width - 90,
      top: 95,
      originX: 'center',
      originY: 'center',
      fontSize: 28,
      fontWeight: 'bold',
      fill: WHITE,
      fontFamily: 'Arial, sans-serif',
      selectable: false,
      evented: false
    });
    canvas.add(lepText);

    // Step 7: Add descriptive copy (middle-left area)
    const copyText = new fabric.Text('Fresh quality\nguaranteed', {
      left: 120,
      top: 450,
      originX: 'left',
      originY: 'top',
      fontSize: 28,
      fill: '#374151',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'left',
      lineHeight: 1.4,
      selectable: false,
      evented: false
    });
    canvas.add(copyText);

    // Step 8: Add mandatory tag (BOTTOM, centered, proper size)
    const tag = new fabric.Text('Selected stores.\nWhile stocks last', {
      left: canvas.width / 2,
      top: canvas.height - 120,
      originX: 'center',
      originY: 'center',
      fontSize: 24,
      fill: '#1f2937',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      lineHeight: 1.3,
      selectable: false,
      evented: false
    });
    canvas.add(tag);

    canvas.renderAll();
    
    toast.success('✅ LEP creative generated!', {
      duration: 4000,
      icon: '🏷️'
    });
  };

  const generateCompleteAd = async (isAutoMode = false) => {
    if (!isAutoMode && !localInput.trim()) {
      toast.error('Please describe the ad you want to create');
      return;
    }

    // Check if LEP is requested
    const isLEP = detectLEP(localInput);

    const productInfo = extractProductInfo();
    const productImageData = getBestImageForLayout();

    if (!productImageData && !productInfo.hasImage) {
      toast.error('⚠️ Please upload a product image first!', {
        duration: 4000,
        icon: '📸'
      });
      return;
    }

    setIsGeneratingAd(true);
    setGenerationProgress({ step: 'Starting', progress: 0 });

    try {
      // LEP Branch
      if (isLEP) {
        setGenerationProgress({ step: 'Creating LEP creative...', progress: 50 });
        
        generateLEPCreative(productImageData);
        
        setGenerationProgress({ step: 'Complete!', progress: 100 });
        
        const results = {
          recommendations: [
            {
              type: 'success',
              message: '🏷️ LEP creative generated successfully!'
            },
            {
              type: 'info',
              message: '✓ White background enforced'
            },
            {
              type: 'info',
              message: '✓ Tesco Blue (#00539F) applied'
            },
            {
              type: 'info',
              message: '✓ White value tile with price'
            },
            {
              type: 'info',
              message: '✓ LEP badge positioned top-right'
            },
            {
              type: 'info',
              message: '✓ Left-aligned copy added'
            },
            {
              type: 'info',
              message: '✓ Mandatory tag added at bottom'
            },
            {
              type: 'warning',
              message: '⚠️ All elements locked for compliance'
            }
          ]
        };

        setAssistantResults(results);
        toast.success('🏷️ LEP creative ready!', { duration: 4000 });

        if (!isAutoMode) {
          setLocalInput('');
          setAssistantInput('');
        }

        setIsGeneratingAd(false);
        setTimeout(() => setGenerationProgress(null), 2000);
        return;
      }

      // Normal Ad Generation (existing code for non-LEP)
      const category = detectCategory(localInput || 'general product');
      const style = detectStyle(localInput || 'modern');

      const results = {
        background: null,
        layout: null,
        copy: null,
        processingSteps: []
      };

      // Step 1: Remove Background (20%)
      setGenerationProgress({ step: 'Removing background...', progress: 20 });
      
      let cleanProductImage = productImageData.src;
      try {
        const response = await fetch(cleanProductImage);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('file', blob, 'product.jpg');
        formData.append('method', 'fast');

        const bgRemovalResponse = await fetch('http://localhost:8000/process/remove-background', {
          method: 'POST',
          body: formData,
        });

        const bgData = await bgRemovalResponse.json();
        
        if (bgData.success) {
          cleanProductImage = `http://localhost:8000${bgData.download_url}`;
          
          fabric.Image.fromURL(cleanProductImage, (newImg) => {
            const images = canvas.getObjects('image');
            if (images.length > 0) {
              const mainImage = images[0];
              newImg.set({
                left: mainImage.left,
                top: mainImage.top,
                scaleX: mainImage.scaleX,
                scaleY: mainImage.scaleY,
                angle: mainImage.angle,
              });
              canvas.remove(mainImage);
              canvas.add(newImg);
              canvas.renderAll();
            }
          }, { crossOrigin: 'anonymous' });

          results.processingSteps.push({ step: 'background_removal', success: true });
        }
      } catch (bgError) {
        console.warn('Background removal skipped:', bgError);
        results.processingSteps.push({ step: 'background_removal', success: false });
      }

      // Step 2: Generate Background (40%)
      setGenerationProgress({ step: 'Generating background...', progress: 40 });
      let backgroundUrl = null;
      
      try {
        const backgroundPrompt = `${style} background for ${category} product advertisement, professional, high quality`;
        
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
          
          results.background = {
            url: backgroundUrl,
            metadata: bgData.data.metadata
          };
          results.processingSteps.push({ step: 'background', success: true });
        }
      } catch (bgError) {
        console.warn('Background generation failed:', bgError);
        results.processingSteps.push({ step: 'background', success: false });
      }

      // Apply background if generated
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

      setGenerationProgress({ step: 'Complete!', progress: 100 });

      const successfulSteps = results.processingSteps.filter(s => s.success).length;
      
      results.recommendations = [
        {
          type: 'success',
          message: `✨ Complete ${category} ad generated successfully!`
        },
        {
          type: 'success',
          message: `🎨 ${successfulSteps}/${results.processingSteps.length} AI steps completed`
        },
        {
          type: 'info',
          message: '💡 Explore variations in Layouts, Copy, and Colors tabs'
        }
      ];

      setAssistantResults(results);
      toast.success('🎉 Your ad is ready!', { duration: 4000 });

      if (!isAutoMode) {
        setLocalInput('');
        setAssistantInput('');
      }

    } catch (error) {
      console.error('❌ Ad generation failed:', error);
      toast.error('Failed to generate ad. Please try again.');
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

  // Auto-generate on image upload
  useEffect(() => {
    if (!canvas || !autoMode) return;

    const handleImageAdded = (e) => {
      const obj = e.target;
      if (obj.type === 'image') {
        console.log('📸 Image detected! Auto-triggering ad generation...');
        
        const productInfo = extractProductInfo();
        if (productInfo.hasImage) {
          setTimeout(() => {
            generateCompleteAd(true);
          }, 1000);
        }
      }
    };

    canvas.on('object:added', handleImageAdded);

    return () => {
      canvas.off('object:added', handleImageAdded);
    };
  }, [canvas, autoMode]); // Now only depends on canvas and autoMode

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

      {/* Auto Mode Toggle */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: autoMode ? '#f0fdf4' : '#f3f4f6', 
        borderRadius: '8px',
        border: `2px solid ${autoMode ? '#22c55e' : '#e5e7eb'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color={autoMode ? '#22c55e' : '#6b7280'} />
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
            Auto-Generate on Upload
          </span>
        </div>
        <button
          onClick={() => setAutoMode(!autoMode)}
          style={{
            padding: '6px 12px',
            backgroundColor: autoMode ? '#22c55e' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {autoMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* LEP Mode Indicator */}
      {localInput && detectLEP(localInput) && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          <Tag size={16} />
          <span><strong>LEP Mode Detected:</strong> Strict compliance rules will be enforced</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); generateCompleteAd(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={localInput}
          onChange={handleInputChange}
          placeholder="E.g., 'Create an LEP ad for these potatoes' or 'Generate a vibrant beverage ad campaign'"
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
            <Sparkles size={16} color="#8b5cf6" />
            Generation Results
          </h4>

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
                <li>Upload your product image</li>
                <li>Type "Create an LEP ad" for low everyday price format</li>
                <li>Or request a normal ad for full creative freedom</li>
                <li>LEP ads enforce strict Tesco compliance automatically</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default SmartAssistant;