/**
 * RippleButton Component
 *
 * A button component with ripple effect feedback.
 */
import React, { forwardRef, useState, useRef } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { RippleButtonProps } from './types';

// Get color values based on theme color
const getColorValues = (
  color: string,
  variant: string
): { bg: string; border: string; text: string; hoverBg: string; activeBg: string } => {
  let bg, border, text, hoverBg, activeBg;

  switch (color) {
    case 'primary':
      bg = variant === 'contained' ? 'rgba(99, 102, 241, 0.9)' : 'transparent';
      border = 'rgba(99, 102, 241, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(99, 102, 241, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(79, 82, 221, 0.9)' : 'rgba(99, 102, 241, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(69, 72, 211, 0.9)' : 'rgba(99, 102, 241, 0.15)';
      break;
    case 'secondary':
      bg = variant === 'contained' ? 'rgba(156, 39, 176, 0.9)' : 'transparent';
      border = 'rgba(156, 39, 176, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(156, 39, 176, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(136, 19, 156, 0.9)' : 'rgba(156, 39, 176, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(116, 9, 136, 0.9)' : 'rgba(156, 39, 176, 0.15)';
      break;
    case 'error':
      bg = variant === 'contained' ? 'rgba(240, 82, 82, 0.9)' : 'transparent';
      border = 'rgba(240, 82, 82, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(240, 82, 82, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(220, 62, 62, 0.9)' : 'rgba(240, 82, 82, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(200, 42, 42, 0.9)' : 'rgba(240, 82, 82, 0.15)';
      break;
    case 'info':
      bg = variant === 'contained' ? 'rgba(3, 169, 244, 0.9)' : 'transparent';
      border = 'rgba(3, 169, 244, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(3, 169, 244, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(0, 149, 224, 0.9)' : 'rgba(3, 169, 244, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(0, 129, 204, 0.9)' : 'rgba(3, 169, 244, 0.15)';
      break;
    case 'success':
      bg = variant === 'contained' ? 'rgba(76, 175, 80, 0.9)' : 'transparent';
      border = 'rgba(76, 175, 80, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(76, 175, 80, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(56, 155, 60, 0.9)' : 'rgba(76, 175, 80, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(36, 135, 40, 0.9)' : 'rgba(76, 175, 80, 0.15)';
      break;
    case 'warning':
      bg = variant === 'contained' ? 'rgba(255, 152, 0, 0.9)' : 'transparent';
      border = 'rgba(255, 152, 0, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 152, 0, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(235, 132, 0, 0.9)' : 'rgba(255, 152, 0, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(215, 112, 0, 0.9)' : 'rgba(255, 152, 0, 0.15)';
      break;
    case 'default':
    default:
      bg = variant === 'contained' ? 'rgba(66, 66, 66, 0.9)' : 'transparent';
      border = 'rgba(255, 255, 255, 0.23)';
      text = 'rgba(255, 255, 255, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(80, 80, 80, 0.9)' : 'rgba(255, 255, 255, 0.08)';
      activeBg = variant === 'contained' ? 'rgba(90, 90, 90, 0.9)' : 'rgba(255, 255, 255, 0.12)';
  }

  return { bg, border, text, hoverBg, activeBg };
};

// Convert color string to RGB values
const colorToRgb = (color: string): string => {
  // Convert named colors to their RGB values
  switch (color) {
    case 'primary':
      return '99, 102, 241'; // Indigo
    case 'secondary':
      return '156, 39, 176'; // Purple
    case 'error':
      return '240, 82, 82'; // Red
    case 'info':
      return '3, 169, 244'; // Light Blue
    case 'success':
      return '76, 175, 80'; // Green
    case 'warning':
      return '255, 152, 0'; // Orange
    case 'white':
      return '255, 255, 255';
    default:
      // If it's already an RGB value in format 'r, g, b'
      if (/^\d+,\s*\d+,\s*\d+$/.test(color)) {
        return color;
      }
      // Default color (white)
      return '255, 255, 255';
  }
};

// Get ripple size based on button size
const getRippleSize = (size: string): number => {
  switch (size) {
    case 'small':
      return 100;
    case 'large':
      return 200;
    case 'medium':
    default:
      return 150;
  }
};

// Get ripple duration based on speed
const getRippleDuration = (speed: string): number => {
  switch (speed) {
    case 'slow':
      return 1000;
    case 'fast':
      return 400;
    case 'medium':
    default:
      return 650;
  }
};

