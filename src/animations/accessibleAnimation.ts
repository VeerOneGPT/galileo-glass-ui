/**
 * Accessible Animation
 * 
 * A re-export of accessible animation utilities for convenience
 */

// Export utilities from accessibility folder
export { 
  accessibleAnimation,
  conditionalAnimation,
  useAccessibleAnimation,
  getAccessibleKeyframes
} from './accessibility/accessibleAnimation';

// Export animations from keyframes directly
export { 
  fadeIn, 
  fadeOut, 
  slideUp, 
  slideDown, 
  slideInLeft,
  slideInRight,
  slideRight,
  scaleIn, 
  scaleOut, 
  pulse, 
  spin 
} from './keyframes/basic';

// All keyframes collection
const keyframes = {
  fadeIn: {},
  fadeOut: {},
  slideIn: {},
  slideOut: {},
  slideUp: {},
  slideDown: {},
  slideLeft: {},
  slideRight: {},
  slideInRight: {}, // Alias for slideRight
  zoomIn: {},
  zoomOut: {},
  pulse: {},
  rotate: {},
  bounce: {}
};