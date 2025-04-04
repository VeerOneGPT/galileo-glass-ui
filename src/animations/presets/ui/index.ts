/**
 * UI Animation Presets Index
 *
 * Exports all UI-specific animation presets.
 */

import { keyframes } from 'styled-components';
import type { AnimationPreset } from '../../core/types';
import { animationTimings, animationEasings, AnimationIntensity } from '../accessibleAnimations';

// Button animations
export * from './buttonAnimations';

// Modal/Dialog animations
export * from './modalAnimations';

// Card animations
export * from './cardAnimations';

// Combine all animations for easier access
import { buttonAnimations } from './buttonAnimations';
import { cardAnimations } from './cardAnimations';
import { modalAnimations } from './modalAnimations';

// --- New UI Feedback Animations --- 

// Shake Keyframes
const shakeKeyframes = keyframes`
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(3px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
`;

// Pulse Keyframes
const pulseKeyframes = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

// Simplified Confetti Keyframes (Placeholder - basic fade out)
// A real implementation would involve multiple elements/particles.
// This preset might need a component-level implementation later.
const confettiFadeOut = keyframes`
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(20px) scale(0.5); }
`;

// Need fadeAnimation for pulse reduced motion alternative
// Ideally, accessibleAnimations should export its presets individually
// Temporary workaround: copy fadeAnimation definition here
const fadeAnimation: AnimationPreset = {
  keyframes: keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
  `,
  duration: animationTimings.normal,
  easing: animationEasings.standard,
  fillMode: 'both',
  intensity: AnimationIntensity.SUBTLE,
};

// Shake Preset
export const shake: AnimationPreset = {
  keyframes: shakeKeyframes,
  duration: animationTimings.fast,
  easing: animationEasings.standard,
  intensity: AnimationIntensity.STANDARD,
  reducedMotionAlternative: null,
};

// Pulse Preset
export const pulse: AnimationPreset = {
  keyframes: pulseKeyframes,
  duration: animationTimings.emphasized,
  easing: animationEasings.standard,
  intensity: AnimationIntensity.SUBTLE,
  iterations: 'infinite',
  reducedMotionAlternative: {
      ...fadeAnimation,
      duration: animationTimings.emphasized,
      iterations: 'infinite',
      intensity: AnimationIntensity.SUBTLE,
  },
};

// Confetti Preset (Simplified)
export const confetti: AnimationPreset = {
  keyframes: confettiFadeOut,
  duration: animationTimings.normal,
  easing: animationEasings.standard,
  intensity: AnimationIntensity.EXPRESSIVE,
  reducedMotionAlternative: null,
};

// --- Export all UI animations --- 

export const uiAnimations = {
  ...buttonAnimations,
  ...modalAnimations,
  ...cardAnimations,

  // Categorized access
  button: buttonAnimations,
  modal: modalAnimations,
  card: cardAnimations,

  // Add new feedback animations directly
  shake,
  pulse,
  confetti,
};
