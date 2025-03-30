/**
 * Chart type definitions for GlassDataChart
 */

/**
 * Chart types supported by GlassDataChart
 * Note: 'area' is not a native Chart.js type, we'll map it to 'line' with fill
 */
export type ChartVariant = 'line' | 'bar' | 'area' | 'bubble' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'kpi';

/**
 * Dataset style options
 */
export interface DatasetStyle {
  /** Fill color or gradient */
  fillColor?: string | string[] | CanvasGradient;
  /** Line/border color */
  lineColor?: string;
  /** Point color */
  pointColor?: string;
  /** Shadow color */
  shadowColor?: string;
  /** Fill opacity (0-1) */
  fillOpacity?: number;
  /** Line width */
  lineWidth?: number;
  /** Point size */
  pointSize?: number;
  /** Point style */
  pointStyle?: 'circle' | 'cross' | 'crossRot' | 'dash' | 'line' | 'rect' | 'rectRounded' | 'rectRot' | 'star' | 'triangle';
  /** Line style */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** Add glass effect to dataset */
  glassEffect?: boolean;
  /** Add glow effect to dataset */
  glowEffect?: boolean;
  /** Glow intensity */
  glowIntensity?: 'subtle' | 'medium' | 'strong';
}

/**
 * Data point for charts
 */
export interface DataPoint {
  /** X value (usually a label for category scales) */
  x: string | number;
  /** Y value */
  y: number | null;
  /** Custom color for this specific data point */
  color?: string;
  /** Custom label for this data point */
  label?: string;
  /** Extra data for tooltips or display */
  extra?: Record<string, any>;
  /** Format type for this data point ('number', 'currency', 'percentage', 'units') */
  formatType?: 'number' | 'currency' | 'percentage' | 'units';
  /** Format options for this data point */
  formatOptions?: {
    decimals?: number;
    currencySymbol?: string;
    locale?: string;
    compact?: boolean;
    showPlus?: boolean;
    suffix?: string;
    prefix?: string;
  };
  /** Formatted value (available in event handlers) */
  formattedValue?: string;
}

/**
 * Chart dataset
 */
export interface ChartDataset {
  /** Dataset identifier */
  id: string;
  /** Dataset label */
  label: string;
  /** Dataset data points */
  data: DataPoint[];
  /** Dataset styling */
  style?: DatasetStyle;
  /** Whether this dataset uses the right y-axis */
  useRightYAxis?: boolean;
  /** Dataset order (lower numbers draw first) */
  order?: number;
  /** If true, this dataset is hidden by default */
  hidden?: boolean;
  /** Default format type for all data points in this dataset */
  formatType?: 'number' | 'currency' | 'percentage' | 'units';
  /** Default format options for all data points in this dataset */
  formatOptions?: {
    decimals?: number;
    currencySymbol?: string;
    locale?: string;
    compact?: boolean;
    showPlus?: boolean;
    suffix?: string;
    prefix?: string;
  };
}

/**
 * KPI specific props (new)
 */
export interface KpiProps {
  /** KPI title */
  title: string;
  /** KPI value */
  value: string | number;
  /** Trend indicator */
  trend?: 'positive' | 'negative' | 'neutral';
  /** Subtitle or description */
  subtitle?: string;
  /** Use compact layout */
  compact?: boolean;
  /** Glow intensity for KPI */
  glowIntensity?: 'low' | 'medium' | 'strong';
} 