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

    // Forward to Python image service
    const formData = new FormData();
    formData.append('file', createReadStream(req.file.path), req.file.originalname);
    formData.append('method', req.body.method || 'sam');

    const response = await axios.post(
      `${IMAGE_SERVICE_URL}/process/remove-background`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 1200000, // 120 second timeout (SAM is slow)
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    // Get the processed file URL
    const downloadUrl = `${IMAGE_SERVICE_URL}${response.data.download_url}`;
    
    const processingTime = Date.now() - startTime;
    
    logger.info('Background removed successfully', {
      fileId: response.data.file_id,
      method: req.body.method || 'sam',
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