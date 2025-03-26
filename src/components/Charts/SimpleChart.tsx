/**
 * SimpleChart Component
 *
 * A lightweight, simplified chart component that provides a fallback
 * for performance-constrained environments while still maintaining
 * the Glass UI visual identity.
 */
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeUtils';
import { useGlassTheme, useReducedMotion } from '../../hooks';

import { BaseChartProps } from './types';

/**
 * SimpleChart props interface
 */
export interface SimpleChartProps extends BaseChartProps {
  /**
   * The type of chart to render
   */
  type: 'bar' | 'line' | 'area' | 'pie' | 'scatter';

  /**
   * Data for the chart
   */
  data:
    | Array<{
        label?: string;
        value: number;
        color?: string;
      }>
    | Array<{
        name: string;
        data: Array<{
          label?: string;
          value: number;
          color?: string;
        }>;
        color?: string;
      }>;

  /**
   * Whether to show data values
   */
  showValues?: boolean;

  /**
   * Whether to fill the area under line charts
   */
  fillArea?: boolean;

  /**
   * Whether to show points on line charts
   */
  showPoints?: boolean;

  /**
   * Inner radius for donut charts (0 for pie charts)
   */
  innerRadius?: number;

  /**
   * Theme object for Glass UI styling
   */
  theme?: any;
}

/**
 * Styled components for SimpleChart
 */
const ChartContainer = styled.div<{
  width?: string | number;
  height?: string | number;
  theme: any;
}>`
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || '100%')};
  height: ${({ height }) => (typeof height === 'number' ? `${height}px` : height || '300px')};
  position: relative;
  border-radius: 8px;
  overflow: hidden;

  ${props =>
    glassSurface({
      elevation: 1,
      blurStrength: 'light',
      borderOpacity: 'subtle',
      themeContext: createThemeContext(props.theme),
    })}
`;

const ChartInner = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ChartTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)')};
`;

const ChartContent = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
`;

const BarContainer = styled.div`
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 100%;
  justify-content: space-around;
  padding: 0 5%;
`;

const SimpleBar = styled.div<{ height: string; color: string; animate: boolean }>`
  width: 70%;
  height: ${props => props.height};
  background-color: ${props => props.color};
  border-radius: 4px 4px 0 0;
  transition: ${props => (props.animate ? 'height 0.5s ease-out' : 'none')};

  ${cssWithKebabProps`
    boxShadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `}
`;

const BarLabel = styled.div`
  font-size: 10px;
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)')};
  text-align: center;
  margin-top: 4px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BarValue = styled.div`
  font-size: 10px;
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)')};
  text-align: center;
  margin-bottom: 4px;
`;

const SimpleLineContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding: 10px 5%;
`;

const SimpleLine = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

const LinePath = styled.path<{ color: string; animate: boolean; filled?: boolean }>`
  fill: ${props => (props.filled ? `${props.color}30` : 'none')};
  stroke: ${props => props.color};
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;

  ${props =>
    props.animate &&
    `
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: dashSimple 1.5s ease-out forwards;
    
    @keyframes dashSimple {
      to {
        stroke-dashoffset: 0;
      }
    }
  `}
`;

const LinePoint = styled.circle<{ color: string; animate: boolean; index: number; total: number }>`
  fill: white;
  stroke: ${props => props.color};
  stroke-width: 2px;
  r: 3;

  ${props =>
    props.animate &&
    `
    opacity: 0;
    animation: pointAppearSimple 0.3s ease-out ${0.5 + (props.index / props.total) * 0.5}s forwards;
    
    @keyframes pointAppearSimple {
      to {
        opacity: 1;
      }
    }
  `}
`;

const SimplePieContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SimplePie = styled.svg`
  width: 80%;
  height: 80%;
`;

const SimpleLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)')};
`;

const LegendColor = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background-color: ${props => props.color};
`;

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
  return value.toFixed(0);
}

