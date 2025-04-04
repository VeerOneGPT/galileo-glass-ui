import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Adjust import paths for sub-components
import {
    SpeedDial,
    SpeedDialIcon,
    SpeedDialAction
} from '../../src/components/SpeedDial';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Placeholder Icons - Replace with actual icons (@mui/icons-material or similar)
const FileCopyIcon = () => <span>📄</span>; // Placeholder
const SaveIcon = () => <span>💾</span>; // Placeholder
const PrintIcon = () => <span>🖨️</span>; // Placeholder
const ShareIcon = () => <span>🔗</span>; // Placeholder
const EditIcon = () => <span>✏️</span>; // Placeholder

const meta: Meta<typeof SpeedDial> = {
  title: 'Components/Navigation/SpeedDial',
  component: SpeedDial,
  tags: ['autodocs'],
  argTypes: {
    ariaLabel: { control: 'text', defaultValue: 'SpeedDial example' },
    icon: { control: 'object' }, // Often a SpeedDialIcon component
    direction: { control: 'select', options: ['up', 'down', 'left', 'right'] },
    hidden: { control: 'boolean' },
    // Add other SpeedDial props (e.g., FabProps, TransitionProps)
  },
  parameters: {
    layout: 'centered', // Or 'fullscreen' depending on desired context
  },
};

export default meta;
type Story = StoryObj<typeof SpeedDial>;

const actions = [
  { icon: <FileCopyIcon />, name: 'Copy' },
  { icon: <SaveIcon />, name: 'Save' },
  { icon: <PrintIcon />, name: 'Print' },
  { icon: <ShareIcon />, name: 'Share' },
];

// Basic controllable SpeedDial
const BasicSpeedDial = () => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <ThemeProvider>
            {/* Box needed for positioning context */}
            <Box style={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1, position: 'relative' }}> 
                <SpeedDial
                    ariaLabel="SpeedDial basic example"
                    style={{ position: 'absolute', bottom: 16, right: 16 }}
                    icon={<SpeedDialIcon openIcon={<EditIcon />} />}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    open={open}
                    direction="up"
                    actions={actions}
                />
            </Box>
        </ThemeProvider>
    );
};

export const Basic: Story = {
    render: () => <BasicSpeedDial />,
};

// Example with direction down
export const DirectionDown: Story = {
    args: {
        ariaLabel: 'SpeedDial direction down',
        style: { position: 'absolute', top: 16, left: 16 }, // Adjust position
        icon: <SpeedDialIcon />,
        direction: 'down',
        actions: actions, // Pass actions array directly as a prop
    },
    decorators: [
        (Story) => (
            <ThemeProvider>
                <Box style={{ height: 320, position: 'relative' }}>
                    <Story />
                </Box>
            </ThemeProvider>
        )
    ],
    parameters: { controls: { include: ['ariaLabel', 'icon', 'direction', 'hidden'] } } // Limit controls for args example
}; 