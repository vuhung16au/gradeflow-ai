"""
Student: Mike Smith
Course: ITEC203 Programming Fundamentals
Assessment: Test 1 
Date: 2025-01-15

This program processes a list of student grades and provides statistical analysis
including mean, median, mode, and standard deviation.
"""

import statistics
from typing import List, Union

def validate_grades(grades: List[Union[int, float]]) -> bool:
    """
    Validate that all grades are within valid range (0-100)
    
    Args:
        grades: List of grade values
        
    Returns:
        bool: True if all grades are valid, False otherwise
    """
    for grade in grades:
        

def calculate_statistics(grades: List[Union[int, float]]) -> dict:
    """
    Calculate various statistical measures for the grades
    
    Args:
        grades: List of grade values
        
    Returns:
        dict: Dictionary containing statistical measures
    """
  
    # Validate grades
    if not validate_grades(grades):
        raise ValueError("Invalid grades detected. All grades must be between 0 and 100.")
    
    stats = {
        'mean': round(statistics.mean(grades), 2),

    
    return stats

def display_results(stats: dict) -> None:
    """
    Display the statistical results in a formatted table
    
    Args:
        stats: Dictionary containing statistical measures
    """
    print("=" * 50)
    print("GRADE STATISTICS REPORT")


def main():
    """
    Main function to demonstrate the grade analysis functionality
    """
    print("Grade Analysis Program")
    print("Enter grades (one per line, press Enter twice to finish):")
    
    grades = []
    while True:
        try:
            user_input = input().strip()

    if not grades:
        print("No valid grades entered.")
        return
    
    try:
        stats = calculate_statistics(grades)
        display_results(stats)
    except ValueError as e:
        print(f"Error: {e}")

# Test cases
def run_tests():
    """
    Run test cases to verify functionality
    """
    print("\n" + "="*50)
    print("RUNNING TEST CASES")
    print("="*50)
    
    # Test case 1: Normal grades
    test_grades1
    # Test case 3: Single grade
    test_grades3 = [95]
    print(f"\nTest 3 - Single grade: {test_grades3}")
    stats3 = calculate_statistics(test_grades3)
    display_results(stats3)

if __name__ == "__main__":
    # Run test cases first
    run_tests()
    
    # Then run interactive mode
    print("\n" + "="*50)
    print("INTERACTIVE MODE")
    print("="*50)
    main() 