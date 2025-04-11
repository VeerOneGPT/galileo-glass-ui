/**
 * Animation Controller
 * 
 * Manages the lifecycle of animations, integrating state management, timing, and style processing.
 * Provides a central control point for animation operations.
 */

import { isFeatureEnabled } from '../../utils/featureFlags';
import { 
  AnimationState, 
  AnimationEvent, 
  createAnimationStateManager, 
  AnimationStateManager 
} from './AnimationStateManager';
import styleProcessor, { StyleProcessor, StyleUpdate } from './StyleProcessor';
import timingProvider, { TimingProvider } from './TimingProvider';

/**
 * Animation options
 */
export interface AnimationOptions {
  /**
   * Duration of the animation in milliseconds
   */
  duration: number;
  
  /**
   * Delay before starting the animation in milliseconds
   */
  delay?: number;
  
  /**
   * Easing function for the animation
   */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string;
  
  /**
   * Number of times to repeat the animation, or 'infinite'
   */
  iterations?: number | 'infinite';
  
  /**
   * Whether to alternate direction on iterations
   */
  alternate?: boolean;
  
  /**
   * Whether to fill forwards after completion
   */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

/**
 * Animation callback types
 */
export interface AnimationCallbacks {
  /**
   * Called when the animation starts
   */
  onStart?: () => void;
  
  /**
   * Called on each animation frame
   */
  onUpdate?: (progress: number, time: number) => void;
  
  /**
   * Called when the animation is paused
   */
  onPause?: () => void;
  
  /**
   * Called when the animation is resumed
   */
  onResume?: () => void;
  
  /**
   * Called when the animation completes
   */
  onComplete?: () => void;
  
  /**
   * Called when the animation is cancelled
   */
  onCancel?: () => void;
  
  /**
   * Called when an error occurs
   */
  onError?: (error: Error) => void;
}

/**
 * Animation controller interface
 */
export interface AnimationController {
  /**
   * Current animation state
   */
  readonly state: AnimationState;
  
  /**
   * Animation progress from 0 to 1
   */
  readonly progress: number;
  
  /**
   * Start the animation
   */
  start: () => void;
  
  /**
   * Pause the animation
   */
  pause: () => void;
  
  /**
   * Resume the animation
   */
  resume: () => void;
  
  /**
   * Cancel the animation
   */
  cancel: () => void;
  
  /**
   * Clean up resources
   */
  dispose: () => void;
  
  /**
   * Register a style update
   */
  registerStyleUpdate: (
    target: HTMLElement | string,
    property: string,
    startValue: string,
    endValue: string,
    priority?: string
  ) => void;
  
  /**
   * Register callbacks
   */
  setCallbacks: (callbacks: AnimationCallbacks) => void;
}

/**
 * Animation controller implementation
 */
export class StandardAnimationController implements AnimationController {
  /**
   * Animation state manager
   */
  private stateManager: AnimationStateManager;
  
  /**
   * Animation options
   */
  private options: AnimationOptions;
  
  /**
   * Animation callbacks
   */
  private callbacks: AnimationCallbacks = {};
  
  /**
   * Style updates to apply during animation
   */
  private styleUpdates: Array<{
    target: HTMLElement | string;
    property: string;
    startValue: string;
    endValue: string;
    priority?: string;
  }> = [];
  
  /**
   * Start time of the animation
   */
  private startTime = 0;
  
  /**
   * Current elapsed time of the animation
   */
  private elapsedTime = 0;
  
  /**
   * Animation frame ID
   */
  private animationFrameId?: number;
  
  /**
   * Delay timeout ID
   */
  private delayTimeoutId?: number;
  
  /**
   * Current progress from 0 to 1
   */
  private _progress = 0;
  
  /**
   * Style processor for applying style updates
   */
  private styleProcessor: StyleProcessor;
  
  /**
   * Timing provider for animation timing
   */
  private timingProvider: TimingProvider;
  
  /**
   * Constructor
   */
  constructor(
    options: AnimationOptions,
    styleProcessor?: StyleProcessor,
    timingProvider?: TimingProvider,
    stateManager?: AnimationStateManager
  ) {
    this.options = {
      ...options,
      delay: options.delay || 0,
      easing: options.easing || 'linear',
      iterations: options.iterations || 1,
      alternate: options.alternate || false,
      fillMode: options.fillMode || 'none',
    };
    
    this.stateManager = stateManager || createAnimationStateManager();
    this.styleProcessor = styleProcessor || globalThis.styleProcessor;
    this.timingProvider = timingProvider || globalThis.timingProvider;
    
    // Register state change handler
    this.stateManager.onStateChange((prevState, event) => {
      this.handleStateChange(prevState, event);
    });
  }
  
