import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
    DimensionalGlass,
    HeatGlass,
    FrostedGlass,
    PageGlassContainer,
    WidgetGlass,
} from '../../src/components/surfaces';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';

// Base meta configuration
const meta: Meta = {
  title: 'Components/Surfaces',
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ padding: 20, background: 'linear-gradient(to right, #6a11cb, #2575fc)', minHeight: '200px' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

// --- Stories for each surface component ---

// DimensionalGlass
export const Dimensional: StoryObj<typeof DimensionalGlass> = {
    name: 'Dimensional Glass',
    render: (args) => (
        <DimensionalGlass {...args} style={{ padding: 20, width: 200, height: 100, ...args.style }}>
            <Typography>Dimensional</Typography>
        </DimensionalGlass>
    ),
    args: {
        elevation: 3,
    }
};

// HeatGlass
export const Heat: StoryObj<typeof HeatGlass> = {
    name: 'Heat Glass',
    render: (args) => (
        <HeatGlass {...args} style={{ padding: 20, width: 200, height: 100, ...args.style }}>
            <Typography>Heat</Typography>
        </HeatGlass>
    ),
    args: {
        intensity: 0.8,
    }
};

// FrostedGlass
export const Frosted: StoryObj<typeof FrostedGlass> = {
    name: 'Frosted Glass',
    render: (args) => (
        <FrostedGlass {...args} style={{ padding: 20, width: 200, height: 100, ...args.style }}>
            <Typography>Frosted</Typography>
        </FrostedGlass>
    ),
    args: {
        blurAmount: '5px',
    }
};

// PageGlassContainer
export const PageContainer: StoryObj<typeof PageGlassContainer> = {
    name: 'Page Glass Container',
    render: (args) => (
        <PageGlassContainer {...args} style={{ padding: 20, width: 300, height: 150, ...args.style }}>
            <Typography>Page Container</Typography>
        </PageGlassContainer>
    ),
    args: {
       // Props specific to PageGlassContainer
    }
};

// WidgetGlass
export const Widget: StoryObj<typeof WidgetGlass> = {
    name: 'Widget Glass',
    render: (args) => (
        <WidgetGlass {...args} style={{ padding: 20, width: 150, height: 150, ...args.style }}>
            <Typography>Widget</Typography>
        </WidgetGlass>
    ),
    args: {
        // Props specific to WidgetGlass
    }
}; 