import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import path
import { Rating } from '../../src/components/Rating'; 
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { GlassTypography as Typography } from '../../src';

// Placeholder Icons
const FavoriteIcon = () => <span>★</span>;
const FavoriteBorderIcon = () => <span>☆</span>;

const meta: Meta<typeof Rating> = {
  title: 'Components/Inputs/Rating',
  component: Rating,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
    onChange: { action: 'onChange' },
    readOnly: { control: 'boolean' },
    precision: { control: 'number', step: 0.1 },
    max: { control: 'number' },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    highlightSelectedOnly: { control: 'boolean' },
    // Add other Rating props if needed
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

// TODO: Add more stories and controls

// Controlled Rating Example
const ControlledRating = () => {
  const [value, setValue] = useState<number | null>(2);

  return (
    <ThemeProvider>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Typography component="legend">Controlled Rating</Typography>
          <Rating
            name="controlled-rating"
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
          />
           <Typography>Value: {value !== null ? value : 'null'}</Typography>
        </Box>
    </ThemeProvider>
  );
};

export const Controlled: Story = {
  render: () => <ControlledRating />,
};

// Read Only Example
export const ReadOnly: Story = {
  args: {
    value: 3.5,
    readOnly: true,
    precision: 0.5,
  },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

// Disabled Example
export const Disabled: Story = {
  args: {
    value: 3,
    disabled: true,
  },
  decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

// Precision Example (Half ratings)
export const HalfRatings: Story = {
  args: {
    value: 2.5,
    precision: 0.5,
  },
   decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

// Size Example
export const LargeSize: Story = {
  args: {
    value: 4,
    size: 'large',
  },
   decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

export const CustomIcons: Story = {
    args: {
        value: 3,
        // Remove fontSize prop from placeholder icons
        icon: <FavoriteIcon />,
        emptyIcon: <FavoriteBorderIcon />,
    }
} 