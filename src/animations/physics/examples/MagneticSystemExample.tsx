/**
 * Multi-Element Magnetic System Example
 * 
 * Demonstrates a system of interactive magnetic elements that respond
 * together to user interactions and physics forces.
 */

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { MagneticSystemProvider } from '../MagneticSystemProvider';
import { useMagneticSystemElement } from '../useMagneticSystemElement';
import { ForceVector } from '../magneticEffect';
import { DirectionalFieldConfig } from '../directionalField';
import { useMagneticElement } from '../useMagneticElement';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 80vh;
  background: linear-gradient(135deg, #1a2a3a 0%, #0a1a2a 100%);
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 2rem;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  max-width: 600px;
  margin-bottom: 2rem;
`;

const InteractionArea = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  
  option {
    background: #1a2a3a;
    color: white;
  }
`;

// Base magnetic element
const MagneticElement = styled.div<{ $size?: number, $color?: string, $active?: boolean }>`
  position: absolute;
  width: ${props => props.$size || 60}px;
  height: ${props => props.$size || 60}px;
  background: ${props => props.$color || 'rgba(255, 255, 255, 0.1)'};
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  transition: box-shadow 0.3s ease;
  
  &.active {
    box-shadow: 0 0 15px ${props => props.$color || 'rgba(255, 255, 255, 0.5)'};
    z-index: 10;
  }
`;

// Different types of magnetic elements
const LeaderElement = styled(MagneticElement).attrs({
  $color: 'rgba(99, 102, 241, 0.7)',
})``;

const AttractorElement = styled(MagneticElement).attrs({
  $color: 'rgba(59, 130, 246, 0.7)',
})``;

const RepellerElement = styled(MagneticElement).attrs({
  $color: 'rgba(244, 63, 94, 0.7)',
})``;

const FollowerElement = styled(MagneticElement).attrs({
  $color: 'rgba(168, 85, 247, 0.7)',
})``;

// Component for a single magnetic element
interface MagneticItemProps {
  type: 'leader' | 'attractor' | 'repeller' | 'follower';
  position: { x: number, y: number };
  systemId: string;
  label: string;
  size?: number;
}

const MagneticItem: React.FC<MagneticItemProps> = ({
  type,
  position,
  systemId,
  label,
  size = 60
}) => {
  // Configuration based on type
  const config = {
    leader: {
      isAttractor: true,
      isRepeller: false,
      strength: 1.2,
      mass: 2,
      role: 'leader' as const
    },
    attractor: {
      isAttractor: true,
      isRepeller: false,
      strength: 0.8,
      mass: 1,
      role: 'independent' as const
    },
    repeller: {
      isAttractor: false,
      isRepeller: true,
      strength: 0.8,
      mass: 1,
      role: 'independent' as const
    },
    follower: {
      isAttractor: false,
      isRepeller: false,
      strength: 0.6,
      mass: 0.8,
      role: 'follower' as const
    }
  };
  
  // Use the magnetic system hook
  const { ref, isActive } = useMagneticSystemElement({
    systemId,
    autoRegister: true,
    activeClassName: 'active',
    ...config[type],
    position
  });
  
  // Use the magnetic element hook, passing only the magnetic options
  const { elementRef, isActive: magneticIsActive } = useMagneticElement<HTMLDivElement>(config[type]);
  
  // Select component based on type
  const ElementComponent = {
    leader: LeaderElement,
    attractor: AttractorElement,
    repeller: RepellerElement,
    follower: FollowerElement
  }[type];
  
  // Calculate initial position in the container
  const style = {
    left: `calc(${position.x * 100}% - ${size / 2}px)`,
    top: `calc(${position.y * 100}% - ${size / 2}px)`
  };
  
  return (
    <ElementComponent
      ref={elementRef}
      style={style}
      $size={size}
      $active={magneticIsActive}
    >
      {label}
    </ElementComponent>
  );
};

// Field configurations for the example
const fieldConfigs = {
  none: null,
  radial: {
    type: 'radial' as const,
    behavior: 'distance-based' as const,
    center: { x: 0.5, y: 0.5 }
  },
  vortex: {
    type: 'vortex' as const,
    behavior: 'responsive' as const,
    center: { x: 0.5, y: 0.5 }
  },
  bidirectional: {
    type: 'bidirectional' as const,
    behavior: 'responsive' as const,
    angle: 0
  },
  flow: {
    type: 'flow' as const,
    behavior: 'constant' as const,
    flowField: {
      points: [
        { x: 0.2, y: 0.2, direction: { x: 1, y: 1 }, strength: 1 },
        { x: 0.8, y: 0.2, direction: { x: -1, y: 1 }, strength: 1 },
        { x: 0.8, y: 0.8, direction: { x: -1, y: -1 }, strength: 1 },
        { x: 0.2, y: 0.8, direction: { x: 1, y: -1 }, strength: 1 }
      ],
      interpolation: 'smooth',
      resolution: 10,
      wrap: false
    }
  }
};

/**
 * Multi-Element Magnetic System Example component
 */
const MagneticSystemExample: React.FC = () => {
  // State for active field type
  const [activeFieldType, setActiveFieldType] = useState<keyof typeof fieldConfigs>('none');
  
  // Create magnetic system ID
  const systemId = 'demo-magnetic-system';
  
  // Generate elements
  const generateElements = () => {
    // Define element positions
    const elements = [
      // Leader in the center
      {
        type: 'leader' as const,
        position: { x: 0.5, y: 0.5 },
        label: 'Leader'
      },
      // Attractors
      {
        type: 'attractor' as const,
        position: { x: 0.3, y: 0.3 },
        label: 'Attract'
      },
      {
        type: 'attractor' as const,
        position: { x: 0.7, y: 0.3 },
        label: 'Attract'
      },
      // Repellers
      {
        type: 'repeller' as const,
        position: { x: 0.3, y: 0.7 },
        label: 'Repel'
      },
      {
        type: 'repeller' as const,
        position: { x: 0.7, y: 0.7 },
        label: 'Repel'
      },
      // Followers
      {
        type: 'follower' as const,
        position: { x: 0.2, y: 0.5 },
        label: 'Follow'
      },
      {
        type: 'follower' as const,
        position: { x: 0.8, y: 0.5 },
        label: 'Follow'
      },
      {
        type: 'follower' as const,
        position: { x: 0.5, y: 0.2 },
        label: 'Follow'
      },
      {
        type: 'follower' as const,
        position: { x: 0.5, y: 0.8 },
        label: 'Follow'
      }
    ];
    
    return elements.map((element, index) => (
      <MagneticItem
        key={`${element.type}-${index}`}
        type={element.type}
        position={element.position}
        systemId={systemId}
        label={element.label}
      />
    ));
  };
  
  return (
    <MagneticSystemProvider
      systemId={systemId}
      config={{
        enableElementInteraction: true,
        interactionStrength: 0.5,
        interactionRadius: 200,
        enableAttraction: true,
        enableRepulsion: true,
        enableCollisionAvoidance: true,
        minElementDistance: 70
      }}
      initialField={fieldConfigs[activeFieldType]}
    >
      <Container>
        <Title>Multi-Element Magnetic System</Title>
        
        <Description>
          This example demonstrates a system of magnetic elements that interact with each other.
          The leader element (blue) influences followers, while attractors pull and repellers push
          other elements away. Try hovering over elements or changing the field type.
        </Description>
        
        <Controls>
          <Select 
            value={activeFieldType}
            onChange={(e) => setActiveFieldType(e.target.value as keyof typeof fieldConfigs)}
          >
            <option value="none">No Group Field</option>
            <option value="radial">Radial Field</option>
            <option value="vortex">Vortex Field</option>
            <option value="bidirectional">Bidirectional Field</option>
            <option value="flow">Flow Field</option>
          </Select>
        </Controls>
        
        <InteractionArea>
          {generateElements()}
        </InteractionArea>
        
        <Description>
          Each element reacts to mouse interactions and forces from other elements.
          The system maintains element relationships even during complex interactions.
        </Description>
      </Container>
    </MagneticSystemProvider>
  );
};

export default MagneticSystemExample;