  /**
   * Get the current animation state
   */
  get state(): AnimationState {
    return this.stateManager.state;
  }
  
  /**
   * Get the current animation progress (0 to 1)
   */
  get progress(): number {
    return this._progress;
  }
  
  /**
   * Start the animation
   */
  start(): void {
    if (this.state !== AnimationState.IDLE && this.state !== AnimationState.COMPLETED) {
      console.warn('Animation can only be started from IDLE or COMPLETED state');
      return;
    }
    
    // Handle delay
    if (this.options.delay && this.options.delay > 0) {
      this.stateManager.transition(AnimationEvent.PREPARE);
      
      this.delayTimeoutId = this.timingProvider.setTimeout(() => {
        this.delayTimeoutId = undefined;
        this.startAnimation();
      }, this.options.delay);
    } else {
      this.startAnimation();
    }
  }
  
  /**
   * Start the actual animation after delay
   */
  private startAnimation(): void {
    this.startTime = this.timingProvider.now;
    this.elapsedTime = 0;
    this._progress = 0;
    
    // Transition to RUNNING state
    this.stateManager.transition(AnimationEvent.START);
    
    // Apply initial styles
    this.applyStyles(0);
    
    // Start animation loop
    this.scheduleNextFrame();
  }
  
  /**
   * Pause the animation
   */
  pause(): void {
    if (this.state !== AnimationState.RUNNING) {
      console.warn('Animation can only be paused when RUNNING');
      return;
    }
    
    this.stateManager.transition(AnimationEvent.PAUSE);
    
    // Cancel animation frame
    if (this.animationFrameId !== undefined) {
      this.timingProvider.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }
  
  /**
   * Resume the animation
   */
  resume(): void {
    if (this.state !== AnimationState.PAUSED) {
      console.warn('Animation can only be resumed when PAUSED');
      return;
    }
    
    this.stateManager.transition(AnimationEvent.RESUME);
    
    // Adjust start time to account for pause duration
    this.startTime = this.timingProvider.now - this.elapsedTime;
    
    // Resume animation loop
    this.scheduleNextFrame();
  }
  
  /**
   * Cancel the animation
   */
  cancel(): void {
    if (
      this.state === AnimationState.IDLE ||
      this.state === AnimationState.COMPLETED ||
      this.state === AnimationState.CANCELLED
    ) {
      return;
    }
    
    this.stateManager.transition(AnimationEvent.CANCEL);
    
    // Cancel animation frame
    if (this.animationFrameId !== undefined) {
      this.timingProvider.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    
    // Cancel delay timeout
    if (this.delayTimeoutId !== undefined) {
      this.timingProvider.clearTimeout(this.delayTimeoutId);
      this.delayTimeoutId = undefined;
    }
    
    // Apply appropriate styles based on fillMode
    if (this.options.fillMode === 'both' || this.options.fillMode === 'forwards') {
      // Keep final state
    } else {
      // Reset to initial state
      this.applyStyles(0);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    // Cancel any ongoing animation
    this.cancel();
    
    // Reset state manager
    this.stateManager.reset();
    
    // Clear references
    this.styleUpdates = [];
    this.callbacks = {};
  }
  
  /**
   * Register a style update
   */
  registerStyleUpdate(
    target: HTMLElement | string,
    property: string,
    startValue: string,
    endValue: string,
    priority?: string
  ): void {
    this.styleUpdates.push({
      target,
      property,
      startValue,
      endValue,
      priority,
    });
  }
  
  /**
   * Register callbacks
   */
  setCallbacks(callbacks: AnimationCallbacks): void {
    this.callbacks = { ...callbacks };
  }
  
  /**
   * Schedule the next animation frame
   */
  private scheduleNextFrame(): void {
    this.animationFrameId = this.timingProvider.requestAnimationFrame(time => {
      this.animationFrameId = undefined;
      this.animationFrame(time);
    });
  }
  
  /**
   * Process an animation frame
   */
  private animationFrame(timestamp: number): void {
    try {
      // Calculate elapsed time
      this.elapsedTime = timestamp - this.startTime;
      
      // Check if animation is complete
      const duration = this.options.duration;
      const iterations = this.options.iterations === 'infinite'
        ? Infinity
        : this.options.iterations || 1;
      
      const totalDuration = duration * iterations;
      
      if (this.elapsedTime >= totalDuration) {
        // Animation complete
        this._progress = 1;
        this.applyStyles(1);
        this.stateManager.transition(AnimationEvent.COMPLETE);
        return;
      }
      
      // Calculate current iteration and progress within that iteration
      const currentIteration = Math.min(
        Math.floor(this.elapsedTime / duration),
        iterations - 1
      );
      
      let iterationProgress = (this.elapsedTime % duration) / duration;
      
      // Apply easing
      if (this.options.easing && this.options.easing !== 'linear') {
        iterationProgress = this.applyEasing(iterationProgress);
      }
      
      // Apply direction alternation if needed
      if (this.options.alternate && currentIteration % 2 === 1) {
        iterationProgress = 1 - iterationProgress;
      }
      
      // Update progress
      this._progress = iterationProgress;
      
      // Apply styles
      this.applyStyles(iterationProgress);
      
      // Call update callback
      if (this.callbacks.onUpdate) {
        this.callbacks.onUpdate(iterationProgress, this.elapsedTime);
      }
      
      // Schedule next frame
      this.scheduleNextFrame();
    } catch (error) {
      this.stateManager.transition(AnimationEvent.ERROR);
      
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      } else {
        console.error('Error in animation frame:', error);
      }
    }
  }
  
  /**
   * Apply styles based on current progress
   */
  private applyStyles(progress: number): void {
    this.styleUpdates.forEach(update => {
      const interpolatedValue = this.interpolateValue(
        update.startValue,
        update.endValue,
        progress
      );
      
      this.styleProcessor.applyStyle({
        target: update.target,
        property: update.property,
        value: interpolatedValue,
        priority: update.priority,
      });
    });
  }
  
  /**
   * Interpolate between two values based on progress
   */
  private interpolateValue(startValue: string, endValue: string, progress: number): string {
    // Handle numeric values with units
    const numericRegex = /^([+-]?(?:\d*\.)?\d+)(.*)$/;
    const startMatch = startValue.match(numericRegex);
    const endMatch = endValue.match(numericRegex);
    
    if (startMatch && endMatch && startMatch[2] === endMatch[2]) {
      const startNum = parseFloat(startMatch[1]);
      const endNum = parseFloat(endMatch[1]);
      const unit = startMatch[2];
      
      // Calculate the interpolated value based on progress
      const interpolatedNum = startNum + (endNum - startNum) * progress;
      
      // Format the result with the appropriate precision
      return `${interpolatedNum.toFixed(2).replace(/\.?0+$/, '')}${unit}`;
    }
    
    // Handle colors (simple version, should be expanded)
    if (startValue.startsWith('#') && endValue.startsWith('#')) {
      // TODO: Implement color interpolation
      return progress < 0.5 ? startValue : endValue;
    }
    
    // Default: discrete interpolation
    return progress < 0.5 ? startValue : endValue;
  }
  
  /**
   * Apply easing function to progress
   */
  private applyEasing(progress: number): number {
    switch (this.options.easing) {
      case 'linear':
        return progress;
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return progress * (2 - progress);
      case 'ease-in-out':
        return progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
      default:
        return progress;
    }
  }
  
  /**
   * Handle state changes
   */
  private handleStateChange(prevState: AnimationState, event: AnimationEvent): void {
    switch (event) {
      case AnimationEvent.START:
        if (this.callbacks.onStart) {
          this.callbacks.onStart();
        }
        break;
      case AnimationEvent.PAUSE:
        if (this.callbacks.onPause) {
          this.callbacks.onPause();
        }
        break;
      case AnimationEvent.RESUME:
        if (this.callbacks.onResume) {
          this.callbacks.onResume();
        }
        break;
      case AnimationEvent.COMPLETE:
        if (this.callbacks.onComplete) {
          this.callbacks.onComplete();
        }
        break;
      case AnimationEvent.CANCEL:
        if (this.callbacks.onCancel) {
          this.callbacks.onCancel();
        }
        break;
    }
  }
}

/**
 * Create an animation controller
 */
export function createAnimationController(
  options: AnimationOptions,
  styleProcessor?: StyleProcessor,
  timingProvider?: TimingProvider
): AnimationController {
  return isFeatureEnabled('ANIMATION_NEW_ENGINE')
    ? new StandardAnimationController(options, styleProcessor, timingProvider)
    : new StandardAnimationController(options, styleProcessor, timingProvider);
}

export default { createAnimationController }; 