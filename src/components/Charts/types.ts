/**
 * Chart Component Types
 *
 * Type definitions for Glass UI chart components
 */

/**
 * Chart rendering status enumeration
 */
export enum ChartRenderStatus {
  /**
   * Chart is ready to render
   */
  READY = 'ready',

  /**
   * Chart is loading data
   */
  LOADING = 'loading',

  /**
   * Chart data is empty
   */
  EMPTY = 'empty',

  /**
   * Chart encountered an error
   */
  ERROR = 'error',

  /**
   * Chart is rendering
   */
  RENDERING = 'rendering',

  /**
   * Chart has been rendered successfully
   */
  RENDERED = 'rendered',
}

/**
 * Base chart data types
 */

/**
 * Basic data point with a single value
 */
export interface DataPoint {
  /**
   * The value of the data point
   */
  value: number;

  /**
   * Optional label for the data point
   */
  label?: string;

  /**
   * Optional color for the data point
   */
  color?: string;

  /**
   * Optional ID for the data point
   */
  id?: string | number;
}

/**
 * Series data point with additional properties
 */
export interface SeriesDataPoint extends DataPoint {
  /**
   * Optional x-value for the data point
   */
  x?: number | string;

  /**
   * Optional y-value for the data point (can be different from value)
   */
  y?: number;

  /**
   * Optional fill color (distinct from line/stroke color)
   */
  fillColor?: string;

  /**
   * Optional stroke color
   */
  strokeColor?: string;

  /**
   * Optional metadata for the data point
   */
  metadata?: Record<string, any>;
}

/**
 * Data series for multi-series charts
 */
export interface ChartSeries {
  /**
   * Unique ID for the series
   */
  id: string;

  /**
   * Name or label for the series
   */
  name: string;

  /**
   * The data points in the series
   */
  data: SeriesDataPoint[];

  /**
   * Color for the series
   */
  color?: string;

  /**
   * Whether the series is visible
   */
  visible?: boolean;

  /**
   * The type of series (line, area, bar, etc.)
   */
  type?: 'line' | 'area' | 'bar' | 'scatter';

  /**
   * Optional metadata for the series
   */
  metadata?: Record<string, any>;
}

/**
 * Axis configuration
 */
export interface AxisConfig {
  /**
   * Whether to show the axis
   */
  show?: boolean;

  /**
   * The title for the axis
   */
  title?: string;

  /**
   * Whether to show grid lines
   */
  grid?: boolean;

  /**
   * Tick format function
   */
  tickFormat?: (value: any) => string;

  /**
   * Min value for the axis
   */
  min?: number;

  /**
   * Max value for the axis
   */
  max?: number;

  /**
   * Whether to include zero in the axis range
   */
  includeZero?: boolean;

  /**
   * Number of ticks to show
   */
  tickCount?: number;

  /**
   * Custom tick values
   */
  tickValues?: any[];
}

/**
 * Legend configuration
 */
export interface LegendConfig {
  /**
   * Whether to show the legend
   */
  show?: boolean;

  /**
   * Position of the legend
   */
  position?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Whether the legend is interactive (can toggle series)
   */
  interactive?: boolean;

  /**
   * Alignment of the legend
   */
  align?: 'start' | 'center' | 'end';

  /**
   * Custom legend items
   */
  items?: Array<{
    id: string;
    label: string;
    color: string;
  }>;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  /**
   * Whether to show tooltips
   */
  show?: boolean;

  /**
   * Tooltip mode
   */
  mode?: 'single' | 'multi';

  /**
   * Tooltip trigger
   */
  trigger?: 'hover' | 'click';

  /**
   * Custom tooltip formatter
   */
  formatter?: (
    params: {
      value: number;
      label?: string;
      seriesName?: string;
      color?: string;
      dataIndex?: number;
      seriesIndex?: number;
      [key: string]: any;
    }[]
  ) => string | React.ReactNode;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /**
   * Whether animations are enabled
   */
  enabled?: boolean;

  /**
   * Animation duration in milliseconds
   */
  duration?: number;

  /**
   * Animation easing function
   */
  easing?: string;

  /**
   * Animation delay in milliseconds
   */
  delay?: number;

  /**
   * Whether each series should be animated sequentially
   */
  staggered?: boolean;

  /**
   * Whether to use reduced motion for accessibility
   */
  reducedMotion?: boolean;
}

/**
 * Base chart props shared by all chart components
 */
export interface BaseChartProps {
  /**
   * Width of the chart
   */
  width?: number | string;

  /**
   * Height of the chart
   */
  height?: number | string;

  /**
   * Whether the chart is loading
   */
  loading?: boolean;

  /**
   * Whether the chart data is empty
   */
  isEmpty?: boolean;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;

  /**
   * Whether to apply glass styling
   */
  glass?: boolean;

  /**
   * Glass blur intensity
   */
  blurIntensity?: 'light' | 'medium' | 'strong';

  /**
   * Title for the chart
   */
  title?: string;

  /**
   * Description for the chart
   */
  description?: string;

  /**
   * X-axis configuration
   */
  xAxis?: AxisConfig;

  /**
   * Y-axis configuration
   */
  yAxis?: AxisConfig;

  /**
   * Legend configuration
   */
  legend?: LegendConfig;

  /**
   * Tooltip configuration
   */
  tooltip?: TooltipConfig;

