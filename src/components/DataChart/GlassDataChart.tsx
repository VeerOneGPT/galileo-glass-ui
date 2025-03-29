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
  defaults,
  Plugin
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { useSpring } from '../../animations/physics/useSpring';
import { GlassTooltip, GlassTooltipContent } from '../GlassTooltip';
import { formatValue, formatWithUnits, formatCurrency, formatPercentage } from './GlassDataChartUtils';
// Import keyframes from the new file
import {
  drawLine,
  fadeIn,
  popIn,
  fadeSlideUp,
  glowPulse,
  shimmer,
  activePoint,
  tooltipFade,
  atmosphericMovement
} from '../../animations/keyframes/chartAnimations';

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

// Custom SVG path animation plugin
const pathAnimationPlugin: Plugin<ChartType> = {
  id: 'pathAnimation',
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.type === 'line' && meta.dataset) {
        const element = meta.dataset as any;
        if (element && element._path) {
          const path = element._path;
          
          // Check if we already processed this path
          if (!path._animationApplied && path.getTotalLength) {
            try {
              // Mark as processed to avoid reapplying
              path._animationApplied = true;
              
              // Get path length for animation
              const pathLength = path.getTotalLength();
              
              // Apply stroke dash settings
              path.style.strokeDasharray = `${pathLength} ${pathLength}`;
              path.style.strokeDashoffset = `${pathLength}`;
              
              // Create animation with WAAPI
              path.animate(
                [
                  { strokeDashoffset: pathLength },
                  { strokeDashoffset: 0 }
                ],
                {
                  duration: 1500,
                  delay: datasetIndex * 150,
                  fill: 'forwards',
                  easing: 'ease-out'
                }
              );
            } catch (err) {
              // Fallback for browsers that don't support these features
              console.log('Advanced path animation not supported in this browser');
            }
          }
        }
      }
    });
  }
};

// Register the custom plugin
ChartJS.register(pathAnimationPlugin);

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

// New component for atmospheric background effects
const AtmosphericBackground = styled.div<{
  $color: string;
}>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => {
      if (props.$color === 'primary') return 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)';
      if (props.$color === 'secondary') return 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)';
      if (props.$color === 'info') return 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)';
      if (props.$color === 'success') return 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)';
      if (props.$color === 'warning') return 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)';
      if (props.$color === 'error') return 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)';
      return 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)';
    }};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 25%;
    right: 25%;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: ${props => {
      if (props.$color === 'primary') return 'rgba(99, 102, 241, 0.1)';
      if (props.$color === 'secondary') return 'rgba(139, 92, 246, 0.1)';
      if (props.$color === 'info') return 'rgba(59, 130, 246, 0.1)';
      if (props.$color === 'success') return 'rgba(16, 185, 129, 0.1)';
      if (props.$color === 'warning') return 'rgba(245, 158, 11, 0.1)';
      if (props.$color === 'error') return 'rgba(239, 68, 68, 0.1)';
      return 'rgba(99, 102, 241, 0.1)';
    }};
    filter: blur(50px);
    animation: ${atmosphericMovement} 8s infinite ease-in-out;
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
  animation: ${fadeSlideUp} 0.6s ease-out forwards;
`;

const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.7;
  color: #fff;
  animation: ${fadeSlideUp} 0.6s ease-out forwards 0.1s;
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
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    
    &::after {
      opacity: 0.2;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  svg {
    width: 16px;
    height: 16px;
    position: relative;
    z-index: 1;
  }
`;

