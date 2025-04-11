/**
 * GlassDataChart Component
 * 
 * An advanced glass-styled chart component with physics-based interactions,
 * smooth animations, and rich customization options.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// import styled from 'styled-components'; // unused
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
  ChartType,
  Filler,
  defaults,
  Plugin
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
// import { glassSurface } from '../../core/mixins/glassSurface'; // unused
// import { glassGlow } from '../../core/mixins/glowEffects'; // unused
// import { createThemeContext } from '../../core/themeContext'; // unused
import { useGlassTheme } from '../../hooks/useGlassTheme';
// import { useGalileoStateSpring, GalileoStateSpringOptions } from '../../hooks/useGalileoStateSpring'; // unused
import { GlassTooltip, GlassTooltipContent } from '../GlassTooltip';
import { formatValue, /* formatWithUnits, formatCurrency, formatPercentage */ } from './GlassDataChartUtils'; // unused imports removed
// Import keyframes from the new file
import {
  // drawLine, // unused
  // fadeIn, // unused
  // popIn, // unused
  // fadeSlideUp, // unused
  // glowPulse, // unused
  // shimmer, // unused
  // activePoint, // unused
  // tooltipFade, // unused
  // atmosphericMovement // unused
} from '../../animations/keyframes/chartAnimations';

// Import our modularized components
import {
  ChartContainer,
  AtmosphericBackground,
  ChartHeader,
  ChartTitle,
  ChartSubtitle,
  ChartWrapper
} from './styles/ChartContainerStyles';

import {
  ChartToolbar,
  ChartTypeSelector,
  TypeButton,
  EnhancedExportButton,
  ChartLegend,
  LegendItem,
  LegendColor,
  LegendLabel,
  // KpiContainer, // unused
  // KpiTitle, // unused
  // KpiValue, // unused
  // KpiSubtitle, // unused
  // KpiTrend // unused
} from './styles/ChartElementStyles';

import {
  TooltipHeader,
  TooltipRow,
  TooltipLabel,
  TooltipValue,
  DynamicTooltip
} from './styles/TooltipStyles';

// Import types from the types directory
import {
  // DataPoint, // unused
  // ChartDataset // unused
} from './types/ChartTypes';

import {
  GlassDataChartProps,
  GlassDataChartRef,
  // ChartAnimationOptions, // unused
  // ChartInteractionOptions, // unused
  // ChartLegendOptions, // unused
  // ChartAxisOptions // unused
} from './types/ChartProps';

// Import hooks
import {
  useQualityTier,
  // QualityTier, // unused
  // PhysicsParams, // unused
  // GlassParams, // unused
  getQualityBasedPhysicsParams,
  getQualityBasedGlassParams
} from './hooks/useQualityTier';

import { usePhysicsAnimation } from './hooks/usePhysicsAnimation';

// Import utilities
import {
  // convertToChartJsDataset, // unused
  convertToChartJsDatasetWithEffects,
  // hexToRgb, // unused
  // generateColors // unused
} from './utils/ChartDataUtils';

// Import our new physics interaction hook
import { useChartPhysicsInteraction } from './hooks';

// Import the new plugin and its exported types
import {
  GalileoElementInteractionPlugin,
  GetElementPhysicsOptions,
} from './plugins/GalileoElementInteractionPlugin';

// Import ChartVariant separately
import { ChartVariant } from './types/ChartProps';

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
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.type === 'line' && meta.dataset) {
        const element = meta.dataset as any; // Keep 'as any': _path is likely internal/non-standard for path animation
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
// Register our interaction plugin
ChartJS.register(GalileoElementInteractionPlugin);

// Adjust Chart.js defaults safely
if (defaults?.plugins?.tooltip) {
  defaults.plugins.tooltip.enabled = false; // Use custom tooltip
}
if (defaults?.font) {
  defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
}
// Set colors safely
defaults.color = 'rgba(255, 255, 255, 0.7)';
defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

/**
 * Register required Chart.js components
 */
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
  Filler // Required for area charts
);

