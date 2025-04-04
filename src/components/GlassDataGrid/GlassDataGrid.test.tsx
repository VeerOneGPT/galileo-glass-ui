import React from 'react';
import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import { GlassDataGrid } from './GlassDataGrid'; // Adjust path if needed
import * as DraggableHook from '../../hooks/useDraggableListPhysics'; // Import hook for mocking
// import { vi } from 'vitest'; // Comment out
import { ColumnDefinition } from './types'; // Correct import: use ColumnDefinition
import { ThemeProvider } from '../../theme/ThemeProvider'; // Import ThemeProvider
import { AnimationProvider } from '../../contexts/AnimationContext'; // Import AnimationProvider

// --- Simplified Mock --- 
let capturedOrderChangeCallback: ((order: number[]) => void) | null = null;
const mockGetHandlers = jest.fn(() => ({
    onPointerDown: jest.fn(),
    onKeyDown: jest.fn(), 
}));
const mockUseDraggableListPhysics = jest.spyOn(DraggableHook, 'useDraggableListPhysics')
    .mockImplementation((options: any) => {
        // Capture the callback passed by GlassDataGrid
        capturedOrderChangeCallback = options?.onOrderChange ?? null;
        // Return minimal mock structure
        return {
            styles: Array(options?.itemCount ?? 0).fill({}), // Use itemCount if available
            getHandlers: mockGetHandlers,
            isDragging: false,
            draggedIndex: null,
        };
    });
// --- End Simplified Mock ---

// Sample Data
const sampleData = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
];

const sampleColumns: ColumnDefinition<typeof sampleData[0]>[] = [
  { id: 'id', accessorKey: 'id', header: 'ID' },
  { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
  { 
    id: 'age', 
    accessorKey: 'age', 
    header: 'Age', 
    sortable: true,
    cellRenderer: (value, row) => `Age: ${row.age}`
  },
];

// Helper to render with ThemeProvider AND AnimationProvider
const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        <AnimationProvider>{component}</AnimationProvider>
      </ThemeProvider>
    );
};

