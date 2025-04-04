# GlassDataChart Component

**Status:** Core Component (v1.0.11+)

## Overview

The `GlassDataChart` component provides a flexible and visually rich way to display various chart types using the Chart.js library, integrated with Galileo Glass UI styling and animations. It features a modular structure, adaptive quality settings, and interactive elements.

## Import

```typescript
import { GlassDataChart } from '@veerone/galileo-glass-ui/components'; // Corrected import
import type { ChartDataset, GlassDataChartProps, GlassDataChartRef } from '@veerone/galileo-glass-ui/components'; // Example type import
```

## Basic Usage

```typescript
import React from 'react';
import { GlassDataChart } from '@veerone/galileo-glass-ui/components';
import type { ChartDataset } from '@veerone/galileo-glass-ui/components';

const MyChartComponent = () => {
  const sampleDatasets: ChartDataset[] = [
    {
      id: 'dataset-1', // Required ID for each dataset
      label: 'Dataset 1',
      data: [
        { x: 'Jan', y: 65 },
        { x: 'Feb', y: 59 },
        { x: 'Mar', y: 80 },
        // ... more data points { x, y }
      ],
      style: { 
          lineColor: '#8884d8', 
          lineWidth: 2,
          // Add other style options if needed
      } 
    },
    // ... more datasets
  ];

  return (
    <GlassDataChart
      title="Sample Chart"
      subtitle="Monthly Data Overview"
      variant="line" // e.g., 'line', 'bar', 'area', 'pie', 'doughnut'
      datasets={sampleDatasets}
      height={400} // Can be number (px) or string
      glassVariant="frosted" // 'clear', 'frosted', 'tinted', 'luminous'
      showToolbar={true} // Show toolbar with type switch, export
      // Configure interactions (zoom/pan, tooltips)
      interaction={{
        zoomPanEnabled: true,
        zoomMode: 'xy', // 'x', 'y', or 'xy' (corrected prop name)
        showTooltips: true,
        tooltipStyle: 'frosted',
        physics: { tension: 300, friction: 30 } // Physics for zoom/pan animation
      }}
      // Configure axes
      axis={{
        showXGrid: true,
        showYGrid: true,
        xTitle: 'Month',
        yTitle: 'Value'
      }}
      // Configure legend
      legend={{
        show: true,
        position: 'bottom'
      }}
      // Configure overall animation
      animation={{
        physicsEnabled: true, // Enable physics-based animations
        tension: 300, 
        friction: 30
      }}
    />
  );
};

export default MyChartComponent;
```

## Key Features & Configuration

### Modularity Explained

The `GlassDataChart` component, while used as a single component, is designed with logical modularity in mind. Different visual and interactive parts of the chart are configured through specific top-level props, allowing you to customize its appearance and behavior:

*   **Main Chart Area:** The core canvas where the chart is drawn. Its type is set by `variant`, and the data comes from `datasets`. Visual aspects like axes and grids are configured via the `axis` prop.
*   **Header:** Displays the chart's title and subtitle, configured by the `title` and `subtitle` props.
*   **Toolbar:** An optional bar at the top, enabled by `showToolbar`. It can contain controls like:
    *   Chart Type Switcher (if `allowTypeSwitch` is true).
    *   Download Button (if `allowDownload` is true, configured by `exportOptions`).
    *   Custom Controls (via `renderExportButton` or future additions).
*   **Legend:** Displays dataset labels and allows toggling dataset visibility. Configured entirely through the `legend` prop object (options: `show`, `position`, `align`, `style`, `glassEffect`).
*   **Tooltips:** Appear on hover to show data point details. Configured via the `interaction` prop object (options: `showTooltips`, `tooltipStyle`, `tooltipFollowCursor`).
*   **Interactions:** Hover effects, zoom, and pan capabilities are managed through the `interaction` prop object (options: `physicsHoverEffects`, `zoomPanEnabled`, `zoomMode`, `physics`). Event callbacks like `onDataPointClick` and `onZoomPan` handle user actions.
*   **Animations:** Entry and update animations are controlled by the `animation` prop object (options: `physicsEnabled`, `tension`, `friction`, `staggerDelay`, etc.).
*   **Styling & Background:** Overall appearance, including glass effects, colors, and borders, is set using props like `glassVariant`, `color`, `palette`, `backgroundColor`, `borderRadius`, `elevation`, etc.
*   **KPI Display:** A specialized display mode activated when `variant` is set to `'kpi'`, configured via the `kpi` prop.

By configuring these prop objects, you compose the final chart structure and functionality without needing to import and assemble separate sub-components.

### Chart Variants (`variant` prop)

