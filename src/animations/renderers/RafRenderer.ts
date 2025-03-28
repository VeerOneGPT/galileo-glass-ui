/**
 * RequestAnimationFrame (RAF) Renderer
 * 
 * A fallback animation renderer that uses requestAnimationFrame with
 * throttling for performance optimization.
 */

import { AnimationRenderer, AnimationOptions, AnimationTarget, KeyframeEffect } from './types';

/**
 * Options specific to the RAF renderer
 */
export interface RafRendererOptions {
  /**
   * Throttle rate in milliseconds (min time between frames)
   * Lower values = smoother animations but higher CPU usage
   * Higher values = less CPU usage but choppier animations
   */
  throttleRate?: number;
  
  /**
   * Whether to interpolate between frames when throttling
   * When true, calculates intermediate states for smoother motion
   */
  interpolate?: boolean;
  
  /**
   * Whether to use composite operations for transforms
   */
  useComposite?: boolean;
  
  /**
   * Fill mode for the animation
   */
  fill?: FillMode;
  
  /**
   * Animation playback rate (1.0 = normal speed)
   */
  playbackRate?: number;
  
  /**
   * Whether the animation should play backwards
   */
  reverse?: boolean;
}

/**
 * Animation fill mode
 */
export type FillMode = 'none' | 'forwards' | 'backwards' | 'both' | 'auto';

/**
 * Animation state
 */
export type AnimationState = 'idle' | 'running' | 'paused' | 'finished';

/**
 * Animation created by RafRenderer
 */
interface RafAnimation {
  /**
   * Animation ID
   */
  id: string;
  
  /**
   * Target element
   */
  target: AnimationTarget;
  
  /**
   * Animation keyframes
   */
  keyframes: Keyframe[];
  
  /**
   * Animation options
   */
  options: Required<AnimationOptions & RafRendererOptions>;
  
  /**
   * Current animation state
   */
  state: AnimationState;
  
  /**
   * Animation start time
   */
  startTime: number;
  
  /**
   * Current animation time (ms)
   */
  currentTime: number;
  
  /**
   * requestAnimationFrame ID for cancellation
   */
  rafId: number | null;
  
  /**
   * Last frame timestamp
   */
  lastFrameTime: number;
  
  /**
   * Whether the animation is complete
   */
  isComplete: boolean;
  
  /**
   * Event listeners
   */
  listeners: {
    start: Array<(event: AnimationEvent) => void>;
    finish: Array<(event: AnimationEvent) => void>;
    cancel: Array<(event: AnimationEvent) => void>;
  }
}

/**
 * Animation event
 */
export interface AnimationEvent {
  type: 'start' | 'finish' | 'cancel';
  currentTime: number;
  target: AnimationTarget;
  timelineTime?: number;
  bubbles?: boolean;
  cancelBubble?: boolean;
  cancelable?: boolean;
}

// Add this after the AnimationEvent interface definition
export type AnimationPlaybackEvent = AnimationEvent;

/**
 * RequestAnimationFrame Renderer
 * Uses requestAnimationFrame with throttling for optimal performance
 */
export class RafRenderer implements AnimationRenderer {
  private animations: Map<string, RafAnimation> = new Map();
  private globalRafId: number | null = null;
  private isRunning = false;
  
  private defaultOptions: Required<RafRendererOptions> = {
    throttleRate: 16.67, // ~60fps
    interpolate: true,
    useComposite: true,
    fill: 'both',
    playbackRate: 1.0,
    reverse: false
  };
  
  /**
   * Creates a new RAF renderer with the specified default options
   */
  constructor(defaultOptions?: Partial<RafRendererOptions>) {
    if (defaultOptions) {
      this.defaultOptions = { ...this.defaultOptions, ...defaultOptions };
    }
  }
  
