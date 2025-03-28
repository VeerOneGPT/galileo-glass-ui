# GlassTimeline Component

The GlassTimeline component provides a sophisticated way to display chronological data with physics-based animations and glass styling.

## Features

- **Glass Styling**: Glass morphism effect with customizable variants (clear, frosted, tinted)
- **Physics Animations**: Spring-based animations with configurable physics parameters
- **Multiple Orientations**: Support for vertical and horizontal layouts
- **Zoom Levels**: Multiple time scales from hours to decades
- **Custom Rendering**: Fully customizable markers and content
- **Filtering & Grouping**: Category-based filtering and date-based grouping
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Respects user motion preferences

## Installation

The GlassTimeline component is part of the Galileo Glass UI library:

```bash
npm install @veerone/galileo-glass-ui
```

## Basic Usage

```jsx
import { GlassTimeline } from '@veerone/galileo-glass-ui';

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
  },
  // More items...
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

## Timeline Item Structure

Each timeline item requires the following properties:

```typescript
interface TimelineItem {
  // Required properties
  id: string | number;      // Unique identifier
  date: Date | string;      // Date/time of the event
  title: string;            // Title of the event
  
  // Optional properties
  content?: string | React.ReactNode;   // Description or content
  category?: string;                   // Category for filtering/grouping
  icon?: React.ReactNode;              // Icon to display
  color?: string;                      // Custom color
  highlighted?: boolean;               // Whether this event is highlighted
  endDate?: Date | string;             // For duration events
  data?: any;                          // Custom data
  allowGrouping?: boolean;             // Whether to group with others
  active?: boolean;                    // Currently active/selected
  disabled?: boolean;                  // Whether this item is disabled
}
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineItem[]` | Required | Array of events to display |
| `orientation` | `'horizontal'` \| `'vertical'` | `'vertical'` | Timeline orientation |
| `markerPosition` | `'alternate'` \| `'left'` \| `'right'` \| `'center'` | `'alternate'` | Position of event markers |
| `zoomLevel` | `ZoomLevel` | `'months'` | Current zoom level |
| `animation` | `'spring'` \| `'fade'` \| `'slide'` \| `'scale'` \| `'none'` | `'spring'` | Animation type |

### Glass Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glassVariant` | `'clear'` \| `'frosted'` \| `'tinted'` | `'frosted'` | Glass variant style |
| `blurStrength` | `'light'` \| `'standard'` \| `'strong'` | `'standard'` | Blur strength for glass effect |
| `color` | `'primary'` \| `'secondary'` \| `'success'` \| `'error'` \| `'warning'` \| `'info'` \| `'default'` | `'primary'` | Color theme |
| `glassMarkers` | `boolean` | `true` | Whether to use glass styling for markers |
| `glassContent` | `boolean` | `true` | Whether to use glass styling for content cards |

### Physics Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `physics` | `TimelinePhysicsConfig` | — | Physics configuration |
| `physics.tension` | `number` | `180` | Spring tension |
| `physics.friction` | `number` | `12` | Spring friction |
| `physics.mass` | `number` | `1` | Spring mass |
| `physics.preset` | `'gentle'` \| `'default'` \| `'snappy'` \| `'bouncy'` | `'default'` | Animation preset |
| `physics.staggerDelay` | `number` | `50` | Stagger delay between items (ms) |
| `physics.scrollDamping` | `number` | `0.85` | Damping factor for inertial scrolling |

### Layout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showAxis` | `boolean` | `true` | Whether to show the timeline axis |
| `markers` | `TimeScaleMarkersConfig` | — | Configuration for time scale markers |
| `density` | `'compact'` \| `'normal'` \| `'spacious'` | `'normal'` | Timeline density |
| `width` | `string` \| `number` | — | Width of the timeline container |
| `height` | `string` \| `number` | — | Height of the timeline container |

### Navigation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `navigation` | `'scroll'` \| `'button'` \| `'pagination'` | `'scroll'` | Navigation type |
| `zoomLevels` | `ZoomLevel[]` | — | Available zoom levels |
| `allowWheelZoom` | `boolean` | `false` | Whether to allow zooming with mouse wheel |
| `initialDate` | `Date` \| `string` | — | Initial date to focus on |
| `activeId` | `string` \| `number` | — | Current active event ID |
| `enableGestures` | `boolean` | `true` | Whether to enable touch gestures |

### Grouping and Filtering Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `groupByDate` | `boolean` | `false` | Whether to group events by date |
| `groupThreshold` | `number` | `3` | Number of events to show before grouping |
| `groups` | `TimelineGroup[]` | — | Groups to categorize events |
| `filter` | `TimelineFilter` | — | Current filter options |
| `allowFiltering` | `boolean` | `true` | Whether to allow filtering |

