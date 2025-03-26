import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, slideUp } from '../../animations/keyframes/basic';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { innerGlow } from '../../core/mixins/effects/innerEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

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
export interface SelectProps {
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

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'outlined':
        return `
          border: 1px solid ${
            props.$error ? '#EF4444' : props.$focused ? '#6366F1' : 'rgba(0, 0, 0, 0.23)'
          };
          background-color: transparent;
        `;
      case 'filled':
        return `
          border: none;
          background-color: rgba(0, 0, 0, 0.06);
          border-bottom: 1px solid ${
            props.$error ? '#EF4444' : props.$focused ? '#6366F1' : 'rgba(0, 0, 0, 0.42)'
          };
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        `;
      default: // standard
        return `
          border: none;
          border-bottom: 1px solid ${
            props.$error ? '#EF4444' : props.$focused ? '#6366F1' : 'rgba(0, 0, 0, 0.42)'
          };
          border-radius: 0;
          background-color: transparent;
        `;
    }
  }}
  
  /* Glass effects for focused state */
  ${props =>
    props.$focused &&
    !props.$disabled &&
    glassSurface({
      elevation: 1,
      blurStrength: 'minimal',
      backgroundOpacity: 'subtle',
      borderOpacity: 'medium',
      themeContext: createThemeContext({}),
    })}
  
  /* Error state additional styling */
  ${props =>
    props.$error &&
    !props.$disabled &&
    innerGlow({
      color: 'error',
      intensity: 'subtle',
      spread: 2,
      themeContext: createThemeContext({}),
    })}
  
  /* Focus state glow effect */
  ${props =>
    props.$focused &&
    !props.$disabled &&
    !props.$error &&
    innerGlow({
      color: 'primary',
      intensity: 'subtle',
      spread: 2,
      themeContext: createThemeContext({}),
    })}
  
  /* Transition effect */
  transition: all 0.2s ease;

  &:hover {
    ${props =>
      !props.$disabled &&
      `
      background-color: rgba(0, 0, 0, 0.03);
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
  transform: translateY(-50%) ${props => (props.$open ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.2s ease;

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
  $open: boolean;
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
  display: ${props => (props.$open ? 'block' : 'none')};

  ${props =>
    glassSurface({
      elevation: 3,
      blurStrength: 'standard',
      backgroundOpacity: 'medium',
      borderOpacity: 'medium',
      themeContext: createThemeContext({}),
    })}

  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  ${props =>
    props.$open &&
    accessibleAnimation({
      animation: fadeIn,
      duration: 0.2,
      easing: 'ease-out',
    })}
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
    ...rest
  } = props;

  const [selectedValue, setSelectedValue] = useState<string | undefined>(value || defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle controlled component updates
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
      setIsFocused(true);
    }
  }, [disabled]);

  // Handle option selection
  const handleSelect = useCallback(
    (option: SelectOption) => {
      if (disabled || option.disabled) return;

      setSelectedValue(option.value);
      setIsOpen(false);

      if (onChange) {
        onChange(option.value);
      }
    },
    [disabled, onChange]
  );

  // Find the currently selected option
  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <SelectContainer
      ref={containerRef}
      className={className}
      $fullWidth={fullWidth}
      $disabled={disabled}
    >
      {label && (
        <SelectLabel $error={error} $focused={isFocused}>
          {label}
        </SelectLabel>
      )}

      <StyledSelect
        ref={ref}
        onClick={handleToggle}
        $variant={variant}
        $size={size}
        $error={error}
        $focused={isFocused}
        $disabled={disabled}
        {...rest}
      >
        <SelectValue $hasValue={!!selectedOption} $size={size}>
          {selectedOption ? selectedOption.label : placeholder}
        </SelectValue>

        <DropdownIcon $open={isOpen} />

        <OptionsContainer $open={isOpen}>
          {options.map(option => (
            <Option
              key={option.value}
              $selected={option.value === selectedValue}
              $disabled={option.disabled || false}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </Option>
          ))}
        </OptionsContainer>
      </StyledSelect>

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
  const { className, variant = 'outlined', ...rest } = props;

  return (
    <Select ref={ref} className={`glass-select ${className || ''}`} variant={variant} {...rest} />
  );
});

GlassSelect.displayName = 'GlassSelect';
