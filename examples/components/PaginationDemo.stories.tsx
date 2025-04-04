import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Correct the import path
import { Pagination } from '../../src/components/Pagination'; // Assuming this path
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ padding: '20px' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    count: { control: 'number' },
    page: { control: 'number' }, // Consider making this stateful in render
    onChange: { action: 'onChange' },
    color: { 
      control: 'select', 
      options: ['primary', 'secondary', 'standard'] 
    },
    variant: { 
      control: 'select', 
      options: ['text', 'outlined'] 
    },
    shape: { 
      control: 'select', 
      options: ['circular', 'rounded'] 
    },
    size: { 
      control: 'select', 
      options: ['small', 'medium', 'large'] 
    },
    disabled: { control: 'boolean' },
    // Add other relevant props
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// Basic Pagination controlled by args
export const Default: Story = {
  args: {
    count: 10,
    page: 1,
    color: 'primary',
    variant: 'text',
    shape: 'circular',
  },
};

// Example with stateful control
const StatefulPagination = () => {
  const [page, setPage] = useState(1);
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    console.log(`Page changed to: ${value}`); // Log action
  };

  return (
    <Box>
      <Typography>Current Page: {page}</Typography>
      <Pagination 
        count={15} 
        page={page} 
        onChange={handleChange} 
        color="secondary" 
        variant="outlined"
      />
    </Box>
  );
};

export const Controlled: Story = {
  render: () => <StatefulPagination />,
}; 