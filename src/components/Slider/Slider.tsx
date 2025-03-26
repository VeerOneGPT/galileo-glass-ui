import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';

// Slider component props interface
export interface SliderProps {
  /**
   * The value of the slider
   */
  value?: number;
  
  /**
   * Default value if uncontrolled
   */
  defaultValue?: number;
  
  /**
   * Callback when value changes
   */
  onChange?: (value: number) => void;
  
  /**
   * Minimum value
   */
  min?: number;
  
  /**
   * Maximum value
   */
  max?: number;
  
  /**
   * Step value for increments
   */
  step?: number;
  
  /**
   * Label for the slider
   */
  label?: string;
  
  /**
   * If true, the slider will be disabled
   */
  disabled?: boolean;
  
  /**
   * The color of the slider
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  
  /**
   * If true, marks will be shown at each step
   */
  marks?: boolean;
  
  /**
   * If true, display the current value
   */
  valueLabelDisplay?: 'auto' | 'on' | 'off';
  
  /**
   * Helper text to display
   */
  helperText?: string;
  
  /**
   * The size of the slider
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Additional CSS class name
   */
  className?: string;
}

// Calculate color based on chosen theme color
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#6366F1';
  }
};

// Styled components
const SliderContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const SliderLabel = styled.label`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
`;

const SliderTrack = styled.div<{
  $disabled: boolean;
}>`
  position: relative;
  height: 4px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  opacity: ${props => props.$disabled ? 0.4 : 1};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
`;

const SliderFill = styled.div<{
  $fillWidth: number;
  $color: string;
  $size: string;
}>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.$fillWidth}%;
  background-color: ${props => getColorByName(props.$color)};
  border-radius: 4px;
  
  /* Size specific styling */
  ${props => {
    switch (props.$size) {
      case 'small':
        return 'height: 2px;';
      case 'large':
        return 'height: 6px;';
      default: // medium
        return 'height: 4px;';
    }
  }}
  
  /* Subtle glow effect */
  box-shadow: 0 0 6px rgba(${props => {
    const color = getColorByName(props.$color);
    // Simple RGB extraction for shadow
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    }
    return '99, 102, 241'; // Default to primary color
  }}, 0.4);
`;

const SliderThumb = styled.div<{
  $position: number;
  $color: string;
  $active: boolean;
  $size: string;
  $disabled: boolean;
}>`
  position: absolute;
  top: 50%;
  left: ${props => props.$position}%;
  transform: translate(-50%, -50%);
  
  /* Size specific styling */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          width: 12px;
          height: 12px;
        `;
      case 'large':
        return `
          width: 20px;
          height: 20px;
        `;
      default: // medium
        return `
          width: 16px;
          height: 16px;
        `;
    }
  }}
  
  background-color: ${props => getColorByName(props.$color)};
  border-radius: 50%;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'grab'};
  transition: transform 0.1s ease, box-shadow 0.2s ease;
  
  /* Active and hover states */
  ${props => !props.$disabled && `
    &:hover {
      transform: translate(-50%, -50%) scale(1.1);
      box-shadow: 0 0 0 8px rgba(${
        (() => {
          const color = getColorByName(props.$color);
          if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
          }
          return '99, 102, 241';
        })()
      }, 0.16);
    }
    
    ${props.$active && `
      cursor: grabbing;
      transform: translate(-50%, -50%) scale(1.15);
      box-shadow: 0 0 0 10px rgba(${
        (() => {
          const color = getColorByName(props.$color);
          if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
          }
          return '99, 102, 241';
        })()
      }, 0.2);
    `}
  `}
  
  /* Glass effect for thumb */
  ${props => !props.$disabled && glassSurface({
    elevation: 2,
    blurStrength: 'minimal',
    backgroundOpacity: 'strong',
    borderOpacity: 'medium',
    themeContext: createThemeContext({})
  })}
  
  /* Glow effect for active state */
  ${props => !props.$disabled && props.$active && glassGlow({
    intensity: 'low',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
`;

const SliderMarks = styled.div<{
  $marks: boolean;
}>`
  position: relative;
  width: 100%;
  height: 16px;
  margin-top: 4px;
  display: ${props => props.$marks ? 'block' : 'none'};
`;

const Mark = styled.div<{
  $position: number;
  $active: boolean;
  $color: string;
}>`
  position: absolute;
  top: 0;
  left: ${props => props.$position}%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.$active 
    ? getColorByName(props.$color) 
    : 'rgba(0, 0, 0, 0.24)'
  };
`;

