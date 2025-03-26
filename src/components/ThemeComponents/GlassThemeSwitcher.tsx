import React, { forwardRef, useState, useEffect } from 'react';
import styled from 'styled-components';

import { glassBorder } from '../../core/mixins/glassBorder';
import { glassSurface } from '../../core/mixins/glassSurface';
import { createThemeContext } from '../../core/themeContext';
import { ColorMode, ThemeVariant } from '../../hooks/useGlassTheme';
import { useTheme, useColorMode, useThemeVariant } from '../../theme';
import { Box } from '../Box';
import { Button } from '../Button';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { Typography } from '../Typography';

import { GlassThemeSwitcherProps } from './types';

// Styled components
const StyledSwitcher = styled.div<{
  $compact: boolean;
  $vertical: boolean;
  $glassIntensity: number;
}>`
  display: flex;
  flex-direction: ${({ $vertical }) => ($vertical ? 'column' : 'row')};
  gap: ${({ $compact }) => ($compact ? '0.75rem' : '1.5rem')};
  padding: ${({ $compact }) => ($compact ? '0.75rem' : '1rem')};
  border-radius: 8px;
  width: ${({ $compact }) => ($compact ? 'auto' : '100%')};

  ${({ theme, $glassIntensity }) => {
    const themeContext = createThemeContext(theme);
    return glassSurface({
      elevation: $glassIntensity,
      backgroundOpacity: 0.5,
      blurStrength: '8px',
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
`;

const Section = styled.div<{
  $compact: boolean;
  $vertical: boolean;
}>`
  flex: 1;

  ${({ $vertical }) =>
    !$vertical &&
    `
    &:not(:last-child) {
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      padding-right: 1rem;
    }
  `}

  ${({ $vertical }) =>
    $vertical &&
    `
    &:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1rem;
    }
  `}
`;

const OptionButton = styled(Button)<{
  $isActive: boolean;
}>`
  margin: 0.25rem;
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0.7)};
  transform: scale(${({ $isActive }) => ($isActive ? 1 : 0.95)});
  transition: all 0.2s ease;

  ${({ $isActive, theme }) =>
    $isActive &&
    `
    box-shadow: 0 0 0 2px ${theme.palette?.primary?.main || '#1976d2'};
  `}
`;

