/**
 * SpriteAnimation.ts
 * 
 * A system for creating and managing sprite-based animations for game-like
 * UI elements in Galileo Glass. Supports frame-based animations, spritesheets,
 * and advanced sprite transformations.
 */

import { useReducedMotion } from '../accessibility/useReducedMotion';
import { AnimationCategory } from '../accessibility/MotionSensitivity';

/**
 * Sprite animation playback mode
 */
export enum PlaybackMode {
  /** Play animation once and stop on the last frame */
  ONCE = 'once',
  
  /** Loop animation continuously */
  LOOP = 'loop',
  
  /** Play animation once then reverse back to start */
  PING_PONG = 'ping-pong',
  
  /** Play animation once, then hold on the last frame */
  HOLD = 'hold'
}

/**
 * Animation frame definition
 */
export interface SpriteFrame {
  /** Frame identifier */
  id: string;
  
  /** Source image URL */
  src: string;
  
  /** X position in spritesheet (for spritesheet animations) */
  x?: number;
  
  /** Y position in spritesheet (for spritesheet animations) */
  y?: number;
  
  /** Width of the frame */
  width: number;
  
  /** Height of the frame */
  height: number;
  
  /** Duration to display this frame in milliseconds */
  duration: number;
  
  /** Function to call when this frame is displayed */
  onDisplay?: () => void;
  
  /** Transformation for this frame (translate, scale, rotate) */
  transform?: {
    /** Horizontal translation relative to base position */
    translateX?: number;
    
    /** Vertical translation relative to base position */
    translateY?: number;
    
    /** Scale factor (1.0 = original size) */
    scale?: number;
    
    /** Rotation in degrees */
    rotate?: number;
    
    /** Origin X for transformations (0-1) */
    originX?: number;
    
    /** Origin Y for transformations (0-1) */
    originY?: number;
  };
  
  /** Additional CSS properties to apply to this frame */
  style?: Record<string, string | number>;
  
  /** Custom hitbox for this frame (useful for combat animations) */
  hitbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  /** Metadata for the frame (custom data for game logic) */
  metadata?: Record<string, any>;
}

/**
 * Spritesheet definition for optimized loading
 */
export interface Spritesheet {
  /** Source image URL */
  src: string;
  
  /** Width of each frame in pixels */
  frameWidth: number;
  
  /** Height of each frame in pixels */
  frameHeight: number;
  
  /** Number of frames horizontally */
  framesPerRow: number;
  
  /** Total number of frames in the sheet */
  frameCount: number;
  
  /** Margin between frames in pixels */
  margin?: number;
  
  /** Padding within each frame in pixels */
  padding?: number;
  
  /** Whether the spritesheet is already loaded */
  isLoaded?: boolean;
  
  /** The actual Image object once loaded */
  image?: HTMLImageElement;
}

/**
 * Animation sequence definition
 */
export interface SpriteAnimation {
  /** Animation identifier */
  id: string;
  
  /** Animation name */
  name: string;
  
  /** Array of frame definitions */
  frames: SpriteFrame[];
  
  /** Default frame duration if not specified for each frame */
  defaultFrameDuration?: number;
  
  /** Playback mode */
  playbackMode?: PlaybackMode;
  
  /** Playback speed multiplier (1.0 = normal speed) */
  speed?: number;
  
  /** Function to call when animation starts */
  onStart?: () => void;
  
  /** Function to call when animation loops */
  onLoop?: () => void;
  
  /** Function to call when animation completes */
  onComplete?: () => void;
  
  /** Function to call on each frame change */
  onFrameChange?: (currentFrame: SpriteFrame, nextFrame: SpriteFrame) => void;
  
  /** If true, animation will play even in reduced motion mode */
  ignoreReducedMotion?: boolean;
  
  /** Alternative animation to use in reduced motion mode */
  reducedMotionAlternative?: SpriteAnimation;
  
  /** Animation category for accessibility */
  category?: AnimationCategory;
}

/**
 * Animation state for tracking playback
 */
export interface AnimationState {
  /** Current animation being played */
  currentAnimation?: SpriteAnimation;
  
  /** Index of the current frame */
  currentFrameIndex: number;
  
  /** Timestamp when the current frame started */
  frameStartTime: number;
  
