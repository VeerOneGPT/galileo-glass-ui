/**
 * Performance Metric Card Component
 *
 * A KPI card focused on performance metrics with target values and progress indicators.
 */
import React, { forwardRef } from 'react';
import styled, { keyframes } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { PerformanceMetricCardProps } from './types';

// Get color values based on status
const getStatusColor = (
  status: string,
  higherIsBetter: boolean,
  value: number,
  target: number
): string => {
  // If status is explicitly provided, use it
  if (status !== 'neutral') {
    switch (status) {
      case 'success':
        return 'rgba(76, 175, 80, 1)';
      case 'warning':
        return 'rgba(255, 152, 0, 1)';
      case 'error':
        return 'rgba(240, 82, 82, 1)';
      case 'info':
        return 'rgba(3, 169, 244, 1)';
      default:
        return 'rgba(255, 255, 255, 0.7)';
    }
  }

  // Calculate status based on value vs target
  const ratio = value / target;
  const threshold = higherIsBetter ? ratio : 1 - ratio;

  if (threshold >= 0.9) {
    return 'rgba(76, 175, 80, 1)'; // Success (green)
  } else if (threshold >= 0.7) {
    return 'rgba(255, 152, 0, 1)'; // Warning (orange)
  } else {
    return 'rgba(240, 82, 82, 1)'; // Error (red)
  }
};

// Calculate progress percentage
const calculateProgress = (
  value: number,
  target: number,
  min: number,
  max: number,
  higherIsBetter: boolean
): number => {
  // Normalize to 0-100% range
  const normalizedValue = ((value - min) / (max - min)) * 100;
  const normalizedTarget = ((target - min) / (max - min)) * 100;

  // Cap at 0-100%
  const cappedValue = Math.max(0, Math.min(100, normalizedValue));

  // For metrics where lower is better, invert the percentage
  return higherIsBetter ? cappedValue : 100 - cappedValue;
};

// Pulse animation keyframes
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
`;

// Styled components
const CardRoot = styled.div<{
  $glass: boolean;
  $color: string;
  $size: 'small' | 'medium' | 'large';
  $fullWidth: boolean;
  $elevation: number;
  $borderRadius: number | string;
  $hover: boolean;
  $align: 'left' | 'center' | 'right';
  $clickable: boolean;
  $highlight: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  flex-direction: column;
  padding: ${props =>
    props.$size === 'small' ? '12px 16px' : props.$size === 'large' ? '24px 32px' : '16px 24px'};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  min-width: ${props =>
    props.$size === 'small' ? '200px' : props.$size === 'large' ? '320px' : '240px'};
  height: auto;
  border-radius: ${props =>
    typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  text-align: ${props => props.$align};
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: rgba(255, 255, 255, 0.9);

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
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
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
  
  /* Highlight pulse animation */
  ${props =>
    props.$highlight &&
    !props.$reducedMotion &&
    `
    animation: ${pulse} 2s infinite;
  `}
`;

const IconContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $statusColor: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: ${props => props.$statusColor};

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

const MetricsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Value = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $statusColor: string;
}>`
  font-size: ${props =>
    props.$size === 'small' ? '1.5rem' : props.$size === 'large' ? '2.5rem' : '2rem'};
  font-weight: 600;
  color: ${props => props.$statusColor};
  line-height: 1.2;
  display: flex;
  align-items: baseline;
`;

const Unit = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.6);
`;

const TargetValue = styled.div<{
  $size: 'small' | 'medium' | 'large';
}>`
  font-size: ${props =>
    props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '0.875rem' : '0.8125rem'};
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
`;

const Subtitle = styled.div<{
  $size: 'small' | 'medium' | 'large';
}>`
  font-size: ${props =>
    props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '0.875rem' : '0.8125rem'};
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
`;

const StatusIndicator = styled.div<{
  $statusColor: string;
  $size: 'small' | 'medium' | 'large';
}>`
  width: ${props => (props.$size === 'small' ? '12px' : props.$size === 'large' ? '16px' : '14px')};
  height: ${props =>
    props.$size === 'small' ? '12px' : props.$size === 'large' ? '16px' : '14px'};
  border-radius: 50%;
  background-color: ${props => props.$statusColor};
  margin-left: 12px;
`;

const ProgressContainer = styled.div`
  margin-top: 12px;
  width: 100%;
`;

const LinearProgress = styled.div<{
  $progress: number;
  $statusColor: string;
}>`
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => `${props.$progress}%`};
    background-color: ${props => props.$statusColor};
    border-radius: 4px;
    transition: width 0.5s ease;
  }
