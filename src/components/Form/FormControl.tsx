/**
 * Glass FormControl Component
 * 
 * A container for form controls with enhanced glass styling.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { FormControlProps } from './types';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

// Styled components
const FormControlRoot = styled.div<{
  $disabled: boolean;
  $error: boolean;
  $focused: boolean;
  $fullWidth: boolean;
  $glass: boolean;
  $size: 'small' | 'medium' | 'large';
  $margin: 'none' | 'dense' | 'normal';
  $padding: 'none' | 'dense' | 'normal';
}>`
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  
  /* Glass styling if enabled */
  ${props => props.$glass && glassSurface({
    elevation: 1,
    blurStrength: 'light',
    borderOpacity: 'light',
    themeContext: createThemeContext(props.theme)
  })}
  
  /* Margin variations */
  ${props => {
    switch(props.$margin) {
      case 'dense':
        return 'margin: 4px;';
      case 'normal':
        return 'margin: 8px;';
      case 'none':
      default:
        return 'margin: 0;';
    }
  }}
  
  /* Padding variations */
  ${props => {
    switch(props.$padding) {
      case 'dense':
        return 'padding: 8px;';
      case 'normal':
        return 'padding: 16px;';
      case 'none':
      default:
        return props.$glass ? 'padding: 12px;' : 'padding: 0;';
    }
  }}
  
  /* Border radius for glass styling */
  ${props => props.$glass && `
    border-radius: 8px;
  `}
  
  /* Size variations */
  ${props => {
    switch(props.$size) {
      case 'small':
        return `
          min-height: ${props.$glass ? '60px' : 'auto'};
          font-size: 0.875rem;
        `;
      case 'large':
        return `
          min-height: ${props.$glass ? '80px' : 'auto'};
          font-size: 1rem;
        `;
      case 'medium':
      default:
        return `
          min-height: ${props.$glass ? '70px' : 'auto'};
          font-size: 0.875rem;
        `;
    }
  }}
  
  /* Error state */
  ${props => props.$error && `
    --form-control-color: rgba(240, 82, 82, 0.8);
  `}
  
  /* Focused state */
  ${props => props.$focused && !props.$error && `
    --form-control-color: rgba(99, 102, 241, 0.8);
  `}
  
  /* Default state */
  ${props => !props.$error && !props.$focused && `
    --form-control-color: rgba(255, 255, 255, 0.6);
  `}
  
  /* Glass styling with error/focus states */
  ${props => props.$glass && props.$error && `
    border: 1px solid rgba(240, 82, 82, 0.8);
    box-shadow: 0 0 0 1px rgba(240, 82, 82, 0.3);
  `}
  
  ${props => props.$glass && props.$focused && !props.$error && `
    border: 1px solid rgba(99, 102, 241, 0.8);
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  `}
  
  ${props => props.$glass && !props.$error && !props.$focused && `
    border: 1px solid rgba(255, 255, 255, 0.12);
  `}
  
  /* Disabled state */
  ${props => props.$disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    
    & > * {
      pointer-events: none;
    }
  `}
`;

/**
 * FormControl Component Implementation
 */
function FormControlComponent(
  props: FormControlProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    className,
    style,
    disabled = false,
    error = false,
    focused = false,
    required = false,
    shrink = false,
    fullWidth = false,
    glass = false,
    size = 'medium',
    margin = 'none',
    padding = 'none',
    ...rest
  } = props;
  
  // Create a context object to pass to children
  const formControlContext = {
    disabled,
    error,
    focused,
    required,
    size
  };
  
  return (
    <FormControlRoot
      ref={ref}
      className={className}
      style={style}
      $disabled={disabled}
      $error={error}
      $focused={focused}
      $fullWidth={fullWidth}
      $glass={glass}
      $size={size}
      $margin={margin}
      $padding={padding}
      {...rest}
    >
      {/* Pass form control context to children if needed */}
      {children}
    </FormControlRoot>
  );
}

/**
 * FormControl Component
 * 
 * A container for form controls with enhanced glass styling.
 */
const FormControl = forwardRef(FormControlComponent);

/**
 * GlassFormControl Component
 * 
 * Glass variant of the FormControl component with enhanced styling.
 */
const GlassFormControl = forwardRef<HTMLDivElement, FormControlProps>((props, ref) => (
  <FormControl {...props} glass={true} ref={ref} />
));

GlassFormControl.displayName = 'GlassFormControl';

export default FormControl;
export { FormControl, GlassFormControl };