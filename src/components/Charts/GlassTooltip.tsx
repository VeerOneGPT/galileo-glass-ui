/**
 * GlassTooltip Component
 *
 * An enhanced tooltip component with glass morphism styling for chart visualizations.
 * Provides a consistent look and feel across all chart types.
 */
import React from 'react';
import styled, { DefaultTheme } from 'styled-components';

import { accessibleAnimation } from '../../animations/animationUtils';
import { fadeIn } from '../../animations/keyframes/basic';
import { innerGlow } from '../../core/mixins/depth/innerEffects';
import { edgeHighlight } from '../../core/mixins/effects/edgeEffects';
import { glassGlow } from '../../core/mixins/effects/glowEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeUtils';

/**
 * GlassTooltip props interface
 */
export interface GlassTooltipProps {
  /**
   * X position of the tooltip
   */
  x: number;

  /**
   * Y position of the tooltip
   */
  y: number;

  /**
   * Content of the tooltip
   */
  children: React.ReactNode;

  /**
   * Position of the tooltip relative to the trigger point
   */
  position?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Accent color for the tooltip
   */
  accentColor?: string;

  /**
   * Glass blur intensity
   */
  blurIntensity?: 'light' | 'medium' | 'strong';

  /**
   * Whether to apply a glow effect
   */
  glow?: boolean;

  /**
   * Glow intensity
   */
  glowIntensity?: 'subtle' | 'medium' | 'strong';

  /**
   * Whether to show pointer
   */
  showPointer?: boolean;

  /**
   * Z-index of the tooltip
   */
  zIndex?: number;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Calculate the position for the tooltip and pointer
 */
const getPositionStyles = (position: 'top' | 'right' | 'bottom' | 'left', x: number, y: number) => {
  switch (position) {
    case 'right':
      return {
        tooltip: {
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(10px, -50%)',
        },
        pointer: {
          left: '0',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(-90deg)',
        },
      };
    case 'bottom':
      return {
        tooltip: {
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, 10px)',
        },
        pointer: {
          left: '50%',
          top: '0',
          transform: 'translate(-50%, -50%) rotate(180deg)',
        },
      };
    case 'left':
      return {
        tooltip: {
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-100%, -50%) translateX(-10px)',
        },
        pointer: {
          right: '0',
          top: '50%',
          transform: 'translate(50%, -50%) rotate(90deg)',
        },
      };
    case 'top':
    default:
      return {
        tooltip: {
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -100%) translateY(-10px)',
        },
        pointer: {
          left: '50%',
          bottom: '0',
          transform: 'translate(-50%, 50%)',
        },
      };
  }
};

/**
 * Get blur value based on intensity setting
 */
const getBlurValue = (intensity?: 'light' | 'medium' | 'strong') => {
  switch (intensity) {
    case 'light':
      return '4px';
    case 'strong':
      return '12px';
    default:
      return '8px'; // medium
  }
};

/**
 * Styled tooltip container with glass effects
 */
const TooltipContainer = styled.div<{
  position: 'top' | 'right' | 'bottom' | 'left';
  x: number;
  y: number;
  accentColor: string;
  blurIntensity: 'light' | 'medium' | 'strong';
  applyGlow: boolean;
  glowIntensity: 'subtle' | 'medium' | 'strong';
  zIndex: number;
  theme: any;
}>`
  position: absolute;
  pointer-events: none;
  padding: 12px 16px;
  border-radius: 8px;
  min-width: 120px;
  max-width: 300px;
  z-index: ${props => props.zIndex};

  ${props => {
    const posStyles = getPositionStyles(props.position, props.x, props.y);
    return `
      left: ${posStyles.tooltip.left};
      top: ${posStyles.tooltip.top};
      transform: ${posStyles.tooltip.transform};
    `;
  }}

  ${props =>
    glassSurface({
      elevation: 3,
      blurStrength: props.blurIntensity,
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.theme || {}),
    })}
  
  ${props =>
    innerGlow({
      color: props.accentColor,
      intensity: 'subtle',
      spread: 5,
      themeContext: createThemeContext(props.theme || {}),
    })}
  
  ${props =>
    edgeHighlight({
      position: 'bottom',
      thickness: 2,
      opacity: 0.8,
      color: props.accentColor,
      themeContext: createThemeContext(props.theme || {}),
    })}
  
  ${props =>
    props.applyGlow &&
    glassGlow({
      intensity: props.glowIntensity,
      color: props.accentColor,
      themeContext: createThemeContext(props.theme || {}),
    })}
  
  ${accessibleAnimation({
    animation: fadeIn,
    duration: 0.2,
    easing: 'ease-out',
  })}
`;

/**
 * Styled pointer element
 */
