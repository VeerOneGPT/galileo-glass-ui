# Glass UI Components

The Glass UI design system provides a collection of components with glass morphism styling for creating modern, elegant UIs.

## New in 1.0.3: Advanced Physics-Based Components

Version 1.0.3 introduces several new physics-based components that enhance the user experience with natural motion and interactions:

### GlassTimeline Component

The GlassTimeline component provides a sophisticated way to display chronological data with physics-based animations, customizable views, zooming, and interactions.

```tsx
// Correct import path
import { GlassTimeline } from '@veerone/galileo-glass-ui/components';
import type { TimelineItem, TimelineRef } from '@veerone/galileo-glass-ui/components'; // Import types
import React, { useRef } from 'react';

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

// Enhanced example
function MyTimeline() {
  const timelineRef = useRef<TimelineRef>(null);

  return (
    <GlassTimeline
      ref={timelineRef}
      items={timelineItems}
      orientation="vertical"
      markerPosition="alternate"
      viewMode="month" // Set the view mode
      zoomLevel="weeks" // Set the zoom level
      groupByDate={true} // Enable grouping
      markers={{ show: true, showNow: true }} // Show time markers
      physics={{ preset: "gentle", staggerDelay: 50 }} // Physics config
      glassVariant="frosted"
      height="500px"
      onItemClick={(item) => console.log('Clicked:', item.id)}
      onZoomChange={(level) => console.log('Zoom level:', level)}
      animateOnMount={true}
    />
  );
}
```

#### Key Features

-   Displays chronological items (`TimelineItem[]`).
-   Supports horizontal and vertical orientations.
-   Configurable marker positions (`alternate`, `left`, `right`, `center`).
-   Multiple view modes (`day`, `week`, `month`, `year`, `decade`).
-   Zoom levels (`hours` to `decades`) to control density.
-   Optional grouping of items by date.
-   Customizable time scale markers.
-   Physics-based animations (`spring`, `fade`, etc.) with staggering.
-   Scroll, button, or pagination navigation.
-   Filtering capabilities.
-   Callbacks for interactions (item click/select, navigation, zoom, filter).
-   Custom rendering support for markers, content, and axis.
-   Glass styling variants.

#### Props (`TimelineProps`)

| Prop                 | Type                     | Default         | Description                                                                                              |
|----------------------|--------------------------|-----------------|----------------------------------------------------------------------------------------------------------|
| `items`              | `TimelineItem[]`         | `[]`            | Required. Array of event objects to display.                                                             |
| `orientation`        | `TimelineOrientation`    | `'vertical'`    | Layout orientation (`'horizontal'` or `'vertical'`).                                                       |
| `markerPosition`     | `MarkerPosition`         | `'alternate'`   | How event markers are positioned relative to the axis (`'alternate'`, `'left'`, `'right'`, `'center'`).    |
| `viewMode`           | `TimelineViewMode`       | `'month'`       | The primary time scale view (`'day'`, `'week'`, `'month'`, `'year'`, `'decade'`).                        |
| `groupByDate`        | `boolean`                | `true`          | If true, groups items occurring on the same date interval (based on `zoomLevel`).                       |
| `groupThreshold`     | `number`                 | `3`             | Minimum number of items on a date to trigger grouping visualization.                                     |
| `groups`             | `TimelineGroup[]`        | `[]`            | Optional array to define categories/groups for items.                                                    |
| `showAxis`           | `boolean`                | `true`          | If true, displays the main time axis line.                                                               |
| `markers`            | `TimeScaleMarkersConfig` | `{...}`         | Configuration object for time scale markers (show, intervals, formatter, showNow).                       |
| `animation`          | `TimelineAnimationType`  | `'spring'`      | Type of animation for item appearance (`'spring'`, `'fade'`, `'slide'`, `'scale'`, `'none'`).                |
| `physics`            | `TimelinePhysicsConfig`  | `{...}`         | Configuration for physics animations (preset, tension, friction, mass, scrollDamping, staggerDelay).     |
| `navigation`         | `NavigationType`         | `'scroll'`      | How users navigate the timeline (`'scroll'`, `'button'`, `'pagination'`, `'none'`).                        |
| `zoomLevel`          | `ZoomLevel`              | `'days'`        | Controls the density and detail level (`'hours'`, `'days'`, `'weeks'`, ..., `'decades'`).                |
| `zoomLevels`         | `ZoomLevel[]`            | `[...]`         | Array of zoom levels available for selection (if controls are enabled).                                  |
| `allowWheelZoom`     | `boolean`                | `true`          | If true, allows zooming using Ctrl + Mouse Wheel.                                                        |
| `initialDate`        | `Date \| string`         | `new Date()`    | The date the timeline initially focuses on.                                                              |
| `activeId`           | `string \| number`       | `undefined`     | ID of the item to be initially marked as active/selected.                                                |
| `density`            | `TimelineDensity`        | `'normal'`      | Controls the visual density/spacing (`'compact'`, `'normal'`, `'spacious'`).                             |
| `enableGestures`     | `boolean`                | `true`          | If true, enables touch gestures for scrolling/panning (implementation details may vary).                 |
| `filter`             | `TimelineFilter`         | `undefined`     | Object defining current filters (categories, dateRange, custom function).                                |
| `allowFiltering`     | `boolean`                | `true`          | If true, enables filtering functionality (requires UI controls to be implemented separately).            |
| `loadingPast`        | `boolean`                | `false`         | Indicates if older data is currently being loaded.                                                       |
| `loadingFuture`      | `boolean`                | `false`         | Indicates if newer data is currently being loaded.                                                       |
| `hasMorePast`        | `boolean`                | `false`         | If true, indicates more older data can be loaded via `onLoadMorePast`.                                   |
| `hasMoreFuture`      | `boolean`                | `false`         | If true, indicates more newer data can be loaded via `onLoadMoreFuture`.                                 |
| `width`              | `string \| number`       | `undefined`     | CSS width for the timeline container.                                                                    |
| `height`             | `string \| number`       | `undefined`     | CSS height for the timeline container.                                                                   |
| `className`          | `string`                 | `undefined`     | Additional CSS class name(s) for the root container.                                                     |
| `markerClassName`    | `string`                 | `undefined`     | Additional CSS class name(s) for event markers.                                                          |
| `contentClassName`   | `string`                 | `undefined`     | Additional CSS class name(s) for event content containers.                                               |
| `glassVariant`       | `'clear' \| 'frosted' \| 'tinted'` | `'frosted'`     | Glass styling variant for the main container (if applicable).                                           |
| `blurStrength`       | `'light' \| 'standard' \| 'strong'` | `'standard'`    | Blur strength for glass effects.                                                                         |
| `color`              | `'primary' \| ...`        | `'primary'`     | Color theme for markers, axis, controls.                                                                 |
| `glassMarkers`       | `boolean`                | `true`          | If true, applies glass styling to individual event markers.                                              |
| `glassContent`       | `boolean`                | `true`          | If true, applies glass styling to event content containers.                                              |
| `animateOnMount`     | `boolean`                | `true`          | If true, plays the entry animation when the component first mounts.                                      |
| `animateOnChange`    | `boolean`                | `true`          | If true, plays animations when the `items` prop changes.                                                 |
| `id`                 | `string`                 | `undefined`     | Optional DOM ID for the container.                                                                       |
| `ariaLabel`          | `string`                 | `undefined`     | ARIA label for accessibility.                                                                            |
| `onItemClick`        | `(item: TimelineItem) => void` | `undefined`     | Callback fired when an item's content or marker is clicked.                                               |
| `onItemSelect`       | `(item: TimelineItem) => void` | `undefined`     | Callback fired when an item becomes active/selected.                                                     |
| `onNavigate`         | `(date: Date, mode: TimelineViewMode) => void` | `undefined` | Callback fired when the timeline view navigates to a new date/period.                                      |
| `onZoomChange`       | `(level: ZoomLevel) => void` | `undefined`     | Callback fired when the zoom level changes.                                                              |
| `onFilterChange`     | `(filter: TimelineFilter) => void` | `undefined` | Callback fired when filter options change (requires external filter controls).                           |
| `onLoadMorePast`     | `() => void`             | `undefined`     | Callback fired when the user scrolls/navigates to request older data.                                    |
| `onLoadMoreFuture`   | `() => void`             | `undefined`     | Callback fired when the user scrolls/navigates to request newer data.                                    |
| `renderMarker`       | `(item: TimelineItem) => React.ReactNode` | `undefined` | Custom render function for an event's marker on the axis.                                                |
| `renderContent`      | `(item: TimelineItem) => React.ReactNode` | `undefined` | Custom render function for an event's content card.                                                      |
| `renderAxis`         | `(mode: TimelineViewMode, level: ZoomLevel) => React.ReactNode` | `undefined` | Custom render function for the entire time axis.                                                         |
| `animationConfig`    | `Partial<SpringConfig> \| SpringPresetName` | `'DEFAULT'`     | Inherited from `AnimationProps`. Configures item animations.                                             |
| `disableAnimation`   | `boolean`                | `false`         | Inherited from `AnimationProps`. Disables all animations if true.                                        |

