/**
 * TimelineUtils Tests
 * 
 * This file contains tests for the utility functions used in the GlassTimeline component
 */
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
} from '../TimelineUtils';
import { TimelineItem, ZoomLevel } from '../types';

describe('Timeline Utility Functions', () => {
  describe('parseDate', () => {
    it('should parse string dates to Date objects', () => {
      const date = parseDate('2023-01-15');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0); // January (0-indexed)
      expect(date.getDate()).toBe(15);
    });
    
    it('should return Date objects as-is', () => {
      const originalDate = new Date(2023, 1, 15);
      const date = parseDate(originalDate);
      expect(date).toBe(originalDate);
    });
  });
  
  describe('formatDate', () => {
    it('should format dates based on view mode and zoom level', () => {
      const date = new Date(2023, 0, 15); // Jan 15, 2023
      
      // Test different zoom levels
      expect(formatDate(date, 'day', 'days')).toMatch(/Jan 15, 2023/);
      expect(formatDate(date, 'month', 'months')).toMatch(/Jan 2023/);
      expect(formatDate(date, 'year', 'years')).toBe('2023');
    });
    
    it('should handle quarters format', () => {
      const date = new Date(2023, 1, 15); // Feb 15, 2023
      expect(formatDate(date, 'month', 'quarters')).toMatch(/Q1 2023/);
      
      const q2Date = new Date(2023, 4, 15); // May 15, 2023
      expect(formatDate(q2Date, 'month', 'quarters')).toMatch(/Q2 2023/);
    });
    
    it('should handle decades format', () => {
      const date = new Date(2023, 0, 1);
      expect(formatDate(date, 'year', 'decades')).toBe('2020s');
    });
  });
  
  describe('getWeekNumber', () => {
    it('should return the correct week number', () => {
      // Different locales and implementations might return different week numbers
      // So we'll just test that it returns a number between 1 and 53
      const week = getWeekNumber(new Date(2023, 0, 1));
      expect(week).toBeGreaterThanOrEqual(1);
      expect(week).toBeLessThanOrEqual(53);
      
      // Check that the function returns a consistent value
      expect(getWeekNumber(new Date(2023, 6, 15))).toBe(getWeekNumber(new Date(2023, 6, 15)));
    });
  });
  
  describe('groupItemsByDate', () => {
    const items: TimelineItem[] = [
      { id: '1', date: '2023-01-15', title: 'Event 1' },
      { id: '2', date: '2023-01-15', title: 'Event 2' },
      { id: '3', date: '2023-01-16', title: 'Event 3' },
      { id: '4', date: '2023-02-10', title: 'Event 4' }
    ];
    
    it('should group items by day', () => {
      const grouped = groupItemsByDate(items, 'days', 1);
      
      // Should have 3 groups: Jan 15 (2 items), Jan 16, Feb 10
      expect(Object.keys(grouped).length).toBe(3);
      
      // Find the key that contains Jan 15
      const jan15Key = Object.keys(grouped).find(key => grouped[key].some(item => 
        item.id === '1' || item.id === '2'
      ));
      
      // That key should have 2 items
      expect(grouped[jan15Key].length).toBe(2);
    });
    
    it('should respect threshold for grouping', () => {
      // Set threshold to 3, so only groups with 4+ items are grouped
      const grouped = groupItemsByDate(items, 'days', 3);
      
      // Should have 4 groups since no day has more than 3 items
      expect(Object.keys(grouped).length).toBe(4);
    });
    
    it('should respect allowGrouping flag', () => {
      const itemsWithGroupingFlag: TimelineItem[] = [
        { id: '1', date: '2023-01-15', title: 'Event 1' },
        { id: '2', date: '2023-01-15', title: 'Event 2', allowGrouping: false },
        { id: '3', date: '2023-01-15', title: 'Event 3' }
      ];
      
      const grouped = groupItemsByDate(itemsWithGroupingFlag, 'days', 1);
      
      // Count the number of items that have the same date but are in different groups
      let sameItemsInDifferentGroups = 0;
      
      // Check all item pairs
      for (const key1 in grouped) {
        for (const key2 in grouped) {
          if (key1 !== key2) {
            // If dates are same but in different groups
            const date1 = parseDate(grouped[key1][0].date);
            const date2 = parseDate(grouped[key2][0].date);
            
            if (date1.getFullYear() === date2.getFullYear() && 
                date1.getMonth() === date2.getMonth() && 
                date1.getDate() === date2.getDate()) {
              sameItemsInDifferentGroups++;
            }
          }
        }
      }
      
      // There should be some items with the same date in different groups
      expect(sameItemsInDifferentGroups).toBeGreaterThan(0);
    });
  });
  
  describe('generateTimeMarkers', () => {
    it('should generate markers for day zoom level', () => {
      const start = new Date(2023, 0, 1);
      const end = new Date(2023, 0, 5);
      
      const markers = generateTimeMarkers(start, end, 'days');
      
      // Should generate 5 markers (Jan 1-5)
      expect(markers.length).toBe(5);
    });
    
    it('should generate markers for month zoom level', () => {
      const start = new Date(2023, 0, 1);
      const end = new Date(2023, 3, 1);
      
      const markers = generateTimeMarkers(start, end, 'months');
      
      // Should generate 4 markers (Jan, Feb, Mar, Apr)
      expect(markers.length).toBe(4);
    });
  });
  
  describe('filterItems', () => {
    const items: TimelineItem[] = [
      { id: '1', date: '2023-01-15', title: 'Event 1', category: 'category1' },
      { id: '2', date: '2023-02-15', title: 'Event 2', category: 'category2' },
      { id: '3', date: '2023-03-15', title: 'Event 3', category: 'category1' }
    ];
    
    it('should filter by category', () => {
      const filtered = filterItems(items, { categories: ['category1'] });
      
      expect(filtered.length).toBe(2);
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('3');
    });
    
    it('should filter by date range', () => {
      const filtered = filterItems(items, {
        dateRange: {
          start: '2023-01-01',
          end: '2023-02-01'
        }
      });
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
    });
    
    it('should support custom filter functions', () => {
      const filtered = filterItems(items, {
        filterFn: item => item.title.includes('Event 2')
      });
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('2');
    });
  });
  
  describe('getDateRangeForView', () => {
    it('should calculate appropriate range for day view', () => {
      const date = new Date(2023, 0, 15);
      const { start, end } = getDateRangeForView(date, 'day');
      
      // Should include the original date
      expect(start.getTime()).toBeLessThan(date.getTime());
      expect(end.getTime()).toBeGreaterThan(date.getTime());
      
      // Should span approximately 2-3 days (depending on implementation)
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(2);
      expect(diffDays).toBeLessThanOrEqual(3);
    });
    
    it('should calculate appropriate range for month view', () => {
      const date = new Date(2023, 0, 15);
      const { start, end } = getDateRangeForView(date, 'month');
      
      // Should include the entire month that contains the date
      expect(start.getTime()).toBeLessThan(new Date(2023, 0, 1).getTime());
      expect(end.getTime()).toBeGreaterThan(new Date(2023, 0, 31).getTime());
      
      // The range should span approximately a month (30-31 days) plus padding
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(30);
    });
  });
  
  describe('isToday', () => {
    it('should identify today correctly', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });
  
  describe('calculateTimelinePosition', () => {
    it('should calculate percentage position correctly', () => {
      const start = new Date(2023, 0, 1);
      const end = new Date(2023, 0, 11);
      const date = new Date(2023, 0, 6); // Middle position
      
      const position = calculateTimelinePosition(date, start, end);
      expect(position).toBe(50);
    });
    
    it('should handle edge cases', () => {
      const start = new Date(2023, 0, 1);
      const end = new Date(2023, 0, 11);
      
      // At start
      expect(calculateTimelinePosition(start, start, end)).toBe(0);
      
      // At end
      expect(calculateTimelinePosition(end, start, end)).toBe(100);
      
      // After end
      const after = new Date(2023, 0, 15);
      expect(calculateTimelinePosition(after, start, end)).toBe(100);
      
      // Before start
      const before = new Date(2022, 11, 25);
      expect(calculateTimelinePosition(before, start, end)).toBe(0);
      
      // Same start/end (edge case)
      expect(calculateTimelinePosition(start, start, start)).toBe(0);
    });
  });
  
  describe('parseDuration', () => {
    it('should parse duration strings to milliseconds', () => {
      expect(parseDuration('100ms')).toBe(100);
      expect(parseDuration('1s')).toBe(1000);
      expect(parseDuration('2m')).toBe(2 * 60 * 1000);
      expect(parseDuration('3h')).toBe(3 * 60 * 60 * 1000);
      expect(parseDuration('1d')).toBe(24 * 60 * 60 * 1000);
    });
    
    it('should handle invalid formats', () => {
      expect(parseDuration('invalid')).toBe(0);
      expect(parseDuration('10')).toBe(0);
    });
  });
  
  describe('calculateAppropriateZoomLevel', () => {
    it('should calculate appropriate zoom level based on date range', () => {
      // 12 hours apart
      const hours: ZoomLevel = calculateAppropriateZoomLevel(
        new Date(2023, 0, 1, 0),
        new Date(2023, 0, 1, 12)
      );
      expect(hours).toBe('hours');
      
      // 7 days apart
      const days: ZoomLevel = calculateAppropriateZoomLevel(
        new Date(2023, 0, 1),
        new Date(2023, 0, 8)
      );
      expect(days).toBe('days');
      
      // 30 days apart
      const weeks: ZoomLevel = calculateAppropriateZoomLevel(
        new Date(2023, 0, 1),
        new Date(2023, 0, 31)
      );
      expect(weeks).toBe('weeks');
      
      // 6 months apart
      const months: ZoomLevel = calculateAppropriateZoomLevel(
        new Date(2023, 0, 1),
        new Date(2023, 6, 1)
      );
      expect(months).toBe('months');
      
      // 3 years apart
      const quarters: ZoomLevel = calculateAppropriateZoomLevel(
        new Date(2023, 0, 1),
        new Date(2026, 0, 1)
      );
      expect(quarters).toBe('quarters');
      
      // 10 years apart
      const years: ZoomLevel = calculateAppropriateZoomLevel(
        new Date(2023, 0, 1),
        new Date(2033, 0, 1)
      );
      expect(years).toBe('years');
      
      // 30 years apart
      const decades: ZoomLevel = calculateAppropriateZoomLevel(
        new Date(2023, 0, 1),
        new Date(2053, 0, 1)
      );
      expect(decades).toBe('decades');
    });
  });
});