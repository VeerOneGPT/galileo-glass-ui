# `useScrollReveal` Hook and `ScrollReveal` Component

This document provides documentation for the `useScrollReveal` hook and the accompanying `ScrollReveal` component, designed to animate elements into view as they enter the viewport.

## Overview

The `useScrollReveal` hook leverages the `IntersectionObserver` API to detect when an element becomes visible. It then applies configurable spring-based animations (using `useGalileoStateSpring`) to reveal the element. It also respects user preferences for reduced motion via `useEnhancedReducedMotion`.

The `ScrollReveal` component provides a convenient wrapper around the `useScrollReveal` hook, allowing you to easily apply reveal effects to your components using JSX.

## Import

```tsx
// Correct import path from the main package entry point
import { useScrollReveal, ScrollReveal } from '@veerone/galileo-glass-ui';
```

## `useScrollReveal` Hook

This hook provides the core logic for observing an element and generating animation styles.

### Usage

```tsx
import React, { useRef } from 'react';
// Correct import path
import { useScrollReveal } from '@veerone/galileo-glass-ui';

function MyRevealingComponent() {
  const { ref, style } = useScrollReveal({ effect: "fade-up", triggerOnce: true });

  return (
    <div ref={ref} style={style}>
      This content will fade up when it enters the viewport.
    </div>
  );
}
```

### Parameters

The hook accepts an optional options object (`ScrollRevealOptions`) with the following properties:

*   `threshold` (`number`, optional, default: `0.1`): A number between 0 and 1 indicating the percentage of the target's visibility the observer's callback should be executed.
*   `rootMargin` (`string`, optional, default: `"0px"`): Margin around the root. Can have values similar to the CSS `margin` property (e.g., `"10px 20px 30px 40px"` (top, right, bottom, left)). Useful for adjusting the trigger point relative to the viewport.
*   `triggerOnce` (`boolean`, optional, default: `true`): If `true`, the animation runs only the first time the element becomes visible. If `false`, the element animates out when it leaves the viewport and animates back in when it re-enters.
*   `effect` (`RevealEffect`, optional, default: `"fade-up"`): The type of animation effect to apply. Available options:
    *   `"fade-up"`
    *   `"fade-down"`
    *   `"fade-left"`
    *   `"fade-right"`
    *   `"zoom-in"`
    *   `"none"` (disables animation)
    *   *Note: Animation is automatically set to `"none"` if `prefersReducedMotion` is true or a low-performance condition is detected (placeholder logic).*
*   `animationConfig` (`string | { tension: number; friction: number; mass?: number }`, optional, default: `SpringPresets.GENTLE`): Configuration for the underlying spring animation provided by `useGalileoStateSpring`. Can be a preset name (e.g., `"GENTLE"`, `"WOBBLY"`) or a custom object with `tension`, `friction`, and optional `mass`.

### Return Value

The hook returns an object with the following properties:

*   `ref` (`React.RefObject<HTMLElement>`): A React ref object that *must* be attached to the DOM element you want to observe and animate.
*   `style` (`React.CSSProperties`): An object containing `opacity` and `transform` styles calculated based on the visibility state and the selected effect. This should be applied to the `style` prop of the target element.

## `ScrollReveal` Component

This component wraps the `useScrollReveal` hook for easier declarative use.

### Usage

```tsx
import React from 'react';
// Correct import path
import { ScrollReveal } from '@veerone/galileo-glass-ui';

function App() {
  return (
    <div>
      <p>Scroll down...</p>
      <ScrollReveal effect="fade-right" threshold={0.5} as="section">
        <h2>Revealed Section</h2>
        <p>This entire section will fade in from the right.</p>
      </ScrollReveal>
      <ScrollReveal effect="zoom-in" className="my-custom-class">
         <img src="image.jpg" alt="Revealed" />
      </ScrollReveal>
    </div>
  );
}
```

### Props

The `ScrollReveal` component accepts all the properties defined in `ScrollRevealOptions` (see `useScrollReveal` Parameters above) plus:

*   `children` (`React.ReactNode`, required): The content to be wrapped and animated.
*   `className` (`string`, optional): CSS class names to apply to the wrapper element.
*   `as` (`React.ElementType`, optional, default: `"div"`): The type of HTML element to render as the wrapper (e.g., `"div"`, `"span"`, `"section"`).
*   Any other standard HTML attributes (e.g., `id`, `data-*`) will be passed down to the rendered wrapper element.

## Examples

### Triggering Animation Earlier

To make the animation trigger when the element is 100px away from entering the viewport:

```tsx
<ScrollReveal rootMargin="-100px 0px -100px 0px">
  {/* Content */}
</ScrollReveal>
```

### Custom Animation Stiffness

```tsx
<ScrollReveal animationConfig={{ tension: 200, friction: 20 }}>
  {/* Content */}
</ScrollReveal>
```

### Re-animating Every Time

```tsx
<ScrollReveal triggerOnce={false}>
  {/* Content will animate in and out */}
</ScrollReveal>
```

## Best Practices

*   **Performance:** While `IntersectionObserver` is efficient, avoid applying this to an excessive number of elements simultaneously, especially with complex animations. Use `triggerOnce: true` (the default) where possible.
*   **Accessibility:** The hook respects `prefersReducedMotion`. Ensure your animations are subtle and don't impede usability for users who prefer reduced motion.
*   **Ref Usage:** Ensure the `ref` returned by `useScrollReveal` or used internally by `ScrollReveal` is correctly attached to the intended DOM element.
*   **Styling:** The generated `style` object includes `opacity` and `transform`. Be mindful if you apply conflicting transforms directly via CSS or other style props, though the component attempts to merge styles passed via the `style` prop. 