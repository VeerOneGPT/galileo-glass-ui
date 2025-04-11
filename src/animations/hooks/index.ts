/**
 * Animation Hooks
 *
 * React hooks for animation effects and the new Galileo Glass animation engine.
 * These hooks provide a cleaner, more React-friendly way to use the animation system.
 */

// Import hooks for bundling in default export
import { useMouseCursorEffect } from './useMouseCursorEffect';
import usePhysicsInteraction from '../../hooks/usePhysicsInteraction';
import useAnimation from './useAnimation';
import useAnimationInterpolator from './useAnimationInterpolator';
import useAnimationSequence from './useAnimationSequence';
import useStaggeredAnimation from './useStaggeredAnimation';
import { PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';

// Core legacy hooks
export {
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

// Core hook for animations
export { default as useAnimation } from './useAnimation';
export type { 
  AnimationStyle,
  UseAnimationReturn,
} from './useAnimation';

// Value interpolation hook
export { default as useAnimationInterpolator } from './useAnimationInterpolator';
export type { 
  UseAnimationInterpolatorReturn,
  InterpolationFunction,
} from './useAnimationInterpolator';

// Animation sequence hook
export { default as useAnimationSequence } from './useAnimationSequence';
export type { 
  AnimationStage,
  AnimationSequence,
  UseAnimationSequenceReturn,
} from './useAnimationSequence';
export { PlaybackState } from './useAnimationSequence';

// Staggered animation hook
export { default as useStaggeredAnimation } from './useStaggeredAnimation';
export type { 
  StaggeredAnimationOptions,
  UseStaggeredAnimationReturn,
} from './useStaggeredAnimation';

// Consolidated default export with all hooks
export default {
  // Legacy hooks
  useMouseCursorEffect,
  usePhysicsInteraction,
  useMouseMagneticEffect,
  useMagneticButton,
  
  // New animation engine hooks
  useAnimation,
  useAnimationInterpolator,
  useAnimationSequence,
  useStaggeredAnimation,
};
