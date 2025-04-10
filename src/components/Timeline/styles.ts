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
  $height?: number;
  $glassVariant?: GlassVariant;
  $blurStrength?: BlurStrength;
  $markerPosition: MarkerPosition;
  $color?: string;
}>`
  position: relative;
  z-index: 3;
  
  ${props => props.$orientation === 'vertical' 
    ? `
      width: ${props.$height || 40}px;
      height: 100%;
      position: absolute;
      ${props.$markerPosition === 'left' ? 'left: 0;' : 'right: 0;'}
    ` 
    : `
      height: ${props.$height || 40}px;
      width: 100%;
      position: absolute;
      ${props.$markerPosition === 'left' ? 'top: 0;' : 'bottom: 0;'}
    `
  }
  
  ${props => glassSurface({
    elevation: 0,
    blurStrength: props.$blurStrength || 'light',
    backgroundOpacity: 'light',
    borderOpacity: 'none',
    themeContext: createThemeContext(props.theme),
  })}
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
  $hideLabel?: boolean;
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
    : props.$isPrimary 
      ? 'rgba(255, 255, 255, 0.4)' 
      : 'rgba(255, 255, 255, 0.15)'};
  
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
      font-size: ${props.$isPrimary ? '0.8rem' : '0.7rem'};
      font-weight: ${props.$isPrimary ? '500' : '400'};
      color: rgba(255, 255, 255, ${props.$isPrimary ? '0.9' : '0.5'});
      margin-top: 4px;
      opacity: ${props.$isPrimary ? '1' : '0.8'};
      /* Hide label if specified */
      display: ${props.$hideLabel ? 'none' : 'block'};
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
      font-size: ${props.$isPrimary ? '0.8rem' : '0.7rem'};
      font-weight: ${props.$isPrimary ? '500' : '400'};
      color: rgba(255, 255, 255, ${props.$isPrimary ? '0.9' : '0.5'});
      opacity: ${props.$isPrimary ? '1' : '0.8'};
      /* Hide label if specified */
      display: ${props.$hideLabel ? 'none' : 'block'};
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
  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'column' : 'row'};
  
  /* Use CSS custom property for dynamic spacing from JavaScript */
  gap: var(--timeline-item-spacing, ${props => {
    switch (props.$density) {
      case 'compact': return '8px'; 
      case 'spacious': return '20px';
      default: return '15px';
    }
  }});
  
  padding: ${props => {
    switch (props.$density) {
      case 'compact': return '8px'; 
      case 'spacious': return '25px';
      default: return '15px';
    }
  }};
  
  ${props => props.$orientation === 'vertical' 
    ? `
      padding-left: ${props.$markerPosition === 'left' ? '70px' : '25px'}; 
      padding-right: ${props.$markerPosition === 'right' ? '70px' : '25px'}; 
      width: 100%;
      min-height: 100%;
    ` 
    : `
      padding-top: ${props.$markerPosition === 'left' ? '70px' : '25px'};
      padding-bottom: ${props.$markerPosition === 'right' ? '70px' : '25px'};
      height: 100%;
      min-width: 100%;
    `
  }
`;

