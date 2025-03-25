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
  const query = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(query.matches);
  
  useEffect(() => {
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    
    // Add event listener to detect preference changes
    query.addEventListener('change', handleChange);
    
    // Set initial value
    setPrefersReducedMotion(query.matches);
    
    // Clean up event listener
    return () => {
      query.removeEventListener('change', handleChange);
    };
  }, [query]);
  
  return prefersReducedMotion;
};