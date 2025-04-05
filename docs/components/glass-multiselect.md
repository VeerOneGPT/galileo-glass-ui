# GlassMultiSelect

The `GlassMultiSelect` component provides a sophisticated selection interface for multiple options with physics-based animations and glass styling. It supports token-based selection, filtering, grouping, keyboard navigation, and more.

## Import

```tsx
import { GlassMultiSelect } from '@veerone/galileo-glass-ui';
import type { MultiSelectOption } from '@veerone/galileo-glass-ui'; // Import types
```

## Usage

```tsx
import React, { useState } from 'react';
import { GlassMultiSelect } from '@veerone/galileo-glass-ui';
import type { MultiSelectOption } from '@veerone/galileo-glass-ui';

// Define options with required id, label, and value properties
const options: MultiSelectOption<string>[] = [
  { id: 'react', value: 'react', label: 'React', group: 'frontend' },
  { id: 'vue', value: 'vue', label: 'Vue', group: 'frontend' },
  { id: 'angular', value: 'angular', label: 'Angular', group: 'frontend' },
  { id: 'node', value: 'node', label: 'Node.js', group: 'backend' },
  { id: 'express', value: 'express', label: 'Express', group: 'backend' }
];

function MyMultiSelect() {
  // State must use the MultiSelectOption<T> type, not just string[]
  const [selected, setSelected] = useState<MultiSelectOption<string>[]>([]);
  
  return (
    <GlassMultiSelect<string>
      options={options}
      value={selected}
      onChange={setSelected}
      label="Select Frameworks"
      placeholder="Choose frameworks..."
      physics={{ 
        animationPreset: "bouncy" 
      }}
      glassVariant="frosted"
    />
  );
}
```

## MultiSelectOption Interface

Each option must have the following structure:

```tsx
interface MultiSelectOption<T = string> {
  /** Unique identifier for the option */
  id: string | number;
  
  /** Display label for the option */
  label: string;
  
  /** Value associated with this option */
  value: T;
  
  /** Whether this option is disabled */
  disabled?: boolean;
  
  /** Optional description to display with the option */
  description?: string;
  
  /** Optional group this option belongs to */
  group?: string;
  
  /** Optional icon to display with the option */
  icon?: React.ReactNode;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `MultiSelectOption<T>[]` | `[]` | **Required.** Array of selectable options. |
| `value` | `MultiSelectOption<T>[]` | `undefined` | Currently selected options. |
| `onChange` | `(selected: MultiSelectOption<T>[]) => void` | `undefined` | Callback when selection changes. |
| `placeholder` | `string` | `'Select...'` | Placeholder text for the input. |
| `label` | `string` | `undefined` | Label text above the component. |
| `width` | `string \| number` | `'300px'` | Width of the component. |
| `fullWidth` | `boolean` | `false` | Whether to take full width of container. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant of the component. |
| `disabled` | `boolean` | `false` | Whether the component is disabled. |
| `error` | `boolean` | `false` | Whether to display an error state. |
| `errorMessage` | `string` | `undefined` | Error message to display. |
| `helperText` | `string` | `undefined` | Helper text below the component. |
| `searchable` | `boolean` | `true` | Allow filtering options by typing. |
| `clearable` | `boolean` | `true` | Show button to clear all selections. |
| `creatable` | `boolean` | `false` | Allow creating new options from input. |
| `onCreateOption` | `(inputValue: string) => MultiSelectOption<T>` | `undefined` | Function to create a new option. |
| `filterFunction` | `FilterFunction<T>` | internal | Custom filter function. |
| `maxSelections` | `number` | `undefined` | Maximum number of selectable options. |
| `closeOnSelect` | `boolean` | `true` | Close dropdown after selecting. |
| `clearInputOnSelect` | `boolean` | `true` | Clear input after selecting. |
| `keyboardNavigation` | `boolean` | `true` | Enable keyboard navigation. |
| `withGroups` | `boolean` | `false` | Enable option grouping. |
| `groups` | `OptionGroup[]` | `[]` | Group definitions for grouped options. |
| `maxHeight` | `string \| number` | `'300px'` | Maximum height of dropdown. |
| `openUp` | `boolean` | `false` | Open dropdown upward. |
| `animate` | `boolean` | `true` | Enable animations. |
| `physics` | `{ animationPreset?: string, tension?: number, friction?: number }` | `{}` | Configure token animations. |
| `async` | `{ loading?: boolean, loadingIndicator?: React.ReactNode, onLoadMore?: () => void, hasMore?: boolean }` | `{}` | Async loading configuration. |
| `renderToken` | `(option: MultiSelectOption<T>, onRemove: (e: React.MouseEvent) => void) => React.ReactNode` | internal | Custom token renderer. |
| `renderOption` | `(option: MultiSelectOption<T>, state: { isSelected: boolean, isFocused: boolean }) => React.ReactNode` | internal | Custom option renderer. |
| `renderGroup` | `(group: OptionGroup) => React.ReactNode` | internal | Custom group header renderer. |
| `onOpen` | `() => void` | `undefined` | Callback when dropdown opens. |
| `onClose` | `() => void` | `undefined` | Callback when dropdown closes. |
| `onInputChange` | `(value: string) => void` | `undefined` | Callback when input value changes. |
| `onSelect` | `(option: MultiSelectOption<T>) => void` | `undefined` | Callback when option is selected. |
| `onRemove` | `(option: MultiSelectOption<T>) => void` | `undefined` | Callback when option is removed. |
| `className` | `string` | `undefined` | Additional CSS class. |
| `id` | `string` | `undefined` | DOM ID for input element. |
| `ariaLabel` | `string` | `undefined` | ARIA label for accessibility. |
| `autoFocus` | `boolean` | `false` | Auto-focus input on mount. |
| `itemRemoveAnimation` | `ItemRemoveAnimationConfig` | `'DEFAULT'` | Configuration for the exit animation of selected tokens upon removal. See details below. |

## Physics-Based Animation

The `GlassMultiSelect` component features physics-based animations for token appearance, movement, and interactions. These animations create a natural, responsive feel that enhances the user experience.

The animations can be configured using the `physics` prop:

```tsx
<GlassMultiSelect
  // ...other props
  physics={{
    // Use a preset
    animationPreset: "bouncy", // "default", "gentle", "bouncy", "slow"
    
    // Or configure spring physics parameters directly
    tension: 170,      // Spring tension (stiffness)
    friction: 26,      // Spring friction (damping)
  }}
