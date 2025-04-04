import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Autocomplete } from '../../src/components/Autocomplete'; // Corrected path
import { TextField } from '../../src/components/TextField'; // Corrected path
import { ThemeProvider } from '../../src'; // Assuming ThemeProvider is exported from src index

// Define the type for an option
interface FilmOptionType {
  label: string;
  year: number;
  value: string;
}

// Sample options - ensure they match the updated type if needed
// (In this case, we can derive value from label if necessary, but let's assume they exist)
const topFilms: FilmOptionType[] = [
  { label: 'The Shawshank Redemption', year: 1994, value: 'The Shawshank Redemption' },
  { label: 'The Godfather', year: 1972, value: 'The Godfather' },
  { label: 'The Dark Knight', year: 2008, value: 'The Dark Knight' },
  { label: '12 Angry Men', year: 1957, value: '12 Angry Men' },
  { label: "Schindler's List", year: 1993, value: "Schindler's List" },
];

const meta: Meta<typeof Autocomplete<FilmOptionType>> = {
  title: 'Components/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
  argTypes: {
    options: { control: 'object' },
    value: { control: 'object' },
    onChange: { action: 'onChange' },
    label: { control: 'text' },
    // Add other relevant props
  },
};

export default meta;

type Story = StoryObj<typeof Autocomplete<FilmOptionType>>;

// Basic Controlled Autocomplete Story
const AutocompleteControlled: React.FC = () => {
  const [value, setValue] = useState<FilmOptionType | null>(null);
  const [inputValue, setInputValue] = useState('');

  return (
    <ThemeProvider>
      <Autocomplete<FilmOptionType>
        options={topFilms}
        value={value}
        onChange={(newValue: FilmOptionType | FilmOptionType[] | null) => {
          const singleValue = Array.isArray(newValue) ? newValue[0] ?? null : newValue;
          setValue(singleValue);
          meta.argTypes?.onChange?.action?.('onChange')(singleValue);
        }}
        inputValue={inputValue}
        onInputChange={(event: any, newInputValue: string) => {
          setInputValue(newInputValue);
        }}
        // getOptionLabel is often required to display the option
        getOptionLabel={(option) => option.label}
        // isOptionEqualToValue might be needed for object comparison
        isOptionEqualToValue={(option, val) => option.label === val.label}
        renderInput={(params) => <TextField {...params} label="Movie" />}
        style={{ width: 300 }}
      />
    </ThemeProvider>
  );
};

export const BasicRenderCheck: Story = {
  name: 'Basic Autocomplete',
  render: () => (
    <AutocompleteControlled />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic autocomplete component with a list of film options. Ensure proper selection and display of options.',
      },
    },
  }
};

// Let's add a simpler story that might work better
export const SimpleAutocomplete: Story = {
  name: 'Simple Autocomplete',
  render: () => (
    <ThemeProvider>
      <Autocomplete<FilmOptionType>
        options={topFilms}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <TextField 
            {...params}
            label="Movie"
            variant="filled"
            size="medium"
            fullWidth
          />
        )}
        style={{ width: 300 }}
      />
    </ThemeProvider>
  ),
};

// Add a very basic autocomplete with minimal props
export const MinimalAutocomplete: Story = {
  name: 'Minimal Autocomplete',
  render: () => (
    <ThemeProvider>
      <div style={{ width: 300 }}>
        <Autocomplete
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' }
          ]}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Basic Options" 
              variant="standard"
            />
          )}
        />
      </div>
    </ThemeProvider>
  ),
}; 