# GlassDataGrid Component

## Overview

The `GlassDataGrid` component provides a way to display tabular data with integrated glass morphism styling, sorting, and optional physics-based row dragging. It uses custom internal logic for its features.

**Note:** This component does *not* use TanStack Table (React Table).

## Core Props

| Prop                 | Type                                          | Required | Default     | Description                                                                                   |
| :------------------- | :-------------------------------------------- | :------- | :---------- | :-------------------------------------------------------------------------------------------- |
| `data`               | `TData[]`                                     | Yes      | -           | An array of data objects to display in the grid.                                            |
| `columns`            | `ColumnDefinition<TData>[]`                   | Yes      | -           | An array of column definition objects (see below).                                            |
| `initialSort?`       | `{ columnId: string, direction: 'asc' \| 'desc' }` | No       | `undefined` | Defines the initial sort state of the grid.                                                 |
| `enableRowDragging?` | `boolean`                                     | No       | `false`     | Enables physics-based row dragging functionality. Requires `onRowOrderChange`.              |
| `onRowOrderChange?`  | `(newOrder: TData[]) => void`                 | No       | `undefined` | Callback function triggered after a row drag operation, receiving the full data in its new order. |
| `getRowId?`          | `(row: TData) => string \| number`            | No       | `undefined` | Function to get a unique ID for each row, used for React keys if `row.id` is not present.    |
| `height?`            | `string \| number`                            | No       | `undefined` | Sets a fixed height for the grid container, enabling vertical scrolling if content overflows. |
| `className?`         | `string`                                      | No       | `""`        | Optional CSS class name for the main grid wrapper (`GlassSurface`).                           |
| `style?`             | `React.CSSProperties`                         | No       | `undefined` | Optional inline styles for the main grid wrapper (`GlassSurface`).                            |

*(Replace `TData` with the actual type/interface defining the shape of your row data objects)*

## Column Definition (`columns` prop)

The `columns` array takes objects defining each column's display and behavior.

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
    <GlassDataGrid
      data={userData}
      columns={columns}
      initialSort={{ columnId: 'name', direction: 'asc' }} // Start sorted by name
      enableRowDragging={true} // Turn on dragging
      onRowOrderChange={handleRowOrderChange} // Provide the callback
      getRowId={row => row.id} // Important for stable dragging/keys
      height={400} // Example fixed height for scrolling
    />
  );
}

export default MyGrid;
```

**Disclaimer:** While this documentation is based on recent source code analysis, ensure you are using the correct version of the library (`@veerone/galileo-glass-ui`). The internal `ColumnDefinition` type might be exported or differ slightly in the published package.
