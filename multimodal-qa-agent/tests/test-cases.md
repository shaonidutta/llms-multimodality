# Multimodal QA Agent Test Cases

## Overview

This document outlines the test cases for the Multimodal QA Agent, including the 3 required sample image-question pairs for submission.

## Required Test Cases (For Submission)

### Test Case 1: Complex Scene Analysis

**Objective**: Test the AI's ability to identify and count multiple objects in a complex scene.

**Image**: Street scene with multiple vehicles and objects
- **Source**: Upload a photo of a busy street or parking lot
- **Alternative URL**: `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800`

**Question**: "How many cars are visible and what colors are they?"

**Expected Response Type**: 
- Count of vehicles
- Color identification
- Spatial awareness

**Success Criteria**:
- Accurately counts visible cars (±1 acceptable for partially visible)
- Identifies primary colors correctly
- Provides structured response

---

### Test Case 2: Text Recognition

**Objective**: Test the AI's ability to read and interpret text within images.

**Image**: Photo containing visible text, signs, or documents
- **Source**: Upload a photo of a street sign, storefront, or document
- **Alternative URL**: `https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800`

**Question**: "What does the sign in the image say?"

**Expected Response Type**:
- Accurate text transcription
- Context understanding
- Language recognition

**Success Criteria**:
- Correctly reads visible text
- Handles different fonts and sizes
- Maintains text formatting context

---

### Test Case 3: Object Identification and Activity Recognition

**Objective**: Test the AI's ability to identify subjects and describe their actions.

**Image**: Photo of an animal or person performing an activity
- **Source**: Upload a photo of a pet, wildlife, or person in action
- **Alternative URL**: `https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800`

**Question**: "What type of animal is this and what is it doing?"

**Expected Response Type**:
- Species/breed identification
- Activity description
- Behavioral context

**Success Criteria**:
- Correctly identifies the animal type
- Accurately describes the activity
- Provides relevant behavioral insights

## Additional Test Cases

### Test Case 4: Color and Composition Analysis

**Image**: Artistic or colorful image
**Question**: "What are the dominant colors in this image and how are they arranged?"

### Test Case 5: Spatial Relationships

**Image**: Image with multiple objects in different positions
**Question**: "Describe the spatial relationship between the objects in this image."

### Test Case 6: Emotional Context

**Image**: Photo with people showing emotions
**Question**: "What emotions or mood does this image convey?"

### Test Case 7: Technical Details

**Image**: Photo with technical elements (architecture, machinery, etc.)
**Question**: "Describe the technical or architectural features visible in this image."

### Test Case 8: Comparative Analysis

**Image**: Image with similar objects
**Question**: "Compare and contrast the different elements in this image."

## Fallback Testing

### Test Case F1: Text-Only Fallback

**Scenario**: All vision APIs fail
**Question**: "What are the main components of a modern smartphone?"
**Expected**: Detailed text-only response about smartphone features

### Test Case F2: API Degradation

**Scenario**: Primary API fails, secondary succeeds
**Expected**: Seamless fallback with response metadata indicating which API was used

## Performance Testing

### Load Testing

1. **Single User**: 10 consecutive requests
2. **Multiple Users**: 5 concurrent users, 5 requests each
3. **Large Files**: Upload 8-10MB images
4. **Various Formats**: Test JPEG, PNG, WebP, GIF

### Response Time Expectations

- **Simple Questions**: < 15 seconds
- **Complex Analysis**: < 30 seconds
- **Text-Only Fallback**: < 10 seconds

## Error Handling Testing

### Invalid Inputs

1. **No Image**: Submit question without image
2. **Invalid Format**: Upload non-image file
3. **Large File**: Upload file > 10MB
4. **Empty Question**: Submit image without question
5. **Invalid URL**: Use broken image URL

### API Failures

1. **Invalid API Key**: Test with wrong API key
2. **Rate Limiting**: Exceed API rate limits
3. **Network Issues**: Simulate connection problems

## Test Results Template

For each test case, document:

```markdown
### Test Case [Number]: [Name]

**Date**: [Test Date]
**Tester**: [Name]
**Environment**: [Development/Production]

**Input**:
- Image: [Description/URL]
- Question: "[Exact question text]"

**Response**:
- API Used: [gpt-4o/gemini/claude/text-fallback]
- Response Time: [X.X seconds]
- Confidence: [high/medium/low]
- Fallback Attempts: [Number]

**Answer**:
```
[Full AI response text]
```

**Evaluation**:
- Accuracy: [Excellent/Good/Fair/Poor]
- Completeness: [Complete/Partial/Incomplete]
- Relevance: [Highly Relevant/Relevant/Somewhat Relevant/Irrelevant]

**Notes**:
[Any additional observations or issues]

**Status**: ✅ Pass / ❌ Fail / ⚠️ Partial
```

## Automated Testing

### API Endpoint Tests

```bash
# Health check
curl http://localhost:5001/api/health

# Service status
curl http://localhost:5001/api/status

# Test analysis with URL
curl -X POST http://localhost:5001/api/analyze \
  -F "imageUrl=https://example.com/test.jpg" \
  -F "question=Test question"

# Test text fallback
curl -X POST http://localhost:5001/api/text-fallback \
  -H "Content-Type: application/json" \
  -d '{"question":"Test question","context":"Test context"}'
```

### Frontend Testing

1. **Component Rendering**: Verify all components load correctly
2. **Image Upload**: Test drag-and-drop and file selection
3. **URL Input**: Test image URL functionality
4. **Form Validation**: Test input validation
5. **Response Display**: Verify response formatting
6. **Error Handling**: Test error message display
7. **Loading States**: Verify loading animations
8. **Responsive Design**: Test on different screen sizes

## Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Testing

Test responsive design on:
- iOS Safari
- Android Chrome
- Various screen sizes

## Accessibility Testing

- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Alt text for images
- ARIA labels

## Security Testing

- File upload validation
- Input sanitization
- XSS prevention
- CSRF protection
- API rate limiting

## Documentation Testing

Verify that:
- Setup instructions work correctly
- API documentation is accurate
- Code examples function properly
- Environment variables are documented
- Troubleshooting guide is helpful