Supports standard chart types: `line`, `bar`, `area`, `pie`, `doughnut`, `scatter`, `bubble`, `polarArea`, `radar`, `kpi`.
*   **Note on `area` (v1.0.14+):** Renders correctly with fill by default.
*   **Note on `clear` glassVariant (v1.0.14+):** Renders with full transparency.
*   **Note on `pie`/`doughnut` (v1.0.14+):** Functional, ensure data format is correct (typically an array of numbers in `datasets[0].data`).

### Styling (`glassVariant`, `color`, `palette`, etc.)

*   `glassVariant`: Applies glass effects (`frosted`, `tinted`, `luminous`, `clear`).
*   `color`: Sets the base theme color (e.g., `primary`, `secondary`, affects default palette, glows). Added for clarity.
*   `palette`: Array of hex colors used cyclically for datasets if not specified in `dataset.style`.
*   `backgroundColor`, `borderRadius`, `borderColor`, `elevation`: Control the container appearance.
*   Per-dataset styling can be applied via the direct properties on each `ChartDataset` object (e.g., `tension`, `fillOpacity`, `pointRadius`, `barThickness`). The `style` sub-object is no longer used for this.

### Interactivity (`interaction` prop and callbacks)

*   **Tooltips:** Configure via `interaction.showTooltips`, `interaction.tooltipStyle`, `interaction.tooltipFollowCursor`.
*   **Zoom/Pan (v1.0.14+):** Enable and configure via `interaction.zoomPanEnabled`, `interaction.zoomMode`, `interaction.physics`.
*   **Data Point Click:** Use the `onDataPointClick={(datasetIndex, dataIndex, dataPoint) => ...}` prop.
*   **Selection Change:** Use `onSelectionChange={(selectedIndices) => ...}` (primarily for pie/doughnut).
*   **Zoom/Pan Callback:** Use `onZoomPan={(chartInstance) => ...}`.
*   **Per-Element Physics (Planned):**
    *   The `getElementPhysicsOptions` prop exists to define interaction physics per element.
    *   **Status:** Basic hover/click detection updates internal state, but the visual physics animation applied by the internal plugin (`GalileoElementInteractionPlugin`) is based on the configuration passed via this prop and may require further refinement/testing for complex physics.

### Axes (`axis` prop)

Configure axes appearance:
```typescript
axis={{
  showXLabels?: boolean; // default: true
  showYLabels?: boolean; // default: true
  showXGrid?: boolean; // default: true
  showYGrid?: boolean; // default: true
  axisColor?: string; // default: rgba(255, 255, 255, 0.3)
  gridColor?: string; // default: rgba(255, 255, 255, 0.1)
  gridStyle?: 'solid' | 'dashed' | 'dotted'; // default: 'solid'
  xTicksCount?: number;
  yTicksCount?: number;
  xTitle?: string;
  yTitle?: string;
}}
```
*   **Right Y-Axis:** Enable by setting `useRightYAxis: true` within a specific dataset object. The axis (`y1`) appears automatically.

### Animation (`animation` prop)

Configure entry/update animations:
```typescript
animation={{
  physicsEnabled?: boolean; // default: true
  duration?: number; // default: 1000
  tension?: number; // default: 300
  friction?: number; // default: 30
  mass?: number; // default: 1
  easing?: 'easeOutQuart' | ...; // Used if physicsEnabled is false
  staggerDelay?: number; // default: 100 (ms)
}}
```

### Legend (`legend` prop)

Configure the legend display:
```typescript
legend={{
  show?: boolean; // default: true
  position?: 'top' | 'right' | 'bottom' | 'left'; // default: 'top'
  align?: 'start' | 'center' | 'end'; // default: 'center'
  style?: 'default' | 'glass' | 'pills'; // default: 'default'
  glassEffect?: boolean; // default: false (applies glass to legend items)
}}
```

### Other Notable Props

*   `datasets`: **Required.** Array of `ChartDataset` objects (see type definition below).
*   `kpi`: Props object for `variant='kpi'`. (`KpiProps` interface).
*   `showToolbar`: Boolean, shows/hides the top toolbar.
*   `allowTypeSwitch`: Boolean, allows users to change chart type via the toolbar.
*   `allowDownload`: Boolean, shows a download button in the toolbar.
*   `exportOptions`: Object to configure image export (filename, format, quality, etc.).
*   `renderExportButton`: Function to render a custom export button.
*   `useAdaptiveQuality`: Boolean, enables adaptive rendering based on `useQualityTier`.
*   `onTypeChange`: Callback when chart type is changed via toolbar.

## Key Types (`ChartDataset`, `DataPoint`)