  /**
   * Animation configuration
   */
  animation?: AnimationConfig;

  /**
   * Color palette for the chart
   */
  colors?: string[];

  /**
   * Margin around the chart
   */
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  /**
   * Whether to adapt to device capabilities
   */
  adaptToCapabilities?: boolean;

  /**
   * Whether to use simplified rendering for low-end devices
   */
  simplified?: boolean;

  /**
   * Whether to disable animations
   */
  animationDisabled?: boolean;

  /**
   * Alt text for accessibility
   */
  altText?: string;

  /**
   * ARIA label for the chart
   */
  ariaLabel?: string;

  /**
   * Click handler for the chart
   */
  onClick?: (event: React.MouseEvent, data?: any) => void;

  /**
   * Mouse enter handler
   */
  onMouseEnter?: (event: React.MouseEvent, data?: any) => void;

  /**
   * Mouse leave handler
   */
  onMouseLeave?: (event: React.MouseEvent, data?: any) => void;

  /**
   * Error handler
   */
  onError?: (error: Error) => void;
}

/**
 * Bar chart props
 */
export interface BarChartProps extends BaseChartProps {
  /**
   * Data for the bar chart
   */
  data: DataPoint[] | ChartSeries[];

  /**
   * Whether to display bars horizontally
   */
  horizontal?: boolean;

  /**
   * Whether to stack bars in a multi-series chart
   */
  stacked?: boolean;

  /**
   * Whether to display bars as a grouped bar chart
   */
  grouped?: boolean;

  /**
   * Corner radius for bars
   */
  cornerRadius?: number;

  /**
   * Bar padding
   */
  barPadding?: number;

  /**
   * Whether to show values on bars
   */
  showValues?: boolean;

  /**
   * Custom value formatter
   */
  valueFormatter?: (value: number) => string;
}

/**
 * Line chart props
 */
export interface LineChartProps extends BaseChartProps {
  /**
   * Data for the line chart
   */
  data: SeriesDataPoint[] | ChartSeries[];

  /**
   * Curve type for the line
   */
  curve?: 'linear' | 'smooth' | 'stepBefore' | 'stepAfter';

  /**
   * Line width
   */
  lineWidth?: number;

  /**
   * Whether to show points on the line
   */
  showPoints?: boolean;

  /**
   * Point size
   */
  pointSize?: number;

  /**
   * Whether to connect null values
   */
  connectNulls?: boolean;

  /**
   * Whether to apply gradient to the line
   */
  gradient?: boolean;
}

/**
 * Area chart props
 */
export interface AreaChartProps extends LineChartProps {
  /**
   * Whether to stack areas in a multi-series chart
   */
  stacked?: boolean;

  /**
   * Fill opacity for the area
   */
  fillOpacity?: number;

  /**
   * Whether to apply glow effect to the area
   */
  glowEffect?: boolean;

  /**
   * Glow intensity
   */
  glowIntensity?: 'light' | 'medium' | 'strong';
}

/**
 * Pie/Donut chart props
 */
export interface PieChartProps extends BaseChartProps {
  /**
   * Data for the pie chart
   */
  data: DataPoint[];

  /**
   * Inner radius for donut charts (0 for pie charts)
   */
  innerRadius?: number;

  /**
   * Outer radius for the chart
   */
  outerRadius?: number;

  /**
   * Starting angle in degrees
   */
  startAngle?: number;

  /**
   * Ending angle in degrees
   */
  endAngle?: number;

  /**
   * Padding between slices
   */
  padAngle?: number;

  /**
   * Whether to show labels
   */
  showLabels?: boolean;

  /**
   * Label type
   */
  labelType?: 'value' | 'percent' | 'label';

  /**
   * Whether to show values in labels
   */
  showValues?: boolean;

  /**
   * Custom label formatter
   */
  labelFormatter?: (value: number, percent: number, label?: string) => string;

  /**
   * Whether the chart is a donut chart
   */
  donut?: boolean;
}

/**
 * Scatter chart props
 */
export interface ScatterChartProps extends BaseChartProps {
  /**
   * Data for the scatter chart
   */
  data: SeriesDataPoint[] | ChartSeries[];

  /**
   * Point size
   */
  pointSize?: number | ((data: SeriesDataPoint) => number);

  /**
   * Symbol shape for points
   */
  symbol?: 'circle' | 'square' | 'triangle' | 'diamond';

  /**
   * Whether to show a regression line
   */
  showRegressionLine?: boolean;

  /**
   * Stroke width for the regression line
   */
  regressionLineWidth?: number;

  /**
   * Color for the regression line
   */
  regressionLineColor?: string;

  /**
   * Whether to enable zoom
   */
  zoom?: boolean;
}

/**
 * Chart style types for glass effects
 */
export interface ChartGlassStyles {
  /**
   * Background style for the chart area
   */
  chartBackground?: React.CSSProperties;

  /**
   * Styles for the grid lines
   */
  gridLines?: React.CSSProperties;

  /**
   * Styles for the axis
   */
  axis?: React.CSSProperties;

  /**
   * Styles for the legend
   */
  legend?: React.CSSProperties;

  /**
   * Styles for tooltips
   */
  tooltip?: React.CSSProperties;

  /**
   * Styles for chart data elements (bars, lines, etc.)
   */
  dataElements?: React.CSSProperties;
}
