/**
 * Core Utilities Demo
 * 
 * A demonstration of the core utilities in Glass UI
 */
import React from 'react';
import styled from 'styled-components';
import {
  // Style utilities
  padding,
  margin,
  borderRadius,
  shadow,
  typography,
  flex,
  grid,
  truncate,
  responsive,
  visuallyHidden,
  
  // Theme utilities
  colorModeAware,
  getColorWithOpacity,
  withTheme,
  
  // Glass mixins
  glassSurface,
  glassGlow,
  innerGlow,
  edgeHighlight,
  
  // Z-Space system
  ZLayer,
  ZDepth,
  zLayer
} from '../core';

// Create a theme context for the demo
import { createThemeContext } from '../design/core/themeContext';

/**
 * Styled components for the demo
 */
const Container = styled.div`
  padding: 24px;
  background-color: #1a1f2e;
  min-height: 100vh;
  color: rgba(255, 255, 255, 0.9);
  ${padding('lg')}
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
  ${typography('h1')}
  ${margin(0, 0, 'lg')}
`;

const Description = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.7);
  ${typography('md')}
  ${margin(0, 0, 'xl')}
`;

const Grid = styled.div`
  ${grid(2, 'lg')}
  margin-bottom: 32px;
`;

const DemoSection = styled.section`
  ${padding('lg')}
  ${margin(0, 0, 'lg')}
  ${borderRadius('md')}
  background-color: rgba(30, 41, 59, 0.5);
  
  /* Apply shadow utility */
  ${props => shadow('md', true)}
`;

const SectionTitle = styled.h2`
  ${typography('h3')}
  ${margin(0, 0, 'md')}
  color: rgba(255, 255, 255, 0.9);
`;

const DemoBox = styled.div`
  ${padding('md')}
  ${margin('sm')}
  ${borderRadius('md')}
  background-color: rgba(255, 255, 255, 0.1);
  
  /* Use the flex utility */
  ${flex('row', 'space-between', 'center')}
`;

const ElevationDemo = styled.div<{ level: 'low' | 'medium' | 'high' }>`
  ${padding('lg')}
  ${borderRadius('md')}
  
  /* Apply glass surface based on prop */
  ${props => glassSurface({
    elevation: props.level,
    blurStrength: props.level === 'high' ? 'enhanced' : props.level === 'medium' ? 'standard' : 'light',
    backgroundOpacity: 'light',
    borderOpacity: 'subtle',
    themeContext: createThemeContext(props.theme, true)
  })}
  
  /* Add margin based on elevation to create 3D effect */
  ${props => margin(
    props.level === 'high' ? 'xs' : 0,
    props.level === 'high' ? 'xs' : 0,
    props.level === 'low' ? 'xs' : 0,
    props.level === 'low' ? 'xs' : 0
  )}
`;

const GlowDemo = styled.div<{ color: string; interactive?: boolean }>`
  ${padding('lg')}
  ${borderRadius('md')}
  ${margin('sm')}
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Apply glass surface with glow based on props */
  ${props => glassSurface({
    blurStrength: 'standard',
    backgroundOpacity: 'light',
    borderOpacity: 'subtle',
    themeContext: createThemeContext(props.theme, true)
  })}
  
  ${props => glassGlow({
    color: props.color,
    intensity: 'medium',
    themeContext: createThemeContext(props.theme, true)
  })}
  
  /* Apply hover effects for interactive elements */
  ${props => props.interactive && `
    cursor: pointer;
    transition: transform 0.2s ease-out;
    
    &:hover {
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.98);
    }
  `}
`;

const InnerGlowDemo = styled.div<{ color: string }>`
  ${padding('lg')}
  ${borderRadius('md')}
  ${margin('sm')}
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Apply glass surface with inner glow */
  ${props => glassSurface({
    blurStrength: 'standard',
    backgroundOpacity: 'light',
    borderOpacity: 'subtle',
    themeContext: createThemeContext(props.theme, true)
  })}
  
  ${props => innerGlow({
    color: props.color,
    intensity: 'medium',
    spread: 15,
    themeContext: createThemeContext(props.theme, true)
  })}
