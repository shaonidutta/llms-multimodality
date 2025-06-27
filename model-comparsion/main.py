#!/usr/bin/env python3
"""
Simple Model Comparison Tool
Compares Base, Instruct, and Fine-tuned models for different use cases.
"""

import requests
import json
import argparse
import time
from typing import Dict, Any, List


class ModelComparator:
    """Simple model comparison tool using local LM Studio."""
    
    def __init__(self, base_url: str = "http://localhost:1234"):
        """Initialize with LM Studio local server URL."""
        self.base_url = base_url
        
        # Model characteristics for different types
        self.model_types = {
            "base": {
                "description": "Pre-trained models without specific instruction tuning",
                "strengths": ["Creative text generation", "Diverse outputs", "Good general knowledge"],
                "weaknesses": ["May not follow instructions precisely", "Inconsistent formatting"],
                "best_for": ["Creative writing", "Text completion", "Exploratory generation"],
                "example_models": ["Qwen2.5-3B-Base", "Llama-3-8B-Base"]
            },
            "instruct": {
                "description": "Models fine-tuned to follow instructions and provide helpful responses",
                "strengths": ["Better instruction following", "Consistent formatting", "Safer outputs"],
                "weaknesses": ["May be less creative", "More constrained responses"],
                "best_for": ["Question answering", "Task completion", "Structured outputs"],
                "example_models": ["Qwen2.5-3B-Instruct", "Llama-3-8B-Instruct"]
            },
            "fine_tuned": {
                "description": "Models specialized for specific domains or tasks",
                "strengths": ["High performance on target tasks", "Domain expertise"],
                "weaknesses": ["Limited to specific use cases", "May perform poorly outside domain"],
                "best_for": ["Specialized applications", "Domain-specific tasks"],
                "example_models": ["Code-Qwen2.5-3B", "Medical-Llama-7B"]
            }
        }
    
    def query_model(self, prompt: str, model_type: str = "instruct") -> Dict[str, Any]:
        """Query the local model via LM Studio API."""
        try:
            # LM Studio OpenAI-compatible API endpoint
            url = f"{self.base_url}/v1/chat/completions"
            
            headers = {
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "local-model",  # LM Studio uses this for loaded model
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 500,
                "stream": False
            }
            
            start_time = time.time()
            response = requests.post(url, headers=headers, json=data, timeout=120)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract response text
                if 'choices' in result and len(result['choices']) > 0:
                    text = result['choices'][0]['message']['content']
                    
                    # Extract token usage if available
                    usage = result.get('usage', {})
                    
                    return {
                        "success": True,
                        "text": text,
                        "model_type": model_type,
                        "response_time": response_time,
                        "tokens": {
                            "prompt_tokens": usage.get('prompt_tokens', 0),
                            "completion_tokens": usage.get('completion_tokens', 0),
                            "total_tokens": usage.get('total_tokens', 0)
                        }
                    }
                else:
                    return {"success": False, "error": "No response from model"}
            else:
                return {"success": False, "error": f"API error: {response.status_code}"}
                
        except requests.exceptions.ConnectionError:
            return {"success": False, "error": "Cannot connect to LM Studio. Make sure it's running on localhost:1234"}
        except Exception as e:
            return {"success": False, "error": f"Error: {str(e)}"}
    
    def simulate_model_types(self, prompt: str) -> Dict[str, Dict[str, Any]]:
        """
        Simulate different model types by adjusting the prompt.
        Since we have one local model, we'll modify prompts to simulate different behaviors.
        """
        results = {}
        
        # Base model simulation - more creative, less structured
        base_prompt = f"Complete this text creatively: {prompt}"
        print("🔄 Querying Base model simulation...")
        results["base"] = self.query_model(base_prompt, "base")
        
        # Instruct model simulation - direct instruction following
        instruct_prompt = f"Please provide a helpful and structured response to: {prompt}"
        print("🔄 Querying Instruct model simulation...")
        results["instruct"] = self.query_model(instruct_prompt, "instruct")
        
        # Fine-tuned model simulation - task-specific approach
        finetuned_prompt = f"As a specialized assistant, provide a detailed and accurate response to: {prompt}"
        print("🔄 Querying Fine-tuned model simulation...")
        results["fine_tuned"] = self.query_model(finetuned_prompt, "fine_tuned")
        
        return results
    
    def display_results(self, prompt: str, results: Dict[str, Dict[str, Any]]):
        """Display comparison results in a formatted way."""
        print("\n" + "="*80)
        print(f"📝 PROMPT: {prompt}")
        print("="*80)
        
        for model_type, result in results.items():
            print(f"\n🤖 {model_type.upper().replace('_', ' ')} MODEL")
            print("-" * 50)
            
            if result["success"]:
                print(f"Response: {result['text']}")
                print(f"Response Time: {result['response_time']:.2f}s")
                if result['tokens']['total_tokens'] > 0:
                    print(f"Tokens Used: {result['tokens']['total_tokens']}")
            else:
                print(f"❌ Error: {result['error']}")
            
            # Display model characteristics
            characteristics = self.model_types[model_type]
            print(f"\n📋 Model Characteristics:")
            print(f"Description: {characteristics['description']}")
            print(f"Strengths: {', '.join(characteristics['strengths'])}")
            print(f"Best for: {', '.join(characteristics['best_for'])}")
    
    def save_results(self, prompt: str, results: Dict[str, Dict[str, Any]], filename: str = None):
        """Save results to a file."""
        if filename is None:
            filename = f"comparison_results_{int(time.time())}.json"
        
        output = {
            "prompt": prompt,
            "timestamp": time.time(),
            "results": results,
            "model_characteristics": self.model_types
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Results saved to: {filename}")


def main():
    """Main CLI interface."""
    parser = argparse.ArgumentParser(description="Simple Model Comparison Tool")
    parser.add_argument("prompt", help="The prompt to test with different model types")
    parser.add_argument("--url", default="http://localhost:1234", 
                       help="LM Studio server URL (default: http://localhost:1234)")
    parser.add_argument("--save", help="Save results to specified file")
    parser.add_argument("--info", action="store_true", 
                       help="Show information about model types")
    
    args = parser.parse_args()
    
    comparator = ModelComparator(args.url)
    
    if args.info:
        print("\n📚 MODEL TYPE INFORMATION")
        print("="*50)
        for model_type, info in comparator.model_types.items():
            print(f"\n🔹 {model_type.upper().replace('_', ' ')} MODELS")
            print(f"Description: {info['description']}")
            print(f"Strengths: {', '.join(info['strengths'])}")
            print(f"Best for: {', '.join(info['best_for'])}")
        return
    
    print("🚀 Starting Model Comparison...")
    print(f"📡 Using LM Studio at: {args.url}")
    print(f"💭 Testing prompt: {args.prompt}")
    
    # Run comparison
    results = comparator.simulate_model_types(args.prompt)
    
    # Display results
    comparator.display_results(args.prompt, results)
    
    # Save results if requested
    if args.save:
        comparator.save_results(args.prompt, results, args.save)
    
    # Show recommendations
    print("\n💡 RECOMMENDATIONS")
    print("-" * 30)
    successful_models = [model_type for model_type, result in results.items() if result["success"]]
    
    if successful_models:
        print("✅ Successfully tested model types:", ", ".join(successful_models))
        print("\n🎯 Choose the best model type based on your use case:")
        print("• Base: For creative, open-ended tasks")
        print("• Instruct: For structured, task-oriented responses")
        print("• Fine-tuned: For specialized domain tasks")
    else:
        print("❌ No models responded successfully. Check if LM Studio is running.")


if __name__ == "__main__":
    main()
