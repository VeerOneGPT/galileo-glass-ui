/**
 * ChartRenderer Component
 * 
 * Handles the rendering of different chart types with physics-based animations,
 * adaptive quality settings, and specialized rendering logic per chart type.
 */
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Chart as ChartJS, ChartOptions, ChartType } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { ChartWrapper } from '../styles/ChartContainerStyles';
import { ChartDataset, ChartVariant } from '../types/ChartTypes';
import { ChartAnimationOptions, ChartInteractionOptions, ChartAxisOptions } from '../types/ChartProps';
import { QualityTier } from '../hooks/useQualityTier';
import { 
  convertToChartJsDatasetWithEffects,
  pathAnimationPlugin,
  createAnimationOptions
} from '../utils';
import { PhysicsInteractionOptions } from '../../../hooks/usePhysicsInteraction';
import { useChartPhysicsInteraction, ChartPhysicsInteractionOptions } from '../hooks/useChartPhysicsInteraction';
// import { InteractionMode } from '../types'; // Commenting out as path is unclear
// import { getTooltipClassNames, createTooltip } from './tooltipUtils'; // Commenting out as path is unclear
// import { useChartZoom } from '../hooks/useChartZoom'; // Commenting out as path is unclear

export interface ChartRendererProps {
  /** Chart type/variant */
  chartType: ChartVariant;
  /** Chart datasets */
  datasets: ChartDataset[];
  /** Color palette */
  palette: string[];
  /** Current quality tier */
  qualityTier: QualityTier;
  /** Animation options */
  animation: ChartAnimationOptions;
  /** Interaction options */
  interaction: ChartInteractionOptions;
  /** Axis options */
  axis: ChartAxisOptions;
  /** Whether user prefers reduced motion */
  isReducedMotion: boolean;
  /** Animation state (from physics animation hook) */
  springValue?: number;
  /** Enable physics-based animations */
  enablePhysicsAnimation: boolean;
  /** Callback when a data point is clicked */
  onDataPointClick?: (datasetIndex: number, dataIndex: number) => void;
  /** Callback when chart is hovered */
  onChartHover?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /** Callback when mouse leaves chart */
  onChartLeave?: () => void;
  /** Ref callback for the chart */
  chartRefCallback?: (chart: any) => void;
  /** The glass variant used for the container */
  glassVariant?: 'clear' | 'frosted' | 'tinted' | 'luminous';
  /** Optional function to get physics interaction options per element */
  getElementPhysicsOptions?: (
    datasetIndex: number,
    dataIndex: number,
    chartType: ChartVariant
  ) => Partial<PhysicsInteractionOptions> | null;
  /** Optional map containing current physics state for elements (e.g., scale, offset) */
  elementPhysicsState?: Map<string, { scale?: number; xOffset?: number; yOffset?: number }>;
}

/**
 * ChartRenderer Component
 * 
 * Renders the appropriate chart type with physics-based animations
 * and quality tier adaptations.
 */
