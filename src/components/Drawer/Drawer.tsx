import React, { forwardRef, useState, useEffect, useCallback, useMemo, useRef, ForwardedRef, ReactNode } from 'react'; // Added ForwardedRef, ReactNode
import ReactDOM from 'react-dom';
import styled, { css, createGlobalStyle } from 'styled-components';
import { useFocusTrap } from '../../hooks/accessibility/useFocusTrap'; // Corrected path

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, fadeOut } from '../../animations/keyframes/basic';
import { edgeHighlight } from '../../core/mixins/edgeEffects'; // Corrected import name
import { glassSurface } from '../../core/mixins/glassSurface'; // Corrected import name
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
// Removed incorrect GlassSurfaceStyles and GlassEdgeHighlight imports
import { useGalileoStateSpring } from '../../hooks/useGalileoStateSpring';
import { AnimationProps } from '../../animations/types'; // Import AnimationProps

export interface DrawerProps extends AnimationProps { // Extend AnimationProps
  /**
   * If true, the drawer is open
   */
  open: boolean;

  /**
   * Callback fired when the drawer requests to be closed
   */
  onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;

  /**
   * The anchor of the drawer
   */
  anchor?: 'left' | 'right' | 'top' | 'bottom';

  /**
   * The content of the drawer
   */
  children: React.ReactNode;

  /**
   * If true, the backdrop will not be rendered
   */
  hideBackdrop?: boolean;

  /**
   * If true, clicking the backdrop will not fire the onClose callback
   */
  disableBackdropClick?: boolean;

  /**
   * If true, pressing the Escape key will not fire the onClose callback
   */
  disableEscapeKeyDown?: boolean;

  /**
   * If true, the drawer will take up the full width/height of its anchor side
   */
  fullSize?: boolean;

  /**
   * Width of the drawer when anchor is left or right
   */
  width?: number | string;

  /**
   * Height of the drawer when anchor is top or bottom
   */
  height?: number | string;

  /**
   * The variant of drawer appearance
   */
  variant?: 'standard' | 'glass' | 'temporary' | 'persistent' | 'permanent';

  /**
   * The z-index of the drawer
   */
  zIndex?: number;

  /**
   * The color theme of the drawer
   */
  color?: 'primary' | 'secondary' | 'default';

  /**
   * Additional CSS class
   */
  className?: string;

  // REMOVED animationConfig prop
  // animationConfig?: Partial<SpringConfig> | keyof typeof SpringPresets;
}

// Get dimension styles based on anchor, fullSize, and width/height
const getDimensionStyles = (
  anchor: string,
  fullSize: boolean,
  width?: number | string,
  height?: number | string
) => {
  // Convert number to px string or use the string value
  const widthValue =
    width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : '256px';

  const heightValue =
    height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : '256px';

  if (anchor === 'left' || anchor === 'right') {
    return {
      width: fullSize ? '100%' : widthValue,
      height: '100%',
    };
  } else {
    return {
      width: '100%',
      height: fullSize ? '100%' : heightValue,
    };
  }
};

// Get position styles based on anchor
const getPositionStyles = (anchor: string) => {
  switch (anchor) {
    case 'left':
      return css`
        top: 0;
        left: 0;
        bottom: 0;
      `;
    case 'right':
      return css`
        top: 0;
        right: 0;
        bottom: 0;
      `;
    case 'top':
      return css`
        top: 0;
        left: 0;
        right: 0;
      `;
    case 'bottom':
      return css`
        bottom: 0;
        left: 0;
        right: 0;
      `;
    default:
      return css`
        top: 0;
        left: 0;
        bottom: 0;
      `;
  }
};

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

