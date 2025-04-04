import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Drawer } from '../../src/components/Drawer';
import { Button } from '../../src/components/Button';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { List, ListItem } from '../../src/components/List';
import { Divider } from '../../src/components/Divider';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Navigation/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    anchor: { control: 'select', options: ['left', 'right', 'top', 'bottom'] },
    open: { control: 'boolean' },
    variant: { control: 'select', options: ['permanent', 'persistent', 'temporary'] },
    onClose: { action: 'onClose' },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const DrawerList = (toggleDrawer?: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void) => (
  <Box
    style={{ width: 250 }}
    onClick={toggleDrawer ? toggleDrawer(false) : undefined}
  >
    <List>
      {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text) => (
        <ListItem key={text} button>
          {text}
        </ListItem>
      ))}
    </List>
    <Divider />
    <List>
      {['All mail', 'Trash', 'Spam'].map((text) => (
        <ListItem key={text} button>
          {text}
        </ListItem>
      ))}
    </List>
  </Box>
);

const TemporaryDrawerExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setIsOpen(open);
  };

  return (
    <ThemeProvider>
       <Box style={{ padding: '20px' }}>
         <Button onClick={toggleDrawer(true)}>Open Drawer (Left)</Button>
         <Drawer
            anchor="left"
            open={isOpen}
            onClose={toggleDrawer(false)}
            variant="temporary"
          >
            {DrawerList(toggleDrawer)}
          </Drawer>
       </Box>
    </ThemeProvider>
  );
}

export const Temporary: Story = {
  render: () => <TemporaryDrawerExample />,
};

export const Permanent: Story = {
  args: {
    variant: 'permanent',
    anchor: 'left',
    open: true,
    children: DrawerList(),
  },
   decorators: [
    (Story) => (
      <ThemeProvider>
         <Box style={{ display: 'flex', height: '300px', border: '1px dashed grey' }}> 
          <Story />
          <Box component="main" style={{ flexGrow: 1, padding: '20px' }}>
            Main Content Area
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
}; 