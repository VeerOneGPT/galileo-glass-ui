import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, slideUp } from '../../animations/keyframes/basic';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

export interface BottomNavigationProps {
  /**
   * The content of the bottom navigation
   */
  children: React.ReactNode;

  /**
   * The value of the currently selected action
   */
  value?: number | string;

  /**
   * Callback fired when a bottom navigation item is selected
   */
  onChange?: (event: React.SyntheticEvent, value: number | string) => void;

  /**
   * If true, show labels for all actions regardless of selection
   */
  showLabels?: boolean;

  /**
   * The variant of bottom navigation appearance
   */
  variant?: 'standard' | 'glass';

  /**
   * The color theme of the bottom navigation
   */
  color?: 'primary' | 'secondary' | 'default';

  /**
   * The elevation of the bottom navigation component
   * (determines shadow depth)
   */
  elevation?: 0 | 1 | 2 | 3 | 4;

  /**
   * Additional CSS class
   */
  className?: string;
}

export interface BottomNavigationActionProps {
  /**
   * The label for the action
   */
  label: string;

  /**
   * The icon displayed for the action
   */
  icon: React.ReactNode;

  /**
   * The value of the action
   */
  value: number | string;

  /**
   * If true, the action is currently selected
   */
  selected?: boolean;

  /**
   * If true, the action is disabled
   */
  disabled?: boolean;

  /**
   * If true, show the label regardless of selection
   */
  showLabel?: boolean;

  /**
   * Callback fired when the action is selected
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Additional CSS class
   */
  className?: string;
}

// Get color by name
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    default:
      return '#1F2937'; // default dark gray
  }
};

// Get elevation shadow
const getElevationShadow = (elevation: number): string => {
  switch (elevation) {
    case 0:
      return 'none';
    case 1:
      return '0 2px 4px rgba(0, 0, 0, 0.1)';
    case 2:
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
    case 3:
      return '0 8px 16px rgba(0, 0, 0, 0.1)';
    case 4:
      return '0 12px 24px rgba(0, 0, 0, 0.1)';
    default:
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
  }
};

