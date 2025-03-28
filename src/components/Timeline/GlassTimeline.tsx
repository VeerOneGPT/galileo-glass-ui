/**
 * GlassTimeline Component
 * 
 * A glass-styled timeline component for displaying chronological events
 * with physics-based animations and interactions.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';

// Physics-related imports
import { useSpring } from '../../animations/physics/useSpring';
import { useInertialMovement } from '../../animations/physics/useInertialMovement';
import { SpringPresets } from '../../animations/physics/springPhysics';

// Core styling imports
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

// Hooks and utilities
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
  overflow: auto;
  overscroll-behavior: contain;
  transform: translate(${props => props.$scrollX}px, ${props => props.$scrollY}px);
  transition: transform 0.05s linear;
  ${props => props.$orientation === 'vertical' 
    ? 'overflow-x: hidden; overflow-y: auto;' 
    : 'overflow-x: auto; overflow-y: hidden;'
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

const TimelineItem = styled.div<{
  $orientation: TimelineOrientation;
  $position: number;
  $side: 'left' | 'right' | 'center';
  $isActive: boolean;
  $isHighlighted: boolean;
  $color?: string;
  $animation: TimelineAnimationType;
  $staggerDelay: number;
  $reducedMotion: boolean;
  $translateX: number;
  $translateY: number;
  $scale: number;
  $opacity: number;
}>`
  position: absolute;
  z-index: 5;
  
  /* Position based on orientation */
  ${props => props.$orientation === 'vertical' 
    ? `
      top: ${props.$position}%;
      transform: translateY(-50%);
      ${props.$side === 'left' ? 'left: 0;' : props.$side === 'right' ? 'right: 0;' : 'left: 50%;'}
    ` 
    : `
      left: ${props.$position}%;
      transform: translateX(-50%);
      ${props.$side === 'left' ? 'top: 0;' : props.$side === 'right' ? 'bottom: 0;' : 'top: 50%;'}
    `
  }
  
  /* Active state */
  ${props => props.$isActive && css`
    z-index: 6;
  `}
  
  /* Highlighted state */
  ${props => props.$isHighlighted && css`
    animation: ${pulseAnimation} 1.5s ease-in-out infinite;
  `}
  
  /* Apply physics-based transform */
  transform: ${props => props.$orientation === 'vertical'
    ? `translateY(-50%) translate(${props.$translateX}px, ${props.$translateY}px) scale(${props.$scale})`
    : `translateX(-50%) translate(${props.$translateX}px, ${props.$translateY}px) scale(${props.$scale})`
  };
  opacity: ${props => props.$opacity};
  
  /* Animation types (for initial mount) */
  ${props => {
    if (props.$reducedMotion) return '';
    
    let animation;
    const delay = `${props.$staggerDelay}ms`;
    
    switch (props.$animation) {
      case 'fade':
        animation = css`animation: ${fadeIn} 0.5s ease-out forwards;`;
        break;
      case 'scale':
        animation = css`animation: ${scaleIn} 0.5s ease-out forwards;`;
        break;
      case 'slide':
        animation = props.$orientation === 'vertical'
          ? css`animation: ${slideInHorizontal} 0.5s ease-out forwards;`
          : css`animation: ${slideInVertical} 0.5s ease-out forwards;`;
        break;
      case 'spring':
        // Spring animation is handled by the physics hooks
        return '';
      default:
        return '';
    }
    
    return css`
      ${animation}
      animation-delay: ${delay};
      animation-fill-mode: backwards;
    `;
  }}
  
  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'row' : 'column'};
  align-items: ${props => props.$orientation === 'vertical' 
    ? 'center' 
    : props.$side === 'center' ? 'center' : 'flex-start'
  };
  
  ${props => props.$orientation === 'vertical' && props.$side === 'center' && css`
    transform: translate(-50%, -50%) translate(${props.$translateX}px, ${props.$translateY}px) scale(${props.$scale});
  `}
  
  ${props => props.$orientation === 'horizontal' && props.$side === 'center' && css`
    transform: translate(-50%, -50%) translate(${props.$translateX}px, ${props.$translateY}px) scale(${props.$scale});
  `}
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
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Size based on prop */
  ${props => {
    const baseSize = props.$hasIcon 
      ? { small: 24, medium: 32, large: 40 }[props.$size]
      : { small: 12, medium: 16, large: 20 }[props.$size];
    
    return `
      width: ${baseSize}px;
      height: ${baseSize}px;
      ${props.$hasIcon ? `font-size: ${baseSize / 1.8}px;` : ''}
    `;
  }}
  
  border-radius: 50%;
  background-color: ${props => props.$isActive 
    ? `var(--color-${props.$color || 'primary'}, rgba(99, 102, 241, 0.8))` 
    : 'rgba(255, 255, 255, 0.2)'
  };
  
  /* Glass styling if enabled */
  ${props => props.$isGlass && props.$glassVariant && css`
    ${() => glassSurface({
      elevation: 2,
      blurStrength: props.$blurStrength || 'standard',
      backgroundOpacity: 'light',
      borderOpacity: 'subtle',
      tintColor: props.$color !== 'default' ? `var(--color-${props.$color}-transparent)` : undefined,
      themeContext: createThemeContext(props.theme),
    })}
    
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, ${props.$isActive ? '0.2' : '0.1'});
  `}
  
  /* Active state styling */
  ${props => props.$isActive && css`
    box-shadow: 0 0 10px 2px var(--color-${props.$color || 'primary'}-transparent, rgba(99, 102, 241, 0.4));
  `}
  
  /* Inner dot for non-icon markers */
  ${props => !props.$hasIcon && css`
    &::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: ${props.$isActive 
        ? 'rgba(255, 255, 255, 0.9)' 
        : 'rgba(255, 255, 255, 0.5)'
      };
    }
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
  
  /* Glass styling if enabled */
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
  
  /* Non-glass styling */
  ${props => !props.$isGlass && css`
    background-color: rgba(0, 0, 0, ${props.$isActive ? '0.3' : '0.2'});
    border: 1px solid rgba(255, 255, 255, ${props.$isActive ? '0.15' : '0.1'});
    
    ${props.$isActive && css`
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    `}
  `}
  
  /* Active state glow effect */
  ${props => props.$isActive && css`
    ${() => glassGlow({
      color: `var(--color-${props.$color || 'primary'}, rgba(99, 102, 241, 0.8))`,
      intensity: 'light',
      themeContext: createThemeContext(props.theme),
    })}
  `}
  
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    ${props => props.$isGlass 
      ? `border-color: rgba(255, 255, 255, 0.2);` 
      : `background-color: rgba(0, 0, 0, 0.3);`
    }
  }
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
  
  /* Glass styling if enabled */
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
  
  /* Icon styling */
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

/**
 * GlassTimeline Component
 */
export const GlassTimeline: React.FC<TimelineProps> = ({
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
  ariaLabel
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
  const [isScrolling, setIsScrolling] = useState(false);
  const [dateRange, setDateRange] = useState(getDateRangeForView(parsedInitialDate, viewMode, 2));
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollPosition = useRef({ x: 0, y: 0 });
  const itemRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
  const isInitialMount = useRef(true);
  
  // Accessibility
  const reducedMotion = useReducedMotion();
  
  // Update date range when view mode or current date changes
  useEffect(() => {
    setDateRange(getDateRangeForView(currentDate, currentViewMode, 2));
  }, [currentDate, currentViewMode]);
  
  // Sync selectedId with activeId from props
  useEffect(() => {
    if (activeId !== undefined) {
      setSelectedId(activeId);
      
      // Find the item by ID and scroll to it
      const selectedItem = items.find(item => item.id === activeId);
      if (selectedItem) {
        scrollToDate(parseDate(selectedItem.date));
      }
    }
  }, [activeId, items]);
  
  // Set up springs for animations
  const { position: scrollPosition, setPosition: setScrollPosition } = usePositionInertia({ x: 0, y: 0 });

  // Track scroll position separately
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  // Get spring config
  const springConfig = useMemo(() => {
    if (physics.preset) {
      return SpringPresets[physics.preset.toUpperCase() as keyof typeof SpringPresets];
    }
    
    return {
      tension: physics.tension || 170,
      friction: physics.friction || 26,
      mass: physics.mass || 1
    };
  }, [physics]);
  
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
  
  // Calculate position for an item on the timeline
  const calculateItemPosition = useCallback((date: Date): number => {
    return calculateTimelinePosition(date, dateRange.start, dateRange.end);
  }, [dateRange]);
  
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
  
  // Scroll to a specific date
  const scrollToDate = useCallback((date: Date, smooth = true) => {
    if (!scrollContainerRef.current) return;
    
    const position = calculateItemPosition(date);
    
    if (orientation === 'vertical') {
      const scrollTop = (position / 100) * scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTo({
        top: scrollTop - scrollContainerRef.current.clientHeight / 2,
        behavior: smooth && !reducedMotion ? 'smooth' : 'auto'
      });
    } else {
      const scrollLeft = (position / 100) * scrollContainerRef.current.scrollWidth;
      scrollContainerRef.current.scrollTo({
        left: scrollLeft - scrollContainerRef.current.clientWidth / 2,
        behavior: smooth && !reducedMotion ? 'smooth' : 'auto'
      });
    }
  }, [calculateItemPosition, orientation, reducedMotion]);
  
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
  
  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!allowWheelZoom) return;
    
    // If Ctrl key is pressed, use wheel for zooming
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, [allowWheelZoom, zoomIn, zoomOut]);
  
  // Handle scroll events for loading more events
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = scrollContainerRef.current;
    
    // Update lastScrollPosition
    lastScrollPosition.current = { 
      x: scrollLeft, 
      y: scrollTop 
    };
    
    // Check if scrolling and reset after a delay
    setIsScrolling(true);
    clearTimeout(window.setTimeout(() => {}, 0)); // Clear any existing timeout
    window.setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    
    // Load more past events when scrolling to the top/left
    if (hasMorePast && onLoadMorePast) {
      const isPastEdge = orientation === 'vertical'
        ? scrollTop < clientHeight * 0.2
        : scrollLeft < clientWidth * 0.2;
        
      if (isPastEdge && !loadingPast) {
        onLoadMorePast();
      }
    }
    
    // Load more future events when scrolling to the bottom/right
    if (hasMoreFuture && onLoadMoreFuture) {
      const isFutureEdge = orientation === 'vertical'
        ? scrollTop + clientHeight > scrollHeight * 0.8
        : scrollLeft + clientWidth > scrollWidth * 0.8;
        
      if (isFutureEdge && !loadingFuture) {
        onLoadMoreFuture();
      }
    }
  }, [
    orientation, 
    loadingPast, 
    loadingFuture, 
    hasMorePast, 
    hasMoreFuture, 
    onLoadMorePast, 
    onLoadMoreFuture
  ]);
  
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
  
  // Render a timeline event
  const renderEvent = (item: TimelineItem, index: number, isGrouped = false) => {
    const date = parseDate(item.date);
    const position = calculateItemPosition(date);
    const side = getEventSide(index, item.id);
    const isActive = selectedId === item.id || !!item.active;
    
    // Get physics props for this item (or default values)
    const physicsProps = itemPhysicsProps[item.id.toString()] || {
      translateX: 0,
      translateY: 0,
      scale: 1,
      opacity: 1
    };
    
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
        $animation={animation}
        $staggerDelay={staggerDelay}
        $reducedMotion={reducedMotion}
        $translateX={physicsProps.translateX}
        $translateY={physicsProps.translateY}
        $scale={physicsProps.scale}
        $opacity={physicsProps.opacity}
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
        $scrollX={scrollPosition.x}
        $scrollY={scrollPosition.y}
        onScroll={handleScroll}
      >
        {/* Loading indicator for past events */}
        {loadingPast && (
          <LoadingIndicator>
            <div className="spinner" />
            <span>Loading earlier events...</span>
          </LoadingIndicator>
        )}
        
        {/* Timeline content */}
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