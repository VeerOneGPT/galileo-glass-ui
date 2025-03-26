/**
 * Styled Components type declarations
 */
import 'styled-components';
import { KeyframeDefinition, AnimationIntensity } from './types';

declare module 'styled-components' {
  export interface Keyframes {
    id: string;
    name: string;
    rules: string;
    toString: () => string;
  }

  export interface FlattenSimpleInterpolation {
    __cssString?: string;
    [key: string]: any;
  }

  export interface DefaultTheme {
    [key: string]: any;
  }
}

// Define proper animation preset type to solve type compatibility issues
export interface AnimationPreset {
  /** The animation keyframes or direct reference to a keyframe animation */
  keyframes?: Keyframes;
  animation?: Keyframes;

  /** Default animation duration */
  duration: string | number;

  /** Default animation easing */
  easing: string;

  /** Default animation delay */
  delay?: string | number;

  /** Default animation fill mode */
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';

  /** Reduced motion alternative */
  reducedMotionAlternative?: AnimationPreset | null;

  /** Animation intensity level */
  intensity?: AnimationIntensity;

  /** Iterations count */
  iterations?: number | string;

  /** Animation direction */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

  /** Animation play state */
  playState?: 'running' | 'paused';
}

// Re-export animation types for easier access
export type { KeyframeDefinition };
