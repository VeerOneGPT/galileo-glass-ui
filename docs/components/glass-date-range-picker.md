# GlassDateRangePicker

The `GlassDateRangePicker` component provides a sophisticated date range selection interface with glass styling and physics-based animations. It supports comparison mode, presets, time selection, and custom rendering.

## Dependencies

The component requires a date utility library and must be wrapped in a `GlassLocalizationProvider`:

```bash
# Install date-fns (recommended)
npm install date-fns
```

## Import

```tsx
import { GlassDateRangePicker, GlassLocalizationProvider } from '@veerone/galileo-glass-ui';
import { createDateFnsAdapter } from '@veerone/galileo-glass-ui';
```

## Basic Setup

The `GlassDateRangePicker` component requires a `GlassLocalizationProvider` with a date adapter configured:

```tsx
import React from 'react';
import { 
  GlassDateRangePicker, 
  GlassLocalizationProvider, 
  createDateFnsAdapter
} from '@veerone/galileo-glass-ui';

function App() {
  return (
    <GlassLocalizationProvider adapter={createDateFnsAdapter()}>
      {/* Your app content with GlassDateRangePicker components */}
    </GlassLocalizationProvider>
  );
}
```

## Usage

```tsx
import React, { useState } from 'react';
import { 
  GlassDateRangePicker, 
  GlassLocalizationProvider, 
  createDateFnsAdapter 
} from '@veerone/galileo-glass-ui';
import type { DateRange } from '@veerone/galileo-glass-ui';

function DateRangePickerExample() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null
  });

  const handleChange = (newRange: DateRange) => {
    setDateRange(newRange);
    console.log('New range:', newRange);
  };

  return (
    <GlassLocalizationProvider adapter={createDateFnsAdapter()}>
      <GlassDateRangePicker
        value={dateRange}
        onChange={handleChange}
        label="Select Date Range"
        glassVariant="frosted"
        physics={{
          tension: 170,
          friction: 26,
          animationPreset: 'default'
        }}
      />
    </GlassLocalizationProvider>
  );
}
```

## DateRange Interface

```tsx
interface DateRange {
  /** Start date of the range */
  startDate: Date | null;
  
  /** End date of the range */
  endDate: Date | null;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `DateRange` | `{ startDate: null, endDate: null }` | Currently selected date range. |
| `onChange` | `(range: DateRange) => void` | `undefined` | Callback when date range changes. |
| `onClear` | `() => void` | `undefined` | Callback when date range is cleared. |
| `comparisonMode` | `boolean` | `false` | Whether to display in comparison mode. |
| `comparisonValue` | `DateRange` | `undefined` | Comparison date range value. |
| `onComparisonChange` | `(comparisonRange: DateRange) => void` | `undefined` | Callback when comparison range changes. |
| `minDate` | `Date` | `undefined` | Minimum selectable date. |
| `maxDate` | `Date` | `undefined` | Maximum selectable date. |
| `enableTimeSelection` | `boolean` | `false` | Whether time selection is enabled. |
| `dateFormat` | `string` | `'MM/dd/yyyy'` | Format string for displaying the date. |
| `timeFormat` | `string` | `'HH:mm'` | Format string for displaying time. |
| `presets` | `DateRangePreset[]` | `StandardDateRangePresets` | Presets for quick date range selection. |
| `locale` | `string` | `'en-US'` | Locale for date formatting. |
| `firstDayOfWeek` | `number` | `0` | First day of week (0 = Sunday, 1 = Monday). |
| `disabled` | `boolean` | `false` | Whether the picker is disabled. |
| `label` | `string` | `undefined` | Label text. |
| `helperText` | `string` | `undefined` | Helper text. |
| `error` | `boolean` | `false` | Whether the component has an error. |
| `errorMessage` | `string` | `undefined` | Error message. |
| `placeholder` | `string` | `'Select date range'` | Placeholder text when no date is selected. |
| `required` | `boolean` | `false` | Whether the component is required. |
| `clearable` | `boolean` | `true` | Whether to show clear button. |
| `autoClose` | `boolean` | `false` | Whether to automatically close the picker when a range is selected. |
| `showWeekNumbers` | `boolean` | `false` | Whether to show week numbers in calendar. |
| `initialView` | `'day' \| 'month' \| 'year'` | `'day'` | Initial calendar view. |
| `monthView` | `boolean` | `false` | Whether to display the month view. |
| `fullWidth` | `boolean` | `false` | Whether the component takes full width. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the component. |
| `glassVariant` | `'clear' \| 'frosted' \| 'tinted'` | `'frosted'` | Glass styling variant. |
| `blurStrength` | `'light' \| 'standard' \| 'strong'` | `'standard'` | Blur strength for glass effect. |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'default'` | `'primary'` | Color theme. |
| `inline` | `boolean` | `false` | Whether to display the picker inline (always open). |
| `id` | `string` | `undefined` | ID attribute for the input element. |
| `ariaLabel` | `string` | `undefined` | ARIA label for accessibility. |
| `animate` | `boolean` | `true` | Whether to enable animations. |
| `renderInput` | `(props: RenderInputProps) => React.ReactNode` | `undefined` | Custom input renderer. |
| `renderDay` | `(date: Date, dayProps: DayProps) => React.ReactNode` | `undefined` | Custom day cell renderer. |
| `physics` | `{ tension?: number; friction?: number; animationPreset?: string }` | `{ tension: 170, friction: 26, animationPreset: 'default' }` | Physics configuration for animations. |
| `mobile` | `{ fullScreen?: boolean; mobileView?: 'auto' \| 'always' \| 'never'; enableGestures?: boolean }` | `{ fullScreen: false, mobileView: 'auto', enableGestures: true }` | Mobile-specific settings. |

