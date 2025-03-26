/**
 * ToggleButton Component Types
 *
 * Type definitions for the ToggleButton components.
 */

import React from 'react';

/**
 * Props for the ToggleButton component
 */
export interface ToggleButtonProps {
  /** The value of the button */
  value: any;

  /** If true, the button will be in selected state */
  selected?: boolean;

  /** If true, the button will be disabled */
  disabled?: boolean;

  /** Callback fired when the button is clicked */
  onChange?: (event: React.MouseEvent<HTMLButtonElement>, value: any) => void;

  /** The content of the button */
  children?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** If true, applies glass morphism effect */
  glass?: boolean;

  /** The color of the button */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** The size of the button */
  size?: 'small' | 'medium' | 'large';

  /** If true, the button will be fullWidth */
  fullWidth?: boolean;

  /** The variant to use */
  variant?: 'text' | 'outlined' | 'contained';

  /** Additional props */
  [key: string]: any;
}

/**
 * Props for the ToggleButtonGroup component
 */
export interface ToggleButtonGroupProps {
  /** The content of the component (ToggleButton components) */
  children?: React.ReactNode;

  /** The currently selected value(s) */
  value?: any | any[];

  /** The default value(s) (uncontrolled) */
  defaultValue?: any | any[];

  /** Callback fired when a button is clicked */
  onChange?: (event: React.MouseEvent<HTMLButtonElement>, value: any | any[]) => void;

  /** If true, multiple buttons can be selected */
  exclusive?: boolean;

  /** The orientation of the button group */
  orientation?: 'horizontal' | 'vertical';

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** If true, applies glass morphism effect */
  glass?: boolean;

  /** The color of the buttons */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** The size of the buttons */
  size?: 'small' | 'medium' | 'large';

  /** If true, the buttons will be fullWidth */
  fullWidth?: boolean;

  /** The variant to use */
  variant?: 'text' | 'outlined' | 'contained';

  /** Additional props */
  [key: string]: any;
}
