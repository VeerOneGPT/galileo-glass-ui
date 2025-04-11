/**
 * Common type definitions for the animation system
 * Centralizing types here.
 */
import { Keyframes, FlattenSimpleInterpolation } from 'styled-components';
import {
  // Imports needed for consolidated types
  Easings,
  InterpolationFunction,
  EasingFunction
} from './physics/interpolation';
import { AnimationCategory as ImportedCategory, MotionSensitivityLevel as ImportedMotionSensitivityLevel } from './accessibility/MotionSensitivity';
import { SpringConfig, SpringPresets } from './physics/springPhysics';
// Import Point from canonical location
import { Point, Point3D } from '../types/physics';

// --- START ElementReference Definition ---
/**
 * Type alias for flexible animation targets. Can be a CSS selector, 
 * a direct DOM element, a NodeList, a React ref, or an array/function returning these.
 */
export type ElementReference =
  | string // CSS Selector
  | Element
  | NodeListOf<Element>
  | React.RefObject<Element | null> 
  | (() => Element | null) 
  | (Element | null)[] 
  | React.RefObject<Element | null>[] 
  | (() => Element | null)[];
// --- END ElementReference Definition ---

// --- Enums (Place ALL enums together near the top) ---
export enum PlaybackDirection { FORWARD = 'forward', BACKWARD = 'backward', ALTERNATE = 'alternate', ALTERNATE_REVERSE = 'alternate-reverse' }
export enum StaggerPattern { SEQUENTIAL = 'sequential', FROM_CENTER = 'from-center', FROM_EDGES = 'from-edges', RANDOM = 'random', WAVE = 'wave', CASCADE = 'cascade', RIPPLE = 'ripple', CUSTOM = 'custom' }
export enum TimingRelationship { START_TOGETHER = 'start-together', END_TOGETHER = 'end-together', OVERLAP = 'overlap', GAP = 'gap', CHAIN = 'chain' }
export enum PlaybackState { IDLE = 'idle', PLAYING = 'playing', PAUSED = 'paused', FINISHED = 'finished', CANCELLING = 'cancelling' }

// Add/Replace Game Animation Enums HERE
export enum TransitionType {
  FADE = 'fade',
  SLIDE = 'slide',
  ZOOM = 'zoom',
  FLIP = 'flip',
  DISSOLVE = 'dissolve',
  MORPH = 'morph',
  CROSSFADE = 'crossfade',
  SWIPE = 'swipe',
  FOLD = 'fold',
  PUSH = 'push',
  COVER = 'cover',
  IRIS = 'iris',
  CUSTOM = 'custom',
  PHYSICS_FADE = 'physics-fade',
  PHYSICS_SLIDE = 'physics-slide',
  PHYSICS_ZOOM = 'physics-zoom',
  PHYSICS_FLIP = 'physics-flip',
  ROTATE_3D = 'rotate-3d',
  PUSH_3D = 'push-3d',
  FLIP_3D = 'flip-3d',
  GLASS_BLUR = 'glass-blur',
  GLASS_OPACITY = 'glass-opacity',
  GLASS_GLOW = 'glass-glow'
}

export enum TransitionDirection {
  LEFT_TO_RIGHT = 'left-to-right',
  RIGHT_TO_LEFT = 'right-to-left',
  TOP_TO_BOTTOM = 'top-to-bottom',
  BOTTOM_TO_TOP = 'bottom-to-top',
  FROM_CENTER = 'from-center',
  TO_CENTER = 'to-center',
  CUSTOM = 'custom'
}

// --- Core Types (Add these) ---
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';
export type AnimationPlayState = 'running' | 'paused';

export interface AnimationPreset {
  keyframes?: string | Keyframes;
  animation?: string | Keyframes; // Keep both if used
  duration: string | number;
  easing: string;
  delay?: string | number;
  fillMode?: AnimationFillMode;
  reducedMotionAlternative?: AnimationPreset | null; // Recursive, careful with deep nesting
  intensity?: AnimationIntensity;
  iterations?: number | string;
  direction?: AnimationDirection; // Use the type defined above
  playState?: AnimationPlayState; // Use the type defined above
}

export interface KeyframeDefinition {
  name: string;
  keyframes: Keyframes;
}

export interface AnimationOptions {
  duration?: string;
  delay?: string;
  easing?: string;
  fillMode?: AnimationFillMode;
  iterations?: number | string;
  direction?: AnimationDirection;
  playState?: AnimationPlayState;
}

export type AnimationFunction = (options?: AnimationOptions) => FlattenSimpleInterpolation;

export type TimingFunction = (t: number) => number;

