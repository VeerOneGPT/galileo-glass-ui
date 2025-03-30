/**
 * Enhanced GlassTooltip Component
 * 
 * An advanced glass tooltip with physics-based animations, intelligent positioning,
 * and context-aware backgrounds.
 */
import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';

import { useGalileoStateSpring, GalileoStateSpringOptions } from '../../hooks/useGalileoStateSpring';
import { useInertialMovement } from '../../animations/physics/useInertialMovement';
import { useAccessibleAnimation } from '../../hooks/useAccessibleAnimation';
import { AnimationCategory } from '../../animations/accessibility/MotionSensitivity';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
// import { edgeEffects } from '../../core/mixins/edgeEffects';
// Define edge effects inline instead of importing
const applyEdgeEffects = (props: any) => {
  return `
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;
};

/**
 * GlassTooltip Props
 */
export interface GlassTooltipProps {
  /**
   * The tooltip content
   */
  title: React.ReactNode;

  /**
   * The child element that the tooltip will be attached to
   */
  children: React.ReactElement;

  /**
   * The placement of the tooltip
   */
  placement?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end';

  /**
   * If true, the tooltip will not be displayed
   */
  disabled?: boolean;

  /**
   * The color of the tooltip
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

  /**
   * Tooltip glass appearance style
   */
  glassStyle?: 'clear' | 'frosted' | 'tinted' | 'luminous' | 'dynamic';

  /**
   * Glass blur intensity
   */
  blurStrength?: 'light' | 'standard' | 'strong';

  /**
   * The maximum width of the tooltip
   */
  maxWidth?: number;

  /**
   * If true, add an arrow pointing to the target
   */
  arrow?: boolean;

  /**
   * The delay (ms) before showing the tooltip
   */
  enterDelay?: number;

  /**
   * The delay (ms) before hiding the tooltip
   */
  leaveDelay?: number;

  /**
   * If true, the tooltip will be interactive (can be hovered)
   */
  interactive?: boolean;

  /**
   * Animation entrance style
   */
  animationStyle?: 'spring' | 'inertial' | 'magnetic' | 'fade' | 'scale' | 'none';

  /**
   * Animation physics properties
   */
  physics?: {
    /** Spring tension (spring stiffness) */
    tension?: number;
    /** Spring friction (damping) */
    friction?: number;
    /** Spring mass */
    mass?: number;
    /** Initial velocity */
    velocity?: number;
  };

  /**
   * If true, tooltip will follow cursor with physics
   */
  followCursor?: boolean;

  /**
   * Distance the tooltip should maintain from cursor when following
   */
  followCursorDistance?: number;

  /**
   * If true, tooltip background will adapt to content underneath
   */
  contextAware?: boolean;

  /**
   * Additional classes for styling
   */
  className?: string;

  /**
   * Z-index for the tooltip
   */
  zIndex?: number;
  
  /**
   * If provided, will use rich content formatting
   */
  richContent?: {
    /** Title text */
    title?: string;
    /** Items to display as label-value pairs */
    items?: Array<{ label: string; value: string | number; color?: string }>;
  };
}

// Enhanced positioning system that takes into account screen edges and scroll
const getTooltipPosition = (
  placement: string,
  targetRect: DOMRect,
  tooltipRect: DOMRect,
  arrow: boolean,
  cursorPosition?: { x: number; y: number }
): { 
  top: number; 
  left: number; 
  transformOrigin: string;
  arrowTop?: number; 
  arrowLeft?: number;
  arrowRotation?: number;
} => {
  const arrowSize = arrow ? 8 : 0;
  const offset = arrow ? arrowSize + 4 : 8;
  let transformOrigin = 'center center';

  let top = 0;
  let left = 0;
  let arrowTop;
  let arrowLeft;
  const arrowRotation = 0;

  // If we're following the cursor and have cursor position, use that instead of target
  const useRect = cursorPosition ? {
    top: cursorPosition.y,
    bottom: cursorPosition.y,
    left: cursorPosition.x,
    right: cursorPosition.x,
    width: 0,
    height: 0
  } : targetRect;

  switch (placement) {
    case 'top':
      top = useRect.top - tooltipRect.height - offset;
      left = useRect.left + useRect.width / 2 - tooltipRect.width / 2;
      arrowTop = tooltipRect.height;
      arrowLeft = tooltipRect.width / 2 - arrowSize;
      transformOrigin = 'center bottom';
      break;

    case 'top-start':
      top = useRect.top - tooltipRect.height - offset;
      left = useRect.left;
      arrowTop = tooltipRect.height;
      arrowLeft = Math.min(tooltipRect.width / 4, useRect.width / 2);
      transformOrigin = 'left bottom';
      break;

    case 'top-end':
      top = useRect.top - tooltipRect.height - offset;
      left = useRect.right - tooltipRect.width;
      arrowTop = tooltipRect.height;
      arrowLeft = tooltipRect.width - Math.min(tooltipRect.width / 4, useRect.width / 2) - arrowSize * 2;
      transformOrigin = 'right bottom';
      break;

    case 'bottom':
      top = useRect.bottom + offset;
      left = useRect.left + useRect.width / 2 - tooltipRect.width / 2;
      arrowTop = -arrowSize;
      arrowLeft = tooltipRect.width / 2 - arrowSize;
      transformOrigin = 'center top';
      break;

    case 'bottom-start':
      top = useRect.bottom + offset;
      left = useRect.left;
      arrowTop = -arrowSize;
      arrowLeft = Math.min(tooltipRect.width / 4, useRect.width / 2);
      transformOrigin = 'left top';
      break;

    case 'bottom-end':
      top = useRect.bottom + offset;
      left = useRect.right - tooltipRect.width;
      arrowTop = -arrowSize;
      arrowLeft = tooltipRect.width - Math.min(tooltipRect.width / 4, useRect.width / 2) - arrowSize * 2;
      transformOrigin = 'right top';
      break;

    case 'left':
      top = useRect.top + useRect.height / 2 - tooltipRect.height / 2;
      left = useRect.left - tooltipRect.width - offset;
      arrowTop = tooltipRect.height / 2 - arrowSize;
      arrowLeft = tooltipRect.width;
      transformOrigin = 'right center';
      break;

    case 'left-start':
      top = useRect.top;
      left = useRect.left - tooltipRect.width - offset;
      arrowTop = Math.min(tooltipRect.height / 4, useRect.height / 2);
      arrowLeft = tooltipRect.width;
      transformOrigin = 'right top';
      break;

    case 'left-end':
      top = useRect.bottom - tooltipRect.height;
      left = useRect.left - tooltipRect.width - offset;
      arrowTop = tooltipRect.height - Math.min(tooltipRect.height / 4, useRect.height / 2) - arrowSize * 2;
      arrowLeft = tooltipRect.width;
      transformOrigin = 'right bottom';
      break;

    case 'right':
      top = useRect.top + useRect.height / 2 - tooltipRect.height / 2;
      left = useRect.right + offset;
      arrowTop = tooltipRect.height / 2 - arrowSize;
      arrowLeft = -arrowSize;
      transformOrigin = 'left center';
      break;

    case 'right-start':
      top = useRect.top;
      left = useRect.right + offset;
      arrowTop = Math.min(tooltipRect.height / 4, useRect.height / 2);
      arrowLeft = -arrowSize;
      transformOrigin = 'left top';
      break;

    case 'right-end':
      top = useRect.bottom - tooltipRect.height;
      left = useRect.right + offset;
      arrowTop = tooltipRect.height - Math.min(tooltipRect.height / 4, useRect.height / 2) - arrowSize * 2;
      arrowLeft = -arrowSize;
      transformOrigin = 'left bottom';
      break;

    default:
      // Default to top
      top = useRect.top - tooltipRect.height - offset;
      left = useRect.left + useRect.width / 2 - tooltipRect.width / 2;
      arrowTop = tooltipRect.height;
      arrowLeft = tooltipRect.width / 2 - arrowSize;
      transformOrigin = 'center bottom';
  }

  // Ensure tooltip stays within viewport
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Flag to track if we had to adjust the position
  let positionAdjusted = false;

  // Original values before adjustment
  const originalTop = top;
  const originalLeft = left;

  // Adjust horizontally if needed
  if (left + tooltipRect.width > scrollX + windowWidth - 8) {
    left = scrollX + windowWidth - tooltipRect.width - 8;
    positionAdjusted = true;
  }
  if (left < scrollX + 8) {
    left = scrollX + 8;
    positionAdjusted = true;
  }

  // Adjust vertically if needed
  if (top + tooltipRect.height > scrollY + windowHeight - 8) {
    top = scrollY + windowHeight - tooltipRect.height - 8;
    positionAdjusted = true;
  }
  if (top < scrollY + 8) {
    top = scrollY + 8;
    positionAdjusted = true;
  }

  // If we had to adjust the position, we may need to adjust the arrow too
  if (positionAdjusted && arrow) {
    // Calculate adjustment for arrow
    if (placement.startsWith('top') || placement.startsWith('bottom')) {
      // For top/bottom placements, adjust arrow horizontally
      const horizontalAdjustment = originalLeft - left;
      arrowLeft = (arrowLeft || 0) + horizontalAdjustment;
      
      // Ensure arrow stays within tooltip bounds
      arrowLeft = Math.max(arrowSize, Math.min(tooltipRect.width - arrowSize * 2, arrowLeft));
    } else if (placement.startsWith('left') || placement.startsWith('right')) {
      // For left/right placements, adjust arrow vertically
      const verticalAdjustment = originalTop - top;
      arrowTop = (arrowTop || 0) + verticalAdjustment;
      
      // Ensure arrow stays within tooltip bounds
      arrowTop = Math.max(arrowSize, Math.min(tooltipRect.height - arrowSize * 2, arrowTop));
    }
  }

  return { top, left, transformOrigin, arrowTop, arrowLeft, arrowRotation };
};

// Get color by name for theme consistency with optional alpha
const getColorByName = (color: string, alpha = 1): string => {
  let hexColor;
  
  switch (color) {
    case 'primary':
      hexColor = '#6366F1';
      break;
    case 'secondary':
      hexColor = '#8B5CF6';
      break;
    case 'success':
      hexColor = '#10B981';
      break;
    case 'error':
      hexColor = '#EF4444';
      break;
    case 'warning':
      hexColor = '#F59E0B';
      break;
    case 'info':
      hexColor = '#3B82F6';
      break;
    default:
      hexColor = '#1F2937'; // default dark gray
  }
  
  // If alpha is 1, return the hex color
  if (alpha >= 1) {
    return hexColor;
  }
  
  // Otherwise, convert to rgba
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Calculate context-aware background color based on element under the tooltip
const getContextAwareBackground = (
  element: HTMLElement | null, 
  color: string, 
  glassStyle: string
): { background: string; borderColor: string } => {
  if (!element) {
    return { 
      background: glassStyle === 'clear' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(30, 41, 59, 0.8)', 
      borderColor: 'rgba(255, 255, 255, 0.1)' 
    };
  }
  
  try {
    // Try to get the dominant color from the element
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.width = Math.min(100, rect.width);
    canvas.height = Math.min(100, rect.height);
    
    // Use html2canvas or a simpler approach to capture the element
    // For this example, we'll use a simplified average color calculation
    let r = 0, g = 0, b = 0;
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    for (let i = 0; i < pixelData.length; i += 4) {
      r += pixelData[i];
      g += pixelData[i + 1];
      b += pixelData[i + 2];
    }
    
    const pixelCount = pixelData.length / 4;
    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Determine if we should use light or dark background based on luminance
    const isDark = luminance < 0.5;
    
    // Generate appropriate background based on the content and glass style
    let background;
    let borderColor;
    
    if (glassStyle === 'clear') {
      background = isDark 
        ? `rgba(255, 255, 255, 0.25)`
        : `rgba(0, 0, 0, 0.15)`;
      borderColor = isDark 
        ? `rgba(255, 255, 255, 0.2)`
        : `rgba(0, 0, 0, 0.1)`;
    } else if (glassStyle === 'frosted') {
      background = isDark 
        ? `rgba(255, 255, 255, 0.15)`
        : `rgba(10, 20, 30, 0.75)`;
      borderColor = isDark 
        ? `rgba(255, 255, 255, 0.15)`
        : `rgba(255, 255, 255, 0.08)`;
    } else if (glassStyle === 'tinted') {
      // Apply tint based on the specified color
      const baseColor = getColorByName(color);
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      background = `rgba(${r}, ${g}, ${b}, 0.65)`;
      borderColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
    } else if (glassStyle === 'luminous') {
      // Luminous style has a subtle glow
      background = isDark 
        ? `rgba(40, 50, 60, 0.85)`
        : `rgba(240, 245, 250, 0.85)`;
      borderColor = getColorByName(color, 0.4);
    } else if (glassStyle === 'dynamic') {
      // Dynamic adapts to the calculated background color but with transparency
      background = `rgba(${r}, ${g}, ${b}, 0.5)`;
      borderColor = isDark 
        ? `rgba(255, 255, 255, 0.15)`
        : `rgba(0, 0, 0, 0.1)`;
    } else {
      // Default
      background = isDark 
        ? `rgba(20, 30, 40, 0.8)`
        : `rgba(240, 245, 250, 0.8)`;
      borderColor = isDark 
        ? `rgba(255, 255, 255, 0.1)`
        : `rgba(0, 0, 0, 0.1)`;
    }
    
    return { background, borderColor };
  } catch (error) {
    console.error('Error determining context-aware background:', error);
    
    // Fallback
    return { 
      background: glassStyle === 'clear' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(30, 41, 59, 0.8)', 
      borderColor: 'rgba(255, 255, 255, 0.1)' 
    };
  }
};

// === Styled Components ===

const TooltipContainer = styled.div<{
  $visible: boolean;
  $zIndex: number;
}>`
  position: fixed;
  z-index: ${props => props.$zIndex};
  top: 0;
  left: 0;
  pointer-events: ${props => (props.$visible ? 'auto' : 'none')};
  will-change: transform;
`;

const TooltipContent = styled.div<{
  $glassStyle: string;
  $color: string;
  $maxWidth: number;
  $visible: boolean;
  $blurStrength: string;
  $background?: string;
  $borderColor?: string;
}>`
  position: relative;
  max-width: ${props => props.$maxWidth}px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 0.75rem;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  opacity: ${props => (props.$visible ? 1 : 0)};
  border: 1px solid ${props => props.$borderColor || 'rgba(255, 255, 255, 0.1)'};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  /* Base styling with backdrop-filter for glass effect */
  background-color: ${props => props.$background || 'rgba(30, 41, 59, 0.8)'};
  color: white;
  backdrop-filter: ${props => {
    switch (props.$blurStrength) {
      case 'light': return 'blur(5px)';
      case 'strong': return 'blur(20px)';
      default: return 'blur(10px)';
    }
  }};
  -webkit-backdrop-filter: ${props => {
    switch (props.$blurStrength) {
      case 'light': return 'blur(5px)';
      case 'strong': return 'blur(20px)';
      default: return 'blur(10px)';
    }
  }};
  
  /* Glass styling */
  ${props => {
    const themeContext = createThemeContext({});
    
    // Apply glass surface styles based on glass style
    if (props.$glassStyle === 'clear') {
      return glassSurface({
        elevation: 3,
        blurStrength: props.$blurStrength as any,
        backgroundOpacity: 'light',
        borderOpacity: 'subtle',
        themeContext,
      });
    } else if (props.$glassStyle === 'frosted') {
      return glassSurface({
        elevation: 2,
        blurStrength: props.$blurStrength as any,
        backgroundOpacity: 'medium',
        borderOpacity: 'subtle',
        themeContext,
      });
    } else if (props.$glassStyle === 'tinted') {
      return glassSurface({
        elevation: 2,
        blurStrength: 'medium',
        backgroundOpacity: 'medium',
        borderOpacity: 'medium',
        themeContext,
      });
    } else if (props.$glassStyle === 'luminous') {
      return `
        ${glassSurface({
          elevation: 4,
          blurStrength: 'medium',
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        })}
        ${glassGlow({
          intensity: 'subtle',
          color: props.$color,
          themeContext,
        })}
      `;
    } else {
      // Default styles
      return glassSurface({
        elevation: 2,
        blurStrength: 'medium',
        backgroundOpacity: 'medium',
        borderOpacity: 'subtle',
        themeContext,
      });
    }
  }}
  
  /* Edge refinement for better visual appeal */
  ${props => {
    const themeContext = createThemeContext({});
    return applyEdgeEffects(props);
  }}
`;

const TooltipArrow = styled.div<{
  $glassStyle: string;
  $color: string;
  $background?: string;
  $rotation: number;
}>`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 8px;
  border-color: transparent;
  pointer-events: none;
  transform: ${props => props.$rotation ? `rotate(${props.$rotation}deg)` : 'none'};
  
  &.arrow-top {
    border-bottom-color: ${props => props.$background || 'rgba(30, 41, 59, 0.8)'};
  }
  
  &.arrow-bottom {
    border-top-color: ${props => props.$background || 'rgba(30, 41, 59, 0.8)'};
  }
  
  &.arrow-left {
    border-right-color: ${props => props.$background || 'rgba(30, 41, 59, 0.8)'};
  }
  
  &.arrow-right {
    border-left-color: ${props => props.$background || 'rgba(30, 41, 59, 0.8)'};
  }
`;

// Components for rich content display
const TooltipTitle = styled.div<{ $color?: string }>`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.$color || 'inherit'};
  padding-bottom: 0.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TooltipItem = styled.div<{ $color?: string }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.$color || 'inherit'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemLabel = styled.span`
  opacity: 0.8;
  margin-right: 1rem;
`;

