import React, { useState } from 'react';
import styled from 'styled-components';
import useMagneticEffect from '../useMagneticEffect';
import { FieldDecayFunction, FieldShape, ForceVector } from '../magneticEffect';
import { DirectionalFieldConfig, PointerData } from '../directionalField';

// Styled container for examples
const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
`;

// Section with title
const Section = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #1a365d;
  margin-bottom: 16px;
`;

const Description = styled.p`
  color: #4a5568;
  margin-bottom: 20px;
  line-height: 1.6;
`;

// Grid to display multiple magnetic elements
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

// Controls section
const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f7fafc;
  border-radius: 8px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  margin-bottom: 6px;
  color: #2d3748;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #cbd5e0;
  background-color: white;
`;

const Slider = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  input {
    flex: 1;
  }
  
  span {
    width: 40px;
    text-align: right;
    font-size: 14px;
    color: #4a5568;
  }
`;

// Base magnetic element
const MagneticBase = styled.div`
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
`;

// Different colored magnetic elements
const AttractElement = styled(MagneticBase)`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
`;

const RepelElement = styled(MagneticBase)`
  background: linear-gradient(135deg, #f43f5e, #e11d48);
`;

const DirectionalElement = styled(MagneticBase)`
  background: linear-gradient(135deg, #10b981, #059669);
`;

const VortexElement = styled(MagneticBase)`
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
`;

const OrbitElement = styled(MagneticBase)`
  background: linear-gradient(135deg, #f59e0b, #d97706);
`;

const FollowElement = styled(MagneticBase)`
  background: linear-gradient(135deg, #3b82f6, #2563eb);
`;

/**
 * Example component for magnetic effects
 */
