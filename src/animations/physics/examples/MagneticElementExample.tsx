import React, { useState } from 'react';
import styled from 'styled-components';
import { useMagneticElement } from '../useMagneticElement';

// Styled components for demonstration
const ExampleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const Description = styled.p`
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #555;
`;

const ElementsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const MagneticCard = styled.div`
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  
  &.active {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &.active::after {
    opacity: 1;
  }
`;

const CardText = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  z-index: 1;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ControlLabel = styled.span`
  width: 200px;
  font-size: 0.9rem;
  color: #555;
`;

const Slider = styled.input`
  flex: 1;
`;

const Value = styled.span`
  width: 50px;
  text-align: right;
  font-size: 0.9rem;
  color: #555;
`;

const Select = styled.select`
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const ValueDisplay = styled.div`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  margin-top: 1rem;
  
  h3 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #444;
  }
  
  pre {
    font-family: monospace;
    font-size: 0.8rem;
    background: rgba(0, 0, 0, 0.03);
    padding: 0.5rem;
    border-radius: 4px;
    overflow-x: auto;
  }
`;

/**
 * Example component demonstrating the useMagneticElement hook
 */
const MagneticElementExample: React.FC = () => {
  // Configuration state
  const [config, setConfig] = useState({
    strength: 0.5,
    radius: 200,
    type: 'attract' as const,
    easeFactor: 0.15,
    maxDisplacement: 50,
    affectsRotation: true,
    rotationAmplitude: 15,
    affectsScale: true,
    scaleAmplitude: 0.1,
    registerWithPhysics: false,
    interactWithOtherElements: false,
  });
  
  // Set up configuration handlers
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Set up the magnetic element
  const {
    elementRef: card1Ref,
    transform: card1Transform,
    isActive: isCard1Active,
    activeClass: card1ActiveClass,
    activate: activateCard1,
    deactivate: deactivateCard1
  } = useMagneticElement<HTMLDivElement>({
    ...config,
    activeClassName: 'active',
    onActivate: () => console.log('Card 1 activated'),
    onDeactivate: () => console.log('Card 1 deactivated')
  });
  
  // Second card with different settings
  const {
    elementRef: card2Ref,
    transform: card2Transform,
    isActive: isCard2Active,
    activeClass: card2ActiveClass
  } = useMagneticElement<HTMLDivElement>({
    ...config,
    type: config.type === 'attract' ? 'repel' : 'attract', // Opposite of card 1
    activeClassName: 'active',
    onActivate: () => console.log('Card 2 activated'),
    onDeactivate: () => console.log('Card 2 deactivated')
  });
  
  // Third card with rotation but no scale
  const {
    elementRef: card3Ref,
    transform: card3Transform,
    isActive: isCard3Active,
    activeClass: card3ActiveClass
  } = useMagneticElement<HTMLDivElement>({
    ...config,
    affectsScale: false,
    rotationAmplitude: config.rotationAmplitude * 1.5,
    activeClassName: 'active',
    onActivate: () => console.log('Card 3 activated'),
    onDeactivate: () => console.log('Card 3 deactivated')
  });
  
  return (
    <ExampleContainer>
      <Title>Magnetic Element Example</Title>
      <Description>
        Hover over the cards to see the magnetic effect in action. Each card demonstrates
        different magnetic behaviors based on the configuration settings below.
      </Description>
      
      <ElementsContainer>
        <MagneticCard ref={card1Ref} className={card1ActiveClass || ''}>
          <CardText>Attraction</CardText>
        </MagneticCard>
        
        <MagneticCard ref={card2Ref} className={card2ActiveClass || ''}>
          <CardText>Repulsion</CardText>
        </MagneticCard>
        
        <MagneticCard ref={card3Ref} className={card3ActiveClass || ''}>
          <CardText>Rotation Only</CardText>
        </MagneticCard>
      </ElementsContainer>
      
      <Controls>
        <ControlRow>
          <ControlLabel>Effect Type</ControlLabel>
          <Select
            name="type"
            value={config.type}
            onChange={handleSelectChange}
          >
            <option value="attract">Attract</option>
            <option value="repel">Repel</option>
            <option value="follow">Follow</option>
            <option value="orbit">Orbit</option>
          </Select>
        </ControlRow>
        
        <ControlRow>
          <ControlLabel>Strength: {config.strength.toFixed(2)}</ControlLabel>
          <Slider
            type="range"
            name="strength"
            min="0"
            max="1"
            step="0.05"
            value={config.strength}
            onChange={handleSliderChange}
          />
          <Value>{config.strength.toFixed(2)}</Value>
        </ControlRow>
        
        <ControlRow>
          <ControlLabel>Radius: {config.radius}px</ControlLabel>
          <Slider
            type="range"
            name="radius"
            min="50"
            max="500"
            step="10"
            value={config.radius}
            onChange={handleSliderChange}
          />
          <Value>{config.radius}px</Value>
        </ControlRow>
        
        <ControlRow>
          <ControlLabel>Ease Factor: {config.easeFactor.toFixed(2)}</ControlLabel>
          <Slider
            type="range"
            name="easeFactor"
            min="0.01"
            max="0.5"
            step="0.01"
            value={config.easeFactor}
            onChange={handleSliderChange}
          />
          <Value>{config.easeFactor.toFixed(2)}</Value>
        </ControlRow>
        
        <ControlRow>
          <ControlLabel>Max Displacement: {config.maxDisplacement}px</ControlLabel>
          <Slider
            type="range"
            name="maxDisplacement"
            min="0"
            max="100"
            step="1"
            value={config.maxDisplacement}
            onChange={handleSliderChange}
          />
          <Value>{config.maxDisplacement}px</Value>
        </ControlRow>
        
        <ControlRow>
          <ControlLabel>Affects Rotation</ControlLabel>
          <input
            type="checkbox"
            name="affectsRotation"
            checked={config.affectsRotation}
            onChange={handleCheckboxChange}
          />
          {config.affectsRotation && (
            <>
              <Slider
                type="range"
                name="rotationAmplitude"
                min="0"
                max="45"
                step="1"
                value={config.rotationAmplitude}
                onChange={handleSliderChange}
              />
              <Value>{config.rotationAmplitude}°</Value>
            </>
          )}
        </ControlRow>
        
        <ControlRow>
          <ControlLabel>Affects Scale</ControlLabel>
          <input
            type="checkbox"
            name="affectsScale"
            checked={config.affectsScale}
            onChange={handleCheckboxChange}
          />
          {config.affectsScale && (
            <>
              <Slider
                type="range"
                name="scaleAmplitude"
                min="0"
                max="0.5"
                step="0.01"
                value={config.scaleAmplitude}
                onChange={handleSliderChange}
              />
              <Value>{config.scaleAmplitude.toFixed(2)}</Value>
            </>
          )}
        </ControlRow>
        
        <ControlRow>
          <ControlLabel>Physics Integration</ControlLabel>
          <input
            type="checkbox"
            name="registerWithPhysics"
            checked={config.registerWithPhysics}
            onChange={handleCheckboxChange}
          />
          <ControlLabel>Interact With Others</ControlLabel>
          <input
            type="checkbox"
            name="interactWithOtherElements"
            checked={config.interactWithOtherElements}
            onChange={handleCheckboxChange}
            disabled={!config.registerWithPhysics}
          />
        </ControlRow>

        <ControlRow>
          <button onClick={activateCard1}>Activate Card 1</button>
          <button onClick={deactivateCard1}>Deactivate Card 1</button>
        </ControlRow>
      </Controls>
      
      <ValueDisplay>
        <h3>Card 1 Transform</h3>
        <pre>{JSON.stringify(card1Transform, null, 2)}</pre>
      </ValueDisplay>
    </ExampleContainer>
  );
};

export default MagneticElementExample; 