// backend/ai-engine/compliance/rules/designRules.js

import { ComplianceRule } from '../ComplianceRule.js';

/**
 * Rule 9: Minimum Font Size
 */
export class MinimumFontSizeRule extends ComplianceRule {
  constructor() {
    super('min_font_size', 'Minimum Font Size', 'design', 'hard_fail');
  }

  validate(creativeData) {
    const violations = [];

    let minSize = 20;
    if (creativeData.format === 'checkout_single_density') minSize = 10;
    else if (creativeData.format === 'says') minSize = 12;

    if (creativeData.elements) {
      creativeData.elements.forEach((el, index) => {
        if ((el.type === 'text' || el.type === 'i-text') && el.fontSize) {
          if (el.fontSize < minSize) {
            violations.push({
              element: `text_${index}`,
              currentSize: el.fontSize,
              minimumSize: minSize,
            });
          }
        }
      });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: `${violations.length} text element(s) below minimum ${minSize}px`,
        suggestion: `Increase font size to at least ${minSize}px`,
        affectedElements: violations,
      };
    }

    return { passed: true };
  }
}

/**
 * Rule 10: WCAG Contrast Standards
 */
export class WCAGContrastRule extends ComplianceRule {
  constructor() {
    super('wcag_contrast', 'WCAG AA Contrast', 'accessibility', 'hard_fail');
  }

  validate(creativeData) {
    const violations = [];

    if (!creativeData.backgroundColor) return { passed: true };

    if (creativeData.elements) {
      creativeData.elements.forEach((el, index) => {
        if ((el.type === 'text' || el.type === 'i-text') && el.fill) {
          const contrast = this.calculateContrast(
            creativeData.backgroundColor,
            el.fill
          );

          const isLarge =
            el.fontSize >= 24 || (el.fontSize >= 18 && el.fontWeight === 'bold');

          const requiredContrast = isLarge ? 3.0 : 4.5;

          if (contrast < requiredContrast) {
            violations.push({
              element: `text_${index}`,
              contrast: contrast.toFixed(2),
              required: requiredContrast,
              textColor: el.fill,
              backgroundColor: creativeData.backgroundColor,
            });
          }
        }
      });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: `${violations.length} text items fail WCAG contrast`,
        suggestion: 'Increase contrast between text and background',
        affectedElements: violations,
      };
    }

    return { passed: true };
  }

  calculateContrast(color1, color2) {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.replace('#', ''), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;

      const [rs, gs, bs] = [r, g, b].map((c) =>
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
}

/**
 * Rule 11: Value Tile Position
 */
export class ValueTilePositionRule extends ComplianceRule {
  constructor() {
    super('value_tile_position', 'Value Tile Position', 'design', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.valueTile) return { passed: true };

    const vt = creativeData.valueTile;

    const formats = {
      instagram_post: { x: 100, y: 100 },
      facebook_feed: { x: 100, y: 50 },
    };

    const expected = formats[creativeData.format];
    if (!expected) return { passed: true };

    const tolerance = 5;

    if (Math.abs(vt.x - expected.x) > tolerance || Math.abs(vt.y - expected.y) > tolerance) {
      return {
        passed: false,
        message: 'Value tile not in correct position',
        suggestion: `Move value tile to (${expected.x}, ${expected.y})`,
      };
    }

    return { passed: true };
  }
}

/**
 * Rule 12: No Overlapping Elements
 */
export class NoOverlayRule extends ComplianceRule {
  constructor() {
    super('no_overlay', 'No Overlapping Critical Elements', 'design', 'hard_fail');
  }

  validate(creativeData) {
    const critical = [];

    if (creativeData.valueTile) critical.push({ ...creativeData.valueTile, name: 'value_tile' });
    if (creativeData.cta) critical.push({ ...creativeData.cta, name: 'cta' });
    if (creativeData.tag) critical.push({ ...creativeData.tag, name: 'tag' });

    const violations = [];

    if (creativeData.elements) {
      creativeData.elements.forEach((el, index) => {
        critical.forEach((c) => {
          if (this.overlap(el, c)) {
            violations.push({ element: `element_${index}`, overlaps: c.name });
          }
        });
      });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: 'Elements overlap critical components',
        suggestion: 'Move elements to avoid overlap with CTA, value tile, or tag',
        affectedElements: violations,
      };
    }

    return { passed: true };
  }

  overlap(a, b) {
    if (!a.left || !a.top || !b.left || !b.top) return false;

    const r1 = {
      left: a.left,
      top: a.top,
      right: a.left + (a.width || 0),
      bottom: a.top + (a.height || 0),
    };

    const r2 = {
      left: b.x || b.left,
      top: b.y || b.top,
      right: (b.x || b.left) + (b.width || 0),
      bottom: (b.y || b.top) + (b.height || 0),
    };

    return !(
      r1.right < r2.left ||
      r1.left > r2.right ||
      r1.bottom < r2.top ||
      r1.top > r2.bottom
    );
  }
}

/**
 * Rule 13: Drinkaware
 */
export class DrinkAwareRule extends ComplianceRule {
  constructor() {
    super('drinkaware', 'Drinkaware Required', 'design', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.isAlcohol && creativeData.category !== 'alcohol') return { passed: true };

    const dw = creativeData.drinkaware;
    if (!dw) {
      return {
        passed: false,
        message: 'Drinkaware logo required for alcohol products',
        suggestion: 'Add Drinkaware lock-up (min 20px height)',
      };
    }

    let minHeight = creativeData.format === 'says' ? 12 : 20;
    if (dw.height < minHeight) {
      return {
        passed: false,
        message: `Drinkaware logo too small (${dw.height}px)`,
        suggestion: `Increase to at least ${minHeight}px`,
      };
    }

    if (dw.color && dw.color !== '#000000' && dw.color !== '#ffffff') {
      return {
        passed: false,
        message: 'Drinkaware logo must be black or white',
        suggestion: 'Change logo color to #000000 or #ffffff',
      };
    }

    return { passed: true };
  }
}

