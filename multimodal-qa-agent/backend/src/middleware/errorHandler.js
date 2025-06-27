// Error types
export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.type = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

export class APIError extends Error {
  constructor(message, service = null, statusCode = 500) {
    super(message);
    this.name = 'APIError';
    this.type = 'APIError';
    this.service = service;
    this.statusCode = statusCode;
  }
}

export class FileError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'FileError';
    this.type = 'FileError';
    this.details = details;
    this.statusCode = 400;
  }
}

export class NetworkError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'NetworkError';
    this.type = 'NetworkError';
    this.details = details;
    this.statusCode = 503;
  }
}

// Main error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    success: false,
    error: {
      type: 'InternalServerError',
      message: 'An unexpected error occurred'
    }
  };

  // Handle specific error types
  if (err instanceof ValidationError || err instanceof FileError) {
    statusCode = err.statusCode;
    errorResponse.error = {
      type: err.type,
      message: err.message,
      details: err.details
    };
  } else if (err instanceof APIError) {
    statusCode = err.statusCode;
    errorResponse.error = {
      type: err.type,
      message: err.message,
      service: err.service
    };
  } else if (err instanceof NetworkError) {
    statusCode = err.statusCode;
    errorResponse.error = {
      type: err.type,
      message: err.message,
      details: err.details
    };
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    errorResponse.error = {
      type: 'FileUploadError',
      message: getMulterErrorMessage(err.code),
      details: err.message
    };
  } else if (err.name === 'ValidationError' && err.details) {
    // Joi validation error
    statusCode = 400;
    errorResponse.error = {
      type: 'ValidationError',
      message: 'Invalid input data',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }

  // Add request ID if available
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(statusCode).json(errorResponse);
};

// Helper function for Multer errors
function getMulterErrorMessage(code) {
  switch (code) {
    case 'LIMIT_FILE_SIZE':
      return 'File size too large. Maximum size is 10MB.';
    case 'LIMIT_FILE_COUNT':
      return 'Too many files uploaded.';
    case 'LIMIT_UNEXPECTED_FILE':
      return 'Unexpected file field.';
    case 'LIMIT_PART_COUNT':
      return 'Too many parts in multipart form.';
    case 'LIMIT_FIELD_KEY':
      return 'Field name too long.';
    case 'LIMIT_FIELD_VALUE':
      return 'Field value too long.';
    case 'LIMIT_FIELD_COUNT':
      return 'Too many fields.';
    default:
      return 'File upload error occurred.';
  }
}

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
