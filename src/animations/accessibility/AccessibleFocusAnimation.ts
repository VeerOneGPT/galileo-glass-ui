/**
 * AccessibleFocusAnimation.ts
 * 
 * Provides accessible focus state animations that respect user preferences
 * for reduced motion, high contrast, and other accessibility settings.
 * These animations improve keyboard navigation while ensuring they don't
 * cause discomfort for users with motion sensitivities.
 */

import { css, FlattenSimpleInterpolation, keyframes } from 'styled-components';
import { useReducedMotion } from './useReducedMotion';
import { useHighContrast } from './useHighContrast';
import { AnimationCategory } from './MotionSensitivity';
import { HighContrastAnimationType } from './useHighContrast';
import { useCallback, useMemo } from 'react';

/**
 * Focus animation styles that can be used for focus indicators
 */
export enum FocusAnimationStyle {
  /**
   * Outline pulse - pulsing outline around the element
   */
  OUTLINE_PULSE = 'outline_pulse',
  
  /**
   * Glow effect - subtle glow that appears around focused element
   */
  GLOW = 'glow',
  
  /**
   * Scale effect - subtle scale change when element is focused
   */
  SCALE = 'scale',
  
  /**
   * Border highlight - animated border that appears when focused
   */
  BORDER = 'border',
  
  /**
   * Underline - animated underline for text elements
   */
  UNDERLINE = 'underline',
  
  /**
   * Background shift - subtle background color change
   */
  BACKGROUND = 'background',
  
  /**
   * Shadow effect - animated shadow around the element
   */
  SHADOW = 'shadow',
  
  /**
   * Color shift - subtle color change for the element
   */
  COLOR_SHIFT = 'color_shift',
  
  /**
   * Dash pattern - animated dashed outline
   */
  DASH = 'dash',
  
  /**
   * Static - non-animated high-visibility focus state
   */
  STATIC = 'static'
}

/**
 * Focus animation intensity levels
 */
export enum FocusAnimationIntensity {
  /**
   * Very subtle animation, minimal movement
   */
  MINIMAL = 'minimal',
  
  /**
   * Subtle animation with slightly more visibility
   */
  SUBTLE = 'subtle',
  
  /**
   * Standard animation with balanced visibility
   */
  STANDARD = 'standard',
  
  /**
   * Strong animation with high visibility
   */
  STRONG = 'strong',
  
  /**
   * Very strong animation for maximum visibility
   */
  MAXIMUM = 'maximum'
}

/**
 * Configuration options for accessible focus animations
 */
export interface AccessibleFocusAnimationOptions {
  /**
   * Primary color for focus animation
   * Default: 'rgba(0, 120, 255, 0.8)'
   */
  color?: string;
  
  /**
   * Secondary color for animations that use two colors
   * Default: 'rgba(0, 120, 255, 0.2)'
   */
  secondaryColor?: string;
  
  /**
   * Width of focus outline or border
   * Default: 2
   */
  width?: number;
  
  /**
   * Offset around the focus indicator
   * Default: 2
   */
  offset?: number;
  
  /**
   * Style of focus animation to use
   * Default: OUTLINE_PULSE
   */
  style?: FocusAnimationStyle;
  
  /**
   * Preferred animation intensity
   * Default: STANDARD
   */
  intensity?: FocusAnimationIntensity;
  
  /**
   * Base duration of the animation in milliseconds
   * Default: 1500
   */
  duration?: number;
  
  /**
   * Animation timing function
   * Default: 'ease-in-out'
   */
  easing?: string;
  
  /**
   * Number of animation iterations
   * Default: 'infinite' for most animations, 1 for certain types
   */
  iterations?: number | 'infinite';
  
  /**
   * Enable high-visibility mode, overriding reduced motion settings
   * for critical focus elements (use sparingly)
   * Default: false
   */
  highVisibility?: boolean;
  
  /**
   * Blend mode for focus animation effect
   * Default: 'normal'
   */
  blendMode?: string;
  
  /**
   * Animation delay in milliseconds
   * Default: 0
   */
  delay?: number;
  
