// backend/api/controllers/completeAdController.js - NEW FILE
import * as creativeDirector from '../../ai-engine/agents/creativeDirector.js';
import * as complianceOfficer from '../../ai-engine/agents/complianceOfficer.js';
import logger from '../../utils/logger.js';
import axios from 'axios';
import FormData from 'form-data';

/**
 * Generate a complete ad: Background + Layout + Copy
 */
export async function generateCompleteAd(req, res) {
  const startTime = Date.now();
  
  try {
    const { 
      productImageUrl, 
      productName, 
      category, 
      style,
      description 
    } = req.body;
    
    // Validation
    if (!productImageUrl) {
      return res.status(400).json({
        success: false,
        error: { message: 'Product image URL is required' }
      });
    }

    logger.info('Generating complete ad', { 
      productName, 
      category, 
      style 
    });

    const results = {
      background: null,
      layout: null,
      copy: null,
      processingSteps: []
    };

    // Step 1: Generate Background
    try {
      logger.info('Step 1: Generating background');
      const backgroundPrompt = `${style || 'modern'} background for ${category || 'product'} advertisement, professional, high quality, suitable for retail`;
      
      const formData = new FormData();
      formData.append('prompt', backgroundPrompt);
      formData.append('style', style || 'professional');
      formData.append('width', 1080);
      formData.append('height', 1080);

      const bgResponse = await axios.post(
        'http://localhost:8000/process/generate-background',
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 60000
        }
      );

      if (bgResponse.data.success) {
        results.background = {
          url: `http://localhost:8000${bgResponse.data.download_url}`,
          metadata: bgResponse.data.metadata
        };
        results.processingSteps.push({ step: 'background', success: true });
      }
    } catch (bgError) {
      logger.warn('Background generation failed', bgError);
      results.processingSteps.push({ step: 'background', success: false, error: bgError.message });
    }

    // Step 2: Generate Layout
    try {
      logger.info('Step 2: Generating layout suggestions');
      const layoutSuggestions = await creativeDirector.suggestLayouts(
        productImageUrl,
        category || 'general',
        style || 'modern'
      );

      results.layout = layoutSuggestions.layouts;
      results.processingSteps.push({ step: 'layout', success: true, count: layoutSuggestions.layouts.length });
    } catch (layoutError) {
      logger.warn('Layout generation failed', layoutError);
      results.processingSteps.push({ step: 'layout', success: false, error: layoutError.message });
    }

    // Step 3: Generate Copy
    try {
      logger.info('Step 3: Generating copy');
      const copySuggestions = await complianceOfficer.generateCopy(
        {
          name: productName || 'Product',
          category: category || 'general',
          features: [],
          audience: 'general consumers'
        },
        style || 'energetic'
      );

      results.copy = copySuggestions;
      results.processingSteps.push({ step: 'copy', success: true, count: copySuggestions.length });
    } catch (copyError) {
      logger.warn('Copy generation failed', copyError);
      results.processingSteps.push({ step: 'copy', success: false, error: copyError.message });
    }

    const processingTime = Date.now() - startTime;
    
    // Determine overall success
    const successfulSteps = results.processingSteps.filter(s => s.success).length;
    const totalSteps = results.processingSteps.length;
    
    logger.info('Complete ad generation finished', { 
      successfulSteps, 
      totalSteps,
      processingTime 
    });

    res.json({
      success: successfulSteps > 0, // Success if at least one step succeeded
      data: {
        ...results,
        summary: {
          successfulSteps,
          totalSteps,
          processingTimeMs: processingTime
        }
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('Complete ad generation failed', error);
    res.status(500).json({
      success: false,
      error: { 
        message: error.message,
        processingTimeMs: processingTime
      }
    });
  }
}

export default {
  generateCompleteAd
};