/**
 * Rule 14: Background Color Validation
 */
export class BackgroundColorRule extends ComplianceRule {
  constructor() {
    super('background_color', 'Background Color Warning', 'design', 'warning');
  }

  validate(creativeData) {
    if (!creativeData.backgroundColor) return { passed: true };

    const bg = creativeData.backgroundColor.toLowerCase();
    const brightness = this.getBrightness(bg);

    if (brightness < 50) {
      return {
        passed: false,
        message: 'Background too dark',
        suggestion: 'Consider using a lighter background',
      };
    }

    return { passed: true };
  }

  getBrightness(hex) {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
}

/**
 * NEW RULE: CTA Size Requirements
 */
export class CTASizeRule extends ComplianceRule {
  constructor() {
    super('cta_size', 'CTA Size Requirements', 'design', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.cta) return { passed: true };

    const cta = creativeData.cta;

    const minSizes = {
      instagram_post: { width: 200, height: 48 },
      instagram_story: { width: 280, height: 56 },
      facebook_feed: { width: 200, height: 48 },
      instore_display: { width: 300, height: 80 },
    };

    const required = minSizes[creativeData.format] || { width: 200, height: 48 };
    const violations = [];

    if (cta.width < required.width) {
      violations.push({ issue: 'width', current: cta.width, minimum: required.width });
    }

    if (cta.height < required.height) {
      violations.push({ issue: 'height', current: cta.height, minimum: required.height });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: 'CTA too small',
        suggestion: `CTA must be at least ${required.width}x${required.height}px`,
        affectedElements: violations,
      };
    }

    return { passed: true };
  }
}

/**
 * NEW RULE: Tag Size & Position
 */
export class TagSizePositionRule extends ComplianceRule {
  constructor() {
    super('tag_size_position', 'Tag Size & Position', 'design', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.tag) return { passed: true };

    const tag = creativeData.tag;
    const violations = [];

    const MIN_FONT = 12;

    if (tag.fontSize && tag.fontSize < MIN_FONT) {
      violations.push({
        issue: 'fontSize',
        current: tag.fontSize,
        minimum: MIN_FONT,
      });
    }

    const canvasHeight = creativeData.canvasHeight || 1080;
    const expectedBottom = canvasHeight - 60;

    if (tag.y != null && tag.y < expectedBottom) {
      violations.push({
        issue: 'position',
        current: tag.y,
        expected: expectedBottom,
      });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: 'Tag size/position incorrect',
        suggestion: `Tag must be ≥ ${MIN_FONT}px and near bottom`,
        affectedElements: violations,
      };
    }

    return { passed: true };
  }
}

/**
 * NEW RULE: Value Tile Font Size
 */
export class ValueTileFontSizeRule extends ComplianceRule {
  constructor() {
    super('value_tile_font_size', 'Value Tile Font Size', 'design', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.valueTile) return { passed: true };

    const vt = creativeData.valueTile;

    const sizes = {
      new: { title: 24, price: 0 },
      white: { title: 16, price: 36 },
      clubcard: { title: 14, price: 32 },
    };

    const expected = sizes[vt.type];
    if (!expected) return { passed: true };

    const violations = [];

    if (vt.titleFontSize && vt.titleFontSize !== expected.title) {
      violations.push({ element: 'title', current: vt.titleFontSize, expected: expected.title });
    }

    if (expected.price > 0 && vt.priceFontSize && vt.priceFontSize !== expected.price) {
      violations.push({ element: 'price', current: vt.priceFontSize, expected: expected.price });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: 'Incorrect value tile font size',
        suggestion: 'Value tiles must use predefined font sizes',
        affectedElements: violations,
      };
    }

    return { passed: true };
  }
}

/**
 * NEW RULE: LEP Design Requirements
 */
export class LEPDesignRule extends ComplianceRule {
  constructor() {
    super('lep_design', 'LEP Design Requirements', 'design', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.isLEP && !creativeData.valueTile?.type?.includes('lep')) {
      return { passed: true };
    }

    const violations = [];

    if (creativeData.backgroundColor !== '#ffffff' && creativeData.backgroundColor !== 'white') {
      violations.push({
        issue: 'backgroundColor',
        current: creativeData.backgroundColor,
        required: '#ffffff',
      });
    }

    const TESCO_BLUE = '#00539F';

    (creativeData.elements || [])
      .filter((el) => el.type === 'text' || el.type === 'i-text')
      .forEach((el, index) => {
        if (el.fill?.toLowerCase() !== TESCO_BLUE.toLowerCase()) {
          violations.push({
            element: `text_${index}`,
            issue: 'textColor',
            current: el.fill,
            required: TESCO_BLUE,
          });
        }
      });

    if (creativeData.valueTile && creativeData.valueTile.type !== 'white') {
      violations.push({
        issue: 'valueTile',
        current: creativeData.valueTile.type,
        required: 'white',
      });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: 'LEP design requirements not met',
        suggestion:
          'LEP must use: white background, Tesco Blue text, white value tile, left-aligned copy',
        affectedElements: violations,
      };
    }

    return { passed: true };
  }
}

// FINAL EXPORT
export {
  MinimumFontSizeRule,
  WCAGContrastRule,
  ValueTilePositionRule,
  NoOverlayRule,
  DrinkAwareRule,
  BackgroundColorRule,
  CTASizeRule,
  TagSizePositionRule,
  ValueTileFontSizeRule,
  LEPDesignRule
};
