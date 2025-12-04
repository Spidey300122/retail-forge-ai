// backend/ai-engine/compliance/ruleEngine.js
import logger from '../../utils/logger.js';
import { ComplianceRule } from './ComplianceRule.js';

// Import content rules
import {
  BERTTextRule,
  NoTCsRule,
  NoCompetitionRule,
  NoCharityRule
} from './rules/contentRules.js';

// Import other rule groups
import * as designRules from './rules/designRules.js';
import * as layoutRules from './rules/layoutRules.js';
import * as tagRules from './rules/tagRules.js';

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
    // -----------------------------
    // CONTENT RULES
    // -----------------------------
    this.addRule(new BERTTextRule());
    this.addRule(new NoTCsRule());
    this.addRule(new NoCompetitionRule());
    this.addRule(new NoCharityRule());

    // TAG RULES
    if (tagRules?.ApprovedTagsOnlyRule) {
      this.addRule(new tagRules.ApprovedTagsOnlyRule());
    }
    if (tagRules?.ClubcardDateFormatRule) {
      this.addRule(new tagRules.ClubcardDateFormatRule());
    }

    // -----------------------------
    // DESIGN RULES
    // -----------------------------
    if (designRules.MinimumFontSizeRule) {
      this.addRule(new designRules.MinimumFontSizeRule());
    }
    if (designRules.WCAGContrastRule) {
      this.addRule(new designRules.WCAGContrastRule());
    }
    if (designRules.ValueTilePositionRule) {
      this.addRule(new designRules.ValueTilePositionRule());
    }
    if (designRules.NoOverlayRule) {
      this.addRule(new designRules.NoOverlayRule());
    }
    if (designRules.DrinkAwareRule) {
      this.addRule(new designRules.DrinkAwareRule());
    }
    // New ✓ Background Color Rule
    if (designRules.BackgroundColorRule) {
      this.addRule(new designRules.BackgroundColorRule());
    }

    // -----------------------------
    // LAYOUT RULES
    // -----------------------------
    if (layoutRules.PackshotSpacingRule) {
      this.addRule(new layoutRules.PackshotSpacingRule());
    }
    if (layoutRules.SocialSafeZoneRule) {
      this.addRule(new layoutRules.SocialSafeZoneRule());
    }
    if (layoutRules.CTAPositionRule) {
      this.addRule(new layoutRules.CTAPositionRule());
    }
    if (layoutRules.ElementHierarchyRule) {
      this.addRule(new layoutRules.ElementHierarchyRule());
    }
    if (layoutRules.MaxPackshotsRule) {
      this.addRule(new layoutRules.MaxPackshotsRule());
    }
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
   */
  async validateAll(creativeData) {
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
        const result = await rule.validate(creativeData);
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
   * Calculate compliance score (0–100)
   */
  calculateComplianceScore(results) {
    const totalRules = results.rulesChecked;
    const passedRules = results.rulesPassed;

    if (totalRules === 0) return 0;

    const baseScore = (passedRules / totalRules) * 100;
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
   * Get all rules for a given category
   */
  getRulesByCategory(category) {
    return this.rules.filter(r => r.category === category);
  }
}

export default new RuleEngine();