  /**
   * Animate an element using requestAnimationFrame
   */
  public animate<T extends AnimationTarget>(
    target: T,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: AnimationOptions & RafRendererOptions = {}
  ): { id: string; animation: any } {
    // Make sure target is valid
    if (!target || !keyframes) {
      return { id: '', animation: null };
    }
    
    // Convert keyframes to array format if necessary
    const normalizedKeyframes = this.normalizeKeyframes(keyframes);
    
    // Generate animation ID
    const id = this.generateAnimationId();
    
    // Merge options with defaults
    const mergedOptions: Required<AnimationOptions & RafRendererOptions> = {
      // Default animation options
      duration: 1000,
      delay: 0,
      endDelay: 0,
      iterationStart: 0,
      iterations: 1,
      easing: 'linear',
      autoplay: true,
      onStart: undefined,
      onFinish: undefined,
      onCancel: undefined,
      
      // Default RAF options
      ...this.defaultOptions,
      
      // User options override defaults
      ...options
    };
    
    // Create the animation
    const animation: RafAnimation = {
      id,
      target,
      keyframes: normalizedKeyframes,
      options: mergedOptions,
      state: 'idle',
      startTime: performance.now() + mergedOptions.delay,
      currentTime: 0,
      rafId: null,
      lastFrameTime: 0,
      isComplete: false,
      listeners: {
        start: [],
        finish: [],
        cancel: []
      }
    };
    
    // Add event listeners
    if (mergedOptions.onStart) {
      animation.listeners.start.push((event: AnimationEvent) => {
        if (mergedOptions.onStart) mergedOptions.onStart(event as any);
      });
    }
    
    if (mergedOptions.onFinish) {
      animation.listeners.finish.push((event: AnimationEvent) => {
        if (mergedOptions.onFinish) mergedOptions.onFinish(event as any);
      });
    }
    
    if (mergedOptions.onCancel) {
      animation.listeners.cancel.push((event: AnimationEvent) => {
        if (mergedOptions.onCancel) mergedOptions.onCancel(event as any);
      });
    }
    
    // Store the animation
    this.animations.set(id, animation);
    
    // Start the animation if autoplay is true
    if (mergedOptions.autoplay) {
      this.play(id);
    } else {
      animation.state = 'paused';
    }
    
    // Start the global animation loop if not already running
    this.startAnimationLoop();
    
    return { id, animation };
  }
  
  /**
   * Get active animation by ID
   */
  public getAnimation(id: string): RafAnimation | undefined {
    return this.animations.get(id);
  }
  
  /**
   * Play an animation by ID
   */
  public play(id: string): void {
    const animation = this.animations.get(id);
    if (!animation) return;
    
    // Only play if not already running
    if (animation.state !== 'running') {
      // If the animation was paused, adjust the start time
      if (animation.state === 'paused') {
        const now = performance.now();
        animation.startTime = now - animation.currentTime;
      }
      
      animation.state = 'running';
      
      // Trigger start event if this is the first play
      if (animation.currentTime === 0) {
        this.triggerEvent(animation, 'start');
      }
      
      // Ensure animation loop is running
      this.startAnimationLoop();
    }
  }
  
  /**
   * Pause an animation by ID
   */
  public pause(id: string): void {
    const animation = this.animations.get(id);
    if (!animation || animation.state !== 'running') return;
    
    animation.state = 'paused';
  }
  
  /**
   * Cancel an animation by ID
   */
  public cancel(id: string): void {
    const animation = this.animations.get(id);
    if (!animation) return;
    
    // Trigger cancel event
    this.triggerEvent(animation, 'cancel');
    
    // Remove the animation
    this.animations.delete(id);
    
    // Stop the animation loop if no animations are left
    if (this.animations.size === 0) {
      this.stopAnimationLoop();
    }
  }
  
  /**
   * Update an animation's playback rate
   */
  public setPlaybackRate(id: string, rate: number): void {
    const animation = this.animations.get(id);
    if (!animation) return;
    
    // Adjust start time to maintain current position with new rate
    const now = performance.now();
    const elapsed = now - animation.startTime;
    const newElapsed = elapsed * (animation.options.playbackRate / rate);
    
    animation.startTime = now - newElapsed;
    animation.options.playbackRate = rate;
  }
  
