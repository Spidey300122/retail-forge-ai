import express from 'express';
import multer from 'multer';
import { processExport } from '../controllers/exportController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/export
// Expects multipart/form-data with 'image' (file) and 'formats', 'complianceData' (text)
router.post('/', upload.single('image'), processExport);

export default router;