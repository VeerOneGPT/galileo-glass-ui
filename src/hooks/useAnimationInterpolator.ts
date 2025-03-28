/**
 * useAnimationInterpolator Hook
 *
 * React hook for using the animation interpolator system to create smooth transitions
 * between states in components.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { 
  AnimationInterpolator, 
  InterpolationConfig,
  BlendMode,
  InterpolationType 
} from '../animations/orchestration/AnimationInterpolator';
import { AnimationState } from '../animations/orchestration/AnimationStateMachine';

/**
 * State transition options
 */
export interface StateTransitionOptions {
  /** Duration of the transition in milliseconds */
  duration?: number;
  
  /** Delay before transition starts in milliseconds */
  delay?: number;
  
  /** Easing function or preset name */
  easing?: string;
  
  /** Bezier curve parameters for custom easing */
  bezier?: [number, number, number, number];
  
  /** Whether the transition can be interrupted */
  interruptible?: boolean;
  
  /** Callback when transition starts */
  onStart?: () => void;
  
  /** Callback when transition completes */
  onComplete?: () => void;
  
  /** Callback for each animation frame with progress */
  onUpdate?: (progress: number) => void;
}

/**
 * Animation interpolator hook options
 */
export interface UseAnimationInterpolatorOptions {
  /** Target element to animate (defaults to referenced element) */
  target?: HTMLElement | null;
  
  /** Default transition options for all state changes */
  defaultTransition?: StateTransitionOptions;
  
  /** Whether to immediately start at initial state */
  immediate?: boolean;
  
  /** Transition type: replace or blend with current state */
  transitionType?: 'replace' | 'blend';
  
  /** Blend mode when transitionType is 'blend' */
  blendMode?: BlendMode;
  
  /** Auto cleanup on unmount */
  autoCleanup?: boolean;
}

/**
 * Hook return type
 */
export interface UseAnimationInterpolatorReturn {
  /** Transition to a new state */
  transitionTo: (
    state: AnimationState,
    options?: StateTransitionOptions
  ) => void;
  
  /** Get current interpolated state */
  getCurrentState: () => AnimationState | null;
  
  /** Pause current transition */
  pause: () => void;
  
  /** Resume paused transition */
  resume: () => void;
  
  /** Cancel current transition */
  cancel: () => void;
  
  /** Check if currently transitioning */
  isTransitioning: boolean;
  
  /** Track transition progress (0-1) */
  progress: number;
  
  /** Reference to be attached to the target element */
  ref: React.RefObject<HTMLElement>;
}

/**
 * Hook for using animation interpolation between states in React components
 * @param initialState Initial animation state
 * @param options Hook options
 * @returns Hook controls and state
 */
