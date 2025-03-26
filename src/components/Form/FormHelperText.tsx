/**
 * Glass FormHelperText Component
 * 
 * A helper text component for form controls with enhanced glass styling.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { FormHelperTextProps } from './types';

// Styled components
const FormHelperTextRoot = styled.p<{
  $disabled: boolean;
  $error: boolean;
  $focused: boolean;
  $glass: boolean;
  $color: string;
  $fullWidth: boolean;
  $variant: 'caption' | 'small' | 'medium';
  $margin: 'none' | 'dense' | 'normal';
}>`
  margin: ${props => {
    switch(props.$margin) {
      case 'dense':
        return '2px 0 0 0';
      case 'normal':
        return '8px 0 0 0';
      case 'none':
      default:
        return '4px 0 0 0';
    }
  }};
  font-size: ${props => {
    switch(props.$variant) {
      case 'small':
        return '0.7rem';
      case 'medium':
        return '0.8rem';
      case 'caption':
      default:
        return '0.75rem';
    }
  }};
  line-height: 1.4;
  letter-spacing: 0.01em;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  min-height: 18px;
  color: ${props => {
    if (props.$disabled) return 'rgba(255, 255, 255, 0.5)';
    if (props.$error) return 'rgba(240, 82, 82, 0.9)';
    if (props.$focused) {
      if (props.$color === 'primary') return 'rgba(99, 102, 241, 0.9)';
      if (props.$color === 'secondary') return 'rgba(156, 39, 176, 0.9)';
      if (props.$color === 'error') return 'rgba(240, 82, 82, 0.9)';
      if (props.$color === 'info') return 'rgba(3, 169, 244, 0.9)';
      if (props.$color === 'success') return 'rgba(76, 175, 80, 0.9)';
      if (props.$color === 'warning') return 'rgba(255, 152, 0, 0.9)';
      return 'rgba(99, 102, 241, 0.9)';
    }
    return 'rgba(255, 255, 255, 0.6)';
  }};
  transition: color 0.2s ease;
  
  /* Glass styling */
  ${props => props.$glass && `
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 2px 6px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.02);
  `}
  
  /* Disabled state */
  ${props => props.$disabled && `
    cursor: not-allowed;
  `}
`;

/**
 * FormHelperText Component Implementation
 */
function FormHelperTextComponent(
  props: FormHelperTextProps,
  ref: React.ForwardedRef<HTMLParagraphElement>
) {
  const {
    children,
    className,
    style,
    disabled = false,
    error = false,
    focused = false,
    glass = false,
    color = 'primary',
    fullWidth = false,
    variant = 'caption',
    margin = 'none',
    ...rest
  } = props;
  
  return (
    <FormHelperTextRoot
      ref={ref}
      className={className}
      style={style}
      $disabled={disabled}
      $error={error}
      $focused={focused}
      $glass={glass}
      $color={color}
      $fullWidth={fullWidth}
      $variant={variant}
      $margin={margin}
      {...rest}
    >
      {children}
    </FormHelperTextRoot>
  );
}

/**
 * FormHelperText Component
 * 
 * A helper text component for form controls with enhanced glass styling.
 */
const FormHelperText = forwardRef(FormHelperTextComponent);

/**
 * GlassFormHelperText Component
 * 
 * Glass variant of the FormHelperText component with enhanced styling.
 */
const GlassFormHelperText = forwardRef<HTMLParagraphElement, FormHelperTextProps>((props, ref) => (
  <FormHelperText {...props} glass={true} ref={ref} />
));

GlassFormHelperText.displayName = 'GlassFormHelperText';

export default FormHelperText;
export { FormHelperText, GlassFormHelperText };