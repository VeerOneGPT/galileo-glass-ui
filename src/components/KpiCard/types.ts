/**
 * KPI Card Component Types
 *
 * Type definitions for the KPI Card components.
 */

import React from 'react';

/**
 * Base KPI Card Props
 */
export interface KpiCardBaseProps {
  /** The title of the KPI card */
  title: string;

  /** The main value to display */
  value: number | string;

  /** Optional subtitle or description */
  subtitle?: string;

  /** The icon to display */
  icon?: React.ReactNode;

  /** Override or extend the styles applied to the component */
  className?: string;

  /** CSS styles */
  style?: React.CSSProperties;

  /** If true, applies glass morphism effect */
  glass?: boolean;

  /** The color theme of the card */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | string;

  /** The size of the card */
  size?: 'small' | 'medium' | 'large';

  /** If true, the component will take the full width of its container */
  fullWidth?: boolean;

  /** The elevation of the card */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;

  /** The corner radius of the card */
  borderRadius?: number | string;

  /** If true, applies a hover effect */
  hover?: boolean;

  /** Callback fired when the card is clicked */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;

  /** The alignment of the content */
  align?: 'left' | 'center' | 'right';

  /** Additional content at the bottom of the card */
  footer?: React.ReactNode;

  /** Children to render at the bottom of the card */
  children?: React.ReactNode;

  /** Additional props */
  [key: string]: any;
}

/**
 * Basic KPI Card Props
 */
export interface KpiCardProps extends KpiCardBaseProps {
  /** Format string for the value (e.g., "+0.0%") */
  valueFormat?: string;

  /** The unit to display after the value */
  unit?: string;

  /** The change value (percentage, etc.) */
  change?: number;

  /** Format string for the change (e.g., "+0.0%") */
  changeFormat?: string;

  /** If true, positive changes are good (green) */
  positiveIsGood?: boolean;

  /** Time period for the data (e.g., "Last 30 days") */
  period?: string;

  /** The prefix to display before the value */
  prefix?: string;
}

/**
 * Performance Metric Card Props
 */
export interface PerformanceMetricCardProps extends KpiCardBaseProps {
  /** Current value */
  value: number;

  /** Target value */
  target: number;

  /** Minimum expected value */
  min?: number;

  /** Maximum expected value */
  max?: number;

  /** If true, higher values are better */
  higherIsBetter?: boolean;

  /** Format string for the value */
  valueFormat?: string;

  /** The unit to display */
  unit?: string;

  /** If true, displays a progress indicator */
  showProgress?: boolean;

  /** Type of progress indicator */
  progressType?: 'linear' | 'circular' | 'gauge';

  /** Status indicator */
  status?: 'success' | 'warning' | 'error' | 'info' | 'neutral';

  /** Time period for the data (e.g., "Last 30 days") */
  period?: string;

  /** If true, applies a pulse animation to draw attention */
  highlight?: boolean;
}

/**
 * Interactive KPI Card Props
 */
export interface InteractiveKpiCardProps extends KpiCardBaseProps {
  /** Data for the mini chart */
  chartData?: Array<number | { x: number | string; y: number }>;

  /** Type of mini chart */
  chartType?: 'line' | 'bar' | 'area' | 'sparkline';

  /** The duration of animations in ms */
  animationDuration?: number;

  /** If true, enables zooming on the chart */
  zoomable?: boolean;

  /** If true, shows tooltip on hover */
  showTooltip?: boolean;

  /** Format string for the value */
  valueFormat?: string;

  /** The unit to display */
  unit?: string;

  /** The change value (percentage, etc.) */
  change?: number;

  /** Format string for the change */
  changeFormat?: string;

  /** If true, positive changes are good (green) */
  positiveIsGood?: boolean;

  /** Time period for the data (e.g., "Last 30 days") */
  period?: string;

  /** If true, adds interactive effects on hover */
  interactive?: boolean;

  /** If true, shows chart animation on hover */
  animateOnHover?: boolean;
}