export function useAnimationInterpolator(
  initialState?: AnimationState,
  options: UseAnimationInterpolatorOptions = {}
): UseAnimationInterpolatorReturn {
  // Create ref for target element
  const ref = useRef<HTMLElement>(null);
  
  // State for tracking current transition
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Refs for current state and animation
  const currentStateRef = useRef<AnimationState | null>(initialState || null);
  const targetStateRef = useRef<AnimationState | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number | null>(null);
  const durationRef = useRef<number>(options.defaultTransition?.duration || 300);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const interpolatorRef = useRef<((progress: number) => Record<string, any>) | null>(null);
  const optionsRef = useRef<UseAnimationInterpolatorOptions>(options);
  
  // Update options ref if options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  /**
   * Apply the initial state immediately if provided and immediate flag is true
   */
  useEffect(() => {
    if (initialState && (options.immediate !== false)) {
      const target = options.target || ref.current;
      if (target) {
        currentStateRef.current = initialState;
        
        // Apply initial state properties and styles
        const { properties, styles } = initialState;
        
        // Apply properties
        if (properties) {
          Object.entries(properties).forEach(([key, value]) => {
            // @ts-ignore - dynamically setting properties
            target[key] = value;
          });
        }
        
        // Apply styles
        if (styles) {
          Object.entries(styles).forEach(([key, value]) => {
            target.style.setProperty(key, value);
          });
        }
      }
    }
    
    // Clean up animation frame on unmount
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (delayTimeoutRef.current !== null) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, [initialState, options.immediate, options.target]);
  
  /**
   * Create an interpolation configuration from states and options
   */
  const createInterpolationConfig = useCallback((
    fromState: AnimationState,
    toState: AnimationState,
    transitionOptions?: StateTransitionOptions
  ): InterpolationConfig => {
    // Merge default and provided transition options
    const mergedOptions = {
      ...optionsRef.current.defaultTransition,
      ...transitionOptions
    };
    
    // Extract relevant properties from states
    const fromProps = fromState.properties || {};
    const toProps = toState.properties || {};
    
    // Extract styles from states
    const fromStyles = fromState.styles || {};
    const toStyles = toState.styles || {};
    
    // Create merged property list
    const allProps = new Set([
      ...Object.keys(fromProps),
      ...Object.keys(toProps),
      ...Object.keys(fromStyles),
      ...Object.keys(toStyles)
    ]);
    
    // Build interpolation properties
    const properties: InterpolationConfig['properties'] = {};
    
    allProps.forEach(prop => {
      // Handle style properties
      if (prop in fromStyles || prop in toStyles) {
        const fromValue = fromStyles[prop] || '';
        const toValue = toStyles[prop] || '';
        
        // Determine interpolation type based on property name and value
        let type = InterpolationType.CSS_VALUE;
        
        if (prop.includes('color') || 
            (typeof fromValue === 'string' && (fromValue.startsWith('#') || fromValue.startsWith('rgb'))) ||
            (typeof toValue === 'string' && (toValue.startsWith('#') || toValue.startsWith('rgb')))) {
          type = InterpolationType.COLOR;
        } else if (prop.includes('transform')) {
          type = InterpolationType.TRANSFORM;
        }
        
        properties[prop] = { type };
      } 
      // Handle data properties
      else if (prop in fromProps || prop in toProps) {
        const fromValue = fromProps[prop];
        const toValue = toProps[prop];
        
        // Determine interpolation type based on value type
        let type = InterpolationType.NUMBER;
        
        if (typeof fromValue === 'string' || typeof toValue === 'string') {
          const strValue = (typeof fromValue === 'string' ? fromValue : toValue) as string;
          
          if (strValue.startsWith('#') || strValue.startsWith('rgb')) {
            type = InterpolationType.COLOR;
          } else if (strValue.includes('transform')) {
            type = InterpolationType.TRANSFORM;
          } else if (strValue.includes('path')) {
            type = InterpolationType.PATH;
          } else {
            type = InterpolationType.STRING;
          }
        } else if (Array.isArray(fromValue) || Array.isArray(toValue)) {
          type = InterpolationType.ARRAY;
        } else if (
          (typeof fromValue === 'object' && fromValue !== null) ||
          (typeof toValue === 'object' && toValue !== null)
        ) {
          type = InterpolationType.OBJECT;
        }
        
        properties[prop] = { type };
      }
    });
    
    // Create easing options based on transition parameters
    const easingOptions: any = {};
    
    if (mergedOptions.bezier) {
      easingOptions.bezier = mergedOptions.bezier;
    } else if (mergedOptions.easing) {
      // Parse easing string to configuration
      switch (mergedOptions.easing) {
        case 'ease-in':
          easingOptions.bezier = [0.42, 0, 1, 1];
          break;
        case 'ease-out':
          easingOptions.bezier = [0, 0, 0.58, 1];
          break;
        case 'ease-in-out':
          easingOptions.bezier = [0.42, 0, 0.58, 1];
          break;
        case 'linear':
          easingOptions.bezier = [0, 0, 1, 1];
          break;
        case 'bounce':
          easingOptions.elastic = { amplitude: 1.2, period: 0.5 };
          break;
        case 'elastic':
          easingOptions.elastic = { amplitude: 1, period: 0.3 };
          break;
        case 'step':
          easingOptions.steps = { count: 5, position: 'end' };
          break;
        default:
          // Default to ease
          easingOptions.bezier = [0.25, 0.1, 0.25, 1];
      }
    }
    
    return {
      properties,
      easing: easingOptions,
      duration: mergedOptions.duration || 300,
      delay: mergedOptions.delay || 0,
      blendMode: optionsRef.current.blendMode || BlendMode.OVERRIDE
    };
  }, []);
  
  /**
   * Animate between states using requestAnimationFrame
   */
  const animateTransition = useCallback((
    fromState: AnimationState,
    toState: AnimationState,
    transitionOptions?: StateTransitionOptions,
    startTime?: number
  ) => {
    // Get target element
    const target = optionsRef.current.target || ref.current;
    if (!target) return;
    
    // Set as transitioning
    setIsTransitioning(true);
    
    // Create interpolation config
    const config = createInterpolationConfig(fromState, toState, transitionOptions);
    
    // Store duration for pause/resume
    durationRef.current = config.duration || 300;
    
    // Create interpolator function
    const interpolator = AnimationInterpolator.createStateInterpolator(
      fromState,
      toState,
      config
    );
    interpolatorRef.current = interpolator;
    
    // Call onStart callback if provided
    const mergedOptions = {
      ...optionsRef.current.defaultTransition,
      ...transitionOptions
    };
    if (mergedOptions.onStart) {
      mergedOptions.onStart();
    }
    
    // Apply delay if specified
    if (config.delay && config.delay > 0 && !startTime) {
      delayTimeoutRef.current = setTimeout(() => {
        delayTimeoutRef.current = null;
        animateTransition(fromState, toState, transitionOptions, performance.now());
      }, config.delay);
      return;
    }
    
    // Set start time
    if (startTime) {
      startTimeRef.current = startTime;
    } else {
      startTimeRef.current = performance.now();
    }
    
    // Animation frame function
    const animate = (timestamp: number) => {
      // Calculate elapsed time
      const elapsed = timestamp - startTimeRef.current;
      const duration = config.duration || 300;
      
      // Calculate progress (0-1)
      const progress = Math.min(1, elapsed / duration);
      
      // Update progress state
      setProgress(progress);
      
      // Calculate interpolated state
      const interpolated = interpolator(progress);
      
      // Apply to target element
      AnimationInterpolator.applyInterpolatedState(target, interpolated);
      
      // Call onUpdate callback if provided
      if (mergedOptions.onUpdate) {
        mergedOptions.onUpdate(progress);
      }
      
      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        animationRef.current = null;
        setIsTransitioning(false);
        setProgress(0);
        
        // Update current state
        currentStateRef.current = toState;
        targetStateRef.current = null;
        interpolatorRef.current = null;
        
        // Call onComplete callback if provided
        if (mergedOptions.onComplete) {
          mergedOptions.onComplete();
        }
      }
    };
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);
  }, [createInterpolationConfig]);
  
  /**
   * Transition to a new state
   */
  const transitionTo = useCallback((
    state: AnimationState,
    transitionOptions?: StateTransitionOptions
  ) => {
    const currentState = currentStateRef.current;
    
    // Store target state
    targetStateRef.current = state;
    
    // If no current state, set immediate and return
    if (!currentState) {
      currentStateRef.current = state;
      
      // Apply state to target element
      const target = optionsRef.current.target || ref.current;
      if (target) {
        const { properties, styles } = state;
        
        // Apply properties
        if (properties) {
          Object.entries(properties).forEach(([key, value]) => {
            // @ts-ignore - dynamically setting properties
            target[key] = value;
          });
        }
        
        // Apply styles
        if (styles) {
          Object.entries(styles).forEach(([key, value]) => {
            target.style.setProperty(key, value);
          });
        }
      }
      
      return;
    }
    
    // Cancel any in-progress animations
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Cancel any pending delay
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    
    // Start new transition
    animateTransition(currentState, state, transitionOptions);
  }, [animateTransition]);
  
  /**
   * Get current interpolated state
   */
  const getCurrentState = useCallback((): AnimationState | null => {
    return currentStateRef.current;
  }, []);
  
  /**
   * Pause current transition
   */
  const pause = useCallback(() => {
    if (animationRef.current !== null && isTransitioning) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      pauseTimeRef.current = performance.now();
    }
  }, [isTransitioning]);
  
  /**
   * Resume paused transition
   */
  const resume = useCallback(() => {
    // Make sure we're actually paused
    if (pauseTimeRef.current !== null && 
        targetStateRef.current !== null && 
        currentStateRef.current !== null &&
        interpolatorRef.current !== null) {
      
      // Calculate new start time to maintain correct progress
      const pauseDuration = performance.now() - pauseTimeRef.current;
      const newStartTime = startTimeRef.current + pauseDuration;
      
      // Reset pause time
      pauseTimeRef.current = null;
      
      // Get target element
      const target = optionsRef.current.target || ref.current;
      if (!target) return;
      
      // Animation frame function with adjusted timing
      const animate = (timestamp: number) => {
        // Calculate elapsed time with adjusted start
        const elapsed = timestamp - newStartTime;
        
        // Calculate progress (0-1)
        const progress = Math.min(1, elapsed / durationRef.current);
        
        // Update progress state
        setProgress(progress);
        
        // Calculate interpolated state using stored interpolator
        const interpolated = interpolatorRef.current!(progress);
        
        // Apply to target element
        AnimationInterpolator.applyInterpolatedState(target, interpolated);
        
        // Continue animation if not complete
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          animationRef.current = null;
          setIsTransitioning(false);
          setProgress(0);
          
          // Update current state
          currentStateRef.current = targetStateRef.current;
          targetStateRef.current = null;
          interpolatorRef.current = null;
        }
      };
      
      // Set as transitioning
      setIsTransitioning(true);
      
      // Start animation loop
      animationRef.current = requestAnimationFrame(animate);
    }
  }, []);
  
  /**
   * Cancel current transition
   */
  const cancel = useCallback(() => {
    // Cancel animation frame
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Cancel any pending delay
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    
    // Reset state
    setIsTransitioning(false);
    setProgress(0);
    pauseTimeRef.current = null;
    targetStateRef.current = null;
    interpolatorRef.current = null;
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Ensure all animations are canceled
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (delayTimeoutRef.current !== null) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    transitionTo,
    getCurrentState,
    pause,
    resume,
    cancel,
    isTransitioning,
    progress,
    ref
  };
}

export default useAnimationInterpolator;