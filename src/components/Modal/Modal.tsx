import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn, fadeOut, scaleUp, scaleDown } from '../../animations/keyframes/basic';

export interface ModalProps {
  /**
   * If true, the modal is open
   */
  open: boolean;
  
  /**
   * Callback fired when the modal is requested to be closed
   */
  onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  
  /**
   * The content of the modal
   */
  children: React.ReactNode;
  
  /**
   * If true, clicking the backdrop will not fire the onClose callback
   */
  disableBackdropClick?: boolean;
  
  /**
   * If true, pressing the Escape key will not fire the onClose callback
   */
  disableEscapeKeyDown?: boolean;
  
  /**
   * If true, the modal will not automatically set focus to itself when it opens
   */
  disableAutoFocus?: boolean;
  
  /**
   * If true, the modal will not restore focus to the previously focused element
   * once it closes
   */
  disableRestoreFocus?: boolean;
  
  /**
   * The variant of modal appearance
   */
  variant?: 'standard' | 'glass';
  
  /**
   * If true, the modal will take up the full width of the screen
   */
  fullWidth?: boolean;
  
  /**
   * Determine the max-width of the modal. The modal width grows with the size
   * of the screen.
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  
  /**
   * The component used for the backdrop
   */
  BackdropComponent?: React.ElementType;
  
  /**
   * Props applied to the backdrop element
   */
  BackdropProps?: object;
  
  /**
   * If true, the modal will not render its children until it's opened for the first time
   */
  mountOnEnter?: boolean;
  
  /**
   * If true, the modal will remove its children from the DOM when it exits
   */
  unmountOnExit?: boolean;
  
  /**
   * The z-index of the modal
   */
  zIndex?: number;
  
  /**
   * Additional CSS class for the modal
   */
  className?: string;
}

// Constants for max-width values
const MAX_WIDTH_MAP = {
  xs: '444px',
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px',
};

// Keyframes for the backdrop
const backdropFadeIn = fadeIn;
const backdropFadeOut = fadeOut;

