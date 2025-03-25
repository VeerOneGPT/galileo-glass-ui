/**
 * Depth Effects Mixin
 * 
 * Creates depth perception effects for components
 */
import { css } from 'styled-components';
import { cssWithKebabProps } from '../../cssUtils';
import { withAlpha } from '../../colorUtils';

/**
 * Depth effects options
 */
export interface DepthEffectsOptions {
  /**
   * Type of depth effect
   */
  type?: 'shadow' | 'parallax' | 'layered' | 'inset' | 'floating' | 'custom';
  
  /**
   * Depth level (1-5)
   */
  depth?: number;
  
  /**
   * Shadow color
   */
  shadowColor?: string;
  
  /**
   * If true, applies additional lighting effects
   */
  lighting?: boolean;
  
  /**
   * Direction of the lighting effect (degrees)
   */
  lightDirection?: number;
  
  /**
   * For parallax effect, the intensity of movement
   */
  parallaxIntensity?: number;
  
  /**
   * For layered effect, the number of layers
   */
  layers?: number;
  
  /**
   * For layered effect, the gap between layers in pixels
   */
  layerGap?: number;
  
  /**
   * For custom depth effect, a custom CSS snippet
   */
  customCss?: string;
  
  /**
   * If true, reduces motion for accessibility
   */
  reducedMotion?: boolean;
  
  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Creates shadow depth effect
 */
const createShadowDepth = (options: DepthEffectsOptions, isDarkMode: boolean): string => {
  const { depth = 2, shadowColor } = options;
  
  // Limit depth to 1-5 range
  const depthLevel = Math.min(Math.max(depth, 1), 5);
  
  // Shadow color based on theme
  const color = shadowColor || (isDarkMode ? '#000000' : '#101010');
  
  // Shadow size based on depth
  const x = depthLevel * 2;
  const y = depthLevel * 2;
  const blur = depthLevel * 10;
  const spread = depthLevel - 1;
  const opacity = 0.05 + (depthLevel * 0.03);
  
  return `
    box-shadow: 0 ${y}px ${blur}px ${spread}px ${withAlpha(color, opacity)};
  `;
};

/**
 * Creates parallax depth effect
 */
const createParallaxDepth = (options: DepthEffectsOptions, isDarkMode: boolean): string => {
  const { depth = 2, parallaxIntensity = 0.1, reducedMotion = false } = options;
  
  // Limit depth to 1-5 range
  const depthLevel = Math.min(Math.max(depth, 1), 5);
  
  // Calculate intensity based on depth
  const intensity = parallaxIntensity * depthLevel;
  
  // Add shadow for depth perception
  const shadowCss = createShadowDepth(options, isDarkMode);
  
  // Skip motion if reduced motion is enabled
  if (reducedMotion) {
    return shadowCss;
  }
  
  return `
    ${shadowCss}
    transform-style: preserve-3d;
    transform: translateZ(0);
    transition: transform 0.2s ease-out;
    
    &:hover {
      transform: translateZ(${depthLevel * 5}px) scale(${1 + intensity * 0.05});
    }
    
    /* Parallax effect on content */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      opacity: 0.1;
      transform: translateZ(-${depthLevel * 3}px);
      transition: transform 0.3s ease-out;
      pointer-events: none;
    }
    
    &:hover::before {
      transform: translateZ(-${depthLevel * 5}px) scale(${1 - intensity * 0.1});
    }
  `;
};

/**
 * Creates layered depth effect
 */
const createLayeredDepth = (options: DepthEffectsOptions, isDarkMode: boolean): string => {
  const { depth = 2, layers = 3, layerGap = 5 } = options;
  
  // Limit depth to 1-5 range
  const depthLevel = Math.min(Math.max(depth, 1), 5);
  
  // Calculate layers and gaps based on depth
  const numLayers = Math.min(Math.max(layers, 1), 5);
  const gap = layerGap * depthLevel;
  
  // Shadow color based on theme
  const color = isDarkMode ? '#000000' : '#101010';
  const bgColor = isDarkMode ? '#ffffff' : '#ffffff';
  
  return `
    position: relative;
    transform-style: preserve-3d;
    transform: translateZ(0);
    
    ${Array.from({ length: numLayers }).map((_, index) => `
      &::before {
        content: '';
        position: absolute;
        top: ${gap * (index + 1)}px;
        left: ${gap * (index + 1)}px;
        right: ${gap * (index + 1)}px;
        bottom: ${gap * (index + 1)}px;
        background-color: ${withAlpha(bgColor, 0.05 - (index * 0.01))};
        border-radius: inherit;
        z-index: -${index + 1};
        box-shadow: 0 ${depthLevel}px ${depthLevel * 4}px ${withAlpha(color, 0.03 + (index * 0.01))};
        transform: translateZ(-${(index + 1) * 5}px);
        pointer-events: none;
      }
    `).join('')}
  `;
};

/**
 * Creates inset depth effect
 */
const createInsetDepth = (options: DepthEffectsOptions, isDarkMode: boolean): string => {
  const { depth = 2, shadowColor } = options;
  
  // Limit depth to 1-5 range
  const depthLevel = Math.min(Math.max(depth, 1), 5);
  
  // Shadow color based on theme
  const color = shadowColor || (isDarkMode ? '#000000' : '#101010');
  const highlightColor = isDarkMode ? '#ffffff' : '#ffffff';
  
  // Inset shadow based on depth
  const x = 0;
  const y = depthLevel;
  const blur = depthLevel * 3;
  const spread = 0;
  const opacity = 0.1 + (depthLevel * 0.05);
  const highlightOpacity = 0.1 - (depthLevel * 0.01);
  
  return `
    box-shadow: 
      inset 0 ${y}px ${blur}px ${spread}px ${withAlpha(color, opacity)},
      inset 0 -${y / 2}px ${blur / 2}px ${spread}px ${withAlpha(highlightColor, highlightOpacity)};
      
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: inherit;
      background: linear-gradient(
        to bottom,
        ${withAlpha(color, 0.02 + (depthLevel * 0.01))} 0%,
        transparent 40%,
        transparent 60%,
        ${withAlpha(highlightColor, 0.01 + (depthLevel * 0.005))} 100%
      );
      pointer-events: none;
    }
  `;
};

/**
 * Creates floating depth effect
 */
const createFloatingDepth = (options: DepthEffectsOptions, isDarkMode: boolean): string => {
  const { depth = 2, shadowColor, reducedMotion = false } = options;
  
  // Limit depth to 1-5 range
  const depthLevel = Math.min(Math.max(depth, 1), 5);
  
  // Shadow color based on theme
  const color = shadowColor || (isDarkMode ? '#000000' : '#101010');
  
  // Shadow size based on depth
  const blur = depthLevel * 15;
  const spread = depthLevel * 2;
  const opacity = 0.1 + (depthLevel * 0.05);
  
  // Calculate animation parameters based on depth
  const animationDuration = 3 + (depthLevel * 0.5);
  const animationDistance = depthLevel * 3;
  
  // Skip animation if reduced motion is enabled
  if (reducedMotion) {
    return `
      box-shadow: 0 ${depthLevel * 4}px ${blur}px ${spread}px ${withAlpha(color, opacity)};
    `;
  }
  
  return `
    position: relative;
    animation: floatEffect${depthLevel} ${animationDuration}s ease-in-out infinite;
    box-shadow: 0 ${depthLevel * 4}px ${blur}px ${spread}px ${withAlpha(color, opacity)};
    
    @keyframes floatEffect${depthLevel} {
      0%, 100% {
        transform: translateY(0);
        box-shadow: 0 ${depthLevel * 4}px ${blur}px ${spread}px ${withAlpha(color, opacity)};
      }
      50% {
        transform: translateY(-${animationDistance}px);
        box-shadow: 0 ${depthLevel * 6}px ${blur + 5}px ${spread + 2}px ${withAlpha(color, opacity - 0.02)};
      }
    }
  `;
};

/**
 * Creates depth perception effects
 */
export const depthEffects = (options: DepthEffectsOptions) => {
  const {
    type = 'shadow',
    themeContext,
    customCss,
  } = options;
  
  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;
  
  // Generate the depth effect based on type
  let depthCss = '';
  
  switch (type) {
    case 'shadow':
      depthCss = createShadowDepth(options, isDarkMode);
      break;
    case 'parallax':
      depthCss = createParallaxDepth(options, isDarkMode);
      break;
    case 'layered':
      depthCss = createLayeredDepth(options, isDarkMode);
      break;
    case 'inset':
      depthCss = createInsetDepth(options, isDarkMode);
      break;
    case 'floating':
      depthCss = createFloatingDepth(options, isDarkMode);
      break;
    case 'custom':
      depthCss = customCss || '';
      break;
    default:
      depthCss = createShadowDepth(options, isDarkMode);
      break;
  }
  
  // Build the CSS
  return cssWithKebabProps`
    position: relative;
    ${depthCss}
  `;
};

export default depthEffects;