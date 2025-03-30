import React, { forwardRef, useState, useMemo, useRef } from 'react';
import styled from 'styled-components';

import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

// Physics Imports
import { 
  usePhysicsInteraction, 
  type PhysicsInteractionOptions 
} from '../../hooks/usePhysicsInteraction';
import type { SpringConfig } from '../../animations/physics/springPhysics';
import { SpringPresets } from '../../animations/physics/springPhysics';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useGalileoStateSpring } from '../../hooks/useGalileoStateSpring';
import { AnimationProps } from '../../animations/types';

export interface ChipProps extends AnimationProps {
  /**
   * The content of the chip
   */
  label: string;

  /**
   * The variant of the chip
   */
  variant?: 'filled' | 'outlined' | 'glass';

  /**
   * The color of the chip
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

  /**
   * Icon element to display at the start of the chip
   */
  icon?: React.ReactNode;

  /**
   * If true, the chip will be rendered with a delete button
   */
  deletable?: boolean;

  /**
   * A function called when the delete button is clicked
   */
  onDelete?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * A function called when the chip is clicked
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * If true, the chip will be disabled
   */
  disabled?: boolean;

  /**
   * The size of the chip
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * If true, the chip will highlight on hover
   */
  interactive?: boolean;

  /**
   * The shape of the chip
   */
  shape?: 'rounded' | 'square';

  /**
   * Additional CSS class
   */
  className?: string;

  /** 
   * Optional style overrides. 
   */
  style?: React.CSSProperties; 
}

// Get color by name for theme consistency
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
      return '#E5E7EB'; // default light gray
  }
};

