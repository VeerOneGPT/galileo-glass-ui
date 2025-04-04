import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
// Import directly
import { Select } from '../../src/components/Select';
import { MenuItem } from '../../src/components/MenuItem';
// Cannot resolve InputLabel
// import { InputLabel } from '../../src/components/Form'; 
import { FormControl } from '../../src/components/Form';
// Import from main index
import { ThemeProvider } from '../../src';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  decorators: [(Story) => <ThemeProvider><div style={{ width: '200px' }}><Story /></div></ThemeProvider>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Placeholder story for the Select component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'select', options: ['filled', 'outlined', 'standard'] },
    disabled: { control: 'boolean' },
    // options: { control: 'object' }, // Add if Select uses options prop
    // TODO: Add more argTypes based on SelectProps
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// TODO: Add more stories and controls

const BasicSelect = () => {
    const [age, setAge] = useState('');

    const handleChange = (event: any) => {
        setAge(event.target.value as string);
    };

    // Use string values for options
    const ageOptions = [
        { value: '10', label: 'Ten' },
        { value: '20', label: 'Twenty' },
        { value: '30', label: 'Thirty' },
    ];

    return (
        <FormControl fullWidth>
            <label id="demo-simple-select-label">Age</label> 
            <Select
                aria-labelledby="demo-simple-select-label"
                value={age}
                label="Age"
                onChange={handleChange}
                options={ageOptions} 
            >
            </Select>
        </FormControl>
    );
}

export const Default: Story = {
    render: () => <BasicSelect />,
}; 