  /**
   * Custom CSS to apply to the focus animation
   */
  customCSS?: string | FlattenSimpleInterpolation;
}

/**
 * Default options for accessible focus animations
 */
const DEFAULT_OPTIONS: AccessibleFocusAnimationOptions = {
  color: 'rgba(0, 120, 255, 0.8)',
  secondaryColor: 'rgba(0, 120, 255, 0.2)',
  width: 2,
  offset: 2,
  style: FocusAnimationStyle.OUTLINE_PULSE,
  intensity: FocusAnimationIntensity.STANDARD,
  duration: 1500,
  easing: 'ease-in-out',
  iterations: 'infinite',
  highVisibility: false,
  blendMode: 'normal',
  delay: 0
};

// Define keyframes for different focus animation styles
const outlinePulseKeyframes = keyframes`
  0%, 100% {
    outline-color: var(--focus-color);
    outline-offset: var(--focus-offset);
  }
  50% {
    outline-color: var(--focus-secondary-color);
    outline-offset: calc(var(--focus-offset) * 1.5);
  }
`;

const glowKeyframes = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 var(--focus-offset) var(--focus-secondary-color);
  }
  50% {
    box-shadow: 0 0 var(--focus-width) calc(var(--focus-offset) * 2) var(--focus-color);
  }
`;

const scaleKeyframes = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(var(--focus-scale));
  }
`;

const borderKeyframes = keyframes`
  0%, 100% {
    border-color: var(--focus-secondary-color);
  }
  50% {
    border-color: var(--focus-color);
  }
`;

const underlineKeyframes = keyframes`
  0% {
    background-size: 0 var(--focus-width);
  }
  100% {
    background-size: 100% var(--focus-width);
  }
`;

const backgroundKeyframes = keyframes`
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: var(--focus-secondary-color);
  }
`;

const shadowKeyframes = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 var(--focus-secondary-color);
  }
  50% {
    box-shadow: 0 var(--focus-offset) calc(var(--focus-offset) * 2) 0 var(--focus-color);
  }
`;

const colorShiftKeyframes = keyframes`
  0%, 100% {
    color: inherit;
  }
  50% {
    color: var(--focus-color);
  }
