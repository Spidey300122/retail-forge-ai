import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import { uploadToS3 } from '../../utils/s3.js';
import { saveImage } from '../../db/queries.js';
import { validateImage } from '../../utils/validation.js';
import logger from '../../utils/logger.js';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export const uploadMiddleware = upload.single('image');

/**
 * Upload and process image
 */
export async function uploadImage(req, res) {
  try {
    const file = req.file;
    const { type = 'product', userId = 1 } = req.body; // TODO: Get userId from auth
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }
    
    // Validate image
    validateImage(file);
    
    // Get image metadata
    const metadata = await sharp(file.buffer).metadata();
    
    // Generate unique ID
    const imageId = `img_${crypto.randomBytes(8).toString('hex')}`;
    
    // Upload to S3
    const s3Result = await uploadToS3(file, userId, type);
    
    // Save to database
    const imageRecord = await saveImage({
      id: imageId,
      userId,
      originalFilename: file.originalname,
      s3Key: s3Result.key,
      s3Url: s3Result.url,
      fileSizeKb: Math.round(file.size / 1024),
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      type,
      metadata: {
        space: metadata.space,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha
      }
    });
    
    logger.info('Image uploaded successfully', { imageId, type });
    
    res.json({
      success: true,
      data: {
        imageId: imageRecord.id,
        url: imageRecord.s3_url,
        width: imageRecord.width,
        height: imageRecord.height,
        format: imageRecord.format,
        sizeKB: imageRecord.file_size_kb
      }
    });
  } catch (error) {
    logger.error('Upload failed', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}