// Define a type for the hovered point value structure
interface HoveredPointValue {
  dataset?: string | number | null;
  label?: string | number | null;
  value?: number | null;
  color?: string | null;
  extra?: Record<string, unknown> | null; // Use unknown for potentially varied extra data
  formatType?: 'number' | 'currency' | 'percentage' | 'units';
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

// Define our custom icon components
const ZoomInIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const ZoomOutIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13H5v-2h14v2z" />
  </svg>
);

const RefreshIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.65 6.35C16.2 4.9 14.2 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 10h7V3l-2.35 3.35z" />
  </svg>
);

// Define a Button component so we don't need to import
const GlassButton = ({ 
  children, 
  variant, 
  size, 
  onClick, 
  glass,
  'aria-label': ariaLabel
}: { 
  children: React.ReactNode, 
  variant?: string,
  size?: string,
  onClick?: () => void,
  glass?: string,
  'aria-label'?: string
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        borderRadius: '4px',
        padding: size === 'sm' ? '4px' : '8px',
        color: 'white',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
};

// Define a ZoomControls component for displaying zoom UI
interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  zoomLevel: number;
  $variant?: 'clear' | 'frosted' | 'tinted' | 'luminous';
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  zoomLevel,
  $variant = 'frosted'
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: '10px',
        top: '10px',
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
        padding: '4px',
        borderRadius: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)',
        zIndex: 5,
      }}
    >
      <GlassButton
        variant="icon"
        size="sm"
        onClick={onZoomIn}
        aria-label="Zoom in"
        glass={$variant}
      >
        <ZoomInIcon size={16} />
      </GlassButton>
      
      <span style={{ 
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '12px',
        padding: '0 8px',
        minWidth: '40px',
        textAlign: 'center'
      }}>
        {Math.round(zoomLevel * 100)}%
      </span>
      
      <GlassButton
        variant="icon"
        size="sm"
        onClick={onZoomOut}
        aria-label="Zoom out"
        glass={$variant}
      >
        <ZoomOutIcon size={16} />
      </GlassButton>
      
      <GlassButton
        variant="icon"
        size="sm"
        onClick={onReset}
        aria-label="Reset zoom"
        glass={$variant}
      >
        <RefreshIcon size={16} />
      </GlassButton>
    </div>
  );
};

/**
 * GlassDataChart Component
 */