const ItemValue = styled.span`
  font-weight: 500;
`;

// Custom hook to manage 2D position with inertia
interface Position2D {
  x: number;
  y: number;
}

interface UsePositionInertiaResult {
  position: Position2D;
  setPosition: (position: Position2D, animate?: boolean) => void;
}

const usePositionInertia = (
  initialPosition: Position2D = { x: 0, y: 0 },
  config: any = {}
): UsePositionInertiaResult => {
  const { position: xPosition, setPosition: setXPosition } = useInertialMovement({
    initialPosition: initialPosition.x,
    ...config
  });
  
  const { position: yPosition, setPosition: setYPosition } = useInertialMovement({
    initialPosition: initialPosition.y,
    ...config
  });
  
  const position = { x: xPosition, y: yPosition };
  
  const setPosition = (newPosition: Position2D, animate = true) => {
    setXPosition(newPosition.x, animate ? undefined : 0);
    setYPosition(newPosition.y, animate ? undefined : 0);
  };
  
  return { position, setPosition };
};

// Interface for the multi-property spring hook
interface SpringPosition {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

interface UseMultiSpringResult {
  value: SpringPosition;
  isAnimating: boolean;
  start: (props: Partial<SpringPosition>) => void;
}

// Custom hook to manage multiple spring animations
const useMultiSpring = (initialValues: SpringPosition, config: any): UseMultiSpringResult => {
  // Create separate springs for each property
  const { value: x, isAnimating: isAnimatingX, start: startX } = useGalileoStateSpring(initialValues.x, config);
  
  const { value: y, isAnimating: isAnimatingY, start: startY } = useGalileoStateSpring(initialValues.y, config);
  
  const { value: scale, isAnimating: isAnimatingScale, start: startScale } = useGalileoStateSpring(initialValues.scale, config);
  
  const { value: opacity, isAnimating: isAnimatingOpacity, start: startOpacity } = useGalileoStateSpring(initialValues.opacity, config);
  
  // Combine all values into a single object
  const combinedValue = {
    x,
    y,
    scale,
    opacity
  };
  
  // Start function that updates any provided properties
  const start = (props: Partial<SpringPosition>) => {
    if (props.x !== undefined) startX({ to: props.x });
    if (props.y !== undefined) startY({ to: props.y });
    if (props.scale !== undefined) startScale({ to: props.scale });
    if (props.opacity !== undefined) startOpacity({ to: props.opacity });
  };
  
  // Animation is happening if any individual animation is active
  const isAnimating = isAnimatingX || isAnimatingY || isAnimatingScale || isAnimatingOpacity;
  
  return {
    value: combinedValue,
    isAnimating,
    start
  };
};

/**
 * Main GlassTooltip Component
 */
export const GlassTooltip = forwardRef<HTMLDivElement, GlassTooltipProps>((props, ref) => {
  const {
    title,
    children,
    placement = 'top',
    disabled = false,
    color = 'primary',
    glassStyle = 'frosted',
    blurStrength = 'standard',
    maxWidth = 300,
    arrow = true,
    enterDelay = 100,
    leaveDelay = 0,
    interactive = false,
    animationStyle = 'spring',
    physics = {},
    followCursor = false,
    followCursorDistance = 20,
    contextAware = false,
    className = '',
    zIndex = 1500,
    richContent,
    ...rest
  } = props;

  // Theme context
  const { theme, isDarkMode } = useGlassTheme();

  // State
  const [visible, setVisible] = useState(false);
  const [tooltipElement, setTooltipElement] = useState<HTMLDivElement | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0, rotation: 0 });
  const [arrowClass, setArrowClass] = useState('arrow-top');
  const [contextBackground, setContextBackground] = useState<{ background: string; borderColor: string } | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [transformOrigin, setTransformOrigin] = useState('center bottom');