/>
```

Key animation features:

1. **Token Appearance**: When tokens are added, they animate into place with spring physics
2. **Token Removal**: When tokens are removed, they animate out with physics-based transitions
3. **Dropdown Animation**: The dropdown menu uses physics-based animation for open/close transitions

## Examples

### Basic MultiSelect

```tsx
<GlassMultiSelect
  options={options}
  label="Basic Example"
/>
```

### With Grouping

```tsx
const groupedOptions = [
  { id: 'react', value: 'react', label: 'React', group: 'frontend' },
  { id: 'vue', value: 'vue', label: 'Vue', group: 'frontend' },
  { id: 'angular', value: 'angular', label: 'Angular', group: 'frontend' },
  { id: 'node', value: 'node', label: 'Node.js', group: 'backend' },
  { id: 'express', value: 'express', label: 'Express', group: 'backend' },
  { id: 'django', value: 'django', label: 'Django', group: 'backend' }
];

const groups = [
  { id: 'frontend', label: 'Frontend Technologies' },
  { id: 'backend', label: 'Backend Technologies' }
];

<GlassMultiSelect
  options={groupedOptions}
  withGroups={true}
  groups={groups}
  label="Grouped Options"
/>
```

### Creatable MultiSelect

```tsx
const [options, setOptions] = useState<MultiSelectOption<string>[]>([
  { id: 'react', value: 'react', label: 'React' },
  { id: 'vue', value: 'vue', label: 'Vue' }
]);

const handleCreateOption = (inputValue: string): MultiSelectOption<string> => {
  const newOption = { 
    id: `custom-${inputValue}`, 
    value: inputValue.toLowerCase(), 
    label: inputValue 
  };
  setOptions([...options, newOption]);
  return newOption;
};

<GlassMultiSelect
  options={options}
  creatable={true}
  onCreateOption={handleCreateOption}
  label="Creatable Example"
  placeholder="Type to search or create..."
/>
```

### Async Loading

```tsx
const [options, setOptions] = useState<MultiSelectOption<string>[]>([]);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [page, setPage] = useState(1);

