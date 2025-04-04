import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { DynamicAtmosphere } from '../../src/components/DynamicAtmosphere';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof DynamicAtmosphere> = {
  title: 'Components/Advanced/DynamicAtmosphere',
  component: DynamicAtmosphere,
  decorators: [
    (Story) => (
      <ThemeProvider>
        {/* Needs a container to visualize */}
        <Box style={{ width: '100%', height: '400px', position: 'relative', border: '1px solid #ccc', overflow: 'hidden' }}>
          <Story />
          <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
              Content Over Atmosphere
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen', // Often best for background effects
  },
  tags: ['autodocs'],
  argTypes: {
    // Define argTypes for props like intensity, color, particle type etc.
    intensity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    // particleColor: { control: 'color' }, // Removed to fix lint error
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    intensity: 0.5,
    // particleColor: '#ffffff', // Removed corresponding arg
    // other props...
  },
};

// Add more stories for different atmosphere effects 