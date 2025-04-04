# GlassTimeline

The `GlassTimeline` component provides a sophisticated way to display chronological data with physics-based animations, customizable views, zooming, and interactions. It features glass styling and smooth animations that respect user motion preferences.

## Import

```tsx
import { GlassTimeline } from '@veerone/galileo-glass-ui';
import type { TimelineItem, TimelineRef } from '@veerone/galileo-glass-ui'; // Import types
```

## Usage

```tsx
import React, { useRef } from 'react';
import { GlassTimeline } from '@veerone/galileo-glass-ui';
import type { TimelineItem, TimelineRef } from '@veerone/galileo-glass-ui';

// Sample timeline data
const timelineItems: TimelineItem[] = [
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
  },
  {
    id: '3',
    date: '2023-02-25T10:30:00',
    title: 'Design Review',
    content: 'Reviewed UI mockups.'
  }
];

function MyTimeline() {
  // Create a ref to access timeline methods
  const timelineRef = useRef<TimelineRef>(null);

  // Go to a specific date programmatically
  const jumpToDate = () => {
    timelineRef.current?.scrollToDate(new Date('2023-01-15'), true);
  };

  return (
    <>
      <GlassTimeline
        ref={timelineRef}
        items={timelineItems}
        orientation="vertical"
        markerPosition="alternate"
        viewMode="month"
        zoomLevel="weeks"
        groupByDate={true}
        markers={{ show: true, showNow: true }}
        physics={{ preset: "gentle", staggerDelay: 50 }}
        glassVariant="frosted"
        height="500px"
        onItemClick={(item) => console.log('Clicked:', item.id)}
        onZoomChange={(level) => console.log('Zoom level:', level)}
        animateOnMount={true}
      />
      <button onClick={jumpToDate}>Jump to Project Launch</button>
    </>
  );
}
```

## TimelineItem Interface

Each timeline item requires the following structure:

```tsx
interface TimelineItem {
  /** Unique identifier for the item */
  id: string | number;
  
  /** Date and time of the event (ISO string, Date object, or timestamp) */
  date: string | Date | number;
  
  /** Event title */
  title: string;
  
  /** Event description or content */
  content?: string | React.ReactNode;
  
  /** Optional category for filtering/grouping */
  category?: string;
  
  /** Optional icon (emoji, string, or ReactNode) */
  icon?: string | React.ReactNode;
  
  /** Optional flag for highlighted items */
  highlighted?: boolean;
  
  /** Optional additional data */
  [key: string]: any;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineItem[]` | `[]` | Array of event objects to display. |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Timeline layout orientation. |
| `markerPosition` | `'alternate' \| 'left' \| 'right' \| 'center'` | `'alternate'` | How event markers are positioned relative to the axis. |
| `viewMode` | `'day' \| 'week' \| 'month' \| 'year' \| 'decade'` | `'month'` | Primary time scale view. |
| `groupByDate` | `boolean` | `true` | If true, groups items occurring on the same date. |
| `groupThreshold` | `number` | `3` | Minimum number of items on a date to trigger grouping. |
| `groups` | `TimelineGroup[]` | `[]` | Optional categories for grouping. |
| `showAxis` | `boolean` | `true` | Whether to display the time axis. |
| `markers` | `TimeScaleMarkersConfig` | `{ show: true, showNow: true }` | Configuration for time scale markers. |
| `animation` | `'spring' \| 'fade' \| 'slide' \| 'scale' \| 'none'` | `'spring'` | Animation type for item appearance. |
| `physics` | `TimelinePhysicsConfig` | `{ preset: 'default', staggerDelay: 50 }` | Physics configuration for animations. |
| `navigation` | `'scroll' \| 'button' \| 'pagination' \| 'none'` | `'scroll'` | How users navigate the timeline. |
| `zoomLevel` | `'hours' \| 'days' \| 'weeks' \| 'months' \| 'years' \| 'decades'` | `'days'` | Controls density and detail level. |
| `zoomLevels` | `ZoomLevel[]` | `['days', 'weeks', 'months', 'years']` | Available zoom levels. |
| `allowWheelZoom` | `boolean` | `true` | Whether to allow zooming with Ctrl + Mouse wheel. |
| `initialDate` | `Date \| string` | `new Date()` | Initial date to focus on. |
| `activeId` | `string \| number` | `undefined` | ID of the item to be initially active. |
| `density` | `'compact' \| 'normal' \| 'spacious'` | `'normal'` | Controls visual spacing. |
| `enableGestures` | `boolean` | `true` | Enables touch gestures for scrolling. |
| `filter` | `TimelineFilter` | `undefined` | For filtering events by category or date. |
| `allowFiltering` | `boolean` | `true` | Whether to enable filtering. |
| `width` | `string \| number` | `undefined` | Width of the timeline container. |
| `height` | `string \| number` | `undefined` | Height of the timeline container. |
| `className` | `string` | `undefined` | Additional CSS classes. |
| `markerClassName` | `string` | `undefined` | CSS classes for markers. |
| `contentClassName` | `string` | `undefined` | CSS classes for content containers. |
| `glassVariant` | `'clear' \| 'frosted' \| 'tinted'` | `'frosted'` | Glass styling variant. |
| `blurStrength` | `'light' \| 'standard' \| 'strong'` | `'standard'` | Blur strength for glass effects. |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' \| 'default'` | `'primary'` | Color theme. |
| `glassMarkers` | `boolean` | `true` | Apply glass styling to markers. |
| `glassContent` | `boolean` | `true` | Apply glass styling to content cards. |
| `animateOnMount` | `boolean` | `true` | Play animations on initial mount. |
| `animateOnChange` | `boolean` | `true` | Play animations when items change. |
| `id` | `string` | `undefined` | DOM ID for the container. |
| `ariaLabel` | `string` | `undefined` | ARIA label for accessibility. |
| `onItemClick` | `(item: TimelineItem) => void` | `undefined` | Callback for item clicks. |
| `onItemSelect` | `(item: TimelineItem) => void` | `undefined` | Callback when an item is selected. |
| `onNavigate` | `(date: Date, mode: TimelineViewMode) => void` | `undefined` | Callback when navigation occurs. |
| `onZoomChange` | `(level: ZoomLevel) => void` | `undefined` | Callback when zoom level changes. |
| `onFilterChange` | `(filter: TimelineFilter) => void` | `undefined` | Callback when filtering changes. |
| `onLoadMorePast` | `() => void` | `undefined` | Callback to load older events. |
| `onLoadMoreFuture` | `() => void` | `undefined` | Callback to load newer events. |
| `renderMarker` | `(item: TimelineItem) => React.ReactNode` | `undefined` | Custom marker renderer. |
| `renderContent` | `(item: TimelineItem) => React.ReactNode` | `undefined` | Custom content renderer. |
| `renderAxis` | `(mode: TimelineViewMode, level: ZoomLevel) => React.ReactNode` | `undefined` | Custom axis renderer. |
| `disableAnimation` | `boolean` | `false` | Disable all animations. |

