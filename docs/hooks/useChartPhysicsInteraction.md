# `useChartPhysicsInteraction` Hook

**Status:** Internal Hook (Used by `GlassDataChart`)

**CRITICAL: This hook is an internal implementation detail of the `GlassDataChart` component and is NOT intended for direct public use.**

## Overview

The `useChartPhysicsInteraction` hook provides physics-based zoom and pan interactions for Chart.js instances, specifically integrated within the `GlassDataChart` component. It adds smooth, inertial transitions using the Galileo physics system (`useGalileoStateSpring` for zoom, `requestAnimationFrame` for pan inertia).

**Important Note:** This hook is primarily designed for internal use by the `GlassDataChart` component. You typically enable and configure its behavior through the `interaction` prop of `GlassDataChart`, rather than using this hook directly.

## Integration with `GlassDataChart`

To enable physics-based zoom and pan on a `GlassDataChart`, configure its `interaction` prop:

```tsx
import { DataChart } from '@veerone/galileo-glass-ui';

const MyChart = () => {
  const chartData = { /* ... your chart datasets ... */ };

  return (
    <DataChart
      datasets={chartData}
      variant="line"
      interaction={{
        // Enable the physics interactions
        zoomPanEnabled: true, 
        
        // Specify zoom/pan mode ('x', 'y', or 'xy')
        zoomMode: 'xy', 
        
        // Optional: Configure physics parameters
        physics: {
          tension: 150,      // Spring stiffness for zoom
          friction: 20,       // Spring damping for zoom
          mass: 1,           // Mass for zoom spring
          minZoom: 0.5,      // Minimum zoom level (e.g., 50%)
          maxZoom: 8,        // Maximum zoom level (e.g., 800%)
          wheelSensitivity: 0.08, // Mouse wheel sensitivity (lower = more sensitive)
          inertiaDuration: 600, // Duration (ms) for pan inertia effect
        },
        
        // Other interaction options...
        showTooltips: true,
      }}
      // Provide a ref if needed for external control (though zoom/pan is handled internally)
      // ref={chartRef} 
    />
  );
};
```

**Explanation:**

- `interaction.zoomPanEnabled: true`: Activates the internal `useChartPhysicsInteraction` hook within `GlassDataChart`.
- `interaction.zoomMode`: Controls which axes are affected (`'x'`, `'y'`, or `'xy'`).
- `interaction.physics`: A nested object to fine-tune the physics behavior:
    - `tension`, `friction`, `mass`: Control the spring animation used for zooming.
    - `minZoom`, `maxZoom`: Define the zoom boundaries.
    - `wheelSensitivity`: Adjusts how much the mouse wheel zooms.
    - `inertiaDuration`: Controls how long the panning inertia effect lasts after releasing a drag.

`GlassDataChart` passes these options to its internal instance of `useChartPhysicsInteraction` and handles the necessary event listeners (wheel, mouse drag) on the chart canvas.

## Distinction from Element Physics

Note that the physics configured via `interaction.physics` apply specifically to the **zoom and pan** behavior of the *entire chart view*. 

Physics-based effects on individual chart *elements* (like bars or points on hover/click) are handled separately via the `getElementPhysicsOptions` prop passed to `GlassDataChart` and the internal `GalileoElementInteractionPlugin`.

## Direct Hook Usage (Advanced / Not Recommended)

While possible, using `useChartPhysicsInteraction` directly outside of `GlassDataChart` is generally not recommended as it requires manual setup of event listeners and integration with a Chart.js instance.

### Signature (for informational purposes)

```typescript
import { Chart as ChartJS } from 'chart.js';

interface ChartPhysicsInteractionOptions { 
  enabled: boolean;
  mode?: 'x' | 'y' | 'xy';
  physics?: { 
    tension?: number;
    friction?: number;
    mass?: number;
  };
  minZoom?: number;
  maxZoom?: number;
  inertiaDuration?: number;
  wheelSensitivity?: number;
  respectReducedMotion?: boolean;
}

function useChartPhysicsInteraction(
  chartRef: React.RefObject<ChartJS>,
  options?: Partial<ChartPhysicsInteractionOptions>
): {
  isPanning: boolean;
  zoomLevel: number;
  applyZoom: (newZoomLevel: number, center?: { x: number, y: number }) => void;
  resetZoom: () => void;
};
```

If used directly, you would need to:
1. Get a `ref` to your `ChartJS` instance.
2. Call the hook with the `ref` and `options`.
3. Manually attach wheel and mouse/pointer event listeners to the chart canvas, calling the appropriate handlers returned by the hook (like `handleWheel`, `handlePanStart`, `handlePanMove`, `handlePanEnd` - *Note: these handlers are internal to the hook implementation shown previously and not directly returned by the hook's signature defined here; direct usage would require modifying the hook or replicating its listener logic*).
4. Use the returned `zoomLevel`, `applyZoom`, `resetZoom` to control the chart state or UI elements (like external zoom buttons).

**Again, prefer configuring the `interaction` prop on `GlassDataChart` for the intended functionality.**

## Usage

**Do not import or use this hook directly.**

To enable and configure physics-based zoom and pan on a `GlassDataChart`:

1.  Use the `interaction` prop on the `<GlassDataChart>` component.
2.  Set the relevant property within the `interaction` object (e.g., `enablePhysicsZoomPan: true`). Consult the `GlassDataChartProps` type definition or the `GlassDataChart` documentation for the exact property name and configuration options available in your version.

```tsx
import { GlassDataChart } from '@veerone/galileo-glass-ui';

function MyChartComponent() {
  const chartData = { /* ... */ };

  return (
    <GlassDataChart
      data={chartData}
      interaction={{
        showTooltips: true,
        enablePhysicsZoomPan: true, // Example property - check documentation for exact name
        // Add other interaction configurations as needed
      }}
      // ... other props
    />
  );
}
```

Refer to the main `GlassDataChart` component documentation for details on configuring its interactions. 