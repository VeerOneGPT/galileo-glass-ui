### Interaction Options (`interaction`)

Configure how users interact with the chart.

```typescript
interface ChartInteractionOptions {
  zoomPanEnabled?: boolean; // Default: false
  zoomMode?: 'x' | 'y' | 'xy'; // Default: 'xy'
  physicsHoverEffects?: boolean; // Default: true
  hoverSpeed?: number; // Default: 150
  showTooltips?: boolean; // Default: true
  tooltipStyle?: 'glass' | 'frosted' | 'tinted' | 'luminous' | 'dynamic'; // Default: 'frosted'
  tooltipFollowCursor?: boolean; // Default: false
  physics?: Partial<{
    tension: number; // Spring tension for zoom/pan/hover effects
    friction: number; // Spring friction for zoom/pan/hover effects
    mass: number; // Virtual mass for zoom/pan/hover effects
    minZoom: number; // Minimum zoom level (e.g., 0.5)
    maxZoom: number; // Maximum zoom level (e.g., 5)
    wheelSensitivity: number; // Mouse wheel zoom sensitivity (lower is more sensitive)
    inertiaDuration: number; // Duration of pan inertia (ms)
  }>;
}
```

-   `zoomPanEnabled`: Enables zooming (mouse wheel) and panning (middle-click or shift+left-click drag).
-   `physicsHoverEffects`: Enables smooth physics-based scaling/translation effects when hovering over data points (requires `getElementPhysicsOptions` to be configured in `legend` options for element-specific behavior, otherwise uses defaults).
-   `showTooltips`: Controls the display of the custom glass tooltip.
-   `tooltipStyle`: Selects the appearance of the tooltip.
-   `tooltipFollowCursor`: Makes the tooltip follow the mouse cursor instead of anchoring to the data point.
-   `physics`: Fine-tune the physics parameters for zoom, pan inertia, and hover effects:
    -   `tension`: Controls the stiffness of the spring. Higher values make it snappier. (Default: ~120-300 depending on context).
    -   `friction`: Controls the damping. Higher values stop the animation faster. (Default: ~14-30 depending on context).
    -   `mass`: Affects the 'weight' and overshoot of the animation. (Default: 1).
    -   `minZoom`/`maxZoom`: Sets zoom boundaries.
    -   `wheelSensitivity`: Adjusts how much the chart zooms per mouse wheel tick.
    -   `inertiaDuration`: How long the panning continues after releasing the mouse button.

**Example:**

```jsx
<GlassDataChart 
  // ... other props
  interaction={{
    zoomPanEnabled: true,
    physicsHoverEffects: true,
    physics: {
      tension: 400, // Make zoom/pan snappier
      friction: 20,
      minZoom: 0.8,
      maxZoom: 4
    }
  }}
  legend={{
    // Configure hover effects per element if desired
    getElementPhysicsOptions: (dataPoint, datasetIndex, dataIndex, chartType) => ({
        hoverEffect: { scale: 1.1, y: -5 }, // Custom hover effect
        tension: 500, // Element-specific physics
        friction: 25
    })
  }}
/>
``` 