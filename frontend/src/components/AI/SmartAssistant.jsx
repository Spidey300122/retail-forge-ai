// frontend/src/components/AI/SmartAssistant.jsx
import { useState } from 'react';
import { Sparkles, Loader, MessageSquare, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import useOrchestrator from '../../hooks/useOrchestrator';
import useAIStore from '../../store/aiStore';
import useCanvasStore from '../../store/canvasStore'; // Import canvas store
import toast from 'react-hot-toast';

function SmartAssistant() {
  const { processRequest, isProcessing } = useOrchestrator();
  const { canvas } = useCanvasStore(); // Access the canvas
  
  // Access global store state and setters
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
    'Create a modern layout for an orange juice product',
    'Generate energetic copy for a new snack',
    'Design a minimal background for electronics',
    'Suggest improvements for my current design',
  ];

  const getActiveImageFromCanvas = () => {
    if (!canvas) return null;
    
    // 1. Try to get the currently selected object
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'image') {
      return activeObj.getSrc();
    }

    // 2. Fallback: Get the first image on the canvas
    const images = canvas.getObjects('image');
    if (images.length > 0) {
      // Use the one with the largest area (likely the main product)
      return images.sort((a, b) => (b.width * b.scaleX) - (a.width * a.scaleX))[0].getSrc();
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localInput.trim()) {
      toast.error('Please enter a request');
      return;
    }

    // Capture image from canvas
    const currentImage = getActiveImageFromCanvas();
    
    if (!currentImage && localInput.toLowerCase().includes('layout')) {
      toast('Tip: Add an image to the canvas first for better results!', { icon: '💡' });
    }

    try {
      // Prepare the request payload
      const payload = { 
        userInput: localInput,
        // Pass the image URL (base64) if we found one
        productImageUrl: currentImage,
        // Basic product info inferred from input can be added here if you have a parser, 
        // but for now we rely on the orchestrator's intent analysis.
      };

      // Process the request
      const data = await processRequest(payload);
      
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
        toast.success('Assets generated! Check Layouts/Copy tabs.', { 
          icon: '✨',
          duration: 4000 
        });
      }

      setLocalInput('');
      setAssistantInput('');
      
    } catch (error) {
      console.error('Request failed:', error);
      // Error is already toasted by useOrchestrator
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
          Describe what you need and let AI coordinate everything
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={localInput}
          onChange={handleInputChange}
          placeholder="E.g., Create a modern layout with energetic copy for this product..."
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

      {/* Results Display */}
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
              {assistantResults.recommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  {rec.type === 'warning' || rec.type === 'info' ? (
                    <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  ) : (
                    <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#1f2937', textTransform: 'capitalize' }}>{rec.type}:</strong>{' '}
                    <span style={{ color: '#4b5563' }}>{rec.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Layouts Summary */}
          {assistantResults.layouts && assistantResults.layouts.length > 0 && (
            <div style={{ 
              marginBottom: '16px',
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
                gap: '6px'
              }}>
                <CheckCircle size={14} />
                Generated {assistantResults.layouts.length} layout option{assistantResults.layouts.length > 1 ? 's' : ''}
              </p>
              <p style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px' }}>
                Switch to "Layouts" tab to apply them
              </p>
            </div>
          )}

          {/* Copy Summary */}
          {assistantResults.copy && assistantResults.copy.length > 0 && (
            <div style={{ 
              marginBottom: '16px',
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
                gap: '6px'
              }}>
                <CheckCircle size={14} />
                Generated {assistantResults.copy.length} copy variation{assistantResults.copy.length > 1 ? 's' : ''}
              </p>
              <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>
                Switch to "Copy" tab to use them
              </p>
            </div>
          )}

          {/* Processing Time */}
          <p style={{ 
            fontSize: '11px', 
            color: '#9ca3af', 
            marginTop: '12px',
            textAlign: 'right'
          }}>
            Processed in {assistantResults.processingTimeMs}ms
          </p>
          
          <button 
             onClick={() => setAssistantResults(null)}
             style={{
               width: '100%',
               marginTop: '8px',
               padding: '6px',
               fontSize: '11px',
               color: '#6b7280',
               border: '1px solid #e5e7eb',
               backgroundColor: 'white',
               borderRadius: '4px',
               cursor: 'pointer'
             }}
          >
            Clear Results
          </button>
        </div>
      )}
    </div>
  );
}

export default SmartAssistant;