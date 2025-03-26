import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';

import { glassBorder } from '../../core/mixins/glassBorder';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
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
  $glassIntensity: number;
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

  ${({ theme, $glassIntensity }) => {
    if ($glassIntensity > 0) {
      const themeContext = createThemeContext(theme);
      return glassSurface({
        elevation: 'low',
        backgroundOpacity: 0.2,
        blurStrength: '5px',
        themeContext,
      });
    }
    return '';
  }}
`;

const HeaderContainer = styled.header<{
  $height: string | number;
  $fixed: boolean;
  $glassIntensity: number;
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

  ${({ theme, $glassIntensity }) => {
    if ($glassIntensity > 0) {
      const themeContext = createThemeContext(theme);
      return glassSurface({
        elevation: 'medium',
        backgroundOpacity: 0.6,
        blurStrength: '10px',
        themeContext,
      });
    }
    return '';
  }}

  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '0 0 1px 0',
      opacity: 0.3,
      themeContext,
    });
  }}
`;

const SidebarContainer = styled.aside<{
  $width: string | number;
  $fixed: boolean;
  $collapsed: boolean;
  $glassIntensity: number;
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

  ${({ theme, $glassIntensity }) => {
    if ($glassIntensity > 0) {
      const themeContext = createThemeContext(theme);
      return glassSurface({
        elevation: 'medium',
        backgroundOpacity: 0.5,
        blurStrength: '8px',
        themeContext,
      });
    }
    return '';
  }}

  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '0 1px 0 0',
      opacity: 0.3,
      themeContext,
    });
  }}
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
  $glassIntensity: number;
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

  ${({ theme, $glassIntensity }) => {
    if ($glassIntensity > 0) {
      const themeContext = createThemeContext(theme);
      return glassSurface({
        elevation: 'medium',
        backgroundOpacity: 0.6,
        blurStrength: '8px',
        themeContext,
      });
    }
    return '';
  }}

  ${({ theme }) => {
    const themeContext = createThemeContext(theme);
    return glassBorder({
      width: '1px 0 0 0',
      opacity: 0.3,
      themeContext,
    });
  }}
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

/**
 * Layout component with Z-space effects for creating 3D-like app layouts
 */
export const ZSpaceAppLayout = forwardRef<HTMLDivElement, ZSpaceAppLayoutProps>(
  (
    {
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
      useGlassEffects = true,
      glassIntensity = 0.7,
      sidebarToggle,
      enableZSpaceAnimations = true,
      zSpaceAnimationIntensity = 0.5,
      ...rest
    }: ZSpaceAppLayoutProps,
    ref
  ) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);
    const prefersReducedMotion = useReducedMotion();
    const zSpaceAnimation = useZSpaceAnimation({
      intensity: zSpaceAnimationIntensity,
      enabled: enableZSpaceAnimations && !prefersReducedMotion,
    });

    const toggleSidebar = useCallback(() => {
      setSidebarCollapsed(prevState => !prevState);
    }, []);

    // Adjust layout when window is resized
    useEffect(() => {
      const handleResize = () => {
        if (window.innerWidth < 768 && !sidebarCollapsed) {
          setSidebarCollapsed(true);
        }
      };

      window.addEventListener('resize', handleResize);

      // Initial check
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [sidebarCollapsed]);

    // Default sidebar toggle if none provided
    const defaultSidebarToggle = (
      <SidebarToggleButton
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon>{sidebarCollapsed ? 'chevron_right' : 'chevron_left'}</Icon>
      </SidebarToggleButton>
    );

    return (
      <LayoutContainer
        ref={ref}
        className={className}
        style={{
          ...style,
          ...zSpaceAnimation.containerStyle,
        }}
        $glassIntensity={useGlassEffects ? glassIntensity : 0}
        $enableZSpaceAnimations={enableZSpaceAnimations && !prefersReducedMotion}
        {...rest}
      >
        {/* Background layer */}
        {backgroundComponent && (
          <BackgroundWrapper
            $enableZSpaceAnimations={enableZSpaceAnimations && !prefersReducedMotion}
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
              $glassIntensity={useGlassEffects ? glassIntensity : 0}
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
              $glassIntensity={useGlassEffects ? glassIntensity : 0}
              $enableZSpaceAnimations={enableZSpaceAnimations && !prefersReducedMotion}
            >
              {sidebar}
              {sidebarToggle || defaultSidebarToggle}
            </SidebarContainer>
          </ZSpaceProvider>
        )}

        {/* Main content */}
        <ZSpaceProvider zIndex={zLayers.content}>
          <ContentContainer
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
            $enableZSpaceAnimations={enableZSpaceAnimations && !prefersReducedMotion}
            style={zSpaceAnimation.elementStyle}
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
              $glassIntensity={useGlassEffects ? glassIntensity : 0}
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
