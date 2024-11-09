import "@testing-library/jest-native/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react-native";

import Button from "../Button";

describe("<Button />", () => {
  test("Button renders text and onPress is called when button is pressed", () => {
    const mockOnPress = jest.fn();

    render(<Button text="Test Button" onPress={mockOnPress} />);

    const button = screen.getByText("Test Button");
    expect(button).toBeTruthy();
    fireEvent(button, "press");
    expect(mockOnPress).toHaveBeenCalled();
  });

  test("onPress is not called when button is disabled", () => {
    const mockOnPress = jest.fn();

    render(<Button text="Test Button" onPress={mockOnPress} disabled />);

    const button = screen.getByText("Test Button");
    fireEvent(button, "press");
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  test("onPress is not called when button is loading", () => {
    const mockOnPress = jest.fn();

    render(<Button text="Test Button" onPress={mockOnPress} loading />);

    const button = screen.getByTestId("button-loading-spinner");
    fireEvent(button, "press");
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  test("Displays opacity when pressed", () => {
    const mockOnPress = jest.fn();

    render(<Button text="Test Button" onPress={mockOnPress} testOnly_pressed />);

    const button = screen.getByTestId("button-pressable");
    expect(button).toHaveStyle({ opacity: 0.6 });
  });
});
