import * as creativeDirector from '../../ai-engine/agents/creativeDirector.js';
import * as complianceOfficer from '../../ai-engine/agents/complianceOfficer.js';
import { logAIInteraction } from '../../db/queries.js';
import logger from '../../utils/logger.js';

/**
 * Suggest layouts using GPT-4 Vision
 */
export async function suggestLayouts(req, res) {
  const startTime = Date.now();
  
  try {
    const { productImageUrl, category, style = 'modern' } = req.body;
    
    // Validation
    if (!productImageUrl || !category) {
      return res.status(400).json({
        success: false,
        error: { message: 'productImageUrl and category are required' }
      });
    }

    logger.info('Requesting layout suggestions', { category, style });

    // Call GPT-4 Vision
    const suggestions = await creativeDirector.suggestLayouts(
      productImageUrl, 
      category, 
      style
    );
    
    const processingTime = Date.now() - startTime;
    
    // Log interaction
    await logAIInteraction({
      userId: req.body.userId || 1,
      creativeId: req.body.creativeId || null,
      agentType: 'creative_director',
      requestData: { productImageUrl, category, style },
      responseData: suggestions,
      processingTimeMs: processingTime,
      status: 'success'
    });
    
    res.json({
      success: true,
      data: {
        suggestions,
        processingTimeMs: processingTime
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    await logAIInteraction({
      userId: req.body.userId || 1,
      creativeId: null,
      agentType: 'creative_director',
      requestData: req.body,
      responseData: null,
      processingTimeMs: processingTime,
      status: 'error',
      errorMessage: error.message
    });
    
    logger.error('Layout suggestion failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}

/**
 * Generate copy variations
 */
export async function generateCopy(req, res) {
  const startTime = Date.now();
  
  try {
    const { productInfo, style = 'energetic' } = req.body;
    
    if (!productInfo || !productInfo.name || !productInfo.category) {
      return res.status(400).json({
        success: false,
        error: { message: 'productInfo with name and category required' }
      });
    }
    
    const suggestions = await complianceOfficer.generateCopy(productInfo, style);
    
    const processingTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        suggestions,
        processingTimeMs: processingTime
      }
    });
  } catch (error) {
    logger.error('Copy generation failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}