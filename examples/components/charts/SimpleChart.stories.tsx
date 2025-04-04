import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { ThemeProvider } from '../../../src/theme/ThemeProvider';
import {
  SimpleChart,
  // Assuming ChartProps might be needed from here or a types file
} from '../../../src/components/Charts'; // Updated path
import { Typography } from '../../../src/components/Typography';

// --- Sample Data (Copied from GlassChart story for consistency) ---
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

// --- Styled Components ---
const StoryContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// --- Storybook Configuration ---
export default {
  title: 'Components/Charts/SimpleChart',
  component: SimpleChart,
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
    notes: 'A lightweight, performance-optimized chart component.',
  },
  argTypes: {
    type: { control: 'select', options: ['bar', 'line', 'area', 'pie'] },
    data: { control: 'object' },
    title: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
    showPoints: { control: 'boolean', if: { arg: 'type', eq: 'line' } },
    fillArea: { control: 'boolean', if: { arg: 'type', eq: 'area' } },
    innerRadius: { control: 'number', if: { arg: 'type', eq: 'pie' } },
    // Add other SimpleChart specific props if any
  },
} as Meta<typeof SimpleChart>;

// --- Template ---
const Template: StoryFn<React.ComponentProps<typeof SimpleChart>> = (args) => <SimpleChart {...args} />;

// --- Stories ---
export const SimpleBar = Template.bind({});
SimpleBar.args = {
  type: 'bar',
  data: barChartData,
  title: 'Simple Bar Chart',
  width: 400,
  height: 300,
};

export const SimpleLine = Template.bind({});
SimpleLine.args = {
  type: 'line',
  data: lineChartData,
  title: 'Simple Line Chart',
  width: 400,
  height: 300,
  showPoints: true,
};

export const SimpleArea = Template.bind({});
SimpleArea.args = {
  type: 'area',
  data: lineChartData,
  title: 'Simple Area Chart',
  width: 400,
  height: 300,
  fillArea: true,
};

export const SimplePie = Template.bind({});
SimplePie.args = {
  type: 'pie',
  data: pieChartData,
  title: 'Simple Pie Chart',
  width: 400,
  height: 300,
  innerRadius: 50, // Donut
}; 