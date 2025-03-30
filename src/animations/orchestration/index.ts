/**
 * Animation Orchestration
 *
 * System for coordinating complex animations across components.
 */

// Export Gestalt patterns for animation - selective export to avoid ambiguity
export { 
  GestaltPatterns,
  coordinatedAnimations,
  createStaggeredSequence
} from './GestaltPatterns';
export type { 
  StaggerOptions, 
  StaggeredSequenceOptions, 
  AnimationSequenceItem
} from './GestaltPatterns';
// Explicit exports to resolve ambiguity
export { createStaggeredAnimation } from './GestaltPatterns';
export { createAnimationSequence } from './GestaltPatterns';

// Export Animation Orchestrator - selective export to avoid ambiguity
export {
  AnimationOrchestrator,
  animationOrchestrator,
  withOrchestration
} from './Orchestrator';
export type { 
  AnimationTarget,
  AnimationSequence
} from './Orchestrator';
// Explicit exports to resolve ambiguity
export type { AnimationEventListener } from './Orchestrator';
export type { AnimationEventType } from './Orchestrator';

// Export Declarative Animation Sequencer
export * from './DeclarativeSequencer';

// Export useSequence hook
export * from './useSequence';

// Export Animation State Machine
export * from './AnimationStateMachine';

// Export useAnimationStateMachine hook
export * from './useAnimationStateMachine';

// Export Animation Interpolator
export * from './AnimationInterpolator';
export { default as AnimationInterpolator } from './AnimationInterpolator';

// Export Animation Synchronizer
export * from './AnimationSynchronizer';
export { animationSynchronizer } from './AnimationSynchronizer';

// Export Animation Event System
export * from './AnimationEventSystem';
export { animationEventBus, animationEventManager } from './AnimationEventSystem';

// Export Animation Sequence hook
export * from './useAnimationSequence';
export { default as useAnimationSequence } from './useAnimationSequence';

// Export Staggered Animation Utilities - explicit exports to resolve ambiguity
export { 
  staggeredAnimator 
} from './StaggeredAnimations';
export * from './StaggeredAnimations';