### Callback Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onItemClick` | `(item: TimelineItem) => void` | — | Callback when an event is clicked |
| `onItemSelect` | `(item: TimelineItem) => void` | — | Callback when an event is selected |
| `onNavigate` | `(date: Date, viewMode: TimelineViewMode) => void` | — | Callback when timeline is navigated |
| `onZoomChange` | `(zoomLevel: ZoomLevel) => void` | — | Callback when zoom level changes |
| `onFilterChange` | `(filter: TimelineFilter) => void` | — | Callback when filter changes |
| `onLoadMorePast` | `() => void` | — | Callback to load more past events |
| `onLoadMoreFuture` | `() => void` | — | Callback to load more future events |

### Rendering Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `renderMarker` | `(item: TimelineItem) => React.ReactNode` | — | Custom renderer for event markers |
| `renderContent` | `(item: TimelineItem) => React.ReactNode` | — | Custom renderer for event content |
| `renderAxis` | `(viewMode: TimelineViewMode, zoomLevel: ZoomLevel) => React.ReactNode` | — | Custom renderer for the timeline axis |

## Examples

### Vertical Timeline with Alternate Markers

```jsx
<GlassTimeline
  items={timelineItems}
  orientation="vertical"
  markerPosition="alternate"
  zoomLevel="months"
  animation="spring"
  physics={{ preset: "bouncy", staggerDelay: 50 }}
  glassVariant="frosted"
  color="primary"
  showAxis={true}
  groupByDate={true}
/>
```

### Horizontal Timeline with Gestures

```jsx
<GlassTimeline
  items={timelineItems}
  orientation="horizontal"
  markerPosition="center"
  zoomLevel="years"
  animation="spring"
  physics={{ preset: "gentle" }}
  navigation="scroll"
  enableGestures={true}
  allowWheelZoom={true}
  glassVariant="tinted"
  color="secondary"
  height={300}
/>
```

### Timeline with Custom Item Rendering

```jsx
<GlassTimeline
  items={timelineItems}
  renderContent={(item) => (
    <div className="custom-timeline-card">
      <div className="card-header">
        <span className="icon">{item.icon}</span>
        <h3>{item.title}</h3>
      </div>
      <div className="card-content">{item.content}</div>
      {item.image && <img src={item.image} alt={item.title} />}
      <div className="card-footer">
        <span className="category">{item.category}</span>
        <span className="date">{new Date(item.date).toLocaleDateString()}</span>
      </div>
    </div>
  )}
  renderMarker={(item) => (
    <div className={`custom-marker ${item.highlighted ? 'highlighted' : ''}`}>
      {item.icon}
    </div>
  )}
  // Other props...
/>
```

### Timeline with Filtering

```jsx
function FilterableTimeline() {
  const [activeCategory, setActiveCategory] = useState(null);
  
  const filter = activeCategory ? {
    categories: [activeCategory]
  } : undefined;
  
  const categories = useMemo(() => {
    // Extract unique categories from items
    const uniqueCategories = new Set();
    timelineItems.forEach(item => {
      if (item.category) uniqueCategories.add(item.category);
    });
    return Array.from(uniqueCategories);
  }, [timelineItems]);
  
  return (
    <div>
      <div className="category-filters">
        <button 
          onClick={() => setActiveCategory(null)}
          className={activeCategory === null ? 'active' : ''}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={activeCategory === category ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </div>
      
      <GlassTimeline
        items={timelineItems}
        filter={filter}
        onFilterChange={(newFilter) => {
          setActiveCategory(newFilter?.categories?.[0] || null);
        }}
        // Other props...
      />
    </div>
  );
}
```

## Accessibility

The GlassTimeline component respects user motion preferences and provides accessible animations:

- Respects `prefers-reduced-motion` media query
- Provides alternative animations for users with motion sensitivity
- Includes proper ARIA attributes for screen readers
- Supports keyboard navigation

## Browser Support

The GlassTimeline component works in all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Performance Considerations

For optimal performance with large datasets:

- Use `groupByDate` to consolidate items on crowded dates
- Consider loading data incrementally with `onLoadMorePast` and `onLoadMoreFuture`
- Use simpler animation types (`'fade'` or `'none'`) on low-end devices
- Optimize custom renderers to minimize renders

## Related Components

- `GlassDateRangePicker`: For selecting date ranges
- `GlassDataChart`: For data visualization
- `GlassMasonry`: For grid layouts