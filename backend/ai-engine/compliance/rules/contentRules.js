// backend/ai-engine/compliance/rules/contentRules.js - UPDATED

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
      const response = await axios.post('http://localhost:8001/classify', {
        text: text,
        threshold: 0.7
      });

      const result = response.data;

      if (!result.compliant) {
        return {
          passed: false,
          message: `AI detected: ${result.label} (${(result.confidence * 100).toFixed(0)}% confidence)`,
          suggestion: this.getSuggestion(result.label),
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

  getSuggestion(label) {
    const suggestions = {
      tcs: 'Remove Terms & Conditions text.',
      competition: 'Remove competition language (win, prize, contest).',
      green_claim: 'Remove environmental claims unless certified.',
      charity: 'Remove charity partnership mentions.',
      price_claim: 'Move pricing information to value tiles only.',
      guarantee: 'Remove money-back guarantees or refund promises.'
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
          suggestion: this.getSuggestion(pattern.label)
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
    if (creativeData.elements) {
      creativeData.elements.forEach(el => {
        if (el.type === 'text' && el.content) allText += el.content + ' ';
      });
    }

    return allText;
  }
}

/**
 * No T&Cs Rule
 */
export class NoTCsRule extends ComplianceRule {
  constructor() {
    super('no_tcs', 'No Terms & Conditions', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = `${creativeData.text || ''} ${creativeData.headline || ''} ${creativeData.subhead || ''}`.toLowerCase();

    if (text.includes('t&c') || text.includes('terms and conditions') || text.includes('t & c')) {
      return {
        passed: false,
        message: 'Terms & Conditions are not allowed.',
        suggestion: 'Remove all T&C references.'
      };
    }

    return { passed: true };
  }
}

/**
 * No Charity Mentions Rule
 */
export class NoCharityRule extends ComplianceRule {
  constructor() {
    super('no_charity', 'No Charity Mentions', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData).toLowerCase();

    if (text.includes('charity') || text.includes('donate') || text.includes('ngo') || text.includes('fundraiser')) {
      return {
        passed: false,
        message: 'Charity or donation references detected.',
        suggestion: 'Remove all charity-related wording.'
      };
    }
    return { passed: true };
  }

  extractAllText(creativeData) {
    let t = '';
    if (creativeData.text) t += creativeData.text + ' ';
    if (creativeData.headline) t += creativeData.headline + ' ';
    if (creativeData.subhead) t += creativeData.subhead + ' ';
    if (creativeData.elements)
      creativeData.elements.forEach(el => {
        if (el.type === 'text') t += el.content + ' ';
      });
    return t;
  }
}

/**
 * No Competition / Contest Rule
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
        message: 'Competition language detected.',
        suggestion: 'Remove win/prize/contest/giveaway language.'
      };
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let t = '';
    if (creativeData.text) t += creativeData.text + ' ';
    if (creativeData.headline) t += creativeData.headline + ' ';
    if (creativeData.subhead) t += creativeData.subhead + ' ';
    if (creativeData.elements)
      creativeData.elements.forEach(el => {
        if (el.type === 'text') t += el.content + ' ';
      });
    return t;
  }
}

/**
 * NEW RULE: No Sustainability / Green Claims
 */
export class NoGreenClaimsRule extends ComplianceRule {
  constructor() {
    super('no_green_claims', 'No Sustainability Claims', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData).toLowerCase();

    const greenKeywords = [
      'eco-friendly', 'eco friendly', 'sustainable', 'sustainability',
      'green', 'environmentally friendly', 'carbon neutral', 'carbon-neutral',
      'zero waste', 'zero-waste', 'recyclable', 'biodegradable',
      'planet-friendly', 'earth-friendly', 'climate positive', 'net zero',
      'organic'
    ];

    for (const word of greenKeywords) {
      if (text.includes(word)) {
        return {
          passed: false,
          message: `Sustainability claim detected: "${word}"`,
          suggestion: 'Remove sustainability claims unless certified.',
          metadata: { detectedKeyword: word }
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let t = '';
    if (creativeData.text) t += creativeData.text + ' ';
    if (creativeData.headline) t += creativeData.headline + ' ';
    if (creativeData.subhead) t += creativeData.subhead + ' ';
    if (creativeData.elements)
      creativeData.elements.forEach(el => {
        if (el.type === 'text') t += el.content + ' ';
      });
    return t;
  }
}

/**
 * NEW RULE: No Price Call-outs
 */
export class NoPriceCalloutRule extends ComplianceRule {
  constructor() {
    super('no_price_callout', 'No Price Call-outs in Copy', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData).toLowerCase();

    const pricePatterns = [
      /\d+%\s*(off|discount|save)/i,
      /save\s*£?\d+/i,
      /only\s*£?\d+/i,
      /just\s*£?\d+/i,
      /£\d+\.\d{2}/,
      /\b\d+p\b/i,
      /half\s*price/i,
      /buy\s*one\s*get\s*one/i,
      /bogof/i,
      /\d+\s*for\s*£?\d+/i,
      /was\s*£?\d+.*now\s*£?\d+/i,
      /rrp\s*£?\d+/i,
      /deal/i,
      /offer/i
    ];

    for (const pattern of pricePatterns) {
      if (pattern.test(text)) {
        const match = text.match(pattern);
        return {
          passed: false,
          message: `Price/discount detected: "${match[0]}"`,
          suggestion: 'Remove price callouts from copy elements.',
          metadata: { detectedText: match[0] }
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let t = '';
    if (creativeData.text) t += creativeData.text + ' ';
    if (creativeData.headline) t += creativeData.headline + ' ';
    if (creativeData.subhead) t += creativeData.subhead + ' ';
    if (creativeData.elements)
      creativeData.elements.forEach(el => {
        if (el.type === 'text') t += el.content + ' ';
      });
    return t;
  }
}

/**
 * NEW RULE: No Money-back Guarantees
 */
export class NoMoneyBackRule extends ComplianceRule {
  constructor() {
    super('no_money_back', 'No Money-back Guarantees', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData).toLowerCase();

    const patterns = [
      /money[\s-]?back/i,
      /refund/i,
      /satisfaction\s*guaranteed/i,
      /100%\s*guaranteed/i,
      /risk[\s-]?free/i,
      /no\s*risk/i,
      /guarantee/i
    ];

    for (const p of patterns) {
      if (p.test(text)) {
        const m = text.match(p);
        return {
          passed: false,
          message: `Guarantee detected: "${m[0]}"`,
          suggestion: 'Remove guarantee/refund language.',
          metadata: { detectedText: m[0] }
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let t = '';
    if (creativeData.text) t += creativeData.text + ' ';
    if (creativeData.headline) t += creativeData.headline + ' ';
    if (creativeData.subhead) t += creativeData.subhead + ' ';
    if (creativeData.elements)
      creativeData.elements.forEach(el => {
        if (el.type === 'text') t += el.content + ' ';
      });
    return t;
  }
}

/**
 * NEW RULE: No Unsubstantiated Claims
 */
export class NoUnsubstantiatedClaimsRule extends ComplianceRule {
  constructor() {
    super('no_unsubstantiated_claims', 'No Unsubstantiated Claims', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData);
    const lower = text.toLowerCase();

    if (text.includes('*')) {
      return {
        passed: false,
        message: 'Asterisk detected (implies hidden conditions).',
        suggestion: 'Remove asterisks.'
      };
    }

    const surveyPatterns = [
      /\d+%\s*of\s*(people|users|customers|consumers)/i,
      /survey\s*(says|shows|reveals)/i,
      /research\s*(shows|proves)/i,
      /study\s*(found|shows)/i,
      /proven\s*to/i,
      /clinically\s*proven/i,
      /scientifically\s*proven/i,
      /#1\s*(selling|rated|best)/i,
      /best\s*selling/i,
      /award[\s-]?winning/i,
      /recommended\s*by\s*(doctors|experts)/i
    ];

    for (const pattern of surveyPatterns) {
      if (pattern.test(lower)) {
        const m = text.match(pattern);
        return {
          passed: false,
          message: `Unsubstantiated claim detected: "${m[0]}"`,
          suggestion: 'Remove survey/statistics/study claims.',
          metadata: { detectedText: m[0] }
        };
      }
    }

    const superlatives = [
      /\b(best|greatest|finest|perfect|ultimate|supreme)\b/i
    ];

    for (const s of superlatives) {
      if (s.test(lower)) {
        const m = text.match(s);
        return {
          passed: false,
          message: `Unverified superlative: "${m[0]}"`,
          suggestion: 'Remove superlatives unless proven.',
          metadata: { detectedText: m[0] }
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let t = '';
    if (creativeData.text) t += creativeData.text + ' ';
    if (creativeData.headline) t += creativeData.headline + ' ';
    if (creativeData.subhead) t += creativeData.subhead + ' ';
    if (creativeData.elements)
      creativeData.elements.forEach(el => {
        if (el.type === 'text') t += el.content + ' ';
      });
    return t;
  }
}

/**
 * EXPORT ALL RULES
 */
export default {
  BERTTextRule,
  NoTCsRule,
  NoCompetitionRule,
  NoCharityRule,
  NoGreenClaimsRule,
  NoPriceCalloutRule,
  NoMoneyBackRule,
  NoUnsubstantiatedClaimsRule
};
