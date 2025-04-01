/**
 * TimelineControls Component
 * 
 * Provides navigation and zoom controls for the timeline.
 */
import React from 'react';
import { ZoomLevel, TimelineOrientation } from '../types';
import { GlassVariant, BlurStrength, TimelineControls as StyledTimelineControls, TimelineButton, ZoomControls, ZoomLabel } from '../styles';

interface TimelineControlsProps {
  orientation: TimelineOrientation;
  position: 'top' | 'bottom' | 'left' | 'right';
  color?: string;
  glassVariant?: GlassVariant;
  blurStrength?: BlurStrength;
  zoomLevels: ZoomLevel[];
  currentZoomLevel: ZoomLevel;
  goToPrevious: () => void;
  goToNext: () => void;
  goToToday: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const TimelineControlsComponent: React.FC<TimelineControlsProps> = ({
  orientation,
  position,
  color,
  glassVariant,
  blurStrength,
  zoomLevels,
  currentZoomLevel,
  goToPrevious,
  goToNext,
  goToToday,
  zoomIn,
  zoomOut,
}) => {
  return (
    <StyledTimelineControls
      $orientation={orientation}
      $position={position}
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
    </StyledTimelineControls>
  );
};

export default TimelineControlsComponent;