export const ChartRenderer: React.FC<ChartRendererProps> = ({
  chartType,
  datasets,
  palette,
  qualityTier,
  animation,
  interaction,
  axis,
  isReducedMotion,
  springValue,
  enablePhysicsAnimation,
  onDataPointClick,
  onChartHover,
  onChartLeave,
  chartRefCallback,
  glassVariant,
  getElementPhysicsOptions
}) => {
  // Local chart reference
  const chartRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Debug: Log ref mounting
  useEffect(() => {
    console.log('[ChartRenderer] Component mounted, wrapperRef initialized:', wrapperRef.current);
    
    return () => {
      console.log('[ChartRenderer] Component unmounting, cleaning up references');
    };
  }, []);
  
  // Prepare options for the hook
  const physicsInteractionOptions: ChartPhysicsInteractionOptions = {
    enabled: interaction.zoomPanEnabled ?? false,
    mode: interaction.zoomMode ?? 'xy',
    physics: {
      tension: interaction.physics?.tension,
      friction: interaction.physics?.friction,
      mass: interaction.physics?.mass,
    },
    minZoom: interaction.physics?.minZoom,
    maxZoom: interaction.physics?.maxZoom,
    wheelSensitivity: interaction.physics?.wheelSensitivity,
    inertiaDuration: interaction.physics?.inertiaDuration,
    respectReducedMotion: true // Assuming we always respect this here
  };

  const {
    isPanning, // We might not use these directly here, but the hook manages state
    zoomLevel,
    resetZoom // We might need to expose this or integrate with toolbar
  } = useChartPhysicsInteraction(chartRef, wrapperRef, physicsInteractionOptions);
  
  // Convert chart variant to Chart.js chart type
  const getChartJsType = (): ChartType => {
    // Handle special cases
    if (chartType === 'area') return 'line';
    if (chartType === 'kpi') return 'bar'; // Fallback, should not render
    
    // Direct mapping for other types
    return chartType as ChartType;
  };
  
  // Create grid dashes based on style
  const getGridDash = (style: string): number[] => {
    if (style === 'dashed') return [5, 5];
    if (style === 'dotted') return [2, 2];
    return [];
  };
  
  // Prepare chart data - using any to work around type limitations
  const chartData: any = {
    labels: datasets[0]?.data.map(point => point.x) || [],
    datasets: datasets.map((dataset, index) => 
      convertToChartJsDatasetWithEffects(dataset, index, chartType, palette, animation)
    )
  };
  
  // Determine text color based on glassVariant
  const textColor = glassVariant === 'clear' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)';
  
  // Configure chart options based on chart type and settings
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: enablePhysicsAnimation 
      ? {
          duration: isReducedMotion ? 0 : animation.duration,
          easing: animation.easing || 'easeOutQuart'
        }
      : { duration: 0 },
    
    // Hover interactions
    hover: {
      mode: 'nearest',
      intersect: false,
    },
    
    // Disable default tooltips (we use custom ones)
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        display: false, // We render our own legend
      },
      // Use custom path animation plugin
      ...(enablePhysicsAnimation && (chartType === 'line' || chartType === 'area') ? {
        pathAnimation: { enabled: true }
      } : {})
    },
    
    // Configure scales based on chart type
    scales: (chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'polarArea') 
      ? {
          x: {
            display: axis.showXLabels,
            grid: {
              display: axis.showXGrid,
              color: axis.gridColor,
              lineWidth: 1,
              // Use setDash in the beforeDraw callback instead of borderDash
            },
            ticks: {
              color: textColor,
              padding: 5,
              maxRotation: 45,
              minRotation: 0,
              count: axis.xTicksCount,
            },
            title: {
              display: !!axis.xTitle,
              text: axis.xTitle || '',
              color: textColor,
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
              lineWidth: 1,
              // Use setDash in the beforeDraw callback instead of borderDash
            },
            ticks: {
              color: textColor,
              padding: 8,
              count: axis.yTicksCount,
            },
            title: {
              display: !!axis.yTitle,
              text: axis.yTitle || '',
              color: textColor,
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
                color: textColor,
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
    
    // Element styling
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
        hoverOffset: 8
      }
    },
  };
  
  // Custom plugin to apply grid line styles
  const gridStylePlugin = {
    id: 'gridStylePlugin',
    beforeDraw: (chart: any) => {
      const { ctx } = chart;
      const gridDash = getGridDash(axis.gridStyle || 'solid');
      
      if (gridDash.length > 0 && chart.scales?.x?.grid && chart.scales?.y?.grid) {
        // Store original line dash
        const originalLineDash = ctx.getLineDash();
        
        // Set line dash for x-axis grid
        if (axis.showXGrid) {
          chart.scales.x.grid.options._gridLinesDash = gridDash;
          chart.scales.x.grid.options._originalGridLineWidth = chart.scales.x.grid.options.lineWidth;
        }
        
        // Set line dash for y-axis grid
        if (axis.showYGrid) {
          chart.scales.y.grid.options._gridLinesDash = gridDash;
          chart.scales.y.grid.options._originalGridLineWidth = chart.scales.y.grid.options.lineWidth;
        }
      }
    }
  };
  
  // Handle chart reference - Pass to hook as well
  const handleChartRef = useCallback((chart: any) => {
    chartRef.current = chart;
    if (chartRefCallback) {
      chartRefCallback(chart);
    }
  }, [chartRefCallback]);
  
  // Handle data point click
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current || !onDataPointClick) return;
    
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
      
      onDataPointClick(datasetIndex, dataIndex);
    }
  };

  return (
    <ChartWrapper 
      ref={wrapperRef} 
      style={enablePhysicsAnimation ? {
        transform: `scale(${springValue ?? 0})`, // Provide fallback if springValue is undefined
        opacity: springValue ?? 0,
        transition: `transform ${animation.duration ?? 0}ms, opacity ${animation.duration ?? 0}ms`
      } : undefined}
      data-testid="chart-wrapper" // Add data-testid for easier debugging/testing
    >
      <Chart
        type={getChartJsType()}
        data={chartData}
        options={chartOptions}
        ref={handleChartRef}
        onClick={onDataPointClick ? handleClick : undefined}
        plugins={[pathAnimationPlugin, gridStylePlugin]}
      />
    </ChartWrapper>
  );
};

export default ChartRenderer; 