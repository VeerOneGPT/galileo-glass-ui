import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// Import the correct class and presets
import { SpringPhysics, SpringPresets, SpringConfig } from '../animations/physics/springPhysics';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { getCurrentTime } from '../utils/time';
// Import context and AnimationProps
import { useAnimationContext } from '../contexts/AnimationContext';
import { AnimationProps } from '../animations/types';

// Re-export config type for external use if needed
export type { SpringConfig as GalileoSpringConfig };

// Define result type for onRest callback
export interface SpringAnimationResult {
  finished: boolean;
  value: number;
  // Add velocity? interrupted flag? More details can be added later
}

// Default spring configuration
const DEFAULT_SPRING_CONFIG: Required<Omit<SpringConfig, 'initialVelocity' | 'clamp'>> & { precision: number } = {
  tension: SpringPresets.DEFAULT.tension,
  friction: SpringPresets.DEFAULT.friction,
  mass: SpringPresets.DEFAULT.mass,
  restThreshold: 0.01,
  precision: 0.01,
};

// Type for imperative start options
export interface SpringStartOptions {
  to?: number;
  from?: number;
  velocity?: number;
}

// Type for the hook's return value
export interface GalileoSpringResult {
  value: number;
  isAnimating: boolean;
  start: (options?: SpringStartOptions) => void;
  stop: () => void;
  reset: (resetValue?: number, resetVelocity?: number) => void;
}

// Update options to include animationConfig
export interface GalileoStateSpringOptions extends Partial<typeof DEFAULT_SPRING_CONFIG> {
  onRest?: (result: SpringAnimationResult) => void;
  /** 
   * If true, skip the animation and jump to the end state immediately.
   * Overrides prefersReducedMotion if set.
   */
  immediate?: boolean; 
  animationConfig?: AnimationProps['animationConfig']; // Add animationConfig
}

/**
 * Animates a single numerical value towards a target using Galileo's spring physics.
 * Respects reduced motion preferences unless `immediate` is true.
 *
 * @param targetValue The target value to animate towards.
 * @param options Optional configuration including physics params, animationConfig, onRest, immediate.
 * @returns The current animated value.
 */
