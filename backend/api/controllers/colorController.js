import * as db from '../../db/queries.js';
import logger from '../../utils/logger.js';

/**
 * Save extracted color palette
 */
export async function savePalette(req, res) {
  try {
    const { userId = 1, imageId, colors } = req.body;
    
    if (!colors || !Array.isArray(colors)) {
      return res.status(400).json({
        success: false,
        error: { message: 'colors array is required' }
      });
    }
    
    const palette = await db.saveColorPalette(userId, imageId, colors);
    
    logger.info('Color palette saved', { paletteId: palette.id, colorCount: colors.length });
    
    res.json({
      success: true,
      data: palette
    });
  } catch (error) {
    logger.error('Failed to save color palette', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}

/**
 * Get user's color palettes
 */
export async function getUserPalettes(req, res) {
  try {
    const userId = req.query.userId || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const palettes = await db.getColorPalettesByUser(userId, limit);
    
    res.json({
      success: true,
      data: palettes
    });
  } catch (error) {
    logger.error('Failed to get color palettes', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}

/**
 * Get recently used colors
 */
export async function getRecentColors(req, res) {
  try {
    const userId = req.query.userId || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const colors = await db.getRecentColors(userId, limit);
    
    res.json({
      success: true,
      data: colors
    });
  } catch (error) {
    logger.error('Failed to get recent colors', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}