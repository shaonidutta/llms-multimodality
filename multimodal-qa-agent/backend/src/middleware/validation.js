import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

// Schema for image analysis request
const analyzeSchema = Joi.object({
  question: Joi.string()
    .min(3)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Question is required',
      'string.min': 'Question must be at least 3 characters long',
      'string.max': 'Question must not exceed 1000 characters',
      'any.required': 'Question is required'
    }),
  
  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Image URL must be a valid URL'
    }),
    
  context: Joi.string()
    .max(2000)
    .optional()
    .messages({
      'string.max': 'Context must not exceed 2000 characters'
    })
});

// Schema for text-only request
const textSchema = Joi.object({
  question: Joi.string()
    .min(3)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Question is required',
      'string.min': 'Question must be at least 3 characters long',
      'string.max': 'Question must not exceed 1000 characters',
      'any.required': 'Question is required'
    }),
    
  context: Joi.string()
    .max(2000)
    .optional()
    .messages({
      'string.max': 'Context must not exceed 2000 characters'
    })
});

// Validate analyze request
export const validateAnalyzeRequest = (req, res, next) => {
  try {
    // Check if we have either a file upload or imageUrl
    const hasFile = req.file && req.file.path;
    const hasImageUrl = req.body.imageUrl && req.body.imageUrl.trim();
    
    if (!hasFile && !hasImageUrl) {
      throw new ValidationError('Either upload an image file or provide an image URL');
    }
    
    // Validate the request body
    const { error, value } = analyzeSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      throw new ValidationError('Invalid request data', error.details);
    }
    
    // Add validated data to request
    req.validatedData = value;
    req.validatedData.hasFile = hasFile;
    req.validatedData.hasImageUrl = hasImageUrl;
    
    next();
  } catch (err) {
    next(err);
  }
};

// Validate text-only request
export const validateTextRequest = (req, res, next) => {
  try {
    const { error, value } = textSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      throw new ValidationError('Invalid request data', error.details);
    }
    
    req.validatedData = value;
    next();
  } catch (err) {
    next(err);
  }
};

// Validate image URL format and accessibility
export const validateImageUrl = async (url) => {
  try {
    // Basic URL validation
    new URL(url);
    
    // Check if URL points to an image
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const urlPath = new URL(url).pathname.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => urlPath.endsWith(`.${ext}`));
    
    if (!hasImageExtension) {
      // Try to check content-type via HEAD request
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.startsWith('image/')) {
          throw new ValidationError('URL does not point to a valid image');
        }
      } catch (fetchError) {
        throw new ValidationError('Unable to access the image URL');
      }
    }
    
    return true;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid image URL format');
  }
};

// Sanitize text input
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, 1000); // Ensure max length
};

// Validate file size and type (additional check)
export const validateUploadedFile = (file) => {
  if (!file) {
    throw new ValidationError('No file uploaded');
  }
  
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new ValidationError(`File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png', 
    'image/webp',
    'image/gif'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError('Invalid file type. Only image files are allowed.');
  }
  
  return true;
};
