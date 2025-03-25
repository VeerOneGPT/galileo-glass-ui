/**
 * Motion Animation Keyframes
 * 
 * Motion-based animation keyframes with reduced motion alternatives
 */
import { keyframes } from 'styled-components';

/**
 * Slide in from bottom animation
 */
export const slideInBottom = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * Reduced motion alternative for slideInBottom
 * Uses only opacity for a more subtle effect
 */
export const reducedSlideInBottom = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Slide in from top animation
 */
export const slideInTop = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * Reduced motion alternative for slideInTop
 */
export const reducedSlideInTop = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Slide in from left animation
 */
export const slideInLeft = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

/**
 * Reduced motion alternative for slideInLeft
 */
export const reducedSlideInLeft = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Slide in from right animation
 */
export const slideInRight = keyframes`
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

/**
 * Reduced motion alternative for slideInRight
 */
export const reducedSlideInRight = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Zoom in animation
 */
export const zoomIn = keyframes`
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

/**
 * Reduced motion alternative for zoomIn
 */
export const reducedZoomIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Zoom out animation
 */
export const zoomOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
`;

/**
 * Reduced motion alternative for zoomOut
 */
export const reducedZoomOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

/**
 * Spin animation
 */
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Reduced motion alternative for spin
 * Uses subtle pulsing instead of rotation
 */
export const reducedSpin = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

/**
 * Pulse animation
 */
export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

/**
 * Reduced motion alternative for pulse
 * Uses opacity instead of scale
 */
export const reducedPulse = keyframes`
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
`;

/**
 * Bounce animation
 */
export const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

/**
 * Reduced motion alternative for bounce
 */
export const reducedBounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    opacity: 1;
  }
  40% {
    opacity: 0.7;
  }
  60% {
    opacity: 0.9;
  }
`;

/**
 * Shake animation
 */
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

/**
 * Reduced motion alternative for shake
 * Uses color/opacity changes instead of movement
 */
export const reducedShake = keyframes`
  0%, 100% {
    opacity: 1;
  }
  25% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  75% {
    opacity: 0.7;
  }
`;

/**
 * Flip animation
 */
export const flip = keyframes`
  0% {
    transform: perspective(400px) rotateY(0);
    animation-timing-function: ease-out;
  }
  40% {
    transform: perspective(400px) translateZ(150px) rotateY(170deg);
    animation-timing-function: ease-out;
  }
  50% {
    transform: perspective(400px) translateZ(150px) rotateY(190deg) scale(1);
    animation-timing-function: ease-in;
  }
  80% {
    transform: perspective(400px) rotateY(360deg) scale(0.95);
    animation-timing-function: ease-in;
  }
  100% {
    transform: perspective(400px) scale(1);
    animation-timing-function: ease-in;
  }
`;

/**
 * Reduced motion alternative for flip
 */
export const reducedFlip = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

/**
 * Slide in up with fade animation
 */
export const slideInUpFade = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

/**
 * Slide out down with fade animation
 */
export const slideOutDownFade = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(20px);
    opacity: 0;
  }
`;

/**
 * Reduced motion alternative for slide in/out with fade
 */
export const reducedSlideFade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Subtle background shimmer animation for loading states
 */
export const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

/**
 * Reduced motion alternative for shimmer
 */
export const reducedShimmer = keyframes`
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0.5;
  }
`;

/**
 * Rotate animation
 */
export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/**
 * Reduced motion alternative for rotate
 */
export const reducedRotate = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

/**
 * Hover animation with slight float
 */
export const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

/**
 * Reduced motion alternative for float
 */
export const reducedFloat = keyframes`
  0% {
    box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 7px 20px 0 rgba(0, 0, 0, 0.15);
  }
  100% {
    box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
  }
`;

/**
 * Glow pulse animation for emphasis
 */
export const glowPulse = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.2);
  }
`;

/**
 * Reduced motion alternative for glow pulse
 */
export const reducedGlowPulse = keyframes`
  0% {
    opacity: 0.95;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.95;
  }
`;

/**
 * Typing animation
 */
export const typing = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

/**
 * Blinking cursor animation
 */
export const blink = keyframes`
  0%, 100% {
    border-color: transparent;
  }
  50% {
    border-color: currentColor;
  }
`;

/**
 * Reduced motion alternative for typing animation
 */
export const reducedTyping = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Focus ring pulse animation for accessibility
 */
export const focusRingPulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

/**
 * Reduced motion alternative for focus ring
 */
export const reducedFocusRing = keyframes`
  0% {
    outline-color: rgba(99, 102, 241, 0.6);
  }
  50% {
    outline-color: rgba(99, 102, 241, 1);
  }
  100% {
    outline-color: rgba(99, 102, 241, 0.6);
  }
`;

/**
 * Content fade in staggered animation
 */
export const contentFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Reduced motion alternative for content fade in
 */
export const reducedContentFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Scale with fade animation
 */
export const scaleFade = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

/**
 * Reduced motion alternative for scale fade
 */
export const reducedScaleFade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Map of standard animations to their reduced motion alternatives
 */
export const REDUCED_MOTION_MAP = {
  // Basic animations
  slideInBottom: reducedSlideInBottom,
  slideInTop: reducedSlideInTop,
  slideInLeft: reducedSlideInLeft,
  slideInRight: reducedSlideInRight,
  zoomIn: reducedZoomIn,
  zoomOut: reducedZoomOut,
  
  // Motion animations
  spin: reducedSpin,
  pulse: reducedPulse,
  bounce: reducedBounce,
  shake: reducedShake,
  flip: reducedFlip,
  slideInUpFade: reducedSlideFade,
  slideOutDownFade: reducedSlideFade,
  shimmer: reducedShimmer,
  rotate: reducedRotate,
  float: reducedFloat,
  glowPulse: reducedGlowPulse,
  typing: reducedTyping,
  focusRingPulse: reducedFocusRing,
  contentFadeIn: reducedContentFadeIn,
  scaleFade: reducedScaleFade
};