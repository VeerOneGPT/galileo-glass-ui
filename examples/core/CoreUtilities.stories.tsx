import React from 'react';
import styled, { css, DefaultTheme } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from '../../src/theme/ThemeProvider';

// Import Utilities & Mixins (assuming they are exported from index or specific paths)
// Using relative paths as a fallback guess if absolute fails
import {
    padding, margin, borderRadius, shadow, flex, grid, truncate, responsive, visuallyHidden,
    colorModeAware, getColorWithOpacity, withTheme,
    glassSurface, glassGlow, innerGlow, edgeHighlight,
    ZLayer, zLayer,
} from '../../src/core'; // Adjust path as needed
import { createThemeContext } from '../../src/core/themeUtils'; // Adjust path

// --- Mock Theme --- 
const mockTheme: DefaultTheme = {
    isDarkMode: false, colorMode: 'light', themeVariant: 'nebula',
    colors: { nebula: { accentPrimary: '#6366F1', accentSecondary: '#8B5CF6', accentTertiary: '#EC4899', stateCritical: '#EF4444', stateOptimal: '#10B981', stateAttention: '#F59E0B', stateInformational: '#3B82F6', neutralBackground: '#F9FAFB', neutralForeground: '#1F2937', neutralBorder: '#E5E7EB', neutralSurface: '#FFFFFF' }, glass: { light: { background: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', highlight: 'rgba(255, 255, 255, 0.3)', shadow: 'rgba(0, 0, 0, 0.1)', glow: 'rgba(255, 255, 255, 0.2)' }, dark: { background: 'rgba(0, 0, 0, 0.2)', border: 'rgba(255, 255, 255, 0.1)', highlight: 'rgba(255, 255, 255, 0.1)', shadow: 'rgba(0, 0, 0, 0.3)', glow: 'rgba(255, 255, 255, 0.1)' }, tints: { primary: 'rgba(99, 102, 241, 0.1)', secondary: 'rgba(139, 92, 246, 0.1)' } } },
    zIndex: { hide: -1, auto: 'auto', base: 0, docked: 10, dropdown: 1000, sticky: 1100, banner: 1200, overlay: 1300, modal: 1400, popover: 1500, skipLink: 1600, toast: 1700, tooltip: 1800, glacial: 9999 }
};

// --- Story Layout & Demo Components ---
const StoryContainer = styled.div` padding: 24px; `; 
const DemoSection = styled.section` margin-bottom: 32px; `; 
const SectionTitle = styled.h2` font-size: 20px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #eee; `;
const DemoGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; `;

// Base Box with common styles
const BaseBox = styled.div` 
    ${padding('md')} 
    ${margin('sm')} 
    ${borderRadius('md')} 
    background-color: rgba(0, 0, 0, 0.1); 
`;

// Create a transition-based component instead of animation
const TransitionBox = styled(BaseBox)`
  transition: background-color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-5px);
  }
`;

// Specific Boxes applying utilities
const ShadowBox = styled(BaseBox)` ${shadow('lg')} `; 
const TypographyBox = styled(BaseBox)` font-weight: bold; `;
const FlexDemoBox = styled(BaseBox)` 
    ${flex('row', 'space-around', 'center', 'wrap')} 
    height: 100px; 
`;
const GridDemoBox = styled(BaseBox)` ${grid(3, 'sm')} `;
const TruncateBox = styled(BaseBox)` ${truncate(1)} width: 150px; `;
const TruncateMultiBox = styled(BaseBox)` ${truncate(2)} width: 150px; margin-top: 10px; `;
const ResponsiveBox = styled(BaseBox)` 
    ${responsive({ base: padding('sm'), md: padding('lg') })} 
    font-size: 14px; 
    ${responsive({ md: css`font-size: 18px;` })}
`;
const VisuallyHiddenSpan = styled.span` ${visuallyHidden()} `;

const FlexItem = styled.div` ${padding('sm')} ${borderRadius('sm')} background-color: rgba(99, 102, 241, 0.3); margin: 4px; `; 
const GridItem = styled.div` ${padding('md')} ${borderRadius('sm')} background-color: rgba(99, 102, 241, 0.3); text-align: center; `;

// --- Mixin Demo Components --- 
const ElevationDemo = styled.div<{ level: 'low' | 'medium' | 'high'; theme: DefaultTheme }>`
  ${padding('lg')} ${borderRadius('md')} ${props => margin(props.level === 'high' ? 'xs' : 0, props.level === 'high' ? 'xs' : 0, props.level === 'low' ? 'xs' : 0, props.level === 'low' ? 'xs' : 0)}
  ${props => {
    // @ts-ignore - Use a workaround for the mixin
    try {
      // Use a try/catch to handle any issues with glassSurface
      return glassSurface({ 
        elevation: props.level, 
        blurStrength: 'standard', 
        themeContext: createThemeContext(props.theme) 
      });
    } catch (e) {
      // Fallback if there's an issue
      return 'background-color: rgba(0, 0, 0, 0.1);';
    }
  }}
`;

const ColorModeDemo = styled.div`
  ${padding('lg')} ${borderRadius('md')} 
  ${props => colorModeAware(`background-color: #f0f0f0; color: #333;`, `background-color: #333; color: #f0f0f0;`)}
`;

// --- Storybook Meta Configuration ---
const meta: Meta = {
  title: 'Core/Utilities & Mixins',
  parameters: { layout: 'padded' },
  decorators: [(Story) => (
    <ThemeProvider initialTheme="dark" initialColorMode="dark">
      <StoryContainer>
        <Story />
      </StoryContainer>
    </ThemeProvider>
  )],
};
export default meta;
type Story = StoryObj;

// --- Individual Stories ---

export const StyleUtils: Story = {
  render: () => (
    <DemoSection>
      <SectionTitle>Style Utilities</SectionTitle>
      <DemoGrid>
        <BaseBox><p>Padding, Margin, Radius</p></BaseBox>
        <ShadowBox><p>Shadow</p></ShadowBox>
        <TypographyBox><p>Typography (Manual Style)</p></TypographyBox>
        <TransitionBox><p>Hover Transition</p></TransitionBox>
      </DemoGrid>
      
      <h4>Flex Layout</h4>
      <FlexDemoBox>
        <FlexItem>Item 1</FlexItem> <FlexItem>Item 2</FlexItem> <FlexItem>Item 3</FlexItem>
      </FlexDemoBox>
      <h4>Grid Layout</h4>
       <GridDemoBox>
          <GridItem>1</GridItem><GridItem>2</GridItem><GridItem>3</GridItem>
          <GridItem>4</GridItem><GridItem>5</GridItem><GridItem>6</GridItem>
       </GridDemoBox>
      <h4>Truncate</h4>
       <TruncateBox>Single line truncate: Long text here.</TruncateBox>
       <TruncateMultiBox>Multi-line truncate: Very long text here that needs more than one line.</TruncateMultiBox>
      <h4>Responsive</h4>
       <ResponsiveBox>Padding/Typography (Manual) changes (Resize window)</ResponsiveBox>
      <h4>Visually Hidden</h4>
       <BaseBox><label>Label: <VisuallyHiddenSpan>Hidden Info</VisuallyHiddenSpan> Visible Info</label></BaseBox>
    </DemoSection>
  ),
};

export const ZSpaceSystem: Story = {
  render: () => (
    <DemoSection>
      <SectionTitle>Z-Space System</SectionTitle>
      <p>The Z-space system provides consistent z-index management with well-defined layers.</p>
      <div style={{ padding: '16px', border: '1px solid #444', borderRadius: '8px', marginTop: '16px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '8px', marginBottom: '8px', backgroundColor: 'rgba(99, 102, 241, 0.3)' }}>
          <code>ZLayer.BACKGROUND</code>: Base layer for background elements
        </div>
        <div style={{ padding: '8px', marginBottom: '8px', backgroundColor: 'rgba(139, 92, 246, 0.3)' }}>
          <code>ZLayer.CONTENT</code>: Main content layer
        </div>
        <div style={{ padding: '8px', marginBottom: '8px', backgroundColor: 'rgba(16, 185, 129, 0.3)' }}>
          <code>ZLayer.SURFACE</code>: UI surfaces like cards and panels
        </div>
        <div style={{ padding: '8px', marginBottom: '8px', backgroundColor: 'rgba(236, 72, 153, 0.3)' }}>
          <code>ZLayer.OVERLAY</code>: Overlays, tooltips, etc.
        </div>
        <div style={{ padding: '8px', marginBottom: '8px', backgroundColor: 'rgba(245, 158, 11, 0.3)' }}>
          <code>ZLayer.MODAL</code>: Modal dialogs
        </div>
        <div style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.3)' }}>
          <code>ZLayer.TOP</code>: Highest level elements
        </div>
      </div>
    </DemoSection>
  ),
};

export const ThemeUtils: Story = {
    render: () => (
        <DemoSection>
             <SectionTitle>Theme Utilities</SectionTitle>
             <ColorModeDemo theme={mockTheme}>Color Mode Aware (Check dark mode in Storybook)</ColorModeDemo>
         </DemoSection>
    )
}; 