const loadMoreOptions = async () => {
  if (loading || !hasMore) return;
  
  setLoading(true);
  try {
    // Simulated API call
    const newOptions = await fetchMoreOptions(page);
    setOptions([...options, ...newOptions]);
    setPage(page + 1);
    setHasMore(newOptions.length > 0);
  } catch (error) {
    console.error("Error loading options:", error);
  } finally {
    setLoading(false);
  }
};

<GlassMultiSelect
  options={options}
  async={{
    loading,
    hasMore,
    onLoadMore: loadMoreOptions,
    loadingIndicator: <div>Loading more options...</div>
  }}
  label="Async Loading"
  placeholder="Scroll to load more..."
/>
```

### Custom Rendering

```tsx
<GlassMultiSelect
  options={options}
  renderOption={(option, { isSelected, isFocused }) => (
    <div style={{ 
      padding: '8px 12px',
      backgroundColor: isFocused ? 'rgba(0,0,0,0.05)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {option.icon && <span className="option-icon">{option.icon}</span>}
      <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
        {option.label}
      </span>
      {option.description && (
        <span style={{ fontSize: '0.8em', color: '#666' }}>
          {option.description}
        </span>
      )}
    </div>
  )}
  renderToken={(option, onRemove) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgba(0,100,255,0.1)',
      borderRadius: '16px',
      padding: '4px 8px',
      margin: '2px',
      gap: '4px'
    }}>
      {option.icon && <span>{option.icon}</span>}
      <span>{option.label}</span>
      <button
        onClick={onRemove}
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  )}
  label="Custom Rendering"
/>
```

## Accessibility

The `GlassMultiSelect` component implements several accessibility features:

- Keyboard navigation using arrow keys, Enter, Escape, and Tab
- ARIA attributes for screen readers
- Focus management
- Reduced motion support

## Best Practices

1. **Option Structure**: Always provide `id`, `label`, and `value` properties for each option.

2. **State Management**: Use the `MultiSelectOption<T>[]` type for your state (not just `string[]`).

3. **Filtering**: For large options lists, utilize the `searchable` prop to enable filtering.

4. **Loading States**: For data fetched from APIs, use the `async` prop to manage loading states.

5. **Grouping**: When options can be categorized logically, use the `withGroups` and `groups` props for better organization.

6. **Selection Limits**: Consider using `maxSelections` to prevent too many selections.

7. **Animation**: For most scenarios, the default physics animations provide a good experience, but you can customize them using the `physics` prop.

## Related Components

- `GlassSelect`: For single-option selection
- `GlassAutocomplete`: For enhanced text input with suggestions
- `GlassChip`: For displaying selections in a compact form

### Animation Configuration

- **General Animations:** Use the `physics` prop (e.g., `physics={{ animationPreset: 'gentle' }}`) to configure the overall feel, like the entrance animation of tokens.
- **Item Removal Animation:** Use the `itemRemoveAnimation` prop to specifically configure how selected tokens animate out when removed. See configuration options below.
- **Disabling Animations:** Set `animate={false}` or rely on the user's `prefers-reduced-motion` setting.

### `itemRemoveAnimation` Prop Configuration

The `itemRemoveAnimation` prop accepts several types of values to configure the exit animation:

1.  **`false` or `null`:** Disables the removal animation entirely.
2.  **Preset Name (string):** A string matching one of the `SpringPresets` keys (e.g., `'DEFAULT'`, `'GENTLE'`, `'SNAPPY'`).
3.  **Structured Spring Object:** An object specifying the animation type and its configuration:
    *   `{ type: 'spring', preset: SpringPresetName }` (e.g., `{ type: 'spring', preset: 'WOBBLY' }`)
    *   `{ type: 'spring', config: Partial<SpringConfig> }` (e.g., `{ type: 'spring', config: { tension: 100, friction: 18 } }`)

**Type Definition (`ItemRemoveAnimationConfig`):**

```typescript
// Assumed type based on implementation (Confirm if exported)
type SpringPresetName = keyof typeof SpringPresets; // e.g., 'DEFAULT', 'GENTLE', ...
interface SpringConfig { tension: number; friction: number; mass?: number; ... }

type ItemRemoveAnimationConfig =
  | false
  | null
  | SpringPresetName
  | { type: 'spring'; preset: SpringPresetName }
  | { type: 'spring'; config: Partial<SpringConfig> };
```

**Note (v1.0.18):** The type definition in v1.0.18 was incorrect (`Partial<SpringConfig> | keyof typeof SpringPresets`). If using v1.0.18, you might need to use `as any` to bypass type errors when providing a structured object.
