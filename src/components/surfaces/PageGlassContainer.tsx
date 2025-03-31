/**
 * PageGlassContainer Component
 *
 * A glass container for full page layouts with enhanced glass effects.
 */
import React, { forwardRef, useState, useEffect } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import { PageGlassContainerProps } from './types';

// Styled components
const Container = styled.div<{
  $elevation: number;
  $blurStrength: 'none' | 'light' | 'standard' | 'strong';
  $opacity: 'low' | 'medium' | 'high';
  $borderOpacity: 'none' | 'subtle' | 'light' | 'medium' | 'strong';
  $borderWidth: number;
  $fullWidth: boolean;
  $fullHeight: boolean;
  $borderRadius: number | string;
  $interactive: boolean;
  $padding: string | number;
  $scrollFade: boolean;
  $backgroundImage: string;
  $dimensionalChildren: boolean;
  $fullPage: boolean;
  $scrollPosition: number;
  $maxWidth: string | number;
  $backgroundColor: string;
  $reducedMotion: boolean;
}>`
  position: ${props => (props.$fullPage ? 'fixed' : 'relative')};
  top: ${props => (props.$fullPage ? '0' : 'auto')};
  left: ${props => (props.$fullPage ? '0' : 'auto')};
  right: ${props => (props.$fullPage ? '0' : 'auto')};
  bottom: ${props => (props.$fullPage ? '0' : 'auto')};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  max-width: ${props =>
    props.$maxWidth
      ? typeof props.$maxWidth === 'number'
        ? `${props.$maxWidth}px`
        : props.$maxWidth
      : 'none'};
  height: ${props => (props.$fullHeight || props.$fullPage ? '100%' : 'auto')};
  margin: ${props => (props.$fullWidth ? '0' : '0 auto')};
  border-radius: ${props =>
    typeof props.$borderRadius === 'number' ? `${props.$borderRadius}px` : props.$borderRadius};
  padding: ${props =>
    typeof props.$padding === 'number' ? `${props.$padding}px` : props.$padding};
  box-sizing: border-box;
  overflow: ${props => (props.$fullPage ? 'auto' : 'hidden')};
  z-index: 0;

  /* Apply glass surface effect */
  ${props =>
    glassSurface({
      elevation: props.$elevation,
      blurStrength: props.$blurStrength,
      borderOpacity: props.$borderOpacity,
      themeContext: createThemeContext(props.theme),
    })}

  /* Custom background color */
  background-color: ${props => props.$backgroundColor};

  /* Background image if provided */
  ${props =>
    props.$backgroundImage &&
    `
    background-image: ${props.$backgroundImage};
    background-size: cover;
    background-position: center;
    background-attachment: ${props.$fullPage ? 'fixed' : 'scroll'};
  `}

  /* Border */
  border-width: ${props => props.$borderWidth}px;
  border-style: solid;
  border-color: ${props => {
    switch (props.$borderOpacity) {
      case 'none':
        return 'transparent';
      case 'subtle':
        return 'rgba(255, 255, 255, 0.1)';
      case 'light':
        return 'rgba(255, 255, 255, 0.2)';
      case 'medium':
        return 'rgba(255, 255, 255, 0.3)';
      case 'strong':
        return 'rgba(255, 255, 255, 0.4)';
    }
  }};

  /* Scroll fade effect */
  ${props =>
    props.$scrollFade &&
    !props.$reducedMotion &&
    `
    &::after {
      content: '';
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 100px;
      background: linear-gradient(to bottom, transparent, ${props.$backgroundColor});
      opacity: ${Math.min(1, props.$scrollPosition / 100)};
      pointer-events: none;
      z-index: 10;
    }
    
    &::before {
      content: '';
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      height: 100px;
      background: linear-gradient(to top, transparent, ${props.$backgroundColor});
      opacity: ${Math.min(1, props.$scrollPosition / 100)};
      pointer-events: none;
      z-index: 10;
    }
  `}

  /* Style for child elements if dimensional */
  ${props =>
    props.$dimensionalChildren &&
    `
    & > * {
      transform-style: preserve-3d;
      backface-visibility: hidden;
    }
  `}
`;

const ContentWrapper = styled.div<{
  $dimensionalChildren: boolean;
  $scrollPosition: number;
  $reducedMotion: boolean;
}>`
  position: relative;
  z-index: 1;

  /* Parallax effect for dimensional children */
  ${props =>
    props.$dimensionalChildren &&
    !props.$reducedMotion &&
    `
    & > * {
      transition: transform 0.1s ease-out;
      transform: translateZ(${Math.min(20, props.$scrollPosition / 20)}px);
    }
  `}
`;

/**
 * PageGlassContainer Component Implementation
 */
const PageGlassContainerComponent = (
  props: PageGlassContainerProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    children,
    className,
    style,
    elevation = 2,
    blurStrength = 'standard',
    opacity = 'medium',
    borderOpacity = 'light',
    borderWidth = 1,
    fullWidth = true,
    fullHeight = false,
    borderRadius = 0,
    interactive = false,
    padding = '20px',
    scrollFade = true,
    backgroundImage,
    dimensionalChildren = false,
    fullPage = false,
    maxWidth,
    backgroundColor = 'rgba(255, 255, 255, 0.05)',
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // State for scroll position
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle scroll events for scroll fade effect
  useEffect(() => {
    if (!scrollFade || prefersReducedMotion) return;

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollFade, prefersReducedMotion]);

  return (
    <Container
      ref={ref}
      className={className}
      style={style}
      $elevation={elevation}
      $blurStrength={blurStrength}
      $opacity={opacity}
      $borderOpacity={borderOpacity}
      $borderWidth={borderWidth}
      $fullWidth={fullWidth}
      $fullHeight={fullHeight}
      $borderRadius={borderRadius}
      $interactive={interactive}
      $padding={padding}
      $scrollFade={scrollFade}
      $backgroundImage={backgroundImage || ''}
      $dimensionalChildren={dimensionalChildren}
      $fullPage={fullPage}
      $scrollPosition={scrollPosition}
      $maxWidth={maxWidth || 'none'}
      $backgroundColor={backgroundColor}
      $reducedMotion={prefersReducedMotion}
      {...rest}
    >
      <ContentWrapper
        $dimensionalChildren={dimensionalChildren}
        $scrollPosition={scrollPosition}
        $reducedMotion={prefersReducedMotion}
      >
        {children}
      </ContentWrapper>
    </Container>
  );
};

/**
 * PageGlassContainer Component
 *
 * A glass container for full page layouts with enhanced glass effects.
 */
const PageGlassContainer = forwardRef(PageGlassContainerComponent);
PageGlassContainer.displayName = 'PageGlassContainer';

export default PageGlassContainer;
