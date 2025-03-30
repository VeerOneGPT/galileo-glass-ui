/**
 * Styled Components type declarations
 */
import 'styled-components';
import { KeyframeDefinition, AnimationIntensity } from './core/types';

declare module 'styled-components' {
  export interface Keyframes {
    id: string;
    name: string;
    rules: string;
    toString: () => string;
  }

  export interface DefaultTheme {
    colors?: {
      primary?: {
        main?: string;
        // Add other potential shades if known
      };
      // Add other potential color categories if known (e.g., secondary, background)
    };
    // Add other known theme properties (e.g., typography, spacing)
  }
}

// Don't re-export types that were imported to avoid circular reference
