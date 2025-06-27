# Multimodal QA Agent Setup Guide

## Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** (for cloning the repository)
- At least one AI API key (OpenAI, Google AI, or Anthropic)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd multimodal-qa-agent
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install root dependencies (optional)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend Environment

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# API Keys - At least one is required
OPENAI_API_KEY=sk-your-openai-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Server Configuration
PORT=5001
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FORMATS=jpg,jpeg,png,webp,gif
TEMP_DIR=./temp

# API Configuration
API_TIMEOUT=30000
MAX_RETRIES=3
RETRY_DELAY=1000

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### Frontend Environment

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

Edit the `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# Development Configuration
VITE_DEV_MODE=true
VITE_ENABLE_LOGGING=true

# Feature Flags
VITE_ENABLE_3D_LOADING=true
VITE_ENABLE_ANIMATIONS=true
```

## Getting API Keys

### OpenAI API Key (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

**Note**: GPT-4o requires a paid OpenAI account with sufficient credits.

### Google AI API Key (Optional)

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

### Anthropic API Key (Optional)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Running the Application

### Development Mode

Start both frontend and backend in development mode:

#### Option 1: Start Both Services (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both the backend server and frontend development server.

#### Option 2: Start Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Mode

Build and start the application for production:

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

## Verification

### 1. Check Backend Health

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "apis": {
    "openai": true,
    "gemini": false,
    "claude": false
  }
}
```

### 2. Check Service Status

```bash
curl http://localhost:5001/api/status
```

### 3. Test Image Analysis

```bash
curl -X POST http://localhost:5001/api/analyze \
  -F "imageUrl=https://example.com/test-image.jpg" \
  -F "question=What do you see in this image?"
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

If you get `EADDRINUSE` error:

```bash
# Change the port in backend/.env
PORT=5002
```

#### 2. API Key Issues

- Ensure API keys are valid and have sufficient credits
- Check that at least one API key is configured
- Verify the key format (OpenAI keys start with `sk-`)

#### 3. CORS Errors

- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that `VITE_API_URL` in frontend `.env` points to the correct backend

#### 4. File Upload Issues

- Check file size (max 10MB)
- Verify file format (JPEG, PNG, WebP, GIF)
- Ensure temp directory exists and is writable

#### 5. Module Not Found Errors

```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Debug Mode

Enable detailed logging:

```env
# Backend .env
ENABLE_DETAILED_LOGGING=true

# Frontend .env
VITE_ENABLE_LOGGING=true
```

### Checking Logs

Backend logs will show:
- API requests and responses
- Fallback attempts
- Error details
- Performance metrics

Frontend logs (browser console) will show:
- API calls
- Component state changes
- Error messages

## Performance Optimization

### Backend

- Use environment variables for configuration
- Enable compression for large responses
- Implement caching for repeated requests
- Monitor memory usage

### Frontend

- Enable production build optimizations
- Use lazy loading for components
- Optimize image loading
- Minimize bundle size

## Security Considerations

- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement rate limiting in production
- Validate all user inputs
- Use HTTPS in production

## Deployment

### Backend Deployment

Popular options:
- **Railway**: Easy deployment with environment variables
- **Render**: Free tier available
- **Heroku**: Simple git-based deployment
- **DigitalOcean**: App Platform

### Frontend Deployment

Popular options:
- **Vercel**: Optimized for React applications
- **Netlify**: Easy static site deployment
- **GitHub Pages**: Free hosting for static sites
- **Cloudflare Pages**: Fast global CDN

### Environment Variables for Production

Update your production environment variables:

```env
# Backend
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend
VITE_API_URL=https://your-backend-domain.com/api
VITE_DEV_MODE=false
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the API documentation
3. Check the browser console for frontend errors
4. Check the backend logs for server errors
5. Ensure all dependencies are installed correctly
