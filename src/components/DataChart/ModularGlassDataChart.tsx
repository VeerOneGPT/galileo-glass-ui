/**
 * ModularGlassDataChart Component
 * 
 * A modular implementation of the GlassDataChart component that uses separate
 * components for chart rendering, tooltips, filters, and KPI display.
 */
import React, { useState, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import {
  ChartContainer,
  ChartHeader,
  ChartTitle,
  ChartSubtitle
} from './styles/ChartContainerStyles';

import {
  ChartToolbar,
  ChartTypeSelector,
  TypeButton,
  ToolbarButton,
  EnhancedExportButton,
  ChartLegend,
  LegendItem,
  LegendColor,
  LegendLabel
} from './styles/ChartElementStyles';

// Import all types
import { 
  ChartVariant, 
  DataPoint, 
  ChartDataset 
} from './types/ChartTypes';

import {
  GlassDataChartProps,
  GlassDataChartRef
} from './types/ChartProps';

// Import hooks
import { 
  useQualityTier, 
  QualityTier, 
  PhysicsParams,
  getQualityBasedPhysicsParams,
  getQualityBasedGlassParams
} from './hooks/useQualityTier';

import { usePhysicsAnimation } from './hooks/usePhysicsAnimation';
import { useAccessibilitySettings } from '../../hooks/useAccessibilitySettings';
import { useGlassTheme } from '../../hooks/useGlassTheme';
import { createThemeContext } from '../../core/themeContext';

// Import modular components
import {
  KpiChart,
  ChartTooltip,
  ChartFilters,
  ChartRenderer,
  AtmosphericEffects,
  TooltipData
} from './components';

// Import utilities
import { 
  calculateDamping,
  createAnimationOptions,
  pathAnimationPlugin
} from './utils/ChartAnimationUtils';

// Import and register required Chart.js components
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip as ChartJsTooltip,
  Legend as ChartJsLegend,
  Filler,
  RadialLinearScale
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartJsTooltip,
  ChartJsLegend,
  Filler,
  RadialLinearScale
);

/**
 * ModularGlassDataChart Component
 * 
 * An advanced glass-styled chart component with physics-based interactions,
 * smooth animations, and rich customization options.
 */
