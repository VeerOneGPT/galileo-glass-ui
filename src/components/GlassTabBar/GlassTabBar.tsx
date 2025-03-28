/**
 * GlassTabBar Component
 * 
 * An advanced tab bar component with physics-based animations, glass styling,
 * and momentum scrolling for overflow tabs.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

import { useSpring } from '../../animations/physics/useSpring';
import { useInertialMovement } from '../../animations/physics/useInertialMovement';
import { useMomentum } from '../../animations/physics/useMomentum';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useThemeColor, ThemeColors } from '../../hooks/useGlassTheme';
import { GalileoPhysics } from '../../animations/physics/unifiedPhysicsAPI';
import { GestureAnimationPreset } from '../../animations/physics/gestures/GestureAnimation';
import { GestureType } from '../../animations/physics/gestures/GestureDetector';
import { useGestureAnimation } from '../../hooks/useGestureAnimation';

/**
 * Badge animation styles
 */
export type BadgeAnimationType = 'pulse' | 'bounce' | 'shake' | 'fade' | 'count' | 'glow' | 'none';

/**
 * Badge animation options
 */
export interface BadgeAnimationOptions {
  /** Animation type to use */
  type: BadgeAnimationType;
  /** Whether the animation should loop continuously */
  loop?: boolean;
  /** Custom animation duration in ms */
  duration?: number;
  /** Delay before animation starts in ms */
  delay?: number;
  /** Number of times to play the animation (if not looping) */
  count?: number;
  /** Custom badge styling */
  style?: {
    /** Background color of the badge */
    backgroundColor?: string;
    /** Text color of the badge */
    color?: string;
    /** Border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: string;
    /** Badge opacity */
    opacity?: number;
    /** Glow color for glow animation */
    glowColor?: string;
    /** Glow intensity for glow animation (0.0-1.0) */
    glowIntensity?: number;
    /** Badge scale */
    scale?: number;
    /** Shadow for badge */
    boxShadow?: string;
  };
}

/**
 * Tab item interface
 */
export interface TabItem {
  /** Tab unique identifier */
  id?: string;
  /** Tab label text */
  label: string;
  /** Tab value */
  value: string | number;
  /** Optional icon for the tab */
  icon?: React.ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Badge count or content */
  badge?: number | string;
  /** Controls how the badge animation behaves */
  badgeAnimation?: BadgeAnimationType | BadgeAnimationOptions;
  /** Whether the badge is hidden initially */
  badgeHidden?: boolean;
  /** Custom styling for this tab */
  style?: React.CSSProperties;
  /** Additional classes for this tab */
  className?: string;
}

/**
 * GlassTabBar Props
 */
/**
 * Interface for custom tab style options
 */
export interface TabStyleOptions {
  /** Font family for tab text */
  fontFamily?: string;
  /** Font size for tab text */
  fontSize?: string;
  /** Font weight for tab text */
  fontWeight?: string | number;
  /** Padding for tabs */
  padding?: string;
  /** Border radius for tabs */
  borderRadius?: string | number;
  /** Custom background color for active tab */
  activeBackgroundColor?: string;
  /** Custom text color for active tab */
  activeTextColor?: string;
  /** Custom background color for inactive tabs */
  inactiveBackgroundColor?: string;
  /** Custom text color for inactive tabs */
  inactiveTextColor?: string;
  /** Custom hover background color */
  hoverBackgroundColor?: string;
  /** Custom hover text color */
  hoverTextColor?: string;
  /** Custom active border color */
  activeBorderColor?: string;
  /** Custom shadow for active tab */
  activeShadow?: string;
  /** Gap between tabs */
  tabGap?: string | number;
  /** Transition duration for hover/active states */
  transitionDuration?: string;
  /** Custom styles for selector indicator */
  selectorStyle?: {
    /** Background color */
    backgroundColor?: string;
    /** Shadow */
    boxShadow?: string;
    /** Border radius */
    borderRadius?: string | number;
    /** Border */
    border?: string;
  };
}

export interface GlassTabBarProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Currently active tab index */
  activeTab: number;
  /** Callback when active tab changes */
  onChange: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>, index: number) => void;
  /** Tab bar layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Tab bar style variant */
  variant?: 'default' | 'pills' | 'buttons' | 'underlined' | 'enclosed';
  /** Glass styling variant */
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  /** Glass blur strength */
  blurStrength?: 'light' | 'standard' | 'strong';
  /** Animation style for the selector */
  animationStyle?: 'spring' | 'magnetic' | 'inertial' | 'none';
  /** Spring physics parameters */
  physics?: {
    /** Spring tension/stiffness */
    tension?: number;
    /** Spring friction/damping */
    friction?: number;
    /** Spring mass */
    mass?: number;
  };
  /** Alignment of tabs */
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  /** Whether tabs should take full width */
  fullWidth?: boolean;
  /** Enable scrolling for many tabs */
  scrollable?: boolean;
  /** Add label under icon for vertical tabs */
  showLabels?: boolean;
  /** Add box shadow to tab bar */
  elevated?: boolean;
  /** Enable background for tab bar */
  background?: boolean;
  /** Custom tab bar width */
  width?: string | number;
  /** Custom tab bar height */
  height?: string | number;
  /** Border radius for tab bar */
  borderRadius?: string | number;
  /** Additional CSS class */
  className?: string;
  /** Additional style */
  style?: React.CSSProperties;
  /** Callback when tab is right-clicked */
  onContextMenu?: (event: React.MouseEvent, index: number) => void;
  /** Optional render prop for custom tab content */
  renderTab?: (tab: TabItem, index: number, isActive: boolean) => React.ReactNode;
  /** Icon position for tabs with both icons and labels (vertical orientation only) */
  iconPosition?: 'top' | 'left';
  /** Display mode for vertical tabs */
  verticalDisplayMode?: 'compact' | 'expanded' | 'icon-only';
  /** Placement of the tab bar in a parent container */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Advanced orientation mode for responsive behavior */
  responsiveOrientation?: {
    /** Base orientation */
    base: 'horizontal' | 'vertical';
    /** Breakpoint to switch orientation at */
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** The orientation to use below the breakpoint */
    belowBreakpoint: 'horizontal' | 'vertical';
  };
  /** Responsive behavior configuration for different screen sizes */
  responsiveConfig?: {
    /** Base display properties for all screen sizes */
    base?: {
      /** Whether to show labels */
      showLabels?: boolean;
      /** Display mode for vertical tabs */
      verticalDisplayMode?: 'compact' | 'expanded' | 'icon-only';
      /** Icon position */
      iconPosition?: 'top' | 'left';
      /** Whether tabs should take full width */
      fullWidth?: boolean;
      /** Maximum number of visible tabs before collapsing */
      maxVisibleTabs?: number;
      /** Width of the tab bar */
      width?: string | number;
      /** Height of the tab bar */
      height?: string | number;
    };
    /** Specific overrides for small screens (< 768px) */
    small?: {
      /** Whether to show labels */
      showLabels?: boolean;
      /** Display mode for vertical tabs */
      verticalDisplayMode?: 'compact' | 'expanded' | 'icon-only';
      /** Icon position */
      iconPosition?: 'top' | 'left';
      /** Whether tabs should take full width */
      fullWidth?: boolean;
      /** Maximum number of visible tabs before collapsing */
      maxVisibleTabs?: number;
      /** Width of the tab bar */
      width?: string | number;
      /** Height of the tab bar */
      height?: string | number;
    };
    /** Specific overrides for medium screens (768px - 1199px) */
    medium?: {
      /** Whether to show labels */
      showLabels?: boolean;
      /** Display mode for vertical tabs */
      verticalDisplayMode?: 'compact' | 'expanded' | 'icon-only';
      /** Icon position */
      iconPosition?: 'top' | 'left';
      /** Whether tabs should take full width */
      fullWidth?: boolean;
      /** Maximum number of visible tabs before collapsing */
      maxVisibleTabs?: number;
      /** Width of the tab bar */
      width?: string | number;
      /** Height of the tab bar */
      height?: string | number;
    };
    /** Specific overrides for large screens (≥ 1200px) */
    large?: {
      /** Whether to show labels */
      showLabels?: boolean;
      /** Display mode for vertical tabs */
      verticalDisplayMode?: 'compact' | 'expanded' | 'icon-only';
      /** Icon position */
      iconPosition?: 'top' | 'left';
      /** Whether tabs should take full width */
      fullWidth?: boolean;
      /** Maximum number of visible tabs before collapsing */
      maxVisibleTabs?: number;
      /** Width of the tab bar */
      width?: string | number;
      /** Height of the tab bar */
      height?: string | number;
    };
  };
  /** Whether to automatically collapse tabs that don't fit */
  collapseTabs?: boolean;
  /** Custom renderer for collapsed tabs menu */
  renderCollapsedMenu?: (
    collapsedTabs: TabItem[],
    activeTab: number,
    onSelect: (index: number) => void
  ) => React.ReactNode;
  /** Enable keyboard navigation with arrow keys */
  keyboardNavigation?: boolean;
  /** Tab index for keyboard accessibility */
  tabIndex?: number;
  /** ARIA label for the tab list */
  ariaLabel?: string;
  /** Custom styles for tabs */
  tabStyle?: TabStyleOptions;
  /** Custom class applied to all tabs */
  tabClassName?: string;
  /** Custom class applied to the active tab */
  activeTabClassName?: string;
  /** Default badge animation for all tabs */
  defaultBadgeAnimation?: BadgeAnimationType | BadgeAnimationOptions;
  /** Custom badge style options */
  badgeStyle?: {
    /** Background color */
    backgroundColor?: string;
    /** Text color */
    color?: string;
    /** Border radius */
    borderRadius?: string;
    /** Size */
    size?: string | number;
    /** Padding */
    padding?: string;
    /** Font size */
    fontSize?: string;
    /** Font weight */
    fontWeight?: string | number;
    /** Box shadow */
    boxShadow?: string;
    /** Margin */
    margin?: string;
  };
}

/**
 * Badge style options
 */
export interface BadgeStyleOptions {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  size?: string | number;
  padding?: string;
  fontSize?: string;
  fontWeight?: string | number;
  boxShadow?: string;
  margin?: string;
}

/**
 * ScrollPosition interface for tracking scroll coordinates
 */
export interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * TabBar container component
 */
