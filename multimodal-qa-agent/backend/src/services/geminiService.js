import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync } from 'fs';
import { APIError } from '../middleware/errorHandler.js';

// Initialize Gemini client
let genAI;
if (process.env.GOOGLE_AI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}

// Convert image file to Gemini format
const fileToGenerativePart = (imagePath) => {
  try {
    const imageBuffer = readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Get MIME type from file extension
    const extension = imagePath.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };
    
    return {
      inlineData: {
        data: base64Image,
        mimeType: mimeTypes[extension] || 'image/jpeg'
      }
    };
  } catch (error) {
    throw new APIError('Failed to process image file for Gemini', 'gemini');
  }
};

// Convert image URL to Gemini format
const urlToGenerativePart = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      inlineData: {
        data: base64Image,
        mimeType: contentType
      }
    };
  } catch (error) {
    throw new APIError('Failed to fetch image from URL for Gemini', 'gemini');
  }
};

// Analyze image with Gemini Pro Vision
export const analyzeWithGemini = async (imagePath, imageUrl, question) => {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new APIError('Google AI API key not configured', 'gemini', 503);
    }

    if (!genAI) {
      throw new APIError('Gemini client not initialized', 'gemini', 503);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let imagePart;
    if (imagePath) {
      imagePart = fileToGenerativePart(imagePath);
    } else if (imageUrl) {
      imagePart = await urlToGenerativePart(imageUrl);
    } else {
      throw new APIError('No image provided', 'gemini', 400);
    }

    const prompt = `Please analyze this image and answer the following question: ${question}

Provide a detailed and accurate response based on what you can observe in the image. If you cannot see certain details clearly, please mention that in your response.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new APIError('No response from Gemini API', 'gemini');
    }

    return {
      answer: text,
      model: 'gemini-1.5-flash',
      confidence: 'high'
    };

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle Gemini specific errors
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new APIError('Invalid Google AI API key', 'gemini', 401);
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new APIError('Gemini API quota exceeded', 'gemini', 429);
    } else if (error.message?.includes('SAFETY')) {
      throw new APIError('Content blocked by Gemini safety filters', 'gemini', 400);
    }
    
    throw new APIError('Gemini API request failed', 'gemini');
  }
};

// Text-only completion with Gemini
export const geminiTextCompletion = async (question, context = '') => {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new APIError('Google AI API key not configured', 'gemini', 503);
    }

    if (!genAI) {
      throw new APIError('Gemini client not initialized', 'gemini', 503);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${question}\n\nPlease provide a helpful answer based on the context provided.`
      : `Question: ${question}\n\nPlease provide a helpful and informative answer.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new APIError('No response from Gemini API', 'gemini');
    }

    return {
      answer: text,
      model: 'gemini-1.5-flash',
      confidence: 'medium'
    };

  } catch (error) {
    console.error('Gemini Text API Error:', error);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new APIError('Invalid Google AI API key', 'gemini', 401);
    }
    
    throw new APIError('Gemini text API request failed', 'gemini');
  }
};

// Check if Gemini service is available
export const checkGeminiAvailability = async () => {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return { available: false, reason: 'API key not configured' };
    }

    if (!genAI) {
      return { available: false, reason: 'Client not initialized' };
    }

    // Simple test request
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent("Hello");

    return { available: true };
  } catch (error) {
    return { 
      available: false, 
      reason: error.message || 'Service unavailable' 
    };
  }
};
