/**
 * Core type definitions for the animation system
 * This file serves as the central location for animation types to prevent circular dependencies
 */
import { Keyframes, FlattenSimpleInterpolation } from 'styled-components';

/**
 * Animation complexity levels
 */
export enum AnimationComplexity {
  NONE = 'none',
  MINIMAL = 'minimal',
  REDUCED = 'reduced',
  BASIC = 'basic',
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  COMPLEX = 'complex',
}

/**
 * Motion sensitivity levels
 */
export enum MotionSensitivityLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum',
}

/**
 * Animation intensity levels
 */
export enum AnimationIntensity {
  NONE = 'none',
  SUBTLE = 'subtle',
  LIGHT = 'light',
  MEDIUM = 'medium',
  STANDARD = 'standard',
  STRONG = 'strong',
  HIGH = 'high',
  EXPRESSIVE = 'expressive',
  PRONOUNCED = 'pronounced',
  DRAMATIC = 'dramatic'
}

/**
 * Animation direction
 */
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

/**
 * Animation fill mode
 */
export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';

/**
 * Animation play state
 */
export type AnimationPlayState = 'running' | 'paused';

/**
 * Animation preset definition
 */
export interface AnimationPreset {
  /** The animation keyframes or direct reference to a keyframe animation */
  keyframes?: Keyframes;
  animation?: Keyframes;

  /** Default animation duration */
  duration: string | number;

  /** Default animation easing */
  easing: string;

  /** Default animation delay */
  delay?: string | number;

  /** Default animation fill mode */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';

  /** Reduced motion alternative */
  reducedMotionAlternative?: AnimationPreset | null;

  /** Animation intensity level */
  intensity?: AnimationIntensity;

  /** Iterations count */
  iterations?: number | string;

  /** Animation direction */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

  /** Animation play state */
  playState?: 'running' | 'paused';
}

/**
 * Keyframe interface
 */
export interface KeyframeDefinition {
  name: string;
  keyframes: Keyframes;
}

/**
 * Animation options
 */
export interface AnimationOptions {
  duration?: string;
  delay?: string;
  easing?: string;
  fillMode?: AnimationFillMode;
  iterations?: number | string;
  direction?: AnimationDirection;
  playState?: AnimationPlayState;
}

/**
 * Animation function type
 */
export type AnimationFunction = (options?: AnimationOptions) => FlattenSimpleInterpolation; 