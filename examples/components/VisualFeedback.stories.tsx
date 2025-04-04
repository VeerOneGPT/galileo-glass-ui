import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
    VisualFeedback,
    RippleButton,
    FocusIndicator,
    StateIndicator,
} from '../../src/components/VisualFeedback'; // Adjust import path
import { ThemeProvider } from '../../src';
import { Box, Button } from '../../src/components'; // Using Galileo components

// Base meta configuration
const meta: Meta = {
  title: 'Components/VisualFeedback',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

// --- Stories for each component ---

// VisualFeedback (might be an HOC or hook, example usage might vary)
export const GeneralFeedback: StoryObj<typeof VisualFeedback> = {
    name: 'General Visual Feedback',
    render: (args) => (
        <VisualFeedback {...args}>
            <Box style={{ border: '1px solid red', padding: 20 }}>
                Hover or focus this area
            </Box>
        </VisualFeedback>
    ),
    args: {
        // Props for VisualFeedback
    }
};

// RippleButton
export const Ripple: StoryObj<typeof RippleButton> = {
    name: 'Ripple Button',
    render: (args) => (
        <RippleButton {...args} as={Button} variant="contained">
            Click Me for Ripple
        </RippleButton>
    ),
    args: {
        color: 'primary',
        // RippleButton specific props
    }
};

// FocusIndicator
export const Focus: StoryObj<typeof FocusIndicator> = {
    name: 'Focus Indicator',
    render: (args) => (
        <FocusIndicator {...args}>
            <Button variant="outlined">Focus Me</Button>
        </FocusIndicator>
    ),
    args: {
        // Props for FocusIndicator
    }
};

// StateIndicator
export const State: StoryObj<typeof StateIndicator> = {
    name: 'State Indicator',
    render: (args) => (
        <StateIndicator {...args} style={{ width: 100, height: 50, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             State Target
        </StateIndicator>
    ),
    args: {
        state: 'hover', // Example: 'hover', 'active', 'focus'
        // Other props...
    }
}; 