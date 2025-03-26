/**
 * Enhanced Border Effects
 *
 * Advanced border effects for glass UI elements with lighting, texture, and animation features.
 */
import { css } from 'styled-components';

import { hexToRGBA, parseColorWithAlpha } from '../colorUtils';
import { cssWithKebabProps } from '../cssUtils';
import { ThemeContext } from '../themeContext';

// Type definition for CSS mixins
type CSSMixin = ReturnType<typeof css>;

/**
 * Border effect options
 */
export interface BorderEffectOptions {
  /** Border width (px or shorthand like "1px 2px") */
  width?: string;

  /** Border style */
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';

  /** Border color */
  color?: string;

  /** Border opacity (0-1) */
  opacity?: number;

  /** Border radius */
  radius?: string;

  /** Enable gradient border */
  gradient?: boolean;

  /** Gradient start color */
  gradientFrom?: string;

  /** Gradient end color */
  gradientTo?: string;

  /** Gradient angle in degrees */
  gradientAngle?: number;

  /** Enable glowing border */
  glow?: boolean;

  /** Glow color */
  glowColor?: string;

  /** Glow intensity (0-1) */
  glowIntensity?: number;

  /** Enable animated border */
  animated?: boolean;

  /** Animation duration in seconds */
  animationDuration?: number;

  /** Enable inner border */
  innerBorder?: boolean;

  /** Enable 3D effect */
  enable3D?: boolean;

  /** 3D depth in pixels */
  depth3D?: number;

  /** Light angle for 3D effect in degrees */
  lightAngle?: number;

  /** Enable split border colors */
  splitColors?: boolean;

  /** Top border color */
  topColor?: string;

  /** Right border color */
  rightColor?: string;

  /** Bottom border color */
  bottomColor?: string;

  /** Left border color */
  leftColor?: string;

  /** Enable border highlight */
  highlight?: boolean;

  /** Highlight position (0-1, 0=top, 1=bottom) */
  highlightPosition?: number;

  /** Enable frosted border */
  frosted?: boolean;

  /** Texture scale for frosted effect (0-1) */
  textureScale?: number;
}

/**
 * Default border effect options
 */
const DEFAULT_BORDER_OPTIONS: BorderEffectOptions = {
  width: '1px',
  style: 'solid',
  opacity: 0.3,
  radius: '8px',
  gradient: false,
  glow: false,
  glowIntensity: 0.3,
  animated: false,
  animationDuration: 3,
  innerBorder: false,
  enable3D: false,
  depth3D: 2,
  lightAngle: 45,
  splitColors: false,
  highlight: false,
  highlightPosition: 0.3,
  frosted: false,
  textureScale: 0.5,
};

/**
 * Create a border-gradient CSS with cross-browser compatibility
 */
const createBorderGradient = (
  fromColor: string,
  toColor: string,
  angle = 45,
  width = '1px'
): CSSMixin => {
  // Parse colors with alpha
  const parsedFrom = parseColorWithAlpha(fromColor);
  const parsedTo = parseColorWithAlpha(toColor);

  // Format colors for the gradient
  const fromRgba = `rgba(${parsedFrom.r}, ${parsedFrom.g}, ${parsedFrom.b}, ${parsedFrom.a})`;
  const toRgba = `rgba(${parsedTo.r}, ${parsedTo.g}, ${parsedTo.b}, ${parsedTo.a})`;

  // WebKit and Standard gradient approach
  return cssWithKebabProps`
    border: none;
    background-image: 
      linear-gradient(${angle}deg, ${fromRgba}, ${toRgba});
    background-origin: border-box;
    background-clip: padding-box, border-box;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      z-index: -1;
      margin: -${width};
      border-radius: inherit;
      background: linear-gradient(${angle}deg, ${fromRgba}, ${toRgba});
    }
  `;
};

/**
 * Create split-color borders with different colors for each side
 */
