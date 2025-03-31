/**
 * useSpriteAnimation.ts
 * 
 * React hook for using sprite animations in Galileo Glass UI components.
 * Provides a simple interface for creating and controlling sprite animations.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory } from '../accessibility/MotionSensitivity';
import {
  SpriteAnimationManager,
  SpriteAnimation,
  SpriteFrame,
  Spritesheet,
  PlaybackMode,
  SpriteSheetManager,
  createAnimationFromSpritesheet,
  createFrameAnimation
} from './SpriteAnimation';

/**
 * Configuration for useSpriteAnimation hook
 */
export interface SpriteAnimationConfig {
  /** Initial animation to play */
  initialAnimation?: string;
  
  /** Whether to autoplay the initial animation */
  autoPlay?: boolean;
  
  /** Whether to preload all animation frames */
  preloadFrames?: boolean;
  
  /** Whether to auto-cleanup on unmount */
  autoCleanup?: boolean;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
  
  /** Container element ref */
  containerRef?: React.RefObject<HTMLElement>;
  
  /** CSS class to add to the animation container */
  className?: string;
  
  /** CSS styles to apply to the animation container */
  style?: React.CSSProperties;
  
  /** Callback when an animation starts */
  onAnimationStart?: (animationId: string) => void;
  
  /** Callback when an animation completes */
  onAnimationComplete?: (animationId: string) => void;
  
  /** Callback when an animation loops */
  onAnimationLoop?: (animationId: string) => void;
  
  /** Callback when frame changes */
  onFrameChange?: (animationId: string, frameIndex: number) => void;
}

/**
 * Actions for controlling sprite animations
 */
export interface SpriteAnimationActions {
  /** Play a specific animation */
  play: (animationId: string, resetPosition?: boolean) => boolean;
  
  /** Stop the current animation */
  stop: () => void;
  
  /** Pause the current animation */
  pause: () => void;
  
  /** Resume a paused animation */
  resume: () => void;
  
  /** Set animation speed (1.0 = normal) */
  setSpeed: (speed: number) => void;
  
  /** Go to a specific frame */
  gotoFrame: (frameIndex: number) => void;
  
  /** Register a new animation */
  registerAnimation: (animation: SpriteAnimation) => void;
  
  /** Register multiple animations */
  registerAnimations: (animations: SpriteAnimation[]) => void;
  
  /** Register a spritesheet */
  registerSpritesheet: (id: string, sheet: Spritesheet) => void;
  
  /** Create animation from a spritesheet */
  createFromSpritesheet: (
    id: string,
    name: string,
    spritesheetId: string,
    options?: {
      startFrame?: number;
      endFrame?: number;
      frameDuration?: number;
      playbackMode?: PlaybackMode;
      frameTransforms?: Record<number, SpriteFrame['transform']>;
      frameCallbacks?: Record<number, () => void>;
    }
  ) => SpriteAnimation | null;
  
  /** Create animation from individual frames */
  createFromFrames: (
    id: string,
    name: string,
    frameSources: string[],
    options?: {
      frameWidth?: number;
      frameHeight?: number;
      frameDuration?: number;
      playbackMode?: PlaybackMode;
      frameTransforms?: Record<number, SpriteFrame['transform']>;
      frameCallbacks?: Record<number, () => void>;
    }
  ) => SpriteAnimation;
}

/**
 * State for sprite animation hook
 */
export interface SpriteAnimationState {
  /** Current animation ID */
  currentAnimation: string | null;
  
  /** Current frame index */
  currentFrame: number;
  
  /** Whether an animation is playing */
  isPlaying: boolean;
  
  /** Whether the animation is paused */
  isPaused: boolean;
  
  /** Whether the animation is complete */
  isComplete: boolean;
  
  /** Total frames in current animation */
  totalFrames: number;
  
  /** Current animation speed */
  speed: number;
  
  /** Number of loops completed */
  loopCount: number;
  
  /** Whether the animation manager is ready */
  isReady: boolean;
  
  /** Reduced motion setting */
  reduceMotion: boolean;
}

