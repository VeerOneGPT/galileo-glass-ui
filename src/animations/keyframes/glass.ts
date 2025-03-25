/**
 * Glass Animation Keyframes
 * 
 * Animation keyframes specifically for glass effects
 */
import { keyframes } from 'styled-components';

/**
 * Glass fade in animation
 */
export const glassFadeIn = keyframes`
  from {
    opacity: 0;
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;

/**
 * Glass fade out animation
 */
export const glassFadeOut = keyframes`
  from {
    opacity: 1;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  to {
    opacity: 0;
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
  }
`;

/**
 * Glass reveal animation
 */
export const glassReveal = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.95);
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;

/**
 * Glass glow animation
 */
export const glassGlow = keyframes`
  0% {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
  }
  100% {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
  }
`;

/**
 * Glass border shine animation
 */
export const glassBorderShine = keyframes`
  0% {
    border-color: rgba(255, 255, 255, 0.1);
  }
  50% {
    border-color: rgba(255, 255, 255, 0.3);
  }
  100% {
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

/**
 * Glass activate animation
 */
export const glassActivate = keyframes`
  0% {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  50% {
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  }
  100% {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
`;