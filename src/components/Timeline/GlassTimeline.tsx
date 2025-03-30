/**
 * GlassTimeline Component
 * 
 * A glass-styled timeline component for displaying chronological events
 * with physics-based animations and interactions.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';

// Physics-related imports
import { useInertialMovement, type InertialMovementOptions } from '../../animations/physics/useInertialMovement';
import { SpringPresets, type SpringConfig } from '../../animations/physics/springPhysics';
import { useMultiSpring } from '../../animations/physics/useMultiSpring';
import { useGalileoStateSpring } from '../../hooks/useGalileoStateSpring';
import { InertialPresets, type InertialConfig } from '../../animations/physics/inertialMovement';

// Core styling imports
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

// Hooks and utilities
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Import context and AnimationProps
import { useAnimationContext } from '../../contexts/AnimationContext';
import { AnimationProps } from '../../animations/types';

// Timeline utilities and types
import { 
  TimelineProps, 
  type TimelineItem,
  TimelineGroup,
  TimelineViewMode,
  ZoomLevel,
  TimelineOrientation,
  MarkerPosition,
  TimelineAnimationType,
  TimelineDensity
} from './types';

import {
  parseDate,
  formatDate,
  groupItemsByDate,
  generateTimeMarkers,
  filterItems,
  getDateRangeForView,
  isToday,
  calculateTimelinePosition
} from './TimelineUtils';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInHorizontal = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInVertical = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Define spring config for item interactions
const itemInteractionSpringConfig: SpringConfig = {
  tension: 320,
  friction: 25,
  mass: 1,
};

// Styled components
const TimelineContainer = styled.div<{
  $orientation: TimelineOrientation;
  $width?: string | number;
  $height?: string | number;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
  $color?: string;
}>`
  position: relative;
  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'row' : 'column'};
  width: ${props => props.$width 
    ? (typeof props.$width === 'number' ? `${props.$width}px` : props.$width) 
    : '100%'
  };
  height: ${props => props.$height 
    ? (typeof props.$height === 'number' ? `${props.$height}px` : props.$height) 
    : props.$orientation === 'vertical' ? '600px' : '400px'
  };
  overflow: hidden;
  
  /* Glass container styling if enabled */
  ${props => props.$glassVariant && css`
    ${() => glassSurface({
      elevation: 1,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      tintColor: props.$color !== 'default' ? `var(--color-${props.$color}-transparent)` : undefined,
      themeContext: createThemeContext(props.theme),
    })}
    border-radius: 12px;
    padding: 16px;
  `}
`;

const TimelineScrollContainer = styled.div<{
  $orientation: TimelineOrientation;
  $scrollX: number;
  $scrollY: number;
}>`
  position: relative;
  flex: 1;
  overflow: hidden;
  overscroll-behavior: contain;
  transform: translate(${props => props.$scrollX}px, ${props => props.$scrollY}px);
  touch-action: ${props => props.$orientation === 'vertical' ? 'pan-y' : 'pan-x'};
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
  
  & > * {
     pointer-events: auto; 
  }
`;

const TimelineAxis = styled.div<{
  $orientation: TimelineOrientation;
  $height: number;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
}>`
  position: absolute;
  z-index: 1;
  ${props => props.$orientation === 'vertical' 
    ? `
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      transform: translateX(-50%);
    ` 
    : `
      top: ${props.$height}px;
      left: 0;
      right: 0;
      height: 2px;
    `
  }
  background-color: rgba(255, 255, 255, 0.2);
  
  /* Glass styling for axis (if enabled) */
  ${props => props.$glassVariant && css`
    ${() => glassSurface({
      elevation: 1,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'none',
      themeContext: createThemeContext(props.theme),
    })}
    
    ${props.$orientation === 'vertical' 
      ? 'width: 4px;' 
      : 'height: 4px;'
    }
  `}
`;

const TimeMarkers = styled.div<{
  $orientation: TimelineOrientation;
  $height: number;
}>`
  position: absolute;
  z-index: 2;
  ${props => props.$orientation === 'vertical' 
    ? `
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    ` 
    : `
      top: ${props.$height + 5}px;
      left: 0;
      right: 0;
      height: 30px;
      display: flex;
      align-items: center;
    `
  }
`;

const TimeMarker = styled.div<{
  $orientation: TimelineOrientation;
  $position: number;
  $isPrimary: boolean;
  $isNow: boolean;
  $color?: string;
}>`
  position: absolute;
  ${props => props.$orientation === 'vertical' 
    ? `
      top: ${props.$position}%;
      left: 0;
      right: 0;
      height: ${props.$isPrimary ? '2px' : '1px'};
    ` 
    : `
      left: ${props.$position}%;
      top: 0;
      bottom: ${props.$isPrimary ? '15px' : '5px'};
      width: ${props.$isPrimary ? '2px' : '1px'};
      transform: translateX(-50%);
    `
  }
  
  background-color: ${props => props.$isNow 
    ? `var(--color-${props.$color || 'primary'}, rgba(99, 102, 241, 0.8))` 
    : 'rgba(255, 255, 255, 0.2)'};
  
  /* Today/Now marker styling */
  ${props => props.$isNow && css`
    z-index: 3;
    ${props.$orientation === 'vertical' 
      ? 'height: 2px;' 
      : 'width: 2px;'
    }
    box-shadow: 0 0 8px var(--color-${props.$color || 'primary'}, rgba(99, 102, 241, 0.8));
  `}
  
  /* Label styling for horizontal markers */
  ${props => props.$orientation === 'horizontal' && css`
    &::after {
      content: attr(data-label);
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      white-space: nowrap;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, ${props.$isPrimary ? '0.8' : '0.5'});
      margin-top: 4px;
    }
  `}
  
  /* Label styling for vertical markers */
  ${props => props.$orientation === 'vertical' && css`
    &::after {
      content: attr(data-label);
      position: absolute;
      right: 10px;
      top: -10px;
      white-space: nowrap;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, ${props.$isPrimary ? '0.8' : '0.5'});
    }
  `}
