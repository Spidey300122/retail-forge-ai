import orchestrator from '../../ai-engine/orchestrator.js';
import logger from '../../utils/logger.js';

/**
 * Process creative request with AI orchestration
 */
export async function processCreativeRequest(req, res) {
  const startTime = Date.now();

  try {
    const { userInput, productImageUrl, productInfo, creativeData } = req.body;

    if (!userInput && !productImageUrl && !productInfo) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide user input, product image, or product info' },
      });
    }

    logger.info('Processing orchestrated creative request', {
      hasInput: !!userInput,
      hasImage: !!productImageUrl,
      hasProductInfo: !!productInfo,
    });

    const result = await orchestrator.processCreativeRequest({
      userInput,
      productImageUrl,
      productInfo,
      creativeData,
    });

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        ...result,
        processingTimeMs: processingTime,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error('Orchestrated request failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
      processingTimeMs: processingTime,
    });
  }
}

/**
 * Get improvement suggestions for creative
 */
export async function suggestImprovements(req, res) {
  try {
    const { creativeData } = req.body;

    if (!creativeData) {
      return res.status(400).json({
        success: false,
        error: { message: 'Creative data is required' },
      });
    }

    const suggestions = await orchestrator.suggestImprovements(creativeData);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('Improvement suggestions failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
}

/**
 * Generate complete creative package
 */
export async function generateCompleteCreative(req, res) {
  try {
    const { productImageUrl, productInfo, category, style } = req.body;

    if (!productImageUrl && !productInfo) {
      return res.status(400).json({
        success: false,
        error: { message: 'Product image or info required' },
      });
    }

    const result = await orchestrator.generateCompleteCreative({
      productImageUrl,
      productInfo,
      category,
      style,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Complete creative generation failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
}