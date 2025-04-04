import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Carousel is not exported, import directly using default import
import Carousel from '../../src/components/Carousel';
// GlassCard is exported as Card, GlassTypography as Typography
import { Card as GlassCard, GlassTypography as Typography, ThemeProvider } from '../../src'; 

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
  decorators: [(Story) => <ThemeProvider><div style={{ width: '500px', padding: '20px' }}><Story /></div></ThemeProvider>],
  parameters: {
    // layout: 'centered', // Use padding decorator instead
    docs: {
      description: {
        component: 'Placeholder story for the Carousel component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // TODO: Add argTypes based on CarouselProps
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

// TODO: Add more stories and controls

// Sample items for the carousel
const items = [
    { name: "Item 1", description: "Description for Item 1" },
    { name: "Item 2", description: "Description for Item 2" },
    { name: "Item 3", description: "Description for Item 3" },
    { name: "Item 4", description: "Description for Item 4" },
    { name: "Item 5", description: "Description for Item 5" }
];


export const Default: Story = {
  args: {
    children: items.map((item, i) => (
        // Use GlassCard (imported as Card)
        <GlassCard key={i} style={{ padding: '20px', textAlign: 'center' }}> 
            {/* Use Typography (imported from GlassTypography) */}
            <Typography variant="h5">{item.name}</Typography>
            <Typography>{item.description}</Typography>
        </GlassCard>
    ))
  },
}; 