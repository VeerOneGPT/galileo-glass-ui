/**
 * GlassMultiSelect Component
 * 
 * A glass-styled multi-select component with physics-based animations,
 * token-based selected items, advanced filtering, and virtualization.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';

// Physics-related imports
import { useSpring } from '../../animations/physics/useSpring';
import { useInertialMovement } from '../../animations/physics/useInertialMovement';
import { SpringPresets } from '../../animations/physics/springPhysics';

// Core styling imports
import { glassSurface } from '../../core/mixins/glassSurface';
import { glowEffects } from '../../core/mixins/effects/glowEffects';
import { createThemeContext } from '../../core/themeContext';

// Hooks and utilities
import { useReducedMotion } from '../../hooks/useReducedMotion';
import ClearIcon from '../icons/ClearIcon';

// Types
import { 
  MultiSelectOption, 
  OptionGroup,
  MultiSelectProps,
  FilterFunction
} from './types';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  70% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
`;

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
`;

// Styled components
const MultiSelectRoot = styled.div<{
  $fullWidth: boolean;
  $width?: string | number;
  $animate: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${props => props.$fullWidth 
    ? '100%' 
    : props.$width 
      ? (typeof props.$width === 'number' ? `${props.$width}px` : props.$width) 
      : '300px'
  };
  position: relative;
  font-family: inherit;
  
  /* Animation on mount */
  ${props => props.$animate && !props.$reducedMotion && css`
    animation: ${fadeIn} 0.4s ease-out;
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
  flex-wrap: wrap;
  width: 100%;
  gap: 6px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'text'};
  
  /* Size variations */
  ${props => {
    switch (props.$size) {
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
  
  /* Enhanced glass styling */
  ${props => glassSurface({
    elevation: 1,
    blurStrength: 'light',
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme),
  })}
  
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$hasError 
      ? 'rgba(240, 82, 82, 0.8)' 
      : props.$focused 
        ? 'rgba(99, 102, 241, 0.8)' 
        : 'rgba(255, 255, 255, 0.12)'
  };
  background-color: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  
  /* Focused state */
  ${props => props.$focused && css`
    border-color: rgba(99, 102, 241, 0.8);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  `}
  
  /* Error state */
  ${props => props.$hasError && css`
    border-color: rgba(240, 82, 82, 0.8);
    box-shadow: 0 0 0 1px rgba(240, 82, 82, 0.3);
  `}
  
  /* Disabled state */
  ${props => props.$disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.01);
  `}
`;

const TokensContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
`;

