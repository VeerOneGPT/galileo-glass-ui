/**
 * Background Effects Mixin
 * 
 * Creates advanced background effects for components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../cssUtils';
import { withAlpha } from '../colorUtils';

/**
 * Background effects options
 */
export interface BackgroundEffectsOptions {
  /**
   * Type of background effect
   */
  type?: 'gradient' | 'noise' | 'pattern' | 'animated' | 'mesh';
  
  /**
   * Base background color
   */
  baseColor?: string;
  
  /**
   * Secondary color for gradients or patterns
   */
  secondaryColor?: string;
  
  /**
   * Tertiary color for complex gradients
   */
  tertiaryColor?: string;
  
  /**
   * Background opacity
   */
  opacity?: 'subtle' | 'light' | 'medium' | 'strong' | number;
  
  /**
   * Angle for gradients (in degrees)
   */
  angle?: number;
  
  /**
   * Pattern density for noise or patterns (0-1)
   */
  density?: 'low' | 'medium' | 'high' | number;
  
  /**
   * Animation speed for animated backgrounds
   */
  animationSpeed?: 'slow' | 'medium' | 'fast' | number;
  
  /**
   * If true, applies a glass-like blur to the background
   */
  blur?: boolean | 'light' | 'medium' | 'strong' | number;
  
