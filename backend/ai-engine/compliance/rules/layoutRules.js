// backend/ai-engine/compliance/rules/layoutRules.js
import { ComplianceRule } from '../ComplianceRule.js';

/**
 * Rule 12: CTA Positioning
 */
export class CTAPositionRule extends ComplianceRule {
  constructor() {
    super('cta_position', 'CTA Position', 'layout', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.cta) {
      return { passed: true }; 
    }

    const cta = creativeData.cta;

    const ctaPositions = {
      'instagram_post': { x: 540, y: 950 },
      'facebook_feed': { x: 600, y: 550 },
      'instagram_story': { x: 540, y: 1650 },
    };

    const expectedPos = ctaPositions[creativeData.format];
    if (!expectedPos) return { passed: true };

    const tolerance = 10;

    if (
      Math.abs(cta.x - expectedPos.x) > tolerance ||
      Math.abs(cta.y - expectedPos.y) > tolerance
    ) {
      return {
        passed: false,
        message: 'CTA is not in the correct position',
        suggestion: `Move CTA to position (${expectedPos.x}, ${expectedPos.y})`,
      };
    }

    return { passed: true };
  }
}

/**
 * Rule 13: Element Hierarchy
 * Packshot should be closest to CTA
 */
export class ElementHierarchyRule extends ComplianceRule {
  constructor() {
    super('element_hierarchy', 'Element Hierarchy', 'layout', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.cta || !creativeData.elements) return { passed: true };

    const cta = creativeData.cta;

    const packshots = creativeData.elements.filter(
      el => el.type === 'packshot' || el.isPackshot
    );

    if (packshots.length === 0) return { passed: true };

    let closestPackshot = null;
    let minDistance = Infinity;

    packshots.forEach(packshot => {
      const distance = this.calculateDistance(packshot, cta);
      if (distance < minDistance) {
        minDistance = distance;
        closestPackshot = packshot;
      }
    });

    const violations = [];

    creativeData.elements.forEach((el, index) => {
      if (el.type === 'packshot' || el.isPackshot) return;

      const distance = this.calculateDistance(el, cta);

      if (distance < minDistance) {
        violations.push({
          element: `element_${index}`,
          type: el.type,
          distance: Math.round(distance),
          packshotDistance: Math.round(minDistance),
        });
      }
    });

    if (violations.length > 0) {
      return {
        passed: false,
        message: 'Packshot should be closest element to CTA',
        suggestion: 'Move packshot closer to CTA or increase spacing of other elements',
        affectedElements: violations,
      };
    }

    return { passed: true };
  }

  calculateDistance(el1, el2) {
    const x1 = el1.left || el1.x || 0;
    const y1 = el1.top || el1.y || 0;
    const x2 = el2.left || el2.x || 0;
    const y2 = el2.top || el2.y || 0;

    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}

/**
 * Rule 14: Maximum 3 Packshots
 */
export class MaxPackshotsRule extends ComplianceRule {
  constructor() {
    super('max_packshots', 'Maximum Packshots', 'layout', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.elements) return { passed: true };

    const packshots = creativeData.elements.filter(
      el => el.type === 'packshot' || el.isPackshot
    );

    if (packshots.length > 3) {
      return {
        passed: false,
        message: `Too many packshots (${packshots.length}/3 maximum)`,
        suggestion: 'Reduce packshots to a maximum of 3',
        affectedElements: packshots.map((p, i) => ({
          element: `packshot_${i}`,
        })),
      };
    }

    return { passed: true };
  }
}

/**
 * Rule 15: Packshot Spacing
 */
export class PackshotSpacingRule extends ComplianceRule {
  constructor() {
    super('packshot_spacing', 'Packshot-CTA Spacing', 'layout', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.cta) return { passed: true };

    let minSpacing = 24;
    if (creativeData.format === 'checkout_single_density') minSpacing = 12;

    const violations = [];

    const packshots = (creativeData.elements || []).filter(
      el => el.type === 'packshot' || el.isPackshot
    );

    packshots.forEach((packshot, index) => {
      const spacing = this.calculateSpacing(packshot, creativeData.cta);

      if (spacing < minSpacing) {
        violations.push({
          packshot: `packshot_${index}`,
          currentSpacing: Math.round(spacing),
          minimumSpacing: minSpacing,
        });
      }
    });

    if (violations.length > 0) {
      return {
        passed: false,
        message: `${violations.length} packshot(s) too close to CTA`,
        suggestion: `Maintain at least ${minSpacing}px spacing`,
        affectedElements: violations,
      };
    }

    return { passed: true };
  }

  calculateSpacing(el1, el2) {
    const rect1 = {
      left: el1.left || 0,
      top: el1.top || 0,
      right: (el1.left || 0) + (el1.width || 0),
      bottom: (el1.top || 0) + (el1.height || 0),
    };
    const rect2 = {
      left: el2.x || el2.left || 0,
      top: el2.y || el2.top || 0,
      right: (el2.x || el2.left || 0) + (el2.width || 0),
      bottom: (el2.y || el2.top || 0) + (el2.height || 0),
    };

    const dx = Math.max(0, rect1.left - rect2.right, rect2.left - rect1.right);
    const dy = Math.max(0, rect1.top - rect2.bottom, rect2.top - rect1.bottom);

    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Rule 16: Social Safe Zone (Stories 9:16)
 */
export class SocialSafeZoneRule extends ComplianceRule {
  constructor() {
    super('social_safe_zone', 'Social Media Safe Zones', 'layout', 'hard_fail');
  }

  validate(creativeData) {
    if (creativeData.format !== 'instagram_story' && creativeData.format !== 'facebook_story') {
      return { passed: true };
    }

    const TOP_SAFE_ZONE = 200;
    const BOTTOM_SAFE_ZONE = 250;
    const CANVAS_HEIGHT = 1920;

    const violations = [];

    if (creativeData.elements) {
      creativeData.elements.forEach((el, index) => {
        if (el.isBackground) return;

        const elTop = el.top || 0;
        const elBottom = elTop + (el.height || 0);

        if (elTop < TOP_SAFE_ZONE) {
          violations.push({
            element: `element_${index}`,
            zone: 'top',
            position: Math.round(elTop),
            safeZoneStart: TOP_SAFE_ZONE,
          });
        }

        if (elBottom > (CANVAS_HEIGHT - BOTTOM_SAFE_ZONE)) {
          violations.push({
            element: `element_${index}`,
            zone: 'bottom',
            position: Math.round(elBottom),
            safeZoneEnd: CANVAS_HEIGHT - BOTTOM_SAFE_ZONE,
          });
        }
      });
    }

    if (violations.length > 0) {
      return {
        passed: false,
        message: `${violations.length} element(s) in unsafe story zones`,
        suggestion: `Keep content between ${TOP_SAFE_ZONE}px and ${CANVAS_HEIGHT - BOTTOM_SAFE_ZONE}px`,
        affectedElements: violations,
      };
    }

    return { passed: true };
  }
}
