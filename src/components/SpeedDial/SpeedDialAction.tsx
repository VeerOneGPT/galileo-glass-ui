/**
 * SpeedDialAction Component
 *
 * An action button for the SpeedDial component.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
      transform: ${props.$visible ? 'scale(1.1)' : 'scale(0.5)'};
    }
    
    &:active {
      transform: ${props.$visible ? 'scale(1.05)' : 'scale(0.5)'};
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
function SpeedDialActionComponent(
  props: SpeedDialActionProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    className,
    style,
    icon,
    tooltipTitle,
    disabled = false,
    onClick,
    glass = false,
    index,
    totalActions,
    direction,
    transition = true,
    showTooltip = true,
    size = 'medium',
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Calculate position
  const position = getPosition(direction, index, totalActions, size);

  // Whether the action is visible
  const visible = true; // This would be controlled by parent

  return (
    <ActionRoot
      ref={ref}
      className={className}
      style={style}
      onClick={disabled ? undefined : onClick}
      $position={position}
      $visible={visible}
      $glass={glass}
      $disabled={disabled}
      $size={size}
      $direction={direction}
      $index={index}
      $totalActions={totalActions}
      $transition={transition}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      {icon}

      {tooltipTitle && (
        <TooltipWrapper
          $direction={direction}
          $visible={visible}
          $showTooltip={showTooltip}
          $reducedMotion={prefersReducedMotion}
        >
          {tooltipTitle}
        </TooltipWrapper>
      )}
    </ActionRoot>
  );
}

/**
 * SpeedDialAction Component
 *
 * An action button for the SpeedDial component.
 */
const SpeedDialAction = forwardRef(SpeedDialActionComponent);

export default SpeedDialAction;