const MagneticEffectExample: React.FC = () => {
  // State for controls
  const [strength, setStrength] = useState(0.5);
  const [radius, setRadius] = useState(200);
  const [easeFactor, setEaseFactor] = useState(0.15);
  const [maxDisplacement, setMaxDisplacement] = useState(50);
  const [fieldShape, setFieldShape] = useState<FieldShape>('circular');
  const [decayFunction, setDecayFunction] = useState<FieldDecayFunction>('linear');
  const [affectsRotation, setAffectsRotation] = useState(true);
  const [affectsScale, setAffectsScale] = useState(true);
  
  // Create refs for each effect type
  const attractRef = useMagneticEffect({
    type: 'attract',
    strength,
    radius,
    easeFactor,
    maxDisplacement,
    fieldShape,
    decayFunction,
    affectsRotation,
    affectsScale,
  });
  
  const repelRef = useMagneticEffect({
    type: 'repel',
    strength,
    radius,
    easeFactor,
    maxDisplacement,
    fieldShape,
    decayFunction,
    affectsRotation,
    affectsScale,
  });
  
  // Define directional field config for the directional example
  const directionalFieldCfg: DirectionalFieldConfig = {
    type: 'unidirectional',
    behavior: 'constant', 
    direction: { x: 1, y: 0.5 },
  };
  const directionalRef = useMagneticEffect({
    directionalField: directionalFieldCfg,
    strength,
    radius,
    easeFactor,
    maxDisplacement,
    fieldShape,
    decayFunction,
    affectsRotation,
    affectsScale,
  });
  
  // Define directional field config for the vortex example
  const vortexFieldCfg: DirectionalFieldConfig = {
    type: 'vortex',
    behavior: 'responsive',
    center: { x: 0.5, y: 0.5 },
    modifiers: [
      {
        type: 'oscillate',
        factor: 1, 
        target: 'magnitude',
        params: { frequency: 0.5 },
        applyModifier: (force: ForceVector, pointerData: PointerData) => force
      }
    ]
  };
  const vortexRef = useMagneticEffect({
    directionalField: vortexFieldCfg,
    strength,
    radius,
    easeFactor,
    maxDisplacement,
    fieldShape,
    decayFunction,
    affectsRotation,
    affectsScale,
  });
  
  const orbitRef = useMagneticEffect({
    type: 'orbit',
    strength,
    radius,
    easeFactor,
    maxDisplacement,
    fieldShape,
    decayFunction,
    affectsRotation,
    affectsScale,
  });
  
  const followRef = useMagneticEffect({
    type: 'follow',
    strength,
    radius,
    easeFactor,
    maxDisplacement,
    fieldShape,
    decayFunction,
    affectsRotation,
    affectsScale,
  });
  
  return (
    <Container>
      <Section>
        <Title>Enhanced Magnetic Effects</Title>
        <Description>
          Hover over the elements below to see different magnetic effects in action.
          Use the controls to adjust the behavior of all elements.
        </Description>
        
        <Controls>
          <ControlGroup>
            <Label>Field Shape</Label>
            <Select 
              value={fieldShape} 
              onChange={(e) => setFieldShape(e.target.value as FieldShape)}
            >
              <option value="circular">Circular</option>
              <option value="elliptical">Elliptical</option>
              <option value="rectangular">Rectangular</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <Label>Decay Function</Label>
            <Select 
              value={decayFunction} 
              onChange={(e) => setDecayFunction(e.target.value as FieldDecayFunction)}
            >
              <option value="linear">Linear</option>
              <option value="quadratic">Quadratic</option>
              <option value="exponential">Exponential</option>
              <option value="inverse">Inverse</option>
              <option value="constant">Constant</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <Label>Strength: {strength.toFixed(2)}</Label>
            <Slider>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.05" 
                value={strength}
                onChange={(e) => setStrength(parseFloat(e.target.value))}
              />
              <span>{strength.toFixed(2)}</span>
            </Slider>
          </ControlGroup>
          
          <ControlGroup>
            <Label>Radius: {radius}px</Label>
            <Slider>
              <input 
                type="range" 
                min="50" 
                max="400" 
                step="10" 
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
              />
              <span>{radius}px</span>
            </Slider>
          </ControlGroup>
          
          <ControlGroup>
            <Label>Max Displacement: {maxDisplacement}px</Label>
            <Slider>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5" 
                value={maxDisplacement}
                onChange={(e) => setMaxDisplacement(parseInt(e.target.value))}
              />
              <span>{maxDisplacement}px</span>
            </Slider>
          </ControlGroup>
          
          <ControlGroup>
            <Label>Ease Factor: {easeFactor.toFixed(2)}</Label>
            <Slider>
              <input 
                type="range" 
                min="0.05" 
                max="0.5" 
                step="0.05" 
                value={easeFactor}
                onChange={(e) => setEaseFactor(parseFloat(e.target.value))}
              />
              <span>{easeFactor.toFixed(2)}</span>
            </Slider>
          </ControlGroup>
          
          <ControlGroup>
            <Label>
              <input 
                type="checkbox" 
                checked={affectsRotation}
                onChange={(e) => setAffectsRotation(e.target.checked)}
              />
              {' '}Affects Rotation
            </Label>
          </ControlGroup>
          
          <ControlGroup>
            <Label>
              <input 
                type="checkbox" 
                checked={affectsScale}
                onChange={(e) => setAffectsScale(e.target.checked)}
              />
              {' '}Affects Scale
            </Label>
          </ControlGroup>
        </Controls>
      </Section>
      
      <Grid>
        <AttractElement ref={attractRef}>Attract</AttractElement>
        <RepelElement ref={repelRef}>Repel</RepelElement>
        <DirectionalElement ref={directionalRef}>Directional</DirectionalElement>
        <VortexElement ref={vortexRef}>Vortex</VortexElement>
        <OrbitElement ref={orbitRef}>Orbit</OrbitElement>
        <FollowElement ref={followRef}>Follow</FollowElement>
      </Grid>
      
      <Section>
        <Title>How It Works</Title>
        <Description>
          The magnetic effect system uses physics-based calculations to create
          natural-feeling interactions between elements and the cursor. Different
          field shapes and decay functions allow for a wide variety of effects,
          from simple attraction to complex vortex movements. All effects are
          hardware-accelerated and respect the user's reduced motion preferences.
        </Description>
      </Section>
    </Container>
  );
};

export default MagneticEffectExample; 