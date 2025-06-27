"""
String analysis tools for the tool-enhanced reasoning script.
These functions can be called by the LLM to perform string operations and analysis.
"""

import re
from typing import List, Dict


def count_vowels(text: str, case_sensitive: bool = False) -> int:
    """Count the number of vowels in a string."""
    if not case_sensitive:
        text = text.lower()
    vowels = 'aeiou'
    return sum(1 for char in text if char in vowels)


def count_consonants(text: str, case_sensitive: bool = False) -> int:
    """Count the number of consonants in a string."""
    if not case_sensitive:
        text = text.lower()
    consonants = 'bcdfghjklmnpqrstvwxyz'
    return sum(1 for char in text if char in consonants)


def count_letters(text: str) -> int:
    """Count the number of letters (alphabetic characters) in a string."""
    return sum(1 for char in text if char.isalpha())


def count_words(text: str) -> int:
    """Count the number of words in a string."""
    return len(text.split())


def count_characters(text: str, include_spaces: bool = True) -> int:
    """Count the total number of characters in a string."""
    if include_spaces:
        return len(text)
    else:
        return len(text.replace(' ', ''))


def count_digits(text: str) -> int:
    """Count the number of digits in a string."""
    return sum(1 for char in text if char.isdigit())


def count_uppercase(text: str) -> int:
    """Count the number of uppercase letters in a string."""
    return sum(1 for char in text if char.isupper())


def count_lowercase(text: str) -> int:
    """Count the number of lowercase letters in a string."""
    return sum(1 for char in text if char.islower())


def count_special_characters(text: str) -> int:
    """Count the number of special characters (non-alphanumeric) in a string."""
    return sum(1 for char in text if not char.isalnum() and not char.isspace())


def count_spaces(text: str) -> int:
    """Count the number of spaces in a string."""
    return text.count(' ')


def find_longest_word(text: str) -> str:
    """Find the longest word in a string."""
    words = text.split()
    if not words:
        return ""
    return max(words, key=len)


def find_shortest_word(text: str) -> str:
    """Find the shortest word in a string."""
    words = text.split()
    if not words:
        return ""
    return min(words, key=len)


def get_word_lengths(text: str) -> List[int]:
    """Get a list of lengths for each word in the string."""
    return [len(word) for word in text.split()]


def count_specific_character(text: str, character: str, case_sensitive: bool = False) -> int:
    """Count occurrences of a specific character in a string."""
    if not case_sensitive:
        text = text.lower()
        character = character.lower()
    return text.count(character)


def count_substring(text: str, substring: str, case_sensitive: bool = False) -> int:
    """Count occurrences of a substring in a string."""
    if not case_sensitive:
        text = text.lower()
        substring = substring.lower()
    return text.count(substring)


def reverse_string(text: str) -> str:
    """Reverse a string."""
    return text[::-1]


def is_palindrome(text: str, ignore_case: bool = True, ignore_spaces: bool = True) -> bool:
    """Check if a string is a palindrome."""
    processed_text = text
    if ignore_case:
        processed_text = processed_text.lower()
    if ignore_spaces:
        processed_text = processed_text.replace(' ', '')
    return processed_text == processed_text[::-1]


def get_character_frequency(text: str, case_sensitive: bool = False) -> Dict[str, int]:
    """Get frequency count of each character in the string."""
    if not case_sensitive:
        text = text.lower()
    frequency = {}
    for char in text:
        frequency[char] = frequency.get(char, 0) + 1
    return frequency


def get_vowel_consonant_ratio(text: str) -> float:
    """Calculate the ratio of vowels to consonants in a string."""
    vowel_count = count_vowels(text)
    consonant_count = count_consonants(text)
    if consonant_count == 0:
        return float('inf') if vowel_count > 0 else 0
    return vowel_count / consonant_count


def extract_numbers(text: str) -> List[str]:
    """Extract all numbers from a string."""
    return re.findall(r'\d+\.?\d*', text)


def remove_punctuation(text: str) -> str:
    """Remove all punctuation from a string."""
    return re.sub(r'[^\w\s]', '', text)


# Dictionary mapping function names to actual functions for easy lookup
STRING_FUNCTIONS = {
    'count_vowels': count_vowels,
    'count_consonants': count_consonants,
    'count_letters': count_letters,
    'count_words': count_words,
    'count_characters': count_characters,
    'count_digits': count_digits,
    'count_uppercase': count_uppercase,
    'count_lowercase': count_lowercase,
    'count_special_characters': count_special_characters,
    'count_spaces': count_spaces,
    'find_longest_word': find_longest_word,
    'find_shortest_word': find_shortest_word,
    'get_word_lengths': get_word_lengths,
    'count_specific_character': count_specific_character,
    'count_substring': count_substring,
    'reverse_string': reverse_string,
    'is_palindrome': is_palindrome,
    'get_character_frequency': get_character_frequency,
    'get_vowel_consonant_ratio': get_vowel_consonant_ratio,
    'extract_numbers': extract_numbers,
    'remove_punctuation': remove_punctuation
}


def get_available_functions() -> List[str]:
    """Return a list of available string functions."""
    return list(STRING_FUNCTIONS.keys())


def call_string_function(function_name: str, *args, **kwargs):
    """
    Call a string function by name with given arguments.
    
    Args:
        function_name: Name of the function to call
        *args: Positional arguments for the function
        **kwargs: Keyword arguments for the function
    
    Returns:
        Result of the function call
    
    Raises:
        ValueError: If function name is not found
    """
    if function_name not in STRING_FUNCTIONS:
        available = ', '.join(get_available_functions())
        raise ValueError(f"Function '{function_name}' not found. Available functions: {available}")
    
    return STRING_FUNCTIONS[function_name](*args, **kwargs)
