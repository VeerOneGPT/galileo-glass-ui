import { useRef, useEffect, useState, useCallback } from 'react';

export interface AnimationStage {
  /**
   * The ID of the animation stage
   */
  id: string;
  
  /**
   * The delay before this stage starts (in milliseconds)
   */
  delay: number;
  
  /**
   * The duration of this stage (in milliseconds)
   */
  duration: number;
  
  /**
   * The callback function to execute when this stage starts
   */
  onStart?: () => void;
  
  /**
   * The callback function to execute when this stage ends
   */
  onEnd?: () => void;
  
  /**
   * Whether this stage is completed
   */
  completed?: boolean;
  
  /**
   * The order of this stage in the sequence
   */
  order?: number;
  
  /**
   * The animation configuration (e.g., easing, keyframes)
   */
  animation?: {
    easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
    keyframes?: string;
  };
}

export interface OrchestrationOptions {
  /**
   * The animation stages to orchestrate
   */
  stages: AnimationStage[];
  
  /**
   * Whether to auto-start the orchestration
   */
  autoStart?: boolean;
  
  /**
   * The delay before starting the orchestration (in milliseconds)
   */
  startDelay?: number;
  
  /**
   * Whether to repeat the orchestration
   */
  repeat?: boolean;
  
  /**
   * The number of times to repeat the orchestration (Infinity for endless loop)
   */
  repeatCount?: number;
  
  /**
   * Whether to pause between repetitions
   */
  repeatDelay?: number;
  
  /**
   * Whether the orchestration is initially active
   */
  active?: boolean;
  
  /**
   * Callback when the entire sequence is completed
   */
  onComplete?: () => void;
  
  /**
   * Callback before the orchestration starts
   */
  onStart?: () => void;
}

/**
 * Hook for orchestrating complex animation sequences
 * 
 * This hook coordinates multiple animations with precise timing control,
 * allowing for complex staged animation sequences.
 */
