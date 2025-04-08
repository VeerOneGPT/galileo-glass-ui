/**
 * VisualFeedback Component
 *
 * A component that provides visual feedback effects.
 */
import React, { forwardRef, useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';

import { VisualFeedbackProps } from './types';

// Animation keyframes
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(var(--feedback-color-rgb), 0.3); }
  50% { box-shadow: 0 0 15px rgba(var(--feedback-color-rgb), 0.6); }
  100% { box-shadow: 0 0 5px rgba(var(--feedback-color-rgb), 0.3); }
`;

const highlightAnimation = keyframes`
  0% { background-color: rgba(var(--feedback-color-rgb), 0); }
  50% { background-color: rgba(var(--feedback-color-rgb), 0.2); }
  100% { background-color: rgba(var(--feedback-color-rgb), 0); }
`;

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
    default:
      // If it's already an RGB value in format 'r, g, b'
      if (/^\d+,\s*\d+,\s*\d+$/.test(color)) {
        return color;
      }
      // Default color (white)
      return '255, 255, 255';
  }
};

// Styled components
const FeedbackContainer = styled.div<{
  $effect: 'ripple' | 'glow' | 'highlight' | 'pulse' | 'none';
  $active: boolean;
  $color: string;
  $duration: number;
  $glass: boolean;
  $intensity: number;
  $reducedMotion: boolean;
}>`
  position: relative;
  display: inline-block;
  overflow: ${props => (props.$effect === 'ripple' ? 'hidden' : 'visible')};

  /* Set CSS variable for the color */
  --feedback-color-rgb: ${props => colorToRgb(props.$color)};

  /* Animation based on effect type */
  ${props => {
    if (!props.$active || props.$effect === 'none' || props.$reducedMotion) {
      return '';
    }

    switch (props.$effect) {
      case 'pulse':
        return css`
          animation: ${css`${pulseAnimation} ${props.$duration}ms ease-in-out infinite`};
        `;
      case 'glow':
        return css`
          animation: ${css`${glowAnimation} ${props.$duration}ms ease-in-out infinite`};
        `;
      case 'highlight':
        return css`
          animation: ${css`${highlightAnimation} ${props.$duration}ms ease-in-out infinite`};
        `;
      default:
        return '';
    }
  }}

  /* Glass morphism effects */
  ${props =>
    props.$glass &&
    props.$active &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      backdrop-filter: blur(4px);
      pointer-events: none;
      z-index: 1;
      opacity: ${props.$intensity * 0.5};
      border-radius: inherit;
    }
  `}
`;

// Ripple effect styled component
const Ripple = styled.span<{
  $size: number;
  $x: number;
  $y: number;
  $color: string;
  $duration: number;
}>`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(var(--feedback-color-rgb), 0.3);
  transform: scale(0);
  animation: ripple ${props => props.$duration}ms linear;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

/**
 * VisualFeedback Component Implementation
 */
function VisualFeedbackComponent(
  props: VisualFeedbackProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    effect = 'highlight',
    active = false,
    color = 'primary',
    duration = 1000,
    glass = false,
    intensity = 0.5,
    className,
    style,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // State for ripple effect
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>(
    []
  );
  const rippleCount = useRef(0);

  // Handle ripple effect
  const handleRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    if (effect !== 'ripple' || !active || prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Add new ripple
    const id = rippleCount.current;
    rippleCount.current += 1;

    const newRipple = { id, x, y, size };
    setRipples(prevRipples => [...prevRipples, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(r => r.id !== id));
    }, duration);
  };

  // Clean up ripples when component unmounts
  useEffect(() => {
    return () => {
      setRipples([]);
    };
  }, []);

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
    <FeedbackContainer
      ref={setRefs}
      className={className}
      style={style}
      onClick={effect === 'ripple' ? handleRipple : undefined}
      $effect={effect}
      $active={active}
      $color={color}
      $duration={duration}
      $glass={glass}
      $intensity={intensity}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      {children}

      {/* Render ripples */}
      {effect === 'ripple' &&
        ripples.map(ripple => (
          <Ripple
            key={ripple.id}
            $size={ripple.size}
            $x={ripple.x}
            $y={ripple.y}
            $color={color}
            $duration={duration}
          />
        ))}
    </FeedbackContainer>
  );
}

/**
 * VisualFeedback Component
 *
 * A component that provides visual feedback effects.
 */
const VisualFeedback = forwardRef(VisualFeedbackComponent);

export default VisualFeedback;
