import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { Toolbar } from '../../src/components/Toolbar';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Typography } from '../../src/components/Typography'; // Common Toolbar item
import { Button } from '../../src/components/Button'; // Use Button instead

// Placeholder Icons
const MenuIcon = () => <span>☰</span>; // Placeholder
const SearchIcon = () => <span>🔍</span>; // Placeholder
const MoreIcon = () => <span>⋮</span>; // Placeholder

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Surfaces/Toolbar', 
  component: Toolbar,
  tags: ['autodocs'],
  argTypes: {
    disableGutters: { control: 'boolean' },
    variant: { control: 'select', options: ['regular', 'dense'] },
    // Add other Toolbar props
  },
  parameters: {
    layout: 'fullscreen', // Toolbars usually span width
    // Add notes about Toolbar usage context if needed
  },
  // Decorator to provide ThemeProvider and basic layout
  decorators: [
    (Story) => (
        <ThemeProvider>
            {/* Remove AppBar wrapper, Toolbar should be placed in context by user */}
            <Box style={{ padding: '10px', border: '1px dashed grey' }}> 
                {/* Added padding/border to visualize Toolbar boundaries */}
                <Story />
            </Box>
        </ThemeProvider>
    ),
  ]
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Basic: Story = {
  args: {
    children: (
      <React.Fragment>
        {/* Replace IconButton with styled Button */}
        <Button
          variant="text" // Use text variant for icon button feel
          // color="inherit" // Button does not accept 'inherit', remove or use 'default'
          aria-label="menu"
          style={{ 
            marginRight: '16px', 
            minWidth: 'auto', // Remove default button padding/width
            padding: '8px', // Add specific padding
            borderRadius: '50%' // Make it round like an icon button
          }}
          // size="large" // Button size prop might differ, use padding/style
          // edge="start" // Not a standard Button prop
        >
          <MenuIcon />
        </Button>
        <Typography variant="h6" component="div" style={{ flexGrow: 1 }}>
          News
        </Typography>
        {/* Replace IconButton */}
        <Button 
          variant="text" 
          // color="inherit" 
          aria-label="search"
          style={{ minWidth: 'auto', padding: '8px', borderRadius: '50%' }}
        >
          <SearchIcon />
        </Button>
        {/* Replace IconButton */}
        <Button 
          variant="text" 
          // color="inherit" 
          aria-label="more options"
          style={{ minWidth: 'auto', padding: '8px', borderRadius: '50%' }}
          // edge="end" // Not a standard Button prop
        >
          <MoreIcon />
        </Button>
      </React.Fragment>
    ),
  },
};

export const Dense: Story = {
  args: {
    ...Basic.args, // Reuse children from Basic
    variant: 'dense',
  },
};

export const DisableGutters: Story = {
    args: {
      ...Basic.args, // Reuse children from Basic
      disableGutters: true,
    },
  }; 