/**
 * FocusIndicator Component
 *
 * A component that provides accessible focus indicators.
 */
import React, { forwardRef, useMemo } from 'react';
import styled from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
import { useMultiSpring } from '../../animations/physics/useMultiSpring';
import { SpringPresets, type SpringConfig } from '../../animations/physics/springPhysics';

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

// Styled components
const FocusWrapper = styled.div<{
  $glass: boolean;
  $highContrast: boolean;
}>`
  position: relative;
  display: inline-block;
  outline: none;
  will-change: box-shadow, outline, opacity;
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
    color: propColor,
    thickness: propThickness,
    style: propFocusStyle,
    glass = false,
    highContrast: propHighContrast,
    className,
    componentStyle,
    disableAnimation: propDisableAnimation,
    animationConfig: propAnimationConfig,
    ...rest
  } = props;

  // --- Get Context Defaults --- 
  const { defaultSpring } = useAnimationContext();
  const { 
      highContrast: contextHighContrast
  } = useAccessibilitySettings();

  // --- Determine Final Values --- 
  const finalFocusStyle = propFocusStyle ?? 'solid';
  const finalColor = propColor ?? 'primary';
  const finalThickness = propThickness ?? 2;
  const finalHighContrast = propHighContrast ?? contextHighContrast ?? false;
  
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(propDisableAnimation ?? prefersReducedMotion);

  // --- Calculate Spring Config --- 
  const finalSpringConfig = useMemo(() => {
    const baseConfig: SpringConfig = SpringPresets.STIFF;
    let contextResolvedConfig: Partial<SpringConfig> = {};
    if (typeof defaultSpring === 'object' && defaultSpring !== null) {
        contextResolvedConfig = defaultSpring;
    }
    let propResolvedConfig: Partial<SpringConfig> = {};
    if (typeof propAnimationConfig === 'string' && propAnimationConfig in SpringPresets) {
        propResolvedConfig = SpringPresets[propAnimationConfig as keyof typeof SpringPresets];
    } else if (typeof propAnimationConfig === 'object' && propAnimationConfig !== null) {
        propResolvedConfig = propAnimationConfig;
    }
    return { ...baseConfig, ...contextResolvedConfig, ...propResolvedConfig };
  }, [defaultSpring, propAnimationConfig]);

  // --- Define Animation Targets --- 
  const getTargets = () => {
    const rgbColor = colorToRgb(finalColor);
    const _hcColor = finalHighContrast ? '255, 255, 0' : rgbColor; // Yellow or original
    const hcOpacity = finalHighContrast ? 1 : 0.8;
    const shadowOpacity = finalHighContrast ? 1 : 0.5;

    if (!visible) {
      return {
          shadowSpread1: 0, shadowSpread2: 0, shadowOpacity: 0, 
          outlineWidth: 0, outlineOpacity: 0, 
      };
    }

    switch (finalFocusStyle) {
      case 'glow':
        return {
          shadowSpread1: finalThickness, shadowSpread2: finalThickness * 2, shadowOpacity: 0.4,
          outlineWidth: 0, outlineOpacity: 0,
        };
      case 'outline':
      case 'dashed':
      case 'dotted':
        return {
          shadowSpread1: 0, shadowSpread2: 0, shadowOpacity: 0,
          outlineWidth: finalThickness, outlineOpacity: hcOpacity,
        };
      case 'solid':
      default:
        return {
          shadowSpread1: finalThickness, shadowSpread2: 0, shadowOpacity: shadowOpacity,
          outlineWidth: 0, outlineOpacity: 0,
        };
    }
  };

  // --- Initialize Spring Hook --- 
  const { values: animatedValues, start: startFocusAnimation } = useMultiSpring({
    from: {
      shadowSpread1: 0,
      shadowSpread2: 0,
      shadowOpacity: 0,
      outlineWidth: 0,
      outlineOpacity: 0,
    },
    to: getTargets(),
    animationConfig: finalSpringConfig,
    immediate: !shouldAnimate,
  });

  // --- Construct Animated Style --- 
  const animatedStyle = useMemo(() => {
    const rgbColor = colorToRgb(finalColor);
    const hcColor = finalHighContrast ? '255, 255, 0' : rgbColor;
    const outlineStyle = finalFocusStyle === 'dashed' ? 'dashed' : (finalFocusStyle === 'dotted' ? 'dotted' : 'solid');

    const style: React.CSSProperties = {
        ...componentStyle,
        boxShadow: `0 0 0 ${animatedValues.shadowSpread1}px rgba(${rgbColor}, ${animatedValues.shadowOpacity * 0.5}), 0 0 ${animatedValues.shadowSpread2}px rgba(${rgbColor}, ${animatedValues.shadowOpacity})`,
        outline: `${animatedValues.outlineWidth}px ${outlineStyle} rgba(${hcColor}, ${animatedValues.outlineOpacity})`,
        outlineOffset: '2px',
    };
    
    // Add blur for glow + glass
    if (finalFocusStyle === 'glow' && glass) {
      style.backdropFilter = 'blur(4px)';
    }

    return style;
  }, [componentStyle, animatedValues, finalFocusStyle, finalColor, finalHighContrast, glass]);

  return (
    <FocusWrapper
      ref={ref}
      className={className}
      style={animatedStyle}
      $glass={glass}
      $highContrast={finalHighContrast}
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
