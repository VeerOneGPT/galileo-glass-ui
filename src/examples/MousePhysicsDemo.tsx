/**
 * Mouse Physics Demo
 * 
 * Demonstrates the mouse physics hooks from the animation system
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  useMouseMagneticEffect, 
  useMagneticButton, 
  useMouseCursorEffect
} from '../animations/hooks';
import { glassSurface } from '../core/mixins/glassSurface';
import { createThemeContext } from '../core/themeUtils';

// Styled components for the demo
const DemoContainer = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 50px;
  min-height: 100vh;
`;

const SectionTitle = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 500;
`;

const DemoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
`;

const EffectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
  margin-top: 20px;
`;

// Magnetic effect demo card
const MagneticCard = styled.div<{ theme: any }>`
  ${props => glassSurface({
    elevation: 2,
    blurStrength: 'standard',
    borderOpacity: 'medium',
    themeContext: createThemeContext(props.theme)
  })}
  width: 200px;
  height: 200px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  text-align: center;
  padding: 20px;
`;

// Magnetic button
const MagneticButtonElement = styled.button<{ theme: any }>`
  ${props => glassSurface({
    elevation: 3,
    blurStrength: 'enhanced',
    borderOpacity: 'high',
    themeContext: createThemeContext(props.theme)
  })}
  padding: 15px 30px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: background 0.3s ease;
  
  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

// Control components
const Select = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #4a90e2;
  color: white;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #3a80d2;
  }
`;

/**
 * Demo component for mouse physics hooks
 */