## Physics-Based Animation

The `GlassTimeline` component leverages the Galileo physics engine to create smooth, natural-feeling animations for multiple elements:

1. **Item Entry Animations**: When items are first rendered or when new items are added, they animate into view with physics-based springs, respecting the configured `physics` options.

2. **Scroll Physics**: The timeline implements inertial scrolling with physics, creating a natural, momentum-based scrolling experience.

3. **Zoom Transitions**: When changing zoom levels, items animate to their new positions with physics-based springs.

4. **Staggered Animations**: Items animate in sequence using the `staggerDelay` parameter, creating a pleasing cascade effect.

### Animation Configuration

The physics animations can be configured using the `physics` prop:

```tsx
<GlassTimeline
  physics={{
    // Use a preset (default, gentle, bouncy, slow)
    preset: "gentle",
    
    // Or configure individual physics parameters
    tension: 170,      // Spring tension (stiffness)
    friction: 26,      // Spring friction (damping)
    mass: 1,           // Mass of the animated object
    
    // Stagger timing between animations
    staggerDelay: 50,  // Milliseconds between each item's animation
    
    // Scroll physics
    scrollDamping: 0.85,  // Higher values = less "slidey" scrolling
  }}
  // ...other props
/>
```

## TimelineRef Methods

You can access component methods using a ref:

```tsx
// Create ref
const timelineRef = useRef<TimelineRef>(null);

// Methods available:
timelineRef.current?.scrollToDate(new Date('2023-06-15'), true);  // Scroll to date (with smooth animation)
timelineRef.current?.scrollToItem('item-id-3', true);             // Scroll to specific item
timelineRef.current?.getContainerElement();                       // Get the DOM element
timelineRef.current?.getCurrentDate();                            // Get the current center date
timelineRef.current?.selectItem('item-id-1');                     // Programmatically select an item
```

## Examples

### Horizontal Timeline

```tsx
<GlassTimeline
  items={timelineItems}
  orientation="horizontal"
  markerPosition="alternate"
  viewMode="year"
  zoomLevel="months"
  height="250px"
  width="100%"
/>
```

### Custom Markers and Content

```tsx
<GlassTimeline
  items={timelineItems}
  renderMarker={(item) => (
    <div className="custom-marker">
      <img src={item.icon} alt={item.title} width="24" height="24" />
    </div>
  )}
  renderContent={(item) => (
    <div className="custom-content">
      <h3>{item.title}</h3>
      <p>{item.content}</p>
      {item.attachments && (
        <div className="attachments">
          {item.attachments.map(attachment => (
            <a href={attachment.url} key={attachment.id}>
              {attachment.name}
            </a>
          ))}
        </div>
      )}
    </div>
  )}
/>
```

### Filtered Timeline

```tsx
<GlassTimeline
  items={timelineItems}
  filter={{
    categories: ['milestone', 'release'],
    dateRange: {
      start: new Date('2023-01-01'),
      end: new Date('2023-06-30')
    }
  }}
/>
```

## Accessibility

The `GlassTimeline` component prioritizes accessibility:

- Respects user motion preferences using the `prefers-reduced-motion` media query
- Provides keyboard navigation for timeline items
- Uses semantic HTML and appropriate ARIA attributes
- Ensures sufficient color contrast for readability
- Supports screen readers through proper labeling

## Best Practices

- Provide clear, concise title and content for each timeline item
- Use icons to help visually distinguish between different types of events 
- Avoid overcrowding the timeline with too many items in a small time window
- Consider using the `groupByDate` feature when displaying many events
- Implement filters when displaying a large number of heterogeneous events
- Provide clear loading indicators when dynamically loading more data

## Customizing Appearance

The component inherits styles from your theme configuration. You can customize the appearance using:

- The `color` prop to change the primary color scheme
- The `glassVariant` and `blurStrength` props to adjust the glass effect
- The `density` prop to control spacing
- Custom CSS via the various className props
- Custom render functions to completely control the rendering of markers and content

## Related Components

- `GlassDataChart` - For displaying data visualizations with similar glass styling
- `GlassStepper` - For displaying progress through sequential steps
- `GlassCard` - As a container for timeline contents
