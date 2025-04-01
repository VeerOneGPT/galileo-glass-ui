/**
 * Glass Rating Component
 *
 * A rating component with glass morphism styling.
 */
import React, { forwardRef, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Galileo Animation Imports
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useAnimationContext } from '../../contexts/AnimationContext';

import { RatingProps } from './types';

// Default icons
const FilledStarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
  </svg>
);

const EmptyStarIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
      strokeWidth="1.5"
    />
  </svg>
);

// Get color values based on theme color
const getColorValue = (color: string): string => {
  switch (color) {
    case 'primary':
      return 'rgba(99, 102, 241, 1)';
    case 'secondary':
      return 'rgba(156, 39, 176, 1)';
    case 'error':
      return 'rgba(240, 82, 82, 1)';
    case 'info':
      return 'rgba(3, 169, 244, 1)';
    case 'success':
      return 'rgba(76, 175, 80, 1)';
    case 'warning':
      return 'rgba(255, 152, 0, 1)';
    case 'default':
    default:
      return 'rgba(255, 215, 0, 1)'; // Gold color for stars by default
  }
};

// Styled components
const RatingRoot = styled.div<{
  $disabled: boolean;
  $readOnly: boolean;
  $glass: boolean;
  $color: string;
}>`
  display: inline-flex;
  position: relative;
  font-size: 1.5rem;
  color: ${props => getColorValue(props.$color)};
  cursor: ${props => (props.$disabled ? 'default' : props.$readOnly ? 'default' : 'pointer')};
  align-items: center;

  /* Glass styling */
  ${props =>
    props.$glass &&
    glassSurface({
      elevation: 1,
      blurStrength: 'light',
      borderOpacity: 'subtle',
      themeContext: createThemeContext(props.theme),
    })}

  /* Glass additional styling */
  ${props =>
    props.$glass &&
    `
    padding: 8px 12px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.05);
  `}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: 0.5;
    pointer-events: none;
  `}
`;

const RatingContainer = styled.div<{
  $size: 'small' | 'medium' | 'large';
}>`
  display: inline-flex;
  position: relative;

  /* Size variations */
  font-size: ${props =>
    props.$size === 'small' ? '1.25rem' : props.$size === 'large' ? '2rem' : '1.5rem'};
`;

const HiddenInputs = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
`;

const RadioInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  pointer-events: none;
`;

const IconContainer = styled.span<{
  $filled: boolean;
  $hover: boolean;
  $active: boolean;
  $readOnly: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
`;

const Label = styled.span`
  margin-left: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const Value = styled.span`
  margin-left: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
