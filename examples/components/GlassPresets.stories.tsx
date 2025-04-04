import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
    CleanGlassContainer,
    FrostedGlassContainer,
    TexturedGlassContainer,
    SubtleGlassContainer,
    StandardGlassContainer,
    ImmersiveGlassContainer,
    DashboardGlassContainer,
    FormGlassContainer,
    ModalGlassContainer,
} from '../../src/components/GlassPresets'; // Adjust import path
import { ThemeProvider } from '../../src';
import { Box, Typography } from '../../src/components';

// Base meta configuration
const meta: Meta = {
  title: 'Components/GlassPresets',
  decorators: [
    (Story) => (
      <ThemeProvider>
        {/* Provide a background context to see the glass effect */}
        <Box style={{ padding: '40px 20px', background: 'linear-gradient(to right, #fbc2eb, #a6c1ee)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

// Helper function to render content within a preset
const renderPreset = (PresetComponent: React.ElementType, name: string, args: any) => (
    <PresetComponent {...args} style={{ padding: 20, minHeight: 100, ...args.style }}>
        <Typography variant="body1" style={{ fontWeight: 'bold', marginBottom: '8px' }}>{name}</Typography>
        <Typography variant="caption">Preset Content Area</Typography>
    </PresetComponent>
);

// --- Stories for each preset ---

export const Clean: StoryObj<typeof CleanGlassContainer> = {
    name: 'Clean Glass',
    render: (args) => renderPreset(CleanGlassContainer, 'Clean', args),
    args: {}
};

export const Frosted: StoryObj<typeof FrostedGlassContainer> = {
    name: 'Frosted Glass',
    render: (args) => renderPreset(FrostedGlassContainer, 'Frosted', args),
    args: {}
};

export const Textured: StoryObj<typeof TexturedGlassContainer> = {
    name: 'Textured Glass',
    render: (args) => renderPreset(TexturedGlassContainer, 'Textured', args),
    args: {}
};

export const Subtle: StoryObj<typeof SubtleGlassContainer> = {
    name: 'Subtle Glass',
    render: (args) => renderPreset(SubtleGlassContainer, 'Subtle', args),
    args: {}
};

export const Standard: StoryObj<typeof StandardGlassContainer> = {
    name: 'Standard Glass',
    render: (args) => renderPreset(StandardGlassContainer, 'Standard', args),
    args: {}
};

export const Immersive: StoryObj<typeof ImmersiveGlassContainer> = {
    name: 'Immersive Glass',
    render: (args) => renderPreset(ImmersiveGlassContainer, 'Immersive', args),
    args: {}
};

export const Dashboard: StoryObj<typeof DashboardGlassContainer> = {
    name: 'Dashboard Glass',
    render: (args) => renderPreset(DashboardGlassContainer, 'Dashboard', args),
    args: {}
};

export const Form: StoryObj<typeof FormGlassContainer> = {
    name: 'Form Glass',
    render: (args) => renderPreset(FormGlassContainer, 'Form', args),
    args: {}
};

export const Modal: StoryObj<typeof ModalGlassContainer> = {
    name: 'Modal Glass',
    render: (args) => renderPreset(ModalGlassContainer, 'Modal', args),
    args: {}
}; 