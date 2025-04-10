import React, { useRef, useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Correct import path assuming it's exported from main index
import { GlassFocusRing } from '../../src/components/GlassFocusRing'; 
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
// Import Galileo components instead of MUI
import { Button } from '../../src/components/Button'; 
import { TextField } from '../../src/components/TextField'; 

// Infer props type for ArgTypes
type GlassFocusRingProps = React.ComponentProps<typeof GlassFocusRing>;

const meta: Meta<typeof GlassFocusRing> = {
  title: 'Utilities/GlassFocusRing',
  component: GlassFocusRing,
  tags: ['autodocs'],
  decorators: [(Story) => <ThemeProvider><Box style={{ padding: '2rem' }}><Story /></Box></ThemeProvider>],
  argTypes: {
    children: {
      control: false,
      description: 'The focusable element to wrap.'
    },
    offset: {
      control: 'number',
      description: 'Offset (px) from the element bounds.',
      defaultValue: 2,
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
    thickness: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
        description: 'Thickness preset of the focus ring (sm, md, lg).',
        defaultValue: 'md',
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
type Story = StoryObj<typeof meta>;

// Base Render Function
const BaseRender = (args: any) => (
    <Box style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: "1rem" 
    }}> 
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
    color: 'secondary',
    thickness: 'lg',
  },
  parameters: { docs: { description: { story: 'Demonstrates custom offset, radius adjustment, color, and thickness.' } } }
};

// Example with disabled animation
export const NoPulseAnimation: Story = {
    render: BaseRender,
    args: {
      color: 'success',
    },
    parameters: { docs: { description: { story: 'Focus ring without the pulsing animation. (Note: animationPreset prop removed as invalid)' } } }
};

// Example with custom animation timing
export const CustomAnimationTiming: Story = {
    render: BaseRender,
    args: {
        color: 'warning',
    },
    parameters: { docs: { description: { story: 'Focus ring demonstration. (Note: custom animation timing props removed as invalid)' } } }
};

// Example showing disabled state
export const Disabled: Story = {
    render: BaseRender,
    args: {
         disabled: true,
    },
    parameters: { docs: { description: { story: 'Focus ring is disabled and will not appear on focus.' } } }
}; 