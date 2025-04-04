import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GlassDataGrid } from '../../src/components/GlassDataGrid';
// Import correct types
import type { 
    GlassDataGridProps, 
    ColumnDefinition, 
    SortState 
} from '../../src/components/GlassDataGrid';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box'; // Import Box for centering/padding

const meta: Meta<typeof GlassDataGrid> = {
  title: 'Components/Data Display/GlassDataGrid', // Updated category
  component: GlassDataGrid,
  decorators: [
      (Story) => (
          <ThemeProvider>
              {/* Add padding/sizing for better centering */}
              <Box p={4} width="100%" maxWidth="800px" mx="auto">
                  <Story />
              </Box>
          </ThemeProvider>
      )
  ],
  parameters: {
    // layout: 'centered', // Remove centered if using Box wrapper
    docs: {
      description: {
        component: 'Data grid component with sorting and experimental row dragging via physics.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object', description: 'Array of data objects' },
    columns: { control: 'object', description: 'Array of column definitions' },
    initialSort: { control: 'object', description: 'Optional initial sort state ({ columnId, direction })' },
    enableRowDragging: { control: 'boolean', description: 'Enable physics-based row dragging' },
    onRowOrderChange: { action: 'rowOrderChanged', description: 'Callback when row order changes after dragging' },
    // physicsConfig removed as it's not a direct prop currently
    height: { control: 'text', description: 'Optional height for the grid container' }
  },
};

export default meta;

type CharacterData = {
  id: number;
  name: string;
  element: string;
  level: number;
  location: string;
};

// Use GlassDataGridProps with the correct generic type
type Story = StoryObj<GlassDataGridProps<CharacterData>>;

// Sample Data
const initialSampleData: CharacterData[] = [
  { id: 1, name: 'Elara', element: 'Fire', level: 15, location: 'Volcano Peak' },
  { id: 2, name: 'Kael', element: 'Water', level: 12, location: 'Coral Cave' },
  { id: 3, name: 'Terra', element: 'Earth', level: 18, location: 'Ancient Forest' },
  { id: 4, name: 'Zephyr', element: 'Air', level: 10, location: 'Sky Temple' },
  { id: 5, name: 'Ignis', element: 'Fire', level: 20, location: 'Magma Chamber' },
];

// Updated column definitions using ColumnDefinition type
const sampleColumns: ColumnDefinition<CharacterData>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
  { id: 'element', accessorKey: 'element', header: 'Element' },
  { id: 'level', accessorKey: 'level', header: 'Level', sortable: true },
  { id: 'location', accessorKey: 'location', header: 'Location' },
];

// Basic Story
export const Default: Story = {
  args: {
    data: initialSampleData.slice(0, 3),
    columns: sampleColumns,
  },
};

// Sortable Story (Now relies on clicking headers, sorting is enabled by default via component logic)
export const Sortable: Story = {
  args: {
    data: initialSampleData,
    columns: sampleColumns,
  },
};

// Initial Sort Story
export const InitialSort: Story = {
    args: {
        data: initialSampleData,
        columns: sampleColumns,
        initialSort: { columnId: 'level', direction: 'desc' },
    },
    parameters: {
        docs: {
            description: {
                story: 'Grid initially sorted by Level in descending order using `initialSort` prop.'
            }
        }
    }
};

// Draggable Story (Wrapper remains the same)
const DraggableGridStory = (args: GlassDataGridProps<CharacterData>) => {
    const [currentData, setCurrentData] = useState(args.data || initialSampleData);

    const handleOrderChange = useCallback((newData: CharacterData[]) => {
        console.log('Story received new data order:', newData);
        setCurrentData(newData); // Update local state
        args.onRowOrderChange?.(newData);
    }, [args]);

    return (
        <GlassDataGrid 
            {...args}
            data={currentData} 
            onRowOrderChange={handleOrderChange} 
        />
    );
};

export const Draggable: Story = {
    render: DraggableGridStory,
    args: {
        // data set by wrapper
        columns: sampleColumns,
        enableRowDragging: true,
    },
     parameters: {
        docs: {
        description: {
            story: 'Enable `enableRowDragging`. Drag rows by the handle (functionality might be partial). Data order updates locally via `onRowOrderChange`.',
        },
        },
    },
};

// Updated columns with corrected cellRenderer signature
const columnsWithRenderer: ColumnDefinition<CharacterData>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', sortable: true },
  {
    id: 'element',
    accessorKey: 'element',
    header: 'Element',
    // Corrected signature: value is the cell value, row is the full row data
    cellRenderer: (value, row) => (
      <span style={{ 
        padding: '2px 6px', 
        borderRadius: '4px', 
        background: 
          value === 'Fire' ? '#ffadad' :
          value === 'Water' ? '#a0c4ff' :
          value === 'Earth' ? '#b3e6b3' :
          value === 'Air' ? '#e6e6e6' : 'grey',
        color: '#333'
      }}>
        {value} {row.level > 15 ? '*' : ''} {/* Example using row data */}
      </span>
    ),
  },
  { id: 'level', accessorKey: 'level', header: 'Level', sortable: true },
  { id: 'location', accessorKey: 'location', header: 'Location' },
];

export const CustomRenderer: Story = {
  args: {
    data: initialSampleData,
    columns: columnsWithRenderer,
  },
}; 