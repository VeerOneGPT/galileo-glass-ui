import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ContextAwareGlass } from '../../src/components/ContextAwareGlass';
import { Box } from '../../src/components/Box';
import { Paper } from '../../src/components/Paper';
import { ThemeProvider } from '../../src';
import { Typography } from '../../src/components/Typography';

const meta: Meta<typeof ContextAwareGlass> = {
  title: 'Components/Advanced/ContextAwareGlass',
  component: ContextAwareGlass,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ display: 'flex', gap: '20px', padding: 20 }}>
          <Paper style={{ padding: 20, width: 200, height: 200, background: 'linear-gradient(to right, #ff7e5f, #feb47b)' }}>
            <Story />
          </Paper>
          <Paper style={{ padding: 20, width: 200, height: 200, background: 'linear-gradient(to right, #00c6ff, #0072ff)' }}>
            <ContextAwareGlass>
              <Box>Content 2</Box>
            </ContextAwareGlass>
          </Paper>
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define argTypes for props like adaptationIntensity, etc.
    // adaptationIntensity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } }, // Removed to fix lint error
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // Need to define how the component renders in the decorator context
  // This default args might apply to the first instance in the decorator
  args: {
    // adaptationIntensity: 0.7, // Removed corresponding arg
    children: <Box>Content 1</Box>,
    // other props...
  },
  // You might need a custom render function if the decorator structure is complex
  // render: (args) => <ContextAwareGlass {...args} />
};

// Add more stories for different adaptation levels, content, etc. 