import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY'
];

// Optional but recommended
const optionalEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'STABILITY_API_KEY'
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease check your .env file');
    process.exit(1);
  }

  const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.warn('⚠️  Missing optional environment variables:');
    missingOptional.forEach(varName => console.warn(`   - ${varName}`));
    console.warn('Some features may not work without these.\n');
  }
  
  console.log('✅ All required environment variables are set');
}

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  database: {
    url: process.env.DATABASE_URL
  },
  
  redis: {
    url: process.env.REDIS_URL
  },
  
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || ''
  },
  
  ai: {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    stability: process.env.STABILITY_API_KEY || ''
  },
  
  upload: {
    maxSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png').split(',')
  }
};