import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly
import { Radio } from '../../src/components/Radio';
// Cannot resolve Form/RadioGroup components
// import { RadioGroup, FormControlLabel, FormControl, FormLabel } from '../../src/components/Form';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Radio component. Grouping/Label components not found.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    color: { control: 'select', options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'default'] },
    size: { control: 'select', options: ['small', 'medium'] },
    // TODO: Add more argTypes based on RadioProps
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

// TODO: Add more stories and controls

// Remove RadioButtonsGroup wrapper
/*
const RadioButtonsGroup = () => {
  // ... state and handler ...
  return (
    <FormControl>
      <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
      <RadioGroup ...>
        <FormControlLabel value="female" control={<Radio />} label="Female" />
        ...
      </RadioGroup>
    </FormControl>
  );
}
*/

// Show standalone Radio buttons
export const Default: Story = {
  args: {
    checked: false,
  }
};

export const Checked: Story = {
  args: {
    checked: true,
    color: 'primary',
  }
};

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
  }
}; 