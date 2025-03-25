import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { Box, BoxProps } from '../Box/Box';

// Container props interface
export interface ContainerProps extends BoxProps {
  /**
   * The maximum width of the container
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  
  /**
   * If true, the left and right padding is removed
   */
  disableGutters?: boolean;
  
  /**
   * If true, the container has fixed width based on the maxWidth
   */
  fixed?: boolean;
}

// Get max width value based on breakpoint
const getMaxWidth = (maxWidth: string | false): string => {
  if (maxWidth === false) return '100%';
  
  switch (maxWidth) {
    case 'xs': return '600px';
    case 'sm': return '960px';
    case 'md': return '1280px';
    case 'lg': return '1440px';
    case 'xl': return '1920px';
    default: return '1280px'; // Default to md
  }
};

// Styled container component
const StyledContainer = styled(Box)<{
  $maxWidth: string | false;
  $disableGutters: boolean;
  $fixed: boolean;
}>`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  
  /* Max width */
  ${props => props.$maxWidth !== false && `max-width: ${props.$maxWidth};`}
  
  /* Gutters */
  ${props => !props.$disableGutters && `
    padding-left: 16px;
    padding-right: 16px;
    
    @media (min-width: 600px) {
      padding-left: 24px;
      padding-right: 24px;
    }
  `}
  
  /* Fixed width for each breakpoint */
  ${props => props.$fixed && `
    @media (min-width: 600px) {
      max-width: 600px;
    }
    
    @media (min-width: 960px) {
      max-width: 960px;
    }
    
    @media (min-width: 1280px) {
      max-width: 1280px;
    }
    
    @media (min-width: 1440px) {
      max-width: 1440px;
    }
    
    @media (min-width: 1920px) {
      max-width: 1920px;
    }
  `}
`;

/**
 * Container Component
 * 
 * A responsive container to wrap content with a maximum width.
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
  const {
    children,
    maxWidth = 'lg',
    disableGutters = false,
    fixed = false,
    ...rest
  } = props;
  
  // Convert maxWidth to a CSS value
  const maxWidthValue = maxWidth !== false ? getMaxWidth(maxWidth) : false;
  
  return (
    <StyledContainer
      ref={ref}
      $maxWidth={maxWidthValue}
      $disableGutters={disableGutters}
      $fixed={fixed}
      {...rest}
    >
      {children}
    </StyledContainer>
  );
});

Container.displayName = 'Container';

/**
 * GlassContainer Component
 * 
 * A container component with glass morphism styling.
 */
export const GlassContainer = forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
  const {
    glass = true,
    elevation = 1,
    borderRadius = 8,
    className,
    ...rest
  } = props;
  
  // Add glass styling to the base container
  return (
    <Container
      ref={ref}
      glass={glass}
      elevation={elevation}
      borderRadius={borderRadius}
      className={`glass-container ${className || ''}`}
      {...rest}
    />
  );
});

GlassContainer.displayName = 'GlassContainer';