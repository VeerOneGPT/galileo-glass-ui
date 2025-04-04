import React, { useState, useMemo, useCallback } from 'react';

/** Type definition for sorting state. */
export interface SortingState {
  columnId: string | null;
  direction: 'asc' | 'desc';
}

/** Hook to manage sortable data. */
export const useSortableData = <TData,>(
  initialData: TData[],
  initialSorting?: SortingState
) => {
  const [sorting, setSorting] = useState<SortingState | null>(initialSorting ?? null);

  const sortedData = useMemo(() => {
    if (!sorting || !sorting.columnId) {
      return initialData; // Return original data if no sorting applied
    }

    const { columnId, direction } = sorting;

    // Create a copy before sorting to avoid mutating original data
    return [...initialData].sort((a, b) => {
      const valA = (a as any)[columnId]; // Basic accessor, might need improvement for nested keys
      const valB = (b as any)[columnId];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else {
        // Fallback for other types (boolean, etc.) - potentially stringify
        comparison = String(valA).localeCompare(String(valB));
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }, [initialData, sorting]);

  const handleSort = useCallback((columnId: string) => {
    setSorting(prevSorting => {
      if (prevSorting?.columnId === columnId) {
        // Cycle direction: asc -> desc -> none
        if (prevSorting.direction === 'asc') {
          return { columnId, direction: 'desc' };
        } else {
          return null; // Clear sorting
        }
      } else {
        // Start new sort: asc
        return { columnId, direction: 'asc' };
      }
    });
  }, []);

  return { sortedData, sorting, handleSort };
}; 