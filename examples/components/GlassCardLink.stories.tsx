import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom'; // Likely needed if it acts as a link
import { GlassCardLink } from '../../src/components/GlassCardLink/GlassCardLink'; // Adjust import path
import { ThemeProvider } from '../../src';
import { Box, Typography } from '../../src/components';

const meta: Meta<typeof GlassCardLink> = {
  title: 'Components/GlassCardLink',
  component: GlassCardLink,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <Box style={{ padding: 20, background: 'linear-gradient(to right, #c9ffbf, #ffafbd)', width: 'fit-content' }}>
            <Story />
          </Box>
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define argTypes for props like to, elevation, hover effects, etc.
    // Removed props from argTypes due to inference issues
    // to: { control: 'text' }, 
    // elevation: { control: { type: 'number', min: 0, max: 24, step: 1 } },
    // hover: { control: 'boolean' },
    // glow: { control: 'boolean' },
    // glowColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    to: '/some-link',
    elevation: 2,
    hover: true,
    glow: false,
    children: (
        <Box style={{ padding: '16px' }}>
            <Typography variant="h6">Clickable Card</Typography>
            <Typography variant="body2">This card acts as a link.</Typography>
        </Box>
    ),
    // other props...
  },
};

export const WithGlow: Story = {
    args: {
      ...Default.args, // Inherit default args
      to: '/other-link', // Ensure unique keys if rendered together
      glow: true,
      glowColor: 'rgba(0, 255, 255, 0.5)', // Example glow color
      children: (
        <Box style={{ padding: '16px' }}>
            <Typography variant="h6">Card with Glow</Typography>
            <Typography variant="body2">This card glows on hover.</Typography>
        </Box>
    ),
    },
  };

// Add more stories for different variants, states, etc. 