# Glass UI Components

The Glass UI design system provides a collection of components with glass morphism styling for creating modern, elegant UIs.

## Using GlassSurfacePropTypes

All Glass components share common styling props defined in `GlassSurfaceProps`. To ensure consistency and proper validation, we export `GlassSurfacePropTypes` from the ThemeProvider.

### Importing GlassSurfacePropTypes

```tsx
// Import directly from ThemeProvider
import { GlassSurfacePropTypes } from '../../theme/ThemeProvider';

// Or import from the Glass components package
import { GlassSurfacePropTypes } from '../Glass';
```

### Using GlassSurfacePropTypes in Custom Components

When creating custom components that need glass styling, use the `GlassSurfacePropTypes` for PropType validation:

```tsx
import React from 'react';
import PropTypes from 'prop-types';
import { GlassSurfacePropTypes, useGlassEffects } from '../Glass';

const CustomGlassComponent = (props) => {
  // Component implementation
};

// @ts-ignore - Ignoring TypeScript errors with PropTypes validation
CustomGlassComponent.propTypes = {
  // Include all glass surface props
  variant: PropTypes.oneOf(['standard', 'frosted', 'dimensional', 'heat']),
  blurStrength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  backgroundOpacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderOpacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  glowIntensity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  elevation: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['none', 'low', 'medium', 'high'])
  ]),
  interactive: PropTypes.bool,
  darkMode: PropTypes.bool,
  // Component-specific props
  children: PropTypes.node,
  // Other custom props...
};
```

### GlassSurface Props

All Glass components accept these standard glass styling props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | 'standard' \| 'frosted' \| 'dimensional' \| 'heat' | 'standard' | Glass styling variant |
| `blurStrength` | string \| number | 'medium' | Blur intensity ('light', 'medium', 'high', or px value) |
| `backgroundOpacity` | string \| number | 'medium' | Background opacity ('transparent', 'lightest', 'light', 'medium', 'high', 'solid', or 0-1) |
| `borderOpacity` | string \| number | 'medium' | Border opacity ('none', 'minimal', 'subtle', 'medium', 'high', or 0-1) |
| `glowIntensity` | string \| number | 'medium' | Glow effect intensity ('minimal', 'light', 'medium', 'strong', 'extreme', or 0-1) |
| `elevation` | number \| 'none' \| 'low' \| 'medium' \| 'high' | 1 | Shadow elevation level |
| `interactive` | boolean | false | Whether the component has interactive states |
| `darkMode` | boolean | theme default | Force dark/light mode for the component |

## Available Glass Components

### GlassCard

A card component with glass morphism styling. Extends all GlassSurface props.

```tsx
import { GlassCard } from '../Glass';

<GlassCard 
  title="Card Title"
  variant="frosted"
  elevation={2}
  interactive
>
  <p>Card content goes here.</p>
</GlassCard>
```

#### Additional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | undefined | Optional card title |
| `padding` | 'none' \| 'small' \| 'medium' \| 'large' | 'medium' | Padding inside the card |
| `maxWidth` | string | undefined | Maximum width (CSS value) |
| `onClick` | function | undefined | Click handler (also sets interactive=true) |

## Best Practices

1. **Consistent Variant Usage**: Use the same variant for related components to maintain visual consistency
2. **Responsive Elevation**: Lower elevation values on mobile to reduce visual noise
3. **Interactive States**: Set `interactive` to true for clickable components
4. **Dark Mode Adaptation**: Let components adapt to theme dark mode by default - only override with `darkMode` prop when needed
5. **Accessibility**: Ensure text on glass surfaces has sufficient contrast for readability

## TypeScript Integration

When working with TypeScript, import the GlassSurfaceProps type:

```tsx
import type { GlassSurfaceProps } from '../../core/types';

interface MyCustomComponentProps extends GlassSurfaceProps {
  // Additional props specific to your component
}
```

### TypeScript and PropTypes Compatibility

When using PropTypes with TypeScript, you may encounter type errors even though your runtime validation is correct. This is because PropTypes is designed for runtime validation, while TypeScript handles compile-time type checking.

To handle these compatibility issues, use one of these approaches:

1. **Disable TypeScript checking for the entire file:**

```tsx
// @ts-nocheck - TypeScript has difficulty with PropTypes validation
import React from 'react';
import PropTypes from 'prop-types';
// Rest of your component...
```

2. **Disable TypeScript checking for just the PropTypes definition:**

```tsx
// Component implementation...

// @ts-expect-error TypeScript has difficulty with PropTypes validation
ComponentName.propTypes = {
  // PropTypes definition...
};
```

3. **Use ESLint disable comments for prop-types rules:**

```tsx
/* eslint-disable react/prop-types */
ComponentName.propTypes = {
  // PropTypes definition...
};
/* eslint-enable react/prop-types */
```

Using these approaches ensures your components maintain runtime validation via PropTypes while avoiding TypeScript compilation errors. 