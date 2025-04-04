import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import from main index
import { GlassThemeSwitcher, ThemeProvider } from '../../src';

const meta: Meta<typeof GlassThemeSwitcher> = {
  title: 'Components/ThemeSwitcher', // Generic name for story
  component: GlassThemeSwitcher,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the GlassThemeSwitcher component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // TODO: Add argTypes based on GlassThemeSwitcherProps
  },
};

export default meta;
type Story = StoryObj<typeof GlassThemeSwitcher>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    // Add default props here if needed
  },
}; 
