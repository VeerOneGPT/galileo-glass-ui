/**
 * Animation System Types
 *
 * Type definitions for the animation system
 */
import { keyframes } from 'styled-components';

/**
 * Options for animation functions
 */
export interface AnimationOptions {
  /**
   * The keyframes to animate
   */
  animation: ReturnType<typeof keyframes>;

  /**
   * Secondary animation for reduced motion
   */
  secondaryAnimation?: ReturnType<typeof keyframes> | null;

  /**
   * Duration of the animation in seconds
   */
  duration?: number;

  /**
   * Easing function for the animation
   */
  easing?: string;

  /**
   * Delay before starting the animation in seconds
   */
  delay?: number;

  /**
   * Number of iterations (use Infinity for infinite)
   */
  iterations?: number | 'infinite';

  /**
   * Direction of the animation
   */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

  /**
   * Fill mode for the animation
   */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

/**
 * Motion sensitivity levels
 */
export enum MotionSensitivity {
  /**
   * No animations at all
   */
  NONE = 'none',

  /**
   * Minimal essential animations only
   */
  MINIMAL = 'minimal',

  /**
   * Reduced animations without motion
   */
  REDUCED = 'reduced',

  /**
   * Standard animations
   */
  STANDARD = 'standard',

  /**
   * Enhanced animations for those who enjoy them
   */
  ENHANCED = 'enhanced',
}

/**
 * Animation quality tiers
 */
export enum AnimationQualityTier {
  /**
   * Ultra-high quality for high-end devices
   */
  ULTRA = 'ultra',

  /**
   * High quality for good devices
   */
  HIGH = 'high',

  /**
   * Medium quality for average devices
   */
  MEDIUM = 'medium',

  /**
   * Low quality for lower-end devices
   */
  LOW = 'low',

  /**
   * Minimal animations for very low-end devices
   */
  MINIMAL = 'minimal',
}

/**
 * Transition options
 */
export interface TransitionOptions {
  /**
   * Properties to transition
   */
  properties: string[];

  /**
   * Duration of the transition in seconds
   */
  duration?: number;

  /**
   * Easing function for the transition
   */
  easing?: string;

  /**
   * Delay before the transition starts in seconds
   */
  delay?: number;
}

/**
 * Spring animation options
 */
export interface SpringAnimationOptions {
  /**
   * Mass of the object (higher = more inertia)
   */
  mass?: number;

  /**
   * Stiffness of the spring (higher = faster)
   */
  stiffness?: number;

  /**
   * Damping ratio (1 = critically damped, <1 = bouncy, >1 = overdamped)
   */
  dampingRatio?: number;

  /**
   * Initial velocity (pixels/ms)
   */
  initialVelocity?: number;

  /**
   * Properties to animate
   */
  properties?: string[];

  /**
   * Animation duration in ms (if specified, creates a duration-based spring)
   */
  duration?: number;
}

/**
 * Animation preset types
 */
export type AnimationPresetType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'pulse'
  | 'glass'
  | 'modal'
  | 'custom';