/**
 * Calculate a pie slice path
 */
function calculatePieSlice(
  centerX: number,
  centerY: number,
  radius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const startRadians = (startAngle - 90) * (Math.PI / 180);
  const endRadians = (endAngle - 90) * (Math.PI / 180);

  const startX = centerX + radius * Math.cos(startRadians);
  const startY = centerY + radius * Math.sin(startRadians);
  const endX = centerX + radius * Math.cos(endRadians);
  const endY = centerY + radius * Math.sin(endRadians);

  const innerStartX = centerX + innerRadius * Math.cos(startRadians);
  const innerStartY = centerY + innerRadius * Math.sin(startRadians);
  const innerEndX = centerX + innerRadius * Math.cos(endRadians);
  const innerEndY = centerY + innerRadius * Math.sin(endRadians);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  let path = `M ${startX} ${startY} `;
  path += `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} `;

  if (innerRadius > 0) {
    // For donut charts
    path += `L ${innerEndX} ${innerEndY} `;
    path += `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} `;
    path += `L ${startX} ${startY}`;
  } else {
    // For pie charts
    path += `L ${centerX} ${centerY} `;
    path += `L ${startX} ${startY}`;
  }

  return path;
}

/**
 * Process chart data to a standardized format
 */
function processChartData(data: SimpleChartProps['data']) {
  // Check if data is in series format or simple format
  const isSeriesData = data.length > 0 && 'data' in data[0];

  let processedData;
  let maxValue = 0;

  if (isSeriesData) {
    // Data is already in series format
    processedData = data as Array<{
      name: string;
      data: Array<{
        label?: string;
        value: number;
        color?: string;
      }>;
      color?: string;
    }>;

    // Find max value across all series
    processedData.forEach(series => {
      series.data.forEach(point => {
        if (point.value > maxValue) {
          maxValue = point.value;
        }
      });
    });
  } else {
    // Convert simple data to series format
    processedData = [
      {
        name: 'Default',
        data: data as Array<{
          label?: string;
          value: number;
          color?: string;
        }>,
      },
    ];

    // Find max value
    (data as Array<{ value: number }>).forEach(point => {
      if (point.value > maxValue) {
        maxValue = point.value;
      }
    });
  }

  return { processedData, maxValue, isSeriesData };
}

/**
 * SimpleChart Component
 *
 * A performance-optimized chart component with glass UI styling.
 */
