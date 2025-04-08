import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GlassFocusRing } from '../../src/components/GlassFocusRing/GlassFocusRing';
import { GlassButton } from '../../src/components/Button';
import { GlassTextField } from '../../src/components/TextField';

const meta: Meta<typeof GlassFocusRing> = {
    title: 'Components/GlassFocusRing',
    component: GlassFocusRing,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        children: { control: false }, // Child is passed directly in stories
        color: {
            options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
            control: { type: 'select' },
            description: 'Alias for variant'
        },
        variant: {
            options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
            control: { type: 'select' },
        },
        offset: { control: 'number' },
        thickness: { control: 'number' },
        borderRadius: { control: 'text' },
        disabled: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultButton: Story = {
    args: {
        children: <GlassButton>Focus Me</GlassButton>,
        variant: 'primary',
        offset: 3,
        thickness: 2,
    },
};

export const SecondaryColor: Story = {
    args: {
        children: <GlassButton>Focus Me (Secondary)</GlassButton>,
        color: 'secondary', // Using color alias
        offset: 4,
        thickness: 3,
    },
};

export const ErrorVariant: Story = {
    args: {
        children: <GlassButton>Focus Me (Error)</GlassButton>,
        variant: 'error',
        offset: 2,
        thickness: 2,
    },
};

export const WithTextField: Story = {
    args: {
        children: <GlassTextField placeholder="Focus this field" />,
        variant: 'info',
        offset: 2,
        thickness: 2,
        borderRadius: '8px', // Example custom border radius
    },
};

export const Disabled: Story = {
    args: {
        children: <GlassButton>Cannot Focus Ring</GlassButton>,
        variant: 'primary',
        disabled: true,
    },
}; 