  /**
   * Reverse an animation's direction
   */
  public reverse(id: string): void {
    const animation = this.animations.get(id);
    if (!animation) return;
    
    // Toggle the reverse flag
    animation.options.reverse = !animation.options.reverse;
    
    // Adjust timing to maintain position
    const totalDuration = animation.options.duration * animation.options.iterations;
    const adjustedTime = totalDuration - animation.currentTime;
    
    animation.currentTime = adjustedTime;
    animation.startTime = performance.now() - adjustedTime;
  }
  
  /**
   * Update animation timing
   */
  public updateTiming(id: string, options: Partial<AnimationOptions>): void {
    const animation = this.animations.get(id);
    if (!animation) return;
    
    // Update timing options
    animation.options = { ...animation.options, ...options };
    
    // Adjust start time to maintain current position
    if (animation.state === 'running') {
      animation.startTime = performance.now() - animation.currentTime;
    }
  }
  
  /**
   * Get current animation state
   */
  public getState(id: string): string | null {
    const animation = this.animations.get(id);
    return animation ? animation.state : null;
  }
  
  /**
   * Get current animation time
   */
  public getCurrentTime(id: string): number | null {
    const animation = this.animations.get(id);
    return animation ? animation.currentTime : null;
  }
  
  /**
   * Set current animation time
   */
  public setCurrentTime(id: string, time: number): void {
    const animation = this.animations.get(id);
    if (!animation) return;
    
    animation.currentTime = time;
    animation.startTime = performance.now() - time;
    
    // Apply the current time immediately
    this.updateAnimationState(animation);
  }
  
  /**
   * Add an event listener to an animation
   */
  public addEventListener(
    id: string,
    type: 'finish' | 'cancel' | 'start',
    callback: (event: AnimationEvent) => void
  ): void {
    const animation = this.animations.get(id);
    if (!animation || !animation.listeners[type]) return;
    
    animation.listeners[type].push(callback);
  }
  
  /**
   * Remove an event listener from an animation
   */
  public removeEventListener(
    id: string,
    type: 'finish' | 'cancel' | 'start',
    callback: (event: AnimationEvent) => void
  ): void {
    const animation = this.animations.get(id);
    if (!animation || !animation.listeners[type]) return;
    
    const index = animation.listeners[type].indexOf(callback);
    if (index !== -1) {
      animation.listeners[type].splice(index, 1);
    }
  }
  
  /**
   * Clean up any resources
   */
  public dispose(): void {
    // Cancel all active animations
    this.animations.forEach((animation, id) => {
      this.cancel(id);
    });
    
    // Stop the animation loop
    this.stopAnimationLoop();
    
    // Clear the animation map
    this.animations.clear();
  }
  
  /**
   * Start the global animation loop
   */
  private startAnimationLoop(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.globalRafId = requestAnimationFrame(this.animationLoop.bind(this));
  }
  
  /**
   * Stop the global animation loop
   */
  private stopAnimationLoop(): void {
    if (this.globalRafId !== null) {
      cancelAnimationFrame(this.globalRafId);
      this.globalRafId = null;
    }
    
    this.isRunning = false;
  }
  
  /**
   * Main animation loop (runs on requestAnimationFrame)
   */
  private animationLoop(timestamp: number): void {
    // Continue the loop
    this.globalRafId = requestAnimationFrame(this.animationLoop.bind(this));
    
    // No animations to process
    if (this.animations.size === 0) {
      this.stopAnimationLoop();
      return;
    }
    
    // Update all active animations
    this.animations.forEach(animation => {
      // Skip paused animations
      if (animation.state !== 'running') return;
      
      // Apply throttling if needed
      if (
        animation.lastFrameTime > 0 && 
        timestamp - animation.lastFrameTime < this.defaultOptions.throttleRate
      ) {
        return;
      }
      
      // Update the animation state
      this.updateAnimationState(animation, timestamp);
      
      // Update the last frame time
      animation.lastFrameTime = timestamp;
    });
  }
  
