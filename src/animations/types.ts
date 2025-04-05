/**
 * Common type definitions for the animation system
 * Centralizing types here.
 */
import { Keyframes } from 'styled-components';
import {
  // Core types re-exported
  AnimationComplexity,
  MotionSensitivityLevel,
  AnimationPreset,
  KeyframeDefinition,
  AnimationOptions,
  AnimationFunction
} from './core/types';
import {
  // Imports needed for consolidated types
  Easings,
  InterpolationFunction,
  EasingFunction
} from './physics/interpolation';
import { AnimationCategory } from './accessibility/MotionSensitivity';
import { SpringConfig, SpringPresets } from './physics/springPhysics';
// Import Point from canonical location
import { Point, Point3D } from '../types/physics';

// Re-export types from core for backward compatibility
export type {
  AnimationComplexity,
  MotionSensitivityLevel,
  AnimationPreset,
  KeyframeDefinition,
  AnimationOptions,
  AnimationFunction
};

// Don't re-export Point to avoid circular dependencies
// export type { Point };

// --- Keep Existing Utility Types ---

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

// --- Common Animation Stage Types ---

// Type alias for flexible animation targets
type AnimationTarget =
  | string // CSS Selector
  | Element
  | NodeListOf<Element>
  | React.RefObject<Element | null> // Add React RefObject
  | (() => Element | null) // Add function returning element or null
  | (Element | null)[] // Add array of elements or null
  | React.RefObject<Element | null>[] // Add array of RefObjects
  | (() => Element | null)[]; // Add array of functions

// Enums
export enum PlaybackDirection { FORWARD = 'forward', BACKWARD = 'backward', ALTERNATE = 'alternate', ALTERNATE_REVERSE = 'alternate-reverse' }
export enum StaggerPattern { SEQUENTIAL = 'sequential', FROM_CENTER = 'from-center', FROM_EDGES = 'from-edges', RANDOM = 'random', WAVE = 'wave', CASCADE = 'cascade', RIPPLE = 'ripple', CUSTOM = 'custom' }
export enum TimingRelationship { START_TOGETHER = 'start-together', END_TOGETHER = 'end-together', OVERLAP = 'overlap', GAP = 'gap', CHAIN = 'chain' }
export enum PlaybackState { IDLE = 'idle', PLAYING = 'playing', PAUSED = 'paused', FINISHED = 'finished', CANCELLING = 'cancelling' }

// Callback Types
export type SequenceIdCallback = (sequenceId: string) => void;
export type ProgressCallback = (progress: number, sequenceId: string) => void;
export type AnimationIdCallback = (animationId: string, sequenceId: string) => void;
export type InternalCallback = SequenceIdCallback | ProgressCallback | AnimationIdCallback;
export type ConfigCallback = InternalCallback | undefined;

// Easing Types
export type GenericEasingFunctionFactory = (...args: unknown[]) => EasingFunction | InterpolationFunction;
export type EasingDefinitionType = keyof typeof Easings | InterpolationFunction | GenericEasingFunctionFactory | { type: string; [key: string]: unknown };

// Sequence Lifecycle Interface
export interface SequenceLifecycle {
  onStart?: SequenceIdCallback;
  onUpdate?: ProgressCallback;
  onComplete?: SequenceIdCallback;
  onPause?: SequenceIdCallback;
  onResume?: SequenceIdCallback;
  onCancel?: SequenceIdCallback;
  onAnimationStart?: AnimationIdCallback;
  onAnimationComplete?: AnimationIdCallback;
}

// --- START Public Animation Stage Types (for useAnimationSequence) ---

// Base Animation Stage Interface for public API
export interface PublicBaseAnimationStage {
  id: string;
  duration: number;
  delay?: number;
  easing?: EasingDefinitionType;
  easingArgs?: unknown[];
  startTime?: number;
  direction?: PlaybackDirection;
  repeatCount?: number;
  repeatDelay?: number;
  yoyo?: boolean;
  dependsOn?: string[];
  reducedMotionAlternative?: Omit<PublicBaseAnimationStage, 'id' | 'reducedMotionAlternative'>;
  category?: AnimationCategory;
  onStart?: SequenceIdCallback;
  onUpdate?: ProgressCallback;
  onComplete?: SequenceIdCallback;
}

