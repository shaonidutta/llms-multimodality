#!/usr/bin/env python3
"""
Tool-Enhanced Reasoning Script

A Python script that takes natural language queries and uses an LLM to:
- Interpret the query using chain-of-thought (CoT) style reasoning
- Call external tools (calculator functions, string counters) when necessary
- Combine results to produce a final answer

Usage:
    python main.py

Then enter your queries interactively, or use:
    python main.py --query "Your question here"
"""

import argparse
import sys
import os
import re
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from dotenv import load_dotenv
from tools.math_tools import call_math_function, get_available_functions as get_math_functions
from tools.string_tools import call_string_function, get_available_functions as get_string_functions

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))


def create_reasoning_prompt(query: str) -> str:
    """Create a chain-of-thought prompt for the LLM."""
    math_functions = get_math_functions()
    string_functions = get_string_functions()

    prompt = f"""You are a helpful assistant that can reason through problems step by step and use tools when necessary.

Available Tools:
MATH TOOLS: {', '.join(math_functions)}
STRING TOOLS: {', '.join(string_functions)}

When you need to use a tool, format your tool call exactly like this:
TOOL_CALL: tool_type.function_name(arguments)

Examples:
- TOOL_CALL: math.square_root(25)
- TOOL_CALL: string.count_vowels("hello")
- TOOL_CALL: math.average([10, 20, 30])

Please analyze this query step by step using chain-of-thought reasoning:

Query: {query}

Think through this step by step:
1. What is the query asking for?
2. What information or calculations do I need?
3. Do I need to use any tools? If so, which ones and with what arguments?
4. How will I combine the results to get the final answer?

Provide your reasoning and any necessary tool calls."""
    return prompt


def parse_tool_calls(response_text: str) -> List[Dict[str, Any]]:
    """Parse tool calls from the LLM response."""
    tool_calls = []
    pattern = r'TOOL_CALL:\s*(\w+)\.(\w+)\((.*?)\)'
    matches = re.findall(pattern, response_text)

    for match in matches:
        tool_type, function_name, args_str = match
        try:
            if not args_str.strip():
                args = []
            elif args_str.strip().startswith('[') and args_str.strip().endswith(']'):
                args = [eval(args_str.strip())]
            elif ',' in args_str:
                args = [eval(arg.strip()) for arg in args_str.split(',')]
            else:
                args = [eval(args_str.strip())]

            tool_calls.append({
                'type': tool_type,
                'function': function_name,
                'args': args
            })
        except Exception as e:
            print(f"Error parsing tool call: {e}")
            continue

    return tool_calls


