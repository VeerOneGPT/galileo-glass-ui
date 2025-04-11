/**
 * useAnimationSequence Hook
 * 
 * Manages sequences of animations with configurable timing and transitions.
 * This hook provides a way to define and control multi-stage animations.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimationCallbacks, AnimationOptions, AnimationState } from '../engine';
import { useAnimation, AnimationStyle } from './useAnimation';
import { isFeatureEnabled } from '../../utils/featureFlags';

/**
 * Animation stage definition
 */
export interface AnimationStage {
  /**
   * Unique identifier for the stage
   */
  id: string;
  
  /**
   * Animation styles to apply during this stage
   */
  styles: AnimationStyle[];
  
  /**
   * Animation options for this stage
   */
  options: AnimationOptions;
  
  /**
   * Callbacks for this stage
   */
  callbacks?: AnimationCallbacks;
}

/**
 * Animation sequence type
 */
export type AnimationSequence = AnimationStage[];

/**
 * Animation sequence playback state
 */
export enum PlaybackState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

/**
 * useAnimationSequence hook return type
 */
export interface UseAnimationSequenceReturn {
  /**
   * Current playback state
   */
  playbackState: PlaybackState;
  
  /**
   * ID of the current stage being played
   */
  currentStageId: string | null;
  
  /**
   * Index of the current stage in the sequence
   */
  currentStageIndex: number;
  
  /**
   * Progress of the current stage (0 to 1)
   */
  currentStageProgress: number;
  
  /**
   * Overall progress of the entire sequence (0 to 1)
   */
  sequenceProgress: number;
  
  /**
   * Start playing the sequence
   */
  play: () => void;
  
  /**
   * Pause the sequence
   */
  pause: () => void;
  
  /**
   * Resume the sequence
   */
  resume: () => void;
  
  /**
   * Cancel the sequence
   */
  cancel: () => void;
  
  /**
   * Jump to a specific stage in the sequence
   */
  jumpToStage: (stageId: string) => void;
  
  /**
   * Jump to a specific index in the sequence
   */
  jumpToIndex: (index: number) => void;
}

/**
 * Custom hook for managing sequences of animations
 * 
 * @param sequence Array of animation stages
 * @param options Options for the entire sequence
 * @returns Sequence control and state
 * 
 * @example
 * ```tsx
 * const { play, pause, resume, cancel, currentStageId, sequenceProgress } = useAnimationSequence([
 *   {
 *     id: 'fade-in',
 *     styles: [{ target: '.my-element', property: 'opacity', from: '0', to: '1' }],
 *     options: { duration: 500, easing: 'ease-in' },
 *   },
 *   {
 *     id: 'move-up',
 *     styles: [{ target: '.my-element', property: 'transform', from: 'translateY(20px)', to: 'translateY(0)' }],
 *     options: { duration: 300, easing: 'ease-out' },
 *   },
 * ]);
 * ```
 */
