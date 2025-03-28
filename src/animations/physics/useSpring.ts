import { useRef, useState, useEffect, useCallback } from 'react';
import { SpringPhysics, SpringConfig, SpringPresets } from './springPhysics';

// Rename and export interfaces
export interface SpringOptions {
  /**
   * Initial position of the spring
   */
  from?: number;
  
  /**
   * Target position of the spring
   */
  to?: number;
  
  /**
   * Spring configuration
   */
  config?: Partial<SpringConfig> | keyof typeof SpringPresets;
  
  /**
   * Initial velocity
   */
  velocity?: number;
  
  /**
   * Whether the animation should autostart
   */
  immediate?: boolean;
  
  /**
   * Whether to automatically start when 'to' changes
   */
  autoStart?: boolean;
}

export interface SpringHookResult {
  /**
   * Current value of the spring
   */
  value: number;
  
  /**
   * Whether the spring is currently animating
   */
  isAnimating: boolean;
  
  /**
   * Start the animation from the current position to the target
   */
  start: (options?: { to?: number; from?: number; velocity?: number }) => void;
  
  /**
   * Stop the animation at the current position
   */
  stop: () => void;
  
  /**
   * Reset the spring to its initial state
   */
  reset: () => void;
  
  /**
   * Update the spring configuration
   */
  updateConfig: (config: Partial<SpringConfig> | keyof typeof SpringPresets) => void;
}

/**
 * Hook for using spring physics animation in components
 * 
 * @example
 * ```tsx
 * const { value, start } = useSpring({ 
 *   from: 0, 
 *   to: 100, 
 *   config: 'BOUNCY',
 *   autoStart: true 
 * });
 * 
 * // Use the value in styles
 * const style = {
 *   transform: `translateX(${value}px)`
 * };
 * ```
 */
export function useSpring(options: SpringOptions = {}): SpringHookResult {
  const {
    from = 0,
    to = 0,
    config = 'DEFAULT',
    velocity = 0,
    immediate = false,
    autoStart = true
  } = options;
  
  // State for the current spring value
  const [value, setValue] = useState<number>(from);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Refs for the spring physics and animation frame
  const springRef = useRef<SpringPhysics | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Create or update the spring instance
  useEffect(() => {
    if (!springRef.current) {
      const springConfig = typeof config === 'string' 
        ? SpringPresets[config] 
        : config;
        
      springRef.current = new SpringPhysics({
        ...springConfig,
        initialVelocity: velocity
      });
      
      springRef.current.setTarget(from);
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
      const springConfig = typeof config === 'string' 
        ? SpringPresets[config] 
        : config;
        
      springRef.current.updateConfig(springConfig);
    }
  }, [config]);
  
  // Animation loop
  const animate = useCallback(() => {
    if (springRef.current) {
      const state = springRef.current.update();
      setValue(state.position);
      
      if (!state.atRest) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    }
  }, []);
  
  // Start animation function
  const start = useCallback((options: { to?: number; from?: number; velocity?: number } = {}) => {
    if (springRef.current) {
      const targetValue = options.to ?? to;
      
      springRef.current.setTarget(targetValue, {
        from: options.from,
        velocity: options.velocity
      });
      
      // Cancel existing animation frame if any
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Start animation loop
      setIsAnimating(true);
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [to, animate]);
  
  // Stop animation function
  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setIsAnimating(false);
    }
  }, []);
  
  // Reset function
  const reset = useCallback(() => {
    if (springRef.current) {
      springRef.current.reset(from, velocity);
      setValue(from);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      setIsAnimating(false);
    }
  }, [from, velocity]);
  
  // Update config function
  const updateConfig = useCallback((newConfig: Partial<SpringConfig> | keyof typeof SpringPresets) => {
    if (springRef.current) {
      const springConfig = typeof newConfig === 'string' 
        ? SpringPresets[newConfig] 
        : newConfig;
        
      springRef.current.updateConfig(springConfig);
    }
  }, []);
  
  // Start animation immediately if specified
  useEffect(() => {
    if (immediate && springRef.current) {
      start();
    }
  }, [immediate, start]);
  
  // Auto-start when the 'to' value changes
  useEffect(() => {
    if (autoStart && springRef.current) {
      start();
    }
  }, [to, autoStart, start]);
  
  return {
    value,
    isAnimating,
    start,
    stop,
    reset,
    updateConfig
  };
} 