import React, { useState } from 'react';
import { 
  DimensionalGlass,
  FrostedGlass,
  HeatGlass,
  WidgetGlass,
  PageGlassContainer,
  AtmosphericBackground,
  ParticleBackground
} from 'galileo-glass-ui';
import { 
  glassSurface, 
  glassGlow,
  innerGlow,
  edgeHighlight,
  enhancedGlow,
  adaptiveGlass,
  createThemeContext
} from 'galileo-glass-ui/core';
import styled from 'styled-components';

// Custom glass variants using the glass mixins
const StyledGlassElement = styled.div<{ theme: any }>`
  ${props => {
    const themeContext = createThemeContext(props.theme);
    
    return glassSurface({
      elevation: 2,
      blurStrength: 'medium',
      borderOpacity: 0.3,
      themeContext
    });
  }}
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const EnhancedGlowElement = styled.div<{ theme: any }>`
  ${props => {
    const themeContext = createThemeContext(props.theme);
    
    return `
      ${glassSurface({
        elevation: 3,
        themeContext
      })}
      
      ${enhancedGlow({
        color: 'primary',
        intensity: 'medium',
        themeContext
      })}
    `;
  }}
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const CompoundGlassElement = styled.div<{ theme: any }>`
  ${props => {
    const themeContext = createThemeContext(props.theme);
    
    return `
      ${glassSurface({
        elevation: 3,
        themeContext
      })}
      
      ${edgeHighlight({
        position: 'bottom',
        themeContext
      })}
      
      ${innerGlow({
        color: 'secondary',
        intensity: 'subtle',
        themeContext
      })}
    `;
  }}
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const AdaptiveGlassElement = styled.div<{ theme: any }>`
  ${props => {
    const themeContext = createThemeContext(props.theme);
    
    return adaptiveGlass({
      themeContext
    });
  }}
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

/**
 * Demo of Specialized Glass Surfaces from Galileo Glass UI
 */
