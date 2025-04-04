/**
 * Animation Orchestration
 *
 * System for coordinating complex animations across components.
 */

// Export Gestalt patterns for animation
export {
  GestaltPatterns,
  coordinatedAnimations,
  createStaggeredSequence,
  createStaggeredAnimation,
  createAnimationSequence,
  type StaggeredSequenceOptions,
  type AnimationSequenceItem
} from './GestaltPatterns';

// Export Animation Orchestrator
export {
  AnimationOrchestrator,
  animationOrchestrator,
  withOrchestration
} from './Orchestrator';
export type {
  AnimationTarget,
  AnimationSequence
} from './Orchestrator';

// Export Declarative Animation Sequencer
export {
  CommandType,
  type AnimationCommand,
  type SequenceContext,
  type SequenceOptions,
  type AnimationTargetSelector,
  type AnimationDeclaration,
  type StaggerOptions,
  type GroupOptions,
  DeclarativeSequencer,
  SequenceBuilder
} from './DeclarativeSequencer';

// Export useSequence hook
export * from './useSequence';

// Export useAnimationSequence hook (NEW)
export * from './useAnimationSequence';

// Export Animation State Machine
export * from './AnimationStateMachine';

// Export useAnimationStateMachine hook
export * from './useAnimationStateMachine';

// Export Animation Interpolator
export * from './AnimationInterpolator';

// Export Animation Synchronizer
export * from './AnimationSynchronizer';

// Export Animation Event System
export {
  AnimationEventType,
  AnimationInteractionType,
  type AnimationEvent,
  type AnimationEventListener,
  type AnimationEventFilter,
  type AnimationEventMiddleware,
  type AnimationEventOptions,
  type AnimationEventTarget,
  type AnimationEventSubscription,
  AnimationEventBus,
  AnimationEventEmitter,
  AnimationEventManager
} from './AnimationEventSystem';

// Export Staggered Animation Utilities
export {
  DistributionPattern,
  StaggerDirection,
  GroupingStrategy,
  DistributionEasing,
  type ElementCategory,
  type ElementPosition,
  type StaggerTarget,
  type StaggeredAnimationConfig,
  type StaggerResult,
  StaggeredAnimator
} from './StaggeredAnimations';
