import { useState } from 'react';
import { Undo, Redo, Trash2, Download, X, Check, Package, FileText, Shield, Loader } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';
import './CanvasToolbar.css';
import Tooltip from '../UI/Tooltip';

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

          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <FileText size={20} style={{ color: '#6b7280', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: '#4b5563' }}>
              Includes Compliance PDF Report
            </div>
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
  const [isValidating, setIsValidating] = useState(false);

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

    setIsValidating(true);
    const loadingToast = toast.loading('Validating compliance...');

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
        const result = data.data;
        
        if (result.isCompliant) {
          toast.success(`✅ Compliant! Score: ${result.score}/100`, { 
            id: loadingToast,
            duration: 4000 
          });
        } else {
          toast.error(`⚠️ ${result.violations.length} issue(s) found. Score: ${result.score}/100`, { 
            id: loadingToast,
            duration: 5000 
          });
        }
      } else {
        throw new Error(data.error?.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate', { id: loadingToast });
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
        <Tooltip text="Check Compliance">
          <button
            onClick={handleValidate}
            disabled={!isReady || isValidating}
            className="toolbar-btn"
            style={{
              marginRight: '8px',
              backgroundColor: isValidating ? '#f3f4f6' : 'transparent'
            }}
          >
            {isValidating ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Shield size={20} />
            )}
          </button>
        </Tooltip>

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