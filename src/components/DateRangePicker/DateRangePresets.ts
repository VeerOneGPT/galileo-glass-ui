/**
 * Date Range Presets
 * 
 * Common presets for date ranges used in the GlassDateRangePicker component.
 */
import { DateRange, DateRangePreset, ComparisonDateRange } from './types';

/**
 * Helper function to create a date with time set to 00:00:00
 */
const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Helper function to create a date with time set to 23:59:59
 */
const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Helper to get first day of the month
 */
const startOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Helper to get last day of the month
 */
const endOfMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Helper to subtract days from a date
 */
const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

/**
 * Standard date range presets
 */
export const StandardDateRangePresets: DateRangePreset[] = [
  {
    id: 'today',
    label: 'Today',
    type: 'relative',
    getRangeFunction: (now: Date): DateRange => ({
      startDate: startOfDay(now),
      endDate: endOfDay(now)
    }),
    description: 'The current day'
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    type: 'relative',
    getRangeFunction: (now: Date): DateRange => {
      const yesterday = subtractDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday)
      };
    },
    description: 'The previous day'
  },
  {
    id: 'last7days',
    label: 'Last 7 Days',
    type: 'relative',
    getRangeFunction: (now: Date): DateRange => ({
      startDate: startOfDay(subtractDays(now, 6)),
      endDate: endOfDay(now)
    }),
    description: 'The last 7 days including today'
  },
  {
    id: 'last30days',
    label: 'Last 30 Days',
    type: 'relative',
    getRangeFunction: (now: Date): DateRange => ({
      startDate: startOfDay(subtractDays(now, 29)),
      endDate: endOfDay(now)
    }),
    description: 'The last 30 days including today'
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    type: 'relative',
    getRangeFunction: (now: Date): DateRange => ({
      startDate: startOfMonth(now),
      endDate: endOfDay(now)
    }),
    description: 'From the beginning of this month to today'
  },
  {
    id: 'lastMonth',
    label: 'Last Month',
    type: 'relative',
    getRangeFunction: (now: Date): DateRange => {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      };
    },
    description: 'The entire previous month'
  }
];

/**
 * Comparison presets
 */
export const ComparisonDateRangePresets: DateRangePreset[] = [
  {
    id: 'vsLastPeriod',
    label: 'vs. Previous Period',
    type: 'relative',
    isComparison: true,
    getRangeFunction: (now: Date): ComparisonDateRange => {
      // Assume current range is last 30 days
      const primaryEnd = endOfDay(now);
      const primaryStart = startOfDay(subtractDays(now, 29));
      const periodLength = 30;
      
      // Comparison period is the 30 days before that
      const comparisonEnd = startOfDay(subtractDays(primaryStart, 1));
      const comparisonStart = startOfDay(subtractDays(comparisonEnd, periodLength - 1));
      
      return {
        primary: {
          startDate: primaryStart,
          endDate: primaryEnd
        },
        comparison: {
          startDate: comparisonStart,
          endDate: comparisonEnd
        }
      };
    },
    description: 'Compare with the previous equivalent period'
  },
  {
    id: 'vsLastYear',
    label: 'vs. Previous Year',
    type: 'relative',
    isComparison: true,
    getRangeFunction: (now: Date): ComparisonDateRange => {
      // Assume current range is last 30 days
      const primaryEnd = endOfDay(now);
      const primaryStart = startOfDay(subtractDays(now, 29));
      
      // Comparison is same date range, but one year ago
      const lastYear = (date: Date): Date => {
        const result = new Date(date);
        result.setFullYear(result.getFullYear() - 1);
        return result;
      };
      
      return {
        primary: {
          startDate: primaryStart,
          endDate: primaryEnd
        },
        comparison: {
          startDate: lastYear(primaryStart),
          endDate: lastYear(primaryEnd)
        }
      };
    },
    description: 'Compare with the same period last year'
  }
];

/**
 * All combined presets
 */
export const AllDateRangePresets: DateRangePreset[] = [
  ...StandardDateRangePresets,
  ...ComparisonDateRangePresets
];

/**
 * Function to get a preset by ID
 */
export const getPresetById = (
  id: string, 
  presets: DateRangePreset[] = AllDateRangePresets
): DateRangePreset | undefined => {
  return presets.find(preset => preset.id === id);
};

/**
 * Apply a preset based on current date
 */
export const applyPreset = (
  preset: DateRangePreset,
  now: Date = new Date()
): DateRange | ComparisonDateRange => {
  return preset.getRangeFunction(now);
};