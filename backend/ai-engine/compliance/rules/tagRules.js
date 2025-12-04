// backend/ai-engine/compliance/rules/tagRules.js
import { ComplianceRule } from '../ComplianceRule.js';

/**
 * Rule: Clubcard Date Format (DD/MM)
 */
export class ClubcardDateFormatRule extends ComplianceRule {
  constructor() {
    super('clubcard_date_format', 'Clubcard Date Format', 'tag', 'hard_fail');
  }

  validate(creativeData) {
    // Only applies if there's a Clubcard tile
    if (!creativeData.valueTile || creativeData.valueTile.type !== 'clubcard') {
      return { passed: true };
    }

    // Check if tag text exists
    if (!creativeData.tag || !creativeData.tag.text) {
      return {
        passed: false,
        message: 'Clubcard tile requires tag with end date',
        suggestion: 'Add tag text like "Clubcard/app required. Ends DD/MM"',
      };
    }

    const tagText = creativeData.tag.text;

    // Check if tag includes required Clubcard text
    if (!tagText.toLowerCase().includes('clubcard')) {
      return {
        passed: false,
        message: 'Tag must include "Clubcard" text',
        suggestion: 'Use format: "Clubcard/app required. Ends DD/MM"',
      };
    }

    // Check for date in DD/MM format
    const datePattern = /\b(\d{2})\/(\d{2})\b/;
    const match = tagText.match(datePattern);

    if (!match) {
      return {
        passed: false,
        message: 'Clubcard tag must include end date in DD/MM format',
        suggestion: 'Add end date like "Ends 23/06"',
      };
    }

    // Validate date format
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);

    if (day < 1 || day > 31) {
      return {
        passed: false,
        message: `Invalid day "${day}" in date`,
        suggestion: 'Day must be between 01 and 31',
      };
    }

    if (month < 1 || month > 12) {
      return {
        passed: false,
        message: `Invalid month "${month}" in date`,
        suggestion: 'Month must be between 01 and 12',
      };
    }

    return { passed: true };
  }
}