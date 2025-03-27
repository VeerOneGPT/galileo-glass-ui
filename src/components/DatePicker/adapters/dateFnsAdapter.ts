/**
 * Date-fns adapter for GlassDatePicker
 */
import {
  format as dateFnsFormat,
  parse as dateFnsParse,
  isValid,
  addDays,
  isToday,
  isSameDay,
  isSameMonth,
  getDaysInMonth,
  isDate
} from 'date-fns';
import { DateAdapter } from '../GlassLocalizationProvider';

/**
 * Gets the day names for a locale
 */
const getWeekdays = (format: 'narrow' | 'short' | 'long' = 'short'): string[] => {
  const weekdays = [];
  const date = new Date(2021, 0, 3); // A Sunday (Jan 3, 2021)
  
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(date, i);
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: format });
    weekdays.push(formatter.format(currentDate));
  }
  
  return weekdays;
};

/**
 * Gets the month names for a locale
 */
const getMonthNames = (format: 'narrow' | 'short' | 'long' = 'long'): string[] => {
  const months = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(2021, i, 1);
    const formatter = new Intl.DateTimeFormat('en-US', { month: format });
    months.push(formatter.format(date));
  }
  
  return months;
};

/**
 * Gets calendar data for a month
 */
const getMonthData = (year: number, month: number, firstDayOfWeek: number): Date[] => {
  const result: Date[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));

  // First day of the month
  const firstDay = new Date(year, month, 1);
  let firstDayOffset = firstDay.getDay() - firstDayOfWeek;
  if (firstDayOffset < 0) firstDayOffset += 7;

  // Days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(new Date(prevMonthYear, prevMonth));

  for (let i = 0; i < firstDayOffset; i++) {
    const day = daysInPrevMonth - firstDayOffset + i + 1;
    result.push(new Date(prevMonthYear, prevMonth, day));
  }

  // Days of the current month
  for (let i = 1; i <= daysInMonth; i++) {
    result.push(new Date(year, month, i));
  }

  // Fill in the rest of the calendar with days from the next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;

  const remainingDays = 42 - result.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    result.push(new Date(nextMonthYear, nextMonth, i));
  }

  return result;
};

/**
 * Creates a date-fns adapter for Glass date components
 */
export const createDateFnsAdapter = (locale = 'en-US'): DateAdapter => {
  return {
    locale,
    
    format: (date, formatString) => {
      if (!date) return '';
      try {
        return dateFnsFormat(date, formatString);
      } catch (e) {
        console.error('Date formatting error:', e);
        return '';
      }
    },
    
    parse: (value, formatString) => {
      if (!value) return null;
      try {
        const date = dateFnsParse(value, formatString, new Date());
        return isValid(date) ? date : null;
      } catch (e) {
        return null;
      }
    },
    
    isValid: (date) => {
      return isDate(date) && isValid(date);
    },
    
    addDays,
    isToday,
    isSameDay,
    isSameMonth,
    getDaysInMonth: (year, month) => getDaysInMonth(new Date(year, month)),
    getMonthData,
    getWeekdays,
    getMonthNames
  };
};

export default createDateFnsAdapter; 