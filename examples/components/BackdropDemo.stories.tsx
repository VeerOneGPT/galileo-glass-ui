import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import Backdrop directly
import { Backdrop } from '../../src/components/Backdrop';
// Import Button and ThemeProvider from main index
import { Button, ThemeProvider } from '../../src'; 
// Import Progress component
import { Progress } from '../../src/components/Progress';
// Try importing CircularProgress from Loader directory
// import { CircularProgress } from '../../src/components/Loader'; 

const meta: Meta<typeof Backdrop> = {
  title: 'Components/Backdrop',
  component: Backdrop,
  // Need ThemeProvider for styling
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>], 
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Backdrop component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    // TODO: Add more argTypes based on BackdropProps
  },
};

export default meta;
type Story = StoryObj<typeof Backdrop>;

// TODO: Add more stories and controls

const BackdropWithControls = () => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <div>
      <Button onClick={handleToggle}>Show backdrop</Button>
      <Backdrop
        // sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} // sx prop might not exist directly on Backdrop
        style={{ color: '#fff', zIndex: 1300 }} // Use style prop
        open={open}
        onClick={handleClose}
      >
        {/* TODO: Replace with CircularProgress if found/exported */}
        <Progress /> 
      </Backdrop>
    </div>
  );
};


export const Default: Story = {
    render: () => <BackdropWithControls />,
    args: {
        // Props are controlled by the wrapper component
    }
}; 