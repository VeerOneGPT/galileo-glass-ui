/**
 * Galileo Glass UI - Game Animation Module Index
 * Re-exports the main hooks and types for the game animation system.
 */

export { useGameAnimation } from './useGameAnimation';
// Re-export relevant types/enums if needed, directly from the central types file
// Example:
// export type { GameAnimationConfig, GameAnimationController, GameAnimationState, StateTransition } from '../types';
// export { TransitionType, TransitionDirection } from '../types';

// Export the game physics hook from the physics directory
export { 
  useGamePhysics,
  GamePhysicsBehavior,
  GameGravityPreset,
  type GamePhysicsConfig,
  type GamePhysicsResult,
  type GamePhysicsObjectConfig,
  type GamePhysicsEnvironment
} from '../physics/useGamePhysics';

// Export the refactored useGameAnimation hook
export { useGameAnimation as useGameAnimationRefactored } from './useGameAnimationRefactored';

// Export event emitter and middleware components
export * from './GameAnimationEventEmitter';
export * from './GameAnimationMiddleware';
export * from './GameAnimationController';