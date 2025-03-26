/**
 * FocusIndicator Component
 *
 * A component that provides accessible focus indicators.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { FocusIndicatorProps } from './types';

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

// Get focus style based on type
const getFocusStyle = (
  style: string,
  thickness: number,
  color: string,
  highContrast: boolean,
  glass: boolean
): string => {
  const rgbColor = colorToRgb(color);
  const highContrastColor = highContrast ? '255, 255, 0' : rgbColor; // Yellow for high contrast

  switch (style) {
    case 'dashed':
      return `
        outline: ${thickness}px dashed rgba(${highContrastColor}, ${highContrast ? 1 : 0.8});
        outline-offset: 2px;
      `;
    case 'dotted':
      return `
        outline: ${thickness}px dotted rgba(${highContrastColor}, ${highContrast ? 1 : 0.8});
        outline-offset: 2px;
      `;
    case 'glow':
      return `
        box-shadow: 0 0 0 ${thickness}px rgba(${rgbColor}, 0.2), 0 0 ${
        thickness * 2
      }px rgba(${rgbColor}, 0.4);
        ${glass ? 'backdrop-filter: blur(4px);' : ''}
      `;
    case 'outline':
      return `
        outline: ${thickness}px solid rgba(${highContrastColor}, ${highContrast ? 1 : 0.8});
        outline-offset: 2px;
      `;
    case 'solid':
    default:
      return `
        box-shadow: 0 0 0 ${thickness}px rgba(${highContrastColor}, ${highContrast ? 1 : 0.5});
      `;
  }
};

// Styled components
const FocusWrapper = styled.div<{
  $visible: boolean;
  $style: 'solid' | 'dashed' | 'dotted' | 'outline' | 'glow';
  $thickness: number;
  $color: string;
  $glass: boolean;
  $highContrast: boolean;
}>`
  position: relative;
  display: inline-block;

  /* Focus styling */
  ${props =>
    props.$visible &&
    getFocusStyle(props.$style, props.$thickness, props.$color, props.$highContrast, props.$glass)}

  /* Transition for smoother appearance */
  transition: outline 0.2s ease, box-shadow 0.2s ease;

  /* High-contrast focus indicator overlay for glass effect */
  ${props =>
    props.$visible &&
    props.$glass &&
    props.$highContrast &&
    `
    &::after {
      content: '';
      position: absolute;
      top: -${props.$thickness * 2}px;
      left: -${props.$thickness * 2}px;
      right: -${props.$thickness * 2}px;
      bottom: -${props.$thickness * 2}px;
      border-radius: inherit;
      pointer-events: none;
      z-index: 1;
      box-shadow: 0 0 0 ${props.$thickness}px rgba(255, 255, 0, 0.5);
    }
  `}
`;

/**
 * FocusIndicator Component Implementation
 */
function FocusIndicatorComponent(
  props: FocusIndicatorProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    visible = false,
    color = 'primary',
    thickness = 2,
    style: focusStyle = 'solid',
    glass = false,
    highContrast = false,
    className,
    componentStyle,
    ...rest
  } = props;

  return (
    <FocusWrapper
      ref={ref}
      className={className}
      style={componentStyle}
      $visible={visible}
      $style={focusStyle}
      $thickness={thickness}
      $color={color}
      $glass={glass}
      $highContrast={highContrast}
      {...rest}
    >
      {children}
    </FocusWrapper>
  );
}

/**
 * FocusIndicator Component
 *
 * A component that provides accessible focus indicators.
 */
const FocusIndicator = forwardRef(FocusIndicatorComponent);

export default FocusIndicator;
