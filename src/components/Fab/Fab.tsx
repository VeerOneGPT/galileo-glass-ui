import React, { forwardRef, useState, useEffect, useMemo, useCallback } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { createThemeContext } from '../../core/themeContext';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { scaleUp } from '../../animations/keyframes/basic';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useEnhancedReducedMotion } from '../../hooks/useEnhancedReducedMotion';
import { AnimationProps } from '../../animations/types';
import { useGalileoStateSpring } from '../../hooks/useGalileoStateSpring';
import { AnimationCategory } from '../../types/accessibility';

export interface FabProps extends AnimationProps {
  /**
   * The content of the button
   */
  children: React.ReactNode;

  /**
   * The color of the button
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';

  /**
   * If true, the button will be disabled
   */
  disabled?: boolean;

  /**
   * The URL to link to when the button is clicked
   */
  href?: string;

  /**
   * The size of the button
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * The variant of the button
   */
  variant?: 'standard' | 'extended' | 'glass';

  /**
   * Callback fired when the button is clicked
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;

  /**
   * The position of the FAB (fixed positioning options)
   */
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft' | 'center' | 'none';

  /**
   * Tooltip text for the FAB
   */
  tooltip?: string;

  /**
   * If true, the FAB will show a pulse animation
   */
  pulse?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * If true, glass glow effect will be more intense
   */
  enhanced?: boolean;

  /**
   * Z-index for the FAB
   */
  zIndex?: number;

  /**
   * Type of the button
   */
  type?: 'button' | 'submit' | 'reset';

  /** Controls visibility for entrance/exit animation */
  isVisible?: boolean;

  /** Additional style properties */
  style?: React.CSSProperties;

  /** Prop for disabling animation */
  disableAnimation?: boolean;
}

// Get color by name
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
      return '#1F2937'; // default dark gray
  }
};

// Get size values
const getSizeValues = (size: string, variant: string) => {
  const isExtended = variant === 'extended';

  switch (size) {
    case 'small':
      return {
        width: isExtended ? 'auto' : '40px',
        height: '40px',
        padding: isExtended ? '8px 12px' : '0',
        fontSize: '1.25rem',
      };
    case 'large':
      return {
        width: isExtended ? 'auto' : '64px',
        height: '64px',
        padding: isExtended ? '12px 20px' : '0',
        fontSize: '1.75rem',
      };
    default: // medium
      return {
        width: isExtended ? 'auto' : '56px',
        height: '56px',
        padding: isExtended ? '10px 16px' : '0',
        fontSize: '1.5rem',
      };
  }
};

// Get position styles
const getPositionStyles = (position: string) => {
  if (position === 'none') return '';

  const base = css`
    position: fixed;
  `;

  switch (position) {
    case 'bottomRight':
      return css`
        ${base}
        bottom: 16px;
        right: 16px;
      `;
    case 'bottomLeft':
      return css`
        ${base}
        bottom: 16px;
        left: 16px;
      `;
    case 'topRight':
      return css`
        ${base}
        top: 16px;
        right: 16px;
      `;
    case 'topLeft':
      return css`
        ${base}
        top: 16px;
        left: 16px;
      `;
    case 'center':
      return css`
        ${base}
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
    default:
      return '';
  }
};

// Keyframes for pulse animation
const pulse = css`
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
    }
  }
`;

// Styled components
const FabContainer = styled.button<{
  $color: string;
  $size: string;
  $variant: string;
  $position: string;
  $pulse: boolean;
  $enhanced: boolean;
  $zIndex: number;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${props => (props.$variant === 'extended' ? '28px' : '50%')};
  cursor: pointer;
  outline: none;
  user-select: none;
  z-index: ${props => props.$zIndex};
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  box-sizing: border-box;

  /* Size styles */
  ${props => {
    const { width, height, padding, fontSize } = getSizeValues(props.$size, props.$variant);
    return css`
      width: ${width};
      height: ${height};
      padding: ${padding};
      font-size: ${fontSize};
    `;
  }}

  /* Position styles */
  ${props => getPositionStyles(props.$position)}
  
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

    // standard or extended
    return css`
      background-color: ${getColorByName(props.$color)};
      color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    `;
  }}
  
  /* Glass effect for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassSurface({
      elevation: 3,
      blurStrength: 'enhanced',
      backgroundOpacity: 'medium',
      borderOpacity: 'subtle',
      themeContext: createThemeContext({}),
    })}
  
  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    glassGlow({
      intensity: props.$enhanced ? 'high' : 'medium',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Edge highlight for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    edgeHighlight({
      thickness: 1,
      opacity: 0.6,
      position: 'all',
      themeContext: createThemeContext({}),
    })}
  
  /* Pulse animation */
  ${pulse}
  ${props =>
    props.$pulse &&
    css`
      animation: pulse 1.5s infinite;
    `}
  
  /* Disabled state */
  &:disabled {
    ${props =>
      props.$variant === 'glass'
        ? css`
            background-color: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.4);
          `
        : css`
            background-color: #e2e8f0;
            color: #94a3b8;
            box-shadow: none;
          `}
    cursor: not-allowed;
  }
`;

