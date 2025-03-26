/**
 * Glass DatePicker Component
 *
 * A comprehensive date picker component with glass morphism styling.
 */
import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import ClearIcon from '../icons/ClearIcon';

import { DatePickerProps, CalendarView } from './types';

// Utility functions for date manipulation
const formatDate = (date: Date | null, format = 'MM/dd/yyyy'): string => {
  if (!date) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // Create a formatted date string by manually replacing tokens
  let result = format;
  result = result.replace(/dd/g, day);
  result = result.replace(/MM/g, month);
  result = result.replace(/yyyy/g, year.toString());
  result = result.replace(/yy/g, year.toString().slice(-2));
  return result;
};

const parseDate = (dateString: string, format = 'MM/dd/yyyy'): Date | null => {
  if (!dateString) return null;

  const hasDay = format.includes('dd');
  const hasMonth = format.includes('MM');
  const hasYear = format.includes('yyyy') || format.includes('yy');

  if (!hasDay || !hasMonth || !hasYear) return null;

  let day = 1,
    month = 0,
    year = new Date().getFullYear();

  const dayIndex = format.indexOf('dd');
  const monthIndex = format.indexOf('MM');
  const yearIndex = format.indexOf('yyyy') >= 0 ? format.indexOf('yyyy') : format.indexOf('yy');

  // Get the positions to extract each part
  const positions = [
    { type: 'day', index: dayIndex },
    { type: 'month', index: monthIndex },
    { type: 'year', index: yearIndex },
  ]
    .filter(p => p.index >= 0)
    .sort((a, b) => a.index - b.index);

  // Extract the date parts based on the format
  const parts = dateString.split(/[-/.\s]/);

  if (parts.length < 3) return null;

  positions.forEach((pos, i) => {
    const value = parseInt(parts[i], 10);
    if (isNaN(value)) return null;

    if (pos.type === 'day') day = value;
    if (pos.type === 'month') month = value - 1; // 0-indexed
    if (pos.type === 'year') {
      if (value < 100) {
        // Handle 2-digit years
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        year = century + value;
      } else {
        year = value;
      }
    }
  });

  // Validate the date
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;

  const result = new Date(year, month, day);
  if (isNaN(result.getTime())) return null;

  return result;
};

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