#### Ref Methods (`TimelineRef`)

You can access component methods via a ref:

| Method              | Description                                    |
|---------------------|------------------------------------------------|
| `scrollToDate(date, smooth?)` | Scrolls the timeline to focus on a specific date. |
| `scrollToItem(itemId, smooth?)` | Scrolls the timeline to a specific item ID.     |
| `getContainerElement()` | Gets the main container DOM element.           |
| `getCurrentDate()`    | Gets the date currently centered in the view.  |
| `selectItem(itemId)`  | Programmatically selects/activates an item.      |

### GlassMasonry Component

The GlassMasonry component provides a physics-based masonry layout for arranging content of varying sizes in a visually appealing grid, with support for animations, lazy loading, and interactions.

```tsx
// Correct import path
import { GlassMasonry } from '@veerone/galileo-glass-ui/components';
import type { MasonryItem, GlassMasonryRef } from '@veerone/galileo-glass-ui/components'; // Import types
import React, { useRef } from 'react';

// Sample masonry items (ensure MasonryItem interface matches)
const masonryItems: MasonryItem[] = [
  { id: 'item-1', height: 200, data: { title: 'Item 1', src: '/img1.jpg' } },
  { id: 'item-2', height: 300, data: { title: 'Item 2', src: '/img2.jpg' } },
  { id: 'item-3', height: 250, data: { title: 'Item 3', src: '/img3.jpg' } },
  // Add more items...
];

// Example implementation
function MyMasonry() {
  const masonryRef = useRef<GlassMasonryRef>(null);

  return (
    <GlassMasonry
      ref={masonryRef}
      items={masonryItems}
      // Columns can be a number or responsive object
      columns={{ xs: 1, sm: 2, md: 3 }}
      gap={20} // Specify gap between items
      placementAlgorithm="balanced" // Or 'columns', 'optimal'
      itemAnimation="spring" // Or 'fade', 'slide', 'scale'
      physics={{ preset: "default", staggerDelay: 50 }}
      glassItems={true} // Apply glass styling to items
      glassContainer={false} // Optional: Apply glass to the main container
      lazyLoad={true}
      dragToReorder={false} // Enable drag & drop reordering if needed
      onItemClick={(item) => console.log('Clicked item:', item.id)}
      height="80vh" // Example fixed height with scrolling
      useScroller={true}
    >
      {/* Render function for each item */}
      {(item) => (
        <div style={{ padding: '10px', height: item.height /* Use item height */ }}>
          <img src={item.data.src} alt={item.data.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
          <h4 style={{ marginTop: '8px' }}>{item.data.title}</h4>
        </div>
      )}
    </GlassMasonry>
  );
}
```

#### Key Features

-   Arranges items (`MasonryItem[]`) in a multi-column grid.
-   Supports responsive column counts.
-   Multiple placement algorithms (`columns`, `balanced`, `optimal`).
-   Physics-based item animations (`spring`) or standard CSS animations (`fade`, `slide`, `scale`).
-   Optional lazy loading and virtualization for performance.
-   Optional drag-and-drop reordering.
-   Glass styling for items and/or the container.
-   Callbacks for layout completion and item clicks.

#### Props (`MasonryProps`)

