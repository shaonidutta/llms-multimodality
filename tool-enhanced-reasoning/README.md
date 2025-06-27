# Tool-Enhanced Reasoning Script

A Python script that takes natural language queries and uses an LLM to interpret queries using chain-of-thought (CoT) style reasoning, call external tools when necessary, and combine results to produce final answers.

## Features

- **Chain-of-Thought Reasoning**: Uses Google's Gemini 1.5 Flash model to break down complex queries step by step
- **Tool Integration**: Automatically calls mathematical and string analysis functions when needed
- **Decision Logic**: Intelligently determines when tools are required based on query analysis
- **Interactive Mode**: User-friendly interface for continuous query processing
- **Comprehensive Tools**: Extensive mathematical and string manipulation capabilities

## Installation

1. **Clone or download this repository**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your Google Gemini API key**:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key to the `.env` file:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

## Usage

### Interactive Mode
```bash
python main.py
```

### Single Query Mode
```bash
python main.py --query "What's the square root of the average of 18 and 50?"
```

### Testing the System
```bash
python test_system.py
```

## Available Tools

### Mathematical Tools
- `add`, `subtract`, `multiply`, `divide`
- `power`, `square_root`, `absolute_value`
- `average`, `median`, `maximum`, `minimum`
- `factorial`, `percentage`, `round_number`

### String Analysis Tools
- `count_vowels`, `count_consonants`, `count_letters`
- `count_words`, `count_characters`, `count_digits`
- `count_uppercase`, `count_lowercase`, `count_spaces`
- `find_longest_word`, `find_shortest_word`
- `count_specific_character`, `count_substring`
- `reverse_string`, `is_palindrome`
- `get_character_frequency`, `extract_numbers`

## Example Queries and Outputs

### 1. Mathematical Calculation
**Query**: "What's the square root of the average of 18 and 50?"

**Expected Output**:
```
🧠 REASONING PHASE:
The user wants to find the square root of the average of two numbers: 18 and 50.

Let me break this down:
1. First, I need to calculate the average of 18 and 50
2. Then, I need to find the square root of that result

TOOL_CALL: math.average([18, 50])
TOOL_CALL: math.square_root(34.0)

🔧 TOOL EXECUTION PHASE:
Tool Execution Summary:
- Total tool calls: 2
- Successful: 2
- Failed: 0

Results:
- math.average([18, 50]) = 34.0
- math.square_root(34.0) = 5.830951894845301

💡 FINAL ANSWER PHASE:
The square root of the average of 18 and 50 is approximately 5.83.
```

### 2. String Analysis
**Query**: "How many vowels are in the word 'Multimodality'?"

**Expected Output**:
```
🧠 REASONING PHASE:
The user wants to count the vowels in the word "Multimodality".

I need to use a string analysis tool to count vowels.

TOOL_CALL: string.count_vowels("Multimodality")

🔧 TOOL EXECUTION PHASE:
Tool Execution Summary:
- Total tool calls: 1
- Successful: 1
- Failed: 0

Results:
- string.count_vowels("Multimodality") = 5

💡 FINAL ANSWER PHASE:
The word "Multimodality" contains 5 vowels (u, i, o, a, i).
```

### 3. Comparative Analysis
**Query**: "Is the number of letters in 'machine' greater than the number of vowels in 'reasoning'?"

**Expected Output**:
```
🧠 REASONING PHASE:
I need to compare two things:
1. The number of letters in the word "machine"
2. The number of vowels in the word "reasoning"

Let me get both counts and then compare them.

TOOL_CALL: string.count_letters("machine")
TOOL_CALL: string.count_vowels("reasoning")

🔧 TOOL EXECUTION PHASE:
Tool Execution Summary:
- Total tool calls: 2
- Successful: 2
- Failed: 0

Results:
- string.count_letters("machine") = 7
- string.count_vowels("reasoning") = 4

💡 FINAL ANSWER PHASE:
Yes, the number of letters in "machine" (7) is greater than the number of vowels in "reasoning" (4).
```

### 4. Complex Mathematical Operation
**Query**: "What's 15 plus 27 multiplied by 3, then find the square root?"

