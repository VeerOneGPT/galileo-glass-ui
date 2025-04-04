import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import from main index
import { GlassTabs, ThemeProvider } from '../../src'; 
// Cannot resolve GlassTabItem type import
// import type { GlassTabItem } from '../../src/components/GlassTabs/types';

const meta: Meta<typeof GlassTabs> = {
  title: 'Components/GlassTabs',
  component: GlassTabs,
  decorators: [(Story) => <ThemeProvider><div style={{ width: '500px', padding: '20px' }}><Story /></div></ThemeProvider>],
  parameters: {
    // layout: 'centered', // Use padding decorator
    docs: {
      description: {
        component: 'Placeholder story for the GlassTabs component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // TODO: Add argTypes based on GlassTabsProps
  },
};

export default meta;
type Story = StoryObj<typeof GlassTabs>;

// TODO: Add more stories and controls

// Remove explicit type for sampleTabs
const sampleTabs = [
  { id: '1', label: 'Tab One', content: <div>Content for Tab One</div> },
  { id: '2', label: 'Tab Two', content: <div>Content for Tab Two</div> },
  { id: '3', label: 'Tab Three', content: <div>Content for Tab Three</div> },
];

export const Default: Story = {
  args: {
    tabs: sampleTabs,
    defaultTab: '1',
  },
}; 