  /**
   * Pattern type for pattern backgrounds
   */
  patternType?: 'dots' | 'lines' | 'grid' | 'waves' | 'hexagons';
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Get opacity value
 */
const getOpacityValue = (opacity?: 'subtle' | 'light' | 'medium' | 'strong' | number): number => {
  if (typeof opacity === 'number') return opacity;
  
  switch (opacity) {
    case 'subtle': return 0.1;
    case 'light': return 0.2;
    case 'medium': return 0.4;
    case 'strong': return 0.7;
    default: return 0.3;
  }
};

/**
 * Get density value
 */
const getDensityValue = (density?: 'low' | 'medium' | 'high' | number): number => {
  if (typeof density === 'number') return density;
  
  switch (density) {
    case 'low': return 0.05;
    case 'medium': return 0.1;
    case 'high': return 0.2;
    default: return 0.1;
  }
};

/**
 * Get animation speed
 */
const getAnimationSpeed = (speed?: 'slow' | 'medium' | 'fast' | number): number => {
  if (typeof speed === 'number') return speed;
  
  switch (speed) {
    case 'slow': return 15;
    case 'medium': return 10;
    case 'fast': return 5;
    default: return 10;
  }
};

/**
 * Get blur value
 */
const getBlurValue = (blur?: boolean | 'light' | 'medium' | 'strong' | number): string => {
  if (blur === true) return '8px';
  if (blur === false) return '0px';
  
  if (typeof blur === 'number') return `${blur}px`;
  
  switch (blur) {
    case 'light': return '4px';
    case 'medium': return '8px';
    case 'strong': return '16px';
    default: return '8px';
  }
};

/**
 * Creates gradient background effect
 */
const createGradientBackground = (options: BackgroundEffectsOptions, isDarkMode: boolean): string => {
  const { 
    baseColor, 
    secondaryColor, 
    tertiaryColor,
    opacity, 
    angle = 135 
  } = options;
  
  // Determine colors
  const opacityValue = getOpacityValue(opacity);
  const firstColor = baseColor || (isDarkMode ? 'rgba(30, 41, 59, 1)' : 'rgba(219, 234, 254, 1)');
  const secondColor = secondaryColor || (isDarkMode ? 'rgba(15, 23, 42, 1)' : 'rgba(241, 245, 249, 1)');
  
  // Simple two-color gradient
  if (!tertiaryColor) {
    return `
      background: linear-gradient(${angle}deg, ${withAlpha(firstColor, opacityValue)}, ${withAlpha(secondColor, opacityValue)});
    `;
  }
  
  // Three-color gradient
  const thirdColor = tertiaryColor;
  return `
    background: linear-gradient(${angle}deg, ${withAlpha(firstColor, opacityValue)}, ${withAlpha(secondColor, opacityValue)}, ${withAlpha(thirdColor, opacityValue)});
  `;
};

/**
 * Creates noise texture background
 */
const createNoiseBackground = (options: BackgroundEffectsOptions, isDarkMode: boolean): string => {
  const { baseColor, opacity, density } = options;
  
  const opacityValue = getOpacityValue(opacity);
  const densityValue = getDensityValue(density);
  const color = baseColor || (isDarkMode ? 'rgba(15, 23, 42, 1)' : 'rgba(241, 245, 249, 1)');
  
  return `
    background-color: ${withAlpha(color, opacityValue)};
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${densityValue}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: ${isDarkMode ? 0.1 : 0.07};
      pointer-events: none;
    }
  `;
};

/**
 * Creates pattern background
 */
const createPatternBackground = (options: BackgroundEffectsOptions, isDarkMode: boolean): string => {
  const { baseColor, opacity, patternType, density } = options;
  
  const opacityValue = getOpacityValue(opacity);
  const densityValue = getDensityValue(density);
  const color = baseColor || (isDarkMode ? 'rgba(15, 23, 42, 1)' : 'rgba(241, 245, 249, 1)');
  let patternCss = '';
  
  switch (patternType) {
    case 'dots':
      patternCss = `
        background-color: ${withAlpha(color, opacityValue)};
        background-image: radial-gradient(${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} ${densityValue * 100}%, transparent ${densityValue * 100 + 1}%);
        background-size: ${30 / densityValue}px ${30 / densityValue}px;
      `;
      break;
    case 'lines':
      patternCss = `
        background-color: ${withAlpha(color, opacityValue)};
        background-image: linear-gradient(45deg, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 25%, transparent 25%, transparent 75%, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 75%, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}),
                      linear-gradient(45deg, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 25%, transparent 25%, transparent 75%, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 75%, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'});
        background-size: ${50 / densityValue}px ${50 / densityValue}px;
        background-position: 0 0, ${25 / densityValue}px ${25 / densityValue}px;
      `;
      break;
    case 'grid':
      patternCss = `
        background-color: ${withAlpha(color, opacityValue)};
        background-image: linear-gradient(${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px),
                          linear-gradient(90deg, ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px);
        background-size: ${40 / densityValue}px ${40 / densityValue}px;
      `;
      break;
    case 'waves':
      patternCss = `
        background-color: ${withAlpha(color, opacityValue)};
        background-image: repeating-radial-gradient(circle at 0 0, transparent 0, ${withAlpha(color, opacityValue)} ${40 / densityValue}px), 
                          repeating-linear-gradient(${isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)'}, ${isDarkMode ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)'});
      `;
      break;
    case 'hexagons':
      patternCss = `
        background-color: ${withAlpha(color, opacityValue)};
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23${isDarkMode ? 'FFFFFF' : '000000'}' fill-opacity='${isDarkMode ? '0.05' : '0.03'}'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        background-size: ${20 / densityValue}px ${34 / densityValue}px;
      `;
      break;
    default:
      patternCss = `
        background-color: ${withAlpha(color, opacityValue)};
      `;
  }
  
  return patternCss;
};

/**
 * Creates animated background
 */
const createAnimatedBackground = (options: BackgroundEffectsOptions, isDarkMode: boolean): string => {
  const { baseColor, secondaryColor, opacity, animationSpeed } = options;
  
  const opacityValue = getOpacityValue(opacity);
  const speed = getAnimationSpeed(animationSpeed);
  const firstColor = baseColor || (isDarkMode ? 'rgba(30, 41, 59, 1)' : 'rgba(219, 234, 254, 1)');
  const secondColor = secondaryColor || (isDarkMode ? 'rgba(15, 23, 42, 1)' : 'rgba(241, 245, 249, 1)');
  
  return `
    background: linear-gradient(-45deg, ${withAlpha(firstColor, opacityValue)}, ${withAlpha(secondColor, opacityValue)}, ${withAlpha(firstColor, opacityValue * 0.8)}, ${withAlpha(secondColor, opacityValue * 0.9)});
    background-size: 400% 400%;
    animation: gradientAnimation ${speed}s ease infinite;
    
    @keyframes gradientAnimation {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `;
};

/**
 * Creates mesh gradient background
 */
const createMeshBackground = (options: BackgroundEffectsOptions, isDarkMode: boolean): string => {
  const { baseColor, secondaryColor, tertiaryColor, opacity } = options;
  
  const opacityValue = getOpacityValue(opacity);
  const color1 = baseColor || (isDarkMode ? 'rgba(30, 41, 59, 1)' : 'rgba(219, 234, 254, 1)');
  const color2 = secondaryColor || (isDarkMode ? 'rgba(15, 23, 42, 1)' : 'rgba(241, 245, 249, 1)');
  const color3 = tertiaryColor || (isDarkMode ? 'rgba(44, 55, 72, 1)' : 'rgba(226, 232, 240, 1)');
  
  return `
    background-color: ${withAlpha(color1, opacityValue)};
    background-image: 
      radial-gradient(at 30% 20%, ${withAlpha(color2, opacityValue)} 0px, transparent 50%),
      radial-gradient(at 80% 80%, ${withAlpha(color3, opacityValue)} 0px, transparent 50%),
      radial-gradient(at 67% 13%, ${withAlpha(color2, opacityValue * 0.7)} 0px, transparent 50%),
      radial-gradient(at 10% 90%, ${withAlpha(color3, opacityValue * 0.8)} 0px, transparent 50%);
  `;
};

/**
 * Creates a background effect
 */
export const backgroundEffects = (options: BackgroundEffectsOptions) => {
  const {
    type = 'gradient',
    blur,
    themeContext,
  } = options;
  
  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;
  
  // Get blur value
  const blurValue = getBlurValue(blur);
  const hasBlur = blur !== false && blur !== 0;
  
  // Generate the background based on type
  let backgroundCss = '';
  
  switch (type) {
    case 'gradient':
      backgroundCss = createGradientBackground(options, isDarkMode);
      break;
    case 'noise':
      backgroundCss = createNoiseBackground(options, isDarkMode);
      break;
    case 'pattern':
      backgroundCss = createPatternBackground(options, isDarkMode);
      break;
    case 'animated':
      backgroundCss = createAnimatedBackground(options, isDarkMode);
      break;
    case 'mesh':
      backgroundCss = createMeshBackground(options, isDarkMode);
      break;
    default:
      backgroundCss = createGradientBackground(options, isDarkMode);
  }
  
  // Add backdrop blur if needed
  const blurCss = hasBlur ? `
    backdrop-filter: blur(${blurValue});
    -webkit-backdrop-filter: blur(${blurValue});
  ` : '';
  
  // Build the CSS
  return cssWithKebabProps`
    ${backgroundCss}
    ${blurCss}
  `;
};

export default backgroundEffects;