`;

const dashKeyframes = keyframes`
  0% {
    stroke-dashoffset: var(--dash-length);
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

/**
 * Intensity modifiers for different animation styles
 */
const intensityModifiers: Record<FocusAnimationIntensity, {
  durationMultiplier: number;
  sizeMultiplier: number;
  opacityMultiplier: number;
  animationEnabled: boolean;
}> = {
  [FocusAnimationIntensity.MINIMAL]: {
    durationMultiplier: 2.0,
    sizeMultiplier: 0.5,
    opacityMultiplier: 0.5,
    animationEnabled: false
  },
  [FocusAnimationIntensity.SUBTLE]: {
    durationMultiplier: 1.5,
    sizeMultiplier: 0.75,
    opacityMultiplier: 0.75,
    animationEnabled: true
  },
  [FocusAnimationIntensity.STANDARD]: {
    durationMultiplier: 1.0,
    sizeMultiplier: 1.0,
    opacityMultiplier: 1.0,
    animationEnabled: true
  },
  [FocusAnimationIntensity.STRONG]: {
    durationMultiplier: 0.75,
    sizeMultiplier: 1.5,
    opacityMultiplier: 1.2,
    animationEnabled: true
  },
  [FocusAnimationIntensity.MAXIMUM]: {
    durationMultiplier: 0.5,
    sizeMultiplier: 2.0,
    opacityMultiplier: 1.5,
    animationEnabled: true
  }
};

/**
 * Generate static (non-animated) focus styles that comply with accessibility standards
 */
function generateStaticFocusStyle(options: AccessibleFocusAnimationOptions): FlattenSimpleInterpolation {
  const color = options.color || DEFAULT_OPTIONS.color;
  const width = options.width || DEFAULT_OPTIONS.width;
  const offset = options.offset || DEFAULT_OPTIONS.offset;
  const intensity = options.intensity || DEFAULT_OPTIONS.intensity;
  
  // Apply intensity modifiers
  const intensityModifier = intensityModifiers[intensity];
  const adjustedWidth = width * intensityModifier.sizeMultiplier;
  const adjustedOffset = offset * intensityModifier.sizeMultiplier;
  
  // Create high-visibility focus style
  return css`
    outline: ${adjustedWidth}px solid ${color} !important;
    outline-offset: ${adjustedOffset}px !important;
    transition: outline-color 0.2s ease-out, outline-offset 0.2s ease-out;
  `;
}

/**
 * Generate appropriate focus styles based on animation style and user preferences
 */
function generateFocusAnimation(
  options: AccessibleFocusAnimationOptions,
  reducedMotion: boolean,
  highContrast: boolean,
  useAnimation: boolean
): FlattenSimpleInterpolation {
  const {
    color = DEFAULT_OPTIONS.color,
    secondaryColor = DEFAULT_OPTIONS.secondaryColor,
    width = DEFAULT_OPTIONS.width,
    offset = DEFAULT_OPTIONS.offset,
    style = DEFAULT_OPTIONS.style,
    intensity = DEFAULT_OPTIONS.intensity,
    duration = DEFAULT_OPTIONS.duration,
    easing = DEFAULT_OPTIONS.easing,
    iterations = DEFAULT_OPTIONS.iterations,
    highVisibility = DEFAULT_OPTIONS.highVisibility,
    blendMode = DEFAULT_OPTIONS.blendMode,
    delay = DEFAULT_OPTIONS.delay,
    customCSS
  } = options;
  
  // If reduced motion is preferred and this isn't a high-visibility element,
  // use static focus style
  if ((reducedMotion && !highVisibility) || !useAnimation) {
    return generateStaticFocusStyle(options);
  }
  
  // Apply intensity modifiers
  const intensityModifier = intensityModifiers[intensity];
  const adjustedDuration = duration * intensityModifier.durationMultiplier;
  const adjustedWidth = width * intensityModifier.sizeMultiplier;
  const adjustedOffset = offset * intensityModifier.sizeMultiplier;
  
  // Prepare color values - adjust opacity for high contrast if needed
  const mainColor = highContrast ? `rgba(255, 255, 255, 0.9)` : color;
  const altColor = highContrast ? `rgba(255, 255, 255, 0.4)` : secondaryColor;
  
  // Base CSS variables for animation
  const cssVars = `
    --focus-color: ${mainColor};
    --focus-secondary-color: ${altColor};
    --focus-width: ${adjustedWidth}px;
    --focus-offset: ${adjustedOffset}px;
    --focus-scale: ${1 + (0.05 * intensityModifier.sizeMultiplier)};
    --dash-length: 20;
    --focus-blend-mode: ${blendMode};
  `;
  
  // Select animation based on style
  let animationCSS;
  switch (style) {
    case FocusAnimationStyle.OUTLINE_PULSE:
      animationCSS = css`
        outline: ${adjustedWidth}px solid ${mainColor};
        outline-offset: ${adjustedOffset}px;
        animation: ${outlinePulseKeyframes} ${adjustedDuration}ms ${easing} ${iterations};
        animation-delay: ${delay}ms;
      `;
      break;
      
    case FocusAnimationStyle.GLOW:
      animationCSS = css`
        box-shadow: 0 0 0 ${adjustedOffset}px ${altColor};
        animation: ${glowKeyframes} ${adjustedDuration}ms ${easing} ${iterations};
        animation-delay: ${delay}ms;
      `;
      break;
      
    case FocusAnimationStyle.SCALE:
      animationCSS = css`
        transform: scale(1);
        transform-origin: center;
        animation: ${scaleKeyframes} ${adjustedDuration}ms ${easing} ${iterations};
        animation-delay: ${delay}ms;
      `;
      break;
      
    case FocusAnimationStyle.BORDER:
      animationCSS = css`
        border: ${adjustedWidth}px solid ${altColor};
        animation: ${borderKeyframes} ${adjustedDuration}ms ${easing} ${iterations};
        animation-delay: ${delay}ms;
      `;
      break;
      
    case FocusAnimationStyle.UNDERLINE:
      animationCSS = css`
        background-image: linear-gradient(${mainColor}, ${mainColor});
        background-position: 0 100%;
        background-repeat: no-repeat;
        background-size: 0 ${adjustedWidth}px;
        animation: ${underlineKeyframes} ${adjustedDuration / 2}ms ${easing} forwards;
        animation-delay: ${delay}ms;
      `;
      break;
      
    case FocusAnimationStyle.BACKGROUND:
      animationCSS = css`
        animation: ${backgroundKeyframes} ${adjustedDuration}ms ${easing} ${iterations};
        animation-delay: ${delay}ms;
      `;
      break;
      
    case FocusAnimationStyle.SHADOW:
      animationCSS = css`
        animation: ${shadowKeyframes} ${adjustedDuration}ms ${easing} ${iterations};
        animation-delay: ${delay}ms;
      `;
      break;
      
    case FocusAnimationStyle.COLOR_SHIFT:
      animationCSS = css`
        animation: ${colorShiftKeyframes} ${adjustedDuration}ms ${easing} ${iterations};
        animation-delay: ${delay}ms;
      `;
      break;
      
    case FocusAnimationStyle.DASH:
      animationCSS = css`
        outline: none;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          top: -${adjustedOffset}px;
          left: -${adjustedOffset}px;
          right: -${adjustedOffset}px;
          bottom: -${adjustedOffset}px;
          border: ${adjustedWidth}px dashed ${mainColor};
          stroke-dasharray: var(--dash-length);
          stroke-dashoffset: var(--dash-length);
          animation: ${dashKeyframes} ${adjustedDuration}ms ${easing} ${iterations};
          animation-delay: ${delay}ms;
        }
      `;
      break;
      
    case FocusAnimationStyle.STATIC:
    default:
      return generateStaticFocusStyle(options);
  }
  
  // Combine CSS variables and animation CSS
  return css`
    ${cssVars}
    ${animationCSS}
    ${customCSS || ''}
  `;
}

/**
 * Hook that provides accessible focus animations that respect user preferences
 * 
 * This hook helps create focus animations that maintain high visibility
 * while respecting user preferences for reduced motion and high contrast.
 * 
 * @param options Configuration options for the focus animation
 * @returns CSS for the focus animation that can be used in styled-components
 */
export function useAccessibleFocusAnimation(options: AccessibleFocusAnimationOptions = {}): {
  /**
   * CSS for the focus animation that can be used in styled-components
   * Apply this to the :focus-visible pseudo-class
   */
  focusStyle: FlattenSimpleInterpolation;
  
  /**
   * CSS for the focus-within animation that can be used in styled-components
   * Apply this to the :focus-within pseudo-class for container elements
   */
  focusWithinStyle: FlattenSimpleInterpolation;
  
  /**
   * CSS for both :focus-visible and :focus states for maximum compatibility
   */
  combinedFocusStyles: FlattenSimpleInterpolation;
  
  /**
   * Helper function to generate focus style with different options
   */
  generateFocusStyle: (overrideOptions?: AccessibleFocusAnimationOptions) => FlattenSimpleInterpolation;
} {
  // Get accessibility preferences
  const { prefersReducedMotion } = useReducedMotion({ 
    respectAppSettings: true 
  });
  
  const { isHighContrast } = useHighContrast({
    respectSystemPreference: true
  });
  
  // Merge provided options with defaults
  const mergedOptions = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    ...options
  }), [options]);
  
  // Get animation intensity modifiers
  const intensityModifier = useMemo(() => 
    intensityModifiers[mergedOptions.intensity || DEFAULT_OPTIONS.intensity]
  , [mergedOptions.intensity]);
  
  // Determine if animation should be enabled
  const isAnimationEnabled = useMemo(() => 
    !prefersReducedMotion || mergedOptions.highVisibility || intensityModifier.animationEnabled
  , [prefersReducedMotion, mergedOptions.highVisibility, intensityModifier.animationEnabled]);
  
  // Generate focus style
  const generateFocusStyle = useCallback((overrideOptions?: AccessibleFocusAnimationOptions) => {
    const finalOptions = { ...mergedOptions, ...overrideOptions };
    return generateFocusAnimation(finalOptions, prefersReducedMotion, isHighContrast, isAnimationEnabled);
  }, [mergedOptions, prefersReducedMotion, isHighContrast, isAnimationEnabled]);
  
  // Create base focus styles
  const focusStyle = useMemo(() => generateFocusStyle(), 
    [generateFocusStyle]);
  
  // Create a slightly modified version for focus-within
  const focusWithinStyle = useMemo(() => {
    const focusWithinOptions = {
      ...mergedOptions,
      intensity: 
        mergedOptions.intensity === FocusAnimationIntensity.MAXIMUM ? 
          FocusAnimationIntensity.STRONG : 
        mergedOptions.intensity === FocusAnimationIntensity.STRONG ?
          FocusAnimationIntensity.STANDARD :
          mergedOptions.intensity
    };
    
    return generateFocusStyle(focusWithinOptions);
  }, [mergedOptions, generateFocusStyle]);
  
  // Combined styles for both :focus-visible and :focus for maximum compatibility
  const combinedFocusStyles = useMemo(() => css`
    &:focus-visible {
      ${focusStyle}
    }
    
    /* Fallback for browsers that don't support :focus-visible */
    &:focus:not(:focus-visible) {
      ${generateStaticFocusStyle(mergedOptions)}
    }
  `, [focusStyle, mergedOptions]);
  
  return {
    focusStyle,
    focusWithinStyle,
    combinedFocusStyles,
    generateFocusStyle
  };
}

