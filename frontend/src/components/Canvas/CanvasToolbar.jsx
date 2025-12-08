// frontend/src/components/Canvas/CanvasToolbar.jsx
import { useState } from 'react';
import { Undo, Redo, Trash2, Download, X, Check, Package, Shield, Loader, AlertCircle, Info, CheckCircle, Lightbulb } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';
import './CanvasToolbar.css';
import Tooltip from '../UI/Tooltip';

// Validation Modal Component
function ValidationModal({ isOpen, onClose, validationResults, isValidating }) {
  if (!isOpen) return null;

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'hard_fail': return <AlertCircle size={16} />;
      case 'warning': return <Info size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000}} onClick={onClose}>
      <div style={{backgroundColor: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto'}} onClick={(e) => e.stopPropagation()}>
        <div style={{padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <Shield size={24} color="#2563eb" />
            <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>Compliance Results</h2>
          </div>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{padding: '24px'}}>
          {isValidating ? (
            <div style={{textAlign: 'center', padding: '48px'}}>
              <Loader size={48} className="animate-spin" style={{margin: '0 auto'}} />
              <p style={{marginTop: '16px', color: '#6b7280'}}>Validating...</p>
            </div>
          ) : validationResults ? (
            <div>
              <div style={{padding: '20px', borderRadius: '12px', border: '2px solid', borderColor: validationResults.isCompliant ? '#22c55e' : '#ef4444', backgroundColor: validationResults.isCompliant ? '#f0fdf4' : '#fef2f2', marginBottom: '24px'}}>
                {validationResults.isCompliant ? <CheckCircle size={40} color="#22c55e" /> : <AlertCircle size={40} color="#ef4444" />}
                <h3 style={{fontSize: '20px', fontWeight: 'bold', margin: '8px 0 4px'}}>{validationResults.isCompliant ? 'All Clear!' : 'Issues Found'}</h3>
                <p style={{fontSize: '16px', fontWeight: '600'}}>Score: {validationResults.score}/100</p>
                <p style={{fontSize: '13px'}}>{validationResults.rulesPassed}/{validationResults.rulesChecked} rules passed</p>
              </div>

              {validationResults.violations?.map((v, i) => (
                <div key={i} style={{padding: '12px', marginBottom: '12px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5'}}>
                  <div style={{display: 'flex', gap: '8px'}}>
                    {getSeverityIcon(v.severity)}
                    <div>
                      <h5 style={{fontSize: '14px', fontWeight: '600', margin: '0 0 4px'}}>{v.ruleName}</h5>
                      <p style={{fontSize: '13px', margin: 0}}>{v.message}</p>
                      {v.suggestion && (
                        <div style={{marginTop: '8px', padding: '8px', backgroundColor: 'rgba(139,92,246,0.1)', borderLeft: '3px solid #8b5cf6', display: 'flex', gap: '8px'}}>
                          <Lightbulb size={14} color="#6d28d9" />
                          <span style={{fontSize: '12px', color: '#6d28d9'}}>{v.suggestion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '48px', color: '#6b7280'}}>
              <Shield size={48} style={{margin: '0 auto 16px', opacity: 0.3}} />
              <p>No results yet. Click Validate to check compliance.</p>
            </div>
          )}
        </div>

        <div style={{padding: '16px 24px', borderTop: '1px solid #e5e7eb', textAlign: 'right'}}>
          <button onClick={onClose} style={{padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Close</button>
        </div>
      </div>
    </div>
  );
}

// Export formats configuration
const AVAILABLE_FORMATS = [
  { id: 'instagram_post', name: 'Instagram Post', dims: '1080 x 1080', width: 1080, height: 1080 },
  { id: 'facebook_feed', name: 'Facebook Feed', dims: '1200 x 628', width: 1200, height: 628 },
  { id: 'instagram_story', name: 'Instagram Story', dims: '1080 x 1920', width: 1080, height: 1920 },
  { id: 'instore_display', name: 'In-Store Display', dims: '1920 x 1080', width: 1920, height: 1080 },
];

// Export Modal Component
function ExportModal({ isOpen, onClose, canvas }) {
  const [selectedFormats, setSelectedFormats] = useState(['instagram_post']);
  const [isExporting, setIsExporting] = useState(false);

  const toggleFormat = (id) => {
    setSelectedFormats(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (!canvas) return;
    if (selectedFormats.length === 0) {
      toast.error('Select at least one format');
      return;
    }

    setIsExporting(true);
    const loadingToast = toast.loading('Packaging assets...');

    try {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 2, 
        quality: 1
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append('image', blob, 'master.png');
      formData.append('formats', JSON.stringify(selectedFormats));
      
      const complianceData = {
        isCompliant: true,
        score: 95,
        violations: [],
        warnings: [{ message: 'Check contrast on dark screens' }]
      };
      formData.append('complianceData', JSON.stringify(complianceData));

      const response = await fetch('http://localhost:3000/api/export', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Export failed');

      const blobResponse = await response.blob();
      const url = window.URL.createObjectURL(blobResponse);
      const link = document.createElement('a');
      link.href = url;
      link.download = `retail_forge_assets_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Assets downloaded!', { id: loadingToast });
      onClose();

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Try again.', { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 10000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package style={{ width: '24px', height: '24px', color: '#2563eb' }} />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Export Assets
              </h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                Generate optimized assets & reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#9ca3af';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            Select Formats
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {AVAILABLE_FORMATS.map(fmt => (
              <div 
                key={fmt.id}
                onClick={() => toggleFormat(fmt.id)}
                style={{
                  border: selectedFormats.includes(fmt.id) ? '2px solid #2563eb' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s',
                  backgroundColor: selectedFormats.includes(fmt.id) ? '#eff6ff' : 'white'
                }}
                onMouseEnter={(e) => {
                  if (!selectedFormats.includes(fmt.id)) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedFormats.includes(fmt.id)) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: '2px solid',
                  borderColor: selectedFormats.includes(fmt.id) ? '#2563eb' : '#d1d5db',
                  backgroundColor: selectedFormats.includes(fmt.id) ? '#2563eb' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {selectedFormats.includes(fmt.id) && <Check size={14} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {fmt.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {fmt.dims} px
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: 'white',
              color: '#4b5563',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || selectedFormats.length === 0}
            style={{
              flex: 2,
              padding: '10px 16px',
              backgroundColor: isExporting ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isExporting || selectedFormats.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s',
              opacity: isExporting || selectedFormats.length === 0 ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isExporting && selectedFormats.length > 0) {
                e.target.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isExporting && selectedFormats.length > 0) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
          >
            {isExporting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download size={18} />
                Download ZIP ({selectedFormats.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CanvasToolbar({ isReady }) {
  const { canvas, clearCanvas, undo, redo } = useCanvasStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  const handleDelete = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const handleClear = () => {
    if (!canvas) return;
    if (confirm('Clear entire canvas?')) {
      clearCanvas();
    }
  };

  const handleValidate = async () => {
    if (!canvas) return;

    setShowValidationModal(true);
    setIsValidating(true);

    try {
      // Extract creative data from canvas
      const objects = canvas.getObjects();
      const textElements = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
      const allText = textElements.map(obj => obj.text).join(' ');
      const sortedBySize = [...textElements].sort((a, b) => (b.fontSize || 16) - (a.fontSize || 16));

      const creativeData = {
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

      const response = await fetch('http://localhost:3000/api/validate/creative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creativeData }),
      });

      const data = await response.json();

      if (data.success) {
        setValidationResults(data.data);
        
        if (data.data.isCompliant) {
          toast.success(`✅ Compliant! Score: ${data.data.score}/100`);
        } else {
          toast.error(`⚠️ ${data.data.violations.length} issue(s) found`);
        }
      } else {
        throw new Error(data.error?.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <div className="canvas-toolbar">
        {/* Logo */}
        <div className="toolbar-logo">
          <div className="logo-icon">RF</div>
          <span className="logo-text">Retail Forge AI</span>
        </div>

        {/* Tools */}
        <div className="toolbar-tools">
          <Tooltip text="Undo (Ctrl+Z)">
            <button
              onClick={handleUndo}
              disabled={!isReady}
              className="toolbar-btn"
            >
              <Undo size={20} />
            </button>
          </Tooltip>

          <Tooltip text="Redo (Ctrl+Shift+Z)">
            <button
              onClick={handleRedo}
              disabled={!isReady}
              className="toolbar-btn"
            >
              <Redo size={20} />
            </button>
          </Tooltip>

          <div className="toolbar-divider" />

          <Tooltip text="Delete Selected (Del)">
            <button
              onClick={handleDelete}
              disabled={!isReady}
              className="toolbar-btn"
            >
              <Trash2 size={20} />
            </button>
          </Tooltip>

          <button
            onClick={handleClear}
            disabled={!isReady}
            className="toolbar-btn-text"
          >
            Clear Canvas
          </button>
        </div>

        {/* Spacer */}
        <div className="toolbar-spacer" />

        {/* Validate button */}
        <button
          onClick={handleValidate}
          disabled={!isReady}
          className="toolbar-export"
          style={{
            marginRight: '8px',
            backgroundColor: '#7c3aed'
          }}
          onMouseEnter={(e) => {
            if (!isReady) return;
            e.target.style.backgroundColor = '#6d28d9';
          }}
          onMouseLeave={(e) => {
            if (!isReady) return;
            e.target.style.backgroundColor = '#7c3aed';
          }}
        >
          <Shield size={18} />
          <span>Validate</span>
        </button>

        {/* Export button */}
        <button
          onClick={() => setShowExportModal(true)}
          disabled={!isReady}
          className="toolbar-export"
        >
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        canvas={canvas}
      />

      {/* Validation Modal */}
      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        validationResults={validationResults}
        isValidating={isValidating}
      />

      {/* Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}

export default CanvasToolbar;