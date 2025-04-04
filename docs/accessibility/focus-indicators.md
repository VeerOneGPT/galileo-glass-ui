# Glass Focus Indicators

The Galileo Glass UI library provides mechanisms for displaying visually distinct focus indicators that align with the glass aesthetic, enhancing accessibility for keyboard users.

There are two primary ways to implement this:

1.  **`GlassFocusRing` Component:** A wrapper component that automatically applies the focus ring style to its direct child when the child receives focus.
2.  **`useGlassFocus` Hook:** A hook that provides the necessary state and style props to manually apply the focus ring effect to an element.

## `GlassFocusRing` Component

This is the simplest way to add the glass focus ring effect.

### Import

```tsx
import { GlassFocusRing } from '@veerone/galileo-glass-ui';
```

### Usage

Wrap the interactive element (e.g., button, input, link) that should display the focus ring:

```tsx
import React from 'react';
import { GlassFocusRing, GlassButton } from '@veerone/galileo-glass-ui';

function FocusedButton() {
  return (
    <GlassFocusRing>
      <GlassButton onClick={() => console.log('Clicked!')}>
        Focus Me
      </GlassButton>
    </GlassFocusRing>
  );
}
```

### How it Works

The `GlassFocusRing` component uses `React.cloneElement` to attach focus and blur event handlers to its child. When the child gains focus, the component renders the focus ring style around it. It respects `prefers-reduced-motion` for animations.

### Props

| Prop        | Type              | Default     | Description                                          |
| :---------- | :---------------- | :---------- | :--------------------------------------------------- |
| `children`  | `React.ReactElement` | **Required** | A single React element that can receive focus.      |
| `offset`    | `number \| string` | `'2px'`     | Space between the element and the focus ring.      |
| `thickness` | `number \| string` | `'2px'`     | Thickness of the focus ring.                      |
| `color`     | `string`          | `theme.colors.primaryAccent` | Color of the focus ring (theme color name or CSS color). |
| `animated`  | `boolean`         | `true`      | Enable animation (respects reduced motion).         |

---

## `useGlassFocus` Hook

Provides more manual control over applying the focus ring style.

### Import

```tsx
import { useGlassFocus } from '@veerone/galileo-glass-ui';
```

### Usage

Attach the `focusProps` (containing `onFocus`, `onBlur`) to the element and apply the `focusStyles` conditionally.

```tsx
import React from 'react';
import styled from 'styled-components';
import { useGlassFocus } from '@veerone/galileo-glass-ui';

const FocusableDiv = styled.div<{ $isFocused?: boolean }>`
  padding: 20px;
  border: 1px solid grey;
  border-radius: 8px;
  outline: none; // Important: Remove default outline
  position: relative; // Needed for pseudo-element positioning

  ${({ $isFocused, theme }) => $isFocused && `
    /* Apply focus styles from hook */
    &:before {
      content: '';
      position: absolute;
      top: -4px; // Example offset calculation
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 10px; // Slightly larger than element
      border: 2px solid ${theme.colors.primaryAccent};
      pointer-events: none;
      animation: focus-pulse 1.5s infinite ease-in-out; // Example animation
    }
  `}

  @keyframes focus-pulse {
    0% { opacity: 0.5; } 
    50% { opacity: 1; } 
    100% { opacity: 0.5; }
  }

  @media (prefers-reduced-motion: reduce) {
    &:before {
      animation: none; 
      opacity: 1;
    }
  }
`;

function HookFocusedElement() {
  const { isFocused, focusProps } = useGlassFocus();

  return (
    <FocusableDiv tabIndex={0} {...focusProps} $isFocused={isFocused}>
      Focus me with the keyboard
    </FocusableDiv>
  );
}
```

### Return Value

The hook returns an object:

```typescript
{
  isFocused: boolean; // True if the element currently has focus
  focusProps: { // Props to spread onto the target element
    onFocus: (event: React.FocusEvent<Element>) => void;
    onBlur: (event: React.FocusEvent<Element>) => void;
  };
}
```

### When to Use

Use the hook when:

- You need to apply the focus style to an element that cannot be directly wrapped by `GlassFocusRing`.
- You want to integrate the focus state (`isFocused`) with other component logic.
- You need full control over the focus ring's appearance and animation via CSS.

---

## Accessibility

Both methods automatically respect the `prefers-reduced-motion` media query, providing a static but visible focus indicator when motion is disabled.

Ensure that focus indicators have sufficient contrast against the background according to WCAG guidelines. 