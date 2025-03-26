/**
 * PieChart Component
 *
 * A stylish pie/donut chart component with glass morphism styling
 */
import React, { useRef, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';
import { useOptimizedAnimation, useGlassTheme, useReducedMotion } from '../../hooks';
import { AnimationComplexity } from '../../hooks/useOptimizedAnimation';

import { SafeChartRenderer } from './SafeChartRenderer';
import { PieChartProps, DataPoint } from './types';

/**
 * Styled components for PieChart
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
  display: flex;
  flex-direction: column;
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

const PieContainer = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// SVG Container for smooth animation
const SVGContainer = styled.svg`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
`;

interface PieSliceProps {
  d: string;
  fill: string;
  glassEffect: boolean;
  simplified: boolean;
  index: number;
  total: number;
  delay: number;
}

const PieSlice = styled.path<PieSliceProps>`
  fill: ${props => props.fill};
  transition: d 0.5s ease-out;

  ${props =>
    props.glassEffect && !props.simplified
      ? `
    filter: drop-shadow(0 4px 8px ${props.fill}40);
  `
      : ''}

  ${props =>
    props.glassEffect && !props.simplified
      ? `
    opacity: 0;
    animation: sliceAppear 0.5s ease-out ${props.delay}s forwards;
    
    @keyframes sliceAppear {
      0% {
        opacity: 0;
        transform: scale(0.8);
        transform-origin: center;
      }
      100% {
        opacity: 1;
        transform: scale(1);
        transform-origin: center;
      }
    }
  `
      : 'opacity: 1;'}
  
  &:hover {
    filter: brightness(1.1) drop-shadow(0 4px 12px ${props => props.fill}60);
    transform: translateY(-2px);
    cursor: pointer;
  }
`;

interface SliceLabel {
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
  value: number | string;
  percentage: string;
  color: string;
}

const SliceLabel = styled.text<{ glassEffect: boolean }>`
  font-size: 12px;
  fill: rgba(255, 255, 255, 0.9);
  user-select: none;

  ${props =>
    props.glassEffect
      ? `
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  `
      : ''}
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
  justify-content: center;
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
  percentage: number;
  color: string;
}

// Center label for donut charts
const CenterLabel = styled.div<{ glassEffect: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;

  ${props =>
    props.glassEffect
      ? `
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  `
      : ''}
`;

const CenterValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const CenterLabel2 = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
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
 * Format a percentage
 */
function formatPercentage(value: number): string {
  return value.toFixed(1) + '%';
}

/**
 * Calculate coordinates for a pie slice
 */
function calculateSliceCoordinates(
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
  centerX: number,
  centerY: number
): string {
  // Convert angles from degrees to radians
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  // Calculate coordinates
  const startOuterX = centerX + outerRadius * Math.cos(startRad);
  const startOuterY = centerY + outerRadius * Math.sin(startRad);
  const endOuterX = centerX + outerRadius * Math.cos(endRad);
  const endOuterY = centerY + outerRadius * Math.sin(endRad);

  // For donut charts
  const startInnerX = centerX + innerRadius * Math.cos(endRad);
  const startInnerY = centerY + innerRadius * Math.sin(endRad);
  const endInnerX = centerX + innerRadius * Math.cos(startRad);
  const endInnerY = centerY + innerRadius * Math.sin(startRad);

  // Determine if the arc is a large arc
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  if (innerRadius === 0) {
    // Regular pie slice
    return `
      M ${centerX},${centerY}
      L ${startOuterX},${startOuterY}
      A ${outerRadius},${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX},${endOuterY}
      Z
    `;
  } else {
    // Donut slice
    return `
      M ${startOuterX},${startOuterY}
      A ${outerRadius},${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX},${endOuterY}
      L ${startInnerX},${startInnerY}
      A ${innerRadius},${innerRadius} 0 ${largeArcFlag} 0 ${endInnerX},${endInnerY}
      Z
    `;
  }
}

/**
 * Calculate label position for a pie slice
 */
function calculateLabelPosition(
  startAngle: number,
  endAngle: number,
  radius: number,
  centerX: number,
  centerY: number
): { x: number; y: number; textAnchor: 'start' | 'middle' | 'end' } {
  // Calculate the midpoint angle
  const midAngle = (startAngle + endAngle) / 2;
  const midAngleRad = ((midAngle - 90) * Math.PI) / 180;

  // Calculate the position
  const x = centerX + radius * 0.8 * Math.cos(midAngleRad);
  const y = centerY + radius * 0.8 * Math.sin(midAngleRad);

  // Determine text anchor based on quadrant
  let textAnchor: 'start' | 'middle' | 'end' = 'middle';

  if (midAngle > 0 && midAngle < 180) {
    textAnchor = 'start';
  } else if (midAngle > 180 && midAngle < 360) {
    textAnchor = 'end';
  }

  return { x, y, textAnchor };
}

/**
 * Process data for the pie chart
 */
function processChartData(
  data: DataPoint[],
  colors: string[]
): {
  processedData: Array<
    DataPoint & {
      percentage: number;
      startAngle: number;
      endAngle: number;
      color: string;
    }
  >;
  total: number;
} {
  // Calculate total value
  const total = data.reduce((sum, point) => sum + point.value, 0);

  // Process data
  const processedData = data.map((point, index) => {
    const percentage = (point.value / total) * 100;

    return {
      ...point,
      percentage,
      startAngle: 0, // Will be calculated below
      endAngle: 0, // Will be calculated below
      color: point.color || colors[index % colors.length],
    };
  });

  // Calculate start and end angles
  let currentAngle = 0;
  processedData.forEach(point => {
    point.startAngle = currentAngle;
    point.endAngle = currentAngle + (point.percentage / 100) * 360;
    currentAngle = point.endAngle;
  });

  return { processedData, total };
}

/**
 * PieChart Component
 */
export const PieChart: React.FC<PieChartProps> = ({
  data,
  width = '100%',
  height = 300,
  glass = true,
  blurIntensity = 'medium',
  loading = false,
  isEmpty = false,
  title,
  description,
  legend = { show: true, position: 'bottom', interactive: true },
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
  margin = { top: 20, right: 20, bottom: 40, left: 20 },
  adaptToCapabilities = true,
  simplified = false,
  animationDisabled = false,
  altText,
  ariaLabel,
  innerRadius = 0,
  outerRadius,
  startAngle = 0,
  endAngle = 360,
  padAngle = 0,
  showLabels = true,
  labelType = 'percent',
  showValues = true,
  labelFormatter,
  donut = false,
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

  // State for tooltip
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  // State for highlighted slice
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  // Process chart data
  const { processedData, total } = useMemo(() => processChartData(data, colors), [data, colors]);

  // Calculate dimensions
  const dimensions = useMemo(() => {
    if (!containerRef.current) {
      return { centerX: 150, centerY: 150, radius: 100 };
    }

    const width = containerRef.current.clientWidth - (margin.left || 0) - (margin.right || 0);
    const height = containerRef.current.clientHeight - (margin.top || 0) - (margin.bottom || 0);

    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate radius as a fraction of the minimum dimension
    const minDimension = Math.min(width, height);
    const radius = outerRadius || minDimension * 0.4;
    const actualInnerRadius = donut ? innerRadius || radius * 0.6 : 0;

    return {
      centerX,
      centerY,
      radius,
      innerRadius: actualInnerRadius,
    };
  }, [containerRef.current, margin, outerRadius, innerRadius, donut]);

  // Calculate slices
  const slices = useMemo(() => {
    const { centerX, centerY, radius, innerRadius } = dimensions;

    return processedData.map((point, index) => {
      // Apply padding between slices if specified
      const adjustedStartAngle = point.startAngle + padAngle / 2;
      const adjustedEndAngle = point.endAngle - padAngle / 2;

      // Calculate path
      const path = calculateSliceCoordinates(
        adjustedStartAngle + startAngle,
        adjustedEndAngle + startAngle,
        innerRadius,
        radius,
        centerX,
        centerY
      );

      // Calculate label position
      const labelPosition = calculateLabelPosition(
        adjustedStartAngle + startAngle,
        adjustedEndAngle + startAngle,
        radius,
        centerX,
        centerY
      );

      // Format label based on type
      let labelValue: string | number = '';

      if (labelType === 'value') {
        labelValue = labelFormatter
          ? labelFormatter(point.value, point.percentage, point.label)
          : formatNumber(point.value);
      } else if (labelType === 'percent') {
        labelValue = labelFormatter
          ? labelFormatter(point.value, point.percentage, point.label)
          : formatPercentage(point.percentage);
      } else {
        labelValue = point.label || '';
      }

      return {
        ...point,
        path,
        labelPosition: {
          ...labelPosition,
          value: labelValue,
          percentage: formatPercentage(point.percentage),
        },
      };
    });
  }, [processedData, dimensions, padAngle, startAngle, labelType, labelFormatter]);

  // Determine if animations should be enabled
  const shouldAnimate = useMemo(() => {
    return animation?.enabled && !prefersReducedMotion && !animationDisabled;
  }, [animation?.enabled, prefersReducedMotion, animationDisabled]);

  // Get animation duration
  const animationDuration = useMemo(() => {
    return shouldAnimate ? animation?.duration || 500 : 0;
  }, [shouldAnimate, animation?.duration]);

  // Handle slice hover
  const handleSliceHover = (event: React.MouseEvent, slice: any, index: number) => {
    if (!tooltip.show) return;

    const rect = (event.target as SVGElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setTooltipData({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
        label: slice.label || 'Slice ' + (index + 1),
        value: slice.value,
        percentage: slice.percentage,
        color: slice.color,
      });
    }

    setHighlightedIndex(index);

    if (onMouseEnter) {
      onMouseEnter(event, {
        value: slice.value,
        label: slice.label,
        percentage: slice.percentage,
      });
    }
  };

  // Handle mouse leave
  const handleMouseLeave = (event: React.MouseEvent) => {
    setTooltipData(null);
    setHighlightedIndex(null);

    if (onMouseLeave) {
      onMouseLeave(event);
    }
  };

  // Handle slice click
  const handleSliceClick = (event: React.MouseEvent, slice: any, index: number) => {
    if (onClick) {
      onClick(event, {
        value: slice.value,
        label: slice.label,
        percentage: slice.percentage,
        index,
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

  // Get center label content
  const centerLabelContent = useMemo(() => {
    if (!donut) return null;

    // If there's a highlighted slice, show that slice's information
    if (highlightedIndex !== null && processedData[highlightedIndex]) {
      const slice = processedData[highlightedIndex];
      return {
        value: formatNumber(slice.value),
        label: slice.label || 'Slice ' + (highlightedIndex + 1),
        percentage: formatPercentage(slice.percentage),
      };
    }

    // Otherwise show the total
    return {
      value: formatNumber(total),
      label: 'Total',
      percentage: '100%',
    };
  }, [donut, highlightedIndex, processedData, total]);

  // Render the PieChart component
  return (
    <SafeChartRenderer
      loading={loading}
      isEmpty={isEmpty}
      glassEffect={glass && !simplified}
      adaptToCapabilities={adaptToCapabilities}
      minWidth={typeof width === 'number' ? width : undefined}
      minHeight={typeof height === 'number' ? height : undefined}
      backgroundColor={isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.1)'}
      altText={altText || `${donut ? 'Donut' : 'Pie'} chart${title ? ` showing ${title}` : ''}`}
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
        aria-label={
          ariaLabel ||
          altText ||
          `${donut ? 'Donut' : 'Pie'} chart${title ? ` showing ${title}` : ''}`
        }
        role="img"
      >
        <ChartInner>
          {title && <ChartTitle>{title}</ChartTitle>}
          {description && <ChartDescription>{description}</ChartDescription>}

          <PieContainer>
            <SVGContainer
              ref={svgRef}
              viewBox={`0 0 ${dimensions.centerX * 2} ${dimensions.centerY * 2}`}
            >
              {/* Render pie slices */}
              {slices.map((slice, index) => (
                <PieSlice
                  key={`slice-${index}`}
                  d={slice.path}
                  fill={slice.color}
                  glassEffect={glass}
                  simplified={simplified}
                  index={index}
                  total={slices.length}
                  delay={(index / slices.length) * (shouldAnimate ? 0.3 : 0)}
                  onMouseEnter={e => handleSliceHover(e, slice, index)}
                  onMouseLeave={handleMouseLeave}
                  onClick={e => handleSliceClick(e, slice, index)}
                />
              ))}

              {/* Render labels */}
              {showLabels && (
                <>
                  {slices.map((slice, index) => {
                    const { labelPosition } = slice;

                    return (
                      <g key={`label-${index}`}>
                        <SliceLabel
                          x={labelPosition.x}
                          y={labelPosition.y}
                          textAnchor={labelPosition.textAnchor}
                          dominantBaseline="middle"
                          glassEffect={glass}
                        >
                          {labelPosition.value}
                        </SliceLabel>

                        {showValues && labelType !== 'value' && (
                          <SliceLabel
                            x={labelPosition.x}
                            y={labelPosition.y + 14}
                            textAnchor={labelPosition.textAnchor}
                            dominantBaseline="middle"
                            glassEffect={glass}
                          >
                            {formatNumber(slice.value)}
                          </SliceLabel>
                        )}
                      </g>
                    );
                  })}
                </>
              )}
            </SVGContainer>

            {/* Center label for donut charts */}
            {donut && centerLabelContent && (
              <CenterLabel glassEffect={glass}>
                <CenterValue>{centerLabelContent.value}</CenterValue>
                <CenterLabel2>{centerLabelContent.label}</CenterLabel2>
                <CenterLabel2>{centerLabelContent.percentage}</CenterLabel2>
              </CenterLabel>
            )}

            {/* Tooltip */}
            {tooltipData && tooltip.show && (
              <Tooltip x={tooltipData.x} y={tooltipData.y}>
                <div style={{ color: tooltipData.color, fontWeight: 'bold' }}>
                  {tooltipData.label}
                </div>
                <div>
                  {formatNumber(tooltipData.value)} ({tooltipData.percentage.toFixed(1)}%)
                </div>
              </Tooltip>
            )}
          </PieContainer>

          {/* Legend */}
          {legend?.show !== false && (
            <Legend>
              {processedData.map((slice, index) => (
                <LegendItem
                  key={`legend-${index}`}
                  color={slice.color}
                  interactive={legend.interactive}
                  onClick={() => handleSliceClick(null as any, slice, index)}
                >
                  <LegendColor color={slice.color} />
                  <span>
                    {slice.label || 'Slice ' + (index + 1)} ({slice.percentage.toFixed(1)}%)
                  </span>
                </LegendItem>
              ))}
            </Legend>
          )}
        </ChartInner>
      </ChartContainer>
    </SafeChartRenderer>
  );
};
