/**
 * Rating Component Types
 *
 * Type definitions for the Rating component.
 */

import React from 'react';

/**
 * Props for the Rating component
 */
export interface RatingProps {
  /** The value of the rating */
  value?: number;
  
  /** The default value of the rating (uncontrolled) */
  defaultValue?: number;
  
  /** The maximum value of the rating */
  max?: number;
  
  /** Precision of the rating (0.5 for half stars, 1 for whole stars) */
  precision?: number;
  
  /** If true, the rating is read-only */
  readOnly?: boolean;
  
  /** If true, the rating is disabled */
  disabled?: boolean;
  
  /** Callback fired when the value changes */
  onChange?: (event: React.SyntheticEvent, value: number | null) => void;
  
  /** Callback fired when the component is clicked */
  onClick?: (event: React.SyntheticEvent, value: number) => void;
  
  /** Callback fired when the mouse hovers over a value */
  onHover?: (event: React.SyntheticEvent, value: number) => void;
  
  /** The label of the rating */
  label?: string;
  
  /** The size of the rating */
  size?: 'small' | 'medium' | 'large';
  
  /** The icon to use when empty */
  emptyIcon?: React.ReactNode;
  
  /** The icon to use when filled */
  filledIcon?: React.ReactNode;
  
  /** The icon to use when selected and highlighted */
  highlightedIcon?: React.ReactNode;
  
  /** The name attribute of the radio inputs */
  name?: string;
  
  /** If true, the component will show the label */
  showLabel?: boolean;
  
  /** If true, the component will show the value */
  showValue?: boolean;
  
  /** If true, applies glass morphism effect */
  glass?: boolean;
  
  /** The color of the rating */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;
  
  /** Override or extend the styles applied to the component */
  className?: string;
  
  /** CSS styles */
  style?: React.CSSProperties;
  
  /** Additional props */
  [key: string]: any;
}