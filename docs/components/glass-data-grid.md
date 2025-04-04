# GlassDataGrid

`GlassDataGrid` provides a sophisticated table component for displaying and interacting with tabular data. It features glass styling, smooth sorting animations, and optional physics-based row reordering.

## Import

```tsx
import { GlassDataGrid } from '@veerone/galileo-glass-ui';
import type { ColumnDefinition, SortState } from '@veerone/galileo-glass-ui'; // Import types
```

## Usage

```tsx
import React, { useState, useCallback } from 'react';
import { GlassDataGrid } from '@veerone/galileo-glass-ui';
import type { ColumnDefinition, SortState } from '@veerone/galileo-glass-ui';

// Define the data structure
interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  status: 'Active' | 'Inactive';
}

// Define column configurations
const columns: ColumnDefinition<UserData>[] = [
  { id: 'firstName', accessorKey: 'firstName', header: 'First Name', sortable: true },
  { id: 'lastName', accessorKey: 'lastName', header: 'Last Name', sortable: true },
  { id: 'age', accessorKey: 'age', header: 'Age', sortable: true, width: 80 },
  { 
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cellRenderer: (value) => (
      <span style={{ 
        color: value === 'Active' ? '#10B981' : '#EF4444',
        fontWeight: 'bold' 
      }}>
        {value}
      </span>
    )
  },
  { 
    id: 'fullName',
    accessorKey: 'firstName', // Not a direct key, uses renderer
    header: 'Full Name',
    cellRenderer: (_, row) => `${row.firstName} ${row.lastName}`
  }
];

function MyDataTable() {
  // Sample data state
  const [data, setData] = useState<UserData[]>([
    { id: 1, firstName: 'Elara', lastName: 'Vance', age: 28, status: 'Active' },
    { id: 2, firstName: 'Kael', lastName: 'Storm', age: 34, status: 'Inactive' },
    { id: 3, firstName: 'Lin', lastName: 'Chen', age: 22, status: 'Active' },
  ]);

  // Handle row reordering
  const handleRowOrderChange = useCallback((newData: UserData[]) => {
    console.log('New row order:', newData);
    setData(newData); // Update local state with the new order
  }, []);

  // Define initial sorting
  const initialSort: SortState = { columnId: 'age', direction: 'asc' };

  return (
    <GlassDataGrid<UserData>
      data={data}
      columns={columns}
      initialSort={initialSort}
      enableRowDragging={true} // Enable drag-and-drop
      onRowOrderChange={handleRowOrderChange}
      height="400px" // Set a height to enable scrolling
    />
  );
}
```

## ColumnDefinition Interface

Defines the configuration for each column in the grid.

```tsx
interface ColumnDefinition<TData extends Record<string, any>> {
  /** Unique identifier for the column. */
  id: string;
  
  /** The key in the row data object corresponding to this column. */
  accessorKey: keyof TData;
  
  /** The content displayed in the column header. */
  header: React.ReactNode;
  
  /** Optional function to customize cell rendering. Receives cell value and the full row data object. */
  cellRenderer?: (value: TData[keyof TData], row: TData) => React.ReactNode;
  
  /** Optional flag indicating if the column is sortable. Defaults to false. */
  sortable?: boolean;
  
  /** Optional minimum width for the column (e.g., 100, '10%'). */
  minWidth?: number | string;
  
  /** Optional maximum width for the column. */
  maxWidth?: number | string;
  
  /** Optional explicit width for the column. */
  width?: number | string;
}
```

## SortState Interface

Represents the current sorting state of the grid.

```tsx
interface SortState {
  /** The ID of the column currently being sorted. */
  columnId: string | null;
  
  /** The sort direction ('asc' or 'desc'). */
  direction: 'asc' | 'desc';
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | required | Array of data objects to display. `TData` should match the generic type. |
| `columns` | `ColumnDefinition<TData>[]` | required | Array of column definitions. |
| `initialSort` | `SortState` | `undefined` | Optional initial sorting state for the grid. |
| `enableRowDragging` | `boolean` | `false` | If true, enables physics-based row dragging. |
| `onRowOrderChange` | `(newData: TData[]) => void` | `undefined` | Callback fired after a row drag operation completes, providing the newly ordered data array. Required if `enableRowDragging` is true. |
| `className` | `string` | `undefined` | Additional CSS class for the root container. |
| `style` | `React.CSSProperties` | `undefined` | Additional inline styles for the root container. |
| `height` | `number \| string` | `undefined` | Sets a fixed height for the grid container, enabling vertical scrolling. |

## Physics-Based Animations

`GlassDataGrid` utilizes physics for:

1.  **Sorting Indicator Animation**: When a column is sorted, the indicator icon (▲/▼) animates smoothly using spring physics (`useVectorSpring`), providing a subtle visual cue.

2.  **Row Dragging**: When `enableRowDragging` is true, the component uses the `useDraggableListPhysics` hook. This enables:
    *   **Smooth Dragging**: Rows follow the cursor with physics-based interpolation.
    *   **Reordering Animation**: Other rows animate smoothly to their new positions when the dragged row moves over them.
    *   **Drop Animation**: The dragged row animates into its final position upon release.
    *   **Note**: This feature is currently pointer-based (mouse/touch) and does not support keyboard reordering.

## Features

- **Glass Styling**: The grid container uses the `GlassSurface` component for standard glass effects, integrating with the theme context.
- **Sorting**: Click sortable column headers (or use keyboard: Tab to focus, Enter/Space to activate) to toggle sort direction (asc -> desc -> none). Uses `useSortableData` hook internally.
- **Custom Cell Rendering**: Use the `cellRenderer` property in `ColumnDefinition` for custom content display.
- **Row Reordering**: Optional drag-and-drop row reordering with physics.
- **Scrolling**: If a `height` is provided, the table body becomes scrollable.

## Accessibility

- Sortable column headers are focusable and can be activated via keyboard (Enter/Space).
- `role="columnheader"` and `aria-sort` attributes are applied for screen reader compatibility.
- Row dragging handles have `role="button"` and `aria-grabbed` state, but full keyboard accessibility for reordering is not yet implemented.

## Best Practices

1.  **Provide Unique IDs**: Ensure data items have a unique `id` property if possible, although the component falls back to using array index for keys.
2.  **Memoization**: For large datasets or complex `cellRenderer` functions, consider memoizing data and columns to prevent unnecessary re-renders.
3.  **State Management**: When using `enableRowDragging`, ensure the `onRowOrderChange` callback updates your component's data state to reflect the new order.
4.  **Scrolling**: For large datasets, provide a `height` prop to enable scrolling and improve performance.

## Related Components

- `GlassSurface`: Used internally for the container styling.
- `useSortableData`: Hook used for sorting logic.
- `useDraggableListPhysics`: Hook used for row dragging physics.

```typescript
interface GlassDataGridProps {
  // data: RowDataType[];
  // columns: ColumnDefinitionType[];
  // onRowOrderChange?: (newData: RowDataType[]) => void;
  // ... other standard grid props
}
```

## Usage

*(TODO: Add usage example)*

```typescript
// Example placeholder
import { GlassDataGrid } from '@veerone/galileo-glass-ui';

function MyComponent() {
  // const data = ...
  // const columns = ...
  return (
    <GlassDataGrid
      // data={data}
      // columns={columns}
    />
  );
}
```

## Implementation Notes (Deferred)

*   Will likely use `usePhysicsLayout` or a similar hook internally.
*   Needs careful state management to sync grid data with physics simulation.
*   Requires integration with drag-and-drop libraries or custom implementation. 