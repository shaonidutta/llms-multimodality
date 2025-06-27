# Multimodal QA Agent API Documentation

## Overview

The Multimodal QA Agent provides REST API endpoints for analyzing images and answering questions about them using state-of-the-art Vision + Language models.

## Base URL

```
http://localhost:5001/api
```

## Authentication

No authentication required for local development. API keys are configured server-side.

## Endpoints

### 1. Health Check

**GET** `/health`

Returns the health status of the API service.

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-06-27T16:30:00.000Z",
  "uptime": 123.45,
  "status": "healthy",
  "service": "multimodal-qa-backend",
  "version": "1.0.0",
  "environment": "development",
  "memory": {
    "used": 45.67,
    "total": 89.12,
    "external": 12.34
  },
  "apis": {
    "openai": true,
    "gemini": false,
    "claude": false
  }
}
```

### 2. Service Status

**GET** `/status`

Returns detailed status of all AI services.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-06-27T16:30:00.000Z",
    "multimodal": {
      "gpt-4o": {
        "available": true,
        "description": "OpenAI GPT-4o Vision",
        "priority": 1,
        "reason": "API key configured"
      },
      "gemini": {
        "available": false,
        "description": "Google Gemini Pro Vision",
        "priority": 2,
        "reason": "API key not configured"
      }
    },
    "textOnly": {
      "gpt-3.5-turbo": {
        "available": true,
        "description": "OpenAI GPT-3.5 Turbo",
        "priority": 1,
        "reason": "API key configured"
      }
    },
    "overall": "healthy"
  }
}
```

### 3. Analyze Image

**POST** `/analyze`

Analyzes an image and answers a question about it.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `image` (file, optional): Image file to analyze (max 10MB)
- `imageUrl` (string, optional): URL of image to analyze
- `question` (string, required): Question about the image (3-1000 characters)
- `context` (string, optional): Additional context (max 2000 characters)

**Note:** Either `image` or `imageUrl` must be provided.

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/analyze \
  -F "image=@/path/to/image.jpg" \
  -F "question=What objects can you see in this image?"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "answer": "I can see a red car, a blue bicycle, and a green tree in this image. The car appears to be parked on a street, and the bicycle is leaning against the tree.",
    "question": "What objects can you see in this image?",
    "apiUsed": "gpt-4o",
    "service": "OpenAI GPT-4o Vision",
    "model": "gpt-4o",
    "confidence": "high",
    "responseTime": 2340,
    "fallbackAttempts": 0,
    "imageSource": "upload",
    "usage": {
      "prompt_tokens": 1234,
      "completion_tokens": 56,
      "total_tokens": 1290
    }
  },
  "timestamp": "2025-06-27T16:30:00.000Z"
}
```

### 4. Text-Only Fallback

**POST** `/text-fallback`

Provides text-only question answering when image analysis is not available.

**Content-Type:** `application/json`

**Parameters:**
- `question` (string, required): Question to answer (3-1000 characters)
- `context` (string, optional): Additional context (max 2000 characters)

**Example Request:**
```bash
curl -X POST http://localhost:5001/api/text-fallback \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the main features of a modern car?",
    "context": "Image analysis failed"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Modern cars typically include features like advanced safety systems, infotainment displays, GPS navigation, automatic transmission, air conditioning, and fuel-efficient engines.",
    "question": "What are the main features of a modern car?",
    "context": "Image analysis failed",
    "apiUsed": "gpt-3.5-turbo",
    "service": "OpenAI GPT-3.5 Turbo",
    "model": "gpt-3.5-turbo",
    "confidence": "medium",
    "responseTime": 1200,
    "fallbackAttempts": 0,
    "type": "text-only"
  },
  "timestamp": "2025-06-27T16:30:00.000Z"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "type": "ValidationError",
    "message": "Question is required",
    "details": [
      {
        "field": "question",
        "message": "Question must be at least 3 characters long"
      }
    ]
  },
  "responseTime": 45,
  "timestamp": "2025-06-27T16:30:00.000Z"
}
```

### Error Types

- **ValidationError** (400): Invalid input data
- **FileError** (400): Invalid file upload
- **APIError** (500/503): External AI service error
- **NetworkError** (503): Connection issues
- **NotFound** (404): Endpoint not found

## Rate Limits

- 100 requests per 15-minute window per IP address
- File uploads limited to 10MB
- Supported image formats: JPEG, PNG, WebP, GIF

## Fallback Logic

The system implements intelligent fallback:

1. **Primary**: OpenAI GPT-4o (best vision capabilities)
2. **Secondary**: Google Gemini Pro Vision
3. **Tertiary**: Anthropic Claude 3 Vision
4. **Final Fallback**: Text-only response with context

## Usage Examples

### Upload Image File
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('question', 'Describe this image');

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});
```

### Use Image URL
```javascript
const formData = new FormData();
formData.append('imageUrl', 'https://example.com/image.jpg');
formData.append('question', 'What colors are in this image?');

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});
```

### Text-Only Fallback
```javascript
const response = await fetch('/api/text-fallback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'What is artificial intelligence?',
    context: 'General knowledge question'
  })
});
```