const MousePhysicsDemo: React.FC = () => {
  // State for controlling demos
  const [magneticType, setMagneticType] = useState<'attract' | 'repel' | 'follow' | 'orbit'>('attract');
  const [cursorEffectType, setCursorEffectType] = useState<'glow' | 'ripple' | 'trail' | 'magnetic' | 'repel' | 'spotlight'>('glow');
  const [isCursorEffectActive, setIsCursorEffectActive] = useState(false);
  
  // useMouseMagneticEffect demo
  const magneticCard1 = useMouseMagneticEffect({
    type: magneticType,
    strength: 0.5,
    radius: 200,
    maxDisplacement: 50
  });
  
  const magneticCard2 = useMouseMagneticEffect({
    type: magneticType,
    strength: 0.8,
    radius: 250,
    maxDisplacement: 70,
    affectsRotation: true,
    rotationAmplitude: 10
  });
  
  const magneticCard3 = useMouseMagneticEffect({
    type: magneticType,
    strength: 0.6,
    radius: 200,
    maxDisplacement: 40,
    affectsScale: true,
    scaleAmplitude: 0.1
  });
  
  const magneticCard4 = useMouseMagneticEffect({
    type: magneticType,
    strength: 0.7,
    radius: 220,
    maxDisplacement: 60,
    affectsRotation: true,
    affectsScale: true,
    rotationAmplitude: 8,
    scaleAmplitude: 0.08
  });
  
  // useMagneticButton demo
  const magneticButton1 = useMagneticButton({
    strength: 0.5,
    radius: 150,
    maxDisplacement: 20,
    pressScale: 0.95
  });
  
  const magneticButton2 = useMagneticButton({
    strength: 0.7,
    radius: 180,
    maxDisplacement: 30,
    pressScale: 0.92,
    tiltEffect: true,
    maxTiltAngle: 15
  });
  
  // useMouseCursorEffect demo
  const cursorEffect = useMouseCursorEffect({
    type: cursorEffectType,
    strength: 1,
    radius: 150,
    color: 'rgba(74, 144, 226, 0.5)',
    particleCount: 5,
    size: 20,
    duration: 1000,
    targetSelector: isCursorEffectActive ? '.cursor-target' : undefined
  });
  
  const toggleCursorEffect = () => {
    if (isCursorEffectActive) {
      cursorEffect.disable();
    } else {
      cursorEffect.enable();
    }
    setIsCursorEffectActive(!isCursorEffectActive);
  };
  
  return (
    <DemoContainer>
      <h1>Mouse Physics Demo</h1>
      <p>
        This demo showcases the mouse physics hooks from the Galileo Glass UI animation system. 
        Each section demonstrates a different hook with various configuration options.
      </p>
      
      {/* useMouseMagneticEffect Demo */}
      <DemoSection>
        <SectionTitle>useMouseMagneticEffect</SectionTitle>
        <p>
          Move your mouse near the cards to see the magnetic effect in action.
          Try different effect types using the selector below.
        </p>
        
        <ControlsContainer>
          <div>
            <label htmlFor="magnetic-type">Effect Type: </label>
            <Select 
              id="magnetic-type" 
              value={magneticType}
              onChange={(e) => setMagneticType(e.target.value as any)}
            >
              <option value="attract">Attract</option>
              <option value="repel">Repel</option>
              <option value="follow">Follow</option>
              <option value="orbit">Orbit</option>
            </Select>
          </div>
        </ControlsContainer>
        
        <EffectGrid>
          <MagneticCard ref={magneticCard1.ref} theme={{}}>
            Basic Magnetic
          </MagneticCard>
          
          <MagneticCard ref={magneticCard2.ref} theme={{}}>
            With Rotation
          </MagneticCard>
          
          <MagneticCard ref={magneticCard3.ref} theme={{}}>
            With Scale
          </MagneticCard>
          
          <MagneticCard ref={magneticCard4.ref} theme={{}}>
            With Rotation & Scale
          </MagneticCard>
        </EffectGrid>
      </DemoSection>
      
      {/* useMagneticButton Demo */}
      <DemoSection>
        <SectionTitle>useMagneticButton</SectionTitle>
        <p>
          Hover over and click the buttons to see the magnetic button effect.
          These buttons respond to both hover and click interactions.
        </p>
        
        <ControlsContainer>
          <MagneticButtonElement 
            ref={magneticButton1.ref} 
            {...magneticButton1.eventHandlers}
            theme={{}}
          >
            Basic Magnetic Button
          </MagneticButtonElement>
          
          <MagneticButtonElement 
            ref={magneticButton2.ref} 
            {...magneticButton2.eventHandlers}
            theme={{}}
          >
            Tilt Magnetic Button
          </MagneticButtonElement>
        </ControlsContainer>
      </DemoSection>
      
      {/* useMouseCursorEffect Demo */}
      <DemoSection>
        <SectionTitle>useMouseCursorEffect</SectionTitle>
        <p>
          This effect adds global cursor effects that can influence elements.
          Try different effect types using the selector below.
        </p>
        
        <ControlsContainer>
          <div>
            <label htmlFor="cursor-effect-type">Effect Type: </label>
            <Select 
              id="cursor-effect-type" 
              value={cursorEffectType}
              onChange={(e) => setCursorEffectType(e.target.value as any)}
            >
              <option value="glow">Glow</option>
              <option value="ripple">Ripple</option>
              <option value="trail">Trail</option>
              <option value="magnetic">Magnetic</option>
              <option value="repel">Repel</option>
              <option value="spotlight">Spotlight</option>
            </Select>
          </div>
          
          <Button onClick={toggleCursorEffect}>
            {isCursorEffectActive ? 'Disable' : 'Enable'} Cursor Effect
          </Button>
        </ControlsContainer>
        
        <EffectGrid>
          <MagneticCard className="cursor-target" theme={{}}>
            Target Element 1
          </MagneticCard>
          
          <MagneticCard className="cursor-target" theme={{}}>
            Target Element 2
          </MagneticCard>
          
          <MagneticCard className="cursor-target" theme={{}}>
            Target Element 3
          </MagneticCard>
          
          <MagneticCard className="cursor-target" theme={{}}>
            Target Element 4
          </MagneticCard>
        </EffectGrid>
      </DemoSection>
      
      <DemoSection>
        <SectionTitle>About Mouse Physics Hooks</SectionTitle>
        <p>
          These hooks are part of the Galileo Glass UI animation system and provide physics-based
          interactions for a more engaging and dynamic user experience.
        </p>
        
        <h3>Features:</h3>
        <ul>
          <li>Accessibility-aware with reduced motion support</li>
          <li>Optimized for performance with GPU acceleration</li>
          <li>Multiple effect types and customization options</li>
          <li>Spring physics for natural feeling interactions</li>
          <li>Simple React hook API for easy implementation</li>
        </ul>
      </DemoSection>
    </DemoContainer>
  );
};

export default MousePhysicsDemo;