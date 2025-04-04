import React from 'react';

/**
 * Represents a single step in the stepper.
 */
export interface Step {
  /** Unique identifier for the step. */
  id: string | number;
  /** Text label for the step. */
  label?: string;
  /** Optional icon element or name for the step. */
  icon?: React.ReactNode | string; 
  /** Optional flag indicating if the step is disabled. */
  disabled?: boolean;
  // Add other step-specific properties as needed
}

/**
 * Props for the GlassStepper component.
 */
export interface GlassStepperProps {
  /** Array of step objects to display. */
  steps: Step[];
  /** Index of the currently active step (zero-based). */
  activeStep?: number;
  /** Orientation of the stepper. */
  orientation?: 'horizontal' | 'vertical';
  /** Optional CSS class name. */
  className?: string;
  /** Optional inline styles. */
  style?: React.CSSProperties;
  /** Optional callback function triggered when a step is clicked. Passes the step index. */
  onStepClick?: (index: number) => void;
}

/**
 * Internal props used by the GlassStep component (within GlassStepper).
 * Combining explicit props with the Step data structure.
 */
export interface GlassStepInternalProps {
    step: Step;
    index: number;
    active: boolean;
    completed: boolean;
    orientation: 'horizontal' | 'vertical';
    isLast?: boolean;
    onClick?: () => void;
} 