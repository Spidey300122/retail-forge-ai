// backend/ai-engine/compliance/ruleEngine.js
import logger from '../../utils/logger.js';
import { ComplianceRule } from './ComplianceRule.js'; // Import the base class
import * as contentRules from './rules/contentRules.js';
import * as designRules from './rules/designRules.js';
import * as layoutRules from './rules/layoutRules.js';
import * as tagRules from './rules/tagRules.js'; // Assuming this file exists based on your original code

/**
 * Rule Engine - Coordinates all compliance rules
 */
export class RuleEngine {
  constructor() {
    this.rules = [];
    this.initializeRules();
    logger.info('Rule Engine initialized with', this.rules.length, 'rules');
  }

  /**
   * Initialize all compliance rules
   */
  initializeRules() {
    // Content Rules (8 rules)
    this.addRule(new contentRules.NoTCsRule());
    this.addRule(new contentRules.NoCompetitionRule());
    this.addRule(new contentRules.NoGreenClaimsRule());
    this.addRule(new contentRules.NoCharityPartnershipsRule());
    this.addRule(new contentRules.NoPriceCallOutsRule());
    this.addRule(new contentRules.NoMoneyBackGuaranteesRule());
    this.addRule(new contentRules.NoClaimsRule());
    this.addRule(new contentRules.ApprovedTagsOnlyRule());

    // Design Rules (5 rules)
    this.addRule(new designRules.MinimumFontSizeRule());
    this.addRule(new designRules.WCAGContrastRule());
    this.addRule(new designRules.ValueTilePositionRule());
    this.addRule(new designRules.NoOverlayRule());
    this.addRule(new designRules.DrinkAwareRule());

    // Layout Rules (2 rules)
    this.addRule(new layoutRules.PackshotSpacingRule());
    this.addRule(new layoutRules.SocialSafeZoneRule());
  }

  /**
   * Add a rule to the engine
   */
  addRule(rule) {
    if (!(rule instanceof ComplianceRule)) {
      throw new Error('Rule must be an instance of ComplianceRule');
    }
    this.rules.push(rule);
  }

  /**
   * Validate creative against all rules
   * @param {Object} creativeData - Creative data to validate
   * @returns {Object} Validation results
   */
  validateAll(creativeData) {
    const startTime = Date.now();
    
    const results = {
      isCompliant: true,
      violations: [],
      warnings: [],
      rulesChecked: 0,
      rulesPassed: 0,
      rulesFailed: 0,
    };

    logger.info('Starting validation with', this.rules.length, 'rules');

    for (const rule of this.rules) {
      try {
        const result = rule.validate(creativeData);
        results.rulesChecked++;

        if (!result.passed) {
          results.rulesFailed++;
          
          if (rule.severity === 'hard_fail') {
            results.isCompliant = false;
            results.violations.push({
              ruleId: rule.ruleId,
              ruleName: rule.name,
              category: rule.category,
              severity: rule.severity,
              message: result.message,
              suggestion: result.suggestion || null,
              affectedElements: result.affectedElements || [],
            });
          } else {
            results.warnings.push({
              ruleId: rule.ruleId,
              ruleName: rule.name,
              category: rule.category,
              severity: rule.severity,
              message: result.message,
              suggestion: result.suggestion || null,
            });
          }
        } else {
          results.rulesPassed++;
        }
      } catch (error) {
        logger.error(`Rule ${rule.ruleId} failed with error:`, error);
        results.warnings.push({
          ruleId: rule.ruleId,
          ruleName: rule.name,
          message: `Rule check failed: ${error.message}`,
          severity: 'warning',
        });
      }
    }

    const processingTime = Date.now() - startTime;
    
    logger.info('Validation complete:', {
      compliant: results.isCompliant,
      violations: results.violations.length,
      warnings: results.warnings.length,
      timeMs: processingTime,
    });

    return {
      ...results,
      processingTimeMs: processingTime,
      score: this.calculateComplianceScore(results),
    };
  }

  /**
   * Calculate compliance score (0-100)
   */
  calculateComplianceScore(results) {
    const totalRules = results.rulesChecked;
    const passedRules = results.rulesPassed;
    
    if (totalRules === 0) return 0;
    
    const baseScore = (passedRules / totalRules) * 100;
    
    // Deduct more for hard fails
    const hardFailPenalty = results.violations.length * 10;
    const warningPenalty = results.warnings.length * 2;
    
    return Math.max(0, Math.round(baseScore - hardFailPenalty - warningPenalty));
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId) {
    return this.rules.find(r => r.ruleId === ruleId);
  }

  /**
   * Get all rules in a category
   */
  getRulesByCategory(category) {
    return this.rules.filter(r => r.category === category);
  }
}

// Export singleton instance
export default new RuleEngine();