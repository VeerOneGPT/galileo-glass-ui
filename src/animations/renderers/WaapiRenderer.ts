/**
 * Web Animations API (WAAPI) Renderer
 * 
 * A high-performance animation renderer that uses the browser's native
 * Web Animations API for optimal performance and battery efficiency.
 */

import { AnimationRenderer, AnimationOptions, AnimationTarget, KeyframeEffect } from './types';

/**
 * Options specific to the WAAPI renderer
 */
export interface WaapiRendererOptions {
  /**
   * Whether to use composite operations for transforms
   * When true, uses 'add' composition for better performance with multiple animations
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
 * Web Animations API Renderer
 * Uses the browser's native Web Animations API for optimal performance
 */
export class WaapiRenderer implements AnimationRenderer {
  /**
   * Check if the browser supports the Web Animations API
   */
  public static isSupported(): boolean {
    return (
      typeof document !== 'undefined' &&
      typeof Element !== 'undefined' &&
      typeof Element.prototype.animate === 'function'
    );
  }
  
  private animations: Map<string, Animation> = new Map();
  private defaultOptions: WaapiRendererOptions = {
    useComposite: true,
    fill: 'both',
    playbackRate: 1.0,
    reverse: false
  };
  
  /**
   * Creates a new WAAPI renderer with the specified default options
   */
  constructor(defaultOptions?: Partial<WaapiRendererOptions>) {
    if (defaultOptions) {
      this.defaultOptions = { ...this.defaultOptions, ...defaultOptions };
    }
    
    // Log warning if WAAPI is not supported
    if (!WaapiRenderer.isSupported()) {
      console.warn(
        'Web Animations API is not supported in this browser. ' +
        'Animations will use the fallback renderer.'
      );
    }
  }
  
  /**
   * Animate an element using the Web Animations API
   */
  public animate<T extends AnimationTarget>(
    target: T,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: AnimationOptions & WaapiRendererOptions = {}
  ): { id: string; animation: Animation | null } {
    // Make sure target is valid
    if (!target || !keyframes) {
      return { id: '', animation: null };
    }
    
    // Generate animation ID
    const id = this.generateAnimationId();
    
    // Merge options
    const mergedOptions = {
      ...this.defaultOptions,
      ...options,
      useComposite: options.useComposite ?? this.defaultOptions.useComposite
    };
    
    // Prepare animation options
    const animationOptions: KeyframeAnimationOptions = {
      duration: options.duration || 1000,
      delay: options.delay || 0,
      endDelay: options.endDelay || 0,
      fill: mergedOptions.fill,
      iterationStart: options.iterationStart || 0,
      iterations: options.iterations || 1,
      easing: options.easing || 'linear',
      direction: mergedOptions.reverse ? 'reverse' : 'normal',
      composite: mergedOptions.useComposite ? 'add' : 'replace'
    };
    
    try {
      // Start the animation
      const animation = (target as Element).animate(keyframes, animationOptions);
      
      // Set playback rate
      if (mergedOptions.playbackRate !== 1.0) {
        animation.playbackRate = mergedOptions.playbackRate;
      }
      
      // Handle pause if specified
      if (options.autoplay === false) {
        animation.pause();
      }
      
      // Handle callbacks
      if (options.onStart) {
        animation.addEventListener('start', options.onStart);
      }
      
      if (options.onFinish) {
        animation.addEventListener('finish', options.onFinish);
      }
      
      if (options.onCancel) {
        animation.addEventListener('cancel', options.onCancel);
      }
      
      // Store the animation
      this.animations.set(id, animation);
      
      return { id, animation };
    } catch (error) {
      console.error('Error creating WAAPI animation:', error);
      return { id: '', animation: null };
    }
  }
  
  /**
   * Get active animation by ID
   */
  public getAnimation(id: string): Animation | undefined {
    return this.animations.get(id);
  }
  
  /**
   * Play an animation by ID
   */
  public play(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.play();
    }
  }
  
