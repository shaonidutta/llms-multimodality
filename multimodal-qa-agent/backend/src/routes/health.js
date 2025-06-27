import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  const healthCheck = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'healthy',
    service: 'multimodal-qa-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
    },
    apis: {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GOOGLE_AI_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY
    }
  };

  res.json(healthCheck);
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      status: 'healthy',
      service: 'multimodal-qa-backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100,
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100
      },
      apis: {
        openai: {
          configured: !!process.env.OPENAI_API_KEY,
          keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
        },
        gemini: {
          configured: !!process.env.GOOGLE_AI_API_KEY,
          keyLength: process.env.GOOGLE_AI_API_KEY ? process.env.GOOGLE_AI_API_KEY.length : 0
        },
        claude: {
          configured: !!process.env.ANTHROPIC_API_KEY,
          keyLength: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0
        }
      },
      configuration: {
        port: process.env.PORT || 5000,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        maxFileSize: process.env.MAX_FILE_SIZE || '10485760',
        allowedFormats: process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,webp,gif'
      }
    };

    res.json(detailedHealth);
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