// Tooltip component
const Tooltip = styled.span`
  position: absolute;
  background-color: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  z-index: 1;

  /* Position based on parent position */
  ${props => {
    const parent = props.className;
    if (parent === 'bottomRight' || parent === 'bottomLeft') {
      return css`
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    if (parent === 'topRight' || parent === 'topLeft') {
      return css`
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
      `;
    }
    return css`
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
    `;
  }}
`;

// Wrapper component to handle tooltip
const FabWrapper = styled.div<{
  $position: string;
}>`
  position: ${props => (props.$position === 'none' ? 'relative' : 'static')};
  display: inline-block;

  &:hover ${Tooltip} {
    opacity: 1;
    visibility: visible;
  }
`;

/**
 * Fab Component
 *
 * A floating action button (FAB) performs the primary action in an application.
 */
export const Fab = forwardRef<HTMLButtonElement | HTMLAnchorElement, FabProps>((props, ref) => {
  const {
    children,
    color = 'primary',
    disabled = false,
    href,
    size = 'medium',
    variant = 'standard',
    onClick,
    position = 'bottomRight',
    tooltip,
    pulse = false,
    className,
    enhanced = false,
    zIndex = 1050,
    type = 'button',
    isVisible = true,
    animationConfig,
    disableAnimation,
    style,
    ...rest
  } = props;

  const theme = useTheme() || {};
  const themeContext = createThemeContext(theme);

  const { defaultSpring } = useAnimationContext();
  const isReducedMotionSystem = useReducedMotion();
  
  // Get only prefersReducedMotion from the enhanced hook
  const { prefersReducedMotion } = useEnhancedReducedMotion();

  // Memoize the final disable animation state
  const finalDisableAnimation = useMemo(() => {
    return disableAnimation ?? isReducedMotionSystem;
  }, [disableAnimation, isReducedMotionSystem]);

  // Memoize the alternative animation decision - now just based on prefersReducedMotion
  const useAlternativeAnimation = useMemo(() => {
    return prefersReducedMotion;
  }, [prefersReducedMotion]);

  // --- Physics Interaction Setup ---
  const finalInteractionConfig = useMemo<Partial<PhysicsInteractionOptions>>(() => {
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
            propResolvedConfig = { ...configProp } as Partial<PhysicsInteractionOptions>;
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
        if ('strength' in configProp && typeof configProp.strength === 'number') propResolvedConfig.strength = configProp.strength;
        if ('radius' in configProp && typeof configProp.radius === 'number') propResolvedConfig.radius = configProp.radius;
        if ('affectsRotation' in configProp && typeof configProp.affectsRotation === 'boolean') propResolvedConfig.affectsRotation = configProp.affectsRotation;
        if ('affectsScale' in configProp && typeof configProp.affectsScale === 'boolean') propResolvedConfig.affectsScale = configProp.affectsScale;
        if ('rotationAmplitude' in configProp && typeof configProp.rotationAmplitude === 'number') propResolvedConfig.rotationAmplitude = configProp.rotationAmplitude;
        if ('scaleAmplitude' in configProp && typeof configProp.scaleAmplitude === 'number') propResolvedConfig.scaleAmplitude = configProp.scaleAmplitude;
    }

    const finalStiffness = propResolvedConfig.stiffness ?? contextResolvedConfig.tension ?? baseOptions.stiffness;
    const calculatedMass = propResolvedConfig.mass ?? contextResolvedConfig.mass ?? baseOptions.mass ?? 1;
    const finalDampingRatio = propResolvedConfig.dampingRatio ?? 
                              (contextResolvedConfig.friction ? contextResolvedConfig.friction / (2 * Math.sqrt((finalStiffness ?? baseOptions.stiffness ?? 170) * calculatedMass)) : baseOptions.dampingRatio);
    const finalMass = calculatedMass;
    
    return {
        ...baseOptions,
        stiffness: finalStiffness,
        dampingRatio: finalDampingRatio,
        mass: finalMass,
        ...(propResolvedConfig.strength !== undefined && { strength: propResolvedConfig.strength }),
        ...(propResolvedConfig.radius !== undefined && { radius: propResolvedConfig.radius }),
        ...(propResolvedConfig.affectsRotation !== undefined && { affectsRotation: propResolvedConfig.affectsRotation }),
        ...(propResolvedConfig.affectsScale !== undefined && { affectsScale: propResolvedConfig.affectsScale }),
        ...(propResolvedConfig.rotationAmplitude !== undefined && { rotationAmplitude: propResolvedConfig.rotationAmplitude }),
        ...(propResolvedConfig.scaleAmplitude !== undefined && { scaleAmplitude: propResolvedConfig.scaleAmplitude }),
    };

  }, [defaultSpring, animationConfig]);

  const {
    ref: physicsRef,
    style: physicsStyle,
  } = usePhysicsInteraction<HTMLElement>(finalInteractionConfig);
  // --- End Physics Interaction Setup --- 

  // --- Visibility Animation Setup ---
  // Memoize entrance config with proper dependencies
  const finalEntranceConfig = useMemo(() => {
      const baseConfig = SpringPresets.DEFAULT;
      let contextResolvedConfig: Partial<SpringConfig> = {};
      if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
        contextResolvedConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
      } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
        contextResolvedConfig = defaultSpring;
      }
      let propResolvedConfig: Partial<SpringConfig> = {};
      const configProp = animationConfig;
      if (typeof configProp === 'string' && configProp in SpringPresets) {
        propResolvedConfig = SpringPresets[configProp as keyof typeof SpringPresets];
      } else if (typeof configProp === 'object' && configProp !== null) {
         if ('tension' in configProp || 'friction' in configProp) {
            propResolvedConfig = configProp as Partial<SpringConfig>;
         }
      }
      return { ...baseConfig, ...contextResolvedConfig, ...propResolvedConfig };
  }, [defaultSpring, animationConfig]);

  // State to track if the element should be rendered (for exit animation)
  const [shouldRender, setShouldRender] = useState(isVisible);
  
  // Callback for onRest, memoized
  const onSpringRest = useCallback((result: { finished: boolean }) => {
      // Use isVisible prop directly
      if (!isVisible && result.finished) {
          setShouldRender(false);
      }
  }, [isVisible, setShouldRender]); // Dependencies: isVisible prop and stable setter

  // Memoize the entire spring configuration object
  const visibilitySpringConfig = useMemo(() => ({
      ...finalEntranceConfig, // Already memoized
      immediate: finalDisableAnimation || useAlternativeAnimation, // Derived memoized values
      category: AnimationCategory.TRANSITION,
      onRest: onSpringRest, // Use the memoized callback
  }), [
      finalEntranceConfig,
      finalDisableAnimation,
      useAlternativeAnimation,
      onSpringRest
  ]);

  // Use Galileo Spring for entrance/exit animation if not using alternative
  const { value: visibilityProgress, isAnimating: isVisibilityAnimating } = useGalileoStateSpring(
    isVisible ? 1 : 0, 
    visibilitySpringConfig // Pass the fully memoized config object
  );

  // Update render state when isVisible changes
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  // --- Style Calculation --- 
  const combinedStyle = useMemo(() => {
    let baseStyle = { ...style };
    let visibilityStyle: React.CSSProperties = {};

    if (useAlternativeAnimation) {
      visibilityStyle = {
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
        pointerEvents: isVisible ? 'auto' : 'none',
      };
    } else {
      const opacity = visibilityProgress;
      const scale = 0.5 + visibilityProgress * 0.5;
      const translateY = 20 - visibilityProgress * 20;

      visibilityStyle = {
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        pointerEvents: (isVisible || isVisibilityAnimating) ? 'auto' : 'none',
      };
    }

    return {
      ...baseStyle,
      ...visibilityStyle,
      ...(isVisible || (!useAlternativeAnimation && isVisibilityAnimating) ? physicsStyle : {}),
      willChange: (isVisible || isVisibilityAnimating) ? 'transform, opacity' : undefined,
    };
  }, [
    visibilityProgress, 
    physicsStyle, 
    isVisible, 
    isVisibilityAnimating, 
    useAlternativeAnimation, 
    style
  ]);

  const Component = href ? 'a' : 'button';

  const fabButton = (
    <FabContainer
      as={Component}
      ref={ref as any}
      href={href}
      disabled={disabled}
      onClick={onClick}
      type={href ? undefined : type}
      className={className}
      $color={color}
      $size={size}
      $variant={variant}
      $position={position}
      $pulse={pulse}
      $enhanced={enhanced}
      $zIndex={zIndex}
      style={combinedStyle}
    >
      {children}
    </FabContainer>
  );

  // --- Conditional Rendering Logic ---
  if (!shouldRender) {
    return null;
  }

  if (!tooltip) {
    return fabButton;
  }

  return (
    <FabWrapper $position={position}>
      {fabButton}
      <Tooltip className={position}>{tooltip}</Tooltip>
    </FabWrapper>
  );
});

Fab.displayName = 'Fab';

/**
 * GlassFab Component
 *
 * A floating action button with glass morphism styling.
 */
export const GlassFab = forwardRef<HTMLButtonElement, FabProps>((props, ref) => {
  const { className, variant = 'glass', ...rest } = props;

  return <Fab ref={ref} className={`glass-fab ${className || ''}`} variant={variant} {...rest} />;
});

GlassFab.displayName = 'GlassFab';

export default Fab;
