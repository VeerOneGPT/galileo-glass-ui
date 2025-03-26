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
    [key: string]: any;
  }
}

// Don't re-export types that were imported to avoid circular reference
