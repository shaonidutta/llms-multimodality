import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Layout/Header';
import ImageUpload from './components/ImageUpload/ImageUpload';
import QuestionInput from './components/QuestionInput/QuestionInput';
import ResponseDisplay from './components/ResponseDisplay/ResponseDisplay';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import { analyzeImage, textOnlyFallback } from './services/api';

function App() {
  // Main application state
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle image upload
  const handleImageUpload = (uploadedImage) => {
    setImage(uploadedImage);
    setImageUrl(''); // Clear URL if file is uploaded
    setError(null);
  };

  // Handle image URL input
  const handleImageUrl = (url) => {
    setImageUrl(url);
    setImage(null); // Clear file if URL is provided
    setError(null);
  };

  // Handle question input
  const handleQuestionChange = (newQuestion) => {
    setQuestion(newQuestion);
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!image && !imageUrl.trim()) {
      setError('Please upload an image or provide an image URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await analyzeImage(image, imageUrl, question);
      setResponse(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
      
      // Try text-only fallback if image analysis fails
      if (err.message?.includes('image') || err.message?.includes('vision')) {
        try {
          console.log('Attempting text-only fallback...');
          const fallbackResult = await textOnlyFallback(question, 'Image analysis failed');
          setResponse({
            ...fallbackResult,
            fallbackUsed: true,
            originalError: err.message
          });
          setError(null);
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
          setError('Both image analysis and text fallback failed. Please try again later.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear all data
  const handleClear = () => {
    setImage(null);
    setImageUrl('');
    setQuestion('');
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gradient"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Multimodal QA Agent
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Upload an image and ask questions about it. Our AI will analyze the image and provide detailed answers using advanced vision models.
            </motion.p>
          </div>

          {/* Main Interface */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ImageUpload
                onImageUpload={handleImageUpload}
                onImageUrl={handleImageUrl}
                image={image}
                imageUrl={imageUrl}
                disabled={loading}
              />
              
              <QuestionInput
                question={question}
                onQuestionChange={handleQuestionChange}
                disabled={loading}
              />

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || (!image && !imageUrl) || !question.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="loading-spinner w-5 h-5"></div>
                      Analyzing...
                    </div>
                  ) : (
                    'Analyze Image'
                  )}
                </button>
                
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </motion.div>

            {/* Right Column - Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {loading && (
                <div className="card p-8">
                  <LoadingSpinner />
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-6 border-red-200 bg-red-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-800">Error</h3>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {response && (
                <ResponseDisplay response={response} />
              )}

              {!loading && !error && !response && (
                <div className="card p-8 text-center">
                  <div className="text-gray-400 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Ready to analyze</p>
                    <p className="text-sm">Upload an image and ask a question to get started</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
