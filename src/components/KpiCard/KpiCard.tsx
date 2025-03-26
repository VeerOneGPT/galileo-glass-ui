/**
 * Glass KPI Card Component
 * 
 * A card displaying key performance indicators with glass morphism styling.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { KpiCardProps } from './types';

// Get color values based on theme color
const getColorValues = (
  color: string
): { bg: string; border: string; text: string; accent: string } => {
  switch (color) {
    case 'primary':
      return {
        bg: 'rgba(99, 102, 241, 0.05)',
        border: 'rgba(99, 102, 241, 0.4)',
        text: 'rgba(99, 102, 241, 1)',
        accent: 'rgba(99, 102, 241, 0.8)'
      };
    case 'secondary':
      return {
        bg: 'rgba(156, 39, 176, 0.05)',
        border: 'rgba(156, 39, 176, 0.4)',
        text: 'rgba(156, 39, 176, 1)',
        accent: 'rgba(156, 39, 176, 0.8)'
      };
    case 'error':
      return {
        bg: 'rgba(240, 82, 82, 0.05)',
        border: 'rgba(240, 82, 82, 0.4)',
        text: 'rgba(240, 82, 82, 1)',
        accent: 'rgba(240, 82, 82, 0.8)'
      };
    case 'info':
      return {
        bg: 'rgba(3, 169, 244, 0.05)',
        border: 'rgba(3, 169, 244, 0.4)',
        text: 'rgba(3, 169, 244, 1)',
        accent: 'rgba(3, 169, 244, 0.8)'
      };
    case 'success':
      return {
        bg: 'rgba(76, 175, 80, 0.05)',
        border: 'rgba(76, 175, 80, 0.4)',
        text: 'rgba(76, 175, 80, 1)',
        accent: 'rgba(76, 175, 80, 0.8)'
      };
    case 'warning':
      return {
        bg: 'rgba(255, 152, 0, 0.05)',
        border: 'rgba(255, 152, 0, 0.4)',
        text: 'rgba(255, 152, 0, 1)',
        accent: 'rgba(255, 152, 0, 0.8)'
      };
    case 'default':
    default:
      return {
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.2)',
        text: 'rgba(255, 255, 255, 0.9)',
        accent: 'rgba(255, 255, 255, 0.6)'
      };
  }
};

// Styled components
const CardRoot = styled.div<{
  $glass: boolean;
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string };
  $size: 'small' | 'medium' | 'large';
  $fullWidth: boolean;
  $elevation: number;
  $borderRadius: number | string;
  $hover: boolean;
  $align: 'left' | 'center' | 'right';
  $clickable: boolean;
}>`
  display: flex;
  flex-direction: column;
  padding: ${props => 
    props.$size === 'small' ? '12px 16px' : 
    props.$size === 'large' ? '24px 32px' : 
    '16px 24px'
  };
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  min-width: ${props => 
    props.$size === 'small' ? '200px' : 
    props.$size === 'large' ? '320px' : 
    '240px'
  };
  height: auto;
  border-radius: ${props => typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  text-align: ${props => props.$align};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
  
  /* Glass styling */
  ${props => props.$glass && glassSurface({
    elevation: props.$elevation,
    blurStrength: 'standard',
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  
  /* Non-glass styling */
  ${props => !props.$glass && `
    background-color: ${props.$colorValues.bg};
    border: 1px solid ${props.$colorValues.border};
    box-shadow: ${
      props.$elevation === 0 ? 'none' :
      props.$elevation === 1 ? '0 2px 4px rgba(0, 0, 0, 0.1)' :
      props.$elevation === 2 ? '0 3px 6px rgba(0, 0, 0, 0.15)' :
      props.$elevation === 3 ? '0 5px 10px rgba(0, 0, 0, 0.2)' :
      props.$elevation === 4 ? '0 8px 16px rgba(0, 0, 0, 0.25)' :
      '0 12px 24px rgba(0, 0, 0, 0.3)'
    };
  `}
  
  /* Hover effect */
  ${props => props.$hover && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${
        props.$glass ? '' :
        props.$elevation === 0 ? '0 2px 4px rgba(0, 0, 0, 0.1)' :
        props.$elevation === 1 ? '0 4px 8px rgba(0, 0, 0, 0.15)' :
        props.$elevation === 2 ? '0 6px 12px rgba(0, 0, 0, 0.2)' :
        props.$elevation === 3 ? '0 8px 16px rgba(0, 0, 0, 0.25)' :
        props.$elevation === 4 ? '0 12px 24px rgba(0, 0, 0, 0.3)' :
        '0 16px 32px rgba(0, 0, 0, 0.35)'
      };
    }
  `}
`;

const IconContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string };
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: ${props => props.$colorValues.text};
  
  /* Size variations */
  font-size: ${props => 
    props.$size === 'small' ? '1.5rem' : 
    props.$size === 'large' ? '2.5rem' : 
    '2rem'
  };
`;

const Title = styled.h3<{
  $size: 'small' | 'medium' | 'large';
}>`
  margin: 0;
  font-size: ${props => 
    props.$size === 'small' ? '0.875rem' : 
    props.$size === 'large' ? '1.25rem' : 
    '1rem'
  };
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
    props.$align === 'left' ? 'flex-start' : 
    props.$align === 'right' ? 'flex-end' : 
    'center'
  };
  margin-bottom: 4px;
`;

const Value = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $color: string;
  $colorValues: { bg: string; border: string; text: string; accent: string };
}>`
  font-size: ${props => 
    props.$size === 'small' ? '1.5rem' : 
    props.$size === 'large' ? '2.5rem' : 
    '2rem'
  };
  font-weight: 600;
  color: ${props => props.$colorValues.text};
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
    props.$size === 'small' ? '0.75rem' : 
    props.$size === 'large' ? '0.875rem' : 
    '0.8125rem'
  };
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
    props.$size === 'small' ? '0.75rem' : 
    props.$size === 'large' ? '0.875rem' : 
    '0.8125rem'
  };
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
    props.$size === 'small' ? '0.75rem' : 
    props.$size === 'large' ? '0.875rem' : 
    '0.8125rem'
  };
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
function KpiCardComponent(
  props: KpiCardProps,
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
    valueFormat,
    unit,
    change,
    changeFormat,
    positiveIsGood = true,
    period,
    prefix,
    ...rest
  } = props;
  
  // Get color values
  const colorValues = getColorValues(color);
  
  // Format the value
  const formattedValue = typeof value === 'number' ? formatValue(value, valueFormat) : value;
  
  // Format the change
  const formattedChange = change !== undefined ? formatValue(change, changeFormat || '+0.0%') : undefined;
  
  return (
    <CardRoot
      ref={ref}
      className={className}
      style={style}
      onClick={onClick}
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
      {...rest}
    >
      {icon && (
        <IconContainer 
          $size={size}
          $color={color}
          $colorValues={colorValues}
        >
          {icon}
        </IconContainer>
      )}
      
      <Title $size={size}>
        {title}
      </Title>
      
      <ValueContainer $size={size} $align={align}>
        {prefix && <Prefix>{prefix}</Prefix>}
        <Value 
          $size={size}
          $color={color}
          $colorValues={colorValues}
        >
          {formattedValue}
        </Value>
        {unit && <Unit>{unit}</Unit>}
      </ValueContainer>
      
      {subtitle && (
        <Subtitle $size={size}>
          {subtitle}
        </Subtitle>
      )}
      
      {(change !== undefined || period) && (
        <ChangePeriodContainer>
          {change !== undefined && (
            <ChangeValue 
              $value={change}
              $positiveIsGood={positiveIsGood}
              $size={size}
            >
              {formattedChange}
            </ChangeValue>
          )}
          
          {period && (
            <Period $size={size}>
              {period}
            </Period>
          )}
        </ChangePeriodContainer>
      )}
      
      {(footer || children) && (
        <Footer>
          {footer || children}
        </Footer>
      )}
    </CardRoot>
  );
}

/**
 * KpiCard Component
 * 
 * A card displaying key performance indicators.
 */
const KpiCard = forwardRef(KpiCardComponent);

/**
 * GlassKpiCard Component
 * 
 * Glass variant of the KpiCard component.
 */
const GlassKpiCard = forwardRef<HTMLDivElement, KpiCardProps>((props, ref) => (
  <KpiCard {...props} glass={true} ref={ref} />
));

GlassKpiCard.displayName = 'GlassKpiCard';

export default KpiCard;
export { KpiCard, GlassKpiCard };