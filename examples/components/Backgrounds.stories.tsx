import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
    AtmosphericBackground,
    ParticleBackground,
} from '../../src/components/backgrounds'; // Adjust import path
import { ThemeProvider } from '../../src';
import { Box, Typography } from '../../src/components';

// Base meta configuration
const meta: Meta = {
  title: 'Theme/Backgrounds',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ width: '100%', height: '400px', position: 'relative', border: '1px solid grey', overflow: 'hidden' }}>
            <Story />
            <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
              <Typography variant="h5">Content Over Background</Typography>
            </Box>
          </Box>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    // ... existing code ...
  },
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

// --- Stories for each background component ---

// AtmosphericBackground
export const Atmospheric: StoryObj<typeof AtmosphericBackground> = {
    name: 'Atmospheric Background',
    // component: AtmosphericBackground, // Removed from StoryObj
    render: (args) => <AtmosphericBackground {...args} />, // Explicit render needed if component not in meta
    args: {
        intensity: 0.6,
        color: '#3a7bd5'
    },
    argTypes: {
        intensity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
        color: { control: 'color' },
    }
};

// ParticleBackground
export const Particle: StoryObj<typeof ParticleBackground> = {
    name: 'Particle Background',
    // component: ParticleBackground, // Removed from StoryObj
    render: (args) => <ParticleBackground {...args} />, // Explicit render needed
    args: {
        particleCount: 100,
        particleColor: '#ffffff',
        interactive: true,
    },
    argTypes: {
        particleCount: { control: { type: 'range', min: 10, max: 500, step: 10 } },
        particleColor: { control: 'color' },
        interactive: { control: 'boolean' },
    }
}; 