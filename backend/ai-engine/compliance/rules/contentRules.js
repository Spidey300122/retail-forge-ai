// backend/ai-engine/compliance/rules/contentRules.js
import { ComplianceRule } from '../ComplianceRule.js'; // Updated import path

/**
 * Rule 1: No T&Cs Text
 */
export class NoTCsRule extends ComplianceRule {
  constructor() {
    super('no_tcs', 'No Terms & Conditions', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData);
    
    const tcsPatterns = [
      /t\s*&\s*c/i,
      /t\.?\s*c\.?\s*s/i,
      /terms\s+(and|&)\s+conditions/i,
      /conditions\s+apply/i,
      /see\s+terms/i,
      /full\s+terms/i,
    ];

    for (const pattern of tcsPatterns) {
      if (pattern.test(text)) {
        return {
          passed: false,
          message: 'Creative contains prohibited Terms & Conditions text',
          suggestion: 'Remove all T&Cs references. Self-serve media cannot include terms and conditions.',
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    let allText = '';
    
    if (creativeData.text) {
      allText += creativeData.text + ' ';
    }
    
    if (creativeData.headline) {
      allText += creativeData.headline + ' ';
    }
    
    if (creativeData.subhead) {
      allText += creativeData.subhead + ' ';
    }
    
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
 * Rule 2: No Competition Messaging
 */
export class NoCompetitionRule extends ComplianceRule {
  constructor() {
    super('no_competition', 'No Competition Language', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData);
    
    const competitionPatterns = [
      /\bwin\b/i,
      /\bprize\b/i,
      /\benter\b.*\b(to\s+win|now|competition)/i,
      /\bcompetition\b/i,
      /\bcontest\b/i,
      /\bdraw\b/i,
      /\bsweepstakes\b/i,
      /\bgiveaway\b/i,
    ];

    for (const pattern of competitionPatterns) {
      if (pattern.test(text)) {
        return {
          passed: false,
          message: 'Creative contains prohibited competition/contest language',
          suggestion: 'Remove words like "win", "prize", "enter", "competition". Use "Available now" or "Shop now" instead.',
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    return new NoTCsRule().extractAllText(creativeData);
  }
}

/**
 * Rule 3: No Green Claims
 */
export class NoGreenClaimsRule extends ComplianceRule {
  constructor() {
    super('no_green_claims', 'No Environmental Claims', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData);
    
    const greenPatterns = [
      /\beco[\s-]?friendly\b/i,
      /\benvironmentally\s+friendly\b/i,
      /\bsustainable\b/i,
      /\bgreen\b.*\b(product|packaging)\b/i,
      /\bcarbon[\s-]?neutral\b/i,
      /\bzero\s+waste\b/i,
      /\brecycl(ed|able)\b/i,
      /\bplastic[\s-]?free\b/i,
      /\borganic\b/i,
    ];

    for (const pattern of greenPatterns) {
      if (pattern.test(text)) {
        return {
          passed: false,
          message: 'Creative contains unsubstantiated environmental claims',
          suggestion: 'Remove green/sustainability claims unless certified. Self-serve cannot verify environmental claims.',
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    return new NoTCsRule().extractAllText(creativeData);
  }
}

/**
 * Rule 4: No Charity Partnerships
 */
export class NoCharityPartnershipsRule extends ComplianceRule {
  constructor() {
    super('no_charity', 'No Charity Partnership Mentions', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData);
    
    const charityPatterns = [
      /\bcharity\b/i,
      /\bdonation\b/i,
      /\bdonate\b/i,
      /\bsupport.*\b(cause|charity)\b/i,
      /\bproceeds\s+go\s+to\b/i,
      /\bfor\s+every.*we\s+(donate|give)\b/i,
    ];

    for (const pattern of charityPatterns) {
      if (pattern.test(text)) {
        return {
          passed: false,
          message: 'Creative contains charity partnership messaging',
          suggestion: 'Remove charity partnership text. These require special verification.',
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    return new NoTCsRule().extractAllText(creativeData);
  }
}

/**
 * Rule 5: No Price Call-Outs in Copy
 */
export class NoPriceCallOutsRule extends ComplianceRule {
  constructor() {
    super('no_price_callouts', 'No Price Call-Outs', 'content', 'hard_fail');
  }

  validate(creativeData) {
    // Only check headline/subhead, not value tiles
    let copyText = '';
    
    if (creativeData.headline) copyText += creativeData.headline + ' ';
    if (creativeData.subhead) copyText += creativeData.subhead + ' ';
    
    if (creativeData.elements) {
      creativeData.elements.forEach(el => {
        if (el.type === 'text' && !el.isValueTile) {
          copyText += (el.content || '') + ' ';
        }
      });
    }
    
    const pricePatterns = [
      /\b\d+%\s*(off|discount|save)/i,
      /\bsave\s+£\d+/i,
      /\b(only|just)\s+£\d+/i,
      /\bhalf\s+price\b/i,
      /\bbuy.*get.*free\b/i,
      /\b(deal|offer|discount)\b/i,
    ];

    for (const pattern of pricePatterns) {
      if (pattern.test(copyText)) {
        return {
          passed: false,
          message: 'Copy contains price/discount references',
          suggestion: 'Price information must only appear in value tiles, not in headline/subhead copy.',
        };
      }
    }

    return { passed: true };
  }
}

/**
 * Rule 6: No Money-Back Guarantees
 */
export class NoMoneyBackGuaranteesRule extends ComplianceRule {
  constructor() {
    super('no_money_back', 'No Money-Back Guarantees', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData);
    
    const guaranteePatterns = [
      /\bmoney[\s-]?back\b/i,
      /\bguaranteed\b/i,
      /\b100%\s+satisfaction\b/i,
      /\brefund\b/i,
      /\bno\s+questions\s+asked\b/i,
    ];

    for (const pattern of guaranteePatterns) {
      if (pattern.test(text)) {
        return {
          passed: false,
          message: 'Creative contains money-back guarantee language',
          suggestion: 'Remove guarantee/refund promises. These require verification.',
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    return new NoTCsRule().extractAllText(creativeData);
  }
}

/**
 * Rule 7: No Unsubstantiated Claims
 */
export class NoClaimsRule extends ComplianceRule {
  constructor() {
    super('no_claims', 'No Unsubstantiated Claims', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const text = this.extractAllText(creativeData);
    
    const claimPatterns = [
      /\b(best|#1|number\s+one|top)\b/i,
      /\bonly\b.*\b(product|brand|solution)\b/i,
      /\bproven\b/i,
      /\bscientifically\b/i,
      /\bclinically\s+tested\b/i,
      /\bguaranteed\s+to\b/i,
      /\b\d+%\s+(of\s+)?(doctors|experts)\b/i,
      /\baward[\s-]?winning\b/i,
    ];

    for (const pattern of claimPatterns) {
      if (pattern.test(text)) {
        return {
          passed: false,
          message: 'Creative contains unsubstantiated claims',
          suggestion: 'Remove superlatives like "best", "only", "#1", or claims requiring proof (e.g., "proven", "scientifically").',
        };
      }
    }

    return { passed: true };
  }

  extractAllText(creativeData) {
    return new NoTCsRule().extractAllText(creativeData);
  }
}

/**
 * Rule 8: Approved Tesco Tags Only
 */
export class ApprovedTagsOnlyRule extends ComplianceRule {
  constructor() {
    super('approved_tags', 'Approved Tags Only', 'content', 'hard_fail');
  }

  validate(creativeData) {
    const approvedTags = [
      'only at tesco',
      'available at tesco',
      'selected stores. while stocks last.',
      'available in selected stores. clubcard/app required. ends',
    ];

    if (!creativeData.tag) {
      // Tag is optional unless Clubcard Price tile exists
      if (creativeData.hasClubcardPrice) {
        return {
          passed: false,
          message: 'Clubcard Price requires a tag with end date',
          suggestion: 'Add tag: "Available in selected stores. Clubcard/app required. Ends DD/MM"',
        };
      }
      return { passed: true };
    }

    const tagText = creativeData.tag.toLowerCase().trim();
    
    // Check if tag matches any approved pattern
    const isApproved = approvedTags.some(approved => 
      tagText.startsWith(approved) || tagText === approved
    );

    if (!isApproved) {
      return {
        passed: false,
        message: 'Tag text is not from approved list',
        suggestion: `Use one of: ${approvedTags.slice(0, 2).join(', ')}`,
      };
    }

    // If Clubcard Price, verify date format
    if (creativeData.hasClubcardPrice) {
      const dateMatch = tagText.match(/ends\s+(\d{2}\/\d{2})/i);
      if (!dateMatch) {
        return {
          passed: false,
          message: 'Clubcard Price tag missing end date in DD/MM format',
          suggestion: 'Add "Ends DD/MM" to tag (e.g., "Ends 23/06")',
        };
      }
    }

    return { passed: true };
  }
}