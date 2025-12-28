// frontend/src/utils/apiConfig.js - CENTRALIZED API CONFIGURATION
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
};

export const getImageServiceUrl = () => {
  return import.meta.env.VITE_IMAGE_SERVICE_URL || 'http://localhost:8000';
};

export const getBertServiceUrl = () => {
  return import.meta.env.VITE_BERT_SERVICE_URL || 'http://localhost:8001';
};

export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  const apiPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/api${apiPath}`;
};

export const buildImageServiceUrl = (endpoint) => {
  const baseUrl = getImageServiceUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

export const logApiConfig = () => {
  console.log('🔧 API Configuration:');
  console.log('  Backend API:', getApiBaseUrl());
  console.log('  Image Service:', getImageServiceUrl());
  console.log('  BERT Service:', getBertServiceUrl());
  console.log('  Environment:', import.meta.env.MODE);
};

export default {
  getApiBaseUrl,
  getImageServiceUrl,
  getBertServiceUrl,
  buildApiUrl,
  buildImageServiceUrl,
  logApiConfig
};