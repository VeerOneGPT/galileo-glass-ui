import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { ThemeProvider } from '../../../src/theme/ThemeProvider';
import {
  EnhancedGlassTabs,
} from '../../../src/components/Charts'; // Updated path
import { Typography } from '../../../src/components/Typography';

// --- Sample Data ---
const demoTabs = [
  { id: 'overview', label: 'Overview', badgeCount: 3 },
  { id: 'details', label: 'Details' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'settings', label: 'Settings', disabled: true },
];

const demoTabsSimple = [
  { id: 'tab1', label: 'Tab One' },
  { id: 'tab2', label: 'Tab Two' },
  { id: 'tab3', label: 'Tab Three' },
];

// --- Styled Components ---
const StoryContainer = styled.div`
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  display: flex;
  flex-direction: column;
  gap: 2rem;
  border-radius: 8px;
`;

const TabsWrapper = styled.div`
    max-width: 500px;
    margin-bottom: 1rem;
`;

// --- Storybook Configuration ---
export default {
  title: 'Components/Charts/OldEnhancedGlassTabs',
  component: EnhancedGlassTabs,
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="dark" initialColorMode="dark">
        <StoryContainer>
            <Typography variant="body1">Tabs Container:</Typography>
            <Story />
        </StoryContainer>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    notes: 'Enhanced tabs component with glass styling and physics interactions, often used within charts.',
  },
  argTypes: {
    tabs: { control: 'object' },
    activeTab: { control: 'text' }, // Active tab ID
    onChange: { action: 'onChange' },
    variant: { control: 'radio', options: ['default', 'elevated', 'text'] },
    size: { control: 'radio', options: ['small', 'medium', 'large'] },
    color: { control: 'select', options: ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] },
    physicsEnabled: { control: 'boolean' },
    highContrast: { control: 'boolean' },
    // Add other EnhancedGlassTabs specific props
  },
} as Meta<typeof EnhancedGlassTabs>;

// --- Template ---
const Template: StoryFn<React.ComponentProps<typeof EnhancedGlassTabs>> = (args) => {
  // Use local state to control active tab for the story interaction
  const [currentTab, setCurrentTab] = useState(args.activeTab || (args.tabs && args.tabs.length > 0 ? args.tabs[0].id : ''));

  // Update local state when args.activeTab changes (e.g., from controls)
  React.useEffect(() => {
    setCurrentTab(args.activeTab || (args.tabs && args.tabs.length > 0 ? args.tabs[0].id : ''));
  }, [args.activeTab, args.tabs]);

  const handleChange = (newTabId: string) => {
    setCurrentTab(newTabId);
    args.onChange?.(newTabId); // Forward action to Storybook logger
  };

  return (
    <TabsWrapper>
        <EnhancedGlassTabs
            {...args}
            activeTab={currentTab}
            onChange={handleChange}
        />
    </TabsWrapper>
  );
};

// --- Stories ---
export const Default = Template.bind({});
Default.args = {
  tabs: demoTabs,
  variant: 'default',
  size: 'medium',
  color: 'primary',
  physicsEnabled: true,
  highContrast: false,
};

export const Elevated = Template.bind({});
Elevated.args = {
  ...Default.args,
  tabs: demoTabsSimple,
  variant: 'elevated',
  color: 'secondary',
};

export const Text = Template.bind({});
Text.args = {
  ...Default.args,
  tabs: demoTabsSimple,
  variant: 'text',
  color: 'accent',
};

export const HighContrast = Template.bind({});
HighContrast.args = {
  ...Default.args,
  highContrast: true,
};

export const SmallSize = Template.bind({});
SmallSize.args = {
  ...Default.args,
  tabs: demoTabsSimple,
  size: 'small',
};

export const LargeSize = Template.bind({});
LargeSize.args = {
  ...Default.args,
  tabs: demoTabsSimple,
  size: 'large',
}; 