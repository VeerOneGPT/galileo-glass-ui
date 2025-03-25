/**
 * Glass Autocomplete Component
 * 
 * A comprehensive autocomplete component with glass morphism styling.
 */
import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import ClearIcon from '../icons/ClearIcon';

// Import types
import { AutocompleteOption, AutocompleteProps } from './types';

// Styled components
const AutocompleteRoot = styled.div<{
  $fullWidth: boolean;
  $animate: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${props => props.$fullWidth ? '100%' : '300px'};
  position: relative;
  
  /* Animation on mount */
  ${props => props.$animate && !props.$reducedMotion && `
    animation: fadeIn 0.4s ease-out;
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}
`;

const InputContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
  $focused: boolean;
  $disabled: boolean;
  $hasError: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  
  /* Enhanced glass styling */
  ${props => glassSurface({
    elevation: 1,
    blurStrength: 'light',
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$hasError ? 'rgba(240, 82, 82, 0.8)' : 
    props.$focused ? 'rgba(99, 102, 241, 0.8)' : 
    'rgba(255, 255, 255, 0.12)'
  };
  background-color: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  
  /* Size variations */
  ${props => {
    switch(props.$size) {
      case 'small':
        return `
          min-height: 36px;
          padding: 4px 8px;
        `;
      case 'large':
        return `
          min-height: 48px;
          padding: 8px 16px;
        `;
      default:
        return `
          min-height: 40px;
          padding: 6px 12px;
        `;
    }
  }}
  
  /* Focused state */
  ${props => props.$focused && `
    border-color: rgba(99, 102, 241, 0.8);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  `}
  
  /* Error state */
  ${props => props.$hasError && `
    border-color: rgba(240, 82, 82, 0.8);
    box-shadow: 0 0 0 1px rgba(240, 82, 82, 0.3);
  `}
  
  /* Disabled state */
  ${props => props.$disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.01);
  `}
  
  /* Focus outline */
  &:focus-within {
    outline: none;
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
  width: 100%;
  min-width: 30px;
  color: inherit;
  font-size: ${props => props.$size === 'small' ? '0.875rem' : 
                         props.$size === 'large' ? '1rem' : 
                         '0.875rem'};
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  margin-bottom: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

const HelperText = styled.div<{
  $hasError: boolean;
}>`
  margin-top: 4px;
  font-size: 0.75rem;
  min-height: 18px;
  color: ${props => props.$hasError ? 'rgba(240, 82, 82, 0.9)' : 'rgba(255, 255, 255, 0.6)'};
`;

const Dropdown = styled.div<{
  $open: boolean;
  $reducedMotion: boolean;
}>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  z-index: 1000;
  display: ${props => props.$open ? 'block' : 'none'};
  ${props => glassSurface({
    elevation: 3,
    blurStrength: 'standard',
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  border-radius: 8px;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  
  /* Enhanced dropdown animation */
  ${props => !props.$reducedMotion && `
    animation: reveal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: top center;
    
    @keyframes reveal {
      from { opacity: 0; transform: scaleY(0.9) translateY(-8px); }
      to { opacity: 1; transform: scaleY(1) translateY(0); }
    }
  `}
  
  /* Subtle scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(99, 102, 241, 0.4);
    }
  }
`;

const NoOptions = styled.div`
  padding: 12px;
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
`;

const LoadingText = styled.div`
  padding: 12px;
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  
  &::after {
    content: '';
    display: inline-block;
    width: 12px;
    text-align: left;
    animation: ellipsis 1.2s infinite;
  }
  
  @keyframes ellipsis {
    0% { content: '.'; }
    33% { content: '..'; }
    66% { content: '...'; }
  }
`;

const OptionItem = styled.div<{
  $highlighted: boolean;
  $selected: boolean;
}>`
  padding: 8px 12px;
  cursor: pointer;
  margin: 4px 8px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  background: ${props => 
    props.$highlighted ? 'rgba(99, 102, 241, 0.1)' :
    props.$selected ? 'rgba(99, 102, 241, 0.15)' : 
    'transparent'
  };
  transition: all 0.15s ease;
  
  &:hover {
    background: rgba(99, 102, 241, 0.15);
    transform: translateX(2px);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-right: 4px;
`;

const Tag = styled.div<{
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  background-color: rgba(99, 102, 241, 0.15);
  border-radius: 4px;
  padding: ${props => props.$size === 'small' ? '0 4px' : '2px 6px'};
  font-size: ${props => props.$size === 'small' ? '0.75rem' : 
                        props.$size === 'large' ? '0.875rem' : 
                        '0.75rem'};
  gap: 4px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.9);
`;

const TagLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TagDeleteButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  padding: 0;
  height: 16px;
  width: 16px;
  opacity: 0.7;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const EndAdornment = styled.div`
  display: flex;
  align-items: center;
`;

// Default getOptionLabel function
const defaultGetOptionLabel = (option: AutocompleteOption) => option.label;

// Default filterOptions function
const defaultFilterOptions = (options: AutocompleteOption[], inputValue: string) => {
  const normalizedInput = inputValue.toLowerCase();
  return options.filter(option => 
    option.label.toLowerCase().includes(normalizedInput)
  );
};

/**
 * Autocomplete Component Implementation
 */
function AutocompleteComponent<T extends AutocompleteOption = AutocompleteOption>(
  props: AutocompleteProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const {
    options,
    value,
    defaultValue,
    onChange,
    placeholder,
    label,
    helperText,
    error = false,
    multiple = false,
    disabled = false,
    clearable = true,
    size = 'medium',
    renderOption,
    getOptionLabel = defaultGetOptionLabel as (option: T) => string,
    filterOptions = defaultFilterOptions as (options: T[], inputValue: string) => T[],
    autoHighlight = false,
    freeSolo = false,
    loading = false,
    fullWidth = false,
    style,
    animate = false,
    autoComplete = 'off',
    disablePortal = false,
    popperContainer,
    className,
    ...rest
  } = props;
  
  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();
  
  // Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // State
  const [internalInputValue, setInternalInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  
  // Controlled/uncontrolled logic
  const isControlled = value !== undefined;
  
  // Initialize selected items
  useEffect(() => {
    if (isControlled) {
      // Controlled component
      if (value === null) {
        setSelectedItems([]);
      } else if (Array.isArray(value)) {
        setSelectedItems(value);
      } else {
        setSelectedItems([value as T]);
      }
    } else if (defaultValue !== undefined) {
      // Uncontrolled with defaultValue
      if (defaultValue === null) {
        setSelectedItems([]);
      } else if (Array.isArray(defaultValue)) {
        setSelectedItems(defaultValue);
      } else {
        setSelectedItems([defaultValue as T]);
      }
    }
  }, [isControlled, value, defaultValue]);
  
  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rootRef.current && 
        !rootRef.current.contains(event.target as Node) &&
        !(dropdownRef.current && dropdownRef.current.contains(event.target as Node))
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter options based on input value
  const filteredOptions = useMemo(() => {
    if (!internalInputValue.trim()) {
      // Filter out already selected items in multiple mode
      return multiple 
        ? options.filter(option => !selectedItems.some(item => item.value === option.value))
        : options;
    }
    
    // Apply custom filter
    const filtered = filterOptions(options, internalInputValue);
    
    // In multiple mode, filter out selected items
    return multiple 
      ? filtered.filter(option => !selectedItems.some(item => item.value === option.value))
      : filtered;
  }, [options, internalInputValue, filterOptions, multiple, selectedItems]);
  
  // Reset highlight when options change
  useEffect(() => {
    if (autoHighlight && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [filteredOptions, autoHighlight]);
  
  // Handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalInputValue(newValue);
    
    if (!open && newValue) {
      setOpen(true);
    }
    
    // Reset highlight when typing
    if (autoHighlight && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [open, filteredOptions, autoHighlight]);
  
  const handleInputFocus = useCallback(() => {
    setFocused(true);
    if (internalInputValue || selectedItems.length === 0) {
      setOpen(true);
    }
  }, [internalInputValue, selectedItems]);
  
  const handleInputBlur = useCallback(() => {
    setFocused(false);
    
    // If freeSolo and there's a value, create a custom option
    if (freeSolo && internalInputValue && !multiple) {
      const existingOption = options.find(option => 
        getOptionLabel(option).toLowerCase() === internalInputValue.toLowerCase()
      );
      
      if (!existingOption) {
        const customOption = { label: internalInputValue, value: internalInputValue } as unknown as T;
        handleSelectOption(customOption);
      }
    }
    
    // Clear input value if not freeSolo
    if (!freeSolo && !multiple) {
      // Restore the selected value's label
      if (selectedItems.length > 0) {
        setInternalInputValue(getOptionLabel(selectedItems[0]));
      } else {
        setInternalInputValue('');
      }
    }
  }, [freeSolo, internalInputValue, multiple, options, getOptionLabel, selectedItems]);
  
  const handleSelectOption = useCallback((option: T) => {
    let newSelectedItems: T[];
    
    if (multiple) {
      newSelectedItems = [...selectedItems, option];
      setInternalInputValue('');
    } else {
      newSelectedItems = [option];
      setInternalInputValue(getOptionLabel(option));
      setOpen(false);
    }
    
    setSelectedItems(newSelectedItems);
    
    if (onChange) {
      onChange(multiple ? newSelectedItems : newSelectedItems[0]);
    }
  }, [multiple, selectedItems, onChange, getOptionLabel]);
  
  const handleRemoveItem = useCallback((indexToRemove: number) => {
    const newSelectedItems = selectedItems.filter((_, index) => index !== indexToRemove);
    setSelectedItems(newSelectedItems);
    
    if (onChange) {
      onChange(multiple ? newSelectedItems : newSelectedItems.length > 0 ? newSelectedItems[0] : null);
    }
    
    // Focus the input after removing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedItems, onChange, multiple]);
  
  const handleClear = useCallback(() => {
    setSelectedItems([]);
    setInternalInputValue('');
    
    if (onChange) {
      onChange(null);
    }
    
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle keyboard navigation
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
        
      case 'Enter':
        e.preventDefault();
        if (open && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (freeSolo && internalInputValue) {
          const customOption = { label: internalInputValue, value: internalInputValue } as unknown as T;
          handleSelectOption(customOption);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
        
      case 'Backspace':
        if (multiple && internalInputValue === '' && selectedItems.length > 0) {
          // Remove the last item when pressing backspace with empty input
          handleRemoveItem(selectedItems.length - 1);
        }
        break;
    }
  }, [open, highlightedIndex, filteredOptions, freeSolo, internalInputValue, multiple, selectedItems.length, handleSelectOption, handleRemoveItem]);
  
  // Handle forwarded ref
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  
  // Rendering functions
  const renderTags = () => {
    if (!multiple || selectedItems.length === 0) return null;
    
    return (
      <TagsContainer>
        {selectedItems.map((item, index) => (
          <Tag key={`${item.value}-${index}`} $size={size}>
            <TagLabel>{getOptionLabel(item)}</TagLabel>
            <TagDeleteButton 
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveItem(index);
              }}
              title="Remove"
              aria-label={`Remove ${getOptionLabel(item)}`}
            >
              <ClearIcon fontSize="small" />
            </TagDeleteButton>
          </Tag>
        ))}
      </TagsContainer>
    );
  };
  
  const renderDropdown = () => {
    if (!open) return null;
    
    const dropdownContent = (
      <Dropdown
        ref={dropdownRef}
        $open={open}
        $reducedMotion={prefersReducedMotion}
      >
        {loading ? (
          <LoadingText>Loading</LoadingText>
        ) : filteredOptions.length === 0 ? (
          <NoOptions>No options</NoOptions>
        ) : (
          filteredOptions.map((option, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = selectedItems.some(item => item.value === option.value);
            
            // Custom render function if provided
            if (renderOption) {
              return renderOption(option, { 
                selected: isSelected, 
                highlighted: isHighlighted,
                inputValue: internalInputValue 
              });
            }
            
            return (
              <OptionItem
                key={`${option.value}-${index}`}
                $highlighted={isHighlighted}
                $selected={isSelected}
                onClick={() => handleSelectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {getOptionLabel(option)}
              </OptionItem>
            );
          })
        )}
      </Dropdown>
    );
    
    // Use portal if not disabled
    if (!disablePortal) {
      const portalTarget = popperContainer || document.body;
      return createPortal(dropdownContent, portalTarget);
    }
    
    return dropdownContent;
  };
  
  // Determine helper text content
  const helperTextContent = error === true ? helperText : (typeof error === 'string' ? error : helperText);
  const hasError = Boolean(error);
  
  // Show clear button?
  const showClearButton = clearable && !disabled && (
    (multiple && selectedItems.length > 0) || 
    (!multiple && selectedItems.length > 0) ||
    (!multiple && !selectedItems.length && internalInputValue)
  );
  
  return (
    <AutocompleteRoot
      ref={rootRef}
      className={className}
      style={style}
      $fullWidth={fullWidth}
      $animate={animate}
      $reducedMotion={prefersReducedMotion}
    >
      {label && <Label>{label}</Label>}
      
      <InputContainer
        $size={size}
        $focused={focused}
        $disabled={disabled}
        $hasError={hasError}
        onClick={() => {
          if (!disabled && inputRef.current) {
            inputRef.current.focus();
          }
        }}
      >
        {renderTags()}
        
        <Input
          ref={inputRef}
          value={internalInputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={typeof autoComplete === 'boolean' ? (autoComplete ? 'on' : 'off') : autoComplete}
          $size={size}
          $disabled={disabled}
          {...rest}
        />
        
        <EndAdornment>
          {showClearButton && (
            <ClearButton
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              title="Clear"
              aria-label="Clear"
            >
              <ClearIcon />
            </ClearButton>
          )}
        </EndAdornment>
      </InputContainer>
      
      {renderDropdown()}
      
      {helperTextContent && (
        <HelperText $hasError={hasError}>
          {helperTextContent}
        </HelperText>
      )}
    </AutocompleteRoot>
  );
}

/**
 * Autocomplete Component
 * 
 * A comprehensive autocomplete component with glass morphism styling.
 */
const Autocomplete = forwardRef(AutocompleteComponent) as <T extends AutocompleteOption = AutocompleteOption>(
  props: AutocompleteProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => JSX.Element;

/**
 * GlassAutocomplete Component
 * 
 * Glass variant of the Autocomplete component.
 */
const GlassAutocomplete = Autocomplete;

export default Autocomplete;
export { Autocomplete, GlassAutocomplete };