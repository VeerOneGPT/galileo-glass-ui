/**
 * Hook Testing Utilities
 * 
 * Provides utilities for testing hooks with necessary context providers
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { AnimationProvider } from '../../contexts/AnimationContext';

type WrapperProps = {
  children: React.ReactNode;
};

/**
 * Wrapper component that provides all required context providers
 */
export const AllProvidersWrapper: React.FC<WrapperProps> = ({ children }) => (
  <ThemeProvider>
    <AnimationProvider>
      {children}
    </AnimationProvider>
  </ThemeProvider>
);

/**
 * Renders a hook with all providers wrapped
 */
export function renderHookWithProviders<Result, Props>(
  callback: (props: Props) => Result,
  options?: any
) {
  return renderHook(callback, {
    wrapper: AllProvidersWrapper,
    ...options
  });
}

/**
 * Utility to wait for hook effects to settle
 */
export const waitForHookToSettle = async (timeMs = 50): Promise<void> => {
  // Wait for any pending state updates
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, timeMs));
  });
};

/**
 * Utility to advance time for testing animations
 */
export const advanceTime = async (timeMs = 16): Promise<void> => {
  // Using act to ensure that all updates are processed
  await act(async () => {
    jest.advanceTimersByTime(timeMs);
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}; 