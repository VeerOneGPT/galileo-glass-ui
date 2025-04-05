# GlassSwitch Component

**Status:** Core Component

## Overview

The `GlassSwitch` component provides a toggle switch input with Glassmorphism styling, often used for boolean settings.

## Import

```typescript
import { GlassSwitch } from '@veerone/galileo-glass-ui';
```

## Usage Example

```tsx
import React, { useState } from 'react';
import { GlassSwitch } from '@veerone/galileo-glass-ui';

function SwitchDemo() {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  return (
    <div>
      <GlassSwitch 
        checked={isChecked}
        onChange={handleChange}
      />
      <GlassSwitch 
        checked={true} 
        disabled 
        label="Disabled On" 
      />
      <GlassSwitch 
        checked={false} 
        size="small" 
        label="Small Off" 
      />
    </div>
  );
}
```

## Props (Inferred - Requires Verification)

*Note: This API is inferred and needs confirmation from source code or official documentation.* 

| Prop         | Type                                    | Default     | Description                                      |
| :----------- | :-------------------------------------- | :---------- | :----------------------------------------------- |
| `checked`    | `boolean`                               | `false`     | Whether the switch is checked (on).             |
| `onChange`   | `(event: React.ChangeEvent<HTMLInputElement>) => void` | `undefined` | Callback fired when the state is changed.      |
| `disabled`   | `boolean`                               | `false`     | If true, the switch is disabled.                 |
| `size?`      | `'small' \| 'medium'`                  | `'medium'`  | The size of the switch.                          |
| `label?`     | `string`                                | `undefined` | Optional label text associated with the switch. |
| `value?`     | `string`                                | `undefined` | The value of the component (for form submission).|
| `id?`        | `string`                                | `undefined` | ID for the underlying input element.           |
| `className?` | `string`                                | `undefined` | Additional CSS class name.                     |
| `style?`     | `React.CSSProperties`                   | `undefined` | Inline styles.                                   |

## Styling

- Uses `styled-components` internally.
- Applies glass effects based on the theme context. 