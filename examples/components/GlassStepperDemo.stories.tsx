import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GlassStepper } from '../../src'; // Import from main index
import { ThemeProvider } from '../../src';
import { Icon } from '../../src/components/Icon'; // Direct import for Icon

const meta: Meta<typeof GlassStepper> = {
  title: 'Components/GlassStepper',
  component: GlassStepper,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays progress through a sequence of steps.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activeStep: { control: 'number', description: 'Index of the active step' },
    orientation: { control: 'radio', options: ['horizontal', 'vertical'], description: 'Stepper orientation' },
    steps: { control: 'object', description: 'Array of step data' },
  },
};

export default meta;
type Story = StoryObj<typeof GlassStepper>;

const sampleSteps = [
  { id: '1', label: 'Select Campaign Settings', icon: <Icon>settings</Icon> },
  { id: '2', label: 'Create Ad Group' },
  { id: '3', label: 'Create Ad' },
  { id: '4', label: 'Confirmation', icon: <Icon>check_circle</Icon> },
];

export const Horizontal: Story = {
  args: {
    steps: sampleSteps,
    activeStep: 1,
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    steps: sampleSteps,
    activeStep: 2,
    orientation: 'vertical',
  },
};

export const Completed: Story = {
  args: {
    steps: sampleSteps,
    activeStep: 4, // Index beyond last step indicates completion
    orientation: 'horizontal',
  },
}; 