import { useState } from 'react';
import { Download, Check, FileText, Package } from 'lucide-react';
import useCanvasStore from '../../store/canvasStore';
import toast from 'react-hot-toast';
import './ExportPanel.css';
import { buildApiUrl } from '../../utils/apiConfig';

const AVAILABLE_FORMATS = [
  { id: 'instagram_post', name: 'Instagram Post', dims: '1080 x 1080' },
  { id: 'facebook_feed', name: 'Facebook Feed', dims: '1200 x 628' },
  { id: 'instagram_story', name: 'Instagram Story', dims: '1080 x 1920' },
  { id: 'instore_display', name: 'In-Store Display', dims: '1920 x 1080' },
];

function ExportPanel() {
  const { canvas } = useCanvasStore();
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
      // 1. Get high-quality base image from canvas
      // Multiplier 2 ensures good quality for resizing on backend
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 2, 
        quality: 1
      });

      // Convert Base64 to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // 2. Prepare Form Data
      const formData = new FormData();
      formData.append('image', blob, 'master.png');
      formData.append('formats', JSON.stringify(selectedFormats));
      
      // Mock compliance data (replace with actual store data if available)
      const complianceData = {
        isCompliant: true,
        score: 95,
        violations: [],
        warnings: [{ message: 'Check contrast on dark screens' }]
      };
      formData.append('complianceData', JSON.stringify(complianceData));

      // 3. Send to Backend - FIXED: Use buildApiUrl
      const response = await fetch(buildApiUrl('/export'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Export failed');

      // 4. Handle Download
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

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Try again.', { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h3>
          <Package size={20} className="text-blue-600" />
          Export Assets
        </h3>
        <p className="export-subtitle">
          Generate resize-optimised assets & reports
        </p>
      </div>

      <div className="formats-grid">
        {AVAILABLE_FORMATS.map(fmt => (
          <div 
            key={fmt.id}
            className={`format-card ${selectedFormats.includes(fmt.id) ? 'selected' : ''}`}
            onClick={() => toggleFormat(fmt.id)}
          >
            <div className="format-checkbox">
              {selectedFormats.includes(fmt.id) && <Check size={14} />}
            </div>
            <div className="format-info">
              <div className="format-name">{fmt.name}</div>
              <div className="format-dims">{fmt.dims} px</div>
            </div>
          </div>
        ))}
      </div>

      <div className="export-preview">
        <div className="download-info">
          <FileText size={14} />
          Includes Compliance PDF Report
        </div>
      </div>

      <button 
        className="export-btn"
        onClick={handleExport}
        disabled={isExporting || !canvas}
      >
        {isExporting ? (
          'Processing...'
        ) : (
          <>
            <Download size={18} />
            Download ZIP
          </>
        )}
      </button>
    </div>
  );
}

export default ExportPanel;