  /**
   * Update animation state for a specific animation
   */
  private updateAnimationState(animation: RafAnimation, timestamp: number = performance.now()): void {
    // Skip if animation is not running or is already complete
    if (animation.state !== 'running' && animation.state !== 'paused') return;
    if (animation.isComplete) return;
    
    // Calculate elapsed time
    let elapsed = animation.state === 'running' 
      ? (timestamp - animation.startTime) * animation.options.playbackRate
      : animation.currentTime;
    
    // Handle delay
    if (elapsed < 0) {
      // Still in delay period
      return;
    }
    
    // Calculate progress
    const totalDuration = animation.options.duration * animation.options.iterations;
    const isComplete = elapsed >= totalDuration + animation.options.endDelay;
    
    // Handle completion
    if (isComplete && !animation.isComplete) {
      // Calculate final time
      elapsed = totalDuration;
      
      // Apply final state based on fill mode
      if (animation.options.fill === 'forwards' || animation.options.fill === 'both') {
        this.applyKeyframe(animation, elapsed);
      }
      
      // Mark as complete
      animation.isComplete = true;
      animation.state = 'finished';
      
      // Trigger finish event
      this.triggerEvent(animation, 'finish');
      
      return;
    }
    
    // Handle normal animation frame
    animation.currentTime = elapsed;
    this.applyKeyframe(animation, elapsed);
  }
  
  /**
   * Apply the appropriate keyframe state for a given time
   */
  private applyKeyframe(animation: RafAnimation, time: number): void {
    if (!animation.target) return;
    
    // Calculate iteration and progress within iteration
    const iterationTime = time % animation.options.duration;
    const iterationProgress = iterationTime / animation.options.duration;
    
    // Calculate the iteration number
    const iteration = Math.floor(time / animation.options.duration);
    
    // Account for direction
    let effectiveProgress = iterationProgress;
    
    // Handle reverse
    if (animation.options.reverse) {
      effectiveProgress = 1 - effectiveProgress;
    }
    
    // Apply easing
    const easedProgress = this.applyEasing(effectiveProgress, animation.options.easing);
    
    // Interpolate between keyframes
    const state = this.interpolateKeyframes(animation.keyframes, easedProgress);
    
    // Apply state to the element
    this.applyStyles(animation.target, state);
  }
  
  /**
   * Apply easing function to progress
   */
  private applyEasing(progress: number, easing: string): number {
    // Basic easing functions
    switch (easing) {
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
        // Handle cubic-bezier
        if (easing.startsWith('cubic-bezier')) {
          // Simple cubic-bezier approximation (not accurate, but works for demos)
          return progress < 0.5 
            ? 2 * progress * progress 
            : -1 + (4 - 2 * progress) * progress;
        }
        
        // Default to linear
        return progress;
    }
  }
  
  /**
   * Interpolate between keyframes at a specific progress point
   */
  private interpolateKeyframes(keyframes: Keyframe[], progress: number): Keyframe {
    // Handle edge cases
    if (keyframes.length === 0) return {};
    if (keyframes.length === 1) return keyframes[0];
    
    // Find the keyframes to interpolate between
    const totalDuration = 1.0; // Normalized to 1
    const segmentDuration = totalDuration / (keyframes.length - 1);
    
    const segmentIndex = Math.min(
      Math.floor(progress / segmentDuration),
      keyframes.length - 2
    );
    
    const startKeyframe = keyframes[segmentIndex];
    const endKeyframe = keyframes[segmentIndex + 1];
    
    // Calculate progress within this segment
    const segmentProgress = (progress - (segmentIndex * segmentDuration)) / segmentDuration;
    
    // Interpolate all properties
    const result: Record<string, any> = {};
    
    // Merge all properties from both keyframes
    const allProperties = new Set([
      ...Object.keys(startKeyframe),
      ...Object.keys(endKeyframe)
    ]);
    
    allProperties.forEach(prop => {
      // Skip non-style properties
      if (prop === 'offset' || prop === 'easing') return;
      
      const startValue = startKeyframe[prop];
      const endValue = endKeyframe[prop];
      
      // Handle missing values
      if (startValue === undefined) {
        result[prop] = endValue;
        return;
      }
      
      if (endValue === undefined) {
        result[prop] = startValue;
        return;
      }
      
      // Interpolate values
      result[prop] = this.interpolateValue(startValue, endValue, segmentProgress);
    });
    
    return result;
  }
  