export const GlassDataChart = React.forwardRef<GlassDataChartRef, GlassDataChartProps>((props, ref) => {
  const {
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
      zoomMode: 'xy', // Ensure default matches type ('x' | 'y' | 'xy')
      physicsHoverEffects: true,
      hoverSpeed: 150,
      showTooltips: true,
      tooltipStyle: 'frosted',
      tooltipFollowCursor: false,
      // Add the physics sub-object with defaults to match the updated type
      physics: {
        tension: 300, // Default tension for zoom/pan physics
        friction: 30, // Default friction
        mass: 1,
        minZoom: 0.5,
        maxZoom: 5,
        wheelSensitivity: 0.1,
        inertiaDuration: 500,
      }
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
    borderRadius = 12,
    borderColor,
    elevation = 3,
    className,
    style,
    onDataPointClick,
    onSelectionChange,
    onTypeChange,
    onZoomPan,
    exportOptions = {
      filename: 'chart',
      quality: 0.9,
      format: 'png',
      backgroundColor: 'transparent',
      includeTitle: true,
      includeTimestamp: true,
    },
    renderExportButton,
    kpi,
    useAdaptiveQuality = true,
    getElementPhysicsOptions,
  } = props;
  
  // Hooks
  // const theme = useGlassTheme(); // unused
  const { isReducedMotion } = useAccessibilitySettings();
  const chartRef = useRef<ChartJS | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartWrapperRef = useRef<HTMLDivElement | null>(null);
  
  // Quality tier system integration
  const qualityTier = useQualityTier();
  const activeQuality = useAdaptiveQuality ? qualityTier : 'high';
  
  // Get physics parameters based on quality tier
  const qualityPhysicsParams = getQualityBasedPhysicsParams(activeQuality);
  const qualityGlassParams = getQualityBasedGlassParams(activeQuality);
  
  // Adapt quality based on user's settings
  const adaptedBlurStrength = qualityGlassParams.blurStrength as 'low' | 'medium' | 'high' || blurStrength;
  
  // Physics animation for main chart
  const { 
    value: springValue, 
    applyOscillation, 
    applyPopIn 
  } = usePhysicsAnimation({
    type: isReducedMotion ? 'none' : (animation.physicsEnabled ? 'spring' : 'none'),
    stiffness: qualityPhysicsParams.stiffness,
    damping: qualityPhysicsParams.dampingRatio * 2 * Math.sqrt(qualityPhysicsParams.stiffness * qualityPhysicsParams.mass),
    mass: qualityPhysicsParams.mass,
    precision: qualityPhysicsParams.precision,
    adaptiveMotion: true,
    respectReducedMotion: true
  });
  
  // Use our physics interaction hook for zoom/pan functionality
  const { 
    isPanning,
    zoomLevel,
    applyZoom,
    resetZoom
  } = useChartPhysicsInteraction(chartRef, chartWrapperRef, {
    enabled: interaction.zoomPanEnabled || false,
    mode: interaction.zoomMode || 'xy',
    physics: {
      tension: interaction.physics?.tension || qualityPhysicsParams.stiffness,
      friction: interaction.physics?.friction || (qualityPhysicsParams.dampingRatio * 2 * Math.sqrt(qualityPhysicsParams.stiffness * qualityPhysicsParams.mass)),
      mass: interaction.physics?.mass || qualityPhysicsParams.mass,
    },
    minZoom: interaction.physics?.minZoom || 0.5,
    maxZoom: interaction.physics?.maxZoom || 5,
    wheelSensitivity: interaction.physics?.wheelSensitivity || 0.1,
    inertiaDuration: interaction.physics?.inertiaDuration || 500,
    respectReducedMotion: true
  });
  
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
    value: HoveredPointValue | null;
  } | null>(null);
  
  // Placeholder for internal element animation state (managed by React)
  // The plugin will read targets from this or similar structure
  const [elementAnimationTargets, setElementAnimationTargets] = useState<Map<string, any>>(new Map());
  // Key: `datasetIndex_dataIndex`, Value: { targetScale: 1, targetOpacity: 1, ... }
  
  // Determine if we're using physics-based animations
  const enablePhysicsAnimation = animation.physicsEnabled && !isReducedMotion;
  
  // Apply initial animations based on quality tier
  useEffect(() => {
    if (enablePhysicsAnimation) {
      // Trigger a pop-in animation on mount for better visual impact
      if (activeQuality !== 'low') {
        applyPopIn();
      }
    }
  }, [enablePhysicsAnimation, activeQuality, applyPopIn]);
  
  // Derive chartjs type from our variant
  const getChartJsType = (): ChartType => {
    // Special handling for KPI type (we'll render our own component)
    if (chartType === 'kpi') {
      return 'bar' as ChartType; // Just a placeholder, we won't render the chart
    }
    
    // Map area to line type since it's not a native Chart.js type
    if (chartType === 'area') {
      // Use direct assignment for the most compatibility
      return 'line' as unknown as ChartType;
    }
    
    // For all other chart types
    return chartType as unknown as ChartType;
  };
  
  // SVG Filter Definitions
  const svgFilters = (
    <svg width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }}>
      <defs>
        {/* Gradient definitions */}
        {palette.map((color, i) => {
          // Ensure color is a valid value to prevent SVG errors
          const safeColor = color || '#6366F1'; // Default to primary color if undefined
          
          return (
            <React.Fragment key={`gradient-${i}`}>
              <linearGradient 
                id={`areaGradient${i}`} 
                x1="0%" 
                y1="0%" 
                x2="0%" 
                y2="100%"
              >
                <stop offset="0%" stopColor={`${safeColor}CC`} />
                <stop offset="100%" stopColor={`${safeColor}00`} />
              </linearGradient>
              
              {/* Glow filter for lines */}
              <filter 
                id={`glow${i}`} 
                x="-20%" 
                y="-20%" 
                width="140%" 
                height="140%"
              >
                <feGaussianBlur stdDeviation={activeQuality === 'low' ? 1 : 2} result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              
              {/* Point highlight filter */}
              <filter 
                id={`pointGlow${i}`} 
                x="-50%" 
                y="-50%" 
                width="200%" 
                height="200%"
              >
                <feGaussianBlur stdDeviation={activeQuality === 'low' ? 2 : 3} result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </React.Fragment>
          );
        })}
      </defs>
    </svg>
  );

  // Use the enhanced dataset conversion in the chartData
  // Process datasets first to get converted structure including processed labels if applicable
  const convertedDatasets = datasets.map((dataset, i) => {
    return convertToChartJsDatasetWithEffects(dataset, i, chartType, palette, animation);
  });

  // Prepare labels, using processed ones for pie/doughnut if available
  let chartLabels: string[] | undefined;
  if (chartType === 'pie' || chartType === 'doughnut') {
    // Access processedLabels from the *first* dataset's conversion result
    // Type assertion might be needed if TypeScript cannot infer the added property
    const firstConvertedDataset = convertedDatasets[0] as any; 
    if (firstConvertedDataset?.processedLabels && firstConvertedDataset.processedLabels.length > 0) {
      chartLabels = firstConvertedDataset.processedLabels;
    } else if (datasets[0]?.data) {
      // Fallback to original data labels if processed labels aren't available
      chartLabels = datasets[0].data.map(point => point.label || String(point.x));
    }
  } else if (chartType === 'polarArea') {
      // Use original labels for polarArea
      chartLabels = datasets[0]?.data.map(point => point.label || String(point.x));
  }

  const chartData = {
    // Map converted datasets, removing any temporary properties like processedLabels
    datasets: convertedDatasets.map(ds => {
      const { processedLabels, ...rest } = ds as any; // Use type assertion here too
      return rest;
    }),
    labels: chartLabels, // Assign the prepared labels
  };
  
  // Zoom in function
  const handleZoomIn = useCallback(() => {
    applyZoom(zoomLevel * 1.2);
  }, [applyZoom, zoomLevel]);
  
  // Zoom out function
  const handleZoomOut = useCallback(() => {
    applyZoom(zoomLevel * 0.8);
  }, [applyZoom, zoomLevel]);
  
  // Handle zoom changed callback
  const handleZoomChanged = useCallback(() => {
    if (onZoomPan && chartRef.current) {
      onZoomPan(chartRef.current);
    }
  }, [onZoomPan]);
  
  // Handle chart type change
  const handleTypeChange = (type: ChartVariant) => {
    setChartType(type);
    onTypeChange?.(type);
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
      
      // --- Trigger Element Click Animation State Update ---
      if (getElementPhysicsOptions) {
        const physicsOptions = getElementPhysicsOptions(dataPoint, datasetIndex, dataIndex, chartType);
        if (physicsOptions?.clickEffect) {
          const key = `${datasetIndex}_${dataIndex}`;
          setElementAnimationTargets(prev => 
            new Map(prev).set(key, { 
              ...prev.get(key),
              targetScale: physicsOptions.clickEffect?.scale ?? 1, 
              targetOpacity: physicsOptions.clickEffect?.opacity ?? 1,
              // Add other effects
            })
          );
          // TODO: Need a mechanism to reset the click effect after a duration?
          console.log(`[Chart Interaction] Set CLICK target for ${key}:`, physicsOptions.clickEffect);
        }
      }
      // --- End Trigger ---
      
      // Apply oscillation if physics enabled (This is separate chart-wide effect)
      if (interaction.physicsHoverEffects && !isReducedMotion) {
        applyOscillation(0.5);
      }
      
      // Format the value for the click handler
      const formatType = dataPoint.formatType || dataset.formatType || 'number';
      const formatOptions = {
        ...(dataset.formatOptions || {}),
        ...(dataPoint.formatOptions || {}),
      };
      
      // We'll provide both raw and formatted value to the handler
      if (onDataPointClick) {
        const formattedValue = formatValue(
          dataPoint.y,
          formatType,
          formatOptions
        );
        onDataPointClick(datasetIndex, dataIndex, {
          ...dataPoint,
          formattedValue: formattedValue
        });
      }
    }
  };
  
  // Handle chart hover for tooltips
  const handleChartHover = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;

    // Exit early if BOTH interactions are disabled
    if (!interaction.physicsHoverEffects && !interaction.showTooltips) {
      setHoveredPoint(null); // Ensure tooltip state is cleared if disabled
      return;
    }

    // Clear previous hover animation targets first
    const previousHoveredKey = hoveredPoint ? `${hoveredPoint.datasetIndex}_${hoveredPoint.dataIndex}` : null;
    
    const chart = chartRef.current;
    const points = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: false },
      false
    );
    
    let currentHoveredKey: string | null = null;
    
    if (points.length > 0) {
      const firstPoint = points[0];
      const datasetIndex = firstPoint.datasetIndex;
      const dataIndex = firstPoint.index;
      currentHoveredKey = `${datasetIndex}_${dataIndex}`;
      
      // --- Trigger Element Hover Animation State Update ---
      // Check if physicsHoverEffects is enabled BEFORE updating targets
      if (interaction.physicsHoverEffects && getElementPhysicsOptions) {
          const dataset = datasets[datasetIndex];
          const dataPoint = dataset.data[dataIndex];
          const physicsOptions = getElementPhysicsOptions(dataPoint, datasetIndex, dataIndex, chartType);
          if (physicsOptions?.hoverEffect) {
            setElementAnimationTargets(prev => 
              new Map(prev).set(currentHoveredKey!, { // Use non-null assertion as key is set
                ...prev.get(currentHoveredKey!), 
                targetScale: physicsOptions.hoverEffect?.scale ?? 1,
                targetOpacity: physicsOptions.hoverEffect?.opacity ?? 1,
                // Add other effects
              })
            );
            console.log(`[Chart Interaction] Set HOVER target for ${currentHoveredKey}:`, physicsOptions.hoverEffect);
          }
      }
      // --- End Trigger ---
      
      // Update tooltip state only if enabled
      if (interaction.showTooltips) {
          const dataset = datasets[datasetIndex];
          const dataPoint = dataset.data[dataIndex];
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
              formatType: dataPoint.formatType,
              formatOptions: dataPoint.formatOptions,
            }
          });
      }
    } else {
      // Clear tooltip state if enabled
      if (interaction.showTooltips) {
        setHoveredPoint(null);
      }
    }
    
    // Reset animation targets for previously hovered element if it's different
    // Only reset if physics hover effects are enabled
    if (interaction.physicsHoverEffects && previousHoveredKey && previousHoveredKey !== currentHoveredKey) {
         setElementAnimationTargets(prev => 
            new Map(prev).set(previousHoveredKey, { 
              ...prev.get(previousHoveredKey),
              targetScale: 1, 
              targetOpacity: 1,
              // Reset other effects
            })
          );
          console.log(`[Chart Interaction] Reset HOVER target for ${previousHoveredKey}`);
    }
  };
  
  // Handle chart hover leave
  const handleChartLeave = () => {
    // Clear tooltip state if enabled
    if (interaction.showTooltips) {
        setHoveredPoint(null);
    }
    // Reset all hover targets on leave ONLY if physics effects are enabled
    if (interaction.physicsHoverEffects) {
        let resetOccurred = false;
        setElementAnimationTargets(prev => {
            const next = new Map(prev);
            for (const key of next.keys()) {
                const current = next.get(key);
                if (current?.targetScale !== 1 || current?.targetOpacity !== 1) {
                    next.set(key, { ...current, targetScale: 1, targetOpacity: 1 });
                    resetOccurred = true; // Mark that at least one reset happened
                }
            }
            return next;
        });
        if (resetOccurred) {
            console.log('[Chart Interaction] Reset ALL HOVER targets on leave');
        }
    }
  };
  
  // Handle enhanced chart export
  const handleExportChart = useCallback(() => {
    if (!chartRef.current && chartType !== 'kpi') return;

    const chart = chartRef.current;
    
    // For KPI display, use a different export method
    if (chartType === 'kpi' && containerRef.current) {
      // Use html2canvas or another library to capture the KPI display
      try {
        // Simplified export - in a real implementation we'd use something like html2canvas
        const link = document.createElement('a');
        link.download = `${exportOptions.filename || 'kpi'}.png`;
        link.href = '#';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (e) {
        console.error('Failed to export KPI', e);
        return;
      }
    }
    
    // Create a temporary canvas for the export
    const exportCanvas = document.createElement('canvas');
    const exportContext = exportCanvas.getContext('2d');
    
    if (!exportContext || !chart) return;
    
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
  }, [chartRef, containerRef, chartType, title, subtitle, exportOptions, kpi]);
  
  // Combined ref callback for ChartJS instance
  const chartRefCallback = useCallback((instance: ChartJS | null) => {
    chartRef.current = instance;
    // Call the forwarded ref if it exists
    if (typeof ref === 'function') {
      ref(instance as unknown as GlassDataChartRef); // May need type assertion
    } else if (ref) {
      ref.current = instance as unknown as GlassDataChartRef; // May need type assertion
    }
  }, [ref]);
  
  // Memoize chart options
  const chartOptions = useMemo(() => {
    // ... (options calculation logic)
    
    return {
      // ... calculated options
      plugins: { 
        legend: { display: false }, // Disable built-in legend
        tooltip: { enabled: false }, // Disable built-in tooltip
        zoom: { 
          // Configuration for chartjs-plugin-zoom (if used, ensure it's registered)
          // This seems redundant now with useChartPhysicsInteraction
          // pan: { enabled: false }, // Disable default pan
          // zoom: { wheel: { enabled: false }, pinch: { enabled: false }, mode: 'xy' } // Disable default zoom
        },
        // Configure our custom interaction plugin
        [GalileoElementInteractionPlugin.id]: { 
          elementAnimationTargets,
          setElementAnimationTargets,
          getElementPhysicsOptions,
          isReducedMotion,
        }
      }
    }
  }, [datasets, chartType, axis, legend, isReducedMotion, elementAnimationTargets, getElementPhysicsOptions]); // Dependencies

  // Plugins to pass to the Chart component
  // Ensure all used plugins are registered above
  const chartPlugins: Plugin<ChartType>[] = useMemo(() => [
    pathAnimationPlugin,
    GalileoElementInteractionPlugin,
    // Add other custom plugins if needed
  ], []); 

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
      $blurStrength={adaptedBlurStrength}
      $color={color}
      $elevation={elevation}
      $borderRadius={borderRadius}
      $borderColor={borderColor}
    >
      {svgFilters}
      <ChartHeader>
        {title && <ChartTitle>{title}</ChartTitle>}
        {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
      </ChartHeader>
      <ChartWrapper ref={chartWrapperRef}> 
        {interaction.zoomPanEnabled && (
          <ZoomControls 
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={resetZoom}
            zoomLevel={zoomLevel}
            $variant={glassVariant}
          />
        )}
        <Chart
          key={chartType} // Ensures re-render on type change
          type={getChartJsType()}
          data={chartData}
          options={chartOptions}
          plugins={chartPlugins} // Pass the memoized plugins array
          ref={chartRefCallback} // Use the combined ref callback
          onClick={handleDataPointClick}
          onMouseMove={handleChartHover} 
          onMouseLeave={handleChartLeave}
        />
      </ChartWrapper>
      
      {/* Legend - Top position */}
      {legend.show && legend.position === 'top' && (
        <ChartLegend 
          $position={legend.position} 
          $style={legend.style || 'default'} 
          $glassEffect={legend.glassEffect || false}
        >
          {datasets.map((dataset, index) => {
            // Convert hex color to RGB for rgba usage - with safe defaults
            const hexToRgb = (hex: string) => {
              // Provide a default color if hex is undefined
              const safeHex = hex || '#FFFFFF';
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(safeHex);
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
                <LegendColor $color={color || '#FFFFFF'} $active={isActive} />
                <LegendLabel $active={isActive}>{dataset.label}</LegendLabel>
              </LegendItem>
            );
          })}
        </ChartLegend>
      )}
      
      {/* Legend - Bottom position */}
      {legend.show && legend.position === 'bottom' && (
        <ChartLegend 
          $position={legend.position} 
          $style={legend.style || 'default'} 
          $glassEffect={legend.glassEffect || false}
        >
          {datasets.map((dataset, index) => {
            // Convert hex color to RGB for rgba usage - with safe defaults
            const hexToRgb = (hex: string) => {
              // Provide a default color if hex is undefined
              const safeHex = hex || '#FFFFFF';
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(safeHex);
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
                <LegendColor $color={color || '#FFFFFF'} $active={isActive} />
                <LegendLabel $active={isActive}>{dataset.label}</LegendLabel>
              </LegendItem>
            );
          })}
        </ChartLegend>
      )}
      
      {/* Custom SVG Tooltip (replacing the component tooltip) */}
      {interaction.tooltipStyle === 'dynamic' ? (
        hoveredPoint && interaction.showTooltips && (
          <DynamicTooltip
            $color={color}
            $quality={activeQuality}
            style={{ left: `${hoveredPoint.x ?? 0}px`, top: `${hoveredPoint.y ?? 0}px` }}
          >
            <TooltipHeader $color={hoveredPoint.value?.color || '#FFFFFF'}>
              {hoveredPoint.value?.dataset || 'Data'}
            </TooltipHeader>
            
            <TooltipRow>
              <TooltipLabel>{typeof hoveredPoint.value?.label === 'string' 
                ? hoveredPoint.value.label 
                : 'Value'}: </TooltipLabel>
              <TooltipValue $highlighted>{formatValue(
                hoveredPoint.value?.value ?? 0,
                hoveredPoint.value?.formatType || 'number',
                hoveredPoint.value?.formatOptions || {}
              )}</TooltipValue>
            </TooltipRow>
            
            {hoveredPoint.value?.extra && Object.entries(hoveredPoint.value.extra).map(([key, value]) => (
              <TooltipRow key={key}>
                <TooltipLabel>{key}:</TooltipLabel>
                <TooltipValue>{String(value)}</TooltipValue>
              </TooltipRow>
            ))}
          </DynamicTooltip>
        )
      ) : (
        hoveredPoint && interaction.showTooltips && (
          <GlassTooltip
            title={
              <GlassTooltipContent
                title={String(hoveredPoint.value.dataset ?? 'Dataset')}
                titleColor={hoveredPoint.value.color}
                items={[
                  { 
                    label: typeof hoveredPoint.value.label === 'string' 
                      ? hoveredPoint.value.label 
                      : 'Value', 
                    value: hoveredPoint.value.value ?? 'N/A'
                  },
                  ...(hoveredPoint.value.extra 
                    ? Object.entries(hoveredPoint.value.extra).map(([key, value]) => ({
                        label: key,
                        value: (typeof value === 'string' || typeof value === 'number')
                          ? value 
                          : String(value) as (string | number)
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
});

// Add displayName for better debugging
GlassDataChart.displayName = 'GlassDataChart';

// ESLint disable for TypeScript forwardRef type issues in some configurations
// @ts-ignore - ForwardRef render functions are difficult to type correctly with generics in all TypeScript versions.
export default GlassDataChart;