export const SpecializedSurfacesDemo: React.FC = () => {
  const [backgroundType, setBackgroundType] = useState<'atmospheric' | 'particle' | 'none'>('atmospheric');
  
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background */}
      {backgroundType === 'atmospheric' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <AtmosphericBackground
            intensity="medium"
            colorTheme="primary"
            particles={true}
            particleDensity="low"
            interactive={true}
            lightSources={[
              { x: '10%', y: '20%', intensity: 0.7, color: 'primary' },
              { x: '80%', y: '70%', intensity: 0.5, color: 'secondary' }
            ]}
          />
        </div>
      )}
      
      {backgroundType === 'particle' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
          <ParticleBackground
            particleCount={100}
            particleSize={3}
            particleColor="primary"
            flowField="circular"
            flowIntensity={0.3}
            interactiveRadius={150}
            interactionForce={0.5}
            velocityDecay={0.95}
          />
        </div>
      )}
      
      <PageGlassContainer>
        <h1>Galileo Glass UI - Specialized Surfaces</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <p>
            This demo showcases the specialized glass surface treatments available in Galileo Glass UI.
            The library provides a comprehensive set of glass variants, mixins, and effects that can be
            used to create sophisticated glass morphism interfaces.
          </p>
          
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setBackgroundType('atmospheric')}>Atmospheric Background</button>
            <button onClick={() => setBackgroundType('particle')}>Particle Background</button>
            <button onClick={() => setBackgroundType('none')}>No Background</button>
          </div>
        </div>
        
        <section>
          <h2>Built-in Glass Surface Variants</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <FrostedGlass elevation={2} intensity="medium">
              <h3>Frosted Glass</h3>
              <p>Standard frosted glass surface with medium blur effect. Provides a clean, translucent interface with subtle depth.</p>
              <pre>{`<FrostedGlass 
  elevation={2} 
  intensity="medium"
/>`}</pre>
            </FrostedGlass>
            
            <DimensionalGlass elevation={3} depth={2} parallaxIntensity={0.2}>
              <h3>Dimensional Glass</h3>
              <p>Enhanced glass with true depth perception, parallax effects, and spatial positioning.</p>
              <pre>{`<DimensionalGlass 
  elevation={3} 
  depth={2}
  parallaxIntensity={0.2}
/>`}</pre>
            </DimensionalGlass>
            
            <HeatGlass intensity="medium" heatSource="center" colorInfluence="warm" animate={true}>
              <h3>Heat Glass</h3>
              <p>Dynamic glass with heat distortion effects, warm color influence, and subtle animation.</p>
              <pre>{`<HeatGlass 
  intensity="medium"
  heatSource="center"
  colorInfluence="warm"
  animate={true}
/>`}</pre>
            </HeatGlass>
            
            <WidgetGlass elevation={2} dataHighlight="primary" interactive={true} frame="subtle">
              <h3>Widget Glass</h3>
              <p>Specialized glass optimized for data display with enhanced contrast and interactive states.</p>
              <pre>{`<WidgetGlass 
  elevation={2}
  dataHighlight="primary"
  interactive={true}
  frame="subtle"
/>`}</pre>
            </WidgetGlass>
          </div>
        </section>
        
        <section>
          <h2>Advanced Glass Mixins & Composition</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <StyledGlassElement>
              <h3>Basic Glass Surface</h3>
              <p>Created using the glassSurface mixin with standard variant and medium blur.</p>
              <pre>{`const StyledElement = styled.div\`
  \${props => glassSurface({
    elevation: 2,
    blurStrength: 'medium',
    borderOpacity: 0.3,
    themeContext: createThemeContext(props.theme)
  })};
  padding: 20px;
  border-radius: 12px;
\`;`}</pre>
            </StyledGlassElement>
            
            <EnhancedGlowElement>
              <h3>Enhanced Glow Effect</h3>
              <p>Glass surface with advanced glow effects that can pulsate and provide dynamic lighting.</p>
              <pre>{`const GlowElement = styled.div\`
  \${props => {
    const themeContext = createThemeContext(props.theme);
    return \`
      \${glassSurface({ elevation: 3, themeContext })}
      \${enhancedGlow({
        color: 'primary',
        intensity: 'medium',
        themeContext
      })}
    \`;
  }}
  padding: 20px;
  border-radius: 12px;
\`;`}</pre>
            </EnhancedGlowElement>
            
            <CompoundGlassElement>
              <h3>Compound Glass Effects</h3>
              <p>Combining multiple glass effects: dimensional surface, edge highlighting, and inner glow.</p>
              <pre>{`const CompoundElement = styled.div\`
  \${props => {
    const themeContext = createThemeContext(props.theme);
    return \`
      \${glassSurface({ elevation: 3, themeContext })}
      \${edgeHighlight({ position: 'bottom', color: 'primary', themeContext })}
      \${innerGlow({ color: 'secondary', intensity: 'subtle', themeContext })}
    \`;
  }}
  padding: 20px;
  border-radius: 12px;
\`;`}</pre>
            </CompoundGlassElement>
            
            <AdaptiveGlassElement>
              <h3>Context-Aware Glass</h3>
              <p>Adaptive glass that adjusts its appearance based on the content behind it for optimal readability.</p>
              <pre>{`const AdaptiveElement = styled.div\`
  \${props => adaptiveGlass({
    themeContext: createThemeContext(props.theme)
  })}
  padding: 20px;
  border-radius: 12px;
\`;`}</pre>
            </AdaptiveGlassElement>
          </div>
        </section>
        
        <section>
          <h2>Glass Surface Properties</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Core Properties</h3>
            <FrostedGlass style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Property</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>variant</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>string</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>The glass variant to use (standard, frosted, dimensional, heat, widget, page)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>elevation</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>number (1-5)</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>The elevation level of the surface</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>blurStrength</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>string</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>The strength of the backdrop blur effect (none, light, medium, strong)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>backgroundOpacity</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>number (0-1)</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>The opacity of the background</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>borderOpacity</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>number (0-1)</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>The opacity of the glass border</td>
                  </tr>
                </tbody>
              </table>
            </FrostedGlass>
          </div>
          
          <div>
            <h3>Common Glass Composition Patterns</h3>
            <FrostedGlass style={{ padding: '20px' }}>
              <ul>
                <li><strong>Layering:</strong> Use consistent elevation hierarchy with proper z-index values</li>
                <li><strong>Nesting:</strong> Nest glass components with appropriate spacing and increasing elevation</li>
                <li><strong>Combining Effects:</strong> Apply multiple effects with restraint for visual harmony</li>
                <li><strong>Context Awareness:</strong> Use adaptive glass for content that appears over varied backgrounds</li>
                <li><strong>Physical Animation:</strong> Combine glass surfaces with physics-based interactions</li>
                <li><strong>Theme Integration:</strong> Ensure glass effects adapt to theme variants and color modes</li>
                <li><strong>Accessibility:</strong> Provide fallbacks for users with reduced transparency preferences</li>
              </ul>
            </FrostedGlass>
          </div>
        </section>
      </PageGlassContainer>
    </div>
  );
};

export default SpecializedSurfacesDemo;