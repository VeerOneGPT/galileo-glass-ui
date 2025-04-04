import React, { useState, MouseEvent } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Correct the import paths
import { Menu } from '../../src/components/Menu'; // Assuming this path
import { MenuItem } from '../../src/components/MenuItem'; // Assuming this path
import { Button } from '../../src/components/Button';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof Menu> = {
  title: 'Components/Navigation/Menu',
  component: Menu,
  // Note: Menu needs an anchor element, so direct rendering isn't ideal.
  // We'll render it via a button click in the story.
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Props of Menu itself
    anchorEl: { control: false }, // Controlled internally in story
    open: { control: false },     // Controlled internally in story
    onClose: { action: 'onClose' },
    // Add other Menu props if needed
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

// Story that renders a button to open the menu
const MenuExample = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    // Log the action if needed
    console.log('onClose called'); 
  };

  return (
    <ThemeProvider>
      <Box style={{ padding: '20px' }}>
        <Button
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          Open Menu
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          {/* Assuming MenuItem component exists and takes children/onClick */}
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Box>
    </ThemeProvider>
  );
};

export const Default: Story = {
  render: () => <MenuExample />,
}; 