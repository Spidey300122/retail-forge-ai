import pool from './config/database.js';
import redis from './config/redis.js';
import { cache } from './config/redis.js';

console.log('\n🧪 STEP-BY-STEP TESTING\n');
console.log('='.repeat(60));

// Test 1: Database
async function testDatabase() {
  console.log('\n📦 Testing Database...');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database failed:', error.message);
    return false;
  }
}

// Test 2: Redis
async function testRedis() {
  console.log('\n📦 Testing Redis...');
  try {
    await redis.ping();
    console.log('✅ Redis connected');
    
    // Test cache
    await cache.set('test-key', { foo: 'bar' }, 10);
    const value = await cache.get('test-key');
    
    if (value.foo === 'bar') {
      console.log('✅ Redis cache working');
      return true;
    } else {
      console.error('❌ Redis cache not working');
      return false;
    }
  } catch (error) {
    console.error('❌ Redis failed:', error.message);
    return false;
  }
}

// Run tests
(async () => {
  const dbOk = await testDatabase();
  const redisOk = await testRedis();
  
  console.log('\n' + '='.repeat(60));
  if (dbOk && redisOk) {
    console.log('✅ ALL INFRASTRUCTURE TESTS PASSED\n');
  } else {
    console.log('❌ SOME TESTS FAILED\n');
    process.exit(1);
  }
  process.exit(0);
})();