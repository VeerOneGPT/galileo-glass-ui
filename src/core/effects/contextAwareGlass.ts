/**
 * Context-Aware Glass Effects
 *
 * Glass effects that adapt based on content, surroundings, and interaction.
 */
import { css } from 'styled-components';

import { withAlpha } from '../colorUtils';
import { cssWithKebabProps } from '../cssUtils';
import { ThemeContext } from '../themeContext';

/**
 * Types of content that can be contained within the glass element
 */
export type ContentType =
  | 'text' // Text-heavy content
  | 'media' // Images or videos
  | 'data' // Charts, graphs, or data visualizations
  | 'control' // Interactive controls or inputs
  | 'mixed' // Mixed content types
  | 'unknown'; // Unknown content type

/**
 * Types of background that can be behind the glass element
 */
export type BackgroundType =
  | 'light' // Light-colored solid or simple background
  | 'dark' // Dark-colored solid or simple background
  | 'colorful' // Colorful or gradient background
  | 'image' // Image-based background
  | 'pattern' // Repeating pattern background
  | 'dynamic' // Video or animated background
  | 'complex' // Complex or busy background
  | 'unknown'; // Unknown background type

/**
 * Adaptation modes for context-aware glass
 */
export type AdaptationMode =
  | 'auto' // Automatically determine adaptation
  | 'content' // Adapt primarily based on content
  | 'background' // Adapt primarily based on background
  | 'balanced' // Balanced adaptation based on content and background
  | 'legibility' // Prioritize content legibility
  | 'aesthetic' // Prioritize visual aesthetics
  | 'accessibility' // Prioritize accessibility
  | 'contrast' // Maximize contrast for better visibility
  | 'immersive' // Create immersive glass effect
  | 'minimal' // Subtle glass effect
  | 'none'; // No adaptation (use base settings)

/**
 * Context-aware glass options
 */
export interface ContextAwareGlassOptions {
  /** Base background opacity (0-1) */
  baseOpacity?: number;

  /** Base blur strength in pixels */
  baseBlurStrength?: number;

  /** Base border opacity (0-1) */
  baseBorderOpacity?: number;

  /** Type of content contained in the glass element */
  contentType?: ContentType;

  /** Type of background behind the glass element */
  backgroundType?: BackgroundType;

  /** Adaptation mode to use */
  adaptationMode?: AdaptationMode;

  /** Color to use for tinting the glass */
  tintColor?: string;

  /** Tint intensity (0-1) */
  tintIntensity?: number;

  /** Minimum allowed opacity */
  minOpacity?: number;

  /** Maximum allowed opacity */
  maxOpacity?: number;

  /** Minimum allowed blur strength */
  minBlurStrength?: number;

  /** Maximum allowed blur strength */
  maxBlurStrength?: number;

  /** Enable depth effect */
  enableDepth?: boolean;

  /** Depth effect intensity (0-1) */
  depthIntensity?: number;

  /** Enable edge highlight */
  enableEdgeHighlight?: boolean;

  /** Edge highlight intensity (0-1) */
  edgeHighlightIntensity?: number;

  /** Enhance contrast for better visibility */
  enhanceContrast?: boolean;

  /** Enable glow effect */
  enableGlow?: boolean;

  /** Glow effect intensity (0-1) */
  glowIntensity?: number;

  /** Amount of noise texture (0-1) */
  noiseIntensity?: number;

  /** Light angle in degrees (for 3D effects) */
  lightAngle?: number;

  /** Enable reflections */
  enableReflections?: boolean;

  /** Reflection intensity (0-1) */
  reflectionIntensity?: number;

  /** Use backdrop-filter if available */
  useBackdropFilter?: boolean;

  /** Fallback quality for browsers without backdrop-filter (0-1) */
  fallbackQuality?: number;

  /** Theme context */
  themeContext?: ThemeContext;

  /** Is dark mode active */
  isDarkMode?: boolean;

  /** Priority scale for content readability (0-1) */
  readabilityPriority?: number;

  /** Priority scale for aesthetic appeal (0-1) */
  aestheticPriority?: number;
}

/**
 * Default context-aware glass options
 */
