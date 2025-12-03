import * as creativeDirector from './agents/creativeDirector.js';
import * as complianceOfficer from './agents/complianceOfficer.js';
import logger from '../utils/logger.js';

/**
 * AI Agent Orchestrator
 * Coordinates multiple AI agents to work together
 */
class AIOrchestrator {
  constructor() {
    this.agents = {
      creative: creativeDirector,
      compliance: complianceOfficer,
    };
    logger.info('AI Orchestrator initialized');
  }

  /**
   * Analyze user intent from natural language input
   */
  async analyzeIntent(userInput) {
    try {
      logger.info('Analyzing user intent', { input: userInput });

      // Simple keyword-based intent detection
      const intent = {
        needsLayout: /layout|design|arrange|position/i.test(userInput),
        needsCopy: /copy|text|headline|write|content/i.test(userInput),
        needsBackground: /background|backdrop|bg/i.test(userInput),
        needsCompliance: /check|validate|compliant|rules/i.test(userInput),
        category: this.detectCategory(userInput),
        style: this.detectStyle(userInput),
      };

      logger.info('Intent analyzed', intent);
      return intent;
    } catch (error) {
      logger.error('Intent analysis failed', error);
      throw error;
    }
  }

  /**
   * Detect product category from input
   */
  detectCategory(input) {
    const categories = {
      beverages: /drink|juice|soda|beverage|water|coffee|tea/i,
      food: /food|snack|meal|eat|bread|cheese/i,
      beauty: /beauty|makeup|cosmetic|skincare|lotion/i,
      electronics: /electronic|phone|laptop|tech|gadget/i,
      fashion: /fashion|clothing|apparel|shirt|dress/i,
    };

    for (const [category, regex] of Object.entries(categories)) {
      if (regex.test(input)) return category;
    }

    return 'general';
  }

  /**
   * Detect style preference from input
   */
  detectStyle(input) {
    const styles = {
      modern: /modern|contemporary|sleek/i,
      minimal: /minimal|simple|clean/i,
      vibrant: /vibrant|colorful|bold/i,
      elegant: /elegant|sophisticated|classy/i,
      playful: /playful|fun|casual/i,
    };

    for (const [style, regex] of Object.entries(styles)) {
      if (regex.test(input)) return style;
    }

    return 'modern';
  }

  /**
   * Process creative request with multiple agents
   */
  async processCreativeRequest(request) {
    try {
      logger.info('Processing creative request', { request });

      const results = {
        intent: null,
        layouts: null,
        copy: null,
        compliance: null,
        recommendations: [],
      };

      // Step 1: Analyze intent
      results.intent = await this.analyzeIntent(request.userInput || '');

      // Step 2: Generate layouts if needed
      if (results.intent.needsLayout && request.productImageUrl) {
        try {
          const layoutResult = await creativeDirector.suggestLayouts(
            request.productImageUrl,
            results.intent.category,
            results.intent.style
          );
          results.layouts = layoutResult.layouts;
          results.recommendations.push({
            type: 'layout',
            message: `Generated ${layoutResult.layouts.length} layout options`,
          });
        } catch (error) {
          logger.warn('Layout generation failed', error);
          results.recommendations.push({
            type: 'warning',
            message: 'Could not generate layouts. Please check image URL.',
          });
        }
      }

      // Step 3: Generate copy if needed
      if (results.intent.needsCopy && request.productInfo) {
        try {
          const copyResult = await complianceOfficer.generateCopy(
            request.productInfo,
            results.intent.style || 'energetic'
          );
          results.copy = copyResult;
          results.recommendations.push({
            type: 'copy',
            message: `Generated ${copyResult.length} copy variations`,
          });
        } catch (error) {
          logger.warn('Copy generation failed', error);
          results.recommendations.push({
            type: 'warning',
            message: 'Could not generate copy. Please provide product details.',
          });
        }
      }

      // Step 4: Validate compliance if content exists
      if (request.creativeData) {
        try {
          const complianceResult = await this.validateCompliance(request.creativeData);
          results.compliance = complianceResult;
          
          if (!complianceResult.isCompliant) {
            results.recommendations.push({
              type: 'compliance',
              message: `Found ${complianceResult.violations.length} compliance issues`,
              violations: complianceResult.violations,
            });
          }
        } catch (error) {
          logger.warn('Compliance check failed', error);
        }
      }

      logger.info('Creative request processed', { 
        hasLayouts: !!results.layouts,
        hasCopy: !!results.copy,
        recommendations: results.recommendations.length 
      });

      return results;
    } catch (error) {
      logger.error('Creative request processing failed', error);
      throw error;
    }
  }

