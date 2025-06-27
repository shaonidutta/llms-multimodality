import { analyzeWithGPT4o, textOnlyCompletion } from './openaiService.js';
import { analyzeWithGemini, geminiTextCompletion } from './geminiService.js';
import { analyzeWithClaude, claudeTextCompletion } from './claudeService.js';
import { APIError } from '../middleware/errorHandler.js';

// Define the fallback chain for multimodal analysis
const MULTIMODAL_FALLBACK_CHAIN = [
  {
    name: 'gpt-4o',
    handler: analyzeWithGPT4o,
    priority: 1,
    description: 'OpenAI GPT-4o Vision'
  },
  {
    name: 'gemini',
    handler: analyzeWithGemini,
    priority: 2,
    description: 'Google Gemini Pro Vision'
  },
  {
    name: 'claude',
    handler: analyzeWithClaude,
    priority: 3,
    description: 'Anthropic Claude 3 Vision'
  }
];

// Define the fallback chain for text-only analysis
const TEXT_FALLBACK_CHAIN = [
  {
    name: 'gpt-3.5-turbo',
    handler: textOnlyCompletion,
    priority: 1,
    description: 'OpenAI GPT-3.5 Turbo'
  },
  {
    name: 'gemini-text',
    handler: geminiTextCompletion,
    priority: 2,
    description: 'Google Gemini Text'
  },
  {
    name: 'claude-text',
    handler: claudeTextCompletion,
    priority: 3,
    description: 'Anthropic Claude 3 Text'
  }
];

// Process multimodal query with fallback chain
export const processMultimodalQuery = async (imagePath, imageUrl, question) => {
  const errors = [];
  let lastError = null;

  console.log(`Starting multimodal analysis with ${MULTIMODAL_FALLBACK_CHAIN.length} services`);

  for (const service of MULTIMODAL_FALLBACK_CHAIN) {
    try {
      console.log(`Attempting ${service.name} (${service.description})...`);
      
      const startTime = Date.now();
      const result = await service.handler(imagePath, imageUrl, question);
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ ${service.name} succeeded in ${responseTime}ms`);
      
      return {
        ...result,
        apiUsed: service.name,
        responseTime,
        fallbackAttempts: errors.length,
        service: service.description
      };
      
    } catch (error) {
      const errorInfo = {
        service: service.name,
        error: error.message,
        type: error.type || 'Unknown',
        timestamp: new Date().toISOString()
      };
      
      errors.push(errorInfo);
      lastError = error;
      
      console.log(`❌ ${service.name} failed: ${error.message}`);
      
      // If this is the last service in the chain, we'll fall back to text-only
      if (service === MULTIMODAL_FALLBACK_CHAIN[MULTIMODAL_FALLBACK_CHAIN.length - 1]) {
        console.log('All multimodal services failed, attempting text-only fallback...');
        
        try {
          const textResult = await processTextOnlyQuery(question, 'Image analysis failed, providing text-only response');
          
          return {
            ...textResult,
            fallbackAttempts: errors.length,
            fallbackReason: 'All multimodal services failed',
            errors: errors
          };
          
        } catch (textError) {
          console.log('❌ Text-only fallback also failed');
          errors.push({
            service: 'text-fallback',
            error: textError.message,
            type: textError.type || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  // If we reach here, all services failed
  throw new APIError(
    'All AI services are currently unavailable. Please try again later.',
    'fallback-service',
    503
  );
};

// Process text-only query with fallback chain
export const processTextOnlyQuery = async (question, context = '') => {
  const errors = [];
  let lastError = null;

  console.log(`Starting text-only analysis with ${TEXT_FALLBACK_CHAIN.length} services`);

  for (const service of TEXT_FALLBACK_CHAIN) {
    try {
      console.log(`Attempting ${service.name} (${service.description})...`);
      
      const startTime = Date.now();
      const result = await service.handler(question, context);
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ ${service.name} succeeded in ${responseTime}ms`);
      
      return {
        ...result,
        apiUsed: service.name,
        responseTime,
        fallbackAttempts: errors.length,
        service: service.description
      };
      
    } catch (error) {
      const errorInfo = {
        service: service.name,
        error: error.message,
        type: error.type || 'Unknown',
        timestamp: new Date().toISOString()
      };
      
      errors.push(errorInfo);
      lastError = error;
      
      console.log(`❌ ${service.name} failed: ${error.message}`);
    }
  }

  // If we reach here, all text services failed
  throw new APIError(
    'All text AI services are currently unavailable. Please try again later.',
    'text-fallback-service',
    503
  );
};

// Get service status for all APIs
export const getServiceStatus = async () => {
  const status = {
    timestamp: new Date().toISOString(),
    multimodal: {},
    textOnly: {},
    overall: 'unknown'
  };

  // Check multimodal services
  for (const service of MULTIMODAL_FALLBACK_CHAIN) {
    try {
      // We can't easily test multimodal without an actual image,
      // so we'll check if the API keys are configured
      const hasKey = checkApiKeyForService(service.name);
      status.multimodal[service.name] = {
        available: hasKey,
        description: service.description,
        priority: service.priority,
        reason: hasKey ? 'API key configured' : 'API key not configured'
      };
    } catch (error) {
      status.multimodal[service.name] = {
        available: false,
        description: service.description,
        priority: service.priority,
        reason: error.message
      };
    }
  }

  // Check text services
  for (const service of TEXT_FALLBACK_CHAIN) {
    try {
      const hasKey = checkApiKeyForService(service.name);
      status.textOnly[service.name] = {
        available: hasKey,
        description: service.description,
        priority: service.priority,
        reason: hasKey ? 'API key configured' : 'API key not configured'
      };
    } catch (error) {
      status.textOnly[service.name] = {
        available: false,
        description: service.description,
        priority: service.priority,
        reason: error.message
      };
    }
  }

  // Determine overall status
  const hasAnyMultimodal = Object.values(status.multimodal).some(s => s.available);
  const hasAnyText = Object.values(status.textOnly).some(s => s.available);
  
  if (hasAnyMultimodal && hasAnyText) {
    status.overall = 'healthy';
  } else if (hasAnyText) {
    status.overall = 'degraded';
  } else {
    status.overall = 'unhealthy';
  }

  return status;
};

// Helper function to check if API key is configured for a service
function checkApiKeyForService(serviceName) {
  switch (serviceName) {
    case 'gpt-4o':
    case 'gpt-3.5-turbo':
      return !!process.env.OPENAI_API_KEY;
    case 'gemini':
    case 'gemini-text':
      return !!process.env.GOOGLE_AI_API_KEY;
    case 'claude':
    case 'claude-text':
      return !!process.env.ANTHROPIC_API_KEY;
    default:
      return false;
  }
}

// Retry logic with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry on certain error types
      if (error.statusCode === 401 || error.statusCode === 400) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt} failed, waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
