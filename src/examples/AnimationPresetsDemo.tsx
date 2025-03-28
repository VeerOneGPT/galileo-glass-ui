import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import allAnimationPresets, {
  AnimationCategory,
  AnimationIntensity,
  AnimationPreset,
  GestureAnimationConfig,
  OrchestrationPreset
} from '../animations/presets/animationPresets';
import { useGestureAnimation } from '../hooks/useGestureAnimation';
import { GalileoPhysics } from '../animations/physics';

// Container for the demo
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

// Header with glass effect
const Header = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

// Title styling
const Title = styled.h2`
  margin: 0 0 10px 0;
  color: #444;
`;

// Description text
const Description = styled.p`
  margin: 0;
  color: #666;
  line-height: 1.5;
`;

// Category selector
const CategorySelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

// Category button
const CategoryButton = styled.button<{ active?: boolean }>`
  padding: 10px 15px;
  background: ${props => props.active ? 'rgba(120, 170, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)'};
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(120, 170, 255, 0.5);
  }
`;

// Presets grid
const PresetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

// Preset card
const PresetCard = styled.div<{ intensity: AnimationIntensity }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: ${props => {
      switch(props.intensity) {
        case AnimationIntensity.SUBTLE:
          return 'rgba(0, 150, 136, 0.7)';
        case AnimationIntensity.STANDARD:
          return 'rgba(33, 150, 243, 0.7)';
        case AnimationIntensity.EXPRESSIVE:
          return 'rgba(156, 39, 176, 0.7)';
        default:
          return 'rgba(158, 158, 158, 0.7)';
      }
    }};
  }
`;

// Preset title
const PresetTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #444;
  font-size: 18px;
`;

// Preset description
const PresetDescription = styled.p`
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

// Demo element container
const DemoElementContainer = styled.div`
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  position: relative;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
`;

// Demo element for animation
const DemoElement = styled.div<{ animationName?: string }>`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  position: relative;
  user-select: none;
  
  animation-name: ${props => props.animationName};
  animation-duration: 1s;
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
`;

// Play button
const PlayButton = styled.button`
  padding: 8px 15px;
  background: rgba(33, 150, 243, 0.8);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(33, 150, 243, 1);
  }
`;

// Properties list
const PropertiesList = styled.div`
  margin-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 10px;
  font-size: 12px;
  color: #666;
`;

// Property item
const PropertyItem = styled.div`
  display: flex;
  margin-bottom: 5px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Property name
const PropertyName = styled.span`
  font-weight: bold;
  flex: 0 0 80px;
`;

// Property value
const PropertyValue = styled.span`
  flex: 1;
  word-break: break-word;
`;

/**
 * Demo component to showcase the animation presets library
 */
