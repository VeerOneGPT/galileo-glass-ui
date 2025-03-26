/**
 * LineChart Component
 *
 * A stylish line chart component with glass morphism styling
 */
import React, { useRef, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';
import { useOptimizedAnimation, useGlassTheme, useReducedMotion } from '../../hooks';
import { AnimationComplexity } from '../../hooks/useOptimizedAnimation';

import { SafeChartRenderer } from './SafeChartRenderer';
import { LineChartProps, SeriesDataPoint, ChartSeries } from './types';

/**
 * Styled components for LineChart
 */
const ChartContainer = styled.div<{
  width?: string | number;
  height?: string | number;
  glass?: boolean;
}>`
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || '100%')};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || '300px')};
  position: relative;

  ${({ glass }) =>
    glass
      ? `
    background-color: rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  `
      : ''}
`;

const ChartInner = styled.div`
  width: 100%;
  height: 100%;
  padding: 24px;
  position: relative;
`;

const ChartTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.9);
`;

const ChartDescription = styled.div`
  font-size: 14px;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.6);
`;

const AxisContainer = styled.div`
  position: absolute;
  left: 48px;
  right: 24px;
  bottom: 48px;
  top: 24px;
`;

const XAxis = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: -40px;
  height: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const YAxis = styled.div`
  position: absolute;
  left: -48px;
  bottom: 0;
  top: 0;
  width: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding-right: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const YAxisLabel = styled.div`
  transform: rotate(-90deg);
  transform-origin: center;
  position: absolute;
  top: 50%;
  left: -24px;
  font-size: 12px;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.7);
`;

const XAxisLabel = styled.div`
  position: absolute;
  bottom: -36px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.7);
`;

const GridLines = styled.div<{ horizontal?: boolean; count: number; glass?: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  ${({ horizontal, count, glass }) => {
    if (horizontal) {
      let styles = '';
      for (let i = 0; i <= count; i++) {
        const position = `${i * (100 / count)}%`;
        styles += `
          &::before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: ${position};
            height: 1px;
            background-color: ${glass ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
          }
        `;
      }
      return styles;
    }

    let styles = '';
    for (let i = 0; i <= count; i++) {
      const position = `${i * (100 / count)}%`;
      styles += `
        &::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: ${position};
          width: 1px;
          background-color: ${glass ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        }
      `;
    }
    return styles;
  }}
`;

const LineSeriesContainer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

interface LinePath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  glassEffect: boolean;
  simplified: boolean;
  curve: 'linear' | 'smooth' | 'stepBefore' | 'stepAfter';
}

// SVG Container for smooth animation
const SVGContainer = styled.svg`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
`;

interface PathProps {
  d: string;
  stroke: string;
  strokeWidth: number;
  glassEffect: boolean;
  simplified: boolean;
}

const Path = styled.path<PathProps>`
  fill: none;
  stroke: ${props => props.stroke};
  stroke-width: ${props => props.strokeWidth}px;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: d 0.5s ease-out;

  ${props =>
    props.glassEffect && !props.simplified
      ? `
    filter: drop-shadow(0 0 6px ${props.stroke}40);
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: dash 1.5s ease-out forwards;
    
    @keyframes dash {
      to {
        stroke-dashoffset: 0;
      }
    }
  `
      : ''}
`;

interface DataPointProps {
  cx: number;
  cy: number;
  r: number;
  color: string;
  glassEffect: boolean;
  simplified: boolean;
  index: number;
  total: number;
  delay: number;
}

const DataPointCircle = styled.circle<DataPointProps>`
  fill: ${props => (props.glassEffect ? 'rgba(255, 255, 255, 0.8)' : props.color)};
  stroke: ${props => props.color};
  stroke-width: 2px;
  transition: r 0.2s ease-out;

  ${props =>
    props.glassEffect && !props.simplified
      ? `
    filter: drop-shadow(0 0 4px ${props.color}40);
  `
      : ''}

  ${props =>
    props.glassEffect && !props.simplified
      ? `
    animation: pointAppear 0.3s ease-out ${props.delay}s forwards;
    opacity: 0;
    transform-origin: center;
    transform-box: fill-box;
    
    @keyframes pointAppear {
      0% {
        opacity: 0;
        transform: scale(0);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `
      : 'opacity: 1;'}
  
  &:hover {
    r: ${props => props.r * 1.5}px;
    cursor: pointer;
  }
`;

const Legend = styled.div<{ position: 'top' | 'right' | 'bottom' | 'left' }>`
  display: flex;
  flex-direction: ${({ position }) =>
    position === 'top' || position === 'bottom' ? 'row' : 'column'};
  flex-wrap: ${({ position }) => (position === 'top' || position === 'bottom' ? 'wrap' : 'nowrap')};
  gap: 16px;
  position: absolute;
  ${({ position }) => {
    switch (position) {
      case 'top':
        return 'top: 0; left: 0; right: 0;';
      case 'right':
        return 'top: 0; bottom: 0; right: 0;';
      case 'bottom':
        return 'bottom: 0; left: 0; right: 0;';
      case 'left':
        return 'top: 0; bottom: 0; left: 0;';
    }
  }}
  padding: 8px;
`;

const LegendItem = styled.div<{ color: string; interactive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  ${({ interactive }) => (interactive ? 'cursor: pointer;' : '')}

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${({ color }) => color};
`;

// Tooltip component
const Tooltip = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -100%);
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  font-size: 12px;
  color: white;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
