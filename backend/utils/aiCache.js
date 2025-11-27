import { cache } from '../config/redis.js';
import crypto from 'crypto';
import logger from './logger.js';

/**
 * Generate cache key from request data
 */
function generateCacheKey(prefix, data) {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  // NOTE: This line was fixed to use backticks (` `) for string interpolation
  return `${prefix}:${hash}`;
}

/**
 * Cache AI response
 */
export async function cacheAIResponse(prefix, requestData, responseData, ttlSeconds = 3600) {
  try {
    const key = generateCacheKey(prefix, requestData);
    await cache.set(key, responseData, ttlSeconds);
    logger.debug('Cached AI response', { prefix, key });
  } catch (error) {
    logger.warn('Failed to cache AI response', error);
  }
}

/**
 * Get cached AI response
 */
export async function getCachedAIResponse(prefix, requestData) {
  try {
    const key = generateCacheKey(prefix, requestData);
    const cached = await cache.get(key);
    
    if (cached) {
      logger.debug('Cache hit for AI response', { prefix, key });
      return cached;
    }
    
    logger.debug('Cache miss for AI response', { prefix, key });
    return null;
  } catch (error) {
    logger.warn('Failed to get cached AI response', error);
    return null;
  }
}

export default {
  set: cacheAIResponse,
  get: getCachedAIResponse
};