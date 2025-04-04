import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { KpiChart } from '../../src/components/DataChart/components/KpiChart';
import { KpiProps } from '../../src/components/DataChart/types/ChartTypes';
import { ThemeProvider } from '../../src';

// Define sample KPI data conforming to KpiProps
const sampleKpi: KpiProps = {
  title: 'Monthly Revenue',
  value: '$12,450',
  trend: 'positive',
  subtitle: '+15% vs last month',
};

const negativeKpi: KpiProps = {
  title: 'Bug Count',
  value: 78,
  trend: 'negative',
  subtitle: '-5 vs last week',
};

const neutralKpi: KpiProps = {
  title: 'Active Users',
  value: 2300,
  trend: 'neutral',
  subtitle: 'No significant change',
};

const compactKpi: KpiProps = {
  title: 'Server Load',
  value: '72%',
  compact: true,
  trend: 'negative',
};

// Define Meta component for Storybook
const meta: Meta<typeof KpiChart> = {
  title: 'Components/DataChart/KpiChart',
  component: KpiChart,
  tags: ['autodocs'],
  argTypes: {
    kpi: { control: 'object', description: 'KPI data object' },
    animation: { control: 'object', description: 'Animation settings' },
    compact: { control: 'boolean', description: 'Compact mode' },
    color: { control: 'text', description: 'Base color theme' },
    qualityTier: { control: 'select', options: ['low', 'medium', 'high'], description: 'Quality tier' },
    isReducedMotion: { control: 'boolean', description: 'Reduced motion preference' },
  },
};

export default meta;
type Story = StoryObj<typeof KpiChart>;

// Define Basic Render Check Story
export const BasicRenderCheck: Story = {
  args: {
    kpi: sampleKpi,
    animation: {
      enabled: true,
    },
    compact: false,
    color: 'primary',
  },
};

export const NegativeTrend: Story = {
  args: {
    ...BasicRenderCheck.args,
    kpi: negativeKpi,
    color: 'error',
  },
};

export const NeutralTrend: Story = {
  args: {
    ...BasicRenderCheck.args,
    kpi: neutralKpi,
    color: 'neutral',
  },
};

export const CompactMode: Story = {
  args: {
    ...BasicRenderCheck.args,
    kpi: compactKpi,
    compact: true,
    color: 'warning',
  },
};

export const WithoutAnimation: Story = {
  args: {
    ...BasicRenderCheck.args,
    animation: {
      enabled: false,
    },
  },
};