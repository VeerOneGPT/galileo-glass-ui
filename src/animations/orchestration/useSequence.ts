/**
 * useSequence hook
 * 
 * React hook for using the declarative animation sequencing system.
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimationPreset } from '../core/types';
import { MotionSensitivityLevel } from '../accessibility/MotionSensitivity';
import { 
  DeclarativeSequencer, 
  SequenceBuilder, 
  SequenceOptions, 
  AnimationTargetSelector,
  StaggerOptions,
  AnimationDeclaration
} from './DeclarativeSequencer';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Parameters for the useSequence hook
 */
export interface UseSequenceParams {
  /** Unique name for the sequence */
  name: string;
  
  /** Whether the sequence should autoplay when created */
  autoPlay?: boolean;
  
  /** Delay before starting sequence (ms) */
  startDelay?: number;
  
  /** Whether to loop the sequence */
  loop?: boolean;
  
  /** Number of times to loop */
  iterations?: number;
  
  /** Whether to reverse direction on alternate loops */
  alternate?: boolean;
  
  /** Motion sensitivity level */
  sensitivity?: MotionSensitivityLevel;
  
  /** Whether to use relative timing */
  relative?: boolean;
  
  /** Default easing function */
  defaultEase?: string;
  
  /** Dependencies array to recreate sequence when changed */
  deps?: any[];
}

/**
 * Results returned by the useSequence hook
 */
export interface UseSequenceResult {
  /** Builder function to define the sequence */
  builder: (builder: SequenceBuilder) => void;
  
  /** Start the sequence */
  start: () => Promise<void>;
  
  /** Pause the sequence */
  pause: () => void;
  
  /** Resume the sequence */
  resume: () => void;
  
  /** Stop the sequence */
  stop: () => void;
  
  /** Reset the sequence */
  reset: () => void;
  
  /** Check if sequence is currently playing */
  isPlaying: boolean;
  
  /** Check if sequence is currently paused */
  isPaused: boolean;
  
  /** Check if sequence is completed */
  isComplete: boolean;
  
  /** Animation target utility - for convenient targeting */
  animationTarget: (
    selector: AnimationTargetSelector,
    animation: AnimationPreset | string,
    options?: Partial<AnimationDeclaration>
  ) => void;
  
  /** Staggered animation utility - for convenient staggered animations */
  staggerTarget: (
    selector: AnimationTargetSelector,
    animation: AnimationPreset | string,
    options?: Partial<StaggerOptions>
  ) => void;
}

/**
 * Hook for creating and controlling declarative animation sequences
 * 
 * @param params Sequence configuration parameters
 * @param builderFn Function to build the sequence using the builder pattern
 * @returns Sequence control methods and state
 */
export function useSequence(
  params: UseSequenceParams,
  builderFn: (builder: SequenceBuilder) => void
): UseSequenceResult {
  // Get preferred motion settings
  const prefersReducedMotion = useReducedMotion();
  
  // Create a stable reference to the builder function
  const builderFnRef = useRef(builderFn);
  useEffect(() => {
    builderFnRef.current = builderFn;
  }, [builderFn]);
  
  // Create options from params
  const options: SequenceOptions = useMemo(() => ({
    autoPlay: params.autoPlay ?? false,
    startDelay: params.startDelay ?? 0,
    loop: params.loop ?? false,
    iterations: params.iterations,
    alternate: params.alternate ?? false,
    relative: params.relative ?? true,
    defaultEase: params.defaultEase ?? 'ease-out',
    sensitivity: prefersReducedMotion 
      ? MotionSensitivityLevel.HIGH 
      : (params.sensitivity ?? MotionSensitivityLevel.MEDIUM)
  }), [
    params.autoPlay,
    params.startDelay,
    params.loop,
    params.iterations,
    params.alternate, 
    params.relative,
    params.defaultEase,
    params.sensitivity,
    prefersReducedMotion
  ]);
  
  // Reference to the sequence
  const sequenceRef = useRef<DeclarativeSequencer | null>(null);
  
  // State tracking
  const stateRef = useRef({
    isPlaying: false,
    isPaused: false,
    isComplete: false
  });
  
  // Create sequence if needed
  const ensureSequence = useCallback(() => {
    if (!sequenceRef.current) {
      sequenceRef.current = DeclarativeSequencer.create(
        params.name, 
        options,
        builderFnRef.current
      );
    }
    return sequenceRef.current;
  }, [params.name, options]);
  
  // Initialize sequence
  useEffect(() => {
    ensureSequence();
    
    return () => {
      // Clean up sequence on unmount
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current = null;
      }
    };
  }, [ensureSequence, ...(params.deps || [])]);
  
  // Start the sequence
  const start = useCallback(async () => {
    const sequence = ensureSequence();
    stateRef.current.isPlaying = true;
    stateRef.current.isPaused = false;
    stateRef.current.isComplete = false;
    await sequence.start();
    stateRef.current.isPlaying = false;
    stateRef.current.isComplete = true;
  }, [ensureSequence]);
  
  // Pause the sequence
  const pause = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current.pause();
      stateRef.current.isPaused = true;
      stateRef.current.isPlaying = false;
    }
  }, []);
  
  // Resume the sequence
  const resume = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current.resume();
      stateRef.current.isPaused = false;
      stateRef.current.isPlaying = true;
    }
  }, []);
  
  // Stop the sequence
  const stop = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      stateRef.current.isPlaying = false;
      stateRef.current.isPaused = false;
    }
  }, []);
  
  // Reset the sequence
  const reset = useCallback(() => {
    if (sequenceRef.current) {
      sequenceRef.current.reset();
      stateRef.current.isPlaying = false;
      stateRef.current.isPaused = false;
      stateRef.current.isComplete = false;
    }
  }, []);
  
  // Utility to directly animate a target
  const animationTarget = useCallback((
    selector: AnimationTargetSelector,
    animation: AnimationPreset | string,
    options: Partial<AnimationDeclaration> = {}
  ) => {
    if (sequenceRef.current) {
      const builder = new SequenceBuilder(sequenceRef.current);
      builder.animate(selector, animation, options);
    }
  }, []);
  
  // Utility to create staggered animations
  const staggerTarget = useCallback((
    selector: AnimationTargetSelector,
    animation: AnimationPreset | string,
    options: Partial<StaggerOptions> = {}
  ) => {
    if (sequenceRef.current) {
      const builder = new SequenceBuilder(sequenceRef.current);
      builder.stagger(selector, animation, options);
    }
  }, []);
  
  return {
    builder: builderFnRef.current,
    start,
    pause,
    resume,
    stop,
    reset,
    get isPlaying() { return stateRef.current.isPlaying; },
    get isPaused() { return stateRef.current.isPaused; },
    get isComplete() { return stateRef.current.isComplete; },
    animationTarget,
    staggerTarget
  };
}

export default useSequence;