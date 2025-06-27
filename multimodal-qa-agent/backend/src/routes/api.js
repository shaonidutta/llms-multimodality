import express from 'express';
import { analyzeImage, textOnlyFallback, getStatus, healthCheck } from '../controllers/qaController.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { validateAnalyzeRequest, validateTextRequest } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Image analysis endpoint
router.post('/analyze', 
  uploadMiddleware.single('image'),
  validateAnalyzeRequest,
  asyncHandler(analyzeImage)
);

// Text-only fallback endpoint
router.post('/text-fallback',
  validateTextRequest,
  asyncHandler(textOnlyFallback)
);

// Service status endpoint
router.get('/status', asyncHandler(getStatus));

// QA service health check
router.get('/qa-health', asyncHandler(healthCheck));

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    endpoints: {
      analyze: {
        method: 'POST',
        path: '/api/analyze',
        description: 'Analyze image with question',
        parameters: {
          image: 'File upload or imageUrl in body',
          question: 'Text question about the image'
        }
      },
      textFallback: {
        method: 'POST',
        path: '/api/text-fallback',
        description: 'Text-only question answering',
        parameters: {
          question: 'Text question',
          context: 'Optional context (e.g., image description)'
        }
      }
    }
  });
});

export default router;