// --- Common Types ---
// Type alias for flexible animation targets
// NOTE: We defined ElementReference above, let's use that for AnimationTarget 
//       to avoid duplication, OR decide which name is canonical.
//       Assuming AnimationTarget is preferred based on its usage below.
type AnimationTarget = ElementReference;
export type { AnimationTarget }; // Export the type

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

// Callback Types
export type SequenceIdCallback = (sequenceId: string) => void;
export type ProgressCallback = (progress: number, sequenceId: string) => void;
export type AnimationIdCallback = (animationId: string, sequenceId: string) => void;
export type InternalCallback = SequenceIdCallback | ProgressCallback | AnimationIdCallback;
export type ConfigCallback = InternalCallback | undefined;

// Easing Types
export type GenericEasingFunctionFactory = (...args: unknown[]) => EasingFunction | InterpolationFunction;
export type EasingDefinitionType = keyof typeof Easings | InterpolationFunction | GenericEasingFunctionFactory | { type: string; [key: string]: unknown } | string;

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
  category?: ImportedCategory;
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

export interface PublicPhysicsAnimationStage extends PublicBaseAnimationStage {
  type: 'physics';
  targets: AnimationTarget;
  from?: Record<string, unknown>;
  properties: Record<string, unknown>;
  physics?: Partial<SpringConfig>;
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
  | PublicPhysicsAnimationStage
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
  category?: ImportedCategory;
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

// Add new PhysicsAnimationStage type
export interface PhysicsAnimationStage extends BaseAnimationStage {
  type: 'physics';
  targets: AnimationTarget;
  from?: Record<string, unknown>;
  properties: Record<string, unknown>;
  physics?: Partial<SpringConfig>;
}

// Union Type for Animation Stage
export type AnimationStage =
  | StyleAnimationStage
  | CallbackAnimationStage
  | EventAnimationStage
  | GroupAnimationStage
  | StaggerAnimationStage
  | PhysicsAnimationStage;

// --- END Internal Animation Stage Types ---

// --- START Game Animation Types (REPLACE existing definitions) ---

/** Configuration for a single state in the game animation. */
export interface GameAnimationState {
  id: string;
  name?: string; // Made optional to match potential usage
  elements?: AnimationTarget; // Added this line
  enterElements?: AnimationTarget; // Use AnimationTarget type
  exitElements?: AnimationTarget; // Use AnimationTarget type
  activeClass?: string;
  priority?: number;
  exclusive?: boolean;
  enterDuration?: number;
  exitDuration?: number;
  autoAnimate?: boolean;
  backgroundElements?: AnimationTarget;
  meta?: Record<string, any>;
}

/** Configuration for the transition between two states. */
export interface StateTransition {
  from: string | string[]; // Allow array of source states
  to: string;   // Use 'to' as in the hook
  type: TransitionType;
  direction?: TransitionDirection;
  duration?: number;
  easing?: EasingDefinitionType; // Use updated EasingDefinitionType
  physicsConfig?: Partial<SpringConfig>;
  stagger?: boolean | number; // Allow number for explicit delay
  staggerPattern?: StaggerPattern;
  staggerDelay?: number;
  customSettings?: Record<string, any>;
  elements?: AnimationTarget; // Use AnimationTarget type
  condition?: () => boolean; // Added this line
  onStart?: () => void;
  onComplete?: () => void;
  children?: StateTransition[];
  parallel?: boolean;
  reducedMotionAlternative?: Omit<StateTransition, 'from' | 'to' | 'reducedMotionAlternative' | 'condition'>; // Adjusted Omit
  category?: ImportedCategory;
  // Add glass effect properties
  glassEffect?: {
    blur?: 'minimal' | 'light' | 'medium' | 'heavy' | number;
    opacity?: number;
    glow?: 'subtle' | 'standard' | 'intense' | number;
    saturation?: number;
  };
  // Add 3D transform options
  transform3D?: {
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    translateZ?: number;
    perspective?: number;
    origin?: string;
  };
  // Add gesture physics integration
  gesturePhysics?: {
    enabled?: boolean;
    interactionType?: 'drag' | 'swipe' | 'pinch' | 'rotate';
    springBack?: boolean;
    boundsCheck?: boolean;
  };
  // Add component state synchronization
  componentSync?: {
    // Target component(s) to synchronize with
    targets?: string | string[] | HTMLElement | HTMLElement[] | React.RefObject<HTMLElement> | React.RefObject<HTMLElement>[];
    // Props to update based on transition progress
    propsMap?: Record<string, (progress: number, from: any, to: any) => any>;
    // State snapshots for start and end of transition
    fromState?: Record<string, any>;
    toState?: Record<string, any>;
    // Callback to apply state updates to components
    applyStateUpdate?: (target: HTMLElement, props: Record<string, any>) => void;
  };
}

/** Stateful game animation configuration */
export interface GameAnimationConfig {
  initialState?: string;
  states: GameAnimationState[];
  transitions: StateTransition[];
  defaultTransitionType?: TransitionType;
  defaultDuration?: number;
  defaultEasing?: EasingDefinitionType; // Use updated EasingDefinitionType
  defaultPhysicsConfig?: Partial<SpringConfig>; // Add default physics config
  autoTransition?: boolean;
  allowMultipleActiveStates?: boolean;
  rootElement?: string | HTMLElement; // Allow HTMLElement
  useWebAnimations?: boolean;
  onStateChange?: (prevState: string | null, newState: string | null) => void;
  category?: ImportedCategory;
  // Add motion sensitivity for accessibility
  motionSensitivity?: ImportedMotionSensitivityLevel;
  // Add debugging options
  debug?: boolean;
}

/** Game animation controller returned by useGameAnimation */
export interface GameAnimationController {
  activeStates: GameAnimationState[];
  currentTransition: StateTransition | null;
  isTransitioning: boolean;
  transitionProgress: number;
  goToState: (stateId: string) => void;
  transitionTo: (targetStateId: string, customTransition?: Partial<StateTransition>) => void;
  playTransition: (transition: StateTransition) => void;
  playEnterAnimation: (stateId: string) => void;
  playExitAnimation: (stateId: string) => void;
  addState: (state: GameAnimationState) => void;
  removeState: (stateId: string) => void;
  addTransition: (transition: StateTransition) => void;
  removeTransition: (fromId: string, toId: string) => void;
  pauseTransition: () => void;
  resumeTransition: () => void;
  completeTransition: () => void;
  cancelTransition: () => void;
  getState: (stateId: string) => GameAnimationState | undefined;
  isStateActive: (stateId: string) => boolean;
  reducedMotion: boolean;
  motionSensitivity: ImportedMotionSensitivityLevel;
  debug: boolean;
  setDebug: (enabled: boolean) => void;
  getEventEmitter?: () => any;
}

// --- END Game Animation Types ---

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

// Ensure Point, Point3D are used if needed, otherwise remove imports
// Ensure Keyframes is used if needed

// Re-export it
export { ImportedCategory as AnimationCategory };

// --- Enums (Add Core Enums HERE) ---
export enum AnimationComplexity {
  NONE = 'none',
  MINIMAL = 'minimal',
  REDUCED = 'reduced',
  BASIC = 'basic',
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  COMPLEX = 'complex',
}
export enum MotionSensitivityLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum',
}
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

