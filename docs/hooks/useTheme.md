# Theme Access

The Galileo Glass UI library provides a comprehensive theme system. Here's how to access theme values and controls within your components:

## `useGlassTheme` Hook

This is the primary hook for interacting with the theme system.

```typescript
import { useGlassTheme, GlassThemeContextValue } from '@veerone/galileo-glass-ui';

const MyComponent = () => {
  const {
    theme,        // The full theme object (ThemeOptions)
    colorMode,    // Current color mode ('light', 'dark', 'system')
    themeVariant, // Current theme variant ('default', 'dashboard', etc.)
    isDarkMode,   // Boolean indicating if dark mode is active
    setColorMode, // Function to change the color mode
    setThemeVariant // Function to change the theme variant
  }: GlassThemeContextValue = useGlassTheme();

  // Example: Accessing a theme color
  const primaryColor = theme.colors.primary;

  // Example: Toggling color mode
  const toggleMode = () => {
    setColorMode(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div style={{ color: primaryColor }}>
      Current variant: {themeVariant}
      <button onClick={toggleMode}>Toggle Dark Mode</button>
    </div>
  );
};
```

**Return Value (`GlassThemeContextValue`):**

*   `theme`: The complete `ThemeOptions` object containing `colors`, `typography`, `spacing`, and `effects`.
*   `colorMode`: The currently active `ColorMode` (`'light'`, `'dark'`, or `'system'`).
*   `themeVariant`: The currently active `ThemeVariant` (e.g., `'default'`, `'dashboard'`).
*   `isDarkMode`: A boolean derived from `colorMode` and system preference for convenience.
*   `setColorMode`: Function `(mode: ColorMode) => void` to update the global color mode.
*   `setThemeVariant`: Function `(variant: ThemeVariant) => void` to update the global theme variant.

## `useTheme` Hook

This hook provides direct access to the `theme` object (`ThemeOptions`) without the additional context values and setters.

```typescript
import { useTheme, ThemeOptions } from '@veerone/galileo-glass-ui';

const MySimpleComponent = () => {
  const theme: ThemeOptions = useTheme();

  // Example: Accessing spacing
  const padding = theme.spacing.md;

  return <div style={{ padding: `${padding}px` }}>Styled with theme spacing.</div>;
};
```

**When to Use Which:**

*   Use `useGlassTheme` when you need the full context: access to `colorMode`, `themeVariant`, `isDarkMode`, or the ability to change the theme (`setColorMode`, `setThemeVariant`).
*   Use `useTheme` for simpler cases where you only need read-only access to the theme properties (`colors`, `typography`, `spacing`, `effects`).

## Theme Structure (`ThemeOptions`)

Refer to the type definitions for the detailed structure:

*   `colors`: `ThemeColors` (primary, secondary, background, surface, text, etc.)
*   `typography`: `ThemeTypography` (fontFamily, fontWeight*, h1-h6, body1-2, etc.)
*   `spacing`: `ThemeSpacing` (unit, xs-xl)
*   `effects`: `ThemeEffects` (borderRadius, boxShadow, transition, glassEffects)

(You can find the full type definitions in `src/hooks/useGlassTheme.ts` or potentially exported types in the library). 