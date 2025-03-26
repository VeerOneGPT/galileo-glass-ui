/**
 * Visual Feedback Component Types
 *
 * Type definitions for visual feedback components.
 */

import React from 'react';

/**
 * VisualFeedback Props
 */
export interface VisualFeedbackProps {
  /** Children to wrap with visual feedback */
  children?: React.ReactNode;

  /** The type of feedback effect */
  effect?: 'ripple' | 'glow' | 'highlight' | 'pulse' | 'none';

  /** If true, the effect is active */
  active?: boolean;

  /** The color of the feedback effect */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** The duration of the effect in milliseconds */
  duration?: number;

  /** If true, applies glass morphism effects */
  glass?: boolean;

  /** The intensity of the effect (0-1) */
  intensity?: number;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** Additional props */
  [key: string]: any;
}

/**
 * RippleButton Props
 */
export interface RippleButtonProps {
  /** Button content */
  children?: React.ReactNode;

  /** If true, the button is disabled */
  disabled?: boolean;

  /** The color of the ripple */
  rippleColor?: string;

  /** The size of ripples */
  rippleSize?: 'small' | 'medium' | 'large';

  /** The speed of the ripple animation */
  rippleSpeed?: 'slow' | 'medium' | 'fast';

  /** If true, centers the ripple */
  centerRipple?: boolean;

  /** If true, applies glass morphism effects */
  glass?: boolean;

  /** Callback fired when clicked */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;

  /** Button variant */
  variant?: 'text' | 'outlined' | 'contained';

  /** Button size */
  size?: 'small' | 'medium' | 'large';

  /** The color of the button */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** If true, the button will take up the full width of its container */
  fullWidth?: boolean;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** HTML type attribute */
  type?: 'button' | 'submit' | 'reset';

  /** Additional props */
  [key: string]: any;
}

/**
 * FocusIndicator Props
 */
export interface FocusIndicatorProps {
  /** Children to wrap with focus indicator */
  children?: React.ReactNode;

  /** If true, the indicator is visible */
  visible?: boolean;

  /** The color of the focus indicator */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** The thickness of the focus indicator */
  thickness?: number;

  /** The style of the focus indicator */
  style?: 'solid' | 'dashed' | 'dotted' | 'outline' | 'glow';

  /** If true, applies glass morphism effects */
  glass?: boolean;

  /** If true, uses a more accessible high-contrast focus style */
  highContrast?: boolean;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  componentStyle?: React.CSSProperties;

  /** Additional props */
  [key: string]: any;
}

/**
 * StateIndicator Props
 */
export interface StateIndicatorProps {
  /** Children to wrap with state indicators */
  children?: React.ReactNode;

  /** Current state to indicate */
  state?: 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'success' | 'error';

  /** If true, applies glass morphism effects */
  glass?: boolean;

  /** If true, the indicator will blend with the background */
  blend?: boolean;

  /** The intensity of the indicator (0-1) */
  intensity?: number;

  /** The color of the state indicator */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** The animation duration in milliseconds */
  animationDuration?: number;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** Additional props */
  [key: string]: any;
}
