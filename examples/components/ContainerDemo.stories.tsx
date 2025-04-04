import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly
import { Container } from '../../src/components/Container';
import { Box } from '../../src/components/Box';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Container> = {
  title: 'Components/Container',
  component: Container,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'fullscreen', // Container often needs full width
    docs: {
      description: {
        component: 'Placeholder story for the Container component. Centers content horizontally.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxWidth: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', false] },
    fixed: { control: 'boolean' },
    disableGutters: { control: 'boolean' },
    // TODO: Add more argTypes based on ContainerProps
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    children: (
      <Box style={{ 
          backgroundColor: '#cfe8fc', // Use standard CSS
          height: '50vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
        Content inside Container
      </Box>
    ),
    maxWidth: 'md', // Example max width
  },
};

export const FixedWidth: Story = {
    args: {
      ...Default.args,
      fixed: true,
      maxWidth: 'sm',
    },
}; 