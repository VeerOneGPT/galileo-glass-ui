import React, { useState } from 'react';
import { PageGlassContainer, FrostedGlass } from '../src';
import AdvancedComponentsDemo from './AdvancedComponentsDemo';
import PhysicsAnimationDemo from './PhysicsAnimationDemo';
import SpecializedSurfacesDemo from './SpecializedSurfacesDemo';

/**
 * Main demo application showcasing Galileo Glass UI capabilities
 */
export const DemoApplication: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<string>('home');

  const renderDemo = () => {
    switch (currentDemo) {
      case 'advanced-components':
        return <AdvancedComponentsDemo />;
      case 'physics-animations':
        return <PhysicsAnimationDemo />;
      case 'specialized-surfaces':
        return <SpecializedSurfacesDemo />;
      case 'home':
      default:
        return (
          <PageGlassContainer>
            <h1>Galileo Glass UI Demo</h1>
            
            <div style={{ marginBottom: '30px' }}>
              <p>
                Welcome to the Galileo Glass UI demo. This showcase highlights the advanced capabilities
                of the Galileo Glass UI library, a comprehensive framework for creating beautiful glass
                morphism interfaces with React and styled-components.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              <FrostedGlass 
                elevation={2} 
                style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => setCurrentDemo('advanced-components')}
              >
                <h2>Advanced Components</h2>
                <p>
                  Explore the advanced UI components in Galileo Glass, including specialized input elements,
                  interactive components, data visualization tools, and more.
                </p>
                <button>View Demo</button>
              </FrostedGlass>
              
              <FrostedGlass 
                elevation={2} 
                style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => setCurrentDemo('physics-animations')}
              >
                <h2>Physics Animations</h2>
                <p>
                  Experience the enhanced physics animation system with spring physics, advanced physics
                  calculations, magnetic effects, and particle systems.
                </p>
                <button>View Demo</button>
              </FrostedGlass>
              
              <FrostedGlass 
                elevation={2} 
                style={{ padding: '20px', cursor: 'pointer' }}
                onClick={() => setCurrentDemo('specialized-surfaces')}
              >
                <h2>Specialized Glass Surfaces</h2>
                <p>
                  Discover the various glass surface treatments, their properties, usage patterns,
                  and compositional techniques for creating sophisticated interfaces.
                </p>
                <button>View Demo</button>
              </FrostedGlass>
            </div>
            
            <div style={{ marginTop: '40px' }}>
              <FrostedGlass style={{ padding: '20px' }}>
                <h2>Documentation</h2>
                <p>
                  For comprehensive documentation on using Galileo Glass UI, please refer to the following resources:
                </p>
                <ul>
                  <li><strong>GalileoGlass.md</strong> - Main framework documentation</li>
                  <li><strong>AnimationSystem.md</strong> - Animation system documentation</li>
                  <li><strong>AdvancedComponents.md</strong> - Advanced components documentation</li>
                  <li><strong>PhysicsAnimations.md</strong> - Physics animation documentation</li>
                  <li><strong>SpecializedSurfaces.md</strong> - Specialized glass surfaces documentation</li>
                  <li><strong>Implementation Guides</strong> - How-to guides and best practices</li>
                </ul>
              </FrostedGlass>
            </div>
          </PageGlassContainer>
        );
    }
  };

  return (
    <div>
      {currentDemo !== 'home' && (
        <div style={{ padding: '10px', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
          <button onClick={() => setCurrentDemo('home')}>← Back to Home</button>
        </div>
      )}
      
      {renderDemo()}
    </div>
  );
};

export default DemoApplication;