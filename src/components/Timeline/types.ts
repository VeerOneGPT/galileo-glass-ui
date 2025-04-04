/**
 * Types for the GlassTimeline component
 */
import React from 'react';

/**
 * Timeline event item
 */
export interface TimelineItem {
  /** Unique identifier for the event */
  id: string | number;
  
  /** Date/time of the event */
  date: Date | string;
  
  /** Title of the event */
  title: string;
  
  /** Description or content of the event */
  content?: string | React.ReactNode;
  
  /** Category or type of the event (for filtering/grouping) */
  category?: string;
  
  /** Icon to display for the event */
  icon?: React.ReactNode;
  
  /** Custom color for this event */
  color?: string;
  
  /** Whether this event is highlighted */
  highlighted?: boolean;
  
  /** Whether this event spans multiple dates (for duration events) */
  endDate?: Date | string;
  
  /** Custom data associated with the event */
  data?: any;
  
  /** Whether to group this event with others on the same date */
  allowGrouping?: boolean;
  
  /** Whether this item is currently active/selected */
  active?: boolean;
  
  /** Whether this item is disabled */
  disabled?: boolean;
}

/**
 * Timeline view modes
 */
export type TimelineViewMode = 
  | 'day'       // Daily view
  | 'week'      // Weekly view
  | 'month'     // Monthly view
  | 'year'      // Yearly view
  | 'decade'    // Decade view
  | 'custom';   // Custom time scale

/**
 * Timeline layout orientation
 */
export type TimelineOrientation = 'horizontal' | 'vertical';

/**
 * Timeline marker position
 */
export type MarkerPosition = 
  | 'alternate'  // Alternate sides (odd on one side, even on the other)
  | 'left'       // All markers on left side
  | 'right'      // All markers on right side
  | 'center';    // All markers in center

/**
 * Timeline animation type
 */
export type TimelineAnimationType = 
  | 'spring'     // Physics-based spring animation
  | 'fade'       // Simple fade-in animation
  | 'slide'      // Slide-in animation
  | 'scale'      // Scale-in animation
  | 'none';      // No animation

/**
 * Timeline navigation type
 */
export type NavigationType = 
  | 'scroll'     // Navigate by scrolling
  | 'button'     // Navigate with next/prev buttons
  | 'pagination' // Navigate with pagination controls
  | 'none';      // No navigation controls

/**
 * Timeline zoom level for controlling the density of events
 */
export type ZoomLevel = 
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'quarters'
  | 'years'
  | 'decades';

/**
 * Timeline display density
 */
export type TimelineDensity = 'compact' | 'normal' | 'spacious';

/**
 * Timeline physics configuration
 */
export interface TimelinePhysicsConfig {
  /** Spring tension for animations */
  tension?: number;
  
  /** Spring friction for animations */
  friction?: number;
  
  /** Spring mass for animations */
  mass?: number;
  
  /** Animation preset name */
  preset?: 'gentle' | 'default' | 'snappy' | 'bouncy';
  
  /** Scroll physics (damping factor for inertial scrolling) */
  scrollDamping?: number;
  
  /** Stagger delay between items in ms */
  staggerDelay?: number;
}

/**
 * Timeline group configuration
 */
export interface TimelineGroup {
  /** Unique identifier for the group */
  id: string;
  
  /** Display label for the group */
  label: string;
  
  /** Color associated with this group */
  color?: string;
  
  /** Icon to display with the group */
  icon?: React.ReactNode;
  
  /** Whether the group is expanded or collapsed */
  expanded?: boolean;
}

/**
 * Time scale markers configuration
 */
export interface TimeScaleMarkersConfig {
  /** Whether to show time scale markers */
  show?: boolean;
  
  /** Primary interval for major time markers */
  primaryInterval?: ZoomLevel;
  
  /** Secondary interval for minor time markers */
  secondaryInterval?: ZoomLevel;
  
  /** Custom formatter for time markers */
  formatter?: (date: Date, interval: ZoomLevel) => string;
  
  /** Whether to show today/now marker */
  showNow?: boolean;
}

/**
 * Filter options for the timeline
 */
export interface TimelineFilter {
  /** Filter by categories (array of category names) */
  categories?: string[];
  
  /** Filter by date range */
  dateRange?: { start: Date | string; end: Date | string };
  
  /** Custom filter function */
  filterFn?: (item: TimelineItem) => boolean;
}

/**
 * Props for the GlassTimeline component
 */
export interface TimelineProps {
  /** Array of events to display on the timeline */
  items: TimelineItem[];
  
