/**
 * Common type definitions for the animation system
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
  COMPLEX = 'complex'
}

/**
 * Motion sensitivity levels
 */
export enum MotionSensitivityLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

/**
 * Animation transition timing
 */
export type AnimationTiming = {
  instant: string;
  fast: string;
  normal: string;
  emphasized: string;
  pageTransition: string;
};

/**
 * Animation easing functions
 */
export type AnimationEasing = {
  standard: string;
  enter: string;
  exit: string;
  emphasized: string;
  elastic: string;
  linear: string;
};

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
  EXPRESSIVE = 'expressive'
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
 * Animation preset type reference
 * The full definition is in styled.d.ts
 */
import type { AnimationPreset } from './styled';
export type AnimationPresetReference = string | AnimationPreset;

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
 * Accessible animation options
 */
export interface AccessibleAnimationOptions extends AnimationOptions {
  complexity?: AnimationComplexity;
  motionSensitivity?: MotionSensitivityLevel;
  prefersReducedMotion?: boolean;
  accessibilityMode?: 'auto' | 'standard' | 'reduced' | 'none';
  alternate?: AnimationPresetReference | Keyframes | string;
}

/**
 * Animation mapping for standard/reduced motion
 */
export interface AnimationPairing {
  standard: AnimationPresetReference | Keyframes | string;
  reduced: AnimationPresetReference | Keyframes | string;
}

/**
 * Keyframe interface
 */
export interface KeyframeDefinition {
  name: string;
  keyframes: Keyframes;
}

/**
 * Animation function type
 */
export type AnimationFunction = (options?: AnimationOptions) => FlattenSimpleInterpolation;

/**
 * Animation presets object
 */
export interface AnimationPresets {
  [key: string]: AnimationFunction;
}

/**
 * Z-Space animation options
 */
export interface ZSpaceAnimationOptions {
  depth?: number;
  perspective?: number;
  distance?: number;
  origin?: string;
  easing?: string;
  duration?: string;
  delay?: string;
}

/**
 * Animation stage
 */
export interface AnimationStage {
  id: string;
  duration: number;
  delay?: number;
  easing?: string;
  onStart?: () => void;
  onComplete?: () => void;
  elements?: string[];
}

/**
 * Animation sequence
 */
export interface AnimationSequence {
  stages: AnimationStage[];
  totalDuration?: number;
  loop?: boolean;
  alternateDirection?: boolean;
}

/**
 * Gestalt animation pattern
 */
export enum GestaltPattern {
  PROXIMITY = 'proximity',
  SIMILARITY = 'similarity',
  CONTINUITY = 'continuity',
  CLOSURE = 'closure',
  COMMON_FATE = 'common-fate'
}

/**
 * Optimized animation options
 */
export interface OptimizedAnimationOptions extends AnimationOptions {
  targetFPS?: number;
  gpuAccelerated?: boolean;
  prioritizePerformance?: boolean;
  adaptToDeviceCapabilities?: boolean;
  reduceAnimationQuality?: boolean;
  disableWhenBackgrounded?: boolean;
}

/**
 * Create keyframe type helper
 */
export function createKeyframes(name: string, frames: Keyframes): KeyframeDefinition {
  return {
    name,
    keyframes: frames
  };
}