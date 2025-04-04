import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { GlassMultiSelect, ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import type { MultiSelectOption } from '../../src/components/MultiSelect/types';

const meta: Meta<typeof GlassMultiSelect> = {
  title: 'Components/Inputs/MultiSelect',
  component: GlassMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    options: { control: 'object' },
    value: { control: 'object' }, // Expects (string | number)[]
    onChange: { action: 'onChange' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    size: { control: 'select', options: ['small', 'medium'] },
    // Add other relevant props (e.g., fullWidth, required, placeholder)
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof GlassMultiSelect>;

const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
  ];

const nameOptions: MultiSelectOption<string>[] = names.map((name, index) => ({ 
    id: `name-${index}`,
    label: name, 
    value: name 
}));

// Basic MultiSelect
export const Basic: Story = {
  args: {
    label: 'Tag',
    options: nameOptions,
  },
  decorators: [
      (Story) => (
          <ThemeProvider>
              <Box style={{ padding: '20px', minHeight: '200px', width: '250px' }}>
                  <Story />
              </Box>
          </ThemeProvider>
      )
  ]
};

// Controlled MultiSelect
const ControlledMultiSelect = () => {
    const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption<string>[]>([]);

    const handleChange = (newSelectedOptions: MultiSelectOption<string>[]) => {
        setSelectedOptions(newSelectedOptions);
    };

    return (
        <ThemeProvider>
            <Box style={{ padding: '20px', minHeight: '200px', width: '300px' }}>
                <GlassMultiSelect<string>
                    label="Name"
                    options={nameOptions}
                    value={selectedOptions}
                    onChange={handleChange}
                />
                <p>Selected: {selectedOptions.map(opt => opt.label).join(', ')}</p>
            </Box>
        </ThemeProvider>
    );
}

export const Controlled: Story = {
    render: () => <ControlledMultiSelect />,
};

// Disabled State
export const Disabled: Story = {
    args: {
        label: 'Disabled',
        options: nameOptions,
        value: [nameOptions[0]],
        disabled: true,
    },
    decorators: Basic.decorators,
};

// Error State
export const Error: Story = {
    args: {
        label: 'Error',
        options: nameOptions,
        error: true,
        helperText: 'Incorrect entry.',
    },
    decorators: Basic.decorators,
}; 