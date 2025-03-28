# Glass UI Components

The Glass UI design system provides a collection of components with glass morphism styling for creating modern, elegant UIs.

## New in 1.0.3: Advanced Physics-Based Components

Version 1.0.3 introduces several new physics-based components that enhance the user experience with natural motion and interactions:

### GlassTimeline Component

The GlassTimeline component provides a sophisticated way to display chronological data with physics-based animations.

```tsx
import { GlassTimeline } from 'galileo-glass-ui';

// Sample timeline data
const timelineItems = [
  {
    id: '1',
    date: '2023-01-15',
    title: 'Project Launch',
    content: 'Initial project kickoff meeting',
    category: 'milestone',
    icon: '🚀'
  },
  {
    id: '2',
    date: '2023-02-10',
    title: 'Phase 1 Complete',
    content: 'Successfully completed first development phase',
    category: 'milestone',
    icon: '✅'
  }
];

// Basic implementation
function MyTimeline() {
  return (
    <GlassTimeline
      items={timelineItems}
      orientation="vertical"
      markerPosition="alternate"
      zoomLevel="months"
      animation="spring"
      glassVariant="frosted"
    />
  );
}
```

### GlassMasonry Component

The GlassMasonry component provides a physics-based masonry layout for arranging content in a visually appealing grid.

```tsx
import { GlassMasonry } from 'galileo-glass-ui';

// Sample masonry items
const masonryItems = [
  {
    id: 'item-1',
    height: 200,
    width: 300,
    data: {
      title: 'Item 1',
      description: 'This is item 1',
      src: 'https://example.com/image1.jpg'
    }
  },
  // More items...
];

// Basic implementation
function MyMasonry() {
  return (
    <GlassMasonry
      items={masonryItems}
      columns={{
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4
      }}
      placementAlgorithm="balanced"
      itemAnimation="spring"
      physics={{
        preset: "default",
        staggerDelay: 50
      }}
      glassVariant="frosted"
    >
      {(item) => (
        <div>
          <img src={item.data.src} alt={item.data.title} />
          <h3>{item.data.title}</h3>
          <p>{item.data.description}</p>
        </div>
      )}
    </GlassMasonry>
  );
}
```

### GlassMultiSelect Component

The GlassMultiSelect component provides a token-based multi-select with physics animations.

```tsx
import { GlassMultiSelect } from 'galileo-glass-ui';

// Sample options
const options = [
  { value: 'react', label: 'React', category: 'frontend' },
  { value: 'vue', label: 'Vue', category: 'frontend' },
  { value: 'angular', label: 'Angular', category: 'frontend' },
  { value: 'node', label: 'Node.js', category: 'backend' },
  { value: 'express', label: 'Express', category: 'backend' }
];

// Basic implementation
function MyMultiSelect() {
  const [selected, setSelected] = useState([]);
  
  return (
    <GlassMultiSelect
      options={options}
      value={selected}
      onChange={setSelected}
      label="Select Frameworks"
      placeholder="Choose frameworks..."
      animation="spring"
      physics={{ preset: "bouncy" }}
      glassVariant="frosted"
    />
  );
}
```

### GlassDateRangePicker Component

The GlassDateRangePicker component provides a date range picker with comparison mode and presets.

```tsx
import { GlassDateRangePicker } from 'galileo-glass-ui';

// Basic implementation
function MyDateRangePicker() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  
  return (
    <GlassDateRangePicker
      value={dateRange}
      onChange={setDateRange}
      label="Select Date Range"
      presets={true}
      comparisonMode={true}
      animation="spring"
      physics={{ preset: "gentle" }}
      glassVariant="frosted"
    />
  );
}
```

## Using GlassSurfacePropTypes

All Glass components share common styling props defined in `GlassSurfaceProps`. To ensure consistency and proper validation, we export `GlassSurfacePropTypes` from the ThemeProvider.

### Importing GlassSurfacePropTypes

```tsx
// Import directly from ThemeProvider
import { GlassSurfacePropTypes } from '../../theme/ThemeProvider';

// Or import from the Glass components package
import { GlassSurfacePropTypes } from '../Glass';
```

### Using GlassSurfacePropTypes in Custom Components

When creating custom components that need glass styling, use the `GlassSurfacePropTypes` for PropType validation:

