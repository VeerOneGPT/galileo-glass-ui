/**
 * Responsive Breakpoint Hook
 *
 * Custom hook for detecting and responding to screen size breakpoints.
 * This hook provides a standardized way to handle responsive layouts.
 */
import { useState, useEffect, useMemo } from 'react';

import { useTheme } from '../theme/ThemeProvider';

/**
 * Breakpoint keys
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Type definitions for object values that change with breakpoints
 */
export type ResponsiveValue<T> = {
  [key in Breakpoint]?: T;
} & {
  default?: T;
};

/**
 * Default breakpoint values in pixels
 */
const DEFAULT_BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

/**
 * Custom hook for detecting and responding to breakpoints
 *
 * @returns {Object} Object containing breakpoint information
 */
export const useBreakpoint = () => {
  // Get breakpoint values from theme or use defaults
  const theme = useTheme();
  // Safely access breakpoints from theme with fallback
  // Using a type assertion to access theme properties safely
  const breakpointsObj =
    theme && 'breakpoints' in theme ? (theme as any).breakpoints : { values: DEFAULT_BREAKPOINTS };
  const breakpoints = breakpointsObj.values || DEFAULT_BREAKPOINTS;

  // State to track current breakpoint
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('md');

  // Function to calculate current breakpoint based on window width
  const calculateBreakpoint = (width: number): Breakpoint => {
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  // Effect to update breakpoint on window resize
  useEffect(() => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') return;

    // Function to handle resize event
    const handleResize = () => {
      const width = window.innerWidth;
      setCurrentBreakpoint(calculateBreakpoint(width));
    };

    // Initial calculation
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoints.lg, breakpoints.md, breakpoints.sm, breakpoints.xl]); // Re-run effect if breakpoint values change

  // Derive additional values from current breakpoint
  const isMobile = useMemo(() => ['xs', 'sm'].includes(currentBreakpoint), [currentBreakpoint]);
  const isTablet = useMemo(() => currentBreakpoint === 'md', [currentBreakpoint]);
  const isDesktop = useMemo(() => ['lg', 'xl'].includes(currentBreakpoint), [currentBreakpoint]);

  // Create media query string generator
  const createMediaQuery = (breakpoint: Breakpoint): string => {
    const width = breakpoints[breakpoint];
    return `@media (min-width: ${width}px)`;
  };

  // Check if current breakpoint is up (greater than or equal to) a given breakpoint
  const isBreakpointUp = (breakpoint: Breakpoint): boolean => {
    const sizes: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = sizes.indexOf(currentBreakpoint);
    const breakpointIndex = sizes.indexOf(breakpoint);
    return currentIndex >= breakpointIndex;
  };

  // Check if current breakpoint is down (less than) a given breakpoint
  const isBreakpointDown = (breakpoint: Breakpoint): boolean => {
    const sizes: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = sizes.indexOf(currentBreakpoint);
    const breakpointIndex = sizes.indexOf(breakpoint);
    return currentIndex < breakpointIndex;
  };

  // Check if current breakpoint is between two given breakpoints
  const isBreakpointBetween = (lower: Breakpoint, upper: Breakpoint): boolean => {
    return isBreakpointUp(lower) && isBreakpointDown(upper);
  };

  return {
    // Current values
    breakpoint: currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,

    // Comparison functions
    isBreakpointUp,
    isBreakpointDown,
    isBreakpointBetween,

    // Utility functions
    createMediaQuery,

    // Raw breakpoint values
    values: breakpoints,
  };
};

export default useBreakpoint;
