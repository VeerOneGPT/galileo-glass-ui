import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { ThemeProvider } from '../../../src/theme/ThemeProvider';
import {
  GlassChart,
  // Assuming ChartProps might be needed from here or a types file
} from '../../../src/components/Charts'; // Updated path
import { Typography } from '../../../src/components/Typography';

// --- Sample Data ---
const barChartData = [
  { label: 'Jan', value: 65 }, { label: 'Feb', value: 59 }, { label: 'Mar', value: 80 },
  { label: 'Apr', value: 81 }, { label: 'May', value: 56 }, { label: 'Jun', value: 55 },
  { label: 'Jul', value: 40 },
];

const lineChartData = [
  {
    name: 'Series 1', color: '#4B66EA',
    data: [
      { label: 'Jan', value: 65 }, { label: 'Feb', value: 59 }, { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 }, { label: 'May', value: 56 }, { label: 'Jun', value: 55 },
      { label: 'Jul', value: 40 },
    ],
  },
  {
    name: 'Series 2', color: '#EC4899',
    data: [
      { label: 'Jan', value: 28 }, { label: 'Feb', value: 48 }, { label: 'Mar', value: 40 },
      { label: 'Apr', value: 19 }, { label: 'May', value: 86 }, { label: 'Jun', value: 27 },
      { label: 'Jul', value: 90 },
    ],
  },
];

const pieChartData = [
  { label: 'Category A', value: 30, color: '#4B66EA' },
  { label: 'Category B', value: 50, color: '#EC4899' },
  { label: 'Category C', value: 20, color: '#10B981' },
  { label: 'Category D', value: 15, color: '#F59E0B' },
];

// Tabs for chart examples
const chartTabs = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

// --- Styled Components ---
const StoryContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  min-height: 500px; // Ensure enough height for chart
`;

// --- Storybook Configuration ---
export default {
  title: 'Components/Charts/GlassChart',
  component: GlassChart,
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark" initialColorMode="dark">
        <StoryContainer>
          <Story />
        </StoryContainer>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    type: { control: 'select', options: ['bar', 'line', 'area', 'pie'] },
    data: { control: 'object' }, // Allow editing data in controls, but might be complex
    title: { control: 'text' },
    description: { control: 'text' },
    height: { control: 'number' },
    magneticEffect: { control: 'boolean' },
    magneticStrength: { control: { type: 'range', min: 0, max: 1, step: 0.1 }, if: { arg: 'magneticEffect' } },
    zElevation: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    depthAnimation: { control: 'boolean' },
    focusMode: { control: 'boolean' },
    allowTypeSwitch: { control: 'boolean' },
    allowDownload: { control: 'boolean' },
    tabs: { control: 'object' },
    onTabChange: { action: 'onTabChange' },
    chartProps: { control: 'object' }, // Specific props for the underlying chart library
    // Add other relevant props from GlassChart
  },
} as Meta<typeof GlassChart>;

// --- Template ---
const Template: StoryFn<React.ComponentProps<typeof GlassChart>> = (args) => <GlassChart {...args} />;

// --- Stories ---

export const BarChart = Template.bind({});
BarChart.args = {
  type: 'bar',
  data: barChartData,
  title: 'Sales Performance (Bar)',
  description: 'Monthly sales performance for the current year',
  height: 400,
  magneticEffect: true,
  zElevation: 2,
  tabs: chartTabs,
  allowTypeSwitch: true,
  chartProps: {
    showValues: true,
    cornerRadius: 4,
  },
};

export const LineChart = Template.bind({});
LineChart.args = {
  type: 'line',
  data: lineChartData,
  title: 'Revenue Trends (Line)',
  description: 'Comparison of revenue streams over time',
  height: 400,
  magneticEffect: true,
  zElevation: 2,
  depthAnimation: true,
  focusMode: true,
  allowDownload: true,
  chartProps: {
    showPoints: true,
    curve: 'smooth',
  },
};

export const AreaChart = Template.bind({});
AreaChart.args = {
  type: 'area',
  data: lineChartData, // Reuse line data for area
  title: 'Market Share (Area)',
  description: 'Market share evolution over time',
  height: 400,
  magneticEffect: true,
  zElevation: 2,
  chartProps: {
    fillArea: true,
    showPoints: true,
    gradient: true,
  },
};

export const PieChart = Template.bind({});
PieChart.args = {
  type: 'pie',
  data: pieChartData,
  title: 'Revenue Distribution (Pie)',
  description: 'Breakdown of revenue by product category',
  height: 400,
  magneticEffect: true,
  zElevation: 2,
  chartProps: {
    innerRadius: 60, // Donut chart
    showLabels: true,
    labelType: 'percent',
  },
}; 