`;

const TimelineEvents = styled.div<{
  $orientation: TimelineOrientation;
  $markerPosition: MarkerPosition;
  $density: TimelineDensity;
}>`
  position: relative;
  padding: ${props => {
    switch (props.$density) {
      case 'compact': return '5px';
      case 'spacious': return '20px';
      default: return '10px';
    }
  }};
  
  ${props => props.$orientation === 'vertical' 
    ? `
      padding-left: ${props.$markerPosition === 'left' ? '60px' : '20px'};
      padding-right: ${props.$markerPosition === 'right' ? '60px' : '20px'};
      width: 100%;
      min-height: 100%;
    ` 
    : `
      padding-top: ${props.$markerPosition === 'left' ? '60px' : '20px'};
      padding-bottom: ${props.$markerPosition === 'right' ? '60px' : '20px'};
      height: 100%;
      min-width: 100%;
    `
  }
`;

const TimelineItem = styled.div.attrs<{ style: React.CSSProperties }>(props => ({
  style: props.style,
}))<{
  $orientation: TimelineOrientation;
  $position: number;
  $side: 'left' | 'right' | 'center';
  $isActive: boolean;
  $isHighlighted: boolean;
  $color?: string;
  $reducedMotion: boolean;
  style: React.CSSProperties;
}>`
  position: absolute;
  z-index: 5;
  cursor: pointer;

  ${props => {
    const positionPercent = `${props.$position}%`;
    if (props.$orientation === 'vertical') {
      const horizontalPosition = props.$side === 'left' ? '0%' : props.$side === 'right' ? '100%' : '50%';
      return css`
        top: ${positionPercent};
        left: ${horizontalPosition};
      `;
    } else {
      const verticalPosition = props.$side === 'left' ? '0%' : props.$side === 'right' ? '100%' : '50%';
      return css`
        left: ${positionPercent};
        top: ${verticalPosition};
      `;
    }
  }}

  ${props => props.$isActive && css`
    z-index: 6;
  `}

  ${props => props.$isHighlighted && css`
  `}

  will-change: transform, opacity;

  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'row' : 'column'};
  align-items: ${props => props.$orientation === 'vertical'
    ? 'center'
    : props.$side === 'center' ? 'center' : 'flex-start'
  };

  transition: filter 0.2s ease;

  &:hover {
     filter: brightness(1.1);
  }
`;

const MarkerCircle = styled.div<{
  $color?: string;
  $isActive: boolean;
  $isGlass: boolean;
  $size: 'small' | 'medium' | 'large';
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
  $hasIcon: boolean;
}>`
  position: absolute;
  z-index: 4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => {
    const sizeMap = { small: '8px', medium: '12px', large: '16px' };
    const iconSizeMap = { small: '6px', medium: '8px', large: '10px' };
    const size = sizeMap[props.$size] || sizeMap.medium;
    const iconSize = iconSizeMap[props.$size] || iconSizeMap.medium;
    return css`
      width: ${size};
      height: ${size};
      font-size: ${iconSize};
      svg {
        width: ${iconSize};
        height: ${iconSize};
      }
    `;
  }}

  ${props => {
    return css`
       top: 50%; 
       left: 50%;
       transform: translate(-50%, -50%);
    `;
  }}

  background-color: ${props => props.$isActive
    ? `var(--color-${props.$color || 'primary'}, #6366F1)`
    : 'rgba(255, 255, 255, 0.3)'};
  color: ${props => props.$isActive ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;

  ${props => props.$isGlass && css`
    ${() => glassSurface({
      elevation: 0,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'medium',
      borderOpacity: 'subtle',
      tintColor: props.$isActive ? `var(--color-${props.$color}-transparent)` : undefined,
      themeContext: createThemeContext(props.theme),
    })}
    box-shadow: ${props.$isActive ? `0 0 6px var(--color-${props.$color || 'primary'}-glow)` : 'none'};
  `}

  ${props => props.$hasIcon && css`
    padding: 2px;
  `}
`;

const EventConnector = styled.div<{
  $orientation: TimelineOrientation;
  $side: 'left' | 'right' | 'center';
  $color?: string;
  $isActive: boolean;
}>`
  position: relative;
  z-index: 1;
  
  ${props => props.$orientation === 'vertical' 
    ? `
      width: 30px;
      height: 2px;
      ${props.$side === 'left' ? 'margin-right: -1px;' : 'margin-left: -1px;'}
    ` 
    : `
      height: 30px;
      width: 2px;
      ${props.$side === 'left' ? 'margin-bottom: -1px;' : 'margin-top: -1px;'}
    `
  }
  
  background-color: ${props => props.$isActive 
    ? `var(--color-${props.$color || 'primary'}, rgba(99, 102, 241, 0.8))` 
    : 'rgba(255, 255, 255, 0.2)'
  };
  
  transition: background-color 0.3s ease;
`;

const EventContent = styled.div<{
  $orientation: TimelineOrientation;
  $isActive: boolean;
  $isGlass: boolean;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
  $color?: string;
  $maxWidth?: number;
}>`
  position: relative;
  z-index: 3;
  min-width: ${props => props.$orientation === 'vertical' ? '200px' : '100px'};
  max-width: ${props => props.$maxWidth ? `${props.$maxWidth}px` : 'none'};
  padding: 10px 14px;
  border-radius: 8px;
  
  ${props => props.$isGlass && props.$glassVariant && css`
    ${() => glassSurface({
      elevation: 2,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      tintColor: props.$color !== 'default' && props.$isActive 
        ? `var(--color-${props.$color}-transparent)` 
        : undefined,
      themeContext: createThemeContext(props.theme),
    })}
    
    ${props.$isActive && css`
      border-color: var(--color-${props.$color || 'primary'}-transparent, rgba(99, 102, 241, 0.3));
    `}
  `}
  
  ${props => !props.$isGlass && css`
    background-color: rgba(0, 0, 0, ${props.$isActive ? '0.3' : '0.2'});
    border: 1px solid rgba(255, 255, 255, ${props.$isActive ? '0.15' : '0.1'});
    
    ${props.$isActive && css`
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    `}
  `}
  
  ${props => props.$isActive && css`
    ${() => glassGlow({
      color: `var(--color-${props.$color || 'primary'}, rgba(99, 102, 241, 0.8))`,
      intensity: 'light',
      themeContext: createThemeContext(props.theme),
    })}
  `}
  
  transition: all 0.3s ease;
  cursor: pointer;
`;

const EventTitle = styled.div<{ $color?: string; $isActive: boolean }>`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.$isActive 
    ? `var(--color-${props.$color || 'primary'}-light, rgba(149, 152, 241, 0.9))` 
    : 'rgba(255, 255, 255, 0.9)'
  };
  margin-bottom: 4px;
`;

const EventDate = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
`;

const EventDescription = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

