/**
 * Types for the GlassDateRangePicker component.
 */
import React from 'react';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';

/**
 * Date range object with start and end dates
 */
export interface DateRange {
  /** Start date of the range */
  startDate: Date | null;
  
  /** End date of the range */
  endDate: Date | null;
}

/**
 * Comparison date range for comparing two periods
 */
export interface ComparisonDateRange {
  /** Primary date range */
  primary: DateRange;
  
  /** Comparison date range */
  comparison: DateRange;
}

/**
 * Preset date range configuration
 */
export interface DateRangePreset {
  /** Unique identifier for the preset */
  id: string;
  
  /** Display label for the preset */
  label: string;
  
  /** Range type classification */
  type?: 'relative' | 'fixed' | 'custom';
  
  /** Whether this is a comparison preset */
  isComparison?: boolean;
  
  /** 
   * Function to generate date range based on current date
   * @param now Current date reference
   * @returns Date range object
   */
  getRangeFunction: (now: Date) => DateRange | ComparisonDateRange;
  
  /** Optional description for the preset */
  description?: string;
  
  /** Custom icon to display next to this preset */
  icon?: React.ReactNode;
}

/**
 * Calendar view mode
 */
export type CalendarView = 'day' | 'month' | 'year' | 'decade';

/**
 * Props for the GlassDateRangePicker component
 */
export interface DateRangePickerProps {
  /** Currently selected date range */
  value?: DateRange;
  
  /** Callback when date range changes */
  onChange?: (range: DateRange) => void;
  
  /** Callback when date range is cleared */
  onClear?: () => void;
  
  /** Whether the component should display in comparison mode */
  comparisonMode?: boolean;
  
  /** Comparison date range value (for comparison mode) */
  comparisonValue?: DateRange;
  
  /** Callback when comparison range changes */
  onComparisonChange?: (comparisonRange: DateRange) => void;
  
  /** Minimum selectable date */
  minDate?: Date;
  
  /** Maximum selectable date */
  maxDate?: Date;
  
  /** Whether time selection is enabled */
  enableTimeSelection?: boolean;
  
  /** Format string for displaying the date */
  dateFormat?: string;
  
  /** Format string for displaying time */
  timeFormat?: string;
  
  /** Presets for quick date range selection */
  presets?: DateRangePreset[];
  
  /** Locale for date formatting */
  locale?: string;
  
  /** First day of week (0 = Sunday, 1 = Monday, etc.) */
  firstDayOfWeek?: number;
  
  /** Whether the picker is disabled */
  disabled?: boolean;
  
  /** CSS class name */
  className?: string;
  
  /** Inline styles */
  style?: React.CSSProperties;
  
  /** Label text */
  label?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Whether the component has an error */
  error?: boolean;
  
  /** Error message */
  errorMessage?: string;
  
  /** Placeholder text when no date is selected */
  placeholder?: string;
  
  /** Whether the component is required */
  required?: boolean;
  
  /** Whether to show clear button */
  clearable?: boolean;
  
  /** Whether to automatically close the picker when a range is selected */
  autoClose?: boolean;
  
  /** Whether to show week numbers in calendar */
  showWeekNumbers?: boolean;
  
  /** Initial calendar view */
  initialView?: CalendarView;
  
  /** Whether to display in month view */
  monthView?: boolean;
  
  /** Whether to display in full-width mode */
  fullWidth?: boolean;
  
  /** Size variant of the component */
  size?: 'small' | 'medium' | 'large';
  
  /** Glass variant style */
  glassVariant?: 'clear' | 'frosted' | 'tinted';
  
  /** Blur strength for glass effect */
  blurStrength?: 'light' | 'standard' | 'strong';
  
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  
  /** Whether to display in inline mode (always open) */
  inline?: boolean;
  
  /** Id for accessibility */
  id?: string;
  
  /** Aria label */
  ariaLabel?: string;
  
  /** Whether to show animations */
  animate?: boolean;
  
  /** Custom renderer for the input display */
  renderInput?: (params: {
    startDate: Date | null;
    endDate: Date | null;
    onClick: () => void;
    placeholder: string;
    inputRef: React.Ref<HTMLInputElement>;
  }) => React.ReactNode;
  
  /** Custom renderer for day cells */
  renderDay?: (date: Date, selected: boolean, inRange: boolean, props: any) => React.ReactNode;
  
  /** Physics animation settings */
  physics?: {
    /** Spring tension for animations (higher = faster) */
    tension?: number;
    /** Spring friction for animations (higher = less bouncy) */
    friction?: number;
    /** Animation preset */
    animationPreset?: 'gentle' | 'default' | 'snappy' | 'bouncy';
  };
  
  /** Mobile-specific options */
  mobile?: {
    /** Whether to use a full-screen modal on mobile */
    fullScreen?: boolean;
    /** Different view for mobile devices */
    mobileView?: 'auto' | 'portrait' | 'landscape';
    /** Enable gesture-based navigation */
    enableGestures?: boolean;
  };
  
  /**
   * Configuration for the popover entrance/exit animation.
   * Can be a partial SpringConfig object or a preset name.
   */
  popoverAnimationConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;
}