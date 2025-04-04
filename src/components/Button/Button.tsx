import React, { forwardRef, useCallback, useState, useMemo, useRef } from 'react';
import styled, { useTheme, css, keyframes, DefaultTheme } from 'styled-components';
import { Slot } from '@radix-ui/react-slot';

import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';
import { AnimationProps } from '../../animations/types';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { MotionSensitivityLevel } from '../../animations/core/types';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { FlexibleElementRef } from '../../utils/elementTypes';

// Define valid preset names as a type
type SpringPresetName = keyof typeof SpringPresets;

/**
 * Props for the Button component
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>, AnimationProps {
  /** Button variant */
  variant?: 'text' | 'outlined' | 'contained' | 'glass';
  /** Button color theme */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** If true, the button is disabled */
  disabled?: boolean;
  /** If true, the button takes up the full width of its container */
  fullWidth?: boolean;
  /** Element displayed before the children */
  startIcon?: React.ReactNode;
  /** Element displayed after the children */
  endIcon?: React.ReactNode;
  /** If true, shows a loading indicator */
  isLoading?: boolean;
  /** Text for the loading indicator */
  loadingText?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  
  /**
   * Configuration for the button's press animation (physics interaction).
   * Can be a preset name or a partial SpringConfig object.
   */
  animationConfig?: Partial<SpringConfig> | SpringPresetName;

  /**
   * Physics interaction options (advanced)
   */
  physicsOptions?: Partial<PhysicsInteractionOptions>;

  /**
   * Sensitivity level for motion effects.
   */
  motionSensitivity?: MotionSensitivityLevel;

  /**
   * Disable animation
   */
  disableAnimation?: boolean;

  /**
   * If true, the component will render its child element directly,
   * merging its own props and behavior onto the child.
   */
  asChild?: boolean;
}

// Define default props if needed
export const defaultButtonProps: Partial<ButtonProps> = {
  variant: 'contained',
  color: 'primary',
  size: 'medium',
  disabled: false,
  fullWidth: false,
};

// Styled button with glass effects
const StyledButton = styled.button<{
  $variant: 'contained' | 'outlined' | 'text' | 'glass';
  $color: string;
  $disabled: boolean;
  $size: string;
  $theme: any;
  $fullWidth: boolean;
}>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  outline: 0;
  border: 0;
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
  user-select: none;
  vertical-align: middle;
  text-decoration: none;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  border-radius: 4px;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};

  /* Size styles */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 6px 16px;
          font-size: 0.8125rem;
          min-height: 32px;
        `;
      case 'large':
        return `
          padding: 10px 22px;
          font-size: 0.9375rem;
          min-height: 44px;
        `;
      default: // medium
        return `
          padding: 8px 20px;
          font-size: 0.875rem;
          min-height: 40px;
        `;
    }
  }}

  /* Glass effect styles for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    !props.$disabled &&
    glassSurface({
      elevation: 2,
      blurStrength: 'standard',
      backgroundOpacity: 'medium',
      borderOpacity: 'subtle',
      themeContext: createThemeContext(props.$theme),
    })}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: 0.5;
    pointer-events: none;
  `}
  
  /* Variant + color styles */
  ${props => {
    if (props.$variant === 'contained' || props.$variant === 'glass') {
      switch (props.$color) {
        case 'primary':
          return `
            background-color: ${props.$variant === 'glass' ? 'transparent' : '#6366F1'};
            color: ${props.$variant === 'glass' ? 'inherit' : 'white'};
          `;
        case 'secondary':
          return `
            background-color: ${props.$variant === 'glass' ? 'transparent' : '#8B5CF6'};
            color: ${props.$variant === 'glass' ? 'inherit' : 'white'};
          `;
        case 'success':
          return `
            background-color: ${props.$variant === 'glass' ? 'transparent' : '#10B981'};
            color: ${props.$variant === 'glass' ? 'inherit' : 'white'};
          `;
        case 'error':
          return `
            background-color: ${props.$variant === 'glass' ? 'transparent' : '#EF4444'};
            color: ${props.$variant === 'glass' ? 'inherit' : 'white'};
          `;
        case 'warning':
          return `
            background-color: ${props.$variant === 'glass' ? 'transparent' : '#F59E0B'};
            color: ${props.$variant === 'glass' ? 'inherit' : 'white'};
          `;
        case 'info':
          return `
            background-color: ${props.$variant === 'glass' ? 'transparent' : '#3B82F6'};
            color: ${props.$variant === 'glass' ? 'inherit' : 'white'};
          `;
        default:
          return `
            background-color: ${props.$variant === 'glass' ? 'transparent' : 'rgba(75, 85, 99, 0.8)'};
            color: ${props.$variant === 'glass' ? 'inherit' : 'white'};
          `;
      }
    } else if (props.$variant === 'outlined') {
      switch (props.$color) {
        case 'primary':
          return `
            border: 1px solid #6366F1;
            color: #6366F1;
            background-color: transparent;
          `;
        case 'secondary':
          return `
            border: 1px solid #8B5CF6;
            color: #8B5CF6;
            background-color: transparent;
          `;
        case 'success':
          return `
            border: 1px solid #10B981;
            color: #10B981;
            background-color: transparent;
          `;
        case 'error':
          return `
            border: 1px solid #EF4444;
            color: #EF4444;
            background-color: transparent;
          `;
        case 'warning':
          return `
            border: 1px solid #F59E0B;
            color: #F59E0B;
            background-color: transparent;
          `;
        case 'info':
          return `
            border: 1px solid #3B82F6;
            color: #3B82F6;
            background-color: transparent;
          `;
        default:
          return `
            border: 1px solid rgba(75, 85, 99, 0.8);
            color: rgba(75, 85, 99, 0.8);
            background-color: transparent;
          `;
      }
    } else {
      // text variant
      switch (props.$color) {
        case 'primary':
          return `
            color: #6366F1;
            background-color: transparent;
          `;
        case 'secondary':
          return `
            color: #8B5CF6;
            background-color: transparent;
          `;
        case 'success':
          return `
            color: #10B981;
            background-color: transparent;
          `;
        case 'error':
          return `
            color: #EF4444;
            background-color: transparent;
          `;
        case 'warning':
          return `
            color: #F59E0B;
            background-color: transparent;
          `;
        case 'info':
          return `
            color: #3B82F6;
            background-color: transparent;
          `;
        default:
          return `
            color: rgba(75, 85, 99, 0.8);
            background-color: transparent;
          `;
      }
    }
  }}
