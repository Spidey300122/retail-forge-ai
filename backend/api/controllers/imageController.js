import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import logger from '../../utils/logger.js';

const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL || 'http://localhost:8000';

/**
 * Remove background from image
 */
export async function removeBackground(req, res) {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }

    logger.info('Removing background from image', { 
      filename: req.file.originalname,
      size: req.file.size,
      method: req.body.method || 'sam'
    });

    const formData = new FormData();
    formData.append('file', createReadStream(req.file.path), req.file.originalname);
    formData.append('method', req.body.method || 'sam');

    const response = await axios.post(
      `${IMAGE_SERVICE_URL}/process/remove-background`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 1200000, // 120 second timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const downloadUrl = `${IMAGE_SERVICE_URL}${response.data.download_url}`;
    const processingTime = Date.now() - startTime;
    
    logger.info('Background removed successfully', {
      fileId: response.data.file_id,
      processingTimeMs: processingTime
    });

    res.json({
      success: true,
      data: {
        ...response.data,
        downloadUrl,
        processingTimeMs: processingTime
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Background removal failed', {
      error: error.message,
      processingTimeMs: processingTime
    });
    res.status(500).json({
      success: false,
      error: { 
        message: error.response?.data?.detail || error.message,
        processingTimeMs: processingTime
      }
    });
  }
}

/**
 * Extract colors from image
 */
export async function extractColors(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }

    logger.info('Extracting colors', { filename: req.file.originalname });

    const formData = new FormData();
    formData.append('file', createReadStream(req.file.path), req.file.originalname);
    formData.append('count', req.body.count || 5);

    const response = await axios.post(
      `${IMAGE_SERVICE_URL}/process/extract-colors`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000
      }
    );

    logger.info('Colors extracted', { count: response.data.colors?.length });

    res.json(response.data);
  } catch (error) {
    logger.error('Color extraction failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.response?.data?.detail || error.message }
    });
  }
}

/**
 * Optimize image
 */
export async function optimizeImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }

    const targetSize = parseInt(req.body.target_size_kb) || 500;
    const format = req.body.format || 'JPEG';

    logger.info('Optimizing image', { 
      filename: req.file.originalname,
      targetSize,
      format
    });

    const formData = new FormData();
    formData.append('file', createReadStream(req.file.path), req.file.originalname);
    formData.append('target_size_kb', targetSize);
    formData.append('format', format);

    const response = await axios.post(
      `${IMAGE_SERVICE_URL}/process/optimize`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000
      }
    );

    const downloadUrl = `${IMAGE_SERVICE_URL}${response.data.download_url}`;

    logger.info('Image optimized', { 
      sizeKB: response.data.size_kb,
      quality: response.data.quality
    });

    res.json({
      ...response.data,
      downloadUrl
    });
  } catch (error) {
    logger.error('Image optimization failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.response?.data?.detail || error.message }
    });
  }
}

/**
 * Generate Background (New - Proxy to Python Service)
 */
export async function generateBackground(req, res) {
  const startTime = Date.now();
  try {
    const { prompt, style, width, height } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, error: { message: 'Prompt is required' } });
    }

    logger.info('Generating background via Python service', { prompt, style });

    // Forward as form-data since Python endpoint expects it
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('style', style || 'professional');
    formData.append('width', width || 1024);
    formData.append('height', height || 1024);

    const response = await axios.post(
      `${IMAGE_SERVICE_URL}/process/generate-background`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000 // 60s timeout
      }
    );

    const processingTime = Date.now() - startTime;
    
    // Proxy the response back
    // NOTE: download_url in response is relative to python service. 
    // In a real deploy, we'd rewrite it. For local dev, we assume client can reach localhost:8000
    // or we should really proxy the download too.
    
    res.json({
      success: true,
      data: response.data,
      processingTimeMs: processingTime
    });

  } catch (error) {
    logger.error('Background generation failed', error);
    res.status(500).json({
      success: false,
      error: { 
        message: error.response?.data?.detail || error.message 
      }
    });
  }
}