/**
 * Hook for using sprite animations in React components
 * 
 * @param config Hook configuration
 * @returns Sprite animation state and actions
 */
export function useSpriteAnimation(
  config: SpriteAnimationConfig = {}
): [SpriteAnimationState, SpriteAnimationActions] {
  // Extract config
  const {
    initialAnimation,
    autoPlay = true,
    preloadFrames = true,
    autoCleanup = true,
    category = AnimationCategory.BACKGROUND,
    containerRef,
    onAnimationStart,
    onAnimationComplete,
    onAnimationLoop,
    onFrameChange
  } = config;
  
  // Accessibility
  const { prefersReducedMotion, isAnimationAllowed } = useReducedMotion();
  const allowAnimation = isAnimationAllowed(category);
  const reduceMotion = prefersReducedMotion && !allowAnimation;
  
  // Animation manager
  const managerRef = useRef<SpriteAnimationManager | null>(null);
  const containerElementRef = useRef<HTMLElement | null>(null);
  
  // Animation state
  const [state, setState] = useState<SpriteAnimationState>({
    currentAnimation: null,
    currentFrame: 0,
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    totalFrames: 0,
    speed: 1,
    loopCount: 0,
    isReady: false,
    reduceMotion
  });
  
  // Get or create animation manager
  const getManager = useCallback((): SpriteAnimationManager => {
    if (!managerRef.current) {
      managerRef.current = new SpriteAnimationManager({
        element: containerElementRef.current || undefined,
        preloadFrames,
        reduceMotion
      });
      
      // Set up callbacks
      managerRef.current.onFrameChange((frameIndex) => {
        setState(prev => ({
          ...prev,
          currentFrame: frameIndex
        }));
        
        if (onFrameChange && state.currentAnimation) {
          onFrameChange(state.currentAnimation, frameIndex);
        }
      });
      
      managerRef.current.onAnimationComplete((animation) => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          isComplete: true
        }));
        
        if (onAnimationComplete) {
          onAnimationComplete(animation.id);
        }
      });
      
      managerRef.current.onAnimationLoop((animation) => {
        setState(prev => ({
          ...prev,
          loopCount: prev.loopCount + 1
        }));
        
        if (onAnimationLoop) {
          onAnimationLoop(animation.id);
        }
      });
    }
    
    return managerRef.current;
  }, [
    state.currentAnimation,
    preloadFrames,
    reduceMotion,
    onFrameChange,
    onAnimationComplete,
    onAnimationLoop
  ]);
  
  // Initialize animation manager and container
  useEffect(() => {
    // Set up container element reference
    if (containerRef && containerRef.current) {
      containerElementRef.current = containerRef.current;
    }
    
    const manager = getManager();
    
    // Update container if it changed
    if (containerElementRef.current) {
      manager.setElement(containerElementRef.current);
    }
    
    // Update reduced motion setting
    manager.setReducedMotion(reduceMotion);
    
    setState(prev => ({
      ...prev,
      isReady: true,
      reduceMotion: reduceMotion
    }));
    
    // Play initial animation if requested
    if (initialAnimation && autoPlay) {
      manager.play(initialAnimation);
      
      setState(prev => ({
        ...prev,
        currentAnimation: initialAnimation,
        isPlaying: true,
        isPaused: false,
        isComplete: false
      }));
      
      if (onAnimationStart) {
        onAnimationStart(initialAnimation);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (autoCleanup && managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
      }
    };
  }, []);
  
  // Update reduced motion setting when it changes
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setReducedMotion(reduceMotion);
      
      setState(prev => ({
        ...prev,
        reduceMotion: reduceMotion
      }));
    }
  }, [reduceMotion]);
  
  /**
   * Play a specific animation
   */
  const play = useCallback((animationId: string, resetPosition = true): boolean => {
    const manager = getManager();
    const success = manager.play(animationId, resetPosition);
    
    if (success) {
      const animation = manager.getAnimation(animationId);
      
      setState(prev => ({
        ...prev,
        currentAnimation: animationId,
        isPlaying: true,
        isPaused: false,
        isComplete: false,
        totalFrames: animation?.frames.length || 0,
        currentFrame: resetPosition ? 0 : prev.currentFrame
      }));
      
      if (onAnimationStart) {
        onAnimationStart(animationId);
      }
    }
    
    return success;
  }, [getManager, onAnimationStart]);
  
  /**
   * Stop the current animation
   */
  const stop = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.stop();
      
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false
      }));
    }
  }, []);
  
  /**
   * Pause the current animation
   */
  const pause = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.pause();
      
      setState(prev => ({
        ...prev,
        isPaused: true
      }));
    }
  }, []);
  
  /**
   * Resume a paused animation
   */
  const resume = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.resume();
      
      setState(prev => ({
        ...prev,
        isPaused: false
      }));
    }
  }, []);
  
  /**
   * Set animation speed
   */
  const setSpeed = useCallback((speed: number) => {
    if (managerRef.current) {
      managerRef.current.setSpeed(speed);
      
      setState(prev => ({
        ...prev,
        speed
      }));
    }
  }, []);
  
  /**
   * Go to a specific frame
   */
  const gotoFrame = useCallback((frameIndex: number) => {
    if (managerRef.current) {
      managerRef.current.gotoFrame(frameIndex);
      
      setState(prev => ({
        ...prev,
        currentFrame: frameIndex
      }));
    }
  }, []);
  
  /**
   * Register a new animation
   */
  const registerAnimation = useCallback((animation: SpriteAnimation) => {
    const manager = getManager();
    manager.registerAnimation(animation);
  }, [getManager]);
  
  /**
   * Register multiple animations
   */
  const registerAnimations = useCallback((animations: SpriteAnimation[]) => {
    const manager = getManager();
    manager.registerAnimations(animations);
  }, [getManager]);
  
  /**
   * Register a spritesheet
   */
  const registerSpritesheet = useCallback((id: string, sheet: Spritesheet) => {
    SpriteSheetManager.getInstance().registerSheet(id, sheet);
  }, []);
  
  /**
   * Create animation from a spritesheet
   */
  const createFromSpritesheet = useCallback((
    id: string,
    name: string,
    spritesheetId: string,
    options?: {
      startFrame?: number;
      endFrame?: number;
      frameDuration?: number;
      playbackMode?: PlaybackMode;
      frameTransforms?: Record<number, SpriteFrame['transform']>;
      frameCallbacks?: Record<number, () => void>;
    }
  ): SpriteAnimation | null => {
    try {
      const sheet = SpriteSheetManager.getInstance().getSheet(spritesheetId);
      if (!sheet) {
        console.warn(`Spritesheet not found: ${spritesheetId}`);
        return null;
      }
      
      const animation = createAnimationFromSpritesheet(id, name, sheet, options);
      registerAnimation(animation);
      return animation;
    } catch (err) {
      console.error(`Error creating animation from spritesheet: ${err}`);
      return null;
    }
  }, [registerAnimation]);
  
  /**
   * Create animation from individual frames
   */
  const createFromFrames = useCallback((
    id: string,
    name: string,
    frameSources: string[],
    options?: {
      frameWidth?: number;
      frameHeight?: number;
      frameDuration?: number;
      playbackMode?: PlaybackMode;
      frameTransforms?: Record<number, SpriteFrame['transform']>;
      frameCallbacks?: Record<number, () => void>;
    }
  ): SpriteAnimation => {
    const animation = createFrameAnimation(id, name, frameSources, options);
    registerAnimation(animation);
    return animation;
  }, [registerAnimation]);
  
  // Compile actions
  const actions: SpriteAnimationActions = {
    play,
    stop,
    pause,
    resume,
    setSpeed,
    gotoFrame,
    registerAnimation,
    registerAnimations,
    registerSpritesheet,
    createFromSpritesheet,
    createFromFrames
  };
  
  return [state, actions];
}

export default useSpriteAnimation;

// Export types for easier consumption
export { PlaybackMode, SpriteSheetManager };
export type {
  SpriteAnimation,
  SpriteFrame,
  Spritesheet,
  SpriteAnimationManager
};