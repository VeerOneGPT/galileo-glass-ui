import React, { useState } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// Import Components (using relative paths for potentially unexported ones)
import { Backdrop } from '../../src/components/Backdrop';
import { Box } from '../../src/components/Box';
import { Button } from '../../src/components/Button'; // Use relative path
import { Divider } from '../../src/components/Divider';
import { Icon } from '../../src/components/Icon'; // Use relative path
import { Link } from '../../src/components/Link';
import { Stack } from '../../src/components/Stack';
import { Typography } from '../../src/components/Typography'; // Try relative path for Typography component

// Import Mixins & Utils (using relative paths as likely needed)
import { backgroundEffects } from '../../src/core/mixins/backgroundEffects';
import { ambientEffects } from '../../src/core/mixins/effects/ambientEffects';
import { glassBorder } from '../../src/core/mixins/glassBorder';
import { focusEffects } from '../../src/core/mixins/interactions/focusEffects';
import { hoverEffects } from '../../src/core/mixins/interactions/hoverEffects';
import { interactiveGlass } from '../../src/core/mixins/interactions/interactiveGlass';
import { createThemeContext } from '../../src/core/themeUtils';

// Type Aliases for potentially unexported mixin option types (using any)
type BackgroundEffectType = any;
type AmbientEffectType = any;
type InteractiveGlassHoverEffect = any;
type InteractiveGlassActiveEffect = any;
type FocusEffectType = any;
type HoverEffectType = any;