const DEFAULT_CONTEXT_OPTIONS: ContextAwareGlassOptions = {
  baseOpacity: 0.15,
  baseBlurStrength: 10,
  baseBorderOpacity: 0.2,
  contentType: 'unknown',
  backgroundType: 'unknown',
  adaptationMode: 'auto',
  tintIntensity: 0.1,
  minOpacity: 0.05,
  maxOpacity: 0.4,
  minBlurStrength: 3,
  maxBlurStrength: 20,
  enableDepth: false,
  depthIntensity: 0.3,
  enableEdgeHighlight: true,
  edgeHighlightIntensity: 0.5,
  enhanceContrast: false,
  enableGlow: false,
  glowIntensity: 0.3,
  noiseIntensity: 0.05,
  lightAngle: 45,
  enableReflections: false,
  reflectionIntensity: 0.2,
  useBackdropFilter: true,
  fallbackQuality: 0.7,
  isDarkMode: false,
  readabilityPriority: 0.7,
  aestheticPriority: 0.6,
};

/**
 * Create content-aware glass adjustments based on content type
 */
const adjustForContentType = (
  contentType: ContentType,
  baseOpacity: number,
  baseBlurStrength: number,
  baseBorderOpacity: number,
  readabilityPriority: number
): {
  adjustedOpacity: number;
  adjustedBlurStrength: number;
  adjustedBorderOpacity: number;
} => {
  // Default: no adjustments
  let opacityMultiplier = 1;
  let blurMultiplier = 1;
  let borderMultiplier = 1;

  // Adjust settings based on content type
  switch (contentType) {
    case 'text':
      // Text needs more opacity for better readability
      opacityMultiplier = 1.2 * readabilityPriority;
      blurMultiplier = 0.85;
      borderMultiplier = 1.1;
      break;

    case 'media':
      // Media benefits from higher transparency
      opacityMultiplier = 0.85;
      blurMultiplier = 1.2;
      borderMultiplier = 1.15;
      break;

    case 'data':
      // Data visualization needs good contrast
      opacityMultiplier = 1.1 * readabilityPriority;
      blurMultiplier = 0.9;
      borderMultiplier = 1.2;
      break;

    case 'control':
      // Interactive controls need to be visible
      opacityMultiplier = 1.15 * readabilityPriority;
      blurMultiplier = 0.8;
      borderMultiplier = 1.3;
      break;

    case 'mixed':
      // Mixed content gets moderate adjustments
      opacityMultiplier = 1.05;
      blurMultiplier = 1;
      borderMultiplier = 1.1;
      break;

    default:
      // No adjustments for unknown content
      break;
  }

  return {
    adjustedOpacity: baseOpacity * opacityMultiplier,
    adjustedBlurStrength: baseBlurStrength * blurMultiplier,
    adjustedBorderOpacity: baseBorderOpacity * borderMultiplier,
  };
};

/**
 * Create background-aware glass adjustments based on background type
 */
const adjustForBackgroundType = (
  backgroundType: BackgroundType,
  baseOpacity: number,
  baseBlurStrength: number,
  baseBorderOpacity: number,
  isDarkMode: boolean,
  aestheticPriority: number
): {
  adjustedOpacity: number;
  adjustedBlurStrength: number;
  adjustedBorderOpacity: number;
} => {
  // Default: no adjustments
  let opacityMultiplier = 1;
  let blurMultiplier = 1;
  let borderMultiplier = 1;

  // Adjust settings based on background type
  switch (backgroundType) {
    case 'light':
      // Light backgrounds need different handling in light/dark mode
      if (isDarkMode) {
        // In dark mode with light background, increase opacity
        opacityMultiplier = 1 + 0.3 * aestheticPriority;
        blurMultiplier = 1.15;
      } else {
        // In light mode with light background, decrease opacity
        opacityMultiplier = 0.9;
        blurMultiplier = 0.95;
        borderMultiplier = 1.2; // Emphasize borders
      }
      break;

    case 'dark':
      // Dark backgrounds need opposite handling
      if (!isDarkMode) {
        // In light mode with dark background, increase opacity
        opacityMultiplier = 1 + 0.3 * aestheticPriority;
        blurMultiplier = 1.15;
      } else {
        // In dark mode with dark background, decrease opacity
        opacityMultiplier = 0.9;
        blurMultiplier = 0.95;
        borderMultiplier = 1.2; // Emphasize borders
      }
      break;

    case 'colorful':
    case 'pattern':
      // Colorful backgrounds need more blur and opacity
      opacityMultiplier = 1.15 * aestheticPriority;
      blurMultiplier = 1.3;
      break;

    case 'image':
      // Image backgrounds need significant blur but controlled opacity
      opacityMultiplier = 1.2 * aestheticPriority;
      blurMultiplier = 1.4;
      borderMultiplier = 1.1;
      break;

    case 'dynamic':
      // Dynamic backgrounds need maximum blur and higher opacity
      opacityMultiplier = 1.3 * aestheticPriority;
      blurMultiplier = 1.5;
      borderMultiplier = 1.2;
      break;

    case 'complex':
      // Complex backgrounds need isolation with maximum settings
      opacityMultiplier = 1.35 * aestheticPriority;
      blurMultiplier = 1.6;
      borderMultiplier = 1.3;
      break;

    default:
      // No adjustments for unknown background
      break;
  }

  return {
    adjustedOpacity: baseOpacity * opacityMultiplier,
    adjustedBlurStrength: baseBlurStrength * blurMultiplier,
    adjustedBorderOpacity: baseBorderOpacity * borderMultiplier,
  };
};

