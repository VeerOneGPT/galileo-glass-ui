import React, { forwardRef, useState, useEffect, useCallback, useRef, useMemo, ForwardedRef, ReactNode } from 'react';
import styled from 'styled-components';

import { glowEffects } from '../../core/mixins/effects/glowEffects';
import { glassBorder } from '../../core/mixins/glassBorder';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeUtils';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Badge } from '../Badge/Badge';
import { Box } from '../Box';
import { Button } from '../Button';
import { Icon } from '../Icon/Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import { useMultiSpring } from '../../animations/physics/useMultiSpring';
import { AnimationProps } from '../../types/animation';
import { useAnimationContext } from '../../contexts/AnimationContext';
import { useGalileoSprings } from '../../hooks/useGalileoSprings';
import { SpringConfig, SpringPresets } from '../../animations/physics/springPhysics';
import { PhysicsConfig } from '../../animations/physics/galileoPhysicsSystem';

import { GlassNavigationProps, NavigationItem } from './types';

const StyledGlassNavigation = styled.nav<{
  $position: GlassNavigationProps['position'];
  $variant: GlassNavigationProps['variant'];
  $glassIntensity: number;
  $sticky: boolean;
  $compact: boolean;
  $centered: boolean;
  $zIndex: number;
  $width?: string | number;
}>`
  display: flex;
  flex-direction: ${({ $position }) =>
    $position === 'left' || $position === 'right' ? 'column' : 'row'};
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? 'center' : 'space-between')};
  padding: ${({ $compact }) => ($compact ? '0.5rem 1rem' : '0.75rem 1.5rem')};
  width: ${({ $position, $width }) =>
    $position === 'left' || $position === 'right'
      ? $width
        ? typeof $width === 'number'
          ? `${$width}px`
          : $width
        : '240px'
      : '100%'};
  height: ${({ $position }) => ($position === 'left' || $position === 'right' ? '100%' : 'auto')};
  box-sizing: border-box;
  z-index: ${({ $zIndex }) => $zIndex};

  ${({ $sticky }) =>
    $sticky &&
    `
    position: sticky;
    top: 0;
  `}

  ${({ theme, $glassIntensity, $variant }) => {
    const themeContext = createThemeContext(theme);
    return glassSurface({
      elevation: 'medium',
      backgroundOpacity: $variant === 'minimal' ? 0.5 : 0.75,
      blurStrength: $variant === 'minimal' ? '5px' : '10px',
      themeContext,
    });
  }}
  
  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '1px',
      opacity: 0.3,
      themeContext,
    });
  }}
  
  ${({ theme, $glassIntensity, $variant }) => {
    if ($variant === 'prominent') {
      const themeContext = createThemeContext(theme);
      return glowEffects.glassGlow({
        intensity: 'medium',
        color: 'primary',
        themeContext,
      });
    }
    return '';
  }}
  
  ${({ $position }) => {
    switch ($position) {
      case 'left':
        return `
          left: 0;
          height: 100vh;
        `;
      case 'right':
        return `
          right: 0;
          height: 100vh;
        `;
      case 'bottom':
        return `
          bottom: 0;
          width: 100%;
        `;
      case 'top':
      default:
        return `
          top: 0;
          width: 100%;
        `;
    }
  }}
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

const NavItemsContainer = styled.ul<{
  $position: GlassNavigationProps['position'];
  $variant: GlassNavigationProps['variant'];
}>`
  display: flex;
  flex-direction: ${({ $position }) =>
    $position === 'left' || $position === 'right' ? 'column' : 'row'};
  list-style: none;
  margin: 0;
  padding: 0;
  gap: ${({ $variant }) => ($variant === 'minimal' ? '0.75rem' : '1rem')};
  flex: 1;
  align-items: center;
  ${({ $position }) =>
    ($position === 'left' || $position === 'right') &&
    `
      margin-top: 1.5rem;
      width: 100%;
    `}
