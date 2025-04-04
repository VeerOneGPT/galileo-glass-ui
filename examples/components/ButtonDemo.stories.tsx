import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, ThemeProvider } from '../../src';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Button component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'outlined', 'contained'] },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    // TODO: Add more argTypes based on ButtonProps
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    // Add default props here if needed
    children: 'Click Me',
    variant: 'contained',
    color: 'primary',
  },
}; 