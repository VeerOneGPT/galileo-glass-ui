/**
 * Fallback Strategies Demo
 * 
 * Demonstrates the usage and effect of fallback strategies for lower-end devices
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { DeviceCapabilityTier } from '../utils/deviceCapabilities';
import { useFallbackStrategies } from '../hooks/useFallbackStrategies';
import { withFallbackStrategies } from '../utils/fallback/withFallbackStrategies';
import { 
  AnimationFallbackStrategy, 
  VisualEffectFallbackStrategy,
  RenderingFallbackStrategy
} from '../utils/fallback/strategies';

// Demo components
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DemoSection = styled.section`
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DemoHeader = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
`;

const DemoDescription = styled.p`
  margin-bottom: 20px;
  color: #555;
  line-height: 1.5;
`;

const TierControls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const TierButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: ${({ $active }) => ($active ? '#4a90e2' : '#e0e0e0')};
  color: ${({ $active }) => ($active ? 'white' : '#333')};
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
  
  &:hover {
    background-color: ${({ $active }) => ($active ? '#3a80d2' : '#d0d0d0')};
  }
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

// Glass Card Component with fallback strategies
interface GlassCardProps {
  title: string;
  children: React.ReactNode;
  importance?: number;
  // Fallback props (injected by withFallbackStrategies)
  fallbackStrategies?: any;
  useFallback?: boolean;
  reducedProps?: boolean;
  disabledFeatures?: string[];
  alternatives?: Record<string, any>;
}

const GlassCardBase = ({
  title,
  children,
  importance = 5,
  fallbackStrategies,
  useFallback = false,
  reducedProps = false,
  disabledFeatures = [],
  alternatives = {}
}: GlassCardProps) => {
  // Get fallback strategies
  const shouldUseBlur = !disabledFeatures.includes('backdrop-blur') && 
    fallbackStrategies?.shouldApplyEffect('blur');
  
  const shouldUseAnimation = !disabledFeatures.includes('animation') &&
    fallbackStrategies?.shouldShowAnimation('card-hover', importance);
  
  // Apply alternative styles if needed
  const baseStyles = {
    padding: '20px',
    borderRadius: '8px',
    backdropFilter: shouldUseBlur ? 'blur(10px)' : undefined,
    WebkitBackdropFilter: shouldUseBlur ? 'blur(10px)' : undefined,
    background: 'rgba(255, 255, 255, 0.6)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: shouldUseAnimation ? 'all 0.3s ease' : 'none',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    position: 'relative' as const,
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const
  };
  
  // Apply fallback styles if needed
  const styles = useFallback 
    ? fallbackStrategies?.getAlternativeStyles(baseStyles, 'glass')
    : baseStyles;
  
  // Get animation settings
  const hoverAnimation = {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  };
  
  // Apply fallback animations if needed
  const finalHoverAnimation = shouldUseAnimation
    ? hoverAnimation
    : { transform: 'none', boxShadow: styles.boxShadow };
  
  return (
    <div
      style={styles}
      onMouseEnter={(e) => {
        if (shouldUseAnimation) {
          Object.entries(finalHoverAnimation).forEach(([key, value]) => {
            (e.currentTarget.style as any)[key] = value as string;
          });
        }
      }}
      onMouseLeave={(e) => {
        if (shouldUseAnimation) {
          Object.entries(finalHoverAnimation).forEach(([key, _]) => {
            (e.currentTarget.style as any)[key] = (styles as any)[key];
          });
        }
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>{title}</h3>
      <div style={{ flex: 1 }}>{children}</div>
      {useFallback && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Using fallback mode
        </div>
      )}
    </div>
  );
};

// Apply fallback strategies to the GlassCard component
const GlassCard = withFallbackStrategies(GlassCardBase, { 
  componentType: 'glass', 
  importance: 5 
});

// Demo component for animations with fallback strategies
interface AnimatedElementProps {
  delay?: number;
  importance?: number;
  // Fallback props (injected by withFallbackStrategies)
  fallbackStrategies?: any;
  useFallback?: boolean;
  reducedProps?: boolean;
  disabledFeatures?: string[];
  alternatives?: Record<string, any>;
}

const AnimatedElementBase = ({ 
  delay = 0, 
  importance = 5,
  fallbackStrategies,
  useFallback = false,
  reducedProps = false,
  disabledFeatures = [],
  alternatives = {}
}: AnimatedElementProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Check if animation should be shown
  const shouldUseAnimation = !disabledFeatures.includes('animation') &&
    fallbackStrategies?.shouldShowAnimation('element-animation', importance);
  
  // Define animations
  const baseAnimation = {
    duration: '1.5s',
    timingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
    delay: `${delay}s`,
    iterationCount: '1',
    fillMode: 'forwards'
  };
  
  // Apply fallback animations if needed
  const animation = shouldUseAnimation
    ? useFallback
      ? fallbackStrategies?.getSimplifiedAnimation(baseAnimation)
      : baseAnimation
    : null;
  
  const startAnimation = useCallback(() => {
    if (shouldUseAnimation) {
      setIsAnimating(true);
      
      // Reset animation after a delay
      setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    }
  }, [shouldUseAnimation]);
  
  // Style for the animated element
  const style: React.CSSProperties = {
    width: '100px',
    height: '100px',
    backgroundColor: '#4a90e2',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    margin: '0 auto',
    transform: isAnimating ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)',
    opacity: isAnimating ? '0.8' : '1',
    transition: animation 
      ? `transform ${animation.duration} ${animation.timingFunction} ${animation.delay}, opacity ${animation.duration} ${animation.timingFunction} ${animation.delay}`
      : 'none'
  };
  
  return (
    <div style={style} onClick={startAnimation}>
      {shouldUseAnimation ? 'Click Me' : 'No Animation'}
    </div>
  );
};

// Apply fallback strategies to the AnimatedElement component
const AnimatedElement = withFallbackStrategies(AnimatedElementBase, {
  componentType: 'animation',
  importance: 5
});

// Demo component for virtualized lists with fallback strategies
interface ListDemoProps {
  itemCount?: number;
  importance?: number;
  // Fallback props (injected by withFallbackStrategies)
  fallbackStrategies?: any;
  useFallback?: boolean;
  reducedProps?: boolean;
  disabledFeatures?: string[];
  alternatives?: Record<string, any>;
}

const ListDemoBase = ({
  itemCount = 200,
  importance = 5,
  fallbackStrategies,
  useFallback = false,
  reducedProps = false,
  disabledFeatures = [],
  alternatives = {}
}: ListDemoProps) => {
  // Get virtualization configuration
  const virtualizationConfig = fallbackStrategies?.getVirtualizationConfig(itemCount);
  
  // Determine if virtualization should be used
  const shouldVirtualize = virtualizationConfig?.useVirtualization;
  
  // Generate items based on virtualization settings
  const generateItems = () => {
    // If virtualization is enabled, only generate visible items plus overscan
    const itemsToGenerate = shouldVirtualize
      ? Math.min(virtualizationConfig.itemsPerPage + virtualizationConfig.overscan, itemCount)
      : itemCount;
    
    return Array.from({ length: itemsToGenerate }).map((_, index) => (
      <div
        key={index}
        style={{
          padding: '10px',
          backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
          borderBottom: '1px solid #eee'
        }}
      >
        Item {index + 1}
      </div>
    ));
  };
  
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        {shouldVirtualize 
          ? `Virtualized list (${virtualizationConfig.itemsPerPage} items per page, ${virtualizationConfig.overscan} overscan)`
          : `Full list (${itemCount} items)`}
      </div>
      <div
        style={{
          height: '200px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        {generateItems()}
        {shouldVirtualize && (
          <div style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
            Virtualized - {itemCount - virtualizationConfig.itemsPerPage - virtualizationConfig.overscan} more items not rendered
          </div>
        )}
      </div>
    </div>
  );
};

// Apply fallback strategies to the ListDemo component
const ListDemo = withFallbackStrategies(ListDemoBase, {
  componentType: 'list',
  importance: 4
});

// Main demo component
const FallbackStrategiesDemo = () => {
  // State for selected device tier
  const [selectedTier, setSelectedTier] = useState<DeviceCapabilityTier>(DeviceCapabilityTier.MEDIUM);
  
  // Global fallback strategies
  const fallback = useFallbackStrategies({ forceTier: selectedTier });
  
  // Set device tier
  const selectTier = (tier: DeviceCapabilityTier) => {
    setSelectedTier(tier);
    // Clear fallback strategies cache
    fallback.resetStrategies();
  };
  
  return (
    <DemoContainer>
      <DemoSection>
        <DemoHeader>Fallback Strategies Demo</DemoHeader>
        <DemoDescription>
          This demo showcases the adaptive capabilities of Galileo Glass UI, demonstrating
          how components gracefully degrade their visual and behavioral complexity based on device capabilities.
        </DemoDescription>
        
        <TierControls>
          <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center' }}>
            Device Tier:
          </div>
          <TierButton
            $active={selectedTier === DeviceCapabilityTier.ULTRA}
            onClick={() => selectTier(DeviceCapabilityTier.ULTRA)}
          >
            Ultra
          </TierButton>
          <TierButton
            $active={selectedTier === DeviceCapabilityTier.HIGH}
            onClick={() => selectTier(DeviceCapabilityTier.HIGH)}
          >
            High
          </TierButton>
          <TierButton
            $active={selectedTier === DeviceCapabilityTier.MEDIUM}
            onClick={() => selectTier(DeviceCapabilityTier.MEDIUM)}
          >
            Medium
          </TierButton>
          <TierButton
            $active={selectedTier === DeviceCapabilityTier.LOW}
            onClick={() => selectTier(DeviceCapabilityTier.LOW)}
          >
            Low
          </TierButton>
          <TierButton
            $active={selectedTier === DeviceCapabilityTier.MINIMAL}
            onClick={() => selectTier(DeviceCapabilityTier.MINIMAL)}
          >
            Minimal
          </TierButton>
        </TierControls>
        
        <div>
          <strong>Current Fallback Strategies:</strong>
          <ul>
            <li>Animation: {fallback.strategies.animation}</li>
            <li>Visual Effects: {fallback.strategies.visualEffects}</li>
            <li>Media: {fallback.strategies.media}</li>
            <li>Layout: {fallback.strategies.layout}</li>
            <li>Component Strategy: {fallback.strategies.componentStrategy}</li>
            <li>Resource Loading: {fallback.strategies.resourceLoading}</li>
          </ul>
        </div>
      </DemoSection>
      
      <DemoSection>
        <DemoHeader>Glass Components</DemoHeader>
        <DemoDescription>
          Demonstrates how glass components adapt to different device capabilities by adjusting
          their visual effects, animations, and behavior.
        </DemoDescription>
        
        <DemoGrid>
          <GlassCard 
            title="High Priority Component" 
            importance={8}
            forceTier={selectedTier}
          >
            This glass component has high importance (8/10) and will maintain its
            visual effects longer as device capability decreases.
          </GlassCard>
          
          <GlassCard 
            title="Medium Priority Component" 
            importance={5}
            forceTier={selectedTier}
          >
            This glass component has medium importance (5/10) and will adapt its
            visual effects as device capability decreases.
          </GlassCard>
          
          <GlassCard 
            title="Low Priority Component" 
            importance={2}
            forceTier={selectedTier}
          >
            This glass component has low importance (2/10) and will be among the
            first to have its effects simplified as device capability decreases.
          </GlassCard>
          
          <GlassCard 
            title="Forced Full Features" 
            importance={5}
            forceTier={selectedTier}
            fallbackOptions={{
              overrides: {
                visualEffects: VisualEffectFallbackStrategy.NONE,
                animation: AnimationFallbackStrategy.NONE
              }
            }}
          >
            This component overrides the global fallback strategies to always
            use full visual effects and animations.
          </GlassCard>
        </DemoGrid>
      </DemoSection>
      
      <DemoSection>
        <DemoHeader>Animation Adaptations</DemoHeader>
        <DemoDescription>
          Demonstrates how animations adapt to different device capabilities by adjusting
          their complexity, duration, and behavior.
        </DemoDescription>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          <div>
            <h3 style={{ textAlign: 'center' }}>High Priority</h3>
            <AnimatedElement 
              importance={8}
              forceTier={selectedTier} 
            />
          </div>
          
          <div>
            <h3 style={{ textAlign: 'center' }}>Medium Priority</h3>
            <AnimatedElement 
              importance={5}
              forceTier={selectedTier} 
            />
          </div>
          
          <div>
            <h3 style={{ textAlign: 'center' }}>Low Priority</h3>
            <AnimatedElement 
              importance={2}
              forceTier={selectedTier} 
            />
          </div>
          
          <div>
            <h3 style={{ textAlign: 'center' }}>Forced Animation</h3>
            <AnimatedElement 
              importance={5}
              forceTier={selectedTier}
              fallbackOptions={{
                overrides: {
                  animation: AnimationFallbackStrategy.NONE
                }
              }}
            />
          </div>
        </div>
      </DemoSection>
      
      <DemoSection>
        <DemoHeader>List Virtualization</DemoHeader>
        <DemoDescription>
          Demonstrates how lists adapt to different device capabilities through virtualization
          and pagination strategies.
        </DemoDescription>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>Small List (50 items)</h3>
            <ListDemo 
              itemCount={50}
              forceTier={selectedTier}
            />
          </div>
          
          <div>
            <h3>Medium List (200 items)</h3>
            <ListDemo 
              itemCount={200}
              forceTier={selectedTier}
            />
          </div>
          
          <div>
            <h3>Large List (1000 items)</h3>
            <ListDemo 
              itemCount={1000}
              forceTier={selectedTier}
            />
          </div>
          
          <div>
            <h3>Forced Virtualization</h3>
            <ListDemo 
              itemCount={50}
              forceTier={selectedTier}
              fallbackOptions={{
                overrides: {
                  rendering: RenderingFallbackStrategy.SIMPLIFIED
                }
              }}
            />
          </div>
        </div>
      </DemoSection>
    </DemoContainer>
  );
};

export default FallbackStrategiesDemo;