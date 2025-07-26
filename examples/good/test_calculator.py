# src/tests/test_calculator.py

import unittest
import sys
import os

# Add the parent directory to the sys.path to allow importing calculator.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from calculator import add, subtract, multiply, divide

class TestCalculator(unittest.TestCase):
    """
    Unit tests for the calculator functions.
    """

    def test_add(self):
        """Test the addition function."""
        self.assertEqual(add(1, 2), 3)
        self.assertEqual(add(-1, 1), 0)
        self.assertEqual(add(-1, -1), -2)
        self.assertEqual(add(0, 0), 0)
        self.assertEqual(add(2.5, 3.5), 6.0)
        self.assertEqual(add(100, 200), 300)

    def test_subtract(self):
        """Test the subtraction function."""
        self.assertEqual(subtract(5, 3), 2)
        self.assertEqual(subtract(3, 5), -2)
        self.assertEqual(subtract(-1, -1), 0)
        self.assertEqual(subtract(10, 0), 10)
        self.assertEqual(subtract(7.5, 2.5), 5.0)
        self.assertEqual(subtract(0, 0), 0)

    def test_multiply(self):
        """Test the multiplication function."""
        self.assertEqual(multiply(2, 3), 6)
        self.assertEqual(multiply(-2, 3), -6)
        self.assertEqual(multiply(-2, -3), 6)
        self.assertEqual(multiply(5, 0), 0)
        self.assertEqual(multiply(2.5, 2), 5.0)
        self.assertEqual(multiply(10, 10), 100)

    def test_divide(self):
        """Test the division function."""
        self.assertEqual(divide(6, 3), 2)
        self.assertEqual(divide(5, 2), 2.5)
        self.assertEqual(divide(-6, 3), -2)
        self.assertEqual(divide(0, 5), 0)
        self.assertAlmostEqual(divide(10, 3), 3.3333333333333335) # Using assertAlmostEqual for float comparisons

        # Test division by zero
        with self.assertRaises(ValueError) as cm:
            divide(10, 0)
        self.assertEqual(str(cm.exception), "Cannot divide by zero!")

        with self.assertRaises(ValueError):
            divide(0, 0)

if __name__ == '__main__':
    unittest.main()
