import { useState, useEffect } from 'react';
import UploadZone from './UploadZone';
import FilePreview from './FilePreview';
import toast from 'react-hot-toast';

function ImageUpload({ onUploadComplete, imageType = 'packshot', maxUploads = null }) {
  const [files, setFiles] = useState([]);
  const [uploadCount, setUploadCount] = useState(0);

  // Load existing count from localStorage for packshots
  useEffect(() => {
    if (imageType === 'packshot') {
      const stored = JSON.parse(localStorage.getItem('uploaded_images') || '[]');
      const packshots = stored.filter(img => img.imageType === 'packshot');
      setUploadCount(packshots.length);
    }
  }, [imageType]);

  const handleUpload = async (newFiles) => {
    // Check packshot limit BEFORE upload
    if (imageType === 'packshot' && maxUploads) {
      const remainingSlots = maxUploads - uploadCount;
      if (newFiles.length > remainingSlots) {
        toast.error(`Maximum ${maxUploads} packshots allowed. You have ${remainingSlots} slots remaining.`);
        // Only take the files that fit
        newFiles = newFiles.slice(0, remainingSlots);
        if (newFiles.length === 0) return;
      }
    }

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

        // Determine if this is the lead packshot
        const storedImages = JSON.parse(localStorage.getItem('uploaded_images') || '[]');
        const existingPackshots = storedImages.filter(img => img.imageType === 'packshot');
        const isLead = imageType === 'packshot' && existingPackshots.length === 0;

        // Create upload data with base64
        const uploadData = {
          imageId: fileData.id,
          url: base64,
          width: 800,
          height: 600,
          imageType: imageType, // 'packshot', 'logo', 'background'
          isLead: isLead, // First packshot is automatically lead
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
          storedImages.push(uploadData);
          localStorage.setItem('uploaded_images', JSON.stringify(storedImages));
          console.log(`✅ Saved ${imageType} to localStorage:`, uploadData.filename, isLead ? '(LEAD)' : '');
          
          // Update count
          if (imageType === 'packshot') {
            setUploadCount(prev => prev + 1);
          }
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

  // Calculate if upload should be disabled
  const isUploadDisabled = imageType === 'packshot' && maxUploads && uploadCount >= maxUploads;

  return (
    <div className="space-y-4">
      {/* Packshot Counter */}
      {imageType === 'packshot' && maxUploads && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: uploadCount >= maxUploads ? '#fee2e2' : '#eff6ff',
          border: `1px solid ${uploadCount >= maxUploads ? '#fca5a5' : '#bfdbfe'}`,
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '500',
          color: uploadCount >= maxUploads ? '#991b1b' : '#1e40af',
          textAlign: 'center'
        }}>
          {uploadCount >= maxUploads ? (
            <span>⚠️ Maximum {maxUploads} packshots reached</span>
          ) : (
            <span>📦 {uploadCount}/{maxUploads} packshots used</span>
          )}
        </div>
      )}

      <UploadZone 
        onUpload={handleUpload} 
        maxSize={10}
        disabled={isUploadDisabled}
      />

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
              isLead={fileData.uploadData?.isLead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;