// Styled components
const ModalBackdrop = styled.div<{
  $variant: string;
  $open: boolean;
  $zIndex: number;
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
  
  ${props => props.$open && accessibleAnimation({
    animation: backdropFadeIn,
    duration: 0.3,
    easing: 'ease-out'
  })}
`;

const ModalContainer = styled.div<{
  $open: boolean;
  $zIndex: number;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${props => props.$zIndex + 1};
  display: ${props => props.$open ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  pointer-events: ${props => props.$open ? 'auto' : 'none'};
`;

const ModalContent = styled.div<{
  $variant: string;
  $maxWidth: string | false;
  $fullWidth: boolean;
  $open: boolean;
}>`
  position: relative;
  background-color: ${props => props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.1)' : 'white'};
  color: ${props => props.$variant === 'glass' ? 'white' : 'inherit'};
  border-radius: 8px;
  padding: 24px;
  max-width: ${props => props.$maxWidth !== false ? props.$maxWidth : '100%'};
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  max-height: calc(100% - 64px);
  margin: 32px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  
  /* Glass effects for glass variant */
  ${props => props.$variant === 'glass' && glassSurface({
    elevation: 3,
    blurStrength: 'enhanced',
    backgroundOpacity: 'medium',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({})
  })}
  
  ${props => props.$variant === 'glass' && glassGlow({
    intensity: 'subtle',
    color: 'primary',
    themeContext: createThemeContext({})
  })}
  
  ${props => props.$variant === 'glass' && edgeHighlight({
    thickness: 1,
    opacity: 0.6,
    position: 'all',
    themeContext: createThemeContext({})
  })}
  
  /* Entry animation */
  ${props => props.$open && accessibleAnimation({
    animation: fadeIn,
    duration: 0.3,
    easing: 'ease-out'
  })}
  
  ${props => props.$open && accessibleAnimation({
    animation: scaleUp,
    duration: 0.3,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  })}
  
  /* Transform origin for animations */
  transform-origin: center center;
`;

/**
 * Modal Component
 * 
 * A component that provides a solid foundation for creating dialogs, popovers, or lightboxes.
 * The component renders its children in front of a backdrop component.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const {
    open,
    onClose,
    children,
    disableBackdropClick = false,
    disableEscapeKeyDown = false,
    disableAutoFocus = false,
    disableRestoreFocus = false,
    variant = 'standard',
    fullWidth = false,
    maxWidth = 'sm',
    BackdropComponent = ModalBackdrop,
    BackdropProps,
    mountOnEnter = false,
    unmountOnExit = false,
    zIndex = 1300,
    className,
    ...rest
  } = props;
  
  const [isMounted, setIsMounted] = useState(mountOnEnter ? false : true);
  const [modalVisible, setModalVisible] = useState(open);
  const [exiting, setExiting] = useState(false);
  const prevActiveElementRef = React.useRef<Element | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  
  // Convert maxWidth to CSS value
  const maxWidthValue = maxWidth !== false ? MAX_WIDTH_MAP[maxWidth] : false;
  
  // Handle closing the modal
  const handleClose = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    if (onClose) {
      onClose(event);
    }
  }, [onClose]);
  
  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    // Only close if clicking backdrop, not the modal content
    if (event.target === event.currentTarget && !disableBackdropClick) {
      handleClose(event);
    }
  }, [disableBackdropClick, handleClose]);
  
  // Handle Escape key press
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !disableEscapeKeyDown) {
      event.stopPropagation();
      handleClose(event);
    }
  }, [disableEscapeKeyDown, handleClose]);
  
  // Mount if mountOnEnter is true and modal is opened
  useEffect(() => {
    if (mountOnEnter && open) {
      setIsMounted(true);
    }
  }, [mountOnEnter, open]);
  
  // Handle modal visibility and focus management
  useEffect(() => {
    // Handle opening
    if (open) {
      setModalVisible(true);
      setExiting(false);
      
      // Store active element to restore focus later
      if (!disableRestoreFocus) {
        prevActiveElementRef.current = document.activeElement;
      }
      
      // Set focus to modal when opened
      if (!disableAutoFocus && modalRef.current) {
        modalRef.current.focus();
      }
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Handle closing
      if (modalVisible) {
        setExiting(true);
        
        // Apply exit animation and then hide
        const exitTimeout = setTimeout(() => {
          setModalVisible(false);
          setExiting(false);
          
          // Unmount if unmountOnExit is true
          if (unmountOnExit) {
            setIsMounted(false);
          }
          
          // Restore focus when closed
          if (!disableRestoreFocus && prevActiveElementRef.current) {
            (prevActiveElementRef.current as HTMLElement).focus();
          }
          
          // Restore body scroll
          document.body.style.overflow = '';
        }, 300); // Match animation duration
        
        return () => clearTimeout(exitTimeout);
      }
    }
  }, [open, disableAutoFocus, disableRestoreFocus, unmountOnExit, modalVisible]);
  
  // Don't render anything if not mounted
  if (!isMounted) {
    return null;
  }
  
  // Render the modal using a portal
  return ReactDOM.createPortal(
    <>
      <BackdropComponent
        $variant={variant}
        $open={modalVisible && !exiting}
        $zIndex={zIndex}
        onClick={handleBackdropClick}
        {...BackdropProps}
      />
      <ModalContainer
        $open={modalVisible}
        $zIndex={zIndex}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
      >
        <ModalContent
          ref={(node) => {
            modalRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLDivElement>).current = node!;
            }
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={className}
          $variant={variant}
          $maxWidth={maxWidthValue}
          $fullWidth={fullWidth}
          $open={modalVisible && !exiting}
          {...rest}
        >
          {children}
        </ModalContent>
      </ModalContainer>
    </>,
    document.body
  );
});

Modal.displayName = 'Modal';

/**
 * GlassModal Component
 * 
 * A modal component with glass morphism styling.
 */
export const GlassModal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const {
    className,
    variant = 'glass',
    ...rest
  } = props;
  
  return (
    <Modal
      ref={ref}
      className={`glass-modal ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassModal.displayName = 'GlassModal';