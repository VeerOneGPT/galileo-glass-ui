import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { GlassTimeline } from '../../src/components/Timeline/GlassTimeline';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import type { TimelineItem } from '../../src/components/Timeline/types'; 

// Storybook Meta Configuration
const meta: Meta<typeof GlassTimeline> = {
  title: 'Components/Layout/Timeline', 
  component: GlassTimeline,
  tags: ['autodocs'],
  argTypes: {
    items: { 
      control: 'object',
      description: 'Array of timeline event objects.' 
    },
    orientation: { 
        control: 'select',
        options: ['vertical', 'horizontal'],
        description: 'Timeline orientation.',
      },
    markerPosition: {
        control: 'select',
        options: ['left', 'right', 'alternate', 'center'],
        description: 'Position of event markers relative to the axis.',
    },
    density: {
        control: 'select',
        options: ['compact', 'normal', 'spacious'],
        description: 'Density of timeline items.',
    },
    initialDate: {
        control: 'date',
        description: 'Initial date the timeline centers on.',
    },
    viewMode: {
        control: 'select',
        options: ['day', 'week', 'month', 'year', 'decade'],
        description: 'Default time range view.',
    },
    zoomLevel: {
        control: 'select',
        options: ['hours', 'days', 'weeks', 'months', 'years'],
        description: 'Initial zoom level.',
    },
    glassVariant: {
        control: 'select',
        options: ['clear', 'frosted', 'tinted'],
        description: 'Glass effect variant for containers.',
    },
    color: {
        control: 'select',
        options: ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'default'],
        description: 'Primary color theme.',
    },
    // Add other relevant props as needed
  },
  parameters: {
    layout: 'centered', // Center the component in the Canvas
  },
};

export default meta;

// Story Type Definition
type Story = StoryObj<typeof GlassTimeline>;

// Sample Data
const sampleTimelineItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Coffee & Planning',
    date: new Date(2024, 3, 8, 9, 0), // Apr 8, 2024, 9:00 AM
    content: 'Outline the day\'s tasks.',
    icon: 'Coffee', 
    color: 'info',
  },
  {
    id: '2',
    title: 'Development Session 1',
    date: new Date(2024, 3, 8, 9, 30), // 9:30 AM
    content: 'Work on the timeline component layout.',
    icon: 'LaptopMac', 
    color: 'primary',
    active: true, // Mark as currently active
  },
  {
    id: '3',
    title: 'Quick Stand-up',
    date: new Date(2024, 3, 8, 11, 0), // 11:00 AM
    content: 'Sync up with the team.',
    icon: 'Groups',
    color: 'secondary'
  },
  {
    id: '4',
    title: 'Development Session 2',
    date: new Date(2024, 3, 8, 11, 15), // 11:15 AM - Close to previous
    content: 'Implement overlap avoidance logic.',
    icon: 'Code',
    color: 'primary',
  },
   {
    id: '5',
    title: 'Lunch Break',
    date: new Date(2024, 3, 8, 13, 0), // 1:00 PM
    content: 'Recharge!',
    icon: 'Restaurant',
    color: 'success',
  },
  {
    id: '6',
    title: 'Review & Testing',
    date: new Date(2024, 3, 8, 14, 0), // 2:00 PM
    content: 'Test vertical and horizontal layouts.',
    icon: 'BugReport',
    color: 'warning',
  },
   {
    id: '7',
    title: 'Documentation',
    date: new Date(2024, 3, 8, 15, 30), // 3:30 PM
    content: 'Update component props and usage.',
    icon: 'Description',
    color: 'default',
  },
];

// Decorator for consistent styling
const TimelineDecorator = (StoryComponent: React.ElementType) => (
  <ThemeProvider>
    <Box style={{ 
      width: '100%', 
      maxWidth: '90vw', // Use vw for responsiveness
      minHeight: '600px', // Ensure enough height
      padding: '30px', 
      background: 'linear-gradient(145deg, #303040 0%, #1c1c28 100%)', // Subtle gradient
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      display: 'flex', // Use flex to help center content if needed
      justifyContent: 'center',
      alignItems: 'center', // Center the timeline vertically if its height is less than minHeight
    }}>
      {/* Inner box to constrain timeline width specifically if needed */}
       <Box style={{ width: '100%', height: '100%', overflow: 'hidden' }}> 
          <StoryComponent />
       </Box>
    </Box>
  </ThemeProvider>
);

// Vertical Timeline Story
export const VerticalTimeline: Story = {
  args: {
    items: sampleTimelineItems,
    orientation: 'vertical',
    markerPosition: 'alternate', // Good default
    density: 'normal',
    initialDate: new Date(2024, 3, 8, 12, 0), // Center around noon
    viewMode: 'day', 
    zoomLevel: 'hours', // Zoomed in to see overlap logic better
    color: 'primary',
    glassVariant: 'frosted',
    blurStrength: 'standard',
    height: '550px', // Explicit height within the decorator
    markers: {
      show: true,
      primaryInterval: 'days', // Show day markers even when zoomed to hours
      showNow: true,
    }
  },
  decorators: [TimelineDecorator],
};

// Horizontal Timeline Story
export const HorizontalTimeline: Story = {
    args: {
      ...VerticalTimeline.args, // Inherit args from vertical
      orientation: 'horizontal', // Override orientation
      height: '350px', // Adjust height for horizontal
      width: '100%', // Take full width of inner container
      markers: {
        show: true,
        primaryInterval: 'days', // Show day markers even when zoomed to hours
        showNow: true,
      }
    },
    decorators: [TimelineDecorator],
  }; 