| Prop                 | Type                                                          | Default          | Description                                                                                                 |
|----------------------|---------------------------------------------------------------|------------------|-------------------------------------------------------------------------------------------------------------|
| `items`              | `MasonryItem[]`                                               | `[]`             | Required. Array of item objects (`{ id, height?, width?, columnSpan?, rowSpan?, priority?, data? }`).        |
| `children`           | `(item: MasonryItem, index: number) => React.ReactNode`     | -                | Required. Render function for each item.                                                                    |
| `columns`            | `number \| { xs?, sm?, md?, lg?, xl? }`                     | `3`              | Number of columns or a responsive object defining columns per breakpoint.                                   |
| `gap`                | `number \| string \| { x?, y? }`                              | `16`             | Gap between items (pixels or CSS string). Can specify `x` and `y` gaps separately.                          |
| `placementAlgorithm` | `PlacementAlgorithm` (`'columns'`, ...)                    | `'columns'`      | Algorithm used to place items (`columns`, `rows`, `balanced`, `optimal`).                                   |
| `direction`          | `LayoutDirection` (`'vertical'`, `'horizontal'`)              | `'vertical'`     | Flow direction of the layout.                                                                               |
| `itemSizing`         | `ItemSizeType` (`'auto'`, ...)                             | `'auto'`         | How item sizes are determined (`auto`, `uniform`, `variable`, `responsive`).                                |
| `itemAnimation`      | `ItemAnimationType` (`'spring'`, ...)                      | `'spring'`       | Animation type for items appearing or repositioning.                                                        |
| `animationOrigin`    | `AnimationOrigin` (`'top'`, ...)                            | `'bottom'`       | Origin point for `slide` animations.                                                                        |
| `physics`            | `PhysicsConfig` (`{ tension?, friction?, mass?, preset?, staggerDelay?, randomizeParams? }`) | `{...}`          | Configuration for `spring` animations.                                                                      |
| `lazyLoad`           | `boolean`                                                     | `true`           | If true, uses IntersectionObserver to only render/load items near the viewport.                           |
| `virtualized`        | `boolean`                                                     | `false`          | If true, enables virtualization to render only visible items (requires fixed `height` and `useScroller`). |
| `overscanCount`      | `number`                                                      | `5`              | Number of items to render outside the viewport when `virtualized` is true.                                |
| `loadMoreTrigger`    | `LoadMoreTrigger` (`'scroll'`, ...)                        | `'scroll'`       | How to trigger `onLoadMore` (`scroll`, `button`, `visibility`).                                               |
| `onLoadMore`         | `() => void`                                                  | `undefined`      | Callback function to load more items.                                                                       |
| `hasMore`            | `boolean`                                                     | `false`          | Indicates if more items can be loaded.                                                                      |
| `loading`            | `boolean`                                                     | `false`          | Indicates if items are currently being loaded (shows `loadingComponent`).                                   |
| `loadingComponent`   | `React.ReactNode`                                             | `undefined`      | Component to display when `loading` is true.                                                                |
| `fillEmptySpaces`    | `boolean`                                                     | `false`          | If true, attempts to fill empty gaps in the layout (may affect order).                                    |
| `responsiveLayout`   | `boolean`                                                     | `true`           | If true, recalculates layout on window resize.                                                              |
| `resizeThreshold`    | `number`                                                      | `100`            | Debounce time (ms) for resize recalculations.                                                               |
| `onLayoutComplete`   | `(layout: any) => void`                                       | `undefined`      | Callback fired after layout calculation is complete.                                                        |
| `respectOrder`       | `boolean`                                                     | `true`           | If false, allows reordering items for potentially better packing (used by `optimal` placement).           |
| `className`          | `string`                                                      | `undefined`      | Additional CSS class name(s) for the root container.                                                        |
| `style`              | `React.CSSProperties`                                         | `undefined`      | Inline styles for the root container.                                                                       |
| `itemClassName`      | `string`                                                      | `undefined`      | Additional CSS class name(s) applied to each item container.                                                |
| `width`              | `string \| number`                                            | `undefined`      | CSS width for the masonry container. Defaults to `100%`.                                                     |
| `height`             | `string \| number`                                            | `undefined`      | CSS height for the masonry container. Required for `virtualized` or if `useScroller` is true.             |
| `glassVariant`       | `'clear' \| 'frosted' \| 'tinted'`                          | `'frosted'`      | Glass variant for items (`glassItems`) or container (`glassContainer`).                                   |
| `blurStrength`       | `'light' \| 'standard' \| 'strong'`                         | `'standard'`     | Blur strength for glass effects.                                                                          |
| `color`              | `'primary' \| ...`                                         | `'primary'`      | Color theme used for glass tinting or other elements.                                                       |
| `glassItems`         | `boolean`                                                     | `true`           | If true, applies glass styling to individual item containers.                                               |
| `glassContainer`     | `boolean`                                                     | `false`          | If true, applies glass styling to the main masonry container.                                               |
| `dragToReorder`      | `boolean`                                                     | `false`          | If true, allows users to drag and drop items to reorder them.                                             |
| `onOrderChange`      | `(newItems: MasonryItem[]) => void`                         | `undefined`      | Callback fired when item order changes via drag-and-drop.                                                   |
| `useScroller`        | `boolean`                                                     | `false`          | If true, the main container will handle scrolling (`overflow-y: auto`). Requires fixed `height`.            |
| `animateOnMount`     | `boolean`                                                     | `true`           | If true, plays entry animation for items on initial mount.                                                  |
| `animateOnChange`    | `boolean`                                                     | `true`           | If true, plays animations when `items` prop changes.                                                        |
| `enableImagePreview` | `boolean`                                                     | `false`          | If true, enables a built-in image preview modal on item click (if item has image data).                   |
| `previewRenderer`    | `(item: MasonryItem) => React.ReactNode`                    | `undefined`      | Custom render function for the image preview modal content.                                                 |
| `id`                 | `string`                                                      | `undefined`      | Optional DOM ID for the container.                                                                        |
| `onItemClick`        | `(item: MasonryItem) => void`                               | `undefined`      | Callback fired when an item is clicked.                                                                     |
| `animationConfig`    | `Partial<SpringConfig> \| SpringPresetName`                  | `'DEFAULT'`      | Inherited. Configures the `spring` item animation.                                                        |
| `disableAnimation`   | `boolean`                                                     | `false`          | Inherited. Disables all item animations if true.                                                          |
| `motionSensitivity`  | `MotionSensitivityLevel`                                      | `undefined`      | Inherited. Can influence animation intensity based on user preference.                                    |

#### Ref Methods (`GlassMasonryRef`)

You can access component methods via a ref:

| Method              | Description                                       |
|---------------------|---------------------------------------------------|
| `getContainerElement()`| Gets the main container DOM element.              |
| `recalculateLayout()` | Programmatically triggers a layout recalculation. |
| `scrollToY(offset, behavior?)` | Scrolls the container vertically (if `useScroller` is true). |

### GlassButton Component

A versatile button component offering standard variants (`contained`, `outlined`, `text`) and a `glass` variant, along with physics-based interaction animations.

```tsx
import React from 'react';
import { Button, GlassButton } from '@veerone/galileo-glass-ui'; // Assuming standard export path

function MyButtons() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => console.log('Standard Contained Clicked!')}
      >
        Standard Button
      </Button>
      
      <GlassButton 
        variant="glass" // Use 'glass' variant
        color="secondary"
        onClick={() => console.log('Glass Clicked!')}
        animationConfig="bouncy" // Apply physics preset
        affectsScale={true} // Enable scale effect on press
      >
        Glass Button
      </GlassButton>

      {/* Button acting as a link using asChild */}
      <Button asChild variant="outlined">
        <a href="#some-link">Link Button</a>
      </Button>
    </div>
  );
}
```

#### Key Features

- **Variants:** Supports `contained`, `outlined`, `text`, and `glass` variants.
- **Physics Interactions:** Integrates `usePhysicsInteraction` for press feedback (scale, position) configurable via `animationConfig`.
- **Glass Styling:** The `GlassButton` component is a wrapper around `Button` that applies glass effects (blur, glow) when `variant="glass"` or appropriate props are set.
- **`asChild` Prop:** Allows the button to render its child element directly, merging props.

#### Props (`ButtonProps`)

| Prop              | Type                                                     | Default         | Description                                                                                           |
|-------------------|----------------------------------------------------------|-----------------|-------------------------------------------------------------------------------------------------------|
| `children`        | `React.ReactNode`                                        | -               | The content of the button.                                                                            |
| `variant`         | `'text' \| 'outlined' \| 'contained' \| 'glass'`          | `'contained'`   | The visual style variant of the button.                                                               |
| `color`           | `'primary' \| 'secondary' \| 'success' \| ... \| 'default'` | `'primary'`     | The color theme of the button.                                                                        |
| `size`            | `'small' \| 'medium' \| 'large'`                       | `'medium'`      | The size of the button.                                                                               |
| `disabled`        | `boolean`                                                | `false`         | If `true`, the button will be disabled and unresponsive.                                               |
| `fullWidth`       | `boolean`                                                | `false`         | If `true`, the button will take up the full width of its container.                                     |
| `startIcon`       | `React.ReactNode`                                        | `undefined`     | Element displayed before the button children.                                                           |
| `endIcon`         | `React.ReactNode`                                        | `undefined`     | Element displayed after the button children.                                                            |
| `isLoading`       | `boolean`                                                | `false`         | If `true`, shows a loading indicator (implementation details may vary).                                 |
| `loadingText`     | `string`                                                 | `undefined`     | Text to display next to the loading indicator.                                                          |
| `onClick`         | `React.MouseEventHandler<HTMLButtonElement>`             | `undefined`     | Callback fired when the button is clicked.                                                            |
| `animationConfig` | `Partial<SpringConfig> \| SpringPresetName`           | `'PRESS_FEEDBACK'`| Configuration for the press animation (physics). Use preset names or `{ tension, friction, mass }`. |
| `physicsOptions`  | `Partial<PhysicsInteractionOptions>`                     | `undefined`     | Advanced physics interaction options (overrides defaults set by `animationConfig`).                   |
| `disableAnimation`| `boolean`                                                | `false`         | If `true`, disables the physics-based press animation.                                                |
| `asChild`         | `boolean`                                                | `false`         | If `true`, renders the child element directly, merging props.                                         |
| `motionSensitivity`| `MotionSensitivityLevel`                                | `undefined`     | Overrides the global motion sensitivity setting for this component.                                   |
| `className`       | `string`                                                 | `undefined`     | Additional CSS class name(s).                                                                         |
| `style`           | `React.CSSProperties`                                    | `undefined`     | Inline styles.                                                                                        |
| *...rest*         | `React.ButtonHTMLAttributes<HTMLButtonElement>`          | -               | Standard HTML button attributes.                                                                      |

