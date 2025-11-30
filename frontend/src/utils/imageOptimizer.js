/**
 * Optimize image before adding to canvas
 */
export async function optimizeImageForCanvas(imageUrl, maxSize = 2000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Check if resize needed
      if (img.width <= maxSize && img.height <= maxSize) {
        resolve(imageUrl);
        return;
      }
      
      console.log(`🔧 Optimizing large image: ${img.width}x${img.height}`);
      
      // Calculate new dimensions
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      const newWidth = Math.floor(img.width * scale);
      const newHeight = Math.floor(img.height * scale);
      
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Return optimized data URL
      const optimized = canvas.toDataURL('image/jpeg', 0.9);
      console.log(`✅ Optimized to: ${newWidth}x${newHeight}`);
      resolve(optimized);
    };
    
    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * Get image file size in KB
 */
export function getImageSizeKB(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const bytes = atob(base64).length;
  return Math.round(bytes / 1024);
}