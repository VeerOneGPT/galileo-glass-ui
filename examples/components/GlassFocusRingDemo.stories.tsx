import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { GlassFocusRing } from '../../src/components/GlassFocusRing/GlassFocusRing'; 
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Button } from '../../src/components/Button'; // Element to wrap
import { TextField } from '../../src/components/TextField'; // Element to wrap

const meta: Meta<typeof GlassFocusRing> = {
  title: 'Utilities/GlassFocusRing',
  component: GlassFocusRing,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    offset: { control: 'number' }, // Pixel offset
    radiusAdjust: { control: 'number' }, // Added back
    // Add other props if any (e.g., focusVisibleClassName)
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof GlassFocusRing>;

// Basic Example with Button
export const WithButton: Story = {
  render: (args) => (
    <ThemeProvider>
        <Box style={{ padding: '20px' }}>
            <p>Tab to the button below to see the focus ring:</p>
            <GlassFocusRing {...args}>
                <Button variant="contained">Focus Me</Button>
            </GlassFocusRing>
        </Box>
    </ThemeProvider>
  ),
  args: {
    // Default args
    offset: 2,
  }
};

// Example with TextField
export const WithTextField: Story = {
    render: (args) => (
      <ThemeProvider>
          <Box style={{ padding: '20px' }}>
              <p>Tab to the text field below to see the focus ring:</p>
              <GlassFocusRing {...args}>
                  <TextField label="Focus Me Too" variant="outlined" />
              </GlassFocusRing>
          </Box>
      </ThemeProvider>
    ),
    args: {
      offset: 1, // TextField might need different offset
    }
  };

  // Example with Custom Styling
export const CustomStyle: Story = {
    render: WithButton.render, // Reuse Button example render
    args: {
      offset: 4,
      radiusAdjust: 8, // Use radiusAdjust instead
      color: '#ff00ff', // Magenta
    }
  }; 