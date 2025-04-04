/**
 * GlassDateRangePicker Component
 * 
 * A glass-styled date range picker component with physics-based animations,
 * presets for common ranges, and comparison mode support.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';
import { GlassLocalizationProvider } from '../DatePicker/GlassLocalizationProvider';
import { createDateFnsAdapter } from '../DatePicker/adapters/dateFnsAdapter';

// Physics-related imports
import { useGalileoStateSpring, GalileoStateSpringOptions } from '../../hooks/useGalileoStateSpring';
import { SpringPresets, SpringConfig } from '../../animations/physics/springPhysics';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useSceneTransition } from '../../animations/physics/useSceneTransition';

// Core styling imports
import { glassSurface } from '../../core/mixins/glassSurface';
import { glowEffects } from '../../core/mixins/effects/glowEffects';
import { createThemeContext } from '../../core/themeContext';

// Import from GlassDatePicker for localization
import { useDateAdapter } from '../DatePicker';

// Hooks and utilities
import ClearIcon from '../icons/ClearIcon';

// Types and presets
import { 
  DateRange, 
  ComparisonDateRange, 
  DateRangePreset,
  DateRangePickerProps,
  CalendarView
} from './types';
import { StandardDateRangePresets, applyPreset } from './DateRangePresets';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const floatIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// A reusable grid component for the calendar
const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-top: 10px;
`;

// Styled components
const DateRangePickerRoot = styled.div<{
  $fullWidth: boolean;
  $size: 'small' | 'medium' | 'large';
  $animate: boolean;
  $reducedMotion: boolean;
}>`
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  font-family: inherit;
  
  /* Size variations */
  ${props => {
    switch (props.$size) {
      case 'small':
        return css`font-size: 0.875rem;`;
      case 'large':
        return css`font-size: 1.05rem;`;
      default:
        return css`font-size: 0.95rem;`;
    }
  }}
  
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
  $glassVariant: 'clear' | 'frosted' | 'tinted';
  $blurStrength: 'light' | 'standard' | 'strong';
  $color: string;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  min-width: 200px;
  
  /* Size variations */
  ${props => {
    switch (props.$size) {
      case 'small':
        return css`
          height: 36px;
          padding: 4px 10px;
        `;
      case 'large':
        return css`
          height: 48px;
          padding: 8px 16px;
        `;
      default:
        return css`
          height: 40px;
          padding: 6px 12px;
        `;
    }
  }}
  
  /* Enhanced glass styling */
  ${props => glassSurface({
    elevation: 1,
    blurStrength: props.$blurStrength,
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme),
  })}
  
  border-radius: 8px;
  border: 1px solid ${props => 
    props.$hasError 
      ? 'rgba(240, 82, 82, 0.8)' 
      : props.$focused 
        ? `var(--color-${props.$color}, rgba(99, 102, 241, 0.8))` 
        : 'rgba(255, 255, 255, 0.12)'
  };
  background-color: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  
  /* Focused state */
  ${props => props.$focused && css`
    border-color: var(--color-${props.$color}, rgba(99, 102, 241, 0.8));
    box-shadow: 0 0 0 1px var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.3));
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

const InputValue = styled.div`
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  
  .range-separator {
    margin: 0 6px;
    opacity: 0.7;
  }
  
  .date-label {
    &.range-start {
      margin-right: 4px;
    }
    &.range-end {
      margin-left: 4px;
    }
  }
  
  .empty-label {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-left: 8px;
  padding: 0;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const PickerContainer = styled.div<{
  $animate: boolean;
  $reducedMotion: boolean;
  $glassVariant: 'clear' | 'frosted' | 'tinted';
  $blurStrength: 'light' | 'standard' | 'strong';
  $width?: number;
  $isComparisonMode: boolean;
  $color: string;
}>`
  position: absolute;
  z-index: 1000;
  top: calc(100% + 8px);
  left: 0;
  min-width: ${props => props.$width ? `${props.$width}px` : '280px'};
  width: ${props => props.$isComparisonMode ? 'max-content' : props.$width ? `${props.$width}px` : '280px'};
  user-select: none;
  transform-origin: top left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  
  /* Glass styling */
  ${props => glassSurface({
    elevation: 2,
    blurStrength: props.$blurStrength,
    borderOpacity: 'light',
    tintColor: props.$color !== 'default' ? `var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.05))` : undefined,
    themeContext: createThemeContext(props.theme),
  })}
  
  border-radius: 12px;
  
  /* Outer drop shadow for depth */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: -1;
  }
  
  /* Layout for comparison mode */
  ${props => props.$isComparisonMode && css`
    display: flex;
    gap: 10px;
    padding: 5px;
    
    .comparison-separator {
      width: 1px;
      margin: 0 5px;
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

const PickerHeader = styled.div<{
  $color: string;
  'data-animate': string;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  
  .title {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .actions {
    display: flex;
    gap: 6px;
  }
  
  button {
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-${props => props.$color}, rgba(99, 102, 241, 0.9));
    font-size: 0.8rem;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 1px var(--color-${props => props.$color}-transparent, rgba(99, 102, 241, 0.4));
    }
  }
  
  data-animate={String(props['data-animate'])};
`;

const PickerBody = styled.div`
  display: flex;
  padding: 10px;
`;

const PresetPanel = styled.div<{
  $animate: boolean;
  $reducedMotion: boolean;
}>`
  width: 180px;
  padding: 10px 8px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  margin-right: 12px;
  
  /* Animation for staggered presets */
  ${props => props.$animate && !props.$reducedMotion && css`
    .preset-item {
      opacity: 0;
      animation: ${floatIn} 0.3s ease-out forwards;
    }
    
    ${Array.from({ length: 10 }, (_, i) => css`
      .preset-item:nth-child(${i + 1}) {
        animation-delay: ${0.05 * i}s;
      }
    `)}
  `}
`;

const PresetTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  padding: 0 6px;
`;

const PresetItem = styled.div<{
  $isActive: boolean;
  $color: string;
}>`
  display: flex;
  align-items: center;
  padding: 6px 10px;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.85rem;
  
  .preset-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .preset-icon {
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      width: 14px;
      height: 14px;
      opacity: 0.8;
    }
  }
  
  /* States */
  color: ${props => props.$isActive 
    ? `var(--color-${props.$color}, rgba(99, 102, 241, 0.9))` 
    : 'rgba(255, 255, 255, 0.7)'};
  background-color: ${props => props.$isActive 
    ? `var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.15))` 
    : 'transparent'};
  
  &:hover {
    background-color: ${props => props.$isActive 
      ? `var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.2))` 
      : 'rgba(255, 255, 255, 0.08)'};
  }
  
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--color-${props => props.$color}-transparent, rgba(99, 102, 241, 0.4));
  }
`;