/**
 * Apply final adaptation based on the selected mode
 */
const applyAdaptationMode = (
  mode: AdaptationMode,
  contentAdjustments: {
    adjustedOpacity: number;
    adjustedBlurStrength: number;
    adjustedBorderOpacity: number;
  },
  backgroundAdjustments: {
    adjustedOpacity: number;
    adjustedBlurStrength: number;
    adjustedBorderOpacity: number;
  },
  options: ContextAwareGlassOptions
): {
  finalOpacity: number;
  finalBlurStrength: number;
  finalBorderOpacity: number;
} => {
  const base = {
    opacity: options.baseOpacity || DEFAULT_CONTEXT_OPTIONS.baseOpacity!,
    blurStrength: options.baseBlurStrength || DEFAULT_CONTEXT_OPTIONS.baseBlurStrength!,
    borderOpacity: options.baseBorderOpacity || DEFAULT_CONTEXT_OPTIONS.baseBorderOpacity!,
  };

  const content = contentAdjustments;
  const background = backgroundAdjustments;

  let result = { ...base };

  switch (mode) {
    case 'content':
      // Prioritize content adjustments
      result = {
        opacity: content.adjustedOpacity,
        blurStrength: content.adjustedBlurStrength,
        borderOpacity: content.adjustedBorderOpacity,
      };
      break;

    case 'background':
      // Prioritize background adjustments
      result = {
        opacity: background.adjustedOpacity,
        blurStrength: background.adjustedBlurStrength,
        borderOpacity: background.adjustedBorderOpacity,
      };
      break;

    case 'balanced':
      // Average both adjustments
      result = {
        opacity: (content.adjustedOpacity + background.adjustedOpacity) / 2,
        blurStrength: (content.adjustedBlurStrength + background.adjustedBlurStrength) / 2,
        borderOpacity: (content.adjustedBorderOpacity + background.adjustedBorderOpacity) / 2,
      };
      break;

    case 'legibility':
      // Maximize legibility
      result = {
        opacity: Math.max(content.adjustedOpacity, base.opacity * 1.2),
        blurStrength: Math.min(content.adjustedBlurStrength, base.blurStrength * 0.9),
        borderOpacity: Math.max(content.adjustedBorderOpacity, base.borderOpacity * 1.2),
      };
      break;

    case 'aesthetic':
      // Maximize aesthetics
      result = {
        opacity: Math.min(background.adjustedOpacity, base.opacity * 0.9),
        blurStrength: Math.max(background.adjustedBlurStrength, base.blurStrength * 1.3),
        borderOpacity: background.adjustedBorderOpacity,
      };
      break;

    case 'accessibility':
      // Maximize accessibility
      result = {
        opacity: Math.max(content.adjustedOpacity, base.opacity * 1.3),
        blurStrength: Math.min(content.adjustedBlurStrength, base.blurStrength * 0.7),
        borderOpacity: Math.max(content.adjustedBorderOpacity, base.borderOpacity * 1.4),
      };
      break;

    case 'contrast':
      // Maximize contrast
      result = {
        opacity: base.opacity * 1.5,
        blurStrength: base.blurStrength * 0.8,
        borderOpacity: base.borderOpacity * 1.4,
      };
      break;

    case 'immersive':
      // Immersive experience
      result = {
        opacity: base.opacity * 0.7,
        blurStrength: base.blurStrength * 1.6,
        borderOpacity: base.borderOpacity * 0.8,
      };
      break;

    case 'minimal':
      // Minimal glass effect
      result = {
        opacity: base.opacity * 0.7,
        blurStrength: base.blurStrength * 0.6,
        borderOpacity: base.borderOpacity * 0.7,
      };
      break;

    case 'none':
      // Use base settings
      result = { ...base };
      break;

    case 'auto':
    default:
      // Smart auto-adaptation
      // If content is text or control, prioritize content adjustments
      if (
        options.contentType === 'text' ||
        options.contentType === 'control' ||
        options.contentType === 'data'
      ) {
        result.opacity = content.adjustedOpacity * 0.7 + background.adjustedOpacity * 0.3;
        result.blurStrength =
          content.adjustedBlurStrength * 0.7 + background.adjustedBlurStrength * 0.3;
        result.borderOpacity = content.adjustedBorderOpacity;
      }
      // If background is complex, image or dynamic, prioritize background adjustments
      else if (
        options.backgroundType === 'complex' ||
        options.backgroundType === 'image' ||
        options.backgroundType === 'dynamic'
      ) {
        result.opacity = content.adjustedOpacity * 0.3 + background.adjustedOpacity * 0.7;
        result.blurStrength =
          content.adjustedBlurStrength * 0.3 + background.adjustedBlurStrength * 0.7;
        result.borderOpacity =
          (content.adjustedBorderOpacity + background.adjustedBorderOpacity) / 2;
      }
      // Otherwise, balanced approach
      else {
        result.opacity = (content.adjustedOpacity + background.adjustedOpacity) / 2;
        result.blurStrength = (content.adjustedBlurStrength + background.adjustedBlurStrength) / 2;
        result.borderOpacity =
          (content.adjustedBorderOpacity + background.adjustedBorderOpacity) / 2;
      }
      break;
  }

  // Ensure values are within the allowed range
  const minOpacity = options.minOpacity || DEFAULT_CONTEXT_OPTIONS.minOpacity!;
  const maxOpacity = options.maxOpacity || DEFAULT_CONTEXT_OPTIONS.maxOpacity!;
  const minBlurStrength = options.minBlurStrength || DEFAULT_CONTEXT_OPTIONS.minBlurStrength!;
  const maxBlurStrength = options.maxBlurStrength || DEFAULT_CONTEXT_OPTIONS.maxBlurStrength!;

  return {
    finalOpacity: Math.max(minOpacity, Math.min(maxOpacity, result.opacity)),
    finalBlurStrength: Math.max(minBlurStrength, Math.min(maxBlurStrength, result.blurStrength)),
    finalBorderOpacity: Math.max(0.05, Math.min(0.5, result.borderOpacity)),
  };
};

