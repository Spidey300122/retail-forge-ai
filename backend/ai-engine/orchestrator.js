import * as creativeDirector from './agents/creativeDirector.js';
import * as complianceOfficer from './agents/complianceOfficer.js';
import ruleEngine from './compliance/ruleEngine.js';
import logger from '../utils/logger.js';

/**
 * AI Agent Orchestrator - FIXED Multi-Agent System
 * Coordinates ALL AI agents: layouts, copy, validation, backgrounds
 */
class AIOrchestrator {
  constructor() {
    this.agents = {
      creative: creativeDirector,
      compliance: complianceOfficer,
      validation: ruleEngine,
    };
    logger.info('AI Orchestrator initialized with ALL agents');
  }

  /**
   * Analyze user intent - ENHANCED with ALL capabilities
   */
  async analyzeIntent(userInput) {
    try {
      logger.info('Analyzing user intent', { input: userInput });

      const lowerInput = userInput.toLowerCase();

      const intent = {
        // Layout keywords - EXPANDED
        needsLayout: /layout|design|arrange|position|create|generate|make|build|banner|post|story|creative|instagram|facebook|compose|template|structure/i.test(lowerInput),
        
        // Copy keywords - EXPANDED
        needsCopy: /copy|text|headline|write|content|caption|slogan|tagline|description|message|wording|phrase|title|subtitle/i.test(lowerInput),
        
        // Background keywords - NEW
        needsBackground: /background|backdrop|bg|scene|environment|generate background|create background|design background|new background|custom background/i.test(lowerInput),
        
        // Validation keywords - NEW
        needsCompliance: /check|validate|compliant|rules|safe|verify|test|review|compliance|approval|guidelines|standards|quality/i.test(lowerInput),
        
        category: this.detectCategory(userInput),
        style: this.detectStyle(userInput),
      };

      // Fallback: If nothing detected and input exists, infer from context
      if (!intent.needsLayout && !intent.needsCopy && !intent.needsBackground && !intent.needsCompliance && userInput.length > 5) {
        // Check if asking for "everything" or "complete"
        if (/complete|full|entire|everything|all/i.test(lowerInput)) {
          logger.info('User wants complete solution - enabling all agents');
          intent.needsLayout = true;
          intent.needsCopy = true;
          intent.needsCompliance = true;
        } else {
          // Default to layout if ambiguous
          logger.info('Ambiguous request, defaulting to layout generation');
          intent.needsLayout = true;
        }
      }

      logger.info('Intent analyzed', intent);
      return intent;
    } catch (error) {
      logger.error('Intent analysis failed', error);
      throw error;
    }
  }

  /**
   * Detect product category
   */
  detectCategory(input) {
    const categories = {
      beverages: /drink|juice|soda|beverage|water|coffee|tea|beer|wine|alcohol/i,
      food: /food|snack|meal|eat|bread|cheese|grocery|recipe/i,
      beauty: /beauty|makeup|cosmetic|skincare|lotion|shampoo|perfume/i,
      electronics: /electronic|phone|laptop|tech|gadget|computer|device/i,
      fashion: /fashion|clothing|apparel|shirt|dress|shoes|accessories/i,
      home: /home|furniture|decor|kitchen|bedroom|garden/i,
    };

    for (const [category, regex] of Object.entries(categories)) {
      if (regex.test(input)) return category;
    }

    return 'general';
  }

  /**
   * Detect style preference
   */
  detectStyle(input) {
    const styles = {
      modern: /modern|contemporary|sleek|minimalist/i,
      minimal: /minimal|simple|clean|basic/i,
      vibrant: /vibrant|colorful|bold|bright/i,
      elegant: /elegant|sophisticated|classy|premium/i,
      playful: /playful|fun|casual|friendly/i,
      professional: /professional|corporate|business|formal/i,
    };

    for (const [style, regex] of Object.entries(styles)) {
      if (regex.test(input)) return style;
    }

    return 'modern';
  }

