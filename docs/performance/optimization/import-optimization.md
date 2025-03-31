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
import { Button, GlassButton } from '@veerone/galileo-glass-ui/components/Button';

// Import only the Card component (use `glass` prop for styling)
import { Card } from '@veerone/galileo-glass-ui/components/Card';

// Import only the Chart components
import { AreaChart, BarChart, PieChart } from '@veerone/galileo-glass-ui/components/Charts';
```