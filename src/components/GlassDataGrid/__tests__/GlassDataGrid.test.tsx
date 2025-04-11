/**
 * GlassDataGrid Component Tests
 * 
 * Tests for the GlassDataGrid component to verify it renders the table structure and content correctly
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import 'jest-styled-components';
import { ThemeProvider } from '../../../theme';
import { GlassDataGrid } from '../GlassDataGrid';
import { ColumnDefinition } from '../types';
import { AnimationProvider } from '../../../contexts/AnimationContext';

// Mock the hooks used by the component
jest.mock('../../../hooks/useSortableData', () => ({
  useSortableData: jest.fn((data, initialSort) => ({
    sortedData: data,
    sorting: initialSort || null,
    handleSort: jest.fn()
  }))
}));

jest.mock('../../../hooks/useDraggableListPhysics', () => ({
  useDraggableListPhysics: jest.fn(() => ({
    styles: [],
    getHandlers: () => ({
      onPointerDown: jest.fn(),
      onKeyDown: jest.fn()
    }),
    isDragging: false,
    draggedIndex: null
  }))
}));

jest.mock('../../../animations/physics', () => ({
  useVectorSpring: jest.fn(() => ({
    value: { x: 0, y: 0, z: 0 },
    start: jest.fn(),
    stop: jest.fn(),
    isAnimating: false
  }))
}));

// Sample data for testing
const testColumns: ColumnDefinition<any>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
  { id: 'age', header: 'Age', accessorKey: 'age', sortable: true },
  { id: 'email', header: 'Email', accessorKey: 'email', sortable: false }
];

const testData = [
  { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 40, email: 'bob@example.com' }
];

// Custom renderer with required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <AnimationProvider>
        {ui}
      </AnimationProvider>
    </ThemeProvider>
  );
};

describe('GlassDataGrid Component', () => {
  test('renders correctly with basic data and columns', () => {
    renderWithProviders(
      <GlassDataGrid 
        data={testData} 
        columns={testColumns} 
      />
    );

    // Verify that the table headers are rendered
    expect(screen.getByRole('columnheader', { name: /Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Age/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Email/i })).toBeInTheDocument();

    // Verify that the data cells are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    
    // Verify the table structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Check that we have the correct number of rows (header row + data rows)
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(4); // 1 header row + 3 data rows
  });

  test('renders with custom cell renderer', () => {
    const columnsWithRenderer = [...testColumns];
    // Add a custom renderer for the age column
    columnsWithRenderer[1] = {
      ...columnsWithRenderer[1],
      cellRenderer: (value: any) => <span data-testid="custom-age">{value} years</span>
    };

    renderWithProviders(
      <GlassDataGrid 
        data={testData} 
        columns={columnsWithRenderer} 
      />
    );

    // Check that the custom renderer is used
    expect(screen.getAllByTestId('custom-age')).toHaveLength(3);
    expect(screen.getByText('30 years')).toBeInTheDocument();
    expect(screen.getByText('25 years')).toBeInTheDocument();
    expect(screen.getByText('40 years')).toBeInTheDocument();
  });

  test('renders with enableRowDragging prop', () => {
    renderWithProviders(
      <GlassDataGrid 
        data={testData} 
        columns={testColumns}
        enableRowDragging={true}
      />
    );

    // Check that drag handles are rendered
    const dragHandles = screen.getAllByRole('button', { name: /Drag row/i });
    expect(dragHandles).toHaveLength(3);
    
    // Check that there's an extra column for the drag handles
    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells).toHaveLength(4); // 3 regular columns + 1 for drag handle
  });

  test('renders with custom height', () => {
    renderWithProviders(
      <GlassDataGrid 
        data={testData} 
        columns={testColumns}
        height={300}
      />
    );

    // The DimensionalGlass component should have a height style
    const table = screen.getByRole('table');
    const container = table.closest('div'); // Get the DimensionalGlass container
    expect(container).toBeInTheDocument(); // Ensure container exists
    
    // Check inline style attribute now
    expect(container).toHaveStyle('height: 300px');
    expect(container).toHaveStyle('overflow-y: auto');
  });
  
  test('handles keyboard navigation for sorting', () => {
    const mockHandleSort = jest.fn();
    
    // Override the mock return value for this test
    require('../../../hooks/useSortableData').useSortableData.mockReturnValue({
      sortedData: testData,
      sorting: null,
      handleSort: mockHandleSort
    });
    
    renderWithProviders(
      <GlassDataGrid 
        data={testData} 
        columns={testColumns}
      />
    );
    
    // Get sortable column headers
    const nameHeader = screen.getByRole('columnheader', { name: /Name/i });
    
    // Verify that pressing Enter triggers sorting
    fireEvent.keyDown(nameHeader, { key: 'Enter' });
    expect(mockHandleSort).toHaveBeenCalledWith('name');
    
    // Verify that pressing Space triggers sorting
    mockHandleSort.mockClear();
    fireEvent.keyDown(nameHeader, { key: ' ' });
    expect(mockHandleSort).toHaveBeenCalledWith('name');
    
    // Verify that other keys don't trigger sorting
    mockHandleSort.mockClear();
    fireEvent.keyDown(nameHeader, { key: 'A' });
    expect(mockHandleSort).not.toHaveBeenCalled();
  });
  
  test('handles click on sortable columns', () => {
    const mockHandleSort = jest.fn();
    
    // Override the mock return value for this test
    require('../../../hooks/useSortableData').useSortableData.mockReturnValue({
      sortedData: testData,
      sorting: null,
      handleSort: mockHandleSort
    });
    
    renderWithProviders(
      <GlassDataGrid 
        data={testData} 
        columns={testColumns}
      />
    );
    
    // Get sortable column headers
    const nameHeader = screen.getByRole('columnheader', { name: /Name/i });
    const emailHeader = screen.getByRole('columnheader', { name: /Email/i });
    
    // Verify that clicking on a sortable column triggers sorting
    fireEvent.click(nameHeader);
    expect(mockHandleSort).toHaveBeenCalledWith('name');
    
    // Verify that clicking on a non-sortable column doesn't trigger sorting
    mockHandleSort.mockClear();
    fireEvent.click(emailHeader);
    expect(mockHandleSort).not.toHaveBeenCalled();
  });
}); 