  /**
   * Interpolate between two values
   */
  private interpolateValue(start: any, end: any, progress: number): any {
    // Handle numbers
    if (typeof start === 'number' && typeof end === 'number') {
      return start + (end - start) * progress;
    }
    
    // Handle colors
    if (
      (typeof start === 'string' && start.startsWith('#')) ||
      (typeof start === 'string' && start.startsWith('rgb'))
    ) {
      return this.interpolateColor(start, end, progress);
    }
    
    // Handle strings with numeric values (e.g., '10px', '2.5em')
    if (
      typeof start === 'string' && 
      typeof end === 'string' && 
      start.match(/^[0-9.-]+[a-z%]*$/) && 
      end.match(/^[0-9.-]+[a-z%]*$/)
    ) {
      const startMatch = start.match(/^([0-9.-]+)([a-z%]*)$/);
      const endMatch = end.match(/^([0-9.-]+)([a-z%]*)$/);
      
      if (startMatch && endMatch && startMatch[2] === endMatch[2]) {
        const startNum = parseFloat(startMatch[1]);
        const endNum = parseFloat(endMatch[1]);
        const unit = startMatch[2];
        
        return (startNum + (endNum - startNum) * progress) + unit;
      }
    }
    
    // Handle transform values
    if (
      typeof start === 'string' && 
      typeof end === 'string' && 
      (start.includes('translate') || start.includes('rotate') || start.includes('scale'))
    ) {
      return this.interpolateTransform(start, end, progress);
    }
    
    // Default: no interpolation, snap at 50% progress
    return progress < 0.5 ? start : end;
  }
  
