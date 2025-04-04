import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { Fab } from '../../src/components/Fab';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Placeholder Icons
const AddIcon = () => <span>+</span>;
const EditIcon = () => <span>✏️</span>;
const FavoriteIcon = () => <span>❤️</span>;
const NavigationIcon = () => <span>🧭</span>;

const meta: Meta<typeof Fab> = {
  title: 'Components/Inputs/FloatingActionButton',
  component: Fab,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: ['primary', 'secondary', 'inherit', 'default', 'success', 'error', 'warning', 'info'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    variant: { control: 'select', options: ['circular', 'extended'] }, // circular is default
    disabled: { control: 'boolean' },
    href: { control: 'text' },
    // Add other Fab props (e.g., sx, component)
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

export default meta;
type Story = StoryObj<typeof Fab>;

// Basic FAB Example
export const Basic: Story = {
  args: {
    color: 'primary',
    children: <AddIcon />,
  },
};

// Different Sizes
export const Sizes: Story = {
    render: () => (
        <ThemeProvider>
            <Box style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <Fab size="small" color="secondary">
                    <EditIcon />
                </Fab>
                <Fab size="medium" color="success">
                    <FavoriteIcon />
                </Fab>
                <Fab size="large" color="info">
                    <NavigationIcon />
                </Fab>
            </Box>
        </ThemeProvider>
      ),
};

// Extended FAB
export const Extended: Story = {
    args: {
        variant: 'extended',
        color: 'primary',
        children: (
            <>
              <NavigationIcon />
              Navigate
            </>
          ),
      },
};

// Disabled FAB
export const Disabled: Story = {
    args: {
        disabled: true,
        children: <AddIcon />,
    },
}; 