# MenuItem Component Documentation

`MenuItem` represents a single option within a `Menu` or potentially a `Select` component's dropdown (Note: Current implementation is a placeholder).

## Import

```typescript
import { MenuItem } from '@veerone/galileo-glass-ui';
// Or for the explicit glass version (also placeholder):
import { GlassMenuItem } from '@veerone/galileo-glass-ui';
```

## Usage

(Note: Intended usage within a Menu or Select component is not fully defined by the placeholder implementation).

```typescript jsx
import React from 'react';
import { MenuItem } from '@veerone/galileo-glass-ui';

const MyMenu = () => {
  const handleClick = () => {
    console.log('Item clicked!');
  };

  return (
    <ul> {/* Assuming used within a list-like structure */}
      <MenuItem onClick={handleClick}>Option 1</MenuItem>
      <MenuItem disabled>Option 2 (Disabled)</MenuItem>
      <MenuItem selected>Option 3 (Selected)</MenuItem>
    </ul>
  );
};
```

## Props

The `MenuItem` component accepts the following props (based on placeholder definition):

| Prop       | Type                                         | Default     | Description                                   |
| ---------- | -------------------------------------------- | ----------- | --------------------------------------------- |
| `onClick`  | `(event: React.MouseEvent<HTMLLIElement>) => void` | `undefined` | Callback fired when the menu item is clicked. |
| `disabled` | `boolean`                                    | `false`     | If `true`, the menu item is disabled.         |
| `selected` | `boolean`                                    | `false`     | If `true`, the menu item is selected.         |
| `children` | `React.ReactNode`                            | `undefined` | The content of the menu item.                 |

`GlassMenuItem` is an alias for `MenuItem` and accepts the same props.

**Warning:** The current implementation of `MenuItem` and `GlassMenuItem` in the source code is a placeholder and does not render children or apply styles/functionality based on props. It requires a full implementation. 