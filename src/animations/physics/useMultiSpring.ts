import { useRef, useState, useEffect, useCallback } from 'react';
import { SpringConfig, SpringPresets } from './springPhysics';
import { MultiSpring, SpringVector, SpringTarget } from './multiSpring';

export interface MultiSpringOptions<T extends SpringVector> {
  /**
   * Initial values
   */
  from: T;
  
  /**
   * Target values
   */
  to?: T;
  
  /**
   * Spring configuration
   */
  config?: Partial<SpringConfig> | keyof typeof SpringPresets;
  
  /**
   * Initial velocities
   */
  velocity?: Partial<T>;
  
  /**
   * Whether the animation should autostart
   */
  immediate?: boolean;
  
  /**
   * Whether to automatically start when 'to' changes
   */
  autoStart?: boolean;
}

export interface MultiSpringResult<T extends SpringVector> {
  /**
   * Current values of the spring
   */
  values: T;
  
  /**
   * Whether the spring is currently animating
   */
  isAnimating: boolean;
  
  /**
   * Start the animation
   */
  start: (target: SpringTarget<T>) => void;
  
  /**
   * Stop the animation at the current position
   */
  stop: () => void;
  
  /**
   * Reset the spring to its initial state
   */
  reset: (values?: T) => void;
  
  /**
   * Update the spring configuration
   */
  updateConfig: (config: Partial<SpringConfig> | keyof typeof SpringPresets) => void;
}

/**
 * Hook for using multi-spring physics animation in components
 * 
 * @example
 * ```tsx
 * const { values, start } = useMultiSpring({ 
 *   from: { x: 0, y: 0 }, 
 *   to: { x: 100, y: 50 }, 
 *   config: 'BOUNCY',
 *   autoStart: true 
 * });
 * 
 * // Use the values in styles
 * const style = {
 *   transform: `translate(${values.x}px, ${values.y}px)`
 * };
 * ```
 */
export function useMultiSpring<T extends SpringVector>(
  options: MultiSpringOptions<T>
): MultiSpringResult<T> {
  const {
    from,
    to,
    config = 'DEFAULT',
    velocity,
    immediate = false,
    autoStart = true
  } = options;
  
  // State for the current values
  const [values, setValues] = useState<T>({ ...from });
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Refs for the spring system and animation frame
  const springRef = useRef<MultiSpring<T> | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Initialize the multi-spring system
  useEffect(() => {
    if (!springRef.current) {
      springRef.current = new MultiSpring<T>(from, config);
    }
    
    return () => {
      // Clean up animation frame on unmount
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  // Update spring config when it changes
  useEffect(() => {
    if (springRef.current) {
      springRef.current.updateConfig(config);
    }
  }, [config]);
  
  // Animation loop
  const animate = useCallback(() => {
    if (springRef.current) {
      const newValues = springRef.current.update();
      setValues(newValues);
      
      if (!springRef.current.isAtRest()) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    }
  }, []);
  
  // Start animation function
  const start = useCallback((target: SpringTarget<T>) => {
    if (springRef.current) {
      springRef.current.setTarget(target);
      
      // Cancel existing animation frame if any
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Start animation loop
      setIsAnimating(true);
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);
  
  // Stop animation function
  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setIsAnimating(false);
    }
  }, []);
  
  // Reset function
  const reset = useCallback((resetValues?: T) => {
    if (springRef.current) {
      springRef.current.reset(resetValues || from);
      setValues(resetValues || from);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      setIsAnimating(false);
    }
  }, [from]);
  
  // Update config function
  const updateConfig = useCallback((newConfig: Partial<SpringConfig> | keyof typeof SpringPresets) => {
    if (springRef.current) {
      springRef.current.updateConfig(newConfig);
    }
  }, []);
  
  // Start animation immediately if specified
  useEffect(() => {
    if (immediate && springRef.current && to) {
      start({ to });
    }
  }, [immediate, to, start]);
  
  // Auto-start when the 'to' value changes
  useEffect(() => {
    if (autoStart && springRef.current && to) {
      start({ to });
    }
  }, [to, autoStart, start]);
  
  return {
    values,
    isAnimating,
    start,
    stop,
    reset,
    updateConfig
  };
} 