/**
 * Backdrop Component
 *
 * A backdrop component for modals, dialogs, and other overlays with glass effect
 */
import React, { forwardRef, useMemo, useEffect } from 'react';
import styled from 'styled-components';

// Physics/Animation Imports
import { useGalileoStateSpring, GalileoStateSpringOptions } from '../../hooks/useGalileoStateSpring';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringPresets, SpringConfig } from '../../animations/physics/springPhysics';
import { AnimationProps } from '../../animations/types';

import { cssWithKebabProps } from '../../core/cssUtils';
import { createThemeContext } from '../../core/themeUtils';

/**
 * Backdrop props
 */
export interface BackdropProps extends AnimationProps {
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
const BackdropRoot = styled.div<Omit<BackdropProps, 'animated' | 'animationDuration' | 'animationConfig' > & { theme: any, $effectiveOpacity: number }>`
  ${props => {
    const isDarkMode = props.theme?.palette?.mode === 'dark' || false;
    const blurValue = getBlurValue(props.blur);
    const defaultColor = isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)';
    const color = props.color || defaultColor;

    return cssWithKebabProps`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${props.zIndex || 1200};
      touch-action: none;
      pointer-events: ${props.open ? 'auto' : 'none'};
      
      /* Background styles */
      ${
        props.invisible
          ? `background-color: transparent;`
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
            opacity: ${props.$effectiveOpacity};
          `
          : `
            background-color: ${color};
            opacity: ${props.$effectiveOpacity};
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
      
      /* Animation - Removed CSS transition */
      will-change: opacity;
      
      /* Visibility controlled by conditional rendering and pointer-events */
      visibility: ${props.open || props.$effectiveOpacity > 0 ? 'visible' : 'hidden'};
      
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
    opacity: propOpacity,
    color,
    zIndex,
    invisible = false,
    animated = true,
    component = 'div',
    className,
    style,
    onClick,
    children,
    gradient = false,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const context = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();

  // Determine final animation state
  const finalDisableAnimation = disableAnimation ?? context.disableAnimation ?? prefersReducedMotion;
  const shouldAnimate = animated && !finalDisableAnimation;

  // Determine target opacity
  const targetOpacity = useMemo(() => {
      if (!open) return 0;
      if (invisible) return 0;
      if (propOpacity !== undefined) return propOpacity;
      // Default opacity based on glass/gradient
      return glass ? 0.6 : (gradient ? 1 : 0.8); // Gradient needs opacity 1
  }, [open, invisible, propOpacity, glass, gradient]);

  // Resolve spring config using AnimationProps
  const finalSpringConfig = useMemo(() => {
    const baseConfig = SpringPresets.DEFAULT;
    let resolvedContextConfig = {};
    // Use context defaultSpring
    const contextSource = context.defaultSpring;
    if (typeof contextSource === 'string' && contextSource in SpringPresets) {
      resolvedContextConfig = SpringPresets[contextSource as keyof typeof SpringPresets];
    } else if (typeof contextSource === 'object') {
      resolvedContextConfig = contextSource ?? {};
    }
    let propConfig = {};
    // Use animationConfig from props
    const propSource = animationConfig;
    if (typeof propSource === 'string' && propSource in SpringPresets) {
      propConfig = SpringPresets[propSource as keyof typeof SpringPresets];
    } else if (typeof propSource === 'object' && ('tension' in propSource || 'friction' in propSource)) {
      propConfig = propSource as Partial<SpringConfig>;
    }
    // Priority: Prop -> Context -> Base
    return { ...baseConfig, ...resolvedContextConfig, ...propConfig };
  }, [context.defaultSpring, animationConfig]);

  // Animation Hook
  const { value: animatedOpacity, isAnimating } = useGalileoStateSpring(
      open ? targetOpacity : 0,
      {
          ...finalSpringConfig,
          immediate: !shouldAnimate,
      }
  );

  // Only render if open or animating closed
  if (!open && !isAnimating) {
      return null;
  }

  return (
    <BackdropRoot
      as={component}
      ref={ref}
      open={open}
      glass={glass}
      blur={blur}
      color={color}
      zIndex={zIndex}
      invisible={invisible}
      className={className}
      style={{ ...style, opacity: animatedOpacity }}
      onClick={onClick}
      gradient={gradient}
      $effectiveOpacity={animatedOpacity}
      {...rest}
    >
      {children}
    </BackdropRoot>
  );
});

export default Backdrop;
