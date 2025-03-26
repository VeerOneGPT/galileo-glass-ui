/**
 * Responsive Value Hook
 *
 * Custom hook for handling values that change based on current screen size breakpoint.
 * This hook provides a clean way to manage responsive properties.
 */
import { useBreakpoint, ResponsiveValue, Breakpoint } from './useBreakpoint';

/**
 * Order of breakpoints for resolution (smallest to largest)
 */
const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];

/**
 * Custom hook for getting a value that responds to the current breakpoint
 *
 * @param {ResponsiveValue<T>} responsiveObject - Object containing values for different breakpoints
 * @param {T} [fallback] - Fallback value if no matching breakpoint is found
 * @returns {T} - The value for the current breakpoint
 *
 * @example
 * const fontSize = useResponsiveValue({ xs: 12, md: 16, lg: 18 }, 14);
 */
export const useResponsiveValue = <T>(responsiveObject: ResponsiveValue<T>, fallback?: T): T => {
  const { breakpoint } = useBreakpoint();

  // If the exact breakpoint exists, return that value
  if (responsiveObject[breakpoint] !== undefined) {
    return responsiveObject[breakpoint] as T;
  }

  // Find the closest smaller breakpoint with a defined value
  const index = breakpointOrder.indexOf(breakpoint);
  for (let i = index; i >= 0; i--) {
    const smallerBreakpoint = breakpointOrder[i];
    if (responsiveObject[smallerBreakpoint] !== undefined) {
      return responsiveObject[smallerBreakpoint] as T;
    }
  }

  // Use default value if specified
  if (responsiveObject.default !== undefined) {
    return responsiveObject.default;
  }

  // Fall back to provided fallback
  return fallback as T;
};

/**
 * Helper function to create a responsive value object
 *
 * @param {T} defaultValue - Default value for all breakpoints
 * @param {Partial<ResponsiveValue<T>>} overrides - Override values for specific breakpoints
 * @returns {ResponsiveValue<T>} - Complete responsive value object
 *
 * @example
 * const padding = createResponsiveValue('1rem', { xs: '0.5rem', lg: '2rem' });
 */
export const createResponsiveValue = <T>(
  defaultValue: T,
  overrides: Partial<ResponsiveValue<T>> = {}
): ResponsiveValue<T> => {
  return {
    default: defaultValue,
    ...overrides,
  };
};

export default useResponsiveValue;
