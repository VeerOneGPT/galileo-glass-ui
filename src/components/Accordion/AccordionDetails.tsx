/**
 * AccordionDetails Component
 *
 * The content area of an Accordion.
 */
import React, { forwardRef, useContext, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useGalileoStateSpring, GalileoSpringConfig } from '../../hooks/useGalileoStateSpring';

import { AccordionContext } from './Accordion';
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

// Inner wrapper for content height measurement
const ContentWrapper = styled.div`
  overflow: hidden;
`;

// Styled components
const DetailsRoot = styled.div<{
  $expanded: boolean;
  $glass: boolean;
  $padding: string;
}>`
  padding: ${props => props.$padding};
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  will-change: height, opacity;

  /* Glass content styling */
  ${props =>
    props.$glass &&
    `
    background-color: rgba(255, 255, 255, 0.01);
  `}

  /* Non-glass styling */
  ${props =>
    !props.$glass &&
    `
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
    animationConfig: propAnimationConfig,
    disableAnimation: propDisableAnimation,
    motionSensitivity,
    ...rest
  } = props;

  // Get accordion context
  const accordionContext = useContext(AccordionContext);

  if (!accordionContext) {
    throw new Error('AccordionDetails must be used within an Accordion');
  }

  const {
    expanded,
    glass: contextGlass,
    animationConfig: contextAnimationConfig,
    disableAnimation: contextDisableAnimation
  } = accordionContext;

  // Prioritize props over context for animation settings
  const finalAnimationConfig = propAnimationConfig ?? contextAnimationConfig;
  const finalDisableAnimation = propDisableAnimation ?? contextDisableAnimation;
  
  // Reduced motion check only needed here to determine immediate state
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !(finalDisableAnimation ?? prefersReducedMotion);

  // Merge props with context for glass
  const finalGlass = propGlass !== undefined ? propGlass : contextGlass;
  const paddingValue = getPadding(padding);

  // State for content height
  const [contentHeight, setContentHeight] = useState(0);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Measure content height
  useEffect(() => {
    if (contentWrapperRef.current) {
      // Use ResizeObserver for accurate height changes
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContentHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(contentWrapperRef.current);
      // Initial measurement
      setContentHeight(contentWrapperRef.current.scrollHeight);
      return () => resizeObserver.disconnect();
    }
    return () => {};
  }, [children]); // Re-measure if children change

  // Spring animation for height/opacity
  const defaultSpringConfig = { tension: 300, friction: 30 };
  const springConfig = finalAnimationConfig as Partial<GalileoSpringConfig> | undefined;
  const finalConfig = springConfig ? { ...defaultSpringConfig, ...springConfig } : defaultSpringConfig;

  const { value: animProgress } = useGalileoStateSpring(expanded ? 1 : 0, {
    ...finalConfig,
    // Pass immediate flag based on combined disable/reduced motion state
    immediate: !shouldAnimate, 
  });

  // Calculate animated style based on shouldAnimate
  const animatedStyle: React.CSSProperties = shouldAnimate ? {
    height: `${animProgress * contentHeight}px`,
    opacity: animProgress,
    // Use visibility to prevent interaction when collapsed, even if opacity > 0 during animation
    visibility: animProgress > 0.01 ? 'visible' : 'hidden', 
  } : {
    height: expanded ? 'auto' : '0px',
    opacity: expanded ? 1 : 0,
    visibility: expanded ? 'visible' : 'hidden',
  };

  const Root = DetailsRoot as unknown as React.ElementType;

  return (
    <Root
      as={component}
      ref={ref}
      className={className}
      style={{...style, ...animatedStyle}}
      $expanded={expanded}
      $glass={finalGlass}
      $padding={paddingValue}
      {...rest}
    >
      <ContentWrapper ref={contentWrapperRef}>{children}</ContentWrapper>
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
