import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '../../src/components/Box';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Box> = {
  title: 'Components/Box',
  component: Box,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Box component. A basic layout utility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // sx: { control: 'object' }, // Remove sx if not supported
    // TODO: Add more argTypes based on BoxProps (system props)
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    children: 'This is a Box',
    // Use basic style prop instead of sx
    style: {
      width: 200,
      height: 100,
      backgroundColor: '#6366F1', // Example color (replace with theme token if possible)
      color: 'white',
      padding: '16px', // Equivalent to p: 2
      borderRadius: '4px', // Equivalent to borderRadius: 1
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
}; 