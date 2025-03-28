/**
 * useAnimationSynchronization Hook
 *
 * React hook for using the animation synchronizer system to coordinate
 * multiple animations with timing-agnostic synchronization.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { 
  animationSynchronizer, 
  SynchronizedGroup,
  SyncedAnimation,
  SyncGroupOptions,
  SyncPoint,
  AnimationPhase,
  SyncGroupState,
  SynchronizationStrategy
} from '../animations/orchestration/AnimationSynchronizer';
import { AnimationState } from '../animations/orchestration/AnimationStateMachine';
import { useReducedMotion } from './useReducedMotion';

/**
 * Hook options for animation synchronization
 */
export interface UseAnimationSynchronizationOptions extends Omit<SyncGroupOptions, 'id'> {
  /** Whether to automatically initialize the group */
  autoInitialize?: boolean;
  
  /** Whether to automatically play the group when initialized */
  autoPlay?: boolean;
  
  /** Whether to respect reduced motion preferences */
  respectReducedMotion?: boolean;
  
  /** Duration multiplier for reduced motion (0-1) */
  reducedMotionScale?: number;
}

/**
 * Return type for useAnimationSynchronization hook
 */
export interface UseAnimationSynchronizationReturn {
  /** Add an animation to the group */
  addAnimation: (animation: SyncedAnimation) => void;
  
  /** Add multiple animations to the group */
  addAnimations: (animations: SyncedAnimation[]) => void;
  
  /** Remove an animation from the group */
  removeAnimation: (animationId: string) => void;
  
  /** Initialize the group and calculate timings */
  initialize: () => void;
  
  /** Play all animations in the group */
  play: () => Promise<void>;
  
  /** Pause all animations in the group */
  pause: () => void;
  
  /** Cancel all animations in the group */
  cancel: () => void;
  
  /** Get the current group state */
  groupState: SyncGroupState;
  
  /** Get the current progress (0-1) */
  progress: number;
  
  /** Reference to the synchronized group */
  groupRef: React.MutableRefObject<SynchronizedGroup | null>;
  
  /** Add a listener for sync points */
  addSyncPointListener: (
    animationId: string, 
    listener: (point: SyncPoint) => void
  ) => void;
  
  /** Remove a sync point listener */
  removeSyncPointListener: (
    animationId: string,
    listener: (point: SyncPoint) => void
  ) => void;
  
  /** Connect a state machine to an animation */
  connectStateMachine: (
    animationId: string,
    stateMachine: any,
    stateMap: Record<string, string>
  ) => void;
  
  /** Create default sync points */
  createDefaultSyncPoints: () => SyncPoint[];
}

/**
 * Hook for timing-agnostic animation synchronization in React components
 * @param groupId Unique ID for the synchronization group
 * @param options Group options
 * @returns Hook API
 */
