/**
 * FrostedGlass Component
 *
 * A glass surface with frosted ice effects.
 */
import React, { forwardRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { FrostedGlassProps } from './types';

// Frost animation keyframes
const frostGrow = keyframes`
  0% { background-size: 100% 100%; }
  50% { background-size: 105% 105%; }
  100% { background-size: 100% 100%; }
`;

// Frost sparkle animation
const frostSparkle = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 0.7; }
  100% { opacity: 0.3; }
`;

// Styled components
const FrostContainer = styled.div<{
  $elevation: number;
  $blurStrength: 'none' | 'light' | 'standard' | 'strong';
  $opacity: 'low' | 'medium' | 'high';
  $borderOpacity: 'none' | 'subtle' | 'light' | 'medium' | 'strong';
  $borderWidth: number;
  $fullWidth: boolean;
  $fullHeight: boolean;
  $borderRadius: number | string;
  $interactive: boolean;
  $padding: string | number;
  $intensity: number;
  $frostColor: string;
  $animate: boolean;
  $pattern: 'noise' | 'lines' | 'crystals';
  $backgroundColor: string;
  $isHovered: boolean;
  $reducedMotion: boolean;
}>`
  position: relative;
  display: block;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  height: ${props => (props.$fullHeight ? '100%' : 'auto')};
  border-radius: ${props =>
    typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  padding: ${props =>
    typeof props.$padding === 'number' ? `${props.$padding}px` : props.$padding};
  box-sizing: border-box;
  overflow: hidden;

  /* Apply glass surface effect */
  ${props =>
    glassSurface({
      elevation: props.$elevation,
      blurStrength: props.$blurStrength,
      borderOpacity: props.$borderOpacity,
      themeContext: createThemeContext(props.theme),
    })}

  /* Custom background color */
  background-color: ${props => props.$backgroundColor};

  /* Border */
  border-width: ${props => props.$borderWidth}px;
  border-style: solid;
  border-color: ${props => {
    switch (props.$borderOpacity) {
      case 'none':
        return 'transparent';
      case 'subtle':
        return 'rgba(255, 255, 255, 0.15)';
      case 'light':
        return 'rgba(255, 255, 255, 0.25)';
      case 'medium':
        return 'rgba(255, 255, 255, 0.35)';
      case 'strong':
        return 'rgba(255, 255, 255, 0.45)';
    }
  }};

  /* Frost overlay pattern */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    mix-blend-mode: overlay;
    opacity: ${props => 0.3 + props.$intensity * 0.5};

    ${props => {
      switch (props.$pattern) {
        case 'lines':
          return `
            background-image: 
              linear-gradient(90deg, ${props.$frostColor} 1px, transparent 1px),
              linear-gradient(${props.$frostColor} 1px, transparent 1px);
            background-size: 20px 20px;
          `;
        case 'crystals':
          return `
            background-image: radial-gradient(${props.$frostColor} 5%, transparent 5%), 
                            radial-gradient(${props.$frostColor} 5%, transparent 5%);
            background-size: 30px 30px;
            background-position: 0 0, 15px 15px;
          `;
        case 'noise':
        default:
          return `
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            background-size: 100px 100px;
          `;
      }
    }}

    /* Animation for frost pattern */
    ${props =>
      props.$animate &&
      !props.$reducedMotion &&
      css`
        animation: ${css`${frostGrow} 8s ease-in-out infinite`};
      `}
  }

  /* Ice frost edge effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    border-radius: inherit;
    box-shadow: inset 0 0 ${props => 5 + props.$intensity * 15}px ${props => props.$frostColor};
    opacity: ${props => 0.2 + props.$intensity * 0.3};
  }

  /* Interactive effects */
  ${props =>
    props.$interactive &&
    css`
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(255, 255, 255, 0.1);
        
        &::after {
          opacity: ${0.3 + props.$intensity * 0.4};
        }
      }
      
      &:active {
        transform: translateY(0);
      }
    `}
`;

const FrostContent = styled.div`
  position: relative;
  z-index: 1;
`;

const FrostSparkles = styled.div<{
  $animate: boolean;
  $frostColor: string;
  $intensity: number;
  $reducedMotion: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background-image: radial-gradient(${props => props.$frostColor} 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: ${props => props.$intensity * 0.4};

  /* Sparkle animation */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    css`
      animation: ${css`${frostSparkle} 4s ease-in-out infinite`};
    `}
`;

/**
 * FrostedGlass Component Implementation
 */
const FrostedGlassComponent = (
  props: FrostedGlassProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    children,
    className,
    style,
    elevation = 2,
    blurStrength = 'standard',
    opacity = 'medium',
    borderOpacity = 'medium',
    borderWidth = 1,
    fullWidth = false,
    fullHeight = false,
    borderRadius = 12,
    interactive = true,
    padding = 16,
    intensity = 0.5,
    frostColor = 'rgba(255, 255, 255, 0.8)',
    animate = true,
    pattern = 'noise',
    backgroundColor = 'rgba(255, 255, 255, 0.1)',
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // State for hover effects
  const [isHovered, setIsHovered] = useState(false);

  // Handle mouse events
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <FrostContainer
      ref={ref}
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      $elevation={elevation}
      $blurStrength={blurStrength}
      $opacity={opacity}
      $borderOpacity={borderOpacity}
      $borderWidth={borderWidth}
      $fullWidth={fullWidth}
      $fullHeight={fullHeight}
      $borderRadius={borderRadius}
      $interactive={interactive}
      $padding={padding}
      $intensity={intensity}
      $frostColor={frostColor}
      $animate={animate}
      $pattern={pattern}
      $backgroundColor={backgroundColor}
      $isHovered={isHovered}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      <FrostSparkles
        $animate={animate}
        $frostColor={frostColor}
        $intensity={intensity}
        $reducedMotion={prefersReducedMotion}
      />
      <FrostContent>{children}</FrostContent>
    </FrostContainer>
  );
};

/**
 * FrostedGlass Component
 *
 * A glass surface with frosted ice effects.
 */
const FrostedGlass = forwardRef(FrostedGlassComponent);
FrostedGlass.displayName = 'FrostedGlass';

export default FrostedGlass;