`;

const EdgeHighlightDemo = styled.div<{ 
  color: string; 
  position: 'top' | 'right' | 'bottom' | 'left' | 'all' 
}>`
  ${padding('lg')}
  ${borderRadius('md')}
  ${margin('sm')}
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Apply glass surface with edge highlight */
  ${props => glassSurface({
    blurStrength: 'standard',
    backgroundOpacity: 'light',
    borderOpacity: 'subtle',
    themeContext: createThemeContext(props.theme, true)
  })}
  
  ${props => edgeHighlight({
    color: props.color,
    position: props.position,
    thickness: 2,
    opacity: 0.8,
    themeContext: createThemeContext(props.theme, true)
  })}
`;

const ZSpaceDemo = styled.div<{ layer: ZLayer; depth?: ZDepth }>`
  ${padding('md')}
  ${borderRadius('md')}
  ${margin('sm')}
  background-color: ${props => 
    getColorWithOpacity(props.color || '#6366F1', 0.2)
  };
  
  /* Apply Z-layer and depth */
  ${props => zLayer(props.layer, props.depth)}
  
  /* Add visual indicator of depth */
  ${props => props.depth && `
    transform-style: preserve-3d;
    perspective: 1000px;
  `}
`;

const ResponsiveDemo = styled.div`
  ${responsive({
    base: padding('sm'),
    sm: padding('md'),
    md: padding('lg'),
    lg: padding('xl')
  })}
  
  ${borderRadius('md')}
  background-color: rgba(255, 255, 255, 0.1);
  
  /* Use the responsive utility for typography */
  ${responsive({
    base: typography('sm'),
    md: typography('md'),
    lg: typography('lg')
  })}
`;

const ColorModeDemo = styled.div`
  ${padding('lg')}
  ${borderRadius('md')}
  
  /* Apply color mode aware styles */
  ${colorModeAware(
    // Light mode styles
    `
      background-color: rgba(255, 255, 255, 0.9);
      color: #1a1f2e;
    `,
    // Dark mode styles
    `
      background-color: rgba(30, 41, 59, 0.8);
      color: rgba(255, 255, 255, 0.9);
    `
  )}
`;

const TruncateDemo = styled.div`
  ${padding('md')}
  width: 200px;
  background-color: rgba(255, 255, 255, 0.1);
  ${borderRadius('md')}
  
  /* Apply truncate for single line */
  ${truncate(1)}
`;

const TruncateMultilineDemo = styled.div`
  ${padding('md')}
  width: 200px;
  background-color: rgba(255, 255, 255, 0.1);
  ${borderRadius('md')}
  
  /* Apply truncate for multiple lines */
  ${truncate(2)}
`;

const VisuallyHiddenDemo = styled.label`
  /* Apply visually hidden utility */
  ${visuallyHidden()}
`;

const FlexDemo = styled.div`
  ${padding('md')}
  ${borderRadius('md')}
  background-color: rgba(255, 255, 255, 0.1);
  height: 150px;
  
  /* Apply flex utility */
  ${flex('row', 'space-between', 'center', 'wrap')}
`;

const FlexItem = styled.div`
  ${padding('sm')}
  ${borderRadius('sm')}
  background-color: rgba(99, 102, 241, 0.3);
`;

const GridDemo = styled.div`
  ${padding('md')}
  ${borderRadius('md')}
  background-color: rgba(255, 255, 255, 0.1);
  
  /* Apply grid utility */
  ${grid(3, 'md')}
`;

const GridItem = styled.div`
  ${padding('md')}
  ${borderRadius('sm')}
  background-color: rgba(99, 102, 241, 0.3);
  text-align: center;
