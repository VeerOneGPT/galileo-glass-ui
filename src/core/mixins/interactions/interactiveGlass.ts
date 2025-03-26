/**
 * Interactive Glass Mixin
 *
 * Creates interactive glass effects for components
 */
import { css } from 'styled-components';

import { withAlpha } from '../../colorUtils';
import { cssWithKebabProps } from '../../cssUtils';

/**
 * Interactive glass options
 */
export interface InteractiveGlassOptions {
  /**
   * Hover effect type
   */
  hoverEffect?: 'glow' | 'lift' | 'brighten' | 'expand' | 'highlight' | 'none';

  /**
   * Active effect type
   */
  activeEffect?: 'press' | 'darken' | 'sink' | 'outline' | 'none';

  /**
   * Focus effect type
   */
  focusEffect?: 'outline' | 'glow' | 'ring' | 'border' | 'none';

  /**
   * Disabled effect type
   */
  disabledEffect?: 'fade' | 'blur' | 'grayscale' | 'none';

  /**
   * Base glass surface blur strength
   */
  blurStrength?: 'minimal' | 'light' | 'standard' | 'enhanced' | string | number;

  /**
   * Base glass surface background opacity
   */
  backgroundOpacity?: 'subtle' | 'light' | 'medium' | 'strong' | number;

  /**
   * Base border opacity
   */
  borderOpacity?: 'none' | 'subtle' | 'light' | 'medium' | 'strong' | number;

  /**
   * Elevation level (0-5)
   */
  elevation?: number | 'low' | 'medium' | 'high';

  /**
   * Main color of the component
   */
  color?: string;

  /**
   * Color to use for focus effects
   */
  focusColor?: string;

  /**
   * If true, reduces motion effects
   */
  reducedMotion?: boolean;

  /**
   * Transition duration in seconds
   */
  transitionDuration?: number;

  /**
   * Theme context
   */
  themeContext?: any;
}

/**
 * Convert options to values
 */
const getOptionValues = (options: InteractiveGlassOptions, isDarkMode: boolean) => {
  // Blur strength
  const getBlurValue = (blur?: string | number): string => {
    if (typeof blur === 'number') return `${blur}px`;
    if (typeof blur === 'string' && !isNaN(parseFloat(blur))) return blur;

    switch (blur) {
      case 'minimal':
        return '4px';
      case 'light':
        return '8px';
      case 'standard':
        return '12px';
      case 'enhanced':
        return '20px';
      default:
        return '12px';
    }
  };

  // Background opacity
  const getBgOpacity = (opacity?: string | number): number => {
    if (typeof opacity === 'number') return opacity;

    switch (opacity) {
      case 'subtle':
        return 0.1;
      case 'light':
        return 0.2;
      case 'medium':
        return 0.4;
      case 'strong':
        return 0.6;
      default:
        return 0.2;
    }
  };

  // Border opacity
  const getBorderOpacity = (opacity?: string | number): number => {
    if (typeof opacity === 'number') return opacity;

    switch (opacity) {
      case 'none':
        return 0;
      case 'subtle':
        return 0.1;
      case 'light':
        return 0.2;
      case 'medium':
        return 0.3;
      case 'strong':
        return 0.4;
      default:
        return 0.1;
    }
  };

  // Elevation
  const getElevationValue = (elevation?: number | string): number => {
    if (typeof elevation === 'number') return elevation;

    switch (elevation) {
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      default:
        return 2;
    }
  };

  return {
    blurValue: getBlurValue(options.blurStrength),
    bgOpacity: getBgOpacity(options.backgroundOpacity),
    borderOpacity: getBorderOpacity(options.borderOpacity),
    elevation: getElevationValue(options.elevation),
    color: options.color || (isDarkMode ? '#5b6ecc' : '#3b82f6'),
    focusColor: options.focusColor || (isDarkMode ? '#90caf9' : '#2196f3'),
    transitionDuration: options.transitionDuration || 0.2,
    reducedMotion: options.reducedMotion || false,
  };
};

/**
 * Build the base glass styles
 */
const buildBaseStyles = (
  values: ReturnType<typeof getOptionValues>,
  isDarkMode: boolean
): string => {
  return `
    position: relative;
    background-color: ${
      isDarkMode
        ? `rgba(15, 23, 42, ${values.bgOpacity})`
        : `rgba(255, 255, 255, ${values.bgOpacity})`
    };
    backdrop-filter: blur(${values.blurValue});
    -webkit-backdrop-filter: blur(${values.blurValue});
    border: 1px solid ${
      isDarkMode
        ? `rgba(255, 255, 255, ${values.borderOpacity})`
        : `rgba(255, 255, 255, ${values.borderOpacity + 0.3})`
    };
    box-shadow: 0 ${values.elevation * 2}px ${values.elevation * 4}px ${withAlpha(
    isDarkMode ? '#000000' : '#1E293B',
    0.1 + values.elevation * 0.02
  )};
    border-radius: 8px;
    transition: all ${values.transitionDuration}s ease-in-out;
    cursor: pointer;
  `;
};

