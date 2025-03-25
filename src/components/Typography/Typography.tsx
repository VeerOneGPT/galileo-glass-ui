import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { edgeHighlight } from '../../core/mixins/effects/edgeEffects';
import { glassGlow } from '../../core/mixins/effects/glowEffects';
import { createThemeContext } from '../../core/themeContext';

// Typography props interface
export interface TypographyProps {
  /**
   * The content of the typography
   */
  children: React.ReactNode;
  
  /**
   * The variant of the typography
   */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'button' | 'caption' | 'overline';
  
  /**
   * The component to render the typography as
   */
  component?: React.ElementType;
  
  /**
   * The color of the typography
   */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'inherit' | 'textPrimary' | 'textSecondary';
  
  /**
   * The alignment of the text
   */
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  
  /**
   * If true, the text will wrap with overflowing text indicated by an ellipsis
   */
  noWrap?: boolean;
  
  /**
   * If true, the text will have a gutterBottom
   */
  gutterBottom?: boolean;
  
  /**
   * If true, the text will have a paragraph margin
   */
  paragraph?: boolean;
  
  /**
   * If true, the text will have a glow effect
   */
  glow?: 'none' | 'subtle' | 'medium' | 'strong';
  
  /**
   * If true, the text will have an edge highlight
   */
  edgeHighlight?: boolean;
  
  /**
   * Additional CSS class name
   */
  className?: string;
}

// Get the correct font size for each variant
const getFontSize = (variant: string) => {
  switch (variant) {
    case 'h1': return '2.5rem';
    case 'h2': return '2rem';
    case 'h3': return '1.75rem';
    case 'h4': return '1.5rem';
    case 'h5': return '1.25rem';
    case 'h6': return '1.125rem';
    case 'subtitle1': return '1rem';
    case 'subtitle2': return '0.875rem';
    case 'body1': return '1rem';
    case 'body2': return '0.875rem';
    case 'button': return '0.875rem';
    case 'caption': return '0.75rem';
    case 'overline': return '0.75rem';
    default: return '1rem';
  }
};

// Get the correct font weight for each variant
const getFontWeight = (variant: string) => {
  switch (variant) {
    case 'h1': return 500;
    case 'h2': return 500;
    case 'h3': return 500;
    case 'h4': return 500;
    case 'h5': return 500;
    case 'h6': return 500;
    case 'subtitle1': return 400;
    case 'subtitle2': return 500;
    case 'body1': return 400;
    case 'body2': return 400;
    case 'button': return 500;
    case 'caption': return 400;
    case 'overline': return 400;
    default: return 400;
  }
};

// Get the correct line height for each variant
const getLineHeight = (variant: string) => {
  switch (variant) {
    case 'h1': return 1.2;
    case 'h2': return 1.2;
    case 'h3': return 1.3;
    case 'h4': return 1.3;
    case 'h5': return 1.4;
    case 'h6': return 1.4;
    case 'subtitle1': return 1.5;
    case 'subtitle2': return 1.5;
    case 'body1': return 1.5;
    case 'body2': return 1.5;
    case 'button': return 1.75;
    case 'caption': return 1.5;
    case 'overline': return 2.5;
    default: return 1.5;
  }
};

// Get the correct text transform for each variant
const getTextTransform = (variant: string) => {
  switch (variant) {
    case 'button': return 'uppercase';
    case 'overline': return 'uppercase';
    default: return 'none';
  }
};

// Get the component for each variant
const getComponent = (variant: string, component?: React.ElementType): React.ElementType => {
  if (component) {
    return component;
  }
  
  switch (variant) {
    case 'h1': return 'h1';
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'h5': return 'h5';
    case 'h6': return 'h6';
    case 'subtitle1': return 'h6';
    case 'subtitle2': return 'h6';
    case 'body1': return 'p';
    case 'body2': return 'p';
    case 'button': return 'span';
    case 'caption': return 'span';
    case 'overline': return 'span';
    default: return 'span';
  }
};

