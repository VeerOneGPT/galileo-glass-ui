import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../../src'; // Path seems correct
import { GlassChart } from '../../src/components/Charts/GlassChart'; // Corrected path

// Revert to original Chart.js-like structure 
// as GlassChart seems to pass data down directly
const sampleLineData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Sales', // Use 'label' as per Chart.js convention
      data: [12, 19, 3, 5, 2, 3],
      borderColor: '#4B66EA',
      backgroundColor: 'rgba(75, 102, 234, 0.2)',
      fill: true, // Example property
    }
  ]
};

const meta: Meta<typeof GlassChart> = {
  title: 'Components/GlassChart (Legacy?)', // Mark as potentially legacy
  component: GlassChart,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object' },
    type: { control: 'select', options: ['line', 'bar', 'pie', 'doughnut'] }, // Common types
    // Add other potential props based on expected functionality
    width: { control: 'text' },
    height: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof GlassChart>;

// Basic Render Check Story
export const BasicRenderCheck: Story = {
  name: 'Basic Render Check',
  args: {
    type: 'line',
    // Use the original data format
    data: sampleLineData, 
    width: '500px',
    height: '300px',
  },
}; 