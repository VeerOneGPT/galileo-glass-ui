import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import { ThemeProvider, usePhysicsInteraction } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';
import { GlassDataChart } from '../../src/components/DataChart';
import type { ChartDataset } from '../../src/components/DataChart/types/ChartTypes';
import { glassSurface } from '../../src/core';

// --- Widget Component ---

const WidgetContainer = styled(Box)<{ interactive?: boolean }>`
  padding: 16px;
  border-radius: 12px;
  width: 350px;
  min-height: 300px;
  background-color: rgba(200, 200, 220, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  cursor: ${props => props.interactive ? 'pointer' : 'default'};
  will-change: transform;
`;

interface DashboardWidgetProps {
  title: string;
  chartData: ChartDataset[];
  chartVariant?: 'line' | 'bar' | 'area';
  usePhysics?: boolean;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
    title, 
    chartData, 
    chartVariant = 'line', 
    usePhysics = true 
}) => {
    const widgetRef = useRef<HTMLDivElement>(null);

    const { style: physicsStyle } = usePhysicsInteraction({
        elementRef: widgetRef,
        type: 'spring', 
        strength: 0.6, 
        affectsScale: true, 
        scaleAmplitude: 0.03,
        reducedMotion: !usePhysics,
    });

    return (
        <WidgetContainer ref={widgetRef} style={physicsStyle} interactive={usePhysics}>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Box height="200px">
                <GlassDataChart 
                    variant={chartVariant}
                    datasets={chartData}
                    axis={{ 
                        showXGrid: false, showYGrid: true, 
                        showXLabels: true, showYLabels: true,
                        gridColor: 'rgba(255,255,255,0.1)' 
                    }}
                    legend={{ show: false }}
                    interaction={{ showTooltips: true }}
                />
            </Box>
        </WidgetContainer>
    );
};

// --- Storybook Meta ---

const meta: Meta<typeof DashboardWidget> = {
  title: 'Patterns/DashboardWidget',
  component: DashboardWidget,
  decorators: [
      (Story) => (
          <ThemeProvider>
              <Box p={4}>
                  <Story />
              </Box>
          </ThemeProvider>
      )
  ],
  parameters: {
    layout: 'centered',
     docs: {
      description: {
        component: 'Example composite pattern: An interactive dashboard widget using Glass styles, DataChart, and Physics Interactions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
      title: { control: 'text' },
      chartVariant: { control: 'select', options: ['line', 'bar', 'area'] },
      usePhysics: { control: 'boolean' },
      chartData: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardWidget>;

// --- Sample Data & Stories ---

const sampleLineData: ChartDataset[] = [
  {
    id: 'revenue',
    label: 'Revenue',
    data: [
      { x: 'Jan', y: 65 }, { x: 'Feb', y: 59 }, { x: 'Mar', y: 80 }, 
      { x: 'Apr', y: 81 }, { x: 'May', y: 56 }, { x: 'Jun', y: 55 }
    ],
    style: { lineColor: '#8B5CF6', fillColor: '#8B5CF6' }
  }
];

const sampleBarData: ChartDataset[] = [
  {
    id: 'users',
    label: 'Users',
    data: [
      { x: 'Mon', y: 12 }, { x: 'Tue', y: 19 }, { x: 'Wed', y: 3 }, 
      { x: 'Thu', y: 5 }, { x: 'Fri', y: 2 }
    ],
  }
];

export const LineWidget: Story = {
  args: {
      title: 'Revenue Trend',
      chartData: sampleLineData,
      chartVariant: 'line',
      usePhysics: true,
  },
};

export const BarWidgetNoPhysics: Story = {
  args: {
      title: 'Weekly Users',
      chartData: sampleBarData,
      chartVariant: 'bar',
      usePhysics: false,
  },
}; 