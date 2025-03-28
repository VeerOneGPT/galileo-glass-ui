/**
 * useAccessibilitySettings Hook
 * 
 * Custom hook to access accessibility settings from the AccessibilityProvider.
 */
import { useContext } from 'react';
import { AccessibilityContext, AccessibilityContextValue } from '../components/AccessibilityProvider';

/**
 * Hook to use accessibility settings
 * @returns Accessibility context values and setter functions
 */
export const useAccessibilitySettings = (): AccessibilityContextValue & {
  isReducedMotion: boolean;
  isHighContrast: boolean;
  isReduceTransparency: boolean;
} => {
  const accessibilityContext = useContext(AccessibilityContext);

  // Include some convenience getters
  return {
    ...accessibilityContext,
    isReducedMotion: accessibilityContext.reducedMotion || accessibilityContext.disableAnimations,
    isHighContrast: accessibilityContext.highContrast,
    isReduceTransparency: accessibilityContext.reduceTransparency,
  };
};

export default useAccessibilitySettings;