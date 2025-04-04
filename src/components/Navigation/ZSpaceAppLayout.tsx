import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';

import { glassBorder } from '../../core/mixins/glassBorder';
import { glassSurface } from '../../core/mixins/glassSurface';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useZSpaceAnimation } from '../../hooks/useZSpaceAnimation';
import { Box } from '../Box';
import { Button } from '../Button';
import { Icon } from '../Icon';

import { ZSpaceAppLayoutProps } from './types';

// ZSpace layer provider for properly stacking layout elements
const ZSpaceProvider = ({
  children,
  zIndex = 0,
}: {
  children: React.ReactNode;
  zIndex?: number;
}) => {
  return (
    <div
      style={{
        position: 'relative',
        zIndex,
        transform: `translateZ(${zIndex * 10}px)`,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
};

const LayoutContainer = styled.div<{
  $enableZSpaceAnimations: boolean;
}>`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  perspective: ${({ $enableZSpaceAnimations }) => ($enableZSpaceAnimations ? '1200px' : 'none')};
  transform-style: ${({ $enableZSpaceAnimations }) =>
    $enableZSpaceAnimations ? 'preserve-3d' : 'flat'};
  
  // Placeholder background
  background-color: ${props => props.theme.colors?.background?.default || '#fff'};
`;

const HeaderContainer = styled.header<{
  $height: string | number;
  $fixed: boolean;
  $enableZSpaceAnimations: boolean;
}>`
  width: 100%;
  height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height)};
  display: flex;
  align-items: center;
  position: ${({ $fixed }) => ($fixed ? 'fixed' : 'relative')};
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  transform-style: ${({ $enableZSpaceAnimations }) =>
    $enableZSpaceAnimations ? 'preserve-3d' : 'flat'};
  
  // Placeholder background and border
  background-color: ${props => props.theme.colors?.background?.level1 || '#f8f8f8'};
  border-bottom: 1px solid ${props => props.theme.colors?.divider || '#ddd'};
`;

const SidebarContainer = styled.aside<{
  $width: string | number;
  $fixed: boolean;
  $collapsed: boolean;
  $enableZSpaceAnimations: boolean;
}>`
  width: ${({ $width, $collapsed }) =>
    $collapsed ? '64px' : typeof $width === 'number' ? `${$width}px` : $width};
  height: 100%;
  position: ${({ $fixed }) => ($fixed ? 'fixed' : 'relative')};
  left: 0;
  top: ${({ $fixed }) => ($fixed ? '0' : 'auto')};
  bottom: 0;
  z-index: 20;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform-style: ${({ $enableZSpaceAnimations }) =>
    $enableZSpaceAnimations ? 'preserve-3d' : 'flat'};
  
  // Placeholder background and border
  background-color: ${props => props.theme.colors?.background?.level1 || '#f8f8f8'};
  border-right: 1px solid ${props => props.theme.colors?.divider || '#ddd'};
`;

const ContentContainer = styled.main<{
  $hasSidebar: boolean;
  $sidebarWidth: string | number;
  $hasFixedSidebar: boolean;
  $hasFixedHeader: boolean;
  $headerHeight: string | number;
  $hasFixedFooter: boolean;
  $footerHeight: string | number;
  $maxWidth?: string | number;
  $padding: string | number;
  $sidebarCollapsed: boolean;
  $enableZSpaceAnimations: boolean;
}>`
  flex: 1;
  margin-left: ${({ $hasSidebar, $sidebarWidth, $hasFixedSidebar, $sidebarCollapsed }) =>
    $hasSidebar && $hasFixedSidebar
      ? $sidebarCollapsed
        ? '64px'
        : typeof $sidebarWidth === 'number'
        ? `${$sidebarWidth}px`
        : $sidebarWidth
      : '0'};
  margin-top: ${({ $hasFixedHeader, $headerHeight }) =>
    $hasFixedHeader
      ? typeof $headerHeight === 'number'
        ? `${$headerHeight}px`
        : $headerHeight
      : '0'};
  margin-bottom: ${({ $hasFixedFooter, $footerHeight }) =>
    $hasFixedFooter
      ? typeof $footerHeight === 'number'
        ? `${$footerHeight}px`
        : $footerHeight
      : '0'};
  padding: ${({ $padding }) => (typeof $padding === 'number' ? `${$padding}px` : $padding)};
  max-width: ${({ $maxWidth }) =>
    $maxWidth ? (typeof $maxWidth === 'number' ? `${$maxWidth}px` : $maxWidth) : 'none'};
  margin-right: auto;
  margin-left: ${({ $hasSidebar, $hasFixedSidebar, $sidebarWidth, $sidebarCollapsed, $maxWidth }) =>
    $hasSidebar && $hasFixedSidebar
      ? $sidebarCollapsed
        ? '64px'
        : typeof $sidebarWidth === 'number'
        ? `${$sidebarWidth}px`
        : $sidebarWidth
      : $maxWidth
      ? 'auto'
      : '0'};
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: ${({ $enableZSpaceAnimations }) =>
    $enableZSpaceAnimations ? 'preserve-3d' : 'flat'};
  z-index: 10;
`;

const FooterContainer = styled.footer<{
  $height: string | number;
  $fixed: boolean;
  $enableZSpaceAnimations: boolean;
}>`
  width: 100%;
  height: ${({ $height }) => (typeof $height === 'number' ? `${$height}px` : $height)};
  display: flex;
  align-items: center;
  position: ${({ $fixed }) => ($fixed ? 'fixed' : 'relative')};
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  transform-style: ${({ $enableZSpaceAnimations }) =>
    $enableZSpaceAnimations ? 'preserve-3d' : 'flat'};
  
  // Placeholder background and border
  background-color: ${props => props.theme.colors?.background?.level1 || '#f8f8f8'};
  border-top: 1px solid ${props => props.theme.colors?.divider || '#ddd'};
`;

const BackgroundWrapper = styled.div<{
  $enableZSpaceAnimations: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  transform: ${({ $enableZSpaceAnimations }) =>
    $enableZSpaceAnimations ? 'translateZ(-50px)' : 'none'};
  transform-style: ${({ $enableZSpaceAnimations }) =>
    $enableZSpaceAnimations ? 'preserve-3d' : 'flat'};
`;

const SidebarToggleButton = styled.button`
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

// Helper to resolve breakpoint prop to pixel value
const resolveBreakpoint = (breakpoint: ZSpaceAppLayoutProps['sidebarBreakpoint'], theme: any): number => {
  if (typeof breakpoint === 'number') return breakpoint;

  // Use theme breakpoints if available, otherwise fallback
  const bpValues = theme?.breakpoints?.values || {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  };

  return bpValues[breakpoint || 'md'] ?? 960; // Default to md (960px)
};

/**
 * Layout component with Z-space effects for creating 3D-like app layouts
 */
export const ZSpaceAppLayout = forwardRef<HTMLDivElement, ZSpaceAppLayoutProps>(
  (
    { ...props },
    ref
  ) => {
    const {
      children,
      navigation,
      sidebar,
      header,
      footer,
      fixedHeader = false,
      fixedFooter = false,
      fixedSidebar = false,
      sidebarWidth = 240,
      headerHeight = '64px',
      footerHeight = '56px',
      initialSidebarCollapsed = false,
      sidebarBreakpoint = 'md', // Default breakpoint prop
      className,
      style,
      zLayers = {
        background: 0,
        sidebar: 20,
        header: 30,
        content: 10,
        footer: 30,
        navigation: 40,
        overlay: 50,
      },
      maxContentWidth,
      contentPadding = '1.5rem',
      backgroundComponent,
      sidebarToggle,
      enableZSpaceAnimations = true,
      zSpaceAnimationIntensity = 0.5,
      ...rest
    } = props;
    
    const theme = useTheme(); // Get theme for breakpoint resolution
    const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);
    const prefersReducedMotion = useReducedMotion();
    
    const {
      ref: contentRef,
      containerStyle: zSpaceContainerStyle,
      elementStyle: zSpaceContentStyle
    } = useZSpaceAnimation({
      intensity: zSpaceAnimationIntensity,
      enabled: enableZSpaceAnimations && !prefersReducedMotion,
    });

    const toggleSidebar = useCallback(() => {
      setSidebarCollapsed(prevState => !prevState);
    }, []);

    // Adjust layout when window is resized
    useEffect(() => {
      // Resolve breakpoint value using theme
      const resolvedBp = resolveBreakpoint(sidebarBreakpoint, theme);
      
      const handleResize = () => {
         // Collapse if below resolved breakpoint AND not already collapsed
        if (window.innerWidth < resolvedBp && !sidebarCollapsed) {
          setSidebarCollapsed(true);
        } 
        // Optional: Expand if above breakpoint AND was collapsed due to resize?
        // else if (window.innerWidth >= resolvedBp && sidebarCollapsed && /* condition to check if collapse was automatic */ ) {
        //    setSidebarCollapsed(false);
        // } 
      };

      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    // Add sidebarBreakpoint and theme to dependencies
    }, [sidebarCollapsed, sidebarBreakpoint, theme]); 

    // Default sidebar toggle if none provided
    const defaultSidebarToggle = (
      <SidebarToggleButton
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon>{sidebarCollapsed ? 'chevron_right' : 'chevron_left'}</Icon>
      </SidebarToggleButton>
    );

    // Calculate actual enabled state once
    const isZSpaceEnabled = enableZSpaceAnimations && !prefersReducedMotion;

    return (
      <LayoutContainer
        ref={ref}
        className={className}
        style={{
          ...style,
          ...zSpaceContainerStyle,
        }}
        $enableZSpaceAnimations={isZSpaceEnabled}
        {...rest}
      >
        {/* Background layer */}
        {backgroundComponent && (
          <BackgroundWrapper
            $enableZSpaceAnimations={isZSpaceEnabled}
          >
            <ZSpaceProvider zIndex={zLayers.background}>{backgroundComponent}</ZSpaceProvider>
          </BackgroundWrapper>
        )}

        {/* Header */}
        {header && (
          <ZSpaceProvider zIndex={zLayers.header}>
            <HeaderContainer
              $height={headerHeight}
              $fixed={fixedHeader}
              $enableZSpaceAnimations={isZSpaceEnabled}
            >
              {header}
            </HeaderContainer>
          </ZSpaceProvider>
        )}

        {/* Sidebar */}
        {sidebar && (
          <ZSpaceProvider zIndex={zLayers.sidebar}>
            <SidebarContainer
              $width={sidebarWidth}
              $fixed={fixedSidebar}
              $collapsed={sidebarCollapsed}
              $enableZSpaceAnimations={isZSpaceEnabled}
            >
              {sidebar}
              {sidebarToggle || defaultSidebarToggle}
            </SidebarContainer>
          </ZSpaceProvider>
        )}

        {/* Main content */}
        <ZSpaceProvider zIndex={zLayers.content}>
          <ContentContainer
            ref={contentRef}
            $hasSidebar={!!sidebar}
            $sidebarWidth={sidebarWidth}
            $hasFixedSidebar={!!sidebar && fixedSidebar}
            $hasFixedHeader={!!header && fixedHeader}
            $headerHeight={headerHeight}
            $hasFixedFooter={!!footer && fixedFooter}
            $footerHeight={footerHeight}
            $maxWidth={maxContentWidth}
            $padding={contentPadding}
            $sidebarCollapsed={sidebarCollapsed}
            $enableZSpaceAnimations={isZSpaceEnabled}
            style={zSpaceContentStyle}
          >
            {children}
          </ContentContainer>
        </ZSpaceProvider>

        {/* Footer */}
        {footer && (
          <ZSpaceProvider zIndex={zLayers.footer}>
            <FooterContainer
              $height={footerHeight}
              $fixed={fixedFooter}
              $enableZSpaceAnimations={isZSpaceEnabled}
            >
              {footer}
            </FooterContainer>
          </ZSpaceProvider>
        )}

        {/* Navigation - typically used for floating nav elements */}
        {navigation && <ZSpaceProvider zIndex={zLayers.navigation}>{navigation}</ZSpaceProvider>}
      </LayoutContainer>
    );
  }
);

ZSpaceAppLayout.displayName = 'ZSpaceAppLayout';
