/**
 * Styled Components Mock
 * 
 * Provides a mock implementation of styled-components for testing
 */
import React from 'react';

// Basic mock styled function factory using Proxy
const styled = new Proxy({}, {
  get: function(obj, prop) {
    // Return a function that simulates the styled.<tag>`` syntax
    return (...args: any[]) => {
      // Basic mock component: renders the tag with props
      const Component = ({ children, ...props }: React.PropsWithChildren<any>) => {
        const passedProps = { ...props };
        // Add a mock class name for basic targeting if needed
        passedProps.className = `mock-styled-${String(prop)}`;
        return React.createElement(prop as string, passedProps, children);
      };
      Component.displayName = `Styled(${String(prop)})`;
      Component.toString = () => `.mock-styled-${String(prop)}`;
      return Component;
    };
  },
});

// Export the necessary mocks 
export default styled as typeof import('styled-components').default;

export const ThemeProvider = ({ children }: any): React.ReactElement => children;
export const css = () => ({});
export const keyframes = (strings: TemplateStringsArray, ...interpolations: any[]) => `mock-keyframes-${Math.random()}`;
export const createGlobalStyle = () => () => null;

// Mock the isStyledComponent check (needed by some libraries like jest-styled-components)
export const isStyledComponent = () => true;

// Mock the useTheme hook (provide a basic theme structure)
export const useTheme = () => ({
  colors: {
    primary: '#0070f3',
    secondary: '#ff4081',
    background: '#ffffff',
    surface: '#f5f5f5',
    error: '#d32f2f',
    text: '#333333',
    textSecondary: '#757575',
    border: '#e0e0e0'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  typography: {
    fontFamily: 'sans-serif',
    fontSize: '16px',
    fontWeightRegular: 400,
    fontWeightBold: 700
  },
  breakpoints: {
    small: '600px',
    medium: '960px',
    large: '1280px'
  }
});

// Placeholder for StyleSheetManager if needed, though often not required for basic mocking
export const StyleSheetManager = ({ children }: { children: React.ReactNode }) => children; 