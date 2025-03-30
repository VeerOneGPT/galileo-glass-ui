import React, { forwardRef, useState, useEffect, useRef, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { AnimationProps } from '../../animations/types';
import { useGalileoStateSpring, GalileoSpringConfig } from '../../hooks/useGalileoStateSpring';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringPresets } from '../../animations/physics/springPhysics';

// Slider component props interface
export interface SliderProps extends AnimationProps {
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
  opacity: ${props => (props.$disabled ? 0.4 : 1)};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
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

// Helper to interpolate scale based on interaction progress (0 -> 1, 0.5 -> 1.1, 1 -> 1.15)
const interpolateScale = (progress: number): number => {
  if (progress <= 0.5) {
    return 1 + 0.1 * (progress / 0.5); // Interpolate 1 to 1.1 for hover
  } else {
    return 1.1 + 0.05 * ((progress - 0.5) / 0.5); // Interpolate 1.1 to 1.15 for drag
  }
};

// Helper to interpolate box-shadow spread/alpha (0 -> none, 0.5 -> 8px/0.16, 1 -> 10px/0.2)
const interpolateBoxShadow = (progress: number, colorRgb: string): string => {
  if (progress <= 0) return 'none';
  let spread: number;
  let alpha: number;
  if (progress <= 0.5) {
    // Interpolate from 0 to hover state (8px spread, 0.16 alpha)
    spread = 8 * (progress / 0.5);
    alpha = 0.16 * (progress / 0.5);
  } else {
    // Interpolate from hover state (8px spread, 0.16 alpha) to drag state (10px spread, 0.2 alpha)
    const dragProgress = (progress - 0.5) / 0.5;
    spread = 8 + (10 - 8) * dragProgress;
    alpha = 0.16 + (0.2 - 0.16) * dragProgress;
  }
  return `0 0 0 ${spread.toFixed(1)}px rgba(${colorRgb}, ${alpha.toFixed(2)})`;
};

// Helper to get RGB string from hex/name (avoids repeating logic)
const getRgbString = (color: string): string => {
  const hexColor = getColorByName(color);
  if (hexColor.startsWith('#')) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
  return '99, 102, 241'; // Default primary
};

const SliderThumb = styled.div<{
  $position: number;
  $color: string;
  $active: boolean;
  $size: string;
  $disabled: boolean;
  $theme: any;
  $interactionProgress: number;
}>`
  position: absolute;
  top: 50%;
  left: ${props => props.$position}%;
  transform: translate(-50%, -50%); // Base transform
  background-color: ${props => getColorByName(props.$color)};
  border-radius: 50%;
  cursor: ${props => (props.$disabled ? 'not-allowed' : props.$active ? 'grabbing' : 'grab')};
  // Remove transition
  // transition: transform 0.1s ease, box-shadow 0.2s ease;

  /* Apply dynamic scale and shadow based on interactionProgress */
  ${props => {
    const scale = interpolateScale(props.$interactionProgress);
    const rgbColor = getRgbString(props.$color);
    const shadow = interpolateBoxShadow(props.$interactionProgress, rgbColor);
    return `
      transform: translate(-50%, -50%) scale(${scale.toFixed(3)});
      box-shadow: ${shadow};
    `;
  }}

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

  /* Glass effect for thumb - pass theme */
  ${props =>
    !props.$disabled &&
    glassSurface({
      elevation: 2,
      blurStrength: 'minimal',
      backgroundOpacity: 'strong',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.$theme), // Pass theme
    })}
  
  /* Glow effect for active state - pass theme and potentially vary intensity */
  ${props =>
    !props.$disabled &&
    props.$interactionProgress > 0.7 && // Only glow significantly when dragging
    glassGlow({
      intensity: 'low', // Could map intensity from props.$interactionProgress
      color: props.$color,
      themeContext: createThemeContext(props.$theme), // Pass theme
    })}
`;

const SliderMarks = styled.div<{
  $marks: boolean;
}>`
  position: relative;
  width: 100%;
  height: 16px;
  margin-top: 4px;
  display: ${props => (props.$marks ? 'block' : 'none')};
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
  background-color: ${props =>
    props.$active ? getColorByName(props.$color) : 'rgba(0, 0, 0, 0.24)'};
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
  transform: translateX(-50%)
    translateY(${props => (props.$active || props.$display === 'on' ? 0 : '10px')});
  opacity: ${props => (props.$active || props.$display === 'on' ? 1 : 0)};
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
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const theme = useTheme();
  const { defaultSpring } = useAnimationContext();

  const [currentValue, setCurrentValue] = useState<number>(
    value !== undefined ? value : defaultValue || min
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Determine if animation should run
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
  const shouldAnimate = !finalDisableAnimation;

  // Interaction animation state
  const baseInteractionConfig: Partial<GalileoSpringConfig> = SpringPresets.DEFAULT; 
  
  // Resolve context config
  let contextResolvedConfig: Partial<GalileoSpringConfig> = {};
  if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
      contextResolvedConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
  } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
      contextResolvedConfig = defaultSpring;
  }

  // Resolve prop config
  let propResolvedConfig: Partial<GalileoSpringConfig> = {};
  if (typeof animationConfig === 'string' && animationConfig in SpringPresets) {
      propResolvedConfig = SpringPresets[animationConfig as keyof typeof SpringPresets];
  } else if (typeof animationConfig === 'object' && animationConfig !== null) {
      // Assume it's a SpringConfig or compatible
      propResolvedConfig = animationConfig as Partial<GalileoSpringConfig>;
  }

  // Merge: Prop > Context > Base
  const finalConfig = { 
      ...baseInteractionConfig, 
      ...contextResolvedConfig, 
      ...propResolvedConfig 
  };

  const { value: interactionProgress } = useGalileoStateSpring(
    isDragging ? 1 : (isHovering ? 0.5 : 0),
    {
        ...finalConfig,
        immediate: !shouldAnimate,
    }
  );

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

  // Mouse/Touch event handlers (to set isDragging, isHovering)
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    // Prevent text selection during drag
    e.preventDefault();
    // Add global listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchUp);
  }, [disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    updateValue(e.clientX);
  }, [updateValue]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      updateValue(e.touches[0].clientX);
    }
  }, [updateValue]);

  const handleTouchUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchUp);
  }, [handleTouchMove]);

  // Hover handlers for the thumb
  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setIsHovering(true);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    if (!disabled) {
      setIsHovering(false);
    }
  }, [disabled]);

  // Add useEffect for cleanup
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchUp);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchUp]);

  // Generate marks if enabled
  const renderMarks = () => {
    if (!marks) return null;

    const markElements = [];
    const numSteps = Math.floor((max - min) / step) + 1;

    for (let i = 0; i < numSteps; i++) {
      const markValue = min + i * step;
      // Skip marks that would exceed max
      if (markValue > max) continue;

      const position = calculatePercentage(markValue);
      const isActive = markValue <= currentValue;

      markElements.push(<Mark key={i} $position={position} $active={isActive} $color={color} />);
    }

    return <SliderMarks $marks={marks}>{markElements}</SliderMarks>;
  };

  const fillWidth = calculatePercentage(currentValue);
  const thumbPosition = fillWidth;
  const showValueLabel =
    valueLabelDisplay === 'on' || (valueLabelDisplay === 'auto' && (isHovering || isDragging));

  return (
    <SliderContainer ref={ref} className={className} {...rest}>
      {label && <SliderLabel>{label}</SliderLabel>}

      <div
        style={{ position: 'relative', marginBottom: marks ? '16px' : '0' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showValueLabel && (
          <ValueLabel
            $position={fillWidth}
            $display={valueLabelDisplay}
            $active={isDragging}
            $color={color}
          >
            {currentValue}
          </ValueLabel>
        )}

        <SliderTrack ref={trackRef} $disabled={disabled} onClick={(e) => updateValue(e.clientX)}>
          <SliderFill $fillWidth={fillWidth} $color={color} $size={size} />

          <SliderThumb
            ref={thumbRef}
            $position={thumbPosition}
            $color={color}
            $active={isDragging}
            $size={size}
            $disabled={disabled}
            $theme={theme}
            $interactionProgress={interactionProgress}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
  const { className, ...rest } = props;

  return <Slider ref={ref} className={`glass-slider ${className || ''}`} {...rest} />;
});

GlassSlider.displayName = 'GlassSlider';
