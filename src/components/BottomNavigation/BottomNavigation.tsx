import React, { forwardRef, Children, cloneElement, useState, useEffect, useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { createThemeContext } from '../../core/themeContext';
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMultiSpring } from '../../animations/physics/useMultiSpring';
import { accessibleAnimation } from '../../animations/accessibility/accessibleAnimation';
import { slideUp } from '../../animations/keyframes/basic';
import { AnimationProps } from '../../animations/types'; // Import AnimationProps

export interface BottomNavigationProps extends AnimationProps {
  /**
   * The content of the bottom navigation
   */
  children: React.ReactNode;

  /**
   * The value of the currently selected action
   */
  value?: number | string;

  /**
   * Callback fired when a bottom navigation item is selected
   */
  onChange?: (event: React.SyntheticEvent, value: number | string) => void;

  /**
   * If true, show labels for all actions regardless of selection
   */
  showLabels?: boolean;

  /**
   * The variant of bottom navigation appearance
   */
  variant?: 'standard' | 'glass';

  /**
   * The color theme of the bottom navigation
   */
  color?: 'primary' | 'secondary' | 'default';

  /**
   * The elevation of the bottom navigation component
   * (determines shadow depth)
   */
  elevation?: 0 | 1 | 2 | 3 | 4;

  /**
   * Additional CSS class
   */
  className?: string;
}

export interface BottomNavigationActionProps extends AnimationProps {
  /**
   * The label for the action
   */
  label: string;

  /**
   * The icon displayed for the action
   */
  icon: React.ReactNode;

  /**
   * The value of the action
   */
  value: number | string;

  /**
   * If true, the action is currently selected
   */
  selected?: boolean;

  /**
   * If true, the action is disabled
   */
  disabled?: boolean;

  /**
   * If true, show the label regardless of selection
   */
  showLabel?: boolean;

  /**
   * Callback fired when the action is selected
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Additional CSS class
   */
  className?: string;
}

// Get color by name
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    default:
      return '#1F2937'; // default dark gray
  }
};

// Get elevation shadow
const getElevationShadow = (elevation: number): string => {
  switch (elevation) {
    case 0:
      return 'none';
    case 1:
      return '0 2px 4px rgba(0, 0, 0, 0.1)';
    case 2:
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
    case 3:
      return '0 8px 16px rgba(0, 0, 0, 0.1)';
    case 4:
      return '0 12px 24px rgba(0, 0, 0, 0.1)';
    default:
      return '0 4px 8px rgba(0, 0, 0, 0.1)';
  }
};

// Styled components
const BottomNavigationContainer = styled.div<{
  $variant: string;
  $color: string;
  $elevation: number;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 56px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  box-sizing: border-box;

  /* Variant styles */
  ${props => {
    if (props.$variant === 'glass') {
      return css`
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      `;
    }

    // standard
    return css`
      background-color: white;
      color: #1f2937;
      box-shadow: ${getElevationShadow(props.$elevation)};
    `;
  }}

  /* Glass effect for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassSurface({
      elevation: props.$elevation,
      blurStrength: 'enhanced',
      backgroundOpacity: 'subtle',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}
  
  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    props.$color !== 'default' &&
    glassGlow({
      glowIntensity: 'minimal',
      glowColor: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Edge highlight for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    edgeHighlight({
      thickness: 1,
      opacity: 0.3,
      position: 'top',
      themeContext: createThemeContext({}),
    })}
  
  /* Animation */
  ${accessibleAnimation({
    animation: slideUp,
    duration: 0.3,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  })}
`;

const ActionButton = styled.button<{
  $selected: boolean;
  $size: 'small' | 'medium' | 'large';
  $showLabel: boolean;
  $color: string;
  $disabled: boolean;
}>`
  /* Base styles */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: ${props => (props.$size === 'small' ? '6px 0' : props.$size === 'large' ? '10px 0' : '8px 0')};
  min-width: 56px;
  max-width: 168px;
  color: ${props => (props.$selected ? getColorByName(props.$color) : 'rgba(255, 255, 255, 0.7)')};
  background: transparent;
  border: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  outline: none;
  font-family: inherit;
  transition: color 0.2s ease;
  will-change: transform, color;

  /* Icon styles */
  .action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${props => (props.$size === 'small' ? '20px' : props.$size === 'large' ? '28px' : '24px')};
    height: ${props => (props.$size === 'small' ? '20px' : props.$size === 'large' ? '28px' : '24px')};
    margin-bottom: ${props => (props.$showLabel ? '2px' : '0')};
    svg {
      width: 100%;
      height: 100%;
    }
  }

  /* Label styles */
  .action-label {
    font-size: ${props => (props.$size === 'small' ? '0.7rem' : props.$size === 'large' ? '0.875rem' : '0.75rem')};
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: ${props => (props.$selected || props.$showLabel ? 1 : 0)};
    max-height: ${props => (props.$selected || props.$showLabel ? '1.2em' : '0')};
    transition: opacity 0.2s ease;
    will-change: opacity, max-height;
  }

  /* Hover effect */
  &:hover {
    color: ${props => !props.$disabled && (props.$selected ? getColorByName(props.$color) : 'rgba(255, 255, 255, 0.9)')};
  }

  /* Selected state styles remain if needed, e.g., color change already handled */

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: rgba(255, 255, 255, 0.5);

    &:hover {
      color: rgba(255, 255, 255, 0.5);
    }
  }
