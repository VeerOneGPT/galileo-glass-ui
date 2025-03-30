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
// import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
// import { useGalileoSprings, SpringsAnimationResult } from '../../hooks/useGalileoSprings'; // Import Galileo hook
import { useGalileoStateSpring, GalileoStateSpringOptions, GalileoSpringResult } from '../../hooks/useGalileoStateSpring'; // Import useGalileoStateSpring
import ClearIcon from '../icons/ClearIcon';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';

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
  // Removed $reducedMotion as hook handles it
}>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  z-index: 1000;
  display: block;
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
  will-change: transform, opacity;
  transform-origin: top center;
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
    value: controlledValue,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    format = 'MM/dd/yyyy',
    placeholder = 'Select date',
    label,
    helperText,
    error,
    disabled = false,
    fullWidth = false,
    size = 'medium',
    minDate: minDateProp,
    maxDate: maxDateProp,
    disablePast = false,
    disableFuture = false,
    disableDates,
    clearable = true,
    closeOnSelect = true,
    firstDayOfWeek = 0, // 0 = Sunday, 1 = Monday
    monthNames = DEFAULT_MONTH_NAMES,
    dayNames = DEFAULT_DAY_NAMES,
    showTodayButton = true,
    todayButtonLabel = 'Today',
    calendarPlacement = 'bottom-start',
    showMonthSelection = true,
    showYearSelection = true,
    id, // Use provided id or generate one
    autoFocus,
    ...rest
  } = props;

  // Animation Context
  const {
    modalSpringConfig: contextModalSpringConfig,
    disableAnimation: contextDisableAnimation,
  } = useAnimationContext();

  // Determine if animation should be immediate (prop takes precedence if AnimationProps were added)
  const immediate = contextDisableAnimation; // Add || propDisableAnimation later

  // Resolve final spring config inline
  const finalModalSpringConfig = useMemo<Partial<SpringConfig>>(() => {
    const baseConfig = SpringPresets.DEFAULT;
    let resolvedContextConfig = {};
    if (typeof contextModalSpringConfig === 'string' && contextModalSpringConfig in SpringPresets) {
      resolvedContextConfig = SpringPresets[contextModalSpringConfig as keyof typeof SpringPresets];
    } else if (typeof contextModalSpringConfig === 'object') {
      resolvedContextConfig = contextModalSpringConfig ?? {};
    }
    // Add propAnimationConfig merging later if AnimationProps is formally added
    return { ...baseConfig, ...resolvedContextConfig };
  }, [contextModalSpringConfig]);

  // State for controlled/uncontrolled input value
  const [internalValue, setInternalValue] = useState<Date | null>(() => {
    const initialValue = controlledValue !== undefined ? controlledValue : defaultValue;
    return isValidDate(initialValue) ? initialValue : null;
  });

  // State for calendar visibility and current view date
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState<Date>(() => {
    const initialDate = internalValue || new Date();
    initialDate.setDate(1); // Start view at beginning of month
    return initialDate;
  });
  const [calendarView, setCalendarView] = useState<CalendarView>('days'); // 'days', 'months', 'years'

  // Refs for input and calendar container
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Update internal state if controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(isValidDate(controlledValue) ? controlledValue : null);
    }
  }, [controlledValue]);

  // Format date for display
  const displayValue = useMemo(() => formatDate(internalValue, format), [internalValue, format]);

  // Min/Max date parsing
  const minDate = useMemo(() => (minDateProp instanceof Date ? minDateProp : undefined), [minDateProp]);
  const maxDate = useMemo(() => (maxDateProp instanceof Date ? maxDateProp : undefined), [maxDateProp]);

  // Use Galileo Spring for entrance/exit animation
  const calendarAnimation: GalileoSpringResult = useGalileoStateSpring(
      isCalendarOpen ? 1 : 0, // Target value
      { // Options object
          ...finalModalSpringConfig, // Spread the resolved physics config
          immediate: immediate, // Pass the immediate flag
          // Add onRest if needed later for display: none
      }
  );

  // Determine if the calendar should be rendered (open or animating closed)
  const shouldRenderCalendar = isCalendarOpen || calendarAnimation.isAnimating;

  // Click outside handler
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    },
    [] // Refs are stable
  );

  useEffect(() => {
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen, handleClickOutside]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(parseDate(newValue, format));
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsCalendarOpen(!isCalendarOpen);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onFocus) onFocus(e);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) onBlur(e);
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date, minDate, maxDate, disablePast, disableFuture, disableDates)) return;

    setInternalValue(date);
    if (closeOnSelect) {
      setIsCalendarOpen(false);
    }
    setCalendarView('days');

    if (onChange && (controlledValue === undefined || controlledValue?.getTime() !== date.getTime())) {
      onChange(date);
    }

    inputRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalValue(null);
    setIsCalendarOpen(false);

    if (onChange && (controlledValue === undefined || controlledValue !== null)) {
      onChange(null);
    }

    inputRef.current?.focus();
  };

  const handleTodayClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isDateDisabled(today, minDate, maxDate, disablePast, disableFuture, disableDates)) return;

    setInternalValue(today);
    setCurrentViewDate(new Date(today));
    if (closeOnSelect) {
      setIsCalendarOpen(false);
    }
    setCalendarView('days');

    if (onChange && (controlledValue === undefined || controlledValue?.getTime() !== today.getTime())) {
      onChange(today);
    }
    inputRef.current?.focus();
  };

  const handleMonthChange = (increment: number) => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + increment, 1));
  };

  const handleYearChange = (increment: number) => {
    setCurrentViewDate(prev => new Date(prev.getFullYear() + increment, prev.getMonth(), 1));
  };

  const handleMonthSelect = (month: number) => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), month, 1));
    setCalendarView('days');
  };

  const handleYearSelect = (year: number) => {
    setCurrentViewDate(prev => new Date(year, prev.getMonth(), 1));
    setCalendarView('months');
  };

  const handleHeaderClick = () => {
    if (calendarView === 'days' && showMonthSelection) {
      setCalendarView('months');
    } else if (calendarView === 'months' && showYearSelection) {
      setCalendarView('years');
    }
  };

  const finalInputRef = ref || inputRef;

  const monthData = useMemo(
    () => getMonthData(currentViewDate.getFullYear(), currentViewDate.getMonth(), firstDayOfWeek),
    [currentViewDate, firstDayOfWeek]
  );

  const currentMonthName = monthNames[currentViewDate.getMonth()];
  const currentYear = currentViewDate.getFullYear();

  const inputId = useMemo(() => id || `datepicker-${Math.random().toString(36).substring(2, 9)}`, [id]);

  return (
    <DatePickerRoot
      $fullWidth={fullWidth}
      $animate={!contextDisableAnimation}
      $reducedMotion={contextDisableAnimation}
    >
      {label && <Label htmlFor={inputId} id={`label-${inputId}`}>{label}</Label>}
      <InputContainer
        $size={size}
        $focused={isCalendarOpen}
        $disabled={disabled}
        $hasError={!!error}
        onClick={handleInputClick}
      >
        <Input
          ref={finalInputRef}
          id={inputId}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          $size={size}
          $disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isCalendarOpen}
          aria-controls={isCalendarOpen ? `calendar-${inputId}` : undefined}
          aria-invalid={!!error}
          aria-labelledby={label ? `label-${inputId}` : undefined}
          autoComplete="off"
          {...rest}
        />
        {clearable && internalValue && !disabled && (
          <ClearButton onClick={handleClear} aria-label="Clear date">
            <ClearIcon />
          </ClearButton>
        )}
      </InputContainer>

      {shouldRenderCalendar && createPortal(
        <CalendarContainer
          ref={calendarRef}
          id={`calendar-${inputId}`}
          style={{
              opacity: calendarAnimation.value,
              transform: `scaleY(${calendarAnimation.value})`,
              pointerEvents: isCalendarOpen ? 'auto' : 'none',
              visibility: (isCalendarOpen || calendarAnimation.isAnimating) ? 'visible' : 'hidden',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={label ? `label-${inputId}` : undefined}
          aria-label={!label ? 'Date selection calendar' : undefined}
          onMouseDown={(e) => e.preventDefault()}
        >
          <CalendarHeader>
            <NavigationButton
              onClick={() => handleMonthChange(-1)}
              aria-label="Previous month"
              disabled={calendarView !== 'days'}
            >
              &lt;
            </NavigationButton>
            <MonthYearDisplay onClick={handleHeaderClick}>
              {currentMonthName} {currentYear}
            </MonthYearDisplay>
            <NavigationButton
              onClick={() => handleMonthChange(1)}
              aria-label="Next month"
              disabled={calendarView !== 'days'}
            >
              &gt;
            </NavigationButton>
          </CalendarHeader>
          <WeekdayHeader>
            {Array.from({ length: 7 }).map((_, i) => {
              const dayIndex = (firstDayOfWeek + i) % 7;
              return <WeekdayLabel key={i}>{dayNames[dayIndex]}</WeekdayLabel>;
            })}
          </WeekdayHeader>
          <DaysGrid>
            {calendarView === 'days' && monthData.map((day, index) => {
              const isSelected = internalValue?.getTime() === day.getTime();
              const isTodayFlag = day.toDateString() === new Date().toDateString();
              const isDisabledFlag = isDateDisabled(
                day,
                minDate,
                maxDate,
                disablePast,
                disableFuture,
                disableDates
              );
              const isCurrentMonthFlag = day.getMonth() === currentViewDate.getMonth();

              return (
                <DayCell
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  $isCurrentMonth={isCurrentMonthFlag}
                  $isSelected={isSelected}
                  $isToday={isTodayFlag}
                  $isDisabled={isDisabledFlag}
                  disabled={isDisabledFlag}
                  aria-label={`Select ${formatDate(day, 'MMMM d, yyyy')}${isSelected ? ', selected' : ''}`}
                  aria-current={isTodayFlag ? 'date' : undefined}
                  tabIndex={isCalendarOpen && isCurrentMonthFlag && !isDisabledFlag ? 0 : -1}
                >
                  {day.getDate()}
                </DayCell>
              );
            })}
          </DaysGrid>
          {showTodayButton && (
            <CalendarFooter>
              <TodayButton onClick={handleTodayClick}>{todayButtonLabel}</TodayButton>
            </CalendarFooter>
          )}
        </CalendarContainer>,
        document.body
      )}

      {helperText && <HelperText $hasError={!!error}>{helperText}</HelperText>}
    </DatePickerRoot>
  );
}

/**
 * DatePicker Component
 *
 * A comprehensive date picker component with glass morphism styling.
 */
export const DatePicker = forwardRef(DatePickerComponent);
DatePicker.displayName = 'DatePicker';

// Export types
export type { DatePickerProps, CalendarView };
