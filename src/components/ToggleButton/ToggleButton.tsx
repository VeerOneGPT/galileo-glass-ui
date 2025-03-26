/**
 * Glass ToggleButton Component
 * 
 * A button that can be toggled on/off, with glass morphism styling.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { ToggleButtonProps } from './types';

// Get color values based on theme color
const getColorValues = (
  color: string,
  variant: string
): { bg: string; border: string; text: string; hoverBg: string; activeBg: string; selectedBg: string } => {
  let bg, border, text, hoverBg, activeBg, selectedBg;
  
  switch (color) {
    case 'primary':
      bg = variant === 'contained' ? 'rgba(99, 102, 241, 0.9)' : 'transparent';
      border = 'rgba(99, 102, 241, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(99, 102, 241, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(79, 82, 221, 0.9)' : 'rgba(99, 102, 241, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(69, 72, 211, 0.9)' : 'rgba(99, 102, 241, 0.15)';
      selectedBg = variant === 'contained' ? 'rgba(69, 72, 211, 0.9)' : 'rgba(99, 102, 241, 0.2)';
      break;
    case 'secondary':
      bg = variant === 'contained' ? 'rgba(156, 39, 176, 0.9)' : 'transparent';
      border = 'rgba(156, 39, 176, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(156, 39, 176, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(136, 19, 156, 0.9)' : 'rgba(156, 39, 176, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(116, 9, 136, 0.9)' : 'rgba(156, 39, 176, 0.15)';
      selectedBg = variant === 'contained' ? 'rgba(116, 9, 136, 0.9)' : 'rgba(156, 39, 176, 0.2)';
      break;
    case 'error':
      bg = variant === 'contained' ? 'rgba(240, 82, 82, 0.9)' : 'transparent';
      border = 'rgba(240, 82, 82, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(240, 82, 82, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(220, 62, 62, 0.9)' : 'rgba(240, 82, 82, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(200, 42, 42, 0.9)' : 'rgba(240, 82, 82, 0.15)';
      selectedBg = variant === 'contained' ? 'rgba(200, 42, 42, 0.9)' : 'rgba(240, 82, 82, 0.2)';
      break;
    case 'info':
      bg = variant === 'contained' ? 'rgba(3, 169, 244, 0.9)' : 'transparent';
      border = 'rgba(3, 169, 244, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(3, 169, 244, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(0, 149, 224, 0.9)' : 'rgba(3, 169, 244, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(0, 129, 204, 0.9)' : 'rgba(3, 169, 244, 0.15)';
      selectedBg = variant === 'contained' ? 'rgba(0, 129, 204, 0.9)' : 'rgba(3, 169, 244, 0.2)';
      break;
    case 'success':
      bg = variant === 'contained' ? 'rgba(76, 175, 80, 0.9)' : 'transparent';
      border = 'rgba(76, 175, 80, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(76, 175, 80, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(56, 155, 60, 0.9)' : 'rgba(76, 175, 80, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(36, 135, 40, 0.9)' : 'rgba(76, 175, 80, 0.15)';
      selectedBg = variant === 'contained' ? 'rgba(36, 135, 40, 0.9)' : 'rgba(76, 175, 80, 0.2)';
      break;
    case 'warning':
      bg = variant === 'contained' ? 'rgba(255, 152, 0, 0.9)' : 'transparent';
      border = 'rgba(255, 152, 0, 0.7)';
      text = variant === 'contained' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 152, 0, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(235, 132, 0, 0.9)' : 'rgba(255, 152, 0, 0.1)';
      activeBg = variant === 'contained' ? 'rgba(215, 112, 0, 0.9)' : 'rgba(255, 152, 0, 0.15)';
      selectedBg = variant === 'contained' ? 'rgba(215, 112, 0, 0.9)' : 'rgba(255, 152, 0, 0.2)';
      break;
    case 'default':
    default:
      bg = variant === 'contained' ? 'rgba(66, 66, 66, 0.9)' : 'transparent';
      border = 'rgba(255, 255, 255, 0.23)';
      text = 'rgba(255, 255, 255, 0.9)';
      hoverBg = variant === 'contained' ? 'rgba(80, 80, 80, 0.9)' : 'rgba(255, 255, 255, 0.08)';
      activeBg = variant === 'contained' ? 'rgba(90, 90, 90, 0.9)' : 'rgba(255, 255, 255, 0.12)';
      selectedBg = variant === 'contained' ? 'rgba(90, 90, 90, 0.9)' : 'rgba(255, 255, 255, 0.16)';
  }
  
  return { bg, border, text, hoverBg, activeBg, selectedBg };
};

// Styled components
const ButtonRoot = styled.button<{
  $selected: boolean;
  $disabled: boolean;
  $glass: boolean;
  $color: string;
  $size: 'small' | 'medium' | 'large';
  $fullWidth: boolean;
  $variant: 'text' | 'outlined' | 'contained';
  $colorValues: { bg: string; border: string; text: string; hoverBg: string; activeBg: string; selectedBg: string };
  $grouped: boolean;
  $groupOrientation?: 'horizontal' | 'vertical';
  $isGroupStart?: boolean;
  $isGroupEnd?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: 0;
  border: 0;
  margin: 0;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  user-select: none;
  vertical-align: middle;
  appearance: none;
  text-decoration: none;
  font-weight: 500;
  font-size: ${props => props.$size === 'small' ? '0.8125rem' : 
                         props.$size === 'large' ? '0.9375rem' : 
                         '0.875rem'};
  line-height: 1.75;
  min-width: 64px;
  padding: ${props => props.$size === 'small' ? '4px 10px' : 
                      props.$size === 'large' ? '8px 22px' : 
                      '6px 16px'};
  border-radius: ${props => props.$grouped ? (
    props.$groupOrientation === 'vertical' ? (
      props.$isGroupStart ? '4px 4px 0 0' :
      props.$isGroupEnd ? '0 0 4px 4px' :
      '0'
    ) : (
      props.$isGroupStart ? '4px 0 0 4px' :
      props.$isGroupEnd ? '0 4px 4px 0' :
      '0'
    )
  ) : '4px'};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  transition: background-color 0.3s, box-shadow 0.3s, border-color 0.3s, color 0.3s;
  
  /* Base styling based on variant */
  background-color: ${props => props.$selected ? props.$colorValues.selectedBg : props.$colorValues.bg};
  color: ${props => props.$colorValues.text};
  
  /* Border styling */
  border: ${props => props.$variant === 'outlined' ? `1px solid ${props.$colorValues.border}` : 'none'};
  
  /* Glass styling */
  ${props => props.$glass && glassSurface({
    elevation: props.$selected ? 2 : 1,
    blurStrength: props.$variant === 'contained' ? 'standard' : 'light',
    borderOpacity: props.$variant === 'outlined' ? 'medium' : 'subtle',
    themeContext: createThemeContext(props.theme)
  })}
  
  /* Glass variant additional styling */
  ${props => props.$glass && props.$variant === 'contained' && `
    background-color: ${props.$selected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'};
  `}
  
  ${props => props.$glass && props.$variant === 'outlined' && `
    border: 1px solid rgba(255, 255, 255, 0.23);
  `}
  
  /* Selected state */
  ${props => props.$selected && !props.$disabled && `
    box-shadow: ${props.$glass ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 4px rgba(0, 0, 0, 0.2)'};
  `}
  
  /* Hover state */
  &:hover {
    ${props => !props.$disabled && `
      background-color: ${props.$selected ? props.$colorValues.selectedBg : props.$colorValues.hoverBg};
      ${props.$variant === 'outlined' && !props.$glass ? `border-color: ${props.$colorValues.border};` : ''}
    `}
  }
  
  /* Active state */
  &:active {
    ${props => !props.$disabled && `
      background-color: ${props.$colorValues.activeBg};
    `}
  }
  
  /* Disabled state */
  ${props => props.$disabled && `
    color: rgba(255, 255, 255, 0.4);
    background-color: ${props.$variant === 'contained' ? 'rgba(50, 50, 50, 0.5)' : 'transparent'};
    border-color: ${props.$variant === 'outlined' ? 'rgba(255, 255, 255, 0.12)' : 'transparent'};
    pointer-events: none;
    box-shadow: none;
    opacity: 0.6;
  `}
  
  /* Group styling */
  ${props => props.$grouped && `
    ${props.$groupOrientation === 'horizontal' ? `
      &:not(:first-of-type) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        ${props.$variant === 'outlined' && `border-left: ${props.$selected ? '1px solid transparent' : 'none'};`}
      }
      
      &:not(:last-of-type) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    ` : `
      &:not(:first-of-type) {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        ${props.$variant === 'outlined' && `border-top: ${props.$selected ? '1px solid transparent' : 'none'};`}
      }
      
      &:not(:last-of-type) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }
    `}
  `}
