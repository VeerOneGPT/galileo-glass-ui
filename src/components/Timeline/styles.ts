/**
 * Styled components for GlassTimeline
 */
import styled, { css, keyframes } from 'styled-components';
import { TimelineOrientation, MarkerPosition, TimelineDensity } from './types';
// Removed import from './styled'
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';

// Exported types moved here (or could be in types.ts)
export type GlassVariant = 'clear' | 'frosted' | 'tinted';
export type BlurStrength = 'light' | 'standard' | 'strong';

// Animation keyframes
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const slideInHorizontal = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const slideInVertical = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

export const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Main container
export const TimelineContainer = styled.div<{
  $orientation: TimelineOrientation;
  $width?: string | number;
  $height?: string | number;
  $glassVariant?: GlassVariant;
  $blurStrength?: BlurStrength;
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

// Scroll container
export const TimelineScrollContainer = styled.div<{
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

// Timeline axis
export const TimelineAxis = styled.div<{
  $orientation: TimelineOrientation;
  $height: number;
  $glassVariant?: GlassVariant;
  $blurStrength?: BlurStrength;
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

// Time markers container
export const TimeMarkers = styled.div<{
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

// Individual time marker
export const TimeMarker = styled.div<{
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

// Timeline events container
export const TimelineEvents = styled.div<{
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

// Individual timeline item
export const TimelineItem = styled.div.attrs<{ style: React.CSSProperties }>(props => ({
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

// Marker circle
export const MarkerCircle = styled.div<{
  $color?: string;
  $isActive: boolean;
  $isGlass: boolean;
  $size: 'small' | 'medium' | 'large';
  $glassVariant?: GlassVariant;
  $blurStrength?: BlurStrength;
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

// Event connector (line between marker and content)
export const EventConnector = styled.div<{
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

// Event content container
export const EventContent = styled.div<{
  $orientation: TimelineOrientation;
  $isActive: boolean;
  $isGlass: boolean;
  $glassVariant?: GlassVariant;
  $blurStrength?: BlurStrength;
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

// Event title
export const EventTitle = styled.div<{ 
  $color?: string; 
  $isActive: boolean 
}>`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.$isActive 
    ? `var(--color-${props.$color || 'primary'}-light, rgba(149, 152, 241, 0.9))` 
    : 'rgba(255, 255, 255, 0.9)'
  };
  margin-bottom: 4px;
`;

// Event date
export const EventDate = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
`;

// Event description
export const EventDescription = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

// Grouped events indicator
export const GroupedEvents = styled.div`
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

// Loading indicator
export const LoadingIndicator = styled.div`
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

// Empty state message
export const EmptyStateMessage = styled.div`
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

/**
 * Styled components for timeline controls
 */
export const TimelineControls = styled.div<{
  $orientation: 'vertical' | 'horizontal';
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

export const TimelineButton = styled.button<{
  $color?: string;
  $isGlass: boolean;
  $glassVariant?: GlassVariant;
  $blurStrength?: BlurStrength;
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

export const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 10px;
`;

export const ZoomLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
`;