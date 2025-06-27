import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ResponseDisplay = ({ response }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!response) return null;

  const {
    answer,
    question,
    apiUsed,
    service,
    model,
    confidence,
    responseTime,
    fallbackAttempts,
    fallbackUsed,
    originalError,
    imageSource,
    usage
  } = response;

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get API badge color
  const getApiBadgeColor = (api) => {
    if (api?.includes('gpt')) return 'bg-green-100 text-green-800';
    if (api?.includes('gemini')) return 'bg-blue-100 text-blue-800';
    if (api?.includes('claude')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Format response time
  const formatResponseTime = (time) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Main Response Card */}
      <div className="card p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analysis Complete</h3>
              <p className="text-sm text-gray-600">
                Processed by {service || apiUsed} in {formatResponseTime(responseTime)}
              </p>
            </div>
          </div>

          {/* API Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApiBadgeColor(apiUsed)}`}>
            {apiUsed}
          </span>
        </div>

        {/* Fallback Warning */}
        {fallbackUsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Text-only fallback used</p>
                <p className="text-xs text-yellow-700">
                  Image analysis failed: {originalError}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Question */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Your Question:</h4>
          <p className="text-gray-900">{question}</p>
        </div>

        {/* Answer */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">AI Response:</h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{answer}</p>
          </div>
        </div>

        {/* Confidence and Details */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {confidence && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(confidence)}`}>
                {confidence} confidence
              </span>
            )}
            
            {fallbackAttempts > 0 && (
              <span className="text-xs text-gray-500">
                {fallbackAttempts} fallback{fallbackAttempts > 1 ? 's' : ''} attempted
              </span>
            )}
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-6 space-y-4"
        >
          <h4 className="font-semibold text-gray-900">Technical Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Model:</span>
              <span className="ml-2 text-gray-600">{model || 'Unknown'}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Response Time:</span>
              <span className="ml-2 text-gray-600">{formatResponseTime(responseTime)}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Image Source:</span>
              <span className="ml-2 text-gray-600">{imageSource || 'Unknown'}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Service:</span>
              <span className="ml-2 text-gray-600">{service || apiUsed}</span>
            </div>

            {usage && (
              <>
                <div>
                  <span className="font-medium text-gray-700">Tokens Used:</span>
                  <span className="ml-2 text-gray-600">
                    {usage.prompt_tokens + usage.completion_tokens} total
                  </span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Token Breakdown:</span>
                  <span className="ml-2 text-gray-600">
                    {usage.prompt_tokens} prompt, {usage.completion_tokens} completion
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Copy Response Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                navigator.clipboard.writeText(answer);
                // You could add a toast notification here
              }}
              className="btn-secondary text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Response
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResponseDisplay;
