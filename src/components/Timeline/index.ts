/**
 * GlassTimeline Component and utilities
 * 
 * Exports the main GlassTimeline component along with types, hooks, 
 * and subcomponents for the modularized timeline implementation.
 */

// Export the main component
import { GlassTimeline } from './GlassTimeline';
export { GlassTimeline };

// Export types
import { 
  TimelineItem, 
  TimelineOrientation, 
  MarkerPosition, 
  ZoomLevel,
  TimelineAnimationType, 
  NavigationType,
  TimelineDensity,
  TimelineFilter,
  TimelineGroup,
  TimeScaleMarkersConfig,
  TimelinePhysicsConfig,
  TimelineProps
} from './types';

export type {
  TimelineItem,
  TimelineOrientation,
  MarkerPosition,
  ZoomLevel,
  TimelineAnimationType,
  NavigationType,
  TimelineDensity,
  TimelineFilter,
  TimelineGroup,
  TimeScaleMarkersConfig,
  TimelinePhysicsConfig,
  TimelineProps
};

// Export utility functions
import {
  parseDate,
  formatDate,
  getWeekNumber,
  groupItemsByDate,
  generateTimeMarkers,
  filterItems,
  getDateRangeForView,
  isToday,
  calculateTimelinePosition,
  parseDuration,
  calculateAppropriateZoomLevel
} from './TimelineUtils';

export {
  parseDate,
  formatDate,
  getWeekNumber,
  groupItemsByDate,
  generateTimeMarkers,
  filterItems,
  getDateRangeForView,
  isToday,
  calculateTimelinePosition,
  parseDuration,
  calculateAppropriateZoomLevel
};

// Export hooks
export { 
  usePositionInertia, 
  clamp, 
  type Position2D, 
  type UsePositionInertiaResult 
} from './hooks';

// Export subcomponents
export { 
  TimelineEvent, 
  TimelineMarkers, 
  TimelineControls 
} from './components';

// Export style constants and styled components
export type { GlassVariant, BlurStrength } from './styles';

// Default export
export default GlassTimeline;