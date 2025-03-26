/**
 * DatePicker Component Types
 *
 * Type definitions for the DatePicker component.
 */

import React from 'react';

/**
 * DatePickerProps interface
 */
export interface DatePickerProps {
  /** Current selected date value */
  value?: Date | null;
  
  /** Default date value (uncontrolled component) */
  defaultValue?: Date | null;
  
  /** Callback fired when the date changes */
  onChange?: (date: Date | null) => void;
  
  /** Minimum selectable date */
  minDate?: Date;
  
  /** Maximum selectable date */
  maxDate?: Date;
  
  /** Whether the date picker is disabled */
  disabled?: boolean;
  
  /** Label displayed above the date picker */
  label?: string;
  
  /** Helper text displayed below the date picker */
  helperText?: string;
  
  /** Error state of the date picker */
  error?: boolean | string;
  
  /** Input placeholder text */
  placeholder?: string;
  
  /** Whether the date picker is required */
  required?: boolean;
  
  /** Whether to display the clear button */
  clearable?: boolean;
  
  /** Date format string (e.g., 'MM/dd/yyyy') */
  format?: string;
  
  /** Size of the date picker */
  size?: 'small' | 'medium' | 'large';
  
  /** Whether the date picker should take the full width of its container */
  fullWidth?: boolean;
  
  /** Whether to enable animations */
  animate?: boolean;
  
  /** Locale for date formatting */
  locale?: string;
  
  /** First day of the week (0 = Sunday, 1 = Monday, etc.) */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  
  /** Disable specific dates */
  disableDates?: Date[] | ((date: Date) => boolean);
  
  /** Show today button */
  showTodayButton?: boolean;
  
  /** Disable past dates */
  disablePast?: boolean;
  
  /** Disable future dates */
  disableFuture?: boolean;
  
  /** Whether the input should auto-focus */
  autoFocus?: boolean;
  
  /** Disable portal for date picker popup */
  disablePortal?: boolean;
  
  /** Custom popup container */
  popperContainer?: HTMLElement | null;
  
  /** Month names override */
  monthNames?: string[];
  
  /** Day names override */
  dayNames?: string[];
  
  /** CSS styles applied to the component */
  style?: React.CSSProperties;
  
  /** Class name for the component */
  className?: string;
  
  /** Whether to show year selection */
  showYearSelection?: boolean;
  
  /** Whether to show month selection */
  showMonthSelection?: boolean;
  
  /** Additional props */
  [key: string]: any;
}

/**
 * Calendar view mode
 */
export type CalendarView = 'days' | 'months' | 'years';

/**
 * Calendar props for internal calendar component
 */
export interface CalendarProps {
  /** Current selected date */
  selectedDate: Date | null;
  
  /** Currently focused date (for keyboard navigation) */
  focusedDate: Date;
  
  /** Callback when a date is selected */
  onDateSelect: (date: Date) => void;
  
  /** Callback when focus changes */
  onFocusChange?: (date: Date) => void;
  
  /** Minimum selectable date */
  minDate?: Date;
  
  /** Maximum selectable date */
  maxDate?: Date;
  
  /** First day of the week */
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  
  /** Disable specific dates */
  disableDates?: Date[] | ((date: Date) => boolean);
  
  /** Disable past dates */
  disablePast?: boolean;
  
  /** Disable future dates */
  disableFuture?: boolean;
  
  /** Month names override */
  monthNames?: string[];
  
  /** Day names override */
  dayNames?: string[];
  
  /** Current view (days, months, years) */
  view: CalendarView;
  
  /** Callback when view changes */
  onViewChange: (view: CalendarView) => void;
  
  /** Whether reduced motion is preferred */
  reducedMotion: boolean;
}