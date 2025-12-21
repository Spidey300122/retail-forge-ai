import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

function UploadZone({ onUpload, accept = 'image/*', maxSize = 10, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    if (disabled) return;
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }

      // Check file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSize) {
        alert(`${file.name} is too large (max ${maxSize}MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${disabled 
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
          : isDragging
            ? 'border-blue-500 bg-blue-50 cursor-pointer'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          {isDragging && !disabled ? (
            <Upload className="text-blue-500" size={32} />
          ) : (
            <ImageIcon className={disabled ? "text-gray-300" : "text-gray-400"} size={32} />
          )}
        </div>

        <div>
          <p className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {disabled 
              ? 'Upload limit reached'
              : isDragging 
                ? 'Drop files here' 
                : 'Click or drag images here'
            }
          </p>
          {!disabled && (
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, WEBP up to {maxSize}MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadZone;