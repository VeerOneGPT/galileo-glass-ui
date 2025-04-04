import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { Link } from '../../src/components/Link';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography';

const meta: Meta<typeof Link> = {
  title: 'Components/Navigation/Link',
  component: Link,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    href: { control: 'text' },
    underline: { control: 'select', options: ['none', 'hover', 'always'] },
    color: { control: 'select', options: ['primary', 'secondary', 'textPrimary', 'textSecondary', 'error', 'inherit'] }, // Adjust based on theme
    variant: { control: 'text' }, // e.g., 'body1', 'h6' - inherits from Typography
    // Add other Link props (target, rel)
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

export default meta;
type Story = StoryObj<typeof Link>;

// Basic Link Example
export const Basic: Story = {
  args: {
    children: 'Default Link (underline hover)',
    href: '#', // Prevent navigation in Storybook
  },
};

// Underline Variants Example
export const UnderlineVariants: Story = {
    render: () => (
        <ThemeProvider>
            <Box style={{ display: 'flex', gap: '16px' }}>
                <Link href="#" underline="none">No underline</Link>
                <Link href="#" underline="hover">Underline on hover</Link>
                <Link href="#" underline="always">Always underline</Link>
            </Box>
        </ThemeProvider>
    )
};

// Inheriting Typography Variant
export const InheritVariant: Story = {
    render: () => (
        <ThemeProvider>
          <Typography variant="h6">
            This is H6 text containing a <Link href="#">link</Link> that inherits the variant.
          </Typography>
          <Typography variant="body2">
            This is body2 text containing a <Link href="#" color="secondary">secondary link</Link>.
          </Typography>
      </ThemeProvider>
    ),
};

// Different Colors Example
export const Colors: Story = {
    render: () => (
        <ThemeProvider>
            <Box style={{ display: 'flex', gap: '16px' }}>
                <Link href="#" color="primary">Primary</Link>
                <Link href="#" color="secondary">Secondary</Link>
                <Link href="#" color="error">Error</Link>
                <Link href="#" color="textPrimary">Text Primary</Link>
            </Box>
        </ThemeProvider>
    )
}; 