  /** Whether the animation is playing */
  isPlaying: boolean;
  
  /** Whether the animation is paused */
  isPaused: boolean;
  
  /** Current playback direction (1 = forward, -1 = backward) */
  direction: 1 | -1;
  
  /** Current playback speed */
  speed: number;
  
  /** Number of times the animation has looped */
  loopCount: number;
  
  /** Whether the animation has completed */
  isComplete: boolean;
}

/**
 * Sprite Sheet Manager for efficient sprite loading and access
 */
export class SpriteSheetManager {
  private static instance: SpriteSheetManager;
  private sheets: Map<string, Spritesheet> = new Map();
  private loadCallbacks: Map<string, ((success: boolean) => void)[]> = new Map();
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): SpriteSheetManager {
    if (!SpriteSheetManager.instance) {
      SpriteSheetManager.instance = new SpriteSheetManager();
    }
    return SpriteSheetManager.instance;
  }
  
  /**
   * Register a new spritesheet
   */
  public registerSheet(id: string, sheet: Spritesheet): void {
    this.sheets.set(id, {
      ...sheet,
      isLoaded: false
    });
  }
  
  /**
   * Load a spritesheet
   */
  public loadSheet(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const sheet = this.sheets.get(id);
      if (!sheet) {
        resolve(false);
        return;
      }
      
      if (sheet.isLoaded && sheet.image) {
        resolve(true);
        return;
      }
      
      // Add callback
      if (!this.loadCallbacks.has(id)) {
        this.loadCallbacks.set(id, []);
      }
      this.loadCallbacks.get(id)?.push(resolve);
      
      // Start loading if this is the first request
      if (this.loadCallbacks.get(id)?.length === 1) {
        const img = new Image();
        img.onload = () => {
          const updatedSheet = { ...sheet, isLoaded: true, image: img };
          this.sheets.set(id, updatedSheet);
          
          // Call all waiting callbacks
          const callbacks = this.loadCallbacks.get(id) || [];
          callbacks.forEach(callback => callback(true));
          this.loadCallbacks.delete(id);
        };
        
        img.onerror = () => {
          console.error(`Failed to load spritesheet: ${id}`);
          
          // Call all waiting callbacks with failure
          const callbacks = this.loadCallbacks.get(id) || [];
          callbacks.forEach(callback => callback(false));
          this.loadCallbacks.delete(id);
        };
        
        img.src = sheet.src;
      }
    });
  }
  
  /**
   * Get a spritesheet by ID
   */
  public getSheet(id: string): Spritesheet | undefined {
    return this.sheets.get(id);
  }
  
  /**
   * Check if a spritesheet is loaded
   */
  public isLoaded(id: string): boolean {
    const sheet = this.sheets.get(id);
    return !!sheet?.isLoaded;
  }
  
  /**
   * Get frame coordinates from a spritesheet
   */
  public getFrameCoordinates(
    sheetId: string, 
    frameIndex: number
  ): { x: number, y: number, width: number, height: number } | null {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) return null;
    
    const { frameWidth, frameHeight, framesPerRow, margin = 0, padding = 0 } = sheet;
    
    // Calculate position in the grid
    const row = Math.floor(frameIndex / framesPerRow);
    const col = frameIndex % framesPerRow;
    
    // Calculate pixel coordinates
    const x = col * (frameWidth + margin) + padding;
    const y = row * (frameHeight + margin) + padding;
    
    return {
      x,
      y,
      width: frameWidth - padding * 2,
      height: frameHeight - padding * 2
    };
  }
  
  /**
   * Render a frame from a spritesheet to a canvas
   */
  public renderFrameToCanvas(
    sheetId: string,
    frameIndex: number,
    canvas: HTMLCanvasElement
  ): boolean {
    const sheet = this.sheets.get(sheetId);
    if (!sheet?.isLoaded || !sheet.image) return false;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    const frameCoords = this.getFrameCoordinates(sheetId, frameIndex);
    if (!frameCoords) return false;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the frame
    ctx.drawImage(
      sheet.image,
      frameCoords.x,
      frameCoords.y,
      frameCoords.width,
      frameCoords.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    return true;
  }
  
  /**
   * Get CSS background position for a frame in a spritesheet
   */
  public getBackgroundPosition(
    sheetId: string,
    frameIndex: number
  ): string | null {
    const coords = this.getFrameCoordinates(sheetId, frameIndex);
    if (!coords) return null;
    
    return `-${coords.x}px -${coords.y}px`;
  }
}

