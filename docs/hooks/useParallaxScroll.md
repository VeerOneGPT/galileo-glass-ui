# useParallaxScroll Hook

Applies a parallax scrolling effect to an element, making it appear to move at a different speed than the rest of the page content during scrolling.

## Import

```jsx
import { useParallaxScroll } from '@veerone/galileo-glass-ui/hooks'; 
// Or specific path: import { useParallaxScroll } from '../hooks/useParallaxScroll';
```

## Usage

```jsx
import React from 'react';
import { useParallaxScroll } from '@veerone/galileo-glass-ui/hooks';

const ParallaxComponent = () => {
  const { ref, style } = useParallaxScroll<HTMLDivElement>({ factor: 0.3, axis: 'y' });

  return (
    <div ref={ref} style={{ ...style, height: '200px', background: 'lightblue' }}>
      I move slower on scroll!
    </div>
  );
};

export default ParallaxComponent;
```

## Options

-   `factor` (number, optional): 
    -   Determines the speed and direction of the parallax effect relative to normal scroll.
    -   `0`: No parallax effect (moves with the page).
    -   `0` to `1`: Moves slower than the page scroll (appears further away). E.g., `0.5` moves at half speed.
    -   `1`: Moves exactly with the page scroll (no relative movement).
    -   `> 1`: Moves faster than the page scroll (appears closer).
    -   Negative values: Moves in the opposite direction of the scroll.
    -   Default: `0.5`
-   `axis` ('x' | 'y', optional): 
    -   The scroll axis to apply the effect to.
    -   Default: `'y'`
-   `disabled` (boolean, optional):
    -   Disables the parallax effect entirely. Also respects `prefers-reduced-motion`.
    -   Default: `false`
-   `scrollContainerRef` (RefObject<HTMLElement>, optional):
    -   A React ref to a specific scrollable parent element. If not provided, the effect listens to the window scroll.

## Return Value

The hook returns an object with:

-   `ref` (RefObject<T>): A React ref object that should be attached to the target HTML element you want to apply the parallax effect to.
-   `style` (React.CSSProperties): A style object containing the necessary `transform` and `will-change` properties. This should be spread onto the target element's style prop.

## Notes

-   The effect works by applying a `translate3d` transform based on the scroll position and the provided `factor`.
-   Performance is optimized using `requestAnimationFrame` to avoid triggering style recalculations on every scroll event.
-   The hook respects the user's `prefers-reduced-motion` setting unless explicitly overridden by the `disabled` option. 