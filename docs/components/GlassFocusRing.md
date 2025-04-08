# GlassFocusRing Component

The `GlassFocusRing` component provides an elegant and accessible focus indicator that wraps around focusable elements like buttons, inputs, or any interactive component. It leverages the underlying `useGlassFocus` hook while providing a simpler component-based API.

## Features

- Creates beautiful, customizable focus rings that follow the Galileo Glass UI design language
- Automatically positions itself around the wrapped child element
- Fully respects accessibility requirements for visible focus indicators
- Supports keyboard navigation (Tab key) focus indication
- Works with any focusable element
- Customizable colors, thickness, offset, and border radius

## Installation

The `GlassFocusRing` component is included with Galileo Glass UI:

```tsx
import { GlassFocusRing } from '@veerone/galileo-glass-ui';
```

## Basic Usage

Wrap any focusable element with the `GlassFocusRing` component:

```tsx
import React from 'react';
import { GlassFocusRing, GlassButton } from '@veerone/galileo-glass-ui';

function MyComponent() {
  return (
    <GlassFocusRing>
      <GlassButton>Click Me</GlassButton>
    </GlassFocusRing>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactElement` | (required) | The focusable element to wrap (must be a single element) |
| `color` | `string` | `'primary'` | Color of the focus ring. Can be a CSS color or a theme color name ('primary', 'secondary', etc.) |
| `variant` | `'solid' \| 'gradient' \| 'glow'` | `'gradient'` | Visual style of the focus ring |
| `offset` | `number` | `4` | Distance between the child element and the focus ring (in pixels) |
| `thickness` | `number` | `2` | Thickness of the focus ring (in pixels) |
| `borderRadius` | `number \| string` | (auto) | Border radius of the focus ring. If not specified, matches the child element |
| `disabled` | `boolean` | `false` | Whether to disable the focus ring |

## Examples

### Different Colors and Variants

```tsx
import React from 'react';
import { GlassFocusRing, GlassButton } from '@veerone/galileo-glass-ui';

function ColorExamples() {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* Default (gradient primary) */}
      <GlassFocusRing>
        <GlassButton>Default</GlassButton>
      </GlassFocusRing>
      
      {/* Solid variant with theme color */}
      <GlassFocusRing color="secondary" variant="solid">
        <GlassButton>Solid Secondary</GlassButton>
      </GlassFocusRing>
      
      {/* Glow variant with custom color */}
      <GlassFocusRing color="#ff5500" variant="glow">
        <GlassButton>Custom Glow</GlassButton>
      </GlassFocusRing>
    </div>
  );
}
```

### Custom Sizing and Offset

```tsx
import React from 'react';
import { GlassFocusRing, GlassButton } from '@veerone/galileo-glass-ui';

function SizingExamples() {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* Thin focus ring with small offset */}
      <GlassFocusRing thickness={1} offset={2}>
        <GlassButton>Thin & Close</GlassButton>
      </GlassFocusRing>
      
      {/* Thick focus ring with large offset */}
      <GlassFocusRing thickness={4} offset={8}>
        <GlassButton>Thick & Far</GlassButton>
      </GlassFocusRing>
      
      {/* Custom border radius */}
      <GlassFocusRing borderRadius={20}>
        <GlassButton>Custom Radius</GlassButton>
      </GlassFocusRing>
    </div>
  );
}
```

### With Different Element Types

```tsx
import React from 'react';
import { GlassFocusRing, GlassInput } from '@veerone/galileo-glass-ui';

function ElementExamples() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* With input element */}
      <GlassFocusRing>
        <GlassInput placeholder="Focus me..." />
      </GlassFocusRing>
      
      {/* With custom div that has tabIndex */}
      <GlassFocusRing>
        <div 
          tabIndex={0} 
          role="button"
          style={{ 
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          I'm focusable too!
        </div>
      </GlassFocusRing>
    </div>
  );
}
```

## Accessibility

The `GlassFocusRing` component is designed with accessibility in mind:

- It only shows up when the element is focused via keyboard navigation, following best practices
- It makes focus state highly visible for users with visual impairments
- It respects reduced motion preferences for any animations
- It doesn't interfere with assistive technologies

## Implementation Details

The `GlassFocusRing` component:

1. Uses `React.Children.only()` to ensure it only wraps a single child element
2. Clones the child element to attach its own ref (preserving any existing ref on the child)
3. Uses the `useGlassFocus` hook to handle focus detection and styling
4. Positions a div with absolute positioning around the child element to create the focus ring

## Related

- `useGlassFocus` - The underlying hook for more advanced customization
- `GlassButton` - Button component with built-in glass UI styling
- `GlassInput` - Input component with built-in glass UI styling 