# `usePhysicsLayout` Hook

**Status:** Experimental (v1.0.14+)

**Note:** This hook is under development. Its API and behavior might change.

## Overview

The `usePhysicsLayout` hook provides a way to arrange a dynamic list of child elements using the Galileo physics engine. Instead of elements instantly appearing at their grid or stack positions, they animate smoothly towards their targets based on spring physics.

This is useful for creating dynamic lists, grids, or other arrangements where items are added, removed, or reordered, providing a more fluid and engaging user experience compared to static positioning.

## Import

```typescript
import { usePhysicsLayout, type PhysicsLayoutOptions, type PhysicsLayoutResult } from '@veerone/galileo-glass-ui/hooks';
// Import the engine hook if needed for other purposes
// import { useGalileoPhysicsEngine } from '@veerone/galileo-glass-ui/hooks';
// Note: usePhysicsEngine is an alias for useGalileoPhysicsEngine
```

## Usage

The hook takes the number of items and returns prop getters for the container and each item.

```typescript
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePhysicsLayout, PhysicsLayoutOptions } from '@veerone/galileo-glass-ui';

const Container = styled.div`
  position: relative;
  width: 500px;
  height: 400px;
  border: 1px solid #ccc;
  background: #f0f0f0;
  overflow: hidden; // Recommended
`;

const Item = styled.div`
  // Style MUST include position: absolute
  position: absolute;
  width: 60px;
  height: 60px;
  background-color: lightcoral;
  border: 1px solid darkred;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: default;
  user-select: none;
  will-change: transform, left, top; // Performance optimization
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
`;

function PhysicsLayoutDemo() {
  const [itemCount, setItemCount] = useState(9);
  const [layoutType, setLayoutType] = useState<PhysicsLayoutOptions['layoutType']>('grid');
  
  // Define layout options
  const options: PhysicsLayoutOptions = {
    layoutType: layoutType,
    gridOptions: { columns: 3, rowSpacing: 15, columnSpacing: 15 },
    stackOptions: { direction: 'vertical', spacing: 5 },
    // Example: Using the deprecated containerSize for initial placement hints
    // containerSize: { width: 500, height: 400 },
    physicsConfig: {
      stiffness: 0.18,
      damping: 0.85,
      mass: 1,
    }
  };

  // Call the hook with the item count and options
  const { getContainerProps, getItemProps } = usePhysicsLayout(itemCount, options);

  return (
    <div>
      <div>
        <label>Layout: </label>
        <select value={layoutType} onChange={(e) => setLayoutType(e.target.value as any)}>
          <option value="grid">Grid</option>
          <option value="stack">Stack</option>
          <option value="freeform">Freeform</option>
        </select>
        <button onClick={() => setItemCount(c => c + 1)} style={{ marginLeft: '10px' }}>Add Item</button>
        <button onClick={() => setItemCount(c => Math.max(0, c - 1))} style={{ marginLeft: '5px' }}>Remove Item</button>
      </div>

      {/* Apply container props */}
      <Container {...getContainerProps()}>
        {/* Render items based on itemCount */}
        {Array.from({ length: itemCount }).map((_, index) => (
          // Apply item props (including style and ref)
          <Item key={index} {...getItemProps(index)}>
            {index}
          </Item>
        ))}
      </Container>
    </div>
  );
}
```

## API

### Hook Signature

```typescript
usePhysicsLayout = (
  itemCount: number,
  options: PhysicsLayoutOptions
): PhysicsLayoutResult;
```

*   **`itemCount`**: The number of items to be laid out.
*   **`options`**: A `PhysicsLayoutOptions` object to configure the layout and physics.
*   **Returns**: A `PhysicsLayoutResult` object containing prop getter functions.

### `PhysicsLayoutOptions`

(Import from `../types/hooks.ts`)