// Styled typography component
const StyledTypography = styled.span<{
  $variant: string;
  $color: string;
  $align: string;
  $noWrap: boolean;
  $gutterBottom: boolean;
  $paragraph: boolean;
  $glow: 'none' | 'subtle' | 'medium' | 'strong';
  $edgeHighlight: boolean;
}>`
  /* Base styles */
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: ${props => getFontSize(props.$variant)};
  font-weight: ${props => getFontWeight(props.$variant)};
  line-height: ${props => getLineHeight(props.$variant)};
  text-transform: ${props => getTextTransform(props.$variant)};
  letter-spacing: ${props => props.$variant === 'overline' ? '0.08333em' : 'normal'};
  
  /* Text alignment */
  text-align: ${props => props.$align};
  
  /* No wrap with ellipsis */
  ${props => props.$noWrap && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
  
  /* Bottom margin for gutterBottom */
  ${props => props.$gutterBottom && `
    margin-bottom: 0.35em;
  `}
  
  /* Bottom margin for paragraph */
  ${props => props.$paragraph && `
    margin-bottom: 16px;
  `}
  
  /* Color styles */
  ${props => {
    switch (props.$color) {
      case 'primary': return 'color: #6366F1;';
      case 'secondary': return 'color: #8B5CF6;';
      case 'error': return 'color: #EF4444;';
      case 'warning': return 'color: #F59E0B;';
      case 'info': return 'color: #3B82F6;';
      case 'success': return 'color: #10B981;';
      case 'textPrimary': return 'color: rgba(255, 255, 255, 0.9);';
      case 'textSecondary': return 'color: rgba(255, 255, 255, 0.7);';
      case 'inherit': return 'color: inherit;';
      default: return 'color: inherit;';
    }
  }}
  
  /* Glow effect */
  ${props => props.$glow !== 'none' && glassGlow({
    intensity: props.$glow,
    color: props.$color === 'primary' || props.$color === 'secondary' 
      ? props.$color 
      : 'primary',
    themeContext: createThemeContext({}) // In real usage, this would use props.theme
  })}
  
  /* Edge highlight */
  ${props => props.$edgeHighlight && edgeHighlight({
    thickness: 1,
    opacity: 0.7,
    position: 'bottom',
    color: props.$color === 'primary' || props.$color === 'secondary' 
      ? props.$color 
      : 'primary',
    themeContext: createThemeContext({}) // In real usage, this would use props.theme
  })}
`;

/**
 * Typography Component
 * 
 * A component for displaying text with different styles.
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>((props, ref) => {
  const {
    children,
    variant = 'body1',
    component,
    color = 'inherit',
    align = 'inherit',
    noWrap = false,
    gutterBottom = false,
    paragraph = false,
    glow = 'none',
    edgeHighlight = false,
    className,
    ...rest
  } = props;
  
  // Get the component to render
  const Component = getComponent(variant, component);
  
  return (
    <StyledTypography
      as={Component}
      ref={ref}
      className={className}
      $variant={variant}
      $color={color}
      $align={align}
      $noWrap={noWrap}
      $gutterBottom={gutterBottom}
      $paragraph={paragraph}
      $glow={glow}
      $edgeHighlight={edgeHighlight}
      {...rest}
    >
      {children}
    </StyledTypography>
  );
});

Typography.displayName = 'Typography';

/**
 * GlassTypography Component
 * 
 * A typography component with glass morphism styling.
 */
export const GlassTypography = forwardRef<HTMLElement, TypographyProps>((props, ref) => {
  const {
    glow = 'subtle',
    edgeHighlight = true,
    className,
    ...rest
  } = props;
  
  // Add glass styling to the base typography
  return (
    <Typography
      ref={ref}
      glow={glow}
      edgeHighlight={edgeHighlight}
      className={`glass-typography ${className || ''}`}
      {...rest}
    />
  );
});

GlassTypography.displayName = 'GlassTypography';