`;

/**
 * ToggleButton Component Implementation
 */
function ToggleButtonComponent(
  props: ToggleButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const {
    value,
    selected = false,
    disabled = false,
    onChange,
    children,
    className,
    style,
    glass = false,
    color = 'default',
    size = 'medium',
    fullWidth = false,
    variant = 'outlined',
    // Group props passed from ToggleButtonGroup
    grouped = false,
    groupOrientation = 'horizontal',
    isGroupStart = false,
    isGroupEnd = false,
    ...rest
  } = props;
  
  // Get color values
  const colorValues = getColorValues(color, variant);
  
  // Handle click event
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    if (onChange) {
      onChange(event, value);
    }
  };
  
  return (
    <ButtonRoot
      ref={ref}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      style={style}
      $selected={selected}
      $disabled={disabled}
      $glass={glass}
      $color={color}
      $size={size}
      $fullWidth={fullWidth}
      $variant={variant}
      $colorValues={colorValues}
      $grouped={grouped}
      $groupOrientation={groupOrientation}
      $isGroupStart={isGroupStart}
      $isGroupEnd={isGroupEnd}
      {...rest}
    >
      {children}
    </ButtonRoot>
  );
}

/**
 * ToggleButton Component
 * 
 * A button that can be toggled on/off, with glass morphism styling.
 */
const ToggleButton = forwardRef(ToggleButtonComponent);

/**
 * GlassToggleButton Component
 * 
 * Glass variant of the ToggleButton component.
 */
const GlassToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>((props, ref) => (
  <ToggleButton {...props} glass={true} ref={ref} />
));

GlassToggleButton.displayName = 'GlassToggleButton';

export default ToggleButton;
export { ToggleButton, GlassToggleButton };