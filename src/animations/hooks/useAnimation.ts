/**
 * useAnimation Hook
 * 
 * Provides a React interface to the Galileo Glass animation engine.
 * This core hook is the foundation for more specialized animation hooks.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  AnimationController, 
  AnimationOptions, 
  AnimationCallbacks,
  AnimationState,
  createAnimationController,
} from '../engine';
import { isFeatureEnabled } from '../../utils/featureFlags';

/**
 * Animation styles to be applied
 */
export interface AnimationStyle {
  /**
   * Target element or selector
   */
  target: HTMLElement | string;
  
  /**
   * CSS property
   */
  property: string;
  
  /**
   * Starting value
   */
  from: string;
  
  /**
   * Ending value
   */
  to: string;
  
  /**
   * CSS priority (e.g., 'important')
   */
  priority?: string;
}

/**
 * useAnimation hook return type
 */
export interface UseAnimationReturn {
  /**
   * Current animation state
   */
  state: AnimationState;
  
  /**
   * Current animation progress (0 to 1)
   */
  progress: number;
  
  /**
   * Start the animation
   */
  start: () => void;
  
  /**
   * Pause the animation
   */
  pause: () => void;
  
  /**
   * Resume the animation
   */
  resume: () => void;
  
  /**
   * Cancel the animation
   */
  cancel: () => void;
  
  /**
   * Whether the animation is currently running
   */
  isRunning: boolean;
  
  /**
   * Whether the animation is currently paused
   */
  isPaused: boolean;
  
  /**
   * Whether the animation has completed
   */
  isCompleted: boolean;
  
  /**
   * Set animation options (will restart the animation if it's running)
   */
  setOptions: (newOptions: Partial<AnimationOptions>) => void;
}

/**
 * Custom hook for animating styles using the Galileo Glass animation engine
 * 
 * @param options Animation options
 * @param styles Styles to animate
 * @param callbacks Callbacks for animation events
 * @returns Animation controls and state
 * 
 * @example
 * ```tsx
 * const { start, pause, resume, cancel, progress } = useAnimation(
 *   { duration: 1000, easing: 'ease-in-out' },
 *   [
 *     { target: '.my-element', property: 'opacity', from: '0', to: '1' },
 *     { target: '.my-element', property: 'transform', from: 'translateY(20px)', to: 'translateY(0)' },
 *   ],
 *   {
 *     onComplete: () => console.log('Animation completed!'),
 *   }
 * );
 * ```
 */
export function useAnimation(
  options: AnimationOptions,
  styles: AnimationStyle[] = [],
  callbacks: AnimationCallbacks = {}
): UseAnimationReturn {
  // Animation controller ref
  const controllerRef = useRef<AnimationController | null>(null);
  
  // State for component re-rendering on animation updates
  const [state, setState] = useState<AnimationState>(AnimationState.IDLE);
  const [progress, setProgress] = useState(0);
  
  // Options ref to avoid unnecessary recreation of controller
  const optionsRef = useRef(options);
  const stylesRef = useRef(styles);
  const callbacksRef = useRef(callbacks);
  
  // Update refs when props change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  useEffect(() => {
    stylesRef.current = styles;
  }, [styles]);
  
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);
  
  // Initialize controller
  const initController = useCallback(() => {
    // Clean up existing controller
    if (controllerRef.current) {
      controllerRef.current.dispose();
    }
    
    // Create new controller
    const controller = createAnimationController(optionsRef.current);
    
    // Register styles
    stylesRef.current.forEach(style => {
      controller.registerStyleUpdate(
        style.target,
        style.property,
        style.from,
        style.to,
        style.priority
      );
    });
    
    // Create wrapped callbacks that update state
    const wrappedCallbacks: AnimationCallbacks = {
      onStart: () => {
        setState(AnimationState.RUNNING);
        if (callbacksRef.current.onStart) {
          callbacksRef.current.onStart();
        }
      },
      onUpdate: (currentProgress, time) => {
        setProgress(currentProgress);
        if (callbacksRef.current.onUpdate) {
          callbacksRef.current.onUpdate(currentProgress, time);
        }
      },
      onPause: () => {
        setState(AnimationState.PAUSED);
        if (callbacksRef.current.onPause) {
          callbacksRef.current.onPause();
        }
      },
      onResume: () => {
        setState(AnimationState.RUNNING);
        if (callbacksRef.current.onResume) {
          callbacksRef.current.onResume();
        }
      },
      onComplete: () => {
        setState(AnimationState.COMPLETED);
        setProgress(1);
        if (callbacksRef.current.onComplete) {
          callbacksRef.current.onComplete();
        }
      },
      onCancel: () => {
        setState(AnimationState.CANCELLED);
        if (callbacksRef.current.onCancel) {
          callbacksRef.current.onCancel();
        }
      },
      onError: (error) => {
        setState(AnimationState.ERROR);
        if (callbacksRef.current.onError) {
          callbacksRef.current.onError(error);
        }
      },
    };
    
    // Register callbacks
    controller.setCallbacks(wrappedCallbacks);
    
    // Store controller
    controllerRef.current = controller;
    
    return controller;
  }, []);
  
  // Initialize controller on first render
  useEffect(() => {
    if (!controllerRef.current) {
      initController();
    }
    
    return () => {
      // Clean up controller on unmount
      if (controllerRef.current) {
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
    };
  }, [initController]);
  
  // Animation control functions
  const start = useCallback(() => {
    if (!controllerRef.current) {
      const controller = initController();
      controller.start();
    } else {
      controllerRef.current.start();
    }
  }, [initController]);
  
  const pause = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.pause();
    }
  }, []);
  
  const resume = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.resume();
    }
  }, []);
  
  const cancel = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.cancel();
    }
  }, []);
  
  // Function to update options
  const setOptions = useCallback((newOptions: Partial<AnimationOptions>) => {
    const wasRunning = state === AnimationState.RUNNING;
    
    // Cancel current animation
    if (controllerRef.current) {
      controllerRef.current.cancel();
      controllerRef.current.dispose();
      controllerRef.current = null;
    }
    
    // Update options
    optionsRef.current = { ...optionsRef.current, ...newOptions };
    
    // Reinitialize controller
    const controller = initController();
    
    // Restart animation if it was running
    if (wasRunning) {
      controller.start();
    }
  }, [state, initController]);
  
  return {
    state,
    progress,
    start,
    pause,
    resume,
    cancel,
    isRunning: state === AnimationState.RUNNING,
    isPaused: state === AnimationState.PAUSED,
    isCompleted: state === AnimationState.COMPLETED,
    setOptions,
  };
}

export default useAnimation; 