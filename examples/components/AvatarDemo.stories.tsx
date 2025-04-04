import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../../src/components/Avatar';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Avatar component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // TODO: Add argTypes based on AvatarProps
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    // Add default props here if needed
    children: 'A', // Example: Initial letter
  },
}; 