/**
 * GlassDatePicker Component
 *
 * An enhanced date picker component with glass morphism styling
 * and support for multiple icon libraries.
 */
import React, { forwardRef, useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { GlassIcon } from '../Glass';
import { useDateAdapter } from './GlassLocalizationProvider';
import { useGlass } from '../../design/GlassProvider';
import { fadeIn } from '../../design/animations';
import { glassSurface } from '../../design/mixins/glass/surfaces';
import { glassText } from '../../design/mixins/typography/glassText';
import { createThemeContext } from '../../design/core/themeContext';
import { colors, spacing, typography, zIndex } from '../../design/domain/tokens';
import { cssWithKebabProps } from '../../design/core/cssUtils';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Default icons - these will be imported as props
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TodayIcon from '@mui/icons-material/Today';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ClearIcon from '@mui/icons-material/Clear';

// Types
export interface GlassDatePickerProps {
  /** Selected date value */
  value: Date | null;
  
  /** Function called when date changes */
  onChange: (date: Date | null) => void;
  
  /** Label text for the date picker */
  label?: string;
  
  /** Placeholder text when no date is selected */
  placeholder?: string;
  
  /** Error state or error message */
  error?: boolean | string;
  
  /** Helper text to display below input */
  helperText?: string;
  
  /** Make the date picker disabled */
  disabled?: boolean;
  
  /** Size variant of the date picker */
  size?: 'small' | 'medium' | 'large';
  
  /** Make the date picker full width */
  fullWidth?: boolean;
  
  /** Add a subtle animation when mounted */
  animate?: boolean;
  
  /** Glass elevation level */
  elevation?: 1 | 2 | 3 | 4;
  
  /** Date format used for display and input */
  format?: string;
  
  /** Optional minimum selectable date */
  minDate?: Date;
  
  /** Optional maximum selectable date */
  maxDate?: Date;
  
  /** If true, dates before today cannot be selected */
  disablePast?: boolean;
  
  /** If true, dates after today cannot be selected */
  disableFuture?: boolean;
  
  /** Custom set of dates to disable */
  disableDates?: Date[] | ((date: Date) => boolean);
  
  /** Enable input mode where user can type date */
  allowInput?: boolean;
  
  /** If true, shows a clear button */
  clearable?: boolean;
  
  /** Optional CSS styles */
  style?: React.CSSProperties;
  
  /** Additional input props */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  
  /** Icon component customization */
  icons?: {
    calendar?: React.ElementType;
    today?: React.ElementType;
    leftArrow?: React.ElementType;
    rightArrow?: React.ElementType;
    clear?: React.ElementType;
  };
  
  /** Makes popup portal to body instead of in component tree */
  portal?: boolean;
  
  /** Initial calendar view */
  initialView?: 'day' | 'month' | 'year';
  
  /** Custom class name */
  className?: string;
}

/**
 * GlassDatePicker Component implementation
 */
export const GlassDatePicker = forwardRef<HTMLDivElement, GlassDatePickerProps>(
  ({
    value,
    onChange,
    label,
    placeholder = 'Select date',
    error = false,
    helperText,
    disabled = false,
    size = 'medium',
    fullWidth = false,
    animate = false,
    elevation = 2,
    format,
    minDate,
    maxDate,
    disablePast = false,
    disableFuture = false,
    disableDates,
    allowInput = false,
    clearable = true,
    style,
    inputProps,
    icons = {},
    portal = false,
    initialView = 'day',
    className,
    ...rest
  }, ref) => {
    // Hooks and state
    const { reducedEffects } = useGlass();
    const prefersReducedMotion = useReducedMotion();
    const dateAdapter = useDateAdapter();
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [currentView, setCurrentView] = useState(initialView);
    const [viewDate, setViewDate] = useState(value || new Date());
    const pickerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Resolve icon components
    const CalendarIcon = icons.calendar || CalendarTodayIcon;
    const TodayButtonIcon = icons.today || TodayIcon;
    const LeftArrowIcon = icons.leftArrow || KeyboardArrowLeftIcon;
    const RightArrowIcon = icons.rightArrow || KeyboardArrowRightIcon;
    const ClearButtonIcon = icons.clear || ClearIcon;
    
    // Format date for display
    const formatDisplayDate = (date: Date | null) => {
      if (!date) return '';
      return dateAdapter?.adapter.format(date, format || dateAdapter.dateFormat);
    };
    
    // Handle errors
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : helperText;
    
    // Update input value when value changes
    useEffect(() => {
      setInputValue(formatDisplayDate(value));
    }, [value, dateAdapter, format]);
    
    // Set up click outside handler
    useClickOutside(pickerRef, () => {
      setIsOpen(false);
      setIsFocused(false);
    });
    
    // Handle date selection
    const handleDateSelect = (date: Date) => {
      onChange(date);
      setIsOpen(false);
      setIsFocused(false);
    };
    
    // Handle toggle calendar
    const handleToggleCalendar = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
      if (!isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !allowInput) return;
      
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Try to parse the date from the input
      if (newValue && dateAdapter?.adapter) {
        const parsedDate = dateAdapter.adapter.parse(
          newValue, 
          format || dateAdapter.dateFormat
        );
        
        if (parsedDate && dateAdapter.adapter.isValid(parsedDate)) {
          onChange(parsedDate);
          setViewDate(parsedDate);
        }
      } else if (newValue === '') {
        onChange(null);
      }
    };
    
    // Handle clear button click
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setInputValue('');
    };
    
    // Rendering logic will be implemented here
    return (
      <DatePickerContainer
        ref={ref}
        className={className}
        style={style}
        $fullWidth={fullWidth}
        $animate={animate && !prefersReducedMotion}
      >
        {label && <Label>{label}</Label>}
        
        <InputContainer
          $size={size}
          $focused={isFocused}
          $disabled={disabled}
          $hasError={hasError}
          $elevation={elevation}
          onClick={handleToggleCalendar}
        >
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder={placeholder}
            onChange={handleInputChange}
            disabled={disabled || !allowInput}
            readOnly={!allowInput}
            $size={size}
            $disabled={disabled}
            {...inputProps}
          />
          
          {clearable && value && !disabled && (
            <ClearButton onClick={handleClear} aria-label="Clear">
              <GlassIcon component={ClearButtonIcon} fontSize="small" />
            </ClearButton>
          )}
          
          <CalendarButton aria-label="Open calendar">
            <GlassIcon component={CalendarIcon} fontSize="small" color="secondary" />
          </CalendarButton>
        </InputContainer>
        
        {(helperText || hasError) && (
          <HelperText $hasError={hasError}>
            {errorMessage}
          </HelperText>
        )}
        
        {/* Calendar implementation will go here */}
        {/* This will be implemented fully in the actual component */}
      </DatePickerContainer>
    );
  }
);

