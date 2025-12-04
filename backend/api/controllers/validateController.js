// backend/api/controllers/validateController.js
import ruleEngine from '../../ai-engine/compliance/ruleEngine.js';
import logger from '../../utils/logger.js';

/**
 * Validate creative against all compliance rules
 */
export async function validateCreative(req, res) {
  const startTime = Date.now();

  try {
    const { creativeData } = req.body;

    if (!creativeData) {
      return res.status(400).json({
        success: false,
        error: { message: 'creativeData is required' },
      });
    }

    logger.info('Validating creative', { format: creativeData.format });

    // Run validation
    // FIX: Added 'await' here because validateAll is asynchronous
    const results = await ruleEngine.validateAll(creativeData);

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        ...results,
        totalProcessingTimeMs: processingTime,
      },
    });
  } catch (error) {
    logger.error('Validation failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
}

/**
 * Get all available compliance rules
 */
export async function getRules(req, res) {
  try {
    const rules = ruleEngine.rules.map(rule => ({
      ruleId: rule.ruleId,
      name: rule.name,
      category: rule.category,
      severity: rule.severity,
    }));

    res.json({
      success: true,
      data: {
        rules,
        totalRules: rules.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get rules', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
}

/**
 * Get rules by category
 */
export async function getRulesByCategory(req, res) {
  try {
    const { category } = req.params;
    const rules = ruleEngine.getRulesByCategory(category);

    res.json({
      success: true,
      data: {
        category,
        rules: rules.map(r => ({
          ruleId: r.ruleId,
          name: r.name,
          severity: r.severity,
        })),
      },
    });
  } catch (error) {
    logger.error('Failed to get rules by category', error);
    res.status(500).json({
      success: false,
      error: { message: error.message },
    });
  }
}