const TabBarContainer = styled.div<{
  $orientation: string;
  $variant: string;
  $glassVariant: string;
  $blurStrength: string;
  $elevated: boolean;
  $background: boolean;
  $color: string;
  $width?: string | number;
  $height?: string | number;
  $borderRadius?: string | number;
  $iconPosition?: string;
  $verticalDisplayMode?: string;
  $placement?: string;
  $isResponsive?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'column' : 'row'};
  position: relative;
  
  /* Size handling - Auto size for vertical mode if not specified */
  ${props => {
    if (props.$orientation === 'vertical') {
      return `
        ${props.$width 
          ? `width: ${typeof props.$width === 'number' ? `${props.$width}px` : props.$width};` 
          : `width: ${props.$verticalDisplayMode === 'compact' ? '60px' : props.$verticalDisplayMode === 'icon-only' ? '60px' : '180px'};`
        }
        ${props.$height ? `height: ${typeof props.$height === 'number' ? `${props.$height}px` : props.$height};` : ''}
      `;
    } else {
      return `
        ${props.$width ? `width: ${typeof props.$width === 'number' ? `${props.$width}px` : props.$width};` : ''}
        ${props.$height ? `height: ${typeof props.$height === 'number' ? `${props.$height}px` : props.$height};` : ''}
      `;
    }
  }}
  
  /* Handle container placement */
  ${props => {
    if (props.$placement) {
      switch (props.$placement) {
        case 'left':
          return `
            border-right: ${props.$background ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          `;
        case 'right':
          return `
            border-left: ${props.$background ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          `;
        case 'bottom':
          return `
            border-top: ${props.$background ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
            border-top-left-radius: 0;
            border-top-right-radius: 0;
          `;
        case 'top':
        default:
          return `
            border-bottom: ${props.$background ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          `;
      }
    }
    return '';
  }}
  
  /* Orientation specific styles */
  ${props => props.$orientation === 'vertical' && `
    ${props.$verticalDisplayMode === 'icon-only' ? `
      & > button {
        padding: 12px;
        height: 56px;
      }
    ` : ''}
    
    ${props.$verticalDisplayMode === 'compact' ? `
      & > button {
        padding: 12px 8px;
        height: 48px;
      }
    ` : ''}
  `}
  border-radius: ${props => props.$borderRadius ? 
    typeof props.$borderRadius === 'number' ? 
      `${props.$borderRadius}px` : 
      props.$borderRadius
    : 
    props.$variant === 'pills' ? 
      '50px' : 
      '8px'
  };
  
  ${props => {
    // Apply styles based on variant
    switch (props.$variant) {
      case 'pills':
        return `
          padding: 4px;
          gap: 4px;
        `;
      case 'buttons':
        return `
          padding: 4px;
          gap: 4px;
        `;
      case 'underlined':
        return `
          border-bottom: ${props.$orientation === 'horizontal' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
          border-right: ${props.$orientation === 'vertical' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
        `;
      case 'enclosed':
        return `
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px;
        `;
      default:
        return `
          gap: 2px;
          padding: 2px;
        `;
    }
  }}
  
  /* Apply glass styling if background is enabled */
  ${props => props.$background && `
    ${
      (() => {
        const themeContext = createThemeContext({});
        
        // Apply appropriate glass styling
        switch (props.$glassVariant) {
          case 'clear':
            return glassSurface({
              elevation: props.$elevated ? 3 : 1,
              blurStrength: props.$blurStrength as any,
              backgroundOpacity: 'light',
              borderOpacity: 'subtle',
              themeContext,
            });
          case 'tinted':
            return `
              ${glassSurface({
                elevation: props.$elevated ? 3 : 1,
                blurStrength: props.$blurStrength as any,
                backgroundOpacity: 'medium',
                borderOpacity: 'subtle',
                themeContext,
              })}
              
              background-color: ${props.$color !== 'default' ? 
                `var(--color-${props.$color}-transparent)` : 
                'rgba(30, 41, 59, 0.5)'};
            `;
          default: // frosted
            return glassSurface({
              elevation: props.$elevated ? 3 : 1,
              blurStrength: props.$blurStrength as any,
              backgroundOpacity: 'medium',
              borderOpacity: 'subtle',
              themeContext,
            });
        }
      })()
    }
  `}
  
  ${props => props.$elevated && !props.$background && `
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `}
  
  /* Scrollable styles */
  ${props => props.$orientation === 'horizontal' && `
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch; /* Enable smooth scrolling on iOS */
    scroll-behavior: smooth; /* Enable smooth scrolling when not using physics */
    overscroll-behavior-x: contain; /* Prevent scroll chain from propagating */
    will-change: scroll-position, transform; /* Optimize for smooth scrolling */
    
    /* Hide scrollbar */
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    /* Optimize for scrolling performance */
    & > * {
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
  `}
  
  ${props => props.$orientation === 'vertical' && `
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch; /* Enable smooth scrolling on iOS */
    scroll-behavior: smooth; /* Enable smooth scrolling when not using physics */
    overscroll-behavior-y: contain; /* Prevent scroll chain from propagating */
    will-change: scroll-position, transform; /* Optimize for smooth scrolling */
    
    /* Hide scrollbar */
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    /* Optimize for scrolling performance */
    & > * {
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
  `}
`;

/**
 * Tab item component
 */
const TabItem = styled.button<{
  $active: boolean;
  $orientation: string;
  $variant: string;
  $color: string;
  $fullWidth: boolean;
  $alignment: string;
  $glassVariant: string;
  $magneticProgress?: number;
  $animationStyle?: string;
  $iconPosition?: string;
  $tabStyle?: TabStyleOptions;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => {
    // Use custom padding if provided
    if (props.$tabStyle?.padding) {
      return props.$tabStyle.padding;
    }
    
    // Default padding based on orientation and variant
    if (props.$orientation === 'vertical') {
      return props.$variant === 'pills' ? '14px 16px' : '12px 16px';
    }
    return props.$variant === 'pills' ? '10px 20px' : '10px 16px';
  }};
  
  /* Typography styles - use custom or default */
  font-family: ${props => props.$tabStyle?.fontFamily || 
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
  font-size: ${props => props.$tabStyle?.fontSize || '0.875rem'};
  font-weight: ${props => props.$tabStyle?.fontWeight || 500};
  
  /* Base styles */
  background: ${props => props.$active ? 
    (props.$tabStyle?.activeBackgroundColor || 'transparent') :
    (props.$tabStyle?.inactiveBackgroundColor || 'transparent')};
  border: none;
  cursor: pointer;
  transition: ${props => props.$tabStyle?.transitionDuration || 
    'color 0.2s ease, transform 0.15s ease-out, opacity 0.2s ease, background-color 0.2s ease'};
  
  /* Handle text wrapping based on orientation */
  white-space: ${props => props.$orientation === 'vertical' ? 'normal' : 'nowrap'};
  
  /* Vertical tab styles with different icon positions */
  ${props => props.$orientation === 'vertical' && `
    flex-direction: ${props.$iconPosition === 'top' ? 'column' : 'row'};
    text-align: ${props.$iconPosition === 'top' ? 'center' : 'left'};
    padding: ${props.$iconPosition === 'top' ? '12px 8px' : '10px 16px'};
    min-height: ${props.$iconPosition === 'top' ? '64px' : '48px'};
  `}
  
  /* Text color - use custom or default */
  color: ${props => props.$active ? 
    (props.$tabStyle?.activeTextColor || '#fff') : 
    (props.$tabStyle?.inactiveTextColor || 'rgba(255, 255, 255, 0.7)')};
  opacity: ${props => props.$active ? 1 : 0.9};
  will-change: transform, opacity, color;
  
  /* Border radius - use custom or variant-based default */
  border-radius: ${props => {
    if (props.$tabStyle?.borderRadius) {
      return typeof props.$tabStyle.borderRadius === 'number' ? 
        `${props.$tabStyle.borderRadius}px` : props.$tabStyle.borderRadius;
    }
    
    // Default based on variant
    if (props.$variant === 'pills') return '50px';
    if (props.$variant === 'buttons') return '6px';
    if (props.$variant === 'enclosed') return '4px';
    return '0px';
  }};

  /* Tab spacing */
  margin: ${props => {
    if (props.$tabStyle?.tabGap) {
      const gap = typeof props.$tabStyle.tabGap === 'number' ? 
        `${props.$tabStyle.tabGap}px` : props.$tabStyle.tabGap;
      
      return props.$orientation === 'horizontal' ? 
        `0 ${gap} 0 0` : `0 0 ${gap} 0`;
    }
    return '';
  }};
  
  /* Custom shadow for active tab */
  ${props => props.$active && props.$tabStyle?.activeShadow && `
    box-shadow: ${props.$tabStyle.activeShadow};
  `}
  
  /* Magnetic selection effect for non-active tabs */
  ${props => props.$magneticProgress !== undefined && 
    props.$magneticProgress > 0 && 
    !props.$active && 
    props.$animationStyle === 'magnetic' && `
    transform: scale(${1 + props.$magneticProgress * 0.05});
    color: ${props.$tabStyle?.hoverTextColor || 'rgba(255, 255, 255, 1)'};
    opacity: ${0.9 + props.$magneticProgress * 0.1};
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background: ${props.$tabStyle?.hoverBackgroundColor || 
        (props.$color === 'default' ? 
          'rgba(255, 255, 255, 0.2)' : 
          `var(--color-${props.$color}-transparent)`)};
      opacity: ${Math.min(0.3, props.$magneticProgress * 0.3)};
      z-index: -1;
      pointer-events: none;
    }
  `}
  
  /* Full width handling */
  ${props => props.$fullWidth && `
    flex: 1;
    ${props.$orientation === 'horizontal' ? 'width: 100%;' : 'height: 100%;'}
  `}
  
  /* Styles based on alignment */
  ${props => {
    if (!props.$fullWidth) {
      switch (props.$alignment) {
        case 'start':
          return 'justify-content: flex-start;';
        case 'end':
          return 'justify-content: flex-end;';
        case 'stretch':
          return props.$orientation === 'horizontal' ? 'width: 100%;' : 'height: 100%;';
        default: // center
          return 'justify-content: center;';
      }
    }
    return '';
  }}
  
  /* Focus styling */
  &:focus {
    outline: none;
    color: ${props => props.$tabStyle?.activeTextColor || '#fff'};
    opacity: 1;
  }
  
  /* Focus-visible for keyboard users */
  &:focus-visible {
    outline: 2px solid ${props => props.$tabStyle?.activeBorderColor || 
      (props.$color === 'default' ? 
        'rgba(255, 255, 255, 0.6)' : 
        `var(--color-${props.$color}-light)`)};
    outline-offset: 2px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
  }
  
  /* Hover styling */
  &:hover {
    color: ${props => props.$tabStyle?.hoverTextColor || '#fff'};
    opacity: 1;
    background-color: ${props => props.$tabStyle?.hoverBackgroundColor || 
      (props.$active ? 'transparent' : 'rgba(255, 255, 255, 0.05)')};
  }
  
  /* Disabled styling */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  /* Variant-specific styling - only apply if custom styles aren't overriding */
  ${props => {
    // If using mostly custom styling, skip default variant styling
    if (props.$tabStyle && 
        (props.$tabStyle.activeBackgroundColor || 
         props.$tabStyle.activeBorderColor || 
         props.$tabStyle.activeTextColor)) {
      // For underlined variant, we still need border handling
      if (props.$variant === 'underlined') {
        const borderColor = props.$tabStyle.activeBorderColor || 
          (props.$color === 'default' ? '#fff' : `var(--color-${props.$color})`);
        
        return props.$orientation === 'horizontal' ? 
          props.$active ? `border-bottom: 2px solid ${borderColor}; margin-bottom: -1px;` : 
          'border-bottom: 2px solid transparent;' :
          props.$active ? `border-right: 2px solid ${borderColor}; margin-right: -1px;` : 
          'border-right: 2px solid transparent;';
      }
      return '';
    }
    
    // Default variant styling
    switch (props.$variant) {
      case 'pills':
        return props.$active ? `
          background-color: ${props.$color === 'default' ? 
            'rgba(255, 255, 255, 0.2)' : 
            `var(--color-${props.$color})`};
          color: #fff;
          
          ${props.$glassVariant !== 'clear' && !props.$tabStyle?.activeShadow && `
            box-shadow: 0 2px 8px ${props.$color === 'default' ? 
              'rgba(0, 0, 0, 0.2)' : 
              `var(--color-${props.$color}-shadow)`};
          `}
        ` : `
          &:hover {
            background-color: ${props.$tabStyle?.hoverBackgroundColor || 'rgba(255, 255, 255, 0.1)'};
          }
        `;
      
      case 'buttons':
        return props.$active ? `
          background-color: ${props.$color === 'default' ? 
            'rgba(255, 255, 255, 0.15)' : 
            `var(--color-${props.$color}-transparent)`};
          color: #fff;
        ` : `
          &:hover {
            background-color: ${props.$tabStyle?.hoverBackgroundColor || 'rgba(255, 255, 255, 0.05)'};
          }
        `;
      
      case 'underlined':
        const borderColor = props.$tabStyle?.activeBorderColor || 
          (props.$color === 'default' ? '#fff' : `var(--color-${props.$color})`);
        
        return props.$orientation === 'horizontal' ? 
          props.$active ? `
            border-bottom: 2px solid ${borderColor};
            margin-bottom: -1px;
          ` : `
            border-bottom: 2px solid transparent;
          ` :
          // Vertical orientation
          props.$active ? `
            border-right: 2px solid ${borderColor};
            margin-right: -1px;
          ` : `
            border-right: 2px solid transparent;
          `;
      
      case 'enclosed':
        return props.$active ? `
          background-color: rgba(255, 255, 255, 0.1);
          color: #fff;
        ` : `
          &:hover {
            background-color: ${props.$tabStyle?.hoverBackgroundColor || 'rgba(255, 255, 255, 0.05)'};
          }
        `;
      
      default:
        return props.$active ? `
          color: #fff;
        ` : `
          &:hover {
            background-color: ${props.$tabStyle?.hoverBackgroundColor || 'rgba(255, 255, 255, 0.05)'};
          }
        `;
    }
  }}
`;

/**
 * Base tab badge component
 */
