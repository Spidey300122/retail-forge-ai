// backend/ai-engine/compliance/rules/mediaRules.js - NEW FILE

import { ComplianceRule } from '../ComplianceRule.js';

/**
 * Rule: Photography of People (Warning)
 */
export class PhotographyOfPeopleRule extends ComplianceRule {
  constructor() {
    super('photography_of_people', 'Photography of People', 'media', 'warning');
  }

  async validate(creativeData) {
    if (!creativeData.elements || !Array.isArray(creativeData.elements)) {
      return { passed: true };
    }

    // Check if any images contain people
    // This is a simplified check - in production, you'd use ML/CV to detect people
    const imageElements = creativeData.elements.filter(el => el.type === 'image');
    
    if (imageElements.length === 0) {
      return { passed: true };
    }

    // Check metadata if available
    const potentialPeopleImages = imageElements.filter(img => {
      // Check if metadata indicates people
      if (img.metadata?.containsPeople === true) {
        return true;
      }
      // Check filename for common people-related keywords
      if (img.src && typeof img.src === 'string') {
        const src = img.src.toLowerCase();
        const peopleKeywords = ['person', 'people', 'face', 'portrait', 'model', 'user'];
        return peopleKeywords.some(keyword => src.includes(keyword));
      }
      return false;
    });

    if (potentialPeopleImages.length > 0) {
      return {
        passed: false,
        message: `${potentialPeopleImages.length} image(s) may contain people`,
        suggestion: 'Please confirm that any people shown are integral to the campaign. Photography of people requires special approval.',
        metadata: {
          requiresConfirmation: true,
          imageCount: potentialPeopleImages.length,
          note: 'User must confirm that people are essential to the campaign'
        }
      };
    }

    return { passed: true };
  }
}

/**
 * Rule: Image Quality Check
 */
export class ImageQualityRule extends ComplianceRule {
  constructor() {
    super('image_quality', 'Minimum Image Quality', 'media', 'warning');
  }

  validate(creativeData) {
    if (!creativeData.elements || !Array.isArray(creativeData.elements)) {
      return { passed: true };
    }

    const violations = [];
    const MIN_WIDTH = 800;
    const MIN_HEIGHT = 800;

    creativeData.elements.forEach((el, index) => {
      if (el.type === 'image') {
        const width = el.width || 0;
        const height = el.height || 0;

        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
          violations.push({
            element: `image_${index}`,
            currentSize: `${width}x${height}`,
            minimumSize: `${MIN_WIDTH}x${MIN_HEIGHT}`,
            message: `Image resolution too low`
          });
        }
      }
    });

    if (violations.length > 0) {
      return {
        passed: false,
        message: `${violations.length} image(s) below recommended resolution`,
        suggestion: `Use images at least ${MIN_WIDTH}x${MIN_HEIGHT}px for best quality`,
        affectedElements: violations
      };
    }

    return { passed: true };
  }
}

export default {
  PhotographyOfPeopleRule,
  ImageQualityRule
};