```tsx
import React from 'react';
import PropTypes from 'prop-types';
import { GlassSurfacePropTypes, useGlassEffects } from '../Glass';

const CustomGlassComponent = (props) => {
  // Component implementation
};

// @ts-ignore - Ignoring TypeScript errors with PropTypes validation
CustomGlassComponent.propTypes = {
  // Include all glass surface props
  variant: PropTypes.oneOf(['standard', 'frosted', 'dimensional', 'heat']),
  blurStrength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  backgroundOpacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  borderOpacity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  glowIntensity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  elevation: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.oneOf(['none', 'low', 'medium', 'high'])
  ]),
  interactive: PropTypes.bool,
  darkMode: PropTypes.bool,
  // Component-specific props
  children: PropTypes.node,
  // Other custom props...
};
```

### GlassSurface Props

All Glass components accept these standard glass styling props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | 'standard' \| 'frosted' \| 'dimensional' \| 'heat' | 'standard' | Glass styling variant |
| `blurStrength` | string \| number | 'medium' | Blur intensity ('light', 'medium', 'high', or px value) |
| `backgroundOpacity` | string \| number | 'medium' | Background opacity ('transparent', 'lightest', 'light', 'medium', 'high', 'solid', or 0-1) |
| `borderOpacity` | string \| number | 'medium' | Border opacity ('none', 'minimal', 'subtle', 'medium', 'high', or 0-1) |
| `glowIntensity` | string \| number | 'medium' | Glow effect intensity ('minimal', 'light', 'medium', 'strong', 'extreme', or 0-1) |
| `elevation` | number \| 'none' \| 'low' \| 'medium' \| 'high' | 1 | Shadow elevation level |
| `interactive` | boolean | false | Whether the component has interactive states |
| `darkMode` | boolean | theme default | Force dark/light mode for the component |

## Available Glass Components

### GlassCard

A card component with glass morphism styling. Extends all GlassSurface props.

```tsx
import { GlassCard } from '../Glass';

<GlassCard 
  title="Card Title"
  variant="frosted"
  elevation={2}
  interactive
>
  <p>Card content goes here.</p>
</GlassCard>
```

#### Additional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | undefined | Optional card title |
| `padding` | 'none' \| 'small' \| 'medium' \| 'large' | 'medium' | Padding inside the card |
| `maxWidth` | string | undefined | Maximum width (CSS value) |
| `onClick` | function | undefined | Click handler (also sets interactive=true) |

### GlassDatePicker

A date picker component with glass morphism styling that supports multiple icon libraries. Extends all GlassSurface props.

```tsx
import { GlassDatePicker, GlassLocalizationProvider, createDateFnsAdapter } from '../Glass';
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

<GlassLocalizationProvider adapter={createDateFnsAdapter()}>
  <GlassDatePicker 
    label="Select Date"
    value={selectedDate}
    onChange={setSelectedDate}
    format="MM/dd/yyyy"
    icons={{
      calendar: FiCalendar,
      today: FiClock,
      leftArrow: FiChevronLeft,
      rightArrow: FiChevronRight
    }}
    minDate={new Date('2023-01-01')}
    maxDate={new Date('2025-12-31')}
    disablePast={true}
    elevation={2}
  />
</GlassLocalizationProvider>
```

#### Additional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | undefined | Label text for the date picker |
| `value` | Date \| null | null | Selected date value |
| `onChange` | (date: Date \| null) => void | required | Function called when date changes |
| `placeholder` | string | 'Select date' | Placeholder text when no date is selected |
| `error` | boolean \| string | false | Error state or error message |
| `helperText` | string | undefined | Helper text to display below input |
| `disabled` | boolean | false | Make the date picker disabled |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | Size variant of the date picker |
| `fullWidth` | boolean | false | Make the date picker full width |
| `animate` | boolean | false | Add a subtle animation when mounted |
| `format` | string | 'MM/dd/yyyy' | Date format used for display and input |
| `minDate` | Date | undefined | Optional minimum selectable date |
| `maxDate` | Date | undefined | Optional maximum selectable date |
| `disablePast` | boolean | false | If true, dates before today cannot be selected |
| `disableFuture` | boolean | false | If true, dates after today cannot be selected |
| `disableDates` | Date[] \| ((date: Date) => boolean) | undefined | Custom set of dates to disable |
| `allowInput` | boolean | false | Enable input mode where user can type date |
| `clearable` | boolean | true | If true, shows a clear button |
| `icons` | { calendar?: ElementType; today?: ElementType; leftArrow?: ElementType; rightArrow?: ElementType; clear?: ElementType; } | MUI Icons | Icon component customization |
| `portal` | boolean | false | Makes popup portal to body instead of in component tree |
| `initialView` | 'day' \| 'month' \| 'year' | 'day' | Initial calendar view |