/**
 * Create blur effect with fallback
 */
const createBlurEffect = (
  blurStrength: number,
  useBackdropFilter: boolean,
  fallbackQuality: number
): ReturnType<typeof css> => {
  if (useBackdropFilter) {
    return cssWithKebabProps`
      backdrop-filter: blur(${blurStrength}px);
      -webkit-backdrop-filter: blur(${blurStrength}px);
    `;
  } else {
    // Fallback: simplified blur implementation
    // Lower quality but works in more browsers
    const adjustedBlurStrength = blurStrength * fallbackQuality;

    return cssWithKebabProps`
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        inset: -10px; /* Extended to avoid edge artifacts */
        background: inherit;
        filter: blur(${adjustedBlurStrength}px);
        z-index: -1;
      }
    `;
  }
};

/**
 * Create depth effect
 */
const createDepthEffect = (
  intensity: number,
  lightAngle: number,
  isDarkMode: boolean
): ReturnType<typeof css> => {
  // Calculate light direction
  const radian = (lightAngle * Math.PI) / 180;
  const x = Math.cos(radian) * 5 * intensity;
  const y = Math.sin(radian) * 5 * intensity;

  // Adjust shadow colors based on light/dark mode
  const shadowColor = isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.25)';
  const highlightColor = isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.15)';

  return cssWithKebabProps`
    box-shadow: 
      /* Shadow based on light angle */
      ${x}px ${y}px ${10 * intensity}px 0 ${shadowColor},
      /* Inner highlight opposite to shadow */
      inset ${-x * 0.3}px ${-y * 0.3}px ${5 * intensity}px 0 ${highlightColor};
  `;
};

