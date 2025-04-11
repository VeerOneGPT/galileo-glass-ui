/**
 * useStaggeredAnimation Hook
 * 
 * Provides staggered animations across multiple elements with configurable delays.
 * This hook makes it easy to create sequential entrance or transition effects.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimationCallbacks, AnimationOptions, AnimationState } from '../engine';
import { useAnimation, AnimationStyle } from './useAnimation';
import { isFeatureEnabled } from '../../utils/featureFlags';

/**
 * Staggered animation options
 */
export interface StaggeredAnimationOptions extends AnimationOptions {
  /**
   * Delay between each item's animation start (milliseconds)
   */
  staggerDelay: number;
  
  /**
   * Maximum delay for staggering (if set, delays won't exceed this value)
   */
  maxStaggerDelay?: number;
  
  /**
   * Easing function for the staggering itself (not the animation)
   * This affects how delays are distributed across items
   */
  staggerEasing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  
  /**
   * Whether to stagger items in reverse order
   */
  reverse?: boolean;
}

/**
 * useStaggeredAnimation hook return type
 */
export interface UseStaggeredAnimationReturn {
  /**
   * Start the staggered animation
   */
  start: () => void;
  
  /**
   * Pause all animations
   */
  pause: () => void;
  
  /**
   * Resume all animations
   */
  resume: () => void;
  
  /**
   * Cancel all animations
   */
  cancel: () => void;
  
  /**
   * Current animation state (based on the last item)
   */
  state: AnimationState;
  
  /**
   * Progress values for each item (0 to 1)
   */
  itemProgress: number[];
  
  /**
   * Overall progress of the entire staggered animation (0 to 1)
   */
  totalProgress: number;
  
  /**
   * Whether all animations are currently running
   */
  isRunning: boolean;
  
  /**
   * Whether all animations are completed
   */
  isCompleted: boolean;
}

/**
 * Generate staggered delay value for each item
 */
function generateStaggerDelays(
  count: number,
  options: StaggeredAnimationOptions
): number[] {
  const { staggerDelay, maxStaggerDelay, staggerEasing, reverse } = options;
  
  // Calculate raw linear delays
  const rawDelays = Array.from({ length: count }, (_, i) => i * staggerDelay);
  
  // Apply easing to delays if specified
  let delays = rawDelays;
  if (staggerEasing && staggerEasing !== 'linear') {
    const applyEasing = (progress: number): number => {
      switch (staggerEasing) {
        case 'ease-in':
          return progress * progress;
        case 'ease-out':
          return progress * (2 - progress);
        case 'ease-in-out':
          return progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        default:
          return progress;
      }
    };
    
    const maxDelay = rawDelays[count - 1] || 0;
    delays = rawDelays.map(delay => {
      const normalizedProgress = maxDelay > 0 ? delay / maxDelay : 0;
      const easedProgress = applyEasing(normalizedProgress);
      return easedProgress * maxDelay;
    });
  }
  
  // Cap at maxStaggerDelay if specified
  if (maxStaggerDelay !== undefined) {
    const scale = maxStaggerDelay / (delays[count - 1] || 1);
    if (scale < 1) {
      delays = delays.map(delay => delay * scale);
    }
  }
  
  // Reverse order if specified
  if (reverse) {
    delays.reverse();
  }
  
  return delays;
}

/**
 * Custom hook for creating staggered animations across multiple elements
 * 
 * @param styles Animation styles to apply to each item
 * @param count Number of items to animate
 * @param options Animation options including stagger settings
 * @param callbacks Callbacks for animation events
 * @returns Staggered animation controls and state
 * 
 * @example
 * ```tsx
 * // Animate 5 items with a 100ms delay between each
 * const { start, isRunning } = useStaggeredAnimation(
 *   [{ property: 'opacity', from: '0', to: '1' }], // Common styles for all items
 *   5, // Number of items
 *   { duration: 500, staggerDelay: 100 }, // Options with stagger delay
 *   { onComplete: () => console.log('All animations completed!') } // Callbacks
 * );
 * ```
 */
