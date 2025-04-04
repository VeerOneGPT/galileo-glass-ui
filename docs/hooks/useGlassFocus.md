# useGlassFocus Hook

The `useGlassFocus` hook provides a mechanism to apply an animated, glass-styled focus ring around a target element. It listens for focus and blur events on the specified element and returns the focus state and props needed to render the visual focus ring.

## Import

```tsx
import { useGlassFocus } from '@veerone/galileo-glass-ui'; 
```

## Usage

This hook is typically used within a component that needs to visually indicate focus. It requires a ref to the focusable element.

```tsx
import React, { useRef } from 'react';
import { useGlassFocus } from '@veerone/galileo-glass-ui';

function FocusableButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    isFocused, 
    focusRingProps 
  } = useGlassFocus({
    elementRef: buttonRef,
    variant: 'primary',
    offset: 3,
    thickness: 2
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button ref={buttonRef}>
        Focus Me
      </button>
      {/* Render the focus ring element using the returned props */}
      <div {...focusRingProps} /> 
    </div>
  );
}
```

## `GlassFocusRing` Component (Conceptual Usage)

While the `useGlassFocus` hook provides the core logic, it's often encapsulated within a dedicated `GlassFocusRing` component for easier composition:

```tsx
// Conceptual Example - Assuming GlassFocusRing uses useGlassFocus internally
import React from 'react';
import { GlassFocusRing } from '@veerone/galileo-glass-ui';

function MyComponent() {
  return (
    <GlassFocusRing color="secondary" offset={4} ringThickness={3}>
      <button>Click Me</button>
    </GlassFocusRing>
  );
}
```

## Hook Options (`UseGlassFocusOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `elementRef` | `React.RefObject<HTMLElement>` | required | A React ref pointing to the HTML element that should trigger the focus ring. |
| `variant` | `'primary' \| 'secondary' \| 'error' \| 'warning' \| 'info' \| 'success'` | `'primary'` | Style variant for the ring. Uses colors defined in the theme context. |
| `offset` | `number` | `2` | The distance (in pixels) between the focus ring and the element's border. |
| `borderRadius` | `string \| number` | See below | Custom border radius for the ring. If not provided, it attempts to calculate based on the element's `borderRadius` plus the `offset`. Defaults to `offset * 2` if calculation fails. |
| `thickness` | `number` | `2` | The thickness of the focus ring border (in pixels). |
| `disabled` | `boolean` | `false` | If true, disables the focus ring effect entirely. |

## Hook Return Value (`UseGlassFocusReturn`)

| Property | Type | Description |
|---|---|---|
| `isFocused` | `boolean` | Indicates whether the element referenced by `elementRef` currently has focus. |
| `focusRingProps` | `object` | An object containing style and data attributes to be spread onto the visual focus ring element. Includes `style`, `data-glass-focus-ring`, and `aria-hidden`. |

## Physics-Based Animation

The focus ring utilizes a subtle pulse animation when the element is focused:

- **Pulse Animation**: The ring gently scales and fades in opacity using a `cubic-bezier` timing function, creating a soft, pulsing effect.
- **Reduced Motion**: The hook checks for the `prefers-reduced-motion` media query. If reduced motion is preferred, the animation is disabled, and the ring appears statically with slightly reduced opacity.

## Styling and Theme Integration

- The ring's color is determined by the `variant` prop, mapping to colors defined in the `useGlassTheme` context (e.g., `theme.colors.primary`).
- It attempts to dynamically calculate the `borderRadius` based on the target element for a snug fit, but a custom `borderRadius` can be provided.
- A subtle `box-shadow` is applied to create a glow effect, also using the theme color.

## Accessibility

- The focus ring provides a clear visual indicator for keyboard users, enhancing navigation.
- It respects `prefers-reduced-motion` by disabling the pulse animation.
- The rendered ring element has `pointer-events: none` and `aria-hidden="true"` to ensure it doesn't interfere with interaction or screen readers.

## Best Practices

1.  **Ref Handling**: Ensure the `elementRef` is correctly attached to the focusable element.
2.  **Positioning**: The parent container of the focusable element and the focus ring element should have `position: relative` or `position: absolute` to allow the ring to be positioned correctly around the element.
3.  **Composition**: For reusable focus indication, consider creating a wrapper component (like the conceptual `GlassFocusRing`) that utilizes this hook internally.
4.  **Theme Colors**: Rely on theme variants (`primary`, `secondary`, etc.) for consistent color application across your application.
5.  **Disabling**: Use the `disabled` option when focus indication is not desired for a specific interactive element.
