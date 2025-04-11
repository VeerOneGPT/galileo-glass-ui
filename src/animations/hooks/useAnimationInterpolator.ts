/**
 * useAnimationInterpolator Hook
 * 
 * Provides value interpolation over time using the Galileo Glass animation engine.
 * Useful for animating values that aren't directly tied to CSS properties.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimationCallbacks, AnimationOptions, AnimationState } from '../engine';
import { useAnimation, UseAnimationReturn } from './useAnimation';
import { isFeatureEnabled } from '../../utils/featureFlags';

/**
 * UseAnimationInterpolator hook return type
 * 
 * Extends the base useAnimation return type with additional properties
 * specific to value interpolation.
 */
export interface UseAnimationInterpolatorReturn<T> extends UseAnimationReturn {
  /**
   * Current interpolated value
   */
  value: T;
}

/**
 * Animation value interpolation function
 * 
 * @param from Starting value
 * @param to Ending value
 * @param progress Current progress (0 to 1)
 * @returns Interpolated value
 */
export type InterpolationFunction<T> = (from: T, to: T, progress: number) => T;

/**
 * Default interpolation functions for common types
 */
const defaultInterpolators = {
  /**
   * Interpolate a number
   */
  number: (from: number, to: number, progress: number): number => {
    return from + (to - from) * progress;
  },
  
  /**
   * Interpolate a point (x, y coordinates)
   */
  point: (
    from: { x: number; y: number }, 
    to: { x: number; y: number }, 
    progress: number
  ): { x: number; y: number } => {
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  },
  
  /**
   * Interpolate an array of numbers
   */
  numberArray: (from: number[], to: number[], progress: number): number[] => {
    if (from.length !== to.length) {
      console.warn('Array lengths must match for interpolation');
      return progress < 0.5 ? from : to;
    }
    
    return from.map((value, index) => value + (to[index] - value) * progress);
  },
  
  /**
   * Interpolate an RGB color
   */
  rgbColor: (from: string, to: string, progress: number): string => {
    // Parse RGB values
    const parseRGB = (color: string): [number, number, number] => {
      const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
      const hexRegex = /#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i;
      
      let match = color.match(rgbRegex);
      if (match) {
        return [
          parseInt(match[1], 10),
          parseInt(match[2], 10),
          parseInt(match[3], 10),
        ];
      }
      
      match = color.match(hexRegex);
      if (match) {
        return [
          parseInt(match[1], 16),
          parseInt(match[2], 16),
          parseInt(match[3], 16),
        ];
      }
      
      console.warn(`Could not parse color: ${color}`);
      return [0, 0, 0];
    };
    
    const fromRGB = parseRGB(from);
    const toRGB = parseRGB(to);
    
    const interpolatedRGB = fromRGB.map((value, index) => 
      Math.round(value + (toRGB[index] - value) * progress)
    );
    
    return `rgb(${interpolatedRGB[0]}, ${interpolatedRGB[1]}, ${interpolatedRGB[2]})`;
  },
};

/**
 * Custom hook for interpolating values over time
 * 
 * @param from Starting value
 * @param to Ending value
 * @param options Animation options
 * @param interpolator Custom interpolation function
 * @param callbacks Animation callbacks
 * @returns Animation controls and current interpolated value
 * 
 * @example
 * ```tsx
 * // Interpolate a number
 * const { value, start } = useAnimationInterpolator(0, 100, { duration: 1000 });
 * 
 * // Interpolate a point
 * const { value, start } = useAnimationInterpolator(
 *   { x: 0, y: 0 },
 *   { x: 100, y: 200 },
 *   { duration: 1000 }
 * );
 * 
 * // Interpolate with a custom interpolator
 * const { value, start } = useAnimationInterpolator(
 *   'small',
 *   'large',
 *   { duration: 1000 },
 *   (from, to, progress) => progress < 0.5 ? from : to
 * );
 * ```
 */
export function useAnimationInterpolator<T>(
  from: T,
  to: T,
  options: AnimationOptions,
  interpolator?: InterpolationFunction<T>,
  callbacks?: AnimationCallbacks
): UseAnimationInterpolatorReturn<T> {
  // Keep refs to input values to avoid unnecessary recreation
  const fromRef = useRef(from);
  const toRef = useRef(to);
  
  // State for the current interpolated value
  const [value, setValue] = useState<T>(from);
  
  // Update refs when inputs change
  useEffect(() => {
    fromRef.current = from;
  }, [from]);
  
  useEffect(() => {
    toRef.current = to;
  }, [to]);
  
  // Determine the appropriate interpolator
  const getInterpolator = useMemo(() => {
    if (interpolator) {
      return interpolator;
    }
    
    if (typeof from === 'number' && typeof to === 'number') {
      return defaultInterpolators.number as InterpolationFunction<T>;
    }
    
    if (
      typeof from === 'object' && 
      from !== null && 
      'x' in from && 
      'y' in from &&
      typeof to === 'object' &&
      to !== null &&
      'x' in to &&
      'y' in to
    ) {
      return defaultInterpolators.point as unknown as InterpolationFunction<T>;
    }
    
    if (
      Array.isArray(from) && 
      Array.isArray(to) && 
      from.every(item => typeof item === 'number') &&
      to.every(item => typeof item === 'number')
    ) {
      return defaultInterpolators.numberArray as unknown as InterpolationFunction<T>;
    }
    
    if (
      typeof from === 'string' && 
      typeof to === 'string' &&
      (from.startsWith('rgb') || from.startsWith('#')) &&
      (to.startsWith('rgb') || to.startsWith('#'))
    ) {
      return defaultInterpolators.rgbColor as unknown as InterpolationFunction<T>;
    }
    
    // Fallback to discrete interpolation
    return ((from, to, progress) => progress < 0.5 ? from : to) as InterpolationFunction<T>;
  }, [from, to, interpolator]);
  
  // Create a hidden div to trick the animation system into thinking we're animating a CSS property
  const dummyRef = useRef<string>(`dummy-interpolator-${Math.random().toString(36).substring(2, 9)}`);
  
  // Create custom callbacks that handle value interpolation
  const wrappedCallbacks: AnimationCallbacks = {
    ...(callbacks || {}),
    onUpdate: (progress, time) => {
      // Calculate interpolated value
      const newValue = getInterpolator(fromRef.current, toRef.current, progress);
      
      // Update value state
      setValue(newValue);
      
      // Call original onUpdate if provided
      if (callbacks?.onUpdate) {
        callbacks.onUpdate(progress, time);
      }
    },
    onComplete: () => {
      // Ensure final value is set
      setValue(toRef.current);
      
      // Call original onComplete if provided
      if (callbacks?.onComplete) {
        callbacks.onComplete();
      }
    },
    onCancel: () => {
      // Reset to initial value on cancel based on fillMode
      if (options.fillMode !== 'forwards' && options.fillMode !== 'both') {
        setValue(fromRef.current);
      }
      
      // Call original onCancel if provided
      if (callbacks?.onCancel) {
        callbacks.onCancel();
      }
    },
  };
  
  // Use the base animation hook with a dummy style
  const animationControls = useAnimation(
    options,
    [
      {
        // Use a selector that won't match anything real
        target: `.__${dummyRef.current}__`,
        property: 'opacity',
        from: '0',
        to: '1',
      },
    ],
    wrappedCallbacks
  );
  
  // Combine the animation controls with the interpolated value
  return {
    ...animationControls,
    value,
  };
}

export default useAnimationInterpolator; 