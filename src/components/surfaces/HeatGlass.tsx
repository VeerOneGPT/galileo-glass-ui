/**
 * HeatGlass Component
 *
 * A glass surface with heat distortion effects.
 */
import React, { forwardRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { HeatGlassProps } from './types';

// Heat distortion animation
const heatDistort = keyframes`
  0% {
    filter: url('#heat-distortion-0');
  }
  25% {
    filter: url('#heat-distortion-25');
  }
  50% {
    filter: url('#heat-distortion-50');
  }
  75% {
    filter: url('#heat-distortion-75');
  }
  100% {
    filter: url('#heat-distortion-0');
  }
`;

// Heat glow pulse animation
const heatGlow = keyframes`
  0% {
    box-shadow: 0 0 10px 0 rgba(255, 100, 50, 0.5);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(255, 100, 50, 0.7);
  }
  100% {
    box-shadow: 0 0 10px 0 rgba(255, 100, 50, 0.5);
  }
`;

// Styled components
const HeatGlassContainer = styled.div<{
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
  $heatColor: string;
  $heatCenter: string;
  $animate: boolean;
  $animationSpeed: number;
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
        return 'rgba(255, 255, 255, 0.1)';
      case 'light':
        return 'rgba(255, 255, 255, 0.2)';
      case 'medium':
        return 'rgba(255, 255, 255, 0.3)';
      case 'strong':
        return 'rgba(255, 255, 255, 0.4)';
    }
  }};

  /* Heat effect glow */
  box-shadow: 0 0 ${props => 10 + props.$intensity * 10}px ${props => props.$intensity * 5}px
    ${props => props.$heatColor};

  /* Heat animation */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    css`
      animation: ${css`${heatGlow} ${6 / props.$animationSpeed}s infinite`};
    `}

  /* Hover interactions */
  ${props =>
    props.$interactive &&
    css`
      cursor: pointer;
      transition: box-shadow 0.3s ease, transform 0.3s ease;
      
      &:hover {
        box-shadow: 0 0 ${15 + props.$intensity * 15}px ${props.$intensity * 10}px ${
      props.$heatColor
    };
        transform: translateY(-2px);
      }
      
      &:active {
        transform: translateY(0);
      }
    `}
  
  /* Heat radial gradient background enhancement */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at ${props => props.$heatCenter},
      ${props => props.$heatColor} 0%,
      transparent 70%
    );
    opacity: ${props => props.$intensity * 0.3};
    pointer-events: none;
    border-radius: inherit;
    z-index: -1;
  }
`;

const HeatContent = styled.div<{
  $animate: boolean;
  $animationSpeed: number;
  $intensity: number;
  $reducedMotion: boolean;
}>`
  position: relative;
  z-index: 1;

  /* Heat distortion effect */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    css`
      animation: ${css`${heatDistort} ${6 / props.$animationSpeed}s infinite ease-in-out`};
      animation-delay: ${Math.random() * 2}s;
      will-change: filter;
    `}
`;

// SVG filters for heat distortion effect
const HeatDistortionFilters = () => (
  <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
    <defs>
      <filter id="heat-distortion-0">
        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" seed="0" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
      <filter id="heat-distortion-25">
        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
      <filter id="heat-distortion-50">
        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" seed="2" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
      <filter id="heat-distortion-75">
        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
    </defs>
  </svg>
);

/**
 * HeatGlass Component
 *
 * A glass surface with heat distortion effects.
 */
const HeatGlassComponent = (
  props: HeatGlassProps,
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
    heatColor = 'rgba(255, 100, 50, 0.7)',
    heatCenter = '50% 50%',
    animate = true,
    animationSpeed = 1,
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
    <>
      {/* SVG Filters for heat distortion */}
      {animate && !prefersReducedMotion && <HeatDistortionFilters />}

      <HeatGlassContainer
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
        $heatColor={heatColor}
        $heatCenter={heatCenter}
        $animate={animate}
        $animationSpeed={animationSpeed}
        $backgroundColor={backgroundColor}
        $isHovered={isHovered}
        $reducedMotion={prefersReducedMotion}
        {...rest}
      >
        <HeatContent
          $animate={animate}
          $animationSpeed={animationSpeed}
          $intensity={intensity}
          $reducedMotion={prefersReducedMotion}
        >
          {children}
        </HeatContent>
      </HeatGlassContainer>
    </>
  );
};

// Wrap the component function with forwardRef
const HeatGlass = forwardRef(HeatGlassComponent);
HeatGlass.displayName = 'HeatGlass';

export default HeatGlass;