const createSplitColorBorders = (
  topColor: string | undefined,
  rightColor: string | undefined,
  bottomColor: string | undefined,
  leftColor: string | undefined,
  width: string,
  style: string,
  defaultColor: string
): CSSMixin => {
  // Split the width into individual values if needed
  const widths = width.split(' ');
  const topWidth = widths[0] || width;
  const rightWidth = widths[1] || topWidth;
  const bottomWidth = widths[2] || topWidth;
  const leftWidth = widths[3] || rightWidth;

  return cssWithKebabProps`
    border-top: ${topWidth} ${style} ${topColor || defaultColor};
    border-right: ${rightWidth} ${style} ${rightColor || defaultColor};
    border-bottom: ${bottomWidth} ${style} ${bottomColor || defaultColor};
    border-left: ${leftWidth} ${style} ${leftColor || defaultColor};
  `;
};

/**
 * Create a frosted border effect
 */
const createFrostedBorder = (
  width: string,
  color: string,
  opacity: number,
  textureScale = 0.5
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${
    parsedColor.a * opacity
  })`;

  return cssWithKebabProps`
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: calc(-1 * ${width});
      border-radius: inherit;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      background: 
        linear-gradient(to right, ${rgba}, transparent, ${rgba}),
        linear-gradient(to bottom, ${rgba}, transparent, ${rgba}),
        repeating-conic-gradient(from 0deg, ${rgba} 0%, transparent 10%, ${rgba} 20%);
      background-size: 100%, 100%, ${textureScale * 100}% ${textureScale * 100}%;
      opacity: ${opacity};
      pointer-events: none;
      z-index: -1;
    }
  `;
};

/**
 * Create a glowing border effect
 */
const createGlowingBorder = (width: string, color: string, intensity = 0.3): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${parsedColor.a})`;

  return cssWithKebabProps`
    border: ${width} solid ${rgba};
    box-shadow: 0 0 ${intensity * 15}px 0 ${rgba},
                inset 0 0 ${intensity * 5}px 0 ${rgba};
  `;
};

/**
 * Create a 3D border effect with depth
 */
const create3DBorder = (
  width: string,
  color: string,
  depth = 2,
  lightAngle = 45,
  opacity = 0.3
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${opacity})`;

  // Calculate light and shadow positions based on angle
  const lightRad = (lightAngle * Math.PI) / 180;
  const shadowRad = ((lightAngle + 180) * Math.PI) / 180;

  const lightX = Math.cos(lightRad) * depth;
  const lightY = Math.sin(lightRad) * depth;
  const shadowX = Math.cos(shadowRad) * depth;
  const shadowY = Math.sin(shadowRad) * depth;

  // Lighten and darken the border color for top/bottom
  const lighterColor = `rgba(${Math.min(255, parsedColor.r + 50)}, ${Math.min(
    255,
    parsedColor.g + 50
  )}, ${Math.min(255, parsedColor.b + 50)}, ${opacity})`;
  const darkerColor = `rgba(${Math.max(0, parsedColor.r - 50)}, ${Math.max(
    0,
    parsedColor.g - 50
  )}, ${Math.max(0, parsedColor.b - 50)}, ${opacity})`;

  return cssWithKebabProps`
    border: ${width} solid transparent;
    background-clip: padding-box;
    position: relative;
    
    &::before, &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
    }
    
    &::before {
      border: ${width} solid ${lighterColor};
      transform: translate(${lightX}px, ${lightY}px);
      z-index: -2;
    }
    
    &::after {
      border: ${width} solid ${darkerColor};
      transform: translate(${shadowX}px, ${shadowY}px);
      z-index: -1;
    }
  `;
};

/**
 * Create a border with highlight effect
 */
const createHighlightBorder = (
  width: string,
  color: string,
  highlightPosition = 0.3,
  opacity = 0.3
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const baseRgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${opacity})`;
  const highlightRgba = `rgba(255, 255, 255, ${opacity * 1.5})`;

  return cssWithKebabProps`
    border: ${width} solid transparent;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      border: ${width} solid ${baseRgba};
      background: linear-gradient(${
        90 + highlightPosition * 180
      }deg, ${baseRgba} 0%, ${highlightRgba} 50%, ${baseRgba} 100%);
      background-clip: border-box;
      -webkit-mask-composite: source-in;
      mask-composite: subtract;
      pointer-events: none;
    }
  `;
};

/**
 * Create an animated border effect
 */
