/// <reference path="../../types/jest.d.ts" />
/// <reference path="../../types/testing-library.d.ts" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useColorMode, useTheme } from '../ThemeProvider';

// Test components that use theme hooks
const ColorModeDisplay = () => {
  const { colorMode, isDarkMode, toggleColorMode } = useColorMode();
  return (
    <div>
      <div data-testid="color-mode">{colorMode}</div>
      <div data-testid="is-dark-mode">{isDarkMode ? 'true' : 'false'}</div>
      <button onClick={toggleColorMode} data-testid="toggle-button">
        Toggle Color Mode
      </button>
    </div>
  );
};

const ThemeConsumer = () => {
  const theme = useTheme();
  
  return (
    <div>
      <div data-testid="theme-color-mode">{theme.currentColorMode}</div>
      <div data-testid="theme-is-dark">{theme.isDark ? 'true' : 'false'}</div>
      <button onClick={theme.toggleColorMode} data-testid="theme-toggle-button">
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });
  
  test('provides default color mode context', () => {
    render(
      <ThemeProvider>
        <ColorModeDisplay />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('color-mode')).toHaveTextContent('system');
    // Initially false because our mocked matchMedia returns false
    expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
  });
  
  test('respects initialColorMode prop', () => {
    render(
      <ThemeProvider initialColorMode="dark">
        <ColorModeDisplay />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
  });
  
  test('allows toggling color mode', () => {
    render(
      <ThemeProvider initialColorMode="light">
        <ColorModeDisplay />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    
    fireEvent.click(screen.getByTestId('toggle-button'));
    
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
  });
  
  test('respects forceColorMode prop', () => {
    render(
      <ThemeProvider forceColorMode="dark">
        <ColorModeDisplay />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    
    // Toggling should not work when colorMode is forced
    fireEvent.click(screen.getByTestId('toggle-button'));
    
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
  });
  
  test('useTheme hook provides expected theme context', () => {
    render(
      <ThemeProvider initialColorMode="light">
        <ThemeConsumer />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-color-mode')).toHaveTextContent('light');
    expect(screen.getByTestId('theme-is-dark')).toHaveTextContent('false');
    
    fireEvent.click(screen.getByTestId('theme-toggle-button'));
    
    expect(screen.getByTestId('theme-color-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('theme-is-dark')).toHaveTextContent('true');
  });
  
  test('persists color mode to localStorage', () => {
    const { unmount } = render(
      <ThemeProvider initialColorMode="light">
        <ColorModeDisplay />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByTestId('toggle-button'));
    
    // Check local storage was updated
    expect(window.localStorage.getItem('glass-ui-color-mode')).toBe('dark');
    
    // Unmount and remount
    unmount();
    
    render(
      <ThemeProvider>
        <ColorModeDisplay />
      </ThemeProvider>
    );
    
    // Should load from localStorage
    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
  });
});