const TabBadgeBase = styled.span<{ 
  $color: string;
  $backgroundColor?: string;
  $textColor?: string;
  $borderColor?: string;
  $borderWidth?: string;
  $opacity?: number;
  $scale?: number;
  $boxShadow?: string;
  $animationType?: BadgeAnimationType;
  $hidden?: boolean;
  $borderRadius?: string;
  $size?: string | number;
  $padding?: string;
  $fontSize?: string;
  $fontWeight?: string | number;
  $margin?: string;
}>`
  display: ${props => props.$hidden ? 'none' : 'inline-flex'};
  align-items: center;
  justify-content: center;
  min-width: ${props => props.$size ? 
    (typeof props.$size === 'number' ? `${props.$size}px` : props.$size) : 
    '20px'};
  height: ${props => props.$size ? 
    (typeof props.$size === 'number' ? `${props.$size}px` : props.$size) : 
    '20px'};
  padding: ${props => props.$padding || '0 6px'};
  border-radius: ${props => props.$borderRadius || '10px'};
  background-color: ${props => props.$backgroundColor || 
    (props.$color === 'default' ? 
      'rgba(255, 255, 255, 0.2)' : 
      `var(--color-${props.$color})`)};
  color: ${props => props.$textColor || '#fff'};
  font-size: ${props => props.$fontSize || '0.75rem'};
  font-weight: ${props => props.$fontWeight || 'normal'};
  margin: ${props => props.$margin || '0 0 0 8px'};
  transform: scale(${props => props.$scale || 1});
  position: relative;
  z-index: 1;
  
  ${props => props.$borderColor && props.$borderWidth && `
    border: ${props.$borderWidth} solid ${props.$borderColor};
  `}
  
  ${props => props.$opacity !== undefined && `
    opacity: ${props.$opacity};
  `}
  
  ${props => props.$boxShadow && `
    box-shadow: ${props.$boxShadow};
  `}
  
  will-change: transform, opacity, background-color, box-shadow;
`;

/**
 * Create animation keyframes for different animation types
 */
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
`;

const fadeAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.4); }
  50% { box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8); }
`;

/**
 * Animated badge component with different animation types
 */
const AnimatedBadge = styled(TabBadgeBase)<{
  $animationType: BadgeAnimationType;
  $duration: number;
  $delay: number;
  $loop: boolean;
  $count?: number;
  $glowColor?: string;
  $glowIntensity?: number;
}>`
  animation-delay: ${props => `${props.$delay}ms`};
  animation-duration: ${props => `${props.$duration}ms`};
  animation-timing-function: ease-in-out;
  animation-fill-mode: both;
  animation-iteration-count: ${props => props.$loop ? 'infinite' : props.$count || 1};
  
  ${props => {
    switch (props.$animationType) {
      case 'pulse':
        return `animation-name: ${pulseAnimation};`;
      case 'bounce':
        return `animation-name: ${bounceAnimation};`;
      case 'shake':
        return `animation-name: ${shakeAnimation};`;
      case 'fade':
        return `animation-name: ${fadeAnimation};`;
      case 'glow':
        return `
          animation-name: ${glowAnimation};
          box-shadow: 0 0 4px 1px ${props.$glowColor || 'rgba(255, 255, 255, 0.4)'};
        `;
      default:
        return '';
    }
  }}
`;

/**
 * Badge with counting animation
 */
const CountingBadge = ({ 
  value, 
  color, 
  duration = 1000, 
  delay = 0,
  ...badgeProps 
}: { 
  value: number; 
  color: string; 
  duration?: number; 
  delay?: number; 
  [key: string]: any; 
}) => {
  const [count, setCount] = useState(0);
  const valueNumber = typeof value === 'number' ? value : (typeof value === 'string' ? parseInt(value) : 0) || 0;
  
  useEffect(() => {
    // Only animate if we already have a count and it's different
    if (count > 0 && valueNumber !== count) {
      // Handle count animation
      const startTime = Date.now() + delay;
      const startValue = count;
      const endValue = valueNumber;
      const difference = endValue - startValue;
      const frameRate = 1000 / 60; // 60fps
      
      let animationFrame: number;
      
      const animateCount = () => {
        const currentTime = Date.now();
        
        // Wait for delay
        if (currentTime < startTime) {
          animationFrame = requestAnimationFrame(animateCount);
          return;
        }
        
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
          // Linear progression
          const progress = elapsed / duration;
          const currentValue = Math.round(startValue + difference * progress);
          setCount(currentValue);
          animationFrame = requestAnimationFrame(animateCount);
        } else {
          // Animation complete
          setCount(endValue);
        }
      };
      
      animationFrame = requestAnimationFrame(animateCount);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    } else {
      // Initial value
      setCount(valueNumber);
    }
  }, [valueNumber, delay, duration, count]);
  
  return (
    <TabBadgeBase $color={color} {...badgeProps}>
      {count}
    </TabBadgeBase>
  );
};

/**
 * Main TabBadge component with animation support
 */
const TabBadge = ({ 
  value, 
  color, 
  animation,
  hidden,
  ...rest 
}: { 
  value: number | string; 
  color: string;
  animation?: BadgeAnimationType | BadgeAnimationOptions;
  hidden?: boolean;
  [key: string]: any;
}) => {
  // Default values
  const animationType = typeof animation === 'string' ? animation : animation?.type || 'none';
  const duration = typeof animation === 'object' ? animation.duration || 1000 : 1000;
  const delay = typeof animation === 'object' ? animation.delay || 0 : 0;
  const loop = typeof animation === 'object' ? animation.loop || false : false;
  const count = typeof animation === 'object' ? animation.count : undefined;
  
  // Custom style props
  const customStyle = typeof animation === 'object' ? animation.style || {} : {};
  const {
    backgroundColor,
    color: textColor,
    borderColor,
    borderWidth,
    opacity,
    glowColor,
    glowIntensity,
    scale,
    boxShadow
  } = customStyle;
  
  // Generate common props
  const commonProps = {
    $color: color,
    $backgroundColor: backgroundColor,
    $textColor: textColor,
    $borderColor: borderColor,
    $borderWidth: borderWidth,
    $opacity: opacity,
    $scale: scale,
    $boxShadow: boxShadow,
    $hidden: hidden,
    ...rest
  };
  
  // Render based on animation type
  if (animationType === 'count' && typeof value === 'number') {
    return (
      <CountingBadge 
        value={value} 
        color={color} 
        duration={duration} 
        delay={delay}
        {...commonProps} 
      />
    );
  } else if (animationType !== 'none') {
    return (
      <AnimatedBadge
        $animationType={animationType}
        $duration={duration}
        $delay={delay}
        $loop={loop}
        $count={count}
        $glowColor={glowColor}
        $glowIntensity={glowIntensity}
        {...commonProps}
      >
        {value}
      </AnimatedBadge>
    );
  } else {
    // No animation
    return (
      <TabBadgeBase {...commonProps}>
        {value}
      </TabBadgeBase>
    );
  }
};

/**
 * Tab icon wrapper
 */
const TabIcon = styled.span<{ 
  $showLabel: boolean;
  $orientation?: string;
  $iconPosition?: string;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    if (!props.$showLabel) {
      return 'margin: 0;';
    }
    
    if (props.$orientation === 'vertical') {
      if (props.$iconPosition === 'top') {
        return `
          margin: 0 0 8px 0;
          font-size: 1.5rem;
        `;
      } else {
        return `
          margin-right: 12px;
          font-size: 1.25rem;
        `;
      }
    } else {
      return `
        margin-right: 8px;
        font-size: 1.25rem;
      `;
    }
  }}
`;

/**
 * Tab selector indicator with enhanced physics and magnetic behavior
 */
const TabSelector = styled.div<{
  $variant: string;
  $orientation: string;
  $color: string;
  $glowEffect: boolean;
  $animationStyle: string;
  $selectionProgress?: number;
  $tabStyle?: TabStyleOptions;
}>`
  position: absolute;
  pointer-events: none;
  z-index: 1;
  transition: ${props => props.$animationStyle === 'none' ? 'none' : 'filter 0.3s ease, opacity 0.3s ease'};
  will-change: transform, width, height, opacity, box-shadow;
  
  /* Selection progress effect for magnetic selection */
  ${props => props.$selectionProgress !== undefined && props.$selectionProgress > 0 && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background: ${props.$tabStyle?.selectorStyle?.backgroundColor || 
        (props.$color === 'default' ? 
          'rgba(255, 255, 255, 0.8)' : 
          `var(--color-${props.$color})`)};
      opacity: ${Math.min(0.4, props.$selectionProgress * 0.4)};
      filter: blur(${Math.min(8, props.$selectionProgress * 8)}px);
      z-index: -1;
      transform: scale(${1 + props.$selectionProgress * 0.1});
      transition: transform 0.1s ease-out, opacity 0.1s ease-out, filter 0.1s ease-out;
    }
  `}
  
  /* Custom border if specified */
  ${props => props.$tabStyle?.selectorStyle?.border && `
    border: ${props.$tabStyle.selectorStyle.border};
  `}
  
  /* Custom border radius if specified, otherwise use variant-based */
  border-radius: ${props => {
    if (props.$tabStyle?.selectorStyle?.borderRadius) {
      return typeof props.$tabStyle.selectorStyle.borderRadius === 'number' ? 
        `${props.$tabStyle.selectorStyle.borderRadius}px` : 
        props.$tabStyle.selectorStyle.borderRadius;
    }
    
    // Default based on variant
    if (props.$variant === 'pills') return '50px';
    if (props.$variant === 'buttons') return '6px';
    if (props.$variant === 'enclosed') return '4px';
    return '0px';
  }};
  
  /* Custom box shadow if specified */
  ${props => props.$tabStyle?.selectorStyle?.boxShadow && `
    box-shadow: ${props.$tabStyle.selectorStyle.boxShadow};
  `}
  
  /* Variants - only apply if no custom selector background is specified */
  ${props => {
    // If a custom background color is specified, use that instead of variant styling
    if (props.$tabStyle?.selectorStyle?.backgroundColor) {
      return `
        background-color: ${props.$tabStyle.selectorStyle.backgroundColor};
        ${
          !props.$tabStyle?.selectorStyle?.boxShadow && 
          props.$variant === 'pills' && 
          props.$glowEffect && 
          props.$color !== 'default' && 
          `box-shadow: 0 0 15px ${`var(--color-${props.$color}-shadow)`};`
        }
      `;
    }
    
    const themeContext = createThemeContext({});
    
    switch (props.$variant) {
      case 'pills':
        return `
          border-radius: 50px;
          background-color: ${props.$color === 'default' ? 
            'rgba(255, 255, 255, 0.2)' : 
            `var(--color-${props.$color})`};
          ${props.$glowEffect && props.$color !== 'default' && glow.glass({
            glowIntensity: 'subtle',
            glowColor: props.$color,
            themeContext: createThemeContext(props.theme)
          })}
        `;
      
      case 'buttons':
        return `
          border-radius: 6px;
          background-color: ${props.$color === 'default' ? 
            'rgba(255, 255, 255, 0.15)' : 
            `var(--color-${props.$color}-transparent)`};
        `;
      
      case 'underlined':
        return props.$orientation === 'horizontal' ? `
          height: 2px;
          bottom: 0;
          background-color: ${props.$tabStyle?.activeBorderColor || 
            (props.$color === 'default' ? 
              '#fff' : 
              `var(--color-${props.$color})`)};
        ` : `
          width: 2px;
          right: 0;
          background-color: ${props.$tabStyle?.activeBorderColor || 
            (props.$color === 'default' ? 
              '#fff' : 
              `var(--color-${props.$color})`)};
        `;
      
      case 'enclosed':
        return `
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.1);
        `;
      
      default:
        return `
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.1);
        `;
    }
  }}
  
  /* Glow effect for pills - only if no custom shadow */
  ${props => 
    !props.$tabStyle?.selectorStyle?.boxShadow && 
    props.$variant === 'pills' && 
    props.$glowEffect && 
    props.$color !== 'default' && 
    `box-shadow: 0 0 15px ${`var(--color-${props.$color}-shadow)`};`
  }
  
  /* Animation style-specific effects */
  ${props => {
    switch (props.$animationStyle) {
      case 'magnetic':
        return `
          transition: none;
          &:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: inherit;
            opacity: 0.5;
            background: inherit;
            filter: blur(6px);
            z-index: -1;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          
          /* Liquid-like effect for magnetic animation */
          transform-origin: center center;
          backface-visibility: hidden;
          
          ${props.$variant === 'pills' ? `
            &:before {
              content: '';
              position: absolute;
              top: -2px;
              left: -2px;
              right: -2px;
              bottom: -2px;
              border-radius: inherit;
              background: radial-gradient(
                circle at center,
                ${props.$tabStyle?.selectorStyle?.backgroundColor || 
                  (props.$color === 'default' ? 
                    'rgba(255, 255, 255, 0.2)' : 
                    `var(--color-${props.$color})`)} 0%,
                transparent 70%
              );
              opacity: 0.3;
              z-index: -2;
              filter: blur(2px);
              transition: opacity 0.3s ease;
            }
          ` : ''}
        `;
        
      case 'inertial':
        return `
          transition: none;
          transform-origin: center center;
          
          /* Trail effect for inertial animation */
          ${props.$variant === 'pills' ? `
            &:after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border-radius: inherit;
              background: inherit;
              opacity: 0.3;
              z-index: -1;
              filter: blur(8px);
              transform: scale(1.05);
              transition: opacity 0.1s ease, transform 0.1s ease;
            }
          ` : ''}
        `;
        
      case 'spring':
        return `
          transition: none;
          transform-origin: center center;
          
          /* Bounce effect for spring animation */
          ${props.$variant === 'pills' ? `
            &:after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border-radius: inherit;
              background: inherit;
              opacity: 0.2;
              z-index: -1;
              filter: blur(4px);
              transition: transform 0.2s ease;
            }
          ` : ''}
        `;
        
      default:
        return '';
    }
  }}
`;