// Styled components
const DrawerBackdrop = styled.div<{
  $zIndex: number;
  $variant: string;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${props => props.$zIndex};
  background-color: ${props =>
    props.$variant === 'glass' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
  backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(8px)' : 'none')};
  -webkit-backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(8px)' : 'none')};
`;

const DrawerContainer = styled.div<{
  $anchor: string;
  $zIndex: number;
  $variant: string;
  $color: string;
  $width: string;
  $height: string;
  $fullSize: boolean;
}>`
  position: fixed;
  z-index: ${props => props.$zIndex + 1};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  outline: 0;
  overflow-y: auto;
  width: ${props =>
    props.$anchor === 'left' || props.$anchor === 'right'
      ? props.$fullSize
        ? '100%'
        : props.$width
      : '100%'};
  height: ${props =>
    props.$anchor === 'top' || props.$anchor === 'bottom'
      ? props.$fullSize
        ? '100%'
        : props.$height
      : '100%'};

  /* Position styles */
  ${props => getPositionStyles(props.$anchor)}

  /* Variant styles */
  ${props => {
    const isPermanent = props.$variant === 'permanent';

    if (props.$variant === 'glass') {
      return css`
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        box-shadow: ${isPermanent ? 'none' : '0 0 24px rgba(0, 0, 0, 0.2)'};
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      `;
    }

    // standard
    return css`
      background-color: white;
      color: #1f2937;
      box-shadow: ${isPermanent ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.15)'};
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
    props.$color !== 'default' &&
    glassGlow({
      intensity: 'subtle',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Edge highlight for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    edgeHighlight({
      thickness: 1,
      opacity: 0.5,
      position:
        props.$anchor === 'left'
          ? 'right'
          : props.$anchor === 'right'
          ? 'left'
          : props.$anchor === 'top'
          ? 'bottom'
          : 'top',
      themeContext: createThemeContext({}),
    })}
`;

/**
 * Drawer Component
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>((props, ref) => {
  const {
    open,
    onClose,
    anchor = 'left',
    children,
    hideBackdrop = false,
    disableBackdropClick = false,
    disableEscapeKeyDown = false,
    fullSize = false,
    width = 256,
    height = 256,
    variant = 'standard',
    zIndex = 1200,
    color = 'default',
    className,
    // Destructure AnimationProps
    animationConfig,
    disableAnimation,
    motionSensitivity, // Keep if needed later
    ...rest
  } = props;

  const drawerRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { defaultSpring } = useAnimationContext();

  // Determine if animation is disabled
  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion; // Correct calculation

  // Convert width/height to string values
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (!disableBackdropClick && onClose) {
        onClose(event);
      }
    },
    [disableBackdropClick, onClose]
  );

  // Handle Escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableEscapeKeyDown && onClose) {
        onClose(event as unknown as React.KeyboardEvent);
      }
    },
    [disableEscapeKeyDown, onClose]
  );

  // Add/remove event listener for Escape key
  useEffect(() => {
    if (open && !disableEscapeKeyDown) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, disableEscapeKeyDown, handleKeyDown]);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (open && variant !== 'permanent') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, variant]);

  // Calculate final spring config using AnimationProps
  const finalSpringConfig = useMemo(() => {
      const baseConfig: SpringConfig = SpringPresets.DEFAULT;
      let contextConfig: Partial<SpringConfig> = {};
      const contextSource = defaultSpring;
      if (typeof contextSource === 'string' && contextSource in SpringPresets) {
          contextConfig = SpringPresets[contextSource as keyof typeof SpringPresets];
      } else if (typeof contextSource === 'object') {
          contextConfig = contextSource ?? {};
      }

      let propConfig: Partial<SpringConfig> = {};
      // Use animationConfig from props
      const propSource = animationConfig; 
      if (typeof propSource === 'string' && propSource in SpringPresets) {
          propConfig = SpringPresets[propSource as keyof typeof SpringPresets];
      } else if (typeof propSource === 'object' && ('tension' in propSource || 'friction' in propSource)) {
          propConfig = propSource as Partial<SpringConfig>;
      }
      return { ...baseConfig, ...contextConfig, ...propConfig };
  }, [defaultSpring, animationConfig]); // Use animationConfig dependency

  // Galileo Spring for Drawer position
  const { value: drawerProgress, isAnimating: isDrawerAnimating } = useGalileoStateSpring(open ? 1 : 0, {
      ...finalSpringConfig,
      immediate: finalDisableAnimation, // Use corrected flag
  });

  // Galileo Spring for Backdrop opacity
  const { value: backdropProgress, isAnimating: isBackdropAnimating } = useGalileoStateSpring(open ? 1 : 0, {
      tension: 220, friction: 30, // Use specific config for backdrop fade
      immediate: finalDisableAnimation, // Use corrected flag
  });

  // Calculate transform based on anchor and progress
  const getTransform = (progress: number): string => {
      const value = (1 - progress) * 100;
      switch (anchor) {
          case 'left': return `translateX(-${value}%)`;
          case 'right': return `translateX(${value}%)`;
          case 'top': return `translateY(-${value}%)`;
          case 'bottom': return `translateY(${value}%)`;
          default: return `translateX(-${value}%)`;
      }
  };

  const drawerTransform = getTransform(drawerProgress);
  const backdropOpacity = backdropProgress;

  // Combine forwarded ref and internal ref
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
      drawerRef.current = node;
      if (typeof ref === 'function') {
          ref(node);
      } else if (ref) {
          ref.current = node;
      }
  }, [ref]);
  
  // Use focus trap hook
  useFocusTrap(drawerRef, open); // Pass drawerRef and open state

  const shouldRenderBackdrop = !hideBackdrop && variant !== 'permanent';
  const isTemporary = variant === 'temporary';

  return ReactDOM.createPortal(
    <>
      {shouldRenderBackdrop && (
        <DrawerBackdrop
          ref={backdropRef}
          onClick={handleBackdropClick}
          style={{ opacity: backdropOpacity, pointerEvents: open ? 'auto' : 'none' }}
          $zIndex={zIndex}
          $variant={variant}
        />
      )}
      <DrawerContainer
        ref={combinedRef} // Use combined ref
        tabIndex={-1} // Make focusable for escape key
        className={className}
        style={{ transform: drawerTransform }}
        $anchor={anchor}
        $zIndex={zIndex}
        $variant={variant}
        $color={color}
        $width={widthValue}
        $height={heightValue}
        $fullSize={fullSize}
        {...rest}
      >
        {children}
      </DrawerContainer>
    </>,
    document.body
  );
});

Drawer.displayName = 'Drawer';

/**
 * GlassDrawer Component
 *
 * A drawer component with glass morphism styling.
 */
export const GlassDrawer = forwardRef<HTMLDivElement, DrawerProps>((props, ref) => {
  const { className, variant = 'glass', ...rest } = props;

  return (
    <Drawer ref={ref} className={`glass-drawer ${className || ''}`} variant={variant} {...rest} />
  );
});

GlassDrawer.displayName = 'GlassDrawer';