const Token = styled.div<{
  $isDisabled: boolean;
  $animate: boolean;
  $reducedMotion: boolean;
  $animateRemove: boolean;
  $translateX: number;
  $translateY: number;
  $scale: number;
  $isDragging: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 16px;
  font-size: 0.85rem;
  gap: 6px;
  max-width: 200px;
  background: rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: rgba(255, 255, 255, 0.95);
  transition: background-color 0.2s ease;
  user-select: none;
  
  /* Optional: initial pop-in animation */
  ${props => props.$animate && !props.$reducedMotion && css`
    animation: ${popIn} 0.3s ease-out;
  `}
  
  /* Physics-based positioning */
  transform: translate(${props => props.$translateX}px, ${props => props.$translateY}px) 
             scale(${props => props.$scale});
  
  /* Dragging state */
  ${props => props.$isDragging && css`
    opacity: 0.8;
    z-index: 10;
    cursor: grabbing;
  `}
  
  /* Remove animation */
  ${props => props.$animateRemove && !props.$reducedMotion && css`
    animation: ${fadeIn} 0.2s ease-out reverse;
  `}
  
  /* Hover styles */
  &:hover {
    background: rgba(99, 102, 241, 0.3);
    
    /* Only show the remove button hover effect when not disabled */
    ${props => !props.$isDisabled && css`
      .remove-button {
        background-color: rgba(255, 255, 255, 0.2);
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      }
    `}
  }
  
  /* Disabled state */
  ${props => props.$isDisabled && css`
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const TokenLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
  }
  
  /* Icon sizing */
  svg {
    width: 12px;
    height: 12px;
  }
  
  /* Disabled state inherited from parent */
`;

const Input = styled.input<{ $size: 'small' | 'medium' | 'large' }>`
  flex: 1;
  min-width: 50px;
  border: none;
  outline: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: ${props => 
    props.$size === 'small' 
      ? '0.85rem' 
      : props.$size === 'large' 
        ? '1.05rem' 
        : '0.95rem'
  };
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const DropdownContainer = styled.div<{
  $width: number;
  $maxHeight: string | number;
  $openUp: boolean;
  $animate: boolean;
  $reducedMotion: boolean;
  $popperWidth?: string;
}>`
  position: absolute;
  width: ${props => props.$popperWidth || `${props.$width}px`};
  max-height: ${props => 
    typeof props.$maxHeight === 'number' 
      ? `${props.$maxHeight}px` 
      : props.$maxHeight
  };
  overflow-y: auto;
  z-index: 1000;
  ${props => props.$openUp ? 'bottom: 100%;' : 'top: 100%;'}
  left: 0;
  margin-top: ${props => props.$openUp ? '0' : '4px'};
  margin-bottom: ${props => props.$openUp ? '4px' : '0'};
  
  /* Enhanced glass styling */
  ${props => glassSurface({
    elevation: 2,
    blurStrength: 'medium',
    borderOpacity: 'subtle',
    themeContext: createThemeContext(props.theme),
  })}
  
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  
  /* Animation */
  ${props => props.$animate && !props.$reducedMotion && css`
    animation: ${fadeIn} 0.2s ease-out;
    transform-origin: ${props.$openUp ? 'bottom' : 'top'};
  `}
`;

const OptionsList = styled.ul`
  margin: 0;
  padding: 6px 0;
  list-style: none;
`;

const OptionItem = styled.li<{ 
  $isSelected: boolean; 
  $isFocused: boolean; 
  $isDisabled: boolean;
  $size: 'small' | 'medium' | 'large';
}>`
  padding: ${props => 
    props.$size === 'small' 
      ? '6px 10px' 
      : props.$size === 'large' 
        ? '10px 16px' 
        : '8px 12px'
  };
  cursor: ${props => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.15s ease;
  position: relative;
  
  /* Text styling */
  color: rgba(255, 255, 255, ${props => props.$isDisabled ? '0.5' : '0.9'});
  
  /* Selected state */
  ${props => props.$isSelected && css`
    background-color: rgba(99, 102, 241, 0.15);
    font-weight: 500;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: rgba(99, 102, 241, 0.8);
    }
  `}
  
  /* Focus state */
  ${props => props.$isFocused && !props.$isDisabled && css`
    background-color: rgba(255, 255, 255, 0.08);
  `}
  
  /* Hover state - only when not disabled */
  ${props => !props.$isDisabled && css`
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `}
  
  /* Disabled state */
  ${props => props.$isDisabled && css`
    opacity: 0.6;
  `}
`;

const OptionText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  /* For multi-line text with description */
  .option-label {
    font-weight: 500;
  }
  
  .option-description {
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 2px;
  }
`;

const GroupHeader = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  padding: ${props => 
    props.$size === 'small' 
      ? '6px 10px' 
      : props.$size === 'large' 
        ? '10px 16px' 
        : '8px 12px'
  };
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  letter-spacing: 0.5px;
`;

const NoOptions = styled.div`
  padding: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  font-style: italic;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 4px;
  margin-left: 4px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
  
  &:focus {
    outline: none;
    color: rgba(255, 255, 255, 0.8);
  }
  
  /* Icon sizing */
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  color: rgba(255, 255, 255, 0.7);
  
  /* Simple loading spinner */
  .spinner {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(99, 102, 241, 0.3);
    border-top-color: rgba(99, 102, 241, 0.8);
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: rgba(240, 82, 82, 0.9);
  font-size: 0.8rem;
  margin-top: 4px;
  padding-left: 4px;
`;

const HelperText = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-top: 4px;
  padding-left: 4px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

// Custom hook to manage 2D position with inertia
interface Position2D {
  x: number;
  y: number;
}

interface UsePositionInertiaResult {
  position: Position2D;
  setPosition: (position: Position2D, animate?: boolean) => void;
}

const usePositionInertia = (
  initialPosition: Position2D = { x: 0, y: 0 },
  config: any = {}
): UsePositionInertiaResult => {
  const { position: xPosition, setPosition: setXPosition } = useInertialMovement({
    initialPosition: initialPosition.x,
    ...config
  });
  
  const { position: yPosition, setPosition: setYPosition } = useInertialMovement({
    initialPosition: initialPosition.y,
    ...config
  });
  
  const position = { x: xPosition, y: yPosition };
  
  const setPosition = (newPosition: Position2D, animate = true) => {
    setXPosition(newPosition.x, animate ? undefined : 0);
    setYPosition(newPosition.y, animate ? undefined : 0);
  };
  
  return { position, setPosition };
};

// Component implementation
function GlassMultiSelectInternal<T = string>(
  props: MultiSelectProps<T> & { ref?: React.Ref<HTMLInputElement> }
) {
  // Destructure props with defaults
  const {
    options = [],
    value = [],
    placeholder = 'Select options...',
    onChange,
    onSelect,
    onRemove,
    width,
    fullWidth = false,
    size = 'medium',
    maxHeight = '300px',
    className,
    disabled = false,
    error = false,
    errorMessage,
    label,
    helperText,
    animate = true,
    openUp = false,
    filterFunction,
    creatable = false,
    onCreateOption,
    maxSelections,
    maxDisplay,
    renderToken,
    renderOption,
    renderGroup,
    closeOnSelect = false,
    clearInputOnSelect = false,
    keyboardNavigation = true,
    clearable = true,
    searchable = true,
    autoFocus = false,
    id,
    ariaLabel,
    withGroups = false,
    groups = [],
    onOpen,
    onClose,
    onInputChange,
    virtualization,
    physics = {
      tension: 180,
      friction: 12,
      animationPreset: 'default',
      dragToReorder: true,
      hoverEffects: true
    },
    async = {
      loading: false
    },
    touchFriendly = true,
    ref
  } = props;

  // Physics configuration
  const springConfig = useMemo(() => {
    if (physics.animationPreset === 'gentle') return SpringPresets.GENTLE;
    if (physics.animationPreset === 'snappy') return SpringPresets.SNAPPY;
    if (physics.animationPreset === 'bouncy') return SpringPresets.BOUNCY;
    
    // Default or custom configuration
    return {
      tension: physics.tension || 180,
      friction: physics.friction || 12,
      mass: 1
    };
  }, [physics.animationPreset, physics.tension, physics.friction]);

  // State
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption<T>[]>(value);
  const [containerWidth, setContainerWidth] = useState(0);
  const [animatingTokenIds, setAnimatingTokenIds] = useState<string[]>([]);
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [resetShake, setResetShake] = useState(false);
  
  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tokenRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const tokenPositions = useRef<Map<string, { x: number, y: number }>>(new Map());
  const tokenStartPosition = useRef<{ x: number, y: number } | null>(null);
  const tokenOriginalOrder = useRef<string[]>([]);
  
  // Accessibility
  const reducedMotion = useReducedMotion();
  
  // Inertial movement for token dragging
  const { position: dragPosition, setPosition: setDragPosition } = usePositionInertia({ x: 0, y: 0 });
  
  // Spring for token animations
  const { value: tokenScale, start: animateTokenScale } = useSpring({
    from: 1,
    to: 1,
    config: springConfig
  });
  
  // Filtered options based on input
  const filteredOptions = useMemo(() => {
    if (!searchable || inputValue.trim() === '') {
      return options;
    }
    
    // If custom filter function is provided, use it
    if (filterFunction) {
      return options.filter(option => filterFunction(option, inputValue, selectedOptions));
    }
    
    // Default filtering: case-insensitive search in label
    const normalizedInput = inputValue.toLowerCase().trim();
    return options.filter(option => 
      option.label.toLowerCase().includes(normalizedInput) ||
      (option.description && option.description.toLowerCase().includes(normalizedInput))
    );
  }, [options, inputValue, searchable, filterFunction, selectedOptions]);
  
  // Group options for rendering
  const groupedOptions = useMemo(() => {
    if (!withGroups) {
      return { default: filteredOptions };
    }
    
    // Create a map of group id to options
    const result: Record<string, MultiSelectOption<T>[]> = {};
    
    // Initialize each group with an empty array
    groups.forEach(group => {
      result[group.id] = [];
    });
    
    // Add options to their groups
    filteredOptions.forEach(option => {
      const groupId = option.group || 'default';
      if (!result[groupId]) {
        result[groupId] = [];
      }
      result[groupId].push(option);
    });
    
    // Handle options without a group
    if (result.default && result.default.length === 0) {
      delete result.default;
    }
    
    return result;
  }, [filteredOptions, withGroups, groups]);
  
  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // If dropdown is not open and we start typing, open it
    if (!isOpen && value.trim() !== '') {
      setIsOpen(true);
      onOpen?.();
    }
    
    // Call the onInputChange callback
    onInputChange?.(value);
  }, [isOpen, onInputChange, onOpen]);
  
  // Handle option selection
  const handleSelectOption = useCallback((option: MultiSelectOption<T>) => {
    // Don't select disabled options
    if (option.disabled) return;
    
    // Check if we're at max selections
    if (maxSelections && selectedOptions.length >= maxSelections) {
      // Show shake animation on the container
      setResetShake(true);
      setTimeout(() => setResetShake(false), 10);
      
      return;
    }
    
    // Add the option if it's not already selected
    if (!selectedOptions.some(selected => selected.id === option.id)) {
      const newSelectedOptions = [...selectedOptions, option];
      setSelectedOptions(newSelectedOptions);
      
      // Add to animating tokens for entrance animation
      setAnimatingTokenIds(prev => [...prev, String(option.id)]);
      
      // Remove animation after delay
      setTimeout(() => {
        setAnimatingTokenIds(prev => prev.filter(id => id !== String(option.id)));
      }, 300);
      
      // Call callbacks
      onChange?.(newSelectedOptions);
      onSelect?.(option);
      
      // Clear input if needed
      if (clearInputOnSelect) {
        setInputValue('');
      }
      
      // Close dropdown if needed
      if (closeOnSelect) {
        setIsOpen(false);
        onClose?.();
      }
    }
  }, [selectedOptions, maxSelections, onChange, onSelect, clearInputOnSelect, closeOnSelect, onClose]);
  
  // Handle token removal
  const handleRemoveToken = useCallback((option: MultiSelectOption<T>) => {
    // Add to animating tokens for exit animation
    setAnimatingTokenIds(prev => [...prev, String(option.id)]);
    
    // Wait for animation to complete before removal
    setTimeout(() => {
      // First remove from animating tokens
      setAnimatingTokenIds(prev => prev.filter(id => id !== String(option.id)));
      
      // Then remove from selected options
      const newSelectedOptions = selectedOptions.filter(selected => selected.id !== option.id);
      setSelectedOptions(newSelectedOptions);
      
      // Call callbacks
      onChange?.(newSelectedOptions);
      onRemove?.(option);
    }, 200);
  }, [selectedOptions, onChange, onRemove]);
  
  // Handle clear all tokens
  const handleClearAll = useCallback(() => {
    // Add all tokens to animating list for exit animation
    setAnimatingTokenIds(
      selectedOptions.map(option => String(option.id))
    );
    
    // Wait for animation to complete before clearing
    setTimeout(() => {
      setSelectedOptions([]);
      setAnimatingTokenIds([]);
      
      // Call callback
      onChange?.([]);
    }, 200);
  }, [selectedOptions, onChange]);
  
  // Handle container focus
  const handleContainerFocus = useCallback(() => {
    // Don't focus if disabled
    if (disabled) return;
    
    setIsFocused(true);
    inputRef.current?.focus();
  }, [disabled]);
  
  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);
  
  // Handle input blur
  const handleInputBlur = useCallback(() => {
    // Short delay to allow for click handling
    setTimeout(() => {
      // Only blur if no element inside the container has focus
      if (
        containerRef.current && 
        !containerRef.current.contains(document.activeElement)
      ) {
        setIsFocused(false);
        setIsOpen(false);
        onClose?.();
      }
    }, 100);
  }, [onClose]);
  
  // Handle dropdown toggle
  const handleToggleDropdown = useCallback(() => {
    if (disabled) return;
    
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      onOpen?.();
      // Focus the input when opening
      inputRef.current?.focus();
    } else {
      onClose?.();
    }
  }, [disabled, isOpen, onOpen, onClose]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!keyboardNavigation || disabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          onOpen?.();
          setFocusedIndex(0);
        } else {
          setFocusedIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            // Convert flat array from grouped options
            const flatOptions = Object.values(groupedOptions).flat();
            return nextIndex >= flatOptions.length ? 0 : nextIndex;
          });
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          onOpen?.();
          // Select last option when opening with arrow up
          const flatOptions = Object.values(groupedOptions).flat();
          setFocusedIndex(flatOptions.length - 1);
        } else {
          setFocusedIndex(prevIndex => {
            const flatOptions = Object.values(groupedOptions).flat();
            const nextIndex = prevIndex - 1;
            return nextIndex < 0 ? flatOptions.length - 1 : nextIndex;
          });
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          // Get flat array of options
          const flatOptions = Object.values(groupedOptions).flat();
          if (focusedIndex < flatOptions.length) {
            handleSelectOption(flatOptions[focusedIndex]);
          }
        } else if (!isOpen) {
          setIsOpen(true);
          onOpen?.();
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          onClose?.();
        }
        break;
        
      case 'Backspace':
        // Remove the last selected token if input is empty
        if (inputValue === '' && selectedOptions.length > 0) {
          handleRemoveToken(selectedOptions[selectedOptions.length - 1]);
        }
        break;
    }
  }, [
    keyboardNavigation, 
    disabled, 
    isOpen, 
    focusedIndex,
    groupedOptions,
    inputValue, 
    selectedOptions,
    handleSelectOption,
    handleRemoveToken,
    onOpen,
    onClose
  ]);
  
  // Measure container width for dropdown positioning
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);
  
  // Set initial value
  useEffect(() => {
    setSelectedOptions(value);
  }, [value]);
  
  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);
  
  // Track token positions for animation
  useEffect(() => {
    // Update positions for all tokens
    tokenRefs.current.forEach((elem, id) => {
      const rect = elem.getBoundingClientRect();
      if (rect) {
        tokenPositions.current.set(id, { x: rect.left, y: rect.top });
      }
    });
    
    // Track token order
    tokenOriginalOrder.current = selectedOptions.map(opt => String(opt.id));
  }, [selectedOptions]);
  
  // Touch event handlers for token dragging
  const handleTokenMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, option: MultiSelectOption<T>) => {
    if (disabled || !physics.dragToReorder) return;
    
    // Prevent default to avoid text selection
    e.preventDefault();
    
    const id = String(option.id);
    setDraggedTokenId(id);
    
    // Store initial position for relative movement
    const eventPosition = 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
      
    tokenStartPosition.current = eventPosition;
    
    // Reset drag position
    setDragPosition({ x: 0, y: 0 }, false);
    
    // Animate scale up
    animateTokenScale({ to: 1.05 });
    
    // Setup window events for dragging
    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!tokenStartPosition.current) return;
      
      const currentPosition = 'touches' in moveEvent 
        ? { x: moveEvent.touches[0].clientX, y: moveEvent.touches[0].clientY }
        : { x: moveEvent.clientX, y: moveEvent.clientY };
        
      // Calculate delta from start position
      const deltaX = currentPosition.x - tokenStartPosition.current.x;
      const deltaY = currentPosition.y - tokenStartPosition.current.y;
      
      // Update position
      setDragPosition({ x: deltaX, y: deltaY }, false);
      
      // TODO: Handle reordering of tokens based on position
      // This would require complex collision detection
    };
    
    const handleMouseUp = () => {
      // Reset dragging state
      setDraggedTokenId(null);
      tokenStartPosition.current = null;
      
      // Animate back to original position with spring physics
      setDragPosition({ x: 0, y: 0 }, true);
      
      // Animate scale down
      animateTokenScale({ to: 1 });
      
      // Remove window event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
    
    // Add window event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
  }, [disabled, physics.dragToReorder, setDragPosition, animateTokenScale]);
  
  // Handle option virtualization
  const getVirtualizedOptions = useCallback(() => {
    // Get flat array of options
    const flatOptions = Object.values(groupedOptions).flat();
    
    // Enable virtualization if there are many options
    const shouldVirtualize = virtualization?.enabled || 
      (virtualization?.itemHeight && flatOptions.length > 100);
      
    if (!shouldVirtualize || !virtualization?.itemHeight) {
      return flatOptions;
    }
    
    // Simple virtualization: only render a window of items
    const itemCount = virtualization.itemCount || 30;
    const startIndex = Math.max(0, focusedIndex - Math.floor(itemCount / 2));
    
    return flatOptions.slice(startIndex, startIndex + itemCount);
  }, [groupedOptions, virtualization, focusedIndex]);
  
  // Custom token renderer
  const renderTokenComponent = useCallback((option: MultiSelectOption<T>, index: number) => {
    // Check if token is being animated
    const isAnimating = animatingTokenIds.includes(String(option.id));
    const isDragging = draggedTokenId === String(option.id);
    
    // Get token position transforms
    const translateX = isDragging ? dragPosition.x : 0;
    const translateY = isDragging ? dragPosition.y : 0;
    const scale = isDragging ? tokenScale : 1;
    
    // If custom renderer is provided, wrap it with animation props
    if (renderToken) {
      return renderToken(option, () => handleRemoveToken(option));
    }
    
    // Default token rendering
    return (
      <Token
        key={String(option.id)}
        ref={(el) => {
          if (el) tokenRefs.current.set(String(option.id), el);
          else tokenRefs.current.delete(String(option.id));
        }}
        $isDisabled={disabled || !!option.disabled}
        $animate={animate && isAnimating && !isAnimating}
        $reducedMotion={reducedMotion}
        $animateRemove={isAnimating}
        $translateX={translateX}
        $translateY={translateY}
        $scale={scale}
        $isDragging={isDragging}
        onMouseDown={(e) => handleTokenMouseDown(e, option)}
        onTouchStart={(e) => touchFriendly && handleTokenMouseDown(e, option)}
      >
        {option.icon && <span className="token-icon">{option.icon}</span>}
        <TokenLabel>{option.label}</TokenLabel>
        {!disabled && !option.disabled && (
          <RemoveButton
            type="button"
            className="remove-button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveToken(option);
            }}
            aria-label={`Remove ${option.label}`}
            tabIndex={-1}
          >
            <ClearIcon />
          </RemoveButton>
        )}
      </Token>
    );
  }, [
    animatingTokenIds,
    draggedTokenId,
    dragPosition,
    tokenScale,
    animate,
    reducedMotion,
    disabled,
    renderToken,
    handleRemoveToken,
    handleTokenMouseDown,
    touchFriendly
  ]);
  
  // Custom option renderer
  const renderOptionComponent = useCallback((option: MultiSelectOption<T>, index: number) => {
    // Check if option is selected
    const isSelected = selectedOptions.some(selected => selected.id === option.id);
    
    // Check if option is focused
    const isFocused = index === focusedIndex;
    
    // If custom renderer is provided, use it
    if (renderOption) {
      return renderOption(option, {
        selected: isSelected,
        focused: isFocused,
        disabled: !!option.disabled
      });
    }
    
    // Default option rendering
    return (
      <OptionItem
        key={String(option.id)}
        $isSelected={isSelected}
        $isFocused={isFocused}
        $isDisabled={!!option.disabled}
        $size={size}
        onClick={() => !option.disabled && handleSelectOption(option)}
        onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
      >
        {option.icon && <span className="option-icon">{option.icon}</span>}
        <OptionText>
          <span className="option-label">{option.label}</span>
          {option.description && (
            <span className="option-description">{option.description}</span>
          )}
        </OptionText>
      </OptionItem>
    );
  }, [selectedOptions, focusedIndex, renderOption, size, handleSelectOption]);
  
  // Custom group renderer
  const renderGroupComponent = useCallback((groupId: string, options: MultiSelectOption<T>[]) => {
    // Skip rendering if there are no options in this group
    if (options.length === 0) return null;
    
    // Find group configuration
    const group = groups.find(g => g.id === groupId);
    
    // If no group info and it's the default group, just render options
    if (!group && groupId === 'default') {
      return options.map((option, index) => renderOptionComponent(option, index));
    }
    
    // If custom renderer is provided, use it
    if (renderGroup && group) {
      return (
        <React.Fragment key={groupId}>
          {renderGroup(group)}
          {options.map((option, index) => renderOptionComponent(option, index))}
        </React.Fragment>
      );
    }
    
    // Default group rendering
    return (
      <React.Fragment key={groupId}>
        <GroupHeader $size={size}>
          {group ? group.label : groupId}
        </GroupHeader>
        {options.map((option, index) => renderOptionComponent(option, index))}
      </React.Fragment>
    );
  }, [groups, renderGroup, renderOptionComponent, size]);
  
  // Portal for dropdown to avoid container clipping
  const renderDropdown = () => {
    if (!isOpen) return null;
    
    // Create portal content
    const dropdown = (
      <DropdownContainer
        ref={dropdownRef}
        $width={containerWidth}
        $maxHeight={maxHeight}
        $openUp={openUp}
        $animate={animate}
        $reducedMotion={reducedMotion}
      >
        <OptionsList>
          {Object.entries(groupedOptions).length === 0 ? (
            <NoOptions>No options available</NoOptions>
          ) : withGroups ? (
            Object.entries(groupedOptions).map(([groupId, options]) => 
              renderGroupComponent(groupId, options)
            )
          ) : (
            filteredOptions.map((option, index) => renderOptionComponent(option, index))
          )}
          
          {/* Loading indicator for async loading */}
          {async.loading && (
            <LoadingIndicator>
              {async.loadingIndicator || <div className="spinner" />}
            </LoadingIndicator>
          )}
          
          {/* Create option UI */}
          {creatable && inputValue.trim() !== '' && !filteredOptions.some(
            opt => opt.label.toLowerCase() === inputValue.toLowerCase()
          ) && (
            <OptionItem
              $isSelected={false}
              $isFocused={focusedIndex === filteredOptions.length}
              $isDisabled={false}
              $size={size}
              onClick={() => {
                if (onCreateOption) {
                  const newOption = onCreateOption(inputValue);
                  handleSelectOption(newOption);
                  setInputValue('');
                }
              }}
            >
              <OptionText>
                <span className="option-label">Create "{inputValue}"</span>
              </OptionText>
            </OptionItem>
          )}
        </OptionsList>
      </DropdownContainer>
    );
    
    // Use portal if document is available (client-side)
    if (typeof document !== 'undefined') {
      return createPortal(dropdown, document.body);
    }
    
    return dropdown;
  };
  
  // Main component render
  return (
    <MultiSelectRoot
      ref={containerRef}
      $fullWidth={fullWidth}
      $width={width}
      $animate={animate}
      $reducedMotion={reducedMotion}
      className={className}
      style={resetShake ? { animation: `${shake} 0.4s ease-in-out` } : undefined}
      onClick={handleContainerFocus}
    >
      {label && <Label htmlFor={id || 'glass-multi-select'}>{label}</Label>}
      
      <InputContainer
        $size={size}
        $focused={isFocused}
        $disabled={disabled}
        $hasError={error}
      >
        <TokensContainer>
          {/* Render selected tokens */}
          {selectedOptions.map((option, index) => renderTokenComponent(option, index))}
          
          {/* Input field */}
          <Input
            ref={ref || inputRef}
            type="text"
            id={id || 'glass-multi-select'}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
            disabled={disabled}
            readOnly={!searchable}
            aria-label={ariaLabel || label || 'Multi select'}
            aria-controls="multi-select-dropdown"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            role="combobox"
            autoComplete="off"
            $size={size}
          />
        </TokensContainer>
        
        {/* Clear button */}
        {clearable && selectedOptions.length > 0 && !disabled && (
          <ClearButton 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClearAll();
            }}
            aria-label="Clear all"
          >
            <ClearIcon />
          </ClearButton>
        )}
      </InputContainer>
      
      {/* Error message or helper text */}
      {error && errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
      
      {/* Dropdown menu */}
      {renderDropdown()}
    </MultiSelectRoot>
  );
}

// Export with forwardRef wrapper for ref passing
export const GlassMultiSelect = forwardRef(GlassMultiSelectInternal) as <T = string>(
  props: MultiSelectProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => JSX.Element;

export default GlassMultiSelect;