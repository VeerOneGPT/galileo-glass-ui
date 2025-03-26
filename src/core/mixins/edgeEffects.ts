/**
 * Edge Effects Mixins
 *
 * Styled-components mixins for creating enhanced border and edge effects
 */
import { css } from 'styled-components';

import { createThemeContext, ThemeContext } from '../theme';

/**
 * Edge effect options
 */
export interface EdgeEffectProps {
  /** Edge effect intensity */
  edgeIntensity?: 'none' | 'subtle' | 'light' | 'medium' | 'strong' | number;

  /** Edge highlight color */
  edgeColor?: string;

  /** Edge style */
  edgeStyle?: 'smooth' | 'sharp' | 'inset' | 'outset' | 'ridge' | 'groove';

  /** Dark mode toggle */
  darkMode?: boolean;

  /** Apply only to specific edges (top, right, bottom, left) */
  edges?: string[];

  /** Theme context for styled-components */
  themeContext?: ThemeContext;

  /**
   * @deprecated Use edgeIntensity instead
   */
  intensity?: 'none' | 'subtle' | 'light' | 'medium' | 'strong' | number;

  /**
   * @deprecated Use edgeColor instead
   */
  color?: string;

  /**
   * @deprecated Use edgeStyle instead
   */
  position?: string;

  /**
   * @deprecated Use within edgeStyle options
   */
  thickness?: number;

  /**
   * @deprecated Use within edgeIntensity calculation
   */
  opacity?: number;
}

/**
 * Convert edge intensity to numeric value
 */
export const getEdgeIntensity = (intensity?: EdgeEffectProps['edgeIntensity']): number => {
  if (typeof intensity === 'number') {
    return Math.max(0, Math.min(1, intensity));
  }

  switch (intensity) {
    case 'strong':
      return 1;
    case 'medium':
      return 0.6;
    case 'light':
      return 0.3;
    case 'subtle':
      return 0.15;
    case 'none':
    default:
      return 0;
  }
};

/**
 * Create a glassy edge highlight effect
 */
export const glassEdge = (props: EdgeEffectProps, theme?: ThemeContext) => {
  const themeContext = theme || props.themeContext || createThemeContext();
  // Handle legacy properties
  const edgeIntensity = props.edgeIntensity || props.intensity;
  const intensity = getEdgeIntensity(edgeIntensity);

  if (intensity === 0) {
    return css``;
  }

  const edgeColor = props.edgeColor || props.color || themeContext.getColor('common.white');
  const isDark = props.darkMode || themeContext.colorMode === 'dark';

  // Calculate edge parameters based on intensity and theme
  const edgeOpacity = isDark ? intensity * 0.25 : intensity * 0.4;
  const edgeWidth = Math.max(1, Math.round(intensity * 2));

  // Get edge style
  const edgeStyle = props.edgeStyle || 'smooth';
  const useInsetStyle = ['inset', 'groove'].includes(edgeStyle);

  // Create edge effect based on specified edges
  if (props.edges && props.edges.length > 0) {
    const borderProps = props.edges
      .map(edge => {
        switch (edge.toLowerCase()) {
          case 'top':
            return `border-top: ${edgeWidth}px ${
              useInsetStyle ? 'inset' : 'solid'
            } ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};`;
          case 'right':
            return `border-right: ${edgeWidth}px ${
              useInsetStyle ? 'inset' : 'solid'
            } ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};`;
          case 'bottom':
            return `border-bottom: ${edgeWidth}px ${
              useInsetStyle ? 'inset' : 'solid'
            } ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};`;
          case 'left':
            return `border-left: ${edgeWidth}px ${
              useInsetStyle ? 'inset' : 'solid'
            } ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};`;
          default:
            return '';
        }
      })
      .join('\n');

    return css`
      ${borderProps}
    `;
  }

  // Apply edge effect to all borders
  switch (edgeStyle) {
    case 'sharp':
      return css`
        border: ${edgeWidth}px solid ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};
      `;
    case 'inset':
      return css`
        border: ${edgeWidth}px inset ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};
      `;
    case 'outset':
      return css`
        border: ${edgeWidth}px outset ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};
      `;
    case 'ridge':
      return css`
        border: ${edgeWidth}px ridge ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};
      `;
    case 'groove':
      return css`
        border: ${edgeWidth}px groove ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};
      `;
    case 'smooth':
    default:
      // For smooth, we use box-shadow for top/left and actual borders for bottom/right
      const shadowWidth = Math.max(1, Math.round(intensity * 3));
      const shadowOpacity = edgeOpacity * 0.8;

      return css`
        box-shadow: inset ${shadowWidth}px ${shadowWidth}px ${shadowWidth}px ${edgeColor}${Math.round(shadowOpacity * 255).toString(16)};
      `;
  }
};

