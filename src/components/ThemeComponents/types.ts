import { ReactNode, CSSProperties } from 'react';
import { DefaultTheme } from 'styled-components';

import { ColorMode, ThemeVariant } from '../../hooks/useGlassTheme';

/**
 * Props for the GlassThemeSwitcher component
 */
export interface GlassThemeSwitcherProps {
  /** Initial color mode */
  initialColorMode?: ColorMode;
  /** Initial theme variant */
  initialThemeVariant?: ThemeVariant;
  /** Whether to show color mode options */
  showColorModes?: boolean;
  /** Whether to show theme variant options */
  showVariants?: boolean;
  /** Whether to show as compact */
  compact?: boolean;
  /** Glass effect intensity (0-1) */
  glassIntensity?: number;
  /** Callback when color mode changes */
  onColorModeChange?: (mode: ColorMode) => void;
  /** Callback when theme variant changes */
  onThemeVariantChange?: (variant: ThemeVariant) => void;
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Theme object for styling */
  theme?: DefaultTheme;
  /** Label for color mode section */
  colorModeLabel?: string;
  /** Label for theme variant section */
  themeVariantLabel?: string;
  /** Whether to use icons for color modes */
  useIcons?: boolean;
  /** Whether to persist theme selection in local storage */
  persistSelection?: boolean;
  /** Storage key for persisting selections */
  storageKey?: string;
  /** Whether to show as vertical layout */
  vertical?: boolean;
  /** Optional preview element to show current theme */
  preview?: ReactNode;
  /** Whether to show a reset button */
  showReset?: boolean;
  /** Custom color modes to display */
  availableColorModes?: ColorMode[];
  /** Custom theme variants to display */
  availableThemeVariants?: ThemeVariant[];
}

/**
 * Props for the GlassThemeDemo component
 */
export interface GlassThemeDemoProps {
  /** Demo title */
  title?: string;
  /** Demo description */
  description?: ReactNode;
  /** Whether to show the theme switcher */
  showThemeSwitcher?: boolean;
  /** Whether to show component examples */
  showExamples?: boolean;
  /** Custom component examples */
  customExamples?: ReactNode;
  /** Glass effect intensity (0-1) */
  glassIntensity?: number;
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Theme object for styling */
  theme?: DefaultTheme;
  /** Optional header content */
  header?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Show performance metrics */
  showPerformanceMetrics?: boolean;
  /** Whether to organize examples in tabs */
  useTabs?: boolean;
  /** Whether to show the code for examples */
  showCode?: boolean;
  /** Whether to show an interactive mode */
  interactive?: boolean;
  /** List of component categories to include */
  includedCategories?: string[];
  /** Whether to show a minimal version */
  minimal?: boolean;
}

/**
 * Props for the ThemedGlassComponents component
 */
export interface ThemedGlassComponentsProps {
  /** The children to render with the themed glass effect */
  children: ReactNode;
  /** The theme variant to apply */
  variant?: ThemeVariant;
  /** The color mode to apply */
  colorMode?: ColorMode;
  /** Glass effect intensity (0-1) */
  glassIntensity?: number;
  /** Whether to use animation when theme changes */
  animated?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Theme object for styling */
  theme?: DefaultTheme;
  /** Whether to apply glass effect */
  applyGlassEffect?: boolean;
  /** Whether to preserve children's original styling */
  preserveOriginalStyle?: boolean;
  /** Additional context to be passed to children */
  contextData?: Record<string, any>;
  /** Duration of theme transition in ms */
  transitionDuration?: number;
}
