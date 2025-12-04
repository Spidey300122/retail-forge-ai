// backend/ai-engine/compliance/rules/contentRules.js
import { ComplianceRule } from '../ComplianceRule.js';
import axios from 'axios';

/**
 * BERT-powered Text Classification Rule
 */
export class BERTTextRule extends ComplianceRule {
  constructor() {
    super('bert_text_classification', 'AI Text Classification', 'content', 'hard_fail');
  }

  async validate(creativeData) {
    const text = this.extractAllText(creativeData);

    if (!text || text.trim().length === 0) {
      return { passed: true };
    }

    try {
      // Call Python BERT service
      const response = await axios.post('http://localhost:8001/classify', {
        text: text,
        threshold: 0.7
      });

      const result = response.data;

      if (!result.compliant) {
        return {
          passed: false,
          message: `AI detected: ${result.label} (${(result.confidence * 100).toFixed(0)}% confidence)`,
          suggestion: this.getSuggestionForLabel(result.label),
          metadata: {
            label: result.label,
            confidence: result.confidence,
            all_probabilities: result.all_probabilities
          }
        };
      }

      return { passed: true };
    } catch (error) {
      console.error('BERT classification failed:', error);
      return this.fallbackValidation(text);
    }
  }

  getSuggestionForLabel(label) {
    const suggestions = {
      tcs: 'Remove Terms & Conditions text. Self-serve media cannot include T&Cs.',
      competition: 'Remove competition language (win, prize, enter, contest).',
      green_claim: 'Remove environmental claims unless certified.',
      charity: 'Remove charity partnership mentions.',
      price_claim: 'Move pricing information to value tiles only.',
      guarantee: 'Remove money-back guarantee or refund promises.'
    };
    return suggestions[label] || 'Review and remove flagged content.';
  }

  fallbackValidation(text) {
    const patterns = [
      { regex: /t\s*&\s*c/i, label: 'tcs' },
      { regex: /\bwin\b|\bprize\b|\bcontest\b|\benter\b/i, label: 'competition' },
      { regex: /eco[\s-]?friendly|sustainable|green/i, label: 'green_claim' },
      { regex: /charity|donate|ngo/i, label: 'charity' },
      { regex: /money[\s-]?back|guaranteed/i, label: 'guarantee' },
      { regex: /\b₹\d+|\b\d+% off\b/i, label: 'price_claim' }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(text)) {
        return {
          passed: false,
          message: `Detected prohibited ${pattern.label} content`,
          suggestion: this.getSuggestionForLabel(pattern.label)
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let allText = '';

    if (creativeData.text) allText += creativeData.text + ' ';
    if (creativeData.headline) allText += creativeData.headline + ' ';
    if (creativeData.subhead) allText += creativeData.subhead + ' ';

    if (creativeData.elements && Array.isArray(creativeData.elements)) {
      creativeData.elements.forEach(el => {
        if (el.type === 'text' && el.content) {
          allText += el.content + ' ';
        }
      });
    }

    return allText;
  }
}

/**
 * Simple No T&Cs Rule (existing compatibility rule)
 */
export class NoTCsRule extends ComplianceRule {
  constructor() {
    super('no_tcs', 'No Terms & Conditions', 'content', 'hard_fail');
  }

  async validate(creativeData) {
    const text = `${creativeData.text || ''} ${creativeData.headline || ''} ${creativeData.subhead || ''}`.toLowerCase();

    if (text.includes('t&c') || text.includes('terms and conditions') || text.includes('t & c')) {
      return {
        passed: false,
        message: 'Terms & Conditions are not allowed.',
        suggestion: 'Remove all T&C references from the creative.'
      };
    }

    return { passed: true };
  }
}

/**
 * No Charity Mentions
 */
export class NoCharityRule extends ComplianceRule {
  constructor() {
    super('no_charity', 'No Charity Mentions', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData).toLowerCase();

    if (text.includes('charity') || text.includes('donate') || text.includes('ngos') || text.includes('fundraiser')) {
      return {
        passed: false,
        message: 'Charity or donation references are not allowed.',
        suggestion: 'Remove charity-related wording.'
      };
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let allText = '';

    if (creativeData.text) allText += creativeData.text + ' ';
    if (creativeData.headline) allText += creativeData.headline + ' ';
    if (creativeData.subhead) allText += creativeData.subhead + ' ';

    if (creativeData.elements && Array.isArray(creativeData.elements)) {
      creativeData.elements.forEach(el => {
        if (el.type === 'text' && el.content) {
          allText += el.content + ' ';
        }
      });
    }

    return allText;
  }
}

/**
 * No Competition/Contest Rule
 */
export class NoCompetitionRule extends ComplianceRule {
  constructor() {
    super('no_competition', 'No Competitions or Contests', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData).toLowerCase();

    if (/win|prize|contest|enter|giveaway/.test(text)) {
      return {
        passed: false,
        message: 'Competition or contest language detected.',
        suggestion: 'Remove competition-related words such as win, prize, contest, giveaway, enter.'
      };
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let allText = '';

    if (creativeData.text) allText += creativeData.text + ' ';
    if (creativeData.headline) allText += creativeData.headline + ' ';
    if (creativeData.subhead) allText += creativeData.subhead + ' ';

    if (creativeData.elements && Array.isArray(creativeData.elements)) {
      creativeData.elements.forEach(el => {
        if (el.type === 'text' && el.content) {
          allText += el.content + ' ';
        }
      });
    }

    return allText;
  }
}
