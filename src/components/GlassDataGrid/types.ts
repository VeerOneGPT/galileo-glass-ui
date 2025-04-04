import React from 'react';

/**
 * Defines the structure for a column in the GlassDataGrid.
 * @template TData The type of the row data object.
 */
export interface ColumnDefinition<TData extends Record<string, any>> {
  /** Unique identifier for the column. */
  id: string;
  /** The key in the row data object corresponding to this column. */
  accessorKey: keyof TData;
  /** The text displayed in the column header. */
  header: React.ReactNode;
  /** Optional function to customize cell rendering. Receives cell value and row data. */
  cellRenderer?: (value: TData[keyof TData], row: TData) => React.ReactNode;
  /** Optional flag indicating if the column is sortable. Defaults to true. */
  sortable?: boolean;
  /** Optional minimum width for the column. */
  minWidth?: number | string;
  /** Optional maximum width for the column. */
  maxWidth?: number | string;
  /** Optional explicit width for the column. */
  width?: number | string;
}

/**
 * Represents the current sorting state of the grid.
 */
export interface SortState {
  /** The ID of the column currently being sorted. */
  columnId: string | null;
  /** The sort direction ('asc' or 'desc'). */
  direction: 'asc' | 'desc';
}

/** Configuration for physics behavior (e.g., dragging). */
interface PhysicsConfig {
    stiffness?: number;
    damping?: number;
    mass?: number;
    // Add other relevant physics parameters as needed
}

/**
 * Props for the GlassDataGrid component.
 * @template TData The type of the row data object.
 */
export interface GlassDataGridProps<TData extends Record<string, any>> {
  /** Array of data objects to display in the grid rows. */
  data: TData[];
  /** Array of column definitions specifying grid structure and rendering. */
  columns: ColumnDefinition<TData>[];
  /** Optional initial sorting state. */
  initialSort?: SortState;
  /** Optional flag to enable row dragging/reordering. Defaults to false. */
  enableRowDragging?: boolean;
  /** 
   * Optional callback function triggered when rows are reordered via dragging.
   * Receives the updated data array. 
   */
  onRowOrderChange?: (newData: TData[]) => void;
  /** Optional CSS class name. */
  className?: string;
  /** Optional inline styles. */
  style?: React.CSSProperties;
  /** Optional height for the grid container. */
  height?: number | string;
  // Add other grid-specific props as needed (e.g., pagination, filtering config)
} 