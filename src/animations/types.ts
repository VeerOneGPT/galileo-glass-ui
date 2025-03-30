/**
 * Common type definitions for the animation system
 * @deprecated Import from core/types.ts directly to avoid circular dependencies
 */
import { Keyframes } from 'styled-components';
import { 
  AnimationComplexity,
  MotionSensitivityLevel,
  AnimationPreset,
  KeyframeDefinition,
  AnimationOptions,
  AnimationFunction
} from './core/types';
import { SpringConfig, SpringPresets } from './physics/springPhysics';

// Re-export types from core for backward compatibility
export type { 
  AnimationComplexity,
  MotionSensitivityLevel,
  AnimationPreset,
  KeyframeDefinition,
  AnimationOptions,
  AnimationFunction
};

/**
 * Animation timing
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
 * Animation preset type reference
 */
export type AnimationPresetReference = string | AnimationPreset;

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
  COMMON_FATE = 'common-fate',
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
    keyframes: frames,
  };
}

/**
 * Common Animation Props Interface
 *
 * Defines standard properties to control animation behavior across components.
 */
export interface AnimationProps {
  /**
   * Optional spring physics configuration or preset name.
   * Overrides default animation settings for the component.
   */
  animationConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;
  
  /**
   * If true, explicitly disables animations for this component instance,
   * overriding other settings like reduced motion preferences.
   */
  disableAnimation?: boolean;
  
  /**
   * Optional override for the motion sensitivity level for this component instance.
   * Influences how animations adapt to performance or user preference.
   */
  motionSensitivity?: MotionSensitivityLevel;
}
