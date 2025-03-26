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

// Get box shadow based on type and priority
const getBoxShadow = (
  widgetType: string,
  priority: string,
  isHovered: boolean,
  highlightOnHover: boolean
): string => {
  // Base shadow based on widget type
  let baseShadow = '';
  
  switch (widgetType) {
    case 'card':
      baseShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
      break;
    case 'panel':
      baseShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      break;
    case 'modal':
      baseShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
      break;
    case 'tooltip':
      baseShadow = '0 3px 8px rgba(0, 0, 0, 0.1)';
      break;
    default:
      baseShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
  }
  
  // Enhance shadow based on priority
  if (priority === 'high') {
    baseShadow = baseShadow.replace('rgba(0, 0, 0,', 'rgba(0, 0, 0,').replace(')', ')');
    baseShadow = baseShadow.replace(/\d+px/g, (match) => {
      const value = parseInt(match, 10);
      return `${value * 1.5}px`;
    });
  } else if (priority === 'low') {
    baseShadow = baseShadow.replace('rgba(0, 0, 0,', 'rgba(0, 0, 0,').replace(')', ')');
    baseShadow = baseShadow.replace(/\d+px/g, (match) => {
      const value = parseInt(match, 10);
      return `${Math.max(1, Math.floor(value * 0.7))}px`;
    });
  }
  
  // Add highlight on hover
  if (isHovered && highlightOnHover) {
    return `${baseShadow}, 0 0 15px rgba(99, 102, 241, 0.3)`;
  }
  
  return baseShadow;
};

// Styled components
const WidgetContainer = styled.div<{
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
  $widgetType: 'card' | 'panel' | 'modal' | 'tooltip';
  $highlightOnHover: boolean;
  $animateOnMount: boolean;
  $priority: 'low' | 'medium' | 'high';
  $backgroundColor: string;
  $isHovered: boolean;
  $isVisible: boolean;
  $reducedMotion: boolean;
}>`
  position: relative;
  display: ${props => props.$isVisible ? 'block' : 'none'};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  height: ${props => props.$fullHeight ? '100%' : 'auto'};
  border-radius: ${props => typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  padding: ${props => typeof props.$padding === 'number' ? `${props.$padding}px` : props.$padding};
  box-sizing: border-box;
  overflow: hidden;
  z-index: ${props => props.$priority === 'high' ? 10 : props.$priority === 'low' ? 1 : 5};
  
  /* Apply glass surface effect */
  ${props => glassSurface({
    elevation: props.$elevation,
    blurStrength: props.$blurStrength,
    borderOpacity: props.$borderOpacity,
    themeContext: createThemeContext(props.theme)
  })}
  
  /* Custom background color */
  background-color: ${props => props.$backgroundColor};
  
  /* Border */
  border-width: ${props => props.$borderWidth}px;
  border-style: solid;
  border-color: ${props => {
    switch (props.$borderOpacity) {
      case 'none': return 'transparent';
      case 'subtle': return 'rgba(255, 255, 255, 0.1)';
      case 'light': return 'rgba(255, 255, 255, 0.2)';
      case 'medium': return 'rgba(255, 255, 255, 0.3)';
      case 'strong': return 'rgba(255, 255, 255, 0.4)';
    }
  }};
  
  /* Box-shadow based on widget type and priority */
  box-shadow: ${props => getBoxShadow(
    props.$widgetType, 
    props.$priority, 
    props.$isHovered, 
    props.$highlightOnHover
  )};
  
  /* Animation on mount */
  ${props => props.$animateOnMount && !props.$reducedMotion && `
    animation: ${enterAnimation} 0.3s ease-out forwards;
  `}
  
  /* Interactive effects */
  ${props => props.$interactive && `
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}
  
  /* Highlight pulse animation for high priority widgets */
  ${props => props.$priority === 'high' && props.$highlightOnHover && !props.$reducedMotion && `
    &:hover {
      animation: ${pulseHighlight} 2s infinite;
    }
  `}
`;

/**
 * WidgetGlass Component Implementation
 */
function WidgetGlassComponent(
  props: WidgetGlassProps,
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
    widgetType = 'card',
    highlightOnHover = true,
    animateOnMount = true,
    priority = 'medium',
    backgroundColor = 'rgba(255, 255, 255, 0.1)',
    ...rest
  } = props;
  
  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();
  
  // State for hover effects and animation
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(!animateOnMount);
  
  // Handle animation on mount
  useEffect(() => {
    if (animateOnMount) {
      // Slight delay to allow for animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [animateOnMount]);
  
  // Handle mouse events
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  return (
    <WidgetContainer
      ref={ref}
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
      $widgetType={widgetType}
      $highlightOnHover={highlightOnHover}
      $animateOnMount={animateOnMount}
      $priority={priority}
      $backgroundColor={backgroundColor}
      $isHovered={isHovered}
      $isVisible={isVisible}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      {children}
    </WidgetContainer>
  );
}

/**
 * WidgetGlass Component
 * 
 * A specialized glass component for UI widgets with enhanced effects.
 */
const WidgetGlass = forwardRef(WidgetGlassComponent);

export default WidgetGlass;