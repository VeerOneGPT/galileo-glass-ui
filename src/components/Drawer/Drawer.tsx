import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, fadeOut, slideInLeft, slideOutLeft, slideInRight, slideOutRight, slideInTop, slideOutTop, slideInBottom, slideOutBottom } from '../../animations/keyframes/basic';

export interface DrawerProps {
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
}

// Get animation keyframes based on anchor and state
const getAnimation = (anchor: string, isOpen: boolean) => {
  switch (anchor) {
    case 'left':
      return isOpen ? slideInLeft : slideOutLeft;
    case 'right':
      return isOpen ? slideInRight : slideOutRight;
    case 'top':
      return isOpen ? slideInTop : slideOutTop;
    case 'bottom':
      return isOpen ? slideInBottom : slideOutBottom;
    default:
      return isOpen ? slideInLeft : slideOutLeft;
  }
};

// Get dimension styles based on anchor, fullSize, and width/height
const getDimensionStyles = (
  anchor: string, 
  fullSize: boolean,
  width?: number | string,
  height?: number | string
) => {
  // Convert number to px string or use the string value
  const widthValue = width !== undefined 
    ? (typeof width === 'number' ? `${width}px` : width) 
    : '256px';
    
  const heightValue = height !== undefined 
    ? (typeof height === 'number' ? `${height}px` : height) 
    : '256px';
  
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
  $open: boolean;
  $zIndex: number;
  $variant: string;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${props => props.$zIndex};
  display: ${props => props.$open ? 'block' : 'none'};
  background-color: ${props => props.$variant === 'glass' 
    ? 'rgba(15, 23, 42, 0.7)' 
    : 'rgba(0, 0, 0, 0.5)'
  };
  backdrop-filter: ${props => props.$variant === 'glass' ? 'blur(8px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$variant === 'glass' ? 'blur(8px)' : 'none'};
  
  /* Animation */
  ${props => props.$open && accessibleAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out'
  })}
`;

const DrawerContainer = styled.div<{
  $anchor: string;
  $open: boolean;
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
  display: ${props => props.$open ? 'flex' : 'none'};
  flex-direction: column;
  outline: 0;
  overflow-y: auto;
  width: ${props => props.$anchor === 'left' || props.$anchor === 'right' 
    ? (props.$fullSize ? '100%' : props.$width)
    : '100%'
  };
  height: ${props => props.$anchor === 'top' || props.$anchor === 'bottom'
    ? (props.$fullSize ? '100%' : props.$height)
    : '100%'
  };
  
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
      color: #1F2937;
      box-shadow: ${isPermanent ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.15)'};
    `;
  }}
  
  /* Glass effect for glass variant */
  ${props => props.$variant === 'glass' && glassSurface({
    elevation: 3,
    blurStrength: 'enhanced',
    backgroundOpacity: 'medium',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({})
  })}
  
  /* Glass glow for glass variant */
  ${props => props.$variant === 'glass' && props.$color !== 'default' && glassGlow({
    intensity: 'subtle',
    color: props.$color,
    themeContext: createThemeContext({})
  })}
  
  /* Edge highlight for glass variant */
  ${props => props.$variant === 'glass' && edgeHighlight({
    thickness: 1,
    opacity: 0.5,
    position: props.$anchor === 'left' ? 'right' :
              props.$anchor === 'right' ? 'left' :
              props.$anchor === 'top' ? 'bottom' : 'top',
    themeContext: createThemeContext({})
  })}
  
  /* Animation */
  ${props => {
    const animation = getAnimation(props.$anchor, props.$open);
    return accessibleAnimation({
      animation,
      duration: 0.3,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
  }}
`;

/**
 * Drawer Component
 * 
 * A panel that slides in from the edge of the screen.
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
    ...rest
  } = props;
  
  const [isOpen, setIsOpen] = useState(open);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  
  // Convert width/height to string values
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  
  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (!disableBackdropClick && onClose) {
      onClose(event);
    }
  }, [disableBackdropClick, onClose]);
  
  // Handle Escape key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && !disableEscapeKeyDown && onClose) {
      onClose(event as unknown as React.KeyboardEvent);
    }
  }, [disableEscapeKeyDown, onClose]);
  
  // Update isOpen when open prop changes
  useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  // Add/remove event listener for Escape key
  useEffect(() => {
    if (isOpen && !disableEscapeKeyDown) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, disableEscapeKeyDown, handleKeyDown]);
  
  // Body scroll lock when drawer is open
  useEffect(() => {
    if (isOpen && variant !== 'permanent') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, variant]);
  
  // Don't render anything if not open and not permanent
  if (!isOpen && variant !== 'permanent') {
    return null;
  }
  
  // Get the drawer content
  const drawerContent = (
    <DrawerContainer
      ref={(node) => {
        drawerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement>).current = node!;
        }
      }}
      role="dialog"
      aria-modal={variant !== 'permanent'}
      tabIndex={-1}
      className={className}
      $anchor={anchor}
      $open={isOpen}
      $zIndex={zIndex}
      $variant={variant === 'temporary' ? 'standard' : variant}
      $color={color}
      $width={widthValue}
      $height={heightValue}
      $fullSize={fullSize}
      {...rest}
    >
      {children}
    </DrawerContainer>
  );
  
  // If permanent variant, render without portal
  if (variant === 'permanent') {
    return drawerContent;
  }
  
  // For temporary, persistent, and other variants, render with portal and backdrop
  return ReactDOM.createPortal(
    <>
      {!hideBackdrop && (
        <DrawerBackdrop
          $open={isOpen}
          $zIndex={zIndex}
          $variant={variant === 'glass' ? 'glass' : 'standard'}
          onClick={handleBackdropClick}
        />
      )}
      {drawerContent}
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
  const {
    className,
    variant = 'glass',
    ...rest
  } = props;
  
  return (
    <Drawer
      ref={ref}
      className={`glass-drawer ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassDrawer.displayName = 'GlassDrawer';