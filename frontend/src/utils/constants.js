export const CANVAS_CONFIG = {
  WIDTH: 1080,
  HEIGHT: 1080,
  BACKGROUND_COLOR: '#ffffff',
};

export const EXPORT_FORMATS = {
  INSTAGRAM_POST: { width: 1080, height: 1080, name: 'Instagram Post' },
  FACEBOOK_FEED: { width: 1200, height: 628, name: 'Facebook Feed' },
  INSTAGRAM_STORY: { width: 1080, height: 1920, name: 'Instagram Story' },
  INSTORE_DISPLAY: { width: 1920, height: 1080, name: 'In-Store Display' },
};

export const COMPLIANCE_RULES = {
  MIN_FONT_SIZE: 20,
  MAX_FILE_SIZE_KB: 500,
  SAFE_ZONE_TOP: 200,
  SAFE_ZONE_BOTTOM: 250,
  MIN_PACKSHOT_SPACING: 24,
  MAX_PACKSHOTS: 3,
};

export const API_ENDPOINTS = {
  UPLOAD: '/upload',
  REMOVE_BG: '/remove-background',
  EXTRACT_COLORS: '/extract-colors',
  SUGGEST_LAYOUTS: '/suggest-layouts',
  GENERATE_COPY: '/generate-copy',
  VALIDATE: '/validate',
  EXPORT: '/export',
};