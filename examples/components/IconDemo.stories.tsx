import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import Icon and ThemeProvider from main index
import { Icon, ThemeProvider } from '../../src';

// Placeholder specific icons (replace with actual usage if needed)
const AddCircleIcon = () => <span>(+)</span>;
const HomeIcon = () => <span>🏠</span>;

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Icon component (likely wrapping MUI SvgIcon).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: ['inherit', 'action', 'disabled', 'primary', 'secondary', 'error', 'info', 'success', 'warning'] },
    fontSize: { control: 'select', options: ['inherit', 'large', 'medium', 'small'] },
    // TODO: Add more argTypes based on IconProps/SvgIconProps
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

// TODO: Add more stories and controls

export const Default: Story = {
  args: {
    // The actual icon component is passed as children
    children: <HomeIcon />,
    color: 'primary',
    fontSize: 'large',
  },
}; 