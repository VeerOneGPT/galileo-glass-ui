/**
 * AccordionDetails Component
 * 
 * The content area of an Accordion.
 */
import React, { forwardRef, useContext } from 'react';
import styled from 'styled-components';
import { AccordionContext } from './Accordion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AccordionDetailsProps } from './types';

// Calculate padding based on size
const getPadding = (size: string): string => {
  switch (size) {
    case 'none':
      return '0';
    case 'small':
      return '8px 16px';
    case 'large':
      return '20px 24px';
    case 'medium':
    default:
      return '16px';
  }
};

// Styled components
const DetailsRoot = styled.div<{
  $expanded: boolean;
  $glass: boolean;
  $padding: string;
  $reducedMotion: boolean;
}>`
  display: ${props => props.$expanded ? 'block' : 'none'};
  padding: ${props => props.$padding};
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  transition: ${props => !props.$reducedMotion ? 'height 0.2s ease' : 'none'};
  
  /* Glass content styling */
  ${props => props.$glass && `
    background-color: rgba(255, 255, 255, 0.01);
  `}
  
  /* Non-glass styling */
  ${props => !props.$glass && `
    background-color: rgba(22, 22, 22, 0.65);
  `}
`;

/**
 * AccordionDetails Component Implementation
 */
function AccordionDetailsComponent(
  props: AccordionDetailsProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    className,
    style,
    component = 'div',
    glass: propGlass,
    padding = 'medium',
    ...rest
  } = props;
  
  // Get accordion context
  const accordionContext = useContext(AccordionContext);
  
  if (!accordionContext) {
    throw new Error('AccordionDetails must be used within an Accordion');
  }
  
  const { expanded, glass: contextGlass } = accordionContext;
  
  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();
  
  // Merge props with context
  const finalGlass = propGlass !== undefined ? propGlass : contextGlass;
  
  // Get root component
  const Root = DetailsRoot as unknown as React.ElementType;
  const paddingValue = getPadding(padding);
  
  return (
    <Root
      as={component}
      ref={ref}
      className={className}
      style={style}
      $expanded={expanded}
      $glass={finalGlass}
      $padding={paddingValue}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      {children}
    </Root>
  );
}

/**
 * AccordionDetails Component
 * 
 * The content area of an Accordion.
 */
const AccordionDetails = forwardRef(AccordionDetailsComponent);

/**
 * GlassAccordionDetails Component
 * 
 * Glass variant of the AccordionDetails component.
 */
const GlassAccordionDetails = forwardRef<HTMLDivElement, AccordionDetailsProps>((props, ref) => (
  <AccordionDetails {...props} glass={true} ref={ref} />
));

GlassAccordionDetails.displayName = 'GlassAccordionDetails';

export default AccordionDetails;
export { AccordionDetails, GlassAccordionDetails };