**Note:** `GlassButton` accepts the same props as `Button`. The `variant="glass"` prop on `Button` or `GlassButton` enables the glass styling mixin.

### GlassMultiSelect Component

The GlassMultiSelect component provides a token-based multi-select with physics animations.

```tsx
import React, { useState } from 'react';
// Correct import paths
import { GlassMultiSelect } from '@veerone/galileo-glass-ui/components';
import type { MultiSelectOption } from '@veerone/galileo-glass-ui/components'; // Assuming type is exported here too

// Sample options - MUST include id, label, and value
const options: MultiSelectOption<string>[] = [
  { id: 'react', value: 'react', label: 'React', group: 'frontend' },
  { id: 'vue', value: 'vue', label: 'Vue', group: 'frontend' },
  { id: 'angular', value: 'angular', label: 'Angular', group: 'frontend' },
  { id: 'node', value: 'node', label: 'Node.js', group: 'backend' },
  { id: 'express', value: 'express', label: 'Express', group: 'backend' }
];

// Basic implementation
function MyMultiSelect() {
  // State must use the MultiSelectOption<T> type
  const [selected, setSelected] = useState<MultiSelectOption<string>[]>([]);
  
  return (
    <GlassMultiSelect<string> // Specify the generic type
      options={options}
      value={selected}
      onChange={setSelected} // Handler signature matches value type
      label="Select Frameworks"
      placeholder="Choose frameworks..."
      // Physics prop uses tension/friction or presets
      physics={{ 
        animationPreset: "bouncy",
        // Or specify directly: tension: 170, friction: 26 
      }} 
      glassVariant="frosted"
    />
  );
}
```

#### Props (`MultiSelectProps<T = string>`)

| Prop                 | Type                                                        | Default         | Description                                                                                              |
|----------------------|-------------------------------------------------------------|-----------------|----------------------------------------------------------------------------------------------------------|
| `options`            | `MultiSelectOption<T>[]`                                    | `[]`            | Required. Array of selectable option objects (`{ id, label, value, ... }`).                              |
| `value`              | `MultiSelectOption<T>[]`                                    | `undefined`     | Controlled state for the currently selected options.                                                       |
| `onChange`           | `(selected: MultiSelectOption<T>[]) => void`                | `undefined`     | Required callback fired when the selection changes.                                                        |
| `placeholder`        | `string`                                                    | `'Select...'`   | Placeholder text shown in the input when empty.                                                          |
| `label`              | `string`                                                    | `undefined`     | Label displayed above the input.                                                                         |
| `width`              | `string \| number`                                        | `'300px'`       | Width of the component container.                                                                        |
| `fullWidth`          | `boolean`                                                   | `false`         | If true, the component takes the full width of its parent.                                               |
| `size`               | `'small' \| 'medium' \| 'large'`                             | `'medium'`      | Size variant controlling height and padding.                                                             |
| `disabled`           | `boolean`                                                   | `false`         | If true, the component is disabled and cannot be interacted with.                                        |
| `error`              | `boolean`                                                   | `false`         | If true, displays the component in an error state (e.g., red border).                                    |
| `errorMessage`       | `string`                                                    | `undefined`     | Error message text displayed below the input when `error` is true.                                       |
| `helperText`         | `string`                                                    | `undefined`     | Helper text displayed below the input.                                                                   |
| `searchable`         | `boolean`                                                   | `true`          | If true, allows filtering options by typing in the input.                                                |
| `clearable`          | `boolean`                                                   | `true`          | If true, shows a button to clear all selected options.                                                   |
| `creatable`          | `boolean`                                                   | `false`         | If true, allows users to create new options based on their input.                                        |
| `onCreateOption`     | `(inputValue: string) => MultiSelectOption<T>`              | `undefined`     | Function called when a user tries to create a new option (required if `creatable` is true).                |
| `filterFunction`     | `FilterFunction<T>`                                         | internal        | Custom function to filter options based on input value.                                                  |
| `maxSelections`      | `number`                                                    | `undefined`     | Maximum number of options that can be selected.                                                          |
| `closeOnSelect`      | `boolean`                                                   | `true`          | If true, the dropdown closes automatically after selecting an option.                                      |
| `clearInputOnSelect` | `boolean`                                                   | `true`          | If true, the search input is cleared after selecting an option.                                          |
| `keyboardNavigation` | `boolean`                                                   | `true`          | If true, enables navigating the dropdown options using the keyboard.                                     |
| `withGroups`         | `boolean`                                                   | `false`         | If true, enables grouping of options based on the `group` property.                                      |
| `groups`             | `OptionGroup[]`                                             | `[]`            | Array of group definitions (`{ id, label }`) required if `withGroups` is true.                           |
| `maxHeight`          | `string \| number`                                        | `'300px'`       | Maximum height of the dropdown list before scrolling.                                                    |
| `openUp`             | `boolean`                                                   | `false`         | If true, the dropdown opens upwards instead of downwards.                                                |
| `animate`            | `boolean`                                                   | `true`          | If true, enables animations for dropdown and tokens.                                                     |
| `physics`            | `{ animationPreset?, tension?, friction?, dragToReorder?, hoverEffects? }` | `{}`            | Configuration for token animations and interactions. (`animationPreset`: 'gentle'...)                    |
| `async`              | `{ loading?, loadingIndicator?, onLoadMore?, hasMore?, fetchOptions? }` | `{}`            | Configuration for asynchronously loading options.                                                        |
| `renderToken`        | `(option, onRemove) => React.ReactNode`                   | internal        | Custom render function for selected option tokens.                                                       |
| `renderOption`       | `(option, state) => React.ReactNode`                        | internal        | Custom render function for options in the dropdown list.                                                 |
| `renderGroup`        | `(group) => React.ReactNode`                              | internal        | Custom render function for group headers.                                                                |
| `onOpen`             | `() => void`                                                | `undefined`     | Callback fired when the dropdown opens.                                                                  |
| `onClose`            | `() => void`                                                | `undefined`     | Callback fired when the dropdown closes.                                                                 |
| `onInputChange`      | `(value: string) => void`                                   | `undefined`     | Callback fired when the search input value changes.                                                      |
| `onSelect`           | `(option: MultiSelectOption<T>) => void`                    | `undefined`     | Callback fired specifically when an option is selected.                                                    |
| `onRemove`           | `(option: MultiSelectOption<T>) => void`                    | `undefined`     | Callback fired specifically when an option token is removed.                                               |
| `className`          | `string`                                                    | `undefined`     | Additional CSS class name(s) for the root container.                                                     |
| `id`                 | `string`                                                    | `undefined`     | DOM ID for the input element.                                                                            |
| `ariaLabel`          | `string`                                                    | `undefined`     | ARIA label for the component.                                                                            |
| `autoFocus`          | `boolean`                                                   | `false`         | If true, the input automatically gains focus on mount.                                                   |
| `dataTestId`         | `string`                                                    | `'glass-multi-select'` | Test ID for targeting in tests.                                                                          |

### GlassDateRangePicker Component

The GlassDateRangePicker component provides a date range picker with glass styling, comparison mode, presets, and physics-based animations.

**Note on Dependencies:** This component currently uses `date-fns` internally for date operations. Unlike earlier assumptions or previous versions, it does **not** require wrapping with `GlassLocalizationProvider` or installing specific peer dependencies beyond `date-fns` itself (if not already present in your project). Future versions might leverage the provider for enhanced localization.