export function useAnimationSequence(
  sequence: AnimationSequence,
  options?: {
    /**
     * Whether to loop the sequence
     */
    loop?: boolean;
    
    /**
     * Whether to automatically play the sequence on mount
     */
    autoPlay?: boolean;
    
    /**
     * Callback to run when the entire sequence is completed
     */
    onComplete?: () => void;
  }
): UseAnimationSequenceReturn {
  // Default options
  const defaultOptions = {
    loop: false,
    autoPlay: false,
  };
  
  // Merge options with defaults
  const mergedOptions = { ...defaultOptions, ...options };
  
  // State for sequence control
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.IDLE);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(-1);
  const [currentStageProgress, setCurrentStageProgress] = useState<number>(0);
  const [sequenceProgress, setSequenceProgress] = useState<number>(0);
  
  // Refs to avoid unnecessary re-renders
  const sequenceRef = useRef<AnimationSequence>(sequence);
  const optionsRef = useRef(mergedOptions);
  
  // Update refs when props change
  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);
  
  useEffect(() => {
    optionsRef.current = { ...defaultOptions, ...options };
  }, [options]);
  
  // Current stage ID derived from index
  const currentStageId = currentStageIndex >= 0 && currentStageIndex < sequence.length
    ? sequence[currentStageIndex].id
    : null;
  
  // Calculate total duration of the sequence
  const getTotalDuration = useCallback((): number => {
    return sequenceRef.current.reduce((total, stage) => total + stage.options.duration, 0);
  }, []);
  
  // Find stage index by ID
  const findStageIndex = useCallback((stageId: string): number => {
    return sequenceRef.current.findIndex(stage => stage.id === stageId);
  }, []);
  
  // Animation hook for current stage
  const {
    progress: stageProgress,
    start: startStage,
    pause: pauseStage,
    resume: resumeStage,
    cancel: cancelStage,
    state: animationState,
  } = useAnimation(
    // Use empty options as a fallback for initial render
    currentStageIndex >= 0 && currentStageIndex < sequence.length
      ? sequence[currentStageIndex].options
      : { duration: 0 },
    
    // Use empty styles as a fallback for initial render
    currentStageIndex >= 0 && currentStageIndex < sequence.length
      ? sequence[currentStageIndex].styles
      : [],
    
    // Callbacks to handle stage transitions
    {
      onUpdate: (progress) => {
        setCurrentStageProgress(progress);
        
        // Calculate overall sequence progress
        if (currentStageIndex >= 0) {
          const completedDuration = sequenceRef.current
            .slice(0, currentStageIndex)
            .reduce((total, stage) => total + stage.options.duration, 0);
          
          const currentStageDuration = sequenceRef.current[currentStageIndex].options.duration;
          const currentStageElapsed = progress * currentStageDuration;
          
          const totalDuration = getTotalDuration();
          const overallProgress = (completedDuration + currentStageElapsed) / totalDuration;
          
          setSequenceProgress(overallProgress);
        }
        
        // Forward callback if present
        const currentStage = sequenceRef.current[currentStageIndex];
        if (currentStage?.callbacks?.onUpdate) {
          currentStage.callbacks.onUpdate(progress, 0); // Time is not passed here
        }
      },
      
      onComplete: () => {
        // Forward callback if present
        const currentStage = sequenceRef.current[currentStageIndex];
        if (currentStage?.callbacks?.onComplete) {
          currentStage.callbacks.onComplete();
        }
        
        // Advance to next stage
        const nextIndex = currentStageIndex + 1;
        
        if (nextIndex < sequenceRef.current.length) {
          // Move to next stage
          setCurrentStageIndex(nextIndex);
          
          // Auto-start next stage if we're in playing state
          if (playbackState === PlaybackState.PLAYING) {
            // This will be picked up by the useEffect that watches currentStageIndex
            setTimeout(() => {
              if (playbackState === PlaybackState.PLAYING) {
                startStage();
              }
            }, 0);
          }
        } else {
          // End of sequence
          if (optionsRef.current.loop) {
            // Loop back to the beginning
            setCurrentStageIndex(0);
            
            // Auto-start first stage if we're in playing state
            if (playbackState === PlaybackState.PLAYING) {
              setTimeout(() => {
                if (playbackState === PlaybackState.PLAYING) {
                  startStage();
                }
              }, 0);
            }
          } else {
            // Complete the sequence
            setPlaybackState(PlaybackState.COMPLETED);
            setSequenceProgress(1);
            
            // Call onComplete callback
            if (optionsRef.current.onComplete) {
              optionsRef.current.onComplete();
            }
          }
        }
      },
    }
  );
  
  // Sync stage progress with state
  useEffect(() => {
    setCurrentStageProgress(stageProgress);
  }, [stageProgress]);
  
  // Start playing the sequence
  const play = useCallback(() => {
    if (playbackState === PlaybackState.PLAYING) {
      return;
    }
    
    if (
      playbackState === PlaybackState.IDLE || 
      playbackState === PlaybackState.COMPLETED ||
      currentStageIndex === -1
    ) {
      // Start from beginning
      setCurrentStageIndex(0);
      setPlaybackState(PlaybackState.PLAYING);
      
      // StartStage will be called by the useEffect watching currentStageIndex
    } else if (playbackState === PlaybackState.PAUSED) {
      // Resume from current position
      resumeStage();
      setPlaybackState(PlaybackState.PLAYING);
    }
  }, [playbackState, currentStageIndex, resumeStage]);
  
  // Pause the sequence
  const pause = useCallback(() => {
    if (playbackState === PlaybackState.PLAYING) {
      pauseStage();
      setPlaybackState(PlaybackState.PAUSED);
    }
  }, [playbackState, pauseStage]);
  
  // Resume the sequence
  const resume = useCallback(() => {
    if (playbackState === PlaybackState.PAUSED) {
      resumeStage();
      setPlaybackState(PlaybackState.PLAYING);
    }
  }, [playbackState, resumeStage]);
  
  // Cancel the sequence
  const cancel = useCallback(() => {
    cancelStage();
    setPlaybackState(PlaybackState.IDLE);
    setCurrentStageIndex(-1);
    setCurrentStageProgress(0);
    setSequenceProgress(0);
  }, [cancelStage]);
  
  // Jump to a specific stage by ID
  const jumpToStage = useCallback((stageId: string) => {
    const newIndex = findStageIndex(stageId);
    
    if (newIndex !== -1) {
      // Cancel current animation
      cancelStage();
      
      // Update stage index
      setCurrentStageIndex(newIndex);
      
      // Start the new stage if we're in playing state
      if (playbackState === PlaybackState.PLAYING) {
        // startStage will be called by the useEffect watching currentStageIndex
      } else {
        setPlaybackState(PlaybackState.PAUSED);
      }
    }
  }, [findStageIndex, cancelStage, playbackState]);
  
  // Jump to a specific stage by index
  const jumpToIndex = useCallback((index: number) => {
    if (index >= 0 && index < sequenceRef.current.length) {
      // Cancel current animation
      cancelStage();
      
      // Update stage index
      setCurrentStageIndex(index);
      
      // Start the new stage if we're in playing state
      if (playbackState === PlaybackState.PLAYING) {
        // startStage will be called by the useEffect watching currentStageIndex
      } else {
        setPlaybackState(PlaybackState.PAUSED);
      }
    }
  }, [cancelStage, playbackState]);
  
  // Start stage when currentStageIndex changes
  useEffect(() => {
    if (currentStageIndex >= 0 && playbackState === PlaybackState.PLAYING) {
      startStage();
    }
  }, [currentStageIndex, playbackState, startStage]);
  
  // Auto-play on mount if enabled
  useEffect(() => {
    if (optionsRef.current.autoPlay) {
      play();
    }
  }, [play]);
  
  return {
    playbackState,
    currentStageId,
    currentStageIndex,
    currentStageProgress,
    sequenceProgress,
    play,
    pause,
    resume,
    cancel,
    jumpToStage,
    jumpToIndex,
  };
}

export default useAnimationSequence; 