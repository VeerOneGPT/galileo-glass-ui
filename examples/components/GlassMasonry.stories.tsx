import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

import { GlassMasonry, MasonryItem } from '../../src/components/Masonry';
import { ThemeProvider as AppThemeProvider } from '../../src/theme';

// Define local types based on demo usage
type PlacementAlgorithm = 'columns' | 'balanced' | 'optimal';
type AnimationType = 'spring' | 'fade' | 'slide' | 'scale' | 'none'; // Added 'none'
type PhysicsPreset = 'default' | 'gentle' | 'bouncy' | 'snappy';
type GlassVariant = 'frosted' | 'clear' | 'tinted';

// --- Styled Components ---
const DemoContainer = styled.div` /* ... styles ... */ `;
const DemoSection = styled.div` /* ... styles ... */ `;
const SectionTitle = styled.h2` /* ... styles ... */ `;
const DemoTitle = styled.h3` /* ... styles ... */ `;
const Controls = styled.div` /* ... styles ... */ `;
const ControlGroup = styled.div` /* ... styles ... */ `;
const ControlLabel = styled.label` /* ... styles ... */ `;
const Select = styled.select` /* ... styles ... */ `;
const Button = styled.button` /* ... styles ... */ `;

// Adjusted MasonryCard for Storybook dark theme
const MasonryCard = styled.div<{ $isGlass: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  ${props => !props.$isGlass && `
    border-radius: 8px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.05); /* Lighter background for dark */
  `}
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  &:hover img { transform: scale(1.05); }
  .overlay { /* ... styles ... */ }
  &:hover .overlay { opacity: 1; }
  .title { /* ... styles ... */ }
  .description { /* ... styles ... */ }
`;

// --- Helper Functions ---
const generateSampleItems = (count: number): MasonryItem[] => {
  // Generate simpler, static items without loading external images
  const items: MasonryItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const height = 150 + (i % 3) * 50;
    const width = 300;
    const isWide = i % 5 === 0;
    const columnSpan = isWide ? 2 : 1;
    
    items.push({
      id: `item-${i}`,
      height,
      width,
      columnSpan,
      data: {
        title: `Item ${i + 1}`,
        description: `This is masonry item #${i + 1}`,
        // Use a static color instead of loading external images
        color: `hsl(${i * 30 % 360}, 70%, 70%)`,
        alt: `Sample item ${i + 1}`
      }
    });
  }
  return items;
};

// --- Storybook Setup ---
export default {
  title: 'Components/GlassMasonry',
  component: GlassMasonry,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <AppThemeProvider forceColorMode="dark">
        <DemoContainer>
          <Story />
        </DemoContainer>
      </AppThemeProvider>
    ),
  ],
  argTypes: {
    // Args managed by Storybook controls
    placementAlgorithm: { control: 'select', options: ['columns', 'balanced', 'optimal'] },
    itemAnimation: { control: 'select', options: ['spring', 'fade', 'slide', 'scale', 'none'] },
    glassVariant: { control: 'select', options: ['frosted', 'clear', 'tinted'] },
    columns: { control: { type: 'number', min: 1, max: 6, step: 1 } },
    gap: { control: { type: 'number', min: 0, max: 50, step: 2 } },
    glassItems: { control: 'boolean' },
    animateOnMount: { control: 'boolean' },
    animateOnChange: { control: 'boolean' },
    lazyLoad: { control: 'boolean' },
    dragToReorder: { control: 'boolean' },
    enableImagePreview: { control: 'boolean' },
  },
} as Meta<typeof GlassMasonry>;

// --- Interactive Template ---
const InteractiveTemplate: StoryFn<typeof GlassMasonry> = (args) => {
  const [items, setItems] = useState<MasonryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false); // Disable "load more" functionality
  
  // Internal state for controls not directly mapped to args
  const [animationPreset, setAnimationPreset] = useState<PhysicsPreset>('default');

  // Initial load with minimal items
  useEffect(() => {
    setItems(generateSampleItems(6)); // Reduce to only 6 items
    setHasMore(false); // Disable load more
  }, [args.columns, args.placementAlgorithm]);

  const handleLoadMore = () => {
    // Disable load more functionality
    return;
  };

  const renderItem = (item: MasonryItem) => (
    <MasonryCard $isGlass={args.glassItems ?? false}>
      {/* Replace img with a simple colored div */}
      <div 
        style={{ 
          backgroundColor: item.data.color, 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontWeight: 'bold'
        }}
      >
        {item.data.title}
      </div>
      <div className="overlay">
        <div className="title">{item.data.title}</div>
        <div className="description">{item.data.description}</div>
      </div>
    </MasonryCard>
  );

  const handleAddItem = () => setItems(prev => prev.length < 10 ? [generateSampleItems(1)[0], ...prev] : prev);
  const handleRemoveItem = () => setItems(prev => prev.slice(1));

  // Explicitly cast args.columns to number with fallback
  const numColumns = (args.columns as number) || 3;

  // Derive columns prop for GlassMasonry using numColumns
  const masonryColumns = {
      xs: 1,
      sm: Math.max(1, Math.floor(numColumns / 2)),
      md: numColumns,
      lg: numColumns,
      xl: numColumns,
  };

  return (
    <DemoSection>
      <SectionTitle>GlassMasonry Demo</SectionTitle>
      <DemoTitle>Interactive Masonry Layout</DemoTitle>
      <Controls>
        <ControlGroup>
          <ControlLabel>Actions</ControlLabel>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleAddItem}>Add Item</Button>
            <Button onClick={handleRemoveItem}>Remove First</Button>
          </div>
        </ControlGroup>
      </Controls>
      
      <GlassMasonry
        items={items}
        columns={masonryColumns}
        gap={args.gap ?? 16}
        placementAlgorithm={args.placementAlgorithm as PlacementAlgorithm}
        itemAnimation="none" // Disable animations
        physics={{
          preset: 'default',
          staggerDelay: 0, // No delay
          randomizeParams: false // Disable randomization
        }}
        glassVariant={args.glassVariant as GlassVariant}
        glassItems={args.glassItems ?? true}
        color="primary"
        animateOnMount={false} // Disable mount animations
        animateOnChange={false} // Disable change animations 
        lazyLoad={false} // Disable lazy loading
        loadMoreTrigger="button"
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loading={loading}
        enableImagePreview={false} // Disable preview
        dragToReorder={false} // Disable drag reordering
        onOrderChange={setItems}
      >
        {renderItem}
      </GlassMasonry>
    </DemoSection>
  );
};

// --- Export Story ---
export const Interactive = InteractiveTemplate.bind({});
Interactive.args = {
  // Default values for Storybook controls
  columns: 2, // Reduce columns
  gap: 16,
  placementAlgorithm: 'columns', // Simplest algorithm
  itemAnimation: 'none', // Disable animations
  glassVariant: 'frosted',
  glassItems: true,
  animateOnMount: false, // Disable animations
  animateOnChange: false, // Disable animations
  lazyLoad: false, // Disable lazy loading
  dragToReorder: false, // Disable drag to reorder
  enableImagePreview: false, // Disable image preview
}; 