```tsx
import React, { useState } from 'react';
// Correct import path
import { GlassDateRangePicker } from '@veerone/galileo-glass-ui/components';
// Import type for value/onChange if needed
import type { DateRange } from '@veerone/galileo-glass-ui/components'; 
// Make sure date-fns is available: npm install date-fns

// Basic implementation
function MyDateRangePicker() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  
  return (
    // No Provider needed currently
      <GlassDateRangePicker
        value={dateRange}
        onChange={setDateRange}
        label="Select Date Range"
      presets={true} // Show standard presets
      comparisonMode={false} // Disable comparison initially
      physics={{ animationPreset: "gentle" }} // Configure animations
        glassVariant="frosted"
      clearable={true}
      />
  );
}
```

#### Props (`DateRangePickerProps`)

| Prop                 | Type                                     | Default         | Description                                                                                                |
|----------------------|------------------------------------------|-----------------|------------------------------------------------------------------------------------------------------------|
| `value`              | `DateRange` (`{startDate, endDate}`)     | `undefined`     | Controlled state for the selected date range.                                                              |
| `onChange`           | `(range: DateRange) => void`             | `undefined`     | Required callback fired when the primary date range changes.                                               |
| `comparisonMode`     | `boolean`                                | `false`         | If true, enables comparison mode, allowing selection of a second date range.                             |
| `comparisonValue`    | `DateRange`                              | `undefined`     | Controlled state for the comparison date range (used when `comparisonMode` is true).                     |
| `onComparisonChange` | `(range: DateRange) => void`             | `undefined`     | Callback fired when the comparison date range changes.                                                     |
| `presets`            | `boolean \| DateRangePreset[]`          | `false`         | If `true`, shows standard presets. If an array, displays custom presets.                                  |
| `minDate`            | `Date`                                   | `undefined`     | Minimum selectable date.                                                                                   |
| `maxDate`            | `Date`                                   | `undefined`     | Maximum selectable date.                                                                                   |
| `enableTimeSelection`| `boolean`                                | `false`         | If true, allows selecting time along with the date.                                                        |
| `dateFormat`         | `string`                                 | `'MM/dd/yyyy'`  | Format string for displaying dates in the input (using `date-fns` syntax).                                 |
| `timeFormat`         | `string`                                 | `'hh:mm a'`     | Format string for displaying time (if `enableTimeSelection` is true).                                      |
| `locale`             | `string`                                 | browser default | Locale string (e.g., 'en-US') for formatting (passed to `date-fns`).                                      |
| `firstDayOfWeek`     | `number`                                 | `0` (Sunday)    | The first day of the week (0=Sun, 1=Mon, ...).                                                             |
| `disabled`           | `boolean`                                | `false`         | If true, the picker is disabled.                                                                           |
| `label`              | `string`                                 | `undefined`     | Label displayed above the input.                                                                           |
| `helperText`         | `string`                                 | `undefined`     | Helper text displayed below the input.                                                                     |
| `error`              | `boolean`                                | `false`         | If true, displays an error state.                                                                          |
| `errorMessage`       | `string`                                 | `undefined`     | Error message displayed when `error` is true.                                                              |
| `placeholder`        | `string`                                 | `'Select Range'`| Placeholder text when no range is selected.                                                                |
| `required`           | `boolean`                                | `false`         | If true, marks the input as required (visual only).                                                        |
| `clearable`          | `boolean`                                | `false`         | If true, shows a button to clear the selected range.                                                       |
| `autoClose`          | `boolean`                                | `true`          | If true, the picker closes automatically after selecting a full range.                                     |
| `showWeekNumbers`    | `boolean`                                | `false`         | If true, displays week numbers in the calendar.                                                            |
| `initialView`        | `CalendarView` (`'day'`, ...)             | `'day'`         | The initial view shown when the calendar opens (`day`, `month`, `year`).                                    |
| `fullWidth`          | `boolean`                                | `false`         | If true, the component takes the full width of its parent.                                                 |
| `size`               | `'small' \| 'medium' \| 'large'`              | `'medium'`      | Size variant controlling height and padding.                                                               |
| `glassVariant`       | `'clear' \| 'frosted' \| 'tinted'`           | `'frosted'`     | Glass styling variant for the input and popover.                                                           |
| `blurStrength`       | `'light' \| 'standard' \| 'strong'`          | `'standard'`    | Blur strength for glass effects.                                                                           |
| `color`              | `'primary' \| ...`                       | `'primary'`     | Color theme for highlights and controls.                                                                   |
| `inline`             | `boolean`                                | `false`         | If true, renders the picker inline (always open) instead of as a popover.                                  |
| `animate`            | `boolean`                                | `true`          | If true, enables animations for the popover.                                                             |
| `physics`            | `{ animationPreset?, tension?, friction? }` | `{}`            | Configuration for the popover animation (`animationPreset`: 'gentle'...).                                  |
| `popoverAnimationConfig` | `Partial<SpringConfig> \| keyof SpringPresets` | `'MODAL_SPRING'`| Overrides the default spring config specifically for the popover animation.                                |
| `renderInput`        | `(params) => React.ReactNode`            | internal        | Custom render function for the input display area.                                                         |
| `renderDay`          | `(date, selected, inRange, props) => React.ReactNode` | internal | Custom render function for individual day cells in the calendar.                                           |
| `onOpen`             | `() => void`                             | `undefined`     | Callback fired when the picker popover opens.                                                              |
| `onClose`            | `() => void`                             | `undefined`     | Callback fired when the picker popover closes.                                                             |
| `onApply`            | `(range: DateRange, compRange?: DateRange) => void` | `undefined` | Callback fired when the 'Apply' button is clicked (if controls are shown).                                |
| `onCancel`           | `() => void`                             | `undefined`     | Callback fired when the 'Cancel' button is clicked (if controls are shown).                                |
| `id`                 | `string`                                 | `undefined`     | DOM ID for the input element.                                                                              |
| `ariaLabel`          | `string`                                 | `undefined`     | ARIA label for the component.                                                                              |

### GlassTabs Component

A self-contained, interactive tabbed interface component with glass styling and a physics-based animated indicator for the active tab. It renders both the tab list and the content panels.

```tsx
import React, { useState, useRef } from 'react';
import { GlassTabs } from '@veerone/galileo-glass-ui/components'; // Assuming standard export path
import type { GlassTabsRef, GlassTabItem } from '@veerone/galileo-glass-ui/components'; // Adjust path if needed

function MyGlassTabsComponent() {
  const [activeTabId, setActiveTabId] = useState('info');
  const tabsRef = useRef<GlassTabsRef>(null);

  const myTabs: GlassTabItem[] = [
    { id: 'info', label: 'Information', content: <div>Details about the item.</div> },
    { id: 'specs', label: 'Specifications', content: <div>Technical specs go here.</div> },
    { id: 'reviews', label: 'Reviews', content: <div>User reviews...</div> },
  ];

  const handleTabChange = (tabId: string) => {
    console.log('Tab changed to:', tabId);
    setActiveTabId(tabId); // Keep local state in sync if needed
  };

  return (
    <GlassTabs
      ref={tabsRef}
      tabs={myTabs}
      defaultTab="info"
      onChange={handleTabChange}
      physics={{ tension: 400, friction: 30 }} // Customize indicator animation
    />
  );
}
```

#### Props

| Prop         | Type                                     | Default                   | Description                                                              |
|--------------|------------------------------------------|---------------------------|--------------------------------------------------------------------------|
| `tabs`       | `GlassTabItem[]`                         | `[]`                      | Required. Array of objects defining each tab (`{ id, label, content }`). |
| `defaultTab` | `string`                                 | First tab's ID or `''`    | The ID of the tab to be active initially.                                |
| `onChange`   | `(tabId: string) => void`                | `undefined`               | Callback function fired when the active tab changes.                     |
| `className`  | `string`                                 | `''`                      | Additional CSS class name(s) for the root container.                     |
| `physics`    | `{ tension?: number; friction?: number; mass?: number; }` | `{ tension: 500, friction: 25, mass: 1 }` | Configuration for the active indicator's spring animation.                 |

