import express from 'express';
import { uploadMiddleware } from '../controllers/uploadController.js';
import { 
  removeBackground, 
  extractColors, 
  optimizeImage,
  generateBackground
} from '../controllers/imageController.js';

const router = express.Router();

router.post('/remove-background', uploadMiddleware, removeBackground);
router.post('/extract-colors', uploadMiddleware, extractColors);
router.post('/optimize', uploadMiddleware, optimizeImage);
router.post('/generate-background', generateBackground);

export default router;