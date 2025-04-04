import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Adjust import paths
import { Table } from '../../src/components/Table/Table'; 
import {
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '../../src/components/Table'; // Import sub-components from here
import { Paper } from '../../src/components/Paper';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof Table> = {
  title: 'Components/Data Display/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    stickyHeader: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'medium'] },
    // Add other Table props
  },
  parameters: {
    layout: 'centered', // Adjust layout as needed
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

// --- Basic Table Example ---

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export const Basic: Story = {
  render: (args) => (
    <ThemeProvider>
        <Box style={{ width: '100%', maxWidth: 600 }}>
            <Paper style={{ width: '100%', marginBottom: '16px', overflow: 'auto' }}>
                <Table
                    {...args}
                    aria-label="simple table"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>Dessert (100g serving)</TableCell>
                            <TableCell align="right">Calories</TableCell>
                            <TableCell align="right">Fat&nbsp;(g)</TableCell>
                            <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                            <TableCell align="right">Protein&nbsp;(g)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.name}
                        >
                            <TableCell>
                                {row.name}
                            </TableCell>
                            <TableCell align="right">{row.calories}</TableCell>
                            <TableCell align="right">{row.fat}</TableCell>
                            <TableCell align="right">{row.carbs}</TableCell>
                            <TableCell align="right">{row.protein}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    </ThemeProvider>
  ),
  args: {
    size: 'medium',
  },
};

export const DensePadding: Story = {
    ...Basic,
    args: {
        ...Basic.args,
        size: 'small',
    },
};

export const StickyHeader: Story = {
    ...Basic,
    args: {
        ...Basic.args,
        stickyHeader: true,
    },
    decorators: [
        (Story) => (
            <ThemeProvider>
                <Box style={{ width: '100%', maxWidth: 600 }}>
                    <Paper style={{ width: '100%', overflow: 'auto', maxHeight: 200 }}>
                        <Story />
                    </Paper>
                </Box>
            </ThemeProvider>
        )
    ]
};
