import express from 'express';
import { 
  processCreativeRequest, 
  suggestImprovements, 
  generateCompleteCreative 
} from '../controllers/orchestratorController.js';

const router = express.Router();

// Route for processing natural language requests via the orchestrator
router.post('/process', processCreativeRequest);

// Route for getting improvement suggestions for an existing creative
router.post('/suggest-improvements', suggestImprovements);

// Route for generating a full creative package (layout + copy)
router.post('/generate-complete', generateCompleteCreative);

export default router;