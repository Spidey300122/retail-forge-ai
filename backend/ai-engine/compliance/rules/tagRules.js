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

    // Validate day + month
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

/**
 * Rule: Approved Tags Only
 */
export class ApprovedTagsOnlyRule extends ComplianceRule {
  constructor() {
    super('approved_tags_only', 'Approved Tags Only', 'tag', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.tag || !creativeData.tag.text) {
      return { passed: true }; // No tag = no violation
    }

    const tagText = creativeData.tag.text.toLowerCase().trim();

    const approvedTags = [
      'only at tesco',
      'available at tesco',
      'selected stores. while stocks last.',
      'selected stores. while stocks last',
    ];

    // Special case: Clubcard tiles
    if (creativeData.valueTile && creativeData.valueTile.type === 'clubcard') {
      const hasClubcard = /clubcard/i.test(tagText);
      const hasDate = /\d{2}\/\d{2}/.test(tagText);

      if (!hasClubcard || !hasDate) {
        return {
          passed: false,
          message: 'Clubcard tile requires tag with "Clubcard/app required. Ends DD/MM"',
          suggestion: 'Use format: "Clubcard/app required. Ends DD/MM"',
        };
      }

      return { passed: true };
    }

    // Check if tag matches approved list
    const isApproved = approvedTags.some(approved => {
      return tagText.includes(approved);
    });

    if (!isApproved) {
      return {
        passed: false,
        message: `Tag text "${creativeData.tag.text}" is not in approved list`,
        suggestion: 'Use one of: "Only at Tesco", "Available at Tesco", "Selected stores. While stocks last."',
        affectedElements: [{ element: 'tag' }],
      };
    }

    return { passed: true };
  }
}