// Specific Public Animation Stage Interfaces
export interface PublicStyleAnimationStage extends PublicBaseAnimationStage {
  type: 'style';
  targets: AnimationTarget;
  from?: Record<string, unknown>;
  properties: Record<string, unknown>;
  exclude?: string[];
}

export interface PublicCallbackAnimationStage extends PublicBaseAnimationStage {
  type: 'callback';
  callback: ProgressCallback;
}

export interface PublicEventAnimationStage extends PublicBaseAnimationStage {
  type: 'event';
  callback: SequenceIdCallback;
  duration: 0;
}

export interface PublicGroupAnimationStage extends PublicBaseAnimationStage {
  type: 'group';
  children: PublicAnimationStage[]; // Recursive type
  relationship?: TimingRelationship;
  relationshipValue?: number;
}

export interface PublicStaggerAnimationStage extends PublicBaseAnimationStage {
  type: 'stagger';
  targets: AnimationTarget;
  from?: Record<string, unknown>;
  properties: Record<string, unknown>;
  staggerDelay: number;
  staggerPattern?: StaggerPattern;
  staggerPatternFn?: (index: number, total: number, targets: unknown[]) => number;
  staggerOverlap?: number;
}

// Union Type for Public Animation Stage
export type PublicAnimationStage =
  | PublicStyleAnimationStage
  | PublicCallbackAnimationStage
  | PublicEventAnimationStage
  | PublicGroupAnimationStage
  | PublicStaggerAnimationStage;

// --- END Public Animation Stage Types ---

// --- START Internal Animation Stage Types (for useOrchestration and internal use) ---

// Base Animation Stage Interface for internal use - includes orchestration specific properties
export interface BaseAnimationStage {
  id: string;
  duration: number;
  delay?: number; // Optional delay property
  easing?: EasingDefinitionType;
  easingArgs?: unknown[];
  startTime?: number; // Used by sequence runners
  direction?: PlaybackDirection; // Used by sequence runners
  repeatCount?: number;
  repeatDelay?: number;
  yoyo?: boolean;
  dependsOn?: string[];
  reducedMotionAlternative?: Omit<BaseAnimationStage, 'id' | 'reducedMotionAlternative'>;
  category?: AnimationCategory;
  onStart?: SequenceIdCallback;
  onUpdate?: ProgressCallback;
  onComplete?: SequenceIdCallback;
  order?: number; // For sorting stages (used by useOrchestration)
  position?: Point; // For gestalt patterns (used by useOrchestration)
  elementType?: string; // For gestalt grouping
  group?: string; // For coordinated animations
  dependencies?: string[]; // Stages that must complete first
  animation?: { // Optional animation config (used locally in useOrchestration)
    easing?: string; // Note: May conflict/overlap with BaseAnimationStage.easing (EasingDefinitionType)
    keyframes?: string;
  };
}

// Specific Animation Stage Interfaces
export interface StyleAnimationStage extends BaseAnimationStage {
  type: 'style';
  targets: AnimationTarget;
  from?: Record<string, unknown>;
  properties: Record<string, unknown>;
  exclude?: string[];
}

export interface CallbackAnimationStage extends BaseAnimationStage {
  type: 'callback';
  callback: ProgressCallback;
}

export interface EventAnimationStage extends BaseAnimationStage {
  type: 'event';
  callback: SequenceIdCallback;
  duration: 0;
}

export interface GroupAnimationStage extends BaseAnimationStage {
  type: 'group';
  children: AnimationStage[]; // Recursive type
  relationship?: TimingRelationship;
  relationshipValue?: number;
}

export interface StaggerAnimationStage extends BaseAnimationStage {
  type: 'stagger';
  targets: AnimationTarget;
  from?: Record<string, unknown>;
  properties: Record<string, unknown>;
  staggerDelay: number;
  staggerPattern?: StaggerPattern;
  staggerPatternFn?: (index: number, total: number, targets: unknown[]) => number;
  staggerOverlap?: number;
}

// Union Type for Animation Stage
export type AnimationStage =
  | StyleAnimationStage
  | CallbackAnimationStage
  | EventAnimationStage
  | GroupAnimationStage
  | StaggerAnimationStage;

// --- END Internal Animation Stage Types ---

// --- Keep Remaining Existing Types/Functions ---

/**
 * Gestalt animation pattern (Seems distinct from StaggerPattern)
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
 */
export interface AnimationProps {
  animationConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;
  disableAnimation?: boolean;
  motionSensitivity?: MotionSensitivityLevel;
}
