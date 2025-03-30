/**
 * Glass KPI Card Component
 *
 * A card displaying key performance indicators with glass morphism styling.
 */
import React, { forwardRef } from 'react';
import styled, { useTheme } from 'styled-components';

import DimensionalGlass from '../surfaces/DimensionalGlass';
import { AnimationProps } from '../../animations/types';

import { KpiCardProps } from './types';

// Styled components
const IconContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $textColor: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: ${props => props.$textColor};

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
  $textColor: string;
}>`
  font-size: ${props =>
    props.$size === 'small' ? '1.5rem' : props.$size === 'large' ? '2.5rem' : '2rem'};
  font-weight: 600;
  color: ${props => props.$textColor};
  line-height: 1.2;
`;

const Prefix = styled.span`
  font-weight: 500;
  margin-right: 4px;
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
  theme?: any;
}>`
  display: flex;
  align-items: center;
  font-size: ${props =>
    props.$size === 'small' ? '0.75rem' : props.$size === 'large' ? '0.875rem' : '0.8125rem'};
  font-weight: 500;
  color: ${props => {
    const isPositive = props.$value >= 0;
    const goodColor = props.theme?.colors?.success?.main || 'rgba(76, 175, 80, 1)';
    const badColor = props.theme?.colors?.error?.main || 'rgba(240, 82, 82, 1)';
    if (props.$positiveIsGood) {
      return isPositive ? goodColor : badColor;
    } else {
      return isPositive ? badColor : goodColor;
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
 * KpiCard Component Implementation
 */
function KpiCardComponent(props: KpiCardProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    title,
    value,
    subtitle,
    icon,
    className,
    style,
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
    valueFormat,
    unit,
    change,
    changeFormat,
    positiveIsGood = true,
    period,
    prefix,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const theme = useTheme();

  // Format values
  const formattedValue = typeof value === 'number' ? formatValue(value, valueFormat) : value;
  const formattedChange =
    change !== undefined ? formatValue(change, changeFormat || '+0.0%') : undefined;

  // Get the specific text color from theme or fallback
  const textColor = React.useMemo(() => {
    const defaultText = 'rgba(255, 255, 255, 0.9)';
    const colorTheme = theme?.colors?.[color];
    return typeof colorTheme?.main === 'string' ? colorTheme.main : defaultText;
  }, [theme, color]);

  return (
    <DimensionalGlass
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
      elevation={elevation}
      borderRadius={borderRadius}
      interactive={hover}
      padding={size === 'small' ? 16 : size === 'large' ? 32 : 24}
      depth={0.5}
      parallax={true}
      dynamicShadow={true}
      fullWidth={fullWidth}
      animationConfig={animationConfig}
      disableAnimation={disableAnimation}
      motionSensitivity={motionSensitivity}
      {...rest}
    >
      {icon && (
        <IconContainer $size={size} $textColor={textColor}>
          {icon}
        </IconContainer>
      )}

      <Title $size={size}>{title}</Title>

      <ValueContainer $size={size} $align={align}>
        {prefix && <Prefix>{prefix}</Prefix>}
        <Value $size={size} $textColor={textColor}>
          {formattedValue}
        </Value>
        {unit && <Unit>{unit}</Unit>}
      </ValueContainer>

      {subtitle && <Subtitle $size={size}>{subtitle}</Subtitle>}

      {(change !== undefined || period) && (
        <ChangePeriodContainer>
          {change !== undefined && (
            <ChangeValue $value={change} $positiveIsGood={positiveIsGood} $size={size} theme={theme}>
              {formattedChange}
            </ChangeValue>
          )}

          {period && <Period $size={size}>{period}</Period>}
        </ChangePeriodContainer>
      )}

      {(footer || children) && <Footer>{footer || children}</Footer>}
    </DimensionalGlass>
  );
}

/**
 * KpiCard Component
 *
 * A card displaying key performance indicators.
 */
const KpiCard = forwardRef(KpiCardComponent);

export default KpiCard;
export { KpiCard };
