/**
 * Galileo Glass UI - Slim Bundle
 * 
 * This is a lightweight bundle with only the most commonly used components.
 * Use this to significantly reduce your bundle size when you only need basic UI components.
 */

// Core UI components with Glass styling
export { Button, GlassButton } from './components/Button';
export { Card, GlassCard } from './components/Card';
export { Typography, GlassTypography } from './components/Typography';
export { Box, GlassBox } from './components/Box';
export { Container, GlassContainer } from './components/Container';

// Core utilities and mixins
export { glassSurface } from './core/mixins/glassSurface';
export { createThemeContext } from './core/themeContext';
export { getThemeColor, getBlurStrength, getBackgroundOpacity } from './core/themeUtils';

// Theme
export { ThemeProvider } from './theme/ThemeProvider';

// Basic animations
export { accessibleAnimation } from './animations/accessibleAnimation';

// Common hooks
export { useGlassTheme } from './hooks/useGlassTheme';
export { useResponsiveValue } from './hooks/useResponsiveValue';

// Version
export const slimVersion = '1.0.0-slim';