// Styled components
const BottomNavigationContainer = styled.div<{
  $variant: string;
  $color: string;
  $elevation: number;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 56px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  box-sizing: border-box;

  /* Variant styles */
  ${props => {
    if (props.$variant === 'glass') {
      return css`
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      `;
    }

    // standard
    return css`
      background-color: white;
      color: #1f2937;
      box-shadow: ${getElevationShadow(props.$elevation)};
    `;
  }}

  /* Glass effect for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassSurface({
      elevation: props.$elevation,
      blurStrength: 'enhanced',
      backgroundOpacity: 'subtle',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}
  
  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    props.$color !== 'default' &&
    glassGlow({
      glowIntensity: 'minimal',
      glowColor: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Edge highlight for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    edgeHighlight({
      thickness: 1,
      opacity: 0.3,
      position: 'top',
      themeContext: createThemeContext({}),
    })}
  
  /* Animation */
  ${accessibleAnimation({
    animation: slideUp,
    duration: 0.3,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  })}
`;

const ActionButton = styled.button<{
  $selected: boolean;
  $showLabel: boolean;
  $variant: string;
  $color: string;
  $disabled: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  flex: 1;
  height: 100%;
  padding: 6px 12px;
  min-width: 80px;
  max-width: 168px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  /* Icon container */
  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${props => (props.$selected || props.$showLabel ? '4px' : '0')};

    svg {
      width: 24px;
      height: 24px;
      transition: all 0.2s ease;
      color: ${props => {
        if (props.$disabled) {
          return props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.4)' : '#94A3B8';
        }
        if (props.$selected) {
          return props.$variant === 'glass' ? 'white' : getColorByName(props.$color);
        }
        return props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.7)' : '#64748B';
      }};
    }
  }

  /* Label styling */
  .label {
    font-size: 0.75rem;
    font-family: 'Inter', sans-serif;
    line-height: 1;
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.3s ease;
    color: ${props => {
      if (props.$disabled) {
        return props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.4)' : '#94A3B8';
      }
      if (props.$selected) {
        return props.$variant === 'glass' ? 'white' : getColorByName(props.$color);
      }
      return props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.7)' : '#64748B';
    }};
    transform: scale(${props => (props.$selected || props.$showLabel ? '1' : '0.75')});
    opacity: ${props => (props.$selected || props.$showLabel ? '1' : '0')};
    height: ${props => (props.$selected || props.$showLabel ? '1em' : '0')};
    margin-top: ${props => (props.$selected || props.$showLabel ? '0' : '-8px')};
  }

  /* Selected state */
  ${props =>
    props.$selected &&
    css`
      .icon-container svg {
        transform: ${props.$variant === 'glass' ? 'scale(1.1)' : 'none'};
      }
    `}

  /* Hover effect */
  &:hover {
    background-color: ${props =>
      props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'};

    .icon-container svg {
      color: ${props => {
        if (props.$disabled) {
          return props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.4)' : '#94A3B8';
        }
        return props.$variant === 'glass' ? 'white' : getColorByName(props.$color);
      }};
    }

    .label {
      color: ${props => {
        if (props.$disabled) {
          return props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.4)' : '#94A3B8';
        }
        return props.$variant === 'glass' ? 'white' : getColorByName(props.$color);
      }};
    }
  }

  /* Disabled state */
  ${props =>
    props.$disabled &&
    css`
      cursor: not-allowed;
      pointer-events: none;
    `}

  /* Animation for selected item */
  ${props =>
    props.$selected &&
    accessibleAnimation({
      animation: fadeIn,
      duration: 0.3,
      easing: 'ease-out',
    })}
`;

/**
 * BottomNavigation Component
 *
 * A bottom navigation bar for mobile applications.
 */
export const BottomNavigation = forwardRef<HTMLDivElement, BottomNavigationProps>((props, ref) => {
  const {
    children,
    value,
    onChange,
    showLabels = false,
    variant = 'standard',
    color = 'primary',
    elevation = 2,
    className,
    ...rest
  } = props;

  // Clone children with additional props
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        selected: child.props.value === value,
        showLabel: showLabels || child.props.value === value,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (onChange) {
            onChange(event, child.props.value);
          }
          if (child.props.onClick) {
            child.props.onClick(event);
          }
        },
        variant,
        color,
      } as React.HTMLAttributes<HTMLElement>);
    }
    return child;
  });

  return (
    <BottomNavigationContainer
      ref={ref}
      className={className}
      $variant={variant}
      $color={color}
      $elevation={elevation}
      {...rest}
    >
      {childrenWithProps}
    </BottomNavigationContainer>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

/**
 * BottomNavigationAction Component
 *
 * Individual action items within the BottomNavigation.
 */
export const BottomNavigationAction = forwardRef<HTMLButtonElement, BottomNavigationActionProps>(
  (props, ref) => {
    const {
      label,
      icon,
      value,
      selected = false,
      disabled = false,
      showLabel,
      onClick,
      className,
      ...rest
    } = props;

    // Get the variant and color from parent context (these are injected by BottomNavigation)
    // TypeScript will complain about these props, but they are injected at runtime
    const variant = (props as any).variant || 'standard';
    const color = (props as any).color || 'primary';

    return (
      <ActionButton
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={className}
        $selected={selected}
        $showLabel={showLabel || false}
        $variant={variant}
        $color={color}
        $disabled={disabled}
        {...rest}
      >
        <div className="icon-container">{icon}</div>
        <span className="label">{label}</span>
      </ActionButton>
    );
  }
);

BottomNavigationAction.displayName = 'BottomNavigationAction';

/**
 * GlassBottomNavigation Component
 *
 * A bottom navigation component with glass morphism styling.
 */
export const GlassBottomNavigation = forwardRef<HTMLDivElement, BottomNavigationProps>(
  (props, ref) => {
    const { className, variant = 'glass', ...rest } = props;

    return (
      <BottomNavigation
        ref={ref}
        className={`glass-bottom-navigation ${className || ''}`}
        variant={variant}
        {...rest}
      />
    );
  }
);

GlassBottomNavigation.displayName = 'GlassBottomNavigation';
