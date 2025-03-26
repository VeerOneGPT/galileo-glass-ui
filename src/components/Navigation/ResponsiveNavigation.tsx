import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Box } from '../Box';
import { Button } from '../Button';
import { Drawer } from '../Drawer';
import { Icon } from '../Icon';
import { Typography } from '../Typography';

import { GlassNavigation } from './GlassNavigation';
import { ResponsiveNavigationProps } from './types';

// Resolve breakpoint value to number
const resolveBreakpoint = (breakpoint: ResponsiveNavigationProps['mobileBreakpoint']): number => {
  if (typeof breakpoint === 'number') return breakpoint;

  // Default breakpoint values
  const breakpoints = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  };

  return breakpoints[breakpoint || 'md'];
};

const StyledResponsiveNavigation = styled.div<{
  $useMinimalBefore: boolean;
}>`
  position: relative;

  .mobile-menu-bar {
    display: none;
  }

  .desktop-navigation {
    display: block;
  }

  @media (max-width: 960px) {
    ${({ $useMinimalBefore }) =>
      $useMinimalBefore &&
      `
      .desktop-navigation {
        .nav-item-label {
          display: none;
        }
      }
    `}
  }

  @media (max-width: 768px) {
    .mobile-menu-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .desktop-navigation {
      display: none;
    }
  }
`;

const MobileMenuBar = styled.div<{
  $glassIntensity: number;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  z-index: 100;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

/**
 * A responsive navigation component that transforms based on screen size
 */
export const ResponsiveNavigation = forwardRef<HTMLDivElement, ResponsiveNavigationProps>(
  (
    {
      mobileBreakpoint = 'md',
      mobileMenuLabel = 'Menu',
      useDrawer = true,
      menuIcon,
      useMinimalBefore = false,
      showLogoInMobile = true,
      mobileMenuPosition = 'left',
      mobileBackdropOpacity = 0.5,
      drawerWithHeader = true,
      drawerWidth = 280,
      logo,
      items = [],
      glassIntensity = 0.7,
      onMenuToggle,
      ...rest
    }: ResponsiveNavigationProps,
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const breakpointValue = resolveBreakpoint(mobileBreakpoint);
    const prefersReducedMotion = useReducedMotion();

    // Check if screen size indicates mobile view
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= breakpointValue);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }, [breakpointValue]);

    // Handle drawer toggle
    const toggleDrawer = useCallback(() => {
      const newState = !drawerOpen;
      setDrawerOpen(newState);

      if (onMenuToggle) {
        onMenuToggle(newState);
      }
    }, [drawerOpen, onMenuToggle]);

    // Handle menu items click in mobile view
    const handleMobileItemClick = useCallback(
      (id: string) => {
        if (useDrawer) {
          setDrawerOpen(false);
        }

        if (rest.onItemClick) {
          rest.onItemClick(id);
        }
      },
      [useDrawer, rest.onItemClick]
    );

    // Prepare props for different navigation views
    const desktopNavProps = {
      ...rest,
      items,
      logo,
      glassIntensity,
      variant:
        useMinimalBefore && window.innerWidth <= 960 && window.innerWidth > breakpointValue
          ? ('minimal' as const)
          : rest.variant,
    };

    const mobileNavProps = {
      ...rest,
      items,
      logo: showLogoInMobile ? logo : undefined,
      position: 'left' as const,
      variant: 'standard' as const,
      glassIntensity,
      onItemClick: handleMobileItemClick,
    };

    return (
      <StyledResponsiveNavigation ref={ref} $useMinimalBefore={useMinimalBefore}>
        {/* Desktop navigation */}
        <div className="desktop-navigation">
          <GlassNavigation {...desktopNavProps} />
        </div>

        {/* Mobile view */}
        {isMobile && (
          <>
            {/* Mobile menu bar */}
            <MobileMenuBar className="mobile-menu-bar" $glassIntensity={glassIntensity}>
              {showLogoInMobile && logo && <div className="mobile-logo">{logo}</div>}

              <Button variant="text" onClick={toggleDrawer} aria-label="Toggle mobile menu">
                {menuIcon || <Icon>{drawerOpen ? 'close' : 'menu'}</Icon>}
                {!useDrawer && mobileMenuLabel}
              </Button>
            </MobileMenuBar>

            {/* Mobile drawer navigation */}
            {useDrawer && (
              <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                anchor={mobileMenuPosition === 'right' ? 'right' : 'left'}
                variant="temporary"
                width={typeof drawerWidth === 'number' ? `${drawerWidth}px` : drawerWidth}
              >
                {drawerWithHeader && (
                  <DrawerHeader>
                    <Typography variant="h6">{mobileMenuLabel}</Typography>
                    <Button
                      variant="text"
                      onClick={() => setDrawerOpen(false)}
                      aria-label="Close menu"
                    >
                      <Icon>close</Icon>
                    </Button>
                  </DrawerHeader>
                )}

                <Box p={1}>
                  <GlassNavigation {...mobileNavProps} />
                </Box>
              </Drawer>
            )}
          </>
        )}
      </StyledResponsiveNavigation>
    );
  }
);

ResponsiveNavigation.displayName = 'ResponsiveNavigation';
