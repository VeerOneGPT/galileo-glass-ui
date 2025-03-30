import React from 'react';
import styled from 'styled-components';
import { useMagneticEffect } from '../useMagneticEffect';
import { ForceVector } from '../magneticEffect';
import { DirectionalFieldConfig, PointerData } from '../directionalField';

// Styled components for the example
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2a3a 0%, #0a1a2a 100%);
  overflow: hidden;
`;

const Title = styled.h1`
  color: white;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const FieldsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FieldCard = styled.div`
  position: relative;
  width: 300px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.2s ease-out;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const FieldTitle = styled.h2`
  color: white;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const FieldDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  max-width: 800px;
  text-align: center;
  margin-bottom: 2rem;
`;

/**
 * Component that demonstrates various directional magnetic field effects
 */
const DirectionalFieldExample: React.FC = () => {
  // Create different directional field configs
  
  // Unidirectional field - force always points in one direction
  const unidirectionalField: DirectionalFieldConfig = {
    type: 'unidirectional',
    behavior: 'distance-based',
    direction: { x: 1, y: 0 }, // Force to the right
  };
  
  // Bidirectional field - force along an axis
  const bidirectionalField: DirectionalFieldConfig = {
    type: 'bidirectional',
    behavior: 'responsive',
    angle: 45, // 45-degree angle
  };
  
  // Radial field - force directed away from center
  const radialField: DirectionalFieldConfig = {
    type: 'radial',
    behavior: 'distance-based',
    center: { x: 0.5, y: 0.5 }, // Center of element
  };
  
  // Tangential field - force perpendicular to radial
  const tangentialField: DirectionalFieldConfig = {
    type: 'tangential',
    behavior: 'interactive',
    center: { x: 0.5, y: 0.5 },
  };
  
  // Vortex field - creates a spiral/vortex pattern
  const vortexField: DirectionalFieldConfig = {
    type: 'vortex',
    behavior: 'responsive',
    center: { x: 0.5, y: 0.5 },
    modifiers: [
      {
        type: 'oscillate',
        factor: 0.3,
        target: 'both',
        params: { frequency: 0.5 },
        applyModifier: (force: ForceVector, pointerData: PointerData) => ({ x: 0, y: 0 })
      }
    ]
  };
  
  // Flow field - complex vector field with multiple points
  const flowField: DirectionalFieldConfig = {
    type: 'flow',
    behavior: 'constant',
    flowField: {
      points: [
        { x: 0.2, y: 0.2, direction: { x: 1, y: 0 }, strength: 1 },
        { x: 0.8, y: 0.2, direction: { x: 0, y: 1 }, strength: 1 },
        { x: 0.8, y: 0.8, direction: { x: -1, y: 0 }, strength: 1 },
        { x: 0.2, y: 0.8, direction: { x: 0, y: -1 }, strength: 1 },
        { x: 0.5, y: 0.5, direction: { x: 0, y: 0 }, strength: 0.2 },
      ],
      interpolation: 'smooth',
      resolution: 10,
      wrap: false
    }
  };
  
  // Create refs with the different field types
  const unidirectionalRef = useMagneticEffect({ 
    directionalField: unidirectionalField,
    strength: 0.6,
    maxDisplacement: 40,
    affectsRotation: true,
    rotationAmplitude: 15,
    affectsScale: true,
    scaleAmplitude: 0.05,
  });
  
  const bidirectionalRef = useMagneticEffect({ 
    directionalField: bidirectionalField,
    strength: 0.8,
    maxDisplacement: 50,
    affectsRotation: true,
    rotationAmplitude: 20,
  });
  
  const radialRef = useMagneticEffect({ 
    directionalField: radialField,
    strength: 0.7,
    maxDisplacement: 30,
    affectsScale: true,
    scaleAmplitude: 0.1,
  });
  
  const tangentialRef = useMagneticEffect({ 
    directionalField: tangentialField,
    strength: 0.5,
    maxDisplacement: 40,
    affectsRotation: true,
    rotationAmplitude: 30,
  });
  
  const vortexRef = useMagneticEffect({ 
    directionalField: vortexField,
    strength: 0.6,
    maxDisplacement: 50,
    affectsRotation: true,
    rotationAmplitude: 45,
    affectsScale: true,
    scaleAmplitude: 0.08,
    useMomentum: true,
    friction: 0.95,
  });
  
  const flowRef = useMagneticEffect({ 
    directionalField: flowField,
    strength: 0.7,
    maxDisplacement: 40,
    affectsRotation: true,
    rotationAmplitude: 25,
  });
  
  return (
    <Container>
      <Title>Directional Magnetic Field Examples</Title>
      
      <Description>
        The directional magnetic field system allows for more sophisticated 
        magnetic behaviors beyond simple attraction or repulsion. Each example
        below demonstrates a different field type with unique interaction 
        characteristics. Hover over the cards to see the effects in action.
      </Description>
      
      <FieldsContainer>
        <FieldCard ref={unidirectionalRef}>
          <FieldTitle>Unidirectional</FieldTitle>
          <FieldDescription>
            Force always points in one fixed direction regardless of pointer position
          </FieldDescription>
        </FieldCard>
        
        <FieldCard ref={bidirectionalRef}>
          <FieldTitle>Bidirectional</FieldTitle>
          <FieldDescription>
            Force follows a 45° axis, positive or negative based on pointer position
          </FieldDescription>
        </FieldCard>
        
        <FieldCard ref={radialRef}>
          <FieldTitle>Radial</FieldTitle>
          <FieldDescription>
            Force radiates outward from the center point
          </FieldDescription>
        </FieldCard>
        
        <FieldCard ref={tangentialRef}>
          <FieldTitle>Tangential</FieldTitle>
          <FieldDescription>
            Force flows perpendicular to the radial direction, creating circular motion
          </FieldDescription>
        </FieldCard>
        
        <FieldCard ref={vortexRef}>
          <FieldTitle>Vortex</FieldTitle>
          <FieldDescription>
            Creates a spinning vortex effect with oscillating intensity
          </FieldDescription>
        </FieldCard>
        
        <FieldCard ref={flowRef}>
          <FieldTitle>Flow Field</FieldTitle>
          <FieldDescription>
            Complex flow field with multiple force vectors that smoothly interpolate
          </FieldDescription>
        </FieldCard>
      </FieldsContainer>
    </Container>
  );
};

export default DirectionalFieldExample;