const GroupedEvents = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 6px;
  
  .events-count {
    display: inline-block;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.7rem;
    margin-left: 5px;
  }
`;

const TimelineControls = styled.div<{
  $orientation: TimelineOrientation;
  $position: 'top' | 'bottom' | 'left' | 'right';
}>`
  display: flex;
  gap: 10px;
  padding: 10px;
  
  ${props => {
    if (props.$orientation === 'vertical') {
      return props.$position === 'left' 
        ? 'flex-direction: column; align-items: flex-start;' 
        : 'flex-direction: column; align-items: flex-end;';
    } else {
      return props.$position === 'top' 
        ? 'flex-direction: row; align-items: center;' 
        : 'flex-direction: row; align-items: center;';
    }
  }}
`;

const TimelineButton = styled.button<{
  $color?: string;
  $isGlass: boolean;
  $glassVariant?: 'clear' | 'frosted' | 'tinted';
  $blurStrength?: 'light' | 'standard' | 'strong';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$isGlass && props.$glassVariant && css`
    ${() => glassSurface({
      elevation: 2,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      tintColor: props.$color !== 'default' ? `var(--color-${props.$color}-transparent)` : undefined,
      themeContext: createThemeContext(props.theme),
    })}
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 10px;
`;

const ZoomLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  
  .spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: rgba(255, 255, 255, 0.7);
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyStateMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  
  .icon {
    font-size: 2rem;
    margin-bottom: 10px;
    opacity: 0.5;
  }
  
  .title {
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  .message {
    font-size: 0.9rem;
    max-width: 300px;
  }
`;

// Custom hook to manage 2D position with inertia
interface Position2D {
  x: number;
  y: number;
}

// Update return type
interface UsePositionInertiaResult {
  position: Position2D;
  setPosition: (position: Position2D, velocity?: Position2D) => void;
  flick: (velocity: Position2D) => void;
  stop: () => void;
  updateConfig: (newConfig: Partial<InertialConfig>) => void;
}

const usePositionInertia = (
  initialPosition: Position2D = { x: 0, y: 0 },
  options: InertialMovementOptions = {}
): UsePositionInertiaResult => {

  // --- Refined Config Handling --- 
  const getAxisConfig = (axis: 'x' | 'y'): Partial<InertialConfig> => {
    let configPart: Partial<InertialConfig> = {};
    if (typeof options.config === 'string') {
      // If it's a preset string, get the preset object
      configPart = InertialPresets[options.config] || {}; 
    } else if (options.config) {
      // If it's an object, use it directly
      configPart = options.config;
    }
    // Return only the config part, assuming bounds are handled correctly within InertialConfig type
    return configPart;
  };

  // Initialize configs (without options spread initially, just the config part)
  const initialConfigX = useMemo(() => getAxisConfig('x'), [options.config]);
  const initialConfigY = useMemo(() => getAxisConfig('y'), [options.config]);

  const { 
    position: xPosition, 
    setPosition: setXInternal,
    flick: flickX,
    stop: stopX,
    updateConfig: updateConfigX
  } = useInertialMovement({
    initialPosition: initialPosition.x,
    // Pass initial velocity/autoStart from options if they exist
    initialVelocity: options.initialVelocity,
    autoStart: options.autoStart,
    config: initialConfigX // Pass the calculated config object
  });
  
  const { 
    position: yPosition, 
    setPosition: setYInternal,
    flick: flickY,
    stop: stopY,
    updateConfig: updateConfigY
  } = useInertialMovement({
    initialPosition: initialPosition.y,
    initialVelocity: options.initialVelocity,
    autoStart: options.autoStart,
    config: initialConfigY // Pass the calculated config object
  });
  
  const position = useMemo(() => ({ x: xPosition, y: yPosition }), [xPosition, yPosition]);

  const setPosition = useCallback((newPosition: Position2D, velocity?: Position2D) => {
    setXInternal(newPosition.x, velocity?.x);
    setYInternal(newPosition.y, velocity?.y);
  }, [setXInternal, setYInternal]);

  const flick = useCallback((velocity: Position2D) => {
    flickX(velocity.x);
    flickY(velocity.y);
  }, [flickX, flickY]);

  const stop = useCallback(() => {
    stopX();
    stopY();
  }, [stopX, stopY]);

  // Update updateConfig to correctly handle merging
  const updateConfig = useCallback((newConfigPart: Partial<InertialConfig>) => {
    // Update each axis hook with the new partial config
    // The hook internally merges this with its existing config
    updateConfigX(newConfigPart); 
    updateConfigY(newConfigPart);
  }, [updateConfigX, updateConfigY]);
  
  return { position, setPosition, flick, stop, updateConfig };
};

// Utility function for clamping
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

/**
 * GlassTimeline Component
 */
