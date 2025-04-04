import React from 'react';
import { render, screen } from '@testing-library/react';
import { Slot } from '@radix-ui/react-slot';
import '@testing-library/jest-dom';

import { Button } from './Button'; // Assuming Button export is here
import { ThemeProvider } from '../../theme'; // Import ThemeProvider

// Basic Theme wrapper for testing
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Button with asChild', () => {
  test('should render as the child element when asChild is true', () => {
    const testId = 'link-child';
    const buttonText = 'Click Me as Link';

    renderWithTheme(
      <Button asChild>
        <a href="#" data-testid={testId}>{buttonText}</a>
      </Button>
    );

    // Check if the anchor element is rendered
    const linkElement = screen.getByTestId(testId);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');

    // Check if the button element itself is NOT rendered
    const buttonElement = screen.queryByRole('button');
    expect(buttonElement).not.toBeInTheDocument();

    // Check if the content is present within the child
    expect(linkElement).toHaveTextContent(buttonText);
    
    // Optional: Check if button-related classes/styles are merged (might be brittle)
    // Example: expect(linkElement).toHaveClass('some-button-class'); 
  });

  test('should render as a button when asChild is false or omitted', () => {
    const buttonText = 'Click Me as Button';
    renderWithTheme(<Button>{buttonText}</Button>);

    const buttonElement = screen.getByRole('button', { name: buttonText });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement.tagName).toBe('BUTTON');
  });
}); 