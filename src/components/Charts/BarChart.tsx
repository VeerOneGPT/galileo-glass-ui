/**
 * BarChart Component
 *
 * A stylish bar chart component with glass morphism styling
 */
import React, { useRef, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';
import { useOptimizedAnimation, useGlassTheme, useReducedMotion } from '../../hooks';
import { AnimationComplexity } from '../../hooks/useOptimizedAnimation';

import { SafeChartRenderer } from './SafeChartRenderer';
import { BarChartProps, DataPoint, ChartSeries } from './types';

/**
 * Styled components for BarChart
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

const BarsContainer = styled.div<{ horizontal?: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: ${({ horizontal }) => (horizontal ? 'column' : 'row')};
  align-items: flex-end;
  justify-content: space-around;
`;

interface BarProps {
  height: string;
  width: string;
  color: string;
  value: number;
  index: number;
  total: number;
  maxValue: number;
  horizontal?: boolean;
  stacked?: boolean;
  grouped?: boolean;
  seriesIndex?: number;
  seriesCount?: number;
  cornerRadius?: number;
  showValues?: boolean;
  glassEffect?: boolean;
  simplified?: boolean;
  onClick?: (event: React.MouseEvent, value: number, index: number) => void;
}

const Bar = styled.div.attrs<BarProps>(props => ({
  style: {
    height: props.horizontal ? props.width : props.height,
    width: props.horizontal ? props.height : props.width,
    backgroundColor: props.glassEffect ? `rgba(${hexToRgb(props.color)}, 0.7)` : props.color,
    left: props.horizontal
      ? 0
      : props.stacked
      ? 0
      : props.grouped && props.seriesCount && props.seriesCount > 1
      ? `${(props.seriesIndex || 0) * (100 / props.seriesCount)}%`
      : 0,
    bottom: props.horizontal
      ? props.stacked && props.seriesIndex && props.seriesIndex > 0
        ? 0
        : 'auto'
      : 0,
    top: props.horizontal ? 0 : 'auto',
    borderTopLeftRadius: props.cornerRadius ? `${props.cornerRadius}px` : 0,
    borderTopRightRadius: props.cornerRadius ? `${props.cornerRadius}px` : 0,
    borderBottomLeftRadius: props.horizontal
      ? props.cornerRadius
        ? `${props.cornerRadius}px`
        : 0
      : 0,
    borderBottomRightRadius: props.horizontal
      ? props.cornerRadius
        ? `${props.cornerRadius}px`
        : 0
      : 0,
  },
}))<BarProps>`
  position: absolute;
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1), width 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  ${props =>
    props.glassEffect && !props.simplified
      ? cssWithKebabProps`
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `
      : ''}

  ${props =>
    props.onClick
      ? `
    cursor: pointer;
    
    &:hover {
      filter: brightness(1.2);
    }
    
    &:active {
      filter: brightness(0.9);
    }
  `
      : ''}
`;

const BarLabel = styled.div<{ horizontal?: boolean }>`
  position: absolute;
  ${({ horizontal }) =>
    horizontal
      ? `
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 8px;
  `
      : `
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 4px;
  `}
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  text-align: center;
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
function processChartData(data: DataPoint[] | ChartSeries[]): {
  processed: ChartSeries[];
  maxValue: number;
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
        data: (data as DataPoint[]).map(point => ({
          ...point,
          x: point.label || '',
          y: point.value,
        })),
      },
    ];
  }

  // Calculate the maximum value
  let maxValue = 0;

  processed.forEach(series => {
    series.data.forEach(point => {
      if (point.value > maxValue) {
        maxValue = point.value;
      }
    });
  });

  return { processed, maxValue, isSeriesData };
}

/**
 * BarChart Component
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = '100%',
  height = 300,
  horizontal = false,
  stacked = false,
  grouped = false,
  cornerRadius = 4,
  glass = true,
  blurIntensity = 'medium',
  loading = false,
  isEmpty = false,
  title,
  description,
  xAxis = { show: true },
  yAxis = { show: true },
  legend = { show: true, position: 'top', interactive: true },
  tooltip,
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
  barPadding = 0.2,
  showValues = false,
  valueFormatter = formatNumber,
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

  // State for visibility of series
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({});

  // Process chart data
  const {
    processed: chartData,
    maxValue,
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
    const min = yAxis?.min || 0;
    const max = yAxis?.max || maxValue * 1.1; // Add 10% padding

    return calculateTicks(min, max, tickCount);
  }, [maxValue, yAxis]);

  // Calculate X-axis labels
  const xLabels = useMemo(() => {
    if (isSeriesData) {
      // Use the first data point of each series for the label
      return chartData[0].data.map(point => point.label || point.x?.toString() || '');
    } else {
      // Use the label property from each data point
      return (data as DataPoint[]).map(point => point.label || '');
    }
  }, [data, isSeriesData, chartData]);

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

  // Handle bar click
  const handleBarClick = (
    event: React.MouseEvent,
    value: number,
    index: number,
    seriesId?: string
  ) => {
    if (onClick) {
      const clickData = {
        value,
        index,
        seriesId,
        seriesName: seriesId ? chartData.find(s => s.id === seriesId)?.name : undefined,
      };
      onClick(event, clickData);
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

  // Render the BarChart component
  return (
    <SafeChartRenderer
      loading={loading}
      isEmpty={isEmpty}
      glassEffect={glass && !simplified}
      adaptToCapabilities={adaptToCapabilities}
      minWidth={typeof width === 'number' ? width : undefined}
      minHeight={typeof height === 'number' ? height : undefined}
      backgroundColor={isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.1)'}
      altText={altText || `Bar chart${title ? ` showing ${title}` : ''}`}
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
        aria-label={ariaLabel || altText || `Bar chart${title ? ` showing ${title}` : ''}`}
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

            {xAxis?.grid !== false && (
              <GridLines
                horizontal={false}
                count={xLabels.length - 1}
                glass={glass && !simplified}
              />
            )}

            {/* Bars container */}
            <BarsContainer horizontal={horizontal}>
              {visibleChartData.map((series, seriesIndex) => (
                <React.Fragment key={series.id}>
                  {series.data.map((point, pointIndex) => {
                    const dataPointsCount = series.data.length;
                    const seriesColor = series.color || colors[seriesIndex % colors.length];

                    // Calculate bar dimensions
                    let barHeight: string;
                    let barWidth: string;

                    if (horizontal) {
                      // For horizontal bars
                      barHeight = `${
                        100 / dataPointsCount / (grouped ? visibleChartData.length : 1)
                      }%`;

                      // Adjust bar width based on stacked/grouped
                      if (stacked && seriesIndex > 0) {
                        // For stacked bars, calculate percentage of max value
                        const previousValues = visibleChartData
                          .slice(0, seriesIndex)
                          .reduce((sum, s) => sum + (s.data[pointIndex]?.value || 0), 0);

                        const stackPercentage = (point.value / maxValue) * 100;
                        barWidth = `${stackPercentage}%`;
                      } else {
                        // Normal bars
                        const percentage = (point.value / maxValue) * 100;
                        barWidth = `${percentage}%`;
                      }
                    } else {
                      // For vertical bars
                      barWidth = `${
                        100 / dataPointsCount / (grouped ? visibleChartData.length : 1)
                      }%`;

                      // Adjust bar height based on stacked/grouped
                      if (stacked && seriesIndex > 0) {
                        // For stacked bars, calculate percentage of max value
                        const previousValues = visibleChartData
                          .slice(0, seriesIndex)
                          .reduce((sum, s) => sum + (s.data[pointIndex]?.value || 0), 0);

                        const stackPercentage = (point.value / maxValue) * 100;
                        barHeight = `${stackPercentage}%`;
                      } else {
                        // Normal bars
                        const percentage = (point.value / maxValue) * 100;
                        barHeight = `${percentage}%`;
                      }
                    }

                    return (
                      <Bar
                        key={`${series.id}-${pointIndex}`}
                        height={barHeight}
                        width={barWidth}
                        color={point.color || seriesColor}
                        value={point.value}
                        index={pointIndex}
                        total={dataPointsCount}
                        maxValue={maxValue}
                        horizontal={horizontal}
                        stacked={stacked}
                        grouped={grouped}
                        seriesIndex={seriesIndex}
                        seriesCount={visibleChartData.length}
                        cornerRadius={cornerRadius}
                        showValues={showValues}
                        glassEffect={glass}
                        simplified={simplified}
                        onClick={e => handleBarClick(e, point.value, pointIndex, series.id)}
                      >
                        {showValues && (
                          <BarLabel horizontal={horizontal}>{valueFormatter(point.value)}</BarLabel>
                        )}
                      </Bar>
                    );
                  })}
                </React.Fragment>
              ))}
            </BarsContainer>

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
          </AxisContainer>
        </ChartInner>
      </ChartContainer>
    </SafeChartRenderer>
  );
};
