import express from 'express';
import { suggestLayouts, generateCopy } from '../controllers/aiController.js';

const router = express.Router();

router.post('/suggest-layouts', suggestLayouts);
router.post('/generate-copy', generateCopy);

export default router;