`;

const LogoContainer = styled.div<{
  $position: GlassNavigationProps['position'];
}>`
  display: flex;
  align-items: center;
  ${({ $position }) =>
    ($position === 'left' || $position === 'right') &&
    `
      justify-content: center;
      width: 100%;
      padding: 1rem 0;
    `}
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ActiveIndicator = styled.div.attrs<{ $style: React.CSSProperties }>(props => ({
  style: props.$style,
}))<{ $style: React.CSSProperties }>`
  position: absolute;
  background-color: ${props => props.theme.palette?.primary?.main || '#1976d2'};
  border-radius: 2px;
  z-index: 0;
  pointer-events: none;
  will-change: left, top, width, height;
`;

const NavItem = styled.li<{
  $isActive: boolean;
  $disabled: boolean;
  $variant: GlassNavigationProps['variant'];
}>`
  position: relative;
  z-index: 1;

  a,
  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: ${({ $variant }) => ($variant === 'minimal' ? '0.4rem 0.6rem' : '0.6rem 1rem')};
    text-decoration: none;
    color: ${({ theme, $isActive }) =>
      $isActive
        ? theme.palette?.primary?.main || '#1976d2'
        : theme.palette?.text?.primary || 'inherit'};
    border-radius: 6px;
    font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};
    font-size: ${({ $variant }) => ($variant === 'minimal' ? '0.875rem' : '0.9375rem')};
    border: none;
    background: none;
    cursor: pointer;
    transition: transform 0.1s;
    opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &:active {
      transform: scale(0.98);
    }
  }
`;

const ChildrenContainer = styled.ul<{
  $isOpen: boolean;
}>`
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  margin-top: 0.25rem;
  overflow: hidden;
  will-change: max-height, opacity;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: inherit;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const NavDivider = styled.div<{
  $position: GlassNavigationProps['position'];
}>`
  ${({ $position }) =>
    $position === 'left' || $position === 'right'
      ? `
        width: 80%;
        height: 1px;
        margin: 0.75rem auto;
      `
      : `
        width: 1px;
        height: 1.5rem;
        margin: 0 0.75rem;
      `}
  background-color: rgba(255, 255, 255, 0.2);
`;

const CollapsibleButton = styled.button<{
  $collapsed: boolean;
}>`
  position: absolute;
  ${({ $collapsed }) => ($collapsed ? 'right: -12px;' : 'left: calc(100% - 12px);')}
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    transition: transform 0.2s;
    transform: rotate(${({ $collapsed }) => ($collapsed ? '0deg' : '180deg')});
  }
