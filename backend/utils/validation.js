export const validateImage = (file) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP allowed');
  }

  return true;
};

export const validateCreativeData = (data) => {
  if (!data.elements || !Array.isArray(data.elements)) {
    throw new Error('Invalid creative data: elements array required');
  }

  if (!data.format) {
    throw new Error('Invalid creative data: format required');
  }

  return true;
};