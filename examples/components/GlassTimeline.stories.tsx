import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Import only GlassTimeline
import { GlassTimeline } from '../../src/components/Timeline/GlassTimeline';
// Remove imports for sub-components
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Assuming TimelineItem is a type exported perhaps from types.ts
import type { TimelineItem } from '../../src/components/Timeline/types'; 

// Use GlassTimeline for Meta
const meta: Meta<typeof GlassTimeline> = {
  title: 'Components/Layout/Timeline', 
  component: GlassTimeline,
  tags: ['autodocs'],
  argTypes: {
    // Remove position control
    items: { control: 'object' }, // Expects an array of TimelineItem objects
    orientation: { // Add orientation control back
        control: 'select',
        options: ['vertical', 'horizontal'],
        defaultValue: 'vertical',
      },
    // Add other GlassTimeline props based on its actual props
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
// Use GlassTimeline for Story type
type Story = StoryObj<typeof GlassTimeline>;

// Sample Data matching the likely TimelineItem type structure
const sampleTimelineItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Eat',
    date: new Date(2023, 5, 15, 9, 30), // Use proper Date object instead of string
    content: 'Because you need strength',
    icon: 'Restaurant', // Use string names for potential icon lookup
    color: 'primary',
  },
  {
    id: '2',
    title: 'Code',
    date: new Date(2023, 5, 15, 10, 0), // Use proper Date object instead of string
    content: 'Because it\'s awesome!',
    icon: 'LaptopMac', 
    color: 'secondary',
    active: true, // Example of an active step
  },
  {
    id: '3',
    title: 'Sleep',
    date: new Date(2023, 5, 15, 11, 0), // Use proper Date object instead of string
    content: 'Because you need rest',
    icon: 'Hotel',
    color: 'success'
  },
  {
    id: '4',
    title: 'Repeat',
    date: new Date(2023, 5, 15, 12, 0), // Use proper Date object instead of string
    content: 'Because this is the life',
    icon: 'Repeat',
    disabled: true, // Example of a disabled step
  },
];

// Basic story passing items array
export const BasicVertical: Story = {
  args: {
    items: sampleTimelineItems,
    orientation: 'vertical',
  },
  decorators: [(Story) => <ThemeProvider><Box style={{maxWidth: '400px'}}><Story /></Box></ThemeProvider>],
};

// Horizontal example
export const Horizontal: Story = {
    args: {
      items: sampleTimelineItems,
      orientation: 'horizontal',
    },
    decorators: [(Story) => <ThemeProvider><Box style={{width: '600px', padding: '20px'}}><Story /></Box></ThemeProvider>],
  }; 