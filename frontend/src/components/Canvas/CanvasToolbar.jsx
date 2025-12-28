// frontend/src/components/Canvas/CanvasToolbar.jsx - FIXED VERSION
import { useState } from 'react';
import { Undo, Redo, Trash2, Download, X, Check, Shield, Loader, AlertCircle, Info, CheckCircle, Lightbulb } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';
import './CanvasToolbar.css';
import Tooltip from '../UI/Tooltip';
import FormatSelector from './FormatSelector';
import { buildApiUrl } from '../../utils/apiConfig';

// Validation Modal Component (unchanged)
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

function CanvasToolbar({ isReady, onDimensionsChange }) {
  const { canvas, clearCanvas, undo, redo } = useCanvasStore();
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

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

      // FIXED: Use buildApiUrl instead of hardcoded localhost
      const response = await fetch(buildApiUrl('/validate/creative'), {
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

  // ENHANCED EXPORT - ZIP with PDF, PNG, and JPEG
  const handleExport = async () => {
    if (!canvas) return;

    setIsExporting(true);
    const loadingToast = toast.loading('Generating export package...');

    try {
      // Step 1: Get canvas data as PNG
      toast.loading('Capturing canvas...', { id: loadingToast });
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 2, 
        quality: 1
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // Step 2: Get validation data
      toast.loading('Running compliance check...', { id: loadingToast });
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

      // Validate
      let complianceData = null;
      try {
        // FIXED: Use buildApiUrl instead of hardcoded localhost
        const validateResponse = await fetch(buildApiUrl('/validate/creative'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creativeData }),
        });

        const validateResult = await validateResponse.json();
        if (validateResult.success) {
          complianceData = validateResult.data;
        }
      } catch (validateError) {
        console.warn('Validation failed, proceeding without compliance data:', validateError);
      }

      // Step 3: Send to export endpoint
      toast.loading('Packaging files (PNG + JPEG + PDF)...', { id: loadingToast });
      const formData = new FormData();
      formData.append('image', blob, 'creative.png');
      formData.append('canvasSize', `${canvas.width}x${canvas.height}`);
      
      if (complianceData) {
        formData.append('complianceData', JSON.stringify(complianceData));
      }

      // FIXED: Use buildApiUrl instead of hardcoded localhost
      const exportResponse = await fetch(buildApiUrl('/export'), {
        method: 'POST',
        body: formData,
      });

      if (!exportResponse.ok) {
        const errorText = await exportResponse.text();
        throw new Error(`Export failed: ${errorText}`);
      }

      // Step 4: Download ZIP
      const zipBlob = await exportResponse.blob();
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `retail_forge_export_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('✅ Export complete! (PNG + JPEG + PDF)', { id: loadingToast });

    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`, { id: loadingToast });
    } finally {
      setIsExporting(false);
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

        {/* Format Selector Dropdown - MOVED HERE */}
        {isReady && (
          <div style={{ marginRight: '12px' }}>
            <FormatSelector onDimensionsChange={onDimensionsChange} />
          </div>
        )}

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

        {/* Export button - ENHANCED */}
        <button
          onClick={handleExport}
          disabled={!isReady || isExporting}
          className="toolbar-export"
        >
          {isExporting ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Export</span>
            </>
          )}
        </button>
      </div>

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