def execute_tool_calls(tool_calls: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Execute the parsed tool calls."""
    results = {}
    errors = []

    for tool_call in tool_calls:
        tool_type = tool_call.get('type', '').lower()
        function_name = tool_call.get('function', '')
        args = tool_call.get('args', [])
        call_key = f"{tool_type}.{function_name}({', '.join(map(str, args))})"

        try:
            if tool_type == 'math':
                result = call_math_function(function_name, *args)
                results[call_key] = result
            elif tool_type == 'string':
                result = call_string_function(function_name, *args)
                results[call_key] = result
            else:
                errors.append(f"Unknown tool type: {tool_type}")
        except Exception as e:
            errors.append(f"Error executing {call_key}: {str(e)}")

    return {'results': results, 'errors': errors}


def process_query(query: str) -> Dict[str, Any]:
    """Process a single query through the complete pipeline."""
    model = genai.GenerativeModel('gemini-1.5-flash')

    print(f"\n{'='*60}")
    print(f"PROCESSING QUERY: {query}")
    print(f"{'='*60}")

    # Step 1: Get reasoning from LLM
    print("\n🧠 REASONING PHASE:")
    print("-" * 40)

    prompt = create_reasoning_prompt(query)

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1000,
            )
        )
        reasoning = response.text
        print(reasoning)
    except Exception as e:
        print(f"Error getting LLM response: {e}")
        return

    # Step 2: Parse and execute tools
    tool_calls = parse_tool_calls(reasoning)

    print(f"\n🔧 TOOL EXECUTION PHASE:")
    print("-" * 40)

    if tool_calls:
        execution_results = execute_tool_calls(tool_calls)
        tool_results = execution_results['results']

        if tool_results:
            print("Tool Results:")
            for call, result in tool_results.items():
                print(f"- {call} = {result}")

        if execution_results['errors']:
            print("Errors:")
            for error in execution_results['errors']:
                print(f"- {error}")
    else:
        print("No tools were needed for this query.")
        tool_results = {}

    # Step 3: Get final answer
    print(f"\n💡 FINAL ANSWER PHASE:")
    print("-" * 40)

    if tool_results:
        # Create final answer prompt
        tool_results_str = "\nTool Results:\n"
        for call, result in tool_results.items():
            tool_results_str += f"- {call}: {result}\n"

        final_prompt = f"""Based on your previous reasoning and the tool results, provide a clear final answer.

Original Query: {query}

Your Previous Reasoning:
{reasoning}
{tool_results_str}

Now provide a clear, concise final answer to the original query."""

        try:
            response = model.generate_content(
                final_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=500,
                )
            )
            final_answer = response.text
        except Exception as e:
            final_answer = f"Error getting final answer: {e}"
    else:
        # Extract answer from reasoning
        lines = reasoning.split('\n')
        final_answer = "Based on the reasoning above, the answer can be found in the analysis."
        for line in reversed(lines):
            if line.strip() and not line.startswith('TOOL_CALL'):
                final_answer = line.strip()
                break

    print(final_answer)

def interactive_mode():
    """Run the script in interactive mode."""
    print("🤖 Tool-Enhanced Reasoning System")
    print("=" * 50)
    print("Enter your queries and I'll reason through them step by step!")
    print("I can use mathematical and string analysis tools when needed.")
    print("Type 'quit', 'exit', or 'q' to stop.")
    print("Type 'help' to see available tools.")
    print("-" * 50)

    while True:
        try:
            query = input("\n📝 Enter your query: ").strip()

            if query.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye!")
                break

            if query.lower() == 'help':
                show_help()
                continue

            if not query:
                print("Please enter a valid query.")
                continue

            # Process the query
            process_query(query)

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error processing query: {str(e)}")


def show_help():
    """Show available tools and example queries."""
    math_functions = get_math_functions()
    string_functions = get_string_functions()

    print("\n🔧 AVAILABLE TOOLS:")
    print("-" * 30)

    print("📊 Math Tools:")
    for func in math_functions:
        print(f"  - {func}")

    print("\n📝 String Tools:")
    for func in string_functions:
        print(f"  - {func}")

    print("\n💡 EXAMPLE QUERIES:")
    print("-" * 30)
    examples = [
        "What's the square root of the average of 18 and 50?",
        "How many vowels are in the word 'Multimodality'?",
        "Is the number of letters in 'machine' greater than the number of vowels in 'reasoning'?",
        "What's 15 plus 27 multiplied by 3?",
        "Count the consonants in 'artificial intelligence'",
        "What's the factorial of 5?",
        "Find the longest word in 'machine learning is fascinating'"
    ]

    for i, example in enumerate(examples, 1):
        print(f"  {i}. {example}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Tool-Enhanced Reasoning Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py
  python main.py --query "What's the square root of 144?"
  python main.py --query "How many vowels are in 'hello world'?"

Note: Requires Google Gemini API key in .env file
        """
    )
    
    parser.add_argument(
        '--query', '-q',
        type=str,
        help='Single query to process (non-interactive mode)'
    )
    
    args = parser.parse_args()
    
    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        print("❌ Error: GEMINI_API_KEY environment variable not set.")
        print("Please create a .env file with your Gemini API key.")
        print("See .env.example for the format.")
        sys.exit(1)
    
    # Process single query or run interactive mode
    if args.query:
        process_query(args.query)
    else:
        interactive_mode()


if __name__ == "__main__":
    main()
