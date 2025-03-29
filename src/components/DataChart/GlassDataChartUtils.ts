/**
 * GlassDataChart Utility Functions
 * Provides formatting and utility functions for chart data display
 */

/**
 * Format options for various data types
 */
export interface FormatOptions {
  /** Number of decimal places for numerical values */
  decimals?: number;
  /** Currency symbol for monetary values */
  currencySymbol?: string;
  /** Locale for number formatting */
  locale?: string;
  /** Whether to use compact notation for large numbers */
  compact?: boolean;
  /** Whether to show plus sign for positive values */
  showPlus?: boolean;
  /** Custom suffix to append to the formatted value */
  suffix?: string;
  /** Custom prefix to prepend to the formatted value */
  prefix?: string;
}

/**
 * Format a number with specified options
 */
export const formatNumber = (value: number, options: FormatOptions = {}): string => {
  const {
    decimals = 0,
    locale = 'en-US',
    compact = false,
    showPlus = false,
    suffix = '',
    prefix = '',
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const sign = value > 0 && showPlus ? '+' : '';
  
  let formattedValue: string;
  
  try {
    if (compact) {
      // Use compact notation for large numbers
      formattedValue = new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: decimals,
      }).format(value);
    } else {
      // Standard formatting
      formattedValue = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      }).format(value);
    }
  } catch (error) {
    // Fallback if Intl API fails
    formattedValue = value.toFixed(decimals);
  }

  return `${prefix}${sign}${formattedValue}${suffix}`;
};

/**
 * Format a value as currency
 */
export const formatCurrency = (value: number, options: FormatOptions = {}): string => {
  const {
    decimals = 2,
    currencySymbol = '$',
    locale = 'en-US',
    compact = false,
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  try {
    if (compact && Math.abs(value) >= 1000) {
      // Use compact notation for large currency values
      const formatted = new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: decimals,
      }).format(value);
      return `${currencySymbol}${formatted}`;
    } else {
      // Standard currency formatting
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencySymbol === '$' ? 'USD' : 'EUR', // Default to USD for $ symbol
        currencyDisplay: 'symbol',
        maximumFractionDigits: decimals,
      }).format(value);
    }
  } catch (error) {
    // Fallback if Intl API fails
    return `${currencySymbol}${value.toFixed(decimals)}`;
  }
};

/**
 * Format a value as a percentage
 */
export const formatPercentage = (value: number, options: FormatOptions = {}): string => {
  const {
    decimals = 1,
    locale = 'en-US',
    showPlus = false,
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const sign = value > 0 && showPlus ? '+' : '';
  
  try {
    // Convert to percentage (multiply by 100)
    const percentage = value * 100;
    
    // Format the percentage
    const formatted = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(percentage);
    
    return `${sign}${formatted}%`;
  } catch (error) {
    // Fallback if Intl API fails
    return `${sign}${(value * 100).toFixed(decimals)}%`;
  }
};

/**
 * Format a value with units (K, M, B, T)
 */
export const formatWithUnits = (value: number, options: FormatOptions = {}): string => {
  const {
    decimals = 1,
    locale = 'en-US',
    showPlus = false,
    prefix = '',
    suffix = '',
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const sign = value > 0 && showPlus ? '+' : '';
  const absValue = Math.abs(value);
  
  let unitValue: number;
  let unitSuffix: string;
  
  if (absValue >= 1e12) {
    unitValue = value / 1e12;
    unitSuffix = 'T';
  } else if (absValue >= 1e9) {
    unitValue = value / 1e9;
    unitSuffix = 'B';
  } else if (absValue >= 1e6) {
    unitValue = value / 1e6;
    unitSuffix = 'M';
  } else if (absValue >= 1e3) {
    unitValue = value / 1e3;
    unitSuffix = 'K';
  } else {
    unitValue = value;
    unitSuffix = '';
  }
  
  try {
    // Format the value with the appropriate number of decimal places
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(unitValue);
    
    return `${prefix}${sign}${formatted}${unitSuffix}${suffix}`;
  } catch (error) {
    // Fallback if Intl API fails
    return `${prefix}${sign}${unitValue.toFixed(decimals)}${unitSuffix}${suffix}`;
  }
};

/**
 * Format a date value (Unix timestamp, Date object, or date string)
 */
export const formatDate = (
  value: number | Date | string,
  format: 'short' | 'medium' | 'long' | 'custom' = 'medium',
  customFormat?: string,
  locale: string = 'en-US'
): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    // Handle timestamp in milliseconds or seconds
    date = new Date(value > 1e10 ? value : value * 1000);
  } else {
    date = new Date(value);
  }
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  try {
    const options: Intl.DateTimeFormatOptions = {};
    
    if (format === 'short') {
      options.year = 'numeric';
      options.month = 'numeric';
      options.day = 'numeric';
    } else if (format === 'medium') {
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
    } else if (format === 'long') {
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      options.weekday = 'long';
    } else if (format === 'custom' && customFormat) {
      // Basic custom formatter - supports yyyy, MM, dd, HH, mm, ss
      return customFormat
        .replace('yyyy', date.getFullYear().toString())
        .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
        .replace('dd', date.getDate().toString().padStart(2, '0'))
        .replace('HH', date.getHours().toString().padStart(2, '0'))
        .replace('mm', date.getMinutes().toString().padStart(2, '0'))
        .replace('ss', date.getSeconds().toString().padStart(2, '0'));
    }
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    // Fallback if Intl API fails
    return date.toDateString();
  }
};

/**
 * Format a duration in milliseconds to a human-readable string
 */
export const formatDuration = (
  milliseconds: number,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  if (milliseconds === null || milliseconds === undefined || isNaN(milliseconds)) {
    return 'N/A';
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  
  if (format === 'short') {
    if (days > 0) return `${days}d ${remainingHours}h`;
    if (hours > 0) return `${hours}h ${remainingMinutes}m`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${seconds}s`;
  } else if (format === 'medium') {
    if (days > 0) return `${days}d ${remainingHours}h ${remainingMinutes}m`;
    if (hours > 0) return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${seconds} seconds`;
  } else {
    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (remainingHours > 0 || days > 0) parts.push(`${remainingHours} hour${remainingHours > 1 ? 's' : ''}`);
    if (remainingMinutes > 0 || hours > 0) parts.push(`${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`);
    if (remainingSeconds > 0 || minutes > 0) parts.push(`${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`);
    
    return parts.join(', ');
  }
};

/**
 * Format a value based on its type
 */
export const formatValue = (
  value: any,
  type: 'number' | 'currency' | 'percentage' | 'date' | 'duration' | 'units' = 'number',
  options: FormatOptions = {}
): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  switch (type) {
    case 'number':
      return formatNumber(Number(value), options);
    case 'currency':
      return formatCurrency(Number(value), options);
    case 'percentage':
      return formatPercentage(Number(value), options);
    case 'date':
      return formatDate(value, 'medium');
    case 'duration':
      return formatDuration(Number(value), 'medium');
    case 'units':
      return formatWithUnits(Number(value), options);
    default:
      return String(value);
  }
}; 