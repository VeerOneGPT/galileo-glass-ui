/**
 * TimelineEvent Component
 * 
 * Renders an individual event item on the timeline with proper
 * positioning, styling, and interactive features.
 */
import React, { useState, useMemo, CSSProperties, useCallback } from 'react';
import { isToday, format as formatDateFn } from 'date-fns';
import { useTheme } from 'styled-components';
import { useHover } from '@react-aria/interactions';
import type { FormatOptions } from 'date-fns';

// Import Galileo hook and types
import { useGalileoSprings, TargetValues, GalileoSpringsOptions } from '../../../hooks/useGalileoSprings';
import { SpringConfig, SpringPresets } from '../../../animations/physics/springPhysics'; // Import SpringConfig
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { usePhysicsInteraction, PhysicsInteractionType } from '../../../hooks/usePhysicsInteraction';

// Local imports
import { 
  TimelineItem as TimelineItemType, 
  TimelineViewMode, 
  ZoomLevel,
  TimelineOrientation,
  TimelineDensity
} from '../types';
import { GlassVariant, BlurStrength } from '../styles';
import { 
  TimelineItem, 
  MarkerCircle, 
  EventConnector, 
  EventContent, 
  EventTitle, 
  EventDate, 
  EventDescription, 
  GroupedEvents 
} from '../styles';

/**
 * Props for the TimelineEvent component.
 */
export interface TimelineEventProps {
  item: TimelineItemType;
  index: number;
  orientation: 'vertical' | 'horizontal';
  isHighlighted: boolean;
  color: string;
  finalDisableAnimation: boolean;
  glassContent: boolean;
  glassVariant: GlassVariant;
  blurStrength: BlurStrength;
  contentClassName?: string;
  markerClassName?: string;
  handleItemClick: (item: TimelineItemType) => void;
  renderContent?: (item: TimelineItemType) => React.ReactNode;
  renderMarker?: (item: TimelineItemType, isHighlighted: boolean, color: string) => React.ReactNode;
  density: 'compact' | 'normal' | 'spacious';
  itemPhysicsProps: { translateX: number; translateY: number; scale: number; opacity: number };
  finalInteractionConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;
  formatDate: (date: Date, viewMode: TimelineViewMode, zoomLevel: ZoomLevel) => string;
  currentViewMode: TimelineViewMode;
  currentZoomLevel: ZoomLevel;
  parseDate: (date: string | number | Date) => Date;
  getEventSide: (index: number, itemId: string | number) => 'left' | 'right' | 'center';
  selectedId: string | number | null;
  isGrouped: boolean;
  groupedItems?: Record<string, TimelineItemType[]>;
  glassMarkers: boolean;
  format: (date: string | number | Date, formatStr: string, options?: FormatOptions) => string;
  style?: React.CSSProperties;
}

/**
 * Represents a single event on the timeline.
 */
export const TimelineEvent: React.FC<TimelineEventProps> = ({
  item,
  index,
  orientation,
  isHighlighted,
  color,
  finalDisableAnimation,
  glassContent,
  glassVariant,
  blurStrength,
  contentClassName,
  markerClassName,
  handleItemClick,
  renderContent,
  renderMarker,
  density,
  itemPhysicsProps,
  finalInteractionConfig,
  formatDate,
  currentViewMode,
  currentZoomLevel,
  parseDate,
  getEventSide,
  selectedId,
  isGrouped,
  groupedItems,
  glassMarkers,
  format,
  style
}) => {
  const theme = useTheme();
  const date = parseDate(item.date);
  const side = getEventSide(index, item.id);
  const isActive = selectedId === item.id || !!item.active;

  const entrancePhysicsProps = itemPhysicsProps || {
    translateX: 0,
    translateY: 0,
    scale: 1,
    opacity: 1
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const resolvedDisableAnimation = useReducedMotion() || finalDisableAnimation;
  const resolvedInteractionConfig = useMemo(() => {
    if (typeof finalInteractionConfig === 'string' && finalInteractionConfig in SpringPresets) {
      return SpringPresets[finalInteractionConfig as keyof typeof SpringPresets];
    }
    return finalInteractionConfig;
  }, [finalInteractionConfig]);

  const interactionTarget: TargetValues = useMemo(() => ({
    scale: resolvedDisableAnimation ? 1 : (isHovered || isFocused) ? 1.04 : 1,
    translateYInteraction: resolvedDisableAnimation ? 0 : (isHovered || isFocused) ? -3 : 0,
  }), [resolvedDisableAnimation, isHovered, isFocused]);

  const interactionValues = useGalileoSprings(
    interactionTarget,
    { config: resolvedInteractionConfig as SpringConfig | undefined, immediate: resolvedDisableAnimation }
  );

  // Calculate Style for the TimelineItem (Strategy 9: Relative + Margin)
  const combinedStyle = useMemo((): CSSProperties => {
    const animationTransform = `translate(${entrancePhysicsProps.translateX}px, ${entrancePhysicsProps.translateY + (interactionValues.translateYInteraction ?? 0)}px) scale(${entrancePhysicsProps.scale * (interactionValues.scale ?? 1)})`;

    const baseStyle: CSSProperties = {
      marginTop: `0px`,
      marginLeft: `0px`,
      transform: animationTransform,
      opacity: entrancePhysicsProps.opacity,
    };

    baseStyle.top = style?.top;
    baseStyle.left = style?.left;

    return baseStyle;
  }, [
    entrancePhysicsProps,
    interactionValues,
    style
  ]);
  // --- End Style Calculation ---

  const handleMouseEnter = useCallback(() => {
    if (resolvedDisableAnimation) return;
    setIsHovered(true);
  }, [resolvedDisableAnimation]);

  const handleMouseLeave = useCallback(() => {
    if (resolvedDisableAnimation) return;
    setIsHovered(false);
  }, [resolvedDisableAnimation]);

  const handleClick = useCallback(() => {
    handleItemClick(item);
  }, [handleItemClick, item]);

  if (isGrouped && index > 0) return null;

  const customMarker = renderMarker ? renderMarker(item, !!item.highlighted || isHighlighted, item.color || color) : null;

  const renderMarkerComponent = () => customMarker || (
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
  );

  const renderConnectorComponent = () => (
    <EventConnector 
      $orientation={orientation} 
      $side={side} 
      $color={item.color || color}
      $isActive={isActive}
    />
  );

  const renderContentComponent = () => (
    <EventContent 
      $orientation={orientation} 
      $side={side} 
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
          {isGrouped && groupedItems && (
            <GroupedEvents>
              Multiple events
              <span className="events-count">
                {Array.isArray(groupedItems[format(date, 'yyyy-MM-dd')]) ? groupedItems[format(date, 'yyyy-MM-dd')].length : '?'}
              </span>
            </GroupedEvents>
          )}
        </>
      )}
    </EventContent>
  );

  return (
    <TimelineItem
      key={item.id}
      data-item-id={item.id}
      role="listitem"
      tabIndex={0}
      $isActive={isActive}
      $color={item.color || color || 'primary'}
      $orientation={orientation}
      $side={side}
      $density={density}
      style={combinedStyle}
      className={[
        'timeline-item', 
        isActive ? 'active' : '', 
        item.category ? `category-${item.category}` : ''
      ].join(' ')}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {renderMarkerComponent()}
      {renderConnectorComponent()}
      {renderContentComponent()}
    </TimelineItem>
  );
};

export default TimelineEvent;