/**
 * Build hover effect styles
 */
const buildHoverEffects = (
  hoverEffect: string | undefined,
  values: ReturnType<typeof getOptionValues>,
  isDarkMode: boolean
): string => {
  if (!hoverEffect || hoverEffect === 'none') return '';

  let hoverStyles = '';

  switch (hoverEffect) {
    case 'glow':
      hoverStyles = `
        &:hover {
          box-shadow: 0 ${values.elevation * 3}px ${values.elevation * 6}px ${withAlpha(
        values.color,
        0.3
      )};
          border-color: ${withAlpha(values.color, values.borderOpacity + 0.1)};
        }
      `;
      break;
    case 'lift':
      hoverStyles = `
        &:hover {
          ${
            values.reducedMotion
              ? `
            box-shadow: 0 ${values.elevation * 3}px ${values.elevation * 6}px ${withAlpha(
                  isDarkMode ? '#000000' : '#1E293B',
                  0.12 + values.elevation * 0.02
                )};
          `
              : `
            transform: translateY(-3px);
            box-shadow: 0 ${values.elevation * 3}px ${values.elevation * 6}px ${withAlpha(
                  isDarkMode ? '#000000' : '#1E293B',
                  0.12 + values.elevation * 0.02
                )};
          `
          }
        }
      `;
      break;
    case 'brighten':
      hoverStyles = `
        &:hover {
          background-color: ${
            isDarkMode
              ? `rgba(30, 41, 59, ${values.bgOpacity + 0.1})`
              : `rgba(255, 255, 255, ${values.bgOpacity + 0.15})`
          };
          border-color: ${
            isDarkMode
              ? `rgba(255, 255, 255, ${values.borderOpacity + 0.1})`
              : `rgba(255, 255, 255, ${values.borderOpacity + 0.4})`
          };
        }
      `;
      break;
    case 'expand':
      hoverStyles = `
        &:hover {
          ${
            values.reducedMotion
              ? `
            box-shadow: 0 ${values.elevation * 2.5}px ${values.elevation * 5}px ${withAlpha(
                  isDarkMode ? '#000000' : '#1E293B',
                  0.12 + values.elevation * 0.02
                )};
          `
              : `
            transform: scale(1.02);
            box-shadow: 0 ${values.elevation * 2.5}px ${values.elevation * 5}px ${withAlpha(
                  isDarkMode ? '#000000' : '#1E293B',
                  0.12 + values.elevation * 0.02
                )};
          `
          }
        }
      `;
      break;
    case 'highlight':
      hoverStyles = `
        &:hover {
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 8px;
            background: linear-gradient(135deg, ${withAlpha(values.color, 0.1)}, transparent 50%);
            pointer-events: none;
          }
        }
      `;
      break;
    default:
      break;
  }

  return hoverStyles;
};

/**
 * Build active effect styles
 */
const buildActiveEffects = (
  activeEffect: string | undefined,
  values: ReturnType<typeof getOptionValues>,
  isDarkMode: boolean
): string => {
  if (!activeEffect || activeEffect === 'none') return '';

  let activeStyles = '';

  switch (activeEffect) {
    case 'press':
      activeStyles = `
        &:active {
          ${
            values.reducedMotion
              ? `
            box-shadow: 0 ${values.elevation}px ${values.elevation * 2}px ${withAlpha(
                  isDarkMode ? '#000000' : '#1E293B',
                  0.1 + values.elevation * 0.02
                )};
          `
              : `
            transform: translateY(1px);
            box-shadow: 0 ${values.elevation}px ${values.elevation * 2}px ${withAlpha(
                  isDarkMode ? '#000000' : '#1E293B',
                  0.1 + values.elevation * 0.02
                )};
          `
          }
        }
      `;
      break;
    case 'darken':
      activeStyles = `
        &:active {
          background-color: ${
            isDarkMode
              ? `rgba(15, 23, 42, ${values.bgOpacity * 1.3})`
              : `rgba(240, 240, 240, ${values.bgOpacity * 1.3})`
          };
        }
      `;
      break;
    case 'sink':
      activeStyles = `
        &:active {
          ${
            values.reducedMotion
              ? `
            box-shadow: 0 ${values.elevation}px ${values.elevation * 2}px ${withAlpha(
                  isDarkMode ? '#000000' : '#1E293B',
                  0.1 + values.elevation * 0.02
                )};
          `
              : `
            transform: scale(0.98);
            box-shadow: 0 ${values.elevation}px ${values.elevation * 2}px ${withAlpha(
                  isDarkMode ? '#000000' : '#1E293B',
                  0.1 + values.elevation * 0.02
                )};
          `
          }
        }
      `;
      break;
    case 'outline':
      activeStyles = `
        &:active {
          border-color: ${withAlpha(values.color, 0.5)};
          box-shadow: 0 0 0 2px ${withAlpha(values.color, 0.2)};
        }
      `;
      break;
    default:
      break;
  }

  return activeStyles;
};

