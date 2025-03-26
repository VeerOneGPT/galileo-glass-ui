/**
 * UI Animation Presets Index
 * 
 * Exports all UI-specific animation presets.
 */

// Button animations
export * from './buttonAnimations';

// Modal/Dialog animations 
export * from './modalAnimations';

// Card animations
export * from './cardAnimations';

// Combine all animations for easier access
import { buttonAnimations } from './buttonAnimations';
import { modalAnimations } from './modalAnimations';
import { cardAnimations } from './cardAnimations';

// Combined UI animations object
export const uiAnimations = {
  ...buttonAnimations,
  ...modalAnimations,
  ...cardAnimations,
  
  // Categorized access
  button: buttonAnimations,
  modal: modalAnimations,
  card: cardAnimations
};