# GlassFocusRing Component

**Status:** Core Component

## Overview

The `GlassFocusRing` component provides an accessible, visually distinct focus indicator that aligns with the Galileo Glass UI aesthetic. It wraps focusable elements and displays an animated, glass-styled ring when the wrapped element receives focus.

This enhances accessibility by making keyboard focus clear and noticeable, especially important for users navigating without a mouse.

## Import

```typescript
import { GlassFocusRing } from '@veerone/galileo-glass-ui';
// Or
import { GlassFocusRing } from '@veerone/galileo-glass-ui/components';
```

## Usage

The primary way to use the focus ring is by wrapping the focusable element (like a button, input, or link) with the `GlassFocusRing` component.

```typescript
import React from 'react';
import { GlassFocusRing, Button } from '@veerone/galileo-glass-ui';

const FocusableButton = () => {
  return (
    <GlassFocusRing offset={4} radiusAdjust={2} color="primary">
      <Button 
        variant="contained" 
        onClick={() => console.log('Button Clicked')}
      >
        Focus Me
      </Button>
    </GlassFocusRing>
  );
};

export default FocusableButton;
```

**Explanation:**

1.  Wrap your focusable component (`Button` in this case) with `<GlassFocusRing>`. 
2.  The `GlassFocusRing` component handles focus and blur events for its immediate child.
3.  When the child receives focus, the animated focus ring appears around it.
4.  Customize the ring's appearance using props like `offset`, `radiusAdjust`, `color`, `ringThickness`, etc.

## Props (`GlassFocusRingProps`)

| Prop                | Type                                       | Default         | Description                                                                      |
| :------------------ | :----------------------------------------- | :-------------- | :------------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`                          | **Required**    | The focusable element(s) to wrap.                                                |
| `offset`            | `number`                                   | `theme.spacing.xs` or `2` | Pixel offset of the ring from the child element's bounds.                        |
| `radiusAdjust`      | `number`                                   | `theme.spacing.sm` or `4` | Added to the child's border-radius to determine the ring's radius.           |
| `color`             | `string`                                   | `'primary'`     | Theme color preset or valid CSS color string for the ring.                       |
| `thickness`         | `'sm' \| 'md' \| 'lg'`                       | `'md'`          | Controls the ring's border thickness (maps to `theme.borderWidths`).         |
| `animationPreset`   | `'pulse' \| 'fade' \| 'static'`               | `'pulse'`       | Determines the animation style when focused (`fade` relies on CSS transition). |
| `animationDuration` | `string`                                   | `'1500ms'`      | Custom duration for the `pulse` animation (CSS time format, e.g., `'1.5s'`).   |
| `animationEasing`   | `string`                                   | `'ease-in-out'` | Custom CSS easing function for the `pulse` animation.                          |
| `disabled`          | `boolean`                                  | `false`         | Disables the focus ring entirely.                                                |

## Advanced Usage: `useGlassFocus` Hook

For more complex scenarios where wrapping the component is difficult or you need direct control over the ring element, the `useGlassFocus` hook is available.

```typescript
import React, { useRef } from 'react';
import { useGlassFocus } from '@veerone/galileo-glass-ui/hooks';
import { Button } from '@veerone/galileo-glass-ui';

const HookFocusButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isFocused, focusRingProps } = useGlassFocus({ elementRef: buttonRef, offset: 3 });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}> 
      {/* Ensure parent has relative positioning */}
      <Button ref={buttonRef} variant="contained">
        Focus Me (Hook)
      </Button>
      {/* Render the ring element manually */}
      <div {...focusRingProps} />
    </div>
  );
};
```

**Note:** Using the hook requires:
1. A parent element with `position: relative`.
2. Manually rendering a `div` (or other element) and spreading the `focusRingProps` onto it.
3. The hook approach is generally less convenient than the `GlassFocusRing` component wrapper.

## Accessibility

- Provides a clear visual indication of keyboard focus.
- Respects `prefers-reduced-motion` by disabling pulsing animation if requested.
- The ring itself is hidden from assistive technologies (`aria-hidden="true"`).

## Best Practices

- Use the `GlassFocusRing` component wrapper for simplicity whenever possible.
- Ensure the wrapped element is inherently focusable (e.g., buttons, links, inputs) or has `tabIndex="0"`.
- Adjust `offset` and `radiusAdjust` to ensure the ring visually fits the wrapped component correctly.
- Choose a `color` that provides good contrast against the surrounding background. 