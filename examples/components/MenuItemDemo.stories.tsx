import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Correct the import path
import { MenuItem } from '../../src/components/MenuItem'; // Assuming this path
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

const meta: Meta<typeof MenuItem> = {
  title: 'Components/Navigation/MenuItem',
  component: MenuItem,
  decorators: [
    (Story) => (
      <ThemeProvider>
        {/* Render inside a Box to mimic being in a list/menu */}
        <Box style={{ width: '200px', border: '1px solid #eee', padding: '8px 0' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    onClick: { action: 'onClick' },
    // Add other relevant props if MenuItem has them (e.g., selected)
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic MenuItem
export const Default: Story = {
  args: {
    children: 'Menu Item 1',
  },
};

// Disabled MenuItem
export const Disabled: Story = {
  args: {
    children: 'Disabled Item',
    disabled: true,
  },
};

// With an icon (if supported - requires Icon component)
// import { Icon } from '../../src/components/Icon';
// export const WithIcon: Story = {
//   args: {
//     children: <><Icon>person</Icon> Profile</>,
//   },
// }; 