/**
 * AtmosphericBackground Component
 *
 * A dynamic background component with atmospheric effects.
 */
import React, { forwardRef, useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AtmosphericBackgroundProps } from '../surfaces/types';

// Animation keyframes
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const cloudMove = keyframes`
  0% {
    transform: translateX(-5%) translateY(0);
  }
  50% {
    transform: translateX(5%) translateY(-3%);
  }
  100% {
    transform: translateX(-5%) translateY(0);
  }
`;

// Default gradient colors
const defaultGradientColors = [
  'rgba(59, 130, 246, 0.5)', // Blue
  'rgba(99, 102, 241, 0.5)', // Indigo
  'rgba(139, 92, 246, 0.5)', // Purple
  'rgba(244, 114, 182, 0.5)', // Pink
];

// Styled components
const BackgroundContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const GradientLayer = styled.div<{
  $baseColor: string;
  $gradientColors: string[];
  $animate: boolean;
  $duration: number;
  $intensity: number;
  $reducedMotion: boolean;
  $interactive: boolean;
  $cursorX: number;
  $cursorY: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$baseColor};
  background-image: linear-gradient(125deg, ${props => props.$gradientColors.join(', ')});
  background-size: ${props => (props.$interactive ? '300% 300%' : '200% 200%')};
  background-position: ${props =>
    props.$interactive
      ? `${50 + (props.$cursorX - 50) * 0.2}% ${50 + (props.$cursorY - 50) * 0.2}%`
      : '0% 0%'};
  opacity: ${props => props.$intensity};

  /* Animation */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    !props.$interactive &&
    css`
      animation: ${css`${gradientShift} ${props.$duration}s ease infinite`};
    `}

  /* Interactive mode */
  ${props =>
    props.$interactive &&
    css`
      transition: background-position 0.3s ease;
    `}
`;

const AtmosphericEffect = styled.div<{
  $animate: boolean;
  $reducedMotion: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600' width='600' height='600' opacity='0.15'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.005' numOctaves='5' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)' opacity='0.15'/%3E%3C/svg%3E");
  background-size: cover;
  opacity: 0.4;
  mix-blend-mode: overlay;
  pointer-events: none;

  /* Animation */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    css`
      animation: ${css`${cloudMove} 30s ease infinite`};
    `}
`;

const BlurLayer = styled.div<{
  $blur: boolean;
  $blurAmount: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: ${props => (props.$blur ? `blur(${props.$blurAmount}px)` : 'none')};
  -webkit-backdrop-filter: ${props => (props.$blur ? `blur(${props.$blurAmount}px)` : 'none')};
  pointer-events: none;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

/**
 * AtmosphericBackground Component Implementation
 */
const AtmosphericBackgroundComponent = (
  props: AtmosphericBackgroundProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    children,
    className,
    style,
    baseColor = 'rgba(10, 10, 20, 0.8)',
    gradientColors = defaultGradientColors,
    intensity = 0.7,
    animate = true,
    animationDuration = 15,
    interactive = false,
    blur = false,
    blurAmount = 5,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // State for mouse position
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  // Ref for background container
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement for interactive mode
  useEffect(() => {
    if (!interactive || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      // Calculate mouse position as percentage
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive, prefersReducedMotion]);

  // Handle forwarded ref
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
    <BackgroundContainer ref={setRefs} className={className} style={style} {...rest}>
      <GradientLayer
        $baseColor={baseColor}
        $gradientColors={gradientColors}
        $animate={animate}
        $duration={animationDuration}
        $intensity={intensity}
        $reducedMotion={prefersReducedMotion}
        $interactive={interactive}
        $cursorX={mousePosition.x}
        $cursorY={mousePosition.y}
      />

      <AtmosphericEffect $animate={animate} $reducedMotion={prefersReducedMotion} />

      <BlurLayer $blur={blur} $blurAmount={blurAmount} />

      <ContentLayer>{children}</ContentLayer>
    </BackgroundContainer>
  );
};

/**
 * AtmosphericBackground Component
 *
 * A dynamic background component with atmospheric effects.
 */
const AtmosphericBackground = forwardRef(AtmosphericBackgroundComponent);
AtmosphericBackground.displayName = 'AtmosphericBackground';

export default AtmosphericBackground;
