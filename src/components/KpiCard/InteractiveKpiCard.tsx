/**
 * Interactive KPI Card Component
 *
 * A KPI card with an interactive mini chart for data visualization.
 */
import React, { forwardRef, useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { InteractiveKpiCardProps } from './types';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const breathe = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Get color values based on theme color
const getColorValues = (
  color: string
): { bg: string; border: string; text: string; accent: string; chart: string } => {
  switch (color) {
    case 'primary':
      return {
        bg: 'rgba(99, 102, 241, 0.05)',
        border: 'rgba(99, 102, 241, 0.4)',
        text: 'rgba(99, 102, 241, 1)',
        accent: 'rgba(99, 102, 241, 0.8)',
        chart: 'rgba(99, 102, 241, 0.7)',
      };
    case 'secondary':
      return {
        bg: 'rgba(156, 39, 176, 0.05)',
        border: 'rgba(156, 39, 176, 0.4)',
        text: 'rgba(156, 39, 176, 1)',
        accent: 'rgba(156, 39, 176, 0.8)',
        chart: 'rgba(156, 39, 176, 0.7)',
      };
    case 'error':
      return {
        bg: 'rgba(240, 82, 82, 0.05)',
        border: 'rgba(240, 82, 82, 0.4)',
        text: 'rgba(240, 82, 82, 1)',
        accent: 'rgba(240, 82, 82, 0.8)',
        chart: 'rgba(240, 82, 82, 0.7)',
      };
    case 'info':
      return {
        bg: 'rgba(3, 169, 244, 0.05)',
        border: 'rgba(3, 169, 244, 0.4)',
        text: 'rgba(3, 169, 244, 1)',
        accent: 'rgba(3, 169, 244, 0.8)',
        chart: 'rgba(3, 169, 244, 0.7)',
      };
    case 'success':
      return {
        bg: 'rgba(76, 175, 80, 0.05)',
        border: 'rgba(76, 175, 80, 0.4)',
        text: 'rgba(76, 175, 80, 1)',
        accent: 'rgba(76, 175, 80, 0.8)',
        chart: 'rgba(76, 175, 80, 0.7)',
      };
    case 'warning':
      return {
        bg: 'rgba(255, 152, 0, 0.05)',
        border: 'rgba(255, 152, 0, 0.4)',
        text: 'rgba(255, 152, 0, 1)',
        accent: 'rgba(255, 152, 0, 0.8)',
        chart: 'rgba(255, 152, 0, 0.7)',
      };
    case 'default':
    default:
      return {
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.2)',
        text: 'rgba(255, 255, 255, 0.9)',
        accent: 'rgba(255, 255, 255, 0.6)',
        chart: 'rgba(255, 255, 255, 0.7)',
      };
  }
};