export const SimpleChart: React.FC<SimpleChartProps> = ({
  type,
  data,
  width = '100%',
  height = 300,
  glass = true,
  title,
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
  showValues = false,
  fillArea = false,
  showPoints = true,
  innerRadius = 0,
  theme: propTheme,
  className,
  style,
}) => {
  // Get theme context
  const { isDarkMode, theme: contextTheme } = useGlassTheme();
  const theme = propTheme || contextTheme || { isDarkMode };

  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  // Process chart data
  const { processedData, maxValue, isSeriesData } = useMemo(() => processChartData(data), [data]);

  // Render chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
      case 'area':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'scatter':
        return renderLineChart(); // Fallback to line chart for scatter
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  // Render bar chart
  const renderBarChart = () => {
    // For simplicity, only render the first series in a multi-series dataset
    const dataToRender = isSeriesData ? processedData[0].data : processedData[0].data;

    return (
      <BarContainer>
        {dataToRender.map((point, index) => {
          const heightPercentage = (point.value / maxValue) * 100;
          const barColor = point.color || colors[index % colors.length];

          return (
            <div
              key={index}
              style={{
                width: `${100 / dataToRender.length}%`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {showValues && <BarValue>{formatNumber(point.value)}</BarValue>}
              <SimpleBar
                height={`${heightPercentage}%`}
                color={barColor}
                animate={!prefersReducedMotion}
              />
              {point.label && <BarLabel>{point.label}</BarLabel>}
            </div>
          );
        })}
      </BarContainer>
    );
  };

  // Render line chart
  const renderLineChart = () => {
    // For simplicity, only render up to 3 series in a multi-series dataset
    const seriesToRender = isSeriesData ? processedData.slice(0, 3) : [processedData[0]];

    return (
      <SimpleLineContainer>
        <SimpleLine>
          {seriesToRender.map((series, seriesIndex) => {
            if (series.data.length === 0) return null;

            const seriesColor = series.color || colors[seriesIndex % colors.length];
            const points = series.data.map((point, index) => ({
              x: (index / (series.data.length - 1 || 1)) * 100,
              y: 100 - (point.value / maxValue) * 100,
              value: point.value,
              label: point.label,
            }));

            const pathData = points
              .map((point, index) =>
                index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
              )
              .join(' ');

            // Create a closed path for filled area charts
            const areaPathData =
              type === 'area' && fillArea
                ? `${pathData} L ${points[points.length - 1].x} 100 L 0 100 Z`
                : pathData;

            return (
              <React.Fragment key={seriesIndex}>
                <LinePath
                  d={areaPathData}
                  color={seriesColor}
                  animate={!prefersReducedMotion}
                  filled={type === 'area' && fillArea}
                />

                {showPoints &&
                  points.map((point, index) => (
                    <LinePoint
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      color={seriesColor}
                      animate={!prefersReducedMotion}
                      index={index}
                      total={points.length}
                    />
                  ))}
              </React.Fragment>
            );
          })}
        </SimpleLine>
      </SimpleLineContainer>
    );
  };

  // Render pie chart
  const renderPieChart = () => {
    // For pie charts, we use the flat data structure
    const dataToRender = isSeriesData
      ? processedData.reduce((acc, series) => {
          // Convert series to flat data with series name as label
          return acc.concat(
            series.data.map(point => ({
              ...point,
              label: series.name,
            }))
          );
        }, [] as Array<{ label?: string; value: number; color?: string }>)
      : processedData[0].data;

    // Calculate total value for percentage
    const total = dataToRender.reduce((sum, point) => sum + point.value, 0);

    // Generate pie slices
    const pieSlices = [];
    let currentAngle = 0;

    for (let i = 0; i < dataToRender.length; i++) {
      const point = dataToRender[i];
      const sliceAngle = (point.value / total) * 360;
      const sliceColor = point.color || colors[i % colors.length];

      const path = calculatePieSlice(
        50,
        50, // center coordinates (SVG viewBox is 100x100)
        50, // outer radius
        innerRadius, // inner radius (0 for pie, >0 for donut)
        currentAngle,
        currentAngle + sliceAngle
      );

      pieSlices.push({
        path,
        color: sliceColor,
        value: point.value,
        percentage: (point.value / total) * 100,
        label: point.label || `Slice ${i + 1}`,
      });

      currentAngle += sliceAngle;
    }

    return (
      <>
        <SimplePieContainer>
          <SimplePie viewBox="0 0 100 100">
            {pieSlices.map((slice, index) => (
              <path
                key={index}
                d={slice.path}
                fill={slice.color}
                stroke="white"
                strokeWidth="0.5"
              />
            ))}
          </SimplePie>
        </SimplePieContainer>

        <SimpleLegend>
          {pieSlices.map((slice, index) => (
            <LegendItem key={index}>
              <LegendColor color={slice.color} />
              <span>
                {slice.label}:{' '}
                {showValues ? `${formatNumber(slice.value)} (${slice.percentage.toFixed(1)}%)` : ''}
              </span>
            </LegendItem>
          ))}
        </SimpleLegend>
      </>
    );
  };

  return (
    <ChartContainer width={width} height={height} theme={theme} className={className} style={style}>
      <ChartInner>
        {title && <ChartTitle>{title}</ChartTitle>}
        <ChartContent>{renderChart()}</ChartContent>
      </ChartInner>
    </ChartContainer>
  );
};

export default SimpleChart;
