import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Correct import path
import { Divider } from '../../src/components/Divider'; // Assuming path
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';
import { Stack } from '../../src/components/Stack'; // Useful for demonstrating vertical dividers

const meta: Meta<typeof Divider> = {
  title: 'Components/Layout/Divider',
  component: Divider,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ padding: '20px', width: '300px' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    orientation: { 
      control: 'select', 
      options: ['horizontal', 'vertical'] 
    },
    variant: { 
      control: 'select', 
      options: ['fullWidth', 'inset', 'middle'] 
    },
    textAlign: { // Only applies when rendering children
      control: 'select', 
      options: ['center', 'left', 'right'] 
    },
    // Add other Divider props (e.g., light, component)
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

// Horizontal Divider (default)
export const Horizontal: Story = {
  render: (args) => (
    <Box>
      <Typography>Top Content</Typography>
      <Divider {...args} />
      <Typography>Bottom Content</Typography>
    </Box>
  ),
  args: {
    variant: 'fullWidth',
  },
};

// Horizontal Divider with Text
export const HorizontalWithText: Story = {
  args: {
    ...Horizontal.args,
    children: 'CENTER TEXT',
    textAlign: 'center',
  },
};

// Vertical Divider
export const Vertical: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} style={{ height: '50px' }}>
      <Typography>Left</Typography>
      <Divider {...args} />
      <Typography>Right</Typography>
    </Stack>
  ),
  args: {
    orientation: 'vertical',
    variant: 'fullWidth',
    flexItem: true, // Often needed for vertical alignment
  },
}; 