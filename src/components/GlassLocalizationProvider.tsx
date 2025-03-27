/**
 * Glass Localization Provider Component
 * 
 * A Glass-styled wrapper for date localization that replaces the MUI LocalizationProvider
 * to maintain consistent Glass UI styling while providing date formatting capabilities.
 */

import React, { ReactNode, createContext, useContext } from 'react';
import { format, parse, isValid, addDays, addMonths, addYears } from 'date-fns';

// Define the shape of our adapter context
export interface DateAdapter {
  format: (date: Date | null, formatString: string) => string;
  parse: (value: string, formatString: string) => Date | null;
  isValid: (date: any) => boolean;
  addDays: (date: Date, amount: number) => Date;
  addMonths: (date: Date, amount: number) => Date;
  addYears: (date: Date, amount: number) => Date;
}

// Create a context for our date adapter
const DateAdapterContext = createContext<DateAdapter | null>(null);

// Hook to use the date adapter
export const useDateAdapter = () => {
  const adapter = useContext(DateAdapterContext);
  if (!adapter) {
    throw new Error('useDateAdapter must be used within a GlassLocalizationProvider');
  }
  return adapter;
};

export interface GlassLocalizationProviderProps {
  /** Date adapter to use (defaults to DateFns) */
  dateAdapter?: 'date-fns';
  /** Children to render */
  children: ReactNode;
}

/**
 * Glass Localization Provider
 * Provides date formatting and manipulation utilities for Glass components
 */
export const GlassLocalizationProvider: React.FC<GlassLocalizationProviderProps> = ({
  dateAdapter = 'date-fns',
  children
}) => {
  // Create our adapter based on date-fns
  // This can be extended to support other adapters in the future if needed
  const adapter: DateAdapter = {
    format: (date, formatString) => date ? format(date, formatString) : '',
    parse: (value, formatString) => {
      try {
        const parsedDate = parse(value, formatString, new Date());
        return isValid(parsedDate) ? parsedDate : null;
      } catch (error) {
        return null;
      }
    },
    isValid,
    addDays,
    addMonths,
    addYears
  };

  return (
    <DateAdapterContext.Provider value={adapter}>
      {children}
    </DateAdapterContext.Provider>
  );
};

export default GlassLocalizationProvider;