// Styled components
const ButtonRoot = styled.button<{
  $variant: 'text' | 'outlined' | 'contained';
  $size: 'small' | 'medium' | 'large';
  $color: string;
  $colorValues: { bg: string; border: string; text: string; hoverBg: string; activeBg: string };
  $fullWidth: boolean;
  $glass: boolean;
  $rippleColor: string;
  $disabled: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  outline: 0;
  border: 0;
  margin: 0;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  vertical-align: middle;
  text-decoration: none;
  font-weight: 500;
  font-size: ${props =>
    props.$size === 'small' ? '0.8125rem' : props.$size === 'large' ? '0.9375rem' : '0.875rem'};
  line-height: 1.75;
  min-width: 64px;
  padding: ${props =>
    props.$size === 'small' ? '4px 10px' : props.$size === 'large' ? '8px 22px' : '6px 16px'};
  border-radius: 4px;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  overflow: hidden;

  /* Base styling based on variant */
  background-color: ${props => props.$colorValues.bg};
  color: ${props => props.$colorValues.text};

  /* Border styling */
  border: ${props =>
    props.$variant === 'outlined' ? `1px solid ${props.$colorValues.border}` : 'none'};

  /* Glass styling */
  ${props =>
    props.$glass &&
    glassSurface({
      elevation: props.$variant === 'contained' ? 2 : 1,
      blurStrength: props.$variant === 'contained' ? 'standard' : 'light',
      borderOpacity: props.$variant === 'outlined' ? 'medium' : 'subtle',
      themeContext: createThemeContext(props.theme),
    })}

  /* Glass variant additional styling */
  ${props =>
    props.$glass &&
    props.$variant === 'contained' &&
    `
    background-color: rgba(255, 255, 255, 0.1);
  `}
  
  ${props =>
    props.$glass &&
    props.$variant === 'outlined' &&
    `
    border: 1px solid rgba(255, 255, 255, 0.23);
  `}
  
  /* Transitions */
  transition: background-color 0.3s, border-color 0.3s, color 0.3s, box-shadow 0.3s;

  /* Hover state */
  &:hover {
    ${props =>
      !props.$disabled &&
      `
      background-color: ${props.$colorValues.hoverBg};
      ${props.$variant === 'outlined' ? `border-color: ${props.$colorValues.border};` : ''}
    `}
  }

  /* Active state */
  &:active {
    ${props =>
      !props.$disabled &&
      `
      background-color: ${props.$colorValues.activeBg};
    `}
  }

  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    color: rgba(255, 255, 255, 0.4);
    background-color: ${props.$variant === 'contained' ? 'rgba(50, 50, 50, 0.5)' : 'transparent'};
    border-color: ${props.$variant === 'outlined' ? 'rgba(255, 255, 255, 0.12)' : 'transparent'};
    pointer-events: none;
    box-shadow: none;
    opacity: 0.6;
  `}

  /* Set CSS variable for ripple color */
  --ripple-color-rgb: ${props => colorToRgb(props.$rippleColor)};
`;

// Ripple effect styled component
const Ripple = styled.span<{
  $size: number;
  $x: number;
  $y: number;
  $duration: number;
  $reducedMotion: boolean;
}>`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(var(--ripple-color-rgb), 0.3);
  transform: scale(0);
  animation: ${props =>
    props.$reducedMotion ? 'none' : `ripple ${props.$duration}ms ease-out forwards`};

  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;

/**
 * RippleButton Component Implementation
 */
function RippleButtonComponent(
  props: RippleButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const {
    children,
    disabled = false,
    rippleColor = 'white',
    rippleSize = 'medium',
    rippleSpeed = 'medium',
    centerRipple = false,
    glass = false,
    onClick,
    variant = 'contained',
    size = 'medium',
    color = 'primary',
    fullWidth = false,
    className,
    style,
    type = 'button',
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Get color values
  const colorValues = getColorValues(color, variant);

  // State for ripples
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleCount = useRef(0);

  // Reference to the button element
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click and ripple effect
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || prefersReducedMotion) {
      if (onClick) onClick(event);
      return;
    }

    const button = buttonRef.current;
    if (!button) return;

    // Calculate ripple position
    const rect = button.getBoundingClientRect();
    let x, y;

    if (centerRipple) {
      x = rect.width / 2;
      y = rect.height / 2;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    // Add new ripple
    const id = rippleCount.current;
    rippleCount.current += 1;

    setRipples(prevRipples => [...prevRipples, { id, x, y }]);

    // Remove ripple after animation
    const duration = getRippleDuration(rippleSpeed);
    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(r => r.id !== id));
    }, duration);

    // Call the original onClick handler
    if (onClick) onClick(event);
  };

  // Handle forwarded ref
  const setRefs = (element: HTMLButtonElement) => {
    buttonRef.current = element;

    // Handle the forwarded ref
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLButtonElement | null>).current = element;
    }
  };

  // Get ripple parameters
  const rippleSizeValue = getRippleSize(rippleSize);
  const rippleDuration = getRippleDuration(rippleSpeed);

  return (
    <ButtonRoot
      ref={setRefs}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      style={style}
      $variant={variant}
      $size={size}
      $color={color}
      $colorValues={colorValues}
      $fullWidth={fullWidth}
      $glass={glass}
      $rippleColor={rippleColor}
      $disabled={disabled}
      {...rest}
    >
      {children}

      {/* Render ripples */}
      {ripples.map(ripple => (
        <Ripple
          key={ripple.id}
          style={{
            left: ripple.x - rippleSizeValue / 2,
            top: ripple.y - rippleSizeValue / 2,
            width: rippleSizeValue,
            height: rippleSizeValue,
          }}
          $size={rippleSizeValue}
          $x={ripple.x}
          $y={ripple.y}
          $duration={rippleDuration}
          $reducedMotion={prefersReducedMotion}
        />
      ))}
    </ButtonRoot>
  );
}

/**
 * RippleButton Component
 *
 * A button component with ripple effect feedback.
 */
const RippleButton = forwardRef(RippleButtonComponent);

export default RippleButton;
