import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly
import { TextField } from '../../src/components/TextField';
// Import from main index
import { ThemeProvider } from '../../src';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  decorators: [(Story) => <ThemeProvider><div style={{ padding: '20px', width: '300px' }}><Story /></div></ThemeProvider>],
  parameters: {
    // layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the TextField component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['filled', 'outlined', 'standard'] },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    required: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    // multiline: { control: 'boolean' }, // Prop removed
    // rows: { control: 'number' }, // Prop removed
    type: { control: 'text' },
    helperText: { control: 'text' },
    // TODO: Add more argTypes based on TextFieldProps
  },
};

export default meta;
type Story = StoryObj<typeof TextField>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    label: 'Standard Label',
    variant: 'standard',
  },
};

export const Outlined: Story = {
    args: {
      label: 'Outlined Label',
      variant: 'outlined',
    },
  };

export const FilledWithError: Story = {
    args: {
      label: 'Filled Error',
      variant: 'filled',
      error: true,
      defaultValue: 'Incorrect entry',
      helperText: 'This is an error message',
    },
  }; 
