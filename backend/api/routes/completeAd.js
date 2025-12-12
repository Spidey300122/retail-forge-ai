// backend/api/routes/completeAd.js - NEW FILE
import express from 'express';
import { generateCompleteAd } from '../controllers/completeAdController.js';

const router = express.Router();

// POST /api/complete-ad
router.post('/', generateCompleteAd);

export default router;