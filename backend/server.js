import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import db from './config/database.js';
import redis from './config/redis.js';
import uploadRoutes from './api/routes/upload.js';
import aiRoutes from './api/routes/ai.js';
import imageRoutes from './api/routes/image.js';
import colorRoutes from './api/routes/color.js';
import orchestratorRoutes from './api/routes/orchestrator.js';
import validateRoutes from './api/routes/validate.js';
import exportRoutes from './api/routes/export.js'; // <-- Added Day 15
import completeAdRoutes from './api/routes/completeAd.js';
// 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create temp directories if they don't exist
const tempDirs = [
  path.join(__dirname, 'temp'),
  path.join(__dirname, 'temp/uploads'),
  path.join(__dirname, 'temp/processed')
];

tempDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Strict CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://retail-forge-ai.vercel.app', // Change this to YOUR Vercel URL after deployment
    'https://*.vercel.app' // Allows all Vercel preview URLs
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use('/api/complete-ad', completeAdRoutes);
// Security: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

// Note: Body parsers are not strictly needed for the multipart export route 
// but are kept for all other JSON/URL-encoded routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/color', colorRoutes);
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/validate', validateRoutes);
app.use('/api/export', exportRoutes); // <-- Added Day 15

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check database
    await db.query('SELECT 1');
    
    // Check Redis
    await redis.ping();
    
    res.json({
      status: 'healthy',
      service: 'Retail Forge AI API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected'
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Simple Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found'
    }
  });
});

// Start server
const startServer = async () => {
  try {
    // Force a Test Connection to Postgres
    await db.query('SELECT 1'); 
    console.log('✅ Database connection verified');

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api`);
    });

  } catch (error) {
    logger.error('❌ Failed to connect to the database:', error);
    
    if (error.message.includes('password')) {
      console.error('👉 TIP: Check your .env file. Ensure DATABASE_URL is set correctly.');
    }
    process.exit(1);
  }
};

startServer();