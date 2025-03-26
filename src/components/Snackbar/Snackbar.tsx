import React, { forwardRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { slideUp, slideDown, slideInLeft, slideRight } from '../../animations/keyframes/basic';

export interface SnackbarProps {
  /**
   * If true, the snackbar is open
   */
  open: boolean;
  
  /**
   * The message to display
   */
  message: React.ReactNode;
  
  /**
   * Callback fired when the snackbar is closed
   */
  onClose?: (event: React.SyntheticEvent, reason?: string) => void;
  
  /**
   * The duration in milliseconds the snackbar will stay open
   */
  autoHideDuration?: number;
  
  /**
   * The position of the snackbar
   */
  position?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  
  /**
   * The severity of the snackbar
   */
  severity?: 'success' | 'info' | 'warning' | 'error';
  
  /**
   * Optional action buttons to display
   */
  action?: React.ReactNode;
  
  /**
   * If true, the close button will not be displayed
   */
  hideCloseButton?: boolean;
  
  /**
   * The variant of the snackbar appearance
   */
  variant?: 'standard' | 'glass';
  
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * If true, the snackbar will be elevated with shadow
   */
  elevation?: boolean;
  
  /**
   * Z-index of the snackbar
   */
  zIndex?: number;
}

// Get color by severity
const getColorBySeverity = (severity: string): string => {
  switch (severity) {
    case 'success':
      return '#10B981'; // green
    case 'error':
      return '#EF4444'; // red
    case 'warning':
      return '#F59E0B'; // amber
    case 'info':
      return '#3B82F6'; // blue
    default:
      return '#6366F1'; // indigo (primary)
  }
};

// Keyframes mapping based on position
const getAnimationByPosition = (position: string) => {
  if (position.startsWith('top')) {
    return { in: slideDown, out: slideUp };
  } else if (position.endsWith('left')) {
    return { in: slideRight, out: slideInLeft };
  } else if (position.endsWith('right')) {
    return { in: slideInLeft, out: slideRight };
  } else {
    return { in: slideUp, out: slideDown };
  }
};

// Get position styles based on position prop
const getPositionStyles = (position: string): string => {
  switch (position) {
    case 'top':
      return `
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
      `;
    case 'top-left':
      return `
        top: 16px;
        left: 16px;
      `;
    case 'top-right':
      return `
        top: 16px;
        right: 16px;
      `;
    case 'bottom':
      return `
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
      `;
    case 'bottom-left':
      return `
        bottom: 16px;
        left: 16px;
      `;
    case 'bottom-right':
      return `
        bottom: 16px;
        right: 16px;
      `;
    default:
      return `
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
      `;
  }
};

// Styled components
const SnackbarContainer = styled.div<{
  $position: string;
  $zIndex: number;
  $variant: string;
  $severity: string;
  $open: boolean;
  $elevation: boolean;
}>`
  position: fixed;
  z-index: ${props => props.$zIndex};
  display: ${props => props.$open ? 'flex' : 'none'};
  flex-direction: row;
  align-items: center;
  min-width: 288px;
  max-width: 560px;
  padding: 8px 16px;
  border-radius: 4px;
  box-sizing: border-box;
  box-shadow: ${props => props.$elevation ? '0 3px 10px rgba(0, 0, 0, 0.2)' : 'none'};
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  line-height: 1.5;
  
  /* Apply position styles */
  ${props => getPositionStyles(props.$position)}
  
  /* Variant styles */
  ${props => {
    if (props.$variant === 'glass') {
      return `
        background-color: ${props.$severity !== 'info' 
          ? `${getColorBySeverity(props.$severity)}CC`
          : 'rgba(59, 130, 246, 0.8)'
        };
        color: white;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      `;
    }
    
    // standard
    return `
      background-color: ${getColorBySeverity(props.$severity)};
      color: white;
    `;
  }}
  
  /* Glass effect for glass variant */
  ${props => props.$variant === 'glass' && glassSurface({
    elevation: props.$elevation ? 2 : 1,
    blurStrength: 'standard',
    backgroundOpacity: 'medium',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({})
  })}
  
  /* Glass glow for glass variant */
  ${props => props.$variant === 'glass' && glassGlow({
    intensity: 'minimal',
    color: props.$severity,
    themeContext: createThemeContext({})
  })}
  
  /* Edge highlight for glass variant */
  ${props => props.$variant === 'glass' && edgeHighlight({
    thickness: 1,
    opacity: 0.6,
    position: 'all',
    themeContext: createThemeContext({})
  })}
  
  /* Animation for the snackbar */
  ${props => {
    const { in: inAnimation } = getAnimationByPosition(props.$position);
    return props.$open && accessibleAnimation({
      animation: inAnimation,
      duration: 0.3,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
  }}
`;

const MessageContainer = styled.div`
  flex: 1;
  padding: 8px 0;
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: inherit;
  padding: 4px;
  margin-left: 8px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
  
  &:focus {
    outline: none;
    opacity: 1;
  }
`;

/**
 * Snackbar Component
 * 
 * A component for displaying brief notifications to the user.
 */
export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>((props, ref) => {
  const {
    open,
    message,
    onClose,
    autoHideDuration = 5000,
    position = 'bottom',
    severity = 'info',
    action,
    hideCloseButton = false,
    variant = 'standard',
    className,
    elevation = true,
    zIndex = 1400,
    ...rest
  } = props;
  
  const [isOpen, setIsOpen] = useState(open);
  
  // Handle auto-hide
  useEffect(() => {
    setIsOpen(open);
    
    if (open && autoHideDuration && onClose) {
      const timer = setTimeout(() => {
        onClose({} as React.SyntheticEvent, 'timeout');
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);
  
  // Handle close click
  const handleClose = (event: React.SyntheticEvent) => {
    if (onClose) {
      onClose(event, 'closeClick');
    }
  };
  
  // Close icon (X)
  const closeIcon = (
    <CloseButton onClick={handleClose} aria-label="Close notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
      </svg>
    </CloseButton>
  );
  
  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }
  
  // Render the snackbar using a portal
  return ReactDOM.createPortal(
    <SnackbarContainer
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={className}
      $position={position}
      $zIndex={zIndex}
      $variant={variant}
      $severity={severity}
      $open={isOpen}
      $elevation={elevation}
      {...rest}
    >
      <MessageContainer>{message}</MessageContainer>
      {action && <ActionContainer>{action}</ActionContainer>}
      {!hideCloseButton && closeIcon}
    </SnackbarContainer>,
    document.body
  );
});

Snackbar.displayName = 'Snackbar';

/**
 * GlassSnackbar Component
 * 
 * A snackbar component with glass morphism styling.
 */
export const GlassSnackbar = forwardRef<HTMLDivElement, SnackbarProps>((props, ref) => {
  const {
    className,
    variant = 'glass',
    ...rest
  } = props;
  
  return (
    <Snackbar
      ref={ref}
      className={`glass-snackbar ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassSnackbar.displayName = 'GlassSnackbar';