#### Ref Methods

The component accepts a `ref` of type `GlassTabsRef` which exposes the following methods:

| Method                | Signature                         | Description                                    |
|-----------------------|-----------------------------------|------------------------------------------------|
| `getContainerElement` | `() => HTMLDivElement | null`   | Gets the root container `div` element.         |
| `getTabListElement`   | `() => HTMLDivElement | null`   | Gets the tab list container `div` element.     |
| `setActiveTab`        | `(tabId: string) => void`         | Programmatically sets the active tab by its ID. |
| `getActiveTab`        | `() => string`                    | Gets the ID of the currently active tab.        |

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
  // Component-specific props...
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

### Card

A versatile container component representing a card, leveraging the `DimensionalGlass` surface for styling.

```tsx
import { Card } from '@veerone/galileo-glass-ui/components'; // Corrected import path
// Or potentially: import { Card } from '@veerone/galileo-glass-ui';

<Card 
  title="Card Title"
  variant="frosted" // Includes standard, elevation, outlined, frosted, dimensional, heat
  elevation={2}
  hover={true} // Controls interactivity
  glow="subtle" // Add glow effect
  glowColor="primary"
  padding="medium"
  onClick={() => console.log('Card clicked')}
>
  <p>Card content goes here.</p>
</Card>
```

**Note:** The glass effects (`variant`, `elevation`, `interactive` state derived from `hover`) are primarily handled by the internal `DimensionalGlass` component. The `Card` component provides a convenient wrapper.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Card content (Required) |
| `variant` | 'elevation' \| 'outlined' \| 'standard' \| 'frosted' \| 'dimensional' \| 'heat' | 'elevation' | Styling variant (influences underlying Glass surface) |
| `elevation` | 0 \| 1 \| 2 \| 3 \| 4 \| 5 | 1 | Shadow elevation level (passed to Glass surface) |
| `hover` | boolean | true | If true, enables hover effects (passed as `interactive` to Glass surface) |
| `glow` | 'none' \| 'subtle' \| 'medium' \| 'strong' | 'none' | Glow effect intensity |
| `glowColor` | 'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info' | 'primary' | Color of the glow effect |
| `raised` | boolean | false | If true, applies a raised effect (visual details TBD) |
| `title` | string | undefined | Optional card title |
| `padding` | 'none' \| 'small' \| 'medium' \| 'large' | 'medium' | Padding inside the card |
| `maxWidth` | string | undefined | Maximum width (CSS value) |
| `onClick` | (event: React.MouseEvent<HTMLDivElement>) => void | undefined | Click handler (also sets cursor: pointer) |
| `className` | `string` | `undefined` | Additional CSS class name(s). |
| `animationConfig`, `disableAnimation`, `motionSensitivity` | - | - | Standard AnimationProps |
| *...rest* | HTMLAttributes<HTMLDivElement> | - | Standard HTML attributes for the root div |

### GlassDatePicker

A simple, standalone date picker component with glass morphism styling for the input and calendar popup. It does not rely on external date libraries or localization providers.

```tsx
import React, { useState } from 'react';
import { GlassDatePicker } from '@veerone/galileo-glass-ui/components'; // Assuming standard export path

function MyDatePickerComponent() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const handleDateChange = (date: Date) => {
    console.log('Selected Date:', date);
    setSelectedDate(date);
  };

  return (
  <GlassDatePicker 
      label="Select Event Date"
      initialDate={selectedDate}
      onChange={handleDateChange}
      dateFormat="YYYY-MM-DD" // Example format
      placeholder="Choose a date"
      disabled={false}
  />
  );
}
```

#### Props

| Prop          | Type                      | Default        | Description                                                    |
|---------------|---------------------------|----------------|----------------------------------------------------------------|
| `label`       | `string`                  | `'Date'`       | Text label displayed above the date picker input.              |
| `initialDate` | `Date`                    | `undefined`    | The initially selected date.                                   |
| `onChange`    | `(date: Date) => void`    | `undefined`    | Callback function fired when a date is selected in the calendar. |
| `dateFormat`  | `string`                  | `'MM/DD/YYYY'` | Format string for displaying the date (e.g., 'YYYY-MM-DD').    |
| `placeholder` | `string`                  | `'Select date'`| Placeholder text shown in the input when no date is selected. |
| `disabled`    | `boolean`                 | `false`        | If true, the date picker input is disabled.                    |
| `className`   | `string`                  | `''`           | Additional CSS class name(s) for the root container.           |

### GlassLocalizationProvider

A provider component that sets up a date localization context for potential use by Galileo components. It currently uses `date-fns` internally.

```tsx
// Import from the main components path
import { GlassLocalizationProvider } from '@veerone/galileo-glass-ui/components';
// If using the hook in consuming components:
import { useDateAdapter } from '@veerone/galileo-glass-ui/components'; // Or potentially /hooks

<GlassLocalizationProvider
  // Currently no props are needed, it uses date-fns by default
>
  {/* Components that might consume the context via useDateAdapter() */}
  {children}
</GlassLocalizationProvider>
```

#### Purpose

Provides a React context containing date manipulation and formatting functions based on the `date-fns` library. This allows components within its tree to access consistent date logic via the `useDateAdapter` hook, without needing to import `date-fns` directly.

**Note:** As of the current version, no standard Galileo components (like `GlassDatePicker` or `GlassDateRangePicker`) actively consume this provider. It exists primarily for potential future use or custom component development requiring shared `date-fns` logic.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | The children components that will have access to the date context. |
| `dateAdapter` | 'date-fns' | 'date-fns' | Currently fixed to use `date-fns`. This prop might be used for future flexibility but has no effect now. |

#### `useDateAdapter` Hook

Components within a `GlassLocalizationProvider` can access the date functions using this hook:

```typescript
import { useDateAdapter } from '@veerone/galileo-glass-ui/components'; // Or /hooks

function MyComponentUsingDateAdapter() {
  const dateAdapter = useDateAdapter();

  const todayFormatted = dateAdapter.format(new Date(), 'yyyy-MM-dd');
  const nextWeek = dateAdapter.addDays(new Date(), 7);
  // ... use other adapter functions: parse, isValid, addMonths, addYears

  return <div>Today: {todayFormatted}</div>;
}
```

The hook returns an object matching the `DateAdapter` interface:

```typescript
// Internal interface provided by the context
interface DateAdapter {
  format: (date: Date | null, formatString: string) => string;
  parse: (value: string, formatString: string) => Date | null;
  isValid: (date: any) => boolean;
  addDays: (date: Date, amount: number) => Date;
  addMonths: (date: Date, amount: number) => Date;
  addYears: (date: Date, amount: number) => Date;
}
```

### Breadcrumbs

A navigation component indicating the current page's location within a hierarchy, often used for site navigation. It accepts `children` for defining the individual breadcrumb links or items.

```tsx
import React from 'react';
import { Breadcrumbs } from '@veerone/galileo-glass-ui/components'; // Corrected import path
import styled from 'styled-components';

// Example usage with simple anchor tags
const Link = styled.a`
  text-decoration: none;
  color: inherit;
  &:hover { text-decoration: underline; }
`;

function MyBreadcrumbs() {
  return (
    <Breadcrumbs 
      separator=">" 
      variant="glass"
      color="primary"
  maxItems={4}
      collapsible
      physicsEnabled
      animated
    >
      <Link href="/">Home</Link>
      <Link href="/category">Category</Link>
      <Link href="/category/subcategory">Subcategory</Link>
      {/* Current page (not a link) */}
      <span>Current Page</span> 
    </Breadcrumbs>
  );
}
```

#### Props