  /** Timeline orientation (horizontal or vertical) */
  orientation?: TimelineOrientation;
  
  /** Position of the event markers */
  markerPosition?: MarkerPosition;
  
  /** Current view mode (day, week, month, year) */
  viewMode?: TimelineViewMode;
  
  /** Whether to group events by date */
  groupByDate?: boolean;
  
  /** Number of events to show before grouping */
  groupThreshold?: number;
  
  /** Groups to categorize events */
  groups?: TimelineGroup[];
  
  /** Whether to show the timeline axis */
  showAxis?: boolean;
  
  /** Configuration for time scale markers */
  markers?: TimeScaleMarkersConfig;
  
  /** Animation type for event appearance */
  animation?: TimelineAnimationType;
  
  /** Physics configuration for animations */
  physics?: TimelinePhysicsConfig;
  
  /** Navigation type (scroll, button, pagination) */
  navigation?: NavigationType;
  
  /** Current zoom level */
  zoomLevel?: ZoomLevel;
  
  /** Available zoom levels */
  zoomLevels?: ZoomLevel[];
  
  /** Whether to allow zooming with mouse wheel */
  allowWheelZoom?: boolean;
  
  /** Initial date to focus on */
  initialDate?: Date | string;
  
  /** Current active event ID */
  activeId?: string | number;
  
  /** Callback when an event is clicked */
  onItemClick?: (item: TimelineItem) => void;
  
  /** Callback when an event is selected/activated */
  onItemSelect?: (item: TimelineItem) => void;
  
  /** Callback when timeline is navigated */
  onNavigate?: (date: Date, viewMode: TimelineViewMode) => void;
  
  /** Callback when zoom level changes */
  onZoomChange?: (zoomLevel: ZoomLevel) => void;
  
  /** Custom renderer for event markers */
  renderMarker?: (item: TimelineItem) => React.ReactNode;
  
  /** Custom renderer for event content */
  renderContent?: (item: TimelineItem) => React.ReactNode;
  
  /** Custom renderer for the timeline axis */
  renderAxis?: (viewMode: TimelineViewMode, zoomLevel: ZoomLevel) => React.ReactNode;
  
  /** Timeline density (controls spacing) */
  density?: TimelineDensity;
  
  /** Whether to enable touch gestures */
  enableGestures?: boolean;
  
  /** Current filter options */
  filter?: TimelineFilter;
  
  /** Whether to allow filtering */
  allowFiltering?: boolean;
  
  /** Callback when filter changes */
  onFilterChange?: (filter: TimelineFilter) => void;
  
  /** Whether loading more past events */
  loadingPast?: boolean;
  
  /** Whether loading more future events */
  loadingFuture?: boolean;
  
  /** Whether more past events are available */
  hasMorePast?: boolean;
  
  /** Whether more future events are available */
  hasMoreFuture?: boolean;
  
  /** Callback to load more past events */
  onLoadMorePast?: () => void;
  
  /** Callback to load more future events */
  onLoadMoreFuture?: () => void;
  
  /** Width of the timeline container */
  width?: string | number;
  
  /** Height of the timeline container */
  height?: string | number;
  
  /** CSS class for the timeline container */
  className?: string;
  
  /** CSS class for the event markers */
  markerClassName?: string;
  
  /** CSS class for the event content */
  contentClassName?: string;
  
  /** Glass variant style */
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  
  /** Blur strength for glass effect */
  blurStrength?: 'light' | 'standard' | 'strong';
  
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  
  /** Whether to use glass styling for markers */
  glassMarkers?: boolean;
  
  /** Whether to use glass styling for content cards */
  glassContent?: boolean;
  
  /** Whether to animate on component mount */
  animateOnMount?: boolean;
  
  /** Whether to animate when items change */
  animateOnChange?: boolean;
  
  /** Optional ID for the container */
  id?: string;
  
  /** ARIA label for the timeline */
  ariaLabel?: string;
}

/**
 * TimelineRef interface - defines the methods available via forwarded ref
 */
export interface TimelineRef {
  /** Scroll to a specific date on the timeline */
  scrollToDate: (date: Date, smooth?: boolean) => void;
  
  /** Scroll to a specific item on the timeline */
  scrollToItem: (itemId: string | number, smooth?: boolean) => void;
  
  /** Get the timeline container DOM element */
  getContainerElement: () => HTMLDivElement | null;
  
  /** Get the current focused date */
  getCurrentDate: () => Date;
  
  /** Select a specific item on the timeline */
  selectItem: (itemId: string | number) => void;
}