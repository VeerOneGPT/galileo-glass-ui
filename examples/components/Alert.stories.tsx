import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '../../src/components/Alert'; // Corrected path
import { ThemeProvider } from '../../src'; // Assuming ThemeProvider is exported from src index
// import { AlertTitle } from './AlertTitle'; // Removed - Component not found

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info', 'success'],
    },
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined'],
    },
    children: { control: 'text' },
    // Add other relevant props like 'action', 'icon', etc.
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// Basic Render Check Story
export const BasicInfo: Story = {
  name: 'Basic Info Alert',
  args: {
    severity: 'info',
    children: 'This is an informational message.',
  },
};

export const WithTitle: Story = {
  name: 'Alert with Title (Success)',
  args: {
    severity: 'success',
    children: 'Success: The operation completed successfully!', // Include title in children
  },
  // Removed render function using AlertTitle
  // render: (args) => (
  //   <Alert {...args}>
  //     <AlertTitle>Success</AlertTitle>
  //     {args.children} 
  //   </Alert>
  // ),
};

export const FilledWarning: Story = {
  name: 'Filled Warning Alert',
  args: {
    severity: 'warning',
    variant: 'filled',
    children: 'Please check the configuration.',
  },
};

export const OutlinedError: Story = {
  name: 'Outlined Error Alert',
  args: {
    severity: 'error',
    variant: 'outlined',
    children: 'An unexpected error occurred.',
  },
}; 