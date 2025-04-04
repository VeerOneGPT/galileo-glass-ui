import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../../src/components/Switch';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof Switch> = {
  title: 'Components/Inputs/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    onChange: { action: 'onChange' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'medium'] },
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'] },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

// Basic Controlled Switch
const BasicSwitch = () => {
  const [checked, setChecked] = useState(true);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  return (
    <ThemeProvider>
        <Switch
            checked={checked}
            onChange={handleChange}
            aria-label='controlled'
        />
    </ThemeProvider>
  );
};
export const Basic: Story = {
  render: () => <BasicSwitch />,
};

// Disabled Switch Example
export const Disabled: Story = {
    args: {
        checked: true,
        disabled: true,
    },
    decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

// Different Sizes
export const Sizes: Story = {
    render: () => (
        <ThemeProvider>
            <Box>
                <Switch defaultChecked size="small" />
                <Switch defaultChecked />
            </Box>
        </ThemeProvider>
      ),
};

// Different Colors
export const Colors: Story = {
    render: () => (
        <ThemeProvider>
            <Box>
                <Switch defaultChecked color="primary" />
                <Switch defaultChecked color="secondary" />
                <Switch defaultChecked color="success" />
                <Switch defaultChecked color="error" />
                <Switch defaultChecked color="warning" />
                <Switch defaultChecked color="info" />
            </Box>
        </ThemeProvider>
    ),
};