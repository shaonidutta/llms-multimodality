import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { APIError } from '../middleware/errorHandler.js';

// Initialize Anthropic client
let anthropic;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

// Convert image to base64 for Claude
const imageToBase64 = (imagePath) => {
  try {
    const imageBuffer = readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new APIError('Failed to process image file for Claude', 'claude');
  }
};

// Get media type for Claude
const getMediaType = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  const mediaTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  };
  return mediaTypes[extension] || 'image/jpeg';
};

// Fetch image from URL and convert to base64
const fetchImageAsBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return { base64Image, mediaType: contentType };
  } catch (error) {
    throw new APIError('Failed to fetch image from URL for Claude', 'claude');
  }
};

// Analyze image with Claude 3
export const analyzeWithClaude = async (imagePath, imageUrl, question) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new APIError('Anthropic API key not configured', 'claude', 503);
    }

    if (!anthropic) {
      throw new APIError('Claude client not initialized', 'claude', 503);
    }

    let base64Image, mediaType;

    if (imagePath) {
      base64Image = imageToBase64(imagePath);
      mediaType = getMediaType(imagePath);
    } else if (imageUrl) {
      const result = await fetchImageAsBase64(imageUrl);
      base64Image = result.base64Image;
      mediaType = result.mediaType;
    } else {
      throw new APIError('No image provided', 'claude', 400);
    }

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Please analyze this image and answer the following question: ${question}

Provide a detailed and accurate response based on what you can observe in the image. If you cannot see certain details clearly, please mention that in your response.`
            }
          ],
        }
      ],
    });

    if (!message.content || message.content.length === 0) {
      throw new APIError('No response from Claude API', 'claude');
    }

    return {
      answer: message.content[0].text,
      model: 'claude-3-sonnet',
      usage: message.usage,
      confidence: 'high'
    };

  } catch (error) {
    console.error('Claude API Error:', error);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle Claude specific errors
    if (error.status === 401) {
      throw new APIError('Invalid Anthropic API key', 'claude', 401);
    } else if (error.status === 429) {
      throw new APIError('Claude API rate limit exceeded', 'claude', 429);
    } else if (error.status === 400) {
      throw new APIError('Invalid request to Claude API', 'claude', 400);
    } else if (error.status >= 500) {
      throw new APIError('Claude API server error', 'claude', 503);
    }
    
    throw new APIError('Claude API request failed', 'claude');
  }
};

// Text-only completion with Claude
export const claudeTextCompletion = async (question, context = '') => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new APIError('Anthropic API key not configured', 'claude', 503);
    }

    if (!anthropic) {
      throw new APIError('Claude client not initialized', 'claude', 503);
    }

    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${question}\n\nPlease provide a helpful answer based on the context provided.`
      : `Question: ${question}\n\nPlease provide a helpful and informative answer.`;

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 300,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    });

    if (!message.content || message.content.length === 0) {
      throw new APIError('No response from Claude API', 'claude');
    }

    return {
      answer: message.content[0].text,
      model: 'claude-3-sonnet',
      usage: message.usage,
      confidence: 'medium'
    };

  } catch (error) {
    console.error('Claude Text API Error:', error);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error.status === 401) {
      throw new APIError('Invalid Anthropic API key', 'claude', 401);
    }
    
    throw new APIError('Claude text API request failed', 'claude');
  }
};

// Check if Claude service is available
export const checkClaudeAvailability = async () => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { available: false, reason: 'API key not configured' };
    }

    if (!anthropic) {
      return { available: false, reason: 'Client not initialized' };
    }

    // Simple test request
    await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 5,
      messages: [{ role: "user", content: "Hello" }]
    });

    return { available: true };
  } catch (error) {
    return { 
      available: false, 
      reason: error.message || 'Service unavailable' 
    };
  }
};
