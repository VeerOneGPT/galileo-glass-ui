# Switch Component Documentation

`Switch` provides a toggle control, often used for boolean settings.

## Import

```typescript
import { Switch } from '@veerone/galileo-glass-ui';
// Or for the explicit glass version:
import { GlassSwitch } from '@veerone/galileo-glass-ui';
```

## Usage

### Basic Switch

```typescript jsx
import React, { useState } from 'react';
import { Switch } from '@veerone/galileo-glass-ui';

const MyComponent = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setIsChecked(checked);
  };

  return <Switch checked={isChecked} onChange={handleChange} />;
};
```

### Switch with Label

```typescript jsx
import React, { useState } from 'react';
import { Switch } from '@veerone/galileo-glass-ui';

const MyComponent = () => {
  const [isChecked, setIsChecked] = useState(true);

  return (
    <Switch 
      checked={isChecked} 
      onChange={(e, checked) => setIsChecked(checked)} 
      label="Enable Feature"
      labelPlacement="end" // 'start', 'end', 'top', 'bottom'
    />
  );
};
```

### Glass Switch

```typescript jsx
import React, { useState } from 'react';
import { GlassSwitch } from '@veerone/galileo-glass-ui';

const MyComponent = () => {
  const [isChecked, setIsChecked] = useState(true);

  return (
    <GlassSwitch 
      checked={isChecked} 
      onChange={(e, checked) => setIsChecked(checked)} 
      color="secondary"
    />
  );
};
```

## Props (`SwitchProps`)

| Prop              | Type                                                          | Default     | Description                                                  |
|-------------------|---------------------------------------------------------------|-------------|--------------------------------------------------------------|
| `checked`         | `boolean`                                                     | -           | If true, the switch is checked (controlled).                 |
| `defaultChecked`  | `boolean`                                                     | `false`     | The default checked state (uncontrolled).                    |
| `disabled`        | `boolean`                                                     | `false`     | If true, the switch is disabled.                             |
| `id`              | `string`                                                      | (auto)      | The id for the underlying input element.                     |
| `name`            | `string`                                                      | -           | The name for the underlying input element.                   |
| `onChange`        | `(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void` | -           | Callback fired when the state is changed.                   |
| `size`            | `'small' \| 'medium' \| 'large'`                              | `'medium'`  | The size of the switch.                                      |
| `color`           | `'primary' \| 'secondary' \| 'error' \| 'warning' \| 'info' \| 'success'` | `'primary'` | The color of the switch when checked.                        |
| `value`           | `string`                                                      | -           | The value of the switch (submitted with forms).              |
| `label`           | `string`                                                      | -           | A label to display next to the switch.                       |
| `labelPlacement`  | `'start' \| 'end' \| 'top' \| 'bottom'`                       | `'end'`     | The position of the label relative to the switch.            |
| `glass`           | `boolean`                                                     | `false`     | If true, applies glass styling (used by `GlassSwitch`).      |
| `className`       | `string`                                                      | -           | Additional CSS class name for the container label element.   |
| `animationConfig` | `Partial<GalileoSpringConfig>`                                | (Defaults)  | Optional spring configuration for the toggle animation. Uses `useGalileoStateSpring`. |

**Note:** `GlassSwitch` is a wrapper around `Switch` that sets the `glass` prop to `true` by default. 