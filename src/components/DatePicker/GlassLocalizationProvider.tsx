/**
 * GlassLocalizationProvider Component
 *
 * Provides localization context for Glass date and time components.
 */
import React, { createContext, useContext, useMemo } from 'react';

// Define the adapter interface for date operations
export interface DateAdapter {
  locale: string;
  format: (date: Date | null, formatString: string) => string;
  parse: (value: string, formatString: string) => Date | null;
  isValid: (date: any) => boolean;
  addDays: (date: Date, amount: number) => Date;
  isToday: (date: Date) => boolean;
  isSameDay: (dateA: Date, dateB: Date) => boolean;
  isSameMonth: (dateA: Date, dateB: Date) => boolean;
  getDaysInMonth: (year: number, month: number) => number;
  getMonthData: (year: number, month: number, firstDayOfWeek: number) => Date[];
  getWeekdays: (format?: 'narrow' | 'short' | 'long') => string[];
  getMonthNames: (format?: 'narrow' | 'short' | 'long') => string[];
}

// Define the context props interface
export interface LocalizationContextProps {
  adapter: DateAdapter;
  locale: string;
  firstDayOfWeek: number;
  dateFormat: string;
  weekdayFormat: 'narrow' | 'short' | 'long';
  monthFormat: 'narrow' | 'short' | 'long';
}

// Create the context with default values
const LocalizationContext = createContext<LocalizationContextProps>({
  adapter: {} as DateAdapter,
  locale: 'en-US',
  firstDayOfWeek: 0, // Sunday
  dateFormat: 'MM/dd/yyyy',
  weekdayFormat: 'short',
  monthFormat: 'long',
});

// Hook for using the localization context
export const useDateAdapter = () => useContext(LocalizationContext);

// Props for the localization provider
export interface GlassLocalizationProviderProps {
  /** The date adapter to use */
  adapter: DateAdapter;
  /** The locale to use */
  locale?: string;
  /** The first day of the week (0 = Sunday, 1 = Monday, etc.) */
  firstDayOfWeek?: number;
  /** The default date format to use */
  dateFormat?: string;
  /** The format for weekday names */
  weekdayFormat?: 'narrow' | 'short' | 'long';
  /** The format for month names */
  monthFormat?: 'narrow' | 'short' | 'long';
  /** The children components */
  children: React.ReactNode;
}

/**
 * GlassLocalizationProvider Component
 * 
 * Provides localization context for Glass date and time components.
 */
export const GlassLocalizationProvider: React.FC<GlassLocalizationProviderProps> = ({
  adapter,
  locale = 'en-US',
  firstDayOfWeek = 0,
  dateFormat = 'MM/dd/yyyy',
  weekdayFormat = 'short',
  monthFormat = 'long',
  children,
}) => {
  // Create the context value
  const contextValue = useMemo(
    () => ({
      adapter,
      locale,
      firstDayOfWeek,
      dateFormat,
      weekdayFormat,
      monthFormat,
    }),
    [adapter, locale, firstDayOfWeek, dateFormat, weekdayFormat, monthFormat]
  );

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export default GlassLocalizationProvider; 