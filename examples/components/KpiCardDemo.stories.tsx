import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { KpiCard } from '../../src/components/KpiCard/KpiCard';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Placeholder Icons
const ArrowUpwardIcon = () => <span>🔼</span>;
const ArrowDownwardIcon = () => <span>🔽</span>;
const PeopleIcon = () => <span>👥</span>;
const AttachMoneyIcon = () => <span>💲</span>;

const meta: Meta<typeof KpiCard> = {
  title: 'Components/Data Display/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' }, // Can be string or number
    unit: { control: 'text' },
    trend: { control: 'text' }, // e.g., '+5.2%'
    trendDirection: { control: 'select', options: ['up', 'down', undefined] },
    icon: { control: 'object' }, // ReactNode
    color: { control: 'select', options: ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'default'] },
    // Add other KpiCard props
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [(Story) => <ThemeProvider><Box style={{ padding: '16px', width: '250px'}}><Story /></Box></ThemeProvider>]
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

// Basic KPI Card Example
export const Basic: Story = {
  args: {
    title: 'Total Users',
    value: '10,345',
    icon: <PeopleIcon />,
  },
};

// Upward Trend Example
export const UpwardTrend: Story = {
    args: {
      title: 'Revenue',
      value: '15,670',
      unit: 'USD',
      trend: '+ 12.5%',
      trendDirection: 'up',
      icon: <AttachMoneyIcon />,
      color: 'success',
    },
  };

// Downward Trend Example
export const DownwardTrend: Story = {
    args: {
        title: 'Bounce Rate',
        value: '45.8',
        unit: '%',
        trend: '- 2.1%',
        trendDirection: 'down',
        color: 'error', // Use error color for negative downward trend
      },
};

// Different Color Example
export const InfoColor: Story = {
    args: {
        title: 'Active Sessions',
        value: '1,204',
        color: 'info',
      },
}; 