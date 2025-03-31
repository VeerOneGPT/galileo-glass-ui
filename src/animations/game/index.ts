/**
 * Game Animation Module
 * 
 * Provides tools for creating game-like animation transitions
 * and state-based animation systems.
 */

export { default as useGameAnimation } from './useGameAnimation';

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