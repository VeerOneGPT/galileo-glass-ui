/**
 * Animation Hooks
 *
 * React hooks for animation effects
 */

// React hooks for interactive animations
export {
  useMouseCursorEffect as default,
  useMouseCursorEffect,
  type MouseCursorEffectOptions,
  type CursorEffectType,
} from './useMouseCursorEffect';

// Export core physics interactions from main hooks folder
export {
  usePhysicsInteraction,
  type PhysicsInteractionOptions,
  type PhysicsInteractionType,
  type PhysicsState,
} from '../../hooks/usePhysicsInteraction';

// Import the hook explicitly to use with our wrapper functions
import usePhysicsInteraction from '../../hooks/usePhysicsInteraction';
import { PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';

// Export legacy hook names for backward compatibility with proper typing
export const useMouseMagneticEffect = <T extends HTMLElement = HTMLElement>(
  options: PhysicsInteractionOptions = {}
) => {
  return usePhysicsInteraction<T>(options);
};

export const useMagneticButton = <T extends HTMLElement = HTMLElement>(
  options: PhysicsInteractionOptions = {}
) => {
  return usePhysicsInteraction<T>(options);
};
