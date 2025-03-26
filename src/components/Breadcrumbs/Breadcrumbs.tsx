import React, { forwardRef, Fragment } from 'react';
import styled, { css } from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn } from '../../animations/keyframes/basic';
import { glassGlow } from '../../core/mixins/glowEffects';
import { createThemeContext } from '../../core/themeContext';

export interface BreadcrumbsProps {
  /**
   * The content of the component
   */
  children: React.ReactNode;

  /**
   * The character(s) used to separate the breadcrumbs
   */
  separator?: React.ReactNode;

  /**
   * Maximum number of breadcrumbs to display. When there are more breadcrumbs,
   * only the first and last will be shown, with an ellipsis in between (collapsed).
   */
  maxItems?: number;

  /**
   * Function to add props to the element that appears when the breadcrumbs are collapsed
   */
  itemsBeforeCollapse?: number;

  /**
   * Function to add props to the element that appears when the breadcrumbs are collapsed
   */
  itemsAfterCollapse?: number;

  /**
   * The component used for the collapse element
   */
  expandText?: string;

  /**
   * If provided, defines the role attribute for the component
   */
  role?: string;

  /**
   * The variant of the breadcrumbs
   */
  variant?: 'standard' | 'glass';

  /**
   * The color of the breadcrumbs
   */
  color?: 'primary' | 'secondary' | 'default';

  /**
   * If true, the breadcrumbs will have a subtle animation
   */
  animated?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;
}

// Get color by name
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    default:
      return '#64748B'; // default slate
  }
};

// Styled components
const BreadcrumbsContainer = styled.nav<{
  $variant: string;
  $color: string;
  $animated: boolean;
}>`
  display: flex;
  align-items: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  line-height: 1.5;

  /* Variant styles */
  ${props => {
    if (props.$variant === 'glass') {
      return css`
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        background-color: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      `;
    }

    // standard
    return css`
      color: ${getColorByName('default')};
    `;
  }}

  /* Glass glow for glass variant */
  ${props =>
    props.$variant === 'glass' &&
    props.$color !== 'default' &&
    glassGlow({
      intensity: 'minimal',
      color: props.$color,
      themeContext: createThemeContext({}),
    })}
  
  /* Animation */
  ${props =>
    props.$animated &&
    accessibleAnimation({
      animation: fadeIn,
      duration: 0.5,
      easing: 'ease-out',
    })}
`;

const SeparatorContainer = styled.li<{
  $variant: string;
}>`
  display: flex;
  align-items: center;
  margin: 0 8px;
  color: ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.5)' : '#94A3B8')};
  user-select: none;
`;

const BreadcrumbList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const BreadcrumbItem = styled.li<{
  $isLast: boolean;
  $variant: string;
  $color: string;
}>`
  display: flex;
  align-items: center;

  a {
    color: ${props => {
      if (props.$variant === 'glass') {
        return props.$isLast ? 'white' : 'rgba(255, 255, 255, 0.7)';
      }
      return props.$isLast ? getColorByName(props.$color) : '#64748B';
    }};
    text-decoration: ${props => (props.$isLast ? 'none' : 'underline')};
    font-weight: ${props => (props.$isLast ? '500' : '400')};
    transition: all 0.2s ease;

    &:hover {
      text-decoration: underline;
      color: ${props => {
        if (props.$variant === 'glass') {
          return 'white';
        }
        return getColorByName(props.$color);
      }};
    }
  }

  /* Just the text (not a link) */
  &:not(a) {
    color: ${props => {
      if (props.$variant === 'glass') {
        return props.$isLast ? 'white' : 'rgba(255, 255, 255, 0.7)';
      }
      return props.$isLast ? getColorByName(props.$color) : '#64748B';
    }};
    font-weight: ${props => (props.$isLast ? '500' : '400')};
  }
`;

const CollapsedItem = styled.li<{
  $variant: string;
}>`
  display: flex;
  align-items: center;
  color: ${props => (props.$variant === 'glass' ? 'rgba(255, 255, 255, 0.5)' : '#94A3B8')};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

/**
 * Breadcrumbs Component
 *
 * A navigation component that shows the page hierarchy.
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>((props, ref) => {
  const {
    children,
    separator = '/',
    maxItems = 8,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 1,
    expandText = '...',
    role = 'navigation',
    variant = 'standard',
    color = 'primary',
    animated = false,
    className,
    ...rest
  } = props;

  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const totalItems = childrenArray.length;
  const shouldCollapse = maxItems !== undefined && totalItems > maxItems;

  // Render items with separators
  const renderItems = () => {
    if (!shouldCollapse) {
      return childrenArray.map((child, index) => (
        <Fragment key={index}>
          <BreadcrumbItem $isLast={index === totalItems - 1} $variant={variant} $color={color}>
            {child}
          </BreadcrumbItem>
          {index < totalItems - 1 && (
            <SeparatorContainer $variant={variant} aria-hidden>
              {separator}
            </SeparatorContainer>
          )}
        </Fragment>
      ));
    }

    // Calculate items to render for collapsed view
    const startItems = itemsBeforeCollapse;
    const endItems = Math.max(0, totalItems - itemsAfterCollapse);

    // Items before collapse
    const startChildren = childrenArray.slice(0, startItems).map((child, index) => (
      <Fragment key={index}>
        <BreadcrumbItem $isLast={false} $variant={variant} $color={color}>
          {child}
        </BreadcrumbItem>
        <SeparatorContainer $variant={variant} aria-hidden>
          {separator}
        </SeparatorContainer>
      </Fragment>
    ));

    // Collapse indicator
    const collapseItem = (
      <Fragment key="collapsed">
        <CollapsedItem $variant={variant}>{expandText}</CollapsedItem>
        <SeparatorContainer $variant={variant} aria-hidden>
          {separator}
        </SeparatorContainer>
      </Fragment>
    );

    // Items after collapse
    const endChildren = childrenArray.slice(endItems).map((child, index) => {
      const isLast = index === childrenArray.slice(endItems).length - 1;
      return (
        <Fragment key={index + endItems}>
          <BreadcrumbItem $isLast={isLast} $variant={variant} $color={color}>
            {child}
          </BreadcrumbItem>
          {!isLast && (
            <SeparatorContainer $variant={variant} aria-hidden>
              {separator}
            </SeparatorContainer>
          )}
        </Fragment>
      );
    });

    return [...startChildren, collapseItem, ...endChildren];
  };

  return (
    <BreadcrumbsContainer
      ref={ref}
      role={role}
      className={className}
      $variant={variant}
      $color={color}
      $animated={animated}
      {...rest}
    >
      <BreadcrumbList>{renderItems()}</BreadcrumbList>
    </BreadcrumbsContainer>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';

/**
 * GlassBreadcrumbs Component
 *
 * A breadcrumbs component with glass morphism styling.
 */
export const GlassBreadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>((props, ref) => {
  const { className, variant = 'glass', ...rest } = props;

  return (
    <Breadcrumbs
      ref={ref}
      className={`glass-breadcrumbs ${className || ''}`}
      variant={variant}
      {...rest}
    />
  );
});

GlassBreadcrumbs.displayName = 'GlassBreadcrumbs';
