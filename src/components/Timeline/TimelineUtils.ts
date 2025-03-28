/**
 * Utility functions for the GlassTimeline component
 */
import { 
  TimelineItem, 
  TimelineViewMode, 
  ZoomLevel,
  TimelineFilter
} from './types';

/**
 * Parse an ISO date string or Date object to a Date
 */
export const parseDate = (date: Date | string): Date => {
  if (typeof date === 'string') {
    return new Date(date);
  }
  return date;
};

/**
 * Format a date based on the current view mode and zoom level
 */
export const formatDate = (
  date: Date,
  viewMode: TimelineViewMode = 'day',
  zoomLevel: ZoomLevel = 'days'
): string => {
  // Simple formatter for demo purposes
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  switch (zoomLevel) {
    case 'hours':
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'days':
      // Default options are fine
      break;
    case 'weeks':
      // Return week number
      return `Week ${getWeekNumber(date)}, ${date.getFullYear()}`;
    case 'months':
      delete options.day;
      break;
    case 'quarters':
      delete options.day;
      delete options.month;
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    case 'years':
      return date.getFullYear().toString();
    case 'decades':
      const decade = Math.floor(date.getFullYear() / 10) * 10;
      return `${decade}s`;
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Get the week number for a date
 */
export const getWeekNumber = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

/**
 * Group items by date based on the zoom level
 */
export const groupItemsByDate = (
  items: TimelineItem[],
  zoomLevel: ZoomLevel = 'days',
  threshold = 3
): Record<string, TimelineItem[]> => {
  const groups: Record<string, TimelineItem[]> = {};
  
  // Sort items by date
  const sortedItems = [...items].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Group by date key
  sortedItems.forEach(item => {
    const date = parseDate(item.date);
    let key = '';
    
    switch (zoomLevel) {
      case 'hours':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'days':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'weeks':
        key = `${date.getFullYear()}-W${getWeekNumber(date)}`;
        break;
      case 'months':
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
      case 'quarters':
        const quarter = Math.floor(date.getMonth() / 3);
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'years':
        key = `${date.getFullYear()}`;
        break;
      case 'decades':
        const decade = Math.floor(date.getFullYear() / 10) * 10;
        key = `${decade}s`;
        break;
    }
    
    // Skip grouping if the item doesn't allow it
    if (item.allowGrouping === false) {
      key = `${key}-${item.id}`;
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(item);
  });
  
  // Only create actual groups if there are multiple items
  const result: Record<string, TimelineItem[]> = {};
  
  Object.entries(groups).forEach(([key, groupItems]) => {
    if (groupItems.length <= threshold || groupItems.some(item => item.allowGrouping === false)) {
      // Don't group, add individual items
      groupItems.forEach((item, index) => {
        result[`${key}-${index}`] = [item];
      });
    } else {
      // Group these items
      result[key] = groupItems;
    }
  });
  
  return result;
};

/**
 * Generate time markers based on view mode and zoom level
 */
export const generateTimeMarkers = (
  startDate: Date,
  endDate: Date,
  zoomLevel: ZoomLevel = 'days'
): Date[] => {
  const markers: Date[] = [];
  const current = new Date(startDate);
  
  // Set to start of the relevant period
  switch (zoomLevel) {
    case 'hours':
      current.setMinutes(0, 0, 0);
      break;
    case 'days':
      current.setHours(0, 0, 0, 0);
      break;
    case 'weeks':
      // Set to start of week (Sunday)
      const day = current.getDay();
      current.setDate(current.getDate() - day);
      current.setHours(0, 0, 0, 0);
      break;
    case 'months':
      current.setDate(1);
      current.setHours(0, 0, 0, 0);
      break;
    case 'quarters':
      const month = current.getMonth();
      const quarterStartMonth = Math.floor(month / 3) * 3;
      current.setMonth(quarterStartMonth, 1);
      current.setHours(0, 0, 0, 0);
      break;
    case 'years':
      current.setMonth(0, 1);
      current.setHours(0, 0, 0, 0);
      break;
    case 'decades':
      const year = current.getFullYear();
      const decadeStart = Math.floor(year / 10) * 10;
      current.setFullYear(decadeStart, 0, 1);
      current.setHours(0, 0, 0, 0);
      break;
  }
  
  // Generate markers until we reach or pass the end date
  while (current <= endDate) {
    markers.push(new Date(current));
    
    // Increment to next marker
    switch (zoomLevel) {
      case 'hours':
        current.setHours(current.getHours() + 1);
        break;
      case 'days':
        current.setDate(current.getDate() + 1);
        break;
      case 'weeks':
        current.setDate(current.getDate() + 7);
        break;
      case 'months':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'quarters':
        current.setMonth(current.getMonth() + 3);
        break;
      case 'years':
        current.setFullYear(current.getFullYear() + 1);
        break;
      case 'decades':
        current.setFullYear(current.getFullYear() + 10);
        break;
    }
  }
  
  return markers;
};

/**
 * Filter timeline items based on filter options
 */
export const filterItems = (
  items: TimelineItem[],
  filter?: TimelineFilter
): TimelineItem[] => {
  if (!filter) return items;
  
  return items.filter(item => {
    // Filter by custom function if provided
    if (filter.filterFn && !filter.filterFn(item)) {
      return false;
    }
    
    // Filter by categories if provided
    if (filter.categories && filter.categories.length > 0) {
      if (!item.category || !filter.categories.includes(item.category)) {
        return false;
      }
    }
    
    // Filter by date range if provided
    if (filter.dateRange) {
      const itemDate = parseDate(item.date);
      const startDate = parseDate(filter.dateRange.start);
      const endDate = parseDate(filter.dateRange.end);
      
      if (itemDate < startDate || itemDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Get appropriate date range based on view mode and initial date
 */
export const getDateRangeForView = (
  initialDate: Date,
  viewMode: TimelineViewMode,
  extraPadding = 1
): { start: Date; end: Date } => {
  const start = new Date(initialDate);
  const end = new Date(initialDate);
  
  switch (viewMode) {
    case 'day':
      start.setDate(start.getDate() - extraPadding);
      end.setDate(end.getDate() + extraPadding);
      break;
    case 'week':
      start.setDate(start.getDate() - start.getDay() - extraPadding);
      end.setDate(end.getDate() + (6 - end.getDay()) + extraPadding);
      break;
    case 'month':
      start.setDate(1);
      start.setDate(start.getDate() - extraPadding);
      end.setMonth(end.getMonth() + 1, 0); // Last day of month
      end.setDate(end.getDate() + extraPadding);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setDate(start.getDate() - extraPadding * 15);
      end.setMonth(11, 31);
      end.setDate(end.getDate() + extraPadding * 15);
      break;
    case 'decade':
      const year = start.getFullYear();
      const decadeStart = Math.floor(year / 10) * 10;
      start.setFullYear(decadeStart, 0, 1);
      end.setFullYear(decadeStart + 9, 11, 31);
      break;
    default:
      // For custom view, default to ±30 days
      start.setDate(start.getDate() - 30);
      end.setDate(end.getDate() + 30);
  }
  
  return { start, end };
};

/**
 * Determine if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Calculate percentage position on timeline based on date
 */
export const calculateTimelinePosition = (
  date: Date,
  startDate: Date,
  endDate: Date
): number => {
  const totalDuration = endDate.getTime() - startDate.getTime();
  const position = date.getTime() - startDate.getTime();
  
  if (totalDuration <= 0) return 0;
  return Math.max(0, Math.min(100, (position / totalDuration) * 100));
};

/**
 * Parse a duration string to milliseconds
 */
export const parseDuration = (duration: string): number => {
  const matches = duration.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!matches) return 0;
  
  const [, value, unit] = matches;
  const numValue = parseInt(value, 10);
  
  switch (unit) {
    case 'ms': return numValue;
    case 's': return numValue * 1000;
    case 'm': return numValue * 60 * 1000;
    case 'h': return numValue * 60 * 60 * 1000;
    case 'd': return numValue * 24 * 60 * 60 * 1000;
    default: return 0;
  }
};

/**
 * Calculate the appropriate zoom level based on date range
 */
export const calculateAppropriateZoomLevel = (
  startDate: Date,
  endDate: Date
): ZoomLevel => {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays < 1) return 'hours';
  if (diffDays < 14) return 'days';
  if (diffDays < 60) return 'weeks';
  if (diffDays < 365) return 'months';
  if (diffDays < 365 * 5) return 'quarters';
  if (diffDays < 365 * 20) return 'years';
  return 'decades';
};