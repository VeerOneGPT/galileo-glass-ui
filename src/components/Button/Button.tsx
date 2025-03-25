import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';

// Button props interface
export interface ButtonProps {
  /**
   * The content of the button
   */
  children: React.ReactNode;
  
  /**
   * The variant of the button
   */
  variant?: 'contained' | 'outlined' | 'text';
  
  /**
   * The color of the button
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  
  /**
   * If true, the button will be disabled
   */
  disabled?: boolean;
  
  /**
   * The size of the button
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Additional CSS class name
   */
  className?: string;
}

// Styled button with glass effects
const StyledButton = styled.button<{
  $variant: 'contained' | 'outlined' | 'text';
  $color: string;
  $disabled: boolean;
  $size: string;
}>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: 0;
  border: 0;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  user-select: none;
  vertical-align: middle;
  text-decoration: none;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  border-radius: 4px;
  
  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 6px 16px;
          font-size: 0.8125rem;
          min-height: 32px;
        `;
      case 'large':
        return `
          padding: 10px 22px;
          font-size: 0.9375rem;
          min-height: 44px;
        `;
      default: // medium
        return `
          padding: 8px 20px;
          font-size: 0.875rem;
          min-height: 40px;
        `;
    }
  }}
  
  /* Glass effect styles for contained variant */
  ${props => props.$variant === 'contained' && !props.$disabled && glassSurface({
    elevation: 2,
    blurStrength: 'standard',
    backgroundOpacity: 'medium',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({}) // In real usage, this would use props.theme
  })}
  
  /* Disabled state */
  ${props => props.$disabled && `
    opacity: 0.5;
    pointer-events: none;
  `}
  
  /* Variant + color styles */
  ${props => {
    if (props.$variant === 'contained') {
      switch (props.$color) {
        case 'primary':
          return `
            background-color: #6366F1;
            color: white;
          `;
        case 'secondary':
          return `
            background-color: #8B5CF6;
            color: white;
          `;
        case 'success':
          return `
            background-color: #10B981;
            color: white;
          `;
        case 'error':
          return `
            background-color: #EF4444;
            color: white;
          `;
        case 'warning':
          return `
            background-color: #F59E0B;
            color: white;
          `;
        case 'info':
          return `
            background-color: #3B82F6;
            color: white;
          `;
        default:
          return `
            background-color: rgba(75, 85, 99, 0.8);
            color: white;
          `;
      }
    } else if (props.$variant === 'outlined') {
      switch (props.$color) {
        case 'primary':
          return `
            border: 1px solid #6366F1;
            color: #6366F1;
            background-color: transparent;
          `;
        case 'secondary':
          return `
            border: 1px solid #8B5CF6;
            color: #8B5CF6;
            background-color: transparent;
          `;
        case 'success':
          return `
            border: 1px solid #10B981;
            color: #10B981;
            background-color: transparent;
          `;
        case 'error':
          return `
            border: 1px solid #EF4444;
            color: #EF4444;
            background-color: transparent;
          `;
        case 'warning':
          return `
            border: 1px solid #F59E0B;
            color: #F59E0B;
            background-color: transparent;
          `;
        case 'info':
          return `
            border: 1px solid #3B82F6;
            color: #3B82F6;
            background-color: transparent;
          `;
        default:
          return `
            border: 1px solid rgba(75, 85, 99, 0.8);
            color: rgba(75, 85, 99, 0.8);
            background-color: transparent;
          `;
      }
    } else { // text variant
      switch (props.$color) {
        case 'primary':
          return `
            color: #6366F1;
            background-color: transparent;
          `;
        case 'secondary':
          return `
            color: #8B5CF6;
            background-color: transparent;
          `;
        case 'success':
          return `
            color: #10B981;
            background-color: transparent;
          `;
        case 'error':
          return `
            color: #EF4444;
            background-color: transparent;
          `;
        case 'warning':
          return `
            color: #F59E0B;
            background-color: transparent;
          `;
        case 'info':
          return `
            color: #3B82F6;
            background-color: transparent;
          `;
        default:
          return `
            color: rgba(75, 85, 99, 0.8);
            background-color: transparent;
          `;
      }
    }
  }}
  
  /* Hover styles */
  ${props => !props.$disabled && `
    transition: all 0.2s ease-in-out;
    
    &:hover {
      filter: brightness(1.1);
    }
    
    &:active {
      transform: translateY(1px);
    }
  `}
`;

/**
 * Button Component
 * 
 * A flexible button component with multiple variants and colors.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    children,
    variant = 'contained',
    color = 'primary',
    disabled = false,
    size = 'medium',
    onClick,
    className,
    ...rest
  } = props;
  
  return (
    <StyledButton
      ref={ref}
      className={className}
      $variant={variant}
      $color={color}
      $disabled={disabled}
      $size={size}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </StyledButton>
  );
});

Button.displayName = 'Button';

/**
 * GlassButton Component
 * 
 * A button component with glass morphism styling.
 */
export const GlassButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    children,
    variant = 'contained',
    color = 'primary',
    disabled = false,
    size = 'medium',
    onClick,
    className,
    ...rest
  } = props;
  
  // Add glass styling to the base button
  return (
    <Button
      ref={ref}
      variant={variant}
      color={color}
      disabled={disabled}
      size={size}
      onClick={onClick}
      className={`glass-button ${className || ''}`}
      {...rest}
    >
      {children}
    </Button>
  );
});

GlassButton.displayName = 'GlassButton';