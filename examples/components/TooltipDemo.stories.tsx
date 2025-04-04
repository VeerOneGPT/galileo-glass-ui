import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { Tooltip } from '../../src/components/Tooltip';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Button } from '../../src/components/Button';

// Placeholder Icon
const DeleteIcon = () => <span>🗑️</span>;

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Data Display/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    placement: {
      control: 'select',
      options: [
        'top-start', 'top', 'top-end',
        'left-start', 'left', 'left-end',
        'right-start', 'right', 'right-end',
        'bottom-start', 'bottom', 'bottom-end',
      ],
    },
    arrow: { control: 'boolean' },
    // open, onOpen, onClose, disable*Listener props removed
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [(Story) => <ThemeProvider><Box style={{ padding: '50px' }}><Story /></Box></ThemeProvider>],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Basic Tooltip Example
export const Basic: Story = {
  args: {
    title: 'Add',
    children: <Button>Hover over me</Button>,
  },
};

// Tooltip Wrapping Disabled Button
export const DisabledElement: Story = {
    args: {
      title: 'You cannot click this',
      children: (
        // Tooltip requires a wrapper for disabled elements
        <span> 
          <Button disabled>Disabled Button</Button>
        </span>
      ),
    },
  };

// Different Placements (showing a few)
export const Placements: Story = {
    render: () => (
        <ThemeProvider>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '50px' }}>
                <Tooltip title="Top" placement="top"><Button>Top</Button></Tooltip>
                <Tooltip title="Left" placement="left"><Button>Left</Button></Tooltip>
                <Tooltip title="Right" placement="right"><Button>Right</Button></Tooltip>
                <Tooltip title="Bottom" placement="bottom"><Button>Bottom</Button></Tooltip>
                <Tooltip title="Bottom Start" placement="bottom-start"><Button>Bottom-Start</Button></Tooltip>
                <Tooltip title="Top End" placement="top-end"><Button>Top-End</Button></Tooltip>
            </Box>
        </ThemeProvider>
    )
};

// Tooltip with Arrow
export const WithArrow: Story = {
    args: {
        title: 'Tooltip with arrow',
        arrow: true,
        children: <Button variant="outlined"><DeleteIcon /></Button>,
    },
}; 