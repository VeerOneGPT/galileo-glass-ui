/**
 * Hook Testing Utilities
 * 
 * Provides utilities for testing hooks with necessary context providers
 */
import React from 'react';
import { renderHook, act, RenderHookOptions } from '@testing-library/react-hooks';

// Import context providers directly
// Note: Adjust these imports based on actual project structure
import { ThemeProvider } from '../../theme/ThemeProvider';

// If AnimationProvider is available, import it, otherwise use a default export
let AnimationProvider: React.ComponentType<any>;
try {
  // Try importing from standard location
  const AnimationContext = require('../../contexts/AnimationContext');
  AnimationProvider = AnimationContext.AnimationProvider;
} catch (e) {
  // Fallback to a simple wrapper if not available
  AnimationProvider = ({ children }) => React.createElement(React.Fragment, null, children);
}

/**
 * Wrapper component that provides all required context providers
 */
export const AllProvidersWrapper = ({ children }) => 
  React.createElement(
    ThemeProvider, 
    null, 
    React.createElement(AnimationProvider, null, children)
  );

/**
 * Renders a hook with all providers wrapped
 */
export function renderHookWithProviders(callback, options) {
  return renderHook(callback, {
    wrapper: AllProvidersWrapper,
    ...options
  });
}

/**
 * Utility to wait for hook effects to settle
 */
export const waitForHookToSettle = async (timeMs = 50) => {
  // Wait for any pending state updates
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, timeMs));
  });
};

/**
 * Utility to advance time for testing animations
 */
export const advanceTime = async (timeMs = 16) => {
  // Using act to ensure that all updates are processed
  await act(async () => {
    jest.advanceTimersByTime(timeMs);
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}; 