/**
 * Creates accessible focus animation CSS as a standalone function
 * This is useful when you can't use hooks (e.g., in global styles)
 */
export function createAccessibleFocusAnimation(
  options: AccessibleFocusAnimationOptions = {},
  reducedMotion: boolean = false,
  highContrast: boolean = false
): FlattenSimpleInterpolation {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const intensityModifier = intensityModifiers[mergedOptions.intensity || DEFAULT_OPTIONS.intensity];
  const isAnimationEnabled = !reducedMotion || mergedOptions.highVisibility || intensityModifier.animationEnabled;
  
  return generateFocusAnimation(mergedOptions, reducedMotion, highContrast, isAnimationEnabled);
}

/**
 * Create focus animation for an element
 * @returns CSS template literal for styled-components
 */
export const focusAnimation = (options: AccessibleFocusAnimationOptions = {}) => 
  css`
    &:focus-visible {
      ${createAccessibleFocusAnimation(options, false, false)}
    }
    
    /* Fallback for browsers that don't support :focus-visible */
    &:focus:not(:focus-visible) {
      ${generateStaticFocusStyle(options)}
    }
  `;

/**
 * Maps focus animation style to high contrast animation types
 * for compatibility with the high contrast system
 */
export function mapFocusToHighContrastType(
  focusStyle: FocusAnimationStyle
): HighContrastAnimationType {
  switch (focusStyle) {
    case FocusAnimationStyle.OUTLINE_PULSE:
      return HighContrastAnimationType.BORDER_PULSE;
    case FocusAnimationStyle.GLOW:
      return HighContrastAnimationType.OUTLINE_EXPANSION;
    case FocusAnimationStyle.BORDER:
      return HighContrastAnimationType.BORDER_FOCUS;
    case FocusAnimationStyle.SCALE:
      return HighContrastAnimationType.SIZE_CHANGE;
    case FocusAnimationStyle.COLOR_SHIFT:
      return HighContrastAnimationType.COLOR_SHIFT;
    case FocusAnimationStyle.BACKGROUND:
      return HighContrastAnimationType.BACKGROUND_FLASH;
    case FocusAnimationStyle.UNDERLINE:
    case FocusAnimationStyle.DASH:
    case FocusAnimationStyle.SHADOW:
    case FocusAnimationStyle.STATIC:
    default:
      return HighContrastAnimationType.BORDER_FOCUS;
  }
}