`;

interface TooltipData {
  x: number;
  y: number;
  label: string;
  value: number;
  seriesName: string;
  color: string;
}

/**
 * Convert hex color to RGB for styling
 */
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  if (hex.length === 3) {
    // If short hex (e.g. #ABC), convert to full hex (e.g. #AABBCC)
    hex = hex
      .split('')
      .map(char => char + char)
      .join('');
  }

  // Parse the full hex
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

/**
 * Format a number with k/m/b suffixes
 */
function formatNumber(value: number): string {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
}

/**
 * Calculate the grid tick values
 */
function calculateTicks(min: number, max: number, count: number): number[] {
  const range = max - min;
  const step = range / count;
  const ticks: number[] = [];

  for (let i = 0; i <= count; i++) {
    ticks.push(min + step * i);
  }

  return ticks;
}

/**
 * Process data series for the chart
 */
function processChartData(data: SeriesDataPoint[] | ChartSeries[]): {
  processed: ChartSeries[];
  maxValue: number;
  minValue: number;
  isSeriesData: boolean;
} {
  // Check if the data is already in series format
  const isSeriesData = data.length > 0 && 'data' in data[0];

  let processed: ChartSeries[];

  if (isSeriesData) {
    // Data is already in series format
    processed = data as ChartSeries[];
  } else {
    // Convert simple data to series format
    processed = [
      {
        id: 'default',
        name: 'Default',
        data: data as SeriesDataPoint[],
      },
    ];
  }

  // Calculate the minimum and maximum values
  let minValue = Number.MAX_VALUE;
  let maxValue = Number.MIN_VALUE;

  processed.forEach(series => {
    series.data.forEach(point => {
      if (point.value < minValue) {
        minValue = point.value;
      }
      if (point.value > maxValue) {
        maxValue = point.value;
      }
    });
  });

  // If min is greater than 0 and includeZero is true, set min to 0
  if (minValue > 0) {
    minValue = 0;
  }

  return { processed, maxValue, minValue, isSeriesData };
}

/**
 * Get path data for different curve types
 */
function getPathData(
  points: { x: number; y: number }[],
  curve: 'linear' | 'smooth' | 'stepBefore' | 'stepAfter'
): string {
  if (points.length === 0) return '';

  let pathData = `M ${points[0].x} ${points[0].y}`;

  switch (curve) {
    case 'smooth':
      // Cubic bezier curve
      for (let i = 0; i < points.length - 1; i++) {
        const x1 = points[i].x;
        const y1 = points[i].y;
        const x2 = points[i + 1].x;
        const y2 = points[i + 1].y;

        const cpx1 = x1 + (x2 - x1) / 3;
        const cpy1 = y1;
        const cpx2 = x1 + (2 * (x2 - x1)) / 3;
        const cpy2 = y2;

        pathData += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x2} ${y2}`;
      }
      break;

    case 'stepBefore':
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i - 1].x} ${points[i].y} L ${points[i].x} ${points[i].y}`;
      }
      break;

    case 'stepAfter':
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i - 1].y} L ${points[i].x} ${points[i].y}`;
      }
      break;

    case 'linear':
    default:
      // Linear segments
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
      }
  }

  return pathData;
}

