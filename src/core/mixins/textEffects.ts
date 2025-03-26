/**
 * Typography Special Effects
 * 
 * Advanced text effects for glass UI typography with enhanced styling and animations.
 */
import { css } from 'styled-components';
import { ThemeContext } from '../themeContext';
import { cssWithKebabProps } from '../cssUtils';
import { hexToRGBA, parseColorWithAlpha } from '../colorUtils';
import { textStyles } from './typography/textStyles';

// Define CSSMixin type for consistent return types
type CSSMixin = ReturnType<typeof css>;

/**
 * Text effect options
 */
export interface TextEffectOptions {
  /** Text color */
  color?: string;
  
  /** Text opacity (0-1) */
  opacity?: number;
  
  /** Text shadow color */
  shadowColor?: string;
  
  /** Text shadow blur radius */
  shadowBlur?: number;
  
  /** Text shadow x-offset */
  shadowX?: number;
  
  /** Text shadow y-offset */
  shadowY?: number;
  
  /** Font size (with unit) */
  fontSize?: string;
  
  /** Font weight */
  fontWeight?: number | string;
  
  /** Line height */
  lineHeight?: number | string;
  
  /** Letter spacing */
  letterSpacing?: string;
  
  /** Enable gradient text */
  gradient?: boolean;
  
  /** Gradient start color */
  gradientFrom?: string;
  
  /** Gradient end color */
  gradientTo?: string;
  
  /** Gradient angle in degrees */
  gradientAngle?: number;
  
  /** Enable glowing text */
  glow?: boolean;
  
  /** Glow color */
  glowColor?: string;
  
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  
  /** Enable frosted glass text */
  frosted?: boolean;
  
  /** Frosted text background opacity (0-1) */
  frostedOpacity?: number;
  
  /** Enable 3D text effect */
  enable3D?: boolean;
  
  /** 3D depth in pixels */
  depth3D?: number;
  
  /** Light angle for 3D effect in degrees */
  lightAngle?: number;
  
  /** Enable outlined text */
  outlined?: boolean;
  
  /** Outline width */
  outlineWidth?: string;
  
  /** Outline color */
  outlineColor?: string;
  
  /** Enable neon text effect */
  neon?: boolean;
  
  /** Neon color */
  neonColor?: string;
  
  /** Neon intensity (0-1) */
  neonIntensity?: number;
  
  /** Enable animated text */
  animated?: boolean;
  
  /** Animation type */
  animationType?: 'wave' | 'pulse' | 'typing' | 'fade' | 'shimmer';
  
  /** Animation duration in seconds */
  animationDuration?: number;
  
  /** Enable liquid text effect */
  liquid?: boolean;
  
  /** Enable text mask effect */
  mask?: boolean;
  
  /** Mask image URL */
  maskImage?: string;
  
  /** Enable text blur effect */
  blurred?: boolean;
  
  /** Blur amount in pixels */
  blurAmount?: number;
  
  /** Enable clipping (text-overflow) */
  clipping?: boolean;
  
  /** Line clamp (number of lines before ellipsis) */
  lineClamp?: number;
}

/**
 * Default text effect options
 */
const DEFAULT_TEXT_OPTIONS: TextEffectOptions = {
  opacity: 1,
  shadowBlur: 2,
  shadowX: 0,
  shadowY: 1,
  fontWeight: 'normal',
  gradient: false,
  gradientAngle: 120,
  glow: false,
  glowIntensity: 0.5,
  frosted: false,
  frostedOpacity: 0.1,
  enable3D: false,
  depth3D: 4,
  lightAngle: 45,
  outlined: false,
  outlineWidth: '1px',
  neon: false,
  neonIntensity: 0.7,
  animated: false,
  animationType: 'wave',
  animationDuration: 3,
  liquid: false,
  mask: false,
  blurred: false,
  blurAmount: 2,
  clipping: false,
  lineClamp: 2
};

/**
 * Create gradient text effect
 */
const createGradientText = (
  fromColor: string,
  toColor: string,
  angle: number = 120
): CSSMixin => {
  // Parse colors with alpha
  const parsedFrom = parseColorWithAlpha(fromColor);
  const parsedTo = parseColorWithAlpha(toColor);
  
  // Format colors for the gradient
  const fromRgba = `rgba(${parsedFrom.r}, ${parsedFrom.g}, ${parsedFrom.b}, ${parsedFrom.a})`;
  const toRgba = `rgba(${parsedTo.r}, ${parsedTo.g}, ${parsedTo.b}, ${parsedTo.a})`;
  
  return cssWithKebabProps`
    background: linear-gradient(${angle}deg, ${fromRgba}, ${toRgba});
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-fill-color: transparent;
    -webkit-text-fill-color: transparent;
  `;
};