// Individual timeline item - Use relative positioning + margin for spacing
export const TimelineItem = styled.div.attrs<{ style: React.CSSProperties }>(props => ({
  // Apply only animation transform/opacity via style prop
  style: { 
      transform: props.style?.transform ?? 'none',
      opacity: props.style?.opacity ?? 1,
      // position: 'absolute' // REMOVE
  }, 
}))<{
  $orientation: TimelineOrientation; 
  $side: 'left' | 'right' | 'center'; // Still needed for margin logic
  $isActive: boolean; 
  $color?: string;
  style: React.CSSProperties; // Will contain transform, opacity ONLY
  $density: 'compact' | 'normal' | 'spacious';
}>`
  position: relative; // <<< BACK TO RELATIVE
  display: flex; 
  /* width: 100%; */ // Let flexbox sizing handle width initially
  max-width: 100%; // Prevent exceeding parent width
  
  // Basic flex alignment for children (Marker, Connector, Content)
  align-items: ${props => {
    if (props.$orientation === 'horizontal') return 'center'; 
    // Vertical: Align based on side 
    return props.$side === 'left' ? 'flex-end' : props.$side === 'right' ? 'flex-start' : 'center';
  }};
  justify-content: center; // Keep this to center the group by default

  // Control child order and item width based on orientation/side
  ${props => {
    if (props.$orientation === 'vertical') {
      if (props.$side === 'left') {
        return css`
          flex-direction: row-reverse; // Content | Connector | Marker
          margin-right: auto; // Align item to left
          max-width: calc(50% - 20px); // Leave gap in center
          justify-content: flex-end; // Align content to the right (near center)
        `;
      } else if (props.$side === 'right') {
        return css`
          flex-direction: row; // Marker | Connector | Content
          margin-left: auto; // Align item to right
          max-width: calc(50% - 20px); // Leave gap in center
          justify-content: flex-start; // Align content to the left (near center)
        `;
      } else { // Center
        return css`
          flex-direction: column; // Stack vertically
          align-items: center; // Center align items
          /* Center marker needs specific width? */
          max-width: 300px; // Max width for centered items
        `;
      }
    } else { // Horizontal
      // Items are arranged top/bottom via TimelineEvents container?
      // Or handle lanes here?
      // For now, assume row and handle lanes in GlassTimeline
      return css`
        flex-direction: column; // Arrange content/marker vertically
        align-items: center; // Center marker/content horizontally
        /* Needs specific width? */
        min-width: 150px;
      `;
    }
  }};

  will-change: transform, opacity; // Remove top/left
  transition: filter 0.2s ease, transform 0.2s ease, opacity 0.2s ease;

  &:hover {
     filter: brightness(1.1);
  }
  
  /* Add margin auto for side alignment in vertical alternate */
  ${props => props.$orientation === 'vertical' && props.$side === 'left' && css`
    margin-right: auto;
    /* Maybe limit width? */
    /* max-width: calc(50% - 40px); */ 
  `}
  ${props => props.$orientation === 'vertical' && props.$side === 'right' && css`
    margin-left: auto;
    /* Maybe limit width? */
    /* max-width: calc(50% - 40px); */
  `}
  /* Center case needs no auto margin */
`;

// Children (Marker, Connector, Content) are now FLEX ITEMS within TimelineItem

// Marker circle - Positioned relative to TimelineItem's origin
export const MarkerCircle = styled.div<{
  // No $orientation/$side needed if centered
  $color?: string;
  $isActive: boolean;
  $isGlass: boolean;
  $size: 'small' | 'medium' | 'large';
  $glassVariant?: GlassVariant;
  $blurStrength?: BlurStrength;
  $hasIcon: boolean;
}>`
  /* position: absolute; */ // REMOVE
  z-index: 4;
  display: flex; // Keep flex for centering icon
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0; // Prevent marker from shrinking
  
  /* Remove absolute positioning styles */
  
  /* ... Size logic ... */
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

// Event connector - Positioned relative to TimelineItem's origin
export const EventConnector = styled.div<{
  $orientation: TimelineOrientation;
  $side: 'left' | 'right' | 'center'; 
  $color?: string;
  $isActive: boolean;
}>`
  /* position: absolute; */ // REMOVE
  z-index: 1;
  flex-shrink: 0; // Prevent connector from shrinking
  margin: 0 5px; // Add some horizontal spacing around connector
  
  /* Replace absolute positioning with flex sizing */
  ${props => {
    const connectorLength = '30px';
    const connectorThickness = '2px';

    if (props.$orientation === 'vertical') {
      return css`
        height: ${connectorThickness};
        width: ${connectorLength};
        /* Vertical alignment handled by parent TimelineItem align-items: center */
      `;
    } else { // Horizontal
      return css`
        width: ${connectorThickness};
        height: ${connectorLength};
        /* Horizontal alignment handled by parent TimelineItem align-items: center */
        /* We need margin here for horizontal mode */
        margin: 5px 0;
      `;
    }
  }};
  
  background-color: ${props => props.$isActive 
    ? `var(--color-${props.$color || 'primary'}, rgba(99, 102, 241, 0.8))` 
    : 'rgba(255, 255, 255, 0.2)'
  };
  
  transition: background-color 0.3s ease;
`;

// Event content - Positioned relative to TimelineItem's origin
export const EventContent = styled.div<{
  $orientation: TimelineOrientation;
  $side: 'left' | 'right' | 'center'; 
  $isActive: boolean;
  $isGlass: boolean;
  $glassVariant?: GlassVariant;
  $blurStrength?: BlurStrength;
  $color?: string;
  $maxWidth?: number;
}>`
  /* position: absolute; */ // REMOVE
  z-index: 3;
  flex-grow: 1; // Allow content to take remaining space
  min-width: 100px; // Prevent content collapsing too small
  
  /* Remove absolute positioning */
  ${props => {
    // Add alignment based on side for vertical?
    if (props.$orientation === 'vertical') {
        // Could add text-align here if needed based on side
        // Example: return props.$side === 'left' ? 'text-align: right;' : 'text-align: left;';
    }
    return css``; // Remove old positioning logic
  }};

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
export const LoadingIndicator = styled.div<{
  $position: 'start' | 'end';
  $orientation: TimelineOrientation;
}>`
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