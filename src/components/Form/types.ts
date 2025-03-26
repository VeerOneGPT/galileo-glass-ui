/**
 * Form Components Types
 *
 * Type definitions for Form components.
 */

import React from 'react';

/**
 * FormGroupProps interface
 */
export interface FormGroupProps {
  /** The content of the component */
  children?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** If true, the form group items will be arranged horizontally */
  row?: boolean;

  /** If true, will apply glass styling */
  glass?: boolean;

  /** If true, will add glass morphism effects */
  glassEffect?: boolean;

  /** Spacing between items */
  spacing?: number | string;

  /** Alignment of items */
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';

  /** Additional props */
  [key: string]: any;
}

/**
 * FormControlProps interface
 */
export interface FormControlProps {
  /** The content of the component */
  children?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** If true, the label, input and helper text should be displayed in a disabled state */
  disabled?: boolean;

  /** If true, the component is displayed in an error state */
  error?: boolean;

  /** If true, the component will be displayed in focused state */
  focused?: boolean;

  /** If true, the label is displayed in an focused state */
  required?: boolean;

  /** If true, the label will shrink */
  shrink?: boolean;

  /** If true, the form control will take up the full width of its container */
  fullWidth?: boolean;

  /** If true, will apply glass styling */
  glass?: boolean;

  /** The size of the component */
  size?: 'small' | 'medium' | 'large';

  /** The margin applied to the component */
  margin?: 'none' | 'dense' | 'normal';

  /** Padding density */
  padding?: 'none' | 'dense' | 'normal';

  /** Additional props */
  [key: string]: any;
}

/**
 * FormLabelProps interface
 */
export interface FormLabelProps {
  /** The content of the component */
  children?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** If true, the label should be displayed in a disabled state */
  disabled?: boolean;

  /** If true, the label is displayed in an error state */
  error?: boolean;

  /** If true, the label is displayed in a focused state */
  focused?: boolean;

  /** If true, the label will indicate that the input is required */
  required?: boolean;

  /** If true, will apply glass styling */
  glass?: boolean;

  /** Controls the color of the component */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** The component used for the root node */
  component?: React.ElementType;

  /** Additional props */
  [key: string]: any;
}

/**
 * FormHelperTextProps interface
 */
export interface FormHelperTextProps {
  /** The content of the component */
  children?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** If true, the helper text should be displayed in a disabled state */
  disabled?: boolean;

  /** If true, the helper text is displayed in an error state */
  error?: boolean;

  /** If true, the helper text is displayed in a focused state */
  focused?: boolean;

  /** If true, will apply glass styling */
  glass?: boolean;

  /** The color of the component */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** Whether the helper text should take up the full width of its container */
  fullWidth?: boolean;

  /** Applies the theme typography styles */
  variant?: 'caption' | 'small' | 'medium';

  /** Margin around the helper text */
  margin?: 'none' | 'dense' | 'normal';

  /** Additional props */
  [key: string]: any;
}
