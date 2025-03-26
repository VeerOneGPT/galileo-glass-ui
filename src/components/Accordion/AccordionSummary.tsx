/**
 * AccordionSummary Component
 *
 * The summary/header component of an Accordion.
 */
import React, { forwardRef, useContext } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { AccordionContext } from './Accordion';
import { AccordionSummaryProps } from './types';

// Default expand icon
const DefaultExpandIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z" fill="currentColor" />
  </svg>
);

// Styled components
const SummaryRoot = styled.div<{
  $expanded: boolean;
  $disabled: boolean;
  $glass: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  min-height: 48px;
  transition: ${props => (!props.$reducedMotion ? 'background-color 0.2s ease' : 'none')};
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
  position: relative;
  user-select: none;

  /* Glass styling for summary */
  ${props =>
    props.$glass &&
    `
    background-color: rgba(255, 255, 255, 0.03);
    
    &:hover {
      background-color: ${
        props.$disabled ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)'
      };
    }
  `}

  /* Non-glass styling */
  ${props =>
    !props.$glass &&
    `
    background-color: ${props.$expanded ? 'rgba(40, 40, 40, 0.65)' : 'rgba(30, 30, 30, 0.65)'};
    
    &:hover {
      background-color: ${
        props.$disabled
          ? props.$expanded
            ? 'rgba(40, 40, 40, 0.65)'
            : 'rgba(30, 30, 30, 0.65)'
          : 'rgba(50, 50, 50, 0.65)'
      };
    }
  `}
  
  /* Bottom border */
  border-bottom: ${props => (props.$expanded ? '1px solid rgba(255, 255, 255, 0.1)' : 'none')};
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const ExpandIconWrapper = styled.div<{
  $expanded: boolean;
  $reducedMotion: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  transition: ${props => (!props.$reducedMotion ? 'transform 0.2s ease' : 'none')};
  transform: ${props => (props.$expanded ? 'rotate(180deg)' : 'rotate(0)')};
`;

/**
 * AccordionSummary Component Implementation
 */
function AccordionSummaryComponent(
  props: AccordionSummaryProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    children,
    className,
    style,
    expandIcon,
    disabled: propDisabled,
    onClick,
    glass: propGlass,
    ...rest
  } = props;

  // Get accordion context
  const accordionContext = useContext(AccordionContext);

  if (!accordionContext) {
    throw new Error('AccordionSummary must be used within an Accordion');
  }

  const { expanded, disabled: contextDisabled, toggle, glass: contextGlass } = accordionContext;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Merge props with context
  const finalDisabled = propDisabled !== undefined ? propDisabled : contextDisabled;
  const finalGlass = propGlass !== undefined ? propGlass : contextGlass;

  // Handle click event
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(event);
    }

    if (!event.defaultPrevented) {
      toggle(event);
    }
  };

  return (
    <SummaryRoot
      ref={ref}
      className={className}
      style={style}
      onClick={handleClick}
      $expanded={expanded}
      $disabled={finalDisabled}
      $glass={finalGlass}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      <Content>{children}</Content>

      <ExpandIconWrapper $expanded={expanded} $reducedMotion={prefersReducedMotion}>
        {expandIcon || <DefaultExpandIcon />}
      </ExpandIconWrapper>
    </SummaryRoot>
  );
}

/**
 * AccordionSummary Component
 *
 * The summary/header component of an Accordion.
 */
const AccordionSummary = forwardRef(AccordionSummaryComponent);

/**
 * GlassAccordionSummary Component
 *
 * Glass variant of the AccordionSummary component.
 */
const GlassAccordionSummary = forwardRef<HTMLDivElement, AccordionSummaryProps>((props, ref) => (
  <AccordionSummary {...props} glass={true} ref={ref} />
));

GlassAccordionSummary.displayName = 'GlassAccordionSummary';

export default AccordionSummary;
export { AccordionSummary, GlassAccordionSummary };
