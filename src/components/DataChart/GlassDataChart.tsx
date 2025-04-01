/**
 * GlassDataChart Component
 * 
 * An advanced glass-styled chart component with physics-based interactions,
 * smooth animations, and rich customization options.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ChartVariant,
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

// Adjust Chart.js defaults for better glass UI compatibility
defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
defaults.color = 'rgba(255, 255, 255, 0.7)';
defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
defaults.plugins.tooltip.enabled = false; // We'll use our custom tooltip

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
}

/**
 * GlassDataChart Component
 */
export const GlassDataChart = React.forwardRef<GlassDataChartRef, GlassDataChartProps>((props, /* ref */) => {
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
    borderRadius = 12,
    borderColor,
    elevation = 3,
    className,
    style,
    onDataPointClick,
    onSelectionChange,
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
    kpi,
    useAdaptiveQuality = true,
  } = props;
  
  // Hooks
  // const theme = useGlassTheme(); // unused
  const { isReducedMotion } = useAccessibilitySettings();
  const chartRef = useRef<ChartJS | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
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
      ? datasets[0]?.data.map(point => point.label || String(point.x))
      : undefined,
  };
  
  // Configure chart options
  const chartOptions: ChartOptions<ChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: enablePhysicsAnimation 
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
          easing: animation.easing || 'easeOutQuart',
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
      ...(enablePhysicsAnimation && (chartType === 'line' || chartType === 'area') ? {
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
      
      // Apply oscillation if physics enabled
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
  
  // Chart reference callback for getting chart instance
  const chartRefCallback = useCallback((chart: ChartJS | null) => {
    chartRef.current = chart;
  }, []);
  
  // Available chart types for switching
  const availableTypes: ChartVariant[] = ['line', 'bar', 'area'];
  
  // Add KPI type if kpi props are provided
  if (kpi) {
    availableTypes.push('kpi');
  }
  
  // Only offer pie/doughnut switching if data format is compatible
  const canShowPieChart = datasets.length === 1 && datasets[0].data.every(point => 
    typeof point.y === 'number' && point.y !== null && point.y > 0
  );
  
  if (canShowPieChart) {
    availableTypes.push('pie', 'doughnut');
  }
  
  // Enhanced implementation of custom tooltips
  const renderCustomTooltip = useCallback(() => {
    if (!hoveredPoint || !interaction.showTooltips) return null;

    // Get the data point's format type and options
    const currentDataset = datasets[hoveredPoint.datasetIndex] || datasets[0];
    const currentDataPoint = currentDataset?.data[hoveredPoint.dataIndex] || { x: '', y: null };
    
    // Determine the format type with fallbacks
    const formatType = currentDataPoint.formatType || currentDataset.formatType || 'number';
    
    // Merge format options with fallbacks
    const formatOptions = {
      ...(currentDataset.formatOptions || {}),
      ...(currentDataPoint.formatOptions || {}),
    };
    
    // Format the value based on type - with safe default
    const value = hoveredPoint.value?.value ?? 0;
    const formattedValue = formatValue(
      value,
      formatType,
      formatOptions
    );

    // Ensure position values are numbers with defaults
    const xPos = hoveredPoint.x ?? 0;
    const yPos = hoveredPoint.y ?? 0;

    // Use the new enhanced dynamic tooltip with quality tier
    return (
      <DynamicTooltip
        $color={color}
        $quality={activeQuality}
        style={{ left: `${xPos}px`, top: `${yPos - 10}px` }}
      >
        <TooltipHeader $color={hoveredPoint.value?.color || '#FFFFFF'}>
          {hoveredPoint.value?.dataset || 'Data'}
        </TooltipHeader>
        
        <TooltipRow>
          <TooltipLabel>{typeof hoveredPoint.value?.label === 'string' 
            ? hoveredPoint.value.label 
            : 'Value'}: </TooltipLabel>
          <TooltipValue $highlighted>{formattedValue}</TooltipValue>
        </TooltipRow>
        
        {hoveredPoint.value?.extra && Object.entries(hoveredPoint.value.extra).map(([key, value]) => (
          <TooltipRow key={key}>
            <TooltipLabel>{key}:</TooltipLabel>
            <TooltipValue>{String(value)}</TooltipValue>
          </TooltipRow>
        ))}
      </DynamicTooltip>
    );
  }, [hoveredPoint, interaction.showTooltips, datasets, color, activeQuality]);
  
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
      
      {/* Chart */}
      <ChartWrapper 
        style={enablePhysicsAnimation ? {
          transform: `scale(${springValue ?? 0})`, // Provide fallback if springValue is undefined
          opacity: springValue ?? 0,
          transition: `transform ${animation.duration ?? 0}ms, opacity ${animation.duration ?? 0}ms`
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
      {interaction.tooltipStyle === 'dynamic' ? renderCustomTooltip() : (
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