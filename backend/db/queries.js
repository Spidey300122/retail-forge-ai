import pool from '../config/database.js';
import logger from '../utils/logger.js';

// Users
export async function createUser(email, name) {
  const query = 'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *';
  const result = await pool.query(query, [email, name]);
  return result.rows[0];
}

export async function getUserById(id) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

export async function getUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

// Brand Profiles
export async function createBrandProfile(userId, brandName, colorPalette, stylePreferences) {
  const query = `
    INSERT INTO brand_profiles (user_id, brand_name, color_palette, style_preferences)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await pool.query(query, [
    userId,
    brandName,
    JSON.stringify(colorPalette),
    JSON.stringify(stylePreferences)
  ]);
  return result.rows[0];
}

export async function getBrandProfilesByUser(userId) {
  const query = 'SELECT * FROM brand_profiles WHERE user_id = $1 ORDER BY last_used DESC';
  const result = await pool.query(query, [userId]);
  return result.rows;
}

// Images
export async function saveImage(imageData) {
  const query = `
    INSERT INTO images (id, user_id, original_filename, s3_key, s3_url, file_size_kb, width, height, format, type, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  const result = await pool.query(query, [
    imageData.id,
    imageData.userId,
    imageData.originalFilename,
    imageData.s3Key,
    imageData.s3Url,
    imageData.fileSizeKb,
    imageData.width,
    imageData.height,
    imageData.format,
    imageData.type,
    JSON.stringify(imageData.metadata || {})
  ]);
  return result.rows[0];
}

export async function getImageById(imageId) {
  const query = 'SELECT * FROM images WHERE id = $1';
  const result = await pool.query(query, [imageId]);
  return result.rows[0];
}

// Creatives
export async function saveCreative(creativeData) {
  const query = `
    INSERT INTO creatives (user_id, brand_profile_id, title, canvas_data, product_category, target_formats)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await pool.query(query, [
    creativeData.userId,
    creativeData.brandProfileId,
    creativeData.title,
    JSON.stringify(creativeData.canvasData),
    creativeData.productCategory,
    creativeData.targetFormats
  ]);
  return result.rows[0];
}

export async function updateCreative(id, updates) {
  const query = `
    UPDATE creatives 
    SET canvas_data = $1, is_compliant = $2, compliance_score = $3, status = $4
    WHERE id = $5
    RETURNING *
  `;
  const result = await pool.query(query, [
    JSON.stringify(updates.canvasData),
    updates.isCompliant,
    updates.complianceScore,
    updates.status,
    id
  ]);
  return result.rows[0];
}

export async function getCreativesByUser(userId) {
  const query = 'SELECT * FROM creatives WHERE user_id = $1 ORDER BY updated_at DESC';
  const result = await pool.query(query, [userId]);
  return result.rows;
}

// AI Logs
export async function logAIInteraction(logData) {
  const query = `
    INSERT INTO ai_logs (user_id, creative_id, agent_type, request_data, response_data, processing_time_ms, status, error_message)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const result = await pool.query(query, [
    logData.userId,
    logData.creativeId,
    logData.agentType,
    JSON.stringify(logData.requestData),
    JSON.stringify(logData.responseData),
    logData.processingTimeMs,
    logData.status,
    logData.errorMessage
  ]);
  return result.rows[0];
}

// Color Palettes
export async function saveColorPalette(userId, imageId, colors) {
  const query = `
    INSERT INTO color_palettes (user_id, image_id, colors, extracted_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  const result = await pool.query(query, [
    userId,
    imageId,
    JSON.stringify(colors)
  ]);
  return result.rows[0];
}

export async function getColorPalettesByUser(userId, limit = 10) {
  const query = `
    SELECT * FROM color_palettes 
    WHERE user_id = $1 
    ORDER BY extracted_at DESC 
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
}

export async function getRecentColors(userId, limit = 20) {
  const query = `
    SELECT DISTINCT jsonb_array_elements(colors) as color
    FROM color_palettes
    WHERE user_id = $1
    ORDER BY extracted_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows.map(row => row.color);
}