`;

// Indicator component
const ActiveIndicator = styled.div.attrs<{ $style: React.CSSProperties }>(props => ({
  style: props.$style,
}))<{ $style: React.CSSProperties }>`
  position: absolute;
  height: 2px; // Or width if vertical
  background-color: ${props => getColorByName(props.color || 'primary')};
  bottom: 0; // Or left if vertical
  left: 0;
  width: 0;
  border-radius: 1px;
  pointer-events: none;
  will-change: left, width; // Or top, height if vertical
  z-index: 1;
`;

/**
 * BottomNavigation Component
 *
 * Provides navigation fixed to the bottom of the screen, often for mobile views.
 */
export const BottomNavigation = forwardRef<HTMLDivElement, BottomNavigationProps>((props, ref) => {
  const {
    children,
    value,
    onChange,
    showLabels = false,
    variant = 'standard',
    color = 'primary',
    elevation = 2,
    className,
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const [actionRefs, setActionRefs] = useState<Map<number | string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const { defaultSpring } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;

  // Calculate final spring config for indicator using animationConfig
  const finalIndicatorSpringConfig = useMemo(() => {
    const baseConfig: SpringConfig = SpringPresets.DEFAULT;
    let contextConfig: Partial<SpringConfig> = {};
    if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
      contextConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
    } else if (typeof defaultSpring === 'object') {
      contextConfig = defaultSpring ?? {};
    }

    let propConfig: Partial<SpringConfig> = {};
    const propSource = animationConfig;
    if (typeof propSource === 'string' && propSource in SpringPresets) {
      propConfig = SpringPresets[propSource as keyof typeof SpringPresets];
    } else if (typeof propSource === 'object' && ('tension' in propSource || 'friction' in propSource)) {
      propConfig = propSource as Partial<SpringConfig>;
    }
    return { ...baseConfig, ...contextConfig, ...propConfig };
  }, [defaultSpring, animationConfig]);

  // Setup spring for indicator
  const initialIndicatorStyle = { left: 0, width: 0, opacity: 0 };
  const { values: indicatorStyle, start: animateIndicator } = useMultiSpring({
    from: initialIndicatorStyle,
    animationConfig: finalIndicatorSpringConfig,
    immediate: finalDisableAnimation,
    autoStart: false,
  });

  // Effect to update indicator position
  useEffect(() => {
    const selectedActionElement = actionRefs.get(value);
    if (selectedActionElement && containerRef.current) {
      const actionRect = selectedActionElement.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Calculate position relative to the container
      const newStyle = {
        left: actionRect.left - containerRect.left,
        width: actionRect.width,
        opacity: 1,
      };
      animateIndicator({ to: newStyle });
    } else {
      // If no value or element not found, hide indicator
      animateIndicator({ to: { ...initialIndicatorStyle, opacity: 0 } });
    }
  }, [value, actionRefs, animateIndicator, initialIndicatorStyle]);

  // Clone children with additional props, including ref assignment
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const childValue = child.props.value;
      const childAnimProps: AnimationProps = {
        animationConfig: child.props.animationConfig ?? animationConfig,
        disableAnimation: child.props.disableAnimation ?? finalDisableAnimation,
        motionSensitivity: child.props.motionSensitivity ?? motionSensitivity,
      };
      return React.cloneElement(child, {
        ...child.props,
        ref: (node: HTMLElement | null) => {
          if (node) {
            setActionRefs(prev => new Map(prev).set(childValue, node));
          } else {
            // Clean up ref if node is unmounted
            setActionRefs(prev => {
              const newMap = new Map(prev);
              newMap.delete(childValue);
              return newMap;
            });
          }
        },
        selected: child.props.value === value,
        showLabel: showLabels || child.props.value === value,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (onChange) {
            onChange(event, child.props.value);
          }
          if (child.props.onClick) {
            child.props.onClick(event);
          }
        },
        variant,
        color,
        ...childAnimProps,
      } as React.HTMLAttributes<HTMLElement>);
    }
    return child;
  });

  return (
    <BottomNavigationContainer
      ref={containerRef}
      className={className}
      $variant={variant}
      $color={color}
      $elevation={elevation}
      {...rest}
    >
      {childrenWithProps}
      <ActiveIndicator $style={indicatorStyle as React.CSSProperties} color={color} />
    </BottomNavigationContainer>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

/**
 * BottomNavigationAction Component
 *
 * An individual action item within the BottomNavigation.
 */
export const BottomNavigationAction = forwardRef<HTMLButtonElement, BottomNavigationActionProps>(
  (props, ref) => {
    const {
      label,
      icon,
      selected = false,
      value,
      onClick,
      showLabel = false,
      className,
      disabled = false,
      animationConfig,
      disableAnimation,
      motionSensitivity,
      ...rest
    } = props;

    // Placeholder context values (replace with actual context if implemented)
    const size = 'medium';
    const color = 'primary';

    const { defaultSpring } = useAnimationContext();
    const prefersReducedMotion = useReducedMotion();
    const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
    const usePhysics = !finalDisableAnimation && !disabled; // Determine if physics should be used

    // Calculate final physics interaction config
    const finalInteractionConfig = useMemo<Partial<PhysicsInteractionOptions>>(() => {
        const baseOptions: Partial<PhysicsInteractionOptions> = {
            affectsScale: true,
            scaleAmplitude: 0.05, // Default scale amplitude for this component
        };

        let contextResolvedConfig: Partial<SpringConfig> = {};
        if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
            contextResolvedConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
        } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
            contextResolvedConfig = defaultSpring;
        }

        let propResolvedConfig: Partial<PhysicsInteractionOptions> = {};
        const configProp = animationConfig;
        // Handle prop config (similar to SpeedDialAction)
        if (typeof configProp === 'string' && configProp in SpringPresets) {
            const preset = SpringPresets[configProp as keyof typeof SpringPresets];
            propResolvedConfig = { stiffness: preset.tension, dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(preset.tension * (preset.mass ?? 1))) : undefined, mass: preset.mass };
        } else if (typeof configProp === 'object' && configProp !== null) {
            if ('stiffness' in configProp || 'dampingRatio' in configProp || 'mass' in configProp || 'scaleAmplitude' in configProp || 'rotationAmplitude' in configProp) {
                propResolvedConfig = configProp as Partial<PhysicsInteractionOptions>;
            } else if ('tension' in configProp || 'friction' in configProp) {
                const preset = configProp as Partial<SpringConfig>;
                const tension = preset.tension ?? SpringPresets.DEFAULT.tension;
                const mass = preset.mass ?? 1;
                propResolvedConfig = { stiffness: tension, dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(tension * mass)) : undefined, mass: mass };
            }
        }

        const finalStiffness = propResolvedConfig.stiffness ?? contextResolvedConfig.tension ?? baseOptions.stiffness ?? SpringPresets.DEFAULT.tension;
        const calculatedMass = propResolvedConfig.mass ?? contextResolvedConfig.mass ?? baseOptions.mass ?? 1;
        const finalDampingRatio = propResolvedConfig.dampingRatio ?? 
                                  (contextResolvedConfig.friction ? contextResolvedConfig.friction / (2 * Math.sqrt(finalStiffness * calculatedMass)) : baseOptions.dampingRatio ?? 0.5);
        const finalMass = calculatedMass;

        return {
            ...baseOptions,
            stiffness: finalStiffness,
            dampingRatio: finalDampingRatio,
            mass: finalMass,
            ...(propResolvedConfig.scaleAmplitude !== undefined && { scaleAmplitude: propResolvedConfig.scaleAmplitude }),
            ...(propResolvedConfig.rotationAmplitude !== undefined && { rotationAmplitude: propResolvedConfig.rotationAmplitude }),
            ...(propResolvedConfig.strength !== undefined && { strength: propResolvedConfig.strength }),
            ...(propResolvedConfig.radius !== undefined && { radius: propResolvedConfig.radius }),
            ...(propResolvedConfig.affectsRotation !== undefined && { affectsRotation: propResolvedConfig.affectsRotation }),
            ...(propResolvedConfig.affectsScale !== undefined && { affectsScale: propResolvedConfig.affectsScale }),
            ...(motionSensitivity && { motionSensitivityLevel: motionSensitivity }),
        };
    }, [defaultSpring, animationConfig, motionSensitivity]);

    // Apply physics interaction hook with calculated config
    const { style: animatedStyle, eventHandlers } = usePhysicsInteraction({
        ...finalInteractionConfig, // Use the calculated config
        reducedMotion: !usePhysics, // Correctly pass disable flag
        // scaleAmplitude removed - now part of finalInteractionConfig
    });

    return (
      <ActionButton
        ref={ref}
        $selected={selected}
        $size={size}
        $showLabel={showLabel || selected}
        $color={color}
        $disabled={disabled}
        onClick={onClick}
        className={className}
        style={usePhysics ? animatedStyle : {}} // Apply physics style conditionally
        {...(usePhysics ? eventHandlers : {})} // Apply handlers conditionally
        {...rest}
      >
        {icon && <span className="action-icon">{icon}</span>}
        {label && <span className="action-label">{label}</span>}
      </ActionButton>
    );
  }
);

BottomNavigationAction.displayName = 'BottomNavigationAction';

/**
 * GlassBottomNavigation Component
 *
 * A bottom navigation component with glass morphism styling.
 */
export const GlassBottomNavigation = forwardRef<HTMLDivElement, BottomNavigationProps>(
  (props, ref) => {
    const { className, variant = 'glass', ...rest } = props;

    return (
      <BottomNavigation
        ref={ref}
        className={`glass-bottom-navigation ${className || ''}`}
        variant={variant}
        {...rest}
      />
    );
  }
);

GlassBottomNavigation.displayName = 'GlassBottomNavigation';