const CalendarPanel = styled.div<{
  $isComparison?: boolean;
  $isPrimary?: boolean;
}>`
  flex: 1;
  min-width: 260px;
  padding: 10px;
  
  ${props => props.$isComparison && css`
    border-radius: 8px;
    background-color: ${props.$isPrimary 
      ? 'rgba(255, 255, 255, 0.03)' 
      : 'rgba(0, 0, 0, 0.15)'};
  `}
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 8px;
  
  .header-label {
    font-weight: 500;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .header-actions {
    display: flex;
  }
  
  .header-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
    }
    
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4);
    }
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 4px;
`;

const WeekdayLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
`;

const MonthContainer = styled.div<{
  $animate: boolean;
  $reducedMotion: boolean;
}>`
  ${props => props.$animate && !props.$reducedMotion && css`
    animation: ${fadeIn} 0.3s ease-out;
  `}
`;

const DayCell = styled.div<{
  $isToday: boolean;
  $isOutsideMonth: boolean;
  $isSelected: boolean;
  $isStart: boolean;
  $isEnd: boolean;
  $isInRange: boolean;
  $isDisabled: boolean;
  $isWeekend: boolean;
  $color: string;
  $translateY: number;
  $scale: number;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  position: relative;
  user-select: none;
  transform: translateY(${props => props.$translateY}px) scale(${props => props.$scale});
  
  /* Day number styling */
  .day-number {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;
  }
  
  /* Basic styling */
  color: ${props => {
    if (props.$isDisabled) return 'rgba(255, 255, 255, 0.3)';
    if (props.$isOutsideMonth) return 'rgba(255, 255, 255, 0.4)';
    if (props.$isWeekend) return 'rgba(255, 255, 255, 0.75)';
    return 'rgba(255, 255, 255, 0.9)';
  }};
  
  /* Today indicator */
  ${props => props.$isToday && !props.$isSelected && css`
    .day-number {
      border: 1px dashed rgba(255, 255, 255, 0.5);
    }
  `}
  
  /* Range styling */
  ${props => props.$isInRange && !props.$isDisabled && css`
    background-color: var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.1));
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.1));
      z-index: 0;
    }
  `}
  
  /* Start date styling */
  ${props => props.$isStart && !props.$isDisabled && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      right: 0;
      background-color: var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.1));
      z-index: 0;
    }
    
    .day-number {
      background-color: var(--color-${props.$color}, rgba(99, 102, 241, 0.8));
      color: rgba(255, 255, 255, 1);
    }
  `}
  
  /* End date styling */
  ${props => props.$isEnd && !props.$isDisabled && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 50%;
      background-color: var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.1));
      z-index: 0;
    }
    
    .day-number {
      background-color: var(--color-${props.$color}, rgba(99, 102, 241, 0.8));
      color: rgba(255, 255, 255, 1);
    }
  `}
  
  /* Start and end date styling */
  ${props => props.$isStart && props.$isEnd && !props.$isDisabled && css`
    &::before {
      display: none;
    }
    
    .day-number {
      background-color: var(--color-${props.$color}, rgba(99, 102, 241, 0.8));
      color: rgba(255, 255, 255, 1);
    }
  `}
  
  /* Selected styling */
  ${props => props.$isSelected && !props.$isStart && !props.$isEnd && !props.$isDisabled && css`
    .day-number {
      background-color: var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.3));
      color: rgba(255, 255, 255, 1);
    }
  `}
  
  /* Hover effect */
  &:hover {
    ${props => !props.$isDisabled && css`
      .day-number {
        background-color: ${props.$isSelected || props.$isStart || props.$isEnd
          ? `var(--color-${props.$color}, rgba(99, 102, 241, 0.9))`
          : 'rgba(255, 255, 255, 0.1)'};
      }
    `}
  }
`;

