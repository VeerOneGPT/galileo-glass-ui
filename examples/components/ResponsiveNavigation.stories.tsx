import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { ResponsiveNavigation } from '../../src/components/Navigation';
import type { ResponsiveNavigationProps, NavigationItem } from '../../src/components/Navigation/types';
import { Box } from '../../src/components/Box';
import { ThemeProvider } from '../../src';
import { Icon } from '../../src/components/Icon';

// Helper to determine active state based on location (example)
const NavigationWrapper = (props: ResponsiveNavigationProps) => {
    const location = useLocation();
    // Example logic: find item whose id matches the current pathname
    const activeItem = props.items?.find(item => item.id === location.pathname)?.id;
    
    // Or manage active state locally if not using router paths as IDs
    // const [activeItemLocal, setActiveItemLocal] = useState('home');
    // const handleItemClick = (id: string) => setActiveItemLocal(id);

    return <ResponsiveNavigation {...props} activeItem={activeItem /* or activeItemLocal */} /* onItemClick={handleItemClick} */ />;
};

const meta: Meta<typeof ResponsiveNavigation> = {
  title: 'Components/Navigation/ResponsiveNavigation',
  component: ResponsiveNavigation,
  decorators: [
    (Story, context) => (
      <MemoryRouter initialEntries={['/']}> 
        <ThemeProvider>
          <Box style={{ minHeight: '300px', width: '100%', position: 'relative', border: '1px dashed grey' }}> 
             {/* Render the wrapper with story args */}
            <NavigationWrapper {...context.args as ResponsiveNavigationProps} />
          </Box>
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
     docs: {
      description: {
        component: 'A navigation component that adapts between desktop (GlassNavigation) and mobile (Drawer/Menu) layouts based on screen width.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: { control: 'object', description: 'Array of navigation item objects (id, label, icon, href)' },
    activeItem: { control: 'text', description: 'ID of the currently active navigation item' },
    mobileBreakpoint: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', 600, 960], description: 'Breakpoint to switch to mobile view' },
    useDrawer: { control: 'boolean', description: 'Use a drawer for mobile menu' },
    mobileMenuPosition: { control: 'radio', options: ['left', 'right'], description: 'Anchor position for mobile drawer' },
    onItemClick: { action: 'itemClicked', description: 'Callback when a navigation item is clicked (passes item id)' },
    logo: { control: 'text', description: 'Logo element (ReactNode) to display' },
    // Add other relevant ResponsiveNavigationProps
  },
};

export default meta;
type Story = StoryObj<ResponsiveNavigationProps>;

// Define items using NavigationItem type
const sampleItems: NavigationItem[] = [
  { id: '/', label: 'Home', icon: <Icon>home</Icon> },
  { id: '/profile', label: 'Profile', icon: <Icon>person</Icon> },
  { id: '/settings', label: 'Settings', icon: <Icon>settings</Icon> },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    // Let wrapper handle activeItem based on router
  },
};

export const MobileWithDrawer: Story = {
  args: {
    items: sampleItems,
    mobileBreakpoint: 'lg',
    useDrawer: true,
  },
   parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'Demonstrates mobile view using a drawer menu.' } }
  }
};

export const MobileWithoutDrawer: Story = {
  args: {
    items: sampleItems,
    mobileBreakpoint: 'lg',
    useDrawer: false,
  },
   parameters: {
    viewport: { defaultViewport: 'mobile1' },
     docs: { description: { story: 'Demonstrates mobile view without a drawer (behavior might depend on underlying GlassNavigation support).' } }
  }
};

export const ActiveStateManual: Story = {
  args: {
    items: sampleItems,
    activeItem: '/profile',
  },
   parameters: {
     docs: { description: { story: 'Attempts to manually set the active item via `activeItem` prop. Requires parent state management if not using router paths.' } }
  }
}; 