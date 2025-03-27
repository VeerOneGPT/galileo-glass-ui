/**
 * DatePicker Component Exports
 */

import DatePicker from './DatePicker';
import { GlassDatePicker } from './GlassDatePicker';
import GlassLocalizationProvider, { DateAdapter, useDateAdapter } from './GlassLocalizationProvider';
import { createDateFnsAdapter } from './adapters/dateFnsAdapter';

export type { DatePickerProps, CalendarProps, CalendarView } from './types';
export type { GlassDatePickerProps } from './GlassDatePicker';
export type { DateAdapter, GlassLocalizationProviderProps } from './GlassLocalizationProvider';

// Export components
export default DatePicker;
export { DatePicker, GlassDatePicker };

// Export localization utilities
export { GlassLocalizationProvider, useDateAdapter, createDateFnsAdapter };
