/**
 * Timeline component exports
 */
import { GlassTimeline } from './GlassTimeline';
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

// Export main component
export { GlassTimeline };

// Export types
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

// Default export
export default GlassTimeline;