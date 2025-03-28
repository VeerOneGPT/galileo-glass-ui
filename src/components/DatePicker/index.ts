/**
 * DatePicker Component Exports
 */

import DatePicker from './DatePicker';
import { GlassDatePicker } from './GlassDatePicker';
import GlassLocalizationProvider, { DateAdapter, useDateAdapter } from './GlassLocalizationProvider';
import { createDateFnsAdapter } from './adapters/dateFnsAdapter';

export type { DatePickerProps, CalendarProps, CalendarView } from './types';
export type { DateAdapter, GlassLocalizationProviderProps } from './GlassLocalizationProvider';

// Expose DatePickerProps from GlassDatePicker
export interface GlassDatePickerProps {
  initialDate?: Date;
  onChange?: (date: Date) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  dateFormat?: string;
}

// Export components
export default DatePicker;
export { DatePicker, GlassDatePicker };

// Export localization utilities
export { GlassLocalizationProvider, useDateAdapter, createDateFnsAdapter };