export const useGalileoStateSpring = (
  targetValue: number,
  options?: GalileoStateSpringOptions
): GalileoSpringResult => {
  const prefersReducedMotion = useReducedMotion();
  const { defaultSpring } = useAnimationContext(); // Get context
  
  // Separate non-physics options
  const { onRest, immediate: immediateOption, animationConfig, ...directOptions } = options || {}; 
  
  // Determine if animation should be immediate
  const immediate = immediateOption ?? prefersReducedMotion;

  // Resolve final spring config using standard priority
  const finalSpringConfig = useMemo(() => {
      const baseConfig: SpringConfig = DEFAULT_SPRING_CONFIG;
      
      let contextConf: Partial<SpringConfig> = {};
      if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
          contextConf = SpringPresets[defaultSpring as keyof typeof SpringPresets];
      } else if (typeof defaultSpring === 'object') {
          contextConf = defaultSpring ?? {};
      }

      let propAnimConf: Partial<SpringConfig> = {};
      if (typeof animationConfig === 'string' && animationConfig in SpringPresets) {
          propAnimConf = SpringPresets[animationConfig as keyof typeof SpringPresets];
      } else if (typeof animationConfig === 'object' && animationConfig !== null) {
          // Accept partial SpringConfig from animationConfig
          if ('tension' in animationConfig || 'friction' in animationConfig || 'mass' in animationConfig) {
              propAnimConf = animationConfig as Partial<SpringConfig>;
          }
      }
      
      // Direct options override everything else
      const mergedConfig = { 
          ...baseConfig, 
          ...contextConf, 
          ...propAnimConf, 
          ...directOptions 
      };

      // Ensure required fields have fallbacks
      return {
          tension: mergedConfig.tension ?? DEFAULT_SPRING_CONFIG.tension,
          friction: mergedConfig.friction ?? DEFAULT_SPRING_CONFIG.friction,
          mass: mergedConfig.mass ?? DEFAULT_SPRING_CONFIG.mass,
          restThreshold: mergedConfig.restThreshold ?? DEFAULT_SPRING_CONFIG.restThreshold,
          precision: mergedConfig.precision ?? DEFAULT_SPRING_CONFIG.precision,
      };

  }, [defaultSpring, animationConfig, directOptions]);

  const [currentValue, setCurrentValue] = useState(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const springRef = useRef<SpringPhysics | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const targetRef = useRef(targetValue);
  // Ref to store the latest onRest callback
  const onRestRef = useRef(onRest);

  // Stop animation function (defined before animate)
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsAnimating(false); // Ensure state is updated
    lastTimeRef.current = 0;
  }, []);

  // Update the ref if the callback function changes
  useEffect(() => {
    onRestRef.current = onRest;
  }, [onRest]);

  // Function to initialize or update the SpringPhysics instance
  const initializeSpring = useCallback((startValue: number, initialVelocity?: number) => {
    springRef.current = new SpringPhysics({
      tension: finalSpringConfig.tension,
      friction: finalSpringConfig.friction,
      mass: finalSpringConfig.mass,
      restThreshold: finalSpringConfig.restThreshold,
      initialVelocity: initialVelocity ?? 0,
    });
    // Initialize position correctly
    springRef.current.reset(startValue, initialVelocity ?? 0);
    springRef.current.setTarget(targetRef.current);
    setCurrentValue(startValue);
  }, [finalSpringConfig]); // Depend on resolved config

  // Initialize on mount
  useEffect(() => {
      initializeSpring(targetValue); 
      // Set initial value immediately if needed
      if (immediate) {
        setCurrentValue(targetValue);
        setIsAnimating(false);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeSpring, immediate]); // Removed targetValue, initializeSpring handles it

  // Animation loop function
  const animate = useCallback((time: number) => {
    if (!springRef.current) {
        setIsAnimating(false);
        return;
    }

    const state = springRef.current.update();
    const newValue = state.position;
    const isSettled = state.atRest;

    // Update state - use functional update if needed, but direct should be fine here
    setCurrentValue(newValue);

    if (!isSettled) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Ensure final value is exactly the target and stop loop
      const finalTarget = targetRef.current;
      setCurrentValue(finalTarget);
      stop();

      // Call the onRest callback if provided
      if (onRestRef.current) {
        onRestRef.current({ finished: true, value: finalTarget });
      }
    }
  }, [stop]); // Add stop as dependency

  // Imperative start function
  const start = useCallback((options?: SpringStartOptions) => {
    if (!springRef.current) return;
    
    const finalTarget = options?.to ?? targetRef.current; // Use provided 'to' or the reactive target
    const startValue = options?.from ?? currentValue; // Use provided 'from' or current value
    // Use provided velocity or default to 0 if not provided
    const startVelocity = options?.velocity ?? 0; 
    
    // If starting from a different value, reset the spring first
    if (startValue !== currentValue) {
        springRef.current.reset(startValue, startVelocity);
        setCurrentValue(startValue);
    }
    
    springRef.current.setTarget(finalTarget);
    targetRef.current = finalTarget; // Keep reactive target updated if changed imperatively
    
    stop(); // Stop any existing animation before starting new one
    
    if (immediate) { // Check immediate flag for imperative start too
        setCurrentValue(finalTarget);
        setIsAnimating(false);
        if (onRestRef.current) {
            onRestRef.current({ finished: true, value: finalTarget });
        }
        return;
    }
    
    // Only start RAF loop if not already at rest
    if (!springRef.current.isAtRest()) {
        setIsAnimating(true);
        animationFrameRef.current = requestAnimationFrame(animate);
    } else {
        // If already at the target, ensure state is correct
        setCurrentValue(finalTarget);
        setIsAnimating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, stop, currentValue, immediate]); // Add currentValue, immediate

  // Reset function
  const reset = useCallback((resetValue?: number, resetVelocity = 0) => {
    const finalResetValue = resetValue ?? targetValue; // Reset to initial targetValue by default
    stop();
    initializeSpring(finalResetValue, resetVelocity);
    // Ensure state reflects the reset
    setCurrentValue(finalResetValue);
    targetRef.current = finalResetValue; // Update target ref as well
    setIsAnimating(false);
  }, [stop, initializeSpring, targetValue]); // targetValue is the initial one from props

  // Effect to handle target value changes and start/stop animation
  useEffect(() => {
    const previousTarget = targetRef.current;
    targetRef.current = targetValue;

    // Use the imperative start function to handle target changes
    // This automatically handles starting the animation loop if needed
    start({ to: targetValue });

    // Cleanup on unmount or before re-running due to target change
    return () => {
      stop(); // Use stop function for cleanup
    };
  }, [targetValue, immediate, start, stop, currentValue]); // Add start/stop, use immediate

  // Return the current animated value
  return {
      value: currentValue,
      isAnimating,
      start,
      stop,
      reset
  };
}; 