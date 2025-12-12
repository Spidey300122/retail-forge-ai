// backend/ai-engine/compliance/ruleEngine.js - UPDATED with all rules

import logger from '../../utils/logger.js';
import { ComplianceRule } from './ComplianceRule.js';

// Import ALL content rules (existing + new)
import {
  BERTTextRule,
  NoTCsRule,
  NoCompetitionRule,
  NoCharityRule,
  NoGreenClaimsRule,           // NEW
  NoPriceCalloutRule,          // NEW
  NoMoneyBackRule,             // NEW
  NoUnsubstantiatedClaimsRule  // NEW
} from './rules/contentRules.js';

// Import ALL design rules (existing + new)
import {
  MinimumFontSizeRule,
  WCAGContrastRule,
  ValueTilePositionRule,
  NoOverlayRule,
  DrinkAwareRule,
  BackgroundColorRule,
  CTASizeRule,                 // NEW
  TagSizePositionRule,         // NEW
  ValueTileFontSizeRule,       // NEW
  LEPDesignRule                // NEW
} from './rules/designRules.js';

// Import layout rules
import {
  PackshotSpacingRule,
  SocialSafeZoneRule,
  CTAPositionRule,
  ElementHierarchyRule,
  MaxPackshotsRule
} from './rules/layoutRules.js';

// Import tag rules
import {
  ApprovedTagsOnlyRule,
  ClubcardDateFormatRule
} from './rules/tagRules.js';

// Import NEW media rules
import {
  PhotographyOfPeopleRule,     // NEW
  ImageQualityRule             // NEW
} from './rules/mediaRules.js';

/**
 * Rule Engine - Coordinates all compliance rules
 * NOW WITH ALL 30+ RULES FROM APPENDIX B
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
    // CONTENT RULES (8 rules)
    // -----------------------------
    this.addRule(new BERTTextRule());                    // AI-powered text classification
    this.addRule(new NoTCsRule());                       // No T&Cs
    this.addRule(new NoCompetitionRule());               // No competitions
    this.addRule(new NoCharityRule());                   // No charity mentions
    this.addRule(new NoGreenClaimsRule());               // NEW: No sustainability claims
    this.addRule(new NoPriceCalloutRule());              // NEW: No price in copy
    this.addRule(new NoMoneyBackRule());                 // NEW: No money-back guarantees
    this.addRule(new NoUnsubstantiatedClaimsRule());     // NEW: No unverified claims

    // -----------------------------
    // TAG RULES (2 rules)
    // -----------------------------
    this.addRule(new ApprovedTagsOnlyRule());            // Approved Tesco tags only
    this.addRule(new ClubcardDateFormatRule());          // Clubcard date format DD/MM

    // -----------------------------
    // DESIGN RULES (10 rules)
    // -----------------------------
    this.addRule(new MinimumFontSizeRule());             // Min font size (10–20px)
    this.addRule(new WCAGContrastRule());                // WCAG AA contrast
    this.addRule(new ValueTilePositionRule());           // Value tile position
    this.addRule(new NoOverlayRule());                   // No overlays on critical elements
    this.addRule(new DrinkAwareRule());                  // Drinkaware for alcohol
    this.addRule(new BackgroundColorRule());             // Background color validation
    this.addRule(new CTASizeRule());                     // NEW: CTA size requirements
    this.addRule(new TagSizePositionRule());             // NEW: Tag size/position
    this.addRule(new ValueTileFontSizeRule());           // NEW: Value tile font sizing
    this.addRule(new LEPDesignRule());                   // NEW: LEP design rules

    // -----------------------------
    // LAYOUT RULES (5 rules)
    // -----------------------------
    this.addRule(new PackshotSpacingRule());             // Packshot–CTA spacing
    this.addRule(new SocialSafeZoneRule());              // Social media safe zones
    this.addRule(new CTAPositionRule());                 // CTA position rules
    this.addRule(new ElementHierarchyRule());            // Packshot closest to CTA
    this.addRule(new MaxPackshotsRule());                // Max 3 packshots allowed

    // -----------------------------
    // MEDIA RULES (2 rules)
    // -----------------------------
    this.addRule(new PhotographyOfPeopleRule());         // NEW: People in photo (warning)
    this.addRule(new ImageQualityRule());                // NEW: Image quality check

    logger.info(`✅ Loaded ${this.rules.length} compliance rules`);
    logger.info('📋 Rule breakdown:', {
      content: 8,
      tags: 2,
      design: 10,
      layout: 5,
      media: 2
    });
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
      rulesByCategory: {
        content: { passed: 0, failed: 0 },
        tags: { passed: 0, failed: 0 },
        design: { passed: 0, failed: 0 },
        layout: { passed: 0, failed: 0 },
        media: { passed: 0, failed: 0 },
        accessibility: { passed: 0, failed: 0 }
      }
    };

    logger.info('Starting validation with', this.rules.length, 'rules');

    for (const rule of this.rules) {
      try {
        const result = await rule.validate(creativeData);
        results.rulesChecked++;

        const category = rule.category || 'other';

        if (!results.rulesByCategory[category]) {
          results.rulesByCategory[category] = { passed: 0, failed: 0 };
        }

        if (!result.passed) {
          results.rulesFailed++;
          results.rulesByCategory[category].failed++;

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
              metadata: result.metadata || {}
            });
          } else {
            results.warnings.push({
              ruleId: rule.ruleId,
              ruleName: rule.name,
              category: rule.category,
              severity: rule.severity,
              message: result.message,
              suggestion: result.suggestion || null,
              metadata: result.metadata || {}
            });
          }
        } else {
          results.rulesPassed++;
          results.rulesByCategory[category].passed++;
        }
      } catch (error) {
        logger.error(`Rule ${rule.ruleId} failed with error:`, error);

        results.warnings.push({
          ruleId: rule.ruleId,
          ruleName: rule.name,
          message: `Rule check failed: ${error.message}`,
          severity: 'warning'
        });
      }
    }

    const processingTime = Date.now() - startTime;

    logger.info('Validation complete:', {
      compliant: results.isCompliant,
      violations: results.violations.length,
      warnings: results.warnings.length,
      timeMs: processingTime,
      categoryBreakdown: results.rulesByCategory
    });

    return {
      ...results,
      processingTimeMs: processingTime,
      score: this.calculateComplianceScore(results),
      summary: this.generateSummary(results)
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
   * Generate user-friendly summary
   */
  generateSummary(results) {
    const criticalIssues = results.violations.length;
    const minorIssues = results.warnings.length;

    if (criticalIssues === 0 && minorIssues === 0) {
      return '✅ Perfect! All compliance rules passed.';
    }

    if (criticalIssues > 0) {
      return `⚠️ Found ${criticalIssues} critical issue(s) that must be fixed.`;
    }

    return `✓ Compliant with ${minorIssues} minor suggestion(s).`;
  }

  /**
   * Get a rule by ID
   */
  getRule(ruleId) {
    return this.rules.find(r => r.ruleId === ruleId);
  }

  /**
   * Get all rules for a category
   */
  getRulesByCategory(category) {
    return this.rules.filter(r => r.category === category);
  }

  /**
   * Return system-wide rule statistics
   */
  getStatistics() {
    const stats = {
      totalRules: this.rules.length,
      byCategory: {},
      bySeverity: {
        hard_fail: 0,
        warning: 0
      }
    };

    this.rules.forEach(rule => {
      const category = rule.category || 'other';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      stats.bySeverity[rule.severity]++;
    });

    return stats;
  }
}

export default new RuleEngine();
