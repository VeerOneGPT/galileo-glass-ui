import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';

export interface ToolbarProps {
  /**
   * The content of the toolbar
   */
  children: React.ReactNode;
  
  /**
   * The variant of the toolbar
   */
  variant?: 'standard' | 'dense' | 'regular' | 'glass';
  
  /**
   * The color of the toolbar
   */
  color?: 'primary' | 'secondary' | 'default' | 'transparent';
  
  /**
   * If true, disables the gutters inside the toolbar
   */
  disableGutters?: boolean;
  
  /**
   * The position of the toolbar
   */
  position?: 'static' | 'fixed' | 'absolute' | 'sticky' | 'relative';
  
  /**
   * The CSS class name of the root element
   */
  className?: string;
  
  /**
   * Minimum height of the toolbar
   */
  minHeight?: number | string;
  
  /**
   * The elevation of the toolbar (0-5)
   */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  
  /**
   * If true, the toolbar will have a subtle edge line at the bottom
   */
  divider?: boolean;
  
  /**
   * If true, the toolbar will act as part of an app bar
   */
  appBar?: boolean;
}

// Get color by name
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'transparent':
      return 'transparent';
    default:
      return '#FFFFFF'; // default white
  }
};

// Get elevation shadow
const getElevationShadow = (elevation: number): string => {
  switch (elevation) {
    case 0:
      return 'none';
    case 1:
      return '0 2px 4px rgba(0, 0, 0, 0.08)';
    case 2:
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
    case 3:
      return '0 8px 16px rgba(0, 0, 0, 0.12)';
    case 4:
      return '0 12px 24px rgba(0, 0, 0, 0.14)';
    case 5:
      return '0 16px 32px rgba(0, 0, 0, 0.16)';
    default:
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
  }
};

// Get toolbar height
const getToolbarHeight = (variant: string, minHeight?: number | string): string => {
  if (minHeight !== undefined) {
    return typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
  }
  
  switch (variant) {
    case 'dense':
      return '48px';
    case 'regular':
      return '64px';
    default:
      return '56px';
  }
};

// Styled components
const ToolbarContainer = styled.div<{
  $variant: string;
  $color: string;
  $disableGutters: boolean;
  $position: string;
  $minHeight: string;
  $elevation: number;
  $divider: boolean;
  $appBar: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  box-sizing: border-box;
  min-height: ${props => props.$minHeight};
  padding: ${props => props.$disableGutters ? '0' : '0 16px'};
  position: ${props => props.$position};
  ${props => props.$appBar && `
    top: 0;
    left: 0;
    right: 0;
    z-index: 1100;
  `}
  
  /* Variant styles */
  ${props => {
    if (props.$variant === 'glass') {
      return css`
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: ${props.$elevation > 0 ? getElevationShadow(props.$elevation) : 'none'};
      `;
    }
    
    // standard, dense, regular
    return css`
      background-color: ${getColorByName(props.$color)};
      color: ${props.$color === 'transparent' || props.$color === 'default' ? '#1F2937' : '#FFFFFF'};
      box-shadow: ${props.$elevation > 0 ? getElevationShadow(props.$elevation) : 'none'};
    `;
  }}
  
  /* Divider */
  ${props => props.$divider && css`
    border-bottom: 1px solid ${props.$variant === 'glass'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)'
    };
  `}
  
  /* Glass effect for glass variant */
  ${props => props.$variant === 'glass' && glassSurface({
    elevation: props.$elevation,
    blurStrength: 'standard',
    backgroundOpacity: 'light',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({})
  })}
  
  /* Glass glow for glass variant */
  ${props => props.$variant === 'glass' && props.$color !== 'default' && props.$color !== 'transparent' && glassGlow({
    intensity: 'minimal',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
  
  /* Edge highlight for glass variant */
  ${props => props.$variant === 'glass' && edgeHighlight({
    thickness: 1,
    opacity: 0.3,
    position: props.$divider ? 'top' : 'all',
    themeContext: createThemeContext({})
  })}
`;

/**
 * Toolbar Component
 * 
 * A container for arranging UI elements in a horizontal layout,
 * typically used for app bars, tool bars, and other similar UI patterns.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>((props, ref) => {
  const {
    children,
    variant = 'standard',
    color = 'default',
    disableGutters = false,
    position = 'relative',
    className,
    minHeight,
    elevation = 0,
    divider = false,
    appBar = false,
    ...rest
  } = props;
  
  // Calculate min height
  const calculatedMinHeight = getToolbarHeight(variant, minHeight);
  
  return (
    <ToolbarContainer
      ref={ref}
      className={className}
      $variant={variant === 'standard' || variant === 'dense' || variant === 'regular' ? 'standard' : variant}
      $color={color}
      $disableGutters={disableGutters}
      $position={position}
      $minHeight={calculatedMinHeight}
      $elevation={elevation}
      $divider={divider}
      $appBar={appBar}
      {...rest}
    >
      {children}
    </ToolbarContainer>
  );
});

Toolbar.displayName = 'Toolbar';

/**
 * GlassToolbar Component
 * 
 * A toolbar component with glass morphism styling.
 */
export const GlassToolbar = forwardRef<HTMLDivElement, ToolbarProps>((props, ref) => {
  const {
    className,
    variant = 'glass',
    ...rest
  } = props;
  
  return (
    <Toolbar
      ref={ref}
      className={`glass-toolbar ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassToolbar.displayName = 'GlassToolbar';