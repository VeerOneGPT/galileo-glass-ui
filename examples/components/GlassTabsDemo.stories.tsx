import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import from main index
import { GlassTabs, ThemeProvider, Button, TextField, Box } from '../../src'; 
import type { GlassTabItem, GlassTabsVariant, GlassTabsVerticalAlign } from '../../src/components/GlassTabs/GlassTabs'; // Corrected import path
import { PhysicsAnimationProps } from '../../src/components/DataChart/hooks/usePhysicsAnimation'; // Import for physics type

const meta: Meta<typeof GlassTabs> = {
  title: 'Components/GlassTabs',
  component: GlassTabs,
  decorators: [(Story) => <ThemeProvider><Box p={4}><Story /></Box></ThemeProvider>],
  parameters: {
    docs: {
      description: {
        component: 'A tabbed interface with glass styling and animated indicator.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tabs: {
      control: 'object',
      description: 'Array of tab items (id, label, content)',
    },
    defaultTab: {
      control: 'text',
      description: 'ID of the initially active tab',
    },
    variant: {
      control: 'select',
      options: ['equal', 'auto', 'scrollable'] as GlassTabsVariant[],
      description: 'Controls tab sizing and overflow behavior',
      defaultValue: 'equal',
    },
    verticalAlign: {
        control: 'select',
        options: ['top', 'center', 'bottom', 'stretch'] as GlassTabsVerticalAlign[],
        description: 'Controls vertical alignment of tabs within the list container',
        defaultValue: 'center',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when active tab changes (receives tabId)',
    },
    physics: {
        control: 'object',
        description: 'Physics config for indicator animation (stiffness, damping, mass)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// TODO: Add more stories and controls

// Remove explicit type for sampleTabs
const sampleTabs: GlassTabItem[] = [
  { id: 'profile', label: 'Profile', content: <div>User profile information goes here.<br/>Line 2 for height.</div> },
  { id: 'settings', label: 'Settings', content: <div>Configuration settings appear here.</div> },
  { id: 'notifications', label: 'Notifications', content: <div>Recent notifications listed here.<br/>Line 2<br/>Line 3</div> },
];

// Sample tabs with longer labels
const longLabelTabs: GlassTabItem[] = [
  { id: 'dashboard', label: 'Main Dashboard Overview', content: <div>Dashboard widgets and summaries.</div> },
  { id: 'analytics', label: 'Detailed Analytics & Reports', content: <div>Charts and data tables for analytics.</div> },
  { id: 'integrations', label: 'Third-Party Integrations', content: <div>Manage connected applications.</div> },
  { id: 'support', label: 'Help & Support Center', content: <div>FAQs and contact information.<br/>With an extra line.</div> },
  { id: 'billing', label: 'Account Billing', content: <div>Subscription and payment details.</div> },
];

// Base story - uses controls
export const Default: Story = {
  args: {
    tabs: sampleTabs,
    defaultTab: 'profile',
    variant: 'equal',
    verticalAlign: 'center',
  },
};

// Equal variant (explicit)
export const EqualVariant: Story = {
  args: {
    ...Default.args,
    variant: 'equal',
  },
  parameters: { docs: { description: { story: 'Tabs stretch to fill the available width equally (default behavior).' } } }
};

// Auto variant
export const AutoVariant: Story = {
  args: {
    ...Default.args,
    variant: 'auto',
  },
  parameters: { docs: { description: { story: 'Tabs size themselves based on their content width.' } } }
};

// Scrollable variant
export const ScrollableVariant: Story = {
  args: {
    ...Default.args,
    tabs: longLabelTabs, // Use longer labels to demonstrate scrolling
    defaultTab: 'dashboard',
    variant: 'scrollable',
  },
  decorators: [(Story) => <ThemeProvider><div style={{ maxWidth: '450px', padding: '20px', border: '1px dashed grey' }}><Story /></div></ThemeProvider>], // More constrained width
  parameters: { docs: { description: { story: 'Tabs size automatically. If they overflow the container, horizontal scrolling is enabled.' } } }
};

// Customized Physics
export const CustomPhysics: Story = {
    args: {
        ...Default.args,
        physics: {
            stiffness: 100,
            damping: 10,
            mass: 0.5
        },
    },
    parameters: { docs: { description: { story: 'Demonstrates customizing the physics properties of the active indicator animation.' } } }
};

// --- Stories for Vertical Alignment (Task 11) ---

export const VerticalAlignTop: Story = {
    args: {
        ...Default.args,
        tabs: sampleTabs, // Use tabs with varying heights
        verticalAlign: 'top',
        variant: 'auto', // More visible with auto variant
    },
    parameters: { docs: { description: { story: 'Aligns tabs to the top of the container.' } } }
};

export const VerticalAlignCenter: Story = {
    args: {
        ...Default.args,
        tabs: sampleTabs, // Use tabs with varying heights
        verticalAlign: 'center',
        variant: 'auto',
    },
    parameters: { docs: { description: { story: 'Aligns tabs to the center vertically (default behavior).' } } }
};

export const VerticalAlignBottom: Story = {
    args: {
        ...Default.args,
        tabs: sampleTabs, // Use tabs with varying heights
        verticalAlign: 'bottom',
        variant: 'auto',
    },
    parameters: { docs: { description: { story: 'Aligns tabs to the bottom of the container.' } } }
};

export const VerticalAlignStretch: Story = {
    args: {
        ...Default.args,
        tabs: sampleTabs, // Use tabs with varying heights
        verticalAlign: 'stretch',
        variant: 'auto',
    },
    parameters: { docs: { description: { story: 'Stretches tabs to fill the container height.' } } }
};

// --- End Task 11 Stories --- 