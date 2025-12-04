// backend/api/routes/validate.js
import express from 'express';
import { validateCreative, getRules, getRulesByCategory } from '../controllers/validateController.js';

const router = express.Router();

// Validate creative against all rules
router.post('/creative', validateCreative);

// Get all rules
router.get('/rules', getRules);

// Get rules by category
router.get('/rules/:category', getRulesByCategory);

export default router;