const isDateDisabled = (
  date: Date,
  minDate?: Date,
  maxDate?: Date,
  disablePast?: boolean,
  disableFuture?: boolean,
  disableDates?: Date[] | ((date: Date) => boolean)
): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (minDate && date < minDate) return true;
  if (maxDate && date > maxDate) return true;
  if (disablePast && date < today) return true;
  if (disableFuture && date > today) return true;

  if (disableDates) {
    if (typeof disableDates === 'function') {
      return disableDates(date);
    } else if (Array.isArray(disableDates)) {
      return disableDates.some(disabledDate => {
        if (isValidDate(disabledDate)) {
          return (
            date.getFullYear() === disabledDate.getFullYear() &&
            date.getMonth() === disabledDate.getMonth() &&
            date.getDate() === disabledDate.getDate()
          );
        }
        return false;
      });
    }
  }

  return false;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getMonthData = (year: number, month: number, firstDayOfWeek: number): Date[] => {
  const result: Date[] = [];
  const daysInMonth = getDaysInMonth(year, month);

  // First day of the month
  const firstDay = new Date(year, month, 1);
  let firstDayOffset = firstDay.getDay() - firstDayOfWeek;
  if (firstDayOffset < 0) firstDayOffset += 7;

  // Days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

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

// Default month and day names
const DEFAULT_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DEFAULT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Styled components
const DatePickerRoot = styled.div<{
  $fullWidth: boolean;
  $animate: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${props => (props.$fullWidth ? '100%' : '300px')};
  position: relative;

  /* Animation on mount */
  ${props =>
    props.$animate &&
    !props.$reducedMotion &&
    `
    animation: fadeIn 0.4s ease-out;
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}
`;

const InputContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $focused: boolean;
  $disabled: boolean;
  $hasError: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;

  /* Enhanced glass styling */
  ${props =>
    glassSurface({
      elevation: 1,
      blurStrength: 'light',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.theme),
    })}

  border-radius: 8px;
  border: 1px solid
    ${props =>
      props.$hasError
        ? 'rgba(240, 82, 82, 0.8)'
        : props.$focused
        ? 'rgba(99, 102, 241, 0.8)'
        : 'rgba(255, 255, 255, 0.12)'};
  background-color: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;

  /* Size variations */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          min-height: 36px;
          padding: 4px 8px;
        `;
      case 'large':
        return `
          min-height: 48px;
          padding: 8px 16px;
        `;
      default:
        return `
          min-height: 40px;
          padding: 6px 12px;
        `;
    }
  }}

  /* Focused state */
  ${props =>
    props.$focused &&
    `
    border-color: rgba(99, 102, 241, 0.8);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  `}
  
  /* Error state */
  ${props =>
    props.$hasError &&
    `
    border-color: rgba(240, 82, 82, 0.8);
    box-shadow: 0 0 0 1px rgba(240, 82, 82, 0.3);
  `}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: 0.6;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.01);
  `}
`;

const Input = styled.input<{
  $size: 'small' | 'medium' | 'large';
  $disabled: boolean;
}>`
  background: transparent;
  border: none;
  flex: 1;
  outline: none;
  width: 100%;
  min-width: 30px;
  color: inherit;
  font-size: ${props =>
    props.$size === 'small' ? '0.875rem' : props.$size === 'large' ? '1rem' : '0.875rem'};
  cursor: inherit;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  margin-bottom: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

const HelperText = styled.div<{
  $hasError: boolean;
}>`
  margin-top: 4px;
  font-size: 0.75rem;
  min-height: 18px;
  color: ${props => (props.$hasError ? 'rgba(240, 82, 82, 0.9)' : 'rgba(255, 255, 255, 0.6)')};
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CalendarContainer = styled.div<{
  $open: boolean;
  $reducedMotion: boolean;
}>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  z-index: 1000;
  display: ${props => (props.$open ? 'block' : 'none')};
  ${props =>
    glassSurface({
      elevation: 3,
      blurStrength: 'standard',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.theme),
    })}
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;

  /* Enhanced dropdown animation */
  ${props =>
    !props.$reducedMotion &&
    `
    animation: reveal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: top center;
    
    @keyframes reveal {
      from { opacity: 0; transform: scaleY(0.9) translateY(-8px); }
      to { opacity: 1; transform: scaleY(1) translateY(0); }
    }
  `}
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const MonthYearDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
      color: rgba(255, 255, 255, 0.8);
    }
  }
`;

const WeekdayHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 12px 0;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  padding: 4px 0;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 12px 16px;
`;

const DayCell = styled.button<{
  $isCurrentMonth: boolean;
  $isSelected: boolean;
  $isToday: boolean;
  $isDisabled: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border: none;
  background: ${props => (props.$isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent')};
  color: ${props =>
    props.$isDisabled
      ? 'rgba(255, 255, 255, 0.3)'
      : !props.$isCurrentMonth
      ? 'rgba(255, 255, 255, 0.4)'
      : props.$isToday
      ? 'rgba(99, 102, 241, 0.9)'
      : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 50%;
  font-size: 0.875rem;
  cursor: ${props => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.15s ease;
  position: relative;

  ${props =>
    props.$isToday &&
    !props.$isSelected &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: rgba(99, 102, 241, 0.8);
    }
  `}

  &:hover {
    background-color: ${props =>
      props.$isDisabled
        ? 'transparent'
        : props.$isSelected
        ? 'rgba(99, 102, 241, 0.25)'
        : 'rgba(255, 255, 255, 0.08)'};
  }

  ${props =>
    props.$isSelected &&
    `
    font-weight: 500;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  `}
`;

const MonthsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 16px;
  gap: 12px;
`;

const MonthCell = styled.button<{
  $isSelected: boolean;
  $isDisabled: boolean;
}>`
  padding: 12px 8px;
  border: none;
  background: ${props => (props.$isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent')};
  color: ${props => (props.$isDisabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)')};
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: ${props => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.15s ease;

  &:hover {
    background-color: ${props =>
      props.$isDisabled
        ? 'transparent'
        : props.$isSelected
        ? 'rgba(99, 102, 241, 0.25)'
        : 'rgba(255, 255, 255, 0.08)'};
  }

  ${props =>
    props.$isSelected &&
    `
    font-weight: 500;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  `}
`;

const YearsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 16px;
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;

  /* Subtle scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(99, 102, 241, 0.4);
    }
  }
`;

const YearCell = styled.button<{
  $isSelected: boolean;
  $isDisabled: boolean;
}>`
  padding: 12px 8px;
  border: none;
  background: ${props => (props.$isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent')};
  color: ${props => (props.$isDisabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)')};
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: ${props => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.15s ease;

  &:hover {
    background-color: ${props =>
      props.$isDisabled
        ? 'transparent'
        : props.$isSelected
        ? 'rgba(99, 102, 241, 0.25)'
        : 'rgba(255, 255, 255, 0.08)'};
  }

  ${props =>
    props.$isSelected &&
    `
    font-weight: 500;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  `}
`;

const CalendarFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const TodayButton = styled.button`
  background: none;
  border: none;
  color: rgba(99, 102, 241, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(99, 102, 241, 0.1);
  }
`;

/**
 * DatePicker Component Implementation
 */
function DatePickerComponent(props: DatePickerProps, ref: React.ForwardedRef<HTMLInputElement>) {
  const {
    value,
    defaultValue,
    onChange,
    minDate,
    maxDate,
    disabled = false,
    label,
    helperText,
    error = false,
    placeholder = 'Select date',
    format = 'MM/dd/yyyy',
    clearable = true,
    size = 'medium',
    fullWidth = false,
    animate = false,
    locale = 'en-US',
    firstDayOfWeek = 0,
    disableDates,
    showTodayButton = true,
    disablePast = false,
    disableFuture = false,
    autoFocus = false,
    disablePortal = false,
    popperContainer,
    monthNames = DEFAULT_MONTH_NAMES,
    dayNames = DEFAULT_DAY_NAMES,
    showYearSelection = true,
    showMonthSelection = true,
    style,
    className,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // State
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarView>('days');

  // Initialize with value or defaultValue
  useEffect(() => {
    const initialDate = value !== undefined ? value : defaultValue;

    if (initialDate && isValidDate(initialDate)) {
      setSelectedDate(initialDate);
      setCalendarDate(new Date(initialDate));
      setInputValue(formatDate(initialDate, format));
    }
  }, []);

  // Handle controlled component updates
  useEffect(() => {
    if (value !== undefined) {
      if (value && isValidDate(value)) {
        setSelectedDate(value);
        setCalendarDate(new Date(value));
        setInputValue(formatDate(value, format));
      } else {
        setSelectedDate(null);
        setInputValue('');
      }
    }
  }, [value, format]);

  // Handle outside clicks to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node) &&
        !(calendarRef.current && calendarRef.current.contains(event.target as Node))
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the input value
    const parsedDate = parseDate(newValue, format);

    if (parsedDate && isValidDate(parsedDate)) {
      setSelectedDate(parsedDate);
      setCalendarDate(new Date(parsedDate));

      if (onChange) {
        onChange(parsedDate);
      }
    } else if (newValue === '') {
      // Clear the date
      setSelectedDate(null);

      if (onChange) {
        onChange(null);
      }
    }
  };

  const handleInputFocus = () => {
    setFocused(true);
    setOpen(true);
  };

  const handleInputBlur = () => {
    setFocused(false);

    // If input is empty or invalid, reset to selected date format or empty
    if (selectedDate) {
      setInputValue(formatDate(selectedDate, format));
    } else if (inputValue && parseDate(inputValue, format) === null) {
      setInputValue('');
    }
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date, minDate, maxDate, disablePast, disableFuture, disableDates)) {
      return;
    }

    setSelectedDate(date);
    setInputValue(formatDate(date, format));
    setOpen(false);

    if (onChange) {
      onChange(date);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();

    setSelectedDate(null);
    setInputValue('');

    if (onChange) {
      onChange(null);
    }

    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleTodayClick = () => {
    const today = new Date();

    if (!isDateDisabled(today, minDate, maxDate, disablePast, disableFuture, disableDates)) {
      setSelectedDate(today);
      setCalendarDate(today);
      setInputValue(formatDate(today, format));

      if (onChange) {
        onChange(today);
      }

      setOpen(false);
    }
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(calendarDate.getMonth() + increment);
    setCalendarDate(newDate);
  };

  const handleYearChange = (increment: number) => {
    const newDate = new Date(calendarDate);
    newDate.setFullYear(calendarDate.getFullYear() + increment);
    setCalendarDate(newDate);
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(month);
    setCalendarDate(newDate);
    setCalendarView('days');
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(calendarDate);
    newDate.setFullYear(year);
    setCalendarDate(newDate);
    setCalendarView('months');
  };

  const handleHeaderClick = () => {
    if (calendarView === 'days' && showMonthSelection) {
      setCalendarView('months');
    } else if (calendarView === 'months' && showYearSelection) {
      setCalendarView('years');
    }
  };

  // Generate calendar data
  const monthData = useMemo(() => {
    return getMonthData(calendarDate.getFullYear(), calendarDate.getMonth(), firstDayOfWeek);
  }, [calendarDate, firstDayOfWeek]);

  // Generate years for year selection (±10 years from current)
  const yearsData = useMemo(() => {
    const years = [];
    const currentYear = calendarDate.getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;

    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }

    return years;
  }, [calendarDate]);

  // Adjust day names according to first day of week
  const adjustedDayNames = useMemo(() => {
    const names = [...dayNames];
    return [...names.slice(firstDayOfWeek), ...names.slice(0, firstDayOfWeek)];
  }, [dayNames, firstDayOfWeek]);

  // Handle forwarded ref
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Determine helper text content
  const helperTextContent =
    error === true ? helperText : typeof error === 'string' ? error : helperText;
  const hasError = Boolean(error);

  // Show clear button?
  const showClearButton = clearable && !disabled && selectedDate !== null;

  // Render calendar
  const renderCalendar = () => {
    if (!open) return null;

    const calendarContent = (
      <CalendarContainer ref={calendarRef} $open={open} $reducedMotion={prefersReducedMotion}>
        <CalendarHeader>
          {calendarView === 'days' && (
            <>
              <NavigationButton onClick={() => handleMonthChange(-1)} aria-label="Previous month">
                ←
              </NavigationButton>

              <MonthYearDisplay onClick={handleHeaderClick}>
                {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </MonthYearDisplay>

              <NavigationButton onClick={() => handleMonthChange(1)} aria-label="Next month">
                →
              </NavigationButton>
            </>
          )}

          {calendarView === 'months' && (
            <>
              <NavigationButton onClick={() => handleYearChange(-1)} aria-label="Previous year">
                ←
              </NavigationButton>

              <MonthYearDisplay onClick={handleHeaderClick}>
                {calendarDate.getFullYear()}
              </MonthYearDisplay>

              <NavigationButton onClick={() => handleYearChange(1)} aria-label="Next year">
                →
              </NavigationButton>
            </>
          )}

          {calendarView === 'years' && (
            <>
              <NavigationButton
                onClick={() => {
                  const newDate = new Date(calendarDate);
                  newDate.setFullYear(calendarDate.getFullYear() - 10);
                  setCalendarDate(newDate);
                }}
                aria-label="Previous decade"
              >
                ←
              </NavigationButton>

              <MonthYearDisplay>
                {yearsData[0]} - {yearsData[yearsData.length - 1]}
              </MonthYearDisplay>

              <NavigationButton
                onClick={() => {
                  const newDate = new Date(calendarDate);
                  newDate.setFullYear(calendarDate.getFullYear() + 10);
                  setCalendarDate(newDate);
                }}
                aria-label="Next decade"
              >
                →
              </NavigationButton>
            </>
          )}
        </CalendarHeader>

        {calendarView === 'days' && (
          <>
            <WeekdayHeader>
              {adjustedDayNames.map((day, index) => (
                <WeekdayLabel key={index}>{day}</WeekdayLabel>
              ))}
            </WeekdayHeader>

            <DaysGrid>
              {monthData.map((date, index) => {
                const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
                const isToday =
                  isCurrentMonth &&
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();
                const isSelected =
                  selectedDate &&
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();
                const isDisabled = isDateDisabled(
                  date,
                  minDate,
                  maxDate,
                  disablePast,
                  disableFuture,
                  disableDates
                );

                return (
                  <DayCell
                    key={index}
                    $isCurrentMonth={isCurrentMonth}
                    $isSelected={!!isSelected}
                    $isToday={isToday}
                    $isDisabled={isDisabled}
                    onClick={() => !isDisabled && handleDateSelect(date)}
                    disabled={isDisabled}
                    tabIndex={isCurrentMonth && !isDisabled ? 0 : -1}
                    aria-label={date.toLocaleDateString(locale)}
                    aria-selected={isSelected || undefined}
                  >
                    {date.getDate()}
                  </DayCell>
                );
              })}
            </DaysGrid>
          </>
        )}

        {calendarView === 'months' && (
          <MonthsGrid>
            {monthNames.map((month, index) => {
              const monthDate = new Date(calendarDate);
              monthDate.setMonth(index);

              // Check if this month is disabled
              const firstDay = new Date(calendarDate.getFullYear(), index, 1);
              const lastDay = new Date(calendarDate.getFullYear(), index + 1, 0);

              // A month is disabled if all its days are disabled
              const isDisabled =
                (minDate && lastDay < minDate) ||
                (maxDate && firstDay > maxDate) ||
                (disablePast &&
                  lastDay < new Date() &&
                  (new Date().getMonth() !== index ||
                    new Date().getFullYear() !== calendarDate.getFullYear())) ||
                (disableFuture &&
                  firstDay > new Date() &&
                  (new Date().getMonth() !== index ||
                    new Date().getFullYear() !== calendarDate.getFullYear()));

              const isSelected =
                selectedDate &&
                selectedDate.getMonth() === index &&
                selectedDate.getFullYear() === calendarDate.getFullYear();

              return (
                <MonthCell
                  key={index}
                  $isSelected={!!isSelected}
                  $isDisabled={isDisabled}
                  onClick={() => !isDisabled && handleMonthSelect(index)}
                  disabled={isDisabled}
                  aria-label={month}
                  aria-selected={isSelected || undefined}
                >
                  {month.substring(0, 3)}
                </MonthCell>
              );
            })}
          </MonthsGrid>
        )}

        {calendarView === 'years' && (
          <YearsGrid>
            {yearsData.map((year, index) => {
              // Check if this year is disabled
              const firstDay = new Date(year, 0, 1);
              const lastDay = new Date(year, 11, 31);

              const isDisabled =
                (minDate && lastDay < minDate) ||
                (maxDate && firstDay > maxDate) ||
                (disablePast && lastDay < new Date() && year !== new Date().getFullYear()) ||
                (disableFuture && firstDay > new Date() && year !== new Date().getFullYear());

              const isSelected = selectedDate && selectedDate.getFullYear() === year;

              return (
                <YearCell
                  key={index}
                  $isSelected={!!isSelected}
                  $isDisabled={isDisabled}
                  onClick={() => !isDisabled && handleYearSelect(year)}
                  disabled={isDisabled}
                  aria-label={year.toString()}
                  aria-selected={isSelected || undefined}
                >
                  {year}
                </YearCell>
              );
            })}
          </YearsGrid>
        )}

        {showTodayButton && calendarView === 'days' && (
          <CalendarFooter>
            <TodayButton onClick={handleTodayClick} aria-label="Go to today">
              Today
            </TodayButton>
          </CalendarFooter>
        )}
      </CalendarContainer>
    );

    // Use portal if not disabled
    if (!disablePortal) {
      const portalTarget = popperContainer || document.body;
      return createPortal(calendarContent, portalTarget);
    }

    return calendarContent;
  };

  return (
    <DatePickerRoot
      ref={rootRef}
      className={className}
      style={style}
      $fullWidth={fullWidth}
      $animate={animate}
      $reducedMotion={prefersReducedMotion}
    >
      {label && <Label>{label}</Label>}

      <InputContainer
        $size={size}
        $focused={focused}
        $disabled={disabled}
        $hasError={hasError}
        onClick={() => {
          if (!disabled && inputRef.current) {
            inputRef.current.focus();
            setOpen(true);
          }
        }}
      >
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          $size={size}
          $disabled={disabled}
          autoFocus={autoFocus}
          {...rest}
        />

        {showClearButton && (
          <ClearButton onClick={handleClear} title="Clear" aria-label="Clear date">
            <ClearIcon />
          </ClearButton>
        )}
      </InputContainer>

      {renderCalendar()}

      {helperTextContent && <HelperText $hasError={hasError}>{helperTextContent}</HelperText>}
    </DatePickerRoot>
  );
}

/**
 * DatePicker Component
 *
 * A comprehensive date picker component with glass morphism styling.
 */
const DatePicker = forwardRef(DatePickerComponent);

/**
 * GlassDatePicker Component
 *
 * Glass variant of the DatePicker component.
 */
const GlassDatePicker = DatePicker;

export default DatePicker;
export { DatePicker, GlassDatePicker };
