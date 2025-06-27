import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { APIError } from '../middleware/errorHandler.js';

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Convert image to base64
const imageToBase64 = (imagePath) => {
  try {
    const imageBuffer = readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return base64Image;
  } catch (error) {
    throw new APIError('Failed to process image file', 'openai');
  }
};

// Get image MIME type from file extension
const getImageMimeType = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  };
  return mimeTypes[extension] || 'image/jpeg';
};

// Analyze image with GPT-4o Vision
export const analyzeWithGPT4o = async (imagePath, imageUrl, question) => {
  try {
    if (!process.env.OPENAI_API_KEY || !openai) {
      throw new APIError('OpenAI API key not configured', 'openai', 503);
    }

    let imageContent;
    
    if (imagePath) {
      // Handle file upload
      const base64Image = imageToBase64(imagePath);
      const mimeType = getImageMimeType(imagePath);
      imageContent = {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64Image}`,
          detail: "high"
        }
      };
    } else if (imageUrl) {
      // Handle image URL
      imageContent = {
        type: "image_url",
        image_url: {
          url: imageUrl,
          detail: "high"
        }
      };
    } else {
      throw new APIError('No image provided', 'openai', 400);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this image and answer the following question: ${question}
              
              Provide a detailed and accurate response based on what you can observe in the image. If you cannot see certain details clearly, please mention that in your response.`
            },
            imageContent
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new APIError('No response from OpenAI API', 'openai');
    }

    return {
      answer: response.choices[0].message.content,
      model: 'gpt-4o',
      usage: response.usage,
      confidence: 'high'
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle OpenAI specific errors
    if (error.status === 401) {
      throw new APIError('Invalid OpenAI API key', 'openai', 401);
    } else if (error.status === 429) {
      throw new APIError('OpenAI API rate limit exceeded', 'openai', 429);
    } else if (error.status === 400) {
      throw new APIError('Invalid request to OpenAI API', 'openai', 400);
    } else if (error.status >= 500) {
      throw new APIError('OpenAI API server error', 'openai', 503);
    }
    
    throw new APIError('OpenAI API request failed', 'openai');
  }
};

// Text-only completion with GPT-3.5-turbo (fallback)
export const textOnlyCompletion = async (question, context = '') => {
  try {
    if (!process.env.OPENAI_API_KEY || !openai) {
      throw new APIError('OpenAI API key not configured', 'openai', 503);
    }

    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${question}\n\nPlease provide a helpful answer based on the context provided.`
      : `Question: ${question}\n\nPlease provide a helpful and informative answer.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new APIError('No response from OpenAI API', 'openai');
    }

    return {
      answer: response.choices[0].message.content,
      model: 'gpt-3.5-turbo',
      usage: response.usage,
      confidence: 'medium'
    };

  } catch (error) {
    console.error('OpenAI Text API Error:', error);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error.status === 401) {
      throw new APIError('Invalid OpenAI API key', 'openai', 401);
    } else if (error.status === 429) {
      throw new APIError('OpenAI API rate limit exceeded', 'openai', 429);
    }
    
    throw new APIError('OpenAI text API request failed', 'openai');
  }
};

// Check if OpenAI service is available
export const checkOpenAIAvailability = async () => {
  try {
    if (!process.env.OPENAI_API_KEY || !openai) {
      return { available: false, reason: 'API key not configured' };
    }

    // Simple test request
    await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    });

    return { available: true };
  } catch (error) {
    return {
      available: false,
      reason: error.message || 'Service unavailable'
    };
  }
};
