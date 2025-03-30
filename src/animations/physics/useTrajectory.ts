/**
 * useTrajectory.ts
 * 
 * React hook for calculating and using trajectories in UI components.
 * This hook provides an easy way to implement trajectory animations
 * and visualizations in React components.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory } from '../accessibility/MotionSensitivity';
import {
  TrajectoryType,
  calculateProjectileTrajectory,
  calculateBezierTrajectory,
  calculateSpiralTrajectory,
  calculateSineWaveTrajectory,
  calculateCustomTrajectory,
  calculateLaunchParameters,
  type TrajectoryPoint,
  type TrajectoryOptions,
  type BezierTrajectoryOptions,
  type SpiralTrajectoryOptions,
  type SineWaveTrajectoryOptions,
  type CustomTrajectoryOptions,
  type TrajectoryResult,
  type TrajectoryFunction
} from './TrajectoryUtils';
import { Vector, VectorUtils } from './galileoPhysicsSystem';

/**
 * Animation options for trajectory visualization
 */
export interface TrajectoryAnimationOptions {
  /** Whether to animate along the trajectory */
  animate?: boolean;
  
  /** Duration of the animation in milliseconds */
  duration?: number;
  
  /** Easing function for animation */
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | ((t: number) => number);
  
  /** Animation style (full path, expanding, or following point) */
  animationStyle?: 'full' | 'expanding' | 'following';
  
  /** Whether to loop the animation */
  loop?: boolean;
  
  /** Delay before starting the animation (ms) */
  delay?: number;
  
  /** Whether to auto-play the animation */
  autoPlay?: boolean;
  
  /** Number of objects to animate along the path */
  objectCount?: number;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
}

/**
 * Combined trajectory options for the hook
 */
export type TrajectoryHookOptions = 
  | (TrajectoryOptions & { type: TrajectoryType.PROJECTILE })
  | (BezierTrajectoryOptions & { type: TrajectoryType.BEZIER })
  | (SpiralTrajectoryOptions & { type: TrajectoryType.SPIRAL })
  | (SineWaveTrajectoryOptions & { type: TrajectoryType.SINE_WAVE })
  | (CustomTrajectoryOptions & { type: TrajectoryType.CUSTOM });

/**
 * Hook result object
 */
export interface TrajectoryHookResult {
  /** The calculated trajectory result */
  trajectory: TrajectoryResult | null;
  
  /** Current point on the trajectory during animation */
  currentPoint: TrajectoryPoint | null;
  
  /** Progress of the animation (0-1) */
  progress: number;
  
  /** Whether the animation is currently playing */
  isPlaying: boolean;
  
  /** Play the animation */
  play: () => void;
  
  /** Pause the animation */
  pause: () => void;
  
  /** Reset the animation to the beginning */
  reset: () => void;
  
  /** Seek to a specific progress (0-1) */
  seek: (progress: number) => void;
  
  /** Get a point at a specific progress (0-1) */
  getPointAtProgress: (progress: number) => TrajectoryPoint | null;
  
  /** Get the SVG path for the trajectory */
  svgPath: string;
  
  /** Get an array of points for objects along the path */
  objectPositions: TrajectoryPoint[];
  
  /** Recalculate the trajectory with new options */
  recalculate: (options: Partial<TrajectoryHookOptions>) => void;
  
  /** Calculate a trajectory to hit a target */
  calculateTarget: (target: Vector, speed: number) => boolean;
}

/**
 * Custom easing functions
 */
const easingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};

/**
 * Hook for calculating and animating along trajectories
 * 
 * @param options Trajectory options
 * @param animationOptions Animation options
 * @returns Hook result with trajectory data and controls
 */