  /**
   * Pause an animation by ID
   */
  public pause(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.pause();
    }
  }
  
  /**
   * Cancel an animation by ID
   */
  public cancel(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.cancel();
      this.animations.delete(id);
    }
  }
  
  /**
   * Update an animation's playback rate
   */
  public setPlaybackRate(id: string, rate: number): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.playbackRate = rate;
    }
  }
  
  /**
   * Reverse an animation's direction
   */
  public reverse(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.reverse();
    }
  }
  
  /**
   * Update animation timing
   */
  public updateTiming(id: string, options: KeyframeEffectOptions): void {
    const animation = this.animations.get(id);
    if (animation && animation.effect) {
      // KeyframeEffect.updateTiming exists in newer browsers but TypeScript doesn't know about it
      // Use a type assertion to get around the TypeScript error
      const effect = animation.effect as any;
      if (typeof effect.updateTiming === 'function') {
        effect.updateTiming(options);
      }
    }
  }
  
  /**
   * Get current animation state
   */
  public getState(id: string): string | null {
    const animation = this.animations.get(id);
    return animation ? animation.playState : null;
  }
  
  /**
   * Get current animation time
   */
  public getCurrentTime(id: string): number | null {
    const animation = this.animations.get(id);
    if (!animation) return null;
    
    const time = animation.currentTime;
    // Handle null case first
    if (time === null) return null;
    
    // Handle various types of the CSSNumberish union
    if (typeof time === 'number') {
      // Direct number
      return time;
    } else {
      // CSSNumericValue - use type assertion to force TypeScript to accept our conversion
      // The assertion is safe because we know it's a CSSNumericValue with a numeric value
      return +(time as unknown as { valueOf(): number }).valueOf();
    }
  }
  
  /**
   * Set current animation time
   */
  public setCurrentTime(id: string, time: number): void {
    const animation = this.animations.get(id);
    if (animation) {
      // Use direct assignment - the browser's implementation accepts number
      // despite the TypeScript type being more restrictive
      animation.currentTime = time;
    }
  }
  
  /**
   * Add an event listener to an animation
   */
  public addEventListener(
    id: string,
    type: 'finish' | 'cancel' | 'start',
    callback: EventListenerOrEventListenerObject
  ): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.addEventListener(type, callback);
    }
  }
  
  /**
   * Remove an event listener from an animation
   */
  public removeEventListener(
    id: string,
    type: 'finish' | 'cancel' | 'start',
    callback: EventListenerOrEventListenerObject
  ): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.removeEventListener(type, callback);
    }
  }
  
  /**
   * Convert a keyframe effect to WAAPI format
   */
  public static convertKeyframeEffect(
    keyframeEffect: KeyframeEffect
  ): Keyframe[] | PropertyIndexedKeyframes {
    if (Array.isArray(keyframeEffect)) {
      // If it's already an array of keyframes, return as is
      return keyframeEffect as Keyframe[];
    }
    
    // Handle property indexed keyframes
    const convertedKeyframes: PropertyIndexedKeyframes = {};
    
    for (const property in keyframeEffect) {
      if (Object.prototype.hasOwnProperty.call(keyframeEffect, property)) {
        const value = keyframeEffect[property];
        if (Array.isArray(value)) {
          convertedKeyframes[property] = value;
        } else if (typeof value === 'object') {
          // Handle from/to/value syntax
          const { from, to, value: staticValue } = value as any;
          
          if (from !== undefined && to !== undefined) {
            convertedKeyframes[property] = [from, to];
          } else if (staticValue !== undefined) {
            convertedKeyframes[property] = staticValue;
          }
        }
      }
    }
    
    return convertedKeyframes;
  }
  
  /**
   * Clean up any resources
   */
  public dispose(): void {
    // Cancel all active animations
    this.animations.forEach(animation => {
      animation.cancel();
    });
    
    // Clear the animation map
    this.animations.clear();
  }
  
  /**
   * Generate a unique animation ID
   */
  private generateAnimationId(): string {
    return `waapi-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
  }
}

export default WaapiRenderer;