/**
 * LineChart Component
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = '100%',
  height = 300,
  curve = 'smooth',
  glass = true,
  blurIntensity = 'medium',
  loading = false,
  isEmpty = false,
  title,
  description,
  xAxis = { show: true },
  yAxis = { show: true },
  legend = { show: true, position: 'top', interactive: true },
  tooltip = { show: true, mode: 'single' },
  animation = { enabled: true, duration: 500 },
  colors = [
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#F43F5E',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#F97316',
    '#6B7280',
    '#D946EF',
  ],
  margin = { top: 20, right: 20, bottom: 40, left: 50 },
  adaptToCapabilities = true,
  simplified = false,
  animationDisabled = false,
  altText,
  ariaLabel,
  lineWidth = 2,
  showPoints = true,
  pointSize = 4,
  connectNulls = false,
  gradient = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onError,
  className,
  style,
}) => {
  // Access theme context
  const { isDarkMode } = useGlassTheme();

  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Ref for the chart container
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // State for visibility of series
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({});

  // State for tooltip
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  // Process chart data
  const {
    processed: chartData,
    maxValue,
    minValue,
    isSeriesData,
  } = useMemo(() => processChartData(data), [data]);

  // Update visible series when data changes
  useEffect(() => {
    const newVisibility: Record<string, boolean> = {};
    chartData.forEach(series => {
      newVisibility[series.id] = series.visible !== false;
    });
    setVisibleSeries(newVisibility);
  }, [chartData]);

  // Filter to only visible series
  const visibleChartData = useMemo(() => {
    return chartData.filter(series => visibleSeries[series.id] !== false);
  }, [chartData, visibleSeries]);

  // Calculate Y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = yAxis?.tickCount || 5;
    const min = yAxis?.min !== undefined ? yAxis.min : minValue;
    const max = yAxis?.max !== undefined ? yAxis.max : maxValue * 1.1; // Add 10% padding

    return calculateTicks(min, max, tickCount);
  }, [maxValue, minValue, yAxis]);

  // Calculate X-axis labels
  const xLabels = useMemo(() => {
    if (!chartData.length || !chartData[0].data.length) return [];

    return chartData[0].data.map(
      point => point.label || (point.x !== undefined ? point.x.toString() : '')
    );
  }, [chartData]);

  // Convert data points to coordinates
  const seriesCoordinates = useMemo(() => {
    if (!containerRef.current) return [];

    const chartWidth = containerRef.current.clientWidth - (margin.left || 0) - (margin.right || 0);
    const chartHeight =
      containerRef.current.clientHeight - (margin.top || 0) - (margin.bottom || 0);

    // Min and max values for Y-axis
    const yMin = yAxis?.min !== undefined ? yAxis.min : minValue;
    const yMax = yAxis?.max !== undefined ? yAxis.max : maxValue * 1.1;
    const yRange = yMax - yMin;

    return visibleChartData.map((series, seriesIndex) => {
      const points = series.data.map((point, pointIndex) => {
        // Convert x value to position
        const xPos = (pointIndex / (series.data.length - 1)) * chartWidth;

        // Convert y value to position (inverted, as SVG coordinates go from top to bottom)
        const yPos = chartHeight - ((point.value - yMin) / yRange) * chartHeight;

        return {
          x: xPos,
          y: yPos,
          value: point.value,
          label: point.label || (point.x !== undefined ? point.x.toString() : ''),
          seriesName: series.name,
          color: point.color || series.color || colors[seriesIndex % colors.length],
        };
      });

      return {
        id: series.id,
        name: series.name,
        color: series.color || colors[seriesIndex % colors.length],
        points,
      };
    });
  }, [visibleChartData, containerRef.current, margin, minValue, maxValue, yAxis, colors]);

  // Determine if animations should be enabled
  const shouldAnimate = useMemo(() => {
    return animation?.enabled && !prefersReducedMotion && !animationDisabled;
  }, [animation?.enabled, prefersReducedMotion, animationDisabled]);

  // Get animation duration
  const animationDuration = useMemo(() => {
    return shouldAnimate ? animation?.duration || 500 : 0;
  }, [shouldAnimate, animation?.duration]);

  // Handle legend item click
  const handleLegendClick = (seriesId: string) => {
    if (!legend.interactive) return;

    setVisibleSeries(prev => ({
      ...prev,
      [seriesId]: !prev[seriesId],
    }));
  };

  // Handle point hover
  const handlePointHover = (
    event: React.MouseEvent,
    point: {
      x: number;
      y: number;
      value: number;
      label: string;
      seriesName: string;
      color: string;
    }
  ) => {
    if (!tooltip.show) return;

    const rect = (event.target as SVGElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setTooltipData({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
        label: point.label,
        value: point.value,
        seriesName: point.seriesName,
        color: point.color,
      });
    }

    if (onMouseEnter) {
      onMouseEnter(event, {
        value: point.value,
        label: point.label,
        seriesName: point.seriesName,
      });
    }
  };

  // Handle mouse leave
  const handleMouseLeave = (event: React.MouseEvent) => {
    setTooltipData(null);

    if (onMouseLeave) {
      onMouseLeave(event);
    }
  };

  // Handle point click
  const handlePointClick = (
    event: React.MouseEvent,
    point: {
      x: number;
      y: number;
      value: number;
      label: string;
      seriesName: string;
      color: string;
    }
  ) => {
    if (onClick) {
      onClick(event, {
        value: point.value,
        label: point.label,
        seriesName: point.seriesName,
      });
    }
  };

  // Determine blur intensity
  const getBlurValue = () => {
    if (simplified) return '4px';

    switch (blurIntensity) {
      case 'light':
        return '4px';
      case 'strong':
        return '12px';
      default:
        return '8px';
    }
  };

  // Apply glass styles conditionally
  const glassStyles = useMemo(() => {
    if (!glass || simplified) return {};

    return {
      backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: `blur(${getBlurValue()})`,
      WebkitBackdropFilter: `blur(${getBlurValue()})`,
      border: isDarkMode
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
    };
  }, [glass, simplified, isDarkMode, blurIntensity]);

  // Render the LineChart component
  return (
    <SafeChartRenderer
      loading={loading}
      isEmpty={isEmpty}
      glassEffect={glass && !simplified}
      adaptToCapabilities={adaptToCapabilities}
      minWidth={typeof width === 'number' ? width : undefined}
      minHeight={typeof height === 'number' ? height : undefined}
      backgroundColor={isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.1)'}
      altText={altText || `Line chart${title ? ` showing ${title}` : ''}`}
      onError={onError}
    >
      <ChartContainer
        ref={containerRef}
        width={width}
        height={height}
        glass={false}
        className={className}
        style={{
          ...style,
          ...glassStyles,
        }}
        aria-label={ariaLabel || altText || `Line chart${title ? ` showing ${title}` : ''}`}
        role="img"
      >
        <ChartInner>
          {title && <ChartTitle>{title}</ChartTitle>}
          {description && <ChartDescription>{description}</ChartDescription>}

          <AxisContainer>
            {/* Grid lines */}
            {yAxis?.grid !== false && (
              <GridLines horizontal count={yAxis?.tickCount || 5} glass={glass && !simplified} />
            )}

            {xAxis?.grid !== false && xLabels.length > 0 && (
              <GridLines
                horizontal={false}
                count={xLabels.length - 1}
                glass={glass && !simplified}
              />
            )}

            {/* Lines container */}
            <LineSeriesContainer>
              <SVGContainer ref={svgRef}>
                {/* Draw paths for each series */}
                {seriesCoordinates.map(series => (
                  <Path
                    key={series.id}
                    d={getPathData(series.points, curve)}
                    stroke={series.color}
                    strokeWidth={lineWidth}
                    glassEffect={glass}
                    simplified={simplified}
                  />
                ))}

                {/* Draw points for each series */}
                {showPoints &&
                  seriesCoordinates.map(series =>
                    series.points.map((point, index) => (
                      <DataPointCircle
                        key={`${series.id}-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={pointSize}
                        color={point.color}
                        glassEffect={glass}
                        simplified={simplified}
                        index={index}
                        total={series.points.length}
                        delay={(index / series.points.length) * (shouldAnimate ? 0.5 : 0)}
                        onMouseEnter={e => handlePointHover(e, point)}
                        onMouseLeave={handleMouseLeave}
                        onClick={e => handlePointClick(e, point)}
                      />
                    ))
                  )}
              </SVGContainer>
            </LineSeriesContainer>

            {/* Y-Axis */}
            {yAxis?.show !== false && (
              <YAxis>
                {yTicks.map((tick, index) => (
                  <div key={index}>
                    {yAxis.tickFormat ? yAxis.tickFormat(tick) : formatNumber(tick)}
                  </div>
                ))}
                {yAxis.title && <YAxisLabel>{yAxis.title}</YAxisLabel>}
              </YAxis>
            )}

            {/* X-Axis */}
            {xAxis?.show !== false && (
              <XAxis>
                {xLabels.map((label, index) => (
                  <div key={index}>{xAxis.tickFormat ? xAxis.tickFormat(label) : label}</div>
                ))}
                {xAxis.title && <XAxisLabel>{xAxis.title}</XAxisLabel>}
              </XAxis>
            )}

            {/* Legend */}
            {legend?.show !== false && visibleChartData.length > 1 && (
              <Legend position={legend.position || 'top'}>
                {visibleChartData.map(series => (
                  <LegendItem
                    key={series.id}
                    color={
                      series.color ||
                      colors[chartData.findIndex(s => s.id === series.id) % colors.length]
                    }
                    interactive={legend.interactive}
                    onClick={() => handleLegendClick(series.id)}
                  >
                    <LegendColor
                      color={
                        series.color ||
                        colors[chartData.findIndex(s => s.id === series.id) % colors.length]
                      }
                    />
                    <span>{series.name}</span>
                  </LegendItem>
                ))}
              </Legend>
            )}

            {/* Tooltip */}
            {tooltipData && tooltip.show && (
              <Tooltip x={tooltipData.x} y={tooltipData.y}>
                <div style={{ color: tooltipData.color, fontWeight: 'bold' }}>
                  {tooltipData.seriesName}
                </div>
                <div>
                  {tooltipData.label}: {formatNumber(tooltipData.value)}
                </div>
              </Tooltip>
            )}
          </AxisContainer>
        </ChartInner>
      </ChartContainer>
    </SafeChartRenderer>
  );
};
