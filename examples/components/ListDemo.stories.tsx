import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Import only List and ListItem
import {
    List,
    ListItem
} from '../../src/components/List';
// Removed imports for Button, Icon, Text, Subheader
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Divider } from '../../src/components/Divider';

// Placeholder Icons
const InboxIcon = () => <span>📥</span>;
const DraftsIcon = () => <span>📝</span>;
const SendIcon = () => <span>✉️</span>; // Kept just in case

const meta: Meta<typeof List> = {
  title: 'Components/Data Display/List',
  component: List,
  tags: ['autodocs'],
  argTypes: {
    dense: { control: 'boolean' },
    disablePadding: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
        <ThemeProvider>
            <Box style={{ width: '100%', maxWidth: 360, backgroundColor: '#fff' }}> 
                <Story />
            </Box>
        </ThemeProvider>
    )
  ],
};

export default meta;
type Story = StoryObj<typeof List>;

// Basic List Example - Add empty children
const basicListChildren = (
    <React.Fragment>
        <ListItem primaryText="List Item 1"><></></ListItem>
        <ListItem primaryText="List Item 2"><></></ListItem>
        <Divider />
        <ListItem primaryText="List Item 3"><></></ListItem>
    </React.Fragment>
);
export const Basic: Story = {
  args: {
    children: basicListChildren
  }
};

// List with Icons - Add empty children
const iconListChildren = (
    <React.Fragment>
        <ListItem button icon={<InboxIcon />} primaryText="Inbox"><></></ListItem>
        <ListItem button icon={<DraftsIcon />} primaryText="Drafts"><></></ListItem>
    </React.Fragment>
);
export const WithIcons: Story = {
    args: {
      children: iconListChildren,
    }
  };

// Interactive List Example - Add empty children
export const Interactive: Story = {
    render: () => (
        <ThemeProvider>
            <Box style={{ width: '100%', maxWidth: 360, backgroundColor: '#fff' }}>
                <List component="nav" aria-label="main mailbox folders">
                    <ListItem 
                        button 
                        icon={<InboxIcon />} 
                        primaryText="Inbox" 
                        onClick={() => alert('Inbox clicked')} 
                    >
                        <></>
                    </ListItem>
                    <ListItem 
                        button 
                        icon={<DraftsIcon />} 
                        primaryText="Drafts" 
                        onClick={() => alert('Drafts clicked')} 
                    >
                        <></>
                    </ListItem>
                </List>
            </Box>
        </ThemeProvider>
      )
};

// Dense List - using refactored children
export const Dense: Story = {
    args: {
        dense: true,
        children: iconListChildren, 
      }
}; 