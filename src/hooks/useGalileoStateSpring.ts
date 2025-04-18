import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// Import the correct class and presets AS NAMESPACE
import * as springPhysics from '../animations/physics/springPhysics';
// Re-export necessary types/objects from the namespace
export type { SpringConfig as GalileoSpringConfig } from '../animations/physics/springPhysics';
export const SpringPresets = springPhysics.SpringPresets;

import { useReducedMotion } from '../hooks/useReducedMotion';
import { getCurrentTime } from '../utils/time';
import { useAnimationContext } from '../contexts/AnimationContext';
import { AnimationProps } from '../animations/types';
import { MotionSensitivityLevel, AnimationCategory } from '../types/accessibility'; // Import enum

// Define result type for onRest callback
export interface SpringAnimationResult {
  finished: boolean;
  value: number;
  // Add velocity? interrupted flag? More details can be added later
}

// Default spring configuration
const DEFAULT_SPRING_CONFIG: Required<Omit<springPhysics.SpringConfig, 'initialVelocity' | 'clamp'>> & { precision: number } = {
  tension: 170,
  friction: 26,
  mass: 1,
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
  /** Optional: Hint for adjusting animation intensity based on sensitivity level. */
  motionSensitivityLevel?: MotionSensitivityLevel;
  /** Optional: Categorize the animation's purpose. */
  category?: AnimationCategory;
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
  // Get sensitivity level from context OR passed options
  const { defaultSpring, activeQualityTier, motionSensitivityLevel: contextSensitivityLevel } = useAnimationContext(); 
  
  const { 
      onRest, 
      immediate: immediateOption, 
      animationConfig, 
      // Get level from options, fallback to context, default to MEDIUM if none
      motionSensitivityLevel = contextSensitivityLevel ?? MotionSensitivityLevel.MEDIUM, 
      category,
      ...directOptions 
  } = options || {}; 
  
  // Determine immediate state
  const immediate = immediateOption ?? prefersReducedMotion;

  // Resolve final spring config
  const finalSpringConfig = useMemo(() => {
      const CurrentSpringPresets = springPhysics.SpringPresets;
      const baseConfig: typeof DEFAULT_SPRING_CONFIG = DEFAULT_SPRING_CONFIG;
      
      let contextConf: Partial<springPhysics.SpringConfig> = {};
      if (typeof defaultSpring === 'string' && CurrentSpringPresets && defaultSpring in CurrentSpringPresets) {
          contextConf = CurrentSpringPresets[defaultSpring as keyof typeof CurrentSpringPresets];
      } else if (typeof defaultSpring === 'object') {
          contextConf = defaultSpring ?? {};
      }

      let propAnimConf: Partial<springPhysics.SpringConfig> = {};
      if (typeof animationConfig === 'string' && CurrentSpringPresets && animationConfig in CurrentSpringPresets) {
          propAnimConf = CurrentSpringPresets[animationConfig as keyof typeof CurrentSpringPresets];
      } else if (typeof animationConfig === 'object' && animationConfig !== null) {
          // Accept partial SpringConfig from animationConfig
          if ('tension' in animationConfig || 'friction' in animationConfig || 'mass' in animationConfig) {
              propAnimConf = animationConfig as Partial<springPhysics.SpringConfig>;
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
      let resolvedConfig = {
          tension: mergedConfig.tension ?? baseConfig.tension,
          friction: mergedConfig.friction ?? baseConfig.friction,
          mass: mergedConfig.mass ?? baseConfig.mass,
          restThreshold: mergedConfig.restThreshold ?? baseConfig.restThreshold,
          precision: mergedConfig.precision ?? baseConfig.precision,
      };

      // --- Adjust for Reduced Motion & Sensitivity Level --- 
      if (prefersReducedMotion && !immediateOption) { // Only adjust if not explicitly immediate
          switch (motionSensitivityLevel) {
              case MotionSensitivityLevel.LOW:
                  // Drastic reduction: Slower, much less bouncy
                  resolvedConfig.tension *= 0.3;
                  resolvedConfig.friction *= 2.0; 
                  break;
              case MotionSensitivityLevel.MEDIUM:
                  // Moderate reduction: Slightly slower, less bouncy
                  resolvedConfig.tension *= 0.6;
                  resolvedConfig.friction *= 1.5;
                  break;
              case MotionSensitivityLevel.HIGH:
                  // Minimal reduction: Slightly less bouncy
                  resolvedConfig.friction *= 1.2;
                  break;
              case MotionSensitivityLevel.NONE:
              default:
                  // Use standard reduced motion preset if available?
                   if (CurrentSpringPresets && 'REDUCED_MOTION' in CurrentSpringPresets) {
                       const reducedPreset = CurrentSpringPresets.REDUCED_MOTION;
                       resolvedConfig.tension = reducedPreset.tension ?? resolvedConfig.tension;
                       resolvedConfig.friction = reducedPreset.friction ?? resolvedConfig.friction;
                       resolvedConfig.mass = reducedPreset.mass ?? resolvedConfig.mass;
                   } else {
                       // Fallback if no preset: similar to HIGH
                       resolvedConfig.friction *= 1.2;
                   }
                  break;
          }
          // Ensure friction doesn't become excessively high relative to tension/mass
          const criticalDampingFriction = 2 * Math.sqrt(resolvedConfig.tension * resolvedConfig.mass);
          resolvedConfig.friction = Math.min(resolvedConfig.friction, criticalDampingFriction * 1.5); // Cap damping
      }
      // --- End Adjustment --- 

      return resolvedConfig;

  }, [defaultSpring, animationConfig, directOptions, prefersReducedMotion, immediateOption, motionSensitivityLevel]);

  const [currentValue, setCurrentValue] = useState(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const springRef = useRef<springPhysics.SpringPhysics | null>(null);
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
    springRef.current = new springPhysics.SpringPhysics({
      tension: finalSpringConfig.tension,
      friction: finalSpringConfig.friction,
      mass: finalSpringConfig.mass,
      restThreshold: finalSpringConfig.restThreshold,
      initialVelocity: initialVelocity ?? 0,
    });
    springRef.current.reset(startValue, initialVelocity ?? 0);
    springRef.current.setTarget(targetRef.current);
    setCurrentValue(startValue);
  }, [finalSpringConfig]);

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
    // Only proceed if the targetValue prop has actually changed
    if (targetValue !== targetRef.current) {
      targetRef.current = targetValue;
      start({ to: targetValue });
    } 
    // Removed the immediate start logic based on targetValue === currentValue
    // as start() handles the immediate case internally if the immediate flag is set.

    // Cleanup on unmount or before re-running due to target change
    // Stop is already called within start(), so this might be redundant
    // return () => {
    //   stop(); // Use stop function for cleanup
    // };
  // Remove currentValue from dependencies, keep targetValue, immediate, start, stop
  }, [targetValue, immediate, start, stop]);

  // Return the current animated value
  return {
      value: currentValue,
      isAnimating,
      start,
      stop,
      reset
  };
}; 