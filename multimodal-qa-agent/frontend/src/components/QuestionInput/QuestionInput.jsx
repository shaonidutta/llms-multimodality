import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuestionInput = ({ question, onQuestionChange, disabled }) => {
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(question?.length || 0);
  const maxLength = 1000;

  const handleChange = (e) => {
    const value = e.target.value;
    setCharCount(value.length);
    onQuestionChange(value);
  };

  // Suggested questions for inspiration
  const suggestedQuestions = [
    "What objects can you see in this image?",
    "Describe the scene in detail.",
    "What colors are prominent in this image?",
    "Are there any people in this image? What are they doing?",
    "What is the setting or location of this image?",
    "Can you read any text in this image?",
    "What is the mood or atmosphere of this image?",
    "Count the number of [specific objects] in the image."
  ];

  const handleSuggestionClick = (suggestion) => {
    onQuestionChange(suggestion);
    setCharCount(suggestion.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ask a Question</h3>
        <span className={`text-sm ${charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
          {charCount}/{maxLength}
        </span>
      </div>

      {/* Question Input */}
      <motion.div
        className={`card p-1 transition-all duration-300 ${
          focused ? 'ring-4 ring-primary-100 border-primary-300' : ''
        }`}
        whileHover={{ scale: focused ? 1 : 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <textarea
          value={question}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask anything about the image... For example: 'What objects can you see?' or 'Describe the scene in detail.'"
          className="w-full p-4 border-none outline-none resize-none bg-transparent text-gray-900 placeholder-gray-500"
          rows={4}
          maxLength={maxLength}
          disabled={disabled}
        />
      </motion.div>

      {/* Suggested Questions */}
      {!question && !disabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-medium text-gray-700">Suggested Questions:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 rounded-lg border border-gray-200 hover:border-primary-200 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Question Tips */}
      {focused && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for better results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about what you want to know</li>
            <li>• Ask about objects, people, actions, or scenes</li>
            <li>• Request descriptions, counts, or analysis</li>
            <li>• Ask about text, colors, or spatial relationships</li>
          </ul>
        </motion.div>
      )}

      {/* Character count warning */}
      {charCount > maxLength * 0.9 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm ${charCount >= maxLength ? 'text-red-600' : 'text-yellow-600'}`}
        >
          {charCount >= maxLength 
            ? '⚠️ Maximum character limit reached' 
            : `⚠️ Approaching character limit (${maxLength - charCount} remaining)`
          }
        </motion.div>
      )}
    </div>
  );
};

export default QuestionInput;