**Expected Output**:
```
🧠 REASONING PHASE:
I need to perform multiple mathematical operations:
1. Add 15 and 27
2. Multiply the result by 3
3. Find the square root of the final result

TOOL_CALL: math.add(15, 27)
TOOL_CALL: math.multiply(42, 3)
TOOL_CALL: math.square_root(126)

🔧 TOOL EXECUTION PHASE:
Tool Execution Summary:
- Total tool calls: 3
- Successful: 3
- Failed: 0

Results:
- math.add(15, 27) = 42
- math.multiply(42, 3) = 126
- math.square_root(126) = 11.224972160321824

💡 FINAL ANSWER PHASE:
The result is approximately 11.22.
```

### 5. String Pattern Analysis
**Query**: "Count the consonants in 'artificial intelligence'"

**Expected Output**:
```
🧠 REASONING PHASE:
The user wants to count consonants in the phrase "artificial intelligence".

TOOL_CALL: string.count_consonants("artificial intelligence")

🔧 TOOL EXECUTION PHASE:
Tool Execution Summary:
- Total tool calls: 1
- Successful: 1
- Failed: 0

Results:
- string.count_consonants("artificial intelligence") = 12

💡 FINAL ANSWER PHASE:
The phrase "artificial intelligence" contains 12 consonants.
```

## How the Prompt Decides Tool Usage

The system uses a carefully designed prompt that:

1. **Provides Tool Context**: Lists all available mathematical and string tools with their names
2. **Establishes Tool Call Format**: Defines the exact syntax for tool calls (`TOOL_CALL: tool_type.function_name(arguments)`)
3. **Encourages Step-by-Step Reasoning**: Prompts the LLM to break down problems into logical steps
4. **Pattern Recognition**: The LLM learns to identify when calculations or string analysis are needed

### Key Prompt Elements:
- **Tool Inventory**: Complete list of available functions organized by category
- **Format Specification**: Exact syntax requirements for tool calls
- **Reasoning Structure**: Guided questions that help the LLM analyze the query
- **Examples**: Clear examples of proper tool call formatting

The LLM decides to use tools when it recognizes:
- Mathematical operations (calculations, averages, square roots, etc.)
- String analysis needs (counting characters, vowels, words, etc.)
- Comparative operations requiring precise counts or calculations

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   main.py       │    │ reasoning_engine │    │ tool_executor   │
│                 │    │                  │    │                 │
│ • User Interface│───▶│ • LLM Integration│───▶│ • Tool Execution│
│ • Orchestration │    │ • CoT Prompting  │    │ • Result Parsing│
│ • Output Format │    │ • Tool Detection │    │ • Error Handling│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Gemini API     │    │     tools/      │
                       │                  │    │                 │
                       │ • Gemini 1.5 Flash│   │ • math_tools.py │
                       │ • Chain-of-Thought│    │ • string_tools.py│
                       └──────────────────┘    └─────────────────┘
```

## Requirements

- Python 3.7+
- Google Gemini API key
- Dependencies listed in `requirements.txt`

## File Structure

```
tool-enhanced-reasoning/
├── main.py                 # Main script entry point
├── reasoning_engine.py     # LLM reasoning and prompt management
├── tool_executor.py        # Tool execution and result handling
├── test_system.py         # Test script for validation
├── tools/
│   ├── __init__.py        # Package initialization
│   ├── math_tools.py      # Mathematical functions
│   └── string_tools.py    # String analysis functions
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variable template
└── README.md             # This documentation
```

## API Key Setup

1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Copy `.env.example` to `.env`
3. Replace `your_gemini_api_key_here` with your actual API key
4. Keep your `.env` file secure and never commit it to version control

## Error Handling

The system includes comprehensive error handling for:
- Invalid API keys or network issues
- Malformed tool calls
- Tool execution errors
- Missing dependencies

## Contributing

To extend the system:
1. Add new functions to `tools/math_tools.py` or `tools/string_tools.py`
2. Update the function dictionaries (`MATH_FUNCTIONS`, `STRING_FUNCTIONS`)
3. Test your additions with `test_system.py`
4. Update the tool list in the reasoning prompt

## License

This project is for educational purposes as part of an LLM and Multimodality assignment.
