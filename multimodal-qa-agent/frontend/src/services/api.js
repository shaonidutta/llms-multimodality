import axios from 'axios';

// API base URL - adjust based on your backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const errorMessage = data?.error?.message || data?.message || `Server error (${status})`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Analyze image with question
export const analyzeImage = async (imageFile, imageUrl, question) => {
  try {
    const formData = new FormData();
    
    // Add the question
    formData.append('question', question.trim());
    
    // Add image file or URL
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl) {
      formData.append('imageUrl', imageUrl.trim());
    } else {
      throw new Error('Either image file or image URL must be provided');
    }

    const response = await apiClient.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error?.message || 'Analysis failed');
    }
  } catch (error) {
    console.error('Image analysis error:', error);
    throw error;
  }
};

// Text-only fallback
export const textOnlyFallback = async (question, context = '') => {
  try {
    const response = await apiClient.post('/text-fallback', {
      question: question.trim(),
      context: context.trim()
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error?.message || 'Text analysis failed');
    }
  } catch (error) {
    console.error('Text fallback error:', error);
    throw error;
  }
};

// Get service status
export const getServiceStatus = async () => {
  try {
    const response = await apiClient.get('/status');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to get service status');
    }
  } catch (error) {
    console.error('Service status error:', error);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const response = await apiClient.get('/test');
    return response.data;
  } catch (error) {
    console.error('Connection test error:', error);
    throw error;
  }
};

// Utility function to validate image file
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!file) {
    throw new Error('No file provided');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }

  return true;
};

// Utility function to validate image URL
export const validateImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL');
  }

  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Check if URL looks like an image
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const urlLower = url.toLowerCase();
  const hasImageExtension = imageExtensions.some(ext => urlLower.includes(ext));
  
  if (!hasImageExtension && !urlLower.includes('image')) {
    console.warn('URL may not point to an image file');
  }

  return true;
};

// Utility function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  analyzeImage,
  textOnlyFallback,
  getServiceStatus,
  healthCheck,
  testConnection,
  validateImageFile,
  validateImageUrl,
  formatFileSize
};
