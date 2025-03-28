/**
 * Animation Renderer Types
 * 
 * Type definitions for animation renderers in the Galileo Glass UI system.
 */

/**
 * Animation target (element to be animated)
 */
export type AnimationTarget = Element | null;

/**
 * Base options for all animations
 */
export interface AnimationOptions {
  /**
   * Duration of the animation in milliseconds
   */
  duration?: number;
  
  /**
   * Delay before starting the animation in milliseconds
   */
  delay?: number;
  
  /**
   * Delay after the animation completes in milliseconds
   */
  endDelay?: number;
  
  /**
   * Animation timing function/easing
   */
  easing?: string;
  
  /**
   * Whether the animation should start automatically
   */
  autoplay?: boolean;
  
  /**
   * Number of times to repeat the animation (Infinity for endless loop)
   */
  iterations?: number;
  
  /**
   * Starting point of the first iteration (0-1)
   */
  iterationStart?: number;
  
  /**
   * Callback when animation starts
   */
  onStart?: (event: AnimationPlaybackEvent) => void;
  
  /**
   * Callback when animation finishes
   */
  onFinish?: (event: AnimationPlaybackEvent) => void;
  
  /**
   * Callback when animation is canceled
   */
  onCancel?: (event: AnimationPlaybackEvent) => void;
}

/**
 * Keyframe effect definition
 * Can be an array of keyframes or a property-indexed keyframe object
 */
export type KeyframeEffect = Keyframe[] | Record<string, any>;

/**
 * Base interface for animation renderers
 */
export interface AnimationRenderer {
  /**
   * Animate a target element with keyframes
   */
  animate<T extends AnimationTarget>(
    target: T,
    keyframes: KeyframeEffect,
    options: AnimationOptions
  ): { id: string; animation: any };
  
  /**
   * Play an animation by ID
   */
  play(id: string): void;
  
  /**
   * Pause an animation by ID
   */
  pause(id: string): void;
  
  /**
   * Cancel an animation by ID
   */
  cancel(id: string): void;
  
  /**
   * Set playback rate of an animation
   */
  setPlaybackRate(id: string, rate: number): void;
  
  /**
   * Get current animation state
   */
  getState(id: string): string | null;
  
  /**
   * Clean up resources
   */
  dispose(): void;
}

/**
 * Performance metrics for animation renderers
 */
export interface AnimationPerformanceMetrics {
  /**
   * Frames per second
   */
  fps: number;
  
  /**
   * Animation delay in milliseconds
   */
  animationDelay: number;
  
  /**
   * CPU usage percentage
   */
  cpuUsage?: number;
  
  /**
   * Memory usage in bytes
   */
  memoryUsage?: number;
  
  /**
   * Whether the animation used GPU acceleration
   */
  gpuAccelerated: boolean;
  
  /**
   * Number of style recalculations
   */
  styleRecalculations?: number;
  
  /**
   * Number of layout operations
   */
  layoutOperations?: number;
  
  /**
   * Time for animation to start after requested
   */
  startupLatency: number;
}

/**
 * Renderer factory that creates the appropriate renderer based on device capabilities
 */
export interface AnimationRendererFactory {
  /**
   * Create a renderer based on device capabilities
   */
  createRenderer(options?: any): AnimationRenderer;
  
  /**
   * Get performance metrics for a renderer
   */
  getPerformanceMetrics(renderer: AnimationRenderer): AnimationPerformanceMetrics;
}