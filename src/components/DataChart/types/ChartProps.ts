/**
 * Props interfaces for GlassDataChart
 */
import React from 'react';
import { ChartVariant, DatasetStyle, DataPoint, ChartDataset, KpiProps } from './ChartTypes';
export type { ChartVariant };

/**
 * Animation options for chart
 */
export interface ChartAnimationOptions {
  /** Enable physics-based animations */
  physicsEnabled?: boolean;
  /** Animation duration (ms) */
  duration?: number;
  /** Spring tension */
  tension?: number;
  /** Spring friction */
  friction?: number;
  /** Spring mass */
  mass?: number;
  /** Animation easing function */
  easing?: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart' | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint' | 'easeInSine' | 'easeOutSine' | 'easeInOutSine' | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo' | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc' | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic' | 'easeInBack' | 'easeOutBack' | 'easeInOutBack' | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce';
  /** Staggered delay between datasets (ms) */
  staggerDelay?: number;
  /** Physics animation preset */
  preset?: 'gentle' | 'responsive' | 'bouncy';
}

/**
 * Interaction options for chart
 */
export interface ChartInteractionOptions {
  /** Enable zoom/pan capabilities */
  zoomPanEnabled?: boolean;
  /** Zoom mode */
  zoomMode?: 'x' | 'y' | 'xy';
  /** Enable physics-based hover effects */
  physicsHoverEffects?: boolean;
  /** Hover animation speed */
  hoverSpeed?: number;
  /** Show tooltips on hover */
  showTooltips?: boolean;
  /** Tooltip style */
  tooltipStyle?: 'glass' | 'frosted' | 'tinted' | 'luminous' | 'dynamic';
  /** Follow cursor option for tooltips */
  tooltipFollowCursor?: boolean;
  /** Physics configuration for zoom/pan and hover effects */
  physics?: Partial<{
    tension: number;
    friction: number;
    mass: number;
    minZoom: number;
    maxZoom: number;
    wheelSensitivity: number;
    inertiaDuration: number;
  }>;
}

/**
 * Legend options
 */
export interface ChartLegendOptions {
  /** Show legend */
  show?: boolean;
  /** Legend position */
  position?: 'top' | 'right' | 'bottom' | 'left';
  /** Legend alignment */
  align?: 'start' | 'center' | 'end';
  /** Legend style */
  style?: 'default' | 'glass' | 'pills';
  /** Use glass styling for legend */
  glassEffect?: boolean;
  kpi?: {
    value: number | string;
    title?: string;
    subtitle?: string;
    trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
    formatType?: 'number' | 'currency' | 'percentage' | 'units';
    formatOptions?: any;
  };
  useAdaptiveQuality?: boolean;
  /** Optional function to configure physics interactions per data element */
  getElementPhysicsOptions?: GetElementPhysicsOptions;
}

/**
 * Axis options
 */
export interface ChartAxisOptions {
  /** Show x-axis grid */
  showXGrid?: boolean;
  /** Show y-axis grid */
  showYGrid?: boolean;
  /** Show x-axis labels */
  showXLabels?: boolean;
  /** Show y-axis labels */
  showYLabels?: boolean;
  /** X-axis title */
  xTitle?: string;
  /** Y-axis title */
  yTitle?: string;
  /** X-axis ticks count */
  xTicksCount?: number;
  /** Y-axis ticks count */
  yTicksCount?: number;
  /** Axis line color */
  axisColor?: string;
  /** Grid line color */
  gridColor?: string;
  /** Grid line style */
  gridStyle?: 'solid' | 'dashed' | 'dotted';
}

// Define the expected return structure locally to avoid import issues
interface ElementPhysicsConfig {
  hoverEffect?: {
    scale?: number;
    opacity?: number;
    x?: number;
    y?: number;
  };
  clickEffect?: {
    scale?: number;
    opacity?: number;
    x?: number;
    y?: number;
  };
  // Basic physics params for the element's animation
  tension?: number;
  friction?: number;
  mass?: number;
}