export function useTrajectory(
  options: TrajectoryHookOptions,
  animationOptions: TrajectoryAnimationOptions = {}
): TrajectoryHookResult {
  // Default animation options
  const {
    animate = true,
    duration = 2000,
    easing = 'easeInOut',
    animationStyle = 'full',
    loop = false,
    delay = 0,
    autoPlay = true,
    objectCount = 1,
    category = AnimationCategory.ANIMATION
  } = animationOptions;
  
  // Reduced motion support
  const { prefersReducedMotion, isAnimationAllowed } = useReducedMotion();
  const shouldAnimate = animate && (!prefersReducedMotion || isAnimationAllowed(category));
  
  // State
  const [trajectory, setTrajectory] = useState<TrajectoryResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentPoint, setCurrentPoint] = useState<TrajectoryPoint | null>(null);
  const [objectPositions, setObjectPositions] = useState<TrajectoryPoint[]>([]);
  
  // Refs
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const optionsRef = useRef(options);
  
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  /**
   * Calculate trajectory based on options
   */
  const calculateTrajectory = useCallback((
    options: TrajectoryHookOptions
  ): TrajectoryResult | null => {
    try {
      switch (options.type) {
        case TrajectoryType.PROJECTILE:
          return calculateProjectileTrajectory(options);
          
        case TrajectoryType.BEZIER:
          return calculateBezierTrajectory(options);
          
        case TrajectoryType.SPIRAL:
          return calculateSpiralTrajectory(options);
          
        case TrajectoryType.SINE_WAVE:
          return calculateSineWaveTrajectory(options);
          
        case TrajectoryType.CUSTOM:
          return calculateCustomTrajectory(options);
          
        default:
          return null;
      }
    } catch (error) {
      console.error('Error calculating trajectory:', error);
      return null;
    }
  }, []);
  
  /**
   * Calculate initial trajectory
   */
  useEffect(() => {
    const result = calculateTrajectory(options);
    setTrajectory(result);
    
    if (result && result.points.length > 0) {
      setCurrentPoint(result.points[0]);
    }
  }, [calculateTrajectory]);
  
  /**
   * Recalculate trajectory with new options
   */
  const recalculate = useCallback((
    newOptions: Partial<TrajectoryHookOptions>
  ) => {
    // Merge with current options
    const mergedOptions = {
      ...optionsRef.current,
      ...newOptions
    } as TrajectoryHookOptions;
    
    // Store the updated options
    optionsRef.current = mergedOptions;
    
    // Calculate and update trajectory
    const result = calculateTrajectory(mergedOptions);
    setTrajectory(result);
    
    // Reset animation state
    setProgress(0);
    if (result && result.points.length > 0) {
      setCurrentPoint(result.points[0]);
    }
    
    // Restart animation if playing
    if (isPlaying) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      startTimeRef.current = null;
      requestAnimationFrame(animateFrame);
    }
  }, [calculateTrajectory, isPlaying]);
  
  /**
   * Calculate a trajectory to hit a specified target
   */
  const calculateTarget = useCallback((
    target: Vector,
    speed: number
  ): boolean => {
    if (optionsRef.current.type !== TrajectoryType.PROJECTILE) {
      console.error('calculateTarget only works with PROJECTILE trajectory type');
      return false;
    }
    
    const projectileOptions = optionsRef.current as TrajectoryOptions & { type: TrajectoryType.PROJECTILE };
    const start = projectileOptions.startPosition;
    const gravity = projectileOptions.gravity || { x: 0, y: 9.8, z: 0 };
    
    // Calculate launch parameters
    const params = calculateLaunchParameters(start, target, gravity, speed);
    
    // If target is unreachable
    if (!params) {
      return false;
    }
    
    // Update options with new velocity
    recalculate({
      initialVelocity: params.velocity
    });
    
    return true;
  }, [recalculate]);
  
  /**
   * Get point at specified progress
   */
  const getPointAtProgress = useCallback((
    progress: number
  ): TrajectoryPoint | null => {
    if (!trajectory || !trajectory.points.length) return null;
    
    // Clamp progress to 0-1
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    // Calculate index in the points array
    const lastIndex = trajectory.points.length - 1;
    const indexFloat = clampedProgress * lastIndex;
    const index = Math.floor(indexFloat);
    const fraction = indexFloat - index;
    
    // If at end of array, return last point
    if (index >= lastIndex) return trajectory.points[lastIndex];
    
    // Interpolate between adjacent points
    const pointA = trajectory.points[index];
    const pointB = trajectory.points[index + 1];
    
    return {
      position: {
        x: pointA.position.x + (pointB.position.x - pointA.position.x) * fraction,
        y: pointA.position.y + (pointB.position.y - pointA.position.y) * fraction,
        z: pointA.position.z + (pointB.position.z - pointA.position.z) * fraction
      },
      velocity: {
        x: pointA.velocity.x + (pointB.velocity.x - pointA.velocity.x) * fraction,
        y: pointA.velocity.y + (pointB.velocity.y - pointA.velocity.y) * fraction,
        z: pointA.velocity.z + (pointB.velocity.z - pointA.velocity.z) * fraction
      },
      time: pointA.time + (pointB.time - pointA.time) * fraction
    };
  }, [trajectory]);
  
  /**
   * Seek to a specific progress
   */
  const seek = useCallback((
    progress: number
  ) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    setProgress(clampedProgress);
    
    const point = getPointAtProgress(clampedProgress);
    if (point) {
      setCurrentPoint(point);
    }
    
    // Update object positions
    updateObjectPositions(clampedProgress);
  }, [getPointAtProgress]);
  
  /**
   * Update object positions based on current progress
   */
  const updateObjectPositions = useCallback((
    currentProgress: number
  ) => {
    if (!trajectory || objectCount <= 0) {
      setObjectPositions([]);
      return;
    }
    
    // For a single object, it's just the current point
    if (objectCount === 1) {
      const point = getPointAtProgress(currentProgress);
      setObjectPositions(point ? [point] : []);
      return;
    }
    
    // For multiple objects, distribute them along the path
    const positions: TrajectoryPoint[] = [];
    
    if (animationStyle === 'following') {
      // Objects follow the leading point with spacing
      const spacingFraction = 0.1; // 10% of path between objects
      
      for (let i = 0; i < objectCount; i++) {
        const objectProgress = currentProgress - (i * spacingFraction);
        
        // Only show objects that have entered the path
        if (objectProgress >= 0) {
          const point = getPointAtProgress(objectProgress);
          if (point) positions.push(point);
        }
      }
    } else {
      // Objects are evenly distributed along the active part of the path
      for (let i = 0; i < objectCount; i++) {
        let objectProgress: number;
        
        if (animationStyle === 'expanding') {
          // In expanding mode, objects are distributed along the visible portion
          objectProgress = (i / (objectCount - 1)) * currentProgress;
        } else {
          // In full mode, objects are distributed along the entire path
          objectProgress = i / (objectCount - 1);
        }
        
        // If we have only one object, put it at the current progress
        if (objectCount === 1) {
          objectProgress = currentProgress;
        }
        
        const point = getPointAtProgress(objectProgress);
        if (point) positions.push(point);
      }
    }
    
    setObjectPositions(positions);
  }, [trajectory, objectCount, animationStyle, getPointAtProgress]);
  
  /**
   * Animation frame function
   */
  const animateFrame = useCallback((timestamp: number) => {
    if (!shouldAnimate) return;
    
    // Initialize start time if not set
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp - (progress * duration);
    }
    
    // Calculate elapsed time
    const elapsed = timestamp - startTimeRef.current;
    let newProgress = Math.min(1, Math.max(0, (elapsed - delay) / duration));
    
    // Apply easing
    const easingFn = typeof easing === 'function' ? 
      easing : easingFunctions[easing] || easingFunctions.linear;
    const easedProgress = easingFn(newProgress);
    
    // Handle looping
    if (loop && newProgress >= 1) {
      startTimeRef.current = timestamp;
      newProgress = 0;
    }
    
    // Update progress
    setProgress(newProgress);
    
    // Get current point on trajectory
    const point = getPointAtProgress(easedProgress);
    if (point) {
      setCurrentPoint(point);
    }
    
    // Update object positions
    updateObjectPositions(easedProgress);
    
    // Continue animation if not complete
    if (isPlaying && (newProgress < 1 || loop)) {
      animationRef.current = requestAnimationFrame(animateFrame);
    } else if (newProgress >= 1) {
      setIsPlaying(false);
    }
  }, [
    shouldAnimate, progress, duration, delay, easing, 
    loop, isPlaying, getPointAtProgress, updateObjectPositions
  ]);
  
  /**
   * Play animation
   */
  const play = useCallback(() => {
    if (!shouldAnimate) return;
    
    setIsPlaying(true);
    
    // Reset start time if at end
    if (progress >= 1) {
      startTimeRef.current = null;
      setProgress(0);
    }
    
    // Start animation
    animationRef.current = requestAnimationFrame(animateFrame);
  }, [shouldAnimate, progress, animateFrame]);
  
  /**
   * Pause animation
   */
  const pause = useCallback(() => {
    setIsPlaying(false);
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  /**
   * Reset animation
   */
  const reset = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    startTimeRef.current = null;
    
    if (trajectory && trajectory.points.length > 0) {
      setCurrentPoint(trajectory.points[0]);
    }
    
    // Reset object positions
    updateObjectPositions(0);
  }, [trajectory, updateObjectPositions]);
  
  /**
   * Start animation on mount if autoPlay is true
   */
  useEffect(() => {
    if (autoPlay && shouldAnimate) {
      play();
    }
    
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoPlay, shouldAnimate, play]);
  
  /**
   * SVG path for the trajectory
   */
  const svgPath = useMemo(() => {
    return trajectory?.svgPath || '';
  }, [trajectory]);
  
  return {
    trajectory,
    currentPoint,
    progress,
    isPlaying,
    play,
    pause,
    reset,
    seek,
    getPointAtProgress,
    svgPath,
    objectPositions,
    recalculate,
    calculateTarget
  };
}

export default useTrajectory;