import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Correct import path
import { Modal } from '../../src/components/Modal'; // Assuming this path
import { Button } from '../../src/components/Button';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Paper } from '../../src/components/Paper'; // Often used for modal content
import { Typography } from '../../src/components/Typography';

const meta: Meta<typeof Modal> = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' }, // Control via args for simple demo
    onClose: { action: 'onClose' },
    // Add other Modal props (e.g., disableEscapeKeyDown, keepMounted)
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Basic Modal controlled by args - content is simple text
export const Default: Story = {
  args: {
    open: false, // Start closed, toggle with Storybook controls
    children: (
      <Paper style={{ padding: '20px', minWidth: '300px', outline: 'none' }}>
        <Typography variant="h6">Modal Title</Typography>
        <Typography style={{ marginTop: '10px' }}>
          This is the content inside the modal.
        </Typography>
        {/* Typically add close buttons or forms here */}
      </Paper>
    ),
  },
  decorators: [
    // Need ThemeProvider for Paper/Typography styling
    (Story) => <ThemeProvider><Story /></ThemeProvider>,
  ],
};

// Example using a button to control the open state
const StatefulModal = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box>
      <Button onClick={handleOpen}>Open Modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="stateful-modal-title"
        aria-describedby="stateful-modal-description"
      >
        <Paper style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: 300,
          padding: '20px',
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)', // Example shadow
          outline: 'none'
        }}>
          <Typography variant="h6">
            Stateful Modal
          </Typography>
          <Typography style={{ marginTop: '10px' }}>
            Click outside or press Escape to close (if not disabled).
          </Typography>
          <Button onClick={handleClose} style={{ marginTop: '15px' }}>Close</Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export const ControlledByButton: Story = {
  render: () => <StatefulModal />,
   decorators: [
    (Story) => <ThemeProvider><Story /></ThemeProvider>,
  ],
}; 