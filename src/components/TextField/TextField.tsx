import React, { forwardRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';

import { accessibleAnimation } from '../../animations/animationUtils';
import { fadeIn } from '../../animations/keyframes/basic';
import { innerGlow } from '../../core/mixins/effects/innerEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AnimationProps } from '../../animations/types';
import { useGalileoStateSpring, GalileoSpringConfig } from '../../hooks/useGalileoStateSpring';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringPresets } from '../../animations/physics/springPhysics';

// TextField props interface
export interface TextFieldProps extends AnimationProps {
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

// Helper to map progress value (0-1) to intensity string
const mapGlowIntensity = (progress: number): 'none' | 'subtle' | 'medium' => {
  if (progress < 0.1) return 'none'; // No glow if not significantly focused
  if (progress < 0.7) return 'subtle'; // Subtle glow during most of transition
  return 'medium'; // Medium glow when fully focused
};

// Helper to map progress value (0-1) to border opacity string
const mapBorderOpacity = (progress: number): 'subtle' | 'medium' | 'strong' => {
  if (progress < 0.1) return 'subtle';
  if (progress < 0.8) return 'medium';
  return 'strong'; // Use stronger border when fully focused (adjust as needed)
};

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
  $theme: any;
  $focusProgress: number;
}>`
  /* Base styles */
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 4px;

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'outlined':
        // Interpolate border color based on focusProgress
        const outlineBorderColor = interpolateColor(
          props.$error ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.23)', // Start color (error or default)
          props.$error ? '#EF4444' : '#6366F1', // End color (error or primary focus)
          props.$focusProgress
        );
        return `
          border: 1px solid ${outlineBorderColor};
          background-color: transparent;
          padding: 0 12px;
        `;
      case 'filled':
        // Interpolate bottom border color
        const filledBorderColor = interpolateColor(
          props.$error ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.23)', // Start color
          props.$error ? '#EF4444' : '#6366F1', // End color
          props.$focusProgress
        );
        return `
          background-color: rgba(255, 255, 255, 0.09);
          border-bottom: 1px solid ${filledBorderColor};
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          padding: 0 12px;
        `;
      case 'glass':
        const glowIntensity = mapGlowIntensity(props.$focusProgress);
        const borderOpacity = mapBorderOpacity(props.$focusProgress);
        return (
          glassSurface({
            elevation: 1,
            blurStrength: 'light',
            backgroundOpacity: 'light',
            borderOpacity: borderOpacity, // Use animated border opacity
            themeContext: createThemeContext(props.$theme),
          }) +
          `
          padding: 0 12px;
          ${
            glowIntensity !== 'none' &&
            innerGlow({
              color: props.$error ? 'error' : 'primary',
              intensity: glowIntensity, // Use animated glow intensity
              spread: 4,
              themeContext: createThemeContext(props.$theme),
            })
          }
        `
        );
      case 'standard':
      default:
        // Interpolate bottom border color
        const standardBorderColor = interpolateColor(
          props.$error ? 'rgba(239, 68, 68, 0.7)' : 'rgba(255, 255, 255, 0.23)', // Start color
          props.$error ? '#EF4444' : '#6366F1', // End color
          props.$focusProgress
        );
        return `
          border-bottom: 1px solid ${standardBorderColor};
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

// Add a simple color interpolation helper (replace with a proper one if available in utils)
const interpolateColor = (startColor: string, endColor: string, progress: number): string => {
  // Basic RGBA interpolation - assumes format rgba(r,g,b,a) or hex #RRGGBB(AA)
  // This is a simplified example and might need a more robust implementation
  try {
    const parse = (color: string): number[] => {
      if (color.startsWith('rgba')) {
        const parts = color.match(/\d+\.?\d*/g)?.map(Number);
        return parts?.length === 4 ? parts : [0, 0, 0, 1];
      } else if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
        return [r, g, b, a];
      }
      return [0, 0, 0, 1]; // Default fallback
    };

    const start = parse(startColor);
    const end = parse(endColor);

    const r = Math.round(start[0] + (end[0] - start[0]) * progress);
    const g = Math.round(start[1] + (end[1] - start[1]) * progress);
    const b = Math.round(start[2] + (end[2] - start[2]) * progress);
    const a = start[3] + (end[3] - start[3]) * progress;

    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  } catch (e) {
    return endColor; // Fallback to end color on error
  }
};

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
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const { defaultSpring, focusSpringConfig } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;

  // Use context preset name or default
  const focusPresetName = animationConfig ?? focusSpringConfig ?? 'FOCUS_HIGHLIGHT';

  // Focus Animation Spring
  const { value: focusProgress, start: animateFocus } = useGalileoStateSpring(0, {
      ...(typeof focusPresetName === 'string' && focusPresetName in SpringPresets ? SpringPresets[focusPresetName] : typeof focusPresetName === 'object' ? focusPresetName : SpringPresets.DEFAULT),
      immediate: finalDisableAnimation,
  });

  const hasValue =
    (value !== undefined && value !== '') || (defaultValue !== undefined && defaultValue !== '');

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

      <InputWrapper 
        $variant={variant} 
        $focused={focused} 
        $error={error} 
        $disabled={disabled}
        $theme={theme}
        $focusProgress={focusProgress}
      >
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