/**
 * Create edge highlight effect
 */
const createEdgeHighlight = (intensity: number, isDarkMode: boolean): ReturnType<typeof css> => {
  const color = isDarkMode
    ? `rgba(255, 255, 255, ${intensity * 0.12})`
    : `rgba(255, 255, 255, ${intensity * 0.25})`;

  return cssWithKebabProps`
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid ${color};
      border-radius: inherit;
      pointer-events: none;
    }
  `;
};

/**
 * Create reflection effect
 */
const createReflectionEffect = (
  intensity: number,
  lightAngle: number,
  isDarkMode: boolean
): ReturnType<typeof css> => {
  // Calculate reflection direction (top-left to bottom-right by default)
  const radian = (lightAngle * Math.PI) / 180;
  const xStart = Math.round(Math.cos(radian + Math.PI) * 100); // Opposite to light
  const yStart = Math.round(Math.sin(radian + Math.PI) * 100);
  const xEnd = Math.round(Math.cos(radian) * 100);
  const yEnd = Math.round(Math.sin(radian) * 100);

  // Adjust reflection colors based on light/dark mode
  const reflectionColor = isDarkMode
    ? `rgba(255, 255, 255, ${intensity * 0.07})`
    : `rgba(255, 255, 255, ${intensity * 0.15})`;

  const transparentColor = 'rgba(255, 255, 255, 0)';

  return cssWithKebabProps`
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        ${lightAngle}deg,
        ${reflectionColor} 0%,
        ${transparentColor} 80%
      );
      border-radius: inherit;
      pointer-events: none;
    }
  `;
};

/**
 * Create noise texture
 */
const createNoiseTexture = (intensity: number): ReturnType<typeof css> => {
  return cssWithKebabProps`
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='${intensity}'/%3E%3C/svg%3E");
      background-repeat: repeat;
      opacity: ${intensity};
      mix-blend-mode: overlay;
      pointer-events: none;
    }
  `;
};

/**
 * Create contrast enhancement
 */
const createContrastEnhancement = (isDarkMode: boolean): ReturnType<typeof css> => {
  return cssWithKebabProps`
    ${
      isDarkMode
        ? `
      & > * {
        text-shadow: 0 0 1px rgba(0, 0, 0, 0.8);
      }
      
      & img, & svg {
        filter: brightness(1.05) contrast(1.05);
      }
    `
        : `
      & > * {
        text-shadow: 0 0 1px rgba(255, 255, 255, 0.8);
      }
      
      & img, & svg {
        filter: brightness(0.98) contrast(1.05);
      }
    `
    }
  `;
};

/**
 * Context-aware glass effects that adapt to content and surroundings
 * @param options Options for context-aware glass effects
 * @returns CSS styles for the context-aware glass effect
 */
