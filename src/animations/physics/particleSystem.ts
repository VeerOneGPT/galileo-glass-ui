/**
 * Particle System
 * 
 * Physics-based particle animation system for sophisticated effects
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../../core/cssUtils';

/**
 * Particle system options
 */
export interface ParticleSystemOptions {
  /**
   * Number of particles to generate
   */
  particleCount?: number;
  
  /**
   * Type of particle effect
   */
  type?: 'confetti' | 'dust' | 'sparkle' | 'bubble' | 'smoke' | 'custom';
  
  /**
   * Duration of particle animation in milliseconds
   */
  duration?: number;
  
  /**
   * Delay before animation starts in milliseconds
   */
  delay?: number;
  
  /**
   * Size of particles in pixels (or range [min, max])
   */
  size?: number | [number, number];
  
  /**
   * Particle colors (array of colors to use)
   */
  colors?: string[];
  
  /**
   * Spread distance in pixels (how far particles travel)
   */
  spread?: number;
  
  /**
   * Gravity effect (0-1, higher = stronger pull down)
   */
  gravity?: number;
  
  /**
   * If true, particles fade out over time
   */
  fadeOut?: boolean;
  
  /**
   * Turbulence amount (0-1, random movement)
   */
  turbulence?: number;
  
  /**
   * For custom type, a custom CSS snippet
   */
  customCss?: string;
  
  /**
   * If true, will optimize for GPU acceleration
   */
  gpuAccelerated?: boolean;
  
  /**
   * If true, reduces particle count for better performance
   */
  performanceMode?: boolean;
  
  /**
   * Emission shape ('point', 'circle', 'rectangle')
   */
  emissionShape?: 'point' | 'circle' | 'rectangle';
  
  /**
   * Emission area size in pixels
   */
  emissionArea?: number | [number, number];
  
  /**
   * If true, reduces motion for accessibility
   */
  reducedMotion?: boolean;
}

/**
 * Generate random value between min and max
 */
const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Generate particle animation CSS for given type
 */
