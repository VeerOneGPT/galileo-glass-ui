/**
 * SpeedDialIcon Component
 *
 * An icon component for the SpeedDial that transitions between open and closed states.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';

import { SpeedDialIconProps } from './types';

// Default icons
const DefaultIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
  </svg>
);

const DefaultOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13H5V11H19V13Z" fill="currentColor" />
  </svg>
);

// Styled components
const IconRoot = styled.div<{
  $open: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: ${props => (!props.$reducedMotion ? 'transform 0.2s' : 'none')};
  transform: ${props => (props.$open ? 'rotate(45deg)' : 'rotate(0deg)')};
`;

const IconContainer = styled.div<{
  $open: boolean;
  $reducedMotion: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const IconWrapper = styled.div<{
  $open: boolean;
  $isOpenIcon: boolean;
  $reducedMotion: boolean;
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${props => (!props.$reducedMotion ? 'opacity 0.2s, transform 0.2s' : 'none')};
  opacity: ${props =>
    (props.$open && props.$isOpenIcon) || (!props.$open && !props.$isOpenIcon) ? 1 : 0};
  transform: ${props =>
    (props.$open && props.$isOpenIcon) || (!props.$open && !props.$isOpenIcon)
      ? 'scale(1)'
      : 'scale(0.5)'};
`;

/**
 * SpeedDialIcon Component Implementation
 */
function SpeedDialIconComponent(
  props: SpeedDialIconProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const { className, style, icon, openIcon, open = false, ...rest } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Default icons
  const iconToShow = icon || <DefaultIcon />;
  const openIconToShow = openIcon || <DefaultOpenIcon />;

  // If only using one icon, rotate it
  if (!openIcon && !Object.prototype.hasOwnProperty.call(props, 'openIcon')) {
    return (
      <IconRoot
        ref={ref}
        className={className}
        style={style}
        $open={open}
        $reducedMotion={prefersReducedMotion}
        {...rest}
      >
        {iconToShow}
      </IconRoot>
    );
  }

  // Using two separate icons for open/closed states
  return (
    <IconContainer
      ref={ref}
      className={className}
      style={style}
      $open={open}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      <IconWrapper $open={open} $isOpenIcon={false} $reducedMotion={prefersReducedMotion}>
        {iconToShow}
      </IconWrapper>
      <IconWrapper $open={open} $isOpenIcon={true} $reducedMotion={prefersReducedMotion}>
        {openIconToShow}
      </IconWrapper>
    </IconContainer>
  );
}

/**
 * SpeedDialIcon Component
 *
 * An icon component for the SpeedDial that transitions between open and closed states.
 */
const SpeedDialIcon = forwardRef(SpeedDialIconComponent);

export default SpeedDialIcon;
