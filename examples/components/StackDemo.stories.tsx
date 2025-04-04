import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly
import { Stack } from '../../src/components/Stack';
import { Paper } from '../../src/components/Paper';
// Import from main index
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Stack layout component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['row', 'row-reverse', 'column', 'column-reverse'] },
    spacing: { control: 'number' },
    // divider: { control: 'boolean' }, // Needs Divider component imported
    // TODO: Add more argTypes based on StackProps
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

// TODO: Add more stories and controls

const Item = ({ children }: { children: React.ReactNode }) => (
    <div style={{ padding: '8px', textAlign: 'center', border: '1px solid grey', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)' }}>{children}</div>
);

export const VerticalStack: Story = {
  args: {
    spacing: 2,
    children: (
      <>
        <Item>Item 1</Item>
        <Item>Item 2</Item>
        <Item>Item 3</Item>
      </>
    ),
  },
};

export const HorizontalStack: Story = {
    args: {
      ...VerticalStack.args, // Reuse children
      direction: 'row',
    },
};

