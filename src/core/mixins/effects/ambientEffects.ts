/**
 * Ambient Effects Mixin
 * 
 * Creates ambient lighting effects for components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../../cssUtils';
import { withAlpha } from '../../colorUtils';

/**
 * Ambient effects options
 */
export interface AmbientEffectsOptions {
  /**
   * Type of ambient effect
   */
  type?: 'soft' | 'pulsing' | 'colorShift' | 'directional' | 'spotlight' | 'glowing';
  
  /**
   * Primary color of the effect
   */
  color?: string;
  
  /**
   * Secondary color for effects that use multiple colors
   */
  secondaryColor?: string;
  
  /**
   * Intensity of the effect (0-1)
   */
  intensity?: 'subtle' | 'light' | 'medium' | 'strong' | number;
  
  /**
   * Size of the effect
   */
  size?: 'small' | 'medium' | 'large' | number;
  
  /**
   * Direction of the effect (for directional effects)
   */
  direction?: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /**
   * Animation speed in seconds
   */
  animationSpeed?: 'slow' | 'medium' | 'fast' | number;
  
  /**
   * If true, animation will alternate
   */
  alternate?: boolean;
  
  /**
   * Animation delay in seconds
   */
  delay?: number;
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Get intensity value
 */
const getIntensityValue = (intensity?: 'subtle' | 'light' | 'medium' | 'strong' | number): number => {
  if (typeof intensity === 'number') return Math.min(Math.max(intensity, 0), 1);
  
  switch (intensity) {
    case 'subtle': return 0.15;
    case 'light': return 0.3;
    case 'medium': return 0.5;
    case 'strong': return 0.8;
    default: return 0.3;
  }
};

/**
 * Get size value
 */
const getSizeValue = (size?: 'small' | 'medium' | 'large' | number): number => {
  if (typeof size === 'number') return size;
  
  switch (size) {
    case 'small': return 100;
    case 'medium': return 200;
    case 'large': return 300;
    default: return 200;
  }
};

/**
 * Get animation speed
 */
const getAnimationSpeed = (speed?: 'slow' | 'medium' | 'fast' | number): number => {
  if (typeof speed === 'number') return speed;
  
  switch (speed) {
    case 'slow': return 6;
    case 'medium': return 3;
    case 'fast': return 1.5;
    default: return 3;
  }
};

/**
 * Get directional value in degrees
 */
const getDirectionDegrees = (direction?: string): number => {
  switch (direction) {
    case 'top': return 0;
    case 'top-right': return 45;
    case 'right': return 90;
    case 'bottom-right': return 135;
    case 'bottom': return 180;
    case 'bottom-left': return 225;
    case 'left': return 270;
    case 'top-left': return 315;
    default: return 0;
  }
};

/**
 * Creates a soft ambient lighting effect
 */
const createSoftAmbientEffect = (options: AmbientEffectsOptions, isDarkMode: boolean): string => {
  const { color, intensity, size } = options;
  
  const intensityValue = getIntensityValue(intensity);
  const sizeValue = getSizeValue(size);
  const effectColor = color || (isDarkMode ? '#5b6ecc' : '#3b82f6');
  
  return `
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${sizeValue}%;
      height: ${sizeValue}%;
      border-radius: 50%;
      background: ${withAlpha(effectColor, intensityValue * 0.5)};
      transform: translate(-50%, -50%);
      pointer-events: none;
      filter: blur(${sizeValue / 4}px);
      z-index: -1;
    }
  `;
};

/**
 * Creates a pulsing ambient effect
 */
const createPulsingAmbientEffect = (options: AmbientEffectsOptions, isDarkMode: boolean): string => {
  const { color, intensity, size, animationSpeed, alternate, delay } = options;
  
  const intensityValue = getIntensityValue(intensity);
  const sizeValue = getSizeValue(size);
  const speed = getAnimationSpeed(animationSpeed);
  const effectColor = color || (isDarkMode ? '#5b6ecc' : '#3b82f6');
  const animationDelay = delay || 0;
  
  return `
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${sizeValue}%;
      height: ${sizeValue}%;
      border-radius: 50%;
      background: ${withAlpha(effectColor, intensityValue * 0.5)};
      transform: translate(-50%, -50%);
      pointer-events: none;
      filter: blur(${sizeValue / 4}px);
      z-index: -1;
      animation: pulseAmbient ${speed}s ${alternate ? 'alternate' : 'ease-in-out'} infinite;
      animation-delay: ${animationDelay}s;
    }
    
    @keyframes pulseAmbient {
      0% {
        opacity: ${intensityValue * 0.3};
        transform: translate(-50%, -50%) scale(0.85);
      }
      
      50% {
        opacity: ${intensityValue * 0.6};
        transform: translate(-50%, -50%) scale(1.05);
      }
      
      100% {
        opacity: ${intensityValue * 0.3};
        transform: translate(-50%, -50%) scale(0.85);
      }
    }
  `;
};

/**
 * Creates a color shifting ambient effect
 */
const createColorShiftAmbientEffect = (options: AmbientEffectsOptions, isDarkMode: boolean): string => {
  const { color, secondaryColor, intensity, size, animationSpeed, alternate, delay } = options;
  
  const intensityValue = getIntensityValue(intensity);
  const sizeValue = getSizeValue(size);
  const speed = getAnimationSpeed(animationSpeed);
  const primaryColor = color || (isDarkMode ? '#5b6ecc' : '#3b82f6');
  const secondColor = secondaryColor || (isDarkMode ? '#a855f7' : '#8b5cf6');
  const animationDelay = delay || 0;
  
  return `
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${sizeValue}%;
      height: ${sizeValue}%;
      border-radius: 50%;
      background: ${withAlpha(primaryColor, intensityValue * 0.5)};
      transform: translate(-50%, -50%);
      pointer-events: none;
      filter: blur(${sizeValue / 4}px);
      z-index: -1;
      animation: colorShiftAmbient ${speed}s ${alternate ? 'alternate' : 'ease-in-out'} infinite;
      animation-delay: ${animationDelay}s;
    }
    
    @keyframes colorShiftAmbient {
      0% {
        background: ${withAlpha(primaryColor, intensityValue * 0.5)};
      }
      
      50% {
        background: ${withAlpha(secondColor, intensityValue * 0.6)};
      }
      
      100% {
        background: ${withAlpha(primaryColor, intensityValue * 0.5)};
      }
    }
  `;
};

/**
 * Creates a directional ambient lighting effect
 */
const createDirectionalAmbientEffect = (options: AmbientEffectsOptions, isDarkMode: boolean): string => {
  const { color, intensity, size, direction } = options;
  
  const intensityValue = getIntensityValue(intensity);
  const sizeValue = getSizeValue(size);
  const effectColor = color || (isDarkMode ? '#5b6ecc' : '#3b82f6');
  const directionDegrees = getDirectionDegrees(direction);
  
  return `
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(${directionDegrees}deg, ${withAlpha(effectColor, intensityValue)}, transparent);
      pointer-events: none;
      filter: blur(${sizeValue / 10}px);
      z-index: -1;
    }
  `;
};

/**
 * Creates a spotlight ambient effect
 */
const createSpotlightAmbientEffect = (options: AmbientEffectsOptions, isDarkMode: boolean): string => {
  const { color, intensity, size, direction } = options;
  
  const intensityValue = getIntensityValue(intensity);
  const sizeValue = getSizeValue(size);
  const effectColor = color || (isDarkMode ? '#ffffff' : '#ffffff');
  
  // Calculate position based on direction
  let posX = '50%', posY = '50%';
  if (direction) {
    if (direction.includes('top')) posY = '20%';
    if (direction.includes('bottom')) posY = '80%';
    if (direction.includes('left')) posX = '20%';
    if (direction.includes('right')) posX = '80%';
  }
  
  return `
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at ${posX} ${posY}, ${withAlpha(effectColor, intensityValue * 0.8)}, transparent 70%);
      pointer-events: none;
      z-index: -1;
    }
  `;
};

/**
 * Creates a glowing ambient effect
 */
const createGlowingAmbientEffect = (options: AmbientEffectsOptions, isDarkMode: boolean): string => {
  const { color, intensity, size, animationSpeed, alternate } = options;
  
  const intensityValue = getIntensityValue(intensity);
  const sizeValue = getSizeValue(size);
  const speed = getAnimationSpeed(animationSpeed);
  const effectColor = color || (isDarkMode ? '#5b6ecc' : '#3b82f6');
  
  return `
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${sizeValue}%;
      height: ${sizeValue}%;
      border-radius: 50%;
      background: ${withAlpha(effectColor, intensityValue * 0.5)};
      transform: translate(-50%, -50%);
      pointer-events: none;
      filter: blur(${sizeValue / 3}px);
      z-index: -1;
      animation: glowingAmbient ${speed}s ${alternate ? 'alternate' : 'ease-in-out'} infinite;
    }
    
    @keyframes glowingAmbient {
      0%, 100% {
        filter: blur(${sizeValue / 3}px) brightness(0.9);
      }
      
      50% {
        filter: blur(${sizeValue / 2.5}px) brightness(1.3);
      }
    }
  `;
};

/**
 * Creates ambient lighting effects
 */
export const ambientEffects = (options: AmbientEffectsOptions) => {
  const {
    type = 'soft',
    themeContext,
  } = options;
  
  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;
  
  // Generate the ambient effect based on type
  let effectCss = '';
  
  switch (type) {
    case 'soft':
      effectCss = createSoftAmbientEffect(options, isDarkMode);
      break;
    case 'pulsing':
      effectCss = createPulsingAmbientEffect(options, isDarkMode);
      break;
    case 'colorShift':
      effectCss = createColorShiftAmbientEffect(options, isDarkMode);
      break;
    case 'directional':
      effectCss = createDirectionalAmbientEffect(options, isDarkMode);
      break;
    case 'spotlight':
      effectCss = createSpotlightAmbientEffect(options, isDarkMode);
      break;
    case 'glowing':
      effectCss = createGlowingAmbientEffect(options, isDarkMode);
      break;
    default:
      effectCss = createSoftAmbientEffect(options, isDarkMode);
  }
  
  // Build the CSS
  return cssWithKebabProps`
    ${effectCss}
  `;
};

export default ambientEffects;