// Styled components
const CardRoot = styled.div<{
  $glass: boolean;
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string; chart: string };
  $size: 'small' | 'medium' | 'large';
  $fullWidth: boolean;
  $elevation: number;
  $borderRadius: number | string;
  $hover: boolean;
  $align: 'left' | 'center' | 'right';
  $clickable: boolean;
  $interactive: boolean;
  $isHovered: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  flex-direction: column;
  padding: ${props =>
    props.$size === 'small' ? '12px 16px' : props.$size === 'large' ? '24px 32px' : '16px 24px'};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  min-width: ${props =>
    props.$size === 'small' ? '240px' : props.$size === 'large' ? '360px' : '280px'};
  height: auto;
  border-radius: ${props =>
    typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  text-align: ${props => props.$align};
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;

  /* Glass styling */
  ${props =>
    props.$glass &&
    glassSurface({
      elevation: props.$elevation,
      blurStrength: 'standard',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.theme),
    })}

  /* Non-glass styling */
  ${props =>
    !props.$glass &&
    `
    background-color: ${props.$colorValues.bg};
    border: 1px solid ${props.$colorValues.border};
    box-shadow: ${
      props.$elevation === 0
        ? 'none'
        : props.$elevation === 1
        ? '0 2px 4px rgba(0, 0, 0, 0.1)'
        : props.$elevation === 2
        ? '0 3px 6px rgba(0, 0, 0, 0.15)'
        : props.$elevation === 3
        ? '0 5px 10px rgba(0, 0, 0, 0.2)'
        : props.$elevation === 4
        ? '0 8px 16px rgba(0, 0, 0, 0.25)'
        : '0 12px 24px rgba(0, 0, 0, 0.3)'
    };
  `}
  
  /* Hover effect */
  ${props =>
    props.$hover &&
    `
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${
        props.$glass
          ? ''
          : props.$elevation === 0
          ? '0 2px 4px rgba(0, 0, 0, 0.1)'
          : props.$elevation === 1
          ? '0 4px 8px rgba(0, 0, 0, 0.15)'
          : props.$elevation === 2
          ? '0 6px 12px rgba(0, 0, 0, 0.2)'
          : props.$elevation === 3
          ? '0 8px 16px rgba(0, 0, 0, 0.25)'
          : props.$elevation === 4
          ? '0 12px 24px rgba(0, 0, 0, 0.3)'
          : '0 16px 32px rgba(0, 0, 0, 0.35)'
      };
    }
  `}
  
  /* Interactive hover effect */
  ${props =>
    props.$interactive &&
    props.$isHovered &&
    !props.$reducedMotion &&
    `
    animation: ${breathe} 2s ease-in-out infinite;
  `}
  
  /* Mounted animation */
  animation: ${fadeIn} 0.5s ease-out;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  z-index: 1;
  position: relative;
`;

const IconContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string; chart: string };
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: ${props => props.$colorValues.text};

  /* Size variations */
  font-size: ${props =>
    props.$size === 'small' ? '1.5rem' : props.$size === 'large' ? '2.5rem' : '2rem'};
`;

const Title = styled.h3<{
  $size: 'small' | 'medium' | 'large';
}>`
  margin: 0;
  font-size: ${props =>
    props.$size === 'small' ? '0.875rem' : props.$size === 'large' ? '1.25rem' : '1rem'};
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
`;

const ValueContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $align: 'left' | 'center' | 'right';
}>`
  display: flex;
  align-items: baseline;
  justify-content: ${props =>
    props.$align === 'left' ? 'flex-start' : props.$align === 'right' ? 'flex-end' : 'center'};
  margin-bottom: 4px;
`;

const Value = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string; chart: string };
}>`
  font-size: ${props =>
    props.$size === 'small' ? '1.5rem' : props.$size === 'large' ? '2.5rem' : '2rem'};
  font-weight: 600;
  color: ${props => props.$colorValues.text};
  line-height: 1.2;
`;

const Unit = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.6);
`;

const Subtitle = styled.div<{
  $size: 'small' | 'medium' | 'large';
}>`
  font-size: ${props =>
    props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '0.875rem' : '0.8125rem'};
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
`;

const ChangePeriodContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const ChangeValue = styled.div<{
  $value: number;
  $positiveIsGood: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  font-size: ${props =>
    props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '0.875rem' : '0.8125rem'};
  font-weight: 500;

  /* Color based on value */
  color: ${props => {
    const isPositive = props.$value >= 0;
    if (props.$positiveIsGood) {
      return isPositive ? 'rgba(76, 175, 80, 1)' : 'rgba(240, 82, 82, 1)';
    } else {
      return isPositive ? 'rgba(240, 82, 82, 1)' : 'rgba(76, 175, 80, 1)';
    }
  }};

  /* Icon for change direction */
  &::before {
    content: '${props => {
      const isPositive = props.$value >= 0;
      return isPositive ? '▲' : '▼';
    }}';
    margin-right: 4px;
    font-size: 0.75em;
  }
`;

