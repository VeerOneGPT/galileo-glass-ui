import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
// Assuming import paths
import { ToggleButton } from '../../src/components/ToggleButton/ToggleButton';
import { ToggleButtonGroup } from '../../src/components/ToggleButton/ToggleButtonGroup';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';

// Placeholder Icons
const FormatAlignLeftIcon = () => <span> L </span>;
const FormatAlignCenterIcon = () => <span> C </span>;
const FormatAlignRightIcon = () => <span> R </span>;
const FormatBoldIcon = () => <span> B </span>;
const FormatItalicIcon = () => <span> I </span>;
const FormatUnderlinedIcon = () => <span> U </span>;

const meta: Meta<typeof ToggleButtonGroup> = {
  title: 'Components/Inputs/ToggleButton',
  component: ToggleButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'object' }, // Can be string (exclusive) or array (multiple)
    onChange: { action: 'onChange' },
    exclusive: { control: 'boolean' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    color: { control: 'select', options: ['primary', 'secondary', 'standard', 'success', 'error', 'warning', 'info'] },
    // Add other ToggleButtonGroup props
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ToggleButtonGroup>;

// --- Examples ---

// Exclusive Selection (like radio buttons)
const ExclusiveSelection = () => {
  const [alignment, setAlignment] = useState<string | null>('left');

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    if (newAlignment !== null) { // Prevent deselecting all in exclusive mode if needed
        setAlignment(newAlignment);
    }
  };

  return (
    <ThemeProvider>
      <ToggleButtonGroup
        value={alignment}
        exclusive
        onChange={handleAlignment}
        aria-label="text alignment"
      >
        <ToggleButton value="left" aria-label="left aligned">
          <FormatAlignLeftIcon />
        </ToggleButton>
        <ToggleButton value="center" aria-label="centered">
          <FormatAlignCenterIcon />
        </ToggleButton>
        <ToggleButton value="right" aria-label="right aligned">
          <FormatAlignRightIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </ThemeProvider>
  );
};

export const Exclusive: Story = {
  render: () => <ExclusiveSelection />,
};

// Multiple Selection (like checkboxes)
const MultipleSelection = () => {
  const [formats, setFormats] = useState<string[]>(() => ['bold', 'italic']);

  const handleFormat = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[],
  ) => {
    setFormats(newFormats);
  };

  return (
    <ThemeProvider>
      <ToggleButtonGroup
        value={formats}
        onChange={handleFormat}
        aria-label="text formatting"
      >
        <ToggleButton value="bold" aria-label="bold">
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic" aria-label="italic">
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton value="underlined" aria-label="underlined">
          <FormatUnderlinedIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </ThemeProvider>
  );
};

export const Multiple: Story = {
    render: () => <MultipleSelection />,
};

// Vertical Orientation
export const Vertical: Story = {
    args: {
        orientation: 'vertical',
        exclusive: true,
        value: 'center', // Preselect one
        children: [
            <ToggleButton key="left" value="left"><FormatAlignLeftIcon /></ToggleButton>,
            <ToggleButton key="center" value="center"><FormatAlignCenterIcon /></ToggleButton>,
            <ToggleButton key="right" value="right"><FormatAlignRightIcon /></ToggleButton>,
        ]
    },
    decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
};

// Different Sizes - Define children explicitly
export const SmallSize: Story = {
    args: {
        size: 'small',
        exclusive: true,
        value: 'left',
        // Define children directly instead of reusing Vertical.args.children
        children: [
            <ToggleButton key="left" value="left"><FormatAlignLeftIcon /></ToggleButton>,
            <ToggleButton key="center" value="center"><FormatAlignCenterIcon /></ToggleButton>,
            <ToggleButton key="right" value="right"><FormatAlignRightIcon /></ToggleButton>,
        ]
    },
    decorators: [(Story) => <ThemeProvider><Story /></ThemeProvider>],
}; 