### GlassLocalizationProvider

A provider component for date and time localization in Glass components, using an adapter pattern for flexibility.

```tsx
import { GlassLocalizationProvider, createDateFnsAdapter } from '../Glass';

<GlassLocalizationProvider
  adapter={createDateFnsAdapter()}
  locale="en-US"
  firstDayOfWeek={1} // Monday
  dateFormat="MM/dd/yyyy"
>
  {children}
</GlassLocalizationProvider>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `adapter` | DateAdapter | required | The date adapter to use |
| `locale` | string | 'en-US' | The locale to use for date formatting |
| `firstDayOfWeek` | number | 0 | First day of week (0 = Sunday, 1 = Monday, etc.) |
| `dateFormat` | string | 'MM/dd/yyyy' | Default date format to use |
| `weekdayFormat` | 'narrow' \| 'short' \| 'long' | 'short' | Format for weekday names |
| `monthFormat` | 'narrow' \| 'short' \| 'long' | 'long' | Format for month names |
| `children` | ReactNode | required | The children components |

#### DateAdapter Interface

The `DateAdapter` interface defines methods for date operations:

```tsx
interface DateAdapter {
  locale: string;
  format: (date: Date | null, formatString: string) => string;
  parse: (value: string, formatString: string) => Date | null;
  isValid: (date: any) => boolean;
  addDays: (date: Date, amount: number) => Date;
  isToday: (date: Date) => boolean;
  isSameDay: (dateA: Date, dateB: Date) => boolean;
  isSameMonth: (dateA: Date, dateB: Date) => boolean;
  getDaysInMonth: (year: number, month: number) => number;
  getMonthData: (year: number, month: number, firstDayOfWeek: number) => Date[];
  getWeekdays: (format?: 'narrow' | 'short' | 'long') => string[];
  getMonthNames: (format?: 'narrow' | 'short' | 'long') => string[];
}
```

#### Helper Functions

| Function | Description |
|----------|-------------|
| `createDateFnsAdapter` | Creates a DateAdapter using date-fns |
| `useDateAdapter` | Hook to access the current date adapter in components |

## Best Practices

1. **Consistent Variant Usage**: Use the same variant for related components to maintain visual consistency
2. **Responsive Elevation**: Lower elevation values on mobile to reduce visual noise
3. **Interactive States**: Set `interactive` to true for clickable components
4. **Dark Mode Adaptation**: Let components adapt to theme dark mode by default - only override with `darkMode` prop when needed
5. **Accessibility**: Ensure text on glass surfaces has sufficient contrast for readability

## TypeScript Integration

When working with TypeScript, import the GlassSurfaceProps type:

```tsx
import type { GlassSurfaceProps } from '../../core/types';

interface MyCustomComponentProps extends GlassSurfaceProps {
  // Additional props specific to your component
}
```

### TypeScript and PropTypes Compatibility

When using PropTypes with TypeScript, you may encounter type errors even though your runtime validation is correct. This is because PropTypes is designed for runtime validation, while TypeScript handles compile-time type checking.

To handle these compatibility issues, use one of these approaches:

1. **Disable TypeScript checking for the entire file:**

```tsx
// @ts-nocheck - TypeScript has difficulty with PropTypes validation
import React from 'react';
import PropTypes from 'prop-types';
// Rest of your component...
```

2. **Disable TypeScript checking for just the PropTypes definition:**

```tsx
// Component implementation...

// @ts-expect-error TypeScript has difficulty with PropTypes validation
ComponentName.propTypes = {
  // PropTypes definition...
};
```

3. **Use ESLint disable comments for prop-types rules:**

```tsx
/* eslint-disable react/prop-types */
ComponentName.propTypes = {
  // PropTypes definition...
};
/* eslint-enable react/prop-types */
```

Using these approaches ensures your components maintain runtime validation via PropTypes while avoiding TypeScript compilation errors. 