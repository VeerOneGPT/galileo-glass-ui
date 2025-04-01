/**
 * TimelineEvent Component
 * 
 * Renders an individual event item on the timeline with proper
 * positioning, styling, and interactive features.
 */
import React, { useState, useMemo } from 'react';
import { isToday, format as formatDateFn } from 'date-fns';

// Import Galileo hook and types
import { useGalileoSprings, TargetValues, GalileoSpringsOptions } from '../../../hooks/useGalileoSprings';
import { SpringConfig, SpringPresets } from '../../../animations/physics/springPhysics'; // Import SpringConfig

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

interface TimelineEventProps {
  item: TimelineItemType;
  index: number;
  isGrouped?: boolean;
  orientation: TimelineOrientation;
  isHighlighted: boolean;
  color?: string;
  finalDisableAnimation: boolean;
  glassContent: boolean;
  glassVariant?: GlassVariant;
  blurStrength?: BlurStrength;
  contentClassName?: string;
  markerClassName?: string;
  handleItemClick: (item: TimelineItemType) => void;
  renderContent?: (item: TimelineItemType) => React.ReactNode;
  renderMarker?: (item: TimelineItemType) => React.ReactNode;
  density: TimelineDensity;
  itemPhysicsProps: { translateX: number; translateY: number; scale: number; opacity: number };
  finalInteractionConfig: Partial<SpringConfig> | keyof typeof SpringPresets | undefined;
  formatDate: (date: Date, viewMode: TimelineViewMode, zoomLevel: ZoomLevel) => string;
  currentViewMode: TimelineViewMode;
  currentZoomLevel: ZoomLevel;
  parseDate: (date: string | number | Date) => Date;
  calculateItemPosition: (date: Date) => number;
  getEventSide: (index: number, id: string | number) => 'left' | 'right' | 'center';
  selectedId?: string | number | null;
  groupedItems?: Record<string, TimelineItemType[]>;
  glassMarkers: boolean;
  format: typeof formatDateFn;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({
  item,
  index,
  isGrouped = false,
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
  calculateItemPosition,
  getEventSide,
  selectedId,
  groupedItems,
  glassMarkers,
  format,
}) => {
  const date = parseDate(item.date);
  const position = calculateItemPosition(date);
  const side = getEventSide(index, item.id);
  const isActive = selectedId === item.id || !!item.active;

  // Get physics props for ENTRANCE animation (or default values)
  const entrancePhysicsProps = itemPhysicsProps || {
    translateX: 0,
    translateY: 0,
    scale: 1,
    opacity: 1
  };

  // --- Add Hover/Focus State & Interaction Physics ---
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const interactionTarget: TargetValues = useMemo(() => ({
    scale: finalDisableAnimation ? 1 : (isHovered || isFocused) ? 1.04 : 1,
    translateYInteraction: finalDisableAnimation ? 0 : (isHovered || isFocused) ? -3 : 0,
  }), [finalDisableAnimation, isHovered, isFocused]);

  const interactionValues = useGalileoSprings(
    interactionTarget,
    {
      config: finalInteractionConfig,
      immediate: finalDisableAnimation,
    }
  );
  // --- End Interaction Physics ---

  // For grouped items, show count instead of individual items
  if (isGrouped && index > 0) return null;

  // Custom marker renderer
  const customMarker = renderMarker ? renderMarker(item) : null;

  return (
    <TimelineItem
      key={item.id}
      data-item-id={item.id}
      $orientation={orientation}
      $position={position}
      $side={side}
      $isActive={isActive}
      $isHighlighted={!!item.highlighted || isHighlighted}
      $color={item.color || color}
      $reducedMotion={finalDisableAnimation}
      style={{
        transform: `translateY(-50%) translate(${entrancePhysicsProps.translateX}px, ${entrancePhysicsProps.translateY + (interactionValues.translateYInteraction ?? 0)}px) scale(${entrancePhysicsProps.scale * (interactionValues.scale ?? 1)})`,
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
        </>
      ) : null}
    </TimelineItem>
  );
};

export default TimelineEvent;