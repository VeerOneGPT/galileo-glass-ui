/**
 * useStaggeredAnimation Hook
 *
 * React hook for using the staggered animation utilities in components.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  StaggeredAnimationConfig,
  StaggerResult,
  DistributionPattern,
  StaggerDirection,
  GroupingStrategy,
  DistributionEasing,
  ElementCategory,
  ElementPosition,
  StaggerTarget,
  staggeredAnimator,
  createStaggeredAnimation
} from '../animations/orchestration/StaggeredAnimations';
import { AnimationPreset } from '../animations/core/types';
import { useReducedMotion } from './useReducedMotion';
import { act } from 'react-dom/test-utils';

/**
 * Hook options for staggered animation
 */
export interface UseStaggeredAnimationOptions {
  /** Unique identifier for this animation */
  id?: string;
  
  /** Whether to automatically create the staggered animation at initialization */
  autoCreate?: boolean;
  
  /** Whether to automatically play the animation after creation */
  autoPlay?: boolean;
  
  /** Whether to respect reduced motion preferences */
  respectReducedMotion?: boolean;
  
  /** Duration multiplier for reduced motion (0-1) */
  reducedMotionFactor?: number;
  
  /** Base configuration object (can be modified via API methods) */
  initialConfig?: Partial<StaggeredAnimationConfig>;
  
  /** Debug mode */
  debug?: boolean;
}

/**
 * Return type for useStaggeredAnimation hook
 */
export interface UseStaggeredAnimationReturn {
  /** Set targets for the animation */
  setTargets: (targets: StaggerTarget[]) => void;
  
  /** Set animation preset */
  setAnimation: (animation: AnimationPreset) => void;
  
  /** Set base animation duration */
  setDuration: (duration: number) => void;
  
  /** Set stagger delay between animations */
  setStaggerDelay: (delay: number) => void;
  
  /** Set start delay before first animation */
  setStartDelay: (delay: number) => void;
  
  /** Set distribution pattern */
  setPattern: (pattern: DistributionPattern) => void;
  
  /** Set animation direction */
  setDirection: (direction: StaggerDirection) => void;
  
  /** Set grouping strategy */
  setGrouping: (grouping: GroupingStrategy) => void;
  
  /** Set categories for grouping */
  setCategories: (categories: ElementCategory[]) => void;
  
  /** Set distribution easing */
  setEasing: (easing: DistributionEasing) => void;
  
  /** Set reference point for distance calculations */
  setReferencePoint: (point: ElementPosition) => void;
  
  /** Set maximum total duration */
  setMaxTotalDuration: (duration: number) => void;
  
  /** Set custom easing function */
  setCustomEasing: (easing: (progress: number) => number) => void;
  
  /** Set custom distribution function */
  setCustomDistribution: (fn: (elements: StaggerTarget[]) => StaggerTarget[]) => void;
  
  /** Set custom delay calculator */
  setCustomDelayCalculator: (
    fn: (element: StaggerTarget, index: number, total: number) => number
  ) => void;
  
  /** Create or update the staggered animation with current settings */
  createAnimation: () => StaggerResult;
  
  /** Play the staggered animation */
  play: () => Promise<void>;
  
  /** Cancel the staggered animation */
  cancel: () => void;
  
  /** Get current animation configuration */
  getConfig: () => StaggeredAnimationConfig;
  
  /** Get current animation result */
  getResult: () => StaggerResult | null;
  
  /** Animation result */
  result: StaggerResult | null;
  
  /** Current configuration */
  config: StaggeredAnimationConfig | null;
  
  /** Whether the animation is currently playing */
  isPlaying: boolean;
  
  /** Current progress of the animation (0-1) */
  progress: number;
  
  /** Register element ref (for easy element collection) */
  registerRef: (id: string, ref: HTMLElement | null) => void;
  
  /** Get registered elements */
  getRegisteredElements: () => Map<string, HTMLElement>;
}

/**
 * Hook for using staggered animations in React components
 * @param options Hook options
 * @returns Hook API
 */
