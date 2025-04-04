import React, { forwardRef, Children, cloneElement, useState, useEffect, useMemo, useRef, isValidElement, useCallback } from 'react';
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
import { mergePhysicsRef } from '../../utils/refUtils';
import { ThemeProvider, useTheme } from '@emotion/react';
import { CoreThemeContext } from '../../core/themeContext';

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
   * The color theme of the action
   */
  color?: string;

  /**
   * The size of the action
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Callback fired when the action is selected
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * Internal prop for parent to register the element
   * @internal
   */
  registerElement?: (element: HTMLElement | null) => void;
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
  theme?: any;
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
    const themeContext = createThemeContext(props.theme);
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
  ${props => {
    const themeContext = createThemeContext(props.theme);
    if (props.$variant === 'glass') {
      return css`
        ${glassSurface({
          elevation: props.$elevation,
          blurStrength: 'enhanced',
          backgroundOpacity: 'subtle',
          borderOpacity: 'subtle',
          themeContext: themeContext,
        })}
      `;
    }
    return ''
  }}
  
  /* Glass glow for glass variant */
  ${props => {
    const themeContext = createThemeContext(props.theme);
    if (props.$variant === 'glass' && props.$color !== 'default') {
      return css`
        ${glassGlow({
          glowIntensity: 'minimal',
          glowColor: props.$color,
          themeContext: themeContext,
        })}
      `;
    }
    return ''
  }}
  
  /* Edge highlight for glass variant */
  ${props => {
    const themeContext = createThemeContext(props.theme);
    if (props.$variant === 'glass') {
      return css`
        ${edgeHighlight({
          thickness: 1,
          opacity: 0.3,
          position: 'top',
          themeContext: themeContext,
        })}
      `;
    }
    return ''
  }}
  
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

  const containerRef = useRef<HTMLDivElement>(null);
  const actionElementsRef = useRef<Map<number | string, HTMLElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const { defaultSpring } = useAnimationContext();
  const prefersReducedMotion = useReducedMotion();
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
  const theme = useTheme();

  // Helper to register an action element
  const registerActionElement = useCallback((value: number | string, element: HTMLElement | null) => {
    if (element) {
      actionElementsRef.current.set(value, element);
    } else {
      actionElementsRef.current.delete(value);
    }
  }, []);

  // Update indicator position when value changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const selectedElement = actionElementsRef.current.get(value);
    if (selectedElement) {
      const actionRect = selectedElement.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setIndicatorStyle({
        left: actionRect.left - containerRect.left,
        width: actionRect.width,
        opacity: 1
      });
    } else {
      setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
    }
  }, [value]);

  // Clone children with additional props
  const childrenWithProps = Children.map(children, (child) => {
    if (!isValidElement<BottomNavigationActionProps>(child)) {
      return child;
    }

    const childValue = child.props.value;
    const isSelected = childValue === value;
    
    return cloneElement(child, {
      ...child.props,
      selected: isSelected,
      showLabel: showLabels || isSelected,
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!child.props.disabled && onChange) {
          onChange(event, childValue);
        }
        if (child.props.onClick) {
          child.props.onClick(event);
        }
      },
      registerElement: (element: HTMLElement | null) => {
        registerActionElement(childValue, element);
      }
    } as any); // Using 'any' to bypass TS property checking
  });

  // Handle container ref
  const handleRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    
    // Forward the ref
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <BottomNavigationContainer
      ref={handleRef}
      className={className}
      $variant={variant}
      $color={color}
      $elevation={elevation}
      {...rest}
    >
      {childrenWithProps}
      <ActiveIndicator 
        $style={indicatorStyle}
        color={color}
      />
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
      value,
      onClick,
      selected = false,
      disabled = false,
      className,
      showLabel = false,
      color,
      size,
      animationConfig,
      disableAnimation,
      motionSensitivity,
      registerElement,
      ...rest
    } = props;

    // Placeholder context values (replace with actual context if implemented)
    const usePhysics = !disableAnimation && !disabled; // Determine if physics should be used

    // Calculate final physics interaction config
    const finalInteractionConfig = useMemo<Partial<PhysicsInteractionOptions>>(() => {
        const baseOptions: Partial<PhysicsInteractionOptions> = {
            affectsScale: true,
            scaleAmplitude: 0.05, // Default scale amplitude for this component
        };

        let contextResolvedConfig: Partial<SpringConfig> = {};
        if (typeof animationConfig === 'string' && animationConfig in SpringPresets) {
            contextResolvedConfig = SpringPresets[animationConfig as keyof typeof SpringPresets];
        } else if (typeof animationConfig === 'object' && animationConfig !== null) {
            contextResolvedConfig = animationConfig;
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
    }, [animationConfig, motionSensitivity]);

    // Apply physics interaction hook with calculated config
    const {
      ref: physicsRef,
      style: physicsStyle,
    } = usePhysicsInteraction<HTMLButtonElement>(usePhysics ? finalInteractionConfig : { reducedMotion: true });

    // Use mergePhysicsRef utility for proper ref handling
    const combinedRef = mergePhysicsRef(ref, physicsRef);
    
    // Use effect to call registerElement when the element is available
    useEffect(() => {
      // Check if combinedRef is a RefObject
      if (combinedRef && 'current' in combinedRef && combinedRef.current && registerElement) {
        registerElement(combinedRef.current);
        // Cleanup when unmounted
        return () => {
          registerElement(null);
        };
      }
    }, [combinedRef, registerElement]);

    return (
      <ActionButton
        ref={combinedRef}
        onClick={onClick}
        type="button"
        className={className}
        style={physicsStyle}
        disabled={disabled}
        $selected={selected}
        $showLabel={showLabel || selected}
        $color={color}
        $size={size}
        $disabled={disabled}
        {...rest}
      >
        {icon && <span className="action-icon">{icon}</span>}
        {(showLabel || selected) && <span className="action-label">{label}</span>}
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
