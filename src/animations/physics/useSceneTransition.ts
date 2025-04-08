/**
 * useSceneTransition.ts
 * 
 * React hook for using scene transitions in Galileo Glass UI components.
 * Provides a simple interface for creating smooth transitions between application scenes or levels.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory } from '../accessibility/MotionSensitivity';
import {
  SceneTransitionManager,
  SceneConfig,
  SceneTransition,
  TransitionEffect,
  SceneDepthEffect,
  ContentPreservation,
  TransitionState,
  SceneType
} from './SceneTransitionManager';
import { TransitionDirection } from '../types';

/**
 * Configuration for useSceneTransition hook
 */
export interface SceneTransitionConfig {
  /** Initial scene ID */
  initialScene?: string;
  
  /** Scene definitions */
  scenes?: SceneConfig[];
  
  /** Transition definitions */
  transitions?: SceneTransition[];
  
  /** Default transition duration in ms */
  defaultDuration?: number;
  
  /** Default transition effect */
  defaultEffect?: TransitionEffect;
  
  /** Default easing function */
  defaultEasing?: string;
  
  /** Default depth effect */
  defaultDepthEffect?: SceneDepthEffect;
  
  /** Default content preservation strategy */
  defaultPreservation?: ContentPreservation;
  
  /** If true, the manager automatically handles history navigation */
  handleHistory?: boolean;
  
  /** If true, transitions start automatically */
  autoStart?: boolean;
  
  /** If true, logs details about transitions */
  debug?: boolean;
  
  /** Container element ref */
  containerRef?: React.RefObject<HTMLElement>;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** Callback when a scene change begins */
  onSceneChangeStart?: (fromId: string | null, toId: string) => void;
  
  /** Callback when a scene change completes */
  onSceneChangeComplete?: (fromId: string | null, toId: string) => void;
  
  /** Callback when a scene change fails */
  onSceneChangeFail?: (fromId: string | null, toId: string, error: Error) => void;
}

/**
 * Actions for controlling scene transitions
 */
export interface SceneTransitionActions {
  /** Change to a specific scene */
  changeScene: (sceneId: string, transitionOverride?: Partial<SceneTransition>) => Promise<boolean>;
  
  /** Navigate back to the previous scene */
  back: () => Promise<boolean>;
  
  /** Navigate forward */
  forward: () => Promise<boolean>;
  
  /** Pause the current transition */
  pauseTransition: () => void;
  
  /** Resume a paused transition */
  resumeTransition: () => void;
  
  /** Cancel the current transition */
  cancelTransition: () => void;
  
  /** Complete the current transition immediately */
  completeTransition: () => void;
  
  /** Register a new scene */
  registerScene: (scene: SceneConfig) => void;
  
  /** Register multiple scenes */
  registerScenes: (scenes: SceneConfig[]) => void;
  
  /** Register a transition */
  registerTransition: (transition: SceneTransition) => void;
  
  /** Register multiple transitions */
  registerTransitions: (transitions: SceneTransition[]) => void;
  
  /** Get the transition manager */
  getManager: () => SceneTransitionManager;
}

/**
 * Result object returned from useSceneTransition hook
 */
export interface SceneTransitionResult {
  /** Currently active scene ID */
  activeScene: string | null;
  
  /** Previously active scene ID */
  previousScene: string | null;
  
  /** Is transition in progress */
  isTransitioning: boolean;
  
  /** Is transition paused */
  isPaused: boolean;
  
  /** Current transition progress (0-1) */
  progress: number;
  
  /** Is reduced motion active */
  reducedMotion: boolean;
  
  /** Actions for controlling transitions */
  actions: SceneTransitionActions;
  
  /** Current transition state */
  transitionState: TransitionState;
}

/**
 * Hook for managing scene transitions
 * 
 * @param config Hook configuration
 * @returns Scene transition controller
 */