## Physics-Based Animation

The `GlassDateRangePicker` incorporates physics-based animations for natural, fluid interactions:

1. **Popover Animation**: The date picker popover uses physics-based spring animations for opening and closing.

2. **Calendar Transitions**: When navigating between months or changing views, physics springs create smooth transitions.

3. **Selection Animations**: Date selections and hover states use subtle physics animations.

The animations can be configured through the `physics` prop:

```tsx
<GlassDateRangePicker
  physics={{
    // Spring tension (higher = more stiff)
    tension: 170,
    
    // Spring friction (higher = less bouncy)
    friction: 26,
    
    // Or use a preset
    animationPreset: 'default' // 'default', 'gentle', 'bouncy', 'slow'
  }}
  // ...other props
/>
```

## Examples

### With Comparison Mode

```tsx
<GlassDateRangePicker
  value={primaryRange}
  onChange={handlePrimaryChange}
  comparisonMode={true}
  comparisonValue={comparisonRange}
  onComparisonChange={handleComparisonChange}
  label="Compare Periods"
/>
```

### With Custom Date Format

```tsx
<GlassDateRangePicker
  value={dateRange}
  onChange={handleChange}
  dateFormat="yyyy-MM-dd"
  timeFormat="HH:mm:ss"
  enableTimeSelection
  label="Select Date and Time Range"
/>
```

### With Custom Presets

```tsx
const customPresets = [
  {
    id: 'last7days',
    label: 'Last 7 Days',
    getValue: () => ({
      startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    })
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    getValue: () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: startOfMonth,
        endDate: today
      };
    }
  }
];

<GlassDateRangePicker
  value={dateRange}
  onChange={handleChange}
  presets={customPresets}
  label="With Custom Presets"
/>
```

### Inline Mode

```tsx
<GlassDateRangePicker
  value={dateRange}
  onChange={handleChange}
  inline={true}
  glassVariant="frosted"
  blurStrength="standard"
/>
```

## Accessibility

The `GlassDateRangePicker` component prioritizes accessibility:

- Keyboard navigation for date selection
- Proper ARIA attributes and roles
- Support for screen readers
- Respect for user motion preferences

## Best Practices

1. **Localization Setup**: Always wrap your application (or the part using date components) with `GlassLocalizationProvider` and configure the appropriate adapter.

2. **Date Library**: Use `date-fns` as the date utility library for best compatibility.

3. **Error Handling**: Provide clear error states and messages when dates are invalid.

4. **Responsive Design**: Consider setting `fullWidth={true}` and configuring mobile settings for better mobile experience.

5. **Date Formatting**: Use localized date formats that match your users' expectations.

6. **Presets**: Provide commonly used presets for better user experience.

7. **Animation Sensitivity**: Respect user preferences by considering the `animate` prop in conjunction with the system's reduced motion setting.

## GlassLocalizationProvider

The component requires `GlassLocalizationProvider` with a date adapter:

```tsx
import { GlassLocalizationProvider, createDateFnsAdapter } from '@veerone/galileo-glass-ui';

// At the root of your app or component tree
<GlassLocalizationProvider adapter={createDateFnsAdapter()}>
  {/* Your components using GlassDateRangePicker */}
</GlassLocalizationProvider>
```

### Date Adapter

The `GlassLocalizationProvider` uses a date adapter to handle date operations. The recommended adapter is `createDateFnsAdapter()` which requires the `date-fns` library.

## Related Components

- `GlassDatePicker`: For single date selection
- `GlassTimePicker`: For time selection
- `GlassCalendar`: For embedded calendar display
- `GlassTimeline`: For displaying chronological data