/**
 * Create glowing text effect
 */
const createGlowingText = (
  color: string,
  intensity: number = 0.5
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a})`;
  
  // Calculate different levels of glow based on intensity
  const glow1 = `0 0 ${Math.round(intensity * 2)}px ${rgba}`;
  const glow2 = `0 0 ${Math.round(intensity * 4)}px ${rgba}`;
  const glow3 = `0 0 ${Math.round(intensity * 6)}px rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a * 0.5})`;
  
  return cssWithKebabProps`
    color: ${rgba};
    text-shadow: ${glow1}, ${glow2}, ${glow3};
  `;
};

/**
 * Create frosted glass text effect
 */
const createFrostedText = (
  color: string,
  opacity: number = 0.1
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a})`;
  
  return cssWithKebabProps`
    color: ${rgba};
    background-color: rgba(255, 255, 255, ${opacity});
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    padding: 0.25em 0.5em;
    border-radius: 4px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  `;
};

/**
 * Create 3D text effect
 */
const create3DText = (
  color: string,
  depth: number = 4,
  lightAngle: number = 45
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const baseColor = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a})`;
  
  // Calculate light and shadow colors
  const lighterR = Math.min(255, parsedColor.r + 50);
  const lighterG = Math.min(255, parsedColor.g + 50);
  const lighterB = Math.min(255, parsedColor.b + 50);
  const lighterColor = `rgba(${lighterR}, ${lighterG}, ${lighterB}, ${parsedColor.a})`;
  
  const darkerR = Math.max(0, parsedColor.r - 50);
  const darkerG = Math.max(0, parsedColor.g - 50);
  const darkerB = Math.max(0, parsedColor.b - 50);
  const darkerColor = `rgba(${darkerR}, ${darkerG}, ${darkerB}, ${parsedColor.a})`;
  
  // Calculate shadow direction based on light angle
  const lightRad = (lightAngle * Math.PI) / 180;
  const shadowX = Math.cos(lightRad + Math.PI) * depth * 0.25; // Opposite of light
  const shadowY = Math.sin(lightRad + Math.PI) * depth * 0.25; // Opposite of light
  
  // Create multi-layered text shadow for 3D effect
  let shadows = '';
  for (let i = 1; i <= depth; i++) {
    const stepX = shadowX * (i / depth);
    const stepY = shadowY * (i / depth);
    
    // Alternate between light and shadow colors for more realistic depth
    const color = i % 2 === 0 ? lighterColor : darkerColor;
    
    shadows += `${stepX.toFixed(2)}px ${stepY.toFixed(2)}px 0 ${color}`;
    if (i < depth) shadows += ', ';
  }
  
  return cssWithKebabProps`
    color: ${baseColor};
    text-shadow: ${shadows};
    transform: translateZ(0);
  `;
};

/**
 * Create outlined text effect
 */
const createOutlinedText = (
  color: string,
  outlineColor: string,
  width: string = '1px'
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const textColor = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a})`;
  
  const parsedOutline = parseColorWithAlpha(outlineColor);
  const outline = `rgba(${parsedOutline.r}, ${parsedOutline.g}, ${parsedOutline.b}, ${parsedOutline.a})`;
  
  // Convert width to numeric value for calculations
  const numWidth = parseFloat(width);
  const unit = width.replace(/[\d.-]/g, '') || 'px';
  
  // Create text-shadow outline (more compatible than -webkit-text-stroke)
  return cssWithKebabProps`
    color: ${textColor};
    text-shadow: 
      ${numWidth}${unit} ${numWidth}${unit} 0 ${outline},
      ${-numWidth}${unit} ${numWidth}${unit} 0 ${outline},
      ${numWidth}${unit} ${-numWidth}${unit} 0 ${outline},
      ${-numWidth}${unit} ${-numWidth}${unit} 0 ${outline};
    
    /* Add webkit text stroke for better support in webkit browsers */
    -webkit-text-stroke: ${width} ${outline};
  `;
};

/**
 * Create neon text effect
 */