`;

/**
 * Core Utilities Demo Component
 */
export const CoreUtilitiesDemo: React.FC = () => {
  return (
    <Container>
      <Title>Glass UI Core Utilities</Title>
      <Description>
        A demonstration of the core styling utilities and mixins available in the Glass UI framework.
      </Description>
      
      <Grid>
        {/* Style Utilities Demo */}
        <DemoSection>
          <SectionTitle>Style Utilities</SectionTitle>
          
          <DemoBox>
            <div>
              <h3>Padding & Margin</h3>
              <p>Utilities for consistent spacing</p>
            </div>
          </DemoBox>
          
          <DemoBox>
            <div>
              <h3>Border Radius</h3>
              <p>Consistent border radius values</p>
            </div>
          </DemoBox>
          
          <DemoBox>
            <div>
              <h3>Typography</h3>
              <p>Typography scale and utilities</p>
            </div>
          </DemoBox>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Flex Layout</h4>
            <FlexDemo>
              <FlexItem>Flex Item 1</FlexItem>
              <FlexItem>Flex Item 2</FlexItem>
              <FlexItem>Flex Item 3</FlexItem>
            </FlexDemo>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Grid Layout</h4>
            <GridDemo>
              <GridItem>Grid Item 1</GridItem>
              <GridItem>Grid Item 2</GridItem>
              <GridItem>Grid Item 3</GridItem>
              <GridItem>Grid Item 4</GridItem>
              <GridItem>Grid Item 5</GridItem>
              <GridItem>Grid Item 6</GridItem>
            </GridDemo>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Text Truncation</h4>
            <TruncateDemo>
              This is a long text that will be truncated to a single line with an ellipsis at the end.
            </TruncateDemo>
            
            <TruncateMultilineDemo style={{ marginTop: '10px' }}>
              This is a long text that will be truncated to exactly two lines. Any content beyond the second line will be cut off with an ellipsis.
            </TruncateMultilineDemo>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Responsive Styling</h4>
            <ResponsiveDemo>
              This box has responsive padding and typography that changes based on screen size.
              Resize your window to see the changes.
            </ResponsiveDemo>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Visually Hidden</h4>
            <div>
              <VisuallyHiddenDemo>
                This text is hidden visually but accessible to screen readers.
              </VisuallyHiddenDemo>
              <span>The label for this field is hidden visually but accessible to screen readers.</span>
            </div>
          </div>
        </DemoSection>
        
        {/* Glass Mixins Demo */}
        <DemoSection>
          <SectionTitle>Glass Mixins</SectionTitle>
          
          <div>
            <h4>Glass Surface with Elevation</h4>
            <div style={{ position: 'relative', perspective: '1000px' }}>
              <ElevationDemo level="high">
                High Elevation
              </ElevationDemo>
              <ElevationDemo level="medium">
                Medium Elevation
              </ElevationDemo>
              <ElevationDemo level="low">
                Low Elevation
              </ElevationDemo>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Glass Glow Effects</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <GlowDemo color="primary" interactive>
                Primary
              </GlowDemo>
              <GlowDemo color="secondary" interactive>
                Secondary
              </GlowDemo>
              <GlowDemo color="success" interactive>
                Success
              </GlowDemo>
              <GlowDemo color="error" interactive>
                Error
              </GlowDemo>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Inner Glow Effects</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <InnerGlowDemo color="primary">
                Primary
              </InnerGlowDemo>
              <InnerGlowDemo color="secondary">
                Secondary
              </InnerGlowDemo>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Edge Highlight Effects</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <EdgeHighlightDemo color="primary" position="top">
                Top
              </EdgeHighlightDemo>
              <EdgeHighlightDemo color="secondary" position="right">
                Right
              </EdgeHighlightDemo>
              <EdgeHighlightDemo color="success" position="bottom">
                Bottom
              </EdgeHighlightDemo>
              <EdgeHighlightDemo color="error" position="left">
                Left
              </EdgeHighlightDemo>
              <EdgeHighlightDemo color="primary" position="all">
                All
              </EdgeHighlightDemo>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Z-Space System</h4>
            <div style={{ position: 'relative', perspective: '1000px' }}>
              <ZSpaceDemo layer={ZLayer.BACKGROUND} color="#10B981">
                Background Layer
              </ZSpaceDemo>
              <ZSpaceDemo layer={ZLayer.CONTENT} color="#3B82F6">
                Content Layer
              </ZSpaceDemo>
              <ZSpaceDemo layer={ZLayer.SURFACE} color="#8B5CF6">
                Surface Layer
              </ZSpaceDemo>
              <ZSpaceDemo layer={ZLayer.OVERLAY} color="#F43F5E">
                Overlay Layer
              </ZSpaceDemo>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Color Mode Aware</h4>
            <ColorModeDemo>
              This box adapts its styling based on the current color mode (light or dark).
            </ColorModeDemo>
          </div>
        </DemoSection>
      </Grid>
    </Container>
  );
};