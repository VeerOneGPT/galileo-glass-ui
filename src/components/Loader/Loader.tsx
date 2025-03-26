import React, { forwardRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassGlow } from '../../core/mixins/glowEffects';

export interface LoaderProps {
  /**
   * The variant of the loader
   */
  variant?: 'circular' | 'linear' | 'dots' | 'pulse';
  
  /**
   * The size of the loader
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * The color of the loader
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  
  /**
   * The thickness of the loader (for circular and linear variants)
   */
  thickness?: number;
  
  /**
   * If true, apply glass styling
   */
  glass?: boolean;
  
  /**
   * Optional label for accessibility
   */
  label?: string;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

// Keyframes for the animations
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
`;

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const linearProgress = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
`;

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
      return '#6366F1'; // primary
  }
};

// Get size value in pixels
const getSizeValue = (size: string): number => {
  switch (size) {
    case 'small':
      return 24;
    case 'large':
      return 48;
    default: // medium
      return 36;
  }
};

// Styled components
const CircularLoaderContainer = styled.div<{
  $size: number;
  $color: string;
  $thickness: number;
  $glass: boolean;
}>`
  display: inline-block;
  position: relative;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  
  svg {
    animation: ${rotate} 2s linear infinite;
    width: 100%;
    height: 100%;
    
    circle {
      stroke: ${props => props.$color};
      stroke-width: ${props => props.$thickness};
      stroke-linecap: round;
      fill: none;
      animation: ${dash} 1.5s ease-in-out infinite;
      
      /* Glass effect for circle */
      ${props => {
        // Store the color value before using it in nested template
        const colorValue = props.$color;
        return props.$glass && css`
          filter: drop-shadow(0 0 3px ${colorValue}40);
        `;
      }}
    }
  }
  
  /* Glass glow effect */
  ${props => props.$glass && glassGlow({
    intensity: 'minimal',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
`;

const LinearLoaderContainer = styled.div<{
  $height: number;
  $color: string;
  $glass: boolean;
}>`
  position: relative;
  overflow: hidden;
  height: ${props => props.$height}px;
  width: 100%;
  background-color: ${props => `${props.$color}22`};
  border-radius: ${props => props.$height}px;
  
  &::before {
    content: '';
    position: absolute;
    background-color: ${props => props.$color};
    top: 0;
    height: 100%;
    animation: ${linearProgress} 2s infinite ease-in-out;
    border-radius: ${props => props.$height}px;
  }
  
  /* Glass effect */
  ${props => props.$glass && `
    &::before {
      box-shadow: 0 0 8px ${props.$color + '80'};
    }
  `}
  
  /* Glass glow effect */
  ${props => props.$glass && glassGlow({
    intensity: 'minimal',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
`;

const DotsLoaderContainer = styled.div<{
  $size: number;
  $color: string;
  $glass: boolean;
}>`
  display: inline-flex;
  align-items: center;
  
  span {
    width: ${props => props.$size / 3}px;
    height: ${props => props.$size / 3}px;
    margin: 0 2px;
    background-color: ${props => props.$color};
    border-radius: 50%;
    display: inline-block;
    animation: ${bounce} 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    /* Glass effect */
    ${props => props.$glass && `
      box-shadow: 0 0 6px ${props.$color + '80'};
    `}
  }
  
  /* Glass glow effect */
  ${props => props.$glass && glassGlow({
    intensity: 'minimal',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
`;

const PulseLoaderContainer = styled.div<{
  $size: number;
  $color: string;
  $glass: boolean;
}>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background-color: ${props => props.$color};
  border-radius: 50%;
  display: inline-block;
  animation: ${pulse} 1.5s ease-in-out infinite;
  
  /* Glass effect */
  ${props => props.$glass && `
    background-color: ${props.$color + 'CC'};
    box-shadow: 0 0 10px ${props.$color + '80'};
    backdrop-filter: blur(4px);
  `}
  
  /* Glass glow effect */
  ${props => props.$glass && glassGlow({
    intensity: props.$glass ? 'medium' : 'minimal',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
`;

/**
 * Loader Component
 * 
 * Component for displaying loading states
 */
export const Loader = forwardRef<HTMLDivElement, LoaderProps>((props, ref) => {
  const {
    variant = 'circular',
    size = 'medium',
    color = 'primary',
    thickness = 3.6,
    glass = false,
    label = 'Loading...',
    className,
    ...rest
  } = props;
  
  const colorValue = getColorByName(color);
  const sizeValue = getSizeValue(size);
  
  // Determine which loader to render based on variant
  const renderLoader = () => {
    switch (variant) {
      case 'circular':
        return (
          <CircularLoaderContainer
            ref={ref}
            aria-label={label}
            role="progressbar"
            className={className}
            $size={sizeValue}
            $color={colorValue}
            $thickness={thickness}
            $glass={glass}
            {...rest}
          >
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" />
            </svg>
          </CircularLoaderContainer>
        );
        
      case 'linear':
        return (
          <LinearLoaderContainer
            ref={ref}
            aria-label={label}
            role="progressbar"
            className={className}
            $height={thickness}
            $color={colorValue}
            $glass={glass}
            {...rest}
          />
        );
        
      case 'dots':
        return (
          <DotsLoaderContainer
            ref={ref}
            aria-label={label}
            role="progressbar"
            className={className}
            $size={sizeValue}
            $color={colorValue}
            $glass={glass}
            {...rest}
          >
            <span></span>
            <span></span>
            <span></span>
          </DotsLoaderContainer>
        );
        
      case 'pulse':
        return (
          <PulseLoaderContainer
            ref={ref}
            aria-label={label}
            role="progressbar"
            className={className}
            $size={sizeValue}
            $color={colorValue}
            $glass={glass}
            {...rest}
          />
        );
        
      default:
        return (
          <CircularLoaderContainer
            ref={ref}
            aria-label={label}
            role="progressbar"
            className={className}
            $size={sizeValue}
            $color={colorValue}
            $thickness={thickness}
            $glass={glass}
            {...rest}
          >
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" />
            </svg>
          </CircularLoaderContainer>
        );
    }
  };
  
  return renderLoader();
});

Loader.displayName = 'Loader';

/**
 * GlassLoader Component
 * 
 * A loader component with glass morphism styling.
 */
export const GlassLoader = forwardRef<HTMLDivElement, LoaderProps>((props, ref) => {
  const {
    className,
    glass = true,
    ...rest
  } = props;
  
  return (
    <Loader
      ref={ref}
      className={`glass-loader ${className || ''}`}
      glass={glass}
      {...rest}
    />
  );
});

GlassLoader.displayName = 'GlassLoader';