```typescript
// Simplified from src/components/DataChart/types/ChartTypes.ts
export interface DataPoint {
  x: string | number; // Label or category
  y: number | null; // Value
  // Optional extra data for tooltips etc.
  label?: string;
  color?: string;
  extra?: Record<string, any>;
  formatType?: 'number' | 'currency' | 'percentage' | 'units';
  formatOptions?: { /* ... */ };
}

export interface ChartDataset {
  id: string; // Required unique ID
  label: string; // Legend label
  data: DataPoint[]; // Array of data points {x, y, ...}
  style?: DatasetStyle; // Per-dataset styling (lineColor, fillOpacity, etc.)
  useRightYAxis?: boolean;
  order?: number;
  hidden?: boolean;
  formatType?: 'number' | 'currency' | 'percentage' | 'units';
  formatOptions?: { /* ... */ };
}
```

## Ref API (`GlassDataChartRef`)

You can access imperative methods on the chart component by attaching a `ref`:

```typescript
import React, { useRef } from 'react';
import { GlassDataChart, GlassDataChartRef } from '@veerone/galileo-glass-ui/components';

function ChartWithRef() {
  const chartRef = useRef<GlassDataChartRef>(null);
  const datasets = [/* ... your datasets ... */];

  const handleExport = () => {
    chartRef.current?.exportChart(); 
  };

  const handleUpdate = () => {
    // Modify datasets or options...
    chartRef.current?.updateChart(); 
  };

  return (
    <div>
      <GlassDataChart ref={chartRef} datasets={datasets} variant="line" />
      <button onClick={handleExport}>Export</button>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
```

### Ref Methods

| Method                | Signature                         | Description                                    |
|-----------------------|-----------------------------------|------------------------------------------------|
| `getChartInstance`    | `() => any | null`             | Gets the underlying Chart.js instance (use with caution). |
| `exportChart`         | `() => void`                      | Exports the current chart view as an image (using `exportOptions`). |
| `updateChart`         | `() => void`                      | Triggers a re-render/update of the chart (useful after data/option changes). |
| `getContainerElement` | `() => HTMLDivElement | null`   | Gets the root container `div` element.         |
| `switchChartType`     | `(type: ChartVariant) => void`    | Programmatically changes the chart type.        |

## Per-Element Physics Interactions

*(Introduced in v1.0.14+, Experimental)*

You can apply physics-based hover or click effects (currently scale and opacity changes via spring physics) to individual chart elements (like bars or points) using the `getElementPhysicsOptions` prop.

```typescript
import { GlassDataChart, GetElementPhysicsOptions } from '@veerone/galileo-glass-ui/components';

const getPhysicsOptions: GetElementPhysicsOptions = 
  (dataPoint, datasetIndex, dataIndex, chartType) => {
    // Example: Apply hover effect only to the first dataset
    if (datasetIndex === 0) {
      return {
        hoverEffect: { scale: 1.1, opacity: 0.8 },
        // Optionally override physics parameters for this element's animation
        tension: 400, 
        friction: 25,
        mass: 1.2
      };
    }
    return undefined; // No special effect for other datasets
  };

<GlassDataChart
  // ... other props
  getElementPhysicsOptions={getPhysicsOptions}
  interaction={{ 
    physicsHoverEffects: true, // Make sure hover effects are generally enabled 
    showTooltips: true // Ensure interaction events are processed
  }}
/>
```

**How it Works:**

- Provide a function to `getElementPhysicsOptions`.
- This function receives details about the element (data point, indices, chart type).
- Return an object with `hoverEffect` or `clickEffect` properties (defining `scale`/`opacity` targets) and optional physics params (`tension`, `friction`, `mass`).
- An internal Chart.js plugin (`GalileoElementInteractionPlugin`) detects hover/click events.
- If your function returns options for that element, the plugin triggers an internal spring animation (using the provided or default physics params) to animate the element's scale and opacity towards the target values specified in `hoverEffect` or `clickEffect`.

**Current State:**

- Supports scale and opacity spring animations on hover/click.
- Configuration of `tension`, `friction`, `mass` per element is possible.
- Does *not* currently support applying arbitrary physics forces or more complex interactions defined in `usePhysicsInteraction` directly to chart elements via this prop.

## Known Issues / Limitations

*   Per-element physics interaction (via `getElementPhysicsOptions`) currently only applies scale/opacity spring animations; more complex physics require further development.
*   Advanced configuration of some Chart.js options may require accessing the Chart.js instance directly via `ref`.

*   Per-element physics interaction (via `getElementPhysicsOptions`) is functional but the underlying plugin animation might need further refinement for complex effects beyond basic scale/opacity springs.
*   Advanced configuration of some Chart.js options (e.g., specific scale types, intricate tick formatting) might require accessing the Chart.js instance directly (via ref) or needs better prop exposure. 