const ValueLabel = styled.div<{
  $position: number;
  $display: 'auto' | 'on' | 'off';
  $active: boolean;
  $color: string;
}>`
  position: absolute;
  bottom: 28px;
  left: ${props => props.$position}%;
  transform: translateX(-50%) translateY(${props => (props.$active || props.$display === 'on') ? 0 : '10px'});
  opacity: ${props => (props.$active || props.$display === 'on') ? 1 : 0};
  background-color: ${props => getColorByName(props.$color)};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  
  /* Triangle pointer */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: ${props => getColorByName(props.$color)} transparent transparent transparent;
  }
`;

const HelperText = styled.div`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
  min-height: 1em;
`;

/**
 * Slider Component
 * 
 * A slider component for selecting a value from a range.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>((props, ref) => {
  const {
    value,
    defaultValue = 0,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    disabled = false,
    color = 'primary',
    marks = false,
    valueLabelDisplay = 'off',
    helperText,
    size = 'medium',
    className,
    ...rest
  } = props;
  
  const [currentValue, setCurrentValue] = useState<number>(
    value !== undefined ? value : (defaultValue || min)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Handle controlled component updates
  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value);
    }
  }, [value]);
  
  // Calculate percentage position from value
  const calculatePercentage = (val: number): number => {
    return ((val - min) / (max - min)) * 100;
  };
  
  // Calculate value from percentage
  const calculateValue = (percentage: number): number => {
    // Calculate the raw value based on percentage
    const rawValue = min + ((max - min) * percentage) / 100;
    
    // Apply stepping
    const steppedValue = Math.round(rawValue / step) * step;
    
    // Ensure the value stays within bounds
    return Math.min(Math.max(steppedValue, min), max);
  };
  
  // Update value based on mouse/touch position
  const updateValue = (clientX: number) => {
    if (disabled || !trackRef.current) return;
    
    const { left, width } = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((clientX - left) / width) * 100));
    const newValue = calculateValue(percentage);
    
    if (newValue !== currentValue) {
      setCurrentValue(newValue);
      
      if (onChange) {
        onChange(newValue);
      }
    }
  };
  
  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e.clientX);
    
    // Capture events on window to handle drag outside the component
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [disabled, updateValue]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    updateValue(e.clientX);
  }, [updateValue]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  // Clean up event listeners
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  // Handle track click
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    updateValue(e.clientX);
  }, [disabled, updateValue]);
  
  // Handle mouse enter/leave for hover state
  const handleMouseEnter = useCallback(() => {
    if (!disabled) setIsHovering(true);
  }, [disabled]);
  
  const handleMouseLeave = useCallback(() => {
    if (!isDragging) setIsHovering(false);
  }, [isDragging]);
  
  // Generate marks if enabled
  const renderMarks = () => {
    if (!marks) return null;
    
    const markElements = [];
    const numSteps = Math.floor((max - min) / step) + 1;
    
    for (let i = 0; i < numSteps; i++) {
      const markValue = min + (i * step);
      // Skip marks that would exceed max
      if (markValue > max) continue;
      
      const position = calculatePercentage(markValue);
      const isActive = markValue <= currentValue;
      
      markElements.push(
        <Mark 
          key={i} 
          $position={position} 
          $active={isActive} 
          $color={color}
        />
      );
    }
    
    return <SliderMarks $marks={marks}>{markElements}</SliderMarks>;
  };
  
  const position = calculatePercentage(currentValue);
  const showValueLabel = valueLabelDisplay === 'on' || 
    (valueLabelDisplay === 'auto' && (isHovering || isDragging));
  
  return (
    <SliderContainer 
      ref={ref} 
      className={className}
      {...rest}
    >
      {label && <SliderLabel>{label}</SliderLabel>}
      
      <div
        style={{ position: 'relative', marginBottom: marks ? '16px' : '0' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showValueLabel && (
          <ValueLabel 
            $position={position} 
            $display={valueLabelDisplay} 
            $active={isDragging} 
            $color={color}
          >
            {currentValue}
          </ValueLabel>
        )}
        
        <SliderTrack
          ref={trackRef}
          $disabled={disabled}
          onClick={handleTrackClick}
        >
          <SliderFill 
            $fillWidth={position} 
            $color={color} 
            $size={size}
          />
          
          <SliderThumb 
            $position={position}
            $color={color}
            $active={isDragging}
            $size={size}
            $disabled={disabled}
            onMouseDown={handleMouseDown}
          />
        </SliderTrack>
      </div>
      
      {renderMarks()}
      
      {helperText && <HelperText>{helperText}</HelperText>}
    </SliderContainer>
  );
});

Slider.displayName = 'Slider';

/**
 * GlassSlider Component
 * 
 * A slider component with enhanced glass morphism styling.
 */
export const GlassSlider = forwardRef<HTMLDivElement, SliderProps>((props, ref) => {
  const {
    className,
    ...rest
  } = props;
  
  return (
    <Slider
      ref={ref}
      className={`glass-slider ${className || ''}`}
      {...rest}
    />
  );
});

GlassSlider.displayName = 'GlassSlider';