import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import ChartWrapper, { ChartWrapperProps } from '../../src/components/Chart/ChartWrapper';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Required for Chart.js v3+

// Import Galileo ThemeProvider
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Remove MUI theme creation
// const theme = createTheme({});

const meta: Meta<typeof ChartWrapper> = {
  title: 'Components/Data Display/ChartWrapper',
  component: ChartWrapper,
  decorators: [
    (Story) => (
      // Use Galileo ThemeProvider
      <ThemeProvider>
        <Box style={{ height: '400px', width: '600px' }}>
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
    // Define argTypes for props like width, height, title, etc.
    // Removed due to lint errors
    // width: { control: 'text' },
    // height: { control: 'text' },
    // title: { control: 'text' },
    // Add other relevant props if known
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Pass props directly here if needed, even without argTypes controls
    width: '100%',
    height: '100%',
    title: 'Chart Title Placeholder',
    children: (
        <Box style={{ border: '1px dashed grey', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Placeholder for Chart Canvas
        </Box>
    )
  },
};

// Add stories for different sizes, states, etc. 