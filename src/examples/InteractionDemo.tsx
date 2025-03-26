/**
 * Interaction Demo
 * 
 * Demonstrates the usage of interaction components and mixins
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '../components/Typography';
import { Box } from '../components/Box';
import { Button } from '../components/Button';
import { Link } from '../components/Link';
import { Divider } from '../components/Divider';
import { Stack } from '../components/Stack';
import { Icon } from '../components/Icon';
import { Backdrop } from '../components/Backdrop';
import { glassBorder } from '../core/mixins/glassBorder';
import { backgroundEffects } from '../core/mixins/backgroundEffects';
import { ambientEffects } from '../core/mixins/effects/ambientEffects';
import { interactiveGlass } from '../core/mixins/interactions/interactiveGlass';
import { focusEffects } from '../core/mixins/interactions/focusEffects';
import { hoverEffects } from '../core/mixins/interactions/hoverEffects';
import { createThemeContext } from '../core/themeUtils';

const DemoContainer = styled.div`
  padding: 24px;
`;

const DemoSection = styled.div`
  margin-bottom: 32px;
`;

const GlassBorderDemo = styled.div<{ theme: any }>`
  ${props => glassBorder({
    width: 2,
    style: 'solid',
    opacity: 'medium',
    gradient: true,
    glow: true,
    glowColor: '#3b82f6',
    glowIntensity: 'medium',
    radius: 8,
    position: 'all',
    animated: true,
    themeContext: createThemeContext(props.theme)
  })}
  
  padding: 24px;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const BackgroundEffectsDemo = styled.div<{ theme: any, type: string }>`
  ${props => backgroundEffects({
    type: props.type as any,
    baseColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    tertiaryColor: '#ec4899',
    opacity: 'medium',
    angle: 135,
    density: 'medium',
    animationSpeed: 'medium',
    blur: 'medium',
    patternType: 'dots',
    themeContext: createThemeContext(props.theme)
  })}
  
  padding: 24px;
  width: 100%;
  height: 120px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const AmbientEffectsDemo = styled.div<{ theme: any, type: string }>`
  position: relative;
  background-color: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  
  ${props => ambientEffects({
    type: props.type as any,
    color: '#3b82f6',
    secondaryColor: '#8b5cf6',
    intensity: 'medium',
    size: 'medium',
    direction: 'top-right',
    animationSpeed: 'medium',
    alternate: true,
    themeContext: createThemeContext(props.theme)
  })}
  
  padding: 24px;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const InteractiveGlassDemo = styled.div<{ theme: any, hoverEffect: string, activeEffect: string }>`
  ${props => interactiveGlass({
    hoverEffect: props.hoverEffect as any,
    activeEffect: props.activeEffect as any,
    focusEffect: 'outline',
    disabledEffect: 'fade',
    blurStrength: 'standard',
    backgroundOpacity: 'light',
    borderOpacity: 'subtle',
    elevation: 2,
    color: '#3b82f6',
    themeContext: createThemeContext(props.theme)
  })}
  
  padding: 24px;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

// Define a type for the focus effect types
type FocusEffectType = 'outline' | 'ring' | 'glow' | 'border' | 'inset';

// Create a styled button base component
const StyledFocusButton = styled.button<{ theme: any, focusType: FocusEffectType }>`
  background-color: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 12px 24px;
  cursor: pointer;
  
  ${props => focusEffects({
    type: props.focusType as any,
    color: '#3b82f6',
    thickness: 3,
    opacity: 0.6,
    animated: true,
    focusVisible: true,
    borderRadius: 8,
    themeContext: createThemeContext(props.theme)
  })}
`;

// Create a proper React component that uses the styled component
const FocusEffectsDemo: React.FC<{
  type: FocusEffectType;
  children: React.ReactNode;
}> = ({ type, children }) => {
  return (
    <StyledFocusButton focusType={type} type="button">
      {children}
    </StyledFocusButton>
  );
};

const HoverEffectsDemo = styled.div<{ theme: any, type: string }>`
  background-color: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  ${props => hoverEffects({
    type: props.type as any,
    color: '#3b82f6',
    intensity: 'medium',
    animated: true,
    amount: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
`;

const InteractionDemo = () => {
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [currentBackdropType, setCurrentBackdropType] = useState('standard');
  
  const handleOpenBackdrop = (type: string) => {
    setCurrentBackdropType(type);
    setBackdropOpen(true);
  };
  
  return (
    <DemoContainer>
      <Typography variant="h2">Interaction Components & Mixins Demo</Typography>
      
      <DemoSection>
        <Typography variant="h4">Divider Component</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Divider variants:
        </Typography>
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2">Standard Divider</Typography>
            <Divider />
          </Box>
          
          <Box>
            <Typography variant="body2">Divider with Text</Typography>
            <Divider>Section Divider</Divider>
          </Box>
          
          <Box>
            <Typography variant="body2">Vertical Divider</Typography>
            <div style={{ display: 'flex', height: '100px', alignItems: 'center' }}>
              <div>Content Left</div>
              <Divider orientation="vertical" style={{ margin: '0 16px' }} />
              <div>Content Right</div>
            </div>
          </Box>
          
          <Box>
            <Typography variant="body2">Glass Divider</Typography>
            <Divider glass thickness={2} />
          </Box>
          
          <Box>
            <Typography variant="body2">Gradient Divider</Typography>
            <Divider gradient thickness={2} />
          </Box>
          
          <Box>
            <Typography variant="body2">Animated Divider</Typography>
            <Divider animated gradient thickness={2} />
          </Box>
        </Stack>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Link Component</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Link variants:
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2">Standard Link</Typography>
            <Link href="#">Standard Link</Link>
          </Box>
          
          <Box>
            <Typography variant="body2">Link with Color</Typography>
            <Link href="#" color="secondary">Secondary Link</Link>
          </Box>
          
          <Box>
            <Typography variant="body2">Link with Underline on Hover</Typography>
            <Link href="#" underlineOnHover>Hover me</Link>
          </Box>
          
          <Box>
            <Typography variant="body2">Button Link</Typography>
            <Link href="#" variant="button">Button Link</Link>
          </Box>
          
          <Box>
            <Typography variant="body2">Outline Link</Typography>
            <Link href="#" variant="outline">Outline Link</Link>
          </Box>
          
          <Box>
            <Typography variant="body2">Glass Link</Typography>
            <Link href="#" glass variant="button">Glass Link</Link>
          </Box>
          
          <Box>
            <Typography variant="body2">External Link</Typography>
            <Link href="https://example.com" external>External Link</Link>
          </Box>
          
          <Box>
            <Typography variant="body2">Animated Link</Typography>
            <Link href="#" animated glass variant="button">Animated Link</Link>
          </Box>
        </Stack>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Icon Component</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Icon variants:
        </Typography>
        
        <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2">Standard Icon</Typography>
            <Icon name="check" />
          </Box>
          
          <Box>
            <Typography variant="body2">Colored Icon</Typography>
            <Icon name="check" color="primary" />
          </Box>
          
          <Box>
            <Typography variant="body2">Large Icon</Typography>
            <Icon name="check" size="large" />
          </Box>
          
          <Box>
            <Typography variant="body2">Glass Icon</Typography>
            <Icon name="check" glass />
          </Box>
          
          <Box>
            <Typography variant="body2">Glow Effect</Typography>
            <Icon name="check" glowEffect />
          </Box>
          
          <Box>
            <Typography variant="body2">Spinning Icon</Typography>
            <Icon name="check" spin />
          </Box>
          
          <Box>
            <Typography variant="body2">Pulsing Icon</Typography>
            <Icon name="check" pulse />
          </Box>
          
          <Box>
            <Typography variant="body2">Rotated Icon</Typography>
            <Icon name="check" rotate={45} />
          </Box>
          
          <Box>
            <Typography variant="body2">Icon with Hover</Typography>
            <Icon name="check" hoverEffect />
          </Box>
        </Stack>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Backdrop Component</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Backdrop variants (click to see):
        </Typography>
        
        <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
          <Button onClick={() => handleOpenBackdrop('standard')}>Standard Backdrop</Button>
          <Button onClick={() => handleOpenBackdrop('glass')}>Glass Backdrop</Button>
          <Button onClick={() => handleOpenBackdrop('gradient')}>Gradient Backdrop</Button>
          <Button onClick={() => handleOpenBackdrop('radial')}>Radial Gradient</Button>
        </Stack>
        
        <Backdrop 
          open={backdropOpen} 
          onClick={() => setBackdropOpen(false)}
          glass={currentBackdropType === 'glass'}
          gradient={currentBackdropType === 'gradient' || currentBackdropType === 'radial'}
          blur="medium"
          opacity={0.7}
          animated
        >
          <Box style={{ 
            background: 'rgba(30, 41, 59, 0.8)', 
            padding: '24px', 
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            maxWidth: '400px'
          }}>
            <Typography variant="h5" style={{ marginBottom: '16px' }}>Backdrop Dialog</Typography>
            <Typography variant="body1" style={{ marginBottom: '24px' }}>
              This is a simple dialog displayed with the Backdrop component. Click anywhere to close.
            </Typography>
            <Button onClick={() => setBackdropOpen(false)}>Close</Button>
          </Box>
        </Backdrop>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Glass Border Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Glass border effect:
        </Typography>
        
        <GlassBorderDemo>
          <Typography variant="body1">Glass Border with Glow</Typography>
        </GlassBorderDemo>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Background Effects Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Background effects:
        </Typography>
        
        <Stack spacing={2}>
          <BackgroundEffectsDemo type="gradient">
            <Typography variant="body1">Gradient Background</Typography>
          </BackgroundEffectsDemo>
          
          <BackgroundEffectsDemo type="noise">
            <Typography variant="body1">Noise Background</Typography>
          </BackgroundEffectsDemo>
          
          <BackgroundEffectsDemo type="pattern">
            <Typography variant="body1">Pattern Background</Typography>
          </BackgroundEffectsDemo>
          
          <BackgroundEffectsDemo type="animated">
            <Typography variant="body1">Animated Background</Typography>
          </BackgroundEffectsDemo>
          
          <BackgroundEffectsDemo type="mesh">
            <Typography variant="body1">Mesh Gradient Background</Typography>
          </BackgroundEffectsDemo>
        </Stack>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Ambient Effects Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Ambient lighting effects:
        </Typography>
        
        <Stack spacing={2}>
          <AmbientEffectsDemo type="soft">
            <Typography variant="body1">Soft Ambient</Typography>
          </AmbientEffectsDemo>
          
          <AmbientEffectsDemo type="pulsing">
            <Typography variant="body1">Pulsing Ambient</Typography>
          </AmbientEffectsDemo>
          
          <AmbientEffectsDemo type="colorShift">
            <Typography variant="body1">Color Shift Ambient</Typography>
          </AmbientEffectsDemo>
          
          <AmbientEffectsDemo type="directional">
            <Typography variant="body1">Directional Ambient</Typography>
          </AmbientEffectsDemo>
          
          <AmbientEffectsDemo type="spotlight">
            <Typography variant="body1">Spotlight Ambient</Typography>
          </AmbientEffectsDemo>
          
          <AmbientEffectsDemo type="glowing">
            <Typography variant="body1">Glowing Ambient</Typography>
          </AmbientEffectsDemo>
        </Stack>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Interactive Glass Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Interactive states (hover and click to see effects):
        </Typography>
        
        <Stack spacing={2}>
          <InteractiveGlassDemo hoverEffect="glow" activeEffect="press">
            <Typography variant="body1">Glow & Press Effect</Typography>
          </InteractiveGlassDemo>
          
          <InteractiveGlassDemo hoverEffect="lift" activeEffect="sink">
            <Typography variant="body1">Lift & Sink Effect</Typography>
          </InteractiveGlassDemo>
          
          <InteractiveGlassDemo hoverEffect="brighten" activeEffect="darken">
            <Typography variant="body1">Brighten & Darken Effect</Typography>
          </InteractiveGlassDemo>
          
          <InteractiveGlassDemo hoverEffect="expand" activeEffect="outline">
            <Typography variant="body1">Expand & Outline Effect</Typography>
          </InteractiveGlassDemo>
          
          <InteractiveGlassDemo hoverEffect="highlight" activeEffect="press">
            <Typography variant="body1">Highlight Effect</Typography>
          </InteractiveGlassDemo>
        </Stack>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Focus Effects Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Focus effects (tab to focus buttons):
        </Typography>
        
        <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
          <FocusEffectsDemo type="outline">
            Outline Focus
          </FocusEffectsDemo>
          
          <FocusEffectsDemo type="ring">
            Ring Focus
          </FocusEffectsDemo>
          
          <FocusEffectsDemo type="glow">
            Glow Focus
          </FocusEffectsDemo>
          
          <FocusEffectsDemo type="border">
            Border Focus
          </FocusEffectsDemo>
          
          <FocusEffectsDemo type="inset">
            Inset Focus
          </FocusEffectsDemo>
        </Stack>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Hover Effects Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Hover effects (hover to see):
        </Typography>
        
        <Stack spacing={2}>
          <HoverEffectsDemo type="glow">
            <Typography variant="body1">Glow Hover Effect</Typography>
          </HoverEffectsDemo>
          
          <HoverEffectsDemo type="lift">
            <Typography variant="body1">Lift Hover Effect</Typography>
          </HoverEffectsDemo>
          
          <HoverEffectsDemo type="scale">
            <Typography variant="body1">Scale Hover Effect</Typography>
          </HoverEffectsDemo>
          
          <HoverEffectsDemo type="highlight">
            <Typography variant="body1">Highlight Hover Effect</Typography>
          </HoverEffectsDemo>
          
          <HoverEffectsDemo type="brighten">
            <Typography variant="body1">Brighten Hover Effect</Typography>
          </HoverEffectsDemo>
          
          <HoverEffectsDemo type="border">
            <Typography variant="body1">Border Hover Effect</Typography>
          </HoverEffectsDemo>
        </Stack>
      </DemoSection>
    </DemoContainer>
  );
};

export default InteractionDemo;