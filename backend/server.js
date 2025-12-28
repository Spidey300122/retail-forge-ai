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
import exportRoutes from './api/routes/export.js';
import completeAdRoutes from './api/routes/completeAd.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CORS Configuration (Updated for Production)
// ============================================
const allowedOrigins = [
  'http://localhost:5173',                    // Local development
  'http://localhost:5174',                    // Alternative local port
  process.env.FRONTEND_URL,                   // Production URL from environment variable
  'https://retail-forge-ai.vercel.app',       // Your specific Vercel deployment
];

// Filter out undefined values
const filteredOrigins = allowedOrigins.filter(origin => origin !== undefined && origin !== '');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (filteredOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } 
    // Allow all Vercel preview deployments (*.vercel.app)
    else if (origin.endsWith('.vercel.app')) {
      callback(null, true);
    } 
    else {
      logger.warn(`❌ CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'], // For file downloads
  maxAge: 86400 // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Log allowed origins on startup
logger.info('🌐 CORS Configuration:');
logger.info(`   Allowed Origins: ${filteredOrigins.join(', ')}`);
logger.info(`   Wildcard: *.vercel.app`);

// ============================================
// Security: Rate Limiting
// ============================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

// ============================================
// Body Parsing Middleware
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Request Logging Middleware
// ============================================
app.use((req, res, next) => {
  const origin = req.headers.origin || 'no-origin';
  logger.info(`${req.method} ${req.path} - Origin: ${origin}`);
  next();
});

// ============================================
// API Routes
// ============================================
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/color', colorRoutes);
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/validate', validateRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/complete-ad', completeAdRoutes);

// ============================================
// Health Check Endpoint
// ============================================
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
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      redis: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// Test Endpoint
// ============================================
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Root Endpoint
// ============================================
app.get('/', (req, res) => {
  res.json({
    service: 'Retail Forge AI Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      test: '/api/test'
    }
  });
});

// ============================================
// Error Handling Middleware
// ============================================
app.use((err, req, res, next) => {
  // Log the full error
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Send appropriate response
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        path: req.path 
      })
    }
  });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: {
      message: 'Endpoint not found',
      path: req.path,
      method: req.method
    }
  });
});

// ============================================
// Server Startup
// ============================================
const startServer = async () => {
  try {
    // Test database connection
    await db.query('SELECT 1'); 
    logger.info('✅ Database connection verified');

    // Test Redis connection
    await redis.ping();
    logger.info('✅ Redis connection verified');

    // Start Express server
    app.listen(PORT, () => {
      logger.info('═══════════════════════════════════════════');
      logger.info(`🚀 Retail Forge AI Backend - STARTED`);
      logger.info('═══════════════════════════════════════════');
      logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`   Server: http://localhost:${PORT}`);
      logger.info(`   API: http://localhost:${PORT}/api`);
      logger.info(`   Health: http://localhost:${PORT}/health`);
      logger.info('═══════════════════════════════════════════');
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    
    // Provide helpful error messages
    if (error.message.includes('password') || error.message.includes('authentication')) {
      console.error('');
      console.error('👉 DATABASE CONNECTION ERROR');
      console.error('   Check your .env file and ensure DATABASE_URL is correct');
      console.error('   Format: postgresql://user:password@host:port/database');
      console.error('');
    }
    
    if (error.message.includes('Redis') || error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('👉 REDIS CONNECTION ERROR');
      console.error('   Make sure Redis is running or REDIS_URL is correct');
      console.error('');
    }
    
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();