/**
 * Animation Hooks
 * 
 * React hooks for animation effects
 */

// React hooks for interactive animations
export { default as useMouseCursorEffect, type MouseCursorEffectOptions, type CursorEffectType } from './useMouseCursorEffect';

// Export core physics interactions from main hooks folder
export { 
  usePhysicsInteraction, 
  type PhysicsInteractionOptions, 
  type PhysicsInteractionType, 
  type PhysicsState
} from '../../hooks/usePhysicsInteraction';

// Export legacy hook names for backward compatibility
export { usePhysicsInteraction as useMouseMagneticEffect } from '../../hooks/usePhysicsInteraction';
export { usePhysicsInteraction as useMagneticButton } from '../../hooks/usePhysicsInteraction';