export const contextAwareGlass = (
  options: ContextAwareGlassOptions = {}
): ReturnType<typeof css> => {
  // Merge options with defaults
  const mergedOptions: ContextAwareGlassOptions = {
    ...DEFAULT_CONTEXT_OPTIONS,
    ...options,
  };

  const {
    baseOpacity,
    baseBlurStrength,
    baseBorderOpacity,
    contentType,
    backgroundType,
    adaptationMode,
    tintColor,
    tintIntensity,
    enableDepth,
    depthIntensity,
    enableEdgeHighlight,
    edgeHighlightIntensity,
    enhanceContrast,
    enableGlow,
    glowIntensity,
    noiseIntensity,
    lightAngle,
    enableReflections,
    reflectionIntensity,
    useBackdropFilter,
    fallbackQuality,
    themeContext,
    isDarkMode: forceDarkMode,
    readabilityPriority,
    aestheticPriority,
  } = mergedOptions;

  // Determine if dark mode is active
  const isDarkMode = forceDarkMode || themeContext?.isDarkMode || false;

  // Get standard normalized priorities
  const normalizedReadabilityPriority =
    readabilityPriority || DEFAULT_CONTEXT_OPTIONS.readabilityPriority!;
  const normalizedAestheticPriority =
    aestheticPriority || DEFAULT_CONTEXT_OPTIONS.aestheticPriority!;

  // Determine content and background adjustments
  const contentAdjustments = adjustForContentType(
    contentType || 'unknown',
    baseOpacity || DEFAULT_CONTEXT_OPTIONS.baseOpacity!,
    baseBlurStrength || DEFAULT_CONTEXT_OPTIONS.baseBlurStrength!,
    baseBorderOpacity || DEFAULT_CONTEXT_OPTIONS.baseBorderOpacity!,
    normalizedReadabilityPriority
  );

  const backgroundAdjustments = adjustForBackgroundType(
    backgroundType || 'unknown',
    baseOpacity || DEFAULT_CONTEXT_OPTIONS.baseOpacity!,
    baseBlurStrength || DEFAULT_CONTEXT_OPTIONS.baseBlurStrength!,
    baseBorderOpacity || DEFAULT_CONTEXT_OPTIONS.baseBorderOpacity!,
    isDarkMode,
    normalizedAestheticPriority
  );

  // Apply final adaptation based on mode
  const { finalOpacity, finalBlurStrength, finalBorderOpacity } = applyAdaptationMode(
    adaptationMode || 'auto',
    contentAdjustments,
    backgroundAdjustments,
    mergedOptions
  );

  // Prepare tint color
  let bgTintColor = tintColor;

  // If tint color is undefined, get from theme context
  if (!bgTintColor && themeContext?.getColor) {
    bgTintColor = isDarkMode
      ? themeContext.getColor('nebula.background.dark', '#1a1a2e')
      : themeContext.getColor('nebula.background.light', '#ffffff');
  } else if (!bgTintColor) {
    // Fallback if no theme context
    bgTintColor = isDarkMode ? '#1a1a2e' : '#ffffff';
  }

  const adjustedTintColor = withAlpha(
    bgTintColor || '#ffffff',
    (tintIntensity || 0.1) * finalOpacity
  );

  // Basic glass styles with background and blur
  let glassStyles = cssWithKebabProps`
    background-color: ${adjustedTintColor};
    ${createBlurEffect(
      finalBlurStrength,
      useBackdropFilter !== false,
      fallbackQuality || DEFAULT_CONTEXT_OPTIONS.fallbackQuality!
    )}
    border: 1px solid ${withAlpha(isDarkMode ? '#ffffff' : '#000000', finalBorderOpacity)};
    transition: background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
  `;

  // Add depth effect if enabled
  if (enableDepth) {
    glassStyles = cssWithKebabProps`
      ${glassStyles}
      ${createDepthEffect(
        depthIntensity || DEFAULT_CONTEXT_OPTIONS.depthIntensity!,
        lightAngle || DEFAULT_CONTEXT_OPTIONS.lightAngle!,
        isDarkMode
      )}
    `;
  }

  // Add edge highlight if enabled
  if (enableEdgeHighlight) {
    glassStyles = cssWithKebabProps`
      ${glassStyles}
      ${createEdgeHighlight(
        edgeHighlightIntensity || DEFAULT_CONTEXT_OPTIONS.edgeHighlightIntensity!,
        isDarkMode
      )}
    `;
  }

  // Add reflection effect if enabled
  if (enableReflections) {
    glassStyles = cssWithKebabProps`
      ${glassStyles}
      ${createReflectionEffect(
        reflectionIntensity || DEFAULT_CONTEXT_OPTIONS.reflectionIntensity!,
        lightAngle || DEFAULT_CONTEXT_OPTIONS.lightAngle!,
        isDarkMode
      )}
    `;
  }

  // Add noise texture if enabled
  if (noiseIntensity && noiseIntensity > 0) {
    glassStyles = cssWithKebabProps`
      ${glassStyles}
      ${createNoiseTexture(noiseIntensity)}
    `;
  }

  // Add contrast enhancement if enabled
  if (enhanceContrast) {
    glassStyles = cssWithKebabProps`
      ${glassStyles}
      ${createContrastEnhancement(isDarkMode)}
    `;
  }

  // For glow effect, we'd typically import and apply enhancedGlowEffects here
  // but we'll add a placeholder for it
  if (enableGlow) {
    const glowColor = isDarkMode ? '#6366F1' : '#8B5CF6';
    const intensity = glowIntensity || 0.3;

    glassStyles = cssWithKebabProps`
      ${glassStyles}
      box-shadow: 0 0 15px 0 ${withAlpha(glowColor, intensity)};
    `;
  }

  return glassStyles;
};

/**
 * Simpler API for context-aware glass
 */
export const adaptiveGlass = contextAwareGlass;
