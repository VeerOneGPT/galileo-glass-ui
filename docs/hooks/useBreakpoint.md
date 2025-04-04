# `useBreakpoint` Hook

**Status:** Core Hook

## Overview

The `useBreakpoint` hook detects the current screen size breakpoint based on the configured theme values (or defaults) and provides utility functions for responsive design.

## Import

```typescript
import { useBreakpoint } from '@veerone/galileo-glass-ui/hooks';
import type { Breakpoint } from '@veerone/galileo-glass-ui/hooks'; // Or from types
```

## Usage

```typescript
import React from 'react';
import { useBreakpoint } from '@veerone/galileo-glass-ui/hooks';
import { Box, Typography } from '@veerone/galileo-glass-ui'; // Example components

function ResponsiveComponent() {
  const { breakpoint, isMobile, isDesktop, isBreakpointUp } = useBreakpoint();

  return (
    <Box sx={{ padding: 2 }}>
      <Typography>Current Breakpoint: {breakpoint.toUpperCase()}</Typography>
      {isMobile && <Typography color="secondary">Showing mobile layout.</Typography>}
      {isDesktop && <Typography color="primary">Showing desktop layout.</Typography>}
      {isBreakpointUp('md') && <Typography>Screen is Medium or larger.</Typography>}
    </Box>
  );
}
```

## Return Value

The hook returns an object with the following properties:

| Property            | Type                               | Description                                                              |
|---------------------|------------------------------------|--------------------------------------------------------------------------|
| `breakpoint`        | `Breakpoint` (`'xs'\|...\|'xl'`) | The key of the current active breakpoint (e.g., 'md').                      |
| `isMobile`          | `boolean`                          | True if the breakpoint is 'xs' or 'sm'.                                  |
| `isTablet`          | `boolean`                          | True if the breakpoint is 'md'.                                           |
| `isDesktop`         | `boolean`                          | True if the breakpoint is 'lg' or 'xl'.                                  |
| `isBreakpointUp`    | `(bp: Breakpoint) => boolean`      | Function to check if the current breakpoint is >= the specified one.     |
| `isBreakpointDown`  | `(bp: Breakpoint) => boolean`      | Function to check if the current breakpoint is < the specified one.        |
| `isBreakpointBetween`| `(lower: Breakpoint, upper: Breakpoint) => boolean` | Function to check if the current breakpoint is between the two specified. |
| `createMediaQuery`  | `(bp: Breakpoint) => string`       | Utility to generate a `min-width` media query string for the breakpoint. |
| `values`            | `Record<Breakpoint, number>`       | Object containing the pixel values for each breakpoint (e.g., `{ xs: 0, sm: 600, ... }`). |

## Breakpoints

The default breakpoints used are:
- `xs`: 0px
- `sm`: 600px
- `md`: 960px
- `lg`: 1280px
- `xl`: 1920px

These can be customized via the `theme.breakpoints.values` object passed to the `ThemeProvider`. 