/**
 * Function type for configuring physics interactions per data element.
 */
export type GetElementPhysicsOptions = (
  dataPoint: any, 
  datasetIndex: number,
  dataIndex: number,
  chartType: ChartVariant
) => ElementPhysicsConfig | null | undefined;

/**
 * GlassDataChart Component Props
 */
export interface GlassDataChartProps {
  /** Chart heading title */
  title?: string;
  /** Chart subtitle or description */
  subtitle?: string;
  /** Chart variant type */
  variant?: ChartVariant;
  /** Chart datasets */
  datasets: ChartDataset[];
  /** Chart width (px or %) */
  width?: string | number;
  /** Chart height (px or %) */
  height?: string | number;
  /** Chart glass appearance */
  glassVariant?: 'clear' | 'frosted' | 'tinted' | 'luminous';
  /** Blur strength for glass effect */
  blurStrength?: 'light' | 'standard' | 'strong';
  /** Base color theme */
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'default';
  /** Chart animation options */
  animation?: ChartAnimationOptions;
  /** Chart interaction options */
  interaction?: ChartInteractionOptions;
  /** Chart legend options */
  legend?: ChartLegendOptions;
  /** Chart axis options */
  axis?: ChartAxisOptions;
  /** Initial selection (index or array of indices) */
  initialSelection?: number | number[];
  /** Whether to show the chart toolbar */
  showToolbar?: boolean;
  /** Allow users to download chart as image */
  allowDownload?: boolean;
  /** Palette colors for datasets (will be used if dataset colors aren't specified) */
  palette?: string[];
  /** Allow switching between chart types */
  allowTypeSwitch?: boolean;
  /** Background color/gradient */
  backgroundColor?: string | CanvasGradient;
  /** Border radius for chart container */
  borderRadius?: string | number;
  /** Border color for chart container */
  borderColor?: string;
  /** Card elevation (1-5) */
  elevation?: 1 | 2 | 3 | 4 | 5;
  /** Additional class name */
  className?: string;
  /** Additional style */
  style?: React.CSSProperties;
  /** Callback when a data point is clicked */
  onDataPointClick?: (datasetIndex: number, dataIndex: number, data: DataPoint) => void;
  /** Callback when data selection changes */
  onSelectionChange?: (selectedIndices: number[]) => void;
  /** Callback when chart is zoomed or panned */
  onZoomPan?: (chart: any) => void;
  /** Callback when chart type is changed */
  onTypeChange?: (chartType: ChartVariant) => void;
  /** Enhanced export options */
  exportOptions?: {
    /** Default filename for exported images */
    filename?: string;
    /** Image quality (0-1) for JPEG exports */
    quality?: number;
    /** Format for export (png/jpeg) */
    format?: 'png' | 'jpeg';
    /** Background color for exported image */
    backgroundColor?: string;
    /** Include chart title in exported image */
    includeTitle?: boolean;
    /** Include timestamp in filename */
    includeTimestamp?: boolean;
  };
  /** Custom export button renderer */
  renderExportButton?: (handleExport: () => void) => React.ReactNode;
  /** KPI props for KPI chart type */
  kpi?: KpiProps;
  /** Option to use quality tier system for adaptive rendering */
  useAdaptiveQuality?: boolean;
  /** Optional function to configure physics interactions per data element */
  getElementPhysicsOptions?: GetElementPhysicsOptions;
}

/**
 * GlassDataChart Ref API
 * Methods and properties exposed via the forwarded ref
 */
export interface GlassDataChartRef {
  /** Get the internal Chart.js instance */
  getChartInstance: () => any | null;
  /** Export the chart as an image */
  exportChart: () => void;
  /** Update the chart with new data */
  updateChart: () => void;
  /** Get the container DOM element */
  getContainerElement: () => HTMLDivElement | null;
  /** Switch the chart type */
  switchChartType: (type: ChartVariant) => void;
} 