```typescript
export interface PhysicsLayoutOptions {
  /** Type of layout to apply */
  layoutType: 'grid' | 'stack' | 'freeform';

  /** Physics configuration for the spring forces driving elements */
  physicsConfig?: {
    stiffness?: number; // Spring stiffness (Default: 0.15)
    damping?: number;   // Damping factor (Default: 0.8)
    mass?: number;      // Mass of each element (Default: 1)
    friction?: number;  // Movement friction (Default: 0.1)
  };

  /** Options specific to the 'grid' layout type */
  gridOptions?: {
    columns: number;       // Number of columns in the grid
    rowSpacing?: number;    // Vertical space between items (Default: 10)
    columnSpacing?: number; // Horizontal space between items (Default: 10)
  };

  /** Options specific to the 'stack' layout type */
  stackOptions?: {
    direction?: 'horizontal' | 'vertical'; // Stack direction (Default: 'vertical')
    spacing?: number;                     // Space between stacked items (Default: 5)
    offsetStep?: { x: number; y: number }; // Additional offset per item (Default: {x: 0, y: 0})
  };

  /** Options specific to the 'freeform' layout type */
  freeformOptions?: {
    gravity?: { x: number; y: number }; // Applied gravity force (Default: {x: 0, y: 0})
    repulsionStrength?: number;         // Strength of repulsion between items (Default: 5000)
    repulsionRadius?: number;           // Radius for repulsion force (Default: ~element size)
    centerAttraction?: number;        // Strength of attraction towards center (Default: 0)
  };

  /** Bounding box within which elements are constrained (if physics engine supports bounds) */
  bounds?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };

  /** Optional: Provide different physics config per item */
  itemPhysicsConfigs?: (
    | Partial<PhysicsLayoutOptions['physicsConfig']>
    | undefined
  )[];

  /** Initial positions for elements (optional, overrides default placement) */
  initialPositions?: { x: number; y: number }[];

  /** Optional ref to the container element (for bounds, etc.) */
  containerRef?: React.RefObject<HTMLElement>;
}
```

### `PhysicsLayoutResult`

```typescript
export interface PhysicsLayoutResult {
  /** 
   * Returns props to spread onto the container element. 
   * Sets relative positioning and dimensions if available.
   */
  getContainerProps: () => Record<string, any>; 
  /**
   * Returns props to spread onto each item element.
   * Includes the necessary `ref` callback and the dynamic `style` object.
   * @param index The index of the item.
   */
  getItemProps: (index: number) => { 
    ref: React.RefCallback<HTMLElement | null>;
    style: React.CSSProperties;
  };
}
```

## How it Works

1.  **Initialization:** The hook initializes an internal physics engine (`useGalileoPhysicsEngine` alias `usePhysicsEngine`) and creates physics bodies corresponding to `itemCount`.
2.  **Ref Measurement:** The `getItemProps` function provides a `ref` callback. When this is attached to a real DOM element by your rendering logic, the hook measures the element's size (`offsetWidth`, `offsetHeight`).
3.  **Target Calculation:** Based on the `layoutType`, measured element sizes, and layout options (`gridOptions`, `stackOptions`), the hook calculates a target position for each physics body.
4.  **Force Application:** On each animation frame, the hook applies spring forces (using `physicsConfig`) to pull each body towards its target. For `freeform`, repulsion and other forces are applied.
5.  **Simulation & Style Generation:** The physics engine updates body positions. The hook reads these positions and generates `style` objects (with `position: absolute`, `left`, `top`, `transform`) for each item.
6.  **Prop Getters:** The `getItemProps(index)` function returns the specific `ref` callback and the latest calculated `style` object for the item at that index.

## Layout Types

*   **`grid`**: Arranges items in a grid based on `gridOptions.columns` and spacing.
*   **`stack`**: Stacks items horizontally or vertically based on `stackOptions`.
*   **`freeform`**: Items are positioned primarily by physics forces (repulsion, gravity, attraction) defined in `freeformOptions`. No specific target positions are calculated.

## Performance

Performance depends on `itemCount`. Using `will-change: transform, left, top;` on items is recommended.

## Current Limitations & TODOs

*   The underlying physics bodies currently use placeholder sizes initially and rely on the `ref` callback to get actual dimensions. This might cause a brief visual jump on initial render.
*   Updating the physics body shape/size after initial creation is not yet fully supported by the core engine API, so size changes after initial measurement might not affect physics interactions perfectly.
*   `freeform` layout currently only applies repulsion; more sophisticated behaviors could be added.
*   No built-in handling for drag-and-drop reordering yet.
*   Container padding/origin is not automatically accounted for in target position calculations. 