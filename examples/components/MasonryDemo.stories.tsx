import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { GlassMasonry } from '../../src/components/Masonry/GlassMasonry';
import type { MasonryItem } from '../../src/components/Masonry/types';
import { ThemeProvider } from '../../src';
import { Box } from '../../src/components/Box';
import { Paper } from '../../src/components/Paper';
import { Typography } from '../../src/components/Typography';

const meta: Meta<typeof GlassMasonry> = {
  title: 'Components/Layout/Masonry',
  component: GlassMasonry,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Box style={{ padding: '20px', maxWidth: '600px' }}>
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GlassMasonry>;

// Create simple items
const items: MasonryItem[] = [
  {
    id: 'item-1',
    height: 120,
    width: 300,
    columnSpan: 1,
    data: {
      title: 'Item 1',
      color: 'hsl(0, 70%, 70%)'
    }
  },
  {
    id: 'item-2',
    height: 150,
    width: 300,
    columnSpan: 1,
    data: {
      title: 'Item 2',
      color: 'hsl(60, 70%, 70%)'
    }
  },
  {
    id: 'item-3',
    height: 180,
    width: 300,
    columnSpan: 1,
    data: {
      title: 'Item 3',
      color: 'hsl(120, 70%, 70%)'
    }
  },
  {
    id: 'item-4',
    height: 140,
    width: 300,
    columnSpan: 1,
    data: {
      title: 'Item 4',
      color: 'hsl(180, 70%, 70%)'
    }
  }
];

// Define the render function separately for type safety
const renderItem = (item: MasonryItem) => (
  <Paper 
    key={item.id.toString()}
    style={{ 
      height: '100%',
      width: '100%',
      backgroundColor: item.data.color,
      padding: '10px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#000',
      fontWeight: 'bold'
    }}
  >
    {item.data.title}
  </Paper>
);

export const Default = {
  render: () => (
    <GlassMasonry
      items={items}
      columns={2}
      gap={16}
      placementAlgorithm="columns"
      itemAnimation="none"
      animateOnMount={false}
      animateOnChange={false}
      lazyLoad={false}
      dragToReorder={false}
      enableImagePreview={false}
    >
      {renderItem}
    </GlassMasonry>
  )
} as Story; 