  // Refs
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const enterTimeoutRef = useRef<number | undefined>();
  const leaveTimeoutRef = useRef<number | undefined>();
  const mouseMoveTimeoutRef = useRef<number | undefined>();
  
  // Default physics values
  const defaultPhysics = {
    tension: 300,
    friction: 30,
    mass: 1,
    velocity: 0,
  };
  
  // Merged physics
  const mergedPhysics = { ...defaultPhysics, ...physics };

  // Determine if we should use physics animations
  const usePhysics = animationStyle === 'spring' || 
                     animationStyle === 'inertial' || 
                     animationStyle === 'magnetic';

  // Initialize spring animation
  const { value: springProps, start: setSpringProps } = useMultiSpring({
    x: 0,
    y: 0,
    scale: 0,
    opacity: 0
  }, {
    tension: mergedPhysics.tension,
    friction: mergedPhysics.friction,
    mass: mergedPhysics.mass
  });

  // Initialize inertial animation for follow cursor
  const { position: inertialPosition, setPosition: setInertialTarget } = usePositionInertia(
    { x: 0, y: 0 },
    {
      friction: 0.88
    }
  );

  // Update element refs
  const updateRefs = (node: HTMLDivElement | null) => {
    tooltipRef.current = node;
    setTooltipElement(node);
    
    // Forward the ref
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    }
  };

  // Function to update tooltip position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const targetRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    // Get position information
    const cursorPos = followCursor ? cursorPosition : undefined;
    const { 
      top, 
      left, 
      transformOrigin: origin,
      arrowTop, 
      arrowLeft,
      arrowRotation
    } = getTooltipPosition(
      placement,
      targetRect,
      tooltipRect,
      arrow,
      cursorPos
    );

    // Update transform origin
    setTransformOrigin(origin);

    // Update spring target or set position directly
    if (usePhysics) {
      setSpringProps({
        x: left,
        y: top,
        scale: visible ? 1 : 0,
        opacity: visible ? 1 : 0
      });
    }
    
    // If following cursor with inertial movement
    if (followCursor) {
      setInertialTarget({ 
        x: left, 
        y: top 
      });
    }

    // Update arrow position and direction
    if (arrow && arrowTop !== undefined && arrowLeft !== undefined) {
      setArrowPosition({ 
        top: arrowTop, 
        left: arrowLeft,
        rotation: arrowRotation || 0
      });
    }

    // Set arrow direction class
    if (placement.startsWith('top')) {
      setArrowClass('arrow-top');
    } else if (placement.startsWith('bottom')) {
      setArrowClass('arrow-bottom');
    } else if (placement.startsWith('left')) {
      setArrowClass('arrow-left');
    } else if (placement.startsWith('right')) {
      setArrowClass('arrow-right');
    }

    // Context-aware background color
    if (contextAware && triggerRef.current) {
      const background = getContextAwareBackground(
        triggerRef.current,
        color,
        glassStyle
      );
      
      setContextBackground(background);
    }
  }, [
    visible, 
    placement, 
    arrow, 
    contextAware, 
    color, 
    glassStyle, 
    followCursor, 
    cursorPosition, 
    usePhysics, 
    setSpringProps
  ]);

  // Show the tooltip
  const handleShow = () => {
    if (disabled || !title) return;

    clearTimeout(enterTimeoutRef.current);
    clearTimeout(leaveTimeoutRef.current);

    enterTimeoutRef.current = window.setTimeout(() => {
      setVisible(true);
      
      // Update position on next frame
      requestAnimationFrame(() => {
        updatePosition();
        
        if (usePhysics) {
          setSpringProps({
            scale: 1,
            opacity: 1
          });
        }
      });
    }, enterDelay);
  };

  // Hide the tooltip
  const handleHide = () => {
    clearTimeout(enterTimeoutRef.current);
    clearTimeout(leaveTimeoutRef.current);

    leaveTimeoutRef.current = window.setTimeout(() => {
      if (usePhysics) {
        setSpringProps({
          scale: 0,
          opacity: 0
        });
        
        // Delay actual hiding until animation completes
        setTimeout(() => {
          setVisible(false);
        }, 300);
      } else {
        setVisible(false);
      }
    }, leaveDelay);
  };

  // Handle mouse movement for follow cursor
  const handleMouseMove = (e: MouseEvent) => {
    if (!followCursor || !visible) return;
    
    // Throttle mousemove updates for performance
    clearTimeout(mouseMoveTimeoutRef.current);
    mouseMoveTimeoutRef.current = window.setTimeout(() => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Let the position update on next frame
      requestAnimationFrame(updatePosition);
    }, 5); // Small delay for throttling
  };

  // Handle tooltip touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleShow();

    // Auto-hide after 1.5s for mobile
    setTimeout(handleHide, 1500);
  };

  // Handle hover on tooltip for interactive mode
  const handleTooltipMouseEnter = () => {
    if (interactive) {
      clearTimeout(leaveTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      handleHide();
    }
  };

  // Set up window event listeners
  useEffect(() => {
    if (followCursor) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    // Listen for resize and scroll to update position
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      if (followCursor) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [followCursor, updatePosition]);

  // Update position when visibility changes
  useEffect(() => {
    if (visible) {
      updatePosition();
    }
  }, [visible, updatePosition]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(enterTimeoutRef.current);
      clearTimeout(leaveTimeoutRef.current);
      clearTimeout(mouseMoveTimeoutRef.current);
    };
  }, []);

  // Clone child element with tooltip trigger props
  const trigger = React.cloneElement(children, {
    ref: (node: HTMLElement) => {
      // Save the trigger element reference
      triggerRef.current = node;
      setTargetElement(node);

      // Forward the ref to the original ref if it exists
      const { ref: childRef } = children as any;
      if (childRef) {
        if (typeof childRef === 'function') {
          childRef(node);
        } else if (Object.prototype.hasOwnProperty.call(childRef, 'current')) {
          (childRef as React.MutableRefObject<HTMLElement>).current = node;
        }
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleShow();
      
      // Update cursor position for follow cursor
      if (followCursor) {
        setCursorPosition({ x: e.clientX, y: e.clientY });
      }

      // Call original handler if it exists
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleHide();

      // Call original handler if it exists
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      handleShow();

      // Call original handler if it exists
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      handleHide();

      // Call original handler if it exists
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
    },
    onTouchStart: (e: React.TouchEvent) => {
      handleTouchStart(e);

      // Call original handler if it exists
      if (children.props.onTouchStart) {
        children.props.onTouchStart(e);
      }
    },
  });

  // Don't render anything if disabled or no title
  if (disabled || !title) {
    return children;
  }

  // Format rich content if provided
  const formattedContent = richContent ? (
    <>
      {richContent.title && (
        <TooltipTitle $color={getColorByName(color)}>
          {richContent.title}
        </TooltipTitle>
      )}
      {richContent.items && richContent.items.map((item, index) => (
        <TooltipItem key={index} $color={item.color}>
          <ItemLabel>{item.label}</ItemLabel>
          <ItemValue>{item.value}</ItemValue>
        </TooltipItem>
      ))}
    </>
  ) : null;

  // Create portal for tooltip
  return (
    <>
      {trigger}
      {ReactDOM.createPortal(
        <TooltipContainer
          ref={updateRefs}
          className={`glass-tooltip ${className}`}
          $visible={visible}
          $zIndex={zIndex}
          style={usePhysics ? {
            transform: `translate3d(${followCursor ? inertialPosition.x : springProps.x}px, ${followCursor ? inertialPosition.y : springProps.y}px, 0) scale(${springProps.scale})`,
            opacity: springProps.opacity,
            transformOrigin,
          } : undefined}
          {...rest}
        >
          <TooltipContent
            $glassStyle={glassStyle}
            $color={color}
            $maxWidth={maxWidth}
            $visible={visible}
            $blurStrength={blurStrength}
            $background={contextBackground?.background}
            $borderColor={contextBackground?.borderColor}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            role="tooltip"
            aria-live="polite"
          >
            {richContent ? formattedContent : title}
            {arrow && (
              <TooltipArrow
                className={arrowClass}
                style={{
                  top: arrowPosition.top,
                  left: arrowPosition.left,
                }}
                $glassStyle={glassStyle}
                $color={color}
                $background={contextBackground?.background}
                $rotation={arrowPosition.rotation}
              />
            )}
          </TooltipContent>
        </TooltipContainer>,
        document.body
      )}
    </>
  );
});

GlassTooltip.displayName = 'GlassTooltip';

/**
 * Helper component to format tooltip content
 */
export const GlassTooltipContent: React.FC<{
  title?: string;
  titleColor?: string;
  items?: Array<{ label: string; value: string | number; color?: string }>;
  children?: React.ReactNode;
}> = ({ title, titleColor, items = [], children }) => {
  return (
    <>
      {title && <TooltipTitle $color={titleColor}>{title}</TooltipTitle>}
      {items.map((item, index) => (
        <TooltipItem key={index} $color={item.color}>
          <ItemLabel>{item.label}</ItemLabel>
          <ItemValue>{item.value}</ItemValue>
        </TooltipItem>
      ))}
      {children}
    </>
  );
};

export default GlassTooltip;