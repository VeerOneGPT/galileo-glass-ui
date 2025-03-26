import React, { forwardRef, createContext, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { ColorMode, ThemeVariant } from '../../hooks/useGlassTheme';
import {
  ThemeProvider,
  ThemeTransition,
  useTheme,
  useColorMode,
  useThemeVariant,
} from '../../theme';
import { THEME_VARIANTS } from '../../theme/constants';

import { ThemedGlassComponentsProps } from './types';

// Create a context to pass down theme information to children
interface ThemedGlassContextType {
  glassIntensity: number;
  applyGlassEffect: boolean;
  contextData?: Record<string, any>;
}

const ThemedGlassContext = createContext<ThemedGlassContextType>({
  glassIntensity: 0.7,
  applyGlassEffect: true,
});

// Hook to use the themed glass context
export const useThemedGlass = () => useContext(ThemedGlassContext);

// Styled container with glass effect
const GlassContainer = styled.div<{
  $glassIntensity: number;
  $applyGlassEffect: boolean;
}>`
  ${({ theme, $glassIntensity }) => {
    const themeContext = createThemeContext(theme);
    return glassSurface({
      elevation: $glassIntensity,
      backgroundOpacity: 0.6,
      blurStrength: '10px',
      themeContext,
    });
  }}
`;

/**
 * A component that applies themed glass styling to its children
 */
export const ThemedGlassComponents = forwardRef<HTMLDivElement, ThemedGlassComponentsProps>(
  (
    {
      children,
      variant,
      colorMode,
      glassIntensity = 0.7,
      animated = true,
      className,
      style,
      applyGlassEffect = true,
      preserveOriginalStyle = true,
      contextData,
      transitionDuration = 300,
      ...rest
    }: ThemedGlassComponentsProps,
    ref
  ) => {
    // Use the current theme context
    const theme = useTheme();
    const colorModeContext = useColorMode();
    const currentColorMode = colorModeContext[0];
    const setCurrentColorMode = colorModeContext[1];

    const themeVariantContext = useThemeVariant();
    const currentThemeVariant = themeVariantContext[0];
    const setCurrentThemeVariant = themeVariantContext[1];

    // Track transitions for animation
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Use provided values or fallback to current context
    const effectiveColorMode = colorMode || currentColorMode;
    const effectiveVariant = variant || currentThemeVariant;

    // Create context value
    const contextValue: ThemedGlassContextType = {
      glassIntensity,
      applyGlassEffect,
      contextData,
    };

    // Handle transition state
    useEffect(() => {
      if (animated) {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, transitionDuration);

        return () => clearTimeout(timer);
      }
    }, [effectiveColorMode, effectiveVariant, animated, transitionDuration]);

    // If we're not changing theme or variant, just render with context
    if (!effectiveVariant && !effectiveColorMode) {
      return (
        <ThemedGlassContext.Provider value={contextValue}>
          <GlassContainer
            ref={ref}
            className={className}
            style={style}
            $glassIntensity={glassIntensity}
            $applyGlassEffect={applyGlassEffect}
            {...rest}
          >
            {children}
          </GlassContainer>
        </ThemedGlassContext.Provider>
      );
    }

    // For theme changes, use the ThemeProvider and ThemeTransition
    return (
      <ThemeProvider>
        <ThemedGlassContext.Provider value={contextValue}>
          {animated ? (
            <ThemeTransition duration={transitionDuration}>
              <GlassContainer
                ref={ref}
                className={className}
                style={style}
                $glassIntensity={glassIntensity}
                $applyGlassEffect={applyGlassEffect}
                {...rest}
              >
                {children}
              </GlassContainer>
            </ThemeTransition>
          ) : (
            <GlassContainer
              ref={ref}
              className={className}
              style={style}
              $glassIntensity={glassIntensity}
              $applyGlassEffect={applyGlassEffect}
              {...rest}
            >
              {children}
            </GlassContainer>
          )}
        </ThemedGlassContext.Provider>
      </ThemeProvider>
    );
  }
);

ThemedGlassComponents.displayName = 'ThemedGlassComponents';
