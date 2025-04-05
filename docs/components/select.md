# Select Component Documentation

`Select` provides a dropdown menu for selecting a single option.

## Import

```typescript
import { Select } from '@veerone/galileo-glass-ui';
// Or for the explicit glass version:
import { GlassSelect } from '@veerone/galileo-glass-ui';

// Required type for options:
import { SelectOption } from '@veerone/galileo-glass-ui';
```

## Usage

```typescript jsx
import React, { useState } from 'react';
import { Select, SelectOption } from '@veerone/galileo-glass-ui';

const MyComponent = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const options: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3 (Disabled)', disabled: true },
  ];

  return (
    <Select
      label="Choose an option"
      placeholder="Select..."
      options={options}
      value={selectedValue}
      onChange={setSelectedValue}
      helperText="Select one from the list"
    />
  );
};
```

## Props

The `Select` component accepts the following props:

| Prop             | Type                                    | Default       | Description                                                          |
| ---------------- | --------------------------------------- | ------------- | -------------------------------------------------------------------- |
| `value`          | `string`                                | `undefined`   | The currently selected value (controlled).                             |
| `defaultValue`   | `string`                                | `undefined`   | The default selected value if `value` is not provided (uncontrolled). |
| `options`        | `SelectOption[]`                        | `[]`          | An array of option objects (`{ value: string; label: string; disabled?: boolean }`). |
| `onChange`       | `(value: string) => void`               | `undefined`   | Callback function invoked when the selected value changes.           |
| `label`          | `string`                                | `undefined`   | Text label displayed above the select field.                         |
| `placeholder`    | `string`                                | "Select..." | Placeholder text displayed when no value is selected.                |
| `disabled`       | `boolean`                               | `false`       | If `true`, the select field is disabled.                             |
| `error`          | `boolean`                               | `false`       | If `true`, the select displays an error state.                       |
| `helperText`     | `string`                                | `undefined`   | Helper text displayed below the select field.                        |
| `size`           | `'small' \| 'medium' \| 'large'`         | `'medium'`    | The size of the select field.                                        |
| `fullWidth`      | `boolean`                               | `false`       | If `true`, the select field expands to the full width of its container. |
| `className`      | `string`                                | `undefined`   | Additional CSS class name to apply to the container element.       |
| `variant`        | `'outlined' \| 'standard' \| 'filled'` | `'outlined'`  | The visual style variant of the select field.                        |
| `animationConfig`| `SpringConfig \| SpringPresetName`       | `undefined`   | Custom animation config for focus effects. Inherits from context.    |
| `disableAnimation`| `boolean`                               | `undefined`   | If `true`, disables animations. Inherits from context/reduced motion. |

`GlassSelect` is an alias for `Select` and accepts the same props.

## `SelectOption` Type

```typescript
export interface SelectOption {
  value: string;        // Unique value for the option
  label: string;        // Display text for the option
  disabled?: boolean;   // Optional: If true, the option is disabled
}
``` 