`;

/**
 * Button Component
 *
 * A flexible button component with multiple variants and colors.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    children,
    asChild,
    variant = 'contained',
    color = 'primary',
    disabled = false,
    size = 'medium',
    onClick,
    className,
    fullWidth = false,
    style,
    onMouseDown,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const theme = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const { defaultSpring, pressSpringConfig } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();

  const finalReducedMotion = disableAnimation ?? prefersReducedMotion;

  const finalPhysicsConfig = useMemo(() => {
    const presetName = animationConfig ?? pressSpringConfig ?? 'PRESS_FEEDBACK';
    let config: Partial<SpringConfig> = {};
    if (typeof presetName === 'string' && presetName in SpringPresets) {
      config = SpringPresets[presetName as keyof typeof SpringPresets];
    } else if (typeof presetName === 'object') {
      config = presetName;
    }
    return {
      stiffness: config.tension,
      dampingRatio: config.friction ? config.friction / (2 * Math.sqrt((config.tension ?? 170) * (config.mass ?? 1))) : undefined,
      mass: config.mass,
      affectsScale: true,
      scaleAmplitude: 0.02,
    };
  }, [animationConfig, pressSpringConfig]);

  const {
    ref: physicsRef,
    style: physicsStyle,
    applyImpulse,
    reset
  } = usePhysicsInteraction<HTMLButtonElement>({
    type: 'spring',
    ...finalPhysicsConfig,
    reducedMotion: finalReducedMotion,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || finalReducedMotion) return;
    setIsPressed(true);
    applyImpulse({ x: 0, y: 1, z: 0 });
    if (onMouseDown) {
      onMouseDown(e);
    }
  }, [applyImpulse, disabled, onMouseDown, finalReducedMotion]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !isPressed) return;
    setIsPressed(false);
    reset();
  }, [reset, disabled, isPressed]);

  const handleMouseLeave = useCallback(() => {
    if (isPressed) {
      setIsPressed(false);
      reset();
    }
  }, [reset, isPressed]);

  const combinedRef = (node: HTMLButtonElement | null) => {
    (physicsRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      if (asChild && event.currentTarget.closest('a, form')) {
        // Potentially check if the direct child is the interactive element
      }
      onClick(event);
    }
  };

  const Comp = asChild ? Slot : StyledButton;

  return (
    <Comp
      ref={combinedRef}
      style={{ ...(finalReducedMotion ? {} : physicsStyle), ...style }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={className}
      {...(!asChild && {
        $variant: variant,
        $color: color,
        $disabled: disabled,
        $size: size,
        $theme: theme,
        $fullWidth: fullWidth,
        disabled: disabled,
      })}
      {...rest}
    >
      {children}
    </Comp>
  );
});

Button.displayName = 'Button';

/**
 * GlassButton Component
 *
 * A button component with glass morphism styling.
 */
export const GlassButton = forwardRef<HTMLButtonElement, ButtonProps>(function GlassButton(props, ref) {
  const {
    children,
    asChild,
    variant = 'contained',
    color = 'primary',
    disabled = false,
    size = 'medium',
    onClick,
    className,
    ...rest
  } = props;

  return (
    <Button
      ref={ref}
      asChild={asChild}
      variant={variant}
      color={color}
      disabled={disabled}
      size={size}
      onClick={onClick}
      className={`glass-button ${className || ''}`}
      {...rest}
    >
      {children}
    </Button>
  );
});

GlassButton.displayName = 'GlassButton';
