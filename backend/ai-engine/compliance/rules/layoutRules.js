// backend/ai-engine/compliance/rules/layoutRules.js
import { ComplianceRule } from '../ruleEngine.js';

/**
 * Rule 14: Packshot Spacing
 */
export class PackshotSpacingRule extends ComplianceRule {
  constructor() {
    super('packshot_spacing', 'Packshot-CTA Spacing', 'layout', 'hard_fail');
  }

  validate(creativeData) {
    if (!creativeData.cta) {
      return { passed: true }; // No CTA, skip
    }

    // Minimum spacing requirements
    let minSpacing = 24;
    if (creativeData.format === 'checkout_single_density') {
      minSpacing = 12;
    }

    const violations = [];
    
    // Find packshots
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
        suggestion: `Maintain minimum${minSpacing}px spacing between packshots and CTA`,
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

// Calculate minimum distance between rectangles
const dx = Math.max(0, rect1.left - rect2.right, rect2.left - rect1.right);
const dy = Math.max(0, rect1.top - rect2.bottom, rect2.top - rect1.bottom);

return Math.sqrt(dx * dx + dy * dy);
}
}
/**

Rule 15: Social Safe Zone (Stories 9:16)
*/
export class SocialSafeZoneRule extends ComplianceRule {
constructor() {
super('social_safe_zone', 'Social Media Safe Zones', 'layout', 'hard_fail');
}

validate(creativeData) {
// Only applies to 9:16 Stories format (1080x1920)
if (creativeData.format !== 'instagram_story' && creativeData.format !== 'facebook_story') {
return { passed: true };
}
const TOP_SAFE_ZONE = 200;
const BOTTOM_SAFE_ZONE = 250;
const CANVAS_HEIGHT = 1920;

const violations = [];

if (creativeData.elements) {
  creativeData.elements.forEach((el, index) => {
    // Skip background elements
    if (el.isBackground) return;

    const elTop = el.top || 0;
    const elBottom = elTop + (el.height || 0);

    // Check top safe zone
    if (elTop < TOP_SAFE_ZONE) {
      violations.push({
        element: `element_${index}`,
        zone: 'top',
        position: Math.round(elTop),
        safeZoneStart: TOP_SAFE_ZONE,
      });
    }

    // Check bottom safe zone
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
    message: `${violations.length} element(s) in unsafe zones (top ${TOP_SAFE_ZONE}px / bottom ${BOTTOM_SAFE_ZONE}px)`,
    suggestion: `Keep content between ${TOP_SAFE_ZONE}px and ${CANVAS_HEIGHT - BOTTOM_SAFE_ZONE}px for Stories format`,
    affectedElements: violations,
  };
}

return { passed: true };
}
}
