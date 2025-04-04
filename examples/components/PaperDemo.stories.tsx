import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Paper } from '../../src/components/Paper';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';

const meta: Meta<typeof Paper> = {
  title: 'Components/Surfaces/Paper',
  component: Paper,
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
    elevation: { 
      control: { type: 'range', min: 0, max: 24, step: 1 }
    },
    square: { control: 'boolean' },
    variant: { 
      control: 'select', 
      options: ['elevation', 'outlined'] 
    },
    // Add other relevant props if Paper has them (e.g., component)
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Paper with default elevation
export const Default: Story = {
  args: {
    children: (
      <Box style={{ padding: '20px', minWidth: '100px', minHeight: '50px' }}>
        <Typography>Default Paper</Typography>
      </Box>
    ),
  },
};

// Paper with higher elevation
export const Elevated: Story = {
  args: {
    ...Default.args,
    elevation: 6,
    children: (
      <Box style={{ padding: '20px', minWidth: '100px', minHeight: '50px' }}>
        <Typography>Elevation 6</Typography>
      </Box>
    ),
  },
};

// Outlined variant
export const Outlined: Story = {
  args: {
    ...Default.args,
    variant: 'outlined',
    children: (
      <Box style={{ padding: '20px', minWidth: '100px', minHeight: '50px' }}>
        <Typography>Outlined Paper</Typography>
      </Box>
    ),
  },
}; 