export function useStaggeredAnimation(
  options: UseStaggeredAnimationOptions = {}
): UseStaggeredAnimationReturn {
  // Generate unique ID if not provided
  const idRef = useRef<string>(
    options.id || `stagger-${Math.random().toString(36).substring(2, 9)}`
  );
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Configuration state
  const [config, setConfig] = useState<StaggeredAnimationConfig | null>(null);
  
  // Animation result state
  const [result, setResult] = useState<StaggerResult | null>(null);
  
  // Playing state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Progress state
  const [progress, setProgress] = useState<number>(0);
  
  // Progress tracking with requestAnimationFrame
  const progressFrameRef = useRef<number | null>(null);
  
  // Start time ref for progress tracking
  const startTimeRef = useRef<number>(0);
  
  // Config callback ref to avoid recreating callbacks on config changes
  const configRef = useRef<StaggeredAnimationConfig | null>(null);
  
  // Track registered element references
  const elementRefsMap = useRef<Map<string, HTMLElement>>(new Map());
  
  // Initialize default configuration
  useEffect(() => {
    // Create initial configuration
    const initialConfig: StaggeredAnimationConfig = {
      targets: [],
      animation: {
        keyframes: { 
          name: 'fadeIn',
          id: 'fadeIn',
          rules: '@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }',
          getName: () => 'fadeIn'
        },
        duration: 300,
        easing: 'ease-out',
        fillMode: 'forwards'
      },
      ...options.initialConfig,
      debug: options.debug,
    };
    
    // Apply reduced motion settings if needed
    if (options.respectReducedMotion !== false && prefersReducedMotion) {
      const factor = options.reducedMotionFactor || 0.5;
      
      if (initialConfig.duration) {
        initialConfig.duration *= factor;
      }
      
      if (initialConfig.staggerDelay) {
        initialConfig.staggerDelay *= factor;
      }
    }
    
    setConfig(initialConfig);
    configRef.current = initialConfig;
    
    // Auto-create animation if specified
    if (options.autoCreate && initialConfig.targets.length > 0) {
      // Use the animator instance to create
      const newResult = staggeredAnimator.createAnimation(idRef.current, initialConfig); 
      setResult(newResult);
      
      // Auto-play if specified
      if (options.autoPlay) {
        setIsPlaying(true);
        startTimeRef.current = performance.now();
        
        newResult.play().finally(() => {
          setIsPlaying(false);
          setProgress(1);
        });
      }
    }
    
    // Clean up on unmount
    return () => {
      // Cancel any playing animation
      if (result) {
        result.cancel();
      }
      
      // Clear progress tracking interval
      if (progressFrameRef.current) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = null;
      }
    };
  }, []);
  
  // Set up progress tracking when playing state changes
  useEffect(() => {
    const trackProgress = () => {
      if (!isPlaying || !result || !startTimeRef.current) {
        progressFrameRef.current = null;
        return;
      }

      const elapsed = performance.now() - startTimeRef.current;
      const newProgress = Math.min(1, elapsed / result.totalDuration);

      setProgress(newProgress);

      if (newProgress < 1) {
        // Schedule the next frame
        progressFrameRef.current = requestAnimationFrame(trackProgress);
      } else {
        // Animation finished
        setIsPlaying(false);
        progressFrameRef.current = null;
      }
    };

    if (isPlaying && result) {
      // Start progress tracking
      startTimeRef.current = performance.now(); // Reset start time when play begins
      if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = requestAnimationFrame(trackProgress);
    } else {
      // Stop progress tracking
      if (progressFrameRef.current) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (progressFrameRef.current) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = null;
      }
    };
  }, [isPlaying, result]);
  
  /**
   * Update config state with new values
   */
  const updateConfig = useCallback((updates: Partial<StaggeredAnimationConfig>) => {
    setConfig(prev => {
      if (!prev) return null;
      
      const updated = { ...prev, ...updates };
      configRef.current = updated;
      return updated;
    });
  }, []);
  
  /**
   * Set animation targets
   */
  const setTargets = useCallback((targets: StaggerTarget[]) => {
    updateConfig({ targets });
  }, [updateConfig]);
  
  /**
   * Set animation preset
   */
  const setAnimation = useCallback((animation: AnimationPreset) => {
    updateConfig({ animation });
  }, [updateConfig]);
  
  /**
   * Set base animation duration
   */
  const setDuration = useCallback((duration: number) => {
    updateConfig({ duration });
  }, [updateConfig]);
  
  /**
   * Set stagger delay between animations
   */
  const setStaggerDelay = useCallback((staggerDelay: number) => {
    updateConfig({ staggerDelay });
  }, [updateConfig]);
  
  /**
   * Set start delay before first animation
   */
  const setStartDelay = useCallback((startDelay: number) => {
    updateConfig({ startDelay });
  }, [updateConfig]);
  
  /**
   * Set distribution pattern
   */
  const setPattern = useCallback((pattern: DistributionPattern) => {
    updateConfig({ pattern });
  }, [updateConfig]);
  
  /**
   * Set animation direction
   */
  const setDirection = useCallback((direction: StaggerDirection) => {
    updateConfig({ direction });
  }, [updateConfig]);
  
  /**
   * Set grouping strategy
   */
  const setGrouping = useCallback((grouping: GroupingStrategy) => {
    updateConfig({ grouping });
  }, [updateConfig]);
  
  /**
   * Set categories for grouping
   */
  const setCategories = useCallback((categories: ElementCategory[]) => {
    updateConfig({ categories });
  }, [updateConfig]);
  
  /**
   * Set distribution easing
   */
  const setEasing = useCallback((easing: DistributionEasing) => {
    updateConfig({ easing });
  }, [updateConfig]);
  
  /**
   * Set reference point for distance calculations
   */
  const setReferencePoint = useCallback((referencePoint: ElementPosition) => {
    updateConfig({ referencePoint });
  }, [updateConfig]);
  
  /**
   * Set maximum total duration
   */
  const setMaxTotalDuration = useCallback((maxTotalDuration: number) => {
    updateConfig({ maxTotalDuration });
  }, [updateConfig]);
  
  /**
   * Set custom easing function
   */
  const setCustomEasing = useCallback((customEasing: (progress: number) => number) => {
    updateConfig({ customEasing });
  }, [updateConfig]);
  
  /**
   * Set custom distribution function
   */
  const setCustomDistribution = useCallback((customDistribution: (elements: StaggerTarget[]) => StaggerTarget[]) => {
    updateConfig({ customDistribution });
  }, [updateConfig]);
  
  /**
   * Set custom delay calculator
   */
  const setCustomDelayCalculator = useCallback((
    customDelayCalculator: (element: StaggerTarget, index: number, total: number) => number
  ) => {
    updateConfig({ customDelayCalculator });
  }, [updateConfig]);
  
  /**
   * Create or update the staggered animation with current settings
   */
  const createAnimation = useCallback(() => {
    if (!configRef.current) {
      throw new Error('No configuration available');
    }
    
    // Convert registered elements to targets if needed
    if (configRef.current.targets.length === 0 && elementRefsMap.current.size > 0) {
      const targets: StaggerTarget[] = Array.from(elementRefsMap.current.entries())
        .map(([id, element]) => ({
          element,
          category: id
        }));
      
      configRef.current.targets = targets;
    }
    
    // Create animation
    const newResult = staggeredAnimator.createAnimation(idRef.current, configRef.current);
    setResult(newResult);
    
    return newResult;
  }, []);
  
  /**
   * Play the staggered animation
   */
  const play = useCallback(async () => {
    let currentResult = result;
    
    // Create animation if not created yet
    if (!currentResult && configRef.current) {
      currentResult = createAnimation();
    }
    
    if (currentResult) {
      try {
        await currentResult.play();
      } finally {
        // Removed act() wrapper
        setIsPlaying(false);
        setProgress(1);
      }
    }
  }, [result, createAnimation]);
  
  /**
   * Cancel the staggered animation
   */
  const cancel = useCallback(() => {
    if (result) {
      result.cancel();
      // Removed act() wrapper
      setIsPlaying(false);
      setProgress(0);
      // Cancel any pending animation frame
      if (progressFrameRef.current) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = null;
      }
    }
  }, [result]);
  
  /**
   * Get current animation configuration
   */
  const getConfig = useCallback((): StaggeredAnimationConfig => {
    if (!configRef.current) {
      throw new Error('No configuration available');
    }
    
    return configRef.current;
  }, []);
  
  /**
   * Get current animation result
   */
  const getResult = useCallback((): StaggerResult | null => {
    return result;
  }, [result]);
  
  /**
   * Register element ref (for easy element collection)
   */
  const registerRef = useCallback((id: string, ref: HTMLElement | null) => {
    if (ref) {
      elementRefsMap.current.set(id, ref);
    } else {
      elementRefsMap.current.delete(id);
    }
  }, []);
  
  /**
   * Get registered elements
   */
  const getRegisteredElements = useCallback(() => {
    return new Map(elementRefsMap.current);
  }, []);
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressFrameRef.current) {
        cancelAnimationFrame(progressFrameRef.current);
      }
    };
  }, []);
  
  return {
    setTargets,
    setAnimation,
    setDuration,
    setStaggerDelay,
    setStartDelay,
    setPattern,
    setDirection,
    setGrouping,
    setCategories,
    setEasing,
    setReferencePoint,
    setMaxTotalDuration,
    setCustomEasing,
    setCustomDistribution,
    setCustomDelayCalculator,
    createAnimation,
    play,
    cancel,
    getConfig,
    getResult,
    result,
    config,
    isPlaying,
    progress,
    registerRef,
    getRegisteredElements
  };
}

export default useStaggeredAnimation;