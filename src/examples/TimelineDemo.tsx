/**
 * GlassTimeline Demo Component
 *
 * Demonstrates the physics-based GlassTimeline component with various configurations
 */
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

import { GlassTimeline } from '../components/Timeline/GlassTimeline';
import { 
  TimelineItem, 
  TimelineOrientation, 
  MarkerPosition, 
  ZoomLevel,
  TimelineAnimationType,
  NavigationType,
  TimelineDensity,
  TimelineFilter
} from '../components/Timeline/types';

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

// Generate sample timeline data
const generateSampleTimelineItems = (): TimelineItem[] => {
  // Create a list of events spanning several years
  const today = new Date();
  const items: TimelineItem[] = [];
  
  // Historical events
  items.push({
    id: 'launch',
    date: new Date(today.getFullYear() - 2, 3, 15),
    title: 'Project Launch',
    content: 'Initial project launch with core team established',
    category: 'milestone',
    icon: '🚀',
    highlighted: true
  });
  
  items.push({
    id: 'design',
    date: new Date(today.getFullYear() - 2, 5, 8),
    title: 'Design System Creation',
    content: 'Established the Galileo Glass design system with core principles and components',
    category: 'design',
    icon: '🎨'
  });
  
  items.push({
    id: 'alpha',
    date: new Date(today.getFullYear() - 1, 8, 22),
    title: 'Alpha Release',
    content: 'First alpha release with basic component set',
    category: 'milestone',
    icon: '🔬',
    highlighted: true
  });
  
  // Add several development items
  for (let i = 0; i < 5; i++) {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    items.push({
      id: `dev-${i}`,
      date: new Date(today.getFullYear() - 1, month, day),
      title: `Development Update ${i + 1}`,
      content: `Added new features and fixed critical bugs in sprint ${i + 1}`,
      category: 'development',
      icon: '💻'
    });
  }
  
  items.push({
    id: 'beta',
    date: new Date(today.getFullYear(), 2, 10),
    title: 'Beta Release',
    content: 'Public beta with enhanced component library',
    category: 'milestone',
    icon: '📦',
    highlighted: true
  });
  
  items.push({
    id: 'feedback',
    date: new Date(today.getFullYear(), 3, 5),
    title: 'User Feedback Collection',
    content: 'Collected and analyzed feedback from beta users',
    category: 'research',
    icon: '📊'
  });
  
  items.push({
    id: 'v1',
    date: new Date(today.getFullYear(), 5, 18),
    title: 'Version 1.0 Release',
    content: 'Official release of Galileo Glass UI v1.0',
    category: 'milestone',
    icon: '🎉',
    highlighted: true
  });
  
  // Add more recent items
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 100);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    const categories = ['bugfix', 'feature', 'design', 'documentation'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const icons = ['🐛', '✨', '📝', '📚'];
    const iconIdx = categories.indexOf(category);
    
    items.push({
      id: `recent-${i}`,
      date,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Update`,
      content: `${i % 2 === 0 ? 'Major' : 'Minor'} ${category} update for component system`,
      category,
      icon: icons[iconIdx]
    });
  }
  
  // Add future items
  items.push({
    id: 'v1-1',
    date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
    title: 'Version 1.1 Planning',
    content: 'Planning session for the next minor release',
    category: 'planning',
    icon: '📋'
  });
  
  items.push({
    id: 'v1-1-release',
    date: new Date(today.getFullYear(), today.getMonth() + 3, 10),
    title: 'Version 1.1 Release',
    content: 'Release of version 1.1 with enhanced features',
    category: 'milestone',
    icon: '🚀',
    highlighted: true
  });
  
  items.push({
    id: 'v2-planning',
    date: new Date(today.getFullYear() + 1, 1, 20),
    title: 'Version 2.0 Planning',
    content: 'Strategic planning for major version update',
    category: 'planning',
    icon: '🔮',
    endDate: new Date(today.getFullYear() + 1, 2, 15)
  });
  
  return items;
};

// Custom event renderer
const TimelineEventContent = styled.div<{ $highlighted?: boolean }>`
  padding: 12px;
  border-radius: 8px;
  background-color: ${props => props.$highlighted 
    ? 'rgba(99, 102, 241, 0.3)' 
    : 'rgba(30, 30, 30, 0.6)'};
  max-width: 300px;
  
  .title {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .content {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .category {
    font-size: 0.8rem;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    display: inline-block;
    margin-top: 8px;
  }
  
  .icon {
    font-size: 1.5rem;
  }
`;

/**
 * GlassTimeline Demo Component
 */
export const TimelineDemo: React.FC = () => {
  const [items] = useState<TimelineItem[]>(generateSampleTimelineItems());
  const [orientation, setOrientation] = useState<TimelineOrientation>('vertical');
  const [markerPosition, setMarkerPosition] = useState<MarkerPosition>('alternate');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('months');
  const [animation, setAnimation] = useState<TimelineAnimationType>('spring');
  const [animationPreset, setAnimationPreset] = useState<'default' | 'gentle' | 'bouncy' | 'snappy'>('default');
  const [navigation, setNavigation] = useState<NavigationType>('scroll');
  const [density, setDensity] = useState<TimelineDensity>('normal');
  const [glassVariant, setGlassVariant] = useState<'frosted' | 'clear' | 'tinted'>('frosted');
  const [showAxis, setShowAxis] = useState(true);
  const [groupByDate, setGroupByDate] = useState(true);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string | null>(null);
  
  // Apply category filter if selected
  const filter: TimelineFilter | undefined = useMemo(() => {
    if (!activeFilterCategory) return undefined;
    
    return {
      categories: [activeFilterCategory]
    };
  }, [activeFilterCategory]);
  
  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    items.forEach(item => {
      if (item.category) {
        uniqueCategories.add(item.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [items]);
  
  // Custom renderer for timeline content
  const renderContent = (item: TimelineItem) => (
    <TimelineEventContent $highlighted={item.highlighted}>
      <div className="title">
        <span className="icon">{item.icon}</span>
        <span>{item.title}</span>
      </div>
      <div className="content">{item.content}</div>
      {item.category && <div className="category">{item.category}</div>}
    </TimelineEventContent>
  );
  
  return (
    <DemoContainer>
      <SectionTitle>GlassTimeline Component</SectionTitle>
      
      <DemoSection>
        <DemoTitle>Interactive Timeline</DemoTitle>
        <Controls>
          <ControlGroup>
            <ControlLabel>Orientation</ControlLabel>
            <Select 
              value={orientation} 
              onChange={e => setOrientation(e.target.value as TimelineOrientation)}
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Marker Position</ControlLabel>
            <Select 
              value={markerPosition} 
              onChange={e => setMarkerPosition(e.target.value as MarkerPosition)}
            >
              <option value="alternate">Alternate</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="center">Center</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Zoom Level</ControlLabel>
            <Select 
              value={zoomLevel} 
              onChange={e => setZoomLevel(e.target.value as ZoomLevel)}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="quarters">Quarters</option>
              <option value="years">Years</option>
              <option value="decades">Decades</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Animation Type</ControlLabel>
            <Select 
              value={animation} 
              onChange={e => setAnimation(e.target.value as TimelineAnimationType)}
            >
              <option value="spring">Spring Physics</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="scale">Scale</option>
              <option value="none">None</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Physics Preset</ControlLabel>
            <Select 
              value={animationPreset} 
              onChange={e => setAnimationPreset(e.target.value as any)}
              disabled={animation !== 'spring'}
            >
              <option value="default">Default</option>
              <option value="gentle">Gentle</option>
              <option value="bouncy">Bouncy</option>
              <option value="snappy">Snappy</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Navigation</ControlLabel>
            <Select 
              value={navigation} 
              onChange={e => setNavigation(e.target.value as NavigationType)}
            >
              <option value="scroll">Scroll</option>
              <option value="button">Buttons</option>
              <option value="pagination">Pagination</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Density</ControlLabel>
            <Select 
              value={density} 
              onChange={e => setDensity(e.target.value as TimelineDensity)}
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="spacious">Spacious</option>
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
            <ControlLabel>Filter by Category</ControlLabel>
            <Select 
              value={activeFilterCategory || ''} 
              onChange={e => setActiveFilterCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <ControlLabel>Timeline Options</ControlLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={showAxis} 
                  onChange={() => setShowAxis(!showAxis)} 
                />
                <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>Show Axis</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={groupByDate} 
                  onChange={() => setGroupByDate(!groupByDate)} 
                />
                <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>Group by Date</span>
              </label>
            </div>
          </ControlGroup>
        </Controls>
        
        <div style={{ 
          height: orientation === 'vertical' ? '600px' : '400px', 
          width: '100%', 
          overflow: 'hidden' 
        }}>
          <GlassTimeline
            items={items}
            orientation={orientation}
            markerPosition={markerPosition}
            zoomLevel={zoomLevel}
            animation={animation}
            physics={{
              preset: animationPreset,
              staggerDelay: 50
            }}
            navigation={navigation}
            density={density}
            glassVariant={glassVariant}
            glassMarkers={true}
            glassContent={true}
            showAxis={showAxis}
            groupByDate={groupByDate}
            groupThreshold={3}
            color="primary"
            animateOnMount={true}
            animateOnChange={true}
            allowWheelZoom={true}
            enableGestures={true}
            filter={filter}
            allowFiltering={true}
            renderContent={renderContent}
            zoomLevels={['hours', 'days', 'weeks', 'months', 'quarters', 'years', 'decades']}
            markers={{
              show: true,
              showNow: true
            }}
            blurStrength="standard"
          />
        </div>
      </DemoSection>
    </DemoContainer>
  );
};

export default TimelineDemo;