/**
 * Sprite Animation Manager
 * 
 * Handles creating, updating, and playing sprite animations.
 */
export class SpriteAnimationManager {
  private animations: Map<string, SpriteAnimation> = new Map();
  private state: AnimationState = {
    currentFrameIndex: 0,
    frameStartTime: 0,
    isPlaying: false,
    isPaused: false,
    direction: 1,
    speed: 1,
    loopCount: 0,
    isComplete: false
  };
  
  private element: HTMLElement | null = null;
  private rafId: number | null = null;
  private sheetManager: SpriteSheetManager;
  private lastTimestamp: number | null = null;
  private frameElements: Map<string, HTMLElement> = new Map();
  private preloadedFrames: Set<string> = new Set();
  
  private onFrameChangeCallback: ((frameIndex: number) => void) | null = null;
  private onAnimationCompleteCallback: ((animation: SpriteAnimation) => void) | null = null;
  private onAnimationLoopCallback: ((animation: SpriteAnimation) => void) | null = null;
  
  private reduceMotion = false;
  
  /**
   * Create a new sprite animation manager
   */
  constructor(options: {
    element?: HTMLElement;
    preloadFrames?: boolean;
    reduceMotion?: boolean;
  } = {}) {
    this.sheetManager = SpriteSheetManager.getInstance();
    this.element = options.element || null;
    this.reduceMotion = options.reduceMotion || false;
    
    // Preload frames if requested
    if (options.preloadFrames) {
      this.preloadFrames();
    }
  }
  
  /**
   * Set the target element for this animation
   */
  public setElement(element: HTMLElement): void {
    this.element = element;
  }
  
  /**
   * Set reduced motion preference
   */
  public setReducedMotion(reduce: boolean): void {
    this.reduceMotion = reduce;
  }
  
  /**
   * Register an animation
   */
  public registerAnimation(animation: SpriteAnimation): void {
    this.animations.set(animation.id, animation);
  }
  
  /**
   * Register multiple animations
   */
  public registerAnimations(animations: SpriteAnimation[]): void {
    animations.forEach(animation => this.registerAnimation(animation));
  }
  
  /**
   * Get an animation by ID
   */
  public getAnimation(id: string): SpriteAnimation | undefined {
    return this.animations.get(id);
  }
  
  /**
   * Start playing an animation
   */
  public play(animationId: string, resetPosition = true): boolean {
    const animation = this.animations.get(animationId);
    if (!animation || animation.frames.length === 0) {
      console.warn(`Animation not found or has no frames: ${animationId}`);
      return false;
    }
    
    // Use reduced motion alternative if applicable
    let effectiveAnimation = animation;
    if (
      this.reduceMotion && 
      animation.reducedMotionAlternative && 
      !animation.ignoreReducedMotion
    ) {
      effectiveAnimation = animation.reducedMotionAlternative;
    }
    
    // Initialize the animation
    this.state = {
      currentAnimation: effectiveAnimation,
      currentFrameIndex: resetPosition ? 0 : this.state.currentFrameIndex,
      frameStartTime: performance.now(),
      isPlaying: true,
      isPaused: false,
      direction: 1,
      speed: effectiveAnimation.speed || 1,
      loopCount: 0,
      isComplete: false
    };
    
    // Call onStart callback
    if (effectiveAnimation.onStart) {
      effectiveAnimation.onStart();
    }
    
    // Start animation loop if needed
    if (!this.rafId) {
      this.lastTimestamp = null;
      this.update(performance.now());
    }
    
    return true;
  }
  
