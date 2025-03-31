/**
 * WidgetGlass Component
 *
 * A specialized glass component for UI widgets with enhanced effects.
 */
import React, { forwardRef, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import DimensionalGlass from './DimensionalGlass';

import { WidgetGlassProps } from './types';

// Animation keyframes
const enterAnimation = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const pulseHighlight = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

/**
 * WidgetGlass Component Implementation
 */
const WidgetGlassComponent = (
  props: WidgetGlassProps,
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
    widgetType = 'card',
    highlightOnHover = true,
    animateOnMount = true,
    priority = 'medium',
    backgroundColor = 'rgba(255, 255, 255, 0.1)',
    ...rest
  } = props;

  return (
    <DimensionalGlass
      ref={ref}
      className={className}
      style={style}
      elevation={elevation}
      blurStrength={blurStrength}
      borderOpacity={borderOpacity}
      borderWidth={borderWidth}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      borderRadius={borderRadius}
      interactive={interactive}
      padding={padding}
      depth={priority === 'high' ? 0.7 : priority === 'low' ? 0.3 : 0.5}
      parallax={true}
      dynamicShadow={highlightOnHover}
      animate={animateOnMount}
      zIndex={priority === 'high' ? 10 : priority === 'low' ? 1 : 5}
      backgroundColor={backgroundColor}
      {...rest}
    >
      {children}
    </DimensionalGlass>
  );
};

/**
 * WidgetGlass Component
 *
 * A specialized glass component for UI widgets with enhanced effects.
 */
const WidgetGlass = forwardRef(WidgetGlassComponent);
WidgetGlass.displayName = 'WidgetGlass';

export default WidgetGlass;
