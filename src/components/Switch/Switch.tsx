import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';

import { accessibleAnimation } from '../../animations/animationUtils';
import { fadeIn } from '../../animations/keyframes/basic';
import { glassGlow } from '../../core/mixins/effects/glowEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

// Switch props interface
export interface SwitchProps {
  /**
   * If true, the switch is checked
   */
  checked?: boolean;

  /**
   * The default checked state
   */
  defaultChecked?: boolean;

  /**
   * If true, the switch is disabled
   */
  disabled?: boolean;

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
   * The size of the switch
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * The color of the switch
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

  /**
   * The value of the switch
   */
  value?: string;

  /**
   * The label for the switch
   */
  label?: string;

  /**
   * The position of the label
   */
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';

  /**
   * If true, the switch will have a glass effect
   */
  glass?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;
}

// Get the switch color
const getSwitchColor = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    case 'success':
      return '#10B981';
    default:
      return '#6366F1';
  }
};

// Get the switch dimensions
const getSwitchDimensions = (size: string) => {
  switch (size) {
    case 'small':
      return {
        width: 32,
        height: 16,
        thumbSize: 12,
        thumbOffset: 12,
      };
    case 'large':
      return {
        width: 56,
        height: 28,
        thumbSize: 22,
        thumbOffset: 22,
      };
    case 'medium':
    default:
      return {
        width: 44,
        height: 22,
        thumbSize: 16,
        thumbOffset: 16,
      };
  }
};

// Container for the switch and label
const SwitchContainer = styled.label<{
  $labelPlacement: string;
  $disabled: boolean;
}>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
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
  ${props =>
    props.$disabled &&
    `
    opacity: 0.5;
    pointer-events: none;
  `}
  
  /* Animation */
  ${accessibleAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out',
  })}
`;

// The switch input (hidden)
const HiddenInput = styled.input`
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
`;

// The visible switch track
const SwitchTrack = styled.span<{
  $checked: boolean;
  $disabled: boolean;
  $size: string;
  $color: string;
  $glass: boolean;
  $width: number;
  $height: number;
}>`
  /* Base styles */
  position: relative;
  display: inline-flex;
  width: ${props => `${props.$width}px`};
  height: ${props => `${props.$height}px`};
  border-radius: ${props => `${props.$height}px`};
  transition: all 0.2s ease;
  background-color: ${props =>
    props.$checked ? getSwitchColor(props.$color) : 'rgba(255, 255, 255, 0.2)'};

  /* Glass effect */
  ${props =>
    props.$glass &&
    props.$checked &&
    glassSurface({
      elevation: 1,
      blurStrength: 'light',
      backgroundOpacity: 'medium',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}), // In real usage, this would use props.theme
    })}

  ${props =>
    props.$glass &&
    props.$checked &&
    glassGlow({
      intensity: 'subtle',
      color: props.$color,
      themeContext: createThemeContext({}), // In real usage, this would use props.theme
    })}
  
  /* Hover effect */
  ${props =>
    !props.$disabled &&
    `
    &:hover {
      opacity: 0.9;
    }
  `}
  
  /* Focus effect */
  input:focus-visible + & {
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
  }
`;

// The visible switch thumb
const SwitchThumb = styled.span<{
  $checked: boolean;
  $size: string;
  $thumbSize: number;
  $thumbOffset: number;
}>`
  /* Base styles */
  position: absolute;
  display: block;
  top: 50%;
  transform: translateY(-50%)
    ${props => (props.$checked ? `translateX(${props.$thumbOffset}px)` : 'translateX(3px)')};
  width: ${props => `${props.$thumbSize}px`};
  height: ${props => `${props.$thumbSize}px`};
  border-radius: 50%;
  background-color: white;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

// Label text
const LabelText = styled.span`
  font-size: 0.875rem;
  line-height: 1.5;
`;

/**
 * Switch Component
 *
 * A toggle switch input component.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>((props, ref) => {
  const {
    checked,
    defaultChecked,
    disabled = false,
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

  // Determine if switch is checked (controlled or uncontrolled)
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

  // Get switch dimensions
  const dimensions = getSwitchDimensions(size);

  // Generate a unique ID for the input if not provided
  const inputId = id || `switch-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <SwitchContainer
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

      <SwitchTrack
        $checked={isChecked}
        $disabled={disabled}
        $size={size}
        $color={color}
        $glass={glass}
        $width={dimensions.width}
        $height={dimensions.height}
      >
        <SwitchThumb
          $checked={isChecked}
          $size={size}
          $thumbSize={dimensions.thumbSize}
          $thumbOffset={dimensions.thumbOffset}
        />
      </SwitchTrack>

      {label && <LabelText>{label}</LabelText>}
    </SwitchContainer>
  );
});

Switch.displayName = 'Switch';

/**
 * GlassSwitch Component
 *
 * A switch component with glass morphism styling.
 */
export const GlassSwitch = forwardRef<HTMLInputElement, SwitchProps>((props, ref) => {
  const { glass = true, className, ...rest } = props;

  // Add glass styling to the base switch
  return <Switch ref={ref} glass={glass} className={`glass-switch ${className || ''}`} {...rest} />;
});

GlassSwitch.displayName = 'GlassSwitch';
