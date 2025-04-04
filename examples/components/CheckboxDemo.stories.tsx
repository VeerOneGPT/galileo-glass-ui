import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly
import { Checkbox } from '../../src/components/Checkbox';
// Cannot find FormControlLabel export
// import { FormControlLabel } from '../../src/components/Form';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Checkbox component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    color: { control: 'select', options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'default'] },
    size: { control: 'select', options: ['small', 'medium'] },
    // TODO: Add more argTypes based on CheckboxProps
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    // Add default props here if needed
    checked: true,
  },
};

// Remove story that depends on FormControlLabel
/*
export const WithLabel: Story = {
    render: (args) => (
        <FormControlLabel control={<Checkbox {...args} />} label="Checkbox Label" />
    ),
    args: {
        checked: false,
        color: 'secondary',
    }
};
*/

export const Disabled: Story = {
    args: {
        checked: false,
        disabled: true,
        label: 'Disabled Checkbox'
    },
    render: (args) => (
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <Checkbox {...args} />
        </div>
    )
};