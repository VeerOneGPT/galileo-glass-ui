import { ReactNode, CSSProperties } from 'react';
import { DefaultTheme } from 'styled-components';
import { OptimizationLevel } from '../../utils/performanceOptimizations';

/**
 * Props for the PerformanceMonitor component
 */
export interface PerformanceMonitorProps {
  /** Position of the monitor overlay */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** If true, starts minimized */
  startMinimized?: boolean;
  /** If true, shows advanced debug information */
  showAdvanced?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Theme object for styling */
  theme?: DefaultTheme;
  /** If true, automatically adapts display based on detected performance */
  autoAdapt?: boolean;
  /** If true, shows performance budget information */
  showBudget?: boolean;
  /** If true, monitors memory usage (when available) */
  monitorMemory?: boolean;
  /** If true, uses a transparent background */
  transparent?: boolean;
  /** If true, logs performance data to console */
  logToConsole?: boolean;
  /** Custom refresh interval in milliseconds */
  refreshInterval?: number;
  /** Custom element to render in the footer */
  footer?: ReactNode;
  /** If true, shows a history chart */
  showChart?: boolean;
  /** Duration to keep in history (in seconds) */
  historyDuration?: number;
  /** Event to track performance for */
  trackEvent?: string;
  /** Glass effect intensity (0-1) */
  glassIntensity?: number;
}

/**
 * Props for the OptimizedGlassContainer component
 */
export interface OptimizedGlassContainerProps {
  /** The children to render */
  children: ReactNode;
  /** Initial optimization level */
  initialOptimizationLevel?: OptimizationLevel;
  /** If true, automatically adapts optimization based on detected performance */
  autoOptimize?: boolean;
  /** Performance threshold in FPS below which optimization will be increased */
  performanceThreshold?: number;
  /** Glass effect intensity (0-1) */
  glassIntensity?: number;
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
  /** Theme object for styling */
  theme?: DefaultTheme;
  /** Target frame rate to maintain */
  targetFps?: number;
  /** Duration between performance checks in milliseconds */
  checkInterval?: number;
  /** If true, shows a performance indicator */
  showIndicator?: boolean;
  /** If true, prefers reduced motion when optimizing */
  preferReducedMotion?: boolean;
  /** If true, preserves blur effects even at higher optimization levels */
  preserveBlur?: boolean;
  /** Function called when optimization level changes */
  onOptimizationChange?: (level: OptimizationLevel) => void;
  /** Maximum allowed optimization level */
  maxOptimizationLevel?: OptimizationLevel;
}