export const useOrchestration = (options: OrchestrationOptions) => {
  const {
    stages,
    autoStart = true,
    startDelay = 0,
    repeat = false,
    repeatCount = 1,
    repeatDelay = 0,
    active = true,
    onComplete,
    onStart,
  } = options;
  
  // Sort stages by order property if provided, otherwise by array order
  const sortedStages = [...stages].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0; // Keep original order
  });
  
  // Track active stages and completed state
  const [activeStages, setActiveStages] = useState<string[]>([]);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoStart && active);
  const [iteration, setIteration] = useState(1);
  const [sequenceComplete, setSequenceComplete] = useState(false);
  
  // References to keep track of timers
  const stageTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const startTimerRef = useRef<NodeJS.Timeout | null>(null);
  const repeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start a specific stage
  const startStage = useCallback((stage: AnimationStage) => {
    // Call the onStart callback if provided
    if (stage.onStart) {
      stage.onStart();
    }
    
    // Mark stage as active
    setActiveStages((prev) => [...prev, stage.id]);
    
    // Set up end timer
    stageTimers.current[`${stage.id}-end`] = setTimeout(() => {
      // Call the onEnd callback if provided
      if (stage.onEnd) {
        stage.onEnd();
      }
      
      // Mark stage as inactive and completed
      setActiveStages((prev) => prev.filter((id) => id !== stage.id));
      setCompletedStages((prev) => [...prev, stage.id]);
    }, stage.duration);
  }, []);
  
  // Start the orchestration sequence
  const startSequence = useCallback(() => {
    // Reset state
    setActiveStages([]);
    setCompletedStages([]);
    setSequenceComplete(false);
    
    // Call the onStart callback if provided
    if (onStart) {
      onStart();
    }
    
    // Schedule each stage
    sortedStages.forEach((stage) => {
      stageTimers.current[`${stage.id}-start`] = setTimeout(() => {
        startStage(stage);
      }, startDelay + stage.delay);
    });
    
    // Calculate total sequence duration for completion
    const totalDuration = sortedStages.reduce((max, stage) => {
      return Math.max(max, stage.delay + stage.duration);
    }, 0);
    
    // Set a timer for the sequence completion
    stageTimers.current.sequenceComplete = setTimeout(() => {
      setSequenceComplete(true);
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
      // Handle repeating
      if (repeat && (repeatCount === Infinity || iteration < repeatCount)) {
        repeatTimerRef.current = setTimeout(() => {
          setIteration((prev) => prev + 1);
          startSequence();
        }, repeatDelay);
      }
    }, startDelay + totalDuration);
  }, [sortedStages, startDelay, startStage, repeat, repeatCount, repeatDelay, iteration, onStart, onComplete]);
  
  // Clear all timers
  const clearAllTimers = useCallback(() => {
    // Clear stage timers
    Object.values(stageTimers.current).forEach(clearTimeout);
    stageTimers.current = {};
    
    // Clear start timer
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
    
    // Clear repeat timer
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  }, []);
  
  // Start the orchestration
  const start = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setIteration(1);
    
    startTimerRef.current = setTimeout(() => {
      startSequence();
    }, startDelay);
  }, [isPlaying, startSequence, startDelay]);
  
  // Stop the orchestration
  const stop = useCallback(() => {
    setIsPlaying(false);
    clearAllTimers();
    setActiveStages([]);
  }, [clearAllTimers]);
  
  // Pause the orchestration (keep track of progress)
  const pause = useCallback(() => {
    setIsPlaying(false);
    // We don't clear timers here, just prevent new ones from being created
  }, []);
  
  // Resume the orchestration
  const resume = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);
    // Add logic to resume from pause state
  }, [isPlaying]);
  
  // Reset the orchestration
  const reset = useCallback(() => {
    stop();
    setCompletedStages([]);
    setIteration(1);
    setSequenceComplete(false);
  }, [stop]);
  
  // Restart the orchestration
  const restart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);
  
  // Skip to a specific stage
  const skipToStage = useCallback((stageId: string) => {
    stop();
    
    // Find the target stage
    const targetStage = sortedStages.find((stage) => stage.id === stageId);
    if (!targetStage) return;
    
    // Mark all stages before the target as completed
    const targetIndex = sortedStages.findIndex((stage) => stage.id === stageId);
    const stagesToComplete = sortedStages.slice(0, targetIndex).map((stage) => stage.id);
    
    setCompletedStages(stagesToComplete);
    setIsPlaying(true);
    
    // Start from the target stage
    startStage(targetStage);
    
    // Schedule remaining stages
    const remainingStages = sortedStages.slice(targetIndex + 1);
    remainingStages.forEach((stage) => {
      const relativeDelay = stage.delay - targetStage.delay;
      stageTimers.current[`${stage.id}-start`] = setTimeout(() => {
        startStage(stage);
      }, Math.max(0, relativeDelay));
    });
  }, [sortedStages, stop, startStage]);
  
  // Effect for auto-start
  useEffect(() => {
    if (autoStart && active) {
      startTimerRef.current = setTimeout(() => {
        startSequence();
      }, startDelay);
    }
    
    return clearAllTimers;
  }, [autoStart, active, startSequence, startDelay, clearAllTimers]);
  
  // Effect for active state changes
  useEffect(() => {
    if (active && !isPlaying) {
      setIsPlaying(true);
    } else if (!active && isPlaying) {
      pause();
    }
  }, [active, isPlaying, pause]);
  
  // Cleanup on unmount
  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);
  
  return {
    activeStages,
    completedStages,
    isPlaying,
    sequenceComplete,
    iteration,
    start,
    stop,
    pause,
    resume,
    reset,
    restart,
    skipToStage,
    isStageActive: (stageId: string) => activeStages.includes(stageId),
    isStageCompleted: (stageId: string) => completedStages.includes(stageId),
  };
};

export default useOrchestration;