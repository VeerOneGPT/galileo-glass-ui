import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';

export interface BadgeProps {
  /**
   * The content to be displayed within the badge
   */
  content?: React.ReactNode;
  
  /**
   * The color of the badge
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  
  /**
   * The variant of the badge
   */
  variant?: 'standard' | 'dot' | 'glass';
  
  /**
   * The placement of the badge
   */
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  /**
   * The horizontal offset of the badge
   */
  offsetX?: number;
  
  /**
   * The vertical offset of the badge
   */
  offsetY?: number;
  
  /**
   * If true, the badge will be invisible
   */
  invisible?: boolean;
  
  /**
   * The maximum value to display. If the content value is greater than max, 
   * the badge will display `${max}+`
   */
  max?: number;
  
  /**
   * If true, the badge will show content as a notification dot without value
   */
  showDot?: boolean;
  
  /**
   * The size of the badge
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * If true, displays a border around the badge
   */
  bordered?: boolean;
  
  /**
   * The children wrapped by the badge, usually an icon or button
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

// Get color by name for theme consistency
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#E5E7EB'; // default light gray
  }
};

// Helper to get dot size based on badge size
const getDotSize = (size: string): number => {
  switch (size) {
    case 'small':
      return 6;
    case 'large':
      return 10;
    default: // medium
      return 8;
  }
};

// Helper to get badge size based on size prop
const getBadgeSize = (size: string): number => {
  switch (size) {
    case 'small':
      return 16;
    case 'large':
      return 24;
    default: // medium
      return 20;
  }
};

// Styled components
const BadgeContainer = styled.div`
  position: relative;
  display: inline-flex;
  vertical-align: middle;
`;

const BadgeWrapper = styled.span<{
  $variant: string;
  $color: string;
  $placement: string;
  $offsetX: number;
  $offsetY: number;
  $size: string;
  $invisible: boolean;
  $isDot: boolean;
  $bordered: boolean;
}>`
  position: absolute;
  display: flex;
  flex-flow: row wrap;
  place-content: center;
  align-items: center;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: ${props => props.$size === 'small' ? '0.6rem' : props.$size === 'large' ? '0.85rem' : '0.75rem'};
  min-width: ${props => props.$isDot ? 'auto' : `${getBadgeSize(props.$size)}px`};
  height: ${props => props.$isDot ? 'auto' : `${getBadgeSize(props.$size)}px`};
  padding: ${props => props.$isDot ? '0' : '0 6px'};
  color: ${props => props.$variant === 'standard' ? 'white' : 'inherit'};
  background-color: ${props => props.$variant === 'standard' ? getColorByName(props.$color) : 'transparent'};
  border-radius: ${props => props.$isDot ? '50%' : '10px'};
  opacity: ${props => props.$invisible ? 0 : 1};
  transform: scale(${props => props.$invisible ? 0 : 1});
  transform-origin: ${props => {
    if (props.$placement === 'top-left') return 'left top';
    if (props.$placement === 'bottom-left') return 'left bottom';
    if (props.$placement === 'bottom-right') return 'right bottom';
    return 'right top'; // default top-right
  }};
  transition: transform 0.2s ease, opacity 0.2s ease;
  
  /* Dot variant */
  ${props => props.$isDot && `
    width: ${getDotSize(props.$size)}px;
    height: ${getDotSize(props.$size)}px;
    background-color: ${getColorByName(props.$color)};
  `}
  
  /* Glass variant */
  ${props => props.$variant === 'glass' && !props.$isDot && `
    background-color: ${getColorByName(props.$color)}CC;
    color: white;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  `}
  
  /* Glass effect for glass variant */
  ${props => props.$variant === 'glass' && glassSurface({
    elevation: 1,
    blurStrength: 'minimal',
    backgroundOpacity: 'strong',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({})
  })}
  
  /* Glass glow for glass variant */
  ${props => props.$variant === 'glass' && glassGlow({
    glowIntensity: 'minimal',
    glowColor: props.$color,
    themeContext: createThemeContext({})
  })}
  
  /* Placement positioning */
  ${props => {
    switch (props.$placement) {
      case 'top-left':
        return `
          top: 0;
          left: 0;
          transform: translate(-50%, -50%) scale(${props.$invisible ? 0 : 1});
          margin-top: ${props.$offsetY}px;
          margin-left: ${props.$offsetX}px;
        `;
      case 'bottom-left':
        return `
          bottom: 0;
          left: 0;
          transform: translate(-50%, 50%) scale(${props.$invisible ? 0 : 1});
          margin-bottom: ${props.$offsetY}px;
          margin-left: ${props.$offsetX}px;
        `;
      case 'bottom-right':
        return `
          bottom: 0;
          right: 0;
          transform: translate(50%, 50%) scale(${props.$invisible ? 0 : 1});
          margin-bottom: ${props.$offsetY}px;
          margin-right: ${props.$offsetX}px;
        `;
      default: // top-right
        return `
          top: 0;
          right: 0;
          transform: translate(50%, -50%) scale(${props.$invisible ? 0 : 1});
          margin-top: ${props.$offsetY}px;
          margin-right: ${props.$offsetX}px;
        `;
    }
  }}
  
  /* Border */
  ${props => props.$bordered && `
    border: 2px solid white;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  `}
`;

/**
 * Badge Component
 * 
 * A component that generates a small badge that appears at the corner of its children.
 */
export const Badge = forwardRef<HTMLDivElement, BadgeProps>((props, ref) => {
  const {
    content,
    color = 'primary',
    variant = 'standard',
    placement = 'top-right',
    offsetX = 0,
    offsetY = 0,
    invisible = false,
    max = 99,
    showDot = false,
    size = 'medium',
    bordered = false,
    children,
    className,
    ...rest
  } = props;
  
  // Determine badge content
  const badgeContent = showDot ? null : (
    typeof content === 'number' && content > max ? `${max}+` : content
  );
  
  return (
    <BadgeContainer
      ref={ref}
      className={className}
      {...rest}
    >
      {children}
      
      <BadgeWrapper
        $variant={variant}
        $color={color}
        $placement={placement}
        $offsetX={offsetX}
        $offsetY={offsetY}
        $size={size}
        $invisible={invisible || (!showDot && (content === undefined || content === null || content === 0))}
        $isDot={showDot}
        $bordered={bordered}
      >
        {badgeContent}
      </BadgeWrapper>
    </BadgeContainer>
  );
});

Badge.displayName = 'Badge';

/**
 * GlassBadge Component
 * 
 * A badge component with glass morphism styling.
 */
export const GlassBadge = forwardRef<HTMLDivElement, BadgeProps>((props, ref) => {
  const {
    className,
    variant = 'glass',
    ...rest
  } = props;
  
  return (
    <Badge
      ref={ref}
      className={`glass-badge ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassBadge.displayName = 'GlassBadge';