import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  useMultiSpring, 
  MultiSpringOptions, // We might not need all of these
  MultiSpringResult, 
  // SpringVector // Removed as it's not exported and not strictly needed here
} from '../animations/physics/useMultiSpring';
import { SpringConfig, SpringPresets } from '../animations/physics/springPhysics';
import { useReducedMotion } from './useReducedMotion';

// Type for the target values object
export type TargetValues = { [key: string]: number };

// Type for the result of the onRest callback
// Could reuse SpringAnimationResult if we make it generic later
export interface SpringsAnimationResult {
  finished: boolean;
  values: TargetValues; 
}

// Options for the useGalileoSprings hook
export interface GalileoSpringsOptions {
  /** 
   * Spring physics configuration or preset name. 
   * Applied to all springs managed by this hook instance.
   */
  config?: Partial<SpringConfig> | keyof typeof SpringPresets;
  /** 
   * Callback fired when all springs come to rest.
   */
  onRest?: (result: SpringsAnimationResult) => void;
  /** 
   * If true, skip the animation and jump to the end state immediately.
   */
  immediate?: boolean;
  // Add other options from useMultiSpring if needed? (e.g., velocity)
}

/**
 * Hook to animate multiple numerical values simultaneously using Galileo's spring physics.
 * 
 * @param targets An object where keys are arbitrary names and values are the target numbers.
 * @param options Configuration options including physics settings and callbacks.
 * @returns An object with the same keys as `targets` but containing the current animated values.
 */
export const useGalileoSprings = (
  targets: TargetValues,
  options: GalileoSpringsOptions = {}
): TargetValues => {
  const { config, onRest, immediate: immediateOption } = options;
  const prefersReducedMotion = useReducedMotion();
  
  // Determine if animation should be immediate
  const immediate = immediateOption ?? prefersReducedMotion;

  // Ref to store the latest onRest callback
  const onRestRef = useRef(onRest);
  useEffect(() => {
    onRestRef.current = onRest;
  }, [onRest]);

  // Ref to store the previous animating state for onRest detection
  const wasAnimatingRef = useRef(false);
  
  // Use the underlying multi-spring hook
  // We need to initialize 'from' correctly. Let's use the initial targets.
  const { values, isAnimating, start, reset } = useMultiSpring<TargetValues>({
    from: targets, // Initialize from the first set of targets provided
    animationConfig: config, // Pass config down
    // Auto-start needs careful handling; let's manage it via useEffect
    autoStart: false, 
    immediate: immediate, // Pass immediate flag down
  });

  // Effect to handle changes in targets
  useEffect(() => {
      if (immediate) {
          // If immediate, reset the spring system directly to the target values
          reset(targets);
      } else {
          // Otherwise, start the animation towards the new targets
          start({ to: targets });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, immediate, start, reset]); // Rerun when targets or immediate flag change

  // Effect to detect when animation stops and trigger onRest
  useEffect(() => {
      const isCurrentlyAnimating = isAnimating;
      // Check if it *was* animating but now *is not*
      if (wasAnimatingRef.current && !isCurrentlyAnimating) {
          if (onRestRef.current) {
              // Call the callback with the final settled values
              onRestRef.current({ finished: true, values });
          }
      }
      // Update the ref for the next render
      wasAnimatingRef.current = isCurrentlyAnimating;
  }, [isAnimating, values]); // Depend on isAnimating and values

  // Return the current animated values
  return values;
}; 