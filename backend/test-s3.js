import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testS3() {
  try {
    console.log('Testing S3 upload...');
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: 'test/hello.txt',
      Body: 'Hello from Retail Forge AI!',
      ContentType: 'text/plain'
    });
    
    await s3Client.send(command);
    
    console.log('✅ S3 upload works!');
    console.log(`File uploaded to: https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/test/hello.txt`);
  } catch (error) {
    console.error('❌ S3 error:', error.message);
  }
}

testS3();