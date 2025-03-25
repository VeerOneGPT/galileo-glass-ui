/**
 * Galileo Glass UI - Animations
 * 
 * Animation system for Glass UI components.
 */

// Animation utilities
export { animate, accessibleAnimation, conditionalAnimate } from './animationUtils';

// Keyframes
export { fadeIn, fadeOut, slideUp, slideDown } from './keyframes/basic';
export { glassFadeIn, glassFadeOut, glassReveal } from './keyframes/glass';

// Physics animations
export { springAnimation, type SpringAnimationOptions } from './physics/springAnimation';
export { particleSystem, type ParticleSystemOptions } from './physics/particleSystem';
export { magneticEffect, type MagneticEffectOptions } from './physics/magneticEffect';

// Animation hooks
export { 
  useMouseCursorEffect,
  usePhysicsInteraction,
  useMouseMagneticEffect,  // Legacy alias for backward compatibility
  useMagneticButton,       // Legacy alias for backward compatibility
  type MouseCursorEffectOptions,
  type CursorEffectType,
  type PhysicsInteractionOptions,
  type PhysicsInteractionType,
  type PhysicsState
} from './hooks';

// Reduced motion
export { useReducedMotion } from '../hooks/useReducedMotion';

// Version
export const version = '1.1.0';