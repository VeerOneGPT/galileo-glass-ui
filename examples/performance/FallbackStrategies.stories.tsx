import React, { useState, useCallback } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// Import hook, HOC, types, and utils (using relative paths)
import { DeviceCapabilityTier } from '../../src/utils/deviceCapabilities'; // Adjust path
import { useFallbackStrategies } from '../../src/hooks/useFallbackStrategies'; // Adjust path
import { withFallbackStrategies } from '../../src/utils/fallback/withFallbackStrategies'; // Adjust path
import { 
  AnimationFallbackStrategy, 
  VisualEffectFallbackStrategy,
  RenderingFallbackStrategy
} from '../../src/utils/fallback/strategies'; // Adjust path

// --- Styled Components (condensed from demo) ---
const DemoContainer = styled.div` /* ... */ `;
const DemoSection = styled.section` /* ... */ `;
const DemoHeader = styled.h2` /* ... */ `;
const DemoDescription = styled.p` /* ... */ `;
const TierControls = styled.div` /* ... */ `;
const TierButton = styled.button<{ $active: boolean }>` /* ... */ `;
const DemoGrid = styled.div` /* ... */ `;
const BaseCard = styled.div` /* Base styles */ 
    padding: 20px; border-radius: 8px; background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1);
    height: 100%; display: flex; flex-direction: column;
`;
const AnimatedDiv = styled.div` /* Base styles */ 
    width: 100px; height: 100px; background-color: #4a90e2; border-radius: 8px; 
    display: flex; align-items: center; justify-content: center; 
    color: white; cursor: pointer; margin: 0 auto;
`;
const ListContainer = styled.div` /* Base styles */ 
    height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;
`;
const ListItem = styled.div` /* Base styles */ 
    padding: 10px; border-bottom: 1px solid #eee;
`;

// Mock Theme
const mockTheme: DefaultTheme = { /* ... */ };

// --- Demo Components with Fallback Logic (adapted from demo) ---

interface GlassCardProps { title: string; children: React.ReactNode; importance?: number; fallbackStrategies?: any; useFallback?: boolean; reducedProps?: boolean; disabledFeatures?: string[]; alternatives?: Record<string, any>; forceTier?: DeviceCapabilityTier; fallbackOptions?: any; }
const GlassCardBase: React.FC<GlassCardProps> = ({ title, children, fallbackStrategies, useFallback, disabledFeatures = [], importance = 5 }) => {
    const shouldUseBlur = !disabledFeatures.includes('backdrop-blur') && fallbackStrategies?.shouldApplyEffect('blur');
    const shouldUseAnimation = !disabledFeatures.includes('animation') && fallbackStrategies?.shouldShowAnimation('card-hover', importance);
    // Define base styles directly
    const baseStyles: React.CSSProperties = {
        padding: '20px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.6)', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.1)', 
        height: '100%', display: 'flex', flexDirection: 'column',
        backdropFilter: shouldUseBlur ? 'blur(10px)' : undefined,
        transition: shouldUseAnimation ? 'all 0.3s ease' : 'none',
    };
    const styles = useFallback ? fallbackStrategies?.getAlternativeStyles(baseStyles, 'glass') : baseStyles;
    return (<div style={styles}><h3>{title}</h3><div style={{ flex: 1 }}>{children}</div>{useFallback && <small>Fallback Active</small>}</div>);
};
const GlassCard = withFallbackStrategies(GlassCardBase, { componentType: 'glass', importance: 5 });

interface AnimatedElementProps { importance?: number; fallbackStrategies?: any; useFallback?: boolean; reducedProps?: boolean; disabledFeatures?: string[]; alternatives?: Record<string, any>; forceTier?: DeviceCapabilityTier; fallbackOptions?: any; }
const AnimatedElementBase: React.FC<AnimatedElementProps> = ({ importance = 5, fallbackStrategies, disabledFeatures = [] }) => {
    const shouldUseAnimation = !disabledFeatures.includes('animation') && fallbackStrategies?.shouldShowAnimation('element-animation', importance);
    // Define base styles directly
    const baseStyles: React.CSSProperties = {
         width: '100px', height: '100px', backgroundColor: '#4a90e2', borderRadius: '8px', 
         display: 'flex', alignItems: 'center', justifyContent: 'center', 
         color: 'white', cursor: 'pointer', margin: '0 auto',
         transition: shouldUseAnimation ? 'transform 0.3s ease' : 'none'
    };
    return (<div style={baseStyles} onClick={(e) => { if (shouldUseAnimation) e.currentTarget.style.transform = 'scale(1.2)'; setTimeout(() => e.currentTarget.style.transform = 'scale(1)', 300); }}>{shouldUseAnimation ? 'Click Me' : 'No Anim'}</div>);
};
const AnimatedElement = withFallbackStrategies(AnimatedElementBase, { componentType: 'animation', importance: 5 });

