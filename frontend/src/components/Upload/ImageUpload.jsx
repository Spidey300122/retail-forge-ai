import { useState } from 'react';
import UploadZone from './UploadZone';
import FilePreview from './FilePreview';

function ImageUpload({ onUploadComplete, type = 'product' }) {
  const [files, setFiles] = useState([]);

  const handleUpload = async (newFiles) => {
    // Add files to state with initial status
    const filesWithStatus = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      id: Math.random().toString(36).substr(2, 9),
    }));

    setFiles(prev => [...prev, ...filesWithStatus]);

    // Process each file
    for (const fileData of filesWithStatus) {
      try {
        // Convert file to base64 for persistent storage
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(fileData.file);
        });

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create upload data with base64
        const uploadData = {
          imageId: fileData.id,
          url: base64, // Store base64 instead of blob URL
          width: 800,
          height: 600,
          type: type,
          filename: fileData.file.name
        };

        // Update status to success
        setFiles(prev =>
          prev.map(f =>
            f.id === fileData.id
              ? { ...f, status: 'success', uploadData }
              : f
          )
        );

        // ⭐ SAVE TO LOCALSTORAGE
        try {
          const storedImages = JSON.parse(localStorage.getItem('uploaded_images') || '[]');
          storedImages.push(uploadData);
          localStorage.setItem('uploaded_images', JSON.stringify(storedImages));
          console.log('✅ Saved to localStorage:', uploadData.filename);
        } catch (err) {
          console.error('Failed to save to localStorage:', err);
        }

        // Callback with upload data (use blob URL for canvas)
        if (onUploadComplete) {
          onUploadComplete({
            ...uploadData,
            url: fileData.preview // Use blob URL for immediate canvas display
          });
        }
      } catch (error) {
        console.error('Upload failed:', error);
        
        // Update status to error
        setFiles(prev =>
          prev.map(f =>
            f.id === fileData.id
              ? { ...f, status: 'error', error: error.message }
              : f
          )
        );
      }
    }
  };

  const handleRemove = (id) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  return (
    <div className="space-y-4">
      <UploadZone onUpload={handleUpload} maxSize={10} />

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {files.map(fileData => (
            <FilePreview
              key={fileData.id}
              file={fileData.file}
              preview={fileData.preview}
              status={fileData.status}
              onRemove={() => handleRemove(fileData.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;