import { X, Check, Loader, Crown } from 'lucide-react';

function FilePreview({ file, preview, status, onRemove, isLead = false }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Loader className="animate-spin text-blue-500" size={20} />;
      case 'success':
        return <Check className="text-green-500" size={20} />;
      case 'error':
        return <X className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'border-blue-300 bg-blue-50';
      case 'success':
        return 'border-green-300 bg-green-50';
      case 'error':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-3 relative ${getStatusColor()}`}>
      {/* Lead Badge */}
      {isLead && (
        <div 
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#fbbf24',
            color: '#78350f',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
        >
          <Crown size={12} />
          LEAD
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Preview */}
        <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
          {preview ? (
            <img src={preview} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader className="animate-spin text-gray-400" size={24} />
            </div>
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>

        {/* Status icon */}
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>

        {/* Remove button */}
        {status !== 'uploading' && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default FilePreview;