/**
 * Global declarations for styled-components
 */
import 'styled-components';
import { ColorMode } from '../theme/constants';

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
  
  // Helper types for complex nested theme structures
  interface NestedStringRecord {
    [key: string]: string | NestedStringRecord;
  }
  
  interface ThemeColors {
    nebula: {
      accentPrimary: string;
      accentSecondary: string;
      accentTertiary: string;
      stateCritical: string;
      stateOptimal: string;
      stateAttention: string;
      stateInformational: string;
      neutralBackground: string;
      neutralForeground: string;
      neutralBorder: string;
      neutralSurface: string;
    };
    glass: {
      light: {
        background: string;
        border: string;
        highlight: string;
        shadow: string;
        glow: string;
      };
      dark: {
        background: string;
        border: string;
        highlight: string;
        shadow: string;
        glow: string;
      };
      tints: {
        [key: string]: string;
      };
    };
    [key: string]: Record<string, string> | NestedStringRecord;
  }
  
  interface ZIndexes {
    hide: number;
    auto: string | number;
    base: number;
    docked: number;
    dropdown: number;
    sticky: number;
    banner: number;
    overlay: number;
    modal: number;
    popover: number;
    skipLink: number;
    toast: number;
    tooltip: number;
    glacial: number;
    [key: string]: string | number;
  }
  
  export interface DefaultTheme {
    isDarkMode: boolean;
    colorMode: ColorMode;
    themeVariant: string;
    colors: ThemeColors;
    spacing?: Record<string, string | number>;
    typography?: Record<string, any>;
    breakpoints?: Record<string, any>;
    zIndex: ZIndexes;
    [key: string]: any;
  }
}