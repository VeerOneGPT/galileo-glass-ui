import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import the specific Glass component
import {
  GlassDateRangePicker,
  ThemeProvider,
} from '../../src'; // Adjust path if needed
import { GlassLocalizationProvider } from '../../src/components/DatePicker/GlassLocalizationProvider';
import { createDateFnsAdapter } from '../../src/components/DatePicker/adapters/dateFnsAdapter';
import { Box } from '../../src/components/Box';

// Potentially needs LocalizationProvider wrapper from @mui/x-date-pickers
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const meta: Meta<typeof GlassDateRangePicker> = {
  title: 'Components/Inputs/DateRangePicker', // Categorize as Input
  component: GlassDateRangePicker,
  decorators: [
    (Story) => (
      <ThemeProvider>
        {/* Use Galileo's LocalizationProvider with a date adapter (e.g., date-fns) */}
        <GlassLocalizationProvider adapter={createDateFnsAdapter()}>
          <Box style={{ padding: '20px', minWidth: '300px' }}>
            <Story />
          </Box>
        </GlassLocalizationProvider>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'object' }, // Format: { startDate: Date | null, endDate: Date | null }
    onChange: { action: 'onChange' },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    // Add other relevant props from GlassDateRangePicker
  },
  parameters: {
    notes: 'Relies on GlassLocalizationProvider being present in the component tree with a configured date adapter (e.g., date-fns or dayjs). Remember to install the chosen date utility library (npm install date-fns).'
  }
};

export default meta;
type Story = StoryObj<typeof GlassDateRangePicker>;

// Basic controllable story
export const Default: Story = {
  args: {
    label: 'Select Date Range',
    value: { startDate: null, endDate: null },
    // onChange action will log changes in Storybook
  },
};

// Example with initial value
export const WithInitialValue: Story = {
  args: {
    ...Default.args,
    label: 'Pre-filled Range',
    value: { startDate: new Date(2024, 3, 10), endDate: new Date(2024, 3, 20) }, 
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    ...Default.args,
    label: 'Disabled Picker',
    disabled: true,
  },
}; 