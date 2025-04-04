import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path - Adjust if EnhancedGlassTabs is exported differently
import { EnhancedGlassTabs, TabItem } from '../../src/components/Charts/EnhancedGlassTabs';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Placeholder Icons for demo
const FavoriteIcon = () => <span>❤️</span>;
const PersonPinIcon = () => <span>📍</span>;

const meta: Meta<typeof EnhancedGlassTabs> = {
  title: 'Components/Charts/EnhancedGlassTabs', // Place under Charts as per source location
  component: EnhancedGlassTabs,
  tags: ['autodocs'],
  argTypes: {
    tabs: { control: 'object', description: 'Array of tab items (id, label, icon?, badgeCount?, disabled?)' },
    activeTab: { control: 'text', description: 'ID of the currently active tab (controlled)' },
    onChange: { action: 'onChange', description: 'Callback when tab changes (returns tabId)' },
    variant: {
        control: 'select',
        options: ['default', 'elevated', 'outlined', 'text'],
        description: 'Visual variant'
    },
    size: { control: 'select', options: ['small', 'medium', 'large'], description: 'Size of the tabs' },
    color: {
        control: 'select',
        options: ['primary', 'secondary', 'accent', 'light', 'dark'],
        description: 'Color scheme'
    },
    highContrast: { control: 'boolean', description: 'High contrast mode' },
    indicatorAnimation: { control: 'select', options: ['slide', 'fade', 'none'], description: 'Indicator animation' },
    fullWidth: { control: 'boolean', description: 'Stretch tabs to fill width' },
    defaultTab: { control: 'text', description: 'ID of the default active tab (uncontrolled)' },
    physicsEnabled: { control: 'boolean', description: 'Enable physics motion effects' },
    showIndicator: { control: 'boolean', description: 'Show active indicator' },
    textAlign: { control: 'select', options: ['center', 'left', 'right'], description: 'Text alignment' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof EnhancedGlassTabs>;

// Sample Tab Data
const sampleTabsData: TabItem[] = [
    { id: 'recents', label: 'Recents', icon: <FavoriteIcon /> },
    { id: 'favorites', label: 'Favorites', badgeCount: 5 },
    { id: 'nearby', label: 'Nearby', icon: <PersonPinIcon />, disabled: true },
    { id: 'longlabel', label: 'A Tab With A Very Long Label' },
];

// Basic Example (Uncontrolled)
export const Basic: Story = {
  args: {
    tabs: sampleTabsData,
    defaultTab: 'recents', // Use defaultTab for uncontrolled
    variant: 'default',
    color: 'primary',
    size: 'medium',
  },
  decorators: [(Story) => <ThemeProvider><Box style={{ width: '500px' }}><Story /></Box></ThemeProvider>],
};

// Controlled Example
const ControlledEnhancedTabs = () => {
    const [currentTab, setCurrentTab] = useState<string>('favorites');

    return (
        <ThemeProvider>
            <Box style={{ width: '500px', padding: '20px' }}>
                <EnhancedGlassTabs
                    tabs={sampleTabsData}
                    activeTab={currentTab} // Use activeTab for controlled
                    onChange={(tabId) => setCurrentTab(tabId)}
                    variant="elevated"
                    color="secondary"
                />
                <p style={{ marginTop: '16px' }}>Current Tab ID: {currentTab}</p>
            </Box>
        </ThemeProvider>
    );
};

export const Controlled: Story = {
    render: () => <ControlledEnhancedTabs />,
};

// Other Variants Example
export const OutlinedHighContrast: Story = {
    args: {
      ...Basic.args, // Reuse tabs data
      tabs: sampleTabsData, // Ensure tabs are passed explicitly if Basic.args might be undefined
      variant: 'outlined',
      color: 'accent',
      highContrast: true,
      indicatorAnimation: 'fade',
    },
    decorators: Basic.decorators,
};

export const FullWidthText: Story = {
    args: {
        ...Basic.args, // Reuse tabs data
        tabs: sampleTabsData, // Ensure tabs are passed explicitly
        variant: 'text',
        color: 'dark',
        fullWidth: true,
        showIndicator: false,
      },
      decorators: Basic.decorators,
};