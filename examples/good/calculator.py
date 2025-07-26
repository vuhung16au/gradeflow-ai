# src/calculator.py

def add(x, y):
    """
    Performs addition of two numbers.

    Args:
        x (float or int): The first number.
        y (float or int): The second number.

    Returns:
        float or int: The sum of x and y.
    """
    return x + y

def subtract(x, y):
    """
    Performs subtraction of two numbers.

    Args:
        x (float or int): The first number (minuend).
        y (float or int): The second number (subtrahend).

    Returns:
        float or int: The difference between x and y.
    """
    return x - y

def multiply(x, y):
    """
    Performs multiplication of two numbers.

    Args:
        x (float or int): The first number.
        y (float or int): The second number.

    Returns:
        float or int: The product of x and y.
    """
    return x * y

def divide(x, y):
    """
    Performs division of two numbers.

    Args:
        x (float or int): The numerator (dividend).
        y (float or int): The denominator (divisor).

    Returns:
        float or int: The quotient of x divided by y.

    Raises:
        ValueError: If the denominator y is zero.
    """
    if y == 0:
        raise ValueError("Cannot divide by zero!")
    return x / y

def get_number_input(prompt):
    """
    Prompts the user for a number input and validates it.

    Args:
        prompt (str): The message to display to the user.

    Returns:
        float: The validated number input.
    """
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Invalid input. Please enter a valid number.")

def display_menu():
    """Displays the calculator operation menu."""
    print("\nSelect operation:")
    print("1. Add")
    print("2. Subtract")
    print("3. Multiply")
    print("4. Divide")
    print("5. Exit")

def main():
    """Main function to run the calculator application."""
    print("Welcome to the Simple Calculator!")

    while True:
        display_menu()
        choice = input("Enter choice(1/2/3/4/5): ")

        if choice == '5':
            print("Exiting calculator. Goodbye!")
            break

        if choice in ('1', '2', '3', '4'):
            num1 = get_number_input("Enter first number: ")
            num2 = get_number_input("Enter second number: ")

            try:
                if choice == '1':
                    print(f"{num1} + {num2} = {add(num1, num2)}")
                elif choice == '2':
                    print(f"{num1} - {num2} = {subtract(num1, num2)}")
                elif choice == '3':
                    print(f"{num1} * {num2} = {multiply(num1, num2)}")
                elif choice == '4':
                    print(f"{num1} / {num2} = {divide(num1, num2)}")
            except ValueError as e:
                print(f"Error: {e}")
            except Exception as e:
                print(f"An unexpected error occurred: {e}")
        else:
            print("Invalid input. Please enter a number between 1 and 5.")

if __name__ == "__main__":
    main()
