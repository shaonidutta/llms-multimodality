import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment configuration
export const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // API Keys
  openaiApiKey: process.env.OPENAI_API_KEY,
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // File upload configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  allowedFormats: (process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,webp,gif').split(','),
  tempDir: process.env.TEMP_DIR || './temp',

  // API configuration
  apiTimeout: parseInt(process.env.API_TIMEOUT) || 30000, // 30 seconds
  maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
  retryDelay: parseInt(process.env.RETRY_DELAY) || 1000, // 1 second

  // Security configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Feature flags
  enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
  enableDetailedLogging: process.env.ENABLE_DETAILED_LOGGING === 'true',
  enableMetrics: process.env.ENABLE_METRICS === 'true'
};

// Validate required environment variables
export const validateEnvironment = () => {
  const errors = [];
  const warnings = [];

  // Check if at least one AI API key is configured
  if (!config.openaiApiKey && !config.googleAiApiKey && !config.anthropicApiKey) {
    if (config.nodeEnv === 'production') {
      errors.push('At least one AI API key must be configured (OPENAI_API_KEY, GOOGLE_AI_API_KEY, or ANTHROPIC_API_KEY)');
    } else {
      warnings.push('No AI API keys configured. Add real API keys to test the functionality.');
    }
  }

  // Warn about test/placeholder keys
  if (config.openaiApiKey && config.openaiApiKey.includes('test-key')) {
    warnings.push('OpenAI API key appears to be a placeholder. Replace with a real API key.');
  }

  // Validate numeric values
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }

  if (config.maxFileSize < 1024 || config.maxFileSize > 100 * 1024 * 1024) {
    errors.push('MAX_FILE_SIZE must be between 1KB and 100MB');
  }

  // Validate allowed formats
  const validFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const invalidFormats = config.allowedFormats.filter(format => !validFormats.includes(format.toLowerCase()));
  if (invalidFormats.length > 0) {
    errors.push(`Invalid file formats: ${invalidFormats.join(', ')}. Allowed: ${validFormats.join(', ')}`);
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Environment validation failed');
  }

  console.log('✅ Environment validation passed');
};

// Get configuration summary (without sensitive data)
export const getConfigSummary = () => {
  return {
    server: {
      port: config.port,
      environment: config.nodeEnv,
      frontendUrl: config.frontendUrl
    },
    apis: {
      openai: !!config.openaiApiKey,
      gemini: !!config.googleAiApiKey,
      claude: !!config.anthropicApiKey
    },
    fileUpload: {
      maxSize: `${Math.round(config.maxFileSize / 1024 / 1024)}MB`,
      allowedFormats: config.allowedFormats,
      tempDir: config.tempDir
    },
    features: {
      rateLimit: config.enableRateLimit,
      detailedLogging: config.enableDetailedLogging,
      metrics: config.enableMetrics
    }
  };
};
