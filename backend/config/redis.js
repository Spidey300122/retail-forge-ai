import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Helper functions
export const cache = {
  async get(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  
  async set(key, value, expireSeconds = 3600) {
    await redis.set(key, JSON.stringify(value), 'EX', expireSeconds);
  },
  
  async del(key) {
    await redis.del(key);
  }
};

export default redis;