// --- START useAnimationSequence Related Types ---

// Moved from useAnimationSequence.ts
export interface AnimationSequenceConfig extends SequenceLifecycle {
  id?: string; 
  stages: PublicAnimationStage[] | AnimationStage[]; // Accept both public and internal types
  duration?: number; 
  autoplay?: boolean; 
  loop?: boolean; 
  repeatCount?: number; 
  yoyo?: boolean; 
  direction?: PlaybackDirection; 
  category?: ImportedCategory; // Use ImportedCategory alias 
  useWebAnimations?: boolean; 
  playbackRate?: number;
  onStageChange?: (activeStageId: string | null, sequenceId: string) => void;
}

// Moved from useAnimationSequence.ts
export interface SequenceControls { 
  play: () => void; 
  pause: () => void; 
  stop: () => void; 
  reset: () => void;
  reverse: () => void; 
  restart: () => void; 
  seek: (time: number) => void; 
  seekProgress: (progress: number) => void; 
  seekLabel: (label: string) => void; 
  getProgress: () => number; 
  addStage: (stage: PublicAnimationStage) => void; 
  removeStage: (stageId: string) => void; 
  updateStage: (stageId: string, updates: Partial<PublicAnimationStage>) => void; 
  setPlaybackRate: (rate: number) => void; 
  getPlaybackState: () => PlaybackState; 
  addCallback: (type: keyof SequenceLifecycle, callback: InternalCallback) => void; // Use InternalCallback 
  removeCallback: (type: keyof SequenceLifecycle, callback: InternalCallback) => void; // Use InternalCallback
}

// Moved from useAnimationSequence.ts
export interface AnimationSequenceResult extends SequenceControls { 
  progress: number; 
  playbackState: PlaybackState; 
  currentStageId: string | null;
  duration: number; 
  direction: PlaybackDirection; 
  playbackRate: number; 
  reducedMotion: boolean; 
  stages: PublicAnimationStage[]; // Use PublicAnimationStage for the public API
  id: string; 
}

// --- END useAnimationSequence Related Types ---