  /**
   * Validate compliance for creative data
   */
  async validateCompliance(creativeData) {
    try {
      const violations = [];
      const warnings = [];

      // Check text content if exists
      if (creativeData.text) {
        const textValidation = await complianceOfficer.validateCopy(creativeData.text);
        
        if (!textValidation.isCompliant) {
          violations.push(...textValidation.violations);
        }
      }

      // Check font size
      if (creativeData.fontSize && creativeData.fontSize < 20) {
        violations.push({
          type: 'min_font_size',
          severity: 'error',
          message: 'Font size must be at least 20px',
          suggestion: 'Increase font size to 20px or larger',
        });
      }

      return {
        isCompliant: violations.length === 0,
        violations,
        warnings,
        score: violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 20),
      };
    } catch (error) {
      logger.error('Compliance validation failed', error);
      throw error;
    }
  }

  /**
   * Suggest improvements for existing creative
   */
  async suggestImprovements(creativeData) {
    try {
      logger.info('Analyzing creative for improvements');

      const suggestions = [];

      // Check image quality
      if (creativeData.images) {
        creativeData.images.forEach((img, index) => {
          if (img.width < 800 || img.height < 800) {
            suggestions.push({
              type: 'quality',
              element: `image_${index}`,
              message: 'Image resolution is low. Use higher quality images for better results.',
            });
          }
        });
      }

      // Check text readability
      if (creativeData.elements) {
        creativeData.elements.forEach((el, index) => {
          if (el.type === 'text' && el.fontSize < 24) {
            suggestions.push({
              type: 'readability',
              element: `text_${index}`,
              message: `Consider increasing font size to 24px for better readability.`,
            });
          }
        });
      }

      // Check color contrast
      if (creativeData.backgroundColor && creativeData.textColor) {
        const contrast = this.calculateContrast(
          creativeData.backgroundColor,
          creativeData.textColor
        );
        
        if (contrast < 4.5) {
          suggestions.push({
            type: 'contrast',
            message: 'Text color contrast is low. Improve contrast for better accessibility.',
            currentContrast: contrast.toFixed(2),
            minimumRequired: 4.5,
          });
        }
      }

      logger.info('Improvement suggestions generated', { count: suggestions.length });

      return {
        suggestions,
        overallScore: Math.max(0, 100 - suggestions.length * 10),
      };
    } catch (error) {
      logger.error('Improvement analysis failed', error);
      throw error;
    }
  }

  /**
   * Calculate WCAG color contrast ratio
   */
  calculateContrast(color1, color2) {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;

      const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Generate complete creative package
   */
  async generateCompleteCreative(request) {
    try {
      logger.info('Generating complete creative package');

      const startTime = Date.now();

      // Process all aspects in parallel
      const [layoutResult, copyResult] = await Promise.all([
        request.productImageUrl
          ? creativeDirector.suggestLayouts(
              request.productImageUrl,
              request.category || 'general',
              request.style || 'modern'
            )
          : Promise.resolve(null),
        
        request.productInfo
          ? complianceOfficer.generateCopy(
              request.productInfo,
              request.style || 'energetic'
            )
          : Promise.resolve(null),
      ]);

      const processingTime = Date.now() - startTime;

      const result = {
        layouts: layoutResult?.layouts || [],
        copy: copyResult || [],
        processingTimeMs: processingTime,
        metadata: {
          category: request.category,
          style: request.style,
          timestamp: new Date().toISOString(),
        },
      };

      logger.info('Complete creative package generated', {
        layouts: result.layouts.length,
        copyVariations: result.copy.length,
        timeMs: processingTime,
      });

      return result;
    } catch (error) {
      logger.error('Complete creative generation failed', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new AIOrchestrator();