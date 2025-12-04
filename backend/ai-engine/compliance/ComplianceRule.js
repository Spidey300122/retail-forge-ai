/**
 * Base Rule Class
 * Extracted to avoid circular dependency with ruleEngine.js
 */
export class ComplianceRule {
  constructor(ruleId, name, category, severity) {
    this.ruleId = ruleId;
    this.name = name;
    this.category = category; // 'content', 'design', 'tag', 'layout', 'accessibility'
    this.severity = severity; // 'hard_fail', 'warning'
  }

  /**
   * Validate creative data against this rule
   * @param {Object} creativeData - Creative data to validate
   * @returns {Object} { passed: boolean, violations: [] }
   */
  validate(creativeData) {
    throw new Error('validate() must be implemented by subclass');
  }
}