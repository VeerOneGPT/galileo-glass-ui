import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly
import { BottomNavigation, BottomNavigationAction } from '../../src/components/BottomNavigation';
// Import ThemeProvider from main index
import { ThemeProvider } from '../../src';

// Placeholder Icons (Replace with actual icons)
const RestoreIcon = () => <span>Rest</span>;
const FavoriteIcon = () => <span>Fav</span>;
const LocationOnIcon = () => <span>Loc</span>;

const meta: Meta<typeof BottomNavigation> = {
  title: 'Components/BottomNavigation',
  component: BottomNavigation,
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the BottomNavigation component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showLabels: { control: 'boolean' },
    // TODO: Add more argTypes based on BottomNavigationProps
  },
};

export default meta;
type Story = StoryObj<typeof BottomNavigation>;

// TODO: Add more stories and controls

const BasicBottomNavigation = () => {
    const [value, setValue] = useState(0);

    return (
        <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
                // Ensure newValue is treated as a number
                setValue(typeof newValue === 'string' ? parseInt(newValue, 10) : newValue ?? 0);
            }}
        >
            <BottomNavigationAction label="Recents" icon={<RestoreIcon />} value={0} />
            <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} value={1} />
            <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} value={2} />
        </BottomNavigation>
    );
};

export const Default: Story = {
    render: () => <BasicBottomNavigation />,
}; 