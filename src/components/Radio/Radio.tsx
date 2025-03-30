import React, { forwardRef, useState, useMemo } from 'react';
import styled from 'styled-components';

import { accessibleAnimation } from '../../animations/animationUtils';
import { useGalileoStateSpring, GalileoSpringConfig } from '../../hooks/useGalileoStateSpring';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { fadeIn } from '../../animations/keyframes/basic';
import { innerGlow } from '../../core/mixins/effects/innerEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

// Radio props interface
export interface RadioProps {
  /**
   * If true, the radio is checked
   */
  checked?: boolean;

  /**
   * The default checked state
   */
  defaultChecked?: boolean;

  /**
   * If true, the radio is disabled
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
   * The size of the radio
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * The color of the radio
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

  /**
   * The value of the radio
   */
  value?: string;

  /**
   * The label for the radio
   */
  label?: string;

  /**
   * The position of the label
   */
  labelPlacement?: 'start' | 'end' | 'top' | 'bottom';

  /**
   * If true, the radio will have a glass effect
   */
  glass?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Optional spring configuration for the toggle animation.
   */
  animationConfig?: Partial<GalileoSpringConfig>;
}

// Get the radio color
const getRadioColor = (color: string): string => {
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

// Get the radio size
const getRadioSize = (size: string): number => {
  switch (size) {
    case 'small':
      return 16;
    case 'large':
      return 24;
    default:
      return 20;
  }
};

// Container for the radio and label
const RadioContainer = styled.label<{
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

// The radio input (hidden)
const HiddenInput = styled.input`
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
`;

// The visible radio
const RadioControl = styled.span<{
  $checked: boolean;
  $disabled: boolean;
  $size: string;
  $color: string;
  $glass: boolean;
}>`
  /* Base styles */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => `${getRadioSize(props.$size)}px`};
  height: ${props => `${getRadioSize(props.$size)}px`};
  color: ${props => (props.$checked ? 'white' : 'rgba(255, 255, 255, 0.7)')};
  border-radius: 50%;
  transition: all 0.2s ease;
  border: 2px solid
    ${props => (props.$checked ? getRadioColor(props.$color) : 'rgba(255, 255, 255, 0.5)')};

  /* Glass effect */
  ${props =>
    props.$glass &&
    props.$checked &&
    innerGlow({
      color: props.$color,
      intensity: 'subtle',
      spread: 3,
      themeContext: createThemeContext({}), // In real usage, this would use props.theme
    })}

  /* Hover effect */
  ${props =>
    !props.$disabled &&
    `
    &:hover {
      background-color: ${
        props.$checked ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.08)'
      };
      border-color: ${props.$checked ? getRadioColor(props.$color) : 'rgba(255, 255, 255, 0.7)'};
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
 * Radio Component
 *
 * A radio input component.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
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
    animationConfig,
    ...rest
  } = props;

  // Animation Context
  const { defaultSpring } = useAnimationContext();

  // Internal state for uncontrolled component
  const [internalChecked, setInternalChecked] = useState(defaultChecked || false);

  // Determine if radio is checked (controlled or uncontrolled)
  const isChecked = checked !== undefined ? checked : internalChecked;

  // Setup physics spring for inner circle animation
  const finalAnimationConfig = useMemo(() => {
    const baseConfig: Partial<GalileoSpringConfig> = { tension: 300, friction: 25 }; // Default subtle spring
    const contextConfig = typeof defaultSpring === 'string' ? {} : defaultSpring;
    return { ...baseConfig, ...contextConfig, ...animationConfig };
  }, [defaultSpring, animationConfig]);

  const { value: progressValue } = useGalileoStateSpring(isChecked ? 1 : 0, finalAnimationConfig);

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
  const inputId = id || `radio-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <RadioContainer
      htmlFor={inputId}
      className={className}
      $labelPlacement={labelPlacement}
      $disabled={disabled}
    >
      <HiddenInput
        ref={ref}
        type="radio"
        id={inputId}
        name={name}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        value={value}
        {...rest}
      />

      <RadioControl
        $checked={isChecked}
        $disabled={disabled}
        $size={size}
        $color={color}
        $glass={glass}
      >
        <div
           style={{
             position: 'absolute',
             width: `${getRadioSize(size) / 2}px`,
             height: `${getRadioSize(size) / 2}px`,
             borderRadius: '50%',
             backgroundColor: getRadioColor(color),
             transform: `scale(${progressValue})`,
             opacity: progressValue,
           }}
        />
      </RadioControl>

      {label && <LabelText>{label}</LabelText>}
    </RadioContainer>
  );
});

Radio.displayName = 'Radio';

/**
 * GlassRadio Component
 *
 * A radio component with glass morphism styling.
 */
export const GlassRadio = forwardRef<HTMLInputElement, RadioProps>((props, ref) => {
  const { glass = true, className, ...rest } = props;

  // Add glass styling to the base radio
  return <Radio ref={ref} glass={glass} className={`glass-radio ${className || ''}`} {...rest} />;
});

GlassRadio.displayName = 'GlassRadio';
