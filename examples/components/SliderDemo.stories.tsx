import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { Slider } from '../../src/components/Slider';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';

const meta: Meta<typeof Slider> = {
  title: 'Components/Inputs/Slider',
  component: Slider,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' }, // Expects a single number
    onChange: { action: 'onChange' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    marks: { control: 'boolean' }, // Expects boolean
    valueLabelDisplay: { control: 'select', options: ['on', 'auto', 'off'] },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'medium'] },
    // Add other Slider props
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

// Basic Continuous Slider
const ContinuousSlider = () => {
  const [value, setValue] = useState<number>(30);
  const handleChange = (newValue: number) => {
    setValue(newValue);
  };
  return (
    <ThemeProvider>
        <Box style={{ width: 300, padding: '20px' }}>
            <Typography gutterBottom>Volume</Typography>
            <Slider aria-label="Volume" value={value} onChange={handleChange} />
        </Box>
    </ThemeProvider>
  );
};
export const Continuous: Story = {
  render: () => <ContinuousSlider />,
};

// Discrete Slider with Steps and Marks
export const DiscreteSteps: Story = {
  args: {
    defaultValue: 37,
    step: 10,
    marks: true,
    min: 0,
    max: 100,
    valueLabelDisplay: 'auto',
  },
  decorators: [
      (Story) => (
        <ThemeProvider>
          <Box style={{ width: 300, padding: '20px' }}>
              <Typography gutterBottom>Temperature</Typography>
              <Story />
          </Box>
        </ThemeProvider>
      )
  ]
};

// Disabled Slider
export const Disabled: Story = {
    args: {
        defaultValue: 50,
        disabled: true,
    },
    decorators: [
        (Story) => (
          <ThemeProvider>
            <Box style={{ width: 300, padding: '20px' }}>
                <Typography gutterBottom>Disabled</Typography>
                <Story />
            </Box>
          </ThemeProvider>
        )
    ]
  }; 