  /**
   * Process creative request - ENHANCED with ALL agents
   */
  async processCreativeRequest(request) {
    try {
      logger.info('Processing creative request', { request });

      const results = {
        intent: null,
        layouts: null,
        copy: null,
        validation: null,
        background: null,
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
            type: 'success',
            message: `✨ Generated ${layoutResult.layouts.length} layout options → Check "Layouts" tab`,
          });
        } catch (error) {
          logger.warn('Layout generation failed', error);
          results.recommendations.push({
            type: 'warning',
            message: '⚠️ Could not generate layouts. Check image URL or try again.',
          });
        }
      } else if (results.intent.needsLayout && !request.productImageUrl) {
        results.recommendations.push({
          type: 'info',
          message: '💡 Tip: Add an image to the canvas first for AI layout suggestions.',
        });
      }

      // Step 3: Generate copy if needed
      if (results.intent.needsCopy) {
        const productInfo = request.productInfo || {
          name: request.productName || "New Product",
          category: results.intent.category,
          features: [],
        };

        try {
          const copyResult = await complianceOfficer.generateCopy(
            productInfo,
            results.intent.style || 'energetic'
          );
          results.copy = copyResult;
          results.recommendations.push({
            type: 'success',
            message: `✍️ Generated ${copyResult.length} copy variations → Check "Copy" tab`,
          });
        } catch (error) {
          logger.warn('Copy generation failed', error);
          results.recommendations.push({
            type: 'warning',
            message: '⚠️ Could not generate copy. Provide product details in "Copy" tab.',
          });
        }
      }

      // Step 4: NEW - Validate compliance if requested or if creative data exists
      if (results.intent.needsCompliance || request.creativeData) {
        try {
          const creativeData = request.creativeData || this.extractCreativeDataFromRequest(request);
          
          if (creativeData && creativeData.elements && creativeData.elements.length > 0) {
            const validationResult = await ruleEngine.validateAll(creativeData);
            results.validation = validationResult;
            
            if (validationResult.isCompliant) {
              results.recommendations.push({
                type: 'success',
                message: `✅ Compliance check passed! Score: ${validationResult.score}/100`,
              });
            } else {
              results.recommendations.push({
                type: 'warning',
                message: `⚠️ Found ${validationResult.violations.length} compliance issue(s) → Check "Validate" tab`,
                violations: validationResult.violations.slice(0, 3), // Top 3
              });
            }
          } else {
            results.recommendations.push({
              type: 'info',
              message: '💡 Add elements to canvas to run compliance validation.',
            });
          }
        } catch (error) {
          logger.warn('Validation failed', error);
          results.recommendations.push({
            type: 'warning',
            message: '⚠️ Compliance check failed. Try again or check "Validate" tab.',
          });
        }
      }

      // Step 5: NEW - Background generation suggestion
      if (results.intent.needsBackground) {
        results.recommendations.push({
          type: 'info',
          message: '🎨 To generate custom backgrounds, go to "Gen BG" tab and describe your ideal background.',
        });
      }

      // Step 6: If nothing was generated, provide helpful guidance
      if (results.recommendations.length === 0) {
        results.recommendations.push({
          type: 'info',
          message: '🤔 I understood your request but need more context. Try:\n• Upload an image for layout suggestions\n• Provide product name for copy\n• Add elements to validate compliance',
        });
      }

      logger.info('Creative request processed', { 
        hasLayouts: !!results.layouts,
        hasCopy: !!results.copy,
        hasValidation: !!results.validation,
        recommendations: results.recommendations.length 
      });

      return results;
    } catch (error) {
      logger.error('Creative request processing failed', error);
      throw error;
    }
  }

  /**
   * NEW - Extract creative data from request context
   */
  extractCreativeDataFromRequest(request) {
    // If explicit creative data provided
    if (request.creativeData) return request.creativeData;

    // Try to construct minimal creative data from context
    const data = {
      format: 'instagram_post',
      backgroundColor: '#ffffff',
      text: '',
      headline: '',
      subhead: '',
      elements: [],
      category: request.category || 'general',
      isAlcohol: false,
    };

    // Add text from copy if available
    if (request.productInfo) {
      data.text = request.productInfo.name || '';
      data.headline = request.productInfo.name || '';
    }

    return data;
  }

  /**
   * Validate compliance for creative data - ENHANCED
   */
  async validateCompliance(creativeData) {
    try {
      logger.info('Running comprehensive compliance validation');
      
      // Use the rule engine directly
      const validationResult = await ruleEngine.validateAll(creativeData);
      
      logger.info('Validation complete', {
        compliant: validationResult.isCompliant,
        score: validationResult.score,
        violations: validationResult.violations.length,
        warnings: validationResult.warnings.length,
      });

      return validationResult;
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

      // Run validation first
      const validationResult = await this.validateCompliance(creativeData);
      
      // Add validation issues as suggestions
      if (!validationResult.isCompliant) {
        validationResult.violations.forEach(v => {
          suggestions.push({
            type: 'compliance',
            severity: 'high',
            message: v.message,
            suggestion: v.suggestion,
            category: v.category,
          });
        });
      }

      // Check image quality
      if (creativeData.elements) {
        creativeData.elements.forEach((el, index) => {
          if (el.type === 'image') {
            if (el.width < 800 || el.height < 800) {
              suggestions.push({
                type: 'quality',
                severity: 'medium',
                element: `image_${index}`,
                message: 'Image resolution is low. Use higher quality images (min 800x800px).',
              });
            }
          }

          if (el.type === 'text' || el.type === 'i-text') {
            if (el.fontSize < 24) {
              suggestions.push({
                type: 'readability',
                severity: 'medium',
                element: `text_${index}`,
                message: `Consider increasing font size to 24px for better readability (current: ${el.fontSize}px).`,
              });
            }
          }
        });
      }

      // Check color contrast
      if (creativeData.backgroundColor && creativeData.elements) {
        const textElements = creativeData.elements.filter(
          el => (el.type === 'text' || el.type === 'i-text') && el.fill
        );

        textElements.forEach((el, index) => {
          const contrast = this.calculateContrast(
            creativeData.backgroundColor,
            el.fill
          );
          
          if (contrast < 4.5) {
            suggestions.push({
              type: 'contrast',
              severity: 'high',
              element: `text_${index}`,
              message: `Text contrast is low (${contrast.toFixed(2)}:1). Minimum required: 4.5:1.`,
              currentContrast: contrast.toFixed(2),
              minimumRequired: 4.5,
            });
          }
        });
      }

      // Calculate overall score
      const criticalIssues = suggestions.filter(s => s.severity === 'high').length;
      const mediumIssues = suggestions.filter(s => s.severity === 'medium').length;
      const overallScore = Math.max(0, 100 - (criticalIssues * 15) - (mediumIssues * 5));

      logger.info('Improvement suggestions generated', { 
        count: suggestions.length,
        score: overallScore,
      });

      return {
        suggestions,
        overallScore,
        validationScore: validationResult.score,
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