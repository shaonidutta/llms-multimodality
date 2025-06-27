import { processMultimodalQuery, processTextOnlyQuery, getServiceStatus } from '../services/fallbackService.js';
import { validateImageUrl, sanitizeText } from '../middleware/validation.js';
import { APIError, ValidationError } from '../middleware/errorHandler.js';
import { unlinkSync } from 'fs';

// Main image analysis controller
export const analyzeImage = async (req, res) => {
  const startTime = Date.now();
  let tempFilePath = null;

  try {
    const { question, imageUrl, context } = req.validatedData;
    const hasFile = req.file && req.file.path;
    const hasImageUrl = imageUrl && imageUrl.trim();

    // Sanitize the question
    const sanitizedQuestion = sanitizeText(question);
    if (!sanitizedQuestion) {
      throw new ValidationError('Question cannot be empty');
    }

    // Store temp file path for cleanup
    if (hasFile) {
      tempFilePath = req.file.path;
    }

    // Validate image URL if provided
    if (hasImageUrl) {
      await validateImageUrl(imageUrl);
    }

    console.log(`Processing multimodal query: "${sanitizedQuestion.substring(0, 50)}..."`);
    console.log(`Image source: ${hasFile ? 'file upload' : 'URL'}`);

    // Process the multimodal query
    const result = await processMultimodalQuery(
      hasFile ? req.file.path : null,
      hasImageUrl ? imageUrl : null,
      sanitizedQuestion
    );

    const totalTime = Date.now() - startTime;

    // Prepare response
    const response = {
      success: true,
      data: {
        answer: result.answer,
        question: sanitizedQuestion,
        apiUsed: result.apiUsed,
        service: result.service,
        model: result.model,
        confidence: result.confidence,
        responseTime: totalTime,
        fallbackAttempts: result.fallbackAttempts || 0,
        imageSource: hasFile ? 'upload' : 'url'
      },
      timestamp: new Date().toISOString()
    };

    // Add additional metadata if available
    if (result.usage) {
      response.data.usage = result.usage;
    }

    if (result.fallbackReason) {
      response.data.fallbackReason = result.fallbackReason;
    }

    console.log(`✅ Analysis completed in ${totalTime}ms using ${result.apiUsed}`);
    res.json(response);

  } catch (error) {
    console.error('Error in analyzeImage:', error);

    const totalTime = Date.now() - startTime;
    
    // Prepare error response
    const errorResponse = {
      success: false,
      error: {
        type: error.type || 'AnalysisError',
        message: error.message || 'Failed to analyze image',
        service: error.service || 'unknown'
      },
      responseTime: totalTime,
      timestamp: new Date().toISOString()
    };

    // Add additional error details if available
    if (error.errors) {
      errorResponse.error.attempts = error.errors;
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(errorResponse);

  } finally {
    // Clean up uploaded file
    if (tempFilePath) {
      try {
        unlinkSync(tempFilePath);
        console.log(`Cleaned up temp file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
  }
};

// Text-only fallback controller
export const textOnlyFallback = async (req, res) => {
  const startTime = Date.now();

  try {
    const { question, context } = req.validatedData;

    // Sanitize inputs
    const sanitizedQuestion = sanitizeText(question);
    const sanitizedContext = context ? sanitizeText(context) : '';

    if (!sanitizedQuestion) {
      throw new ValidationError('Question cannot be empty');
    }

    console.log(`Processing text-only query: "${sanitizedQuestion.substring(0, 50)}..."`);

    // Process the text-only query
    const result = await processTextOnlyQuery(sanitizedQuestion, sanitizedContext);

    const totalTime = Date.now() - startTime;

    // Prepare response
    const response = {
      success: true,
      data: {
        answer: result.answer,
        question: sanitizedQuestion,
        context: sanitizedContext,
        apiUsed: result.apiUsed,
        service: result.service,
        model: result.model,
        confidence: result.confidence,
        responseTime: totalTime,
        fallbackAttempts: result.fallbackAttempts || 0,
        type: 'text-only'
      },
      timestamp: new Date().toISOString()
    };

    // Add usage information if available
    if (result.usage) {
      response.data.usage = result.usage;
    }

    console.log(`✅ Text analysis completed in ${totalTime}ms using ${result.apiUsed}`);
    res.json(response);

  } catch (error) {
    console.error('Error in textOnlyFallback:', error);

    const totalTime = Date.now() - startTime;
    
    const errorResponse = {
      success: false,
      error: {
        type: error.type || 'TextAnalysisError',
        message: error.message || 'Failed to process text query',
        service: error.service || 'unknown'
      },
      responseTime: totalTime,
      timestamp: new Date().toISOString()
    };

    if (error.errors) {
      errorResponse.error.attempts = error.errors;
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json(errorResponse);
  }
};

// Service status controller
export const getStatus = async (req, res) => {
  try {
    const status = await getServiceStatus();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting service status:', error);
    
    res.status(500).json({
      success: false,
      error: {
        type: 'StatusError',
        message: 'Failed to get service status'
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Health check for the QA service specifically
export const healthCheck = async (req, res) => {
  try {
    const health = {
      service: 'multimodal-qa',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      },
      apis: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GOOGLE_AI_API_KEY,
        claude: !!process.env.ANTHROPIC_API_KEY
      }
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        type: 'HealthCheckError',
        message: 'Health check failed'
      }
    });
  }
};
