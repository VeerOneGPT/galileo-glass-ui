import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Revert to relative paths as these are not in main export
import { AccessibilitySettings } from '../../src/components/AccessibilitySettings'; 
import { AccessibilityProvider } from '../../src/components/AccessibilityProvider';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

// TODO: Configure AccessibilityProvider if needed for the story

const meta: Meta<typeof AccessibilitySettings> = {
  title: 'Components/AccessibilitySettings',
  component: AccessibilitySettings,
  decorators: [
    (Story) => (
      <ThemeProvider initialColorMode="light" initialTheme="standard">
        <AccessibilityProvider>
          <Story />
        </AccessibilityProvider>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define argTypes for props if needed
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default args for the component
    // Example: isOpen: true, onClose: () => console.log('Close clicked')
    isOpen: true,
    onClose: () => console.log('Accessibility Settings Close Clicked'),
  },
};

// Add more stories as needed to showcase different states or props 