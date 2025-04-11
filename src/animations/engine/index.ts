/**
 * Animation Engine
 * 
 * Exports the new animation engine components that form the foundation
 * of the redesigned Galileo Glass animation system.
 */

// Export timing provider
export { getTimingProvider, BrowserTimingProvider } from './TimingProvider';
export type { 
  TimingProvider,
  AnimationFrameCallback,
} from './TimingProvider';
import timingProvider from './TimingProvider';

// Export style processor
export { 
  QueuedStyleProcessor,
  DirectStyleProcessor,
  getStyleProcessor,
} from './StyleProcessor';
export type {
  StyleProcessor,
  StyleUpdate,
  StyleRemoval,
} from './StyleProcessor';
import styleProcessor from './StyleProcessor';

// Export animation state manager
export {
  AnimationState,
  AnimationEvent,
  StateMachineAnimationStateManager,
  SimpleAnimationStateManager,
  createAnimationStateManager,
} from './AnimationStateManager';
export type {
  StateTransition,
  StateHandler,
  AnimationStateManager,
} from './AnimationStateManager';

// Export animation controller
export {
  StandardAnimationController,
  createAnimationController,
} from './AnimationController';
export type {
  AnimationOptions,
  AnimationCallbacks,
  AnimationController,
} from './AnimationController';
import { createAnimationController } from './AnimationController';

// Create a factory function to get all components together
export function createAnimationEngine() {
  return {
    timingProvider,
    styleProcessor,
    createAnimationController,
  };
}

/**
 * Default export with all components
 */
export default {
  timingProvider,
  styleProcessor,
  createAnimationController,
  createAnimationEngine,
}; 