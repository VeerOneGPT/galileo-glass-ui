/**
 * TimelineMarkers Component
 * 
 * Displays time scale markers along the timeline axis.
 */
import React from 'react';
import { ZoomLevel, TimelineOrientation } from '../types';
import { TimeScaleMarkersConfig } from '../types';
import { TimeMarkers, TimeMarker } from '../styles';
import { isToday } from '../TimelineUtils';

interface TimelineMarkersProps {
  markers: TimeScaleMarkersConfig;
  timeMarkers: Date[];
  orientation: TimelineOrientation;
  markerHeight: number;
  calculateItemPosition: (date: Date) => number;
  formatMarkerLabel: (date: Date) => string;
  color?: string;
}

const TimelineMarkersComponent: React.FC<TimelineMarkersProps> = ({
  markers,
  timeMarkers,
  orientation,
  markerHeight,
  calculateItemPosition,
  formatMarkerLabel,
  color,
}) => {
  if (!markers.show || !timeMarkers.length) return null;
  
  return (
    <TimeMarkers $orientation={orientation} $height={markerHeight}>
      {timeMarkers.map((date, index) => {
        const position = calculateItemPosition(date);
        const isPrimary = index % 2 === 0;
        const isNowMarker = markers.showNow && isToday(date);
        
        // Hide every other non-primary label for better readability
        const hideLabel = !isPrimary && index % 2 !== 0;
        
        return (
          <TimeMarker
            key={date.getTime()}
            $orientation={orientation}
            $position={position}
            $isPrimary={isPrimary}
            $isNow={isNowMarker}
            $color={color}
            $hideLabel={hideLabel}
            data-label={formatMarkerLabel(date)}
          />
        );
      })}
    </TimeMarkers>
  );
};

export default TimelineMarkersComponent;