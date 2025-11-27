import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { config } from '../config/secrets.js';
import logger from './logger.js';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});

/**
 * Generate unique file key
 */
export function generateFileKey(userId, type, originalFilename) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = originalFilename.split('.').pop();
  return `${type}/${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * Upload file to S3
 */
export async function uploadToS3(file, userId, type = 'general') {
  try {
    const key = generateFileKey(userId, type, file.originalname);
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }
    });
    
    await upload.done();
    
    const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
    
    logger.info('File uploaded to S3', { key, url });
    
    return {
      key,
      url,
      bucket: config.aws.s3Bucket,
      size: file.size
    };
  } catch (error) {
    logger.error('S3 upload failed', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key
    });
    
    await s3Client.send(command);
    
    logger.info('File deleted from S3', { key });
    
    return true;
  } catch (error) {
    logger.error('S3 deletion failed', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get file URL from S3
 */
export function getS3Url(key) {
  return `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
}

export default {
  upload: uploadToS3,
  delete: deleteFromS3,
  getUrl: getS3Url,
  generateKey: generateFileKey
};