  /**
   * Stop the current animation
   */
  public stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.isComplete = false;
  }
  
  /**
   * Pause the current animation
   */
  public pause(): void {
    if (this.state.isPlaying && !this.state.isPaused) {
      this.state.isPaused = true;
      
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }
  }
  
  /**
   * Resume a paused animation
   */
  public resume(): void {
    if (this.state.isPlaying && this.state.isPaused) {
      this.state.isPaused = false;
      this.state.frameStartTime = performance.now();
      this.lastTimestamp = null;
      this.update(performance.now());
    }
  }
  
  /**
   * Set the animation speed
   */
  public setSpeed(speed: number): void {
    this.state.speed = Math.max(0.1, speed);
  }
  
  /**
   * Jump to a specific frame
   */
  public gotoFrame(frameIndex: number): void {
    if (!this.state.currentAnimation) return;
    
    const frameCount = this.state.currentAnimation.frames.length;
    if (frameIndex < 0 || frameIndex >= frameCount) {
      console.warn(`Invalid frame index: ${frameIndex}, animation has ${frameCount} frames`);
      return;
    }
    
    this.state.currentFrameIndex = frameIndex;
    this.state.frameStartTime = performance.now();
    
    this.renderCurrentFrame();
  }
  
  /**
   * Check if an animation is currently playing
   */
  public isPlaying(): boolean {
    return this.state.isPlaying && !this.state.isPaused;
  }
  
  /**
   * Check if the animation is paused
   */
  public isPaused(): boolean {
    return this.state.isPaused;
  }
  
  /**
   * Check if the animation has completed
   */
  public isComplete(): boolean {
    return this.state.isComplete;
  }
  
  /**
   * Get the current frame index
   */
  public getCurrentFrameIndex(): number {
    return this.state.currentFrameIndex;
  }
  
  /**
   * Get the current animation
   */
  public getCurrentAnimation(): SpriteAnimation | undefined {
    return this.state.currentAnimation;
  }
  
  /**
   * Set a callback for frame changes
   */
  public onFrameChange(callback: (frameIndex: number) => void): void {
    this.onFrameChangeCallback = callback;
  }
  
  /**
   * Set a callback for animation completion
   */
  public onAnimationComplete(callback: (animation: SpriteAnimation) => void): void {
    this.onAnimationCompleteCallback = callback;
  }
  
  /**
   * Set a callback for animation loop
   */
  public onAnimationLoop(callback: (animation: SpriteAnimation) => void): void {
    this.onAnimationLoopCallback = callback;
  }
  
  /**
   * Update the animation state
   */
  private update(timestamp: number): void {
    if (!this.state.isPlaying || this.state.isPaused || !this.state.currentAnimation) {
      return;
    }
    
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
    }
    
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    
    const animation = this.state.currentAnimation;
    const currentFrame = animation.frames[this.state.currentFrameIndex];
    const frameDuration = currentFrame.duration || animation.defaultFrameDuration || 100;
    const adjustedDuration = frameDuration / this.state.speed;
    
    const frameElapsed = timestamp - this.state.frameStartTime;
    
    // Check if it's time to advance to the next frame
    if (frameElapsed >= adjustedDuration) {
      // Calculate next frame based on playback mode
      this.advanceToNextFrame();
      
      // Render the current frame
      this.renderCurrentFrame();
      
      // Reset frame timer
      this.state.frameStartTime = timestamp;
    }
    
    // Continue animation loop
    this.rafId = requestAnimationFrame(this.update.bind(this));
  }
  
  /**
   * Advance to the next frame based on playback mode
   */
  private advanceToNextFrame(): void {
    if (!this.state.currentAnimation) return;
    
    const animation = this.state.currentAnimation;
    const frameCount = animation.frames.length;
    const currentIndex = this.state.currentFrameIndex;
    const playbackMode = animation.playbackMode || PlaybackMode.LOOP;
    
    // Get current and next frames for callback
    const currentFrame = animation.frames[currentIndex];
    let nextFrameIndex = (currentIndex + this.state.direction) % frameCount;
    
    // Handle negative index for wrap-around
    if (nextFrameIndex < 0) nextFrameIndex = frameCount - 1;
    
    // Different handling based on playback mode
    switch (playbackMode) {
      case PlaybackMode.ONCE:
        if (
          (this.state.direction === 1 && nextFrameIndex < currentIndex) ||
          (this.state.direction === -1 && nextFrameIndex > currentIndex)
        ) {
          // End of animation
          this.state.isComplete = true;
          this.state.isPlaying = false;
          
          // Call completion callback
          if (animation.onComplete) {
            animation.onComplete();
          }
          
          if (this.onAnimationCompleteCallback) {
            this.onAnimationCompleteCallback(animation);
          }
          
          return;
        }
        break;
        
      case PlaybackMode.PING_PONG:
        // If we reach an end, reverse direction
        if (
          (this.state.direction === 1 && nextFrameIndex === 0) ||
          (this.state.direction === -1 && nextFrameIndex === frameCount - 1)
        ) {
          this.state.direction = this.state.direction === 1 ? -1 : 1;
          
          // Count as a loop
          this.state.loopCount++;
          
          // Call loop callback
          if (animation.onLoop) {
            animation.onLoop();
          }
          
          if (this.onAnimationLoopCallback) {
            this.onAnimationLoopCallback(animation);
          }
        }
        break;
        
      case PlaybackMode.HOLD:
        if (
          (this.state.direction === 1 && nextFrameIndex < currentIndex) ||
          (this.state.direction === -1 && nextFrameIndex > currentIndex)
        ) {
          // End of animation, hold on last frame
          this.state.isComplete = true;
          this.state.isPlaying = false;
          
          // Call completion callback
          if (animation.onComplete) {
            animation.onComplete();
          }
          
          if (this.onAnimationCompleteCallback) {
            this.onAnimationCompleteCallback(animation);
          }
          
          return;
        }
        break;
        
      case PlaybackMode.LOOP:
      default:
        // If we wrapped around, count it as a loop
        if (
          (this.state.direction === 1 && nextFrameIndex === 0) ||
          (this.state.direction === -1 && nextFrameIndex === frameCount - 1)
        ) {
          this.state.loopCount++;
          
          // Call loop callback
          if (animation.onLoop) {
            animation.onLoop();
          }
          
          if (this.onAnimationLoopCallback) {
            this.onAnimationLoopCallback(animation);
          }
        }
        break;
    }
    
    // Notify frame change callbacks
    const nextFrame = animation.frames[nextFrameIndex];
    if (animation.onFrameChange) {
      animation.onFrameChange(currentFrame, nextFrame);
    }
    
    if (this.onFrameChangeCallback) {
      this.onFrameChangeCallback(nextFrameIndex);
    }
    
    // Update current frame index
    this.state.currentFrameIndex = nextFrameIndex;
    
    // Call onDisplay callback for the new frame if provided
    if (nextFrame.onDisplay) {
      nextFrame.onDisplay();
    }
  }
  
  /**
   * Render the current frame to the DOM element
   */
  private renderCurrentFrame(): void {
    if (!this.element || !this.state.currentAnimation) return;
    
    const animation = this.state.currentAnimation;
    const frame = animation.frames[this.state.currentFrameIndex];
    
    // Determine which element to use for this frame
    const frameElement = this.getOrCreateFrameElement(frame);
    
    // Set all other frames to hidden
    this.frameElements.forEach((el, id) => {
      if (id !== frame.id) {
        el.style.display = 'none';
      }
    });
    
    // Show this frame
    frameElement.style.display = 'block';
    
    // Apply any frame-specific style
    if (frame.style) {
      Object.entries(frame.style).forEach(([key, value]) => {
        (frameElement.style as any)[key] = value;
      });
    }
    
    // Apply transform
    if (frame.transform) {
      const { translateX = 0, translateY = 0, scale = 1, rotate = 0, originX = 0.5, originY = 0.5 } = frame.transform;
      
      // Set transform origin
      frameElement.style.transformOrigin = `${originX * 100}% ${originY * 100}%`;
      
      // Set transform
      frameElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
    } else {
      frameElement.style.transform = 'none';
    }
  }
  
  /**
   * Get or create an element for a frame
   */
  private getOrCreateFrameElement(frame: SpriteFrame): HTMLElement {
    // Check if we already have an element for this frame
    if (this.frameElements.has(frame.id)) {
      return this.frameElements.get(frame.id)!;
    }
    
    // Create a new element for this frame
    const frameElement = document.createElement('div');
    frameElement.className = 'sprite-frame';
    frameElement.style.position = 'absolute';
    frameElement.style.width = `${frame.width}px`;
    frameElement.style.height = `${frame.height}px`;
    frameElement.style.backgroundImage = `url(${frame.src})`;
    frameElement.style.backgroundPosition = frame.x !== undefined && frame.y !== undefined 
      ? `-${frame.x}px -${frame.y}px` 
      : '0 0';
    frameElement.style.backgroundRepeat = 'no-repeat';
    frameElement.style.display = 'none';
    
    // Add it to the container
    if (this.element) {
      this.element.appendChild(frameElement);
    }
    
    // Save reference
    this.frameElements.set(frame.id, frameElement);
    
    return frameElement;
  }
  
  /**
   * Preload all frames for smoother playback
   */
  private preloadFrames(): void {
    this.animations.forEach(animation => {
      animation.frames.forEach(frame => {
        if (!this.preloadedFrames.has(frame.src)) {
          const img = new Image();
          img.src = frame.src;
          this.preloadedFrames.add(frame.src);
        }
      });
    });
  }
  
  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stop();
    
    // Remove all frame elements
    this.frameElements.forEach(el => {
      el.remove();
    });
    
    this.frameElements.clear();
    this.preloadedFrames.clear();
  }
  
  /**
   * Get the current animation statistics
   */
  public getStats(): {
    animationId: string | undefined;
    frameCount: number;
    currentFrame: number;
    loopCount: number;
    isPlaying: boolean;
    isPaused: boolean;
    isComplete: boolean;
    speed: number;
  } {
    return {
      animationId: this.state.currentAnimation?.id,
      frameCount: this.state.currentAnimation?.frames.length || 0,
      currentFrame: this.state.currentFrameIndex,
      loopCount: this.state.loopCount,
      isPlaying: this.state.isPlaying,
      isPaused: this.state.isPaused,
      isComplete: this.state.isComplete,
      speed: this.state.speed
    };
  }
}

