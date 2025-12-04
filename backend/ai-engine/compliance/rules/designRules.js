import { ComplianceRule } from '../ComplianceRule.js'; // Updated import path

/**
 * Rule 9: Minimum Font Size
 */
export class MinimumFontSizeRule extends ComplianceRule {
  constructor() {
    super('min_font_size', 'Minimum Font Size', 'design', 'hard_fail');
  }

  validate(creativeData) {
    const violations = [];
    
    // Default minimum is 20px
    let minSize = 20;
    
    // Adjust based on format
    if (creativeData.format === 'checkout_single_density') {
      minSize = 10;
    } else if (creativeData.format === 'says') {
      minSize = 12;
    }

    // Check all text elements
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
        message: `${violations.length} text element(s) below minimum ${minSize}px font size`,
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
    const minContrast = 4.5; // WCAG AA standard

    if (!creativeData.backgroundColor) {
      return { passed: true }; // Can't check without background
    }

    if (creativeData.elements) {
      creativeData.elements.forEach((el, index) => {
        if ((el.type === 'text' || el.type === 'i-text') && el.fill) {
          const contrast = this.calculateContrast(
            creativeData.backgroundColor,
            el.fill
          );

          // Large text (18pt+/14pt+ bold) only needs 3:1
          const isLargeText = el.fontSize >= 24 || (el.fontSize >= 18 && el.fontWeight === 'bold');
          const requiredContrast = isLargeText ? 3.0 : 4.5;

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
        message: `${violations.length} text element(s) fail WCAG contrast standards`,
        suggestion: 'Increase color contrast between text and background',
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

      const [rs, gs, bs] = [r, g, b].map(c =>
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
    if (!creativeData.valueTile) {
      return { passed: true }; // No value tile to check
    }

    const vt = creativeData.valueTile;
    
    // Value tiles have predefined positions based on format
    const positions = {
      'instagram_post': { x: 100, y: 100 },
      'facebook_feed': { x: 100, y: 50 },
      // Add more formats as needed
    };

    const expectedPos = positions[creativeData.format];
    
    if (!expectedPos) {
      return { passed: true }; // Unknown format, skip
    }

    const tolerance = 5; // 5px tolerance
    
    if (
      Math.abs(vt.x - expectedPos.x) > tolerance ||
      Math.abs(vt.y - expectedPos.y) > tolerance
    ) {
      return {
        passed: false,
        message: 'Value tile is not in predefined position',
        suggestion: `Move value tile to position (${expectedPos.x}, ${expectedPos.y})`,
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
    const criticalElements = [];
    
    if (creativeData.valueTile) {
      criticalElements.push({ ...creativeData.valueTile, name: 'value_tile' });
    }
    
    if (creativeData.cta) {
      criticalElements.push({ ...creativeData.cta, name: 'cta' });
    }
    
    if (creativeData.tag) {
      criticalElements.push({ ...creativeData.tag, name: 'tag' });
    }

    const violations = [];
    
    if (creativeData.elements) {
      creativeData.elements.forEach((el, index) => {
        criticalElements.forEach(critical => {
          if (this.elementsOverlap(el, critical)) {
            violations.push({
              element: `element_${index}`,
              overlaps: critical.name,
            });
          }
        });
      });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: 'Elements are overlapping critical components (value tile/CTA/tag)',
        suggestion: 'Move elements to avoid overlapping value tiles, CTAs, and tags',
        affectedElements: violations,
      };
    }

    return { passed: true };
  }

  elementsOverlap(el1, el2) {
    if (!el1.left || !el1.top || !el2.left || !el2.top) {
      return false;
    }

    const rect1 = {
      left: el1.left,
      top: el1.top,
      right: el1.left + (el1.width || 0),
      bottom: el1.top + (el1.height || 0),
    };

    const rect2 = {
      left: el2.x || el2.left,
      top: el2.y || el2.top,
      right: (el2.x || el2.left) + (el2.width || 0),
      bottom: (el2.y || el2.top) + (el2.height || 0),
    };

    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }
}

/**
 * Rule 13: Drinkaware for Alcohol
 */
export class DrinkAwareRule extends ComplianceRule {
  constructor() {
    super('drinkaware', 'Drinkaware Logo Required', 'design', 'hard_fail');
  }

  validate(creativeData) {
    if (creativeData.category !== 'alcohol' && !creativeData.isAlcohol) {
      return { passed: true };
    }

    if (!creativeData.drinkaware) {
      return {
        passed: false,
        message: 'Alcohol products must include Drinkaware logo',
        suggestion: 'Add Drinkaware lock-up (minimum 20px height, black or white only)',
      };
    }

    const dw = creativeData.drinkaware;
    
    let minHeight = 20;
    if (creativeData.format === 'says') {
      minHeight = 12;
    }

    if (dw.height < minHeight) {
      return {
        passed: false,
        message: `Drinkaware logo too small (${dw.height}px, minimum ${minHeight}px)`,
        suggestion: `Increase Drinkaware logo to at least ${minHeight}px height`,
      };
    }

    if (dw.color && dw.color !== '#000000' && dw.color !== '#ffffff') {
      return {
        passed: false,
        message: 'Drinkaware logo must be all-black or all-white',
        suggestion: 'Change Drinkaware logo color to #000000 or #ffffff',
      };
    }

    if (creativeData.backgroundColor && dw.color) {
      const contrast = new WCAGContrastRule().calculateContrast(
        creativeData.backgroundColor,
        dw.color
      );

      if (contrast < 3.0) {
        return {
          passed: false,
          message: 'Drinkaware logo has insufficient contrast with background',
          suggestion: 'Switch Drinkaware color to improve visibility',
        };
      }
    }

    return { passed: true };
  }
}

/**
 * Rule 14: Background Color Validation
 */
export class BackgroundColorRule extends ComplianceRule {
  constructor() {
    super('background_color', 'Background Color', 'design', 'warning');
  }

  validate(creativeData) {
    if (!creativeData.backgroundColor) {
      return { passed: true };
    }

    const bgColor = creativeData.backgroundColor.toLowerCase();

    const isDark = this.getColorBrightness(bgColor) < 50;

    const isTooLight = this.getColorBrightness(bgColor) > 250;

    if (isDark) {
      return {
        passed: false,
        message: 'Very dark backgrounds may reduce readability',
        suggestion: 'Consider using a lighter background color',
      };
    }

    if (isTooLight && bgColor === '#ffffff') {
      return { passed: true };
    }

    return { passed: true };
  }

  getColorBrightness(hex) {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
}