export function useSceneTransition(config: SceneTransitionConfig = {}): SceneTransitionResult {
  // Extract config
  const {
    initialScene,
    scenes = [],
    transitions = [],
    defaultDuration = 500,
    defaultEffect = TransitionEffect.FADE,
    defaultEasing = 'ease-in-out',
    defaultDepthEffect = SceneDepthEffect.NONE,
    defaultPreservation = ContentPreservation.NONE,
    handleHistory = false,
    autoStart = true,
    debug = false,
    containerRef,
    category = AnimationCategory.ATTENTION,
    onSceneChangeStart,
    onSceneChangeComplete,
    onSceneChangeFail
  } = config;
  
  // Reduced motion support
  const { prefersReducedMotion } = useReducedMotion();
  
  // State for component
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [previousScene, setPreviousScene] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transitionState, setTransitionState] = useState<TransitionState>({
    fromScene: null,
    toScene: null,
    inProgress: false,
    isPaused: false,
    isCompleted: false,
    startTime: null,
    progress: 0,
    transition: null,
    error: null
  });
  
  // Reference to transition manager
  const managerRef = useRef<SceneTransitionManager | null>(null);
  
  // Initialize transition manager
  const getManager = useCallback((): SceneTransitionManager => {
    if (!managerRef.current) {
      managerRef.current = new SceneTransitionManager({
        initialScene,
        scenes,
        transitions,
        defaultDuration,
        defaultEffect,
        defaultEasing,
        defaultDepthEffect,
        defaultPreservation,
        handleHistory,
        autoStart,
        debug,
        forceReducedMotion: prefersReducedMotion,
        containerElement: containerRef?.current,
        category,
        onSceneChangeStart: (fromId, toId) => {
          setIsTransitioning(true);
          setProgress(0);
          setPreviousScene(fromId);
          
          if (onSceneChangeStart) {
            onSceneChangeStart(fromId, toId);
          }
        },
        onSceneChangeComplete: (fromId, toId) => {
          setIsTransitioning(false);
          setProgress(1);
          setActiveScene(toId);
          setPreviousScene(fromId);
          
          if (onSceneChangeComplete) {
            onSceneChangeComplete(fromId, toId);
          }
        },
        onSceneChangeFail: (fromId, toId, error) => {
          setIsTransitioning(false);
          
          if (onSceneChangeFail) {
            onSceneChangeFail(fromId, toId, error);
          }
        },
        onTransitionProgress: (progress) => {
          setProgress(progress);
        }
      });
      
      // Update active scene from manager
      const activeSceneId = managerRef.current.getActiveSceneId();
      if (activeSceneId) {
        setActiveScene(activeSceneId);
      }
    }
    
    return managerRef.current;
  }, [
    initialScene,
    scenes,
    transitions,
    defaultDuration,
    defaultEffect,
    defaultEasing,
    defaultDepthEffect,
    defaultPreservation,
    handleHistory,
    autoStart,
    debug,
    prefersReducedMotion,
    containerRef,
    category,
    onSceneChangeStart,
    onSceneChangeComplete,
    onSceneChangeFail
  ]);
  
  // Initialize manager and set up event listeners
  useEffect(() => {
    const manager = getManager();
    
    // Transition state updates
    const updateState = () => {
      const state = manager.getTransitionState();
      setTransitionState(state);
      setIsTransitioning(state.inProgress);
      setIsPaused(state.isPaused);
      setProgress(state.progress);
      
      // Update active scene
      const activeSceneId = manager.getActiveSceneId();
      const previousSceneId = manager.getPreviousSceneId();
      
      if (activeSceneId !== activeScene) {
        setActiveScene(activeSceneId);
      }
      
      if (previousSceneId !== previousScene) {
        setPreviousScene(previousSceneId);
      }
    };
    
    // Add event listeners
    const onStart = () => {
      updateState();
    };
    
    const onComplete = () => {
      updateState();
    };
    
    const onProgress = () => {
      updateState();
    };
    
    manager.addEventListener('sceneChangeStart', onStart);
    manager.addEventListener('sceneChangeComplete', onComplete);
    manager.addEventListener('transitionProgress', onProgress);
    
    // Initial state update
    updateState();
    
    // Cleanup
    return () => {
      manager.removeEventListener('sceneChangeStart', onStart);
      manager.removeEventListener('sceneChangeComplete', onComplete);
      manager.removeEventListener('transitionProgress', onProgress);
    };
  }, []);
  
  // Update manager when reduced motion changes
  useEffect(() => {
    if (managerRef.current) {
      // Currently the SceneTransitionManager doesn't expose a direct method to update
      // reduced motion preferences after initialization, but we can pass it to transitions
    }
  }, [prefersReducedMotion]);
  
  // Update container ref if it changes
  useEffect(() => {
    if (managerRef.current && containerRef?.current) {
      managerRef.current.setContainer(containerRef.current);
    }
  }, [containerRef?.current]);
  
  /**
   * Change to a specific scene
   */
  const changeScene = useCallback((
    sceneId: string,
    transitionOverride?: Partial<SceneTransition>
  ): Promise<boolean> => {
    const manager = getManager();
    return manager.changeScene(sceneId, transitionOverride);
  }, [getManager]);
  
  /**
   * Navigate back to the previous scene
   */
  const back = useCallback((): Promise<boolean> => {
    const manager = getManager();
    return manager.back();
  }, [getManager]);
  
  /**
   * Navigate forward
   */
  const forward = useCallback((): Promise<boolean> => {
    const manager = getManager();
    return manager.forward();
  }, [getManager]);
  
  /**
   * Pause the current transition
   */
  const pauseTransition = useCallback((): void => {
    const manager = getManager();
    manager.pauseTransition();
    setIsPaused(true);
  }, [getManager]);
  
  /**
   * Resume a paused transition
   */
  const resumeTransition = useCallback((): void => {
    const manager = getManager();
    manager.resumeTransition();
    setIsPaused(false);
  }, [getManager]);
  
  /**
   * Cancel the current transition
   */
  const cancelTransition = useCallback((): void => {
    const manager = getManager();
    manager.cancelTransition();
    setIsTransitioning(false);
    setIsPaused(false);
  }, [getManager]);
  
  /**
   * Complete the current transition
   */
  const completeTransition = useCallback((): void => {
    const manager = getManager();
    manager.completeTransition();
    setIsTransitioning(false);
    setIsPaused(false);
    setProgress(1);
  }, [getManager]);
  
  /**
   * Register a new scene
   */
  const registerScene = useCallback((scene: SceneConfig): void => {
    const manager = getManager();
    manager.registerScene(scene);
  }, [getManager]);
  
  /**
   * Register multiple scenes
   */
  const registerScenes = useCallback((scenes: SceneConfig[]): void => {
    const manager = getManager();
    manager.registerScenes(scenes);
  }, [getManager]);
  
  /**
   * Register a transition
   */
  const registerTransition = useCallback((transition: SceneTransition): void => {
    const manager = getManager();
    manager.registerTransition(transition);
  }, [getManager]);
  
  /**
   * Register multiple transitions
   */
  const registerTransitions = useCallback((transitions: SceneTransition[]): void => {
    const manager = getManager();
    manager.registerTransitions(transitions);
  }, [getManager]);
  
  // Actions object
  const actions: SceneTransitionActions = {
    changeScene,
    back,
    forward,
    pauseTransition,
    resumeTransition,
    cancelTransition,
    completeTransition,
    registerScene,
    registerScenes,
    registerTransition,
    registerTransitions,
    getManager
  };
  
  return {
    activeScene,
    previousScene,
    isTransitioning,
    isPaused,
    progress,
    reducedMotion: prefersReducedMotion,
    actions,
    transitionState
  };
}

export default useSceneTransition;

// Re-export types
export {
  SceneTransitionManager,
  TransitionEffect,
  SceneType,
  SceneDepthEffect,
  ContentPreservation
};