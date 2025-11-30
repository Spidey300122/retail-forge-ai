import express from 'express';
import { savePalette, getUserPalettes, getRecentColors } from '../controllers/colorController.js';

const router = express.Router();

router.post('/palette', savePalette);
router.get('/palettes', getUserPalettes);
router.get('/recent', getRecentColors);

export default router;