`;

const CircularProgress = styled.div<{
  $progress: number;
  $statusColor: string;
  $size: 'small' | 'medium' | 'large';
}>`
  width: ${props => (props.$size === 'small' ? '48px' : props.$size === 'large' ? '64px' : '56px')};
  height: ${props =>
    props.$size === 'small' ? '48px' : props.$size === 'large' ? '64px' : '56px'};
  border-radius: 50%;
  background: conic-gradient(
    ${props => props.$statusColor} ${props => props.$progress}%,
    rgba(255, 255, 255, 0.1) ${props => props.$progress}% 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '${props => Math.round(props.$progress)}%';
    position: absolute;
    font-size: ${props =>
      props.$size === 'small' ? '0.6rem' : props.$size === 'large' ? '0.875rem' : '0.75rem'};
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const GaugeProgress = styled.div<{
  $progress: number;
  $statusColor: string;
  $size: 'small' | 'medium' | 'large';
}>`
  width: ${props => (props.$size === 'small' ? '64px' : props.$size === 'large' ? '96px' : '80px')};
  height: ${props =>
    props.$size === 'small' ? '32px' : props.$size === 'large' ? '48px' : '40px'};
  position: relative;
  border-radius: ${props =>
    props.$size === 'small'
      ? '32px 32px 0 0'
      : props.$size === 'large'
      ? '48px 48px 0 0'
      : '40px 40px 0 0'};
  background-color: rgba(255, 255, 255, 0.1);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${props => props.$statusColor};
    clip-path: polygon(
      0% 100%,
      100% 100%,
      100% ${props => 100 - props.$progress}%,
      0% ${props => 100 - props.$progress}%
    );
  }

  &::before {
    content: '${props => Math.round(props.$progress)}%';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    font-size: ${props =>
      props.$size === 'small' ? '0.6rem' : props.$size === 'large' ? '0.875rem' : '0.75rem'};
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    z-index: 1;
  }
`;

const Period = styled.div<{
  $size: 'small' | 'medium' | 'large';
}>`
  font-size: ${props =>
    props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '0.875rem' : '0.8125rem'};
  color: rgba(255, 255, 255, 0.5);
  margin-top: 12px;
  text-align: right;
`;

const Footer = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

/**
 * Format a number according to a format string
 */
const formatValue = (value: number | undefined | null, format?: string): string => {
  // Handle undefined or null value
  if (value === undefined || value === null || isNaN(value)) {
    return '--'; // Or return 'N/A', '', etc.
  }

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
 * PerformanceMetricCard Component Implementation
 */
function PerformanceMetricCardComponent(
  props: PerformanceMetricCardProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    title,
    value,
    target,
    min = 0,
    max = Math.max(value, target) * 1.2, // Default max is 20% higher than the highest value
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
    higherIsBetter = true,
    valueFormat,
    unit,
    showProgress = true,
    progressType = 'linear',
    status = 'neutral',
    period,
    highlight = false,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Calculate progress percentage
  const progressPercentage = calculateProgress(value, target, min, max, higherIsBetter);

  // Determine status color
  const statusColor = getStatusColor(status, higherIsBetter, value, target);

  // Format the value
  const formattedValue = formatValue(value, valueFormat);

  // Format the target
  const formattedTarget = formatValue(target, valueFormat);

  // Render progress indicator based on type
  const renderProgress = () => {
    if (!showProgress) return null;

    switch (progressType) {
      case 'circular':
        return (
          <CircularProgress
            $progress={progressPercentage}
            $statusColor={statusColor}
            $size={size}
          />
        );
      case 'gauge':
        return (
          <GaugeProgress $progress={progressPercentage} $statusColor={statusColor} $size={size} />
        );
      case 'linear':
      default:
        return <LinearProgress $progress={progressPercentage} $statusColor={statusColor} />;
    }
  };

  return (
    <CardRoot
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
      $glass={glass}
      $color={color}
      $size={size}
      $fullWidth={fullWidth}
      $elevation={elevation}
      $borderRadius={borderRadius}
      $hover={hover}
      $align={align}
      $clickable={!!onClick}
      $highlight={highlight}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      {icon && (
        <IconContainer $size={size} $statusColor={statusColor}>
          {icon}
        </IconContainer>
      )}

      <Title $size={size}>{title}</Title>

      <MetricsContainer>
        <ValueContainer>
          <Value $size={size} $statusColor={statusColor}>
            {formattedValue}
            {unit && <Unit>{unit}</Unit>}
          </Value>

          <TargetValue $size={size}>
            Target: {formattedTarget}
            {unit && ` ${unit}`}
          </TargetValue>
        </ValueContainer>

        <StatusIndicator $statusColor={statusColor} $size={size} />
      </MetricsContainer>

      {subtitle && <Subtitle $size={size}>{subtitle}</Subtitle>}

      <ProgressContainer>{renderProgress()}</ProgressContainer>

      {period && <Period $size={size}>{period}</Period>}

      {(footer || children) && <Footer>{footer || children}</Footer>}
    </CardRoot>
  );
}

/**
 * PerformanceMetricCard Component
 *
 * A card focused on performance metrics with target values and progress indicators.
 */
const PerformanceMetricCard = forwardRef(PerformanceMetricCardComponent);

/**
 * GlassPerformanceMetricCard Component
 *
 * Glass variant of the PerformanceMetricCard component.
 */
const GlassPerformanceMetricCard = forwardRef<HTMLDivElement, PerformanceMetricCardProps>(
  (props, ref) => <PerformanceMetricCard {...props} glass={true} ref={ref} />
);

GlassPerformanceMetricCard.displayName = 'GlassPerformanceMetricCard';

export default PerformanceMetricCard;
export { PerformanceMetricCard, GlassPerformanceMetricCard };
