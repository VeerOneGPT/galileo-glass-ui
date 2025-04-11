import React, { forwardRef, useRef, useEffect, useState, useMemo, createRef, useCallback, CSSProperties } from 'react';
import { GlassDataGridProps, ColumnDefinition, SortState } from './types';
import styled, { css } from 'styled-components';
import { useSortableData } from '../../hooks/useSortableData';
import { useDraggableListPhysics } from '../../hooks/useDraggableListPhysics';
import { useVectorSpring } from '../../animations/physics';
import DimensionalGlass from '../surfaces/DimensionalGlass';

// --- Styled Components using Theme --- 

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate; /* Needed for border-radius on cells/rows */
  border-spacing: 0;
  font-family: ${props => props.theme.typography?.body?.fontFamily || 'sans-serif'}; // Use theme hook instead?
  color: ${props => props.theme.colors?.text?.primary || '#000'}; // Use theme hook instead?
  // TODO: Apply Glass surface effect if desired
`;

// Sort Indicator with transition removed
const SortIndicator = styled.span`
  position: absolute;
  right: 8px;
  top: 50%;
  /* transform: translateY(-50%); // Initial transform set by style prop now */
  font-size: 0.8em;
  color: ${props => props.theme.colors?.text?.secondary || '#555'};
  /* REMOVED transition: transform 0.2s ease, opacity 0.2s ease; */
  opacity: 0; /* Start hidden, animation controls visibility */
  transform-origin: center center; /* Useful for scale/rotate transforms */
  will-change: transform, opacity; /* Explicitly add will-change here */
`;

const StyledTh = styled.th<{ $isSortable?: boolean; $sortDirection?: 'asc' | 'desc' | null }>`
  /* Use useStyleUtils hook in component for dynamic values */
  padding: 12px 32px 12px 16px; /* Adjust padding */
  text-align: left;
  font-weight: ${props => props.theme.typography?.h6?.fontWeight || '600'};
  font-size: ${props => props.theme.typography?.bodySmall?.fontSize || '0.875rem'};
  color: ${props => props.theme.colors?.text?.secondary || '#555'};
  border-bottom: 1px solid ${props => props.theme.colors?.divider || '#ccc'};
  background-color: ${props => props.theme.colors?.background?.level1 || '#f9f9f9'}; // Example background
  cursor: ${props => props.$isSortable ? 'pointer' : 'default'};
  user-select: ${props => props.$isSortable ? 'none' : 'auto'};
  position: relative; 
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.$isSortable ? (props.theme.colors?.action?.hover || '#f0f0f0') : 'transparent'};
  }
`;

const StyledTd = styled.td`
  /* Use useStyleUtils hook in component for dynamic values */
  padding: 12px 16px; 
  border-bottom: 1px solid ${props => props.theme.colors?.divider || '#eee'};
  font-size: ${props => props.theme.typography?.body?.fontSize || '1rem'};
  color: ${props => props.theme.colors?.text?.primary || '#000'};
`;

// Wrapper for applying Glass effect
const GlassWrapper = styled.div`
  /* Takes styles from GlassSurface component or createSurface function */
`;

// Placeholder Drag Handle
const DragHandle = styled.span<{ $isKeyboardDraggingActive?: boolean }>`
  cursor: grab;
  padding: 0 8px;
  color: ${props => props.theme.colors?.text?.disabled || '#aaa'};
  user-select: none;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  outline: none;

  &:focus {
    box-shadow: 0 0 0 2px ${props => props.theme.colors?.primary?.main + '80'}; 
    border-radius: 3px;
  }

  &:active {
    cursor: grabbing;
  }

  /* Style for when actively dragging via keyboard */
  ${props => props.$isKeyboardDraggingActive && css`
    background-color: ${props.theme.colors?.primary?.light + '40'};
    box-shadow: 0 0 0 2px ${props.theme.colors?.primary?.main}; 
  `}