const Period = styled.div<{
  $size: 'small' | 'medium' | 'large';
}>`
  font-size: ${props =>
    props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '0.875rem' : '0.8125rem'};
  color: rgba(255, 255, 255, 0.5);
`;

const ChartContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $chartType: 'line' | 'bar' | 'area' | 'sparkline';
  $animateOnHover: boolean;
  $isHovered: boolean;
  $reducedMotion: boolean;
}>`
  position: relative;
  width: 100%;
  height: ${props =>
    props.$size === 'small' ? '40px' : props.$size === 'large' ? '80px' : '60px'};
  margin-top: 16px;
  overflow: hidden;

  /* Animation on hover */
  ${props =>
    props.$animateOnHover &&
    props.$isHovered &&
    !props.$reducedMotion &&
    `
    & > * {
      animation: ${fadeIn} 0.5s ease-out;
    }
  `}
`;

const LineChart = styled.svg<{
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string; chart: string };
}>`
  width: 100%;
  height: 100%;

  & path {
    stroke: ${props => props.$colorValues.chart};
    stroke-width: 2px;
    fill: none;
  }
`;

const AreaChart = styled.svg<{
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string; chart: string };
}>`
  width: 100%;
  height: 100%;

  & path.line {
    stroke: ${props => props.$colorValues.chart};
    stroke-width: 2px;
    fill: none;
  }

  & path.area {
    fill: ${props => props.$colorValues.chart};
    opacity: 0.2;
  }
`;

const BarChart = styled.svg<{
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string; chart: string };
}>`
  width: 100%;
  height: 100%;

  & rect {
    fill: ${props => props.$colorValues.chart};
  }
`;

const SparklineChart = styled.svg<{
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string; chart: string };
}>`
  width: 100%;
  height: 100%;

  & path {
    stroke: ${props => props.$colorValues.chart};
    stroke-width: 1.5px;
    fill: none;
  }

  & circle {
    fill: ${props => props.$colorValues.chart};
  }
`;

const Tooltip = styled.div<{
  $x: number;
  $y: number;
  $visible: boolean;
}>`
  position: absolute;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  transform: translate(-50%, -100%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  pointer-events: none;
  white-space: nowrap;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transition: opacity 0.2s ease;
  z-index: 10;
`;

const Footer = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

/**
 * Format a number according to a format string
 */
const formatValue = (value: number, format?: string): string => {
  if (!format) return value.toString();

  // Handle percentage format
  if (format.includes('%')) {
    const precision = format.match(/\.(\d+)/)?.[1]?.length || 0;
    return `${(value * 100).toFixed(precision)}%`;
  }

  // Handle currency format
  if (format.includes('$')) {
    const precision = format.match(/\.(\d+)/)?.[1]?.length || 0;
    return `$${value.toFixed(precision)}`;
  }

  // Handle general number format
  const precision = format.match(/\.(\d+)/)?.[1]?.length || 0;
  return value.toFixed(precision);
};

/**
 * Normalize chart data to a standard format
 */
const normalizeChartData = (
  chartData: Array<number | { x: number | string; y: number }>
): { x: number | string; y: number }[] => {
  return chartData.map((data, index) => {
    if (typeof data === 'number') {
      return { x: index, y: data };
    }
    return data;
  });
};

/**
 * InteractiveKpiCard Component Implementation
 */