const TimeSelectContainer = styled.div`
  display: flex;
  padding: 6px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
`;

const TimeSelect = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  .time-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .time-input {
    width: 70px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 4px 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.85rem;
    text-align: center;
    
    &:focus {
      outline: none;
      border-color: rgba(99, 102, 241, 0.5);
    }
  }
`;

const ComparisonSwitchContainer = styled.div<{
  $color: string;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  
  .label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .switch {
    position: relative;
    width: 36px;
    height: 20px;
    
    input {
      opacity: 0;
      width: 0;
      height: 0;
      
      &:checked + .switch-slider {
        background-color: var(--color-${props => props.$color}, rgba(99, 102, 241, 0.8));
        
        &:before {
          transform: translateX(16px);
        }
      }
      
      &:focus + .switch-slider {
        box-shadow: 0 0 0 2px var(--color-${props => props.$color}-transparent, rgba(99, 102, 241, 0.3));
      }
    }
    
    .switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.2);
      transition: 0.3s;
      border-radius: 20px;
      
      &:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }
    }
  }
`;

const ControlsFooter = styled.div<{
  $color: string;
}>`
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  gap: 10px;
  
  .cancel-button {
    padding: 6px 12px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    
    &:hover {
      background: rgba(0, 0, 0, 0.3);
      color: rgba(255, 255, 255, 0.9);
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
    }
  }
  
  .apply-button {
    padding: 6px 12px;
    border-radius: 4px;
    background: var(--color-${props => props.$color}, rgba(99, 102, 241, 0.8));
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    
    &:hover {
      background: var(--color-${props => props.$color}-hover, rgba(99, 102, 241, 0.9));
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--color-${props => props.$color}-transparent, rgba(99, 102, 241, 0.3));
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
`;

const ErrorMessage = styled.div`
  color: rgba(240, 82, 82, 0.9);
  font-size: 0.8rem;
  margin-top: 4px;
  padding-left: 2px;
`;

const HelperText = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-top: 4px;
  padding-left: 2px;
`;

// Re-add necessary type/enum imports
import {
  SceneConfig,
  SceneTransition,
  TransitionEffect,
  SceneType,
} from '../../animations/physics/SceneTransitionManager';

// Styled PopoverContainer
const PopoverContainer = styled.div<{
  $animate: boolean;
  $reducedMotion: boolean;
  $blurStrength: 'strong' | 'light' | 'standard';
  $color: string;
  $width?: number;
  $isComparisonMode: boolean;
  $glassVariant: 'clear' | 'frosted' | 'tinted';
}>`
  position: absolute;
  z-index: 1300;
  top: calc(100% + 8px);
  left: 0;
  min-width: ${props => props.$width ? `${props.$width}px` : '280px'};
  width: ${props => props.$isComparisonMode ? 'max-content' : props.$width ? `${props.$width}px` : '280px'};
  user-select: none;
  transform-origin: top left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  ${props => glassSurface({
    elevation: 2,
    blurStrength: props.$blurStrength,
    borderOpacity: 'light',
    tintColor: props.$color !== 'default' ? `var(--color-${props.$color}-transparent, rgba(99, 102, 241, 0.05))` : undefined,
    themeContext: createThemeContext(props.theme),
  })}