`;

// Table Row with potential dragging styles
const StyledTr = styled.tr<{ $isPointerDragging?: boolean; $isKeyboardDraggingActive?: boolean }>`
  background-color: ${props => 
    props.$isKeyboardDraggingActive ? (props.theme.colors?.primary?.light + '20') : 
    props.$isPointerDragging ? (props.theme.colors?.action?.hover || '#f0f0f0') : 
    'transparent'};
  /* Add transition for background color, transform and shadow */
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  
  /* Apply transform and shadow when dragging */
  ${props => (props.$isPointerDragging || props.$isKeyboardDraggingActive) && css`
    position: relative; 
  `} 
`;

// Define the component using forwardRef
export const GlassDataGrid = forwardRef<HTMLDivElement, GlassDataGridProps<any>>(
  (props, ref) => {
    const { 
      data: initialData, 
      columns, 
      className, 
      style,
      height,
      initialSort,
      enableRowDragging = false,
      onRowOrderChange,
    } = props;
    const { sortedData, sorting, handleSort } = useSortableData(initialData, initialSort as SortState);
    
    // Create refs for each row element for the physics hook
    const rowRefs = useMemo(() => 
        Array.from({ length: sortedData.length }, () => createRef<HTMLTableRowElement>()), 
        [sortedData.length]
    );

    // Need state for the order controlled by the hook
    const [renderOrder, setRenderOrder] = useState<number[]>(() => 
        Array.from({ length: sortedData.length }, (_, i) => i));

    // Display data based on renderOrder
    const displayData = useMemo(() => 
        renderOrder.map(index => sortedData[index]), 
        [sortedData, renderOrder]
    );

    // Callback for the hook to update our renderOrder
    const handleOrderUpdate = useCallback((newOrderIndices: number[]) => {
        setRenderOrder(newOrderIndices);
        if (onRowOrderChange) {
            // Map original data based on the new order of *original* indices
            const originalDataInNewOrder = newOrderIndices.map(originalIndex => initialData[originalIndex]); 
            onRowOrderChange(originalDataInNewOrder);
        }
    }, [onRowOrderChange, initialData]);

    const { 
        styles: rowStyles, 
        getHandlers,
        isDragging: isAnyItemDragging,
        draggedIndex: draggedOriginalItemIndex
    } = useDraggableListPhysics({
      itemRefs: rowRefs,
      onOrderChange: handleOrderUpdate,
      spacing: 0,
      direction: 'vertical'
    });

    // --- Sort Indicator Animation using useVectorSpring --- 
    const sortIndicatorSpring = useVectorSpring({
        config: {
            tension: 350, // Use tension/friction for config
            friction: 25,
        },
        // initialValue: { x: 0, y: 0, z: 0 } // Optional initial value
    });
    // Map sorting state to target value for animation hook
    const sortTargetValue = useMemo(() => {
        if (!sorting) return 0; // Target 0 when not sorted
        return sorting.direction === 'asc' ? 1 : -1; // Target 1 for asc, -1 for desc
    }, [sorting]);
    // Trigger animation when target changes
    useEffect(() => {
        // Set the target Y value of the vector spring
        sortIndicatorSpring.start({ to: { x:0, y: sortTargetValue, z: 0 } });
    }, [sortTargetValue, sortIndicatorSpring]);
    // --- End Sort Indicator Animation ---

    const handleHeaderKeyDown = (
      event: React.KeyboardEvent<HTMLTableCellElement>,
      columnId: string,
      isSortable?: boolean
    ) => {
      if (isSortable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleSort(columnId);
      }
    };

    if (!displayData || !columns) return null;

    return (
      // Use DimensionalGlass component as the outer wrapper
      <DimensionalGlass 
        ref={ref} // Forward ref to the DimensionalGlass
        className={className} 
        style={{
            ...style, // Merge with existing style prop
            ...(height && { height: typeof height === 'number' ? `${height}px` : height, overflowY: 'auto' }),
            position: 'relative', // Keep other necessary styles
            perspective: '1000px',
        }}
        variant="standard" // Pass relevant props to DimensionalGlass
        elevation={1}
        css={`
            position: relative;
            perspective: 1000px; 
        `}
      >
        <StyledTable /* Removed className and ref */ >
          <thead>
            <tr>
              {/* Add placeholder header for drag handle if enabled */} 
              {enableRowDragging && <StyledTh style={{ width: '40px' }}></StyledTh>} 
              {columns.map((col) => {
                // Determine if this column is the one being sorted
                const isSortingThisColumn = sorting?.columnId === col.id;
                const currentSortDirection = isSortingThisColumn ? sorting.direction : null;
                const isSortable = col.sortable;

                // Calculate indicator style based on animation value (from spring.value.y)
                const animValue = sortIndicatorSpring.value.y; // Get the animated value from the Y dimension
                const indicatorOpacity = Math.min(1, Math.abs(animValue) * 1.5); // Fade in/out
                const indicatorTranslateYPercent = -50 + (animValue * -10); // Vertical movement
                const indicatorScale = 0.8 + Math.abs(animValue) * 0.2; // Scale effect
                const indicatorStyle: CSSProperties = {
                    opacity: indicatorOpacity,
                    transform: `translateY(${indicatorTranslateYPercent}%) scale(${indicatorScale})`,
                };

                return (
                  <StyledTh 
                    key={col.id} 
                    $isSortable={isSortable}
                    // Pass raw direction for potential styling, not animation
                    $sortDirection={currentSortDirection} 
                    onClick={() => isSortable && handleSort(col.id)}
                    tabIndex={isSortable ? 0 : -1} 
                    onKeyDown={(e) => handleHeaderKeyDown(e, col.id, isSortable)} 
                    role="columnheader"
                    aria-sort={ 
                      isSortable ? 
                      (currentSortDirection === 'asc' ? 'ascending' : currentSortDirection === 'desc' ? 'descending' : 'none') 
                      : undefined
                    }
                  >
                    {col.header}
                    <SortIndicator style={indicatorStyle} aria-hidden={!isSortingThisColumn} >
                        {/* Content changes based on TARGET direction */}
                        {sortTargetValue > 0 ? '▲' : '▼'}
                    </SortIndicator>
                  </StyledTh>
                );
              })}
            </tr>
          </thead>
          {/* Use a relative positioned div for tbody content if rows are absolute */}
          <tbody style={{ position: 'relative' }}>
            {displayData.map((row, displayIndex) => { 
              const originalIndex = renderOrder[displayIndex];
              if (originalIndex === undefined) return null;

              const rowStyle = rowStyles[originalIndex] || {}; 
              const handlers = enableRowDragging ? getHandlers(originalIndex) : { onPointerDown: ()=>{}, onKeyDown: ()=>{} }; 
              
              const isDraggingThisRow = isAnyItemDragging && draggedOriginalItemIndex === originalIndex;
              
              return (
                <StyledTr 
                  key={`row-${row.id ?? originalIndex}`}
                  ref={rowRefs[originalIndex]} 
                  style={rowStyle} 
                  $isPointerDragging={isDraggingThisRow} 
                  $isKeyboardDraggingActive={isDraggingThisRow} 
                >
                  {enableRowDragging && (
                    <StyledTd 
                      style={{ textAlign: 'center', cursor: 'default', width: '40px' }} 
                    > 
                      <DragHandle 
                        {...handlers} 
                        tabIndex={0} 
                        role="button" 
                        aria-label={`Drag row ${displayIndex + 1}`}
                        aria-grabbed={isDraggingThisRow}
                        $isKeyboardDraggingActive={isDraggingThisRow} 
                        data-drag-handle="true" 
                      >
                        ⠿
                      </DragHandle>
                    </StyledTd>
                  )}
                  {columns.map((col) => (
                    <StyledTd key={`${col.id}-${originalIndex}`}>
                      {col.cellRenderer
                        ? col.cellRenderer(row[col.accessorKey], row)
                        : row[col.accessorKey]}
                    </StyledTd>
                  ))}
                </StyledTr>
              );
            })}
          </tbody>
        </StyledTable>
      </DimensionalGlass>
    );
  }
);

// Add display name for better debugging
GlassDataGrid.displayName = 'GlassDataGrid';

// TODO: Implement sorting logic
// TODO: Implement draggable rows (stretch)
// TODO: Apply Glass styling and theme integration
// TODO: Add physics animations for sorting/dragging
// TODO: Implement useDraggableListPhysics hook
// TODO: Integrate draggable item props into <tr>
// TODO: Implement lifting effect (z-index, scale, shadow) during drag

// REMOVED Placeholder/Deferred implementation and default export 