import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Revert to relative paths
import { Progress, GlassProgress } from '../../src/components/Progress';
// Import Galileo ThemeProvider and Box
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Replace with your actual theme setup if different
// Remove MUI theme creation
// const theme = createTheme({}); 

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  decorators: [
    (Story) => (
        // Use Galileo ThemeProvider
        <ThemeProvider>
          {/* Use style prop instead of sx for Galileo Box */}
          <Box style={{ width: '100%', padding: 16 }}> 
            <Story />
          </Box>
        </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['determinate', 'indeterminate', 'buffer', 'query'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      if: { arg: 'variant', neq: 'indeterminate' }, // Show unless indeterminate or query
    },
    // Removed valueBuffer from argTypes to fix lint error
    // It might be conditionally available based on variant; refine later
    color: {
       control: 'select',
       options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'inherit'],
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultProgress: Story = {
  name: 'Standard Progress',
  args: {
    variant: 'determinate',
    value: 50,
    color: 'primary',
  },
};

export const GlassProgressStory: Story = {
    name: 'Glass Progress',
    render: (args) => <GlassProgress {...args} />,
    args: {
        variant: 'indeterminate',
        color: 'primary',
    },
};

// Add stories for buffer, query, different colors etc. 