export const ModularGlassDataChart = React.forwardRef<GlassDataChartRef, GlassDataChartProps>((props, ref) => {
  // Theme & accessibility hooks
  const theme = useGlassTheme();
  const isDarkMode = theme ? theme.isDarkMode : false;
  const { isReducedMotion } = useAccessibilitySettings();
  const themeContext = theme ? createThemeContext(theme) : undefined;
  const qualityTier = useQualityTier();
  
  // Extract all props with defaults
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
    kpi,
    useAdaptiveQuality = true,
  } = props;
  
  // State
  const [chartType, setChartType] = useState<ChartVariant>(variant);
  const [hoveredPoint, setHoveredPoint] = useState<TooltipData | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    initialSelection !== undefined 
      ? Array.isArray(initialSelection) 
        ? initialSelection 
        : [initialSelection] 
      : []
  );
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  
  // Determine the active quality tier
  const activeQuality = useAdaptiveQuality ? qualityTier : 'high';
  
  // Get physics and glass parameters based on quality tier
  const qualityPhysicsParams = getQualityBasedPhysicsParams(activeQuality);
  const qualityGlassParams = getQualityBasedGlassParams(activeQuality);
  
  // Determine if we're using physics-based animations
  const enablePhysicsAnimation = animation.physicsEnabled && !isReducedMotion;
  
  // Use physics animation hook
  const {
    value: springValue,
    applyPopIn
  } = usePhysicsAnimation({
    type: isReducedMotion ? 'none' : (animation.physicsEnabled ? 'spring' : 'none'),
    stiffness: qualityPhysicsParams.stiffness,
    damping: calculateDamping(qualityPhysicsParams.dampingRatio, qualityPhysicsParams.stiffness, qualityPhysicsParams.mass),
    mass: qualityPhysicsParams.mass,
    precision: qualityPhysicsParams.precision,
    respectReducedMotion: true
  });
  
  // Apply initial animations based on quality tier
  useEffect(() => {
    if (enablePhysicsAnimation) {
      // Trigger a pop-in animation on mount for better visual impact
      if (activeQuality !== 'low') {
        applyPopIn();
      }
    }
  }, [enablePhysicsAnimation, activeQuality, applyPopIn]);
  
  // Handle chart type change
  const handleTypeChange = (type: ChartVariant) => {
    setChartType(type);
    if (onTypeChange) {
      onTypeChange(type);
    }
  };
  
  // Handle data point click
  const handleDataPointClick = (datasetIndex: number, dataIndex: number) => {
    if (!onDataPointClick) return;
    
    const dataset = datasets[datasetIndex];
    const dataPoint = dataset.data[dataIndex];
    
    onDataPointClick(datasetIndex, dataIndex, dataPoint);
    
    // Handle selection logic
    if (onSelectionChange) {
      const index = dataIndex;
      const newSelectedIndices = [...selectedIndices];
      
      if (newSelectedIndices.includes(index)) {
        // Deselect
        const indexPosition = newSelectedIndices.indexOf(index);
        newSelectedIndices.splice(indexPosition, 1);
      } else {
        // Select
        newSelectedIndices.push(index);
      }
      
      setSelectedIndices(newSelectedIndices);
      onSelectionChange(newSelectedIndices);
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
  
  // Handle chart export
  const handleExport = useCallback(() => {
    if (!chartRef.current) return;
    
    // Get chart canvas
    const chart = chartRef.current;
    const canvas = chart.canvas;
    
    // Create a temporary canvas to include title if needed
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    // Set temp canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Add extra space for title if needed
    const extraHeight = exportOptions.includeTitle && title ? 40 : 0;
    
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight + extraHeight;
    
    // Fill background
    ctx.fillStyle = exportOptions.backgroundColor || 'transparent';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Add title if needed
    if (exportOptions.includeTitle && title) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, tempCanvas.width / 2, 25);
      
      if (subtitle) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(subtitle, tempCanvas.width / 2, 45);
      }
    }
    
    // Draw chart onto temp canvas
    ctx.drawImage(canvas, 0, extraHeight);
    
    // Generate filename
    let filename = exportOptions.filename || 'chart';
    
    // Add timestamp if requested
    if (exportOptions.includeTimestamp) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
      filename = `${filename}_${timestamp}`;
    }
    
    // Convert to data URL and download
    const dataUrl = tempCanvas.toDataURL(`image/${exportOptions.format || 'png'}`, exportOptions.quality);
    
    const link = document.createElement('a');
    link.download = `${filename}.${exportOptions.format || 'png'}`;
    link.href = dataUrl;
    link.click();
  }, [chartRef, title, subtitle, exportOptions]);
  
  // Expose chart methods via ref
  useImperativeHandle(ref, () => ({
    getChartInstance: () => chartRef.current,
    exportChart: handleExport,
    updateChart: () => {
      if (chartRef.current) {
        chartRef.current.update();
      }
    },
    getContainerElement: () => containerRef.current,
    switchChartType: (type: ChartVariant) => {
      handleTypeChange(type);
    }
  }), [chartRef, handleExport]);
  
  // Prepare axis options, adjusting color for clear variant
  const effectiveAxisOptions = {
    ...axis,
    // Use a more visible grid color for the clear variant
    gridColor: glassVariant === 'clear' 
      ? 'rgba(0, 0, 0, 0.15)' // Darker, semi-transparent
      : axis.gridColor || 'rgba(255, 255, 255, 0.1)', // Original default
  };
  
  // Special case for KPI chart type
  if (chartType === 'kpi' && kpi) {
    return (
      <ChartContainer
        className={className}
        style={{
          ...style,
          width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
        $glassVariant={glassVariant}
        $blurStrength={blurStrength}
        $color={color}
        $borderRadius={typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius}
        $borderColor={borderColor}
        $elevation={elevation}
        ref={containerRef}
      >
        {/* Chart title */}
        {(title || subtitle) && (
          <ChartHeader>
            {title && <ChartTitle>{title}</ChartTitle>}
            {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
          </ChartHeader>
        )}
        
        {/* KPI display */}
        <KpiChart
          kpi={kpi}
          animation={{
            enabled: enablePhysicsAnimation,
            stiffness: qualityPhysicsParams.stiffness,
            dampingRatio: qualityPhysicsParams.dampingRatio,
            mass: qualityPhysicsParams.mass
          }}
          qualityTier={activeQuality}
          color={color}
          isReducedMotion={isReducedMotion}
        />
        
        {/* Atmospheric effects */}
        <AtmosphericEffects
          qualityTier={activeQuality}
          color={color}
          isReducedMotion={isReducedMotion}
        />
      </ChartContainer>
    );
  }
  
  // Render standard chart
  return (
    <ChartContainer
      className={className}
      style={{
        ...style,
        width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      $glassVariant={glassVariant}
      $blurStrength={blurStrength}
      $color={color}
      $borderRadius={typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius}
      $borderColor={borderColor}
      $elevation={elevation}
      ref={containerRef}
    >
      {/* SVG Filters */}
      <ChartFilters
        palette={palette}
        qualityTier={activeQuality}
      />
      
      {/* Atmospheric effects - Conditionally render */}
      {glassVariant !== 'clear' && (
        <AtmosphericEffects
          qualityTier={activeQuality}
          color={color}
          isReducedMotion={isReducedMotion}
        />
      )}
      
      {/* Chart header */}
      {(title || subtitle) && (
        <ChartHeader>
          {title && <ChartTitle>{title}</ChartTitle>}
          {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
        </ChartHeader>
      )}
      
      {/* Chart toolbar */}
      {showToolbar && (
        <ChartToolbar>
          {/* Type selector */}
          {allowTypeSwitch && (
            <ChartTypeSelector>
              <TypeButton
                type="button"
                $active={chartType === 'line'}
                onClick={() => handleTypeChange('line')}
              >
                Line
              </TypeButton>
              <TypeButton
                type="button"
                $active={chartType === 'bar'}
                onClick={() => handleTypeChange('bar')}
              >
                Bar
              </TypeButton>
              <TypeButton
                type="button"
                $active={chartType === 'area'}
                onClick={() => handleTypeChange('area')}
              >
                Area
              </TypeButton>
              <TypeButton
                type="button"
                $active={chartType === 'pie'}
                onClick={() => handleTypeChange('pie')}
              >
                Pie
              </TypeButton>
            </ChartTypeSelector>
          )}
          
          {/* Download button */}
          {allowDownload && (
            renderExportButton ? (
              renderExportButton(handleExport)
            ) : (
              <EnhancedExportButton onClick={handleExport}>
                Export
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
            const color = dataset.style?.lineColor || palette[index % palette.length];
            const isActive = selectedIndices.includes(index);
            return (
              <LegendItem 
                key={dataset.id || index}
                $color={color}
                $style={legend.style || 'default'}
                $active={isActive}
              >
                <LegendColor 
                  $color={color} 
                  $active={isActive} 
                />
                <LegendLabel $active={isActive}>
                  {dataset.label}
                </LegendLabel>
              </LegendItem>
            );
          })}
        </ChartLegend>
      )}
      
      {/* Main Chart */}
      <ChartRenderer
        chartType={chartType}
        datasets={datasets}
        palette={palette}
        qualityTier={activeQuality}
        animation={animation}
        interaction={interaction}
        axis={effectiveAxisOptions}
        isReducedMotion={isReducedMotion}
        springValue={springValue}
        enablePhysicsAnimation={enablePhysicsAnimation}
        onDataPointClick={handleDataPointClick}
        onChartHover={handleChartHover}
        onChartLeave={handleChartLeave}
        chartRefCallback={(chart) => chartRef.current = chart}
        glassVariant={glassVariant}
      />
      
      {/* Legend - Bottom position */}
      {legend.show && legend.position === 'bottom' && (
        <ChartLegend 
          $position={legend.position} 
          $style={legend.style || 'default'} 
          $glassEffect={legend.glassEffect || false}
        >
          {datasets.map((dataset, index) => {
            const color = dataset.style?.lineColor || palette[index % palette.length];
            const isActive = selectedIndices.includes(index);
            return (
              <LegendItem 
                key={dataset.id || index}
                $color={color}
                $style={legend.style || 'default'}
                $active={isActive}
              >
                <LegendColor 
                  $color={color} 
                  $active={isActive} 
                />
                <LegendLabel $active={isActive}>
                  {dataset.label}
                </LegendLabel>
              </LegendItem>
            );
          })}
        </ChartLegend>
      )}
      
      {/* Tooltip */}
      <ChartTooltip
        tooltipData={hoveredPoint}
        datasets={datasets}
        color={color}
        qualityTier={activeQuality}
        tooltipStyle={interaction.tooltipStyle || 'frosted'}
        followCursor={interaction.tooltipFollowCursor}
      />
    </ChartContainer>
  );
});

// Add display name for debugging
ModularGlassDataChart.displayName = 'ModularGlassDataChart';

export default ModularGlassDataChart; 