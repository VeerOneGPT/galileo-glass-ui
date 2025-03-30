import React, { forwardRef, useState, useCallback, useRef, useEffect, CSSProperties, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, slideUp } from '../../animations/keyframes/basic';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { innerGlow } from '../../core/mixins/effects/innerEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useGalileoStateSpring, GalileoSpringConfig } from '../../hooks/useGalileoStateSpring';
import { AnimationProps } from '../../animations/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';

// Option interface for select options
export interface SelectOption {
  /**
   * The value of the option
   */
  value: string;

  /**
   * The display label for the option
   */
  label: string;

  /**
   * Optional disabled state for individual options
   */
  disabled?: boolean;
}

// Select component props interface
export interface SelectProps extends AnimationProps {
  /**
   * The value of the select
   */
  value?: string;

  /**
   * Default value if uncontrolled
   */
  defaultValue?: string;

  /**
   * Array of options to display
   */
  options: SelectOption[];

  /**
   * Callback when value changes
   */
  onChange?: (value: string) => void;

  /**
   * Label for the select field
   */
  label?: string;

  /**
   * The placeholder text
   */
  placeholder?: string;

  /**
   * If true, the select will be disabled
   */
  disabled?: boolean;

  /**
   * Error state for the select
   */
  error?: boolean;

  /**
   * Helper text to display
   */
  helperText?: string;

  /**
   * The size of the select
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * If true, the select will fill the width of its container
   */
  fullWidth?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * The variant of the select
   */
  variant?: 'outlined' | 'standard' | 'filled';
}

// Helper functions (copied from TextField/Autocomplete)
const mapGlowIntensity = (progress: number): 'none' | 'subtle' | 'medium' => {
  if (progress < 0.1) return 'none';
  if (progress < 0.7) return 'subtle';
  return 'medium';
};

const mapBorderOpacity = (progress: number): 'subtle' | 'medium' | 'strong' => {
  if (progress < 0.1) return 'subtle';
  if (progress < 0.8) return 'medium';
  return 'strong';
};

const interpolateColor = (startColor: string, endColor: string, progress: number): string => {
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
      return [0, 0, 0, 1];
    };
    const start = parse(startColor);
    const end = parse(endColor);
    const r = Math.round(start[0] + (end[0] - start[0]) * progress);
    const g = Math.round(start[1] + (end[1] - start[1]) * progress);
    const b = Math.round(start[2] + (end[2] - start[2]) * progress);
    const a = start[3] + (end[3] - start[3]) * progress;
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  } catch (e) {
    return endColor;
  }
};

// Styled components
const SelectContainer = styled.div<{
  $fullWidth: boolean;
  $disabled: boolean;
}>`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  min-width: 200px;
  opacity: ${props => (props.$disabled ? 0.6 : 1)};
`;

const SelectLabel = styled.label<{
  $error: boolean;
  $focused: boolean;
}>`
  font-size: 0.75rem;
  color: ${props => (props.$error ? '#EF4444' : props.$focused ? '#6366F1' : 'rgba(0, 0, 0, 0.6)')};
  margin-bottom: 4px;
  transition: color 0.2s ease;
`;

