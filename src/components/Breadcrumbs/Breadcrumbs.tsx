import React, { forwardRef, Fragment, useRef, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { accessibleAnimation } from '../../animations/accessibleAnimation';
import { fadeIn } from '../../animations/keyframes/basic';
import { SpringPresets } from '../../animations/physics/springPhysics';
import { useZSpaceAnimation } from '../../animations/dimensional/ZSpaceAnimation';
import { glassGlow } from '../../core/mixins/glowEffects';
import { glassBorder } from '../../core/mixins/glassBorder';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useGalileoStateSpring, GalileoStateSpringOptions } from '../../hooks/useGalileoStateSpring';

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
   * Number of items to show before collapse
   */
  itemsBeforeCollapse?: number;

  /**
   * Number of items to show after collapse
   */
  itemsAfterCollapse?: number;

  /**
   * The text to display for the collapsed items
   */
  expandText?: string;

  /**
   * If provided, defines the role attribute for the component
   */
  role?: string;

  /**
   * The variant of the breadcrumbs
   */
  variant?: 'standard' | 'glass' | 'flat' | 'dimensional' | 'elevated';

  /**
   * The color of the breadcrumbs
   */
  color?: 'primary' | 'secondary' | 'default' | 'info' | 'success' | 'warning' | 'error';

  /**
   * If true, the breadcrumbs will have a subtle animation
   */
  animated?: boolean;

  /**
   * If true, enables physics-based hover states
   */
  physicsEnabled?: boolean;

  /**
   * If true, provides z-space depth between breadcrumb items
   */
  zSpaceDepth?: boolean;

  /**
   * The depth level between items (0-10)
   */
  depthLevel?: number;

  /**
   * If true, enables collapsible behavior for deep paths
   */
  collapsible?: boolean;

  /**
   * If true, breadcrumbs will show expand/collapse icon
   */
  showExpandIcon?: boolean;

  /**
   * If true, breadcrumbs will have a background
   */
  withBackground?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Optional click handler for collapsible breadcrumbs
   */
  onExpandClick?: () => void;

  /**
   * Optional icon to display before each breadcrumb item
   */
  itemIcon?: React.ReactNode;

  /**
   * If true, enables magnetic effect on hover
   */
  magnetic?: boolean;

  /**
   * Strength of the magnetic effect (0-1)
   */
  magneticStrength?: number;
}

// Get color by name
const getColorByName = (color: string): string => {
  switch (color) {
    case 'primary':
      return '#6366F1';
    case 'secondary':
      return '#8B5CF6';
    case 'info':
      return '#3B82F6';
    case 'success':
      return '#10B981';
    case 'warning':
      return '#F59E0B';
    case 'error':
      return '#EF4444';
    default:
      return '#64748B'; // default slate
  }
};

