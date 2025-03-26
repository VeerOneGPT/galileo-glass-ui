import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { scaleUp } from '../../animations/keyframes/basic';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

export interface FabProps {
  /**
   * The content of the button
   */
  children: React.ReactNode;

  /**
   * The color of the button
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

  /**
   * If true, the button will be disabled
   */
  disabled?: boolean;

  /**
   * The URL to link to when the button is clicked
   */
  href?: string;

  /**
   * The size of the button
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * The variant of the button
   */
  variant?: 'standard' | 'extended' | 'glass';

  /**
   * Callback fired when the button is clicked
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;

  /**
   * The position of the FAB (fixed positioning options)
   */
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft' | 'center' | 'none';

  /**
   * Tooltip text for the FAB
   */
  tooltip?: string;

  /**
   * If true, the FAB will show a pulse animation
   */
  pulse?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * If true, glass glow effect will be more intense
   */
  enhanced?: boolean;

  /**
   * Z-index for the FAB
   */
  zIndex?: number;

  /**
   * Type of the button
   */
  type?: 'button' | 'submit' | 'reset';
}

// Get color by name
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#1F2937'; // default dark gray
  }
};

// Get size values
const getSizeValues = (size: string, variant: string) => {
  const isExtended = variant === 'extended';

  switch (size) {
    case 'small':
      return {
        width: isExtended ? 'auto' : '40px',
        height: '40px',
        padding: isExtended ? '8px 12px' : '0',
        fontSize: '1.25rem',
      };
    case 'large':
      return {
        width: isExtended ? 'auto' : '64px',
        height: '64px',
        padding: isExtended ? '12px 20px' : '0',
        fontSize: '1.75rem',
      };
    default: // medium
      return {
        width: isExtended ? 'auto' : '56px',
        height: '56px',
        padding: isExtended ? '10px 16px' : '0',
        fontSize: '1.5rem',
      };
  }
};

// Get position styles
const getPositionStyles = (position: string) => {
  if (position === 'none') return '';

  const base = css`
    position: fixed;
  `;

  switch (position) {
    case 'bottomRight':
      return css`
        ${base}
        bottom: 16px;
        right: 16px;
      `;
    case 'bottomLeft':
      return css`
        ${base}
        bottom: 16px;
        left: 16px;
      `;
    case 'topRight':
      return css`
        ${base}
        top: 16px;
        right: 16px;
      `;
    case 'topLeft':
      return css`
        ${base}
        top: 16px;
        left: 16px;
      `;
    case 'center':
      return css`
        ${base}
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
    default:
      return '';
  }
};

// Keyframes for pulse animation
const pulse = css`
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    }
  }
`;

// Styled components
const FabContainer = styled.button<{
  $color: string;
  $size: string;
  $variant: string;
  $position: string;
  $pulse: boolean;
  $enhanced: boolean;
  $zIndex: number;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${props => (props.$variant === 'extended' ? '28px' : '50%')};
  cursor: pointer;
  outline: none;
  user-select: none;
  z-index: ${props => props.$zIndex};
  transition: all 0.2s ease-in-out;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  box-sizing: border-box;

  /* Size styles */
  ${props => {
    const { width, height, padding, fontSize } = getSizeValues(props.$size, props.$variant);
    return css`
      width: ${width};
      height: ${height};
      padding: ${padding};
      font-size: ${fontSize};
    `;
  }}

  /* Position styles */
  ${props => getPositionStyles(props.$position)}
  
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

    // standard or extended
    return css`
      background-color: ${getColorByName(props.$color)};
      color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    `;
  }}
  
  /* Glass effect for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassSurface({
      elevation: 3,
      blurStrength: 'enhanced',
      backgroundOpacity: 'medium',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}
  
  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassGlow({
      intensity: props.$enhanced ? 'high' : 'medium',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Edge highlight for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    edgeHighlight({
      thickness: 1,
      opacity: 0.6,
      position: 'all',
      themeContext: createThemeContext({}),
    })}
  
  /* Pulse animation */
  ${pulse}
  ${props =>
    props.$pulse &&
    css`
      animation: pulse 1.5s infinite;
    `}
  
  /* Hover effect */
  &:hover {
    ${props =>
      props.$variant === 'glass'
        ? css`
            background-color: rgba(255, 255, 255, 0.15);
            transform: scale(1.05);
          `
        : css`
            background-color: ${getColorByName(props.$color)}dd;
            box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
          `}
  }

  /* Active effect */
  &:active {
    transform: scale(0.98);
  }

  /* Disabled state */
  &:disabled {
    ${props =>
      props.$variant === 'glass'
        ? css`
            background-color: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.4);
          `
        : css`
            background-color: #e2e8f0;
            color: #94a3b8;
            box-shadow: none;
          `}
    cursor: not-allowed;
    transform: none;
  }

  /* Entry animation */
  ${accessibleAnimation({
    animation: scaleUp,
    duration: 0.3,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  })}
`;

// Tooltip component
const Tooltip = styled.span`
  position: absolute;
  background-color: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  z-index: 1;

  /* Position based on parent position */
  ${props => {
    const parent = props.className;
    if (parent === 'bottomRight' || parent === 'bottomLeft') {
      return css`
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    if (parent === 'topRight' || parent === 'topLeft') {
      return css`
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    return css`
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
    `;
  }}
`;

// Wrapper component to handle tooltip
const FabWrapper = styled.div<{
  $position: string;
}>`
  position: ${props => (props.$position === 'none' ? 'relative' : 'static')};
  display: inline-block;

  &:hover ${Tooltip} {
    opacity: 1;
    visibility: visible;
  }
`;

/**
 * Fab Component
 *
 * A floating action button (FAB) performs the primary action in an application.
 */
export const Fab = forwardRef<HTMLButtonElement, FabProps>((props, ref) => {
  const {
    children,
    color = 'primary',
    disabled = false,
    href,
    size = 'medium',
    variant = 'standard',
    onClick,
    position = 'none',
    tooltip,
    pulse = false,
    className,
    enhanced = false,
    zIndex = 1050,
    type = 'button',
    ...rest
  } = props;

  // Determine component type
  const Component = href ? 'a' : 'button';

  const fabButton = (
    <FabContainer
      as={Component}
      ref={ref}
      href={href}
      disabled={disabled}
      onClick={onClick}
      type={href ? undefined : type}
      className={className}
      $color={color}
      $size={size}
      $variant={variant}
      $position={position}
      $pulse={pulse}
      $enhanced={enhanced}
      $zIndex={zIndex}
      {...rest}
    >
      {children}
    </FabContainer>
  );

  // If no tooltip, return just the button
  if (!tooltip) {
    return fabButton;
  }

  // Return button with tooltip
  return (
    <FabWrapper $position={position}>
      {fabButton}
      <Tooltip className={position}>{tooltip}</Tooltip>
    </FabWrapper>
  );
});

Fab.displayName = 'Fab';

/**
 * GlassFab Component
 *
 * A floating action button with glass morphism styling.
 */
export const GlassFab = forwardRef<HTMLButtonElement, FabProps>((props, ref) => {
  const { className, variant = 'glass', ...rest } = props;

  return <Fab ref={ref} className={`glass-fab ${className || ''}`} variant={variant} {...rest} />;
});

GlassFab.displayName = 'GlassFab';