const createAnimatedBorder = (
  width: string,
  color: string,
  duration = 3,
  opacity = 0.3
): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${opacity})`;

  return cssWithKebabProps`
    border: ${width} solid ${rgba};
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      inset: calc(-1 * ${width});
      border-radius: inherit;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transform: translateX(-100%);
      animation: shimmer ${duration}s infinite;
      pointer-events: none;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
};

/**
 * Create an inner border effect
 */
const createInnerBorder = (width: string, color: string, opacity = 0.3): CSSMixin => {
  const parsedColor = parseColorWithAlpha(color);
  const rgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${opacity})`;

  return cssWithKebabProps`
    box-shadow: inset 0 0 0 ${width} ${rgba};
    border: none;
  `;
};

/**
 * Enhanced border effects mixin with advanced styling options
 * @param themeContext Theme context for accessing theme values
 * @param options Border effect options
 * @returns CSS styles for enhanced borders
 */
export const borderEffects = (
  themeContext: ThemeContext,
  options: BorderEffectOptions = {}
): CSSMixin => {
  // Merge with default options
  const mergedOptions: BorderEffectOptions = {
    ...DEFAULT_BORDER_OPTIONS,
    ...options,
  };

  const {
    width,
    style,
    color,
    opacity,
    radius,
    gradient,
    gradientFrom,
    gradientTo,
    gradientAngle,
    glow,
    glowColor,
    glowIntensity,
    animated,
    animationDuration,
    innerBorder,
    enable3D,
    depth3D,
    lightAngle,
    splitColors,
    topColor,
    rightColor,
    bottomColor,
    leftColor,
    highlight,
    highlightPosition,
    frosted,
    textureScale,
  } = mergedOptions;

  // Get border color from theme or options
  const borderColor =
    color || (themeContext.getColor ? themeContext.getColor('border', '#CCCCCC') : '#CCCCCC');
  const parsedColor = parseColorWithAlpha(borderColor);
  const borderOpacity = opacity !== undefined ? opacity : 0.3;
  const borderRgba = `rgba(${parsedColor.r}, ${parsedColor.g}, ${parsedColor.b}, ${
    parsedColor.a * borderOpacity
  })`;

  // Base border styles
  let borderStyles = cssWithKebabProps`
    border: ${width} ${style} ${borderRgba};
    border-radius: ${radius};
  `;

  // Apply special border effects
  if (innerBorder) {
    borderStyles = cssWithKebabProps`
      ${borderStyles}
      ${createInnerBorder(width || '1px', borderColor, borderOpacity)}
    `;
  }

  if (gradient && gradientFrom && gradientTo) {
    borderStyles = cssWithKebabProps`
      ${borderStyles}
      ${createBorderGradient(gradientFrom, gradientTo, gradientAngle, width)}
    `;
  }

  if (glow) {
    const glowColorValue = glowColor || borderColor;
    borderStyles = cssWithKebabProps`
      ${borderStyles}
      ${createGlowingBorder(width || '1px', glowColorValue, glowIntensity)}
    `;
  }

  if (enable3D) {
    borderStyles = cssWithKebabProps`
      ${borderStyles}
      ${create3DBorder(width || '1px', borderColor, depth3D, lightAngle, borderOpacity)}
    `;
  }

  if (splitColors) {
    borderStyles = cssWithKebabProps`
      ${borderStyles}
      ${createSplitColorBorders(
        topColor,
        rightColor,
        bottomColor,
        leftColor,
        width || '1px',
        style || 'solid',
        borderRgba
      )}
    `;
  }

  if (highlight) {
    borderStyles = cssWithKebabProps`
      ${borderStyles}
      ${createHighlightBorder(width || '1px', borderColor, highlightPosition, borderOpacity)}
    `;
  }

  if (frosted) {
    borderStyles = cssWithKebabProps`
      ${borderStyles}
      ${createFrostedBorder(width || '1px', borderColor, borderOpacity, textureScale)}
    `;
  }

  if (animated) {
    borderStyles = cssWithKebabProps`
      ${borderStyles}
      ${createAnimatedBorder(width || '1px', borderColor, animationDuration, borderOpacity)}
    `;
  }

  return borderStyles;
};