`;

/**
 * A glass-styled navigation component with various layout options
 */
export const GlassNavigation = forwardRef<HTMLDivElement, GlassNavigationProps>(
  (
    {
      items = [],
      activeItem,
      onItemClick,
      onMenuToggle,
      position = 'top',
      variant = 'standard',
      className,
      style,
      logo,
      actions,
      showDivider = false,
      glassIntensity = 0.7,
      sticky = false,
      maxWidth,
      compact = false,
      centered = false,
      zIndex = 100,
      width,
      initialExpandedItems = [],
      collapsible = false,
      initialCollapsed = false,
      ...rest
    }: GlassNavigationProps,
    ref: ForwardedRef<HTMLDivElement>
  ): React.ReactElement | null => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>(initialExpandedItems);
    const [collapsed, setCollapsed] = useState(initialCollapsed);
    const prefersReducedMotion = useReducedMotion();
    const navItemsRef = useRef<HTMLUListElement>(null);
    const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
    const { defaultSpring } = useAnimationContext();

    const finalChildAnimationConfig = useMemo(() => {
      const baseFallback: SpringConfig = SpringPresets.DEFAULT; 
      let resolvedConfig: SpringConfig;

      if (typeof defaultSpring === 'object' && defaultSpring !== null) {
        resolvedConfig = { ...baseFallback, ...defaultSpring };
      } else if (typeof defaultSpring === 'string' && defaultSpring in SpringPresets) {
        resolvedConfig = SpringPresets[defaultSpring as keyof typeof SpringPresets];
      } else {
        resolvedConfig = baseFallback;
      }
      
      return resolvedConfig;
    }, [defaultSpring]);

    const disableChildAnimation = useMemo(() => {
      return prefersReducedMotion;
    }, [prefersReducedMotion]);

    const initialIndicatorStyle = { left: 0, top: 0, width: 0, height: 0, opacity: 0 }; 
    const { values: indicatorStyle, start: animateIndicator } = useMultiSpring({
      from: initialIndicatorStyle,
      animationConfig: { tension: 300, friction: 30 },
      autoStart: false,
    });

    useEffect(() => {
      if (disableChildAnimation) {
        animateIndicator({ 
          to: { ...indicatorStyle, opacity: 0 }, 
        });
        return;
      }

      const activeElement = activeItem ? itemRefs.current[activeItem] : null;
      const containerElement = navItemsRef.current;

      if (activeElement && containerElement) {
        const itemRect = activeElement.getBoundingClientRect();
        const containerRect = containerElement.getBoundingClientRect();

        let newStyle: typeof initialIndicatorStyle;
        if (position === 'left' || position === 'right') {
          newStyle = {
            left: position === 'left' ? 0 : containerRect.width - 3,
            top: itemRect.top - containerRect.top,
            width: 3,
            height: itemRect.height,
            opacity: 1,
          };
        } else {
          newStyle = {
            left: itemRect.left - containerRect.left,
            top: position === 'top' ? containerRect.height - 3 : 0,
            width: itemRect.width,
            height: 3,
            opacity: 1,
          };
        }
        animateIndicator({ to: newStyle });
      } else {
        animateIndicator({ to: { ...indicatorStyle, opacity: 0 } });
      }
    }, [activeItem, position, collapsed, disableChildAnimation, animateIndicator, indicatorStyle]);

    const toggleMobileMenu = useCallback(() => {
      const newState = !mobileMenuOpen;
      setMobileMenuOpen(newState);
      if (onMenuToggle) {
        onMenuToggle(newState);
      }
    }, [mobileMenuOpen, onMenuToggle]);

    const handleItemClick = useCallback(
      (id: string, item: NavigationItem) => {
        if (item.onClick) {
          item.onClick();
        }

        if (onItemClick) {
          onItemClick(id);
        }

        if (item.children && item.children.length > 0) {
          setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
          );
        }

        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          if (onMenuToggle) {
            onMenuToggle(false);
          }
        }
      },
      [onItemClick, mobileMenuOpen, onMenuToggle]
    );

    const toggleCollapsed = useCallback(() => {
      setCollapsed(prev => !prev);
    }, []);

    const childSpringTargets = useMemo(() => {
      const targets: Record<string, number> = {};
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          const isExpanded = expandedItems.includes(item.id);
          targets[`${item.id}_opacity`] = isExpanded ? 1 : 0;
          targets[`${item.id}_maxHeight`] = isExpanded ? 500 : 0;
        }
      });
      return targets;
    }, [items, expandedItems]);

    const childSpringValues = useGalileoSprings(childSpringTargets, {
      config: finalChildAnimationConfig,
      immediate: disableChildAnimation,
    });

    const renderNavItem = useCallback(
      (item: NavigationItem, level = 0): ReactNode => {
        const isActive = activeItem === item.id || item.active;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);

        const assignRef = (el: HTMLLIElement | null) => {
          itemRefs.current[item.id] = el;
        };

        if (item.customElement) {
          return (
            <NavItem
              ref={assignRef}
              key={item.id}
              $isActive={isActive}
              $disabled={!!item.disabled}
              $variant={variant}
              className={item.className}
            >
              {item.customElement}
            </NavItem>
          );
        }

        const content = (
          <>
            {item.icon && <span className="nav-item-icon">{item.icon}</span>}

            {(!collapsed || level > 0) && <span className="nav-item-label">{item.label}</span>}

            {item.badge && (
              <Badge content={item.badge} color="primary" size="small">
                <div />
              </Badge>
            )}

            {hasChildren && !collapsed && (
              <span className="nav-item-expand-icon">
                <Icon>{isExpanded ? 'expand_less' : 'expand_more'}</Icon>
              </span>
            )}
          </>
        );

        const navItem = item.href ? (
          <a
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            onClick={e => {
              if (item.disabled) {
                e.preventDefault();
                return;
              }
              handleItemClick(item.id, item);
            }}
          >
            {content}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => handleItemClick(item.id, item)}
            disabled={item.disabled}
          >
            {content}
          </button>
        );

        const childrenStyle = {
          opacity: childSpringValues[`${item.id}_opacity`] ?? 0,
          maxHeight: `${childSpringValues[`${item.id}_maxHeight`] ?? 0}px`,
          overflow: 'hidden',
          visibility: ((childSpringValues[`${item.id}_opacity`] ?? 0) > 0.01 
                         ? 'visible' 
                         : 'hidden') as React.CSSProperties['visibility'], 
        };

        return (
          <NavItem
            ref={assignRef}
            key={item.id}
            $isActive={isActive}
            $disabled={!!item.disabled}
            $variant={variant}
            className={item.className}
          >
            {item.tooltip && !collapsed ? (
              <Tooltip title={item.tooltip}>{navItem}</Tooltip>
            ) : collapsed && level === 0 ? (
              <Tooltip title={item.label}>{navItem}</Tooltip>
            ) : (
              navItem
            )}

            {hasChildren && (
              <ChildrenContainer $isOpen={isExpanded && !collapsed} style={childrenStyle}>
                {item.children?.map(child => renderNavItem(child, level + 1))}
              </ChildrenContainer>
            )}
          </NavItem>
        );
      },
      [activeItem, expandedItems, collapsed, variant, handleItemClick, childSpringValues]
    );

    return (
      <StyledGlassNavigation
        ref={ref as React.RefObject<HTMLDivElement>}
        $position={position}
        $variant={variant}
        $glassIntensity={glassIntensity}
        $sticky={sticky}
        $compact={compact}
        $centered={centered}
        $zIndex={zIndex}
        $width={width}
        className={className}
        style={{
          ...style,
          maxWidth: maxWidth
            ? typeof maxWidth === 'number'
              ? `${maxWidth}px`
              : maxWidth
            : undefined,
        }}
        {...rest}
      >
        <MobileMenuButton onClick={toggleMobileMenu}>
          <Icon>{mobileMenuOpen ? 'close' : 'menu'}</Icon>
        </MobileMenuButton>

        {logo && <LogoContainer $position={position}>{logo}</LogoContainer>}

        <NavItemsContainer
          ref={navItemsRef}
          $position={position}
          $variant={variant}
          className={mobileMenuOpen ? 'mobile-open' : ''}
        >
          {!prefersReducedMotion && <ActiveIndicator $style={indicatorStyle as React.CSSProperties} />}
          {items.map(item => renderNavItem(item))}
        </NavItemsContainer>

        {showDivider && <NavDivider $position={position} />}

        {actions && <ActionsContainer>{actions}</ActionsContainer>}

        {collapsible && (position === 'left' || position === 'right') && (
          <CollapsibleButton
            $collapsed={collapsed}
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand' : 'Collapse'}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <Icon>
              {position === 'left'
                ? collapsed
                  ? 'chevron_right'
                  : 'chevron_left'
                : collapsed
                ? 'chevron_left'
                : 'chevron_right'}
            </Icon>
          </CollapsibleButton>
        )}
      </StyledGlassNavigation>
    );
  }
);

GlassNavigation.displayName = 'GlassNavigation';
