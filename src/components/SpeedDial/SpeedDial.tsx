/**
 * Glass SpeedDial Component
 *
 * A floating action button that expands to show multiple actions.
 */
import React, { forwardRef, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import SpeedDialAction from './SpeedDialAction';
import SpeedDialIcon from './SpeedDialIcon';
import { SpeedDialProps, SpeedDialActionProps } from './types';

// Get color values based on theme color
const getColorValues = (color: string): { bg: string; hover: string; active: string } => {
  switch (color) {
    case 'primary':
      return {
        bg: 'rgba(99, 102, 241, 0.9)',
        hover: 'rgba(79, 82, 221, 0.9)',
        active: 'rgba(69, 72, 211, 0.9)',
      };
    case 'secondary':
      return {
        bg: 'rgba(156, 39, 176, 0.9)',
        hover: 'rgba(136, 19, 156, 0.9)',
        active: 'rgba(116, 9, 136, 0.9)',
      };
    case 'error':
      return {
        bg: 'rgba(240, 82, 82, 0.9)',
        hover: 'rgba(220, 62, 62, 0.9)',
        active: 'rgba(200, 42, 42, 0.9)',
      };
    case 'info':
      return {
        bg: 'rgba(3, 169, 244, 0.9)',
        hover: 'rgba(0, 149, 224, 0.9)',
        active: 'rgba(0, 129, 204, 0.9)',
      };
    case 'success':
      return {
        bg: 'rgba(76, 175, 80, 0.9)',
        hover: 'rgba(56, 155, 60, 0.9)',
        active: 'rgba(36, 135, 40, 0.9)',
      };
    case 'warning':
      return {
        bg: 'rgba(255, 152, 0, 0.9)',
        hover: 'rgba(235, 132, 0, 0.9)',
        active: 'rgba(215, 112, 0, 0.9)',
      };
    case 'default':
    default:
      return {
        bg: 'rgba(36, 36, 36, 0.85)',
        hover: 'rgba(48, 48, 48, 0.85)',
        active: 'rgba(60, 60, 60, 0.85)',
      };
  }
};

// Styled components
const SpeedDialRoot = styled.div<{
  $position: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
}>`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;

  /* Position */
  ${props =>
    props.$position.top !== undefined &&
    `top: ${
      typeof props.$position.top === 'number' ? `${props.$position.top}px` : props.$position.top
    };`}
  ${props =>
    props.$position.right !== undefined &&
    `right: ${
      typeof props.$position.right === 'number'
        ? `${props.$position.right}px`
        : props.$position.right
    };`}
  ${props =>
    props.$position.bottom !== undefined &&
    `bottom: ${
      typeof props.$position.bottom === 'number'
        ? `${props.$position.bottom}px`
        : props.$position.bottom
    };`}
  ${props =>
    props.$position.left !== undefined &&
    `left: ${
      typeof props.$position.left === 'number' ? `${props.$position.left}px` : props.$position.left
    };`}
`;

const SpeedDialContainer = styled.div<{
  $direction: 'up' | 'down' | 'left' | 'right';
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpeedDialFab = styled.div<{
  $open: boolean;
  $glass: boolean;
  $disabled: boolean;
  $size: 'small' | 'medium' | 'large';
  $color: string;
  $colorValues: { bg: string; hover: string; active: string };
  $reducedMotion: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  width: ${props => (props.$size === 'small' ? '40px' : props.$size === 'large' ? '64px' : '56px')};
  height: ${props =>
    props.$size === 'small' ? '40px' : props.$size === 'large' ? '64px' : '56px'};
  border-radius: 50%;
  background-color: ${props => (props.$glass ? 'rgba(36, 36, 36, 0.5)' : props.$colorValues.bg)};
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
  transition: ${props =>
    !props.$reducedMotion ? 'background-color 0.2s, box-shadow 0.2s, transform 0.2s' : 'none'};

  /* Glass styling */
  ${props =>
    props.$glass &&
    glassSurface({
      elevation: 3,
      blurStrength: 'standard',
      borderOpacity: 'medium',
      themeContext: createThemeContext(props.theme),
    })}

  /* Open state */
  ${props =>
    props.$open &&
    `
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  `}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: 0.6;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  `}
  
  /* Hover effects */
  ${props =>
    !props.$disabled &&
    `
    &:hover {
      background-color: ${props.$glass ? 'rgba(48, 48, 48, 0.5)' : props.$colorValues.hover};
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
    }
    
    &:active {
      background-color: ${props.$glass ? 'rgba(60, 60, 60, 0.5)' : props.$colorValues.active};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: scale(0.98);
    }
  `}
`;

const ActionsContainer = styled.div<{
  $open: boolean;
  $direction: 'up' | 'down' | 'left' | 'right';
}>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: ${props => (props.$open ? 'auto' : 'none')};
`;

const Backdrop = styled.div<{
  $open: boolean;
  $reducedMotion: boolean;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  pointer-events: ${props => (props.$open ? 'auto' : 'none')};
  opacity: ${props => (props.$open ? 1 : 0)};
  transition: ${props => (!props.$reducedMotion ? 'opacity 0.2s' : 'none')};
  z-index: 1040;
`;

/**
 * SpeedDial Component Implementation
 */
function SpeedDialComponent(props: SpeedDialProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    className,
    style,
    icon,
    children,
    defaultOpen = false,
    open: controlledOpen,
    direction = 'up',
    disabled = false,
    onOpen,
    onClose,
    onActionClick,
    hideOnScroll = false,
    position = { bottom: 16, right: 16 },
    size = 'medium',
    color = 'default',
    glass = false,
    glassActions = false,
    showTooltips = true,
    ariaLabel,
    transition = true,
    ...rest
  } = props;

  // Refs
  const rootRef = useRef<HTMLDivElement>(null);

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // State for uncontrolled component
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [visible, setVisible] = useState(true);

  // Determine if component is controlled
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Get color values
  const colorValues = useMemo(() => getColorValues(color), [color]);

  // Toggle open state
  const toggle = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      const newOpen = !open;

      if (!isControlled) {
        setInternalOpen(newOpen);
      }

      if (newOpen && onOpen) {
        onOpen(event);
      } else if (!newOpen && onClose) {
        onClose(event);
      }
    },
    [disabled, open, isControlled, onOpen, onClose]
  );

  // Handle action click
  const handleActionClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, actionName: string) => {
      if (onActionClick) {
        onActionClick(event, actionName);
      }

      // Close the speed dial after an action is clicked
      if (!isControlled) {
        setInternalOpen(false);
      }

      if (onClose) {
        onClose(event);
      }
    },
    [isControlled, onClose, onActionClick]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isControlled) {
        setInternalOpen(false);
      }

      if (onClose) {
        onClose(event);
      }
    },
    [isControlled, onClose]
  );

  // Hide on scroll
  useEffect(() => {
    if (!hideOnScroll) return;

    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let scrollTimer: number | undefined;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop + 10) {
        // Scrolling down
        setVisible(false);

        // Close the speed dial
        if (open && !isControlled) {
          setInternalOpen(false);
        }
      } else if (scrollTop < lastScrollTop - 10) {
        // Scrolling up
        setVisible(true);
      }

      lastScrollTop = scrollTop;

      // Clear the previous timer
      if (scrollTimer) {
        window.clearTimeout(scrollTimer);
      }

      // Set a new timer to show the speed dial after scrolling stops
      scrollTimer = window.setTimeout(() => {
        setVisible(true);
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        window.clearTimeout(scrollTimer);
      }
    };
  }, [hideOnScroll, open, isControlled]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        if (!isControlled) {
          setInternalOpen(false);
        }

        if (onClose) {
          onClose(event as unknown as React.KeyboardEvent<HTMLDivElement>);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isControlled, onClose]);

  return (
    <>
      {/* Backdrop */}
      <Backdrop $open={open} $reducedMotion={prefersReducedMotion} onClick={handleBackdropClick} />

      {/* SpeedDial */}
      <SpeedDialRoot
        ref={rootRef}
        className={className}
        style={{
          ...style,
          ...(!visible ? { transform: 'scale(0)', opacity: 0 } : {}),
          transition: !prefersReducedMotion ? 'transform 0.2s, opacity 0.2s' : 'none',
        }}
        $position={position}
        {...rest}
      >
        <SpeedDialContainer $direction={direction}>
          {/* Actions */}
          <ActionsContainer $open={open} $direction={direction}>
            {React.Children.toArray(children).map((child, index) => {
              // Check if the action is a valid React element before rendering
              if (!React.isValidElement(child)) {
                console.warn('Invalid element passed as child to SpeedDial:', child);
                return null;
              }

              // Extract props from the valid element
              const actionProps = child.props as SpeedDialActionProps;

              return (
                <SpeedDialAction
                  key={child.key || index}
                  {...actionProps}
                  onClick={event => handleActionClick(event, actionProps.tooltipTitle || `action-${index}`)}
                  glass={glassActions}
                  index={index}
                  totalActions={React.Children.count(children)}
                  direction={direction}
                  transition={transition}
                  showTooltip={showTooltips}
                  size={size}
                />
              );
            })}
          </ActionsContainer>

          {/* Main button */}
          <SpeedDialFab
            ref={ref}
            onClick={toggle}
            aria-label={ariaLabel}
            aria-expanded={open}
            aria-haspopup="true"
            $open={open}
            $glass={glass}
            $disabled={disabled}
            $size={size}
            $color={color}
            $colorValues={colorValues}
            $reducedMotion={prefersReducedMotion}
          >
            <SpeedDialIcon icon={icon} open={open} />
          </SpeedDialFab>
        </SpeedDialContainer>
      </SpeedDialRoot>
    </>
  );
}

/**
 * SpeedDial Component
 *
 * A floating action button that expands to show multiple actions.
 */
const SpeedDial = forwardRef(SpeedDialComponent);

/**
 * GlassSpeedDial Component
 *
 * Glass variant of the SpeedDial component.
 */
const GlassSpeedDial = forwardRef<HTMLDivElement, SpeedDialProps>((props, ref) => (
  <SpeedDial {...props} glass={true} glassActions={true} ref={ref} />
));

GlassSpeedDial.displayName = 'GlassSpeedDial';

export default SpeedDial;
export { SpeedDial, GlassSpeedDial };
