import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Correct import path assuming it's exported from main index
import { GlassFocusRing, ThemeProvider, Button, TextField, Box } from '../../src';
import { AnimationFunction } from '../../src/animations/types'; // Import type

const meta: Meta<typeof GlassFocusRing> = {
  title: 'Utilities/GlassFocusRing',
  component: GlassFocusRing,
  tags: ['autodocs'],
  decorators: [(Story) => <ThemeProvider><Box p={4}><Story /></Box></ThemeProvider>],
  argTypes: {
    children: {
      control: false, // Not controllable via Storybook UI
      description: 'The focusable element to wrap.'
    },
    offset: {
      control: 'number',
      description: 'Offset (px) from the element bounds.',
      defaultValue: 2,
    },
    radiusAdjust: {
      control: 'number',
      description: 'Value (px) added to child radius.',
      defaultValue: 4,
    },
    color: {
      control: 'text',
      description: 'Theme color preset or CSS color string.',
      defaultValue: 'primary',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the focus ring effect.',
      defaultValue: false,
    },
    ringThickness: {
        control: 'number',
        description: 'Thickness (px) of the ring border.',
        defaultValue: 2,
    },
    pulseAnimation: {
        control: 'boolean',
        description: 'Enable the pulsing animation.',
        defaultValue: true,
    },
    animationDuration: {
        control: 'text',
        description: 'Custom pulse animation duration (e.g., \'1.5s\').',
    },
    animationEasing: {
        control: 'text',
        description: 'Custom pulse animation easing function.',
    },
  },
  parameters: {
    layout: 'centered',
    docs: {
        description: {
            component: 'Wraps a focusable element to provide a visual glass-style focus indicator.'
        }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>; // Use typeof meta for StoryObj type

// Base Render Function
const BaseRender = (args: any) => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        <p>Tab to the element below to see the focus ring:</p>
        <GlassFocusRing {...args}>
            <Button variant="contained">Focus Button</Button>
        </GlassFocusRing>
        <GlassFocusRing {...args}>
            <TextField label="Focus Field" variant="outlined" />
        </GlassFocusRing>
    </Box>
);

// Default Story (using BaseRender)
export const Default: Story = {
  render: BaseRender,
  args: {
    // Props are controlled via Storybook args table
  }
};

// Example with specific offset and radius
export const CustomOffsetRadius: Story = {
    render: BaseRender,
    args: {
      offset: 6,
      radiusAdjust: 0, 
      color: 'secondary',
      ringThickness: 3,
    },
    parameters: { docs: { description: { story: 'Demonstrates custom offset, radius adjustment, color, and thickness.' } } }
};

// Example with disabled animation
export const NoPulseAnimation: Story = {
    render: BaseRender,
    args: {
      pulseAnimation: false,
      color: 'success',
    },
    parameters: { docs: { description: { story: 'Focus ring without the pulsing animation.' } } }
};

// Example with custom animation timing
export const CustomAnimationTiming: Story = {
    render: BaseRender,
    args: {
        color: 'warning',
        animationDuration: '0.5s',
        animationEasing: 'linear',
    },
    parameters: { docs: { description: { story: 'Focus ring with customized animation duration and easing.' } } }
};

// Example showing disabled state
export const Disabled: Story = {
    render: BaseRender,
    args: {
        disabled: true,
    },
    parameters: { docs: { description: { story: 'Focus ring is disabled and will not appear on focus.' } } }
}; 