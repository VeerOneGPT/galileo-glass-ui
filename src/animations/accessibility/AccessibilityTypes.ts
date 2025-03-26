/**
 * Common type definitions for animation accessibility
 */
import { Keyframes } from 'styled-components';
import { AnimationPreset } from '../styled';
import { AnimationComplexity, MotionSensitivityLevel } from './MotionSensitivity';

// Re-export enums from MotionSensitivity.ts
export { AnimationComplexity, MotionSensitivityLevel } from './MotionSensitivity';

/**
 * Animation mapping interface
 */
export interface AnimationMapping {
  /** Source animation to be replaced */
  source: AnimationPreset | Keyframes | string;
  
  /** Reduced motion alternative */
  alternative: AnimationPreset | Keyframes | string | null;
  
  /** Minimum sensitivity level required for this replacement */
  minimumSensitivity: MotionSensitivityLevel;
  
  /** Animation complexity */
  complexity: AnimationComplexity;
  
  /** Animation category for grouping */
  category?: string;
  
  /** Animation duration in ms */
  duration?: number;
}