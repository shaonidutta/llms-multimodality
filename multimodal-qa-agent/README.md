# Multimodal QA Agent

A sophisticated web application that combines computer vision and natural language processing to answer questions about images using state-of-the-art Vision + Language models.

## 🚀 Features

- **Image Upload**: Support for file uploads and URL-based image input
- **Multimodal Processing**: Advanced image analysis with question answering
- **Multiple AI Models**: Integration with GPT-4o, Gemini, and Claude 3
- **Intelligent Fallback**: Automatic fallback to text-only models when needed
- **Modern UI**: Smooth animations, subtle gradients, and responsive design
- **Real-time Processing**: Fast API responses with loading animations

## 🎯 Demo

### Screenshots
![Application Interface](assets/screenshots/main-interface.png)
*Main application interface showing image upload and question input*

![Analysis Results](assets/screenshots/analysis-results.png)
*Example of AI analysis results with detailed response*

![Service Status](assets/screenshots/service-status.png)
*Service status dashboard showing API availability*

### Live Demo
🌐 **[Try Live Demo](https://your-demo-url.com)** *(To be deployed)*

> **Note**: Screenshots will be added after the application is fully tested with API keys.

## 🤖 AI Integration

### Primary: OpenAI GPT-4o
- **Rationale**: Best-in-class vision capabilities with excellent text understanding
- **Use Case**: Primary multimodal processing for image + question analysis
- **Strengths**: High accuracy, detailed responses, robust error handling

### Fallback Options

#### Google Gemini Pro Vision
- **Rationale**: Strong alternative with competitive vision capabilities
- **Use Case**: Secondary option when GPT-4o is unavailable
- **Strengths**: Fast processing, good multilingual support

#### Anthropic Claude 3
- **Rationale**: Excellent reasoning capabilities and safety features
- **Use Case**: Tertiary fallback for complex reasoning tasks
- **Strengths**: Detailed analysis, ethical considerations

#### Text-only Fallback
- **Rationale**: Ensures service availability even when vision APIs fail
- **Use Case**: Basic question answering when image analysis is unavailable
- **Implementation**: GPT-3.5-turbo for cost-effective text processing

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- At least one API key (OpenAI recommended)

### Quick Setup
```bash
# 1. Clone and setup
git clone <repository-url>
cd multimodal-qa-agent
npm run setup

# 2. Add your API keys to backend/.env
OPENAI_API_KEY=your_openai_key_here

# 3. Start development servers
npm run dev
```

### Manual Setup
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env and add API keys
# Start servers
npm run dev
```

### Running the Application

#### Development Mode
```bash
# Start both servers (recommended)
npm run dev

# Or start separately:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

#### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

## 📱 Usage

1. **Upload Image**: Choose between file upload or URL input
2. **Ask Question**: Enter your question about the image
3. **Get Answer**: Receive AI-powered analysis and response
4. **View Details**: See which AI model was used for the response

## 🧪 Test Results

### Test Case 1: Complex Scene Analysis
- **Image**: Street scene with multiple vehicles
- **Question**: "How many cars are visible and what colors are they?"
- **Expected Result**: Accurate count and color identification of vehicles
- **Test Status**: ⏳ Ready for testing with API keys

### Test Case 2: Text Recognition
- **Image**: Sign or document with text
- **Question**: "What does the sign in the image say?"
- **Expected Result**: Accurate text transcription from image
- **Test Status**: ⏳ Ready for testing with API keys

### Test Case 3: Object Identification
- **Image**: Animal or object photo
- **Question**: "What type of animal is this and what is it doing?"
- **Expected Result**: Species identification and activity description
- **Test Status**: ⏳ Ready for testing with API keys

> **Note**: Detailed test results will be documented in `/docs/testing-report.md` once API keys are configured and testing is performed.

## 🏗 Technical Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with custom animations
- **3D Graphics**: Three.js for loading animations
- **State Management**: React hooks and context
- **HTTP Client**: Axios for API communication

### Backend (Node.js + Express)
- **Framework**: Express.js with modern middleware
- **File Handling**: Multer for image uploads
- **API Integration**: Native fetch and axios for LLM APIs
- **Error Handling**: Comprehensive error middleware
- **Security**: CORS, Helmet, input validation

### API Integration Flow
```
User Input → Frontend → Backend → AI APIs → Response → Frontend → User
                                    ↓
                              Fallback Chain:
                              GPT-4o → Gemini → Claude → Text-only
```

## 📊 Performance Metrics
- **Average Response Time**: *To be measured*
- **Success Rate**: *To be measured*
- **Fallback Usage**: *To be measured*

## 🔒 Security Features
- Input validation and sanitization
- File type and size restrictions
- API key protection
- CORS configuration
- Rate limiting (planned)

## 🚀 Deployment
- **Frontend**: Vercel/Netlify compatible
- **Backend**: Railway/Render compatible
- **Environment**: Docker support (planned)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License
MIT License - see LICENSE file for details

## 🙏 Acknowledgments
- OpenAI for GPT-4o API
- Google for Gemini API
- Anthropic for Claude API
- React and Node.js communities