// Styled components
const DatePickerContainer = styled.div<{
  $fullWidth: boolean;
  $animate: boolean;
}>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${props => props.$fullWidth ? '100%' : '280px'};
  
  ${props => props.$animate && css`
    animation: ${fadeIn} 0.3s ease-out;
  `}
`;

const Label = styled.label`
  ${glassText}
  margin-bottom: ${spacing.xxs};
  font-size: ${typography.fontSize.sm};
  color: ${colors.nebula.textSecondary};
  font-weight: 500;
`;

const InputContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $focused: boolean;
  $disabled: boolean;
  $hasError: boolean;
  $elevation: number;
}>`
  ${props => glassSurface({
    elevation: props.$elevation,
    blurStrength: 'standard',
    borderOpacity: 'medium',
    themeContext: createThemeContext({})
  })}
  
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding: ${props => {
    switch (props.$size) {
      case 'small': return spacing.xs;
      case 'large': return spacing.md;
      default: return spacing.sm;
    }
  }};
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  
  ${props => props.$focused && css`
    border-color: ${colors.nebula.accentPrimary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
  `}
  
  ${props => props.$hasError && css`
    border-color: ${colors.nebula.stateCritical};
    box-shadow: 0 0 0 1px ${colors.nebula.stateCritical}40;
  `}
  
  ${props => props.$disabled && css`
    opacity: 0.6;
    pointer-events: none;
  `}
  
  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const Input = styled.input<{
  $size: 'small' | 'medium' | 'large';
  $disabled: boolean;
}>`
  background: transparent;
  border: none;
  flex: 1;
  outline: none;
  color: inherit;
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return typography.fontSize.sm;
      case 'large': return typography.fontSize.md;
      default: return typography.fontSize.sm;
    }
  }};
  cursor: inherit;
  font-family: ${typography.fontFamily.primary};
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const CalendarButton = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${spacing.xs};
  color: inherit;
  opacity: 0.7;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: ${spacing.xs};
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
  
  svg {
    font-size: 18px;
  }
`;

const HelperText = styled.div<{
  $hasError: boolean;
}>`
  ${glassText}
  margin-top: ${spacing.xxs};
  font-size: ${typography.fontSize.xs};
  min-height: 16px;
  color: ${props => props.$hasError 
    ? colors.nebula.stateCritical 
    : colors.nebula.textTertiary
  };
`;

GlassDatePicker.displayName = 'GlassDatePicker'; 