/**
 * Menu Component
 *
 * A menu component that displays a list of options in a popover, anchored to an element.
 */
import React, { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';

import { useAnimationContext } from '../../contexts/AnimationContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { useGalileoSprings, SpringsAnimationResult } from '../../hooks/useGalileoSprings'; // Import Galileo hook
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
// import { getPopoverPosition } from '../../utils/positionUtils'; // Remove dependency

// --- Copied and adapted positioning logic from Tooltip --- 
// TODO: Extract this to a shared utility if needed elsewhere
const getMenuPosition = (
  anchorEl: HTMLElement,
  menuEl: HTMLElement,
  placement: string
): { top: number; left: number; transformOrigin: string } => {
  const targetRect = anchorEl.getBoundingClientRect();
  const menuRect = menuEl.getBoundingClientRect();
  const offset = 8; // Spacing between anchor and menu
  let top = 0;
  let left = 0;
  let transformOrigin = 'center center';

  switch (placement) {
    case 'top':
      top = targetRect.top - menuRect.height - offset;
      left = targetRect.left + targetRect.width / 2 - menuRect.width / 2;
      transformOrigin = 'center bottom';
      break;
    case 'top-start':
      top = targetRect.top - menuRect.height - offset;
      left = targetRect.left;
      transformOrigin = 'left bottom';
      break;
    case 'top-end':
      top = targetRect.top - menuRect.height - offset;
      left = targetRect.right - menuRect.width;
      transformOrigin = 'right bottom';
      break;
    case 'bottom':
      top = targetRect.bottom + offset;
      left = targetRect.left + targetRect.width / 2 - menuRect.width / 2;
      transformOrigin = 'center top';
      break;
    case 'bottom-start':
      top = targetRect.bottom + offset;
      left = targetRect.left;
      transformOrigin = 'left top';
      break;
    case 'bottom-end':
      top = targetRect.bottom + offset;
      left = targetRect.right - menuRect.width;
      transformOrigin = 'right top';
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - menuRect.height / 2;
      left = targetRect.left - menuRect.width - offset;
      transformOrigin = 'right center';
      break;
    case 'left-start':
      top = targetRect.top;
      left = targetRect.left - menuRect.width - offset;
      transformOrigin = 'right top';
      break;
    case 'left-end':
      top = targetRect.bottom - menuRect.height;
      left = targetRect.left - menuRect.width - offset;
      transformOrigin = 'right bottom';
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - menuRect.height / 2;
      left = targetRect.right + offset;
      transformOrigin = 'left center';
      break;
    case 'right-start':
      top = targetRect.top;
      left = targetRect.right + offset;
      transformOrigin = 'left top';
      break;
    case 'right-end':
      top = targetRect.bottom - menuRect.height;
      left = targetRect.right + offset;
      transformOrigin = 'left bottom';
      break;
    default: // Default to bottom-start
      top = targetRect.bottom + offset;
      left = targetRect.left;
      transformOrigin = 'left top';
  }

  // Ensure menu stays within viewport boundaries
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const margin = 8; // Viewport margin

  // Adjust horizontally
  if (left + menuRect.width > scrollX + windowWidth - margin) {
    left = scrollX + windowWidth - menuRect.width - margin;
  }
  if (left < scrollX + margin) {
    left = scrollX + margin;
  }

  // Adjust vertically
  if (top + menuRect.height > scrollY + windowHeight - margin) {
    top = scrollY + windowHeight - menuRect.height - margin;
    // If adjusting vertically clips the anchor, consider flipping placement
  }
  if (top < scrollY + margin) {
    top = scrollY + margin;
    // If adjusting vertically clips the anchor, consider flipping placement
  }

  return { top, left, transformOrigin };
};
// --- End of position logic ---

// Menu Props
export interface MenuProps {
  /**
   * If true, the menu is open
   */
  open: boolean;

  /**
   * Callback fired when the menu requests to be closed (e.g., click outside)
   */
  onClose?: () => void;

  /**
   * The DOM element used to set the position of the menu
   */
  anchorEl?: HTMLElement | null;

  /**
   * Menu content, typically MenuItems
   */
  children?: React.ReactNode;

  /**
   * The placement of the menu relative to the anchor
   */
  placement?: 
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end';

  /**
   * The variant of the menu appearance
   */
  variant?: 'standard' | 'glass';

  /**
   * Optional spring configuration or preset name for the menu transition animation.
   */
  animationConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;
  /**
   * If true, disables all animations.
   */
  disableAnimation?: boolean;

  /**
   * Max width of the menu content
   */
  maxWidth?: string | number;

  /**
   * Custom z-index
   */
  zIndex?: number;

  /**
   * CSS class name
   */
  className?: string;
}

// Styled Components
// const MenuContent = styled(motion.div)<{ // Change back to styled.div
const MenuContent = styled.div<{
  $variant: string;
  $maxWidth?: string | number;
}>`
  position: fixed;
  min-width: 160px; // Default min width for a menu
  max-width: ${props => 
    typeof props.$maxWidth === 'number' ? `${props.$maxWidth}px` : 
    props.$maxWidth || '320px' // Default max width
  };
  overflow: auto;
  outline: 0;
  border-radius: 8px; // Consistent border radius
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  will-change: transform, opacity;
  // transform-origin is set dynamically via style prop

  /* Variant styles */
  ${props => {
    const themeContext = createThemeContext({}); // Base context for mixins
    if (props.$variant === 'glass') {
      return css`
        color: #ffffff; // Default white text for glass
        ${glassSurface({
          elevation: 4,
          blurStrength: 'standard',
          backgroundOpacity: 'medium',
          borderOpacity: 'subtle',
          themeContext,
        })}
        ${glassGlow({
          intensity: 'subtle',
          color: 'primary', 
          themeContext,
        })}
      `;
    }
    // standard
    return css`
      background-color: #2a2a2e; // Default dark surface
      color: #ffffff; // Default white text
      border: 1px solid rgba(255, 255, 255, 0.12); // Default divider
    `;
  }}
`;

// Menu Component Implementation
const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(props, ref) {
  const {
    open,
    onClose,
    anchorEl,
    children,
    placement = 'bottom-start',
    variant = 'standard',
    animationConfig,
    disableAnimation,
    maxWidth,
    zIndex = 1400,
    className,
    ...rest
  } = props;

  const [position, setPosition] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
  const [transformOrigin, setTransformOrigin] = useState('center center');
  const [isRendered, setIsRendered] = useState(open); // State to manage rendering for exit animation
  const menuRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  const prefersReducedMotion = useReducedMotion();
  const { defaultSpring } = useAnimationContext();

  const shouldAnimate = !disableAnimation && !prefersReducedMotion;

  // Merge Spring Config (unchanged)
  const finalSpringConfig = useMemo(() => {
    const baseConfig: SpringConfig = SpringPresets.DEFAULT;
    let contextConfig: Partial<SpringConfig> = {};
    const contextMenuSpring = defaultSpring;
    if (typeof contextMenuSpring === 'string' && contextMenuSpring in SpringPresets) {
      contextConfig = SpringPresets[contextMenuSpring as keyof typeof SpringPresets];
    } else if (typeof contextMenuSpring === 'object') {
      contextConfig = contextMenuSpring ?? {};
    }
    let propConfig: Partial<SpringConfig> = {};
    if (typeof animationConfig === 'string' && animationConfig in SpringPresets) {
      propConfig = SpringPresets[animationConfig as keyof typeof SpringPresets];
    } else if (typeof animationConfig === 'object') {
      propConfig = animationConfig ?? {};
    }
    return { ...baseConfig, ...contextConfig, ...propConfig };
  }, [defaultSpring, animationConfig]);

  // Define Animation Targets for useGalileoSprings
  const animationTargets = {
    opacity: open ? 1 : 0,
    scale: open ? 1 : 0.95,
  };

  // Define the onRest handler for unmounting after exit animation
  const handleRest = useCallback((result: SpringsAnimationResult) => {
    // Check all springs have finished
    const allFinished = Object.values(result).every(res => res.finished);
    if (allFinished && !open) {
      setIsRendered(false);
    }
  }, [open]);

  // Use Galileo spring hook
  const animatedValues = useGalileoSprings(animationTargets, {
    config: finalSpringConfig,
    immediate: !shouldAnimate,
    onRest: handleRest, // Add onRest callback
  });

  const updatePosition = useCallback(() => {
    if (anchorEl && menuRef.current) {
      const { top, left, transformOrigin: origin } = getMenuPosition(anchorEl, menuRef.current, placement);
      setPosition({ top, left });
      setTransformOrigin(origin);
    }
  }, [anchorEl, placement]);

  // Effect to manage mount/unmount and position updates
  useEffect(() => {
    if (open) {
      setIsRendered(true); // Ensure it's rendered before positioning
      requestAnimationFrame(() => {
        updatePosition();
      });
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    } else {
      // Remove listeners immediately on close intent
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (anchorEl && anchorEl.contains(event.target as Node)) {
            // Click was on the anchor, don't close yet
            return;
        }
        onClose?.();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, anchorEl]);

  // Set mount flag after initial render to enable portal
  useEffect(() => {
      isMounted.current = true;
  }, []);

  if (!isMounted.current || !isRendered) { // Check isRendered before rendering portal
      return null; 
  }

  // Calculate animated style
  const animatedStyle: React.CSSProperties = {
    opacity: animatedValues.opacity,
    transform: `scale(${animatedValues.scale})`,
  };

  return ReactDOM.createPortal(
    // <AnimatePresence initial={false}> // Remove AnimatePresence
      // {open && ( // Render based on isRendered instead of open
        <MenuContent
          ref={node => {
            menuRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
          }}
          $variant={variant}
          $maxWidth={maxWidth}
          className={className}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: zIndex,
            transformOrigin: transformOrigin, 
            ...animatedStyle // Apply spring styles
          }}
          // initial="hidden" // Remove Framer props
          // animate="visible"
          // exit="hidden"
          // variants={menuVariants}
          {...rest}
        >
          {children}
        </MenuContent>
      // )}
    // </AnimatePresence>,
    ,
    document.body
  );
});

// GlassMenu Component
const GlassMenu = forwardRef<HTMLDivElement, Omit<MenuProps, 'variant'>>(function GlassMenu(props, ref) {
  return <Menu {...props} variant="glass" ref={ref} />;
});

export { Menu, GlassMenu };
export default Menu;
