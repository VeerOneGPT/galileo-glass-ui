import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { Skeleton } from '../../src/components/Skeleton';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Avatar } from '../../src/components/Avatar'; // For context
import { Typography } from '../../src/components/Typography'; // For context

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Feedback/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular', 'rounded'], // Assuming 'rounded' exists
    },
    width: { control: 'text' }, // Allow number or string like '80%'
    height: { control: 'text' }, // Allow number or string
    animation: {
      control: 'select',
      options: ['pulse', 'wave', false],
    },
    // Add other Skeleton props if any
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = {
  args: {
    variant: 'text',
    width: '80%',
    height: 20,
  },
  decorators: [(Story) => <ThemeProvider><Box width={200}><Story /></Box></ThemeProvider>],
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 40,
    height: 40,
  },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: 210,
    height: 118,
  },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

export const Rounded: Story = {
    args: {
      variant: 'rounded', // Assuming this variant exists
      width: 210,
      height: 60,
    },
    decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  };

export const WaveAnimation: Story = {
  args: {
    variant: 'rectangular',
    width: 210,
    height: 118,
    animation: 'wave',
  },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

export const NoAnimation: Story = {
    args: {
      variant: 'rectangular',
      width: 210,
      height: 118,
      animation: false,
    },
    decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  };

// Example showing Skeleton used in place of content
const SkeletonContextExample = () => (
  <ThemeProvider>
    <Box style={{ display: 'flex', alignItems: 'center', gap: '16px', width: 300 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box style={{ flexGrow: 1 }}>
        <Skeleton variant="text" height={20} width="80%" />
        <Skeleton variant="text" height={20} width="60%" />
      </Box>
    </Box>
    <Box style={{ display: 'flex', alignItems: 'center', gap: '16px', width: 300, marginTop: '16px' }}>
        <Avatar>G</Avatar>
        <Box style={{ flexGrow: 1 }}>
            <Typography variant='body1'>Actual Content</Typography>
            <Typography variant='body2'>Loaded Subtext</Typography>
        </Box>
    </Box>
  </ThemeProvider>
);

export const UsageExample: Story = {
    render: () => <SkeletonContextExample />,
    parameters: { controls: { hideNoControlsWarning: true } }, // Hide controls for render func
}; 