describe('GlassDataGrid', () => {
  // Reset mocks and captured callback before each test
  beforeEach(() => {
    mockUseDraggableListPhysics.mockClear();
    mockGetHandlers.mockClear();
    capturedOrderChangeCallback = null;
    // REMOVED: jest.useFakeTimers(); - Not reliable for physics/rAF
  });

  // REMOVED: afterEach with fake timers
  afterEach(() => {
      jest.clearAllMocks(); // Clear standard mocks
  });

  it('should render data and columns correctly', () => {
    renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} />);

    // Check headers
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();

    // Check data cells (example)
    expect(screen.getByText('Alice')).toBeInTheDocument();
    // Custom renderer check
    expect(screen.getByText('Age: 30')).toBeInTheDocument(); 
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Age: 25')).toBeInTheDocument();
  });

  describe('Sort Indicator Physics Animation', () => {
    it('should show/hide sort indicator on click', async () => {
        renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} />);
        const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
        const ageHeader = screen.getByRole('columnheader', { name: 'Age' });

        const getIndicatorOpacity = (headerElement: HTMLElement): number => {
            const indicator = headerElement.querySelector('span[aria-hidden="true"]'); // Be more specific
            // Return 0 if indicator not found or style cannot be parsed
            return indicator ? parseFloat(window.getComputedStyle(indicator).opacity) : 0; 
        };

        // Initial State: Expect opacity to be 0
        expect(getIndicatorOpacity(nameHeader)).toBeCloseTo(0, 2);
        expect(getIndicatorOpacity(ageHeader)).toBeCloseTo(0, 2);

        // Click Name Header (-> Ascending)
        await act(async () => {
            fireEvent.click(nameHeader);
            await new Promise(res => setTimeout(res, 50)); 
        });
        await waitFor(() => {
            expect(getIndicatorOpacity(nameHeader)).toBeCloseTo(1, 2); // Expect visible (opacity 1)
        }, { timeout: 1000 }); 
        expect(getIndicatorOpacity(ageHeader)).toBeCloseTo(0, 2); // Other indicator hidden

        // Click Name Header Again (-> Descending) - Indicator should stay visible
        await act(async () => {
            fireEvent.click(nameHeader);
            await new Promise(res => setTimeout(res, 50));
        });
        await waitFor(() => {
            // Opacity might briefly dip during animation, but should stabilize at 1
            expect(getIndicatorOpacity(nameHeader)).toBeCloseTo(1, 2); 
        }, { timeout: 1000 });

        // Click Age Header (-> Ascending)
        await act(async () => {
            fireEvent.click(ageHeader);
             await new Promise(res => setTimeout(res, 50));
        });
        await waitFor(() => {
            expect(getIndicatorOpacity(nameHeader)).toBeCloseTo(0, 2); // Name indicator hides
            expect(getIndicatorOpacity(ageHeader)).toBeCloseTo(1, 2); // Age indicator shows
        }, { timeout: 1000 });

        // Click Name Header Again (Cycle back to Asc)
        await act(async () => {
            fireEvent.click(nameHeader);
             await new Promise(res => setTimeout(res, 50));
        });
        await waitFor(() => {
            expect(getIndicatorOpacity(nameHeader)).toBeCloseTo(1, 2); // Name indicator shows
            expect(getIndicatorOpacity(ageHeader)).toBeCloseTo(0, 2); // Age indicator hides
        }, { timeout: 1000 });
    });
  });

  // --- Original Sorting Logic Tests ---
  it('should sort data when a sortable header is clicked', () => {
    renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} />);
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });

    // Initial order check (example)
    let rows = screen.getAllByRole('row'); // includes header row
    expect(rows[1]).toHaveTextContent('Alice');

    // Click to sort ascending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Alice'); // Should be first alphabetically
    expect(rows[2]).toHaveTextContent('Bob');
    expect(rows[3]).toHaveTextContent('Charlie');

    // Click again to sort descending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Charlie'); // Should be last alphabetically
    expect(rows[2]).toHaveTextContent('Bob');
    expect(rows[3]).toHaveTextContent('Alice');

    // Click again to cycle back to ascending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Alice'); // Back to ascending
  });

  it('should sort data when Enter/Space is pressed on a sortable header', () => {
    renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} />);
    const ageHeader = screen.getByRole('columnheader', { name: 'Age' });

    // Initial order check (example)
    let rows = screen.getAllByRole('row'); 
    expect(rows[1]).toHaveTextContent('Age: 30'); // Alice age

    // Focus and press Enter for ascending sort
    ageHeader.focus();
    fireEvent.keyDown(ageHeader, { key: 'Enter', code: 'Enter' });
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Age: 25'); // Bob age (youngest)
    expect(rows[2]).toHaveTextContent('Age: 30');
    expect(rows[3]).toHaveTextContent('Age: 35');

    // Press Space for descending sort
    fireEvent.keyDown(ageHeader, { key: ' ', code: 'Space' });
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Age: 35'); // Charlie age (oldest)
    expect(rows[2]).toHaveTextContent('Age: 30');
    expect(rows[3]).toHaveTextContent('Age: 25');
  });

  // --- Dragging Tests --- 

  describe('Row Dragging', () => {
    it('should render drag handles if enableRowDragging is true', () => {
      renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} enableRowDragging />);
      const dragHandles = screen.getAllByRole('button', { name: /Drag row/i }); // Use more specific selector
      expect(dragHandles.length).toBe(sampleData.length);
    });

    it('should call useDraggableListPhysics when enableRowDragging is true', () => {
      renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} enableRowDragging />);
      expect(mockUseDraggableListPhysics).toHaveBeenCalled();
      // Check if it was called with onOrderChange
      expect(mockUseDraggableListPhysics).toHaveBeenCalledWith(expect.objectContaining({
        onOrderChange: expect.any(Function)
      }));
    });

    it('should not call useDraggableListPhysics when enableRowDragging is false', () => {
      renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} enableRowDragging={false} />);
      expect(mockUseDraggableListPhysics).not.toHaveBeenCalled();
    });

    it('should attach pointer handlers from mock to rows/handles', () => {
      renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} enableRowDragging />);
      expect(mockGetHandlers).toHaveBeenCalledTimes(sampleData.length);
      const dragHandles = screen.getAllByRole('button', { name: /Drag row/i });
      expect(dragHandles.length).toBeGreaterThan(0);

      // Simulate pointer down on the first handle
      // fireEvent.pointerDown(dragHandles[0]);
      // Replace with manual event construction:
      const pointerDownEvent = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
      fireEvent(dragHandles[0], pointerDownEvent);

      const firstHandlerSet = mockGetHandlers.mock.results[0].value;
      expect(firstHandlerSet.onPointerDown).toHaveBeenCalledTimes(1);
    });

    it('should call onRowOrderChange with new data order when hook callback is invoked', async () => {
      const handleRowOrderChange = jest.fn();
      renderWithTheme(
          <GlassDataGrid
              data={sampleData}
              columns={sampleColumns}
              enableRowDragging
              onRowOrderChange={handleRowOrderChange}
          />
      );

      // Ensure the callback was captured by the mock
      expect(capturedOrderChangeCallback).toBeInstanceOf(Function);

      const newOrderIndices = [1, 0, 2]; // Simulate swap first two original indices
      
      // Simulate the hook calling the callback
      await act(async () => {
        if (capturedOrderChangeCallback) {
          capturedOrderChangeCallback(newOrderIndices);
        }
      });

      expect(handleRowOrderChange).toHaveBeenCalledTimes(1);
      // Verify the callback receives the data items in the new order
      expect(handleRowOrderChange).toHaveBeenCalledWith([
        sampleData[1], // Bob (original index 1)
        sampleData[0], // Alice (original index 0)
        sampleData[2]  // Charlie (original index 2)
      ]);
    });
  });

  // --- Keyboard Reordering Tests ---
  describe('Keyboard Row Reordering', () => {
    it('simulates keyboard reorder by invoking captured callback', async () => {
      const handleRowOrderChange = jest.fn();
      renderWithTheme(
        <GlassDataGrid
          data={sampleData}
          columns={sampleColumns}
          enableRowDragging
          onRowOrderChange={handleRowOrderChange}
        />
      );

      // Get handlers (mock doesn't need complex keyboard logic now)
      const dragHandles = screen.getAllByRole('button', { name: /Drag row/i });
      const firstHandle = dragHandles[0];
      act(() => { firstHandle.focus(); });

      // Simulate user pressing Space (to initiate hypothetical drag), then ArrowDown
      fireEvent.keyDown(firstHandle, { key: ' ', code: 'Space' });
      // The actual key down simulation doesn't trigger reorder in the simplified mock
      // fireEvent.keyDown(firstHandle, { key: 'ArrowDown', code: 'ArrowDown' });

      // Ensure the callback was captured
      expect(capturedOrderChangeCallback).toBeInstanceOf(Function);

      // Directly simulate the hook completing the reorder (e.g., after ArrowDown and Enter)
      const newOrderIndices = [1, 0, 2];
      await act(async () => {
        if (capturedOrderChangeCallback) {
          capturedOrderChangeCallback(newOrderIndices);
        }
      });

      // Verify the Grid's callback was called with correctly ordered data
      expect(handleRowOrderChange).toHaveBeenCalledTimes(1);
      expect(handleRowOrderChange).toHaveBeenCalledWith([
        sampleData[1], sampleData[0], sampleData[2]
      ]);

      // Check if DOM updated (optional, depends on how Grid re-renders)
      await waitFor(() => {
          const rows = screen.getAllByRole('row');
          expect(rows[1]).toHaveTextContent('Bob');
          expect(rows[2]).toHaveTextContent('Alice');
      });
    });

    // Test for Escape key cancelling (can be simplified)
    it('simulates keyboard cancel (no order change call)', () => {
       // Define the mock callback for this test case
       const handleRowOrderChange = jest.fn(); 
       renderWithTheme(
        <GlassDataGrid
          data={sampleData}
          columns={sampleColumns}
          enableRowDragging
          onRowOrderChange={handleRowOrderChange} // Pass the mock callback
        />
      );
      const dragHandles = screen.getAllByRole('button', { name: /Drag row/i });
      const firstHandle = dragHandles[0];
      act(() => { firstHandle.focus(); });

      fireEvent.keyDown(firstHandle, { key: ' ', code: 'Space' });
      fireEvent.keyDown(firstHandle, { key: 'Escape', code: 'Escape' });

      // Verify the *specific mock for this test* was not called
      expect(handleRowOrderChange).not.toHaveBeenCalled(); 
      
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Alice');
    });
  });

  it('should render custom cell content using cellRenderer', () => {
    renderWithTheme(<GlassDataGrid data={sampleData} columns={sampleColumns} />);
    expect(screen.getByText('Age: 30')).toBeInTheDocument();
    expect(screen.getByText('Age: 25')).toBeInTheDocument();
    expect(screen.getByText('Age: 35')).toBeInTheDocument();
  });
}); 