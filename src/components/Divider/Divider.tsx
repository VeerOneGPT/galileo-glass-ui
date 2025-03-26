/**
 * Divider Component
 *
 * A divider line that separates content vertically or horizontally
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';
import { createThemeContext } from '../../core/themeUtils';

/**
 * Divider props
 */
export interface DividerProps {
  /**
   * The orientation of the divider
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * The variant of the divider
   */
  variant?: 'fullWidth' | 'inset' | 'middle';

  /**
   * The text alignment for divider with text content
   */
  textAlign?: 'left' | 'center' | 'right';

  /**
   * The thickness of the divider
   */
  thickness?: number | string;

  /**
   * If true, applies glass effect to the divider
   */
  glass?: boolean;

  /**
   * If true, the divider will use a gradient instead of a solid color
   */
  gradient?: boolean;

  /**
   * The color of the divider
   */
  color?: string;

  /**
   * The opacity of the divider
   */
  opacity?: number;

  /**
   * The light opacity of the divider (for glass effect)
   */
  lightOpacity?: number;

  /**
   * The element to render as the component
   */
  component?: React.ElementType;

  /**
   * The role attribute of the divider element
   */
  role?: string;

  /**
   * If true, the divider will have a subtle animation when it appears
   */
  animated?: boolean;

  /**
   * Absolute position of the divider
   */
  absolute?: boolean;

  /**
   * Custom flexItem property
   */
  flexItem?: boolean;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * CSS inline style
   */
  style?: React.CSSProperties;

  /**
   * Children (for text divider)
   */
  children?: React.ReactNode;
}

/**
 * Get width or height based on orientation
 */
const getWidthOrHeight = (
  orientation: 'horizontal' | 'vertical',
  thickness?: number | string
): string => {
  if (thickness === undefined) {
    return orientation === 'horizontal' ? '1px' : '1px';
  }

  if (typeof thickness === 'number') {
    return `${thickness}px`;
  }

  return thickness.toString();
};

/**
 * Get inset margin based on variant
 */
const getInsetMargin = (variant: 'fullWidth' | 'inset' | 'middle'): string => {
  if (variant === 'inset') return '40px 0';
  if (variant === 'middle') return '0 16px';
  return '0';
};

/**
 * Get gradient style based on color and isDarkMode
 */
const getGradientStyle = (color: string, isDarkMode: boolean): string => {
  if (isDarkMode) {
    return `linear-gradient(90deg, rgba(0,0,0,0) 0%, ${color} 50%, rgba(0,0,0,0) 100%)`;
  }
  return `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${color} 50%, rgba(255,255,255,0) 100%)`;
};

/**
 * Styled divider component
 */
const DividerRoot = styled.hr<DividerProps & { theme: any }>`
  ${props => {
    const isDarkMode = props.theme?.palette?.mode === 'dark' || false;
    const orientation = props.orientation || 'horizontal';
    const variant = props.variant || 'fullWidth';
    const textAlign = props.textAlign || 'center';
    const thickness = getWidthOrHeight(orientation, props.thickness);
    const color = props.color || (isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)');
    const opacity = props.opacity !== undefined ? props.opacity : props.glass ? 0.2 : 1;
    const lightOpacity = props.lightOpacity || 0.05;

    return cssWithKebabProps`
      margin: 0;
      flex-shrink: 0;
      border: none;
      position: ${props.absolute ? 'absolute' : 'relative'};
      
      /* Glass effect */
      ${
        props.glass
          ? `
        background-color: ${
          isDarkMode
            ? `rgba(255, 255, 255, ${lightOpacity})`
            : `rgba(255, 255, 255, ${lightOpacity + 0.3})`
        };
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      `
          : `
        background-color: ${props.gradient ? 'transparent' : color};
        ${props.gradient ? `background-image: ${getGradientStyle(color, isDarkMode)};` : ''}
      `
      }
      
      /* Base styles based on orientation */
      ${
        orientation === 'horizontal'
          ? `
        height: ${thickness};
        margin: ${getInsetMargin(variant)};
        width: 100%;
        opacity: ${opacity};
      `
          : `
        height: 100%;
        width: ${thickness};
        margin: ${variant === 'inset' ? '0 16px' : '0'};
        opacity: ${opacity};
      `
      }
      
      /* If flexItem is true */
      ${
        props.flexItem
          ? `
        align-self: stretch;
        height: auto;
      `
          : ''
      }
      
      /* If has children (text divider) */
      ${
        props.children
          ? `
        display: flex;
        align-items: center;
        
        &::before, &::after {
          content: '';
          flex: 1;
          border-top: ${thickness} solid ${color};
          opacity: ${opacity};
        }
        
        &::before {
          margin-right: 16px;
          ${textAlign === 'right' ? 'flex: 9' : textAlign === 'left' ? 'flex: 0' : 'flex: 1'};
        }
        
        &::after {
          margin-left: 16px;
          ${textAlign === 'right' ? 'flex: 0' : textAlign === 'left' ? 'flex: 9' : 'flex: 1'};
        }
      `
          : ''
      }
      
      /* Animation */
      ${
        props.animated
          ? `
        transition: opacity 0.3s ease, transform 0.3s ease;
        ${
          orientation === 'horizontal'
            ? `
          transform-origin: center left;
          animation: dividerExpand 0.5s ease forwards;
          
          @keyframes dividerExpand {
            from {
              transform: scaleX(0);
              opacity: 0;
            }
            to {
              transform: scaleX(1);
              opacity: ${opacity};
            }
          }
        `
            : `
          transform-origin: top center;
          animation: dividerExpandVertical 0.5s ease forwards;
          
          @keyframes dividerExpandVertical {
            from {
              transform: scaleY(0);
              opacity: 0;
            }
            to {
              transform: scaleY(1);
              opacity: ${opacity};
            }
          }
        `
        }
      `
          : ''
      }
    `;
  }}
`;

/**
 * Divider component implementation
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(props, ref) {
  const {
    orientation = 'horizontal',
    variant = 'fullWidth',
    textAlign = 'center',
    thickness,
    glass = false,
    gradient = false,
    color,
    opacity,
    lightOpacity,
    component = 'hr',
    role = orientation === 'horizontal' ? 'separator' : undefined,
    animated = false,
    absolute = false,
    flexItem = false,
    className,
    style,
    children,
    ...rest
  } = props;

  // If there are children, render them with the divider
  if (children) {
    return (
      <DividerRoot
        as="div"
        ref={ref}
        orientation={orientation}
        variant={variant}
        textAlign={textAlign}
        thickness={thickness}
        glass={glass}
        gradient={gradient}
        color={color}
        opacity={opacity}
        lightOpacity={lightOpacity}
        role={role}
        animated={animated}
        absolute={absolute}
        flexItem={flexItem}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </DividerRoot>
    );
  }

  // Otherwise, render the simple divider
  return (
    <DividerRoot
      as={component}
      ref={ref}
      orientation={orientation}
      variant={variant}
      textAlign={textAlign}
      thickness={thickness}
      glass={glass}
      gradient={gradient}
      color={color}
      opacity={opacity}
      lightOpacity={lightOpacity}
      role={role}
      animated={animated}
      absolute={absolute}
      flexItem={flexItem}
      className={className}
      style={style}
      aria-orientation={orientation}
      {...rest}
    />
  );
});

export default Divider;