// Styled components
const ChipRoot = styled.div<{
  $variant: string;
  $color: string;
  $disabled: boolean;
  $size: string;
  $interactive: boolean;
  $shape: string;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  border-radius: ${props => (props.$shape === 'rounded' ? '16px' : '4px')};
  white-space: nowrap;
  cursor: ${props => {
    if (props.$disabled) return 'default';
    return props.$interactive ? 'pointer' : 'default';
  }};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  user-select: none;
  will-change: transform, opacity;

  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          height: 24px;
          font-size: 0.75rem;
          padding: 0 8px;
        `;
      case 'large':
        return `
          height: 32px;
          font-size: 0.875rem;
          padding: 0 14px;
        `;
      default: // medium
        return `
          height: 28px;
          font-size: 0.8125rem;
          padding: 0 12px;
        `;
    }
  }}

  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'outlined':
        return `
          background-color: transparent;
          border: 1px solid ${
            props.$color === 'default' ? 'rgba(0, 0, 0, 0.23)' : getColorByName(props.$color)
          };
          color: ${
            props.$color === 'default' ? 'rgba(0, 0, 0, 0.87)' : getColorByName(props.$color)
          };
        `;
      case 'glass':
        return `
          background-color: ${`${getColorByName(props.$color)}33`};
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid ${`${getColorByName(props.$color)}66`};
          color: ${
            props.$color === 'default' ? 'rgba(0, 0, 0, 0.87)' : getColorByName(props.$color)
          };
        `;
      default: // filled
        return `
          background-color: ${getColorByName(props.$color)};
          color: ${props.$color === 'default' ? 'rgba(0, 0, 0, 0.87)' : 'white'};
          border: none;
        `;
    }
  }}
  
  /* Glass effect for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    !props.$disabled &&
    glassSurface({
      elevation: 1,
      blurStrength: 'minimal',
      backgroundOpacity: 'medium',
      borderOpacity: 'medium',
      themeContext: createThemeContext({}),
    })}
  
  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    !props.$disabled &&
    glassGlow({
      intensity: 'minimal',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Edge highlight for interactive chips */
  ${props =>
    props.$interactive &&
    !props.$disabled &&
    props.$variant !== 'filled' &&
    edgeHighlight({
      position: 'bottom',
      thickness: 1,
      color: props.$color,
      opacity: 0.6,
      themeContext: createThemeContext({}),
    })}
`;

const ChipIcon = styled.span`
  display: flex;
  margin-right: 6px;
  margin-left: -4px;
`;

const ChipLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 2px;
  padding-right: 2px;
`;

const DeleteButton = styled.button<{
  $disabled: boolean;
  $color: string;
  $variant: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -6px;
  margin-left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props =>
    props.$variant === 'filled' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  color: ${props => (props.$variant === 'filled' ? 'white' : 'inherit')};
  border: none;
  padding: 0;
  font-size: 12px;
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props =>
      !props.$disabled &&
      (props.$variant === 'filled' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.2)')};
  }

  &:focus {
    outline: none;
  }
`;

/**
 * Chip Component
 *
 * A compact element to display small pieces of information.
 */
export const Chip = forwardRef<HTMLDivElement, ChipProps>((props, ref) => {
  const {
    label,
    variant = 'filled',
    color = 'default',
    icon,
    deletable = false,
    onDelete,
    onClick,
    disabled = false,
    size = 'medium',
    interactive = false,
    shape = 'rounded',
    className,
    style,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  // --- State for Delete Animation ---
  const [isVisible, setIsVisible] = useState(true);
  const deleteEventRef = useRef<React.MouseEvent<HTMLElement> | null>(null);

  // --- Physics Hooks Setup --- 
  const isInteractive = (interactive || !!onClick) && !disabled;
  const { defaultSpring } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
  const usePhysics = isInteractive && !finalDisableAnimation;

  // Resolve interaction config using animationConfig
  const finalInteractionConfig = useMemo<Partial<PhysicsInteractionOptions>>(() => {
    const baseOptions: Partial<PhysicsInteractionOptions> = {
      affectsScale: true,
      scaleAmplitude: 0.04,
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
            propResolvedConfig = configProp as Partial<PhysicsInteractionOptions>;
        } else if ('tension' in configProp || 'friction' in configProp) {
             const preset = configProp as Partial<SpringConfig>;
             propResolvedConfig = { 
                 stiffness: preset.tension, 
                 dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt((preset.tension ?? SpringPresets.DEFAULT.tension) * (preset.mass ?? 1))) : undefined, 
                 mass: preset.mass 
            };
        }
    }

    const finalStiffness = propResolvedConfig.stiffness ?? contextResolvedConfig.tension ?? baseOptions.stiffness;
    const finalDampingRatio = propResolvedConfig.dampingRatio ?? (contextResolvedConfig.friction ? contextResolvedConfig.friction / (2 * Math.sqrt(finalStiffness ?? baseOptions.stiffness ?? 170)) : baseOptions.dampingRatio);
    const finalMass = propResolvedConfig.mass ?? contextResolvedConfig.mass ?? baseOptions.mass;
    
    return {
        ...baseOptions,
        stiffness: finalStiffness,
        dampingRatio: finalDampingRatio,
        mass: finalMass,
        ...(motionSensitivity && { motionSensitivityLevel: motionSensitivity }),
        ...(propResolvedConfig.scaleAmplitude !== undefined && { scaleAmplitude: propResolvedConfig.scaleAmplitude }),
    };

  }, [defaultSpring, animationConfig, motionSensitivity]);

  const { style: physicsHoverPressStyle, eventHandlers } = usePhysicsInteraction({
      ...finalInteractionConfig,
      reducedMotion: !usePhysics, 
  });

  // --- Delete Animation Spring --- 
  const deleteSpringConfig = useMemo(() => {
      const base = SpringPresets.STIFF;
      let contextConf = {};
      if(typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
         contextConf = SpringPresets[defaultSpring as keyof typeof SpringPresets];
      } else if (typeof defaultSpring === 'object') {
         contextConf = defaultSpring ?? {};
      }
      return { ...base, ...contextConf };
  }, [defaultSpring]);

  const { value: deleteAnimProgress } = useGalileoStateSpring(isVisible ? 1 : 0, {
      ...deleteSpringConfig,
      immediate: finalDisableAnimation,
      onRest: (result) => {
          if (!isVisible && result.finished && onDelete && deleteEventRef.current) {
              onDelete(deleteEventRef.current);
              deleteEventRef.current = null;
          }
      },
  });

  // Calculate combined animated styles
  const combinedStyle = useMemo(() => {
    const base = { ...style };
    let transform = '';

    if (usePhysics && isVisible && physicsHoverPressStyle.transform) {
      transform += physicsHoverPressStyle.transform + ' ';
    }
    
    transform += `scale(${deleteAnimProgress})`;

    return {
      ...base,
      opacity: deleteAnimProgress,
      transform: transform.trim(),
    };
  }, [style, usePhysics, physicsHoverPressStyle, deleteAnimProgress, isVisible]);

  // Determine event handlers
  const finalEventHandlers = usePhysics ? eventHandlers : {};

  // Handle delete button click
  const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (disabled || !isVisible) return;

    deleteEventRef.current = event;
    setIsVisible(false);
  };

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !isVisible) return;
    if (finalEventHandlers.onClick) {
      finalEventHandlers.onClick(event as any);
    }
    if (onClick) {
      onClick(event);
    }
  };

  if (deleteAnimProgress === 0 && !isVisible && !onDelete) {
      return null;
  }

  return (
    <ChipRoot
      ref={ref}
      className={className}
      style={combinedStyle}
      $variant={variant}
      $color={color}
      $disabled={disabled}
      $size={size}
      $interactive={isInteractive}
      $shape={shape}
      onClick={handleClick}
      onMouseEnter={finalEventHandlers.onMouseEnter}
      onMouseLeave={finalEventHandlers.onMouseLeave}
      onMouseDown={finalEventHandlers.onMouseDown}
      onMouseUp={finalEventHandlers.onMouseUp}
      role={isInteractive ? 'button' : 'presentation'}
      tabIndex={isInteractive ? 0 : undefined}
      aria-hidden={!isVisible && deleteAnimProgress < 0.1}
      {...rest}
    >
      {icon && <ChipIcon>{icon}</ChipIcon>}
      <ChipLabel>{label}</ChipLabel>
      {deletable && (
        <DeleteButton
          $disabled={disabled}
          $color={color}
          $variant={variant}
          onClick={handleDelete}
          aria-label="Remove"
          type="button"
          disabled={disabled || !isVisible}
        >
          ×
        </DeleteButton>
      )}
    </ChipRoot>
  );
});

Chip.displayName = 'Chip';

/**
 * GlassChip Component
 *
 * A Chip component with glass morphism styling.
 */
export const GlassChip = forwardRef<HTMLDivElement, ChipProps>((props, ref) => {
  const { className, variant = 'glass', ...rest } = props;
  return <Chip ref={ref} className={`glass-chip ${className || ''}`} variant={variant} {...rest} />;
});

GlassChip.displayName = 'GlassChip';

export default Chip;