"""
Mathematical tools for the tool-enhanced reasoning script.
These functions can be called by the LLM to perform mathematical operations.
"""

import math
from typing import Union, List


def add(a: Union[int, float], b: Union[int, float]) -> Union[int, float]:
    """Add two numbers."""
    return a + b


def subtract(a: Union[int, float], b: Union[int, float]) -> Union[int, float]:
    """Subtract b from a."""
    return a - b


def multiply(a: Union[int, float], b: Union[int, float]) -> Union[int, float]:
    """Multiply two numbers."""
    return a * b


def divide(a: Union[int, float], b: Union[int, float]) -> Union[int, float]:
    """Divide a by b."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b


def power(base: Union[int, float], exponent: Union[int, float]) -> Union[int, float]:
    """Raise base to the power of exponent."""
    return base ** exponent


def square_root(number: Union[int, float]) -> float:
    """Calculate the square root of a number."""
    if number < 0:
        raise ValueError("Cannot calculate square root of negative number")
    return math.sqrt(number)


def average(numbers: List[Union[int, float]]) -> float:
    """Calculate the average of a list of numbers."""
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    return sum(numbers) / len(numbers)


def median(numbers: List[Union[int, float]]) -> Union[int, float]:
    """Calculate the median of a list of numbers."""
    if not numbers:
        raise ValueError("Cannot calculate median of empty list")
    sorted_numbers = sorted(numbers)
    n = len(sorted_numbers)
    if n % 2 == 0:
        return (sorted_numbers[n//2 - 1] + sorted_numbers[n//2]) / 2
    else:
        return sorted_numbers[n//2]


def maximum(numbers: List[Union[int, float]]) -> Union[int, float]:
    """Find the maximum value in a list of numbers."""
    if not numbers:
        raise ValueError("Cannot find maximum of empty list")
    return max(numbers)


def minimum(numbers: List[Union[int, float]]) -> Union[int, float]:
    """Find the minimum value in a list of numbers."""
    if not numbers:
        raise ValueError("Cannot find minimum of empty list")
    return min(numbers)


def absolute_value(number: Union[int, float]) -> Union[int, float]:
    """Calculate the absolute value of a number."""
    return abs(number)


def factorial(n: int) -> int:
    """Calculate the factorial of a non-negative integer."""
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    return math.factorial(n)


def percentage(part: Union[int, float], whole: Union[int, float]) -> float:
    """Calculate what percentage 'part' is of 'whole'."""
    if whole == 0:
        raise ValueError("Cannot calculate percentage with zero as whole")
    return (part / whole) * 100


def round_number(number: Union[int, float], decimals: int = 0) -> Union[int, float]:
    """Round a number to specified decimal places."""
    return round(number, decimals)


# Dictionary mapping function names to actual functions for easy lookup
MATH_FUNCTIONS = {
    'add': add,
    'subtract': subtract,
    'multiply': multiply,
    'divide': divide,
    'power': power,
    'square_root': square_root,
    'average': average,
    'median': median,
    'maximum': maximum,
    'minimum': minimum,
    'absolute_value': absolute_value,
    'factorial': factorial,
    'percentage': percentage,
    'round_number': round_number
}


def get_available_functions() -> List[str]:
    """Return a list of available mathematical functions."""
    return list(MATH_FUNCTIONS.keys())


def call_math_function(function_name: str, *args, **kwargs):
    """
    Call a mathematical function by name with given arguments.
    
    Args:
        function_name: Name of the function to call
        *args: Positional arguments for the function
        **kwargs: Keyword arguments for the function
    
    Returns:
        Result of the function call
    
    Raises:
        ValueError: If function name is not found
    """
    if function_name not in MATH_FUNCTIONS:
        available = ', '.join(get_available_functions())
        raise ValueError(f"Function '{function_name}' not found. Available functions: {available}")
    
    return MATH_FUNCTIONS[function_name](*args, **kwargs)
