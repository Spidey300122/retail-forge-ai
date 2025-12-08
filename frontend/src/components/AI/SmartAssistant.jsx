// frontend/src/components/AI/SmartAssistant.jsx - FIXED
import { useState } from 'react';
import { Sparkles, Loader, MessageSquare, Lightbulb, CheckCircle, AlertCircle, Info } from 'lucide-react';
import useOrchestrator from '../../hooks/useOrchestrator';
import useAIStore from '../../store/aiStore';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';

function SmartAssistant() {
  const { processRequest, isProcessing } = useOrchestrator();
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

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalInput(val);
    setAssistantInput(val);
  };

  const examplePrompts = [
    'Create a modern layout for this product',
    'Generate energetic copy for a beverage',
    'Validate my design for compliance',
    'Check if everything looks good',
    'Create complete campaign with layout and copy',
    'Review my creative and suggest improvements',
  ];

  /**
   * ENHANCED: Extract ALL images from canvas, not just first one
   */
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

  /**
   * ENHANCED: Get the best image for layout generation
   * Priority: largest image, or most recently added
   */
  const getBestImageForLayout = () => {
    const images = getAllImagesFromCanvas();
    if (images.length === 0) return null;
    
    // Sort by area (largest first)
    images.sort((a, b) => b.area - a.area);
    return images[0].src;
  };

  /**
   * ENHANCED: Extract complete creative data for validation
   */
  const extractCreativeData = () => {
    if (!canvas) return null;

    const objects = canvas.getObjects();
    const textElements = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
    const allText = textElements.map(obj => obj.text).join(' ');
    const sortedBySize = [...textElements].sort((a, b) => (b.fontSize || 16) - (a.fontSize || 16));

    return {
      format: 'instagram_post',
      backgroundColor: canvas.backgroundColor,
      text: allText,
      headline: sortedBySize[0]?.text || '',
      subhead: sortedBySize[1]?.text || '',
      elements: objects.map((obj, index) => ({
        type: obj.type,
        content: obj.text || '',
        fontSize: obj.fontSize,
        fill: obj.fill,
        left: obj.left,
        top: obj.top,
        width: obj.width * (obj.scaleX || 1),
        height: obj.height * (obj.scaleY || 1),
        isPackshot: obj.type === 'image',
        index: index,
      })),
      category: 'general',
      isAlcohol: false,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localInput.trim()) {
      toast.error('Please enter a request');
      return;
    }

    // ENHANCED: Capture image regardless of number
    const bestImage = getBestImageForLayout();
    const allImages = getAllImagesFromCanvas();
    const creativeData = extractCreativeData();
    
    // Show helpful tips based on context
    if (!bestImage && localInput.toLowerCase().includes('layout')) {
      toast('💡 Tip: Add an image to canvas first for layout suggestions!', { 
        icon: '💡',
        duration: 3000,
      });
    }

    if (allImages.length > 1) {
      toast(`📸 Found ${allImages.length} images - using the largest one for layout suggestions`, {
        icon: '📸',
        duration: 3000,
      });
    }

    try {
      // ENHANCED: Build comprehensive payload
      const payload = { 
        userInput: localInput,
        // Pass best image for layout generation
        productImageUrl: bestImage,
        // Pass creative data for validation
        creativeData: creativeData,
        // Additional context
        productInfo: null, // Can be enhanced to extract from canvas text
        category: 'general',
        style: 'modern',
      };

      console.log('📤 Sending request to orchestrator:', payload);

      const data = await processRequest(payload);
      
      console.log('📥 Received response:', data);
      
      setAssistantResults(data);

      // Distribute assets to other tabs
      let hasResults = false;

      if (data.layouts && data.layouts.length > 0) {
        setGeneratedLayouts(data.layouts);
        hasResults = true;
      }
      
      if (data.copy && data.copy.length > 0) {
        setGeneratedCopy(data.copy);
        hasResults = true;
      }

      if (hasResults) {
        toast.success('✨ Results ready! Check the respective tabs.', { 
          icon: '✨',
          duration: 4000 
        });
      }

      setLocalInput('');
      setAssistantInput('');
      
    } catch (error) {
      console.error('❌ Request failed:', error);
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
          Multi-agent AI system: Layouts, Copy, Validation & More
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={localInput}
          onChange={handleInputChange}
          placeholder="E.g., 'Create a modern layout and validate compliance' or 'Generate copy for a beverage product'"
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
          disabled={isProcessing || !localInput.trim()}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isProcessing ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {isProcessing ? (
            <>
              <Loader size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <MessageSquare size={18} />
              Ask AI
            </>
          )}
        </button>
      </form>

      {/* Example Prompts */}
      {!assistantResults && (
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

      {/* Results Display - ENHANCED */}
      {assistantResults && (
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
            AI Results
          </h4>

          {/* Recommendations */}
          {assistantResults.recommendations && assistantResults.recommendations.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {assistantResults.recommendations.map((rec, index) => {
                const isSuccess = rec.type === 'success';
                const isWarning = rec.type === 'warning';
                const isInfo = rec.type === 'info';
                
                const icon = isSuccess ? (
                  <CheckCircle size={16} color="#10b981" />
                ) : isWarning ? (
                  <AlertCircle size={16} color="#f59e0b" />
                ) : (
                  <Info size={16} color="#3b82f6" />
                );

                const bgColor = isSuccess ? '#f0fdf4' : isWarning ? '#fffbeb' : '#eff6ff';
                const borderColor = isSuccess ? '#bbf7d0' : isWarning ? '#fcd34d' : '#bfdbfe';

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
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#1f2937', whiteSpace: 'pre-line' }}>
                        {rec.message}
                      </div>
                      {rec.violations && rec.violations.length > 0 && (
                        <ul style={{ marginTop: '8px', paddingLeft: '16px', fontSize: '12px' }}>
                          {rec.violations.map((v, i) => (
                            <li key={i}>{v.message}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Detailed Results Summary */}
          {assistantResults.layouts && assistantResults.layouts.length > 0 && (
            <div style={{ 
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              border: '1px solid #dbeafe'
            }}>
              <p style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}>
                <CheckCircle size={14} />
                ✨ Generated {assistantResults.layouts.length} layout option{assistantResults.layouts.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {assistantResults.copy && assistantResults.copy.length > 0 && (
            <div style={{ 
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: '#f0fdf4',
              borderRadius: '6px',
              border: '1px solid #bbf7d0'
            }}>
              <p style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}>
                <CheckCircle size={14} />
                ✍️ Generated {assistantResults.copy.length} copy variation{assistantResults.copy.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {assistantResults.validation && (
            <div style={{ 
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: assistantResults.validation.isCompliant ? '#f0fdf4' : '#fef2f2',
              borderRadius: '6px',
              border: `1px solid ${assistantResults.validation.isCompliant ? '#bbf7d0' : '#fca5a5'}`
            }}>
              <p style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: assistantResults.validation.isCompliant ? '#15803d' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
              }}>
                {assistantResults.validation.isCompliant ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {assistantResults.validation.isCompliant 
                  ? `✅ Compliant! Score: ${assistantResults.validation.score}/100` 
                  : `⚠️ ${assistantResults.validation.violations.length} issue(s) found`
                }
              </p>
            </div>
          )}

          {/* Processing Time */}
          <p style={{ 
            fontSize: '11px', 
            color: '#9ca3af', 
            marginTop: '12px',
            textAlign: 'right',
            margin: '12px 0 0 0',
          }}>
            ⚡ Processed in {assistantResults.processingTimeMs}ms
          </p>
          
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
    </div>
  );
}

export default SmartAssistant;