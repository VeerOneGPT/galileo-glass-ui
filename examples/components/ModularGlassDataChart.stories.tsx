import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ModularGlassDataChart } from '../../src/components/DataChart/ModularGlassDataChart'; // Corrected path
import { Card } from '../../src/components/Card'; // Corrected path
import { ThemeProvider } from '../../src';

// Sample Data
const lineAreaData = [
  {
    id: 'sample',
    label: 'Sample Data',
    data: [
      { x: 'Jan', y: 10 }, { x: 'Feb', y: 20 }, { x: 'Mar', y: 15 },
      { x: 'Apr', y: 25 }, { x: 'May', y: 30 }, { x: 'Jun', y: 28 },
    ],
  },
];

const pieData = [
  {
    id: 'pie-sample',
    label: 'Sample Pie Data',
    // Note: Pie/Doughnut usually expect a simpler data array for the dataset
    data: [ // Example: Direct values, labels taken from top-level labels prop or generated
      { x: 'A', y: 300, color: '#6366F1' }, 
      { x: 'B', y: 50, color: '#EC4899' }, 
      { x: 'C', y: 100, color: '#10B981' },
    ]
  },
];

// Sample Data for Bar (can reuse lineAreaData or create specific)
const barData = [
  {
    id: 'bar-sample',
    label: 'Sample Bar Data',
    data: [
      { x: 'Category A', y: 55 }, { x: 'Category B', y: 70 }, { x: 'Category C', y: 40 },
      { x: 'Category D', y: 95 }, { x: 'Category E', y: 60 },
    ],
    style: { glassEffect: true } // Example styling
  },
];

// Sample Data for Bubble
const bubbleData = [
  {
    id: 'bubble-sample',
    label: 'Sample Bubble Data',
    data: [
      { x: 10, y: 20, r: 15 }, { x: 15, y: 10, r: 25 }, { x: 25, y: 30, r: 10 },
      { x: 30, y: 15, r: 8 }, { x: 5, y: 5, r: 12 },
    ],
    style: { 
      fillOpacity: 0.6, // Bubble charts often use opacity
      lineColor: '#F59E0B' // Example color
    } 
  },
];

// Sample Data for Radar/PolarArea
const radarPolarData = [
  {
    id: 'radar-polar-sample',
    label: 'Sample Radar/Polar Data',
    data: [
      // Data needs labels (usually inferred from top-level labels if not here)
      // Values correspond to labels: 'Stat 1', 'Stat 2', etc.
      { x: 'Stat 1', y: 65 }, { x: 'Stat 2', y: 59 }, { x: 'Stat 3', y: 90 },
      { x: 'Stat 4', y: 81 }, { x: 'Stat 5', y: 56 }, { x: 'Stat 6', y: 55 }
    ],
    style: { 
      lineColor: '#8B5CF6', 
      fillOpacity: 0.3 
    } 
  },
];

// Sample KPI Prop Data
const kpiPropData = {
  value: "1.2M",
  title: "Active Users",
  subtitle: "+15% this month",
  trend: "positive"
} as const;

const meta: Meta<typeof ModularGlassDataChart> = {
  title: 'Components/ModularGlassDataChart',
  component: ModularGlassDataChart,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'bar', 'area', 'pie', 'doughnut', 'kpi'], // Add others like bubble, radar if needed
    },
    glassVariant: {
      control: 'select',
      options: ['clear', 'frosted', 'tinted', 'luminous'],
    },
    // Add other relevant props from ModularGlassDataChart if needed
  },
};

export default meta;
type Story = StoryObj<typeof ModularGlassDataChart>;

// --- Stories for Testing Task #27 Bugs ---

export const TransparencyTest: Story = {
  name: 'BugCheck: Clear Variant Transparency',
  args: {
    variant: 'line',
    datasets: lineAreaData,
    glassVariant: 'clear',
    title: 'Transparency Test',
    subtitle: 'Background should be visible through chart area'
  },
  // Decorator to add a colored background to check transparency
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: 'teal', padding: '20px', borderRadius: '15px' }}>
        <Story />
      </div>
    ),
  ],
};

export const AreaVariantDefault: Story = {
  name: 'BugCheck: Area Variant (Default Fill?)',
  args: {
    variant: 'area',
    datasets: lineAreaData,
    title: 'Area Chart (Default)',
    subtitle: 'Should have a fill by default?',
  },
};

export const AreaVariantWithOpacity: Story = {
  name: 'BugCheck: Area Variant (Explicit Opacity)',
  args: {
    variant: 'area',
    // Modify data to include style
    datasets: lineAreaData.map(ds => ({
      ...ds,
      style: { fillOpacity: 0.3, lineColor: '#6366F1' } // Add explicit style
    })),
    title: 'Area Chart (With Style.fillOpacity)',
    subtitle: 'Fill should be visible now'
  },
};

export const PieVariantTest: Story = {
  name: 'BugCheck: Pie Variant Rendering',
  args: {
    variant: 'pie',
    datasets: pieData,
    title: 'Pie Chart Test',
    subtitle: 'Should render as a Pie Chart'
  },
};

export const DoughnutVariantTest: Story = {
  name: 'BugCheck: Doughnut Variant Rendering',
  args: {
    variant: 'doughnut',
    datasets: pieData, // Doughnut often uses same data structure as Pie
    title: 'Doughnut Chart Test',
    subtitle: 'Should render as a Doughnut Chart'
  },
};

// --- Render Check Stories ---

export const RenderCheckBar: Story = {
  name: 'RenderCheck: Bar',
  args: {
    variant: 'bar',
    datasets: barData,
    title: 'Bar Chart Render Check',
  },
};

export const RenderCheckBubble: Story = {
  name: 'RenderCheck: Bubble',
  args: {
    variant: 'bubble',
    datasets: bubbleData,
    title: 'Bubble Chart Render Check',
  },
};

export const RenderCheckRadar: Story = {
  name: 'RenderCheck: Radar',
  args: {
    variant: 'radar',
    datasets: radarPolarData,
    title: 'Radar Chart Render Check',
    // Radar often needs specific axis options, but this is just a render check
  },
};

export const RenderCheckPolarArea: Story = {
  name: 'RenderCheck: Polar Area',
  args: {
    variant: 'polarArea',
    datasets: radarPolarData, // Can use similar data structure
    title: 'Polar Area Chart Render Check',
  },
};

export const RenderCheckKpi: Story = {
  name: 'RenderCheck: KPI',
  args: {
    variant: 'kpi',
    // NOTE: KPI variant uses the `kpi` prop, not `datasets`
    kpi: kpiPropData,
    datasets: [], // Important: Provide empty array or omit if component handles it
    title: 'KPI Render Check',
    height: 200, // KPI might look better with less height
  },
}; 