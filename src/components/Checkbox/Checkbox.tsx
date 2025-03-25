import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { innerGlow } from '../../core/mixins/effects/innerEffects';
import { accessibleAnimation } from '../../animations/animationUtils';
import { fadeIn, scaleIn } from '../../animations/keyframes/basic';

// Checkbox props interface
export interface CheckboxProps {
  /**
   * If true, the checkbox is checked
   */
  checked?: boolean;
  
  /**
   * The default checked state
   */
  defaultChecked?: boolean;
  
  /**
   * If true, the checkbox is disabled
   */
  disabled?: boolean;
  
  /**
   * If true, the checkbox is indeterminate
   */
  indeterminate?: boolean;
  
  /**
   * The id for the input
   */
  id?: string;
  
  /**
   * The name for the input
   */
  name?: string;
  
  /**
   * Change handler
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  
  /**
   * The size of the checkbox
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * The color of the checkbox
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  
  /**
   * The value of the checkbox
   */
  value?: string;
  
  /**
   * The label for the checkbox
   */
  label?: string;
  
  /**
   * The position of the label
   */
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';
  
  /**
   * If true, the checkbox will have a glass effect
   */
  glass?: boolean;
  
  /**
   * Additional CSS class name
   */
  className?: string;
}

// Get the checkbox color
const getCheckboxColor = (color: string): string => {
  switch (color) {
    case 'primary': return '#6366F1';
    case 'secondary': return '#8B5CF6';
    case 'error': return '#EF4444';
    case 'warning': return '#F59E0B';
    case 'info': return '#3B82F6';
    case 'success': return '#10B981';
    default: return '#6366F1';
  }
};

// Get the checkbox size
const getCheckboxSize = (size: string): number => {
  switch (size) {
    case 'small': return 16;
    case 'large': return 24;
    default: return 20;
  }
};

// CheckIcon component
const CheckIcon = ({ color }: { color: string }) => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" 
      fill="currentColor" 
    />
  </svg>
);

// IndeterminateIcon component
const IndeterminateIcon = ({ color }: { color: string }) => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M19 13H5v-2h14v2z" 
      fill="currentColor" 
    />
  </svg>
);

// Container for the checkbox and label
const CheckboxContainer = styled.label<{
  $labelPlacement: string;
  $disabled: boolean;
}>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  user-select: none;
  vertical-align: middle;
  -webkit-tap-highlight-color: transparent;
  
  /* Label placement */
  ${props => {
    switch (props.$labelPlacement) {
      case 'start':
        return `
          flex-direction: row-reverse;
          & > span:last-child {
            margin-right: 8px;
          }
        `;
      case 'top':
        return `
          flex-direction: column-reverse;
          & > span:last-child {
            margin-bottom: 4px;
          }
        `;
      case 'bottom':
        return `
          flex-direction: column;
          & > span:last-child {
            margin-top: 4px;
          }
        `;
      case 'end':
      default:
        return `
          flex-direction: row;
          & > span:last-child {
            margin-left: 8px;
          }
        `;
    }
  }}
  
  /* Disabled state */
  ${props => props.$disabled && `
    opacity: 0.5;
    pointer-events: none;
  `}
  
  /* Animation */
  ${accessibleAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out'
  })}
`;

// The checkbox input (hidden)
const HiddenInput = styled.input`
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
`;

// The visible checkbox
const CheckboxControl = styled.span<{
  $checked: boolean;
  $disabled: boolean;
  $size: string;
  $color: string;
  $glass: boolean;
  $indeterminate: boolean;
}>`
  /* Base styles */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => `${getCheckboxSize(props.$size)}px`};
  height: ${props => `${getCheckboxSize(props.$size)}px`};
  color: ${props => props.$checked || props.$indeterminate 
    ? 'white' 
    : 'rgba(255, 255, 255, 0.7)'};
  border-radius: 4px;
  transition: all 0.2s ease;
  background-color: ${props => (props.$checked || props.$indeterminate) 
    ? getCheckboxColor(props.$color) 
    : 'transparent'};
  border: ${props => (props.$checked || props.$indeterminate) 
    ? `2px solid ${getCheckboxColor(props.$color)}` 
    : '2px solid rgba(255, 255, 255, 0.5)'};
  
  /* Glass effect */
  ${props => props.$glass && (props.$checked || props.$indeterminate) && innerGlow({
    color: props.$color,
    intensity: 'subtle',
    spread: 3,
    themeContext: createThemeContext({}) // In real usage, this would use props.theme
  })}
  
  /* Check/indeterminate icon animation */
  & > svg {
    opacity: ${props => (props.$checked || props.$indeterminate) ? 1 : 0};
    transform: ${props => (props.$checked || props.$indeterminate) ? 'scale(1)' : 'scale(0.8)'};
    transition: all 0.2s ease;
  }
  
  /* Hover effect */
  ${props => !props.$disabled && `
    &:hover {
      background-color: ${(props.$checked || props.$indeterminate) 
        ? getCheckboxColor(props.$color) 
        : 'rgba(255, 255, 255, 0.08)'};
      border-color: ${(props.$checked || props.$indeterminate) 
        ? getCheckboxColor(props.$color) 
        : 'rgba(255, 255, 255, 0.7)'};
    }
  `}
  
  /* Focus effect */
  input:focus-visible + & {
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
  }
`;

// Label text
const LabelText = styled.span`
  font-size: 0.875rem;
  line-height: 1.5;
`;

/**
 * Checkbox Component
 * 
 * A checkbox input component.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const {
    checked,
    defaultChecked,
    disabled = false,
    indeterminate = false,
    id,
    name,
    onChange,
    size = 'medium',
    color = 'primary',
    value,
    label,
    labelPlacement = 'end',
    glass = false,
    className,
    ...rest
  } = props;
  
  // Internal state for uncontrolled component
  const [internalChecked, setInternalChecked] = useState(defaultChecked || false);
  
  // Determine if checkbox is checked (controlled or uncontrolled)
  const isChecked = checked !== undefined ? checked : internalChecked;
  
  // Handle change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // For uncontrolled component
    if (checked === undefined) {
      setInternalChecked(event.target.checked);
    }
    
    // Call onChange handler
    if (onChange) {
      onChange(event, event.target.checked);
    }
  };
  
  // Generate a unique ID for the input if not provided
  const inputId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <CheckboxContainer
      htmlFor={inputId}
      className={className}
      $labelPlacement={labelPlacement}
      $disabled={disabled}
    >
      <HiddenInput
        ref={ref}
        type="checkbox"
        id={inputId}
        name={name}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        value={value}
        {...rest}
      />
      
      <CheckboxControl
        $checked={isChecked}
        $disabled={disabled}
        $size={size}
        $color={color}
        $glass={glass}
        $indeterminate={indeterminate}
      >
        {indeterminate ? (
          <IndeterminateIcon color={getCheckboxColor(color)} />
        ) : (
          <CheckIcon color={getCheckboxColor(color)} />
        )}
      </CheckboxControl>
      
      {label && <LabelText>{label}</LabelText>}
    </CheckboxContainer>
  );
});

Checkbox.displayName = 'Checkbox';

/**
 * GlassCheckbox Component
 * 
 * A checkbox component with glass morphism styling.
 */
export const GlassCheckbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const {
    glass = true,
    className,
    ...rest
  } = props;
  
  // Add glass styling to the base checkbox
  return (
    <Checkbox
      ref={ref}
      glass={glass}
      className={`glass-checkbox ${className || ''}`}
      {...rest}
    />
  );
});

GlassCheckbox.displayName = 'GlassCheckbox';