`;

/**
 * Round to precision
 */
const roundValueToPrecision = (value: number, precision: number): number => {
  return Math.round(value / precision) * precision;
};

/**
 * Rating Component Implementation
 */
function RatingComponent(props: RatingProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    value: controlledValue,
    defaultValue = 0,
    max = 5,
    precision = 1,
    readOnly = false,
    disabled = false,
    onChange,
    onClick,
    onHover,
    label,
    size = 'medium',
    emptyIcon: customEmptyIcon,
    filledIcon: customFilledIcon,
    highlightedIcon: customHighlightedIcon,
    name,
    showLabel = false,
    showValue = false,
    glass = false,
    color = 'default',
    className,
    style,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const prefersReducedMotion = useReducedMotion();
  const { defaultSpring, disableAnimation: contextDisableAnimation } = useAnimationContext();

  // Resolve disable flag - INCORPORATE CONTEXT
  const finalDisableAnimation = disableAnimation ?? contextDisableAnimation ?? prefersReducedMotion;

  // Icons
  const emptyIcon = customEmptyIcon || <EmptyStarIcon />;
  const filledIcon = customFilledIcon || <FilledStarIcon />;
  const highlightedIcon = customHighlightedIcon || filledIcon;

  // State for uncontrolled component
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const [hover, setHover] = useState<number>(-1);
  const [active, setActive] = useState<number>(-1);

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  // Generate items based on max
  const items = useMemo(() => {
    return Array.from({ length: max }, (_, index) => index + 1);
  }, [max]);

  // Handle item value change
  const handleItemValueChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      // If already selected and not read-only, clear the value
      if (newValue === value && !readOnly) {
        newValue = 0;
      }

      // Round to precision
      newValue = roundValueToPrecision(newValue, precision);

      // Update internal value if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Call onChange
      if (onChange) {
        onChange(event, newValue || null);
      }
    },
    [value, readOnly, precision, isControlled, onChange]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      if (readOnly || disabled) return;

      const rootBounds = event.currentTarget.getBoundingClientRect();
      const itemWidth = rootBounds.width / max;
      const position = event.clientX - rootBounds.left;

      let newHover = Math.ceil(position / itemWidth);

      // Apply precision
      if (precision < 1) {
        const itemDecimalPosition = position / itemWidth - Math.floor(position / itemWidth);
        newHover = Math.floor(position / itemWidth) + (itemDecimalPosition >= 0.5 ? 1 : 0.5);
      }

      // Round to precision
      newHover = roundValueToPrecision(newHover, precision);

      // Ensure within bounds
      newHover = Math.max(0, Math.min(newHover, max));

      setHover(newHover);

      // Call onHover
      if (onHover && newHover !== hover) {
        onHover(event, newHover);
      }
    },
    [readOnly, disabled, max, precision, hover, onHover]
  );

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (readOnly || disabled) return;
    setHover(-1);
  }, [readOnly, disabled]);

  // Handle click
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      if (readOnly || disabled) return;

      const rootBounds = event.currentTarget.getBoundingClientRect();
      const itemWidth = rootBounds.width / max;
      const position = event.clientX - rootBounds.left;

      let newValue = Math.ceil(position / itemWidth);

      // Apply precision
      if (precision < 1) {
        const itemDecimalPosition = position / itemWidth - Math.floor(position / itemWidth);
        newValue = Math.floor(position / itemWidth) + (itemDecimalPosition >= 0.5 ? 1 : 0.5);
      }

      // Round to precision
      newValue = roundValueToPrecision(newValue, precision);

      // Ensure within bounds
      newValue = Math.max(0, Math.min(newValue, max));

      // If already selected, clear the value
      if (newValue === value && !readOnly) {
        newValue = 0;
      }

      // Update internal value if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Call onChange
      if (onChange) {
        onChange(event, newValue || null);
      }

      // Call onClick
      if (onClick) {
        onClick(event, newValue);
      }
    },
    [readOnly, disabled, max, precision, value, isControlled, onChange, onClick]
  );

  // Handle focus and blur
  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const index = parseInt(event.target.value, 10);
    setHover(index);
  }, []);

  const handleBlur = useCallback(() => {
    setHover(-1);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (readOnly || disabled) return;

      // Get current value or hover value
      const currentValue = hover !== -1 ? hover : value;
      let newValue = currentValue;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          // Increment value
          newValue = Math.min(currentValue + precision, max);
          event.preventDefault();
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          // Decrement value
          newValue = Math.max(currentValue - precision, 0);
          event.preventDefault();
          break;
        case 'Home':
          // Set to min
          newValue = 0;
          event.preventDefault();
          break;
        case 'End':
          // Set to max
          newValue = max;
          event.preventDefault();
          break;
        case 'Enter':
        case ' ': // Space key
          // Update internal value if uncontrolled
          if (!isControlled) {
            setInternalValue(newValue);
          }

          // Call onChange
          if (onChange) {
            onChange(event, newValue || null);
          }

          event.preventDefault();
          return; // Return early after handling Enter/Space
        default:
          return;
      }

      // Set hover value
      setHover(newValue);
    },
    [readOnly, disabled, hover, value, precision, max, isControlled, onChange]
  );

  // Render items
  const renderItems = () => {
    return items.map((itemValue) => {
      const itemIndex = itemValue - 1;
      const radioId = name ? `${name}-${itemValue}` : undefined;
      const itemIsFilled = value >= itemValue;
      const itemIsHovered = hover >= itemValue;
      const itemIsActive = active === itemValue;
      const displayValue = hover !== -1 ? hover : value;
      const shouldHighlight = displayValue >= itemValue;

      // Determine icon based on state
      let iconToRender = itemIsFilled ? filledIcon : emptyIcon;
      if (shouldHighlight) {
        iconToRender = highlightedIcon;
      }

      // Calculate final config for this item's interaction
      const finalInteractionConfig = useMemo(() => {
        // Similar merging logic as seen in Fab.tsx, adapted for this context
        const baseOptions: Partial<PhysicsInteractionOptions> = {
          affectsScale: true,
          scaleAmplitude: 0.05,
          stiffness: SpringPresets.DEFAULT.tension,
          dampingRatio: (SpringPresets.DEFAULT.friction / (2 * Math.sqrt(SpringPresets.DEFAULT.tension * (SpringPresets.DEFAULT.mass ?? 1)))),
          mass: SpringPresets.DEFAULT.mass ?? 1,
        };
        
        let contextResolvedConfig: Partial<SpringConfig> = {};
        if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
            contextResolvedConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
        } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
            contextResolvedConfig = defaultSpring;
        }

        let propResolvedConfig: Partial<PhysicsInteractionOptions> = {};
        const configProp = animationConfig;
        if (typeof configProp === 'string' && configProp in SpringPresets) {
            const preset = SpringPresets[configProp as keyof typeof SpringPresets];
            propResolvedConfig = { 
                stiffness: preset.tension, 
                dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(preset.tension * (preset.mass ?? 1))) : undefined, 
                mass: preset.mass 
            };
        } else if (typeof configProp === 'object' && configProp !== null) {
            if ('stiffness' in configProp || 'dampingRatio' in configProp || 'mass' in configProp) {
                propResolvedConfig = { ...configProp } as Partial<PhysicsInteractionOptions>; // Spread to handle potential extra props
            } else if ('tension' in configProp || 'friction' in configProp) {
                 const preset = configProp as Partial<SpringConfig>;
                 const tension = preset.tension ?? SpringPresets.DEFAULT.tension;
                 const mass = preset.mass ?? 1;
                 propResolvedConfig = { 
                     stiffness: tension, 
                     dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(tension * mass)) : undefined, 
                     mass: mass 
                };
            }
            // Safely apply specific interaction options if they exist in the configProp object
            if ('strength' in configProp && typeof configProp.strength === 'number') propResolvedConfig.strength = configProp.strength;
            if ('radius' in configProp && typeof configProp.radius === 'number') propResolvedConfig.radius = configProp.radius;
            if ('affectsRotation' in configProp && typeof configProp.affectsRotation === 'boolean') propResolvedConfig.affectsRotation = configProp.affectsRotation;
            if ('affectsScale' in configProp && typeof configProp.affectsScale === 'boolean') propResolvedConfig.affectsScale = configProp.affectsScale;
            if ('rotationAmplitude' in configProp && typeof configProp.rotationAmplitude === 'number') propResolvedConfig.rotationAmplitude = configProp.rotationAmplitude;
            if ('scaleAmplitude' in configProp && typeof configProp.scaleAmplitude === 'number') propResolvedConfig.scaleAmplitude = configProp.scaleAmplitude;
        }

        const finalStiffness = propResolvedConfig.stiffness ?? contextResolvedConfig.tension ?? baseOptions.stiffness;
        const calculatedMass = propResolvedConfig.mass ?? contextResolvedConfig.mass ?? baseOptions.mass ?? 1; // Ensure mass is defined
        const finalDampingRatio = propResolvedConfig.dampingRatio ?? 
                                  (contextResolvedConfig.friction ? contextResolvedConfig.friction / (2 * Math.sqrt((finalStiffness ?? baseOptions.stiffness ?? 170) * calculatedMass)) : baseOptions.dampingRatio);
        const finalMass = calculatedMass;
        
        return {
            ...baseOptions,
            stiffness: finalStiffness,
            dampingRatio: finalDampingRatio,
            mass: finalMass,
            // Apply specific interaction options if they exist in propResolvedConfig
            ...(propResolvedConfig.strength !== undefined && { strength: propResolvedConfig.strength }),
            ...(propResolvedConfig.radius !== undefined && { radius: propResolvedConfig.radius }),
            ...(propResolvedConfig.affectsRotation !== undefined && { affectsRotation: propResolvedConfig.affectsRotation }),
            ...(propResolvedConfig.affectsScale !== undefined && { affectsScale: propResolvedConfig.affectsScale }),
            ...(propResolvedConfig.rotationAmplitude !== undefined && { rotationAmplitude: propResolvedConfig.rotationAmplitude }),
            ...(propResolvedConfig.scaleAmplitude !== undefined && { scaleAmplitude: propResolvedConfig.scaleAmplitude }),
            ...(motionSensitivity && { motionSensitivityLevel: motionSensitivity }),
        };
    
      }, [defaultSpring, animationConfig, motionSensitivity]);

      // Apply Physics Hook with merged config
      const {
        ref: physicsRef,
        style: physicsStyle,
      } = usePhysicsInteraction<HTMLElement>(finalInteractionConfig);

      return (
        <IconContainer
          key={itemValue}
          $filled={itemIsFilled}
          $hover={itemIsHovered}
          $active={itemIsActive}
          $readOnly={readOnly}
          $reducedMotion={finalDisableAnimation}
          ref={physicsRef}
          style={physicsStyle}
          onMouseMove={!readOnly && !disabled ? handleMouseMove : undefined}
          onMouseLeave={!readOnly && !disabled ? handleMouseLeave : undefined}
          onClick={!readOnly && !disabled ? handleClick : undefined}
          onFocus={() => setActive(itemValue)}
          onBlur={() => setActive(-1)}
        >
          {!readOnly && (
            <HiddenInputs>
                <RadioInput
                    type="radio"
                    name={name}
                    id={radioId}
                    value={itemValue}
                    checked={value === itemValue}
                    onChange={(e) => handleItemValueChange(e, itemValue)}
                    disabled={disabled}
                />
            </HiddenInputs>
          )}
          {iconToRender}
        </IconContainer>
      );
    });
  };

  return (
    <RatingRoot
      ref={ref}
      className={className}
      style={style}
      $disabled={disabled}
      $readOnly={readOnly}
      $glass={glass}
      $color={color}
      {...rest}
    >
      <RatingContainer $size={size}>
        {renderItems()} 
      </RatingContainer>
      {showLabel && label && <Label>{label}</Label>}
      {showValue && <Value>({value.toFixed(precision === 1 ? 0 : 1)})</Value>}
    </RatingRoot>
  );
}

/**
 * Rating Component
 *
 * A rating component.
 */
const Rating = forwardRef(RatingComponent);

/**
 * GlassRating Component
 *
 * Glass variant of the Rating component.
 */
const GlassRating = forwardRef<HTMLDivElement, RatingProps>((props, ref) => (
  <Rating {...props} glass={true} ref={ref} />
));

GlassRating.displayName = 'GlassRating';

export default Rating;
export { Rating, GlassRating };