const StyledSelect = styled.div<{
  $variant: 'outlined' | 'standard' | 'filled';
  $size: 'small' | 'medium' | 'large';
  $error: boolean;
  $focused: boolean;
  $disabled: boolean;
  $theme: any;
  $focusProgress: number;
}>`
  position: relative;
  width: 100%;
  border-radius: 4px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};

  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          min-height: 32px;
          font-size: 0.8125rem;
        `;
      case 'large':
        return `
          min-height: 48px;
          font-size: 0.9375rem;
        `;
      default: // medium
        return `
          min-height: 40px;
          font-size: 0.875rem;
        `;
    }
  }}

  /* Variant styles using focusProgress */
  ${props => {
    const startColor = props.$error ? '#EF4444' : props.$variant === 'outlined' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(0, 0, 0, 0.42)';
    const endColor = props.$error ? '#EF4444' : '#6366F1';
    const borderColor = interpolateColor(startColor, endColor, props.$focusProgress);

    switch (props.$variant) {
      case 'outlined':
        return `
          border: 1px solid ${borderColor};
          background-color: transparent;
        `;
      case 'filled':
        return `
          border: none;
          background-color: rgba(0, 0, 0, 0.06);
          border-bottom: 1px solid ${borderColor};
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        `;
      default: // standard
        return `
          border: none;
          border-bottom: 1px solid ${borderColor};
          border-radius: 0;
          background-color: transparent;
        `;
    }
  }}
  
  /* Glass effects and glow based on focusProgress */
  ${props => {
    const glowIntensity = mapGlowIntensity(props.$focusProgress);
    const borderOpacity = mapBorderOpacity(props.$focusProgress);
    let effects = '';

    // Apply glass surface based on focus progress
    if (props.$focusProgress > 0.1) { // Apply glass only when focused starts
      effects += glassSurface({
        elevation: 1,
        blurStrength: 'minimal', // Keep minimal blur
        backgroundOpacity: 'subtle', // Keep subtle background
        borderOpacity: borderOpacity, // Use animated border opacity
        themeContext: createThemeContext(props.$theme),
      });
    }

    // Apply inner glow (error or primary based on focus)
    if (glowIntensity !== 'none' && !props.$disabled) {
       effects += innerGlow({
        color: props.$error ? 'error' : 'primary',
        intensity: glowIntensity,
        spread: 2,
        themeContext: createThemeContext(props.$theme),
      });
    }
    return effects;
  }}

  &:hover {
    ${props =>
      !props.$disabled &&
      `
      background-color: rgba(0, 0, 0, 0.03); // Keep hover effect
    `}
  }
`;

const SelectValue = styled.div<{
  $hasValue: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  width: 100%;
  color: ${props => (props.$hasValue ? 'rgba(0, 0, 0, 0.87)' : 'rgba(0, 0, 0, 0.42)')};

  /* Size-specific padding */
  ${props => {
    switch (props.$size) {
      case 'small':
        return 'padding: 6px 8px;';
      case 'large':
        return 'padding: 12px 14px;';
      default: // medium
        return 'padding: 10px 12px;';
    }
  }}

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownIcon = styled.div<{
  $open: boolean;
}>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%) rotate(${props => (props.$open ? 180 : 0) + 'deg'});

  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid rgba(0, 0, 0, 0.54);
  }
`;

const OptionsContainer = styled.div<{
  $theme: any;
}>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  z-index: 10;
  border-radius: 4px;
  margin-top: 4px;

  ${props =>
    glassSurface({
      elevation: 3,
      blurStrength: 'standard',
      backgroundOpacity: 'medium',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.$theme),
    })}

  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform-origin: top center;
