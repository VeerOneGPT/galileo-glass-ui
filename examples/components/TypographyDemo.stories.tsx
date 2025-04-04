import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { GlassTypography as Typography } from '../../src/components/Typography';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof Typography> = {
  title: 'Components/Data Display/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'subtitle1', 'subtitle2',
        'body1', 'body2',
        'caption', 'overline', 'button',
        'inherit',
      ],
    },
    color: { control: 'select', options: ['initial', 'inherit', 'primary', 'secondary', 'textPrimary', 'textSecondary', 'error'] },
    align: { control: 'select', options: ['inherit', 'left', 'center', 'right', 'justify'] },
    gutterBottom: { control: 'boolean' },
    noWrap: { control: 'boolean' },
    paragraph: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

// All Variants Example
export const AllVariants: Story = {
  render: (args) => (
    <ThemeProvider>
        <Box style={{ width: '100%', maxWidth: 500 }}>
            <Typography {...args} variant="h1" gutterBottom>
                h1. Heading
            </Typography>
            <Typography {...args} variant="h2" gutterBottom>
                h2. Heading
            </Typography>
            <Typography {...args} variant="h3" gutterBottom>
                h3. Heading
            </Typography>
            <Typography {...args} variant="h4" gutterBottom>
                h4. Heading
            </Typography>
            <Typography {...args} variant="h5" gutterBottom>
                h5. Heading
            </Typography>
            <Typography {...args} variant="h6" gutterBottom>
                h6. Heading
            </Typography>
            <Typography {...args} variant="subtitle1" gutterBottom>
                subtitle1. Lorem ipsum dolor sit amet...
            </Typography>
            <Typography {...args} variant="subtitle2" gutterBottom>
                subtitle2. Lorem ipsum dolor sit amet...
            </Typography>
            <Typography {...args} variant="body1" gutterBottom>
                body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
                blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
                neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum
                quasi quidem quibusdam.
            </Typography>
            <Typography {...args} variant="body2" gutterBottom>
                body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
                blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
                neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti? Eum
                quasi quidem quibusdam.
            </Typography>
            <Typography {...args} variant="button" gutterBottom>
                button text
            </Typography>
            <Typography {...args} variant="caption" gutterBottom>
                caption text
            </Typography>
            <Typography {...args} variant="overline" gutterBottom>
                overline text
            </Typography>
        </Box>
    </ThemeProvider>
  ),
  args: {
  }
};

// Example demonstrating paragraph prop
export const Paragraph: Story = {
    args: {
      variant: 'body1',
      paragraph: true,
      children: 'This text will have bottom margin because paragraph is true. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit.'
    },
    decorators: [(Story) => <ThemeProvider><Box width={300}><Story /></Box></ThemeProvider>],
};

// Example demonstrating color prop
export const TextColor: Story = {
    args: {
      variant: 'h6',
      color: 'secondary',
      children: 'This heading uses the secondary color.'
    },
    decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
}; 