const generateParticleAnimation = (
  type: string,
  index: number,
  options: ParticleSystemOptions
): string => {
  const {
    duration = 1000,
    size = 5,
    colors = ['#ffffff', '#f0f0f0', '#e0e0e0'],
    spread = 100,
    gravity = 0.3,
    fadeOut = true,
    turbulence = 0.2,
  } = options;
  
  // Calculate particle size
  const particleSize = Array.isArray(size) 
    ? random(size[0], size[1]) 
    : size * random(0.5, 1.5);
  
  // Select random color from the array
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Calculate random delay for staggered animation
  const staggerDelay = Math.random() * 200;
  
  // Calculate random position and movement
  const startX = 0;
  const startY = 0;
  const angle = random(0, Math.PI * 2);
  const velocity = random(0.5, 1.5);
  const endX = Math.cos(angle) * spread * random(0.3, 1);
  const endY = Math.sin(angle) * spread * random(0.3, 1) + (gravity * spread);
  
  // Add turbulence as midpoint displacement
  const midX1 = startX + endX * 0.33 + random(-spread * turbulence, spread * turbulence);
  const midY1 = startY + endY * 0.33 + random(-spread * turbulence, spread * turbulence);
  const midX2 = startX + endX * 0.66 + random(-spread * turbulence, spread * turbulence);
  const midY2 = startY + endY * 0.66 + random(-spread * turbulence, spread * turbulence);
  
  // Generate animation name
  const animationName = `particle${type}${index}`;
  
  // Generate keyframes based on particle type
  let keyframes = '';
  let particleStyles = '';
  
  switch (type) {
    case 'confetti':
      keyframes = `
        @keyframes ${animationName} {
          0% {
            transform: translate(${startX}px, ${startY}px) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translate(${midX1}px, ${midY1}px) rotate(${random(-180, 180)}deg);
            opacity: ${fadeOut ? 0.9 : 1};
          }
          50% {
            transform: translate(${midX2}px, ${midY2}px) rotate(${random(-180, 180)}deg);
            opacity: ${fadeOut ? 0.6 : 1};
          }
          100% {
            transform: translate(${endX}px, ${endY}px) rotate(${random(-360, 360)}deg);
            opacity: ${fadeOut ? 0 : 1};
          }
        }
      `;
      
      particleStyles = `
        position: absolute;
        width: ${particleSize}px;
        height: ${particleSize * random(0.8, 3)}px;
        background-color: ${color};
        border-radius: ${Math.random() > 0.5 ? '0' : '50%'};
        top: 50%;
        left: 50%;
        pointer-events: none;
        animation: ${animationName} ${duration + random(-100, 100)}ms cubic-bezier(0.215, 0.61, 0.355, 1) ${staggerDelay}ms forwards;
      `;
      break;
      
    case 'dust':
      keyframes = `
        @keyframes ${animationName} {
          0% {
            transform: translate(${startX}px, ${startY}px) scale(0);
            opacity: 0;
          }
          25% {
            transform: translate(${midX1}px, ${midY1}px) scale(${random(0.5, 1.5)});
            opacity: ${fadeOut ? 0.8 : 1};
          }
          75% {
            transform: translate(${midX2}px, ${midY2}px) scale(${random(0.3, 1)});
            opacity: ${fadeOut ? 0.4 : 1};
          }
          100% {
            transform: translate(${endX}px, ${endY}px) scale(${random(0, 0.5)});
            opacity: 0;
          }
        }
      `;
      
      particleStyles = `
        position: absolute;
        width: ${particleSize}px;
        height: ${particleSize}px;
        background-color: ${color};
        border-radius: 50%;
        top: 50%;
        left: 50%;
        pointer-events: none;
        filter: blur(${particleSize * 0.5}px);
        animation: ${animationName} ${duration + random(-200, 200)}ms ease-out ${staggerDelay}ms forwards;
      `;
      break;
      
    case 'sparkle':
      keyframes = `
        @keyframes ${animationName} {
          0% {
            transform: translate(${startX}px, ${startY}px) scale(0) rotate(0deg);
            opacity: 0;
          }
          25% {
            transform: translate(${midX1 * 0.3}px, ${midY1 * 0.3}px) scale(${random(0.8, 1.2)}) rotate(${random(0, 90)}deg);
            opacity: 1;
          }
          50% {
            transform: translate(${midX2 * 0.6}px, ${midY2 * 0.6}px) scale(${random(0.9, 1.1)}) rotate(${random(90, 180)}deg);
            opacity: ${fadeOut ? 0.9 : 1};
          }
          100% {
            transform: translate(${endX * 0.8}px, ${endY * 0.8}px) scale(0) rotate(${random(180, 360)}deg);
            opacity: 0;
          }
        }
      `;
      
      particleStyles = `
        position: absolute;
        width: ${particleSize}px;
        height: ${particleSize}px;
        background-color: transparent;
        border-radius: 0;
        clip-path: polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%);
        background-color: ${color};
        box-shadow: 0 0 ${particleSize * 2}px ${color};
        top: 50%;
        left: 50%;
        pointer-events: none;
        animation: ${animationName} ${Math.max(300, duration * 0.7 + random(-100, 100))}ms ease-out ${staggerDelay}ms forwards;
      `;
      break;
      
    case 'bubble':
      keyframes = `
        @keyframes ${animationName} {
          0% {
            transform: translate(${startX}px, ${startY}px) scale(0);
            opacity: 0;
            border-width: ${particleSize * 0.1}px;
          }
          20% {
            transform: translate(${midX1 * 0.5}px, ${midY1 * 0.3}px) scale(${random(0.8, 1)});
            opacity: ${fadeOut ? 0.9 : 1};
            border-width: ${particleSize * 0.08}px;
          }
          80% {
            transform: translate(${midX2 * 0.8}px, ${-Math.abs(midY2 * 0.8)}px) scale(${random(0.9, 1.2)});
            opacity: ${fadeOut ? 0.6 : 1};
            border-width: ${particleSize * 0.04}px;
          }
          100% {
            transform: translate(${endX * 0.9}px, ${-Math.abs(endY * 1.2)}px) scale(${random(1.1, 1.3)});
            opacity: 0;
            border-width: 0;
          }
        }
      `;
      
      particleStyles = `
        position: absolute;
        width: ${particleSize}px;
        height: ${particleSize}px;
        background-color: transparent;
        border: ${particleSize * 0.1}px solid ${color};
        border-radius: 50%;
        top: 50%;
        left: 50%;
        pointer-events: none;
        animation: ${animationName} ${duration + random(-100, 300)}ms cubic-bezier(0.175, 0.885, 0.32, 1.275) ${staggerDelay}ms forwards;
      `;
      break;
      
    case 'smoke':
      keyframes = `
        @keyframes ${animationName} {
          0% {
            transform: translate(${startX}px, ${startY}px) scale(0.5) rotate(0deg);
            opacity: 0;
            filter: blur(${particleSize * 0.5}px);
          }
          25% {
            transform: translate(${midX1 * 0.5}px, ${-Math.abs(midY1 * 0.8)}px) scale(${random(0.6, 0.8)}) rotate(${random(5, 15)}deg);
            opacity: ${fadeOut ? 0.3 : 0.5};
            filter: blur(${particleSize * 0.8}px);
          }
          75% {
            transform: translate(${midX2 * 0.8}px, ${-Math.abs(midY2 * 1.2)}px) scale(${random(0.9, 1.2)}) rotate(${random(10, 30)}deg);
            opacity: ${fadeOut ? 0.2 : 0.4};
            filter: blur(${particleSize * 1.2}px);
          }
          100% {
            transform: translate(${endX * 0.7 + random(-20, 20)}px, ${-Math.abs(endY * 1.5)}px) scale(${random(1.2, 1.8)}) rotate(${random(20, 45)}deg);
            opacity: 0;
            filter: blur(${particleSize * 1.5}px);
          }
        }
      `;
      
      particleStyles = `
        position: absolute;
        width: ${particleSize * random(1, 2)}px;
        height: ${particleSize * random(1, 2)}px;
        background-color: ${color};
        border-radius: 50%;
        top: 50%;
        left: 50%;
        pointer-events: none;
        mix-blend-mode: screen;
        animation: ${animationName} ${duration + random(500, 1000)}ms ease-out ${staggerDelay}ms forwards;
      `;
      break;
      
    case 'custom':
      // Use custom CSS if provided
      return options.customCss || '';
      
    default:
      // Default to confetti if type is not recognized
      return generateParticleAnimation('confetti', index, options);
  }
  
  return `
    ${keyframes}
    &::before { content: ''; ${particleStyles} }
  `;
};

/**
 * Creates a particle system animation
 */
export const particleSystem = (options: ParticleSystemOptions = {}) => {
  const {
    particleCount = 20,
    type = 'confetti',
    performanceMode = false,
    gpuAccelerated = true,
    reducedMotion = false,
  } = options;
  
  // If reduced motion is enabled, return minimal style
  if (reducedMotion) {
    return cssWithKebabProps`
      position: relative;
    `;
  }
  
  // Reduce particle count if in performance mode
  const actualParticleCount = performanceMode ? Math.floor(particleCount / 2) : particleCount;
  
  // Generate particle animations
  let particleStyles = '';
  for (let i = 0; i < actualParticleCount; i++) {
    particleStyles += generateParticleAnimation(type, i, options);
  }
  
  // Add GPU acceleration if requested
  const gpuStyles = gpuAccelerated ? `
    will-change: transform, opacity;
    backface-visibility: hidden;
  ` : '';
  
  // Build the final CSS
  return cssWithKebabProps`
    position: relative;
    overflow: visible;
    ${gpuStyles}
    ${particleStyles}
  `;
};

export default particleSystem;