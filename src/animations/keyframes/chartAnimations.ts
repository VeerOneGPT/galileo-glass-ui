/**
 * Chart Animation Keyframes
 * 
 * Keyframe definitions specifically for chart components
 */
import { keyframes } from 'styled-components';

/**
 * Animation for drawing line charts
 */
export const drawLine = keyframes`
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

/**
 * Animation for fading elements in
 */
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/**
 * Animation for elements popping into view
 */
export const popIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
  70% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

/**
 * Animation for elements fading and sliding up
 */
export const fadeSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Animation for glowing pulse effect
 */
export const glowPulse = keyframes`
  0% {
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
  }
  100% {
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
  }
`;

/**
 * Animation for shimmering effect
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
 * Animation for active data points
 */
export const activePoint = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
`;

/**
 * Animation for tooltip fade in/out
 */
export const tooltipFade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

/**
 * Animation for atmospheric background movement
 */
export const atmosphericMovement = keyframes`
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
  33% {
    transform: translate(10%, 5%) scale(1.1);
    opacity: 0.7;
  }
  66% {
    transform: translate(-5%, 10%) scale(0.9);
    opacity: 0.6;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
`; 