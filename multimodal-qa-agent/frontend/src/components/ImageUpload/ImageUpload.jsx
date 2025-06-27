import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { validateImageFile, formatFileSize } from '../../services/api';

const ImageUpload = ({ onImageUpload, onImageUrl, image, imageUrl, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState(imageUrl || '');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [previewUrl, setPreviewUrl] = useState(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      alert(`File rejected: ${error.message}`);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      try {
        validateImageFile(file);
        
        // Create preview URL
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);
        
        onImageUpload(file);
        setUploadMode('file');
      } catch (error) {
        alert(error.message);
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled
  });

  // Handle URL input
  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    try {
      new URL(urlInput); // Validate URL format
      onImageUrl(urlInput);
      setUploadMode('url');
      setPreviewUrl(null); // Clear file preview
    } catch (error) {
      alert('Please enter a valid URL');
    }
  };

  // Clear image
  const clearImage = () => {
    onImageUpload(null);
    onImageUrl('');
    setUrlInput('');
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Get display image URL
  const getDisplayImageUrl = () => {
    if (uploadMode === 'file' && previewUrl) {
      return previewUrl;
    }
    if (uploadMode === 'url' && imageUrl) {
      return imageUrl;
    }
    return null;
  };

  const displayImageUrl = getDisplayImageUrl();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Upload Image</h3>
        
        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setUploadMode('file')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              uploadMode === 'file' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={disabled}
          >
            File Upload
          </button>
          <button
            onClick={() => setUploadMode('url')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              uploadMode === 'url' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={disabled}
          >
            Image URL
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {uploadMode === 'file' ? (
          <motion.div
            key="file-upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* File Upload Area */}
            <div
              {...getRootProps()}
              className={`card p-8 border-2 border-dashed cursor-pointer transition-all duration-300 ${
                isDragActive || dragActive
                  ? 'border-primary-400 bg-primary-50'
                  : image
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-primary-300 hover:bg-primary-25'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              
              <div className="text-center space-y-4">
                {displayImageUrl ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={displayImageUrl}
                        alt="Preview"
                        className="max-w-full max-h-48 rounded-lg shadow-soft"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        disabled={disabled}
                      >
                        ×
                      </button>
                    </div>
                    {image && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{image.name}</p>
                        <p>{formatFileSize(image.size)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {isDragActive ? 'Drop the image here' : 'Drag & drop an image'}
                      </p>
                      <p className="text-gray-600">or click to browse</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports JPEG, PNG, WebP, GIF (max 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="url-input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* URL Input */}
            <div className="card p-6 space-y-4">
              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="input-field flex-1"
                  disabled={disabled}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlSubmit();
                    }
                  }}
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim() || disabled}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load
                </button>
              </div>
              
              {imageUrl && (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-w-full max-h-48 rounded-lg shadow-soft"
                      onError={() => alert('Failed to load image from URL')}
                    />
                    <button
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={disabled}
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 break-all">{imageUrl}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;
