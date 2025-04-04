import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { SimpleChart } from '../../src/components/Charts/SimpleChart';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof SimpleChart> = {
  title: 'Components/Charts/SimpleChart', // Place under Charts
  component: SimpleChart,
  tags: ['autodocs'],
  argTypes: {
    type: {
        control: 'select',
        options: ['bar', 'line', 'area', 'pie', 'scatter'],
        description: 'Type of chart'
    },
    data: { control: 'object', description: 'Chart data array' },
    width: { control: 'text', description: 'Chart width (e.g., \'100%\', 400)' },
    height: { control: 'text', description: 'Chart height (e.g., \'300px\', 300)' },
    title: { control: 'text', description: 'Optional chart title' },
    colors: { control: 'object', description: 'Array of color strings' },
    showValues: { control: 'boolean', description: 'Show data values on chart' },
    fillArea: { control: 'boolean', description: 'Fill area under line/area charts' },
    showPoints: { control: 'boolean', description: 'Show points on line charts' },
    innerRadius: { control: 'number', description: 'Inner radius for pie/donut (0 for pie)' },
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
        <ThemeProvider>
            <Box style={{ padding: '20px', width: '400px' }}>
                <Story />
            </Box>
        </ThemeProvider>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof SimpleChart>;

// Sample Data (Simplified structure)
const simpleBarData = [
    { label: 'A', value: 10 }, { label: 'B', value: 20 }, { label: 'C', value: 15 }, { label: 'D', value: 25 },
];

const simpleLineData = [
    { value: 5 }, { value: 15 }, { value: 10 }, { value: 25 }, { value: 20 }, { value: 30 },
];

const simplePieData = [
    { label: 'Red', value: 300, color: '#EF4444' },
    { label: 'Blue', value: 50, color: '#3B82F6' },
    { label: 'Green', value: 100, color: '#10B981' },
];

// Stories
export const Bar: Story = {
  args: {
    type: 'bar',
    title: 'Simple Bar Chart',
    data: simpleBarData,
    showValues: true,
  },
};

export const Line: Story = {
    args: {
      type: 'line',
      title: 'Simple Line Chart',
      data: simpleLineData,
      showPoints: true,
    },
  };

export const Area: Story = {
    args: {
      type: 'area',
      title: 'Simple Area Chart',
      data: simpleLineData,
      fillArea: true,
      showPoints: false,
    },
  };

export const Pie: Story = {
    args: {
      type: 'pie',
      title: 'Simple Pie Chart',
      data: simplePieData,
      showValues: true,
      // innerRadius: 0, // Default for pie
    },
  };

export const Donut: Story = {
    args: {
        type: 'pie', // Still uses pie type
        title: 'Simple Donut Chart',
        data: simplePieData,
        innerRadius: 30, // Set innerRadius for donut
        showValues: true,
      },
    };
