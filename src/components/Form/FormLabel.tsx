/**
 * Glass FormLabel Component
 *
 * A form label component with enhanced glass styling.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { FormLabelProps } from './types';

// Styled components
const FormLabelRoot = styled.label<{
  $disabled: boolean;
  $error: boolean;
  $focused: boolean;
  $required: boolean;
  $glass: boolean;
  $color: string;
}>`
  display: block;
  transform-origin: top left;
  margin-bottom: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.2;
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
    return 'rgba(255, 255, 255, 0.8)';
  }};
  transition: color 0.2s ease;

  /* Required indicator */
  ${props =>
    props.$required &&
    `
    &::after {
      content: ' *';
      color: ${props.$error ? 'rgba(240, 82, 82, 0.9)' : 'rgba(240, 82, 82, 0.7)'};
    }
  `}

  /* Glass styling */
  ${props =>
    props.$glass &&
    `
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    padding: 4px 8px;
    margin-left: -8px;
    margin-right: -8px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.03);
  `}
  
  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    cursor: not-allowed;
  `}
`;

/**
 * FormLabel Component Implementation
 */
function FormLabelComponent(props: FormLabelProps, ref: React.ForwardedRef<HTMLLabelElement>) {
  const {
    children,
    className,
    style,
    disabled = false,
    error = false,
    focused = false,
    required = false,
    glass = false,
    color = 'primary',
    component = 'label',
    ...rest
  } = props;

  const Root = FormLabelRoot as unknown as React.ElementType;

  return (
    <Root
      as={component}
      ref={ref}
      className={className}
      style={style}
      $disabled={disabled}
      $error={error}
      $focused={focused}
      $required={required}
      $glass={glass}
      $color={color}
      {...rest}
    >
      {children}
    </Root>
  );
}

/**
 * FormLabel Component
 *
 * A form label component with enhanced glass styling.
 */
const FormLabel = forwardRef(FormLabelComponent);

/**
 * GlassFormLabel Component
 *
 * Glass variant of the FormLabel component with enhanced styling.
 */
const GlassFormLabel = forwardRef<HTMLLabelElement, FormLabelProps>((props, ref) => (
  <FormLabel {...props} glass={true} ref={ref} />
));

GlassFormLabel.displayName = 'GlassFormLabel';

export default FormLabel;
export { FormLabel, GlassFormLabel };
