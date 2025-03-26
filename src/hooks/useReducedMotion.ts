/**
 * useReducedMotion Hook
 * 
 * Hook for detecting user's motion preferences
 */
import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user prefers reduced motion
 * 
 * @returns True if the user prefers reduced motion
 */
export const useReducedMotion = (): boolean => {
  // Create a safe query object that works with older browsers too
  const getMediaQueryList = () => 
    typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)') 
      : { matches: false };
  
  const query = getMediaQueryList();
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(query.matches);
  
  useEffect(() => {
    // Generic change handler that works with both legacy and modern event patterns
    type CompatibleEvent = MediaQueryListEvent | MediaQueryList;
    const handleChange = (event: CompatibleEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    const mediaQuery = getMediaQueryList();
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Event handler setup with type safety
    if (typeof window === 'undefined') {
      return undefined;
    }
    
    // Use modern API if available
    if (typeof mediaQuery === 'object' && 'addEventListener' in mediaQuery && 
        typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange as (event: MediaQueryListEvent) => void);
      
      return () => {
        (mediaQuery as MediaQueryList).removeEventListener(
          'change', 
          handleChange as (event: MediaQueryListEvent) => void
        );
      };
    } 
    // Use legacy API as fallback
    else if (typeof mediaQuery === 'object' && 'addListener' in mediaQuery && 
             typeof (mediaQuery as any).addListener === 'function') {
      (mediaQuery as any).addListener(handleChange);
      
      return () => {
        (mediaQuery as any).removeListener(handleChange);
      };
    }
    
    return undefined;
  }, []);
  
  return prefersReducedMotion;
};