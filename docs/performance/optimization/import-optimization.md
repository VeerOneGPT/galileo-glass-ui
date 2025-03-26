# Galileo Glass UI - Optimized Import Guidelines

To optimize bundle size when using Galileo Glass UI, we recommend using the following import patterns:

## Basic Import (Not Optimized)

```jsx
// This imports the entire library - NOT RECOMMENDED for production
import { Button, Card, Typography } from 'galileo-glass-ui';
```

## Optimized Module Imports

Import only the modules you need:

```jsx
// Import only the Button component
import { Button, GlassButton } from 'galileo-glass-ui/components/Button';

// Import only the Card component
import { Card, GlassCard } from 'galileo-glass-ui/components/Card';

// Import only the Chart components
import { AreaChart, BarChart, PieChart } from 'galileo-glass-ui/components/Charts';
```

## Optimized Domain-specific Imports

```jsx
// Core utilities for styling and theming
import { glassSurface, glowEffects } from 'galileo-glass-ui/core';

// Theme provider and utilities
import { ThemeProvider, useTheme } from 'galileo-glass-ui/theme';

// Animation utilities
import { accessibleAnimation, springAnimation } from 'galileo-glass-ui/animations';

// React hooks
import { useGlassTheme, usePhysicsInteraction } from 'galileo-glass-ui/hooks';
```

## Bundle Size Comparison

| Import Method | Bundle Size Impact |
|---------------|-------------------|
| Full library import | ~600KB (minified) |
| Single component import | 10-50KB per component |
| Core utilities only | ~50KB |
| Theme provider only | ~30KB |

## Tree-shaking

Galileo Glass UI is designed to be fully tree-shakable when using ESM imports:

```jsx
// This will only include Button and its dependencies in your build
import { Button } from 'galileo-glass-ui/components/Button';
```

## Advanced Performance Considerations

For highly optimized applications, consider these additional tips:

1. Use dynamic imports for rarely used components:
   ```jsx
   const DynamicModal = React.lazy(() => import('galileo-glass-ui/components/Modal'));
   ```

2. Consider code-splitting by route or feature:
   ```jsx
   // Dashboard.jsx - only loads chart components for dashboard
   import { AreaChart, BarChart } from 'galileo-glass-ui/components/Charts';
   
   // Forms.jsx - only loads form components for forms
   import { TextField, Select } from 'galileo-glass-ui/components/Forms';
   ```

3. For SSR (Server-Side Rendering) applications, use the optimized import paths to avoid loading unnecessary components during server rendering.

By following these guidelines, you can significantly reduce your application's bundle size while still taking advantage of Galileo Glass UI's beautiful glass morphism effects.