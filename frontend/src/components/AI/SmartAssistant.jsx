import { useState } from 'react';
import { Sparkles, Loader, MessageSquare, Lightbulb } from 'lucide-react';
import useOrchestrator from '../../hooks/useOrchestrator';
import toast from 'react-hot-toast';

function SmartAssistant() {
  const { processRequest, isProcessing, results } = useOrchestrator();
  const [userInput, setUserInput] = useState('');

  const examplePrompts = [
    'Create a modern layout for an orange juice product',
    'Generate energetic copy for a new snack',
    'Design a minimal background for electronics',
    'Suggest improvements for my current design',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) {
      toast.error('Please enter a request');
      return;
    }

    try {
      await processRequest({ userInput });
      setUserInput('');
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  const handleExampleClick = (prompt) => {
    setUserInput(prompt);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="E.g., Create a modern layout with energetic copy for an orange juice product..."
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
          disabled={isProcessing || !userInput.trim()}
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
      <div>
        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
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

      {/* Results Display */}
      {results && (
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={16} color="#8b5cf6" />
            AI Results
          </h4>

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                Recommendations:
              </p>
              {results.recommendations.map((rec, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '6px',
                  }}
                >
                  <strong>{rec.type}:</strong> {rec.message}
                </div>
              ))}
            </div>
          )}

          {/* Layouts */}
          {results.layouts && results.layouts.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                Generated {results.layouts.length} layout(s)
              </p>
            </div>
          )}

          {/* Copy */}
          {results.copy && results.copy.length > 0 && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                Generated {results.copy.length} copy variation(s)
              </p>
            </div>
          )}

          {/* Processing Time */}
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '12px' }}>
            Processed in {results.processingTimeMs}ms
          </p>
        </div>
      )}
    </div>
  );
}

export default SmartAssistant;