const createNeonText = (
  color: string,
  intensity: number = 0.7
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a})`;
  
  // Create multi-layered glow for neon effect
  const glow1 = `0 0 ${Math.round(intensity * 2)}px ${rgba}`;
  const glow2 = `0 0 ${Math.round(intensity * 4)}px ${rgba}`;
  const glow3 = `0 0 ${Math.round(intensity * 6)}px rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a * 0.5})`;
  const glow4 = `0 0 ${Math.round(intensity * 10)}px rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a * 0.3})`;
  
  return cssWithKebabProps`
    color: ${rgba};
    text-shadow: ${glow1}, ${glow2}, ${glow3}, ${glow4};
    
    /* Add animation for flickering effect */
    animation: neon-flicker 1.5s infinite alternate;
    
    @keyframes neon-flicker {
      0%, 18%, 22%, 25%, 53%, 57%, 100% {
        text-shadow: ${glow1}, ${glow2}, ${glow3}, ${glow4};
      }
      20%, 24%, 55% {
        text-shadow: none;
      }
    }
  `;
};

/**
 * Create animated text effects
 */
const createAnimatedText = (
  type: 'wave' | 'pulse' | 'typing' | 'fade' | 'shimmer',
  duration: number = 3
): CSSMixin => {
  switch (type) {
    case 'wave':
      return cssWithKebabProps`
        position: relative;
        display: inline-block;
        
        /* This requires JS to apply animation to each letter with delay */
        & span {
          display: inline-block;
          animation: text-wave ${duration}s ease-in-out infinite;
        }
        
        /* Each letter should have a different delay */
        & span:nth-child(2n) {
          animation-delay: 0.1s;
        }
        & span:nth-child(3n) {
          animation-delay: 0.2s;
        }
        & span:nth-child(4n) {
          animation-delay: 0.3s;
        }
        & span:nth-child(5n) {
          animation-delay: 0.4s;
        }
        
        @keyframes text-wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        /* Fallback if no JS */
        &:not(.js-enabled) {
          animation: text-wave-fallback ${duration}s ease-in-out infinite;
        }
        
        @keyframes text-wave-fallback {
          0%, 100% {
            transform: skewY(0deg);
          }
          50% {
            transform: skewY(-2deg);
          }
        }
      `;
      
    case 'pulse':
      return cssWithKebabProps`
        animation: text-pulse ${duration}s ease-in-out infinite;
        
        @keyframes text-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `;
      
    case 'typing':
      return cssWithKebabProps`
        position: relative;
        width: fit-content;
        
        &::after {
          content: '|';
          position: absolute;
          right: -0.1em;
          animation: text-cursor 1s step-end infinite;
        }
        
        /* Text typing effect - works best with JS but this is a fallback */
        &:not(.js-enabled) {
          width: 0;
          overflow: hidden;
          white-space: nowrap;
          animation: text-typing ${duration * 2}s steps(${duration * 5}) forwards;
        }
        
        @keyframes text-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes text-typing {
          to { width: 100%; }
        }
      `;
      
    case 'fade':
      return cssWithKebabProps`
        animation: text-fade ${duration}s ease-in-out infinite;
        
        @keyframes text-fade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `;
      
    case 'shimmer':
      return cssWithKebabProps`
        position: relative;
        overflow: hidden;
        background-clip: text;
        -webkit-background-clip: text;
        
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.5),
            transparent
          );
          transform: translateX(-100%);
          animation: text-shimmer ${duration}s infinite;
        }
        
        @keyframes text-shimmer {
          100% { transform: translateX(100%); }
        }
      `;
      
    default:
      return cssWithKebabProps``;
  }
};

/**
 * Create liquid text effect
 */
const createLiquidText = (): CSSMixin => {
  return cssWithKebabProps`
    position: relative;
    
    &::before {
      content: attr(data-text);
      position: absolute;
      left: 0;
      right: 0;
      z-index: -1;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.2) 10%, transparent 80%);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      transform: translateY(0.1em) scaleY(0.3) scaleX(1.02);
      opacity: 0.3;
      filter: blur(1px);
    }
  `;
};

/**
 * Create masked text effect
 */
const createMaskedText = (
  maskImage: string
): CSSMixin => {
  return cssWithKebabProps`
    -webkit-mask-image: url(${maskImage});
    mask-image: url(${maskImage});
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  `;
};

/**
 * Create blurred text effect
 */
const createBlurredText = (
  amount: number = 2
): CSSMixin => {
  return cssWithKebabProps`
    filter: blur(${amount}px);
    
    &:hover {
      filter: blur(0);
      transition: filter 0.3s ease;
    }
  `;
};

/**
 * Create text clipping effect
 */
const createClippedText = (
  lineClamp: number = 2
): CSSMixin => {
  return cssWithKebabProps`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: ${lineClamp};
    -webkit-box-orient: vertical;
    line-clamp: ${lineClamp};
    max-height: calc(${lineClamp} * 1.5em);
  `;
};

/**
 * Typography special effects mixin with advanced styling and animations
 * @param themeContext Theme context for accessing theme values
 * @param options Text effect options
 * @returns CSS styles for enhanced typography
 */
export const textEffects = (
  themeContext: ThemeContext,
  options: TextEffectOptions = {}
): CSSMixin => {
  // Merge with default options
  const mergedOptions: TextEffectOptions = {
    ...DEFAULT_TEXT_OPTIONS,
    ...options
  };
  
  const {
    color,
    opacity,
    shadowColor,
    shadowBlur,
    shadowX,
    shadowY,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    gradient,
    gradientFrom,
    gradientTo,
    gradientAngle,
    glow,
    glowColor,
    glowIntensity,
    frosted,
    frostedOpacity,
    enable3D,
    depth3D,
    lightAngle,
    outlined,
    outlineWidth,
    outlineColor,
    neon,
    neonColor,
    neonIntensity,
    animated,
    animationType,
    animationDuration,
    liquid,
    mask,
    maskImage,
    blurred,
    blurAmount,
    clipping,
    lineClamp
  } = mergedOptions;
  
  // Get colors from theme or options
  const textColor = color || (themeContext.getColor ? themeContext.getColor('text.primary', '#000000') : '#000000');
  const parsedColor = parseColorWithAlpha(textColor);
  const textRgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${opacity})`;
  
  const shadowColorValue = shadowColor || textColor;
  const parsedShadow = parseColorWithAlpha(shadowColorValue);
  const shadowRgba = `rgba(${parsedShadow.r}, ${parsedShadow.g}, ${parsedShadow.b}, ${opacity * 0.5})`;
  
  // Build base text styles
  let styles = cssWithKebabProps`
    color: ${textRgba};
    ${fontSize ? `font-size: ${fontSize};` : ''}
    ${fontWeight ? `font-weight: ${fontWeight};` : ''}
    ${lineHeight ? `line-height: ${lineHeight};` : ''}
    ${letterSpacing ? `letter-spacing: ${letterSpacing};` : ''}
    ${(shadowBlur || shadowX || shadowY) ? `text-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowRgba};` : ''}
  `;
  
  // Apply special text effects (in order of visual priority)
  if (gradient && gradientFrom && gradientTo) {
    styles = cssWithKebabProps`
      ${styles}
      ${createGradientText(gradientFrom, gradientTo, gradientAngle)}
    `;
  }
  
  if (enable3D) {
    styles = cssWithKebabProps`
      ${styles}
      ${create3DText(textColor, depth3D, lightAngle)}
    `;
  }
  
  if (outlined && outlineColor) {
    styles = cssWithKebabProps`
      ${styles}
      ${createOutlinedText(textColor, outlineColor, outlineWidth)}
    `;
  }
  
  if (neon) {
    const neonColorValue = neonColor || textColor;
    styles = cssWithKebabProps`
      ${styles}
      ${createNeonText(neonColorValue, neonIntensity)}
    `;
  } else if (glow) {
    const glowColorValue = glowColor || textColor;
    styles = cssWithKebabProps`
      ${styles}
      ${createGlowingText(glowColorValue, glowIntensity)}
    `;
  }
  
  if (frosted) {
    styles = cssWithKebabProps`
      ${styles}
      ${createFrostedText(textColor, frostedOpacity)}
    `;
  }
  
  if (liquid) {
    styles = cssWithKebabProps`
      ${styles}
      ${createLiquidText()}
    `;
  }
  
  if (mask && maskImage) {
    styles = cssWithKebabProps`
      ${styles}
      ${createMaskedText(maskImage)}
    `;
  }
  
  if (blurred) {
    styles = cssWithKebabProps`
      ${styles}
      ${createBlurredText(blurAmount)}
    `;
  }
  
  if (clipping) {
    styles = cssWithKebabProps`
      ${styles}
      ${createClippedText(lineClamp)}
    `;
  }
  
  if (animated) {
    styles = cssWithKebabProps`
      ${styles}
      ${createAnimatedText(animationType || 'wave', animationDuration || 3)}
    `;
  }
  
  return styles;
};