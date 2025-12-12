// frontend/src/components/AI/SmartAssistant.jsx - FIXED LEP LAYOUT
import { useState, useEffect } from 'react';
import { Sparkles, Loader, CheckCircle, AlertCircle, Info, Wand2, Image as ImageIcon, Zap, Tag } from 'lucide-react';
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

  // Detect LEP intent
  const detectLEP = (prompt) => {
    const lepKeywords = /\blep\b|low everyday price|everyday low price/i;
    return lepKeywords.test(prompt);
  };

  // Auto mode image detection
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
  }, [canvas, autoMode]);

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

  const getBestImageForLayout = () => {
    const images = getAllImagesFromCanvas();
    if (images.length === 0) return null;
    images.sort((a, b) => b.area - a.area);
    return images[0];
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

  // ------------------------------------
  // LEP CREATIVE GENERATOR (FIXED LAYOUT)
  // ------------------------------------
  const generateLEPCreative = async (productImageData, productName) => {
    console.log('🏷️ Generating LEP creative...');
    
    if (!canvas) return;

    const TESCO_BLUE = '#00539F';
    const WHITE = '#ffffff';

    // White background
    canvas.setBackgroundColor(WHITE, canvas.renderAll.bind(canvas));
    
    // Clear all objects
    const allObjects = canvas.getObjects();
    allObjects.forEach(obj => canvas.remove(obj));

    // PRODUCT IMAGE (left side)
    if (productImageData && productImageData.object) {
      fabric.Image.fromURL(productImageData.src, (img) => {
        const maxWidth = 450;
        const maxHeight = 800;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        
        img.set({
          left: 250,
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
      });
    }

    // PRODUCT NAME (top-left)
    const productNameText = new fabric.Text(productName || 'Jersey Royal', {
      left: 120,
      top: 180,
      originX: 'left',
      originY: 'top',
      fontSize: 72,
      fontWeight: 'bold',
      fill: TESCO_BLUE,
      fontFamily: 'Arial, Roboto, sans-serif',
      selectable: false,
      evented: false
    });
    canvas.add(productNameText);

    // VALUE TILE (white rectangle)
    const valueTileRect = new fabric.Rect({
      left: canvas.width - 280,
      top: 150,
      width: 220,
      height: 180,
      fill: WHITE,
      stroke: '#e5e7eb',
      strokeWidth: 3,
      rx: 12,
      ry: 12,
      selectable: false,
      evented: false
    });
    canvas.add(valueTileRect);

    // LARGE PRICE
    const priceText = new fabric.Text('£2', {
      left: canvas.width - 170,
      top: 220,
      originX: 'center',
      originY: 'center',
      fontSize: 96,
      fontWeight: 'bold',
      fill: '#1f2937',
      fontFamily: 'Arial, sans-serif',
      selectable: false,
      evented: false
    });
    canvas.add(priceText);

    // LEP BADGE
    const lepBadge = new fabric.Rect({
      left: canvas.width - 160,
      top: 40,
      width: 120,
      height: 80,
      fill: '#8b5cf6',
      rx: 8,
      ry: 8,
      selectable: false,
      evented: false
    });
    canvas.add(lepBadge);

    const lepText = new fabric.Text('LEP', {
      left: canvas.width - 100,
      top: 80,
      originX: 'center',
      originY: 'center',
      fontSize: 32,
      fontWeight: 'bold',
      fill: WHITE,
      fontFamily: 'Arial, sans-serif',
      selectable: false,
      evented: false
    });
    canvas.add(lepText);

    // MANDATORY TAG
    const tag = new fabric.Text('Selected stores.\nWhile stocks last', {
      left: canvas.width / 2,
      top: canvas.height - 150,
      originX: 'center',
      originY: 'center',
      fontSize: 32,
      fill: '#1f2937',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      lineHeight: 1.4,
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

  // ------------------------------------
  // MAIN AD GENERATION HANDLER
  // ------------------------------------
  const generateCompleteAd = async (isAutoMode = false) => {
    if (!isAutoMode && !localInput.trim()) {
      toast.error('Please describe the ad you want to create');
      return;
    }

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
      // LEP MODE
      if (isLEP) {
        setGenerationProgress({ step: 'Creating LEP creative...', progress: 50 });
        
        await generateLEPCreative(productImageData, productInfo.name);
        
        setGenerationProgress({ step: 'Complete!', progress: 100 });
        
        const results = {
          recommendations: [
            { type: 'success', message: '🏷️ LEP creative generated successfully!' },
            { type: 'info', message: '✓ White background enforced' },
            { type: 'info', message: '✓ Tesco Blue (#00539F) applied' },
            { type: 'info', message: '✓ White value tile with large price' },
            { type: 'info', message: '✓ LEP badge positioned top-right' },
            { type: 'info', message: '✓ Mandatory tag added at bottom' },
            { type: 'warning', message: '⚠️ All elements locked for compliance' }
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

      // NORMAL AD MODE
      const category = detectCategory(localInput || 'general product');
      const style = detectStyle(localInput || 'modern');

      // Placeholder for your existing normal ad logic
      toast.error("Normal ad mode is not included in this snippet — add your existing logic.");

    } catch (error) {
      console.error('❌ Ad generation failed:', error);
      toast.error('Failed to generate ad.');
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

  // ------------------------------------
  // UI RETURN BLOCK
  // ------------------------------------
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
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
          Complete ad generation: Background • Layout • Copy • LEP format
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
            cursor: 'pointer'
          }}
        >
          {autoMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* LEP MODE INDICATOR */}
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
          <span><strong>LEP Mode Detected:</strong> Strict Tesco compliance will be applied</span>
        </div>
      )}

      {/* Text Input */}
      <form 
        onSubmit={(e) => { e.preventDefault(); generateCompleteAd(); }} 
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <textarea
          value={localInput}
          onChange={handleInputChange}
          placeholder="Try: 'Create an LEP ad for these potatoes'"
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
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
            cursor: isGeneratingAd ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
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

      {/* PROGRESS BAR */}
      {generationProgress && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{generationProgress.step}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{generationProgress.progress}%</span>
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

      {/* EXAMPLE PROMPTS */}
      {!assistantResults && !isGeneratingAd && (
        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
            Try these examples:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
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
                  cursor: 'pointer'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS BOX */}
      {assistantResults && !isGeneratingAd && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb' 
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', gap: '8px' }}>
            <Sparkles size={16} color="#8b5cf6" />
            Generation Results
          </h4>

          {assistantResults.recommendations?.map((rec, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px',
                backgroundColor:
                  rec.type === 'success' ? '#f0fdf4' :
                  rec.type === 'warning' ? '#fffbeb' :
                  rec.type === 'error' ? '#fef2f2' :
                  '#eff6ff',
                border: `1px solid ${
                  rec.type === 'success' ? '#bbf7d0' :
                  rec.type === 'warning' ? '#fcd34d' :
                  rec.type === 'error' ? '#fca5a5' :
                  '#bfdbfe'
                }`,
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '13px',
                display: 'flex',
                gap: '10px'
              }}
            >
              <div>
                {rec.type === 'success' ? <CheckCircle size={16} color="#10b981" /> :
                 rec.type === 'warning' ? <AlertCircle size={16} color="#f59e0b" /> :
                 rec.type === 'error' ? <AlertCircle size={16} color="#ef4444" /> :
                 <Info size={16} color="#3b82f6" />}
              </div>

              <div style={{ flex: 1 }}>{rec.message}</div>
            </div>
          ))}

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
              cursor: 'pointer'
            }}
          >
            Clear Results
          </button>
        </div>
      )}

      {/* INSTRUCTIONS */}
      {!assistantResults && !isGeneratingAd && (
        <div style={{
          padding: '12px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#1e40af'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ImageIcon size={16} />
            <div>
              <strong>How it works:</strong>
              <ol style={{ marginTop: '4px', paddingLeft: '16px' }}>
                <li>Upload a product image</li>
                <li>Type “Create an LEP ad” for Tesco Low Everyday Price format</li>
                <li>Normal prompts generate standard ads</li>
                <li>LEP auto-applies strict compliance rules</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* CSS for spinner */}
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
