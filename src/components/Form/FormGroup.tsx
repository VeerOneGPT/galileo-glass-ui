/**
 * Glass FormGroup Component
 *
 * A container for grouping form controls with enhanced glass styling.
 */
import React, { forwardRef } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';

import { FormGroupProps } from './types';

// Styled components
const FormGroupRoot = styled.div<{
  $row: boolean;
  $spacing: number | string;
  $alignItems: string;
  $glass: boolean;
  $glassEffect: boolean;
}>`
  display: flex;
  flex-direction: ${props => (props.$row ? 'row' : 'column')};
  gap: ${props => (typeof props.$spacing === 'number' ? `${props.$spacing}px` : props.$spacing)};
  align-items: ${props => props.$alignItems};
  position: relative;
  width: 100%;

  /* Glass styling if enabled */
  ${props =>
    props.$glass &&
    props.$glassEffect &&
    glassSurface({
      elevation: 1,
      blurStrength: 'light',
      borderOpacity: 'light',
      themeContext: createThemeContext(props.theme),
    })}

  /* Simple glass styling without effects */
  ${props =>
    props.$glass &&
    !props.$glassEffect &&
    `
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 16px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  `}
  
  /* Padding for glass styling */
  ${props =>
    props.$glass &&
    `
    padding: 16px;
    border-radius: 8px;
  `}
`;

/**
 * FormGroup Component Implementation
 */
function FormGroupComponent(props: FormGroupProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    children,
    className,
    style,
    row = false,
    glass = false,
    glassEffect = false,
    spacing = 16,
    alignItems = row ? 'center' : 'stretch',
    ...rest
  } = props;

  return (
    <FormGroupRoot
      ref={ref}
      className={className}
      style={style}
      $row={row}
      $glass={glass}
      $glassEffect={glassEffect}
      $spacing={spacing}
      $alignItems={alignItems}
      {...rest}
    >
      {children}
    </FormGroupRoot>
  );
}

/**
 * FormGroup Component
 *
 * A container for grouping form controls with enhanced glass styling.
 */
const FormGroup = forwardRef(FormGroupComponent);

/**
 * GlassFormGroup Component
 *
 * Glass variant of the FormGroup component.
 */
const GlassFormGroup = forwardRef<HTMLDivElement, FormGroupProps>((props, ref) => (
  <FormGroup {...props} glass={true} glassEffect={true} ref={ref} />
));

GlassFormGroup.displayName = 'GlassFormGroup';

export default FormGroup;
export { FormGroup, GlassFormGroup };
