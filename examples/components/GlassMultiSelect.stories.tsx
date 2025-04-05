import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GlassMultiSelect } from '../../src/components/MultiSelect/GlassMultiSelect';
import { MultiSelectOption } from '../../src/components/MultiSelect/types';
import { ThemeProvider } from '../../src';

// Sample options with required 'id' and 'label'
const sampleOptions: MultiSelectOption<string>[] = [
  { id: 'opt1', label: 'Option 1', value: 'option-1' },
  { id: 'opt2', label: 'Option 2', value: 'option-2' },
  { id: 'opt3', label: 'Option 3', value: 'option-3' },
  { id: 'opt4', label: 'Option 4 (Disabled)', value: 'option-4', disabled: true },
  { id: 'opt5', label: 'Option 5', value: 'option-5' },
];

const meta: Meta<typeof GlassMultiSelect> = {
  title: 'Components/GlassMultiSelect',
  component: GlassMultiSelect,
  tags: ['autodocs'],
  argTypes: {
    options: { control: 'object' },
    value: { control: 'object' }, // Note: Control might be limited for array of objects
    onChange: { action: 'onChange' },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    physics: { control: 'object' }, // Example: { animationPreset: 'gentle' }
    itemRemoveAnimation: {
      control: 'select',
      options: ['DEFAULT', 'GENTLE', 'SNAPPY', 'BOUNCY'], // Example presets
      description: 'Animation preset for removing selected items.',
    },
    // Add other relevant props if needed
  },
};

export default meta;

// Define the story type using the generic
type Story = StoryObj<typeof GlassMultiSelect<string>>; // Specify string for value type

// --- Story demonstrating correct API usage (Fix #20) ---

const MultiSelectControlled: React.FC = () => {
  // State needs to hold the full MultiSelectOption<string>[] objects
  const [selectedValue, setSelectedValue] = useState<MultiSelectOption<string>[]>([
    sampleOptions[1], // Pre-select Option 2
  ]);

  const handleChange = (newValue: MultiSelectOption<string>[]) => {
    console.log('onChange fired:', newValue);
    setSelectedValue(newValue);
    // Log it via Storybook actions as well
    meta.argTypes?.onChange?.action?.('onChange')(newValue);
  };

  return (
    <GlassMultiSelect<string> // Specify generic type here as well
      label="Select Items"
      options={sampleOptions}
      value={selectedValue}
      onChange={handleChange}
      placeholder="Choose options..."
      physics={{ animationPreset: 'bouncy' }} // Correct physics prop usage
      // Example: Add other props like glassVariant, etc.
    />
  );
};

export const CorrectApiUsage: Story = {
  name: 'Correct API Usage (Fix #20)',
  render: () => <MultiSelectControlled />,
  // We render a controlled component, so args might not be needed here
  // unless we want to set initial state via args for the wrapper.
};

// Story demonstrating item removal animation
export const WithRemoveAnimation: Story = {
  args: {
    options: sampleOptions,
    label: 'Remove Animation (Snappy)',
    placeholder: 'Select options...',
    itemRemoveAnimation: 'SNAPPY', // Use a specific preset
  },
  render: (args) => {
    const [selected, setSelected] = useState<MultiSelectOption<string>[]>([]);
    return <GlassMultiSelect<string> {...args} value={selected} onChange={setSelected} />;
  },
};

// Story demonstrating custom item removal animation config
export const WithCustomRemoveAnimation: Story = {
  args: {
    options: sampleOptions,
    label: 'Remove Animation (Custom Spring)',
    placeholder: 'Select options...',
    itemRemoveAnimation: { tension: 100, friction: 20 }, // Custom config
  },
  render: (args) => {
    const [selected, setSelected] = useState<MultiSelectOption<string>[]>([]);
    return <GlassMultiSelect<string> {...args} value={selected} onChange={setSelected} />;
  },
}; 