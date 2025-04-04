import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import Chip and Avatar directly
import { Chip } from '../../src/components/Chip';
import { Avatar } from '../../src/components/Avatar';
// Import ThemeProvider from main index
import { ThemeProvider } from '../../src';

// Placeholder Icon
const FaceIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-4c-1.84 0-3.44-.97-4.31-2.41-.2-.34-.03-.77.32-1.01.38-.26.87-.21 1.19.12.56.56 1.34.9 2.8.9s2.24-.34 2.8-.9c.32-.33.81-.38 1.19-.12.35.24.52.67.32 1.01C15.44 15.03 13.84 16 12 16z"/>
    </svg>
);

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Chip component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['filled', 'outlined'] },
    color: { control: 'select', options: ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'] },
    size: { control: 'select', options: ['small', 'medium'] },
    disabled: { control: 'boolean' },
    // clickable: { control: 'boolean' }, // Remove if not supported
    // TODO: Add more argTypes based on ChipProps
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    label: 'Default Chip',
    color: 'primary',
  },
};

export const Clickable: Story = {
  args: {
    label: 'Clickable Chip',
    color: 'secondary',
    // clickable: true, // Remove if not supported
    onClick: () => alert('Chip clicked!'), // Keep onClick
  },
};

export const WithAvatar: Story = {
  args: {
    // avatar: <Avatar>M</Avatar>, // Remove avatar prop
    // How to show avatar/icon needs investigation (maybe as child?)
    label: 'Avatar Chip',
    variant: 'outlined',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <FaceIcon />,
    label: 'Icon Chip',
    color: 'success',
    variant: 'filled',
  },
};

export const Deletable: Story = {
  args: {
    label: 'Deletable Chip',
    color: 'error',
    onDelete: () => alert('Delete clicked!'),
  },
}; 