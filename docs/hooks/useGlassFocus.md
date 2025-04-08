# useGlassFocus Hook & GlassFocusRing Component

The `GlassFocusRing` component provides a convenient way to apply an animated, glass-styled focus indicator around a focusable element. It utilizes the `useGlassFocus` hook internally.

## `GlassFocusRing` Component

This is the recommended way to add a focus ring.

### Import

```tsx
import { GlassFocusRing } from '@veerone/galileo-glass-ui'; 
```

### Usage

Wrap any single focusable element (like a button or input) with `GlassFocusRing`.

```tsx
import React from 'react';
import { GlassFocusRing } from '@veerone/galileo-glass-ui';
import { GlassButton } from '@veerone/galileo-glass-ui'; // Example focusable component

function MyComponent() {
  return (
    <GlassFocusRing 
        color="secondary" 
        offset={4} 
        thickness={3}
        borderRadius="8px"
    >
      <GlassButton>Focus Me</GlassButton>
    </GlassFocusRing>
  );
}
```

### Component Props (`GlassFocusRingProps`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `React.ReactElement` | required | The single focusable element to wrap. |
| `variant` | `'primary' \| 'secondary' \| 'error' \| 'warning' \| 'info' \| 'success'` | `'primary'` | Style variant for the ring. Uses theme colors. |
| `color` | `'primary' \| ...` | `undefined` | Alias for `variant`. `variant` takes precedence if both are provided. |
| `offset` | `number` | `2` | Distance (px) between the ring and the wrapped element. |
| `thickness` | `number` | `2` | Thickness of the focus ring border (px). |
| `borderRadius` | `string \| number` | Auto | Custom border radius for the ring. If omitted, attempts to match the wrapped element + offset. |
| `disabled` | `boolean` | `false` | If true, disables the focus ring effect. |


## `useGlassFocus` Hook (Advanced Usage)

The `useGlassFocus` hook provides the core logic for the focus ring. You might use it directly if you need more control over rendering the ring element itself or integrating with existing components.

### Import

```tsx
import { useGlassFocus } from '@veerone/galileo-glass-ui'; 
```

### Hook Usage

```tsx
import React, { useRef } from 'react';
import { useGlassFocus } from '@veerone/galileo-glass-ui';

function FocusableButton() {
  // Ref to the actual focusable element
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const {
    isFocused,       // boolean: Is the element focused?
    focusRingProps   // object: Props to spread onto the ring div
  } = useGlassFocus({
    elementRef: buttonRef, // Pass the ref here
    variant: 'primary',
    offset: 3,
    thickness: 2
  });

  return (
    // Requires a positioned container
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button ref={buttonRef}>
        Focus Me
      </button>
      {/* Manually render the focus ring element */} 
      {isFocused && <div {...focusRingProps} />} 
    </div>
  );
}
```

### Hook Options (`UseGlassFocusOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `elementRef` | `React.RefObject<HTMLElement>` | required | A React ref pointing to the HTML element that should trigger the focus ring. |
| `variant` | `'primary' \| 'secondary' \| 'error' \| 'warning' \| 'info' \| 'success'` | `'primary'` | Style variant for the ring. Uses theme colors. |
| `offset` | `number` | `2` | Distance (px) between the ring and the element's border. |
| `borderRadius` | `string \| number` | Auto | Custom border radius for the ring. Tries to calculate based on element + offset if omitted. |
| `thickness` | `number` | `2` | Thickness of the focus ring border (px). |
| `disabled` | `boolean` | `false` | If true, disables the focus ring effect entirely. |

### Hook Return Value (`UseGlassFocusReturn`)

| Property | Type | Description |
|---|---|---|
| `isFocused` | `boolean` | Indicates whether the element referenced by `elementRef` currently has focus. |
| `focusRingProps` | `object` | An object containing `style` and data attributes (`data-glass-focus-ring`, `aria-hidden`) to be spread onto the visual focus ring element. |

## Physics-Based Animation

*(Internal Detail)* The focus ring utilizes a subtle pulse animation when the element is focused:

- **Pulse Animation**: The ring gently scales and fades opacity using a `cubic-bezier` timing function.
- **Reduced Motion**: The hook checks `prefers-reduced-motion`. If true, the animation is disabled, and the ring appears statically.

## Styling and Theme Integration

- The ring's color is determined by the `variant` prop, mapping to colors in `useGlassTheme` context.
- It attempts to dynamically calculate `borderRadius` based on the target element.
- A subtle `box-shadow` (using the theme color) creates a glow effect.

## Accessibility

- Provides a clear visual focus indicator for keyboard users.
- Respects `prefers-reduced-motion`.
- The rendered ring element (`<div {...focusRingProps} />`) has `pointer-events: none` and `aria-hidden="true"`.

## Best Practices

1.  **Use `GlassFocusRing` Component:** Prefer the component for simplicity and correct setup.
2.  **Single Child:** Ensure `GlassFocusRing` wraps only a single focusable React element.
3.  **Theme Colors:** Rely on `variant` or `color` props for consistent theme application.
4.  **Disabling:** Use the `disabled` prop when focus indication isn't needed.