/**
 * Scroll button component
 */
const ScrollButton = styled.button<{ $direction: 'left' | 'right' | 'up' | 'down' }>`
  position: absolute;
  ${props => {
    if (props.$direction === 'left') return 'left: 0;';
    if (props.$direction === 'right') return 'right: 0;';
    if (props.$direction === 'up') return 'top: 0;';
    return 'bottom: 0;';
  }}
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.$direction === 'left' || props.$direction === 'right' ? '24px' : '100%'};
  height: ${props => props.$direction === 'up' || props.$direction === 'down' ? '24px' : '100%'};
  background: linear-gradient(to ${props => props.$direction}, 
    rgba(0, 0, 0, 0.3), 
    transparent
  );
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  
  &:hover {
    color: #fff;
  }
  
  &:focus {
    outline: none;
    color: #fff;
  }
`;

/**
 * Collapsed menu button style
 */
const MoreButton = styled(TabItem)`
  position: relative;
`;

/**
 * Fade-in animation for menu
 */
const fadeInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

/**
 * Collapsed menu container
 */
const CollapsedMenu = styled.div<{
  $open: boolean;
  $orientation: string;
  $variant: string;
  $color: string;
  $glassVariant: string;
}>`
  position: absolute;
  z-index: 10;
  overflow: hidden;
  display: ${props => props.$open ? 'block' : 'none'};
  min-width: 180px;
  margin-top: ${props => props.$orientation === 'horizontal' ? '8px' : '0'};
  margin-left: ${props => props.$orientation === 'vertical' ? '8px' : '0'};
  
  /* Position menu depending on orientation */
  ${props => {
    if (props.$orientation === 'horizontal') {
      return `
        bottom: auto;
        right: 0;
        top: 100%;
        left: auto;
      `;
    } else {
      return `
        bottom: auto;
        right: auto;
        top: 0;
        left: 100%;
      `;
    }
  }}
  
  /* Glass styling */
  background-color: rgba(18, 26, 36, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  /* Animation */
  animation: ${fadeInAnimation} 0.2s ease-out forwards;
  transform-origin: top right;
`;

/**
 * Menu item in collapsed menu
 */
const CollapsedMenuItem = styled.button<{
  $active: boolean;
  $color: string;
}>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.875rem;
  
  &:hover {
    background-color: ${props => props.$color === 'default' ? 
      'rgba(255, 255, 255, 0.1)' : 
      `var(--color-${props.$color}-transparent)`};
  }
  
  &:focus {
    outline: none;
    background-color: ${props => props.$color === 'default' ? 
      'rgba(255, 255, 255, 0.1)' : 
      `var(--color-${props.$color}-transparent)`};
  }
  
  /* Active state */
  ${props => props.$active && `
    background-color: ${props.$color === 'default' ? 
      'rgba(255, 255, 255, 0.15)' : 
      `var(--color-${props.$color}-transparent)`};
    font-weight: 500;
  `}