| Prop                  | Type                                                | Default         | Description                                                                                                             |
|-----------------------|-----------------------------------------------------|-----------------|-------------------------------------------------------------------------------------------------------------------------|
| `children`            | `React.ReactNode`                                   | -               | Required. The breadcrumb items, typically anchor `<a>` elements or similar components.                                |
| `separator`           | `React.ReactNode`                                   | `'/'`           | Custom separator node rendered between items.                                                                           |
| `variant`             | `'standard' \| 'glass' \| 'flat' \| 'dimensional' \| 'elevated'` | `'standard'`    | Styling variant of the breadcrumbs container.                                                                         |
| `color`               | `'primary' \| 'secondary' \| 'default' \| ...`       | `'default'`     | Color theme, affects link colors and glass glow.                                                                       |
| `maxItems`            | `number`                                            | `undefined`     | Maximum number of items to display before collapsing.                                                                   |
| `itemsBeforeCollapse` | `number`                                            | `1`             | Number of items to show at the start when collapsed.                                                                    |
| `itemsAfterCollapse`  | `number`                                            | `1`             | Number of items to show at the end when collapsed.                                                                      |
| `expandText`          | `string`                                            | `'...'`         | Text or component shown for the collapsed items indicator.                                                              |
| `collapsible`         | `boolean`                                           | `false`         | Enables the collapsing behavior based on `maxItems`.                                                                      |
| `showExpandIcon`      | `boolean`                                           | `false`         | (If collapsible) Shows an icon for the expand indicator.                                                                |
| `onExpandClick`       | `() => void`                                        | `undefined`     | (If collapsible) Callback fired when the collapsed indicator is clicked.                                                |
| `animated`            | `boolean`                                           | `false`         | If true, applies a subtle fade-in animation to the container.                                                           |
| `physicsEnabled`      | `boolean`                                           | `false`         | If true, enables physics-based hover effects on breadcrumb links (scale, requires interaction hook internally).     |
| `magnetic`            | `boolean`                                           | `false`         | If true and `physicsEnabled` is true, enables a magnetic pull effect on hover.                                           |
| `magneticStrength`    | `number`                                            | `0.5`           | Strength of the magnetic effect (0-1).                                                                                   |
| `zSpaceDepth`         | `boolean`                                           | `false`         | If true, applies 3D depth separation between items (requires parent perspective).                                      |
| `depthLevel`          | `number`                                            | `5`             | Base depth multiplier for `zSpaceDepth` (0-10).                                                                         |
| `withBackground`      | `boolean`                                           | `false`         | If true (for `standard` or `flat` variants), adds a subtle background color.                                            |
| `itemIcon`            | `React.ReactNode`                                   | `undefined`     | Optional icon to display before each breadcrumb item's content.                                                           |
| `className`           | `string`                                            | `''`            | Additional CSS class name(s) for the root container.                                                                    |
| `role`                | `string`                                            | `'navigation'`  | ARIA role for the container.                                                                                            |

### GlassCarousel

A carousel component with glass morphism styling that supports physics-based inertial scrolling and accepts children as items.

```tsx
import React from 'react';
import { GlassCarousel } from '@veerone/galileo-glass-ui/components';
import { GlassBox } from '@veerone/galileo-glass-ui/components'; // For item content

function MyCarousel() {
  const items = [1, 2, 3, 4, 5]; // Example data

  return (
<GlassCarousel
      itemWidth={250} // Width of each child item
      itemGap={20} // Gap between items
      height={150} // Fixed height for the carousel container
      loop={true}
      autoplay={true}
      autoplayDelay={4000}
      pauseOnHover={true}
      showControls={true}
      showIndicators={true}
      // animationConfig preset affects the inertial scrolling physics
      animationConfig="gentle" 
      glass={true} // Enable glass styling
      rounded={true}
      glow={true}
    >
      {/* Map data to children elements */}
      {items.map(item => (
        <GlassBox 
          key={item} 
          style={{
            width: '100%', // Child takes full itemWidth
            height: '100%',
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center', 
            backgroundColor: `rgba(0, 0, ${Math.random() * 155 + 100}, 0.5)`,
            borderRadius: '4px'
          }}
        >
          Item {item}
        </GlassBox>
      ))}
    </GlassCarousel>
  );
}
```

#### Props (`GlassCarouselProps`)

| Prop                 | Type                     | Default      | Description                                                                                              |
|----------------------|--------------------------|--------------|----------------------------------------------------------------------------------------------------------|
| `children`           | `React.ReactNode`        | -            | Required. The items to display in the carousel, passed as children.                                       |
| `itemWidth`          | `number`                 | `200`        | The width of each carousel item in pixels.                                                               |
| `itemGap`            | `number`                 | `16`         | The gap between carousel items in pixels.                                                                |
| `height`             | `string \| number`       | `'auto'`     | Height of the carousel container.                                                                        |
| `showControls`       | `boolean`                | `true`       | If true, displays previous/next navigation buttons.                                                      |
| `showIndicators`     | `boolean`                | `true`       | If true, displays pagination indicators (dots).                                                          |
| `loop`               | `boolean`                | `true`       | If true, the carousel loops infinitely.                                                                  |
| `peek`               | `'none' \| 'left' \| 'right'` | `'none'`     | Allows partially showing the previous/next item (implementation may vary).                             |
| `glass`              | `boolean`                | `true`       | If true, applies glass styling to the main container.                                                    |
| `rounded`            | `boolean`                | `true`       | If true, applies rounded corners to the container.                                                       |
| `glow`               | `boolean`                | `true`       | If true, enables a glow effect on the container (color depends on theme/`glowColor`).                     |
| `glowColor`          | `string`                 | theme primary| Optional override for the glow color (CSS color value).                                                   |
| `edge`               | `boolean`                | `true`       | If true, applies edge highlighting effects.                                                              |
| `innerPadding`       | `number`                 | `0`          | Optional padding inside the main container, affecting scroll bounds.                                     |
| `className`          | `string`                 | `undefined`  | Additional CSS class name(s) for the root container.                                                     |
| `autoplay`           | `boolean`                | `false`      | If true, the carousel automatically advances slides.                                                     |
| `autoplayDelay`      | `number`                 | `3000`       | Delay in milliseconds between slides when `autoplay` is true.                                            |
| `pauseOnHover`       | `boolean`                | `true`       | If true, pauses `autoplay` when the mouse hovers over the carousel.                                      |
| `motionSensitivity`  | `number`                 | `undefined`  | Custom sensitivity factor for drag interactions (higher = more sensitive).                               |
| `animationConfig`    | `Partial<SpringConfig> \| SpringPresetName` | `'DEFAULT'`  | Configures the physics for inertial scrolling (e.g., `'gentle'`, `{ tension, friction, mass }`).          |
| `disableAnimation`   | `boolean`                | `false`      | Inherited from `AnimationProps`. If true, disables physics-based scrolling (snaps instantly).            |
| *...rest*            | `HTMLAttributes<HTMLDivElement>` | -         | Standard HTML attributes applied to the root container div.                                               |

### GlassImageViewer

An interactive image viewer with glass morphism styling, supporting physics-based zoom and pan, touch gestures, keyboard navigation, fullscreen mode, and an optional image gallery.