function InteractiveKpiCardComponent(
  props: InteractiveKpiCardProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    title,
    value,
    subtitle,
    icon,
    className,
    style,
    glass = false,
    color = 'default',
    size = 'medium',
    fullWidth = false,
    elevation = 2,
    borderRadius = 12,
    hover = true,
    onClick,
    align = 'left',
    footer,
    children,
    chartData = [],
    chartType = 'line',
    animationDuration = 500,
    zoomable = false,
    showTooltip = true,
    valueFormat,
    unit,
    change,
    changeFormat,
    positiveIsGood = true,
    period,
    interactive = true,
    animateOnHover = true,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Refs
  const chartRef = useRef<SVGSVGElement>(null);

  // State
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number;
    y: number;
    value: string;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    value: '',
    visible: false,
  });

  // Get color values
  const colorValues = getColorValues(color);

  // Format the value
  const formattedValue = typeof value === 'number' ? formatValue(value, valueFormat) : value;

  // Format the change
  const formattedChange =
    change !== undefined ? formatValue(change, changeFormat || '+0.0%') : undefined;

  // Normalize chart data
  const normalizedData = normalizeChartData(chartData);

  // Find min/max values for scaling
  let minValue = Number.MAX_VALUE;
  let maxValue = Number.MIN_VALUE;

  normalizedData.forEach(data => {
    if (data.y < minValue) minValue = data.y;
    if (data.y > maxValue) maxValue = data.y;
  });

  // Ensure we have valid min/max values
  if (minValue === Number.MAX_VALUE) minValue = 0;
  if (maxValue === Number.MIN_VALUE) maxValue = 100;

  // Add padding to min/max
  const range = maxValue - minValue;
  minValue = Math.max(0, minValue - range * 0.1);
  maxValue = maxValue + range * 0.1;

  // Render the chart based on type
  const renderChart = () => {
    if (normalizedData.length === 0) return null;

    // Chart dimensions
    const height = size === 'small' ? 40 : size === 'large' ? 80 : 60;
    const width = chartRef.current?.clientWidth || 300;

    // Scales for x and y
    const xScale = (index: number) => (width / (normalizedData.length - 1)) * index;
    const yScale = (value: number) =>
      height - ((value - minValue) / (maxValue - minValue)) * height;

    switch (chartType) {
      case 'area': {
        // Generate area path
        let areaPath = `M0,${height} `;
        areaPath += normalizedData.map((data, i) => `L${xScale(i)},${yScale(data.y)}`).join(' ');
        areaPath += ` L${width},${height} Z`;

        // Generate line path
        let linePath = `M${xScale(0)},${yScale(normalizedData[0].y)} `;
        linePath += normalizedData
          .slice(1)
          .map((data, i) => `L${xScale(i + 1)},${yScale(data.y)}`)
          .join(' ');

        return (
          <AreaChart
            ref={chartRef}
            $color={color}
            $colorValues={colorValues}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <path className="area" d={areaPath} />
            <path className="line" d={linePath} />
          </AreaChart>
        );
      }

      case 'bar': {
        const barWidth = Math.max(1, (width / normalizedData.length) * 0.8);
        const barGap = width / normalizedData.length - barWidth;

        return (
          <BarChart
            ref={chartRef}
            $color={color}
            $colorValues={colorValues}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            {normalizedData.map((data, i) => (
              <rect
                key={i}
                x={xScale(i) - barWidth / 2}
                y={yScale(data.y)}
                width={barWidth}
                height={height - yScale(data.y)}
                data-index={i}
                data-value={data.y}
              />
            ))}
          </BarChart>
        );
      }

      case 'sparkline': {
        // Generate line path
        let path = `M${xScale(0)},${yScale(normalizedData[0].y)} `;
        path += normalizedData
          .slice(1)
          .map((data, i) => `L${xScale(i + 1)},${yScale(data.y)}`)
          .join(' ');

        return (
          <SparklineChart
            ref={chartRef}
            $color={color}
            $colorValues={colorValues}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <path d={path} />
            <circle
              cx={xScale(normalizedData.length - 1)}
              cy={yScale(normalizedData[normalizedData.length - 1].y)}
              r="3"
            />
          </SparklineChart>
        );
      }

      case 'line':
      default: {
        // Generate line path
        let path = `M${xScale(0)},${yScale(normalizedData[0].y)} `;
        path += normalizedData
          .slice(1)
          .map((data, i) => `L${xScale(i + 1)},${yScale(data.y)}`)
          .join(' ');

        return (
          <LineChart
            ref={chartRef}
            $color={color}
            $colorValues={colorValues}
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <path d={path} />
          </LineChart>
        );
      }
    }
  };

  // Handle mouse interactions
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTooltipInfo(prev => ({ ...prev, visible: false }));
  };

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || !showTooltip) return;

    // Get mouse position relative to chart
    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find closest data point
    const width = rect.width;
    const pointIndex = Math.min(
      normalizedData.length - 1,
      Math.max(0, Math.round((mouseX / width) * (normalizedData.length - 1)))
    );

    const dataPoint = normalizedData[pointIndex];
    const displayValue =
      typeof value === 'number' ? formatValue(dataPoint.y, valueFormat) : dataPoint.y.toString();

    // Calculate point position
    const xPos = (width / (normalizedData.length - 1)) * pointIndex;
    const height = rect.height;
    const yPos = height - ((dataPoint.y - minValue) / (maxValue - minValue)) * height;

    setTooltipInfo({
      x: xPos,
      y: yPos,
      value: `${displayValue}${unit ? ` ${unit}` : ''}`,
      visible: true,
    });
  };

  const handleChartMouseLeave = () => {
    setTooltipInfo(prev => ({ ...prev, visible: false }));
  };

  return (
    <CardRoot
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      $glass={glass}
      $color={color}
      $colorValues={colorValues}
      $size={size}
      $fullWidth={fullWidth}
      $elevation={elevation}
      $borderRadius={borderRadius}
      $hover={hover}
      $align={align}
      $clickable={!!onClick}
      $interactive={interactive}
      $isHovered={isHovered}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      <CardContent>
        {icon && (
          <IconContainer $size={size} $color={color} $colorValues={colorValues}>
            {icon}
          </IconContainer>
        )}

        <Title $size={size}>{title}</Title>

        <ValueContainer $size={size} $align={align}>
          <Value $size={size} $color={color} $colorValues={colorValues}>
            {formattedValue}
            {unit && <Unit>{unit}</Unit>}
          </Value>
        </ValueContainer>

        {subtitle && <Subtitle $size={size}>{subtitle}</Subtitle>}

        {(change !== undefined || period) && (
          <ChangePeriodContainer>
            {change !== undefined && (
              <ChangeValue $value={change} $positiveIsGood={positiveIsGood} $size={size}>
                {formattedChange}
              </ChangeValue>
            )}

            {period && <Period $size={size}>{period}</Period>}
          </ChangePeriodContainer>
        )}

        {chartData.length > 0 && (
          <ChartContainer
            $size={size}
            $chartType={chartType}
            $animateOnHover={animateOnHover}
            $isHovered={isHovered}
            $reducedMotion={prefersReducedMotion}
          >
            {renderChart()}

            {tooltipInfo.visible && (
              <Tooltip $x={tooltipInfo.x} $y={tooltipInfo.y} $visible={tooltipInfo.visible}>
                {tooltipInfo.value}
              </Tooltip>
            )}
          </ChartContainer>
        )}

        {(footer || children) && <Footer>{footer || children}</Footer>}
      </CardContent>
    </CardRoot>
  );
}

/**
 * InteractiveKpiCard Component
 *
 * A KPI card with an interactive mini chart for data visualization.
 */
const InteractiveKpiCard = forwardRef(InteractiveKpiCardComponent);

/**
 * GlassInteractiveKpiCard Component
 *
 * Glass variant of the InteractiveKpiCard component.
 */
const GlassInteractiveKpiCard = forwardRef<HTMLDivElement, InteractiveKpiCardProps>(
  (props, ref) => <InteractiveKpiCard {...props} glass={true} ref={ref} />
);

GlassInteractiveKpiCard.displayName = 'GlassInteractiveKpiCard';

export default InteractiveKpiCard;
export { InteractiveKpiCard, GlassInteractiveKpiCard };
