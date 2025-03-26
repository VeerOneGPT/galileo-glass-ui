/**
 * StateIndicator Component
 *
 * A component that visually indicates the current state of a UI element.
 */
import React, { forwardRef } from 'react';
import styled, { keyframes } from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';

import { StateIndicatorProps } from './types';

// Animation keyframes
const pulseAnimation = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
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

// Get color for each state
const getStateColor = (state: string, color: string): string => {
  const userColor = colorToRgb(color);

  switch (state) {
    case 'hover':
      return `rgba(${userColor}, 0.15)`;
    case 'active':
      return `rgba(${userColor}, 0.3)`;
    case 'focus':
      return `rgba(${userColor}, 0.2)`;
    case 'disabled':
      return 'rgba(255, 255, 255, 0.1)';
    case 'loading':
      return `rgba(${userColor}, 0.2)`;
    case 'success':
      return 'rgba(76, 175, 80, 0.15)';
    case 'error':
      return 'rgba(240, 82, 82, 0.15)';
    case 'default':
    default:
      return 'transparent';
  }
};

// Styled components
const IndicatorContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const StateOverlay = styled.div<{
  $state: 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'success' | 'error';
  $glass: boolean;
  $blend: boolean;
  $intensity: number;
  $color: string;
  $duration: number;
  $reducedMotion: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: inherit;
  z-index: 1;
  background-color: ${props => getStateColor(props.$state, props.$color)};
  opacity: ${props => props.$intensity};
  mix-blend-mode: ${props => (props.$blend ? 'overlay' : 'normal')};

  /* Apply glass effect */
  ${props =>
    props.$glass &&
    `
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  `}

  /* Animate loading state */
  ${props =>
    props.$state === 'loading' &&
    !props.$reducedMotion &&
    `
    animation: ${pulseAnimation} ${props.$duration}ms infinite;
  `}
  
  /* Ensure proper stacking */
  ${props =>
    props.$state === 'disabled' &&
    `
    z-index: 5;
  `}
`;

/**
 * StateIndicator Component Implementation
 */
function StateIndicatorComponent(
  props: StateIndicatorProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    state = 'default',
    glass = false,
    blend = true,
    intensity = 0.7,
    color = 'primary',
    animationDuration = 1500,
    className,
    style,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  return (
    <IndicatorContainer ref={ref} className={className} style={style} {...rest}>
      {children}

      {state !== 'default' && (
        <StateOverlay
          $state={state}
          $glass={glass}
          $blend={blend}
          $intensity={intensity}
          $color={color}
          $duration={animationDuration}
          $reducedMotion={prefersReducedMotion}
        />
      )}
    </IndicatorContainer>
  );
}

/**
 * StateIndicator Component
 *
 * A component that visually indicates the current state of a UI element.
 */
const StateIndicator = forwardRef(StateIndicatorComponent);

export default StateIndicator;