// Mock Theme (consistent with previous stories)
const mockTheme: DefaultTheme = {
    isDarkMode: false, colorMode: 'light', themeVariant: 'nebula',
    colors: { nebula: { accentPrimary: '#6366F1', accentSecondary: '#8B5CF6', accentTertiary: '#EC4899', stateCritical: '#EF4444', stateOptimal: '#10B981', stateAttention: '#F59E0B', stateInformational: '#3B82F6', neutralBackground: '#F9FAFB', neutralForeground: '#1F2937', neutralBorder: '#E5E7EB', neutralSurface: '#FFFFFF' }, glass: { light: { background: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', highlight: 'rgba(255, 255, 255, 0.3)', shadow: 'rgba(0, 0, 0, 0.1)', glow: 'rgba(255, 255, 255, 0.2)' }, dark: { background: 'rgba(0, 0, 0, 0.2)', border: 'rgba(255, 255, 255, 0.1)', highlight: 'rgba(255, 255, 255, 0.1)', shadow: 'rgba(0, 0, 0, 0.3)', glow: 'rgba(255, 255, 255, 0.1)' }, tints: { primary: 'rgba(99, 102, 241, 0.1)', secondary: 'rgba(139, 92, 246, 0.1)' } } },
    zIndex: { hide: -1, auto: 'auto', base: 0, docked: 10, dropdown: 1000, sticky: 1100, banner: 1200, overlay: 1300, modal: 1400, popover: 1500, skipLink: 1600, toast: 1700, tooltip: 1800, glacial: 9999 }
};

// --- Story Layout Components ---
const StoryContainer = styled.div`
  padding: 24px;
`;

const DemoSection = styled.div`
  margin-bottom: 32px;
`;

// --- Styled Components Demonstrating Mixins (from original demo) ---

const GlassBorderDemo = styled.div<{ theme: DefaultTheme }>`
  ${props =>
    glassBorder({
      width: 2, style: 'solid', opacity: 'medium', gradient: true, glow: true,
      glowColor: '#3b82f6', glowIntensity: 'medium', radius: 8, position: 'all',
      animated: true, themeContext: createThemeContext(props.theme),
    })}
  padding: 24px; width: 100%; height: 120px; display: flex;
  align-items: center; justify-content: center; margin-bottom: 16px;
`;

const BackgroundEffectsDemo = styled.div<{ theme: DefaultTheme; type: BackgroundEffectType }>`
  ${props =>
    backgroundEffects({
      type: props.type, baseColor: '#3b82f6', secondaryColor: '#8b5cf6',
      tertiaryColor: '#ec4899', opacity: 'medium', angle: 135, density: 'medium',
      animationSpeed: 'medium', blur: 'medium', patternType: 'dots',
      themeContext: createThemeContext(props.theme),
    })}
  padding: 24px; width: 100%; height: 120px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
`;

const AmbientEffectsDemo = styled.div<{ theme: DefaultTheme; type: AmbientEffectType }>`
  position: relative; background-color: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
  ${props =>
    ambientEffects({
      type: props.type, color: '#3b82f6', secondaryColor: '#8b5cf6', intensity: 'medium',
      size: 'medium', direction: 'top-right', animationSpeed: 'medium',
      alternate: true, themeContext: createThemeContext(props.theme),
    })}
  padding: 24px; width: 100%; height: 120px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
`;

const InteractiveGlassDemo = styled.div<{ 
    theme: DefaultTheme; 
    hoverEffect: InteractiveGlassHoverEffect; 
    activeEffect: InteractiveGlassActiveEffect; 
}>`
  ${props =>
    interactiveGlass({
      hoverEffect: props.hoverEffect, activeEffect: props.activeEffect,
      focusEffect: 'outline', disabledEffect: 'fade', blurStrength: 'standard',
      backgroundOpacity: 'light', borderOpacity: 'subtle', elevation: 2,
      color: '#3b82f6', themeContext: createThemeContext(props.theme),
    })}
  padding: 24px; width: 100%; height: 120px; display: flex;
  align-items: center; justify-content: center; margin-bottom: 16px;
  cursor: pointer; /* Add cursor pointer */
  color: ${props => props.theme.colors.nebula.neutralForeground}; /* Ensure text color */
`;

const StyledFocusButton = styled.button<{ theme: DefaultTheme; focusType: FocusEffectType }>`
  background-color: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
  color: ${props => props.theme.colors.nebula.neutralForeground}; padding: 12px 24px; cursor: pointer;
  ${props =>
    focusEffects({
      type: props.focusType, color: '#3b82f6', thickness: 3,
      opacity: 0.6, animated: true, focusVisible: true, // Assuming focusVisible is handled
      borderRadius: 8, themeContext: createThemeContext(props.theme),
    })}
`;

const HoverEffectsDemo = styled.div<{ theme: DefaultTheme; type: HoverEffectType }>`
  background-color: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
  padding: 24px; width: 100%; height: 120px; display: flex;
  align-items: center; justify-content: center; cursor: pointer;
  color: ${props => props.theme.colors.nebula.neutralForeground};
  ${props =>
    hoverEffects({
      type: props.type, color: '#3b82f6', intensity: 'medium',
      animated: true, amount: 'medium', themeContext: createThemeContext(props.theme),
    })}
`;

// --- Storybook Meta Configuration ---
const meta: Meta = {
  title: 'Core/Interaction Mixins & Components',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={mockTheme}>
        <StoryContainer>
          <Story />
        </StoryContainer>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// --- Individual Stories ---

// Divider Story
export const DividerComponent: Story = {
  render: () => (
    <DemoSection>
      <Typography variant="h4">Divider Component</Typography>
      <Stack spacing={3}>
        <Box><Typography variant="body2">Standard</Typography><Divider /></Box>
        <Box><Typography variant="body2">With Text</Typography><Divider>Section</Divider></Box>
        <Box><Typography variant="body2">Vertical</Typography><div style={{ display: 'flex', height: '60px', alignItems: 'center' }}>Left<Divider orientation="vertical" style={{ margin: '0 16px' }} />Right</div></Box>
        <Box><Typography variant="body2">Glass</Typography><Divider glass thickness={2} /></Box>
        <Box><Typography variant="body2">Gradient</Typography><Divider gradient thickness={2} /></Box>
        <Box><Typography variant="body2">Animated</Typography><Divider animated gradient thickness={2} /></Box>
      </Stack>
    </DemoSection>
  ),
};

// Link Story
export const LinkComponent: Story = {
  render: () => (
    <DemoSection>
      <Typography variant="h4">Link Component</Typography>
      <Stack spacing={2}>
        <Box><Typography variant="body2">Standard</Typography><Link href="#">Link</Link></Box>
        <Box><Typography variant="body2">Colored</Typography><Link href="#" color="secondary">Link</Link></Box>
        <Box><Typography variant="body2">Hover Underline</Typography><Link href="#" underlineOnHover>Link</Link></Box>
        <Box><Typography variant="body2">Button</Typography><Link href="#" variant="button">Link</Link></Box>
        <Box><Typography variant="body2">Outline</Typography><Link href="#" variant="outline">Link</Link></Box>
        <Box><Typography variant="body2">Glass Button</Typography><Link href="#" glass variant="button">Link</Link></Box>
        <Box><Typography variant="body2">External</Typography><Link href="https://example.com" external>Link</Link></Box>
        <Box><Typography variant="body2">Animated Glass</Typography><Link href="#" animated glass variant="button">Link</Link></Box>
      </Stack>
    </DemoSection>
  ),
};

// Icon Story
export const IconComponent: Story = {
  render: () => (
    <DemoSection>
      <Typography variant="h4">Icon Component</Typography>
      <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
        <Box><Typography variant="body2">Std.</Typography><Icon name="check" /></Box>
        <Box><Typography variant="body2">Color</Typography><Icon name="check" color="primary" /></Box>
        <Box><Typography variant="body2">Large</Typography><Icon name="check" size="large" /></Box>
        <Box><Typography variant="body2">Glass</Typography><Icon name="check" glass /></Box>
        <Box><Typography variant="body2">Glow</Typography><Icon name="check" glowEffect /></Box>
        <Box><Typography variant="body2">Spin</Typography><Icon name="check" spin /></Box>
        <Box><Typography variant="body2">Pulse</Typography><Icon name="check" pulse /></Box>
        <Box><Typography variant="body2">Rotate</Typography><Icon name="check" rotate={45} /></Box>
        <Box><Typography variant="body2">Hover</Typography><Icon name="check" hoverEffect /></Box>
      </Stack>
    </DemoSection>
  ),
};

// Backdrop Story
const BackdropStoryComponent: React.FC = () => {
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [currentBackdropType, setCurrentBackdropType] = useState('standard');

  const handleOpenBackdrop = (type: string) => {
    setCurrentBackdropType(type);
    setBackdropOpen(true);
  };
  
  return (
     <DemoSection>
        <Typography variant="h4">Backdrop Component</Typography>
        <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
          <Button onClick={() => handleOpenBackdrop('standard')}>Standard</Button>
          <Button onClick={() => handleOpenBackdrop('glass')}>Glass</Button>
          <Button onClick={() => handleOpenBackdrop('gradient')}>Gradient</Button>
          {/* Add Radial gradient if supported by mixin/component */}
        </Stack>
        <Backdrop
          open={backdropOpen}
          onClick={() => setBackdropOpen(false)}
          glass={currentBackdropType === 'glass'}
          gradient={currentBackdropType === 'gradient'}
          blur="medium" opacity={0.7} animated
        >
          <Box style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '24px', borderRadius: '8px', maxWidth: '400px' }}>
            <Typography variant="h5" style={{ marginBottom: '16px' }}>Backdrop Dialog</Typography>
            <Typography variant="body1" style={{ marginBottom: '24px' }}>Click anywhere to close.</Typography>
            <Button onClick={() => setBackdropOpen(false)}>Close</Button>
          </Box>
        </Backdrop>
      </DemoSection>
  )
}
export const BackdropComponent: Story = {
    render: () => <BackdropStoryComponent />
};

// Mixin Stories
export const GlassBorderMixin: Story = {
  render: () => (
     <DemoSection>
        <Typography variant="h4">glassBorder Mixin</Typography>
        <GlassBorderDemo theme={mockTheme}>
          <Typography variant="body1">Glass Border with Glow</Typography>
        </GlassBorderDemo>
    </DemoSection>
  ),
};

export const BackgroundEffectsMixin: Story = {
  render: () => (
     <DemoSection>
        <Typography variant="h4">backgroundEffects Mixin</Typography>
        <Stack spacing={2}>
          <BackgroundEffectsDemo theme={mockTheme} type="gradient">
             <Typography variant="body1">Gradient</Typography>
          </BackgroundEffectsDemo>
           <BackgroundEffectsDemo theme={mockTheme} type="noise">
             <Typography variant="body1">Noise</Typography>
          </BackgroundEffectsDemo>
          <BackgroundEffectsDemo theme={mockTheme} type="pattern">
             <Typography variant="body1">Pattern</Typography>
          </BackgroundEffectsDemo>
          <BackgroundEffectsDemo theme={mockTheme} type="animated">
             <Typography variant="body1">Animated</Typography>
          </BackgroundEffectsDemo>
          <BackgroundEffectsDemo theme={mockTheme} type="mesh">
             <Typography variant="body1">Mesh Gradient</Typography>
          </BackgroundEffectsDemo>
        </Stack>
    </DemoSection>
  ),
};

export const AmbientEffectsMixin: Story = {
  render: () => (
     <DemoSection>
        <Typography variant="h4">ambientEffects Mixin</Typography>
        <Stack spacing={2}>
          <AmbientEffectsDemo theme={mockTheme} type="soft"><Typography variant="body1">Soft</Typography></AmbientEffectsDemo>
          <AmbientEffectsDemo theme={mockTheme} type="pulsing"><Typography variant="body1">Pulsing</Typography></AmbientEffectsDemo>
          <AmbientEffectsDemo theme={mockTheme} type="colorShift"><Typography variant="body1">Color Shift</Typography></AmbientEffectsDemo>
          <AmbientEffectsDemo theme={mockTheme} type="directional"><Typography variant="body1">Directional</Typography></AmbientEffectsDemo>
          <AmbientEffectsDemo theme={mockTheme} type="spotlight"><Typography variant="body1">Spotlight</Typography></AmbientEffectsDemo>
          <AmbientEffectsDemo theme={mockTheme} type="glowing"><Typography variant="body1">Glowing</Typography></AmbientEffectsDemo>
        </Stack>
    </DemoSection>
  ),
};

export const InteractiveGlassMixin: Story = {
  render: () => (
     <DemoSection>
        <Typography variant="h4">interactiveGlass Mixin</Typography>
         <Typography variant="body1" style={{ marginBottom: '16px' }}>Hover and click:</Typography>
        <Stack spacing={2}>
          <InteractiveGlassDemo theme={mockTheme} hoverEffect="glow" activeEffect="press"><Typography variant="body1">Glow & Press</Typography></InteractiveGlassDemo>
          <InteractiveGlassDemo theme={mockTheme} hoverEffect="lift" activeEffect="sink"><Typography variant="body1">Lift & Sink</Typography></InteractiveGlassDemo>
          <InteractiveGlassDemo theme={mockTheme} hoverEffect="brighten" activeEffect="darken"><Typography variant="body1">Brighten & Darken</Typography></InteractiveGlassDemo>
          <InteractiveGlassDemo theme={mockTheme} hoverEffect="expand" activeEffect="outline"><Typography variant="body1">Expand & Outline</Typography></InteractiveGlassDemo>
          <InteractiveGlassDemo theme={mockTheme} hoverEffect="highlight" activeEffect="press"><Typography variant="body1">Highlight</Typography></InteractiveGlassDemo>
        </Stack>
    </DemoSection>
  ),
};

export const FocusEffectsMixin: Story = {
  render: () => (
     <DemoSection>
        <Typography variant="h4">focusEffects Mixin</Typography>
         <Typography variant="body1" style={{ marginBottom: '16px' }}>Tab to focus buttons:</Typography>
        <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
          <StyledFocusButton theme={mockTheme} focusType="outline">Outline</StyledFocusButton>
          <StyledFocusButton theme={mockTheme} focusType="ring">Ring</StyledFocusButton>
          <StyledFocusButton theme={mockTheme} focusType="glow">Glow</StyledFocusButton>
          <StyledFocusButton theme={mockTheme} focusType="border">Border</StyledFocusButton>
          <StyledFocusButton theme={mockTheme} focusType="inset">Inset</StyledFocusButton>
        </Stack>
    </DemoSection>
  ),
};

export const HoverEffectsMixin: Story = {
  render: () => (
     <DemoSection>
        <Typography variant="h4">hoverEffects Mixin</Typography>
         <Typography variant="body1" style={{ marginBottom: '16px' }}>Hover over elements:</Typography>
        <Stack spacing={2}>
          <HoverEffectsDemo theme={mockTheme} type="glow"><Typography variant="body1">Glow</Typography></HoverEffectsDemo>
          <HoverEffectsDemo theme={mockTheme} type="lift"><Typography variant="body1">Lift</Typography></HoverEffectsDemo>
          <HoverEffectsDemo theme={mockTheme} type="scale"><Typography variant="body1">Scale</Typography></HoverEffectsDemo>
          <HoverEffectsDemo theme={mockTheme} type="highlight"><Typography variant="body1">Highlight</Typography></HoverEffectsDemo>
          <HoverEffectsDemo theme={mockTheme} type="brighten"><Typography variant="body1">Brighten</Typography></HoverEffectsDemo>
          <HoverEffectsDemo theme={mockTheme} type="border"><Typography variant="body1">Border</Typography></HoverEffectsDemo>
        </Stack>
    </DemoSection>
  ),
}; 