interface ListDemoProps { itemCount?: number; importance?: number; fallbackStrategies?: any; useFallback?: boolean; reducedProps?: boolean; disabledFeatures?: string[]; alternatives?: Record<string, any>; forceTier?: DeviceCapabilityTier; fallbackOptions?: any; }
const ListDemoBase: React.FC<ListDemoProps> = ({ itemCount = 0, importance = 4, fallbackStrategies }) => {
    // Now itemCount should always be a number, even if undefined was passed
    if (typeof itemCount !== 'number' || isNaN(itemCount)) {
        console.error('ListDemoBase received invalid itemCount despite default:', itemCount);
        // Fallback to 0 if something went very wrong
        itemCount = 0;
    }

    // Add checks to prevent errors if fallbackStrategies or itemCount are undefined
    const safeItemCount = itemCount;
    const config = fallbackStrategies?.getVirtualizationConfig && typeof fallbackStrategies.getVirtualizationConfig === 'function'
        ? fallbackStrategies.getVirtualizationConfig(safeItemCount)
        : { useVirtualization: false, itemsPerPage: safeItemCount, overscan: 0 };

    const itemsToRender = config.useVirtualization ? Math.min(config.itemsPerPage + config.overscan, safeItemCount) : safeItemCount;
    // Define base styles directly
    const listContainerStyles: React.CSSProperties = { height: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' };
    const listItemStyles: React.CSSProperties = { padding: '10px', borderBottom: '1px solid #eee' };
    return (
        <div>
            <small>
                {config.useVirtualization ? `Virtual (${itemsToRender}/${safeItemCount})` : `Full (${safeItemCount})`}
            </small>
            <ListContainer style={listContainerStyles}>
                {Array.from({ length: itemsToRender }).map((_, i) => (
                    <ListItem key={i} style={listItemStyles}>
                        Item {i + 1}
                    </ListItem>
                ))}
            </ListContainer>
        </div>
    );
};
const ListDemo = withFallbackStrategies(ListDemoBase, { componentType: 'list', importance: 4 });

// --- Story Component ---
const FallbackStrategiesStoryComponent: React.FC = () => {
    const [selectedTier, setSelectedTier] = useState<DeviceCapabilityTier>(DeviceCapabilityTier.MEDIUM);
    const fallback = useFallbackStrategies({ forceTier: selectedTier });

    const selectTier = (tier: DeviceCapabilityTier) => {
        setSelectedTier(tier);
        fallback.resetStrategies(); // Important: Reset cache on tier change
    };

    return (
        <DemoContainer>
             <DemoHeader>Fallback Strategies Demo</DemoHeader>
             <DemoDescription>Components adapt visual/behavioral complexity based on the selected device tier.</DemoDescription>
             <TierControls>
                 <strong>Device Tier:</strong>
                 {Object.values(DeviceCapabilityTier).map(tier => (
                    <TierButton key={tier} $active={selectedTier === tier} onClick={() => selectTier(tier)} style={{ backgroundColor: selectedTier === tier ? '#4a90e2' : '#e0e0e0', color: selectedTier === tier ? 'white' : '#333' }}>{tier}</TierButton>
                 ))}
             </TierControls>
             <div><strong>Current Strategy:</strong> Anim: {fallback.strategies.animation}, Visual: {fallback.strategies.visualEffects}, Render: {fallback.strategies.rendering}</div>

            <DemoSection>
                 <DemoHeader>Glass Components</DemoHeader>
                 <DemoGrid>
                    <GlassCard title="High Prio" importance={8} forceTier={selectedTier}>Adapts less quickly.</GlassCard>
                    <GlassCard title="Med Prio" importance={5} forceTier={selectedTier}>Standard adaptation.</GlassCard>
                    <GlassCard title="Low Prio" importance={2} forceTier={selectedTier}>Adapts quickly.</GlassCard>
                    <GlassCard title="Forced Full" importance={5} forceTier={selectedTier} 
                        fallbackOptions={{ overrides: { 
                            visualEffects: VisualEffectFallbackStrategy.NONE, // Use enum 
                            animation: AnimationFallbackStrategy.NONE // Use enum
                        } }}>Overrides fallbacks.</GlassCard>
                 </DemoGrid>
             </DemoSection>

             <DemoSection>
                 <DemoHeader>Animation Adaptations</DemoHeader>
                 <DemoGrid>
                    <div><h3 style={{textAlign: 'center'}}>High Prio</h3><AnimatedElement importance={8} forceTier={selectedTier} /></div>
                    <div><h3 style={{textAlign: 'center'}}>Med Prio</h3><AnimatedElement importance={5} forceTier={selectedTier} /></div>
                    <div><h3 style={{textAlign: 'center'}}>Low Prio</h3><AnimatedElement importance={2} forceTier={selectedTier} /></div>
                    <div><h3 style={{textAlign: 'center'}}>Forced Anim</h3><AnimatedElement importance={5} forceTier={selectedTier} 
                        fallbackOptions={{ overrides: { 
                            animation: AnimationFallbackStrategy.NONE // Use enum
                        } }}/></div>
                </DemoGrid>
             </DemoSection>

             <DemoSection>
                 <DemoHeader>List Virtualization</DemoHeader>
                 <DemoGrid>
                     <div><h3>Small List (50)</h3><ListDemo itemCount={50} importance={4} forceTier={selectedTier} /></div>
                     <div><h3>Medium List (200)</h3><ListDemo itemCount={200} importance={4} forceTier={selectedTier} /></div>
                     <div><h3>Large List (1000)</h3><ListDemo itemCount={1000} importance={4} forceTier={selectedTier} /></div>
                     <div><h3>Forced Virtual</h3><ListDemo itemCount={50} importance={4} forceTier={selectedTier} 
                        fallbackOptions={{ overrides: { 
                            rendering: RenderingFallbackStrategy.SIMPLIFIED // Use enum
                        } }} /></div>
                 </DemoGrid>
            </DemoSection>
        </DemoContainer>
    );
};

// --- Storybook Meta Configuration ---
const meta: Meta<typeof FallbackStrategiesStoryComponent> = {
  title: 'Performance/Fallback Strategies',
  component: FallbackStrategiesStoryComponent,
  parameters: { layout: 'padded' },
  decorators: [(Story) => (<ThemeProvider theme={mockTheme}><Story /></ThemeProvider>)],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} }; 