const EnhancedExportButton = styled(ToolbarButton)`
  background: rgba(46, 196, 182, 0.15);
  border: 1px solid rgba(46, 196, 182, 0.3);
  
  &:hover {
    background: rgba(46, 196, 182, 0.25);
    border: 1px solid rgba(46, 196, 182, 0.4);
  }
  
  &::after {
    background: radial-gradient(circle at center, rgba(46, 196, 182, 0.3) 0%, transparent 70%);
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

const LegendItem = styled.div<{ 
  $style: string;
  $active: boolean;
  $color: string;
}>`
  display: flex;
  align-items: center;
  padding: ${props => props.$style === 'pills' ? '0.25rem 0.75rem' : '0.25rem 0.5rem'};
  font-size: 0.75rem;
  border-radius: ${props => props.$style === 'pills' ? '20px' : '4px'};
  background: ${props => {
    if (props.$style === 'pills') {
      return props.$active 
        ? `rgba(${props.$color}, 0.2)` 
        : 'rgba(255, 255, 255, 0.1)';
    }
    return props.$active ? `rgba(${props.$color}, 0.1)` : 'transparent';
  }};
  cursor: pointer;
  transition: all 0.2s ease;
  animation: ${fadeIn} 0.5s ease-out forwards;
  position: relative;
  overflow: hidden;
  
  /* Glass effect for pills style */
  ${props => props.$style === 'pills' && `
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
  
  /* Interactive hover effect */
  &:hover {
    background: ${props => props.$active 
      ? `rgba(${props.$color}, 0.25)` 
      : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    
    /* Subtle glow effect on hover */
    &::after {
      opacity: 0.5;
    }
  }
  
  /* Active state styling */
  ${props => props.$active && `
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(${props.$color}, 0.2);
  `}
  
  /* Glow effect element */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(${props => props.$color}, 0.3) 0%, transparent 70%);
    opacity: ${props => props.$active ? 0.3 : 0};
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: -1;
  }
`;

const LegendColor = styled.div<{ $color: string; $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.$color};
  margin-right: 0.5rem;
  transition: transform 0.2s ease;
  box-shadow: ${props => props.$active ? `0 0 8px ${props.$color}` : 'none'};
  
  ${props => props.$active && `
    transform: scale(1.2);
  `}
`;

const LegendLabel = styled.span<{ $active: boolean }>`
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
  transition: color 0.2s ease;
`;

const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  /* Ensure the chart doesn't clip its content - important for tooltips and animations */
  overflow: visible;
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
  exportOptions = {
    filename: 'chart',
    quality: 0.9,
    format: 'png',
    backgroundColor: 'transparent',
    includeTitle: true,
    includeTimestamp: true,
  },
  renderExportButton,
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
  
  // SVG Filter Definitions - Add this to the component
  const svgFilters = (
    <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
      <defs>
        {/* Gradient definitions */}
        {palette.map((color, i) => (
          <React.Fragment key={`gradient-${i}`}>
            <linearGradient id={`areaGradient${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={`${color}CC`} />
              <stop offset="100%" stopColor={`${color}00`} />
            </linearGradient>
            
            {/* Glow filter for lines */}
            <filter id={`glow${i}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Point highlight filter */}
            <filter id={`pointGlow${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </React.Fragment>
        ))}
      </defs>
    </svg>
  );

  // Enhanced conversion function with SVG effects
  const convertToChartJsDatasetWithEffects = (
    dataset: ChartDataset, 
    index: number, 
    chartType: ChartType,
    palette: string[],
    animations?: ChartAnimationOptions
  ) => {
    const baseDataset = convertToChartJsDataset(dataset, index, chartType, palette, animations);
    
    // Add SVG filter effects based on chart type
    if (chartType === 'line') {
      return {
        ...baseDataset,
        borderWidth: dataset.style?.lineWidth || 2,
        // Use the SVG filter for the line
        borderColor: dataset.style?.glowEffect ? palette[index % palette.length] : baseDataset.borderColor,
        // Sequential animation delays based on dataset index
        animation: {
          delay: index * (animation?.staggerDelay || 100),
        }
      };
    }
    
    return baseDataset;
  };

  // Use the enhanced dataset conversion in the chartData
  const chartData = {
    datasets: datasets.map((dataset, i) => {
      const baseDataset = convertToChartJsDatasetWithEffects(dataset, i, getChartJsType(), palette, animation);
      
      // Store format information in the dataset's custom properties
      return {
        ...baseDataset,
        formatType: dataset.formatType || 'number',
        formatOptions: dataset.formatOptions || {},
      };
    }) as any,
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
      ? {
          duration: isReducedMotion ? 0 : animation.duration,
          delay: (context) => {
            // Enhanced staggered delay for more natural animation
            if (animation.staggerDelay && context.datasetIndex !== undefined) {
              return context.datasetIndex * (animation.staggerDelay || 0) + (context.dataIndex || 0) * 20;
            }
            return 0;
          },
          // Add easing based on physics principles
          easing: 'easeOutExpo',
        }
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
      },
      // Use custom animation for path effects
      // Note: Chart.js options type doesn't include custom plugins, but they work at runtime
      ...(usePhysicsAnimation && (chartType === 'line' || chartType === 'area') ? {
        // @ts-ignore - Custom plugin configuration
        pathAnimation: { enabled: true }
      } : {})
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
  
  // Handle chart data point click with formatted value feedback
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
      
      // Format the value for the click handler
      const formatType = dataPoint.formatType || dataset.formatType || 'number';
      const formatOptions = {
        ...(dataset.formatOptions || {}),
        ...(dataPoint.formatOptions || {}),
      };
      
      // We'll provide both raw and formatted value to the handler
      if (onDataPointClick) {
        const formattedValue = formatValue(dataPoint.y, formatType as any, formatOptions);
        onDataPointClick(datasetIndex, dataIndex, {
          ...dataPoint,
          formattedValue: formattedValue
        });
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
  
  // Handle enhanced chart export
  const handleExportChart = useCallback(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    
    // Create a temporary canvas for the export
    const exportCanvas = document.createElement('canvas');
    const exportContext = exportCanvas.getContext('2d');
    
    if (!exportContext) return;
    
    // Determine dimensions and scaling
    const sourceCanvas = chart.canvas;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set the export canvas size with device pixel ratio for high-quality exports
    exportCanvas.width = sourceCanvas.width * devicePixelRatio;
    exportCanvas.height = sourceCanvas.height * devicePixelRatio;
    
    // If title should be included, make room for it
    let titleHeight = 0;
    if (exportOptions.includeTitle && (title || subtitle)) {
      titleHeight = title && subtitle ? 60 : 40;
      exportCanvas.height += titleHeight * devicePixelRatio;
    }
    
    // Fill background if specified
    if (exportOptions.backgroundColor && exportOptions.backgroundColor !== 'transparent') {
      exportContext.fillStyle = exportOptions.backgroundColor;
      exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }
    
    // Add title and subtitle if needed
    if (exportOptions.includeTitle && (title || subtitle)) {
      exportContext.textAlign = 'center';
      exportContext.textBaseline = 'middle';
      
      if (title) {
        exportContext.font = `bold ${16 * devicePixelRatio}px Inter, sans-serif`;
        exportContext.fillStyle = '#ffffff';
        exportContext.fillText(title, exportCanvas.width / 2, 25 * devicePixelRatio);
      }
      
      if (subtitle) {
        exportContext.font = `${14 * devicePixelRatio}px Inter, sans-serif`;
        exportContext.fillStyle = 'rgba(255, 255, 255, 0.7)';
        exportContext.fillText(subtitle, exportCanvas.width / 2, title ? 45 * devicePixelRatio : 25 * devicePixelRatio);
      }
    }

    // Draw the chart onto the export canvas
    exportContext.drawImage(
      sourceCanvas, 
      0, 
      0, 
      sourceCanvas.width, 
      sourceCanvas.height,
      0, 
      titleHeight * devicePixelRatio, 
      exportCanvas.width, 
      exportCanvas.height - (titleHeight * devicePixelRatio)
    );
    
    // Generate a filename with optional timestamp
    let filename = exportOptions.filename || 'chart';
    
    if (exportOptions.includeTimestamp) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      filename += `_${timestamp}`;
    }
    
    // Determine format and quality
    const format = exportOptions.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = exportOptions.format === 'jpeg' ? exportOptions.quality : undefined;
    
    // Create a data URL for the export
    const dataUrl = exportCanvas.toDataURL(format, quality);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.download = `${filename}.${exportOptions.format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [chartRef, title, subtitle, exportOptions]);
  
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
  
  // Enhanced implementation of custom tooltips
  const renderCustomTooltip = useCallback(() => {
    if (!hoveredPoint || !interaction.showTooltips) return null;

    // Get the data point's format type and options
    const dataset = datasets[hoveredPoint.datasetIndex];
    const dataPoint = dataset.data[hoveredPoint.dataIndex];
    
    // Determine the format type with fallbacks
    const formatType = dataPoint.formatType || dataset.formatType || 'number';
    
    // Merge format options with fallbacks
    const formatOptions = {
      ...(dataset.formatOptions || {}),
      ...(dataPoint.formatOptions || {}),
    };
    
    // Format the value based on type
    const formattedValue = formatValue(
      hoveredPoint.value.value, 
      formatType as any, 
      formatOptions
    );

    return (
      <div 
        style={{
          position: 'absolute',
          left: hoveredPoint.x,
          top: hoveredPoint.y - 10,
          transform: 'translate(-50%, -100%)',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          padding: '8px 12px',
          pointerEvents: 'none',
          zIndex: 100,
          color: '#fff',
          animation: 'tooltipFade 0.2s ease-out forwards',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '120px',
        }}
      >
        <div style={{ 
          marginBottom: '4px', 
          fontWeight: 600, 
          color: hoveredPoint.value.color,
          fontSize: '12px',
        }}>
          {hoveredPoint.value.dataset}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '14px', 
          fontWeight: 'bold' 
        }}>
          <span>{typeof hoveredPoint.value.label === 'string' ? hoveredPoint.value.label : 'Value'}: </span>
          <span>{formattedValue}</span>
        </div>
        {hoveredPoint.value.extra && Object.entries(hoveredPoint.value.extra).map(([key, value]) => {
          // Format extra values if they're numbers
          let displayValue = value;
          if (typeof value === 'number') {
            // Check if it's a percentage or currency by key name
            if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('change')) {
              displayValue = formatPercentage(value, { showPlus: true });
            } else if (key.toLowerCase().includes('price') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('cost')) {
              displayValue = formatCurrency(value, { compact: true });
            } else if (value > 1000) {
              displayValue = formatWithUnits(value);
            }
          }
          
          return (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>{key}: </span>
              <span>{displayValue as any}</span>
            </div>
          );
        })}
      </div>
    );
  }, [hoveredPoint, interaction.showTooltips, datasets]);
  
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
      {/* SVG Filters */}
      {svgFilters}
      
      {/* Atmospheric Background */}
      <AtmosphericBackground $color={color} />
      
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
          
          {/* Enhanced Export button */}
          {allowDownload && (
            renderExportButton ? (
              renderExportButton(handleExportChart)
            ) : (
              <EnhancedExportButton onClick={handleExportChart} title="Export chart as image">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </EnhancedExportButton>
            )
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
          {datasets.map((dataset, index) => {
            // Convert hex color to RGB for rgba usage
            const hexToRgb = (hex: string) => {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result 
                ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
                : '255, 255, 255';
            };
            
            const color = dataset.style?.lineColor || palette[index % palette.length];
            const rgbColor = hexToRgb(color);
            const isActive = !selectedDatasets.includes(index);
            
            return (
              <LegendItem 
                key={dataset.id} 
                $style={legend.style || 'default'} 
                $active={isActive}
                $color={rgbColor}
                onClick={() => handleLegendClick(index)}
              >
                <LegendColor $color={color} $active={isActive} />
                <LegendLabel $active={isActive}>{dataset.label}</LegendLabel>
              </LegendItem>
            );
          })}
        </ChartLegend>
      )}
      
      {/* Chart */}
      <ChartWrapper 
        style={usePhysicsAnimation ? {
          transform: `scale(${springValue})`,
          opacity: springValue,
          transition: `transform ${animation.duration}ms, opacity ${animation.duration}ms`
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
          {datasets.map((dataset, index) => {
            // Convert hex color to RGB for rgba usage
            const hexToRgb = (hex: string) => {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result 
                ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
                : '255, 255, 255';
            };
            
            const color = dataset.style?.lineColor || palette[index % palette.length];
            const rgbColor = hexToRgb(color);
            const isActive = !selectedDatasets.includes(index);
            
            return (
              <LegendItem 
                key={dataset.id} 
                $style={legend.style || 'default'} 
                $active={isActive}
                $color={rgbColor}
                onClick={() => handleLegendClick(index)}
              >
                <LegendColor $color={color} $active={isActive} />
                <LegendLabel $active={isActive}>{dataset.label}</LegendLabel>
              </LegendItem>
            );
          })}
        </ChartLegend>
      )}
      
      {/* Custom SVG Tooltip (replacing the component tooltip) */}
      {interaction.tooltipStyle === 'dynamic' ? renderCustomTooltip() : (
        hoveredPoint && interaction.showTooltips && (
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
              zIndex: 100
            }} />
          </GlassTooltip>
        )
      )}
    </ChartContainer>
  );
};

export default GlassDataChart;