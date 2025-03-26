/**
 * DimensionalGlass Component
 *
 * A glass surface with enhanced depth and dimensional effects.
 */
import React, { forwardRef, useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { DimensionalGlassProps } from './types';

// Subtle floating animation
const float = keyframes`
  0% { transform: translateY(0px) translateZ(0); }
  50% { transform: translateY(-5px) translateZ(20px); }
  100% { transform: translateY(0px) translateZ(0); }
`;

// Styled components
const DimensionalContainer = styled.div<{
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
  $depth: number;
  $parallax: boolean;
  $dynamicShadow: boolean;
  $animate: boolean;
  $zIndex: number;
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
  z-index: ${props => props.$zIndex};

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

  /* Depth effect using transform and shadow */
  transform-style: preserve-3d;
  transform: ${props =>
    props.$animate && !props.$reducedMotion
      ? 'translateZ(0)'
      : props.$parallax && props.$isHovered
      ? `translateZ(${props.$depth * 20}px)`
      : `translateZ(0)`};

  /* Shadow based on depth */
  box-shadow: ${props =>
    props.$dynamicShadow && props.$isHovered
      ? `0 ${10 + props.$depth * 10}px ${20 + props.$depth * 20}px rgba(0, 0, 0, 0.3)`
      : `0 ${5 + props.$depth * 5}px ${10 + props.$depth * 10}px rgba(0, 0, 0, 0.2)`};

  /* Transition for interactive effects */
  transition: ${props =>
    !props.$reducedMotion ? 'transform 0.3s ease, box-shadow 0.3s ease' : 'none'};

  /* Animation if enabled */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    css`
      animation: ${float} 6s ease-in-out infinite;
    `}

  /* Interactive hover effect */
  ${props =>
    props.$interactive &&
    !props.$reducedMotion &&
    `
    &:hover {
      transform: translateZ(${props.$depth * 10}px);
      box-shadow: 0 ${10 + props.$depth * 5}px ${20 + props.$depth * 10}px rgba(0, 0, 0, 0.25);
    }
  `}
  
  /* Perspective effect for children */
  & > * {
    transform: translateZ(${props => props.$depth * 5}px);
  }
`;

// Inner content with enhanced depth
const DimensionalContent = styled.div<{
  $depth: number;
  $parallax: boolean;
  $isHovered: boolean;
  $reducedMotion: boolean;
}>`
  position: relative;
  z-index: 1;

  /* Parallax effect for children if enabled */
  ${props =>
    props.$parallax &&
    !props.$reducedMotion &&
    `
    transform: ${props.$isHovered ? `translateZ(${props.$depth * 10}px)` : 'translateZ(0)'};
    transition: transform 0.3s ease;
  `}
`;

/**
 * DimensionalGlass Component Implementation
 */
function DimensionalGlassComponent(
  props: DimensionalGlassProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
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
    depth = 0.5,
    parallax = true,
    dynamicShadow = true,
    animate = false,
    zIndex = 1,
    backgroundColor = 'rgba(255, 255, 255, 0.1)',
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // State for hover effects
  const [isHovered, setIsHovered] = useState(false);

  // Refs for parallax effect
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse events for parallax effect
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!parallax || !containerRef.current || prefersReducedMotion) return;

    // Calculate mouse position relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / (rect.height / 2)) * (depth * 5);
    const rotateY = ((centerX - x) / (rect.width / 2)) * (depth * 5);

    // Apply rotation transform
    if (containerRef.current) {
      containerRef.current.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        translateZ(${depth * 10}px)
      `;
    }
  };

  const handleMouseOut = () => {
    if (!parallax || !containerRef.current || prefersReducedMotion) return;

    // Reset transform when mouse leaves
    if (containerRef.current) {
      containerRef.current.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    }
  };

  // Use forwarded ref and local ref
  const setRefs = (element: HTMLDivElement) => {
    containerRef.current = element;

    // Handle the forwarded ref
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    }
  };

  return (
    <DimensionalContainer
      ref={setRefs}
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseOut={handleMouseOut}
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
      $depth={depth}
      $parallax={parallax}
      $dynamicShadow={dynamicShadow}
      $animate={animate}
      $zIndex={zIndex}
      $backgroundColor={backgroundColor}
      $isHovered={isHovered}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      <DimensionalContent
        $depth={depth}
        $parallax={parallax}
        $isHovered={isHovered}
        $reducedMotion={prefersReducedMotion}
      >
        {children}
      </DimensionalContent>
    </DimensionalContainer>
  );
}

/**
 * DimensionalGlass Component
 *
 * A glass surface with enhanced depth and dimensional effects.
 */
const DimensionalGlass = forwardRef(DimensionalGlassComponent);

export default DimensionalGlass;
