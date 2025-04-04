import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TagInput } from '../../src/components/TagInput';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof TagInput> = {
  title: 'Components/TagInput',
  component: TagInput,
  decorators: [(Story) => <ThemeProvider><div style={{ width: '400px' }}><Story /></div></ThemeProvider>],
  parameters: {
    // layout: 'centered', // Use width decorator
    docs: {
      description: {
        component: 'Placeholder story for the TagInput component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    // TODO: Add more argTypes based on TagInputProps
  },
};

export default meta;
type Story = StoryObj<typeof TagInput>;

// TODO: Add more stories and controls

const BasicTagInput = () => {
    const [tags, setTags] = useState<string[]>(['React', 'TypeScript']);

    return (
        <TagInput
            label="Technologies"
            tags={tags}
            onTagsChange={setTags}
            placeholder="Add a tag"
        />
    );
}

export const Default: Story = {
    render: () => <BasicTagInput />,
}; 
