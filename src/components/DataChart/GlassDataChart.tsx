/**
 * GlassDataChart Component
 * 
 * An advanced glass-styled chart component with physics-based interactions,
 * smooth animations, and rich customization options.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  ChartType,
  Filler,
  defaults
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { useSpring } from '../../animations/physics/useSpring';
import { GlassTooltip, GlassTooltipContent } from '../GlassTooltip';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler
);

// Adjust Chart.js defaults for better glass UI compatibility
defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
defaults.color = 'rgba(255, 255, 255, 0.7)';
defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
defaults.plugins.tooltip.enabled = false; // We'll use our custom tooltip

/**
 * Chart types supported by GlassDataChart
 * Note: 'area' is not a native Chart.js type, we'll map it to 'line' with fill
 */
export type ChartVariant = 'line' | 'bar' | 'area' | 'bubble' | 'pie' | 'doughnut' | 'radar' | 'polarArea';

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
}

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
}

// Styled components
const ChartContainer = styled.div<{
  $glassVariant: string;
  $blurStrength: string;
  $color: string;
  $elevation: number;
  $borderRadius: string | number;
  $borderColor?: string;
}>`
  position: relative;
  padding: 1.5rem;
  border-radius: ${props => typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  border: 1px solid ${props => props.$borderColor || 'rgba(255, 255, 255, 0.1)'};
  height: 100%;
  width: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${props => {
    // Get theme context for glass styling
    const themeContext = createThemeContext({});
    
    // Apply glass effect based on variant
    switch (props.$glassVariant) {
      case 'clear':
        return glassSurface({
          elevation: props.$elevation,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'light',
          borderOpacity: 'subtle',
          themeContext,
        });
      case 'frosted':
        return glassSurface({
          elevation: props.$elevation,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        });
      case 'tinted':
        return `
          ${glassSurface({
            elevation: props.$elevation,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          })}
          
          background-color: ${props.$color !== 'default' 
            ? `var(--color-${props.$color}-transparent)`
            : 'rgba(30, 41, 59, 0.5)'};
        `;
      case 'luminous':
        return `
          ${glassSurface({
            elevation: props.$elevation,
            blurStrength: props.$blurStrength as any,
            backgroundOpacity: 'medium',
            borderOpacity: 'subtle',
            themeContext,
          })}
          
          ${props.$color !== 'default' && glassGlow({
            intensity: 'subtle',
            color: props.$color,
            themeContext,
          })}
        `;
      default:
        return glassSurface({
          elevation: props.$elevation,
          blurStrength: props.$blurStrength as any,
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        });
    }
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ChartHeader = styled.div`
  margin-bottom: 1rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #fff;
`;

const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.7;
  color: #fff;
`;

const ChartToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const ChartTypeSelector = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TypeButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const ToolbarButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ChartLegend = styled.div<{ $position: string; $style: string; $glassEffect: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: ${props => props.$position === 'bottom' ? '1rem 0 0' : '0 0 1rem'};
  justify-content: ${props => {
    if (props.$position === 'left') return 'flex-start';
    if (props.$position === 'right') return 'flex-end';
    return 'center';
  }};
  
  ${props => props.$glassEffect && `
    padding: 0.5rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
`;

const LegendItem = styled.div<{ $style: string }>`
  display: flex;
  align-items: center;
  padding: ${props => props.$style === 'pills' ? '0.25rem 0.75rem' : '0.25rem 0.5rem'};
  font-size: 0.75rem;
  border-radius: ${props => props.$style === 'pills' ? '20px' : '4px'};
  background: ${props => props.$style === 'pills' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.$color};
  margin-right: 0.5rem;
`;

const LegendLabel = styled.span`
  color: #fff;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

/**
 * Helper function to generate chart dataset colors
 */
const generateColors = (count: number, palette: string[], baseOpacity = 0.7): string[] => {
  // If palette has enough colors, use them
  if (palette.length >= count) {
    return palette.slice(0, count);
  }
  
  // Otherwise, generate colors based on the palette
  const colors: string[] = [...palette];
  
  // Generate more colors by adjusting lightness of palette colors
  while (colors.length < count) {
    const baseColor = palette[colors.length % palette.length];
    
    // Convert hex to rgba with adjusted alpha
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Adjust the alpha based on how many times we've cycled through the palette
    const cycleCount = Math.floor(colors.length / palette.length);
    const adjustedOpacity = Math.max(0.3, baseOpacity - cycleCount * 0.15);
    
    colors.push(`rgba(${r}, ${g}, ${b}, ${adjustedOpacity})`);
  }
  
  return colors;
};

/**
 * Helper to convert dataset to Chart.js format
 */
const convertToChartJsDataset = (
  dataset: ChartDataset, 
  index: number, 
  chartType: ChartType,
  palette: string[],
  animations?: ChartAnimationOptions
) => {
  const { id, label, data, style, useRightYAxis, order, hidden } = dataset;
  
  // Generate color from palette if not specified
  const baseColor = style?.lineColor || palette[index % palette.length];
  const fillColor = style?.fillColor || baseColor;
  
  // Line dash settings based on style
  let lineDash: number[] = [];
  if (style?.lineStyle === 'dashed') {
    lineDash = [5, 5];
  } else if (style?.lineStyle === 'dotted') {
    lineDash = [2, 2];
  }
  
  // Common dataset properties
  const baseDataset = {
    id,
    label,
    data: data.map(point => ({ 
      x: point.x, 
      y: point.y,
      extra: point.extra
    })),
    backgroundColor: fillColor,
    borderColor: style?.lineColor || baseColor,
    pointBackgroundColor: style?.pointColor || baseColor,
    borderWidth: style?.lineWidth || 2,
    pointRadius: style?.pointSize || 3,
    pointStyle: style?.pointStyle || 'circle',
    order: order || index,
    hidden: hidden || false,
    yAxisID: useRightYAxis ? 'y1' : 'y',
    borderDash: lineDash,
    hoverBorderWidth: (style?.lineWidth || 2) + 1,
    hoverBorderColor: style?.glowEffect ? baseColor : undefined,
    hoverBackgroundColor: style?.glowEffect ? baseColor : undefined,
    tension: 0.4, // Smooth lines a bit
  };
  
  // Type-specific properties
  switch (chartType as string) {
    case 'line':
      return {
        ...baseDataset,
        fill: style?.fillOpacity ? true : false,
        backgroundColor: style?.fillOpacity ? `${baseColor}${Math.round(style.fillOpacity * 255).toString(16).padStart(2, '0')}` : 'transparent',
      };
      
    case 'bar':
      return {
        ...baseDataset,
        borderRadius: 4,
        hoverBackgroundColor: style?.glowEffect ? `${baseColor}E6` : `${baseColor}CC`,
      };
      
    case 'area':
      return {
        ...baseDataset,
        fill: true,
        type: 'line', // Explicitly set type to 'line' for area charts
        backgroundColor: Array.isArray(fillColor) 
          ? { colors: fillColor }
          : typeof fillColor === 'string'
            ? `${fillColor}${Math.round((style?.fillOpacity || 0.4) * 255).toString(16).padStart(2, '0')}`
            : fillColor,
      };
      
    case 'bubble':
      return {
        ...baseDataset,
        pointRadius: data.map(point => (point.y === null ? 0 : (point.y / 10) + 5)),
        hoverRadius: data.map(point => (point.y === null ? 0 : (point.y / 10) + 7)),
      };
      
    case 'pie':
    case 'doughnut':
      return {
        ...baseDataset,
        backgroundColor: data.map((point, i) => 
          point.color || palette[i % palette.length]
        ),
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        hoverOffset: 10,
      };
      
    case 'radar':
      return {
        ...baseDataset,
        fill: true,
        backgroundColor: `${baseColor}66`,
      };
      
    case 'polarArea':
      return {
        ...baseDataset,
        backgroundColor: data.map((point, i) => 
          `${point.color || palette[i % palette.length]}C0`
        ),
      };
      
    default:
      return baseDataset;
  }
};

/**
 * GlassDataChart Component
 */
export const GlassDataChart: React.FC<GlassDataChartProps> = ({
  title,
  subtitle,
  variant = 'line',
  datasets,
  width = '100%',
  height = 400,
  glassVariant = 'frosted',
  blurStrength = 'standard',
  color = 'primary',
  animation = {
    physicsEnabled: true,
    duration: 1000,
    tension: 300,
    friction: 30,
    mass: 1,
    easing: 'easeOutQuart',
    staggerDelay: 100,
  },
  interaction = {
    zoomPanEnabled: false,
    physicsHoverEffects: true,
    hoverSpeed: 150,
    showTooltips: true,
    tooltipStyle: 'frosted',
    tooltipFollowCursor: false,
  },
  legend = {
    show: true,
    position: 'top',
    align: 'center',
    style: 'default',
    glassEffect: false,
  },
  axis = {
    showXGrid: true,
    showYGrid: true,
    showXLabels: true,
    showYLabels: true,
    axisColor: 'rgba(255, 255, 255, 0.3)',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    gridStyle: 'solid',
  },
  initialSelection,
  showToolbar = true,
  allowDownload = true,
  palette = [
    '#6366F1', // primary
    '#8B5CF6', // secondary
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#EC4899', // pink
    '#6B7280', // gray
  ],
  allowTypeSwitch = true,
  backgroundColor,
  borderRadius = 12,
  borderColor,
  elevation = 3,
  className,
  style,
  onDataPointClick,
  onSelectionChange,
  onZoomPan,
  onTypeChange,
}) => {
  // Hooks
  const theme = useGlassTheme();
  const isDarkMode = theme ? theme.isDarkMode : false;
  const { isReducedMotion } = useAccessibilitySettings();
  const chartRef = useRef<ChartJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [chartType, setChartType] = useState<ChartVariant>(variant);
  const [selectedDataset, setSelectedDataset] = useState<number | null>(
    typeof initialSelection === 'number' ? initialSelection : null
  );
  const [selectedDatasets, setSelectedDatasets] = useState<number[]>(
    Array.isArray(initialSelection) ? initialSelection : []
  );
  const [hoveredPoint, setHoveredPoint] = useState<{
    datasetIndex: number;
    dataIndex: number;
    x: number;
    y: number;
    value: any;
  } | null>(null);
  
  // State for animation
  const { value: springValue, isAnimating } = useSpring({
    from: 0,
    to: 1,
    config: {
      tension: animation.tension || 300,
      friction: animation.friction || 30,
      mass: animation.mass || 1,
    }
  });
  
  // Update the tooltip style to ensure it's a valid type
  const safeTooltipStyle = interaction.tooltipStyle === 'glass' ? 'frosted' : interaction.tooltipStyle;
  
  // Determine if we're using physics-based animations
  const usePhysicsAnimation = animation.physicsEnabled && !isReducedMotion;
  
  // Derive chartjs type from our variant
  const getChartJsType = (): ChartType => {
    // Map area to line type since it's not a native Chart.js type
    if (chartType === 'area') {
      // Use direct assignment for the most compatibility
      return 'line' as unknown as ChartType;
    }
    // For all other chart types
    return chartType as unknown as ChartType;
  };
  
  // Format data for Chart.js - fix type issues by adding proper type casting
  const chartData = {
    datasets: datasets.map((dataset, i) => 
      convertToChartJsDataset(dataset, i, getChartJsType(), palette, animation)
    ) as any,
    // Labels are used for pie/doughnut/polarArea charts
    labels: chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea'
      ? datasets[0]?.data.map(point => point.label || point.x.toString())
      : undefined,
  };
  
  // Configure chart options
  const chartOptions: ChartOptions<ChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: usePhysicsAnimation 
      ? false // We'll handle physics animations ourselves
      : {
          duration: isReducedMotion ? 0 : animation.duration,
          easing: animation.easing as any || 'easeOutQuart',
          delay: (context) => {
            // Add staggered delay if specified
            if (animation.staggerDelay && context.datasetIndex !== undefined) {
              return context.datasetIndex * (animation.staggerDelay || 0);
            }
            return 0;
          }
        },
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }
    },
    plugins: {
      legend: {
        display: false, // We'll create our own custom legend
      },
      tooltip: {
        enabled: false, // We'll create our own custom tooltip
      }
    },
    
    // Simplify scales configuration to make it compatible with Chart.js types
    scales: chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'radar' && chartType !== 'polarArea'
      ? {
          x: {
            display: axis.showXLabels,
            grid: {
              display: axis.showXGrid,
              color: axis.gridColor,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              padding: 8,
              maxRotation: 0,
              count: axis.xTicksCount,
            },
            title: {
              display: !!axis.xTitle,
              text: axis.xTitle || '',
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                weight: 'normal',
                size: 12,
              },
              padding: { top: 10 }
            }
          },
          y: {
            display: axis.showYLabels,
            position: 'left',
            grid: {
              display: axis.showYGrid,
              color: axis.gridColor,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              padding: 8,
              count: axis.yTicksCount,
            },
            title: {
              display: !!axis.yTitle,
              text: axis.yTitle || '',
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                weight: 'normal',
                size: 12,
              },
              padding: { bottom: 10 }
            }
          },
          // Add right y-axis if any dataset uses it
          ...(datasets.some(d => d.useRightYAxis) ? {
            y1: {
              display: axis.showYLabels,
              position: 'right',
              grid: {
                display: false,
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                padding: 8,
              }
            }
          } : {})
        }
      : undefined,
    // Different options based on chart type
    ...(chartType === 'pie' || chartType === 'doughnut' ? {
      cutout: chartType === 'doughnut' ? '50%' : undefined,
    } : {}),
    // Handle hover interactions
    hover: {
      mode: 'nearest',
      intersect: false,
    },
    elements: {
      // Customize line elements
      line: {
        borderWidth: 2,
        tension: 0.4, // Smooth curve
      },
      // Customize point elements
      point: {
        hitRadius: 8,
        hoverRadius: 6,
        hoverBorderWidth: 2,
      },
      // Customize bar elements
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
      // Customize arc elements (pie/doughnut)
      arc: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }
    },
    // Enable interaction options
    ...(interaction.zoomPanEnabled ? {
      zoom: {
        pan: {
          enabled: true,
          mode: interaction.zoomMode,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: interaction.zoomMode,
        }
      }
    } : {})
  };
  
  // Handle chart type change
  const handleTypeChange = (type: ChartVariant) => {
    setChartType(type);
    if (onTypeChange) {
      onTypeChange(type);
    }
  };
  
  // Handle legend item click
  const handleLegendClick = (index: number) => {
    if (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea') {
      // For pie charts, handle single selection
      setSelectedDataset(selectedDataset === index ? null : index);
      
      if (onSelectionChange) {
        onSelectionChange(selectedDataset === index ? [] : [index]);
      }
    } else {
      // For other charts, handle multi-selection
      let newSelectedDatasets = [...selectedDatasets];
      
      if (newSelectedDatasets.includes(index)) {
        newSelectedDatasets = newSelectedDatasets.filter(i => i !== index);
      } else {
        newSelectedDatasets.push(index);
      }
      
      setSelectedDatasets(newSelectedDatasets);
      
      if (onSelectionChange) {
        onSelectionChange(newSelectedDatasets);
      }
    }
    
    // Update the visible datasets
    if (chartRef.current) {
      const chart = chartRef.current;
      
      // Toggle dataset visibility
      chart.setDatasetVisibility(
        index,
        !chart.isDatasetVisible(index)
      );
      
      chart.update();
    }
  };
  
  // Handle chart data point click
  const handleDataPointClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    const points = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: true },
      false
    );
    
    if (points.length > 0) {
      const firstPoint = points[0];
      const datasetIndex = firstPoint.datasetIndex;
      const dataIndex = firstPoint.index;
      const dataset = datasets[datasetIndex];
      const dataPoint = dataset.data[dataIndex];
      
      if (onDataPointClick) {
        onDataPointClick(datasetIndex, dataIndex, dataPoint);
      }
    }
  };
  
  // Handle chart hover for tooltips
  const handleChartHover = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current || !interaction.showTooltips) return;
    
    const chart = chartRef.current;
    const points = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: false },
      false
    );
    
    if (points.length > 0) {
      const firstPoint = points[0];
      const datasetIndex = firstPoint.datasetIndex;
      const dataIndex = firstPoint.index;
      const dataset = datasets[datasetIndex];
      const dataPoint = dataset.data[dataIndex];
      
      // Get position in canvas coordinates
      const rect = chart.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      setHoveredPoint({
        datasetIndex,
        dataIndex,
        x: event.clientX,
        y: event.clientY,
        value: {
          dataset: dataset.label,
          label: dataPoint.label || dataPoint.x,
          value: dataPoint.y,
          color: dataset.style?.lineColor || palette[datasetIndex % palette.length],
          extra: dataPoint.extra,
        }
      });
    } else {
      setHoveredPoint(null);
    }
  };
  
  // Handle chart hover leave
  const handleChartLeave = () => {
    setHoveredPoint(null);
  };
  
  // Handle download chart as image
  const handleDownloadChart = () => {
    if (!chartRef.current) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = `${title || 'chart'}.png`;
    
    // Set the link href to the chart data URL
    link.href = chartRef.current.toBase64Image();
    
    // Click the link to trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Initialize the chart with physics animations
  useEffect(() => {
    if (usePhysicsAnimation) {
      // Animation is now controlled by the useSpring hook itself
      // No need to manually control it
    }
  }, [usePhysicsAnimation]);
  
  // Chart reference callback for getting chart instance
  const chartRefCallback = useCallback((chart: ChartJS | null) => {
    chartRef.current = chart;
  }, []);
  
  // Available chart types for switching
  const availableTypes: ChartVariant[] = ['line', 'bar', 'area'];
  
  // Only offer pie/doughnut switching if data format is compatible
  const canShowPieChart = datasets.length === 1 && datasets[0].data.every(point => 
    typeof point.y === 'number' && point.y > 0
  );
  
  if (canShowPieChart) {
    availableTypes.push('pie', 'doughnut');
  }
  
  return (
    <ChartContainer
      ref={containerRef}
      className={`glass-data-chart ${className || ''}`}
      style={{
        width,
        height,
        ...style
      }}
      $glassVariant={glassVariant}
      $blurStrength={blurStrength}
      $color={color}
      $elevation={elevation}
      $borderRadius={borderRadius}
      $borderColor={borderColor}
    >
      {/* Chart Header */}
      {(title || subtitle) && (
        <ChartHeader>
          {title && <ChartTitle>{title}</ChartTitle>}
          {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
        </ChartHeader>
      )}
      
      {/* Toolbar */}
      {showToolbar && (
        <ChartToolbar>
          {/* Type selector */}
          {allowTypeSwitch && (
            <ChartTypeSelector>
              {availableTypes.map(type => (
                <TypeButton
                  key={type}
                  $active={chartType === type}
                  onClick={() => handleTypeChange(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </TypeButton>
              ))}
            </ChartTypeSelector>
          )}
          
          {/* Download button */}
          {allowDownload && (
            <ToolbarButton onClick={handleDownloadChart} title="Download as image">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </ToolbarButton>
          )}
        </ChartToolbar>
      )}
      
      {/* Legend - Top position */}
      {legend.show && legend.position === 'top' && (
        <ChartLegend 
          $position={legend.position} 
          $style={legend.style || 'default'} 
          $glassEffect={legend.glassEffect || false}
        >
          {datasets.map((dataset, index) => (
            <LegendItem 
              key={dataset.id} 
              $style={legend.style || 'default'} 
              onClick={() => handleLegendClick(index)}
            >
              <LegendColor $color={dataset.style?.lineColor || palette[index % palette.length]} />
              <LegendLabel>{dataset.label}</LegendLabel>
            </LegendItem>
          ))}
        </ChartLegend>
      )}
      
      {/* Chart */}
      <ChartWrapper 
        style={usePhysicsAnimation ? {
          transform: `scale(${springValue})`,
          opacity: springValue
        } : undefined}
      >
        <Chart
          type={getChartJsType()}
          data={chartData}
          options={chartOptions}
          ref={chartRefCallback}
          onClick={handleDataPointClick}
          onMouseMove={handleChartHover}
          onMouseLeave={handleChartLeave}
        />
      </ChartWrapper>
      
      {/* Legend - Bottom position */}
      {legend.show && legend.position === 'bottom' && (
        <ChartLegend 
          $position={legend.position} 
          $style={legend.style || 'default'} 
          $glassEffect={legend.glassEffect || false}
        >
          {datasets.map((dataset, index) => (
            <LegendItem 
              key={dataset.id} 
              $style={legend.style || 'default'} 
              onClick={() => handleLegendClick(index)}
            >
              <LegendColor $color={dataset.style?.lineColor || palette[index % palette.length]} />
              <LegendLabel>{dataset.label}</LegendLabel>
            </LegendItem>
          ))}
        </ChartLegend>
      )}
      
      {/* Custom Tooltip */}
      {hoveredPoint && interaction.showTooltips && (
        <GlassTooltip
          title={
            <GlassTooltipContent
              title={hoveredPoint.value.dataset}
              titleColor={hoveredPoint.value.color}
              items={[
                { 
                  label: typeof hoveredPoint.value.label === 'string' 
                    ? hoveredPoint.value.label 
                    : 'Value', 
                  value: hoveredPoint.value.value
                },
                // Add extra data items if available
                ...(hoveredPoint.value.extra 
                  ? Object.entries(hoveredPoint.value.extra).map(([key, value]) => ({
                      label: key,
                      value: value as any
                    }))
                  : [])
              ]}
            />
          }
          placement="top"
          glassStyle={'frosted' as 'clear' | 'frosted' | 'tinted' | 'luminous' | 'dynamic'}
          arrow
          followCursor={interaction.tooltipFollowCursor}
          interactive={false}
        >
          <div style={{ 
            position: 'absolute', 
            top: hoveredPoint.y, 
            left: hoveredPoint.x,
            width: 1,
            height: 1,
            pointerEvents: 'none',
          }} />
        </GlassTooltip>
      )}
    </ChartContainer>
  );
};

export default GlassDataChart;