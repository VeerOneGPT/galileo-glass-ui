# `useDraggableListPhysics` Hook

**Status:** Experimental (v1.0.14+)

**Note:** This hook provides basic physics-driven drag-and-drop reordering for lists. Keyboard navigation is not yet supported.

## Overview

The `useDraggableListPhysics` hook facilitates creating lists where items can be reordered by dragging, using the Galileo physics engine to animate the movement and settling of items.

## Import

```typescript
import { useDraggableListPhysics } from '@veerone/galileo-glass-ui/hooks';
// Import types if needed
import type { DraggableListOptions } from '@veerone/galileo-glass-ui/hooks'; // Or directly from types file
```

## Usage

1.  Create `React.RefObject` for each list item element.
2.  Call the hook, passing the array of refs and configuration.
3.  Apply the returned `style` and pointer handler props (`getPointerHandlers(index)`) to each list item element.

```typescript
import React, { useState, useMemo, createRef, useCallback } from 'react';
import styled from 'styled-components';
import { useDraggableListPhysics } from '@veerone/galileo-glass-ui/hooks';

const ListContainer = styled.div`
  position: relative; // Needed for absolute positioning of items
  width: 300px;
  height: 400px;
  overflow: auto; // If list exceeds container size
  border: 1px solid #ccc;
`;

const ListItem = styled.div`
  // Style MUST include position: absolute
  position: absolute;
  width: calc(100% - 20px); // Account for padding
  padding: 10px;
  margin: 5px 10px;
  background-color: lightblue;
  border: 1px solid blue;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;

  &:active {
    cursor: grabbing;
    box-shadow: 3px 3px 8px rgba(0,0,0,0.2);
  }
`;

const DragHandle = styled.span`
  display: inline-block;
  cursor: grab;
  margin-right: 8px;
  color: #555;
  &:active { cursor: grabbing; }
`;

const initialItems = [
  { id: 'a', text: 'Item A' },
  { id: 'b', text: 'Item B' },
  { id: 'c', text: 'Item C' },
  { id: 'd', text: 'Item D' },
];

function DraggableListDemo() {
  const [items, setItems] = useState(initialItems);

  // Create refs for each item based on the current items state
  const itemRefs = useMemo(() => 
    Array.from({ length: items.length }, () => createRef<HTMLDivElement>()), 
    [items.length]
  );

  // Callback to update state when physics reports order change
  const handleOrderChange = useCallback((newOrderIndices: number[]) => {
    console.log('New order indices:', newOrderIndices);
    setItems(currentItems => newOrderIndices.map(index => currentItems[index]));
  }, []);

  // Use the hook
  const { styles, getPointerHandlers } = useDraggableListPhysics({
    itemRefs: itemRefs, 
    onOrderChange: handleOrderChange, // Pass the callback
    spacing: 10, // Adjust visual spacing
    // Optional physics config:
    // stiffness: 200,
    // damping: 30,
  });

  return (
    <ListContainer>
      {items.map((item, index) => {
        const itemStyle = styles[index] || {}; // Get style for current index
        const handlers = getPointerHandlers(index); // Get handlers for current index

        return (
          <ListItem 
            key={item.id} 
            ref={itemRefs[index]} // Assign ref
            style={itemStyle}       // Apply physics-driven style
            {...handlers}           // Apply pointer handlers
          >
            {/* Apply handlers to handle too for easier grab target */}
            <DragHandle {...handlers}>⠿</DragHandle> 
            {item.text}
          </ListItem>
        );
      })}
    </ListContainer>
  );
}
```

## API

### Hook Signature

```typescript
useDraggableListPhysics = (options: DraggableListOptions): {
  styles: React.CSSProperties[];
  getPointerHandlers: (index: number) => {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
  };
};
```

### `DraggableListOptions`

(Import from `../hooks/useDraggableListPhysics.ts` or types file)

```typescript
interface DraggableListOptions {
  /** Array of React refs pointing to the DOM elements of the list items. */
  itemRefs: React.RefObject<HTMLElement>[]; 
  /** Optional ref to the container element for boundary checks (Not fully implemented yet). */
  containerRef?: React.RefObject<HTMLElement>;
  /** Axis of movement/reordering ('x' | 'y' | 'both'). Default: 'y'. */
  axis?: 'x' | 'y' | 'both'; 
  /** Spring stiffness for item movement. Default: 170. */
  stiffness?: number;
  /** Damping factor for item movement. Default: 26. */
  damping?: number; // Note: Internally uses dampingRatio based on stiffness/mass
  /** Mass of items. Default: 1. */
  mass?: number;
  /** Visual spacing between items in the layout calculation. Default: 10. */
  spacing?: number; 
  /** Callback fired when the item order changes after a drag operation. Receives an array of the new indices. */
  onOrderChange?: (newOrder: number[]) => void; 
}
```

### Return Value

- **`styles`**: An array of `React.CSSProperties` objects. Apply `styles[index]` to the list item element at that index. Contains `position: 'absolute'`, `transform`, `width`, `zIndex`, `willChange`.
- **`getPointerHandlers(index)`**: A function that returns an object containing pointer event handlers (`onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`). Spread these handlers onto the list item element (and optionally a dedicated drag handle). Ensure the correct `index` is passed.

## How it Works

1.  **Initialization:** Creates physics bodies for each element ref passed in `itemRefs`.
2.  **Target Positions:** Calculates target positions for each body based on a simple vertical stack layout, accounting for measured item heights and `spacing`.
3.  **Physics Loop:** Uses `requestAnimationFrame` to:
    *   Apply a gentle spring force pulling each item towards its target position (unless it's being dragged).
    *   Read the updated positions from the physics engine.
    *   Update the `styles` state with new `transform` values.
4.  **Pointer Events:**
    *   `onPointerDown`: Captures the pointer, stores the starting offset, and marks the item as dragging.
    *   `onPointerMove`: Calculates the pointer's target position and applies a strong spring force to the dragged item's physics body to follow the pointer. It also recalculates the target positions for *other* items based on the current visual order determined by physics positions, causing them to make space.
    *   `onPointerUp`: Releases the pointer capture, recalculates the final target positions for *all* items based on their dropped order, and calls `onOrderChange` with the new index order.
5.  **Styling:** The `styles` array is updated reactively, causing list items to re-render with new `transform` properties, animating them to their physics-driven positions.

## Important Notes

- **CSS Requirements:** The list container must have `position: relative` (or `absolute`/`fixed`). List items **must** have `position: absolute` applied either via the returned `style` object or in their base CSS.
- **Refs:** You must create and manage refs for each list item and pass them to the hook via `itemRefs`. The length of this array dictates the number of items the hook manages.
- **Layout:** The hook assumes a simple vertical stack layout for calculating target positions. It does not support complex grid or horizontal layouts directly for target setting (though `axis` can influence drag constraints).
- **Performance:** Performance may degrade with a very large number of items due to physics calculations and DOM updates.
- **Keyboard Accessibility:** Not implemented.
- **Touch Support:** Works with touch events via the pointer event handlers. 