/**
 * Creates a beveled edge effect
 */
export const beveledEdge = (props: EdgeEffectProps, theme?: ThemeContext) => {
  const themeContext = theme || props.themeContext || createThemeContext();
  const edgeIntensity = props.edgeIntensity || props.intensity || 'medium';
  const intensity = getEdgeIntensity(edgeIntensity);

  if (intensity === 0) {
    return css``;
  }

  const edgeColor = props.edgeColor || props.color || themeContext.getColor('common.white');
  const isDark = props.darkMode || themeContext.colorMode === 'dark';

  // Calculate parameters
  const lightEdgeOpacity = isDark ? intensity * 0.3 : intensity * 0.5;
  const darkEdgeOpacity = isDark ? intensity * 0.4 : intensity * 0.2;
  const edgeWidth = Math.max(1, Math.round(intensity * 2));

  // Create light and dark colors for the bevel effect
  const lightColor = edgeColor;
  const darkColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';

  return css`
    border-style: solid;
    border-width: ${edgeWidth}px;
    border-left-color: ${lightColor}${Math.round(lightEdgeOpacity * 255).toString(16)};
    border-top-color: ${lightColor}${Math.round(lightEdgeOpacity * 255).toString(16)};
    border-right-color: ${darkColor};
    border-bottom-color: ${darkColor};
  `;
};

/**
 * Creates a neon edge effect
 */
export const neonEdge = (props: EdgeEffectProps, theme?: ThemeContext) => {
  const themeContext = theme || props.themeContext || createThemeContext();
  const edgeIntensity = props.edgeIntensity || props.intensity || 'medium';
  const intensity = getEdgeIntensity(edgeIntensity);

  if (intensity === 0) {
    return css``;
  }

  const edgeColor = props.edgeColor || props.color || themeContext.getColor('primary.main');
  const isDark = props.darkMode || themeContext.colorMode === 'dark';

  // Calculate parameters
  const glowOpacity = isDark ? intensity * 0.7 : intensity * 0.5;
  const glowSize = Math.max(2, Math.round(intensity * 5));
  const innerGlowSize = Math.max(1, Math.round(intensity * 2));
  const borderWidth = Math.max(1, Math.round(intensity * 2));

  return css`
    border: ${borderWidth}px solid ${edgeColor};
    box-shadow: 0 0 ${glowSize}px ${edgeColor},
      inset 0 0 ${innerGlowSize}px ${edgeColor}${Math.round(glowOpacity * 255).toString(16)};
  `;
};

/**
 * Creates a frosted edge effect
 */
export const frostedEdge = (props: EdgeEffectProps, theme?: ThemeContext) => {
  const themeContext = theme || props.themeContext || createThemeContext();
  const edgeIntensity = props.edgeIntensity || props.intensity || 'medium';
  const intensity = getEdgeIntensity(edgeIntensity);

  if (intensity === 0) {
    return css``;
  }

  const edgeColor = props.edgeColor || props.color || themeContext.getColor('common.white');
  const isDark = props.darkMode || themeContext.colorMode === 'dark';

  // Calculate parameters
  const edgeOpacity = isDark ? intensity * 0.25 : intensity * 0.35;
  const blurRadius = Math.max(2, Math.round(intensity * 8));

  return css`
    border: 1px solid ${edgeColor}${Math.round(edgeOpacity * 200).toString(16)};
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      box-shadow: inset 0 0 ${blurRadius}px ${edgeColor}${Math.round(edgeOpacity * 255).toString(16)};
    }
  `;
};

/**
 * Create an edge highlight effect
 */
export const edgeHighlight = (props: EdgeEffectProps, theme?: ThemeContext) => {
  return glassEdge({ ...props, edgeStyle: 'smooth' }, theme);
};

// Export all edge mixins
export const edge = {
  glass: glassEdge,
  beveled: beveledEdge,
  neon: neonEdge,
  frosted: frostedEdge,
  highlight: edgeHighlight,
  getIntensity: getEdgeIntensity,
};
