import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PerformanceMonitor, OptimizedGlassContainer } from '../../src/components/Performance';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof PerformanceMonitor> = {
  title: 'Components/Performance/PerformanceMonitor',
  component: PerformanceMonitor,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ padding: 20 }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define argTypes for PerformanceMonitor props if any
    // thresholds: { control: 'object' }, // Removed to fix lint error
    // onReport: { action: 'reported' }, // Removed to fix lint error
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultMonitor: Story = {
  name: 'Performance Monitor',
  // Removed render, using args for children and props
  args: {
    children: (
      <Box style={{ padding: 20, border: '1px solid green' }}>
        Monitored Content Area
        <OptimizedGlassContainer style={{ marginTop: 10, padding: 10 }}>
            Inside Optimized Container
        </OptimizedGlassContainer>
      </Box>
    ),
    // thresholds: { fps: 30, memory: 500 }, // Example thresholds - Pass actual props if needed
    onReport: (report) => console.log('Performance Report:', report),
  },
};

// Story specifically for OptimizedGlassContainer might be useful too
export const OptimizedContainerStory: StoryObj<typeof OptimizedGlassContainer> = {
    // title: 'Components/Performance/OptimizedGlassContainer', // Removed title from StoryObj
    name: 'Optimized Glass Container', 
    render: (args) => (
        <OptimizedGlassContainer {...args} style={{ padding: 20, border: '1px dashed blue', ...args.style }}>
            This container optimizes rendering for performance.
        </OptimizedGlassContainer>
    ),
    args: {
      // Props for OptimizedGlassContainer
      children: "Optimized content here", // Added example child for OptimizedGlassContainer story
    }
};

// To show OptimizedContainerStory under the main meta:
// (Ensure it doesn't clash with DefaultMonitor's rendering if shown together)
// meta.render = () => <div>... Stories ...</div>; // Or adjust layout 