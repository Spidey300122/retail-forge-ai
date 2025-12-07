import logger from '../../utils/logger.js';

/**
 * Brand Manager Agent
 * Learns and applies brand preferences over time
 */

class BrandManager {
  constructor() {
    this.brandProfiles = new Map();
    logger.info('Brand Manager initialized');
  }

  /**
   * Create or update brand profile
   */
  async saveBrandProfile(userId, brandData) {
    try {
      const profile = {
        userId,
        brandName: brandData.brandName,
        colors: brandData.colors || [],
        fonts: brandData.fonts || [],
        logoUrl: brandData.logoUrl || null,
        preferences: brandData.preferences || {},
        lastUsed: new Date().toISOString(),
        createdAt: this.brandProfiles.get(userId)?.createdAt || new Date().toISOString()
      };

      this.brandProfiles.set(userId, profile);
      logger.info('Brand profile saved', { userId, brandName: brandData.brandName });

      return profile;
    } catch (error) {
      logger.error('Failed to save brand profile', error);
      throw error;
    }
  }

  /**
   * Get brand profile for user
   */
  async getBrandProfile(userId) {
    try {
      const profile = this.brandProfiles.get(userId);
      
      if (profile) {
        logger.info('Brand profile retrieved', { userId });
        return profile;
      }

      logger.warn('No brand profile found', { userId });
      return null;
    } catch (error) {
      logger.error('Failed to get brand profile', error);
      throw error;
    }
  }

  /**
   * Apply brand preferences to creative
   */
  async applyBrandPreferences(creativeData, userId) {
    try {
      const profile = await this.getBrandProfile(userId);
      
      if (!profile) {
        logger.info('No brand profile to apply');
        return creativeData;
      }

      // Apply brand colors
      if (profile.colors && profile.colors.length > 0) {
        creativeData.suggestedColors = profile.colors;
      }

      // Apply brand fonts
      if (profile.fonts && profile.fonts.length > 0) {
        creativeData.suggestedFonts = profile.fonts;
      }

      // Apply brand logo
      if (profile.logoUrl) {
        creativeData.logoUrl = profile.logoUrl;
      }

      logger.info('Brand preferences applied', { userId });
      return creativeData;
    } catch (error) {
      logger.error('Failed to apply brand preferences', error);
      throw error;
    }
  }

  /**
   * Learn from user choices
   */
  async learnFromChoice(userId, choiceData) {
    try {
      const profile = await this.getBrandProfile(userId);
      
      if (!profile) {
        logger.warn('No profile to learn from', { userId });
        return;
      }

      // Update color preferences
      if (choiceData.colorsUsed) {
        const existingColors = new Set(profile.colors);
        choiceData.colorsUsed.forEach(color => existingColors.add(color));
        profile.colors = Array.from(existingColors).slice(0, 10); // Keep top 10
      }

      // Update font preferences
      if (choiceData.fontsUsed) {
        const existingFonts = new Set(profile.fonts);
        choiceData.fontsUsed.forEach(font => existingFonts.add(font));
        profile.fonts = Array.from(existingFonts).slice(0, 5); // Keep top 5
      }

      // Update general preferences
      if (choiceData.layoutStyle) {
        profile.preferences.preferredLayoutStyle = choiceData.layoutStyle;
      }

      profile.lastUsed = new Date().toISOString();
      this.brandProfiles.set(userId, profile);

      logger.info('Learned from user choice', { userId });
    } catch (error) {
      logger.error('Failed to learn from choice', error);
      throw error;
    }
  }

  /**
   * Get brand recommendations
   */
  async getRecommendations(userId, creativeType) {
    try {
      const profile = await this.getBrandProfile(userId);
      
      if (!profile) {
        return {
          colors: [],
          fonts: [],
          layoutStyle: 'modern'
        };
      }

      return {
        colors: profile.colors.slice(0, 5),
        fonts: profile.fonts.slice(0, 3),
        layoutStyle: profile.preferences.preferredLayoutStyle || 'modern',
        logoUrl: profile.logoUrl
      };
    } catch (error) {
      logger.error('Failed to get recommendations', error);
      throw error;
    }
  }
}

export default new BrandManager();