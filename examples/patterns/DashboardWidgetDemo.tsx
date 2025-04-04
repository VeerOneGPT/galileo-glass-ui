import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, CardContent, CardHeader } from '../../src/components/Card';
import { GlassDataChart } from '../../src/components/DataChart'; // Assuming main export is this
import { Typography } from '../../src/components/Typography';
import { Box } from '../../src/components/Box';
import { Icon } from '../../src/components/Icon';
import { ThemeProvider } from '../../src';

// --- Styled Components for Demo ---
const WidgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
  width: 100%;
  max-width: 1200px;
  margin: auto;
`;

// --- Sample Data ---
const sampleLineData = [
  {
    id: 'users-line',
    label: 'Users',
    data: [
      { x: 'Jan', y: 65 },
      { x: 'Feb', y: 59 },
      { x: 'Mar', y: 80 },
      { x: 'Apr', y: 81 },
      { x: 'May', y: 56 },
      { x: 'Jun', y: 55 },
      { x: 'Jul', y: 40 },
    ],
    tension: 0.3,
    pointRadius: 3,
  },
];

const sampleBarData = [
  {
    id: 'sales-bar',
    label: 'Sales',
    data: [
      { x: 'Mon', y: 12 },
      { x: 'Tue', y: 19 },
      { x: 'Wed', y: 3 },
      { x: 'Thu', y: 5 },
      { x: 'Fri', y: 2 },
    ],
    barThickness: 20,
  },
];

const sampleAreaData = [
  {
    id: 'revenue-area',
    label: 'Revenue',
    data: [
      { x: 'Q1', y: 200 },
      { x: 'Q2', y: 350 },
      { x: 'Q3', y: 300 },
      { x: 'Q4', y: 450 },
    ],
    fill: true,
    fillOpacity: 0.5,
    tension: 0.2,
  },
];

// --- Dashboard Widget Demo Component ---
const DashboardWidgetDemo = () => {
  return (
    <ThemeProvider>
      <Box style={{ backgroundColor: '#eee', minHeight: '100vh' }}> 
        <Typography variant="h4" style={{ textAlign: 'center', padding: '24px 0' }}>
          Composite Dashboard Example
        </Typography>
        <WidgetGrid>
          {/* Widget 1: Line Chart */}
          <Card elevation={2} padding='medium'>
            <CardHeader title="Active Users" />
            <CardContent>
              <GlassDataChart
                variant="line"
                datasets={sampleLineData}
                height={250}
                glassVariant='frosted'
                interaction={{ zoomPanEnabled: true, physicsHoverEffects: true }}
                axis={{ showXGrid: false }}
                legend={{ show: false }}
                showToolbar={false}
              />
            </CardContent>
          </Card>

          {/* Widget 2: Bar Chart */}
          <Card elevation={2} padding='medium'>
            <CardHeader title="Weekly Sales" />
            <CardContent>
              <GlassDataChart
                variant="bar"
                datasets={sampleBarData}
                height={250}
                glassVariant='tinted'
                color="secondary"
                legend={{ show: false }}
                showToolbar={false}
              />
            </CardContent>
          </Card>

          {/* Widget 3: Area Chart */}
          <Card elevation={2} padding='medium'>
            <CardHeader title="Quarterly Revenue" />
            <CardContent>
              <GlassDataChart
                variant="area"
                datasets={sampleAreaData}
                height={250}
                glassVariant='frosted'
                color="success"
                interaction={{ zoomPanEnabled: true, physicsHoverEffects: true }}
                axis={{ showYGrid: false }}
                legend={{ show: false }}
                showToolbar={false}
              />
            </CardContent>
          </Card>

          {/* Add more widgets as needed */}

        </WidgetGrid>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardWidgetDemo;

// Basic Storybook setup (can be moved to a separate .stories.tsx file)
export const DashboardWidgetStory = () => <DashboardWidgetDemo />;
DashboardWidgetStory.storyName = 'Dashboard Widget Demo'; 