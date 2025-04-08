/**
 * Card Component Parallax Attribute Test
 * 
 * This test specifically verifies that the Card component doesn't cause React DOM warnings
 * about invalid 'parallax' attributes. It tests that the Card doesn't spread boolean parallax
 * props to the DOM element.
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from '../../../theme';
import { Card } from '../Card';

// Mock console.error to detect React DOM warnings
const originalConsoleError = console.error;
let consoleErrorSpy: jest.SpyInstance;

describe('Card Component - Parallax Attribute', () => {
  beforeEach(() => {
    // Set up spy on console.error before each test
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Clean up spy after each test
    consoleErrorSpy.mockRestore();
    console.error = originalConsoleError;
  });

  test('does not cause React DOM warnings about invalid parallax attribute', () => {
    // Render the Card component
    render(
      <ThemeProvider>
        <Card>Test content</Card>
      </ThemeProvider>
    );

    // Check if there were any console.error calls with a message about parallax
    const parallaxWarningCalls = consoleErrorSpy.mock.calls.filter(
      call => call[0] && typeof call[0] === 'string' && call[0].includes('parallax')
    );

    // We expect no console.error calls containing 'parallax'
    expect(parallaxWarningCalls.length).toBe(0);
  });

  test('does not render parallax attribute on the DOM element', () => {
    // Render the Card with a test ID
    const { container } = render(
      <ThemeProvider>
        <Card data-testid="test-card">Test content</Card>
      </ThemeProvider>
    );

    // Get the rendered element
    const cardElement = container.querySelector('[data-testid="test-card"]');
    
    // Verify the card element exists
    expect(cardElement).toBeTruthy();
    
    // Check that it doesn't have a parallax attribute
    expect(cardElement?.hasAttribute('parallax')).toBe(false);
  });

  test('passes other valid props to DOM element', () => {
    // Render the Card with valid props
    const { container } = render(
      <ThemeProvider>
        <Card data-testid="test-card" role="region" aria-label="Test card">
          Test content
        </Card>
      </ThemeProvider>
    );

    // Get the rendered element
    const cardElement = container.querySelector('[data-testid="test-card"]');
    
    // Verify valid attributes are passed
    expect(cardElement?.getAttribute('role')).toBe('region');
    expect(cardElement?.getAttribute('aria-label')).toBe('Test card');
  });
}); 