/**
 * Build focus effect styles
 */
const buildFocusEffects = (
  focusEffect: string | undefined,
  values: ReturnType<typeof getOptionValues>,
  isDarkMode: boolean
): string => {
  if (!focusEffect || focusEffect === 'none') return '';

  let focusStyles = '';

  switch (focusEffect) {
    case 'outline':
      focusStyles = `
        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px ${withAlpha(values.focusColor, 0.4)};
        }
      `;
      break;
    case 'glow':
      focusStyles = `
        &:focus-visible {
          outline: none;
          box-shadow: 0 0 8px ${withAlpha(values.focusColor, 0.5)}, 0 0 0 2px ${withAlpha(
        values.focusColor,
        0.2
      )};
        }
      `;
      break;
    case 'ring':
      focusStyles = `
        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px ${isDarkMode ? '#000000' : '#ffffff'}, 0 0 0 4px ${withAlpha(
        values.focusColor,
        0.5
      )};
        }
      `;
      break;
    case 'border':
      focusStyles = `
        &:focus-visible {
          outline: none;
          border-color: ${withAlpha(values.focusColor, 0.7)};
        }
      `;
      break;
    default:
      break;
  }

  return focusStyles;
};

/**
 * Build disabled effect styles
 */
const buildDisabledEffects = (
  disabledEffect: string | undefined,
  values: ReturnType<typeof getOptionValues>,
  isDarkMode: boolean
): string => {
  if (!disabledEffect || disabledEffect === 'none') return '';

  let disabledStyles = '';

  switch (disabledEffect) {
    case 'fade':
      disabledStyles = `
        &:disabled, &[aria-disabled="true"] {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }
      `;
      break;
    case 'blur':
      disabledStyles = `
        &:disabled, &[aria-disabled="true"] {
          opacity: 0.7;
          filter: blur(1px);
          cursor: not-allowed;
          pointer-events: none;
        }
      `;
      break;
    case 'grayscale':
      disabledStyles = `
        &:disabled, &[aria-disabled="true"] {
          filter: grayscale(90%);
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }
      `;
      break;
    default:
      break;
  }

  return disabledStyles;
};

/**
 * Creates an interactive glass effect
 */
export const interactiveGlass = (options: InteractiveGlassOptions) => {
  const {
    hoverEffect = 'glow',
    activeEffect = 'press',
    focusEffect = 'outline',
    disabledEffect = 'fade',
    blurStrength = 'standard',
    backgroundOpacity = 'light',
    borderOpacity = 'subtle',
    elevation = 2,
    color,
    focusColor,
    reducedMotion = false,
    transitionDuration = 0.2,
    themeContext,
  } = options;

  // Determine if dark mode
  const isDarkMode = themeContext?.isDarkMode || false;

  // Get computed values
  const values = getOptionValues(
    {
      blurStrength,
      backgroundOpacity,
      borderOpacity,
      elevation,
      color,
      focusColor,
      reducedMotion,
      transitionDuration,
    },
    isDarkMode
  );

  // Build the styles
  const baseStyles = buildBaseStyles(values, isDarkMode);
  const hoverStyles = buildHoverEffects(hoverEffect, values, isDarkMode);
  const activeStyles = buildActiveEffects(activeEffect, values, isDarkMode);
  const focusStyles = buildFocusEffects(focusEffect, values, isDarkMode);
  const disabledStyles = buildDisabledEffects(disabledEffect, values, isDarkMode);

  // Build the final CSS
  return cssWithKebabProps`
    ${baseStyles}
    ${hoverStyles}
    ${activeStyles}
    ${focusStyles}
    ${disabledStyles}
  `;
};

export default interactiveGlass;
