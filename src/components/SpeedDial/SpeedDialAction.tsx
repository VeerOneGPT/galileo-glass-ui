/**
 * SpeedDialAction Component
 *
 * An action button for the SpeedDial component.
 */
import React, { forwardRef, useCallback, useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { usePhysicsInteraction, PhysicsInteractionOptions } from '../../hooks/usePhysicsInteraction';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';

import { SpeedDialActionProps } from './types';

// Calculate the position based on direction
const getPosition = (
  direction: 'up' | 'down' | 'left' | 'right',
  index: number,
  totalActions: number,
  size: 'small' | 'medium' | 'large'
): { top?: string; right?: string; bottom?: string; left?: string } => {
  // Base spacing between buttons
  const spacing = size === 'small' ? 40 : size === 'large' ? 65 : 55;
  const offset = (index + 1) * spacing;

  switch (direction) {
    case 'up':
      return { bottom: `${offset}px` };
    case 'down':
      return { top: `${offset}px` };
    case 'left':
      return { right: `${offset}px` };
    case 'right':
      return { left: `${offset}px` };
    default:
      return { top: `${offset}px` };
  }
};

// Calculate the transition delay based on index and total actions
const getTransitionDelay = (index: number, totalActions: number, opening: boolean): number => {
  if (!opening) {
    // When closing, reverse the order
    return (totalActions - 1 - index) * 30;
  }
  return index * 30;
};

// Styled components
const ActionRoot = styled.div<{
  $position: { top?: string; right?: string; bottom?: string; left?: string };
  $visible: boolean;
  $glass: boolean;
  $disabled: boolean;
  $size: 'small' | 'medium' | 'large';
  $direction: 'up' | 'down' | 'left' | 'right';
  $index: number;
  $totalActions: number;
  $transition: boolean;
  $reducedMotion: boolean;
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.$totalActions - props.$index};
  width: ${props => (props.$size === 'small' ? '32px' : props.$size === 'large' ? '48px' : '40px')};
  height: ${props =>
    props.$size === 'small' ? '32px' : props.$size === 'large' ? '48px' : '40px'};
  border-radius: 50%;
  background-color: ${props => (props.$glass ? 'rgba(36, 36, 36, 0.5)' : 'rgba(36, 36, 36, 0.85)')};
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'scale(1)' : 'scale(0.5)')};
  ${props => props.$position.top !== undefined && `top: ${props.$position.top};`}
  ${props => props.$position.right !== undefined && `right: ${props.$position.right};`}
  ${props => props.$position.bottom !== undefined && `bottom: ${props.$position.bottom};`}
  ${props => props.$position.left !== undefined && `left: ${props.$position.left};`}
  
  /* Glass styling */
  ${props =>
    props.$glass &&
    glassSurface({
      elevation: 2,
      blurStrength: 'light',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.theme),
    })}
  
  /* Transitions */
  ${props =>
    props.$transition &&
    !props.$reducedMotion &&
    `
    transition-property: transform, opacity;
    transition-duration: 0.2s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: ${getTransitionDelay(props.$index, props.$totalActions, props.$visible)}ms;
  `}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: ${props.$visible ? 0.5 : 0};
    pointer-events: none;
  `}
  
  /* Hover effects */
  ${props =>
    !props.$disabled &&
    `
    &:hover {
      background-color: ${props.$glass ? 'rgba(48, 48, 48, 0.5)' : 'rgba(48, 48, 48, 0.85)'};
    }
  `}
`;

const TooltipWrapper = styled.div<{
  $direction: 'up' | 'down' | 'left' | 'right';
  $visible: boolean;
  $showTooltip: boolean;
  $reducedMotion: boolean;
}>`
  position: absolute;
  pointer-events: none;
  background-color: rgba(36, 36, 36, 0.85);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: ${props => (!props.$reducedMotion ? 'opacity 0.2s, transform 0.2s' : 'none')};
  opacity: ${props => (props.$visible && props.$showTooltip ? 1 : 0)};

  /* Position the tooltip based on the direction */
  ${props => {
    switch (props.$direction) {
      case 'up':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(${
            props.$visible && props.$showTooltip ? '-8px' : '0'
          });
          margin-bottom: 4px;
        `;
      case 'down':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(${
            props.$visible && props.$showTooltip ? '8px' : '0'
          });
          margin-top: 4px;
        `;
      case 'left':
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(${
            props.$visible && props.$showTooltip ? '-8px' : '0'
          });
          margin-right: 4px;
        `;
      case 'right':
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%) translateX(${
            props.$visible && props.$showTooltip ? '8px' : '0'
          });
          margin-left: 4px;
        `;
      default:
        return '';
    }
  }}

  /* Tooltip arrow */
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 4px solid transparent;

    ${props => {
      switch (props.$direction) {
        case 'up':
          return `
            top: 100%;
            left: 50%;
            margin-left: -4px;
            border-top-color: rgba(36, 36, 36, 0.85);
          `;
        case 'down':
          return `
            bottom: 100%;
            left: 50%;
            margin-left: -4px;
            border-bottom-color: rgba(36, 36, 36, 0.85);
          `;
        case 'left':
          return `
            left: 100%;
            top: 50%;
            margin-top: -4px;
            border-left-color: rgba(36, 36, 36, 0.85);
          `;
        case 'right':
          return `
            right: 100%;
            top: 50%;
            margin-top: -4px;
            border-right-color: rgba(36, 36, 36, 0.85);
          `;
        default:
          return '';
      }
    }}
  }
`;

