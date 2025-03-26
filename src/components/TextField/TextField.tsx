import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';

import { accessibleAnimation } from '../../animations/animationUtils';
import { fadeIn } from '../../animations/keyframes/basic';
import { innerGlow } from '../../core/mixins/effects/innerEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

// TextField props interface
export interface TextFieldProps {
  /**
   * The label for the input
   */
  label?: string;

  /**
   * The input value
   */
  value?: string;

  /**
   * The default value for the input
   */
  defaultValue?: string;

  /**
   * Callback when the input value changes
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * The id for the input
   */
  id?: string;

  /**
   * The name for the input
   */
  name?: string;

  /**
   * The placeholder for the input
   */
  placeholder?: string;

  /**
   * If true, the input will be disabled
   */
  disabled?: boolean;

  /**
   * If true, the input will be read only
   */
  readOnly?: boolean;

  /**
   * If true, the input will be required
   */
  required?: boolean;

  /**
   * The type of the input
   */
  type?: string;

  /**
   * If true, the input will take up the full width of its container
   */
  fullWidth?: boolean;

  /**
   * The variant of the input
   */
  variant?: 'outlined' | 'filled' | 'standard' | 'glass';

  /**
   * The helper text for the input
   */
  helperText?: string;

  /**
   * If true, the input will show an error state
   */
  error?: boolean;

  /**
   * The icon to show before the input
   */
  startIcon?: React.ReactNode;

  /**
   * The icon to show after the input
   */
  endIcon?: React.ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;
}

// Styled container for the input
const InputContainer = styled.div<{
  $fullWidth: boolean;
  $error: boolean;
  $variant: string;
  $focused: boolean;
  $disabled: boolean;
}>`
  /* Base styles */
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  min-width: 200px;
  margin-bottom: 16px;

  /* Animation */
  ${accessibleAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out',
  })}
`;

// Styled input wrapper
const InputWrapper = styled.div<{
  $variant: string;
  $focused: boolean;
  $error: boolean;
  $disabled: boolean;
}>`
  /* Base styles */
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'outlined':
        return `
          border: 1px solid ${
            props.$error ? '#EF4444' : props.$focused ? '#6366F1' : 'rgba(255, 255, 255, 0.23)'
          };
          background-color: transparent;
          padding: 0 12px;
        `;
      case 'filled':
        return `
          background-color: rgba(255, 255, 255, 0.09);
          border-bottom: 1px solid ${
            props.$error ? '#EF4444' : props.$focused ? '#6366F1' : 'rgba(255, 255, 255, 0.23)'
          };
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          padding: 0 12px;
        `;
      case 'glass':
        return (
          glassSurface({
            elevation: 1,
            blurStrength: 'light',
            backgroundOpacity: 'light',
            borderOpacity: props.$focused ? 'medium' : 'subtle',
            themeContext: createThemeContext({}), // In real usage, this would use props.theme
          }) +
          `
          padding: 0 12px;
          ${
            props.$focused &&
            innerGlow({
              color: props.$error ? 'error' : 'primary',
              intensity: 'subtle',
              spread: 4,
              themeContext: createThemeContext({}), // In real usage, this would use props.theme
            })
          }
        `
        );
      case 'standard':
      default:
        return `
          border-bottom: 1px solid ${
            props.$error ? '#EF4444' : props.$focused ? '#6366F1' : 'rgba(255, 255, 255, 0.23)'
          };
          background-color: transparent;
          padding: 0;
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
`;

// Styled label
const InputLabel = styled.label<{
  $focused: boolean;
  $filled: boolean;
  $error: boolean;
  $variant: string;
}>`
  /* Base styles */
  font-size: 0.75rem;
  font-weight: 400;
  transition: all 0.2s ease;
  margin-bottom: 4px;

  /* Color based on state */
  color: ${props =>
    props.$error ? '#EF4444' : props.$focused ? '#6366F1' : 'rgba(255, 255, 255, 0.7)'};
`;

// Styled input
const StyledInput = styled.input`
  /* Base styles */
  font-family: inherit;
  font-size: 1rem;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  padding: 10px 0;

  /* Remove autofill styling */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: inherit;
    -webkit-box-shadow: 0 0 0px 1000px transparent inset;
    transition: background-color 5000s ease-in-out 0s;
  }

  /* Placeholder styling */
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

// Styled helper text
const HelperText = styled.div<{
  $error: boolean;
}>`
  /* Base styles */
  font-size: 0.75rem;
  margin-top: 4px;

  /* Color based on error state */
  color: ${props => (props.$error ? '#EF4444' : 'rgba(255, 255, 255, 0.5)')};
`;

// Styled icon containers
const StartIconContainer = styled.div`
  display: flex;
  margin-right: 8px;
`;

const EndIconContainer = styled.div`
  display: flex;
  margin-left: 8px;
`;

/**
 * TextField Component
 *
 * A flexible text input component.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const {
    label,
    value,
    defaultValue,
    onChange,
    id,
    name,
    placeholder,
    disabled = false,
    readOnly = false,
    required = false,
    type = 'text',
    fullWidth = false,
    variant = 'outlined',
    helperText,
    error = false,
    startIcon,
    endIcon,
    className,
    ...rest
  } = props;

  // Track focus state
  const [focused, setFocused] = useState(false);

  // Check if the input has a value
  const hasValue =
    (value !== undefined && value !== '') || (defaultValue !== undefined && defaultValue !== '');

  // Generate a unique ID for the input if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <InputContainer
      className={className}
      $fullWidth={fullWidth}
      $error={error}
      $variant={variant}
      $focused={focused}
      $disabled={disabled}
    >
      {label && (
        <InputLabel
          htmlFor={inputId}
          $focused={focused}
          $filled={hasValue}
          $error={error}
          $variant={variant}
        >
          {label} {required && '*'}
        </InputLabel>
      )}

      <InputWrapper $variant={variant} $focused={focused} $error={error} $disabled={disabled}>
        {startIcon && <StartIconContainer>{startIcon}</StartIconContainer>}

        <StyledInput
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {endIcon && <EndIconContainer>{endIcon}</EndIconContainer>}
      </InputWrapper>

      {helperText && <HelperText $error={error}>{helperText}</HelperText>}
    </InputContainer>
  );
});

TextField.displayName = 'TextField';

/**
 * GlassTextField Component
 *
 * A text input component with glass morphism styling.
 */
export const GlassTextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const { variant = 'glass', className, ...rest } = props;

  // Add glass styling to the base input
  return (
    <TextField
      ref={ref}
      variant={variant}
      className={`glass-text-field ${className || ''}`}
      {...rest}
    />
  );
});

GlassTextField.displayName = 'GlassTextField';
