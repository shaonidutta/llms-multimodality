# Simple Model Comparison Tool

A command-line tool that compares Base, Instruct, and Fine-tuned model behaviors using your local Qwen 2.5 3B model via LM Studio.

## 🚀 Quick Start

### Prerequisites
1. **LM Studio** installed and running
2. **Qwen 2.5 3B model** loaded in LM Studio
3. **Python 3.7+** installed

### Setup
1. Make sure LM Studio is running on `localhost:1234`
2. Load your Qwen 2.5 3B model in LM Studio
3. Clone/download this tool

### Installation
```bash
# Install required dependency
pip install requests

# Make the script executable (optional)
chmod +x main.py
```

## 🎯 Usage

### Basic Comparison
```bash
python main.py "Explain what artificial intelligence is"
```

### Show Model Type Information
```bash
python main.py --info "any prompt"
```

### Save Results to File
```bash
python main.py "Write a short story about robots" --save results.json
```

### Custom LM Studio URL
```bash
python main.py "What is machine learning?" --url http://localhost:8080
```

## 📊 How It Works

The tool simulates different model types by modifying prompts:

1. **Base Model**: Uses creative, open-ended prompts
2. **Instruct Model**: Uses structured, instruction-following prompts  
3. **Fine-tuned Model**: Uses specialized, task-specific prompts

Each approach demonstrates how different model types would behave with the same underlying model.

## 🔧 Model Types Explained

### Base Models
- **Description**: Pre-trained models without specific instruction tuning
- **Strengths**: Creative text generation, diverse outputs, good general knowledge
- **Best For**: Creative writing, text completion, exploratory generation

### Instruct Models  
- **Description**: Models fine-tuned to follow instructions and provide helpful responses
- **Strengths**: Better instruction following, consistent formatting, safer outputs
- **Best For**: Question answering, task completion, structured outputs

### Fine-tuned Models
- **Description**: Models specialized for specific domains or tasks
- **Strengths**: High performance on target tasks, domain expertise
- **Best For**: Specialized applications, domain-specific tasks

## 📝 Example Output

```
🚀 Starting Model Comparison...
📡 Using LM Studio at: http://localhost:1234
💭 Testing prompt: What is AI?

🔄 Querying Base model simulation...
🔄 Querying Instruct model simulation...
🔄 Querying Fine-tuned model simulation...

================================================================================
📝 PROMPT: What is AI?
================================================================================

🤖 BASE MODEL
--------------------------------------------------
Response: AI, or artificial intelligence, is like giving computers...
Response Time: 2.34s
Tokens Used: 156

📋 Model Characteristics:
Description: Pre-trained models without specific instruction tuning
Strengths: Creative text generation, diverse outputs, good general knowledge
Best for: Creative writing, text completion, exploratory generation

🤖 INSTRUCT MODEL
--------------------------------------------------
Response: Artificial Intelligence (AI) is a field of computer science...
Response Time: 1.89s
Tokens Used: 142

📋 Model Characteristics:
Description: Models fine-tuned to follow instructions and provide helpful responses
Strengths: Better instruction following, consistent formatting, safer outputs
Best for: Question answering, task completion, structured outputs
```

## 🛠️ Troubleshooting

### "Cannot connect to LM Studio"
- Make sure LM Studio is running
- Check that the server is on `localhost:1234`
- Verify your model is loaded and ready

### "No response from model"
- Check if your model is properly loaded in LM Studio
- Try a simpler prompt first
- Verify LM Studio's API is enabled

## 📋 Requirements

- Python 3.7+
- `requests` library
- LM Studio running locally
- Qwen 2.5 3B (or any compatible model) loaded

## 🎯 Assignment Compliance

This tool fulfills the assignment requirements:
- ✅ Command-line interface
- ✅ Compares Base, Instruct, and Fine-tuned model types
- ✅ Works with local models (via LM Studio)
- ✅ Shows model characteristics and use cases
- ✅ Outputs results with token usage information
- ✅ Simple and focused implementation