const AnimationPresetsDemo: React.FC = () => {
  // Current animation category
  const [category, setCategory] = useState<AnimationCategory>(AnimationCategory.BASIC);
  
  // Animation playback management
  const [playingAnimation, setPlayingAnimation] = useState<string | null>(null);
  
  // Handle category selection
  const handleCategoryChange = (newCategory: AnimationCategory) => {
    setCategory(newCategory);
    setPlayingAnimation(null);
  };
  
  // Get presets for current category
  const getPresetsForCategory = () => {
    switch (category) {
      case AnimationCategory.BASIC:
        return Object.entries(allAnimationPresets.basic);
      case AnimationCategory.UI:
        return Object.entries(allAnimationPresets.ui);
      case AnimationCategory.PHYSICS:
        return Object.entries(allAnimationPresets.physics);
      case AnimationCategory.ORCHESTRATION:
        return Object.entries(allAnimationPresets.orchestration);
      case AnimationCategory.GESTURE:
        return Object.entries(allAnimationPresets.gesture);
      default:
        return [];
    }
  };
  
  // Play an animation
  const playAnimation = (presetName: string) => {
    setPlayingAnimation(null);
    setTimeout(() => {
      setPlayingAnimation(presetName);
    }, 50);
  };
  
  // Format properties for display
  const formatProperties = (preset: any): Array<[string, string]> => {
    const properties: Array<[string, string]> = [];
    
    if (!preset) return properties;
    
    if (preset.duration) {
      properties.push(['Duration', preset.duration]);
    }
    
    if (preset.easing) {
      properties.push(['Easing', preset.easing]);
    }
    
    if (preset.intensity) {
      properties.push(['Intensity', preset.intensity]);
    }
    
    if (category === AnimationCategory.PHYSICS) {
      const physicsPreset = preset as AnimationPreset;
      properties.push(['Physics', 'true']);
    }
    
    if (category === AnimationCategory.ORCHESTRATION) {
      const orchestrationPreset = preset as OrchestrationPreset;
      if (orchestrationPreset.timing) {
        properties.push(['Timing', orchestrationPreset.timing]);
      }
      if (orchestrationPreset.delayPattern) {
        properties.push(['Delay Pattern', orchestrationPreset.delayPattern]);
      }
      if (orchestrationPreset.spatialPattern) {
        properties.push(['Spatial', orchestrationPreset.spatialPattern]);
      }
    }
    
    if (category === AnimationCategory.GESTURE) {
      const gesturePreset = preset as GestureAnimationConfig;
      if (gesturePreset.gestures) {
        properties.push(['Gestures', gesturePreset.gestures.join(', ')]);
      }
      if (gesturePreset.physicsPreset) {
        properties.push(['Physics Preset', gesturePreset.physicsPreset]);
      }
    }
    
    return properties;
  };

  // Render basic, UI, or physics animation
  const renderBasicAnimation = (presetName: string, preset: AnimationPreset) => {
    const isPlaying = playingAnimation === presetName;
    
    return (
      <DemoElementContainer>
        <DemoElement 
          animationName={isPlaying ? preset.keyframes.getName() : undefined}
          key={isPlaying ? 'playing' : 'idle'}
        >
          Demo
        </DemoElement>
      </DemoElementContainer>
    );
  };

  // Render orchestration animation
  const renderOrchestrationAnimation = (presetName: string, preset: OrchestrationPreset) => {
    const isPlaying = playingAnimation === presetName;
    
    return (
      <DemoElementContainer>
        {[1, 2, 3].map((index) => (
          <DemoElement 
            key={`${isPlaying ? 'playing' : 'idle'}-${index}`}
            animationName={isPlaying ? preset.animations[0].keyframes.getName() : undefined}
            style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              left: `calc(50% + ${(index - 2) * 70}px)`,
              animationDelay: isPlaying ? `${index * 100}ms` : '0s'
            }}
          >
            {index}
          </DemoElement>
        ))}
      </DemoElementContainer>
    );
  };

  // Render gesture animation
  const renderGestureAnimation = (presetName: string, preset: GestureAnimationConfig) => {
    // Use ref for element
    const elementRef = useRef<HTMLDivElement>(null);
    
    // Initialize gesture animation
    const { transform, isActive } = useGestureAnimation({
      ref: elementRef,
      enabled: true,
      gestures: preset.gestures,
      preset: preset.physicsPreset,
      ...(preset.physicsParams || {}),
      ...(preset.constraints || {}),
    });
    
    return (
      <DemoElementContainer>
        <div 
          ref={elementRef}
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
            borderRadius: '8px',
            boxShadow: isActive ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            position: 'relative',
            userSelect: 'none',
            touchAction: 'none',
            cursor: 'grab',
            transition: 'box-shadow 0.2s ease',
          }}
        >
          Drag
        </div>
      </DemoElementContainer>
    );
  };
  
  // Render animation based on category
  const renderAnimation = (presetName: string, preset: any) => {
    if (category === AnimationCategory.ORCHESTRATION) {
      return renderOrchestrationAnimation(presetName, preset as OrchestrationPreset);
    } else if (category === AnimationCategory.GESTURE) {
      return renderGestureAnimation(presetName, preset as GestureAnimationConfig);
    } else {
      return renderBasicAnimation(presetName, preset as AnimationPreset);
    }
  };
  
  return (
    <DemoContainer>
      <Header>
        <Title>Animation Presets Library</Title>
        <Description>
          Explore the comprehensive animation presets library for Galileo Glass UI.
          Browse different categories and preview animations to find the right one for your needs.
        </Description>
      </Header>
      
      <CategorySelector>
        {Object.values(AnimationCategory).map((cat) => (
          <CategoryButton
            key={cat}
            active={category === cat}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)} Animations
          </CategoryButton>
        ))}
      </CategorySelector>
      
      <PresetsGrid>
        {getPresetsForCategory().map(([presetName, preset]) => (
          <PresetCard 
            key={presetName}
            intensity={preset.intensity || AnimationIntensity.STANDARD}
          >
            <PresetTitle>{presetName}</PresetTitle>
            <PresetDescription>
              {preset.description || (
                category === AnimationCategory.BASIC || category === AnimationCategory.UI
                  ? `Standard ${presetName} animation preset`
                  : `${category} animation preset`
              )}
            </PresetDescription>
            
            {renderAnimation(presetName, preset)}
            
            {category !== AnimationCategory.GESTURE && (
              <PlayButton onClick={() => playAnimation(presetName)}>
                Play Animation
              </PlayButton>
            )}
            
            <PropertiesList>
              {formatProperties(preset).map(([name, value]) => (
                <PropertyItem key={name}>
                  <PropertyName>{name}:</PropertyName>
                  <PropertyValue>{value}</PropertyValue>
                </PropertyItem>
              ))}
            </PropertiesList>
          </PresetCard>
        ))}
      </PresetsGrid>
    </DemoContainer>
  );
};

export default AnimationPresetsDemo;