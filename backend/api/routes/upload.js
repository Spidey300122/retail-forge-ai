import express from 'express';
import { uploadImage, uploadMiddleware } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', uploadMiddleware, uploadImage);

export default router;