const SectionLabel = styled(Typography)`
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 0.9rem;
  opacity: 0.85;
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

/**
 * A customizable switcher for theme color modes and variants
 */
export const GlassThemeSwitcher = forwardRef<HTMLDivElement, GlassThemeSwitcherProps>(
  (
    {
      initialColorMode,
      initialThemeVariant,
      showColorModes = true,
      showVariants = true,
      compact = false,
      glassIntensity = 0.7,
      onColorModeChange,
      onThemeVariantChange,
      className,
      style,
      colorModeLabel = 'Color Mode',
      themeVariantLabel = 'Theme Variant',
      useIcons = true,
      persistSelection = true,
      storageKey = 'glass-theme-preferences',
      vertical = false,
      preview,
      showReset = true,
      availableColorModes = ['light', 'dark', 'system'],
      availableThemeVariants = ['default', 'dashboard', 'marketing', 'minimal', 'immersive'],
      ...rest
    }: GlassThemeSwitcherProps,
    ref
  ) => {
    // Use the theme hooks
    const theme = useTheme();
    const colorModeContext = useColorMode();
    const colorMode = colorModeContext[0];
    const setColorMode = colorModeContext[1];

    const themeVariantContext = useThemeVariant();
    const themeVariant = themeVariantContext[0];
    const setThemeVariant = themeVariantContext[1];

    // Local state for controlled component usage
    const [localColorMode, setLocalColorMode] = useState<ColorMode>(
      initialColorMode || colorMode || 'system'
    );
    const [localThemeVariant, setLocalThemeVariant] = useState<ThemeVariant>(
      initialThemeVariant || themeVariant || 'default'
    );

    // Handle initialization from the theme context
    useEffect(() => {
      if (!initialColorMode && colorMode && localColorMode !== colorMode) {
        setLocalColorMode(colorMode);
      }

      if (!initialThemeVariant && themeVariant && localThemeVariant !== themeVariant) {
        setLocalThemeVariant(themeVariant);
      }
    }, [
      colorMode,
      themeVariant,
      initialColorMode,
      initialThemeVariant,
      localColorMode,
      localThemeVariant,
    ]);

    // Load saved preferences
    useEffect(() => {
      if (persistSelection) {
        try {
          const savedPreferences = localStorage.getItem(storageKey);
          if (savedPreferences) {
            const { colorMode, themeVariant } = JSON.parse(savedPreferences);

            if (colorMode && !initialColorMode) {
              setLocalColorMode(colorMode);
              if (setColorMode) setColorMode(colorMode);
              if (onColorModeChange) onColorModeChange(colorMode);
            }

            if (themeVariant && !initialThemeVariant) {
              setLocalThemeVariant(themeVariant);
              if (setThemeVariant) setThemeVariant(themeVariant);
              if (onThemeVariantChange) onThemeVariantChange(themeVariant);
            }
          }
        } catch (error) {
          console.error('Error loading theme preferences', error);
        }
      }
    }, [
      persistSelection,
      storageKey,
      initialColorMode,
      initialThemeVariant,
      setColorMode,
      setThemeVariant,
      onColorModeChange,
      onThemeVariantChange,
    ]);

    // Save preferences when they change
    useEffect(() => {
      if (persistSelection) {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              colorMode: localColorMode,
              themeVariant: localThemeVariant,
            })
          );
        } catch (error) {
          console.error('Error saving theme preferences', error);
        }
      }
    }, [persistSelection, storageKey, localColorMode, localThemeVariant]);

    // Handle color mode change
    const handleColorModeChange = (mode: ColorMode) => {
      setLocalColorMode(mode);

      if (setColorMode) {
        setColorMode(mode);
      }

      if (onColorModeChange) {
        onColorModeChange(mode);
      }
    };

    // Handle theme variant change
    const handleThemeVariantChange = (variant: ThemeVariant) => {
      setLocalThemeVariant(variant);

      if (setThemeVariant) {
        setThemeVariant(variant);
      }

      if (onThemeVariantChange) {
        onThemeVariantChange(variant);
      }
    };

    // Handle reset
    const handleReset = () => {
      const defaultColorMode: ColorMode = 'system';
      const defaultThemeVariant: ThemeVariant = 'default';

      setLocalColorMode(defaultColorMode);
      setLocalThemeVariant(defaultThemeVariant);

      if (setColorMode) setColorMode(defaultColorMode);
      if (setThemeVariant) setThemeVariant(defaultThemeVariant);

      if (onColorModeChange) onColorModeChange(defaultColorMode);
      if (onThemeVariantChange) onThemeVariantChange(defaultThemeVariant);

      if (persistSelection) {
        try {
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.error('Error removing theme preferences', error);
        }
      }
    };

    // Get icon for color mode
    const getColorModeIcon = (mode: ColorMode) => {
      switch (mode) {
        case 'light':
          return 'light_mode';
        case 'dark':
          return 'dark_mode';
        case 'system':
          return 'settings_suggest';
        default:
          return 'settings';
      }
    };

    // Get label for color mode
    const getColorModeLabel = (mode: ColorMode) => {
      switch (mode) {
        case 'light':
          return 'Light';
        case 'dark':
          return 'Dark';
        case 'system':
          return 'System';
        default:
          return mode;
      }
    };

    // Get icon for theme variant
    const getThemeVariantIcon = (variant: ThemeVariant) => {
      switch (variant) {
        case 'default':
          return 'auto_awesome';
        case 'dashboard':
          return 'dashboard';
        case 'marketing':
          return 'campaign';
        case 'minimal':
          return 'toggle_off';
        case 'immersive':
          return 'visibility';
        default:
          return 'palette';
      }
    };

    // Get label for theme variant
    const getThemeVariantLabel = (variant: ThemeVariant) => {
      switch (variant) {
        case 'default':
          return 'Default';
        case 'dashboard':
          return 'Dashboard';
        case 'marketing':
          return 'Marketing';
        case 'minimal':
          return 'Minimal';
        case 'immersive':
          return 'Immersive';
        default:
          return variant;
      }
    };

    return (
      <StyledSwitcher
        ref={ref}
        className={className}
        style={style}
        $compact={compact}
        $vertical={vertical}
        $glassIntensity={glassIntensity}
        {...rest}
      >
        {/* Color mode section */}
        {showColorModes && (
          <Section $compact={compact} $vertical={vertical}>
            <SectionLabel variant="subtitle2">{colorModeLabel}</SectionLabel>
            <OptionsContainer>
              {availableColorModes.map(mode => (
                <OptionButton
                  key={mode}
                  variant={localColorMode === mode ? 'contained' : 'outlined'}
                  onClick={() => handleColorModeChange(mode)}
                  $isActive={localColorMode === mode}
                  size="small"
                >
                  {useIcons && <Icon>{getColorModeIcon(mode)}</Icon>}
                  {compact ? '' : getColorModeLabel(mode)}
                </OptionButton>
              ))}
            </OptionsContainer>
          </Section>
        )}

        {/* Theme variant section */}
        {showVariants && (
          <Section $compact={compact} $vertical={vertical}>
            <SectionLabel variant="subtitle2">{themeVariantLabel}</SectionLabel>
            <OptionsContainer>
              {availableThemeVariants.map(variant => (
                <OptionButton
                  key={variant}
                  variant={localThemeVariant === variant ? 'contained' : 'outlined'}
                  onClick={() => handleThemeVariantChange(variant)}
                  $isActive={localThemeVariant === variant}
                  size="small"
                >
                  {useIcons && <Icon>{getThemeVariantIcon(variant)}</Icon>}
                  {compact ? '' : getThemeVariantLabel(variant)}
                </OptionButton>
              ))}
            </OptionsContainer>
          </Section>
        )}

        {/* Reset button */}
        {showReset && (
          <Box mt={vertical ? 2 : 0} ml={vertical ? 0 : 2} alignSelf="center">
            <Button variant="text" size="small" color="secondary" onClick={handleReset}>
              {useIcons && <Icon>refresh</Icon>}
              {compact ? '' : 'Reset'}
            </Button>
          </Box>
        )}

        {/* Preview area */}
        {preview && <PreviewContainer>{preview}</PreviewContainer>}
      </StyledSwitcher>
    );
  }
);

GlassThemeSwitcher.displayName = 'GlassThemeSwitcher';
