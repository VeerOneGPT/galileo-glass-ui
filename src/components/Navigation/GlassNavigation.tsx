import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { GlassNavigationProps, NavigationItem } from './types';
import { Box } from '../Box';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Badge } from '../Badge';
import { Tooltip } from '../Tooltip';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins/glassSurface';
import { glassBorder } from '../../core/mixins/glassBorder';
import { glowEffects } from '../../core/mixins/effects/glowEffects';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
    $position === 'left' || $position === 'right' ? 'column' : 'row'
  };
  align-items: center;
  justify-content: ${({ $centered }) => $centered ? 'center' : 'space-between'};
  padding: ${({ $compact }) => $compact ? '0.5rem 1rem' : '0.75rem 1.5rem'};
  width: ${({ $position, $width }) => 
    ($position === 'left' || $position === 'right') 
      ? ($width ? (typeof $width === 'number' ? `${$width}px` : $width) : '240px')
      : '100%'
  };
  height: ${({ $position }) => 
    ($position === 'left' || $position === 'right') ? '100%' : 'auto'
  };
  box-sizing: border-box;
  z-index: ${({ $zIndex }) => $zIndex};
  
  ${({ $sticky }) => $sticky && `
    position: sticky;
    top: 0;
  `}
  
  ${({ theme, $glassIntensity, $variant }) => {
    const themeContext = createThemeContext(theme);
    return glassSurface({
      elevation: 'medium',
      backgroundOpacity: $variant === 'minimal' ? 0.5 : 0.75,
      blurStrength: $variant === 'minimal' ? '5px' : '10px',
      themeContext
    });
  }}
  
  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '1px',
      opacity: 0.3,
      themeContext
    });
  }}
  
  ${({ theme, $glassIntensity, $variant }) => {
    if ($variant === 'prominent') {
      const themeContext = createThemeContext(theme);
      return glowEffects.glassGlow({
        intensity: 'medium',
        color: 'primary',
        themeContext
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
    $position === 'left' || $position === 'right' ? 'column' : 'row'
  };
  list-style: none;
  margin: 0;
  padding: 0;
  gap: ${({ $variant }) => $variant === 'minimal' ? '0.75rem' : '1rem'};
  flex: 1;
  align-items: center;
  ${({ $position }) => 
    ($position === 'left' || $position === 'right') && `
      margin-top: 1.5rem;
      width: 100%;
    `
  }
`;

const LogoContainer = styled.div<{
  $position: GlassNavigationProps['position'];
}>`
  display: flex;
  align-items: center;
  ${({ $position }) => 
    ($position === 'left' || $position === 'right') && `
      justify-content: center;
      width: 100%;
      padding: 1rem 0;
    `
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const NavItem = styled.li<{
  $isActive: boolean;
  $disabled: boolean;
  $variant: GlassNavigationProps['variant'];
}>`
  position: relative;
  
  a, button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: ${({ $variant }) => $variant === 'minimal' ? '0.4rem 0.6rem' : '0.6rem 1rem'};
    text-decoration: none;
    color: ${({ theme, $isActive }) => $isActive 
      ? theme.palette?.primary?.main || '#1976d2'
      : theme.palette?.text?.primary || 'inherit'};
    border-radius: 6px;
    font-weight: ${({ $isActive }) => $isActive ? 600 : 400};
    font-size: ${({ $variant }) => $variant === 'minimal' ? '0.875rem' : '0.9375rem'};
    border: none;
    background: none;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s, transform 0.1s;
    opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
    pointer-events: ${({ $disabled }) => $disabled ? 'none' : 'auto'};
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  ${({ $isActive, theme }) => $isActive && `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background-color: ${theme.palette?.primary?.main || '#1976d2'};
      border-radius: 4px;
    }
  `}
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
  max-height: ${({ $isOpen }) => $isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
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
      `
  }
  background-color: rgba(255, 255, 255, 0.2);
`;

const CollapsibleButton = styled.button<{
  $collapsed: boolean;
}>`
  position: absolute;
  ${({ $collapsed }) => $collapsed ? 'right: -12px;' : 'left: calc(100% - 12px);'}
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
    transform: rotate(${({ $collapsed }) => $collapsed ? '0deg' : '180deg'});
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
    ref
  ) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>(initialExpandedItems);
    const [collapsed, setCollapsed] = useState(initialCollapsed);
    const prefersReducedMotion = useReducedMotion();
    
    // Handle mobile menu toggle
    const toggleMobileMenu = useCallback(() => {
      const newState = !mobileMenuOpen;
      setMobileMenuOpen(newState);
      if (onMenuToggle) {
        onMenuToggle(newState);
      }
    }, [mobileMenuOpen, onMenuToggle]);
    
    // Handle item click
    const handleItemClick = useCallback((id: string, item: NavigationItem) => {
      if (item.onClick) {
        item.onClick();
      }
      
      if (onItemClick) {
        onItemClick(id);
      }
      
      // If the item has children, toggle its expanded state
      if (item.children && item.children.length > 0) {
        setExpandedItems(prev => 
          prev.includes(id) 
            ? prev.filter(itemId => itemId !== id)
            : [...prev, id]
        );
      }
      
      // Close mobile menu when an item is clicked
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        if (onMenuToggle) {
          onMenuToggle(false);
        }
      }
    }, [onItemClick, mobileMenuOpen, onMenuToggle]);
    
    // Toggle collapsed state for collapsible navigation
    const toggleCollapsed = useCallback(() => {
      setCollapsed(prev => !prev);
    }, []);
    
    // Render navigation item
    const renderNavItem = useCallback((item: NavigationItem, level = 0) => {
      const isActive = activeItem === item.id || item.active;
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.includes(item.id);
      
      // If it's a custom element, render it directly
      if (item.customElement) {
        return (
          <NavItem 
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
          {item.icon && (
            <span className="nav-item-icon">
              {item.icon}
            </span>
          )}
          
          {(!collapsed || level > 0) && (
            <span className="nav-item-label">
              {item.label}
            </span>
          )}
          
          {item.badge && (
            <Badge 
              content={item.badge} 
              color="primary" 
              size="small"
            >
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
          onClick={(e) => {
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
      
      return (
        <NavItem 
          key={item.id}
          $isActive={isActive}
          $disabled={!!item.disabled}
          $variant={variant}
          className={item.className}
        >
          {item.tooltip && !collapsed ? (
            <Tooltip title={item.tooltip}>
              {navItem}
            </Tooltip>
          ) : collapsed && level === 0 ? (
            <Tooltip title={item.label}>
              {navItem}
            </Tooltip>
          ) : (
            navItem
          )}
          
          {/* Render children if expanded */}
          {hasChildren && (
            <ChildrenContainer $isOpen={isExpanded && !collapsed}>
              {item.children?.map(child => renderNavItem(child, level + 1))}
            </ChildrenContainer>
          )}
        </NavItem>
      );
    }, [activeItem, expandedItems, collapsed, variant, handleItemClick]);
    
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
          maxWidth: maxWidth ? (typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth) : undefined
        }}
        {...rest}
      >
        {/* Mobile menu toggle button */}
        <MobileMenuButton onClick={toggleMobileMenu}>
          <Icon>{mobileMenuOpen ? 'close' : 'menu'}</Icon>
        </MobileMenuButton>
        
        {/* Logo section */}
        {logo && (
          <LogoContainer $position={position}>
            {logo}
          </LogoContainer>
        )}
        
        {/* Main navigation items */}
        <NavItemsContainer 
          $position={position}
          $variant={variant}
          className={mobileMenuOpen ? 'mobile-open' : ''}
        >
          {items.map(item => renderNavItem(item))}
        </NavItemsContainer>
        
        {/* Optional divider */}
        {showDivider && (
          <NavDivider $position={position} />
        )}
        
        {/* Actions section */}
        {actions && (
          <ActionsContainer>
            {actions}
          </ActionsContainer>
        )}
        
        {/* Collapsible button for side navigation */}
        {collapsible && (position === 'left' || position === 'right') && (
          <CollapsibleButton 
            $collapsed={collapsed}
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand' : 'Collapse'}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <Icon>
              {position === 'left' 
                ? (collapsed ? 'chevron_right' : 'chevron_left')
                : (collapsed ? 'chevron_left' : 'chevron_right')
              }
            </Icon>
          </CollapsibleButton>
        )}
      </StyledGlassNavigation>
    );
  }
);

GlassNavigation.displayName = 'GlassNavigation';