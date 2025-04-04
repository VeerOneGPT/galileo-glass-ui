import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import paths
import { Snackbar } from '../../src/components/Snackbar';
import { Alert } from '../../src/components/Alert'; // Often used inside
import { Button } from '../../src/components/Button';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof Snackbar> = {
  title: 'Components/Feedback/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    onClose: { action: 'onClose' },
    message: { control: 'text' },
    autoHideDuration: { control: 'number' },
    action: { control: 'object' }, // ReactNode, e.g., a Button
    // Add other Snackbar props (TransitionComponent, etc.)
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

// --- Examples ---

// Basic Snackbar triggered by a button
const BasicSnackbar = () => {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ThemeProvider>
        <Box>
            <Button onClick={handleClick}>Open simple snackbar</Button>
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message="Note archived"
            />
        </Box>
    </ThemeProvider>
  );
};
export const Basic: Story = {
  render: () => <BasicSnackbar />,
};

// Snackbar with Action
const SnackbarWithAction = () => {
    const [open, setOpen] = useState(false);
    const handleClick = () => setOpen(true);
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') return;
      setOpen(false);
    };
  
    const action = (
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
    );
  
    return (
      <ThemeProvider>
        <Box>
          <Button onClick={handleClick}>Open snackbar with action</Button>
          <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            message="Note archived (with action)"
            action={action}
          />
        </Box>
      </ThemeProvider>
    );
  };
export const WithAction: Story = {
    render: () => <SnackbarWithAction />,
};

// Snackbar with Alert component inside
const SnackbarWithAlert = () => {
    const [open, setOpen] = useState(false);
    const handleClick = () => setOpen(true);
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') return;
      setOpen(false);
    };
  
    return (
      <ThemeProvider>
        <Box>
          <Button onClick={handleClick}>Open success snackbar</Button>
          <Snackbar 
            open={open} 
            autoHideDuration={6000} 
            onClose={handleClose}
            message={
              <Alert onClose={handleClose} severity="success">
                This is a success message!
              </Alert>
            }
          />
        </Box>
      </ThemeProvider>
    );
  };
export const WithAlert: Story = {
    render: () => <SnackbarWithAlert />,
}; 