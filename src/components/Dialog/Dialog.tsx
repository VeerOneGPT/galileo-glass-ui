/**
 * Dialog Component (Placeholder)
 *
 * A dialog component that displays content in a modal overlay.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

// Import the underlying Modal component and its props
import { Modal, GlassModal, ModalProps } from '../Modal/Modal';
import { AnimationProps } from '../../animations/types';

// Dialog-specific styled components (optional but good practice)
const DialogTitleRoot = styled.div`
  padding: 16px 24px;
  font-size: 1.25rem;
  font-weight: 600;
  flex: 0 0 auto;
`;

const DialogContentRoot = styled.div`
  padding: 8px 24px; // Adjust padding if title/actions are present
  flex: 1 1 auto;
  overflow-y: auto;
  // Add specific content styling if needed
`;

const DialogActionsRoot = styled.div`
  padding: 8px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 0 0 auto;

  // Add spacing between actions if needed
  & > :not(:first-child) {
    margin-left: 8px;
  }
`;

// Re-export ModalProps potentially if Dialog needs to expose them all,
// but usually Dialog has a subset or maps them.

// Dialog Props extends AnimationProps
export interface DialogProps extends AnimationProps {
  /**
   * If true, the dialog is open
   */
  open: boolean;
  /**
   * Callback fired when the dialog requests to be closed
   */
  onClose?: ModalProps['onClose']; // Use Modal's onClose type
  /**
   * Dialog title
   */
  title?: React.ReactNode;
  /**
   * Dialog content (replaces children)
   */
  children?: React.ReactNode;
  /**
   * Dialog actions
   */
  actions?: React.ReactNode;
  /**
   * Max width of the dialog
   */
  maxWidth?: ModalProps['maxWidth']; // Use Modal's maxWidth type
  /**
   * If true, the dialog takes up the full width of the screen
   */
  fullWidth?: boolean;
  /**
   * If true, clicking the backdrop will not fire the onClose callback
   */
  disableBackdropClick?: boolean;
  /**
   * If true, pressing the Escape key will not fire the onClose callback
   */
  disableEscapeKeyDown?: boolean;
  /** Other ModalProps can be exposed here if needed */
  className?: string;
  style?: React.CSSProperties;
}

// --- Dialog Implementation --- 
const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open,
      onClose,
      title,
      children,
      actions,
      maxWidth = 'sm',
      fullWidth = false,
      disableBackdropClick,
      disableEscapeKeyDown,
      className,
      style,
      // Destructure AnimationProps
      animationConfig,
      disableAnimation,
      motionSensitivity,
      ...rest
    },
    ref
  ) => {
    return (
      <Modal
        ref={ref}
        open={open}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        disableBackdropClick={disableBackdropClick}
        disableEscapeKeyDown={disableEscapeKeyDown}
        className={className}
        // Pass AnimationProps down to Modal
        animationConfig={animationConfig}
        disableAnimation={disableAnimation}
        motionSensitivity={motionSensitivity}
        // Pass other relevant props from rest if Modal accepts them
      >
        {/* Structure the content */}
        {title && <DialogTitleRoot>{title}</DialogTitleRoot>}
        {children && <DialogContentRoot>{children}</DialogContentRoot>}
        {actions && <DialogActionsRoot>{actions}</DialogActionsRoot>}
      </Modal>
    );
  }
);

// --- GlassDialog Implementation ---
const GlassDialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open,
      onClose,
      title,
      children,
      actions,
      maxWidth = 'sm',
      fullWidth = false,
      disableBackdropClick,
      disableEscapeKeyDown,
      className,
      style,
      // Destructure AnimationProps
      animationConfig,
      disableAnimation,
      motionSensitivity,
      ...rest
    },
    ref
  ) => {
    return (
      <GlassModal
        ref={ref}
        open={open}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        disableBackdropClick={disableBackdropClick}
        disableEscapeKeyDown={disableEscapeKeyDown}
        className={className}
        // Pass AnimationProps down to GlassModal
        animationConfig={animationConfig}
        disableAnimation={disableAnimation}
        motionSensitivity={motionSensitivity}
        // {...rest}
      >
        {title && <DialogTitleRoot>{title}</DialogTitleRoot>}
        {children && <DialogContentRoot>{children}</DialogContentRoot>}
        {actions && <DialogActionsRoot>{actions}</DialogActionsRoot>}
      </GlassModal>
    );
  }
);

Dialog.displayName = 'Dialog';
GlassDialog.displayName = 'GlassDialog';

export { Dialog, GlassDialog };
export default Dialog;
