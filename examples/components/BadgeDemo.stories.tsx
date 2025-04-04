import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly
import { Badge } from '../../src/components/Badge';
// Import Box directly
import { Box } from '../../src/components/Box';
// Import ThemeProvider from main index
import { ThemeProvider } from '../../src';

// Placeholder Icon
const MailIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
);

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Badge component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: ['primary', 'secondary', 'error', 'warning', 'info', 'success', 'default'] },
    variant: { control: 'select', options: ['standard', 'dot'] },
    // TODO: Add more argTypes based on BadgeProps
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    children: <MailIcon />,
    color: 'primary',
  },
};

export const DotBadge: Story = {
  args: {
    children: <MailIcon />,
    variant: 'dot',
    color: 'secondary',
  },
}; 