`;

// Ref interface
export interface GlassDateRangePickerRef {
  /** Opens the date range picker popover */
  openPicker: () => void;
  /** Closes the date range picker popover */
  closePicker: () => void;
  /** Gets the currently selected primary date range */
  getSelectedRange: () => DateRange | null;
  /** Gets the currently selected comparison date range (if applicable) */
  getComparisonRange: () => ComparisonDateRange | null;
  /** Programmatically sets the primary date range */
  setRange: (range: DateRange | null) => void;
  /** Programmatically sets the comparison date range (if applicable) */
  setComparisonRange: (range: ComparisonDateRange | null) => void;
  /** Clears the selected date ranges */
  clearRange: () => void;
  /** Gets the main input container element */
  getInputContainerElement: () => HTMLDivElement | null;
  /** Gets the picker popover element (if open) */
  getPickerElement: () => HTMLDivElement | null;
}

/**
 * GlassDateRangePicker Component
 */
export const GlassDateRangePicker = forwardRef<GlassDateRangePickerRef, DateRangePickerProps>(({
  // Basic props
  value,
  onChange,
  onClear,
  comparisonMode = false,
  comparisonValue,
  onComparisonChange,
  minDate,
  maxDate,
  enableTimeSelection = false,
  dateFormat = 'MM/dd/yyyy',
  timeFormat = 'HH:mm',
  presets = StandardDateRangePresets,
  locale = 'en-US',
  firstDayOfWeek = 0,
  disabled = false,
  className,
  style,
  
  // Display props
  label,
  helperText,
  error = false,
  errorMessage,
  placeholder = 'Select date range',
  required = false,
  clearable = true,
  autoClose = false,
  showWeekNumbers = false,
  initialView = 'day',
  monthView = false,
  fullWidth = false,
  size = 'medium',
  
  // Styling props
  glassVariant = 'frosted',
  blurStrength = 'standard',
  color = 'primary',
  
  // Behavior props
  inline = false,
  id,
  ariaLabel,
  animate = true,
  popoverAnimationConfig,
  
  // Custom renderers
  renderInput,
  renderDay,
  
  // Physics animation settings
  physics = {
    tension: 170,
    friction: 26,
    animationPreset: 'default'
  },
  
  // Mobile settings
  mobile = {
    fullScreen: false,
    mobileView: 'auto',
    enableGestures: true
  }
}, ref) => {
  // State
  const [isOpen, setIsOpen] = useState(inline);
  const [isComparing, setIsComparing] = useState(comparisonMode);
  const [focusedInput, setFocusedInput] = useState<'startDate' | 'endDate' | null>(null);
  
  const [localValue, setLocalValue] = useState<DateRange>(value || { startDate: null, endDate: null });
  const [localComparisonValue, setLocalComparisonValue] = useState<DateRange>(
    comparisonValue || { startDate: null, endDate: null }
  );
  
  const [viewDate, setViewDate] = useState(new Date());
  const [comparisonViewDate, setComparisonViewDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>(initialView);
  
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  // Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // Get adapter from context provider (no locale argument needed here)
  const dateAdapter = useDateAdapter();
  const prefersReducedMotion = useReducedMotion();
  
  // Animation Context and Popover Transition Calculation
  const { defaultSpring } = useAnimationContext();

  const popoverSpringConfig = useMemo<SpringConfig>(() => {
    if (prefersReducedMotion) {
      // For reduced motion, we could use a very stiff spring or just disable animation
      return { ...SpringPresets.STIFF, duration: 0.1 }; // Example: quick transition
    }

    const baseConfig: SpringConfig = SpringPresets.DEFAULT;
    let contextConfig: Partial<SpringConfig> = {};

    if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
      contextConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
    } else if (typeof defaultSpring === 'object') {
      contextConfig = defaultSpring ?? {};
    }

    let propConfigResolved: Partial<SpringConfig> = {};
    if (typeof popoverAnimationConfig === 'string' && popoverAnimationConfig in SpringPresets) {
      propConfigResolved = SpringPresets[popoverAnimationConfig as keyof typeof SpringPresets];
    } else if (typeof popoverAnimationConfig === 'object') {
      propConfigResolved = popoverAnimationConfig ?? {};
    }

    return { ...baseConfig, ...contextConfig, ...propConfigResolved };
    // Removed Framer Motion specific transition properties (type, damping, restDelta)
  }, [defaultSpring, popoverAnimationConfig, prefersReducedMotion]);

  // Re-add duration calculation
  const finalTransitionDuration = useMemo(() => {
    return prefersReducedMotion ? 100 : 300; // Example duration
  }, [prefersReducedMotion]);

  // --- Define Scenes and Transitions ---
  const pickerScenes: SceneConfig[] = useMemo(() => [
    { id: 'hidden', name: 'Picker Hidden', type: SceneType.MODAL, container: 'picker-hidden' },
    { id: 'visible', name: 'Picker Visible', type: SceneType.MODAL, container: 'picker-visible' },
  ], []);

  const pickerTransitions: SceneTransition[] = useMemo(() => [
    {
      from: 'hidden',
      to: 'visible',
      effect: TransitionEffect.FADE,
      duration: finalTransitionDuration,
    },
    {
      from: 'visible',
      to: 'hidden',
      effect: TransitionEffect.FADE,
      duration: finalTransitionDuration,
    },
  ], [finalTransitionDuration]);

  // --- Use useSceneTransition Hook ---
  const {
    activeScene,
    actions: sceneActions,
  } = useSceneTransition({
    initialScene: isOpen ? 'visible' : 'hidden',
    scenes: pickerScenes,
    transitions: pickerTransitions,
  });

  // Physics spring configuration
  const springConfig = useMemo(() => {
    if (physics.animationPreset === 'gentle') return SpringPresets.GENTLE;
    if (physics.animationPreset === 'snappy') return SpringPresets.SNAPPY;
    if (physics.animationPreset === 'bouncy') return SpringPresets.BOUNCY;
    
    // Default or custom configuration
    return {
      tension: physics.tension || 170,
      friction: physics.friction || 26,
      mass: 1
    };
  }, [physics]);
  
  // Springs for animations
  const { value: dayCellScale, start: animateDayCellScale } = useGalileoStateSpring(1, {
    ...springConfig,
    friction: springConfig.friction * 0.8 // Less friction for more bounce
  });
  
  const { value: dayCellTranslateY, start: animateDayCellTranslateY } = useGalileoStateSpring(5, springConfig);
  
  // Handle value change from props
  useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);
  
  // Handle comparison value change from props
  useEffect(() => {
    if (comparisonValue) {
      setLocalComparisonValue(comparisonValue);
    }
  }, [comparisonValue]);
  
  // Handle comparison mode change from props
  useEffect(() => {
    setIsComparing(comparisonMode);
  }, [comparisonMode]);
  
  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen && 
        !inline && 
        pickerRef.current && 
        !pickerRef.current.contains(e.target as Node) && 
        inputRef.current && 
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, inline]);
  
  // Measure input width for picker positioning
  const inputWidth = useMemo(() => {
    return inputRef.current?.offsetWidth || 280;
  }, [isOpen]);
  
  // Format date for display
  const formatDate = useCallback((date: Date | null): string => {
    if (!date) return '';
    return dateAdapter.adapter.format(date, dateFormat);
  }, [dateAdapter, dateFormat]);
  
  // Check if a date is within the selected range
  const isInRange = useCallback((date: Date): boolean => {
    if (!localValue.startDate || !localValue.endDate) {
      return false;
    }
    
    return date >= localValue.startDate && date <= localValue.endDate;
  }, [localValue]);
  
  // Check if a date is the start of the range
  const isStartDate = useCallback((date: Date): boolean => {
    if (!localValue.startDate) return false;
    return dateAdapter.adapter.isSameDay(date, localValue.startDate);
  }, [localValue.startDate, dateAdapter]);
  
  // Check if a date is the end of the range
  const isEndDate = useCallback((date: Date): boolean => {
    if (!localValue.endDate) return false;
    return dateAdapter.adapter.isSameDay(date, localValue.endDate);
  }, [localValue.endDate, dateAdapter]);
  
  // Check if a date is disabled
  const isDisabled = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }, [minDate, maxDate]);
  
  // Handle input container click
  const handleInputClick = useCallback(() => {
    if (disabled) return;
    
    if (!isOpen) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);
  
  // Handle day cell click
  const handleDayClick = useCallback((date: Date) => {
    if (isDisabled(date)) return;
    
    // If no start date or clicking a date before start date, set start date
    if (!localValue.startDate || (localValue.startDate && localValue.endDate) || (date < localValue.startDate)) {
      setLocalValue({ startDate: date, endDate: null });
      setFocusedInput('endDate');
      return;
    }
    
    // If start date is set and clicking same date, unset start date
    if (dateAdapter.adapter.isSameDay(date, localValue.startDate)) {
      setLocalValue({ startDate: null, endDate: null });
      setFocusedInput('startDate');
      return;
    }
    
    // If start date is set and clicking later date, set end date
    if (localValue.startDate && date > localValue.startDate) {
      const newRange = { ...localValue, endDate: date };
      setLocalValue(newRange);
      setFocusedInput(null);
      
      // Apply the range
      if (autoClose && !enableTimeSelection) {
        setIsOpen(false);
        onChange?.(newRange);
      }
    }
  }, [
    localValue, 
    isDisabled, 
    dateAdapter, 
    autoClose, 
    enableTimeSelection, 
    onChange
  ]);
  
  // Handle comparison day click
  const handleComparisonDayClick = useCallback((date: Date) => {
    if (isDisabled(date)) return;
    
    // Similar logic as handleDayClick, but for comparison range
    if (!localComparisonValue.startDate || (localComparisonValue.startDate && localComparisonValue.endDate) || (date < localComparisonValue.startDate)) {
      setLocalComparisonValue({ startDate: date, endDate: null });
      return;
    }
    
    if (dateAdapter.adapter.isSameDay(date, localComparisonValue.startDate)) {
      setLocalComparisonValue({ startDate: null, endDate: null });
      return;
    }
    
    if (localComparisonValue.startDate && date > localComparisonValue.startDate) {
      setLocalComparisonValue({ ...localComparisonValue, endDate: date });
    }
  }, [localComparisonValue, isDisabled, dateAdapter]);
  
  // Handle date hover (for range selection)
  const handleDayHover = useCallback((date: Date) => {
    if (focusedInput === 'endDate' && localValue.startDate) {
      setHoverDate(date);
    }
  }, [focusedInput, localValue.startDate]);
  
  // Handle month navigation
  const handleMonthChange = useCallback((direction: 'prev' | 'next', isComparison = false) => {
    const setter = isComparison ? setComparisonViewDate : setViewDate;
    const current = isComparison ? comparisonViewDate : viewDate;
    
    const newDate = new Date(current);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    setter(newDate);
  }, [viewDate, comparisonViewDate]);
  
  // Apply a preset
  const handlePresetClick = useCallback((preset: DateRangePreset) => {
    setActivePresetId(preset.id);
    
    // Apply the preset
    const result = applyPreset(preset);
    
    if ('primary' in result && 'comparison' in result) {
      // It's a comparison range
      setLocalValue(result.primary);
      setLocalComparisonValue(result.comparison);
      setIsComparing(true);
      
      // Update view dates to match the new ranges
      if (result.primary.startDate) {
        setViewDate(new Date(result.primary.startDate));
      }
      if (result.comparison.startDate) {
        setComparisonViewDate(new Date(result.comparison.startDate));
      }
      
      // Notify parent
      onChange?.(result.primary);
      onComparisonChange?.(result.comparison);
      
      if (autoClose) {
        setIsOpen(false);
      }
    } else {
      // It's a regular date range
      setLocalValue(result);
      
      // Update view date to match the new range
      if (result.startDate) {
        setViewDate(new Date(result.startDate));
      }
      
      // Notify parent
      onChange?.(result);
      
      if (autoClose && !enableTimeSelection) {
        setIsOpen(false);
      }
    }
  }, [onChange, onComparisonChange, autoClose, enableTimeSelection]);
  
  // Handle clearing the date range
  const handleClear = useCallback(() => {
    setLocalValue({ startDate: null, endDate: null });
    setLocalComparisonValue({ startDate: null, endDate: null });
    setActivePresetId(null);
    onClear?.();
  }, [onClear]);
  
  // Toggle comparison mode
  const handleToggleComparison = useCallback(() => {
    setIsComparing(prev => !prev);
  }, []);
  
  // Apply the current selection
  const handleApply = useCallback(() => {
    onChange?.(localValue);
    if (isComparing) {
      onComparisonChange?.(localComparisonValue);
    }
    setIsOpen(false);
  }, [localValue, localComparisonValue, isComparing, onChange, onComparisonChange]);
  
  // Cancel and close without applying
  const handleCancel = useCallback(() => {
    // Reset to the original value
    setLocalValue(value || { startDate: null, endDate: null });
    setLocalComparisonValue(comparisonValue || { startDate: null, endDate: null });
    setIsOpen(false);
  }, [value, comparisonValue]);
  
  // Generate month calendar data
  const generateMonthDays = useCallback((year: number, month: number): Date[] => {
    return dateAdapter.adapter.getMonthData(year, month, firstDayOfWeek);
  }, [dateAdapter, firstDayOfWeek]);
  
  // Get current month calendar data
  const currentMonthDays = useMemo(() => {
    return generateMonthDays(viewDate.getFullYear(), viewDate.getMonth());
  }, [viewDate, generateMonthDays]);
  
  // Get comparison month calendar data
  const comparisonMonthDays = useMemo(() => {
    return generateMonthDays(comparisonViewDate.getFullYear(), comparisonViewDate.getMonth());
  }, [comparisonViewDate, generateMonthDays]);
  
  // Get weekday names
  const weekdays = useMemo(() => {
    const days = dateAdapter.adapter.getWeekdays('narrow');
    
    // Reorder days based on firstDayOfWeek
    return [...days.slice(firstDayOfWeek), ...days.slice(0, firstDayOfWeek)];
  }, [dateAdapter, firstDayOfWeek]);
  
  // Render weekday headers
  const renderWeekdays = () => (
    <WeekRow>
      {weekdays.map((day, index) => (
        <WeekdayLabel key={index}>{day}</WeekdayLabel>
      ))}
    </WeekRow>
  );
  
  // Render a month calendar
  const renderMonth = (days: Date[], isComparison = false) => {
    const handleClick = isComparison ? handleComparisonDayClick : handleDayClick;
    const currentValue = isComparison ? localComparisonValue : localValue;
    
    return (
      <MonthContainer $animate={animate} $reducedMotion={prefersReducedMotion}>
        <CalendarGrid>
          {days.map((date, index) => {
            const isDateSelected = !!currentValue.startDate && (
              dateAdapter.adapter.isSameDay(date, currentValue.startDate) || 
              (!!currentValue.endDate && dateAdapter.adapter.isSameDay(date, currentValue.endDate))
            );
            
            const isDateInRange = !!(
              currentValue.startDate &&
              currentValue.endDate &&
              date > currentValue.startDate &&
              date < currentValue.endDate
            );
            
            const isDateStart = currentValue.startDate && dateAdapter.adapter.isSameDay(date, currentValue.startDate);
            const isDateEnd = currentValue.endDate && dateAdapter.adapter.isSameDay(date, currentValue.endDate);
            
            const isOutsideMonth = date.getMonth() !== (isComparison ? comparisonViewDate : viewDate).getMonth();
            const isDateDisabled = isDisabled(date);
            const isDateToday = dateAdapter.adapter.isToday(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            // Handle hover for showing potential range when selecting end date
            const isHoverInRange = !isComparison && hoverDate && localValue.startDate && !localValue.endDate && 
              date > localValue.startDate && date <= hoverDate;
              
            const isInSelectionRange = isDateStart || isDateEnd || isDateInRange || isHoverInRange;
            
            // If using a custom day renderer
            if (renderDay) {
              return renderDay(date, isDateSelected, isInSelectionRange, {
                isDisabled: isDateDisabled,
                isToday: isDateToday,
                isOutsideMonth,
                isWeekend,
                onClick: () => handleClick(date),
                onMouseEnter: () => handleDayHover(date)
              });
            }
            
            return (
              <DayCell
                key={index}
                $isSelected={isDateSelected}
                $isStart={isDateStart}
                $isEnd={isDateEnd}
                $isInRange={isInSelectionRange}
                $isToday={isDateToday}
                $isOutsideMonth={isOutsideMonth}
                $isDisabled={isDateDisabled}
                $isWeekend={isWeekend}
                $color={color}
                $translateY={isDateSelected ? dayCellTranslateY : 0}
                $scale={isDateSelected ? dayCellScale : 1}
                onClick={() => handleClick(date)}
                onMouseEnter={() => handleDayHover(date)}
              >
                <div className="day-number">{date.getDate()}</div>
              </DayCell>
            );
          })}
        </CalendarGrid>
      </MonthContainer>
    );
  };
  
  // Render the picker component
  const renderPickerContent = () => (
    <PopoverContainer
      ref={pickerRef}
      $animate={!prefersReducedMotion}
      $reducedMotion={prefersReducedMotion}
      $blurStrength={blurStrength}
      $color={color}
      $width={inputWidth}
      $isComparisonMode={isComparing}
      $glassVariant={glassVariant}
      role="dialog"
      aria-modal="true"
      aria-label="Date range selection calendar"
    >
      <PickerHeader $color={color} data-animate={String(animate)}>
        <div className="title">{comparisonMode ? 'Select Range & Comparison' : 'Select Date Range'}</div>
        <div className="actions">
          {clearable && (localValue.startDate || localValue.endDate) && (
            <button onClick={handleClear}>Clear</button>
          )}
        </div>
      </PickerHeader>
      
      <PickerBody>
        {/* Presets panel */}
        {presets && presets.length > 0 && (
          <PresetPanel $animate={animate} $reducedMotion={prefersReducedMotion}>
            <PresetTitle>Presets</PresetTitle>
            {presets.map((preset, index) => (
              <PresetItem
                key={preset.id}
                className="preset-item"
                $isActive={activePresetId === preset.id}
                $color={color}
                onClick={() => handlePresetClick(preset)}
                role="button"
                tabIndex={0}
              >
                {preset.icon && <span className="preset-icon">{preset.icon}</span>}
                <span className="preset-label">{preset.label}</span>
              </PresetItem>
            ))}
          </PresetPanel>
        )}
        
        {/* Primary calendar */}
        <CalendarPanel $isComparison={isComparing} $isPrimary>
          <CalendarHeader>
            <div className="header-label">
              {dateAdapter.adapter.format(viewDate, 'MMMM yyyy')}
            </div>
            <div className="header-actions">
              <button 
                className="header-button"
                onClick={() => handleMonthChange('prev')}
                aria-label="Previous month"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button 
                className="header-button"
                onClick={() => handleMonthChange('next')}
                aria-label="Next month"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </CalendarHeader>
          
          {renderWeekdays()}
          {renderMonth(currentMonthDays)}
          
          {/* Time selection */}
          {enableTimeSelection && localValue.startDate && localValue.endDate && (
            <TimeSelectContainer>
              <TimeSelect>
                <span className="time-label">Start:</span>
                <input 
                  type="time" 
                  className="time-input" 
                  value={dateAdapter.adapter.format(localValue.startDate, 'HH:mm')}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = new Date(localValue.startDate as Date);
                    newDate.setHours(hours, minutes);
                    setLocalValue({ ...localValue, startDate: newDate });
                  }}
                />
              </TimeSelect>
              
              <TimeSelect>
                <span className="time-label">End:</span>
                <input 
                  type="time" 
                  className="time-input" 
                  value={dateAdapter.adapter.format(localValue.endDate, 'HH:mm')}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = new Date(localValue.endDate as Date);
                    newDate.setHours(hours, minutes);
                    setLocalValue({ ...localValue, endDate: newDate });
                  }}
                />
              </TimeSelect>
            </TimeSelectContainer>
          )}
        </CalendarPanel>
        
        {/* Comparison calendar */}
        {isComparing && (
          <>
            <div className="comparison-separator" />
            
            <CalendarPanel $isComparison>
              <CalendarHeader>
                <div className="header-label">
                  {dateAdapter.adapter.format(comparisonViewDate, 'MMMM yyyy')}
                </div>
                <div className="header-actions">
                  <button 
                    className="header-button"
                    onClick={() => handleMonthChange('prev', true)}
                    aria-label="Previous month"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button 
                    className="header-button"
                    onClick={() => handleMonthChange('next', true)}
                    aria-label="Next month"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </CalendarHeader>
              
              {renderWeekdays()}
              {renderMonth(comparisonMonthDays, true)}
            </CalendarPanel>
          </>
        )}
      </PickerBody>
      
      {/* Comparison mode toggle */}
      <ComparisonSwitchContainer $color={color}>
        <div className="label">Enable comparison</div>
        <div className="switch">
          <input 
            type="checkbox" 
            checked={isComparing} 
            onChange={handleToggleComparison}
            id="comparison-toggle"
          />
          <span className="switch-slider"></span>
        </div>
      </ComparisonSwitchContainer>
      
      {/* Control buttons */}
      <ControlsFooter $color={color}>
        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <button 
          className="apply-button" 
          onClick={handleApply}
          disabled={!localValue.startDate || !localValue.endDate}
        >
          Apply
        </button>
      </ControlsFooter>
    </PopoverContainer>
  );
  
  // Determine portal container
  const portalContainer = !inline && typeof document !== 'undefined' ? document.body : null;
  
  // Log state before return
  console.log('isOpen:', isOpen, 'activeScene:', activeScene);

  return (
    <DateRangePickerRoot
      ref={rootRef}
      $fullWidth={fullWidth}
      $size={size}
      $animate={animate}
      $reducedMotion={prefersReducedMotion}
      className={className}
      style={style}
    >
      {label && <Label htmlFor={id || 'glass-date-range'}>{label}</Label>}
      
      {/* Custom input renderer */}
      {renderInput ? (
        renderInput({
          startDate: localValue.startDate,
          endDate: localValue.endDate,
          onClick: handleInputClick,
          placeholder,
          inputRef: inputRef as React.RefObject<HTMLInputElement>
        })
      ) : (
        <InputContainer
          ref={inputRef as React.RefObject<HTMLDivElement>}
          $size={size}
          $focused={isOpen}
          $disabled={disabled}
          $hasError={error}
          $glassVariant={glassVariant}
          $blurStrength={blurStrength}
          $color={color}
          onClick={handleInputClick}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={ariaLabel || label || 'Date range picker'}
          id={id || 'glass-date-range'}
          role="button"
          tabIndex={disabled ? -1 : 0}
        >
          <InputValue>
            {localValue.startDate || localValue.endDate ? (
              <>
                <span className="date-label range-start">
                  {formatDate(localValue.startDate)}
                </span>
                <span className="range-separator">–</span>
                <span className="date-label range-end">
                  {formatDate(localValue.endDate)}
                </span>
              </>
            ) : (
              <span className="empty-label">{placeholder}</span>
            )}
          </InputValue>
          
          {/* Clear button */}
          {clearable && !disabled && (localValue.startDate || localValue.endDate) && (
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              aria-label="Clear date range"
            >
              <ClearIcon />
            </ActionButton>
          )}
        </InputContainer>
      )}
      
      {/* Error or helper text */}
      {error && errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
      
      {/* Temporary: Render picker content directly if isOpen, bypassing portal/scene for testing */}
      {isOpen && renderPickerContent()}
      
      {/* Original Portal Logic - Commented out for testing 
      {portalContainer ? (
        createPortal(
          activeScene === 'visible' && renderPickerContent(),
          portalContainer
        )
      ) : (
        activeScene === 'visible' && renderPickerContent()
      )}
      */}
    </DateRangePickerRoot>
  );
});

// Add displayName
GlassDateRangePicker.displayName = 'GlassDateRangePicker';

export default GlassDateRangePicker;