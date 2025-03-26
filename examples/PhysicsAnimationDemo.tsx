import React, { useRef, useState } from 'react';
import {
  FrostedGlass,
  DimensionalGlass,
  HeatGlass,
  PageGlassContainer
} from 'galileo-glass-ui';
import {
  usePhysicsInteraction,
  springAnimation,
  advancedPhysicsAnimation,
  magneticEffect,
  particleSystem,
  calculateSpringParameters,
  designSpring,
  PhysicsAnimationMode
} from 'galileo-glass-ui/animations';
import {
  createVector,
  applyNoise,
  calculateMagneticForce
} from 'galileo-glass-ui/animations';

/**
 * Demo showing the capabilities of the enhanced physics animation system
 */
export const PhysicsAnimationDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDemo, setSelectedDemo] = useState('spring');

  // Spring Physics Demo
  const {
    ref: springRef,
    style: springStyle,
    ...springEventHandlers
  } = usePhysicsInteraction({
    type: 'spring',
    mass: 1,
    stiffness: 170,
    dampingRatio: 26,
    affectsScale: true,
    affectsRotation: false
  });

  // Advanced Physics Demo
  const {
    ref: advancedRef,
    style: advancedStyle,
    ...advancedEventHandlers
  } = usePhysicsInteraction({
    type: 'follow',
    mass: 1.5,
    stiffness: 200,
    dampingRatio: 20,
    gravity: { x: 0, y: 0.5, z: 0, strength: 0.5 },
    friction: 0.1,
    bounds: {
      top: 0,
      right: 400,
      bottom: 400,
      left: 0
    }
  });

  // Magnetic Effect Demo
  const {
    ref: magneticRef,
    style: magneticStyle,
    ...magneticEventHandlers
  } = usePhysicsInteraction({
    type: 'magnetic',
    strength: 40,
    radius: 150,
    stiffness: 400,
    dampingRatio: 30
  });

  // Particle System Demo
  const [particles, setParticles] = useState([]);
  const particleSystemRef = useRef(null);

  const handleCreateParticles = () => {
    const newParticles = [];
    const count = 30;
    const center = { x: 200, y: 200 };
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const distance = 50 + Math.random() * 50;
      
      newParticles.push({
        id: i,
        position: {
          x: center.x + Math.cos(angle) * distance,
          y: center.y + Math.sin(angle) * distance
        },
        velocity: {
          x: Math.cos(angle) * (1 + Math.random()),
          y: Math.sin(angle) * (1 + Math.random())
        },
        acceleration: { x: 0, y: 0 },
        mass: 0.5 + Math.random() * 1.5,
        radius: 3 + Math.random() * 7,
        color: `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`
      });
    }
    
    setParticles(newParticles);
  };

  const renderDemo = () => {
    switch (selectedDemo) {
      case 'spring':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>Basic Spring Physics</h3>
            <p>Interact with the element to see spring-based physics response</p>
            <div style={{ width: '400px', height: '400px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DimensionalGlass
                ref={springRef as React.RefObject<HTMLDivElement>}
                elevation={3}
                style={{
                  ...springStyle,
                  width: '150px',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
                {...springEventHandlers}
              >
                Spring Physics
              </DimensionalGlass>
            </div>
            <div>
              <pre>{`usePhysicsInteraction({
  type: 'spring',
  mass: 1,
  stiffness: 170,
  dampingRatio: 26,
  affectsScale: true,
  affectsRotation: false
})`}</pre>
            </div>
          </div>
        );
      
      case 'advanced':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>Advanced Physics with Gravity & Collision</h3>
            <p>Drag and release the element to observe gravity and boundary collisions</p>
            <div style={{ width: '400px', height: '400px', position: 'relative', border: '1px solid rgba(255,255,255,0.2)' }}>
              <HeatGlass
                ref={advancedRef as React.RefObject<HTMLDivElement>}
                intensity="medium"
                style={{
                  ...advancedStyle,
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  position: 'absolute',
                  top: '50px',
                  left: '50px',
                  cursor: 'grab'
                }}
                {...advancedEventHandlers}
              >
                Drag Me
              </HeatGlass>
            </div>
            <div>
              <pre>{`usePhysicsInteraction({
  type: 'follow',
  mass: 1.5,
  stiffness: 200,
  dampingRatio: 20,
  gravity: { x: 0, y: 0.5, z: 0, strength: 0.5 },
  friction: 0.1,
  bounds: { top: 0, right: 400, bottom: 400, left: 0 },
  collisionElasticity: 0.7
})`}</pre>
            </div>
          </div>
        );
      
      case 'magnetic':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>Magnetic Effect</h3>
            <p>Move your cursor near the element to observe magnetic attraction</p>
            <div style={{ width: '400px', height: '400px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DimensionalGlass
                ref={magneticRef as React.RefObject<HTMLDivElement>}
                elevation={3}
                style={{
                  ...magneticStyle,
                  width: '150px',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
                {...magneticEventHandlers}
              >
                Magnetic
              </DimensionalGlass>
            </div>
            <div>
              <pre>{`usePhysicsInteraction({
  type: 'magnetic',
  strength: 40,
  radius: 150,
  stiffness: 400,
  dampingRatio: 30
})`}</pre>
            </div>
          </div>
        );
      
      case 'particles':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>Particle System</h3>
            <p>A demonstration of the particle physics system</p>
            <div style={{ width: '400px', height: '400px', position: 'relative', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <div ref={particleSystemRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
                {particles.map(particle => (
                  <div
                    key={particle.id}
                    style={{
                      position: 'absolute',
                      top: particle.position.y,
                      left: particle.position.x,
                      width: particle.radius * 2,
                      height: particle.radius * 2,
                      borderRadius: '50%',
                      backgroundColor: particle.color,
                      transform: 'translate(-50%, -50%)',
                      transition: 'all 0.05s linear'
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button onClick={handleCreateParticles}>Generate Particles</button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <PageGlassContainer>
      <h1>Galileo Glass UI - Physics Animation System</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <p>
          This demo showcases the capabilities of the enhanced physics animation system in Galileo Glass UI.
          The library provides a comprehensive set of physics-based animations and interactions that can be
          used to create engaging and realistic user interfaces.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => setSelectedDemo('spring')}>Spring Physics</button>
        <button onClick={() => setSelectedDemo('advanced')}>Advanced Physics</button>
        <button onClick={() => setSelectedDemo('magnetic')}>Magnetic Effect</button>
        <button onClick={() => setSelectedDemo('particles')}>Particle System</button>
      </div>

      <FrostedGlass style={{ padding: '20px', minHeight: '600px' }}>
        {renderDemo()}
      </FrostedGlass>

      <div style={{ marginTop: '30px' }}>
        <h2>Physics System Capabilities</h2>
        <ul>
          <li><strong>Spring Physics:</strong> Natural spring animations with configurable parameters</li>
          <li><strong>Advanced Physics:</strong> Support for gravity, friction, boundaries, and collisions</li>
          <li><strong>Magnetic Effects:</strong> Interactive magnetic attraction and repulsion</li>
          <li><strong>Particle Systems:</strong> Comprehensive particle physics simulation</li>
          <li><strong>Physics Calculations:</strong> Utilities for vector math, forces, and physics operations</li>
          <li><strong>Orchestration:</strong> Coordinate multiple physics animations with gestalt patterns</li>
          <li><strong>Accessibility:</strong> Respect user's motion preferences while maintaining interactivity</li>
        </ul>
      </div>
    </PageGlassContainer>
  );
};

export default PhysicsAnimationDemo;