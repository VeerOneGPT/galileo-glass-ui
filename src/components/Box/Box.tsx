import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';

// Box props interface
export interface BoxProps {
  /**
   * The content of the box
   */
  children?: React.ReactNode;
  
  /**
   * The component to render the box as
   */
  component?: React.ElementType;
  
  /**
   * Display property
   */
  display?: 'block' | 'flex' | 'inline' | 'inline-block' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';
  
  /**
   * Flex direction
   */
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  
  /**
   * Flex wrap
   */
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  
  /**
   * Justify content
   */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  
  /**
   * Align items
   */
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  
  /**
   * Align content
   */
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  
  /**
   * Align self
   */
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  
  /**
   * Padding
   */
  p?: number | string;
  pt?: number | string;
  pr?: number | string;
  pb?: number | string;
  pl?: number | string;
  px?: number | string;
  py?: number | string;
  
  /**
   * Margin
   */
  m?: number | string;
  mt?: number | string;
  mr?: number | string;
  mb?: number | string;
  ml?: number | string;
  mx?: number | string;
  my?: number | string;
  
  /**
   * Width
   */
  width?: number | string;
  
  /**
   * Height
   */
  height?: number | string;
  
  /**
   * Min width
   */
  minWidth?: number | string;
  
  /**
   * Min height
   */
  minHeight?: number | string;
  
  /**
   * Max width
   */
  maxWidth?: number | string;
  
  /**
   * Max height
   */
  maxHeight?: number | string;
  
  /**
   * Border radius
   */
  borderRadius?: number | string;
  
  /**
   * Background color
   */
  bgcolor?: string;
  
  /**
   * If true, the box will have a glass effect
   */
  glass?: boolean;
  