/**
 * SpeedDialAction Component Implementation
 */
const SpeedDialActionComponent = (
  props: SpeedDialActionProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    className,
    style,
    icon,
    tooltipTitle,
    disabled = false,
    onClick,
    glass = false,
    index = 0,
    totalActions = 1,
    direction = 'up',
    transition = true,
    showTooltip = true,
    size = 'medium',
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const theme = useTheme();

  const prefersReducedMotion = useReducedMotion();
  const { defaultSpring } = useAnimationContext();
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
  const usePhysics = !finalDisableAnimation && !disabled;

  // Calculate final physics interaction config
  const finalInteractionConfig = useMemo<Partial<PhysicsInteractionOptions>>(() => {
    const baseOptions: Partial<PhysicsInteractionOptions> = {
      affectsScale: true,
      scaleAmplitude: 0.1, // Default scale amplitude for this component
    };
    
    let contextResolvedConfig: Partial<SpringConfig> = {};
    if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
      contextResolvedConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
    } else if (typeof defaultSpring === 'object' && defaultSpring !== null) {
      contextResolvedConfig = defaultSpring;
    }
    
    let propResolvedConfig: Partial<PhysicsInteractionOptions> = {}; // Use PhysicsInteractionOptions here
    const configProp = animationConfig;
    if (typeof configProp === 'string' && configProp in SpringPresets) {
      const preset = SpringPresets[configProp as keyof typeof SpringPresets];
      propResolvedConfig = { stiffness: preset.tension, dampingRatio: preset.friction ? preset.friction / (2 * Math.sqrt(preset.tension * (preset.mass ?? 1))) : undefined, mass: preset.mass };
    } else if (typeof configProp === 'object' && configProp !== null) {
        // Check if it looks like PhysicsInteractionOptions first
        if ('stiffness' in configProp || 'dampingRatio' in configProp || 'mass' in configProp || 'scaleAmplitude' in configProp || 'rotationAmplitude' in configProp) {
           propResolvedConfig = configProp as Partial<PhysicsInteractionOptions>;
        } 
        // Fallback to checking if it looks like SpringConfig
        else if ('tension' in configProp || 'friction' in configProp) {
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

    // Merge all options: Prop Config > Base Options > Context Config > Hardcoded Base
    return {
      ...baseOptions, // Start with base scale/rotation settings derived from props
      stiffness: finalStiffness,
      dampingRatio: finalDampingRatio,
      mass: finalMass,
      // Explicitly apply overrides from propResolvedConfig if they exist
      ...(propResolvedConfig.scaleAmplitude !== undefined && { scaleAmplitude: propResolvedConfig.scaleAmplitude }),
      ...(propResolvedConfig.rotationAmplitude !== undefined && { rotationAmplitude: propResolvedConfig.rotationAmplitude }),
      ...(propResolvedConfig.strength !== undefined && { strength: propResolvedConfig.strength }),
      ...(propResolvedConfig.radius !== undefined && { radius: propResolvedConfig.radius }),
      ...(propResolvedConfig.affectsRotation !== undefined && { affectsRotation: propResolvedConfig.affectsRotation }),
      ...(propResolvedConfig.affectsScale !== undefined && { affectsScale: propResolvedConfig.affectsScale }),
      ...(motionSensitivity && { motionSensitivityLevel: motionSensitivity }),
    };
  }, [defaultSpring, animationConfig, motionSensitivity]);

  const {
    ref: physicsRef,
    style: physicsStyle,
  } = usePhysicsInteraction<HTMLDivElement>(finalInteractionConfig);

  const position = getPosition(direction, index, totalActions, size);

  const visible = true;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!disabled && onClick) {
      onClick(event);
    }
  };

  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    (physicsRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref, physicsRef]);

  return (
    <ActionRoot
      ref={combinedRef}
      className={className}
      style={{ ...style, ...physicsStyle }}
      onClick={handleClick}
      $position={position}
      $visible={visible}
      $glass={glass}
      $disabled={disabled}
      $size={size}
      $direction={direction}
      $index={index}
      $totalActions={totalActions}
      $transition={transition}
      $reducedMotion={finalDisableAnimation}
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      {...rest}
    >
      {icon}

      {tooltipTitle && (
        <TooltipWrapper
          $direction={direction}
          $visible={visible}
          $showTooltip={showTooltip}
          $reducedMotion={finalDisableAnimation}
        >
          {tooltipTitle}
        </TooltipWrapper>
      )}
    </ActionRoot>
  );
};

/**
 * SpeedDialAction Component
 *
 * An action button for the SpeedDial component.
 */
const SpeedDialAction = forwardRef(SpeedDialActionComponent);
SpeedDialAction.displayName = 'SpeedDialAction';

export default SpeedDialAction;