export function useAnimationSynchronization(
  groupId: string,
  options: UseAnimationSynchronizationOptions = {}
): UseAnimationSynchronizationReturn {
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Reference to the synchronized group
  const groupRef = useRef<SynchronizedGroup | null>(null);
  
  // State for progress tracking
  const [progress, setProgress] = useState(0);
  
  // State for group state tracking
  const [groupState, setGroupState] = useState<SyncGroupState>(SyncGroupState.INITIALIZING);
  
  // Progress tracking interval
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Process options based on reduced motion preference
  const processedOptions: SyncGroupOptions = {
    ...options,
    id: groupId
  };
  
  // Adjust duration for reduced motion if needed
  if (options.respectReducedMotion !== false && prefersReducedMotion) {
    const scale = options.reducedMotionScale || 0.4;
    
    if (processedOptions.duration) {
      processedOptions.duration *= scale;
    }
  }
  
  // Initialize the group
  useEffect(() => {
    // Create or get existing group
    let group = animationSynchronizer.getGroup(groupId);
    
    if (!group) {
      group = animationSynchronizer.createSyncGroup(processedOptions);
    }
    
    groupRef.current = group;
    
    // Set up progress tracking
    const trackProgress = () => {
      if (group && groupRef.current) {
        const currentProgress = group.getProgress();
        setProgress(currentProgress);
        setGroupState(group.getState());
      }
    };
    
    // Start progress tracking interval
    progressIntervalRef.current = setInterval(trackProgress, 16);
    
    // Setup group if autoInitialize is true
    if (options.autoInitialize) {
      try {
        group.initialize();
        
        // Auto-play if specified
        if (options.autoPlay) {
          group.play().catch(err => {
            console.error('Error playing animation group:', err);
          });
        }
      } catch (error) {
        console.error('Error initializing animation group:', error);
      }
    }
    
    // Cleanup function
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Clean up group if it exists
      if (groupRef.current) {
        if (groupRef.current.getState() === SyncGroupState.PLAYING) {
          groupRef.current.cancel();
        }
        
        animationSynchronizer.removeGroup(groupId);
        groupRef.current = null;
      }
    };
  }, [groupId]);
  
  /**
   * Add an animation to the group
   */
  const addAnimation = useCallback((animation: SyncedAnimation) => {
    if (groupRef.current) {
      groupRef.current.addAnimation(animation);
    }
  }, []);
  
  /**
   * Add multiple animations to the group
   */
  const addAnimations = useCallback((animations: SyncedAnimation[]) => {
    if (groupRef.current) {
      groupRef.current.addAnimations(animations);
    }
  }, []);
  
  /**
   * Remove an animation from the group
   */
  const removeAnimation = useCallback((animationId: string) => {
    if (groupRef.current) {
      groupRef.current.removeAnimation(animationId);
    }
  }, []);
  
  /**
   * Initialize the group and calculate timings
   */
  const initialize = useCallback(() => {
    if (groupRef.current) {
      groupRef.current.initialize();
      setGroupState(groupRef.current.getState());
    }
  }, []);
  
  /**
   * Play all animations in the group
   */
  const play = useCallback(async () => {
    if (groupRef.current) {
      try {
        if (groupRef.current.getState() === SyncGroupState.INITIALIZING) {
          groupRef.current.initialize();
        }
        
        await groupRef.current.play();
        setGroupState(groupRef.current.getState());
      } catch (error) {
        console.error('Error playing animation group:', error);
      }
    }
  }, []);
  
  /**
   * Pause all animations in the group
   */
  const pause = useCallback(() => {
    if (groupRef.current) {
      groupRef.current.pause();
      setGroupState(groupRef.current.getState());
    }
  }, []);
  
  /**
   * Cancel all animations in the group
   */
  const cancel = useCallback(() => {
    if (groupRef.current) {
      groupRef.current.cancel();
      setGroupState(groupRef.current.getState());
    }
  }, []);
  
  /**
   * Add a listener for sync points
   */
  const addSyncPointListener = useCallback((
    animationId: string,
    listener: (point: SyncPoint) => void
  ) => {
    if (groupRef.current) {
      groupRef.current.addSyncPointListener(animationId, listener);
    }
  }, []);
  
  /**
   * Remove a sync point listener
   */
  const removeSyncPointListener = useCallback((
    animationId: string,
    listener: (point: SyncPoint) => void
  ) => {
    if (groupRef.current) {
      groupRef.current.removeSyncPointListener(animationId, listener);
    }
  }, []);
  
  /**
   * Connect a state machine to an animation
   */
  const connectStateMachine = useCallback((
    animationId: string,
    stateMachine: any,
    stateMap: Record<string, string>
  ) => {
    if (groupRef.current) {
      groupRef.current.connectStateMachine(animationId, stateMachine, stateMap);
    }
  }, []);
  
  /**
   * Create default sync points
   */
  const createDefaultSyncPoints = useCallback(() => {
    return animationSynchronizer.createDefaultSyncPoints();
  }, []);
  
  return {
    addAnimation,
    addAnimations,
    removeAnimation,
    initialize,
    play,
    pause,
    cancel,
    groupState,
    progress,
    groupRef,
    addSyncPointListener,
    removeSyncPointListener,
    connectStateMachine,
    createDefaultSyncPoints
  };
}

export default useAnimationSynchronization;