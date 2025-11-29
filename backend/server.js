import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import db from './config/database.js';
import redis from './config/redis.js';
import uploadRoutes from './api/routes/upload.js';
import aiRoutes from './api/routes/ai.js';
import imageRoutes from './api/routes/image.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/ai', aiRoutes);
app.use('/api/image', imageRoutes);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

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
app.use('/api/upload', uploadRoutes);
// API routes (will add later)
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
      message: err.message,
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

// ... existing imports and code ...

// Start server with DB Check
const startServer = async () => {
  try {
    // 1. Force a Test Connection to Postgres
    // This triggers the pool.on('connect') event in your database.js
    await db.query('SELECT 1'); 
    console.log('✅ Database connection verified');

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`API available at http://localhost:${PORT}/api`);
    });

  } catch (error) {
    logger.error('❌ Failed to connect to the database:', error);
    
    // Detailed error logging to help you debug
    if (error.message.includes('password')) {
      console.error('👉 TIP: Check your .env file. Ensure DATABASE_URL is set correctly.');
      console.error('👉 TIP: Check config/database.js. If using "password:", make sure it is wrapped in quotes.');
    }
    process.exit(1);
  }
};

startServer();