```tsx
import React, { useState, useRef } from 'react';
import {
  GlassImageViewer,
  type ImageItem, // Import type for image data
  type GlassImageViewerRef // Import type for component ref
} from '@veerone/galileo-glass-ui/components';
import { GlassButton } from '@veerone/galileo-glass-ui/components';

function MyImageViewer() {
  const viewerRef = useRef<GlassImageViewerRef>(null);
  const mainImage: ImageItem = {
    id: 'img1',
    src: '/images/landscape.jpg',
    alt: 'Wide landscape view',
    width: 1920,
    height: 1080,
    metadata: { title: 'Mountain Vista', author: 'Photographer' }
  };

  const galleryImages: ImageItem[] = [
    mainImage,
    { id: 'img2', src: '/images/portrait.jpg', alt: 'Portrait shot' },
    { id: 'img3', src: '/images/macro.jpg', alt: 'Close up of a flower' }
  ];

  return (
    <div>
<GlassImageViewer
        ref={viewerRef}
        image={mainImage} // Pass the main image object
        images={galleryImages} // Optional: Provide gallery images
        initialZoom={1.0}
        maxZoom={4.0}
        minZoom={0.5}
        showInfo={true} // Show metadata panel
        glassEffect={true}
        glassVariant="frosted"
        blurStrength="standard"
        zoomControls={true}
  fullscreenEnabled={true}
        navigationControls={true} // For gallery
        keyboardNavigation={true}
        touchGestures={true}
        color="primary"
        downloadButton={true}
        // Physics config affects zoom/pan inertia
        physics={{ tension: 200, friction: 25, panDamping: 0.9 }}
        width="100%"
        height="600px"
        borderRadius="12px"
        onZoomChange={(level) => console.log('Zoom:', level)}
        onImageChange={(img, index) => console.log('Image changed:', index, img.id)}
      />
      <div style={{ marginTop: '1rem' }}>
        <GlassButton onClick={() => viewerRef.current?.zoomTo(2.0)}>Zoom In</GlassButton>
        <GlassButton onClick={() => viewerRef.current?.resetView()}>Reset View</GlassButton>
        <GlassButton onClick={() => viewerRef.current?.nextImage()}>Next</GlassButton>
      </div>
    </div>
  );
}
```

#### Props (`GlassImageViewerProps`)

| Prop                 | Type                                                | Default          | Description                                                                                                   |
|----------------------|-----------------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------|
| `image`              | `ImageItem`                                         | -                | Required. An object containing the primary image details (`src`, `alt`, `thumbnail`, `metadata`, etc.).     |
| `images`             | `ImageItem[]`                                       | `undefined`      | Optional. An array of `ImageItem` objects for gallery mode. If provided, enables gallery navigation.            |
| `initialZoom`        | `number`                                            | `1.0`            | The initial zoom level (1 = 100%).                                                                             |
| `maxZoom`            | `number`                                            | `5.0`            | Maximum allowed zoom level.                                                                                    |
| `minZoom`            | `number`                                            | `0.5`            | Minimum allowed zoom level.                                                                                    |
| `showInfo`           | `boolean`                                           | `false`          | If true, displays an information panel with image metadata (if available in `image.metadata`).            |
| `glassEffect`        | `boolean`                                           | `true`           | If true, applies glass styling to the viewer container.                                                        |
| `glassVariant`       | `'clear' \| 'frosted' \| 'tinted'`                   | `'frosted'`      | The type of glass effect to apply.                                                                           |
| `blurStrength`       | `'light' \| 'standard' \| 'strong'`                  | `'standard'`     | The intensity of the background blur for the glass effect.                                                     |
| `zoomControls`       | `boolean`                                           | `true`           | If true, displays zoom in/out buttons.                                                                         |
| `fullscreenEnabled`  | `boolean`                                           | `true`           | If true, allows toggling fullscreen mode via a button or double-click.                                        |
| `mode`               | `ViewerMode` (`'normal' \| ...`)                   | `'normal'`       | Sets the initial display mode (e.g., 'fullscreen').                                                            |
| `navigationControls` | `boolean`                                           | `true`           | If true (and `images` are provided), displays next/previous buttons for gallery navigation.                  |
| `keyboardNavigation` | `boolean`                                           | `true`           | If true, enables keyboard controls (arrows for pan/gallery, +/- for zoom, Esc for fullscreen).                 |
| `touchGestures`      | `boolean`                                           | `true`           | If true, enables touch gestures (pinch to zoom, drag to pan).                                                |
| `color`              | `'primary' \| 'secondary' \| ... \| 'default'`          | `'primary'`      | Color theme applied to controls and potentially UI elements.                                                   |
| `downloadButton`     | `boolean`                                           | `true`           | If true, displays a button to download the current image.                                                      |
| `physics`            | `{ tension?, friction?, mass?, panDamping?, inertia? }` | `{...}`          | Configuration object for the physics of zoom/pan interactions (spring and inertial movement).              |
| `width`              | `string \| number`                                   | `undefined`      | CSS width for the viewer container. Defaults to `100%`.                                                        |
| `height`             | `string \| number`                                   | `undefined`      | CSS height for the viewer container. Defaults to `500px`.                                                      |
| `borderRadius`       | `string \| number`                                   | `undefined`      | CSS border-radius for the viewer container. Defaults to `8px`.                                               |
| `background`         | `string`                                            | `rgba(0,0,0,0.2)`| CSS background for the viewer container (color or image).                                                    |
| `className`          | `string`                                            | `undefined`      | Additional CSS class name(s) for the root container.                                                           |
| `style`              | `React.CSSProperties`                               | `undefined`      | Inline styles for the root container.                                                                          |
| `onImageClick`       | `(image: ImageItem) => void`                        | `undefined`      | Callback fired when the image itself is clicked.                                                               |
| `onImageDoubleClick` | `(image: ImageItem) => void`                        | `undefined`      | Callback fired when the image is double-clicked (often toggles zoom or fullscreen).                         |
| `onFullscreenChange` | `(isFullscreen: boolean) => void`                 | `undefined`      | Callback fired when fullscreen mode is entered or exited.                                                      |
| `onZoomChange`       | `(zoomLevel: number) => void`                       | `undefined`      | Callback fired when the zoom level changes.                                                                    |
| `onImageChange`      | `(image: ImageItem, index: number) => void`         | `undefined`      | Callback fired when the displayed image changes in gallery mode.                                               |
| `animationConfig`    | `Partial<SpringConfig> \| SpringPresetName`           | `'GENTLE'`       | Inherited from `AnimationProps`. Configures the **zoom** spring animation.                               |
| `disableAnimation`   | `boolean`                                           | `false`          | Inherited from `AnimationProps`. If true, disables physics-based zoom/pan (snaps instantly).                 |

#### Ref Methods (`GlassImageViewerRef`)

You can access component methods via a ref:

| Method              | Description                                    |
|---------------------|------------------------------------------------|
| `zoomTo(level)`     | Programmatically sets the zoom level.          |
| `panTo(position)`   | Programmatically pans the image to {x, y}.     |
| `resetView()`       | Resets zoom and pan to initial state.          |
| `nextImage()`       | Navigates to the next image (gallery mode).    |
| `prevImage()`       | Navigates to the previous image (gallery mode). |
| `toggleFullscreen()`| Toggles fullscreen mode.                       |
| `getCurrentImage()` | Gets the data object of the current image.     |
| `getCurrentZoom()`  | Gets the current zoom level.                   |
| `getCurrentPosition()`| Gets the current pan position {x, y}.          |
| `getContainerElement()`| Gets the main container DOM element.          |

### GlassDataGrid

A component for displaying tabular data with sorting and experimental physics-based row dragging.

[See Full GlassDataGrid Documentation](./glass-data-grid.md)

```tsx
// Basic Example
import { GlassDataGrid } from './GlassDataGrid'; // Example local path
// ... data and columns setup ...
<GlassDataGrid data={data} columns={columns} enableRowDragging />
```

### GlassDataChart

A flexible component for rendering various chart types (line, bar, pie, etc.) with glass styling and interactions.

[See Full GlassDataChart Documentation](./data-chart.md)

```tsx
// Basic Example
import { GlassDataChart } from './GlassDataChart'; // Example local path
// ... datasets setup ...
<GlassDataChart variant="line" datasets={datasets} />
```

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