/**
 * Create a sprite animation from a spritesheet
 */
export function createAnimationFromSpritesheet(
  id: string,
  name: string,
  spritesheet: Spritesheet,
  options: {
    startFrame?: number;
    endFrame?: number;
    frameDuration?: number;
    playbackMode?: PlaybackMode;
    frameTransforms?: Record<number, SpriteFrame['transform']>;
    frameCallbacks?: Record<number, () => void>;
  } = {}
): SpriteAnimation {
  const {
    startFrame = 0,
    endFrame = spritesheet.frameCount - 1,
    frameDuration = 100,
    playbackMode = PlaybackMode.LOOP,
    frameTransforms = {},
    frameCallbacks = {}
  } = options;
  
  const frames: SpriteFrame[] = [];
  
  for (let i = startFrame; i <= endFrame; i++) {
    const coords = SpriteSheetManager.getInstance().getFrameCoordinates(id, i);
    
    if (!coords) {
      throw new Error(`Invalid frame index: ${i}`);
    }
    
    frames.push({
      id: `${id}_frame_${i}`,
      src: spritesheet.src,
      x: coords.x,
      y: coords.y,
      width: coords.width,
      height: coords.height,
      duration: frameDuration,
      transform: frameTransforms[i],
      onDisplay: frameCallbacks[i]
    });
  }
  
  return {
    id,
    name,
    frames,
    defaultFrameDuration: frameDuration,
    playbackMode
  };
}

/**
 * Convenience function to create individual frame animations
 */
export function createFrameAnimation(
  id: string,
  name: string,
  frameSources: string[],
  options: {
    frameWidth?: number;
    frameHeight?: number;
    frameDuration?: number;
    playbackMode?: PlaybackMode;
    frameTransforms?: Record<number, SpriteFrame['transform']>;
    frameCallbacks?: Record<number, () => void>;
  } = {}
): SpriteAnimation {
  const {
    frameWidth = 64,
    frameHeight = 64,
    frameDuration = 100,
    playbackMode = PlaybackMode.LOOP,
    frameTransforms = {},
    frameCallbacks = {}
  } = options;
  
  const frames: SpriteFrame[] = frameSources.map((src, index) => ({
    id: `${id}_frame_${index}`,
    src,
    width: frameWidth,
    height: frameHeight,
    duration: frameDuration,
    transform: frameTransforms[index],
    onDisplay: frameCallbacks[index]
  }));
  
  return {
    id,
    name,
    frames,
    defaultFrameDuration: frameDuration,
    playbackMode
  };
}

export default SpriteAnimationManager;