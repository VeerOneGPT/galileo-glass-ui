# GlassDataGrid Component

## Overview

The `GlassDataGrid` component provides a way to display tabular data with integrated glass morphism styling, sorting, and optional physics-based row dragging. It uses custom internal logic for its features.

**Note:** This component does *not* use TanStack Table (React Table).

## Component Props (`GlassDataGridProps<TData>`)

| Prop                 | Type                                           | Required | Default     | Description                                                                                      |
|----------------------|------------------------------------------------|----------|-------------|--------------------------------------------------------------------------------------------------|
| `data`               | `TData[]`                                      | Yes      | -           | Array of data objects for the rows.                                                              |
| `columns`            | `ColumnDefinition<TData>[]`                    | Yes      | -           | Array of column definitions.                                                                     |
| `initialSort?`       | `SortState` (`{ columnId, direction }`)        | No       | `undefined` | Initial sorting configuration.                                                                   |
| `enableRowDragging?` | `boolean`                                      | No       | `false`     | Enable drag-and-drop row reordering.                                                             |
| `onRowOrderChange?`  | `(newData: TData[]) => void`                   | No       | `undefined` | Callback fired after rows are reordered via drag-and-drop, receiving the new data array order. |
| `className?`         | `string`                                       | No       | `undefined` | Additional CSS class for the main grid container.                                                |
| `style?`             | `React.CSSProperties`                          | No       | `undefined` | Inline styles for the main grid container.                                                       |
| `height?`            | `number \| string`                              | No       | `undefined` | Optional fixed height for the grid container (enables vertical scrolling).                     |

## Column Definition (`ColumnDefinition<TData>`)

Each object in the `columns` array defines a column:

```typescript
// Assumed internal type structure based on component usage
interface ColumnDefinition<TData = any> {
  id: string; // Unique identifier for the column
  header: React.ReactNode; // Content for the header cell
  accessorKey: keyof TData; // Key in TData object to access cell data
  cellRenderer?: (value: TData[keyof TData], row: TData) => React.ReactNode; // Optional custom cell rendering function
  sortable?: boolean; // Enable sorting for this column (default: false)
  // Properties like size, minSize, maxSize are NOT supported
}

interface YourRowDataType {
  id: string;
  firstName: string;
  status: 'active' | 'inactive';
  age: number;
}

const columns: ColumnDefinition<YourRowDataType>[] = [
  // Example: Basic column, sortable
  {
    id: 'firstName', // Unique ID
    header: 'First Name', // Header text
    accessorKey: 'firstName', // Key in YourRowDataType
    sortable: true, // Enable sorting
  },
  // Example: Column with custom cell rendering
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cellRenderer: (value, row) => ( // value is row.status
      <span style={{ color: value === 'active' ? 'lightgreen' : 'orange' }}>
        {value.toUpperCase()}
      </span>
    ),
    sortable: true,
  },
  // Example: Non-sortable column
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    sortable: false, // Explicitly disable sorting
  },
];
```

**`ColumnDefinition` Properties:**

*   `id: string`: **Required**. A unique string identifier for the column.
*   `header: React.ReactNode`: **Required**. Content displayed in the table header (TH). Can be a string or JSX.
*   `accessorKey: keyof TData`: **Required**. The key within your row data object (`TData`) whose value should be displayed in the cell by default.
*   `cellRenderer?: (value: TData[keyof TData], row: TData) => React.ReactNode`: Optional function to provide custom rendering for a cell. It receives the cell's value (from `accessorKey`) and the entire row data object. If omitted, the raw value is displayed.
*   `sortable?: boolean`: Set to `true` to allow users to sort the table by clicking this column's header. Defaults to `false`.

## Features

### Sorting

*   **Enabling:** Set `sortable: true` in the `ColumnDefinition` for columns you want to be sortable.
*   **Interaction:** Users can click the column header to cycle through ascending ('asc'), descending ('desc'), and unsorted states. Accessibility is supported via keyboard (Enter/Space on focused header).
*   **Initial Sort:** Use the `initialSort` prop on `<GlassDataGrid>` to set the default sort order when the component mounts (e.g., `initialSort={{ columnId: 'name', direction: 'asc' }}`).
*   **State:** Sorting state is managed internally by the component. There are no external `onSortChange` handlers.

### Row Dragging (Physics-based)

*   **Enabling:** Set `enableRowDragging={true}` on the `<GlassDataGrid>` component.
*   **Requirement:** You **must** also provide the `onRowOrderChange` callback prop.
*   **Functionality:** When enabled, a drag handle (`⠿`) appears in a new first column. Users can click and drag rows (or use keyboard navigation) to reorder them. The reordering uses physics animations via `useDraggableListPhysics`.
*   **Callback:** After the user finishes dragging and the animation settles, the `onRowOrderChange` function is called with a *new array* containing the original data items in their new visual order. You typically use this callback to update your application's state.

### Unsupported Features

The current version of `GlassDataGrid` **does not** include built-in support for:

*   Filtering
*   Pagination
*   Row Selection (checkboxes, etc.)
*   Column Resizing
*   Column Visibility Control
*   Grouping
*   Expandable Rows

## Basic Example

```jsx
import React, { useState, useCallback, useMemo } from 'react';
import { GlassDataGrid } from '@veerone/galileo-glass-ui';
// Define your data structure
interface UserData {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
}

// Define the column structure
// Note: ColumnDefinition is an assumed type, adjust if the library exports it
const columns: { id: string; header: string; accessorKey: keyof UserData; sortable?: boolean; cellRenderer?: (value: any, row: UserData) => React.ReactNode }[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
  { id: 'role', accessorKey: 'role', header: 'Role', sortable: true },
  { 
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    sortable: true,
    cellRenderer: (value) => (
      <span style={{ color: value === 'active' ? 'lightgreen' : 'orange' }}>
        {value}
      </span>
    )
  },
];

function MyGrid() {
  // Manage the data state
  const [userData, setUserData] = useState<UserData[]>([
    { id: 'u1', name: 'Alice', role: 'Admin', status: 'active' },
    { id: 'u2', name: 'Bob', role: 'User', status: 'inactive' },
    { id: 'u3', name: 'Charlie', role: 'User', status: 'active' },
  ]);

  // Callback for row dragging
  const handleRowOrderChange = useCallback((newDataOrder: UserData[]) => {
    console.log("New row order:", newDataOrder);
    setUserData(newDataOrder); // Update state with the new order
  }, []);

  return (
    <GlassDataGrid<UserData>
      data={userData}
      columns={columns}
      initialSort={{ columnId: 'name', direction: 'asc' }} // Start sorted by name
      enableRowDragging={true} // Turn on dragging
      onRowOrderChange={handleRowOrderChange} // Provide the callback
      height={400} // Example fixed height for scrolling
    />
  );
}

export default MyGrid;
```

**Disclaimer:** While this documentation is based on recent source code analysis, ensure you are using the correct version of the library (`@veerone/galileo-glass-ui`). The internal `ColumnDefinition` type might be exported or differ slightly in the published package.

## Recent Fixes (v1.0.22)

*   **Rendering Fix:** Resolved an issue (Bug #17) where the `GlassDataGrid` component might fail to render visually due to incorrect internal component usage. The component now reliably uses the appropriate underlying surface (`DimensionalGlass`) and renders the table structure (`<table>`, `<thead>`, etc.) as expected when provided with valid `data` and `columns` props.
