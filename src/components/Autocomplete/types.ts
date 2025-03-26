/**
 * Autocomplete Component Types
 *
 * Type definitions for the Autocomplete component.
 */

import React from 'react';

/**
 * Structure for each autocomplete option item
 */
export interface AutocompleteOption {
  value: string | number;
  label: string;
  [key: string]: any;
}

/**
 * Props for the Autocomplete component
 */
export interface AutocompleteProps<T extends AutocompleteOption = AutocompleteOption> {
  /** Array of options for the autocomplete */
  options: T[];

  /** Callback fired when the value changes */
  onChange?: (value: T | T[] | null) => void;

  /** Current value of the autocomplete */
  value?: T | T[] | null;

  /** Default value (for uncontrolled component) */
  defaultValue?: T | T[] | null;

  /** Multiple selection mode */
  multiple?: boolean;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Label displayed above the input */
  label?: string;

  /** Helper text displayed below the input */
  helperText?: string;

  /** Error state of the input */
  error?: boolean | string;

  /** Whether the input is required */
  required?: boolean;

  /** Placeholder text for the input */
  placeholder?: string;

  /** Whether to display the clear button */
  clearable?: boolean;

  /** Custom renderer for option items */
  renderOption?: (
    option: T,
    state: { selected: boolean; highlighted?: boolean; inputValue?: string }
  ) => React.ReactNode;

  /** Function to get the display value of an option */
  getOptionLabel?: (option: T) => string;

  /** Function to determine if two options are equal */
  isOptionEqualToValue?: (option: T, value: T) => boolean;

  /** Whether loading state should be shown */
  loading?: boolean;

  /** Size of the input */
  size?: 'small' | 'medium' | 'large';

  /** Function to filter options based on input */
  filterOptions?: (options: T[], inputValue: string) => T[];

  /** Automatically highlight the first option */
  autoHighlight?: boolean;

  /** Enable animations */
  animate?: boolean;

  /** Autocomplete mode ('on', 'off', or a custom string) */
  autoComplete?: boolean | string;

  /** Disable portal for dropdown */
  disablePortal?: boolean;

  /** Custom popper container */
  popperContainer?: HTMLElement | null;

  /** Whether the component should take the full width of its container */
  fullWidth?: boolean;

  /** CSS styles applied to the component */
  style?: React.CSSProperties;

  /** class name for the component */
  className?: string;

  /** Whether the input should auto-focus */
  autoFocus?: boolean;

  /** Free solo mode allows arbitrary values */
  freeSolo?: boolean;

  /** Additional props to pass to the input */
  [key: string]: any;
}