`;

/**
 * Default collapsed menu implementation
 */
const DefaultCollapsedMenu = ({ 
  tabs, 
  activeTab, 
  onSelect, 
  open, 
  onClose,
  color,
  orientation,
  variant,
  glassVariant
}: { 
  tabs: TabItem[]; 
  activeTab: number; 
  onSelect: (index: number) => void;
  open: boolean;
  onClose: () => void;
  color: string;
  orientation: string;
  variant: string;
  glassVariant: string;
}) => {
  // Reference to the menu element for click outside detection
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);
  
  // Find the actual active tab index from the collapsed tabs
  const findCollapsedTabIndex = (tabs: TabItem[], globalActiveTab: number) => {
    // We need to find the actual index of the active tab within the collapsed menu
    if (globalActiveTab >= tabs.length) return -1;
    return tabs.findIndex(tab => tab.value === tabs[globalActiveTab]?.value);
  };
  
  // Determine if any of the collapsed tabs is the active tab
  const collapsedActiveTabIndex = findCollapsedTabIndex(tabs, activeTab);
  
  return (
    <CollapsedMenu 
      ref={menuRef}
      $open={open} 
      $orientation={orientation}
      $variant={variant}
      $color={color}
      $glassVariant={glassVariant}
    >
      {tabs.map((tab, index) => (
        <CollapsedMenuItem
          key={tab.id || `collapsed-${index}`}
          $active={index === collapsedActiveTabIndex}
          $color={color}
          onClick={() => {
            onSelect(index);
            onClose();
          }}
          aria-selected={index === collapsedActiveTabIndex}
          role="tab"
        >
          {tab.icon && <span style={{ marginRight: '12px', display: 'inline-flex' }}>{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '0.75rem', 
              backgroundColor: `var(--color-${color})`,
              borderRadius: '10px',
              padding: '2px 6px',
              marginRight: '-6px'
            }}>
              {tab.badge}
            </span>
          )}
        </CollapsedMenuItem>
      ))}
    </CollapsedMenu>
  );
};

/**
 * GlassTabBar Component
 */
export const GlassTabBar: React.FC<GlassTabBarProps> = ({
  tabs,
  activeTab,
  onChange,
  orientation = 'horizontal',
  variant = 'default',
  glassVariant = 'frosted',
  blurStrength = 'standard',
  animationStyle = 'spring',
  physics = {
    tension: 280,
    friction: 26,
    mass: 1
  },
  alignment = 'center',
  color = 'primary',
  fullWidth = false,
  scrollable = true,
  showLabels = true,
  elevated = false,
  background = true,
  width,
  height,
  borderRadius,
  className,
  style,
  onContextMenu,
  renderTab,
  iconPosition = 'left',
  verticalDisplayMode = 'expanded',
  placement = 'top',
  responsiveOrientation,
  responsiveConfig,
  collapseTabs = false,
  renderCollapsedMenu,
  keyboardNavigation = true,
  tabIndex = 0,
  ariaLabel = 'Tab Navigation',
  tabStyle,
  tabClassName,
  activeTabClassName,
  defaultBadgeAnimation,
  badgeStyle,
}) => {
  // Handle responsive orientation based on breakpoints
  const [actualOrientation, setActualOrientation] = useState(orientation);
  
  // Map from breakpoint names to actual pixel values
  const breakpointMap = {
    xs: 480,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1600
  };
  
  // Handle responsive orientation changes
  useEffect(() => {
    if (!responsiveOrientation) {
      setActualOrientation(orientation);
      return;
    }
    
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const breakpointWidth = breakpointMap[responsiveOrientation.breakpoint];
      
      if (windowWidth < breakpointWidth) {
        setActualOrientation(responsiveOrientation.belowBreakpoint);
      } else {
        setActualOrientation(responsiveOrientation.base);
      }
    };
    
    // Initial check
    handleResize();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [orientation, responsiveOrientation]);
  
  // Determine the actual orientation for the rest of the component
  const effectiveOrientation = actualOrientation;
  // Hooks
  const { isReducedMotion } = useAccessibilitySettings();
  const colorValue = useThemeColor(color === 'default' ? 'primary' : color as keyof ThemeColors);
  
  // Refs
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // State
  const [selectorStyle, setSelectorStyle] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // State for responsive configuration
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [effectiveShowLabels, setEffectiveShowLabels] = useState(showLabels);
  const [effectiveIconPosition, setEffectiveIconPosition] = useState(iconPosition);
  const [effectiveVerticalDisplayMode, setEffectiveVerticalDisplayMode] = useState(verticalDisplayMode);
  const [effectiveFullWidth, setEffectiveFullWidth] = useState(fullWidth);
  const [effectiveWidth, setEffectiveWidth] = useState(width);
  const [effectiveHeight, setEffectiveHeight] = useState(height);
  const [maxVisibleTabs, setMaxVisibleTabs] = useState<number | undefined>(undefined);
  
  // State for collapsed tabs
  const [visibleTabs, setVisibleTabs] = useState<TabItem[]>(tabs);
  const [collapsedTabs, setCollapsedTabs] = useState<TabItem[]>([]);
  const [showCollapsedMenu, setShowCollapsedMenu] = useState(false);
  
  // Ref for tracking tab widths to determine when to collapse
  const tabWidthsRef = useRef<number[]>([]);
  
  // Determine if we should use physics animations
  const usePhysicsAnimation = animationStyle !== 'none' && !isReducedMotion;
  
  // Set up spring animation for selector
  const springRef = useRef({ 
    width: selectorStyle.width,
    height: selectorStyle.height,
    left: selectorStyle.left,
    top: selectorStyle.top,
  });
  
  const setSpringProps = (newProps: any) => {
    springRef.current = {
      ...springRef.current,
      ...newProps
    };
  };
  
  const springProps = springRef.current;
  
  // Set up inertial movement for scrolling
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({ x: 0, y: 0 });
  
  const setScrollTarget = (position: ScrollPosition, animate = true) => {
    setScrollPosition(position);
    
    if (tabsRef.current) {
      if (animate) {
        // Apply smooth scrolling if animate is true
        tabsRef.current.scrollTo({
          left: position.x,
          top: position.y,
          behavior: 'smooth'
        });
      } else {
        // Instant scroll
        tabsRef.current.scrollLeft = position.x;
        tabsRef.current.scrollTop = position.y;
      }
    }
  };
  
  // Set up momentum for flick scrolling
  const momentum = {
    start: (x: number, y: number) => {},
    update: (x: number, y: number) => {},
    end: () => ({ velocityX: 0, velocityY: 0 })
  };
  
  // Initialize gesture animation for the selector
  const [gestureAnimation, setGestureAnimation] = useState(null);
  
  // Configure gesture animation based on animation style
  const gestureConfig = useMemo(() => {
    // Set up appropriate animation preset based on the animationStyle
    let preset = GestureAnimationPreset.SPRING_BOUNCE;
    
    if (animationStyle === 'magnetic') {
      preset = GestureAnimationPreset.MAGNETIC_SNAP;
    } else if (animationStyle === 'inertial') {
      preset = GestureAnimationPreset.INERTIAL_SLIDE;
    }
    
    return {
      preset,
      gestures: [GestureType.PAN],
      tension: physics.tension || 280,
      friction: physics.friction || 26,
      mass: physics.mass || 1,
      velocityScale: animationStyle === 'inertial' ? 1.2 : 1,
      boundaries: variant === 'underlined' ? {
        // For underlined variant, constrain to the bottom or right edge
        ...(orientation === 'horizontal' ? {
          y: { min: selectorStyle.top, max: selectorStyle.top }
        } : {
          x: { min: selectorStyle.left, max: selectorStyle.left }
        })
      } : undefined
    };
  }, [animationStyle, physics, variant, orientation, selectorStyle]);
  
  // Set up gesture animation hook
  const { transform, animateTo } = useGestureAnimation({
    ref: useRef(null), // This is a placeholder, we'll manually control animation
    enabled: usePhysicsAnimation,
    respectReducedMotion: true,
    ...gestureConfig
  });
  
  // Update selector position based on active tab
  const updateSelectorPosition = useCallback(() => {
    if (!tabsRef.current || activeTab < 0 || activeTab >= tabs.length) return;
    
    const activeTabElement = tabRefs.current[activeTab];
    if (!activeTabElement) return;
    
    const tabRect = activeTabElement.getBoundingClientRect();
    const containerRect = tabsRef.current.getBoundingClientRect();
    
    const newStyle = {
      width: tabRect.width,
      height: tabRect.height,
      left: activeTabElement.offsetLeft,
      top: activeTabElement.offsetTop,
    };
    
    // Adjust for underlined variant
    if (variant === 'underlined') {
      if (orientation === 'horizontal') {
        newStyle.height = 2;
        newStyle.top = containerRect.height - 2;
      } else {
        newStyle.width = 2;
        newStyle.left = containerRect.width - 2;
      }
    }
    
    setSelectorStyle(newStyle);
    
    if (usePhysicsAnimation) {
      // Use different animation approaches based on the selected animation style
      if (animationStyle === 'magnetic') {
        // For magnetic animation, use a slightly overshooting spring
        setSpringProps({
          width: newStyle.width,
          height: newStyle.height,
          left: newStyle.left,
          top: newStyle.top,
          config: {
            tension: physics.tension || 300,
            friction: physics.friction || 15,
            mass: physics.mass || 1,
            restVelocity: 0.01,
            precision: 0.01
          }
        });
      } else if (animationStyle === 'inertial') {
        // For inertial animation, use a low friction spring
        setSpringProps({
          width: newStyle.width,
          height: newStyle.height,
          left: newStyle.left,
          top: newStyle.top,
          config: {
            tension: physics.tension || 120,
            friction: physics.friction || 14,
            mass: physics.mass || 1,
            restVelocity: 0.05
          }
        });
      } else {
        // Default spring animation
        setSpringProps({
          width: newStyle.width,
          height: newStyle.height,
          left: newStyle.left,
          top: newStyle.top,
          config: {
            tension: physics.tension || 280,
            friction: physics.friction || 26,
            mass: physics.mass || 1
          }
        });
      }
      
      // Also update the gesture animation if available
      animateTo({
        translateX: newStyle.left,
        translateY: newStyle.top
      });
    }
  }, [activeTab, tabs, orientation, variant, usePhysicsAnimation, setSpringProps, physics, animationStyle, animateTo]);
  
  // Handle tab click
  const handleTabClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    if (collapseTabs && index === visibleTabs.length - 1) {
      // This is the "More" menu tab, toggle the menu
      setShowCollapsedMenu(!showCollapsedMenu);
      return;
    }
    
    // If this is a normal tab click, handle it normally
    if (visibleTabs[index].disabled) return;
    onChange(event, index);
  };
  
  // Handle collapsed tab selection
  const handleCollapsedTabSelect = (collapsedIndex: number) => {
    // Find the original index of this tab in the full tabs array
    const realIndex = collapsedTabs[collapsedIndex] ? 
      tabs.findIndex(tab => tab.value === collapsedTabs[collapsedIndex].value) : -1;
    
    if (realIndex !== -1) {
      // Create a synthetic event that matches the expected type
      const syntheticEvent = {
        currentTarget: tabRefs.current[realIndex] || document.createElement('button'),
        preventDefault: () => {},
        stopPropagation: () => {}
      } as React.MouseEvent<HTMLButtonElement>;
      
      onChange(syntheticEvent, realIndex);
    }
    
    // Close the menu
    setShowCollapsedMenu(false);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!keyboardNavigation) return;
    
    // Skip disabled tabs when navigating with keyboard
    const getNextEnabledTabIndex = (startIndex: number, direction: number): number => {
      let nextIndex = startIndex;
      do {
        nextIndex = (nextIndex + direction + tabs.length) % tabs.length;
        // If we've cycled through all tabs and found none that are enabled, stay at current tab
        if (nextIndex === startIndex) return startIndex;
      } while (tabs[nextIndex].disabled);
      return nextIndex;
    };
    
    let newIndex = activeTab;
    
    switch (event.key) {
      case 'ArrowRight':
        if (effectiveOrientation === 'horizontal') {
          event.preventDefault();
          newIndex = getNextEnabledTabIndex(activeTab, 1);
        }
        break;
      case 'ArrowLeft':
        if (effectiveOrientation === 'horizontal') {
          event.preventDefault();
          newIndex = getNextEnabledTabIndex(activeTab, -1);
        }
        break;
      case 'ArrowDown':
        if (effectiveOrientation === 'vertical') {
          event.preventDefault();
          newIndex = getNextEnabledTabIndex(activeTab, 1);
        }
        break;
      case 'ArrowUp':
        if (effectiveOrientation === 'vertical') {
          event.preventDefault();
          newIndex = getNextEnabledTabIndex(activeTab, -1);
        }
        break;
      case 'Home':
        event.preventDefault();
        newIndex = getNextEnabledTabIndex(-1, 1);
        break;
      case 'End':
        event.preventDefault();
        newIndex = getNextEnabledTabIndex(tabs.length, -1);
        break;
      case 'Enter':
      case ' ': // Space
        event.preventDefault();
        if (!tabs[index].disabled) {
          onChange(event, index);
        }
        return; // Skip the auto-navigation below
      default:
        return; // Exit for other keys
    }
    
    // Only change tabs if we found a new enabled tab
    if (newIndex !== activeTab) {
      onChange(event, newIndex);
      // Focus the new tab
      setTimeout(() => {
        const newTabEl = tabRefs.current[newIndex];
        if (newTabEl) {
          newTabEl.focus();
        }
      }, 10);
    }
  };
  
  // Handle scroll visibility check
  const checkScrollVisibility = useCallback(() => {
    if (!tabsRef.current || !scrollable) return;
    
    const container = tabsRef.current;
    
    if (effectiveOrientation === 'horizontal') {
      setShowLeftScroll(container.scrollLeft > 0);
      setShowRightScroll(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 2
      );
    } else {
      setShowLeftScroll(container.scrollTop > 0);
      setShowRightScroll(
        container.scrollTop < container.scrollHeight - container.clientHeight - 2
      );
    }
  }, [effectiveOrientation, scrollable]);
  
  // Handle scroll button click
  const handleScroll = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!tabsRef.current) return;
    
    const container = tabsRef.current;
    const scrollAmount = effectiveOrientation === 'horizontal' ? container.clientWidth / 2 : container.clientHeight / 2;
    
    const targetPosition = { 
      x: scrollPosition.x,
      y: scrollPosition.y
    };
    
    if (effectiveOrientation === 'horizontal') {
      if (direction === 'left') {
        targetPosition.x = Math.max(0, scrollPosition.x - scrollAmount);
      } else {
        targetPosition.x = Math.min(
          container.scrollWidth - container.clientWidth,
          scrollPosition.x + scrollAmount
        );
      }
    } else {
      if (direction === 'up') {
        targetPosition.y = Math.max(0, scrollPosition.y - scrollAmount);
      } else {
        targetPosition.y = Math.min(
          container.scrollHeight - container.clientHeight,
          scrollPosition.y + scrollAmount
        );
      }
    }
    
    setScrollTarget(targetPosition);
  };
  
  // Set up scroll animation configuration
  const scrollPhysicsConfig = useMemo(() => {
    return {
      // Use physics parameters that create a fluid scrolling experience
      tension: 180,
      friction: 24,
      mass: 1,
      // Adjust physics based on animation style preference for consistency
      ...(animationStyle === 'inertial' ? { friction: 18 } : {}),
      ...(animationStyle === 'magnetic' ? { tension: 220, friction: 26 } : {}),
      ...(isReducedMotion ? { tension: 280, friction: 36 } : {})
    };
  }, [animationStyle, isReducedMotion]);
  
  // Initialize scroll animation ref
  const scrollAnimationRef = useRef<{
    rafId: number | null;
    velocity: { x: number; y: number };
    timestamp: number;
    active: boolean;
  }>({
    rafId: null,
    velocity: { x: 0, y: 0 },
    timestamp: 0,
    active: false
  });
  
  // Setup enhanced momentum scrolling
  const handleScrollGestureStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scrollable || !tabsRef.current) return;
    
    // Cancel any ongoing scroll animation
    if (scrollAnimationRef.current.rafId !== null) {
      cancelAnimationFrame(scrollAnimationRef.current.rafId);
      scrollAnimationRef.current.rafId = null;
      scrollAnimationRef.current.active = false;
    }
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    momentum.start(clientX, clientY);
    setIsScrolling(true);
  };
  
  const handleScrollGestureMove = (e: React.MouseEvent<Element> | React.TouchEvent<Element>) => {
    if (!isScrolling || !tabsRef.current) return;
    
    // Prevent default to avoid browser handling
    e.preventDefault();
    
    let clientX = 0;
    let clientY = 0;
    let deltaX = 0;
    let deltaY = 0;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      
      // Touch events don't have movementX/Y, use custom delta calculation
      // We would normally track the previous touch position here
      // For simplicity, we'll use a small fixed value
      deltaX = 5; // Default small movement
      deltaY = 5; // Default small movement
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
      deltaX = 'movementX' in e ? e.movementX : 0;
      deltaY = 'movementY' in e ? e.movementY : 0;
    }
    
    // Update momentum tracker
    momentum.update(clientX, clientY);
    
    // Calculate delta manually
    const delta = { x: -deltaX, y: -deltaY };
    
    // Use the momentum delta to update scroll position
    if (effectiveOrientation === 'horizontal') {
      tabsRef.current.scrollLeft += delta.x;
      
      // Update scroll position state to keep it in sync
      setScrollTarget({ 
        x: tabsRef.current.scrollLeft, 
        y: scrollPosition.y 
      }, false);
    } else {
      tabsRef.current.scrollTop += delta.y;
      
      // Update scroll position state to keep it in sync
      setScrollTarget({ 
        x: scrollPosition.x, 
        y: tabsRef.current.scrollTop 
      }, false);
    }
    
    checkScrollVisibility();
  };
  
  const handleScrollGestureEnd = () => {
    if (!isScrolling || !tabsRef.current) return;
    
    setIsScrolling(false);
    const velocity = momentum.end();
    
    // Store velocity for physics-based animation
    scrollAnimationRef.current.velocity = {
      x: velocity.velocityX * (isReducedMotion ? 0.5 : 1.0), // Reduce velocity for reduced motion
      y: velocity.velocityY * (isReducedMotion ? 0.5 : 1.0)
    };
    
    // Only apply momentum if velocity is significant
    if (Math.abs(velocity.velocityX) > 0.5 || Math.abs(velocity.velocityY) > 0.5) {
      // Set up physics animation for smooth deceleration
      scrollAnimationRef.current.timestamp = Date.now();
      scrollAnimationRef.current.active = true;
      
      // Get boundaries for scrolling
      const container = tabsRef.current;
      const maxScrollX = container.scrollWidth - container.clientWidth;
      const maxScrollY = container.scrollHeight - container.clientHeight;
      
      // Use a more sophisticated physics-based animation
      const animateScroll = () => {
        if (!scrollAnimationRef.current.active || !tabsRef.current) {
          scrollAnimationRef.current.rafId = null;
          return;
        }
        
        const now = Date.now();
        const elapsed = now - scrollAnimationRef.current.timestamp;
        scrollAnimationRef.current.timestamp = now;
        
        // Convert to seconds for physics calculations
        const dt = Math.min(elapsed, 64) / 1000; // Cap at 64ms to avoid big jumps
        
        // Apply physics (spring-driven deceleration)
        const friction = scrollPhysicsConfig.friction;
        const frictionFactor = Math.pow(0.95, friction * dt * 60); // Scale by dt
        
        // Update velocity with friction
        scrollAnimationRef.current.velocity.x *= frictionFactor;
        scrollAnimationRef.current.velocity.y *= frictionFactor;
        
        // Calculate new scroll position
        let newScrollX = tabsRef.current.scrollLeft - scrollAnimationRef.current.velocity.x * dt * 60;
        let newScrollY = tabsRef.current.scrollTop - scrollAnimationRef.current.velocity.y * dt * 60;
        
        // Apply boundaries
        newScrollX = Math.max(0, Math.min(maxScrollX, newScrollX));
        newScrollY = Math.max(0, Math.min(maxScrollY, newScrollY));
        
        // Apply scroll position
        if (effectiveOrientation === 'horizontal') {
          tabsRef.current.scrollLeft = newScrollX;
          setScrollTarget({ x: newScrollX, y: scrollPosition.y }, false);
        } else {
          tabsRef.current.scrollTop = newScrollY;
          setScrollTarget({ x: scrollPosition.x, y: newScrollY }, false);
        }
        
        // Check if we should stop animating
        const stopThreshold = 0.1;
        const isMoving = 
          Math.abs(scrollAnimationRef.current.velocity.x) > stopThreshold || 
          Math.abs(scrollAnimationRef.current.velocity.y) > stopThreshold;
        
        // Apply boundary bounce effect if we hit an edge
        if (effectiveOrientation === 'horizontal') {
          if (newScrollX === 0 || newScrollX === maxScrollX) {
            // Bounce effect: reverse velocity with damping
            scrollAnimationRef.current.velocity.x *= -0.3;
          }
        } else {
          if (newScrollY === 0 || newScrollY === maxScrollY) {
            // Bounce effect: reverse velocity with damping
            scrollAnimationRef.current.velocity.y *= -0.3;
          }
        }
        
        // Check if we're at a valid snap position
        checkTabSnapPositions(newScrollX, newScrollY);
        
        // Continue animation or stop
        if (isMoving) {
          checkScrollVisibility();
          scrollAnimationRef.current.rafId = requestAnimationFrame(animateScroll);
        } else {
          scrollAnimationRef.current.active = false;
          scrollAnimationRef.current.rafId = null;
        }
      };
      
      // Start animation
      scrollAnimationRef.current.rafId = requestAnimationFrame(animateScroll);
    }
  };
  
  // Check if we should snap to a tab position
  const checkTabSnapPositions = useCallback((scrollX: number, scrollY: number) => {
    if (!tabsRef.current || !tabRefs.current.length) return;
    
    // Only snap if the velocity is low enough
    const isSlowEnough = 
      Math.abs(scrollAnimationRef.current.velocity.x) < 2.0 && 
      Math.abs(scrollAnimationRef.current.velocity.y) < 2.0;
    
    if (!isSlowEnough) return;
    
    const container = tabsRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Find the center point of the viewport
    const viewportCenterX = containerRect.left + containerRect.width / 2;
    const viewportCenterY = containerRect.top + containerRect.height / 2;
    
    // Find the tab closest to the center
    let closestTab = null;
    let closestDistance = Infinity;
    
    tabRefs.current.forEach((tabRef, index) => {
      if (!tabRef) return;
      
      const tabRect = tabRef.getBoundingClientRect();
      const tabCenterX = tabRect.left + tabRect.width / 2;
      const tabCenterY = tabRect.top + tabRect.height / 2;
      
      // Calculate distance based on orientation
      const distance = orientation === 'horizontal' 
        ? Math.abs(tabCenterX - viewportCenterX)
        : Math.abs(tabCenterY - viewportCenterY);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTab = { index, tabRef };
      }
    });
    
    // If a close tab was found and we're moving slowly, snap to it
    if (closestTab && closestDistance < 100) {
      const tabRect = closestTab.tabRef.getBoundingClientRect();
      
      if (orientation === 'horizontal') {
        // Calculate target scroll position to center this tab
        const targetScrollX = scrollX + (tabRect.left + tabRect.width / 2 - viewportCenterX);
        
        // Apply gentle spring force toward the snap point
        const springForce = (targetScrollX - scrollX) * 0.04;
        scrollAnimationRef.current.velocity.x += springForce;
      } else {
        // Calculate target scroll position to center this tab
        const targetScrollY = scrollY + (tabRect.top + tabRect.height / 2 - viewportCenterY);
        
        // Apply gentle spring force toward the snap point
        const springForce = (targetScrollY - scrollY) * 0.04;
        scrollAnimationRef.current.velocity.y += springForce;
      }
    }
  }, [orientation]);
  
  // Clean up scroll animation on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current.rafId !== null) {
        cancelAnimationFrame(scrollAnimationRef.current.rafId);
        scrollAnimationRef.current.rafId = null;
      }
    };
  }, []);
  
  // Update container scroll position when inertial movement changes
  useEffect(() => {
    if (!tabsRef.current) return;
    
    const container = tabsRef.current;
    
    if (effectiveOrientation === 'horizontal') {
      container.scrollLeft = scrollPosition.x;
    } else {
      container.scrollTop = scrollPosition.y;
    }
    
    checkScrollVisibility();
  }, [scrollPosition, effectiveOrientation, checkScrollVisibility]);
  
  // Ensure active tab is visible
  const scrollActiveTabIntoView = useCallback(() => {
    if (!tabsRef.current || !scrollable || activeTab < 0 || activeTab >= tabs.length) return;
    
    const activeTabElement = tabRefs.current[activeTab];
    if (!activeTabElement) return;
    
    const container = tabsRef.current;
    const tabRect = activeTabElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    if (effectiveOrientation === 'horizontal') {
      if (tabRect.left < containerRect.left) {
        // Tab is to the left of the visible area
        const targetScrollLeft = container.scrollLeft - (containerRect.left - tabRect.left) - 16;
        setScrollTarget({ x: targetScrollLeft, y: 0 });
      } else if (tabRect.right > containerRect.right) {
        // Tab is to the right of the visible area
        const targetScrollLeft = container.scrollLeft + (tabRect.right - containerRect.right) + 16;
        setScrollTarget({ x: targetScrollLeft, y: 0 });
      }
    } else {
      if (tabRect.top < containerRect.top) {
        // Tab is above the visible area
        const targetScrollTop = container.scrollTop - (containerRect.top - tabRect.top) - 16;
        setScrollTarget({ x: 0, y: targetScrollTop });
      } else if (tabRect.bottom > containerRect.bottom) {
        // Tab is below the visible area
        const targetScrollTop = container.scrollTop + (tabRect.bottom - containerRect.bottom) + 16;
        setScrollTarget({ x: 0, y: targetScrollTop });
      }
    }
  }, [activeTab, effectiveOrientation, scrollable, tabs.length, setScrollTarget]);
  
  // Update selector position when active tab changes
  useEffect(() => {
    updateSelectorPosition();
    scrollActiveTabIntoView();
  }, [activeTab, updateSelectorPosition, scrollActiveTabIntoView]);
  
  // Handle screen size detection and responsive config
  useEffect(() => {
    const determineScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        return 'small';
      } else if (width >= 768 && width < 1200) {
        return 'medium';
      } else {
        return 'large';
      }
    };
    
    const updateResponsiveConfig = (size: 'small' | 'medium' | 'large') => {
      // Start with base config
      let newShowLabels = showLabels;
      let newIconPosition = iconPosition;
      let newVerticalDisplayMode = verticalDisplayMode;
      let newFullWidth = fullWidth;
      let newWidth = width;
      let newHeight = height;
      let newMaxVisibleTabs = undefined;
      
      // Apply base responsive config first
      if (responsiveConfig?.base) {
        if (responsiveConfig.base.showLabels !== undefined) newShowLabels = responsiveConfig.base.showLabels;
        if (responsiveConfig.base.iconPosition) newIconPosition = responsiveConfig.base.iconPosition;
        if (responsiveConfig.base.verticalDisplayMode) newVerticalDisplayMode = responsiveConfig.base.verticalDisplayMode;
        if (responsiveConfig.base.fullWidth !== undefined) newFullWidth = responsiveConfig.base.fullWidth;
        if (responsiveConfig.base.width !== undefined) newWidth = responsiveConfig.base.width;
        if (responsiveConfig.base.height !== undefined) newHeight = responsiveConfig.base.height;
        if (responsiveConfig.base.maxVisibleTabs !== undefined) newMaxVisibleTabs = responsiveConfig.base.maxVisibleTabs;
      }
      
      // Now apply size-specific overrides
      const sizeConfig = responsiveConfig?.[size];
      if (sizeConfig) {
        if (sizeConfig.showLabels !== undefined) newShowLabels = sizeConfig.showLabels;
        if (sizeConfig.iconPosition) newIconPosition = sizeConfig.iconPosition;
        if (sizeConfig.verticalDisplayMode) newVerticalDisplayMode = sizeConfig.verticalDisplayMode;
        if (sizeConfig.fullWidth !== undefined) newFullWidth = sizeConfig.fullWidth;
        if (sizeConfig.width !== undefined) newWidth = sizeConfig.width;
        if (sizeConfig.height !== undefined) newHeight = sizeConfig.height;
        if (sizeConfig.maxVisibleTabs !== undefined) newMaxVisibleTabs = sizeConfig.maxVisibleTabs;
      }
      
      // Apply special rules for small screens if no specific config
      if (size === 'small' && !sizeConfig) {
        // Default behavior for small screens without explicit config
        if (effectiveOrientation === 'horizontal') {
          // On horizontal orientation, we might want to automatically hide labels if there are icons
          const hasIcons = tabs.some(tab => !!tab.icon);
          if (hasIcons && responsiveConfig?.base?.showLabels === undefined) {
            newShowLabels = false;
          }
        } else {
          // On vertical orientation, we might want to switch to compact mode
          if (responsiveConfig?.base?.verticalDisplayMode === undefined) {
            newVerticalDisplayMode = 'compact';
          }
        }
      }
      
      // Update all the effective values
      setEffectiveShowLabels(newShowLabels);
      setEffectiveIconPosition(newIconPosition);
      setEffectiveVerticalDisplayMode(newVerticalDisplayMode);
      setEffectiveFullWidth(newFullWidth);
      setEffectiveWidth(newWidth);
      setEffectiveHeight(newHeight);
      setMaxVisibleTabs(newMaxVisibleTabs);
    };
    
    const handleResize = () => {
      const newSize = determineScreenSize();
      if (newSize !== screenSize) {
        setScreenSize(newSize);
        updateResponsiveConfig(newSize);
      }
      
      updateSelectorPosition();
      checkScrollVisibility();
      
      // Re-calculate visible and collapsed tabs
      if (collapseTabs) {
        calculateVisibleTabs();
      }
    };
    
    // Initial setup
    const initialSize = determineScreenSize();
    setScreenSize(initialSize);
    updateResponsiveConfig(initialSize);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [
    updateSelectorPosition, 
    checkScrollVisibility, 
    responsiveConfig, 
    showLabels, 
    iconPosition, 
    verticalDisplayMode, 
    fullWidth, 
    width, 
    height, 
    screenSize, 
    effectiveOrientation, 
    tabs,
    collapseTabs
  ]);
  
  // Setup scroll event listener
  useEffect(() => {
    const container = tabsRef.current;
    if (!container || !scrollable) return;
    
    const handleScroll = () => {
      checkScrollVisibility();
      
      // Update inertial scroll position
      if (orientation === 'horizontal') {
        setScrollTarget({ x: container.scrollLeft, y: 0 }, false);
      } else {
        setScrollTarget({ x: 0, y: container.scrollTop }, false);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollable, orientation, checkScrollVisibility, setScrollTarget]);
  
  // Check scroll visibility on mount and when tabs change
  useEffect(() => {
    checkScrollVisibility();
    
    // Reset tab state when tabs change
    setVisibleTabs(tabs);
    setCollapsedTabs([]);
    
    // Re-calculate visible tabs after a short delay to ensure the DOM has updated
    if (collapseTabs) {
      setTimeout(() => {
        calculateVisibleTabs();
      }, 50);
    }
  }, [tabs, checkScrollVisibility, collapseTabs]);
  
  // Calculate which tabs should be visible vs collapsed
  const calculateVisibleTabs = useCallback(() => {
    if (!tabsRef.current || !collapseTabs) return;
    
    const container = tabsRef.current;
    const containerWidth = container.clientWidth;
    
    // If we have a maxVisibleTabs value from the responsive config, use that
    if (maxVisibleTabs !== undefined && maxVisibleTabs < tabs.length) {
      // Create more menu tab
      const moreMenuTab: TabItem = {
        label: 'More',
        value: 'more-menu',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        )
      };
      
      // Set visible and collapsed tabs based on maxVisibleTabs
      const visible = [...tabs.slice(0, maxVisibleTabs - 1), moreMenuTab];
      const collapsed = tabs.slice(maxVisibleTabs - 1);
      
      setVisibleTabs(visible);
      setCollapsedTabs(collapsed);
      return;
    }
    
    // Collect tab widths and determine if we need to collapse tabs
    let accumulatedWidth = 0;
    const moreMenuWidth = 60; // Approximate width of "More" menu tab
    let visibleCount = tabs.length;
    
    // Update tab width measurements
    tabWidthsRef.current = [];
    tabRefs.current.forEach((tabRef, index) => {
      if (tabRef) {
        const tabWidth = tabRef.getBoundingClientRect().width;
        tabWidthsRef.current[index] = tabWidth;
        
        // Accumulate width
        accumulatedWidth += tabWidth;
      }
    });
    
    // If all tabs fit, show all
    if (accumulatedWidth <= containerWidth) {
      setVisibleTabs(tabs);
      setCollapsedTabs([]);
      return;
    }
    
    // If tabs don't fit, calculate how many we can show
    // Reserve space for "More" menu button
    const availableWidth = containerWidth - moreMenuWidth;
    let totalUsedWidth = 0;
    
    // Calculate how many tabs fit
    for (let i = 0; i < tabs.length; i++) {
      const tabWidth = tabWidthsRef.current[i] || 50; // Default width if missing
      
      if (totalUsedWidth + tabWidth > availableWidth) {
        visibleCount = i;
        break;
      }
      
      totalUsedWidth += tabWidth;
    }
    
    // Ensure we show at least 1 tab plus the "More" menu
    visibleCount = Math.max(1, visibleCount);
    
    // Create more menu tab
    const moreMenuTab: TabItem = {
      label: 'More',
      value: 'more-menu',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      )
    };
    
    // Set visible and collapsed tabs
    const visible = [...tabs.slice(0, visibleCount), moreMenuTab];
    const collapsed = tabs.slice(visibleCount);
    
    setVisibleTabs(visible);
    setCollapsedTabs(collapsed);
  }, [collapseTabs, maxVisibleTabs, tabs]);
  
  // Tab data for magnetic attraction system
  const [tabMagneticData, setTabMagneticData] = useState<{
    isHoveringTab: boolean;
    closestTabIndex: number | null;
    magneticForce: number;
    selectionProgress: number;
    lastInteractionTime: number;
  }>({
    isHoveringTab: false,
    closestTabIndex: null,
    magneticForce: 0,
    selectionProgress: 0,
    lastInteractionTime: 0
  });
  
  // Track magnetic tab selection animation
  const magneticAnimationRef = useRef<{
    animationActive: boolean;
    rafId: number | null;
    startTime: number;
  }>({
    animationActive: false,
    rafId: null,
    startTime: 0
  });
  
  // Set up magnetic tab selection physics
  const magneticSelectionConfig = useMemo(() => ({
    // Distance parameters
    hoverRadius: 150,            // Maximum distance for tab attraction
    strongAttractionRadius: 60,  // Distance for stronger magnetic pull
    activationThreshold: 0.6,    // Selection progress threshold for tab activation
    
    // Force parameters
    baseAttractionForce: 0.05,   // Base magnetic attraction strength
    maxAttractionForce: 0.2,     // Maximum attraction strength
    
    // Physics
    selectionInertia: 0.86,      // How quickly selection progress decays (lower = faster)
    magneticDamping: 0.82,       // Damping for the magnetic force
    
    // Animation
    springTension: isReducedMotion ? 350 : 280,
    springFriction: isReducedMotion ? 32 : 22,
    
    // Time parameters
    autoSelectDelay: 600,        // Time in ms to auto-select a tab when hovering
    minHoverTime: 120,           // Minimum hover time to start attraction
    
    // Custom config for specific variants
    ...(variant === 'pills' ? { 
      hoverRadius: 180, 
      baseAttractionForce: 0.06
    } : {}),
    
    ...(variant === 'underlined' ? { 
      hoverRadius: 140, 
      baseAttractionForce: 0.03
    } : {})
  }), [isReducedMotion, variant]);
  
  // Magnetic effect for the tab selector
  const magneticSelector = useCallback((e: React.MouseEvent) => {
    if (!usePhysicsAnimation || !tabsRef.current) return;
    
    const now = Date.now();
    const containerRect = tabsRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    
    // Find closest tab to cursor and check if we're hovering any tab
    let closestTabIndex = null;
    let closestDistance = Infinity;
    let isHoveringAnyTab = false;
    
    // Track whether we should update the tab magnetic data
    let shouldUpdateTabMagneticData = false;
    
    // Process all tabs to find the closest one
    tabRefs.current.forEach((tabRef, index) => {
      if (!tabRef) return;
      
      const tabRect = tabRef.getBoundingClientRect();
      const tabCenterX = tabRect.left + tabRect.width / 2 - containerRect.left;
      const tabCenterY = tabRect.top + tabRect.height / 2 - containerRect.top;
      
      // Calculate distance to tab center
      const distanceToTab = Math.sqrt(
        Math.pow(mouseX - tabCenterX, 2) + 
        Math.pow(mouseY - tabCenterY, 2)
      );
      
      // Check if this is the closest tab
      if (distanceToTab < closestDistance) {
        closestDistance = distanceToTab;
        closestTabIndex = index;
      }
      
      // Check if we're hovering any tab (inside its rectangle with some padding)
      const isInTabBounds = 
        mouseX >= tabRect.left - containerRect.left - 10 && 
        mouseX <= tabRect.left - containerRect.left + tabRect.width + 10 &&
        mouseY >= tabRect.top - containerRect.top - 10 && 
        mouseY <= tabRect.top - containerRect.top + tabRect.height + 10;
        
      if (isInTabBounds) {
        isHoveringAnyTab = true;
      }
    });
    
    // Update tab magnetic data
    if (closestTabIndex !== null && closestDistance < magneticSelectionConfig.hoverRadius) {
      // Set magnetic force based on distance to closest tab
      const normalizedDistance = Math.min(1, closestDistance / magneticSelectionConfig.hoverRadius);
      
      // Calculate inverse distance (closer = stronger)
      const attractionForce = magneticSelectionConfig.baseAttractionForce + 
        (1 - normalizedDistance) * (magneticSelectionConfig.maxAttractionForce - magneticSelectionConfig.baseAttractionForce);
      
      // Calculate selection progress
      // If it's already the active tab, maintain 100% progress
      const selectionProgress = closestTabIndex === activeTab 
        ? 1
        : Math.min(
            1, 
            tabMagneticData.selectionProgress * magneticSelectionConfig.selectionInertia + 
            (closestDistance < magneticSelectionConfig.strongAttractionRadius ? attractionForce * 2 : attractionForce)
          );
      
      // Determine if we should change selected tab
      if (animationStyle === 'magnetic' && 
          tabMagneticData.closestTabIndex === closestTabIndex && 
          closestTabIndex !== activeTab && 
          selectionProgress > magneticSelectionConfig.activationThreshold) {
        
        // Check if we've hovered long enough or reached high enough progress
        const hoverTime = now - tabMagneticData.lastInteractionTime;
        if (hoverTime > magneticSelectionConfig.autoSelectDelay || selectionProgress > 0.9) {
          // Actually select the tab
          const tabElement = tabRefs.current[closestTabIndex];
          if (tabElement && !tabs[closestTabIndex].disabled) {
            tabElement.click();
            
            // Reset selection progress
            shouldUpdateTabMagneticData = true;
            setTabMagneticData(prev => ({
              ...prev,
              selectionProgress: 0,
              magneticForce: 0,
              lastInteractionTime: now
            }));
            
            return; // Exit early since we've clicked the tab
          }
        }
      }
      
      // Update magnetic data
      shouldUpdateTabMagneticData = true;
      setTabMagneticData(prev => ({
        isHoveringTab: isHoveringAnyTab,
        closestTabIndex: closestTabIndex,
        magneticForce: prev.magneticForce * magneticSelectionConfig.magneticDamping + attractionForce,
        selectionProgress,
        lastInteractionTime: isHoveringAnyTab && prev.closestTabIndex === closestTabIndex 
          ? prev.lastInteractionTime 
          : now
      }));
    } else {
      // Apply decay to selection progress when not hovering a tab
      if (tabMagneticData.selectionProgress > 0.01) {
        shouldUpdateTabMagneticData = true;
        setTabMagneticData(prev => ({
          ...prev,
          isHoveringTab: isHoveringAnyTab,
          selectionProgress: prev.selectionProgress * 0.92,
          magneticForce: prev.magneticForce * 0.9
        }));
      } else if (tabMagneticData.selectionProgress !== 0) {
        shouldUpdateTabMagneticData = true;
        setTabMagneticData(prev => ({
          ...prev,
          isHoveringTab: isHoveringAnyTab,
          selectionProgress: 0,
          magneticForce: 0
        }));
      }
    }
    
    // Apply magnetic effect to the active tab selector
    if (animationStyle === 'magnetic' && shouldUpdateTabMagneticData) {
      applyMagneticEffect(mouseX, mouseY);
    }
  }, [
    activeTab, 
    animationStyle, 
    usePhysicsAnimation, 
    tabs, 
    magneticSelectionConfig,
    tabMagneticData
  ]);
  
  // Apply magnetic effect to the selector
  const applyMagneticEffect = useCallback((mouseX: number, mouseY: number) => {
    if (!tabsRef.current || !usePhysicsAnimation) return;
    
    // If we're not in magnetic animation style, exit early
    if (animationStyle !== 'magnetic') return;
    
    const containerRect = tabsRef.current.getBoundingClientRect();
    
    // Apply magnetic pull to the active tab
    const activeTabElement = tabRefs.current[activeTab];
    if (!activeTabElement) return;
    
    const tabRect = activeTabElement.getBoundingClientRect();
    const tabCenterX = tabRect.left + tabRect.width / 2 - containerRect.left;
    const tabCenterY = tabRect.top + tabRect.height / 2 - containerRect.top;
    
    // Calculate distance to active tab center
    const distanceToTab = Math.sqrt(
      Math.pow(mouseX - tabCenterX, 2) + 
      Math.pow(mouseY - tabCenterY, 2)
    );
    
    // Apply magnetic pull effect to the active tab selector
    if (distanceToTab < magneticSelectionConfig.hoverRadius) {
      // Calculate magnetic pull strength based on distance
      const normalizedDistance = Math.min(1, distanceToTab / magneticSelectionConfig.hoverRadius);
      const pullStrength = Math.pow(1 - normalizedDistance, 2) * 12; 
      
      // Calculate pull vector
      const pullX = (mouseX - tabCenterX) * pullStrength * 0.1;
      const pullY = (mouseY - tabCenterY) * pullStrength * 0.1;
      
      // For underlined variant, constrain movement to the axis
      let constrainedPullX = pullX;
      let constrainedPullY = pullY;
      
      if (variant === 'underlined') {
        if (orientation === 'horizontal') {
          constrainedPullY = 0; // Only allow horizontal movement
        } else {
          constrainedPullX = 0; // Only allow vertical movement
        }
      }
      
      // Use different animation technique based on distance
      if (distanceToTab < magneticSelectionConfig.strongAttractionRadius) {
        // When close, use direct spring adjustment for immediate response
        setSpringProps({
          left: selectorStyle.left + constrainedPullX,
          top: selectorStyle.top + constrainedPullY,
          config: {
            tension: magneticSelectionConfig.springTension + 50, // Higher tension for faster response
            friction: magneticSelectionConfig.springFriction - 3
          }
        });
      } else {
        // When further away, use spring physics with more bounce
        setSpringProps({
          left: selectorStyle.left + constrainedPullX * 0.8,
          top: selectorStyle.top + constrainedPullY * 0.8,
          config: {
            tension: magneticSelectionConfig.springTension,
            friction: magneticSelectionConfig.springFriction
          }
        });
      }
      
      // Also update with gesture animation system for additional effects
      animateTo({
        translateX: selectorStyle.left + constrainedPullX * 0.8,
        translateY: selectorStyle.top + constrainedPullY * 0.8
      });
    } else {
      // Reset selector position when outside hover radius
      setSpringProps({
        left: selectorStyle.left,
        top: selectorStyle.top,
        config: {
          tension: magneticSelectionConfig.springTension,
          friction: magneticSelectionConfig.springFriction
        }
      });
    }
    
    // If we have a different closest tab that's not the active tab,
    // apply a slight pull toward that tab to hint at the magnetic selection
    if (tabMagneticData.closestTabIndex !== null && 
        tabMagneticData.closestTabIndex !== activeTab &&
        tabMagneticData.selectionProgress > 0.1) {
      
      const closestTabElement = tabRefs.current[tabMagneticData.closestTabIndex];
      if (!closestTabElement) return;
      
      const closestTabRect = closestTabElement.getBoundingClientRect();
      const attractionX = (closestTabRect.left - tabRect.left) * tabMagneticData.selectionProgress * 0.15;
      const attractionY = (closestTabRect.top - tabRect.top) * tabMagneticData.selectionProgress * 0.15;
      
      // For underlined variant, constrain movement to the axis
      let constrainedAttractionX = attractionX;
      let constrainedAttractionY = attractionY;
      
      if (variant === 'underlined') {
        if (orientation === 'horizontal') {
          constrainedAttractionY = 0;
        } else {
          constrainedAttractionX = 0;
        }
      }
      
      // Apply the pull toward the closest tab
      setSpringProps(prev => ({
        ...prev,
        left: prev.left + constrainedAttractionX,
        top: prev.top + constrainedAttractionY,
      }));
    }
  }, [
    activeTab,
    animationStyle,
    magneticSelectionConfig,
    orientation,
    selectorStyle,
    setSpringProps,
    tabMagneticData,
    usePhysicsAnimation,
    variant,
    animateTo
  ]);
  
  // Handle mouse move for magnetic effect
  const handleMouseMove = (e: React.MouseEvent) => {
    magneticSelector(e);
  };
  
  // Handle mouse leave for magnetic effect
  const handleMouseLeave = () => {
    if (animationStyle === 'magnetic' && usePhysicsAnimation) {
      // Reset selector position
      setSpringProps({
        left: selectorStyle.left,
        top: selectorStyle.top,
      });
      
      // Reset magnetic data
      setTabMagneticData({
        isHoveringTab: false,
        closestTabIndex: null,
        magneticForce: 0,
        selectionProgress: 0,
        lastInteractionTime: 0
      });
    }
  };
  
  // Create magnetic trail effect
  const MagneticTrailEffect = useCallback(() => {
    if (animationStyle !== 'magnetic' || 
        !tabMagneticData.closestTabIndex || 
        tabMagneticData.closestTabIndex === activeTab ||
        tabMagneticData.selectionProgress < 0.2) {
      return null;
    }
    
    const trailOpacity = Math.min(0.4, tabMagneticData.selectionProgress * 0.4);
    const trailSize = 20 + tabMagneticData.selectionProgress * 30;
    
    return (
      <div 
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 0,
          width: `${trailSize}px`,
          height: `${trailSize}px`,
          borderRadius: '50%',
          background: color === 'default' ? 
            `rgba(255, 255, 255, ${trailOpacity})` : 
            `var(--color-${color}-transparent)`,
          filter: `blur(${trailSize / 4}px)`,
          opacity: trailOpacity,
          transform: `translate3d(${
            springProps.left + springProps.width / 2 - trailSize / 2
          }px, ${
            springProps.top + springProps.height / 2 - trailSize / 2
          }px, 0)`,
          transition: 'transform 0.1s ease-out, width 0.2s ease, height 0.2s ease, opacity 0.2s ease'
        }}
      />
    );
  }, [
    animationStyle, 
    tabMagneticData, 
    activeTab, 
    color, 
    springProps
  ]);
  
  const activeIndicatorColor = useThemeColor(
    color === 'default' ? 'primary' : color as keyof ThemeColors
  );
  
  return (
    <TabBarContainer
      ref={tabsRef}
      className={`glass-tab-bar ${className || ''}`}
      style={style}
      $orientation={effectiveOrientation}
      $variant={variant}
      $glassVariant={glassVariant}
      $blurStrength={blurStrength}
      $elevated={elevated}
      $background={background}
      $color={color}
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      $iconPosition={iconPosition}
      $verticalDisplayMode={verticalDisplayMode}
      $placement={placement}
      $isResponsive={!!responsiveOrientation}
      onMouseMove={isScrolling ? handleScrollGestureMove : handleMouseMove}
      onMouseLeave={isScrolling ? handleScrollGestureEnd : handleMouseLeave}
      onMouseDown={handleScrollGestureStart}
      onTouchStart={handleScrollGestureStart}
      onTouchMove={isScrolling ? handleScrollGestureMove : undefined}
      onMouseUp={isScrolling ? handleScrollGestureEnd : undefined}
      onTouchEnd={isScrolling ? handleScrollGestureEnd : undefined}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={effectiveOrientation}
    >
      {/* Selector indicator */}
      {variant !== 'default' && (
        <TabSelector
          $variant={variant}
          $orientation={orientation}
          $color={color}
          $glowEffect={true}
          $animationStyle={animationStyle}
          $tabStyle={tabStyle}
          $selectionProgress={
            tabMagneticData.closestTabIndex !== null && 
            tabMagneticData.closestTabIndex !== activeTab ? 
            tabMagneticData.selectionProgress : undefined
          }
          style={usePhysicsAnimation ? {
            width: `${springProps.width}px`,
            height: `${springProps.height}px`,
            transform: `translate3d(${
              // If using gesture animation transform for magnetic effect
              animationStyle === 'magnetic' && transform.translateX !== 0
                ? transform.translateX 
                : springProps.left
            }px, ${
              // If using gesture animation transform for magnetic effect  
              animationStyle === 'magnetic' && transform.translateY !== 0
                ? transform.translateY
                : springProps.top
            }px, 0) ${
              // Add subtle scale effect for magnetic animation
              animationStyle === 'magnetic' 
                ? `scale(${1 + Math.abs(transform.translateX - selectorStyle.left) * 0.001 + 
                          Math.abs(transform.translateY - selectorStyle.top) * 0.001})` 
                : ''
            }`,
            // Use string literal for transition to avoid type errors
            transition: animationStyle && animationStyle.toString() === 'none'
              ? 'none' 
              : 'filter 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease',
            // Add dynamic glow intensity for magnetic effect
            ...((!tabStyle?.selectorStyle?.boxShadow && animationStyle === 'magnetic' && variant === 'pills') ? {
              boxShadow: `0 0 ${15 + Math.abs(transform.translateX - selectorStyle.left) * 0.1 + 
                          Math.abs(transform.translateY - selectorStyle.top) * 0.1}px ${
                          color === 'default' ? 'rgba(255, 255, 255, 0.3)' : `var(--color-${color}-shadow)`
                        }`
            } : {})
          } : {
            width: `${selectorStyle.width}px`,
            height: `${selectorStyle.height}px`,
            transform: `translate3d(${selectorStyle.left}px, ${selectorStyle.top}px, 0)`,
          }}
        />
      )}
      
      {/* Magnetic trail effect */}
      {animationStyle === 'magnetic' && <MagneticTrailEffect />}
      
      {/* Tabs - using visibleTabs for responsive behavior */}
      {(collapseTabs ? visibleTabs : tabs).map((tab, index) => {
        // Special handling for "more" menu tab
        const isMoreTab = collapseTabs && index === visibleTabs.length - 1 && collapsedTabs.length > 0;
        
        // Determine if this tab is active
        let isActive;
        if (isMoreTab) {
          // "More" tab is active if any collapsed tab is active
          const activeTabValue = tabs[activeTab]?.value;
          isActive = collapsedTabs.some(tab => tab.value === activeTabValue);
        } else {
          // Regular tab is active if its index matches activeTab
          const tabIndex = collapseTabs 
            ? tabs.findIndex(t => t.value === tab.value)
            : index;
          isActive = tabIndex === activeTab;
        }
        
        // Render custom tab if renderTab function is provided
        if (renderTab && !isMoreTab) {
          return (
            <React.Fragment key={tab.id || index}>
              {renderTab(tab, index, isActive)}
            </React.Fragment>
          );
        }
        
        // Default tab rendering
        return (
          <TabItem
            key={tab.id || `tab-${index}`}
            ref={el => tabRefs.current[index] = el}
            $active={isActive}
            $orientation={effectiveOrientation}
            $variant={variant}
            $color={color}
            $fullWidth={effectiveFullWidth}
            $alignment={alignment}
            $glassVariant={glassVariant}
            $animationStyle={animationStyle}
            $iconPosition={effectiveIconPosition}
            $tabStyle={tabStyle}
            $magneticProgress={
              !isMoreTab && 
              tabMagneticData.closestTabIndex === index && 
              !isActive 
                ? tabMagneticData.selectionProgress 
                : undefined
            }
            disabled={tab.disabled}
            onClick={e => handleTabClick(e, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onContextMenu={onContextMenu && !isMoreTab ? e => onContextMenu(e, index) : undefined}
            className={`${tab.className || ''} ${tabClassName || ''} ${isActive && activeTabClassName ? activeTabClassName : ''} ${isMoreTab ? 'more-menu-tab' : ''}`}
            style={tab.style}
            aria-selected={isActive}
            aria-controls={isMoreTab ? undefined : `tab-panel-${tab.id || index}`}
            id={`tab-${tab.id || index}`}
            role="tab"
            tabIndex={isActive ? 0 : (keyboardNavigation ? -1 : tabIndex)}
            aria-disabled={tab.disabled}
            aria-haspopup={isMoreTab ? 'true' : undefined}
            aria-expanded={isMoreTab ? showCollapsedMenu : undefined}
          >
            {tab.icon && (
              <TabIcon 
                $showLabel={effectiveShowLabels && !!tab.label} 
                $orientation={effectiveOrientation} 
                $iconPosition={effectiveIconPosition}
              >
                {tab.icon}
              </TabIcon>
            )}
            {(effectiveShowLabels || !tab.icon) && tab.label}
            {!isMoreTab && tab.badge && (
              <TabBadge 
                value={tab.badge}
                color={color}
                animation={tab.badgeAnimation || defaultBadgeAnimation}
                hidden={tab.badgeHidden}
                $borderRadius={badgeStyle?.borderRadius}
                $size={badgeStyle?.size}
                $padding={badgeStyle?.padding}
                $fontSize={badgeStyle?.fontSize}
                $fontWeight={badgeStyle?.fontWeight}
                $boxShadow={badgeStyle?.boxShadow}
                $margin={badgeStyle?.margin}
                $backgroundColor={badgeStyle?.backgroundColor}
                $textColor={badgeStyle?.color}
              />
            )}
            
            {/* Render badge for "More" tab if any collapsed tab has a badge */}
            {isMoreTab && collapsedTabs.some(tab => tab.badge !== undefined) && (
              <TabBadge 
                value={collapsedTabs.reduce((count, tab) => {
                  // If badge is a number, add it to count
                  if (typeof tab.badge === 'number') return count + tab.badge;
                  // If badge exists but is not a number, increment by 1
                  if (tab.badge !== undefined) return count + 1;
                  return count;
                }, 0)}
                color={color}
                animation={defaultBadgeAnimation || 'pulse'}
                $borderRadius={badgeStyle?.borderRadius}
                $size={badgeStyle?.size}
                $padding={badgeStyle?.padding}
                $fontSize={badgeStyle?.fontSize}
                $fontWeight={badgeStyle?.fontWeight}
                $boxShadow={badgeStyle?.boxShadow}
                $margin={badgeStyle?.margin}
                $backgroundColor={badgeStyle?.backgroundColor}
                $textColor={badgeStyle?.color}
              />
            )}
          </TabItem>
        );
      })}
      
      {/* Collapsed tabs menu */}
      {collapseTabs && collapsedTabs.length > 0 && (
        renderCollapsedMenu ? (
          renderCollapsedMenu(collapsedTabs, activeTab, handleCollapsedTabSelect)
        ) : (
          <DefaultCollapsedMenu
            tabs={collapsedTabs}
            activeTab={activeTab}
            onSelect={handleCollapsedTabSelect}
            open={showCollapsedMenu}
            onClose={() => setShowCollapsedMenu(false)}
            color={color}
            orientation={effectiveOrientation}
            variant={variant}
            glassVariant={glassVariant}
          />
        )
      )}
      
      {/* Scroll buttons */}
      {scrollable && effectiveOrientation === 'horizontal' && showLeftScroll && (
        <ScrollButton 
          $direction="left"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </ScrollButton>
      )}
      
      {scrollable && effectiveOrientation === 'horizontal' && showRightScroll && (
        <ScrollButton 
          $direction="right"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </ScrollButton>
      )}
      
      {scrollable && effectiveOrientation === 'vertical' && showLeftScroll && (
        <ScrollButton 
          $direction="up"
          onClick={() => handleScroll('up')}
          aria-label="Scroll up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </ScrollButton>
      )}
      
      {scrollable && effectiveOrientation === 'vertical' && showRightScroll && (
        <ScrollButton 
          $direction="down"
          onClick={() => handleScroll('down')}
          aria-label="Scroll down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </ScrollButton>
      )}
    </TabBarContainer>
  );
};

export default GlassTabBar;