import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '../../src/components/Alert';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Alert component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: { control: 'select', options: ['error', 'warning', 'info', 'success'] },
    // TODO: Add more argTypes based on AlertProps
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    // Add default props here if needed
    children: 'This is an alert message.',
    severity: 'info',
  },
}; 