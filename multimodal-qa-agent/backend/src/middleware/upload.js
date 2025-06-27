import multer from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { FileError } from './errorHandler.js';

// Create temp directory if it doesn't exist
const tempDir = process.env.TEMP_DIR || './temp';
if (!existsSync(tempDir)) {
  mkdirSync(tempDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, `upload-${uniqueSuffix}.${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedFormats = (process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,webp,gif').split(',');
  const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
  
  if (!fileExtension) {
    return cb(new FileError('File must have an extension'), false);
  }
  
  if (!allowedFormats.includes(fileExtension)) {
    return cb(new FileError(`File format not supported. Allowed formats: ${allowedFormats.join(', ')}`), false);
  }
  
  // Check MIME type as additional security
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new FileError('Invalid file type. Only image files are allowed.'), false);
  }
  
  cb(null, true);
};

// Configure multer
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1, // Only allow 1 file
    fields: 10, // Limit number of fields
    fieldNameSize: 100, // Limit field name size
    fieldSize: 1024 * 1024 // 1MB field size limit
  }
});

// Cleanup middleware - removes uploaded files after processing
export const cleanupMiddleware = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  const cleanup = () => {
    if (req.file && req.file.path) {
      import('fs').then(fs => {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Error cleaning up uploaded file:', err);
          } else {
            console.log('Cleaned up uploaded file:', req.file.path);
          }
        });
      });
    }
  };
  
  res.send = function(data) {
    cleanup();
    originalSend.call(this, data);
  };
  
  res.json = function(data) {
    cleanup();
    originalJson.call(this, data);
  };
  
  next();
};

// Memory storage for temporary processing (alternative to disk storage)
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    files: 1
  }
});
