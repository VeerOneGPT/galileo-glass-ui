/**
 * GlassMasonry Demo Component
 *
 * Demonstrates the physics-based GlassMasonry component with various configurations
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { GlassMasonry, MasonryItem } from '../components/Masonry';

// Demo container
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const DemoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
`;

const DemoTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 8px;
  color: rgba(255, 255, 255, 0.8);
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ControlLabel = styled.label`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Select = styled.select`
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 6px 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: rgba(99, 102, 241, 0.5);
  }
`;

const Button = styled.button`
  background-color: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(99, 102, 241, 0.3);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
  }
`;

// Sample image data with varying heights
const generateSampleItems = (count: number): MasonryItem[] => {
  const items: MasonryItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const height = 150 + Math.floor(Math.random() * 250);
    const width = 300;
    
    // Occasionally create wider items
    const isWide = Math.random() > 0.8;
    const columnSpan = isWide ? 2 : 1;
    
    items.push({
      id: `item-${i + 1}`,
      height,
      width,
      columnSpan,
      data: {
        title: `Item ${i + 1}`,
        description: `This is masonry item #${i + 1}`,
        src: `https://picsum.photos/seed/${i + 1}/${width}/${height}`,
        alt: `Sample image ${i + 1}`
      }
    });
  }
  
  return items;
};

// Custom masonry item component
const MasonryCard = styled.div<{ $isGlass: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  /* Only add border radius and overflow if not glass styled */
  ${props => !props.$isGlass && `
    border-radius: 8px;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.2);
  `}
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover .overlay {
    opacity: 1;
  }
  
  .title {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .description {
    font-size: 0.8rem;
    opacity: 0.8;
  }
`;

/**
 * GlassMasonry Demo Component
 */
export const MasonryDemo: React.FC = () => {
  const [items, setItems] = useState<MasonryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [placementAlgorithm, setPlacementAlgorithm] = useState<'columns' | 'balanced' | 'optimal'>('balanced');
  const [animationType, setAnimationType] = useState<'spring' | 'fade' | 'slide' | 'scale'>('spring');
  const [animationPreset, setAnimationPreset] = useState<'default' | 'gentle' | 'bouncy' | 'snappy'>('default');
  const [glassVariant, setGlassVariant] = useState<'frosted' | 'clear' | 'tinted'>('frosted');
  const [columns, setColumns] = useState(3);
  
  // Load initial items
  useEffect(() => {
    setItems(generateSampleItems(12));
  }, []);
  
  // Handle loading more items
  const handleLoadMore = () => {
    setLoading(true);
    
    // Simulate an API call with delay
    setTimeout(() => {
      // Add more items
      const newItems = generateSampleItems(8);
      setItems(prev => [...prev, ...newItems]);
      
      // Stop loading after 3 sets of items
      if (items.length >= 28) {
        setHasMore(false);
      }
      
      setLoading(false);
    }, 1500);
  };
  
  // Render the masonry item
  const renderItem = (item: MasonryItem) => (
    <MasonryCard $isGlass={true}>
      <img src={item.data.src} alt={item.data.alt} loading="lazy" />
      <div className="overlay">
        <div className="title">{item.data.title}</div>
        <div className="description">{item.data.description}</div>
      </div>
    </MasonryCard>
  );
  
  // Add a new item
  const handleAddItem = () => {
    const newItem = generateSampleItems(1)[0];
    setItems(prev => [newItem, ...prev]);
  };
  
  // Remove the first item
  const handleRemoveItem = () => {
    if (items.length === 0) return;
    setItems(prev => prev.slice(1));
  };
  
  return (
    <DemoContainer>
      <SectionTitle>GlassMasonry Component</SectionTitle>
      
      <DemoSection>
        <DemoTitle>Interactive Masonry Layout</DemoTitle>
        <Controls>
          <ControlGroup>
            <ControlLabel>Placement Algorithm</ControlLabel>
            <Select 
              value={placementAlgorithm} 
              onChange={e => setPlacementAlgorithm(e.target.value as any)}
            >
              <option value="columns">Columns</option>
              <option value="balanced">Balanced</option>
              <option value="optimal">Optimal</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Animation Type</ControlLabel>
            <Select 
              value={animationType} 
              onChange={e => setAnimationType(e.target.value as any)}
            >
              <option value="spring">Spring Physics</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="scale">Scale</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Physics Preset</ControlLabel>
            <Select 
              value={animationPreset} 
              onChange={e => setAnimationPreset(e.target.value as any)}
              disabled={animationType !== 'spring'}
            >
              <option value="default">Default</option>
              <option value="gentle">Gentle</option>
              <option value="bouncy">Bouncy</option>
              <option value="snappy">Snappy</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Glass Variant</ControlLabel>
            <Select 
              value={glassVariant} 
              onChange={e => setGlassVariant(e.target.value as any)}
            >
              <option value="frosted">Frosted</option>
              <option value="clear">Clear</option>
              <option value="tinted">Tinted</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Columns</ControlLabel>
            <Select 
              value={columns.toString()} 
              onChange={e => setColumns(parseInt(e.target.value, 10))}
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Actions</ControlLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={handleAddItem}>Add Item</Button>
              <Button onClick={handleRemoveItem}>Remove Item</Button>
            </div>
          </ControlGroup>
        </Controls>
        
        <GlassMasonry
          items={items}
          columns={{
            xs: 1,
            sm: 2,
            md: columns,
            lg: columns + 1
          }}
          gap={16}
          placementAlgorithm={placementAlgorithm}
          itemAnimation={animationType}
          physics={{
            preset: animationPreset,
            staggerDelay: 50,
            randomizeParams: true
          }}
          glassVariant={glassVariant}
          glassItems={true}
          color="primary"
          animateOnMount={true}
          animateOnChange={true}
          lazyLoad={true}
          loadMoreTrigger="scroll"
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
          enableImagePreview={true}
          dragToReorder={true}
          onOrderChange={setItems}
        >
          {renderItem}
        </GlassMasonry>
      </DemoSection>
    </DemoContainer>
  );
};

export default MasonryDemo;