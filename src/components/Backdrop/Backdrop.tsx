/**
 * Backdrop Component
 *
 * A backdrop component for modals, dialogs, and other overlays with glass effect
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';
import { createThemeContext } from '../../core/themeUtils';

/**
 * Backdrop props
 */
export interface BackdropProps {
  /**
   * If true, the backdrop is open
   */
  open?: boolean;

  /**
   * If true, applies glass effect to the backdrop
   */
  glass?: boolean;

  /**
   * Blur strength for glass effect
   */
  blur?: 'none' | 'light' | 'medium' | 'strong' | number;

  /**
   * Opacity of the backdrop
   */
  opacity?: number;

  /**
   * Backdrop background color
   */
  color?: string;

  /**
   * Backdrop z-index
   */
  zIndex?: number;

  /**
   * If true, clicking the backdrop will call the onClick
   */
  invisible?: boolean;

  /**
   * If true, the backdrop will gradually fade in and out
   */
  animated?: boolean;

  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;

  /**
   * Component to use as the root
   */
  component?: React.ElementType;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * CSS inline style
   */
  style?: React.CSSProperties;

  /**
   * Function called when backdrop is clicked
   */
  onClick?: React.MouseEventHandler<HTMLDivElement>;

  /**
   * Children element(s)
   */
  children?: React.ReactNode;

  /**
   * Whether backdrop should use a light or dark gradient
   */
  gradient?: boolean | 'radial' | 'linear';
}

/**
 * Get blur value based on prop
 */
const getBlurValue = (blur?: 'none' | 'light' | 'medium' | 'strong' | number): string => {
  if (blur === undefined || blur === 'medium') return '8px';
  if (blur === 'none') return '0px';
  if (blur === 'light') return '4px';
  if (blur === 'strong') return '16px';
  return `${blur}px`;
};

/**
 * Styled backdrop component
 */
const BackdropRoot = styled.div<BackdropProps & { theme: any }>`
  ${props => {
    const isDarkMode = props.theme?.palette?.mode === 'dark' || false;
    const blurValue = getBlurValue(props.blur);
    const defaultOpacity = props.glass ? 0.6 : 0.8;
    const opacity = props.opacity !== undefined ? props.opacity : defaultOpacity;
    const defaultColor = isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)';
    const color = props.color || defaultColor;
    const animationDuration = props.animationDuration || 300;

    return cssWithKebabProps`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: ${props.open ? 'flex' : 'none'};
      align-items: center;
      justify-content: center;
      z-index: ${props.zIndex || 1200};
      touch-action: none;
      
      /* Background styles */
      ${
        props.invisible
          ? `
        background-color: transparent;
      `
          : props.gradient
          ? `
        ${
          props.gradient === 'radial'
            ? `background: radial-gradient(circle, ${
                isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(20, 20, 20, 0.85)'
              } 0%, ${isDarkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(0, 0, 0, 0.92)'} 100%);`
            : `background: linear-gradient(180deg, ${
                isDarkMode ? 'rgba(25, 25, 25, 0.85)' : 'rgba(20, 20, 20, 0.8)'
              } 0%, ${isDarkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(0, 0, 0, 0.9)'} 100%);`
        }
        opacity: ${opacity};
      `
          : `
        background-color: ${color};
        opacity: ${opacity};
      `
      }
      
      /* Glass effect */
      ${
        props.glass
          ? `
        backdrop-filter: blur(${blurValue});
        -webkit-backdrop-filter: blur(${blurValue});
      `
          : ''
      }
      
      /* Animation */
      ${
        props.animated
          ? `
        transition: opacity ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        
        ${
          !props.open
            ? `
          opacity: 0;
          visibility: hidden;
        `
            : `
          opacity: ${opacity};
          visibility: visible;
        `
        }
      `
          : ''
      }
      
      /* Ensure children are visible above backdrop */
      & > * {
        position: relative;
        z-index: 1;
      }
    `;
  }}
`;

/**
 * Backdrop component implementation
 */
export const Backdrop = forwardRef<HTMLDivElement, BackdropProps>(function Backdrop(props, ref) {
  const {
    open = false,
    glass = true,
    blur = 'medium',
    opacity,
    color,
    zIndex,
    invisible = false,
    animated = true,
    animationDuration = 300,
    component = 'div',
    className,
    style,
    onClick,
    children,
    gradient = false,
    ...rest
  } = props;

  return (
    <BackdropRoot
      as={component}
      ref={ref}
      open={open}
      glass={glass}
      blur={blur}
      opacity={opacity}
      color={color}
      zIndex={zIndex}
      invisible={invisible}
      animated={animated}
      animationDuration={animationDuration}
      className={className}
      style={style}
      onClick={onClick}
      gradient={gradient}
      {...rest}
    >
      {children}
    </BackdropRoot>
  );
});

export default Backdrop;