const TooltipPointer = styled.div<{
  position: 'top' | 'right' | 'bottom' | 'left';
  accentColor: string;
  theme: any;
}>`
  position: absolute;
  width: 12px;
  height: 12px;
  transform-origin: center;

  ${props => {
    const posStyles = getPositionStyles(props.position, 0, 0);
    return `
      left: ${posStyles.pointer.left};
      top: ${posStyles.pointer.top};
      right: ${posStyles.pointer.right || 'auto'};
      bottom: ${posStyles.pointer.bottom || 'auto'};
      transform: ${posStyles.pointer.transform};
    `;
  }}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid
      ${props => (props.theme.isDarkMode ? 'rgba(30, 30, 34, 0.8)' : 'rgba(255, 255, 255, 0.8)')};
    filter: drop-shadow(0 0 2px ${props => props.accentColor}80);
  }
`;

/**
 * Title text within the tooltip
 */
const TooltipTitle = styled.div<{ color?: string }>`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${props => props.color || 'inherit'};
`;

/**
 * Content container within the tooltip
 */
const TooltipContent = styled.div`
  font-size: 12px;
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)')};
`;

// Add ensureValidTheme utility function
const ensureValidTheme = (themeInput: any): DefaultTheme => {
  // If the theme is already a valid DefaultTheme, return it
  if (
    themeInput && 
    typeof themeInput === 'object' && 
    'isDarkMode' in themeInput && 
    'colorMode' in themeInput && 
    'themeVariant' in themeInput && 
    'colors' in themeInput && 
    'zIndex' in themeInput
  ) {
    return themeInput as DefaultTheme;
  }
  
  // Otherwise, create a new theme object
  return {
    isDarkMode: false,
    colorMode: 'light',
    themeVariant: 'nebula',
    colors: {
      nebula: {
        accentPrimary: '#6366F1',
        accentSecondary: '#8B5CF6',
        accentTertiary: '#EC4899',
        stateCritical: '#EF4444',
        stateOptimal: '#10B981',
        stateAttention: '#F59E0B',
        stateInformational: '#3B82F6',
        neutralBackground: '#F9FAFB',
        neutralForeground: '#1F2937',
        neutralBorder: '#E5E7EB',
        neutralSurface: '#FFFFFF'
      },
      glass: {
        light: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          highlight: 'rgba(255, 255, 255, 0.3)',
          shadow: 'rgba(0, 0, 0, 0.1)',
          glow: 'rgba(255, 255, 255, 0.2)'
        },
        dark: {
          background: 'rgba(0, 0, 0, 0.2)',
          border: 'rgba(255, 255, 255, 0.1)',
          highlight: 'rgba(255, 255, 255, 0.1)',
          shadow: 'rgba(0, 0, 0, 0.3)',
          glow: 'rgba(255, 255, 255, 0.1)'
        },
        tints: {
          primary: 'rgba(99, 102, 241, 0.1)',
          secondary: 'rgba(139, 92, 246, 0.1)'
        }
      }
    },
    zIndex: {
      hide: -1,
      auto: 'auto',
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      skipLink: 1600,
      toast: 1700,
      tooltip: 1800,
      glacial: 9999
    }
  };
};

/**
 * GlassTooltip Component
 */
export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  x,
  y,
  children,
  position = 'top',
  accentColor = 'primary',
  blurIntensity = 'medium',
  glow = false,
  glowIntensity = 'subtle',
  showPointer = true,
  zIndex = 1000,
  className,
  style,
}) => {
  // Create a default theme
  const theme = ensureValidTheme(null);
  
  return (
    <TooltipContainer
      position={position}
      x={x}
      y={y}
      accentColor={accentColor}
      blurIntensity={blurIntensity}
      applyGlow={glow}
      glowIntensity={glowIntensity}
      zIndex={zIndex}
      className={className}
      style={style}
      theme={theme}
    >
      {children}
      {showPointer && (
        <TooltipPointer
          position={position}
          accentColor={accentColor}
          theme={theme}
        />
      )}
    </TooltipContainer>
  );
};

/**
 * Helper component for creating formatted tooltip content
 */
export const GlassTooltipContent: React.FC<{
  title?: string;
  titleColor?: string;
  items?: Array<{ label: string; value: string | number; color?: string }>;
  children?: React.ReactNode;
}> = ({ title, titleColor, items = [], children }) => {
  return (
    <>
      {title && <TooltipTitle color={titleColor}>{title}</TooltipTitle>}
      <TooltipContent>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '4px', color: item.color }}>
            <span style={{ marginRight: '8px' }}>{item.label}:</span>
            <strong>{item.value}</strong>
          </div>
        ))}
        {children}
      </TooltipContent>
    </>
  );
};

export default GlassTooltip;
