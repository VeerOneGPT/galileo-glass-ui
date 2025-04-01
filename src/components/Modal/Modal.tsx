import React, { forwardRef, useState, useEffect, useCallback, CSSProperties, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';

import { fadeIn, fadeOut } from '../../animations/keyframes/basic';
import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { useGalileoSprings, SpringsAnimationResult } from '../../hooks/useGalileoSprings';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { edgeHighlight } from '../../core/mixins/edgeEffects';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { AnimationProps } from '../../animations/types';

export interface ModalProps extends AnimationProps {
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

  /**
   * Deprecated: No longer used.
   */
  motionSensitivity?: any;
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
  display: ${props => (props.$open ? 'block' : 'none')};
  background-color: ${props =>
    props.$variant === 'glass' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
  backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(8px)' : 'none')};
  -webkit-backdrop-filter: ${props => (props.$variant === 'glass' ? 'blur(8px)' : 'none')};

  ${props =>
    props.$open &&
    accessibleAnimation({
      animation: backdropFadeIn,
      duration: 0.3,
      easing: 'ease-out',
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
  display: ${props => (props.$open ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  pointer-events: ${props => (props.$open ? 'auto' : 'none')};
  perspective: 1000px;
`;

const ModalContent = styled.div<{
  $variant: string;
  $maxWidth: string | false;
  $fullWidth: boolean;
}>`
  position: relative;
  background-color: ${({ theme, $variant }) =>
    $variant === 'glass' ? 'rgba(255, 255, 255, 0.1)' : (theme?.colors?.surface?.default || 'white')};
  color: ${({ theme, $variant }) =>
    $variant === 'glass' ? (theme?.colors?.text?.primary || 'white') : 'inherit'};
  border-radius: 8px;
  padding: 24px;
  max-width: ${props => (props.$maxWidth !== false ? props.$maxWidth : '100%')};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  max-height: calc(100% - 64px);
  margin: 32px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

  /* Glass effects for glass variant */
  ${({ theme, $variant }) => {
    if ($variant !== 'glass') return null;
    const themeContext = createThemeContext(theme || {}); // Create context once for glass variant
    return css`
      ${glassSurface({
        elevation: 3,
        blurStrength: 'enhanced',
        backgroundOpacity: 'medium',
        borderOpacity: 'subtle',
        themeContext,
      })}
      ${glassGlow({
        intensity: 'subtle',
        color: 'primary',
        themeContext,
      })}
      ${edgeHighlight({
        thickness: 1,
        opacity: 0.6,
        position: 'all',
        themeContext,
      })}
    `;
  }}
  
  /* Transform origin for animations */
  transform-origin: center center;
  will-change: opacity, transform;
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
    animationConfig,
    disableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  const [isMounted, setIsMounted] = useState(mountOnEnter ? false : true);
  const [modalVisible, setModalVisible] = useState(open);
  const prevActiveElementRef = useRef<Element | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { defaultSpring, modalSpringConfig } = useAnimationContext();

  const maxWidthValue = maxWidth !== false ? MAX_WIDTH_MAP[maxWidth] : false;

  const finalDisableAnimation = disableAnimation ?? prefersReducedMotion;
  const shouldAnimate = !finalDisableAnimation;

  const finalSpringConfig = useMemo(() => {
      const baseConfig: SpringConfig = SpringPresets.DEFAULT;
      let contextConfig: Partial<SpringConfig> = {};
      const contextSource = modalSpringConfig ?? defaultSpring;
      if (typeof contextSource === 'string' && contextSource in SpringPresets) {
          contextConfig = SpringPresets[contextSource as keyof typeof SpringPresets];
      } else if (typeof contextSource === 'object') {
          contextConfig = contextSource ?? {};
      }

      let propConfig: Partial<SpringConfig> = {};
      const propSource = animationConfig;
      if (typeof propSource === 'string' && propSource in SpringPresets) {
          propConfig = SpringPresets[propSource as keyof typeof SpringPresets];
      } else if (typeof propSource === 'object' && ('tension' in propSource || 'friction' in propSource)) {
          propConfig = propSource as Partial<SpringConfig>;
      }
      return { ...baseConfig, ...contextConfig, ...propConfig };
  }, [defaultSpring, modalSpringConfig, animationConfig]);

  const animationTargets = {
      opacity: open ? 1 : 0,
      scale: open ? 1 : 0.92,
      translateZ: open ? 0 : -60,
  };

  const handleRest = useCallback((result: SpringsAnimationResult) => {
    if (result.finished && !open) {
        setModalVisible(false);
        if (unmountOnExit) {
            setIsMounted(false);
        }
        if (!disableRestoreFocus && prevActiveElementRef.current) {
            (prevActiveElementRef.current as HTMLElement).focus();
        }
        document.body.style.overflow = '';
    }
  }, [open, unmountOnExit, disableRestoreFocus]);

  const animatedValues = useGalileoSprings(animationTargets, {
      config: finalSpringConfig,
      immediate: !shouldAnimate,
      onRest: handleRest,
  });

  const handleClose = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      if (onClose) {
        onClose(event);
      }
    },
    [onClose]
  );

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && !disableBackdropClick) {
        handleClose(event);
      }
    },
    [disableBackdropClick, handleClose]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape' && !disableEscapeKeyDown) {
        event.stopPropagation();
        handleClose(event);
      }
    },
    [disableEscapeKeyDown, handleClose]
  );

  useEffect(() => {
    if (open) {
      setModalVisible(true);
      if (!isMounted) {
        setIsMounted(true);
      }
      if (!disableRestoreFocus) {
        prevActiveElementRef.current = document.activeElement;
      }
      if (!disableAutoFocus) {
        requestAnimationFrame(() => {
          if (modalRef.current) {
            modalRef.current.focus();
          }
        });
      }
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    };
  }, [open, isMounted, mountOnEnter, disableAutoFocus, disableRestoreFocus]);

  if (!isMounted) {
    return null;
  }
  
  const animatedStyle: CSSProperties = {
      opacity: animatedValues.opacity,
      transform: `translateZ(${animatedValues.translateZ}px) scale(${animatedValues.scale})`,
  };

  return ReactDOM.createPortal(
    <>
      <BackdropComponent
        $variant={variant}
        $open={open}
        $zIndex={zIndex}
        onClick={handleBackdropClick}
        {...BackdropProps}
      />
      <ModalContainer
        $open={modalVisible}
        $zIndex={zIndex}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        <ModalContent
          ref={node => {
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
          style={animatedStyle}
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
  const { className, variant = 'glass', ...rest } = props;

  return (
    <Modal ref={ref} className={`glass-modal ${className || ''}`} variant={variant} {...rest} />
  );
});

GlassModal.displayName = 'GlassModal';
