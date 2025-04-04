import React, { forwardRef, ReactNode, useState, useEffect } from 'react';
import styled, { css, DefaultTheme } from 'styled-components';
import { Box } from '../Box';
import { useGlassTheme } from '../../hooks';
import { createThemeContext } from '../../core/themeContext';
import { glassSurface } from '../../core/mixins';

// Define props based on PRD and common layout patterns
export interface ZSpaceAppLayoutProps {
  children?: ReactNode; // Main content area
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  sidebarWidth?: string | number;
  headerHeight?: string | number;
  footerHeight?: string | number;
  fixedHeader?: boolean;
  fixedSidebar?: boolean;
  mobileBreakpoint?: number; // Pixel value, e.g., 960
  initialSidebarOpen?: boolean; // On mobile
  useGlassEffects?: boolean;
  glassIntensity?: number;
  zLayers?: {
    background?: number;
    sidebar?: number;
    header?: number;
    content?: number;
    footer?: number;
    overlay?: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_SIDEBAR_WIDTH = '240px';
const DEFAULT_HEADER_HEIGHT = '64px';
const DEFAULT_FOOTER_HEIGHT = '48px';
const DEFAULT_MOBILE_BREAKPOINT = 960;

const LayoutContainer = styled(Box)<{ $useGlass: boolean; }>`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme?.colors?.neutralBackground || '#f0f0f0'};
  position: relative; /* Needed for z-index context */

  ${props => props.$useGlass && props.theme && css`
    ${glassSurface({ 
        themeContext: createThemeContext(props.theme), 
    })}
  `}
`;

const HeaderArea = styled(Box)<{ $fixed: boolean; $height: string; $zIndex: number; }>`
  width: 100%;
  height: ${props => props.$height};
  flex-shrink: 0;
  z-index: ${props => props.$zIndex};
  ${props => props.$fixed && css`
    position: sticky;
    top: 0;
  `}
`;

const MainArea = styled(Box)`
  display: flex;
  flex-grow: 1;
  position: relative; /* For potential sidebar absolute positioning on mobile */
  overflow: hidden; /* Prevent content overflow issues with fixed sidebar */
`;

const SidebarArea = styled(Box)<{
   $width: string; 
   $fixed: boolean; 
   $zIndex: number; 
   $isMobile: boolean; 
   $isOpen: boolean; 
   $breakpoint: number;
}>`
  width: ${props => props.$width};
  flex-shrink: 0;
  height: 100%; // Take full height of MainArea
  z-index: ${props => props.$zIndex};
  transition: transform 0.3s ease, width 0.3s ease;

  ${props => props.$fixed && !props.$isMobile && css`
      position: sticky;
      top: 0; // Or below header if header is also sticky
      height: calc(100vh - ${props.theme?.headerHeight || DEFAULT_HEADER_HEIGHT}); // Adjust based on fixed header
      overflow-y: auto;
  `}

  /* Mobile specific styles */
  @media (max-width: ${props => props.$breakpoint}px) {
      position: fixed; /* Or absolute relative to MainArea */
      top: 0; 
      left: 0;
      bottom: 0;
      transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
      box-shadow: ${props => props.$isOpen ? '0 0 20px rgba(0,0,0,0.3)' : 'none'};
      background: ${props => props.theme?.colors?.neutralSurface || '#fff'}; /* Ensure background */
  }
`;

const ContentArea = styled(Box)<{ $sidebarWidth: string; $hasSidebar: boolean; $breakpoint: number; }>`
  flex-grow: 1;
  padding: 16px;
  position: relative;
  z-index: ${props => props.theme?.zIndex?.content || 1}; 
  overflow-y: auto;

  /* Adjust margin if sidebar is present and fixed/static on desktop */
  @media (min-width: ${props => props.$breakpoint + 1}px) {
      margin-left: ${props => props.$hasSidebar ? props.$sidebarWidth : '0'};
  }
`;

const FooterArea = styled(Box)<{ $height: string; $zIndex: number; }>`
  width: 100%;
  height: ${props => props.$height};
  flex-shrink: 0;
  z-index: ${props => props.$zIndex};
  /* Add styling as needed */
`;

// Mobile overlay/backdrop
const Backdrop = styled.div<{ $isOpen: boolean; $zIndex: number }>`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: ${props => props.$isOpen ? 1 : 0};
    visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
    transition: opacity 0.3s ease, visibility 0.3s ease;
    z-index: ${props => props.$zIndex};
`;

export const ZSpaceAppLayout = forwardRef<HTMLDivElement, ZSpaceAppLayoutProps>(
  (
    {
      children,
      header,
      sidebar,
      footer,
      sidebarWidth = DEFAULT_SIDEBAR_WIDTH,
      headerHeight = DEFAULT_HEADER_HEIGHT,
      footerHeight = DEFAULT_FOOTER_HEIGHT,
      fixedHeader = false,
      fixedSidebar = false,
      mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
      initialSidebarOpen = false,
      useGlassEffects = false,
      glassIntensity,
      zLayers,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const rawTheme = useGlassTheme(); 
    const theme = rawTheme || {}; // Minimal fallback for potential other uses

    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);

    // Use hardcoded defaults, only override with zLayers prop
    const z = {
        background: zLayers?.background ?? 0,    // Default base
        sidebar: zLayers?.sidebar ?? 10,     // Default docked
        header: zLayers?.header ?? 1100,   // Default sticky
        content: zLayers?.content ?? 1,      // Default base 
        footer: zLayers?.footer ?? 2,       // Default base (slightly above content/bg)
        overlay: zLayers?.overlay ?? 1300,  // Default overlay
    };

    useEffect(() => {
      const checkMobile = () => {
        const mobile = window.innerWidth <= mobileBreakpoint;
        setIsMobile(mobile);
        if (!mobile) {
            setSidebarOpen(false); // Close sidebar when switching to desktop
        }
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, [mobileBreakpoint]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const sidebarWidthStr = typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth;
    const headerHeightStr = typeof headerHeight === 'number' ? `${headerHeight}px` : headerHeight;
    const footerHeightStr = typeof footerHeight === 'number' ? `${footerHeight}px` : footerHeight;

    // TODO: Add mobile header with toggle button if sidebar exists
    const effectiveHeader = isMobile && sidebar ? (
        <Box display="flex" alignItems="center" justifyContent="space-between" style={{height: headerHeightStr, padding: '0 16px'}}>
            <button onClick={toggleSidebar} aria-label="Toggle Sidebar">☰</button>
            {/* Consider placing a title or logo here */} 
        </Box>
    ) : header;

    return (
      <LayoutContainer 
        ref={ref} 
        className={className} 
        style={style} 
        $useGlass={useGlassEffects}
        {...rest}
       >
        {effectiveHeader && (
          <HeaderArea $fixed={fixedHeader && !isMobile} $height={headerHeightStr} $zIndex={z.header}>
            {effectiveHeader}
          </HeaderArea>
        )}
        <MainArea>
          {sidebar && (
            <SidebarArea 
                $width={sidebarWidthStr} 
                $fixed={fixedSidebar} 
                $zIndex={z.sidebar}
                $isMobile={isMobile}
                $isOpen={sidebarOpen}
                $breakpoint={mobileBreakpoint}
             >
              {sidebar}
            </SidebarArea>
          )}
          {isMobile && sidebar && <Backdrop $isOpen={sidebarOpen} $zIndex={z.overlay - 1} onClick={toggleSidebar} />}
          
          <ContentArea 
             $sidebarWidth={sidebarWidthStr} 
             $hasSidebar={!!sidebar}
             $breakpoint={mobileBreakpoint}
          >
            {children}
          </ContentArea>
        </MainArea>
        {footer && (
          <FooterArea $height={footerHeightStr} $zIndex={z.footer}>
            {footer}
          </FooterArea>
        )}
      </LayoutContainer>
    );
  }
);

ZSpaceAppLayout.displayName = 'ZSpaceAppLayout';