`;

const Option = styled.div<{
  $selected: boolean;
  $disabled: boolean;
}>`
  padding: 10px 12px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  background-color: ${props => (props.$selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent')};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};

  &:hover {
    ${props =>
      !props.$disabled &&
      `
      background-color: rgba(0, 0, 0, 0.04);
    `}
  }

  /* Selected option styles */
  ${props =>
    props.$selected &&
    edgeHighlight({
      position: 'left',
      thickness: 3,
      color: 'primary',
      opacity: 0.8,
      themeContext: createThemeContext({}),
    })}
`;

const HelperText = styled.div<{
  $error: boolean;
}>`
  font-size: 0.75rem;
  color: ${props => (props.$error ? '#EF4444' : 'rgba(0, 0, 0, 0.6)')};
  margin-top: 4px;
  min-height: 1.25em;
`;

/**
 * Select Component
 *
 * A dropdown select component with glass morphism styling.
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  const {
    value,
    defaultValue,
    options,
    onChange,
    label,
    placeholder = 'Select an option',
    disabled = false,
    error = false,
    helperText,
    size = 'medium',
    fullWidth = false,
    className,
    variant = 'outlined',
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? value ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Animation Context
  const { defaultSpring, focusSpringConfig, modalSpringConfig } = useAnimationContext();

  // Resolve final disable animation flag from props/context/reducedMotion
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;

  // Focus Animation Spring
  // Priority: prop animationConfig -> context focusSpringConfig -> Default Preset
  const focusPresetOrConfig = animationConfig ?? focusSpringConfig ?? 'FOCUS_HIGHLIGHT';
  const { value: focusProgress } = useGalileoStateSpring(focused ? 1 : 0, {
      ...(typeof focusPresetOrConfig === 'string' && focusPresetOrConfig in SpringPresets ? SpringPresets[focusPresetOrConfig] : typeof focusPresetOrConfig === 'object' ? focusPresetOrConfig : SpringPresets.DEFAULT),
      immediate: finalDisableAnimation,
  });

  // Dropdown Animation Spring
  // Priority: context modalSpringConfig -> context defaultSpring -> Default Preset
  // We don't use the component's animationConfig here to keep separate control
  const dropdownPresetOrConfig = modalSpringConfig ?? defaultSpring ?? 'DEFAULT';
  const { value: openProgress } = useGalileoStateSpring(isOpen ? 1 : 0, {
    ...(typeof dropdownPresetOrConfig === 'string' && dropdownPresetOrConfig in SpringPresets ? SpringPresets[dropdownPresetOrConfig] : typeof dropdownPresetOrConfig === 'object' ? dropdownPresetOrConfig : SpringPresets.DEFAULT),
    immediate: finalDisableAnimation,
  });

  const currentValue = value !== undefined ? value : internalValue;
  const displayLabel = options.find(opt => opt.value === currentValue)?.label || placeholder;
  const hasValue = currentValue !== undefined && currentValue !== null;

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setFocused(true);
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocused(false);
  }, []);

  const handleSelect = useCallback((optionValue: string) => {
    if (value === undefined) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
    handleClose();
  }, [value, onChange, handleClose]);

  function handleClickOutside(event: MouseEvent) {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      handleClose();
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  return (
    <SelectContainer
      ref={containerRef}
      $fullWidth={fullWidth}
      $disabled={disabled}
      className={className}
      {...rest}
    >
      {label && <SelectLabel $error={error} $focused={focused}>{label}</SelectLabel>}
      <StyledSelect
        ref={ref}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `label-${label}` : undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={isOpen ? handleClose : handleOpen}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') isOpen ? handleClose() : handleOpen(); }}
        onFocus={() => { setFocused(true); }}
        onBlur={() => { if (!isOpen) { setFocused(false); } }}
        $variant={variant}
        $size={size}
        $error={error}
        $focused={focused}
        $disabled={disabled}
        $theme={theme}
        $focusProgress={focusProgress}
      >
        <SelectValue $hasValue={hasValue} $size={size}>
          {displayLabel}
        </SelectValue>
        <DropdownIcon $open={isOpen} style={{ transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)` }} />
      </StyledSelect>

      {(isOpen) && (
        <OptionsContainer
          key="options"
          role="listbox"
          aria-labelledby={label ? `label-${label}` : undefined}
          $theme={theme}
          style={{
            opacity: openProgress,
            transform: `scaleY(${openProgress})`,
            pointerEvents: isOpen ? 'auto' : 'none',
            visibility: (isOpen) ? 'visible' : 'hidden',
          }}
        >
          {options.map((option) => (
            <Option
              key={option.value}
              role="option"
              aria-selected={currentValue === option.value}
              aria-disabled={option.disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!option.disabled) {
                  handleSelect(option.value);
                }
              }}
              $selected={currentValue === option.value}
              $disabled={option.disabled || false}
            >
              {option.label}
            </Option>
          ))}
        </OptionsContainer>
      )}

      {helperText && <HelperText $error={error}>{helperText}</HelperText>}
    </SelectContainer>
  );
});

Select.displayName = 'Select';

/**
 * GlassSelect Component
 *
 * A Select component with enhanced glass morphism styling.
 */
export const GlassSelect = forwardRef<HTMLDivElement, SelectProps>((props, ref) => {
  return <Select ref={ref} {...props} />;
});

GlassSelect.displayName = 'GlassSelect';
