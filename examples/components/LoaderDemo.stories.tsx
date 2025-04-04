import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Loader } from '../../src/components/Loader';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof Loader> = {
  title: 'Components/Feedback/Loader',
  component: Loader,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
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
    size: { control: 'number' },
    thickness: { control: 'number' },
    color: { 
      control: 'select', 
      options: ['primary', 'secondary', 'inherit', 'error', 'info', 'success', 'warning'] 
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 40,
    thickness: 3.6,
    color: 'primary',
  },
};

export const SecondaryColor: Story = {
  args: {
    ...Default.args,
    color: 'secondary',
  },
}; 