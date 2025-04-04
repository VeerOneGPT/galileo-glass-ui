import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { GlassImageViewer, ImageItem } from '../../src/components/ImageViewer/GlassImageViewer';
import { ThemeProvider } from '../../src';

const meta: Meta<typeof GlassImageViewer> = {
  title: 'Components/GlassImageViewer',
  component: GlassImageViewer,
  tags: ['autodocs'],
  argTypes: {
    image: { control: 'object' }, // Control for the ImageItem object
    width: { control: 'text' },
    height: { control: 'text' },
    // caption: { control: 'text' }, // Removed - caption comes from image.metadata
    // Add other relevant props like zoomControls, fullscreenEnabled, showInfo, etc.
    showInfo: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof GlassImageViewer>;

// Define a sample ImageItem object
const sampleImage: ImageItem = {
  src: 'https://via.placeholder.com/600x400/771796/ffffff?text=Placeholder+Image',
  alt: 'Placeholder Image Alt Text',
  width: 600, // Optional actual width
  height: 400, // Optional actual height
  metadata: {
    title: 'Sample Image Title',
    description: 'This is an example caption for the image.',
  }
};

// Basic Render Check Story
export const BasicRenderCheck: Story = {
  name: 'Basic Image Viewer',
  args: {
    image: sampleImage, // Pass the ImageItem object
    width: '600px', // Container width
    height: '400px', // Container height
    showInfo: true, // Example: Show info panel to display metadata
    // Caption is likely read from image.metadata.description or title
  },
}; 