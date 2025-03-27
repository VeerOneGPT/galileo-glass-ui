/**
 * Charts Module
 *
 * Export all chart components and utilities
 */

// Export chart components
export { BarChart } from './BarChart';
export { LineChart } from './LineChart';
export { AreaChart } from './AreaChart';
export { PieChart } from './PieChart';
export { SafeChartRenderer } from './SafeChartRenderer';

// Export enhanced Glass UI chart components
export { default as GlassChart } from './GlassChart';
export { default as SimpleChart } from './SimpleChart';
export { GlassTooltipContent } from './GlassTooltip';
export { GlassTooltip } from './GlassTooltip';
export { default as EnhancedGlassTabs } from './EnhancedGlassTabs';

// Export chart types
export type {
  // Chart component props
  BarChartProps,
  LineChartProps,
  AreaChartProps,
  PieChartProps,
  ScatterChartProps,

  // Common chart types
  BaseChartProps,
  DataPoint,
  SeriesDataPoint,
  ChartSeries,

  // Chart configuration types
  AxisConfig,
  LegendConfig,
  TooltipConfig,
  AnimationConfig,
  ChartGlassStyles,

  // Renderer types
  ChartRenderStatus,
} from './types';

// Export enhanced component props
export type { GlassChartProps } from './GlassChart';
export type { SimpleChartProps } from './SimpleChart';
export type { GlassTooltipProps } from './GlassTooltip';
export type { EnhancedGlassTabsProps, TabItem } from './EnhancedGlassTabs';
