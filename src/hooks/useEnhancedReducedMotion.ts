import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Interface for the return value of useEnhancedReducedMotion hook.
 */
export interface EnhancedReducedMotionInfo {
  /**
   * Whether reduced motion is preferred.
   * This is true if either the system preference is set or a user override is enabled.
   */
  prefersReducedMotion: boolean;
  /**
   * The raw value from the `(prefers-reduced-motion: reduce)` media query.
   */
  systemPrefersReducedMotion: boolean;
  /**
   * Indicates if the current `prefersReducedMotion` value is due to a user override.
   */
  isOverridden: boolean;
  /**
   * Function to set a user override for the reduced motion preference.
   * Pass `true` to force reduced motion, `false` to force full motion,
   * or `null` to respect the system setting.
   * The preference is stored in localStorage.
   */
  setUserOverride: (value: boolean | null) => void;
}

// Define a key for localStorage
const STORAGE_KEY = 'galileo-glass-reduced-motion-override';

/**
 * Enhanced hook to detect user's reduced motion preference via media query,
 * while also allowing for a user override stored in localStorage.
 *
 * @returns An object containing:
 *  - `prefersReducedMotion`: A boolean indicating the effective preference.
 *  - `setUserOverride`: A function to manually set the preference.
 */
export const useEnhancedReducedMotion = (): EnhancedReducedMotionInfo => {
  // State for the media query result
  const [mediaQueryResult, setMediaQueryResult] = useState<boolean>(false);

  // State for the user override (null means no override, read from localStorage initially)
  const [userOverride, setUserOverrideState] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedValue = localStorage.getItem(STORAGE_KEY);
        if (storedValue === 'true') return true;
        if (storedValue === 'false') return false;
      } catch (error) {
        console.error("Error reading reduced motion override from localStorage:", error);
      }
    }
    return null; // Default to null (no override)
  });

  // Effect to set up the media query listener
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial state based on current media query value
    setMediaQueryResult(mediaQuery.matches);

    // Define the event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMediaQueryResult(event.matches);
    };

    // Add the listener using the modern method with a fallback
    try {
      if ('addEventListener' in mediaQuery) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
      // Fallback for older browsers (consider if necessary)
      // @ts-ignore Type safety for deprecated method
      if ('addListener' in mediaQuery) {
        // @ts-ignore
        mediaQuery.addListener(handleChange);
        // @ts-ignore
        return () => mediaQuery.removeListener(handleChange);
      }
    } catch (error) {
      console.error("Error adding media query listener:", error);
    }

    return undefined; // Should not be reached if matchMedia exists

  }, []); // Empty dependency array ensures this runs only once on mount

  // Memoized function to update the user override state and localStorage
  const setUserOverride = useCallback((value: boolean | null) => {
    setUserOverrideState(value);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        if (value === null) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, String(value));
        }
      } catch (error) {
        console.error("Error saving reduced motion override to localStorage:", error);
      }
    }
  }, []); // setUserOverrideState is stable, no other dependencies

  // Calculate the final preference, memoizing the result
  const prefersReducedMotion = useMemo(() => {
    // User override takes precedence
    if (userOverride !== null) {
      return userOverride;
    }
    // Fallback to the media query result
    return mediaQueryResult;
  }, [userOverride, mediaQueryResult]);

  // Calculate if an override is active
  const isOverridden = useMemo(() => userOverride !== null, [userOverride]);

  // Memoize the returned object to ensure stable reference unless values change
  const result = useMemo(() => ({
    prefersReducedMotion,
    systemPrefersReducedMotion: mediaQueryResult,
    isOverridden,
    setUserOverride,
  }), [prefersReducedMotion, mediaQueryResult, isOverridden, setUserOverride]);

  return result;
}; 