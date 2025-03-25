import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';

export interface ChipProps {
  /**
   * The content of the chip
   */
  label: string;
  
  /**
   * The variant of the chip
   */
  variant?: 'filled' | 'outlined' | 'glass';
  
  /**
   * The color of the chip
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  
  /**
   * Icon element to display at the start of the chip
   */
  icon?: React.ReactNode;
  
  /**
   * If true, the chip will be rendered with a delete button
   */
  deletable?: boolean;
  
  /**
   * A function called when the delete button is clicked
   */
  onDelete?: (event: React.MouseEvent<HTMLElement>) => void;
  
  /**
   * A function called when the chip is clicked
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  
  /**
   * If true, the chip will be disabled
   */
  disabled?: boolean;
  
  /**
   * The size of the chip
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * If true, the chip will highlight on hover
   */
  interactive?: boolean;
  
  /**
   * The shape of the chip
   */
  shape?: 'rounded' | 'square';
  
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

// Styled components
const ChipRoot = styled.div<{
  $variant: string;
  $color: string;
  $disabled: boolean;
  $size: string;
  $interactive: boolean;
  $shape: string;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  border-radius: ${props => props.$shape === 'rounded' ? '16px' : '4px'};
  white-space: nowrap;
  cursor: ${props => {
    if (props.$disabled) return 'default';
    return props.$interactive ? 'pointer' : 'default';
  }};
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  user-select: none;
  
  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          height: 24px;
          font-size: 0.75rem;
          padding: 0 8px;
        `;
      case 'large':
        return `
          height: 32px;
          font-size: 0.875rem;
          padding: 0 14px;
        `;
      default: // medium
        return `
          height: 28px;
          font-size: 0.8125rem;
          padding: 0 12px;
        `;
    }
  }}
  
  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'outlined':
        return `
          background-color: transparent;
          border: 1px solid ${props.$color === 'default' ? 'rgba(0, 0, 0, 0.23)' : getColorByName(props.$color)};
          color: ${props.$color === 'default' ? 'rgba(0, 0, 0, 0.87)' : getColorByName(props.$color)};
        `;
      case 'glass':
        return `
          background-color: ${`${getColorByName(props.$color)}33`};
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid ${`${getColorByName(props.$color)}66`};
          color: ${props.$color === 'default' ? 'rgba(0, 0, 0, 0.87)' : getColorByName(props.$color)};
        `;
      default: // filled
        return `
          background-color: ${getColorByName(props.$color)};
          color: ${props.$color === 'default' ? 'rgba(0, 0, 0, 0.87)' : 'white'};
          border: none;
        `;
    }
  }}
  
  /* Glass effect for glass variant */
  ${props => props.$variant === 'glass' && !props.$disabled && glassSurface({
    elevation: 1,
    blurStrength: 'minimal',
    backgroundOpacity: 'low',
    borderOpacity: 'medium',
    themeContext: createThemeContext({})
  })}
  
  /* Interactive hover state */
  ${props => props.$interactive && !props.$disabled && `
    &:hover {
      ${props.$variant === 'filled' 
        ? `filter: brightness(1.1);` 
        : `background-color: rgba(0, 0, 0, 0.04);`
      }
    }
    
    &:active {
      ${props.$variant === 'filled' 
        ? `filter: brightness(0.9);` 
        : `background-color: rgba(0, 0, 0, 0.08);`
      }
    }
  `}
  
  /* Glass glow for glass variant */
  ${props => props.$variant === 'glass' && !props.$disabled && glassGlow({
    intensity: 'minimal',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
  
  /* Edge highlight for interactive chips */
  ${props => props.$interactive && !props.$disabled && props.$variant !== 'filled' && edgeHighlight({
    position: 'bottom',
    thickness: 1,
    color: props.$color,
    opacity: 0.6,
    themeContext: createThemeContext({})
  })}
`;

const ChipIcon = styled.span`
  display: flex;
  margin-right: 6px;
  margin-left: -4px;
`;

const ChipLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 2px;
  padding-right: 2px;
`;

const DeleteButton = styled.button<{
  $disabled: boolean;
  $color: string;
  $variant: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -6px;
  margin-left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$variant === 'filled' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  color: ${props => props.$variant === 'filled' ? 'white' : 'inherit'};
  border: none;
  padding: 0;
  font-size: 12px;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => !props.$disabled && (props.$variant === 'filled' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.2)')};
  }
  
  &:focus {
    outline: none;
  }
`;

/**
 * Chip Component
 * 
 * A compact element to display small pieces of information.
 */
export const Chip = forwardRef<HTMLDivElement, ChipProps>((props, ref) => {
  const {
    label,
    variant = 'filled',
    color = 'default',
    icon,
    deletable = false,
    onDelete,
    onClick,
    disabled = false,
    size = 'medium',
    interactive = false,
    shape = 'rounded',
    className,
    ...rest
  } = props;
  
  // Handle delete button click
  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (disabled) return;
    
    if (onDelete) {
      onDelete(event);
    }
  };
  
  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    if (onClick) {
      onClick(event);
    }
  };
  
  return (
    <ChipRoot
      ref={ref}
      className={className}
      $variant={variant}
      $color={color}
      $disabled={disabled}
      $size={size}
      $interactive={interactive || !!onClick}
      $shape={shape}
      onClick={handleClick}
      role={onClick ? 'button' : 'presentation'}
      tabIndex={onClick && !disabled ? 0 : undefined}
      {...rest}
    >
      {icon && <ChipIcon>{icon}</ChipIcon>}
      <ChipLabel>{label}</ChipLabel>
      {deletable && (
        <DeleteButton
          $disabled={disabled}
          $color={color}
          $variant={variant}
          onClick={handleDelete}
          aria-label="Remove"
          type="button"
        >
          ×
        </DeleteButton>
      )}
    </ChipRoot>
  );
});

Chip.displayName = 'Chip';

/**
 * GlassChip Component
 * 
 * A chip component with glass morphism styling.
 */
export const GlassChip = forwardRef<HTMLDivElement, ChipProps>((props, ref) => {
  const {
    className,
    variant = 'glass',
    ...rest
  } = props;
  
  return (
    <Chip
      ref={ref}
      className={`glass-chip ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassChip.displayName = 'GlassChip';