/**
 * RippleButton Component
 *
 * A button component with ripple effect feedback.
 */
import React, { forwardRef, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../Button'; // Import base Button
import { ButtonProps } from '../Button/Button'; // Import ButtonProps from correct file

import { RippleButtonProps } from './types';

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

// Get ripple duration based on speed - Adjusted default
const getRippleDuration = (speed: string): number => {
  switch (speed) {
    case 'slow':
      return 900;
    case 'fast':
      return 400;
    case 'medium':
    default:
      return 300; // Shortened default duration further for better sync with physics
  }
};

// Styled components
// Wrapper to contain the button and ripples
const RippleWrapper = styled.div`
  position: relative;
  display: inline-block; // Or block if fullWidth
  overflow: hidden;
  // Match Button's border radius - Get it from theme or pass as prop if variable
  border-radius: 8px; 
  // Ensure wrapper matches button dimensions
  // This might require passing size/variant props to style correctly
  // or making Button's styles accessible here.
  // For now, assuming the wrapper takes the size of the Button child.
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
  pointer-events: none; // Ensure ripples don't interfere with button events
  z-index: 0; // Keep ripple behind button content

  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;

/**
 * RippleButton Component Implementation
 * Wraps the base Button component to add a ripple effect.
 */
function RippleButtonComponent(
  // Inherit ButtonProps and add Ripple-specific props
  props: RippleButtonProps & Omit<ButtonProps, 'onClick' | 'onMouseDown'>, 
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const {
    children,
    disabled = false,
    rippleColor = 'white',
    rippleSize: rippleSizeProp, // Rename prop to avoid conflict
    rippleSpeed = 'medium',
    centerRipple = false,
    onClick,
    onMouseDown, // Capture original onMouseDown
    // Extract Button props
    variant = 'contained',
    size = 'medium',
    color = 'primary',
    fullWidth = false,
    className,
    style,
    ...rest // Rest are Button props
  } = props;

  const prefersReducedMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleCount = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null); // Ref for the wrapper

  // Handle ripple creation on mouse down
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || prefersReducedMotion) {
        if (onMouseDown) onMouseDown(event); // Call original handler
        return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    let x, y;

    if (centerRipple) {
      x = rect.width / 2;
      y = rect.height / 2;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    const id = rippleCount.current++;
    const duration = getRippleDuration(rippleSpeed);
    
    // Start ripple animation
    setRipples(prev => [...prev, { id, x, y }]);

    // Schedule ripple removal after animation duration
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, duration);

    // Call the original onMouseDown handler if provided
    if (onMouseDown) {
        onMouseDown(event);
    }
  }, [disabled, prefersReducedMotion, centerRipple, rippleSpeed, onMouseDown]); // Added dependencies

  const rippleSizeValue = rippleSizeProp ? getRippleSize(rippleSizeProp) : getRippleSize(size); // Use prop or button size
  const rippleDuration = getRippleDuration(rippleSpeed);
  const rippleColorRgb = colorToRgb(rippleColor);

  return (
    // Apply ripple color CSS variable to the wrapper
    <RippleWrapper 
        ref={wrapperRef} 
        style={{ "--ripple-color-rgb": rippleColorRgb } as React.CSSProperties}
        className={className} // Pass className to wrapper for styling
    >
      <Button
        ref={ref} // Forward the ref to the underlying Button
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
        // className={className} // Don't pass className here if it's on the wrapper
        style={style} // Pass style to Button
        onClick={onClick} // Pass original onClick
        onMouseDown={handleMouseDown} // Use our wrapper mouse down
        {...rest} // Pass rest of Button props
      >
        {children}
      </Button>

      {/* Render ripples */}
      {!prefersReducedMotion && ripples.map(ripple => (
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
          $reducedMotion={prefersReducedMotion} // Pass reduced motion state
        />
      ))}
    </RippleWrapper>
  );
}

/**
 * RippleButton Component
 *
 * A button component that wraps the base Button to add a ripple effect feedback.
 * It inherits physics interactions from the base Button.
 */
const RippleButton = forwardRef(RippleButtonComponent);

export default RippleButton;