export function useStaggeredAnimation(
  styles: Omit<AnimationStyle, 'target'>[],
  count: number,
  options: StaggeredAnimationOptions,
  callbacks?: AnimationCallbacks
): UseStaggeredAnimationReturn {
  // State for tracking progress
  const [itemProgress, setItemProgress] = useState<number[]>(Array(count).fill(0));
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [state, setState] = useState<AnimationState>(AnimationState.IDLE);
  
  // Refs to track current animations and avoid unnecessary recreations
  const animationsRef = useRef<Array<ReturnType<typeof useAnimation>>>([]);
  const mountedRef = useRef<boolean>(true);
  const startedRef = useRef<boolean>(false);
  
  // Calculate staggered delays
  const delays = useRef<number[]>(generateStaggerDelays(count, options));
  
  // Compute overall progress based on item progress
  const computeTotalProgress = useCallback((progressArray: number[]): number => {
    if (progressArray.length === 0) return 0;
    return progressArray.reduce((sum, p) => sum + p, 0) / progressArray.length;
  }, []);
  
  // Update item progress
  const updateItemProgress = useCallback((index: number, progress: number) => {
    if (!mountedRef.current) return;
    
    setItemProgress(prev => {
      const newProgress = [...prev];
      newProgress[index] = progress;
      
      // Update total progress
      const newTotalProgress = computeTotalProgress(newProgress);
      setTotalProgress(newTotalProgress);
      
      // Check if all items are completed
      const allCompleted = newProgress.every(p => p >= 0.999);
      if (allCompleted && !isCompleted) {
        setIsCompleted(true);
        setState(AnimationState.COMPLETED);
        setIsRunning(false);
        
        // Call onComplete callback
        if (callbacks?.onComplete) {
          callbacks.onComplete();
        }
      }
      
      return newProgress;
    });
  }, [computeTotalProgress, isCompleted, callbacks]);
  
  // Start all animations with appropriate delays
  const start = useCallback(() => {
    if (startedRef.current) return;
    
    startedRef.current = true;
    setIsRunning(true);
    setIsCompleted(false);
    setState(AnimationState.RUNNING);
    
    // Call onStart callback
    if (callbacks?.onStart) {
      callbacks.onStart();
    }
    
    // Start each animation with its delay
    delays.current.forEach((delay, index) => {
      setTimeout(() => {
        if (mountedRef.current && animationsRef.current[index]) {
          animationsRef.current[index].start();
        }
      }, delay);
    });
  }, [callbacks]);
  
  // Pause all animations
  const pause = useCallback(() => {
    if (!isRunning) return;
    
    setIsRunning(false);
    setState(AnimationState.PAUSED);
    
    // Pause each animation
    animationsRef.current.forEach(animation => {
      animation.pause();
    });
    
    // Call onPause callback
    if (callbacks?.onPause) {
      callbacks.onPause();
    }
  }, [isRunning, callbacks]);
  
  // Resume all animations
  const resume = useCallback(() => {
    if (isRunning || isCompleted) return;
    
    setIsRunning(true);
    setState(AnimationState.RUNNING);
    
    // Resume each animation
    animationsRef.current.forEach(animation => {
      animation.resume();
    });
    
    // Call onResume callback
    if (callbacks?.onResume) {
      callbacks.onResume();
    }
  }, [isRunning, isCompleted, callbacks]);
  
  // Cancel all animations
  const cancel = useCallback(() => {
    startedRef.current = false;
    setIsRunning(false);
    setIsCompleted(false);
    setState(AnimationState.IDLE);
    setItemProgress(Array(count).fill(0));
    setTotalProgress(0);
    
    // Cancel each animation
    animationsRef.current.forEach(animation => {
      animation.cancel();
    });
    
    // Call onCancel callback
    if (callbacks?.onCancel) {
      callbacks.onCancel();
    }
  }, [count, callbacks]);
  
  // Create and store useAnimation hooks for each item
  useEffect(() => {
    // Recalculate delays when count or options change
    delays.current = generateStaggerDelays(count, options);
    
    // Reset progress state
    setItemProgress(Array(count).fill(0));
    setTotalProgress(0);
    
    // Reset animation state
    startedRef.current = false;
    setIsRunning(false);
    setIsCompleted(false);
    setState(AnimationState.IDLE);
    
    // Create animation controllers
    const animations: ReturnType<typeof useAnimation>[] = [];
    
    for (let i = 0; i < count; i++) {
      // Create target selectors for each item
      const itemStyles = styles.map(style => ({
        ...style,
        target: `.staggered-item-${i}`,
      }));
      
      // Create item-specific callbacks
      const itemCallbacks: AnimationCallbacks = {
        onUpdate: (progress) => {
          updateItemProgress(i, progress);
          
          // Call original onUpdate if provided
          if (callbacks?.onUpdate) {
            callbacks.onUpdate(progress, 0); // Time is not used here
          }
        },
      };
      
      // Create animation controller for this item
      const animation = useAnimation(
        { ...options, delay: 0 }, // Delay is managed by the staggered animation
        itemStyles,
        itemCallbacks
      );
      
      animations.push(animation);
    }
    
    // Store animations
    animationsRef.current = animations;
    
    return () => {
      // Cleanup on unmount
      mountedRef.current = false;
    };
  }, [count, styles, options, updateItemProgress, callbacks]);
  
  return {
    start,
    pause,
    resume,
    cancel,
    state,
    itemProgress,
    totalProgress,
    isRunning,
    isCompleted,
  };
}

export default useStaggeredAnimation; 