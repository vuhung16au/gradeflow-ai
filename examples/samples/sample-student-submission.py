"""
Student: John Smith
Course: ITEC203 Programming Fundamentals
Assessment: Test 1 - Grade Analysis Program
Date: 2024-01-15

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
        if not isinstance(grade, (int, float)) or grade < 0 or grade > 100:
            return False
    return True

def calculate_statistics(grades: List[Union[int, float]]) -> dict:
    """
    Calculate various statistical measures for the grades
    
    Args:
        grades: List of grade values
        
    Returns:
        dict: Dictionary containing statistical measures
    """
    if not grades:
        return {
            'mean': 0,
            'median': 0,
            'mode': None,
            'std_dev': 0,
            'count': 0
        }
    
    # Validate grades
    if not validate_grades(grades):
        raise ValueError("Invalid grades detected. All grades must be between 0 and 100.")
    
    stats = {
        'mean': round(statistics.mean(grades), 2),
        'median': round(statistics.median(grades), 2),
        'mode': statistics.mode(grades) if len(set(grades)) < len(grades) else None,
        'std_dev': round(statistics.stdev(grades), 2) if len(grades) > 1 else 0,
        'count': len(grades)
    }
    
    return stats

def display_results(stats: dict) -> None:
    """
    Display the statistical results in a formatted table
    
    Args:
        stats: Dictionary containing statistical measures
    """
    print("=" * 50)
    print("GRADE STATISTICS REPORT")
    print("=" * 50)
    print(f"Number of grades: {stats['count']}")
    print(f"Mean: {stats['mean']}")
    print(f"Median: {stats['median']}")
    print(f"Mode: {stats['mode'] if stats['mode'] is not None else 'No mode'}")
    print(f"Standard Deviation: {stats['std_dev']}")
    print("=" * 50)

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
            if user_input == "":
                break
            grade = float(user_input)
            if 0 <= grade <= 100:
                grades.append(grade)
            else:
                print(f"Warning: {grade} is not in valid range (0-100). Skipping.")
        except ValueError:
            print("Invalid input. Please enter a valid number.")
            continue
    
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
    test_grades1 = [85, 92, 78, 96, 88, 91, 87, 90, 84, 89]
    print(f"Test 1 - Normal grades: {test_grades1}")
    stats1 = calculate_statistics(test_grades1)
    display_results(stats1)
    
    # Test case 2: Empty list
    test_grades2 = []
    print(f"\nTest 2 - Empty list: {test_grades2}")
    stats2 = calculate_statistics(test_grades2)
    display_results(stats2)
    
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