  /**
   * The elevation of the glass effect
   */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  
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

// Function to format spacing values
const formatSpacing = (value: number | string | undefined): string => {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  return `${value * 8}px`;
};

// Styled box component
const StyledBox = styled.div<{
  $display?: string;
  $flexDirection?: string;
  $flexWrap?: string;
  $justifyContent?: string;
  $alignItems?: string;
  $alignContent?: string;
  $alignSelf?: string;
  $p?: number | string;
  $pt?: number | string;
  $pr?: number | string;
  $pb?: number | string;
  $pl?: number | string;
  $px?: number | string;
  $py?: number | string;
  $m?: number | string;
  $mt?: number | string;
  $mr?: number | string;
  $mb?: number | string;
  $ml?: number | string;
  $mx?: number | string;
  $my?: number | string;
  $width?: number | string;
  $height?: number | string;
  $minWidth?: number | string;
  $minHeight?: number | string;
  $maxWidth?: number | string;
  $maxHeight?: number | string;
  $borderRadius?: number | string;
  $bgcolor?: string;
  $glass?: boolean;
  $elevation?: number;
}>`
  /* Base styles */
  box-sizing: border-box;
  
  /* Display */
  ${props => props.$display && `display: ${props.$display};`}
  
  /* Flex properties */
  ${props => props.$flexDirection && `flex-direction: ${props.$flexDirection};`}
  ${props => props.$flexWrap && `flex-wrap: ${props.$flexWrap};`}
  ${props => props.$justifyContent && `justify-content: ${props.$justifyContent};`}
  ${props => props.$alignItems && `align-items: ${props.$alignItems};`}
  ${props => props.$alignContent && `align-content: ${props.$alignContent};`}
  ${props => props.$alignSelf && `align-self: ${props.$alignSelf};`}
  
  /* Padding */
  ${props => props.$p !== undefined && `padding: ${formatSpacing(props.$p)};`}
  ${props => props.$pt !== undefined && `padding-top: ${formatSpacing(props.$pt)};`}
  ${props => props.$pr !== undefined && `padding-right: ${formatSpacing(props.$pr)};`}
  ${props => props.$pb !== undefined && `padding-bottom: ${formatSpacing(props.$pb)};`}
  ${props => props.$pl !== undefined && `padding-left: ${formatSpacing(props.$pl)};`}
  ${props => props.$px !== undefined && `
    padding-left: ${formatSpacing(props.$px)};
    padding-right: ${formatSpacing(props.$px)};
  `}
  ${props => props.$py !== undefined && `
    padding-top: ${formatSpacing(props.$py)};
    padding-bottom: ${formatSpacing(props.$py)};
  `}
  
  /* Margin */
  ${props => props.$m !== undefined && `margin: ${formatSpacing(props.$m)};`}
  ${props => props.$mt !== undefined && `margin-top: ${formatSpacing(props.$mt)};`}
  ${props => props.$mr !== undefined && `margin-right: ${formatSpacing(props.$mr)};`}
  ${props => props.$mb !== undefined && `margin-bottom: ${formatSpacing(props.$mb)};`}
  ${props => props.$ml !== undefined && `margin-left: ${formatSpacing(props.$ml)};`}
  ${props => props.$mx !== undefined && `
    margin-left: ${formatSpacing(props.$mx)};
    margin-right: ${formatSpacing(props.$mx)};
  `}
  ${props => props.$my !== undefined && `
    margin-top: ${formatSpacing(props.$my)};
    margin-bottom: ${formatSpacing(props.$my)};
  `}
  
  /* Dimensions */
  ${props => props.$width !== undefined && `width: ${typeof props.$width === 'number' ? `${props.$width}px` : props.$width};`}
  ${props => props.$height !== undefined && `height: ${typeof props.$height === 'number' ? `${props.$height}px` : props.$height};`}
  ${props => props.$minWidth !== undefined && `min-width: ${typeof props.$minWidth === 'number' ? `${props.$minWidth}px` : props.$minWidth};`}
  ${props => props.$minHeight !== undefined && `min-height: ${typeof props.$minHeight === 'number' ? `${props.$minHeight}px` : props.$minHeight};`}
  ${props => props.$maxWidth !== undefined && `max-width: ${typeof props.$maxWidth === 'number' ? `${props.$maxWidth}px` : props.$maxWidth};`}
  ${props => props.$maxHeight !== undefined && `max-height: ${typeof props.$maxHeight === 'number' ? `${props.$maxHeight}px` : props.$maxHeight};`}
  
  /* Border radius */
  ${props => props.$borderRadius !== undefined && `border-radius: ${typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};`}
  
  /* Background color */
  ${props => props.$bgcolor && `background-color: ${props.$bgcolor};`}
  
  /* Glass effect */
  ${props => props.$glass && glassSurface({
    elevation: props.$elevation || 1,
    blurStrength: 'standard',
    backgroundOpacity: 'light',
    borderOpacity: 'subtle',
    themeContext: createThemeContext({}) // In real usage, this would use props.theme
  })}
`;

/**
 * Box Component
 * 
 * A flexible container with system props for layout and styling.
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const {
    children,
    component = 'div',
    display,
    flexDirection,
    flexWrap,
    justifyContent,
    alignItems,
    alignContent,
    alignSelf,
    p,
    pt,
    pr,
    pb,
    pl,
    px,
    py,
    m,
    mt,
    mr,
    mb,
    ml,
    mx,
    my,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    borderRadius,
    bgcolor,
    glass = false,
    elevation = 1,
    className,
    style,
    onClick,
    ...rest
  } = props;
  
  return (
    <StyledBox
      as={component}
      ref={ref}
      className={className}
      style={style}
      $display={display}
      $flexDirection={flexDirection}
      $flexWrap={flexWrap}
      $justifyContent={justifyContent}
      $alignItems={alignItems}
      $alignContent={alignContent}
      $alignSelf={alignSelf}
      $p={p}
      $pt={pt}
      $pr={pr}
      $pb={pb}
      $pl={pl}
      $px={px}
      $py={py}
      $m={m}
      $mt={mt}
      $mr={mr}
      $mb={mb}
      $ml={ml}
      $mx={mx}
      $my={my}
      $width={width}
      $height={height}
      $minWidth={minWidth}
      $minHeight={minHeight}
      $maxWidth={maxWidth}
      $maxHeight={maxHeight}
      $borderRadius={borderRadius}
      $bgcolor={bgcolor}
      $glass={glass}
      $elevation={elevation}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledBox>
  );
});

Box.displayName = 'Box';

/**
 * GlassBox Component
 * 
 * A box component with glass morphism styling.
 */
export const GlassBox = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
  const {
    glass = true,
    elevation = 2,
    borderRadius = 8,
    className,
    ...rest
  } = props;
  
  // Add glass styling to the base box
  return (
    <Box
      ref={ref}
      glass={glass}
      elevation={elevation}
      borderRadius={borderRadius}
      className={`glass-box ${className || ''}`}
      {...rest}
    />
  );
});

GlassBox.displayName = 'GlassBox';