export const GlassTimeline: React.FC<TimelineProps & Partial<AnimationProps>> = ({
  // Main props
  items = [],
  orientation = 'vertical',
  markerPosition = 'alternate',
  viewMode = 'month',
  groupByDate = true,
  groupThreshold = 3,
  groups = [],
  
  // Styling and visual props
  showAxis = true,
  markers = { show: true },
  animation = 'spring',
  physics = { preset: 'default', staggerDelay: 50 },
  density = 'normal',
  width,
  height,
  className,
  markerClassName,
  contentClassName,
  glassVariant = 'frosted',
  blurStrength = 'standard',
  color = 'primary',
  glassMarkers = true,
  glassContent = true,
  
  // Timeline controls
  navigation = 'scroll',
  zoomLevel = 'days',
  zoomLevels = ['days', 'weeks', 'months', 'years'],
  allowWheelZoom = true,
  initialDate = new Date(),
  activeId,
  filter,
  allowFiltering = true,
  
  // Loading props
  loadingPast = false,
  loadingFuture = false,
  hasMorePast = false,
  hasMoreFuture = false,
  onLoadMorePast,
  onLoadMoreFuture,
  
  // Event callbacks
  onItemClick,
  onItemSelect,
  onNavigate,
  onZoomChange,
  onFilterChange,
  
  // Custom renderers
  renderMarker,
  renderContent,
  renderAxis,
  
  // Animation props
  animateOnMount = true,
  animateOnChange = true,
  
  // Other props
  id,
  ariaLabel,
  // Destructure AnimationProps (making them optional via Partial)
  animationConfig,
  disableAnimation,
}) => {
  // Parse initial date
  const parsedInitialDate = useMemo(() => {
    return typeof initialDate === 'string' ? new Date(initialDate) : initialDate;
  }, [initialDate]);
  
  // State for timeline
  const [currentDate, setCurrentDate] = useState<Date>(parsedInitialDate);
  const [currentViewMode, setCurrentViewMode] = useState<TimelineViewMode>(viewMode);
  const [currentZoomLevel, setCurrentZoomLevel] = useState<ZoomLevel>(zoomLevel);
  const [selectedId, setSelectedId] = useState<string | number | null>(activeId || null);
  const [dateRange, setDateRange] = useState(getDateRangeForView(parsedInitialDate, viewMode, 2));
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);
  const eventsContainerRef = useRef<HTMLDivElement>(null); // Ref for content wrapper
  
  // Drag State Refs
  const isDragging = useRef(false);
  const pointerId = useRef<number | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const lastDragPos = useRef({ x: 0, y: 0 });
  const velocityTracker = useRef<{ t: number; x: number; y: number }[]>([]);
  
  // Accessibility
  const reducedMotion = useReducedMotion();
  
  // Get Animation Context - Use defaultSpring as the main context config
  const { defaultSpring, disableAnimation: contextDisableAnimation } = useAnimationContext();
  
  // Calculate final disable state
  const finalDisableAnimation = disableAnimation ?? contextDisableAnimation ?? reducedMotion;
  
  // --- State for Bounds ---
  const [scrollBounds, setScrollBounds] = useState<{ min: number, max: number }>({ min: 0, max: 0 });
  
  // --- Initialize Physics Hook ---
  // Defined early
  const { 
    position: physicsScrollPosition, 
    setPosition: setPhysicsScrollPosition,
    flick: flickPhysicsScroll,
    stop: stopPhysicsScroll,
    updateConfig: updatePhysicsConfig
  } = usePositionInertia({ x: 0, y: 0 }, { 
    config: { 
       bounds: scrollBounds // Initial bounds state (will be updated by effect)
    }
  }); 
  
  // --- Define Merged Physics/Spring Configs --- 
  const finalScrollPhysicsConfig = useMemo(() => {
    const baseConfig: Partial<InertialConfig> = InertialPresets.DEFAULT;
    let contextConf: Partial<InertialConfig> = {};
    // Use defaultSpring from context
    if (typeof defaultSpring === 'string' && defaultSpring in InertialPresets) {
      contextConf = InertialPresets[defaultSpring as keyof typeof InertialPresets];
    } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
      // Try to use it as InertialConfig
      contextConf = defaultSpring as Partial<InertialConfig>; 
    }

    let propConf: Partial<InertialConfig> = {};
    // Use animationConfig (treat as flat config or preset name for scroll)
    const propSource = animationConfig;
    if (typeof propSource === 'string' && propSource in InertialPresets) {
      propConf = InertialPresets[propSource as keyof typeof InertialPresets];
    } else if (typeof propSource === 'object' && propSource !== null) {
      propConf = propSource as Partial<InertialConfig>;
    }
    
    // Merge: Base < Context < Prop
    return { ...baseConfig, ...contextConf, ...propConf };
  // Update dependencies - removed physicsConfig.scroll
  }, [defaultSpring, animationConfig]);

  const finalInteractionConfig = useMemo(() => {
    const baseConfig = SpringPresets.SNAPPY; // Base for item interaction
    let contextConf: Partial<SpringConfig> = {};
    // Use defaultSpring from context
    if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
      contextConf = SpringPresets[defaultSpring as keyof typeof SpringPresets];
    } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
      contextConf = defaultSpring as Partial<SpringConfig>;
    }
    let propConf: Partial<SpringConfig> = {};
    // Use animationConfig (treat as flat config or preset name for interaction)
    const propSource = animationConfig;
    if (typeof propSource === 'string' && propSource in SpringPresets) {
      propConf = SpringPresets[propSource as keyof typeof SpringPresets];
    } else if (typeof propSource === 'object' && ('tension' in propSource || 'friction' in propSource)) {
      propConf = propSource as Partial<SpringConfig>;
    }
    // Merge: Base < Context < Prop
    return { ...baseConfig, ...contextConf, ...propConf };
  // Update dependencies - removed physicsConfig.itemInteraction
  }, [defaultSpring, animationConfig]);

  // Update date range (simple state update, okay early)
  useEffect(() => {
    setDateRange(getDateRangeForView(currentDate, currentViewMode, 2));
  }, [currentDate, currentViewMode]);

  // Calculate position for an item on the timeline (depends only on dateRange state)
  const calculateItemPosition = useCallback((date: Date): number => {
    return calculateTimelinePosition(date, dateRange.start, dateRange.end);
  }, [dateRange]);

  // === Define scrollToDate EARLY (depends on calculateItemPosition & physics hook) ===
  const scrollToDate = useCallback((date: Date, smooth = true) => {
    if (!scrollContainerRef.current) return;
    
    // console.warn("scrollToDate using physics scroll"); // Keep console warning minimal

    const position = calculateItemPosition(date);
    const container = scrollContainerRef.current;
    let targetX = physicsScrollPosition.x;
    let targetY = physicsScrollPosition.y;
    
    // Use scrollBounds state directly here
    const currentBounds = scrollBounds; 

    if (orientation === 'vertical') {
      const targetScrollTop = (position / 100) * container.scrollHeight - container.clientHeight / 2;
      // Clamp targetY using bounds
      targetY = clamp(-targetScrollTop, currentBounds.min, currentBounds.max); 
    } else {
       const targetScrollLeft = (position / 100) * container.scrollWidth - container.clientWidth / 2;
       // Clamp targetX using bounds
       targetX = clamp(-targetScrollLeft, currentBounds.min, currentBounds.max);
    }
    
    setPhysicsScrollPosition({ x: targetX, y: targetY });

  // Add scrollBounds to dependency array
  }, [calculateItemPosition, orientation, setPhysicsScrollPosition, physicsScrollPosition, scrollBounds]); 

  // Sync selectedId with activeId from props (now runs AFTER scrollToDate is defined)
  useEffect(() => {
    if (activeId !== undefined) {
      setSelectedId(activeId);
      const selectedItem = items.find(item => item.id === activeId);
      if (selectedItem) {
        scrollToDate(parseDate(selectedItem.date)); 
      }
    }
  }, [activeId, items, scrollToDate]); 
  
  // Create springs for each item (for physics animations)
  const [itemPhysicsProps, setItemPhysicsProps] = useState<Record<string | number, {
    translateX: number;
    translateY: number;
    scale: number;
    opacity: number;
  }>>({});
  
  // Filter items
  const filteredItems = useMemo(() => {
    return filter ? filterItems(items, filter) : items;
  }, [items, filter]);
  
  // Group items by date if needed
  const groupedItems = useMemo(() => {
    if (!groupByDate) return null;
    
    return groupItemsByDate(filteredItems, currentZoomLevel, groupThreshold);
  }, [filteredItems, currentZoomLevel, groupByDate, groupThreshold]);
  
  // Generate time markers
  const timeMarkers = useMemo(() => {
    if (!markers.show) return [];
    
    return generateTimeMarkers(dateRange.start, dateRange.end, 
      markers.primaryInterval || currentZoomLevel);
  }, [dateRange, markers.show, markers.primaryInterval, currentZoomLevel]);
  
  // Format marker label
  const formatMarkerLabel = useCallback((date: Date): string => {
    if (markers.formatter) {
      return markers.formatter(date, currentZoomLevel);
    }
    
    return formatDate(date, currentViewMode, currentZoomLevel);
  }, [currentViewMode, currentZoomLevel, markers.formatter]);
  
  // Determine which side an event should be on
  const getEventSide = useCallback((index: number, itemId: string | number): 'left' | 'right' | 'center' => {
    if (markerPosition === 'left') return 'right';
    if (markerPosition === 'right') return 'left';
    if (markerPosition === 'center') return 'center';
    
    // For alternate, determine based on index or ID
    const idNumber = typeof itemId === 'string' 
      ? itemId.charCodeAt(0) + itemId.charCodeAt(itemId.length - 1)
      : itemId;
      
    return index % 2 === 0 || idNumber % 2 === 0 ? 'right' : 'left';
  }, [markerPosition]);
  
  // Handle date change
  const changeDate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
    onNavigate?.(newDate, currentViewMode);
    scrollToDate(newDate);
  }, [currentViewMode, onNavigate, scrollToDate]);
  
  // Go to previous/next time period
  const goToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (currentViewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
      case 'decade':
        newDate.setFullYear(newDate.getFullYear() - 10);
        break;
    }
    
    changeDate(newDate);
  }, [currentDate, currentViewMode, changeDate]);
  
  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    
    switch (currentViewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
      case 'decade':
        newDate.setFullYear(newDate.getFullYear() + 10);
        break;
    }
    
    changeDate(newDate);
  }, [currentDate, currentViewMode, changeDate]);
  
  // Go to today
  const goToToday = useCallback(() => {
    changeDate(new Date());
  }, [changeDate]);
  
  // Change zoom level
  const changeZoomLevel = useCallback((newZoomLevel: ZoomLevel) => {
    setCurrentZoomLevel(newZoomLevel);
    onZoomChange?.(newZoomLevel);
  }, [onZoomChange]);
  
  // Zoom in/out
  const zoomIn = useCallback(() => {
    const currentIndex = zoomLevels.indexOf(currentZoomLevel);
    if (currentIndex > 0) {
      changeZoomLevel(zoomLevels[currentIndex - 1]);
    }
  }, [currentZoomLevel, zoomLevels, changeZoomLevel]);
  
  const zoomOut = useCallback(() => {
    const currentIndex = zoomLevels.indexOf(currentZoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      changeZoomLevel(zoomLevels[currentIndex + 1]);
    }
  }, [currentZoomLevel, zoomLevels, changeZoomLevel]);
  
  // Handle mouse wheel for zooming OR panning
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Zooming logic (Ctrl key pressed)
    if (allowWheelZoom && e.ctrlKey) {
       e.preventDefault();
       e.stopPropagation(); 
       if (e.deltaY < 0) {
         zoomIn();
       } else {
         zoomOut();
       }
    } 
    // Panning logic (No Ctrl key)
    else {
        // Prevent default page scroll if we handle the wheel event
        e.preventDefault(); 
        e.stopPropagation();

        const wheelScaleFactor = 0.5; // Adjust sensitivity
        let deltaX = 0;
        let deltaY = 0;

        if (orientation === 'vertical') {
            // Standard wheel delta Y scrolls vertically (invert deltaY)
            deltaY = -e.deltaY * wheelScaleFactor; 
        } else { // Horizontal
            // Use deltaX if available, otherwise fallback to deltaY for horizontal scroll (invert delta)
            deltaX = -(e.deltaX || e.deltaY) * wheelScaleFactor;
        }
        
        // Calculate new position based on current physics pos + delta
        let newTargetPosX = physicsScrollPosition.x + deltaX;
        let newTargetPosY = physicsScrollPosition.y + deltaY;

        // Clamp the new position using scrollBounds
        const currentBounds = scrollBounds;
        if (orientation === 'vertical') {
           newTargetPosY = clamp(newTargetPosY, currentBounds.min, currentBounds.max);
           newTargetPosX = physicsScrollPosition.x; // Keep X fixed
        } else { 
           newTargetPosX = clamp(newTargetPosX, currentBounds.min, currentBounds.max);
           newTargetPosY = physicsScrollPosition.y; // Keep Y fixed
        }

        // Set position directly, no inertia from wheel scroll
        setPhysicsScrollPosition({ x: newTargetPosX, y: newTargetPosY }); 
    }
    
  // Add dependencies: physicsScrollPosition, setPhysicsScrollPosition, scrollBounds, orientation
  }, [allowWheelZoom, zoomIn, zoomOut, physicsScrollPosition, setPhysicsScrollPosition, scrollBounds, orientation]);
  
  // Handle item click
  const handleItemClick = useCallback((item: TimelineItem) => {
    // Select the item
    setSelectedId(item.id);
    
    // Call callbacks
    onItemClick?.(item);
    onItemSelect?.(item);
    
    // Scroll to the date
    scrollToDate(parseDate(item.date));
  }, [onItemClick, onItemSelect, scrollToDate]);
  
  // Apply animations to items when they change
  useEffect(() => {
    if (!animateOnChange || isInitialMount.current) return;
    
    // Only animate when not the first mount
    const existingItemIds = new Set(
      Object.keys(itemPhysicsProps).map(id => id.toString())
    );
    
    // Get the list of items to render
    const itemsToRender = groupedItems
      ? Object.values(groupedItems).flat()
      : filteredItems;
    
    // Apply physics animations to newly added items
    itemsToRender.forEach((item, index) => {
      const itemId = item.id.toString();
      
      // If item wasn't in previous state, animate it
      if (!existingItemIds.has(itemId)) {
        // Movement direction based on orientation
        const initialX = orientation === 'vertical' ? 30 : 0;
        const initialY = orientation === 'vertical' ? 0 : 30;
        
        // Create physics props for new items with initial values
        setItemPhysicsProps(prev => ({
          ...prev,
          [itemId]: {
            translateX: initialX,
            translateY: initialY,
            scale: 0.9,
            opacity: 0
          }
        }));
        
        // Animate to final position with slight delay
        setTimeout(() => {
          setItemPhysicsProps(prev => ({
            ...prev,
            [itemId]: {
              translateX: 0,
              translateY: 0,
              scale: 1,
              opacity: 1
            }
          }));
        }, (physics.staggerDelay || 50) * index);
      }
    });
  }, [
    filteredItems, 
    groupedItems, 
    orientation, 
    animateOnChange,
    physics.staggerDelay
  ]);
  
  // Initial mount animations
  useEffect(() => {
    // Mark that we're no longer in initial mount
    isInitialMount.current = false;
    
    if (!animateOnMount) return;
    
    // Get the list of items to render
    const itemsToRender = groupedItems
      ? Object.values(groupedItems).flat()
      : filteredItems;
    
    // For spring animations, set initial and target values
    if (animation === 'spring') {
      // Apply spring animations to all items
      itemsToRender.forEach((item, index) => {
        const itemId = item.id.toString();
        const initialX = orientation === 'vertical' ? 30 : 0;
        const initialY = orientation === 'vertical' ? 0 : 30;
        
        // Set initial values
        setItemPhysicsProps(prev => ({
          ...prev,
          [itemId]: {
            translateX: initialX,
            translateY: initialY,
            scale: 0.9,
            opacity: 0
          }
        }));
        
        // Animate to final position with staggered delay
        setTimeout(() => {
          setItemPhysicsProps(prev => ({
            ...prev,
            [itemId]: {
              translateX: 0,
              translateY: 0,
              scale: 1,
              opacity: 1
            }
          }));
        }, (physics.staggerDelay || 50) * index);
      });
    }
  }, [
    animateOnMount, 
    animation, 
    filteredItems, 
    groupedItems, 
    orientation,
    physics.staggerDelay
  ]);
  
  // === Bounds Calculation Effect (runs AFTER filteredItems/groupedItems defined) ===
  useEffect(() => {
    if (!scrollContainerRef.current || !eventsContainerRef.current) return;

    const container = scrollContainerRef.current;
    const content = eventsContainerRef.current;

    let minBound = 0;
    let maxBound = 0; // Max is always 0 (top/left edge)

    if (orientation === 'vertical') {
        const contentHeight = content.scrollHeight;
        const containerHeight = container.clientHeight;
        // Minimum bound is negative scrollable distance
        minBound = containerHeight >= contentHeight ? 0 : -(contentHeight - containerHeight);
    } else { // Horizontal
        const contentWidth = content.scrollWidth;
        const containerWidth = container.clientWidth;
        minBound = containerWidth >= contentWidth ? 0 : -(contentWidth - containerWidth);
    }

    const newBounds = { min: minBound, max: maxBound };

    // Only update state and config if bounds actually changed
    if (newBounds.min !== scrollBounds.min || newBounds.max !== scrollBounds.max) {
        setScrollBounds(newBounds);
        // Update physics config with NEW bounds AND the merged physics config
        // REMOVED immediate flag from config object
        updatePhysicsConfig({ 
            bounds: newBounds, 
            ...finalScrollPhysicsConfig // Pass the merged config here
        }); 
    }

  // Keep dependencies, removed finalDisableAnimation as immediate is not passed
  }, [orientation, items, filteredItems, groupedItems, scrollBounds, updatePhysicsConfig, finalScrollPhysicsConfig]); 

  // === Effect to Trigger Load More ===
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const thresholdFactor = 0.2; // Load when 20% from edge
    let currentPos: number;
    let clientSize: number;
    
    if (orientation === 'vertical') {
      currentPos = physicsScrollPosition.y; // This is negative, max is 0
      clientSize = container.clientHeight;
    } else { // Horizontal
      currentPos = physicsScrollPosition.x; // Also negative, max is 0
      clientSize = container.clientWidth;
    }

    const minBound = scrollBounds.min;
    const maxBound = scrollBounds.max; // Should always be 0

    // Check for loading past (scrolling towards min boundary)
    // Ensure minBound is less than 0 to avoid triggering when content fits
    const pastLoadThreshold = minBound < 0 ? minBound + clientSize * thresholdFactor : 0;
    if (
      hasMorePast && 
      onLoadMorePast && 
      !loadingPast && 
      currentPos < pastLoadThreshold && // Position is close to or beyond the minimum bound
      minBound < 0 // Only trigger if there's actually something to scroll past
    ) {
       // console.log("Triggering Load More Past");
       onLoadMorePast();
    }

    // Check for loading future (scrolling towards max boundary, which is 0)
    // Ensure minBound is less than 0 to avoid triggering when content fits
    const futureLoadThreshold = minBound < 0 ? maxBound - clientSize * thresholdFactor : 0; // e.g., -100 if clientSize is 500
    if (
      hasMoreFuture && 
      onLoadMoreFuture && 
      !loadingFuture && 
      currentPos > futureLoadThreshold && // Position is close to the maximum bound (0)
      minBound < 0 // Only trigger if there's scrollable area
    ) {
      // console.log("Triggering Load More Future");
      onLoadMoreFuture();
    }

  // Dependencies: position, bounds, loading/hasMore flags, callbacks, orientation
  }, [
      physicsScrollPosition, 
      scrollBounds, 
      orientation, 
      loadingPast, 
      loadingFuture, 
      hasMorePast, 
      hasMoreFuture, 
      onLoadMorePast, 
      onLoadMoreFuture
  ]);
  
  // === Re-add Pointer Event Handlers ===
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType !== 'touch') return;
    e.preventDefault(); 
    
    isDragging.current = true;
    pointerId.current = e.pointerId;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    lastDragPos.current = physicsScrollPosition; 
    
    stopPhysicsScroll(); 
    velocityTracker.current = []; 
    
    e.currentTarget.setPointerCapture(e.pointerId); 
    
  }, [physicsScrollPosition, stopPhysicsScroll]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || e.pointerId !== pointerId.current) return;
    
    const currentPos = { x: e.clientX, y: e.clientY };
    const timestamp = e.timeStamp;
    
    const tracker = velocityTracker.current;
    while (tracker.length > 0 && timestamp - tracker[0].t > 100) {
      tracker.shift();
    }
    tracker.push({ t: timestamp, x: currentPos.x, y: currentPos.y });

    const delta = { 
      x: currentPos.x - dragStartPos.current.x, 
      y: currentPos.y - dragStartPos.current.y 
    };
    
    let newTargetPosX = lastDragPos.current.x + delta.x;
    let newTargetPosY = lastDragPos.current.y + delta.y;
    
    // --- Clamp target position during drag ---
    const currentBounds = scrollBounds; // Use state value
    if (orientation === 'vertical') {
       newTargetPosY = clamp(newTargetPosY, currentBounds.min, currentBounds.max);
       // Keep X unchanged if vertical
       newTargetPosX = physicsScrollPosition.x; 
    } else { // Horizontal
       newTargetPosX = clamp(newTargetPosX, currentBounds.min, currentBounds.max);
       // Keep Y unchanged if horizontal
       newTargetPosY = physicsScrollPosition.y;
    }
    // --- End Clamping ---
    
    setPhysicsScrollPosition({ x: newTargetPosX, y: newTargetPosY });
    
  // Add scrollBounds and orientation to dependencies
  }, [setPhysicsScrollPosition, scrollBounds, orientation, physicsScrollPosition]); 

  const handlePointerUpOrLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || e.pointerId !== pointerId.current) return;
    
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    pointerId.current = null;
    
    let velocity = { x: 0, y: 0 };
    const tracker = velocityTracker.current;
    if (tracker.length >= 2) {
      const first = tracker[0];
      const last = tracker[tracker.length - 1];
      const dt = (last.t - first.t) / 1000; 
      if (dt > 0) {
        const velocityFactor = 1.5; 
        velocity = {
          x: ((last.x - first.x) / dt) * velocityFactor,
          y: ((last.y - first.y) / dt) * velocityFactor,
        };
      }
    }
    velocityTracker.current = [];

    if (Math.abs(velocity.x) > 10 || Math.abs(velocity.y) > 10) {
       flickPhysicsScroll(velocity);
    }
    
  }, [flickPhysicsScroll]);

  // Render a timeline event
  const renderEvent = (item: TimelineItem, index: number, isGrouped = false) => {
    const date = parseDate(item.date);
    const position = calculateItemPosition(date);
    const side = getEventSide(index, item.id);
    const isActive = selectedId === item.id || !!item.active;
    
    // Get physics props for ENTRANCE animation (or default values)
    const entrancePhysicsProps = itemPhysicsProps[item.id.toString()] || {
      translateX: 0,
      translateY: 0,
      scale: 1,
      opacity: 1
    };
    
    // --- Add Hover/Focus State & Interaction Physics --- 
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const interactionTarget = useMemo(() => ({
      scale: finalDisableAnimation ? 1 : (isHovered || isFocused) ? 1.04 : 1,
      // Add a subtle lift on hover/focus
      y: finalDisableAnimation ? 0 : (isHovered || isFocused) ? -3 : 0, 
    }), [finalDisableAnimation, isHovered, isFocused]);

    const { values: interactionValues, start: startInteractionSpring } = useMultiSpring({
      from: { scale: 1, y: 0 },
      to: interactionTarget,
      animationConfig: finalInteractionConfig, // Use the merged interaction config
      immediate: finalDisableAnimation, // Pass immediate flag
    });
    // --- End Interaction Physics ---

    // For grouped items, show count instead of individual items
    if (isGrouped && index > 0) return null;
    
    // Custom marker renderer
    const customMarker = renderMarker ? renderMarker(item) : null;
    
    // Calculate stagger delay
    const staggerDelay = (physics.staggerDelay || 50) * index;
    
    return (
      <TimelineItem
        key={item.id}
        data-item-id={item.id}
        ref={el => {
          if (el) itemRefs.current.set(item.id, el);
          else itemRefs.current.delete(item.id);
        }}
        $orientation={orientation}
        $position={position}
        $side={side}
        $isActive={isActive}
        $isHighlighted={!!item.highlighted}
        $color={item.color || color}
        $reducedMotion={finalDisableAnimation} // Use finalDisableAnimation here
        style={{
          transform: `translateY(-50%) translate(${entrancePhysicsProps.translateX}px, ${entrancePhysicsProps.translateY + interactionValues.y}px) scale(${entrancePhysicsProps.scale * interactionValues.scale})`,
          opacity: entrancePhysicsProps.opacity
        }}
        className={markerClassName}
        onClick={() => handleItemClick(item)}
        tabIndex={0}
        role="button"
        aria-pressed={isActive}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleItemClick(item);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {side === 'left' && orientation === 'vertical' && (
          <>
            <EventContent
              $orientation={orientation}
              $isActive={isActive}
              $isGlass={glassContent}
              $glassVariant={glassVariant}
              $blurStrength={blurStrength}
              $color={item.color || color}
              className={contentClassName}
            >
              {renderContent ? (
                renderContent(item)
              ) : (
                <>
                  <EventTitle $color={item.color || color} $isActive={isActive}>
                    {item.title}
                  </EventTitle>
                  <EventDate>
                    {formatDate(date, currentViewMode, currentZoomLevel)}
                  </EventDate>
                  {item.content && (
                    <EventDescription>
                      {typeof item.content === 'string' 
                        ? item.content 
                        : item.content
                      }
                    </EventDescription>
                  )}
                  {isGrouped && (
                    <GroupedEvents>
                      Multiple events 
                      <span className="events-count">
                        {Array.isArray(groupedItems) && groupedItems.length}
                      </span>
                    </GroupedEvents>
                  )}
                </>
              )}
            </EventContent>
            <EventConnector
              $orientation={orientation}
              $side={side}
              $color={item.color || color}
              $isActive={isActive}
            />
          </>
        )}
        
        {/* Marker */}
        {customMarker || (
          <MarkerCircle
            $color={item.color || color}
            $isActive={isActive}
            $isGlass={glassMarkers}
            $size={density === 'compact' ? 'small' : density === 'spacious' ? 'large' : 'medium'}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
            $hasIcon={!!item.icon}
          >
            {item.icon}
          </MarkerCircle>
        )}
        
        {(side === 'right' && orientation === 'vertical') || orientation === 'horizontal' ? (
          <>
            <EventConnector
              $orientation={orientation}
              $side={side}
              $color={item.color || color}
              $isActive={isActive}
            />
            <EventContent
              $orientation={orientation}
              $isActive={isActive}
              $isGlass={glassContent}
              $glassVariant={glassVariant}
              $blurStrength={blurStrength}
              $color={item.color || color}
              $maxWidth={orientation === 'horizontal' ? 250 : undefined}
              className={contentClassName}
            >
              {renderContent ? (
                renderContent(item)
              ) : (
                <>
                  <EventTitle $color={item.color || color} $isActive={isActive}>
                    {item.title}
                  </EventTitle>
                  <EventDate>
                    {formatDate(date, currentViewMode, currentZoomLevel)}
                  </EventDate>
                  {item.content && (
                    <EventDescription>
                      {typeof item.content === 'string' 
                        ? item.content 
                        : item.content
                      }
                    </EventDescription>
                  )}
                  {isGrouped && (
                    <GroupedEvents>
                      Multiple events 
                      <span className="events-count">
                        {Array.isArray(groupedItems) && groupedItems.length}
                      </span>
                    </GroupedEvents>
                  )}
                </>
              )}
            </EventContent>
          </>
        ) : null}
      </TimelineItem>
    );
  };
  
  // Render events
  const renderEvents = () => {
    // If using groups
    if (groupedItems) {
      return Object.entries(groupedItems).map(([dateKey, itemsForDate], groupIndex) => {
        // For each date group, render items
        return itemsForDate.map((item, itemIndex) => 
          renderEvent(
            item, 
            groupIndex * 100 + itemIndex, 
            itemsForDate.length > 1 && itemIndex > 0
          )
        );
      });
    }
    
    // Render items directly if not grouping
    return filteredItems.map((item, index) => renderEvent(item, index));
  };
  
  // Render time markers
  const renderTimeMarkers = () => {
    if (!markers.show || !timeMarkers.length) return null;
    
    const now = new Date();
    const markerHeight = orientation === 'vertical' ? 50 : 50;
    
    return (
      <TimeMarkers $orientation={orientation} $height={markerHeight}>
        {timeMarkers.map((date, index) => {
          const position = calculateItemPosition(date);
          const isPrimary = index % 2 === 0;
          const isNowMarker = markers.showNow && isToday(date);
          
          return (
            <TimeMarker
              key={date.getTime()}
              $orientation={orientation}
              $position={position}
              $isPrimary={isPrimary}
              $isNow={isNowMarker}
              $color={color}
              data-label={formatMarkerLabel(date)}
            />
          );
        })}
      </TimeMarkers>
    );
  };
  
  // Empty state when no items are available
  const renderEmptyState = () => {
    return (
      <EmptyStateMessage>
        <div className="icon">📅</div>
        <div className="title">No events found</div>
        <div className="message">There are no events to display in the current timeline view.</div>
      </EmptyStateMessage>
    );
  };
  
  return (
    <TimelineContainer
      ref={containerRef}
      $orientation={orientation}
      $width={width}
      $height={height}
      $glassVariant={glassVariant}
      $blurStrength={blurStrength}
      $color={color}
      className={className}
      id={id}
      aria-label={ariaLabel || 'Timeline'}
      onWheel={handleWheel}
    >
      {/* Navigation controls */}
      {navigation === 'button' && (
        <TimelineControls
          $orientation={orientation}
          $position={orientation === 'vertical' ? 'left' : 'top'}
        >
          <TimelineButton
            $color={color}
            $isGlass={true}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
            onClick={goToPrevious}
            aria-label="Previous"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </TimelineButton>
          
          <TimelineButton
            $color={color}
            $isGlass={true}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
            onClick={goToToday}
            aria-label="Today"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </TimelineButton>
          
          <TimelineButton
            $color={color}
            $isGlass={true}
            $glassVariant={glassVariant}
            $blurStrength={blurStrength}
            onClick={goToNext}
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </TimelineButton>
          
          {zoomLevels.length > 1 && (
            <ZoomControls>
              <ZoomLabel>Zoom</ZoomLabel>
              <TimelineButton
                $color={color}
                $isGlass={true}
                $glassVariant={glassVariant}
                $blurStrength={blurStrength}
                onClick={zoomIn}
                disabled={zoomLevels.indexOf(currentZoomLevel) === 0}
                aria-label="Zoom in"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </TimelineButton>
              
              <TimelineButton
                $color={color}
                $isGlass={true}
                $glassVariant={glassVariant}
                $blurStrength={blurStrength}
                onClick={zoomOut}
                disabled={zoomLevels.indexOf(currentZoomLevel) === zoomLevels.length - 1}
                aria-label="Zoom out"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 12h8" />
                </svg>
              </TimelineButton>
            </ZoomControls>
          )}
        </TimelineControls>
      )}
      
      {/* Main timeline scroll container */}
      <TimelineScrollContainer
        ref={scrollContainerRef}
        $orientation={orientation}
        $scrollX={physicsScrollPosition.x}
        $scrollY={physicsScrollPosition.y}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
      >
        {/* Loading indicator for past events */}
        {loadingPast && (
          <LoadingIndicator>
            <div className="spinner" />
            <span>Loading earlier events...</span>
          </LoadingIndicator>
        )}
        
        {/* Wrap TimelineEvents in the ref container */}
        <div ref={eventsContainerRef}>
          <TimelineEvents
            $orientation={orientation}
            $markerPosition={markerPosition}
            $density={density}
          >
            {/* Timeline axis */}
            {showAxis && (
              <TimelineAxis
                $orientation={orientation}
                $height={orientation === 'horizontal' ? 50 : 0}
                $glassVariant={glassVariant}
                $blurStrength={blurStrength}
              />
            )}
            
            {/* Time markers */}
            {renderTimeMarkers()}
            
            {/* Events */}
            {filteredItems.length === 0 ? renderEmptyState() : renderEvents()}
          </TimelineEvents>
        </div>
        
        {/* Loading indicator for future events */}
        {loadingFuture && (
          <LoadingIndicator>
            <div className="spinner" />
            <span>Loading more events...</span>
          </LoadingIndicator>
        )}
      </TimelineScrollContainer>
    </TimelineContainer>
  );
};

export default GlassTimeline;
