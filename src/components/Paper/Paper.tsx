import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';

// Paper props interface
export interface PaperProps {
  /**
   * The content of the paper
   */
  children?: React.ReactNode;
  
  /**
   * The variant of the paper
   */
  variant?: 'elevation' | 'outlined';
  
  /**
   * The elevation of the paper
   */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  
  /**
   * The square corners
   */
  square?: boolean;
  
  /**
   * If true, the paper will have a glass effect
   */
  glass?: boolean;
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Additional CSS styles
   */
  style?: React.CSSProperties;
  
  /**
   * Click handler
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// Styled paper component
const StyledPaper = styled.div<{
  $variant: 'elevation' | 'outlined';
  $elevation: number;
  $square: boolean;
  $glass: boolean;
}>`
  /* Base styles */
  position: relative;
  background-color: ${props => props.$variant === 'outlined' ? 'transparent' : 'rgba(255, 255, 255, 0.08)'};
  color: inherit;
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  border-radius: ${props => props.$square ? '0' : '4px'};
  
  /* Outlined variant */
  ${props => props.$variant === 'outlined' && `
    border: 1px solid rgba(255, 255, 255, 0.12);
  `}
  
  /* Elevation variant */
  ${props => props.$variant === 'elevation' && !props.$glass && `
    box-shadow: ${props.$elevation === 0 
      ? 'none' 
      : `0px ${props.$elevation}px ${props.$elevation * 2}px 0px rgba(0, 0, 0, 0.2), 
         0px ${props.$elevation}px ${props.$elevation / 2}px 0px rgba(0, 0, 0, 0.14), 
         0px ${props.$elevation}px ${props.$elevation}px 0px rgba(0, 0, 0, 0.12)`};
  `}
  
  /* Glass effect */
  ${props => props.$glass && glassSurface({
    elevation: props.$elevation,
    blurStrength: 'standard',
    backgroundOpacity: props.$variant === 'outlined' ? 'subtle' : 'light',
    borderOpacity: props.$variant === 'outlined' ? 'medium' : 'subtle',
    themeContext: createThemeContext({}) // In real usage, this would use props.theme
  })}
`;

/**
 * Paper Component
 * 
 * A surface to display content with elevation or borders.
 */
export const Paper = forwardRef<HTMLDivElement, PaperProps>((props, ref) => {
  const {
    children,
    variant = 'elevation',
    elevation = 1,
    square = false,
    glass = false,
    className,
    style,
    onClick,
    ...rest
  } = props;
  
  return (
    <StyledPaper
      ref={ref}
      className={className}
      style={style}
      $variant={variant}
      $elevation={elevation}
      $square={square}
      $glass={glass}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledPaper>
  );
});

Paper.displayName = 'Paper';

/**
 * GlassPaper Component
 * 
 * A paper component with glass morphism styling.
 */
export const GlassPaper = forwardRef<HTMLDivElement, PaperProps>((props, ref) => {
  const {
    glass = true,
    elevation = 2,
    square = false,
    className,
    ...rest
  } = props;
  
  // Add glass styling to the base paper
  return (
    <Paper
      ref={ref}
      glass={glass}
      elevation={elevation}
      square={square}
      className={`glass-paper ${className || ''}`}
      {...rest}
    />
  );
});

GlassPaper.displayName = 'GlassPaper';