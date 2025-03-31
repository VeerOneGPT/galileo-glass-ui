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
import { useGalileoStateSpring, GalileoStateSpringOptions, GalileoSpringResult } from '../../hooks/useGalileoStateSpring';
import { useInertialMovement } from '../../animations/physics/useInertialMovement';
import { SpringPresets, SpringConfig } from '../../animations/physics/springPhysics';
import {
  useAnimationSequence,
  AnimationSequenceConfig,
  StaggerAnimationStage,
  SequenceControls,
} from '../../animations/orchestration/useAnimationSequence';

// Core styling imports
import { glassSurface } from '../../core/mixins/glassSurface';
import { glowEffects } from '../../core/mixins/effects/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useAnimationContext } from '../../contexts/AnimationContext';

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
import { AnimationProps } from '../../types/animation';

// --- Helper Functions (copied from Select/Autocomplete) ---
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
// --- End Helper Functions ---

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
  $translateX: number;
  $translateY: number;
  $scale: number;
  $isDragging: boolean;
  $initialOpacity?: number;
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
  transform: translate(${props => props.$translateX}px, ${props => props.$translateY}px)
             scale(${props => props.$scale});
  will-change: transform, opacity;
  opacity: ${props => props.$initialOpacity ?? 1};
  
  /* Dragging state */
  ${props => props.$isDragging && css`
    opacity: 0.8;
    z-index: 10;
    cursor: grabbing;
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
  will-change: transform, opacity;
  transform-origin: ${props => props.$openUp ? 'bottom center' : 'top center'};
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

// Define the actual component function that accepts props and ref
const GlassMultiSelectInternal = <T = string>(
  props: MultiSelectProps<T> & AnimationProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    options = [],
    value: controlledValue,
    onChange,
    onSelect,
    onRemove,
    onInputChange,
    placeholder = 'Select options...',
    label,
    helperText,
    error = false,
    errorMessage,
    disabled = false,
    fullWidth = false,
    width,
    size = 'medium',
    maxHeight = 300,
    clearable = true,
    searchable = true,
    creatable = false,
    onCreateOption,
    filterFunction,
    withGroups = false,
    groups = [],
    closeOnSelect = false,
    clearInputOnSelect = false,
    id,
    autoFocus,
    animate: propAnimate = true,
    openUp = false,
    className,
    keyboardNavigation = true,
    ariaLabel,
    physics = {},
    onOpen,
    onClose,
    maxSelections,
    maxDisplay,
    renderToken,
    renderOption,
    renderGroup,
    virtualization,
    async: asyncProps,
    animationConfig,
    disableAnimation: propDisableAnimation,
    ...rest
  } = props;

  // Extract nested props with defaults
  const loading = asyncProps?.loading ?? false;
  const loadingMessage = asyncProps?.loadingIndicator ?? 'Loading...';
  const virtualized = virtualization?.enabled ?? false;
  const itemHeight = virtualization?.itemHeight ?? 40;
  const defaultNoOptionsMessage = 'No options';

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // Combine external ref with internal rootRef
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    [ref]
  );

  // State
  const [internalValue, setInternalValue] = useState<MultiSelectOption<T>[]>(() => {
    const initial = controlledValue ?? [];
    return Array.isArray(initial) ? initial : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
  const [isRendered, setIsRendered] = useState(isDropdownOpen);

  // Animation Context & Settings
  const {
    modalSpringConfig: contextModalSpringConfig,
    defaultSpring: contextDefaultSpring,
    disableAnimation: contextDisableAnimation
  } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();

  // Calculate final disable state again
  const finalDisableAnimation = propDisableAnimation ?? contextDisableAnimation ?? prefersReducedMotion ?? !propAnimate;

  // Dropdown immediate flag
  const dropdownImmediate = finalDisableAnimation;

  // Resolve final spring config for dropdown (using nested physics prop)
  const finalDropdownSpringConfig = useMemo<Partial<SpringConfig>>(() => {
    const baseConfig = SpringPresets.DEFAULT;
    let resolvedContextConfig = {};
    if (typeof contextModalSpringConfig === 'string' && contextModalSpringConfig in SpringPresets) {
      resolvedContextConfig = SpringPresets[contextModalSpringConfig as keyof typeof SpringPresets];
    } else if (typeof contextModalSpringConfig === 'object') {
      resolvedContextConfig = contextModalSpringConfig ?? {};
    }
    // Merge config from the nested physics prop
    const propPhysicsConfig = physics?.animationPreset === 'gentle' ? SpringPresets.GENTLE :
                             physics?.animationPreset === 'snappy' ? SpringPresets.SNAPPY :
                             physics?.animationPreset === 'bouncy' ? SpringPresets.BOUNCY :
                             (typeof physics?.tension === 'number' && typeof physics?.friction === 'number' ? { tension: physics.tension, friction: physics.friction } : {}); // Use tension/friction if present
                             
    return { ...baseConfig, ...resolvedContextConfig, ...propPhysicsConfig };
  }, [contextModalSpringConfig, physics?.animationPreset, physics?.tension, physics?.friction]);

  // Use Galileo Spring for dropdown entrance/exit
  const dropdownAnimation: GalileoSpringResult = useGalileoStateSpring(
      isDropdownOpen ? 1 : 0,
      {
          ...finalDropdownSpringConfig,
          immediate: dropdownImmediate,
          onRest: (result) => {
              if (!isDropdownOpen && result.finished) {
                  setIsRendered(false);
              }
          }
      }
  );

  const shouldRenderDropdown = isRendered;

  // Effects (value control, portal rendering)
  useEffect(() => {
    if (controlledValue !== undefined) {
      const controlledArray = Array.isArray(controlledValue) ? controlledValue : [];
      if (JSON.stringify(controlledArray) !== JSON.stringify(internalValue)) {
          setInternalValue(controlledArray);
      }
    }
  }, [controlledValue, internalValue]);

  useEffect(() => {
      if (isDropdownOpen) {
          setIsRendered(true);
          if (onOpen) onOpen();
      } else {
          if (onClose) onClose();
      }
  }, [isDropdownOpen, onOpen, onClose]);

  // Filtered options computation
  const filteredOptions = useMemo(() => {
    let result = options;
    if (searchable && inputValue) {
        const filterFn = filterFunction || ((option, input) => 
            option.label.toLowerCase().includes(input.toLowerCase())
        );
        try {
             result = options.filter(option => filterFn(option, inputValue, internalValue));
        } catch (e) {
             console.warn("Filter function failed, check arguments", e);
             result = options.filter(option => (filterFn as any)(option, inputValue));
        }
    }
    if (creatable && inputValue && !options.some(opt => opt.label === inputValue)) {
        const creatableOption: any = {
             label: `Create "${inputValue}"`,
             value: inputValue, 
             id: `__creatable__${inputValue}`,
             __isCreatable__: true
        };
        result = [creatableOption as MultiSelectOption<any>, ...result];
    }
    return result;
  }, [options, inputValue, searchable, creatable, filterFunction, internalValue]);

  // Grouped options computation
  const groupedOptions = useMemo(() => {
    if (!withGroups) {
      return [{ group: null, options: filteredOptions }];
    }
    const groupMap: { [key: string]: MultiSelectOption<T>[] } = {};
    groups.forEach(g => groupMap[g.id] = []);
    
    filteredOptions.forEach(option => {
      const groupId = option.group || '__no_group__';
      if (!groupMap[groupId]) groupMap[groupId] = [];
      groupMap[groupId].push(option);
    });
    
    const orderedGroups: { group: OptionGroup | null; options: MultiSelectOption<T>[] }[] = [];
    groups.forEach(g => {
        if (groupMap[g.id]?.length > 0) orderedGroups.push({ group: g, options: groupMap[g.id] });
    });
    if (groupMap['__no_group__']?.length > 0) orderedGroups.push({ group: null, options: groupMap['__no_group__'] });
    Object.keys(groupMap).forEach(groupId => {
        if (groupId !== '__no_group__' && !groups.some(g => g.id === groupId) && groupMap[groupId].length > 0) {
            orderedGroups.push({ group: { id: groupId, label: groupId }, options: groupMap[groupId] });
        }
    });
    return orderedGroups;
  }, [filteredOptions, withGroups, groups]);

  const flatOptions = useMemo(() => groupedOptions.flatMap(g => g.options), [groupedOptions]);

  // Click outside handler
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        rootRef.current && !rootRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setFocused(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, handleClickOutside]);

  // Event Handlers
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      setFocused(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
        if (rootRef.current && !rootRef.current.contains(document.activeElement)) {
            setFocused(false);
            setIsDropdownOpen(false);
        }
    }, 150);
  };

  const handleContainerClick = () => {
      if (!disabled) {
          inputRef.current?.focus();
          if (!isDropdownOpen) {
              setIsDropdownOpen(true);
          }
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (!isDropdownOpen) setIsDropdownOpen(true);
    setFocusedOptionIndex(0);
    if (onInputChange) onInputChange(newValue);
  };

  const handleOptionClick = (option: MultiSelectOption<T>) => {
    if (option.disabled || (option as any).__isDisabled__) return;
    if ((option as any).__isCreatable__) {
        if (onCreateOption) {
            const createdOption = onCreateOption(inputValue);
            if (createdOption) handleOptionSelectInternal(createdOption);
            if (clearInputOnSelect) setInputValue('');
            if (!closeOnSelect) inputRef.current?.focus();
            else setIsDropdownOpen(false);
        }
        return;
    }
    handleOptionSelectInternal(option);
  };

  const handleOptionSelectInternal = (option: MultiSelectOption<T>) => {
    let newValue: MultiSelectOption<T>[];
    const isSelected = internalValue.some(v => v.id === option.id);

    if (isSelected) {
      newValue = internalValue.filter(v => v.id !== option.id);
      if (onRemove) onRemove(option);
    } else {
      if (maxSelections && internalValue.length >= maxSelections) return;
      newValue = [...internalValue, option];
      if (onSelect) onSelect(option);
    }
    if (controlledValue === undefined) setInternalValue(newValue);
    if (onChange) onChange(newValue);
    if (clearInputOnSelect) setInputValue('');
    if (!closeOnSelect) inputRef.current?.focus();
    else setIsDropdownOpen(false);
  };

  const handleTokenRemove = (e: React.MouseEvent, optionToRemove: MultiSelectOption<T>) => {
    e.stopPropagation();
    if (optionToRemove.disabled || disabled) return;
    const newValue = internalValue.filter(v => v.id !== optionToRemove.id);
    if (controlledValue === undefined) setInternalValue(newValue);
    if (onChange) onChange(newValue);
    if (onRemove) onRemove(optionToRemove);
    inputRef.current?.focus();
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (controlledValue === undefined) setInternalValue([]);
    if (onChange) onChange([]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!keyboardNavigation || disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isDropdownOpen) {
            setIsDropdownOpen(true);
            setFocusedOptionIndex(0);
        } else {
            setFocusedOptionIndex(prev => Math.min(prev + 1, flatOptions.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isDropdownOpen) {
            setFocusedOptionIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Enter':
        if (isDropdownOpen && focusedOptionIndex >= 0 && focusedOptionIndex < flatOptions.length) {
          e.preventDefault();
          const selectedOption = flatOptions[focusedOptionIndex];
          if (!selectedOption.disabled && !(selectedOption as any).__isDisabled__) {
            handleOptionClick(selectedOption);
          }
        }
        break;
      case 'Escape':
        if (isDropdownOpen) {
          e.preventDefault();
          setIsDropdownOpen(false);
        }
        break;
      case 'Backspace':
        if (!inputValue && internalValue.length > 0) {
          e.preventDefault();
          const lastOption = internalValue[internalValue.length - 1];
          handleTokenRemove(e as any, lastOption);
        }
        break;
      default: break;
    }
  };

  // Scroll into view logic
  useEffect(() => {
      if (isDropdownOpen && focusedOptionIndex >= 0 && listRef.current) {
          const optionElement = listRef.current.querySelector(`[data-option-index="${focusedOptionIndex}"]`) as HTMLLIElement;
           if (optionElement) optionElement.scrollIntoView({ block: 'nearest' });
      }
  }, [isDropdownOpen, focusedOptionIndex]);

  // --- Token Entrance Animation Implementation ---

  // Define the sequence configuration MEMOIZED
  const entranceSequenceConfig = useMemo((): AnimationSequenceConfig => {
    // Default stage config
    const entranceStage: StaggerAnimationStage = {
      id: 'token-entrance-stagger',
      type: 'stagger',
      targets: '.galileo-multiselect-token', // Target the class name
      from: { opacity: 0, transform: 'translateY(5px) scale(0.95)' },
      to: { opacity: 1, transform: 'translateY(0px) scale(1)' },
      duration: 300,
      staggerDelay: 30,
      easing: 'easeOutCubic',
      // Optional: Use animationConfig prop for physics override
      // config: animationConfig ?? contextDefaultSpring ?? SpringPresets.SNAPPY 
    };
    return {
      id: `multiselect-token-entrance-${id || 'default'}`,
      stages: [entranceStage],
      autoplay: false, // Trigger manually
    };
  }, [id]); // Depends on ID for uniqueness, config could be added if used

  // Instantiate the sequence hook
  const { play: playEntranceAnimation }: SequenceControls = useAnimationSequence(entranceSequenceConfig);

  // Ref to track if initial animation has run
  const initialAnimationPlayed = useRef(false);

  // Trigger the entrance animation on mount/value change if enabled
  useEffect(() => {
    if (propAnimate && !finalDisableAnimation && internalValue.length > 0 && !initialAnimationPlayed.current) {
      // Small delay to ensure elements are rendered before targeting
      const timer = setTimeout(() => {
        playEntranceAnimation();
        initialAnimationPlayed.current = true; // Mark as played
      }, 50); // Adjust delay if needed
      return () => clearTimeout(timer);
    }
    // Reset flag if value becomes empty (optional, for re-animation)
    if (internalValue.length === 0) {
        initialAnimationPlayed.current = false;
    }
  // Dependency: only run when animation state or value length changes
  }, [propAnimate, finalDisableAnimation, internalValue.length, playEntranceAnimation]);

  // --- End Token Entrance Animation Implementation ---

  // Render function for dropdown content
  const renderDropdown = () => {
    const content = (
        <> 
            {loading && <LoadingIndicator>{loadingMessage}</LoadingIndicator>}
            {!loading && flatOptions.length === 0 && <NoOptions>{defaultNoOptionsMessage}</NoOptions>}
            {!loading && flatOptions.length > 0 && (
                <OptionsList ref={listRef} role="listbox" id={`listbox-${id || 'gms'}`}>
                    {groupedOptions.map((groupInfo, groupIndex) => (
                        <React.Fragment key={groupInfo.group?.id || `group-${groupIndex}`}>
                            {groupInfo.group && (
                                renderGroup ? renderGroup(groupInfo.group) :
                                <GroupHeader $size={size}>{groupInfo.group.label}</GroupHeader>
                            )}
                            {groupInfo.options.map(option => {
                                const isSelected = internalValue.some(v => v.id === option.id);
                                const isDisabled = option.disabled || disabled;
                                const currentIndex = flatOptions.findIndex(opt => opt.id === option.id);
                                const isFocused = currentIndex === focusedOptionIndex;
                                const optionContent = renderOption ? renderOption(option, { selected: isSelected, focused: isFocused, disabled: !!isDisabled }) :
                                    <>{option.label} {isSelected && <span>✓</span>}</>; 
                                return (
                                    <OptionItem
                                        key={option.id}
                                        $isSelected={isSelected}
                                        $isFocused={isFocused}
                                        $isDisabled={!!isDisabled}
                                        $size={size}
                                        onClick={() => !isDisabled && handleOptionClick(option)}
                                        onMouseEnter={() => !isDisabled && setFocusedOptionIndex(currentIndex)}
                                        role="option"
                                        aria-selected={isSelected}
                                        aria-disabled={isDisabled}
                                        data-option-index={currentIndex}
                                    >
                                        {optionContent}
                                    </OptionItem>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </OptionsList>
            )}
        </>
    );

    if (typeof document === 'undefined') return null;

    return createPortal(
      <DropdownContainer
        ref={dropdownContainerRef}
        $width={rootRef.current?.offsetWidth || 300}
        $maxHeight={maxHeight}
        $openUp={openUp}
        style={{
            opacity: dropdownAnimation.value,
            transform: `scaleY(${dropdownAnimation.value})`,
            pointerEvents: isDropdownOpen ? 'auto' : 'none',
            visibility: shouldRenderDropdown ? 'visible' : 'hidden',
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {content}
      </DropdownContainer>,
      document.body
    );
  };

  // Component Return
  return (
    <MultiSelectRoot
      ref={combinedRef}
      $fullWidth={fullWidth}
      $width={width}
      $animate={propAnimate && !dropdownImmediate}
      $reducedMotion={prefersReducedMotion}
      className={className}
    >
      {label && <Label htmlFor={id || 'gms-input'}>{label}</Label>}
      <InputContainer
        $size={size}
        $focused={focused}
        $disabled={disabled}
        $hasError={!!error}
        onClick={handleContainerClick}
      >
        <TokensContainer>
          {internalValue.map((option, index) => (
             renderToken ? renderToken(option, (e: any) => handleTokenRemove(e, option)) :
             <Token
                key={option.id}
                className="galileo-multiselect-token"
                $isDisabled={disabled || !!option.disabled}
                $translateX={0}
                $translateY={0}
                $scale={1}
                $isDragging={false}
                $initialOpacity={propAnimate && !finalDisableAnimation ? 0 : 1}
            >
                <TokenLabel>{option.label}</TokenLabel>
                {!(disabled || !!option.disabled) && (
                    <RemoveButton
                        className="remove-button"
                        onClick={(e) => handleTokenRemove(e, option)}
                        aria-label={`Remove ${option.label}`}
                    >
                        <ClearIcon />
                    </RemoveButton>
                )}
            </Token>
          ))}
          {searchable && (
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={internalValue.length === 0 ? placeholder : ''}
              disabled={disabled}
              $size={size}
              id={id || 'gms-input'}
              autoFocus={autoFocus}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-controls={isDropdownOpen ? `listbox-${id || 'gms'}` : undefined}
              aria-label={ariaLabel || label}
              autoComplete="off"
              {...rest}
            />
          )}
        </TokensContainer>
        {clearable && internalValue.length > 0 && !disabled && (
          <ClearButton onClick={handleClearAll} aria-label="Clear all selected">
            <ClearIcon />
          </ClearButton>
        )}
      </InputContainer>
      {helperText && !error && <HelperText>{helperText}</HelperText>}
      {error && errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      
      {shouldRenderDropdown && renderDropdown()}

    </MultiSelectRoot>
  );
}

// Forward Ref and Export
export const GlassMultiSelect = forwardRef(GlassMultiSelectInternal) as <T = string>(
  props: MultiSelectProps<T> & AnimationProps & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

(GlassMultiSelect as any).displayName = 'GlassMultiSelect';

export default GlassMultiSelect;