  /**
   * Interpolate between two colors
   */
  private interpolateColor(start: string, end: string, progress: number): string {
    // Convert to RGB format
    const startRGB = this.parseColor(start);
    const endRGB = this.parseColor(end);
    
    // Interpolate each channel
    const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * progress);
    const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * progress);
    const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * progress);
    const a = startRGB.a + (endRGB.a - startRGB.a) * progress;
    
    // Return as rgba
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  
  /**
   * Parse a color string into RGB components
   */
  private parseColor(color: string): { r: number; g: number; b: number; a: number } {
    // Create a temporary element
    const tempEl = document.createElement('div');
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    
    // Get computed style
    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    
    // Parse RGB values
    const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
    
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: match[4] ? parseFloat(match[4]) : 1
      };
    }
    
    // Default to black if parsing fails
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  
  /**
   * Interpolate between two transform values
   */
  private interpolateTransform(start: string, end: string, progress: number): string {
    // Parse transform functions
    const startFuncs = this.parseTransform(start);
    const endFuncs = this.parseTransform(end);
    
    // Merge transform functions
    const allFuncs = new Set([
      ...Object.keys(startFuncs),
      ...Object.keys(endFuncs)
    ]);
    
    const result: string[] = [];
    
    allFuncs.forEach(func => {
      if (startFuncs[func] && endFuncs[func]) {
        // Both have this function, interpolate
        const startValues = startFuncs[func].values;
        const endValues = endFuncs[func].values;
        const unit = startFuncs[func].unit;
        
        // Ensure same number of values
        if (startValues.length === endValues.length) {
          const interpolatedValues = startValues.map((start, i) => {
            return start + (endValues[i] - start) * progress;
          });
          
          result.push(`${func}(${interpolatedValues.join(', ')}${unit})`);
        } else {
          // Different number of values, can't interpolate
          result.push(progress < 0.5 ? startFuncs[func].original : endFuncs[func].original);
        }
      } else {
        // Only one has this function
        const transformFunc = startFuncs[func] || endFuncs[func];
        result.push(transformFunc.original);
      }
    });
    
    return result.join(' ');
  }
  
  /**
   * Parse a transform string into component functions
   */
  private parseTransform(transform: string): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Extract each transform function
    const regex = /([\w]+)\(([^)]+)\)/g;
    let match;
    
    while ((match = regex.exec(transform)) !== null) {
      const func = match[1];
      const args = match[2];
      
      // Parse values and units
      let values: number[] = [];
      let unit = '';
      
      if (func === 'rotate') {
        // Handle rotation
        const rotMatch = args.match(/([0-9.-]+)(deg|rad|grad|turn)/);
        if (rotMatch) {
          values = [parseFloat(rotMatch[1])];
          unit = rotMatch[2];
        }
      } else {
        // Handle other transforms
        const valMatches = args.match(/([0-9.-]+)([a-z%]*)/g);
        if (valMatches) {
          // Extract all values and check for consistent units
          const parsed = valMatches.map(v => {
            const parts = v.match(/([0-9.-]+)([a-z%]*)/);
            return parts ? { value: parseFloat(parts[1]), unit: parts[2] } : null;
          }).filter(v => v !== null) as { value: number; unit: string }[];
          
          // Extract values and check for consistent units
          values = parsed.map(p => p.value);
          unit = parsed[0]?.unit || '';
        }
      }
      
      result[func] = {
        original: `${func}(${args})`,
        values,
        unit
      };
    }
    
    return result;
  }
  
  /**
   * Apply styles to an element
   */
  private applyStyles(element: Element, styles: Record<string, any>): void {
    if (!element || !(element instanceof HTMLElement)) return;
    
    Object.keys(styles).forEach(prop => {
      try {
        (element as any).style[prop] = styles[prop];
      } catch (error) {
        console.error(`Error setting style ${prop}:`, error);
      }
    });
  }
  
  /**
   * Normalize keyframes to array format
   */
  private normalizeKeyframes(keyframes: Keyframe[] | PropertyIndexedKeyframes): Keyframe[] {
    // If it's already an array, return it
    if (Array.isArray(keyframes)) {
      return keyframes;
    }
    
    // Convert property-indexed keyframes to array format
    const properties = Object.keys(keyframes);
    
    // Find the property with the most values to determine keyframe count
    let maxLength = 0;
    properties.forEach(prop => {
      const value = (keyframes as PropertyIndexedKeyframes)[prop];
      if (Array.isArray(value)) {
        maxLength = Math.max(maxLength, value.length);
      }
    });
    
    if (maxLength === 0) {
      // No arrays found, assume single keyframe
      return [keyframes as Keyframe];
    }
    
    // Create array of keyframes
    const result: Keyframe[] = Array(maxLength).fill(0).map(() => ({}));
    
    properties.forEach(prop => {
      const value = (keyframes as PropertyIndexedKeyframes)[prop];
      
      if (Array.isArray(value)) {
        // Distribute values across keyframes
        value.forEach((val, i) => {
          if (i < maxLength) {
            result[i][prop] = val;
          }
        });
      } else {
        // Apply same value to all keyframes
        result.forEach(keyframe => {
          keyframe[prop] = value;
        });
      }
    });
    
    return result;
  }
  
  /**
   * Trigger an event for an animation
   */
  private triggerEvent(animation: RafAnimation, eventType: 'start' | 'finish' | 'cancel'): void {
    const event: AnimationEvent = {
      type: eventType,
      currentTime: animation.currentTime,
      target: animation.target,
      timelineTime: animation.currentTime,
      bubbles: false,
      cancelBubble: false,
      cancelable: false
    };
    
    animation.listeners[eventType].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in ${eventType} event listener:`, error);
      }
    });
  }
  
  /**
   * Generate a unique animation ID
   */
  private generateAnimationId(): string {
    return `raf-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
  }
}

export default RafRenderer;