// Styled components
const BreadcrumbsContainer = styled.nav<{
  $variant: string;
  $color: string;
  $animated: boolean;
  $withBackground: boolean;
}>`
  display: flex;
  align-items: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  line-height: 1.5;
  width: fit-content;

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
        ${glassSurface({
          backgroundOpacity: 0.1,
          blurStrength: 'medium',
          themeContext: createThemeContext(props.theme)
        })}
      `;
    }

    if (props.$variant === 'dimensional') {
      return css`
        color: white;
        padding: 8px 14px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.1);
        ${glassSurface({
          backgroundOpacity: 0.12,
          blurStrength: 'high',
          themeContext: createThemeContext(props.theme)
        })}
        transform-style: preserve-3d;
        perspective: 800px;
      `;
    }

    if (props.$variant === 'elevated') {
      return css`
        color: white;
        padding: 8px 16px;
        border-radius: 10px;
        background-color: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 
          0 4px 12px rgba(0, 0, 0, 0.1), 
          0 1px 3px rgba(0, 0, 0, 0.08),
          inset 0 1px 1px rgba(255, 255, 255, 0.15);
        ${glassSurface({
          backgroundOpacity: 0.15,
          blurStrength: 'high',
          themeContext: createThemeContext(props.theme)
        })}
      `;
    }

    if (props.$variant === 'flat') {
      return css`
        color: ${getColorByName(props.$color)};
        padding: 8px 12px;
        border-radius: 6px;
        background-color: ${props.$withBackground ? 'rgba(0, 0, 0, 0.03)' : 'transparent'};
      `;
    }

    // standard
    return css`
      color: ${getColorByName('default')};
      padding: ${props.$withBackground ? '8px 12px' : '0'};
      background-color: ${props.$withBackground ? 'rgba(0, 0, 0, 0.02)' : 'transparent'};
      border-radius: ${props.$withBackground ? '6px' : '0'};
    `;
  }}

  /* Glass glow for glass variants */
  ${props =>
    (props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated') &&
    props.$color !== 'default' &&
    glassGlow({
      intensity: 'minimal',
      color: props.$color,
      themeContext: createThemeContext(props.theme),
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
  $depth?: number;
  $zSpaceDepth?: boolean;
}>`
  display: flex;
  align-items: center;
  margin: 0 8px;
  color: ${props => (props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated') ? 'rgba(255, 255, 255, 0.5)' : '#94A3B8'};
  user-select: none;
  
  ${props => props.$zSpaceDepth && css`
    transform: translateZ(${(props.$depth || 0) * -2}px);
    transition: transform 0.3s ease;
  `}
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
  $depth?: number;
  $zSpaceDepth?: boolean;
  $magnetic?: boolean;
  $physicsEnabled?: boolean;
}>`
  display: flex;
  align-items: center;
  position: relative;
  
  ${props => props.$zSpaceDepth && css`
    transform: translateZ(${(props.$depth || 0) * -5}px);
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  `}

  ${props => props.$magnetic && props.$physicsEnabled && css`
    &:hover {
      cursor: pointer;
    }
  `}

  a {
    color: ${props => {
      if (props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated') {
        return props.$isLast ? 'white' : 'rgba(255, 255, 255, 0.7)';
      }
      return props.$isLast ? getColorByName(props.$color) : '#64748B';
    }};
    text-decoration: ${props => (props.$isLast ? 'none' : 'underline')};
    font-weight: ${props => (props.$isLast ? '500' : '400')};
    transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
    display: flex;
    align-items: center;
    position: relative;
    border-radius: 4px;
    padding: 2px 4px;

    /* Physics interaction */
    ${props => props.$physicsEnabled && !props.$isLast && css`
      &:hover {
        text-decoration: underline;
        color: ${props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated' ? 'white' : getColorByName(props.$color)};
        transform: scale(1.05);
      }
      
      &:active {
        transform: scale(0.98);
        transition: all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1);
      }
    `}

    /* Non-physics hover */
    ${props => !props.$physicsEnabled && !props.$isLast && css`
      &:hover {
        text-decoration: underline;
        color: ${props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated' ? 'white' : getColorByName(props.$color)};
      }
    `}
    
    /* Icon styles */
    .breadcrumb-icon {
      margin-right: 6px;
      font-size: 1rem;
      opacity: ${props => props.$isLast ? 1 : 0.75};
    }
  }

  /* Just the text (not a link) */
  &:not(a) {
    color: ${props => {
      if (props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated') {
        return props.$isLast ? 'white' : 'rgba(255, 255, 255, 0.7)';
      }
      return props.$isLast ? getColorByName(props.$color) : '#64748B';
    }};
    font-weight: ${props => (props.$isLast ? '500' : '400')};
    display: flex;
    align-items: center;
    
    /* Icon styles for non-links */
    .breadcrumb-icon {
      margin-right: 6px;
      font-size: 1rem;
      opacity: ${props => props.$isLast ? 1 : 0.75};
    }
  }
  
  /* Last item gets special styling */
  ${props => props.$isLast && props.$variant === 'dimensional' && css`
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg, 
        transparent, 
        ${getColorByName(props.$color)}40, 
        ${getColorByName(props.$color)}70,
        ${getColorByName(props.$color)}40, 
        transparent
      );
      border-radius: 2px;
      opacity: 0.7;
    }
  `}
`;

const CollapsedItem = styled.li<{
  $variant: string;
  $physicsEnabled?: boolean;
  $zSpaceDepth?: boolean;
  $color: string;
}>`
  display: flex;
  align-items: center;
  color: ${props => (props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated') ? 'rgba(255, 255, 255, 0.5)' : '#94A3B8'};
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.25s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  ${props => props.$zSpaceDepth && css`
    transform: translateZ(-5px);
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  `}
  
  ${props => props.$physicsEnabled && css`
    &:hover {
      color: ${props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated' ? 'white' : getColorByName(props.$color)};
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
      transition: all 0.1s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
  `}
  
  ${props => !props.$physicsEnabled && css`
    &:hover {
      color: ${props.$variant === 'glass' || props.$variant === 'dimensional' || props.$variant === 'elevated' ? 'white' : getColorByName(props.$color)};
      text-decoration: underline;
    }
  `}
  
  /* Icon styles */
  .collapse-icon {
    margin-left: 4px;
    font-size: 1rem;
    transition: transform 0.2s ease;
  }
  
  &:hover .collapse-icon {
    transform: rotate(180deg);
  }
`;

const ExpandIcon = () => (
  <svg className="collapse-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * Enhanced Breadcrumbs Component
 *
 * A navigation component that shows the page hierarchy with physics-based interactions,
 * z-space depth, and advanced styling options.
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
    physicsEnabled = false,
    zSpaceDepth = false,
    depthLevel = 3,
    collapsible = true,
    showExpandIcon = false,
    withBackground = false,
    className,
    onExpandClick,
    itemIcon,
    magnetic = false,
    magneticStrength = 0.5,
    ...rest
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();
  
  // Spring animation for hover effect
  const { value: hoverScale } = useGalileoStateSpring(hoveredItem !== null ? 1.05 : 1, {
    ...(prefersReducedMotion ? SpringPresets.REDUCED_MOTION : SpringPresets.GENTLE),
    immediate: prefersReducedMotion
  });

  // Z-space animation hook
  const { containerStyle } = useZSpaceAnimation({
    enabled: zSpaceDepth && !prefersReducedMotion,
    perspective: 1000,
    intensity: 0.3,
  });

  const childrenArray = React.Children.toArray(children).filter(Boolean);
  const totalItems = childrenArray.length;
  const shouldCollapse = collapsible && maxItems !== undefined && totalItems > maxItems && !isExpanded;

  // Handle click on collapsed items
  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
    if (onExpandClick) {
      onExpandClick();
    }
  };

  // Handle mouse enter/leave for physics hover effect
  const handleMouseEnter = (index: number) => {
    if (physicsEnabled && !prefersReducedMotion) {
      setHoveredItem(index);
    }
  };

  const handleMouseLeave = () => {
    if (physicsEnabled && !prefersReducedMotion) {
      setHoveredItem(null);
    }
  };

  // Render items with separators
  const renderItems = () => {
    if (!shouldCollapse) {
      return childrenArray.map((child, index) => {
        const isLast = index === totalItems - 1;
        const itemDepth = zSpaceDepth ? (isLast ? 0 : totalItems - index - 1) * depthLevel / 10 : 0;
        
        return (
          <Fragment key={index}>
            <BreadcrumbItem 
              ref={el => itemRefs.current[index] = el}
              $isLast={isLast} 
              $variant={variant} 
              $color={color}
              $depth={itemDepth}
              $zSpaceDepth={zSpaceDepth}
              $magnetic={magnetic}
              $physicsEnabled={physicsEnabled}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              style={hoveredItem === index ? { transform: `scale(${hoverScale})` } : undefined}
            >
              {React.isValidElement(child) 
                ? React.cloneElement(child as React.ReactElement, {
                    children: (
                      <>
                        {itemIcon && <span className="breadcrumb-icon">{itemIcon}</span>}
                        {(child as React.ReactElement).props.children}
                      </>
                    )
                  })
                : child
              }
            </BreadcrumbItem>
            {index < totalItems - 1 && (
              <SeparatorContainer 
                $variant={variant}
                $depth={itemDepth - 0.2}
                $zSpaceDepth={zSpaceDepth}
                aria-hidden
              >
                {separator}
              </SeparatorContainer>
            )}
          </Fragment>
        );
      });
    }

    // Calculate items to render for collapsed view
    const startItems = itemsBeforeCollapse;
    const endItems = Math.max(0, totalItems - itemsAfterCollapse);

    // Items before collapse
    const startChildren = childrenArray.slice(0, startItems).map((child, index) => {
      const itemDepth = zSpaceDepth ? (totalItems - index - 1) * depthLevel / 10 : 0;
      
      return (
        <Fragment key={index}>
          <BreadcrumbItem 
            ref={el => itemRefs.current[index] = el}
            $isLast={false} 
            $variant={variant} 
            $color={color}
            $depth={itemDepth}
            $zSpaceDepth={zSpaceDepth}
            $magnetic={magnetic}
            $physicsEnabled={physicsEnabled}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            style={hoveredItem === index ? { transform: `scale(${hoverScale})` } : undefined}
          >
            {React.isValidElement(child) 
              ? React.cloneElement(child as React.ReactElement, {
                  children: (
                    <>
                      {itemIcon && <span className="breadcrumb-icon">{itemIcon}</span>}
                      {(child as React.ReactElement).props.children}
                    </>
                  )
                })
              : child
            }
          </BreadcrumbItem>
          <SeparatorContainer 
            $variant={variant}
            $depth={itemDepth - 0.2}
            $zSpaceDepth={zSpaceDepth}
            aria-hidden
          >
            {separator}
          </SeparatorContainer>
        </Fragment>
      );
    });

    // Collapse indicator
    const collapseItem = (
      <Fragment key="collapsed">
        <CollapsedItem 
          $variant={variant}
          $physicsEnabled={physicsEnabled}
          $zSpaceDepth={zSpaceDepth}
          $color={color}
          onClick={handleExpandClick}
          aria-label="Expand breadcrumbs"
          role="button"
          tabIndex={0}
        >
          {expandText}
          {showExpandIcon && <ExpandIcon />}
        </CollapsedItem>
        <SeparatorContainer 
          $variant={variant}
          $depth={1}
          $zSpaceDepth={zSpaceDepth}
          aria-hidden
        >
          {separator}
        </SeparatorContainer>
      </Fragment>
    );

    // Items after collapse
    const endChildren = childrenArray.slice(endItems).map((child, index) => {
      const actualIndex = index + endItems;
      const isLast = index === childrenArray.slice(endItems).length - 1;
      const itemDepth = zSpaceDepth ? (isLast ? 0 : (totalItems - actualIndex - 1) * depthLevel / 10) : 0;
      
      return (
        <Fragment key={actualIndex}>
          <BreadcrumbItem 
            ref={el => itemRefs.current[actualIndex] = el}
            $isLast={isLast} 
            $variant={variant} 
            $color={color}
            $depth={itemDepth}
            $zSpaceDepth={zSpaceDepth}
            $magnetic={magnetic}
            $physicsEnabled={physicsEnabled}
            onMouseEnter={() => handleMouseEnter(actualIndex)}
            onMouseLeave={handleMouseLeave}
            style={hoveredItem === actualIndex ? { transform: `scale(${hoverScale})` } : undefined}
          >
            {React.isValidElement(child) 
              ? React.cloneElement(child as React.ReactElement, {
                  children: (
                    <>
                      {itemIcon && <span className="breadcrumb-icon">{itemIcon}</span>}
                      {(child as React.ReactElement).props.children}
                    </>
                  )
                })
              : child
            }
          </BreadcrumbItem>
          {!isLast && (
            <SeparatorContainer 
              $variant={variant}
              $depth={itemDepth - 0.2}
              $zSpaceDepth={zSpaceDepth}
              aria-hidden
            >
              {separator}
            </SeparatorContainer>
          )}
        </Fragment>
      );
    });

    return [...startChildren, collapseItem, ...endChildren];
  };

  // Apply magnetic effect to breadcrumb items
  useEffect(() => {
    if (magnetic && !prefersReducedMotion && physicsEnabled) {
      // Implementation would need a proper DOM-based approach which is beyond the scope
      // of styled-components. In a real implementation, we would use a DOM manipulation
      // approach here with the magneticEffect utility.
    }
  }, [magnetic, prefersReducedMotion, physicsEnabled]);

  return (
    <BreadcrumbsContainer
      ref={ref}
      role={role}
      className={className}
      $variant={variant}
      $color={color}
      $animated={animated}
      $withBackground={withBackground}
      style={zSpaceDepth ? containerStyle : undefined}
      aria-label="Breadcrumbs navigation"
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
 * Enhanced breadcrumbs component with glass morphism styling, z-space depth,
 * and physics-based interactions.
 */
export const GlassBreadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>((props, ref) => {
  const { 
    className, 
    variant = 'glass', 
    zSpaceDepth = true,
    physicsEnabled = true,
    withBackground = true,
    ...rest 
  } = props;

  return (
    <Breadcrumbs
      ref={ref}
      className={`glass-breadcrumbs ${className || ''}`}
      variant={variant}
      zSpaceDepth={zSpaceDepth}
      physicsEnabled={physicsEnabled}
      withBackground={withBackground}
      {...rest}
    />
  );
});

GlassBreadcrumbs.displayName = 'GlassBreadcrumbs';