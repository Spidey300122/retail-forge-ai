import * as db from './db/queries.js';
import logger from './utils/logger.js';

async function testDatabase() {
  try {
    logger.info('Testing database queries...');
    
    // Test user creation
    const user = await db.createUser('test@retailforge.ai', 'Test User');
    logger.info('✅ User created:', user);
    
    // Test brand profile
    const brand = await db.createBrandProfile(
      user.id,
      'Test Brand',
      [{ hex: '#FF5733', name: 'primary' }],
      { layout: 'modern' }
    );
    logger.info('✅ Brand profile created:', brand);
    
    // Test image save
    const image = await db.saveImage({
      id: 'img_test123',
      userId: user.id,
      originalFilename: 'test.jpg',
      s3Key: 'test/test.jpg',
      s3Url: 'https://s3.../test.jpg',
      fileSizeKb: 500,
      width: 1920,
      height: 1080,
      format: 'jpeg',
      type: 'product',
      metadata: {}
    });
    logger.info('✅ Image saved:', image);
    
    logger.info('✅ All database tests passed!');
  } catch (error) {
    logger.error('Database test failed', error);
  }
  
  process.exit(0);
}

testDatabase();