/**
 * GameParticlesDemo.tsx
 * 
 * Demo component showcasing the game particle effects system
 * for Galileo Glass UI animation framework.
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  useGameParticles, 
  GameEventType, 
  EmitterShape,
  ParticleShape,
  ParticleAnimationType
} from '../animations/physics/useGameParticles';
import { useReducedMotion } from '../animations/accessibility/useReducedMotion';

// Demo container
const DemoContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.7);
`;

// Interactive area
const InteractiveArea = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
`;

// Control panel
const ControlPanel = styled.div`
  width: 100%;
  padding: 15px;
  background: rgba(51, 65, 85, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

// Button row
const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

// Event button
const EventButton = styled.button<{ $eventType: GameEventType }>`
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  background: ${props => {
    switch (props.$eventType) {
      case GameEventType.SUCCESS: return 'rgba(34, 197, 94, 0.6)';
      case GameEventType.ERROR: return 'rgba(239, 68, 68, 0.6)';
      case GameEventType.REWARD: return 'rgba(234, 179, 8, 0.6)';
      case GameEventType.EXPLOSION: return 'rgba(249, 115, 22, 0.6)';
      case GameEventType.SPARKLE: return 'rgba(59, 130, 246, 0.6)';
      case GameEventType.TRAIL: return 'rgba(168, 85, 247, 0.6)';
      case GameEventType.IMPACT: return 'rgba(139, 92, 246, 0.6)';
      case GameEventType.COLLECT: return 'rgba(20, 184, 166, 0.6)';
      case GameEventType.ENERGY: return 'rgba(6, 182, 212, 0.6)';
      default: return 'rgba(99, 102, 241, 0.6)';
    }
  }};
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => {
      switch (props.$eventType) {
        case GameEventType.SUCCESS: return 'rgba(34, 197, 94, 0.8)';
        case GameEventType.ERROR: return 'rgba(239, 68, 68, 0.8)';
        case GameEventType.REWARD: return 'rgba(234, 179, 8, 0.8)';
        case GameEventType.EXPLOSION: return 'rgba(249, 115, 22, 0.8)';
        case GameEventType.SPARKLE: return 'rgba(59, 130, 246, 0.8)';
        case GameEventType.TRAIL: return 'rgba(168, 85, 247, 0.8)';
        case GameEventType.IMPACT: return 'rgba(139, 92, 246, 0.8)';
        case GameEventType.COLLECT: return 'rgba(20, 184, 166, 0.8)';
        case GameEventType.ENERGY: return 'rgba(6, 182, 212, 0.8)';
        default: return 'rgba(99, 102, 241, 0.8)';
      }
    }};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Option section
const OptionSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 5px;
`;

// Label
const Label = styled.label`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 5px;
`;

// Select
const Select = styled.select`
  padding: 6px 10px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(100, 116, 139, 0.5);
  border-radius: 4px;
  color: white;
  min-width: 140px;
`;

// Demo Header
const DemoHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 24px;
    margin: 0 0 10px 0;
    color: rgba(255, 255, 255, 0.9);
  }
  
  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
`;

// Moving element
const MovingElement = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
`;

// Toggle button
const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'};
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'};
  }
`;

// Option Group
const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

/**
 * Demonstrate game particle effects
 */
const GameParticlesDemo: React.FC = () => {
  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const movingElementRef = useRef<HTMLDivElement>(null);
  
  // State
  const [selectedEvent, setSelectedEvent] = useState<GameEventType>(GameEventType.SPARKLE);
  const [trailActive, setTrailActive] = useState(false);
  const [trailEmitterId, setTrailEmitterId] = useState<string | null>(null);
  const [particleCount, setParticleCount] = useState(30);
  const [particleSize, setParticleSize] = useState(8);
  const [particleLifetime, setParticleLifetime] = useState(1);
  const [emitterShape, setEmitterShape] = useState<EmitterShape>(EmitterShape.POINT);
  const [particleShape, setParticleShape] = useState<ParticleShape>(ParticleShape.CIRCLE);
  
  // Access reduced motion settings
  const { prefersReducedMotion } = useReducedMotion();
  
  // Initialize game particles hook
  const { actions, isActive } = useGameParticles({
    containerRef,
    defaultEventType: GameEventType.SPARKLE,
    autoStart: false,
    boundToContainer: true
  });

  // Handle mouse click in interactive area
  const handleClick = (e: React.MouseEvent) => {
    actions.triggerEvent(selectedEvent, e);
  };
  
  // Toggle trail effect
  const toggleTrail = () => {
    if (trailActive && trailEmitterId) {
      // Remove existing trail
      actions.removeEmitter(trailEmitterId);
      setTrailEmitterId(null);
      setTrailActive(false);
    } else if (movingElementRef.current) {
      // Create new trail
      const id = actions.createTrail(movingElementRef.current, {
        emitters: [{
          position: { x: 0, y: 0, z: 0 },
          rate: 20,
          particleConfig: {
            size: [particleSize * 0.7, particleSize * 1.3] as [number, number],
            life: [particleLifetime * 0.7, particleLifetime * 1.3],
            shape: particleShape,
            colors: getColorsForEvent(selectedEvent),
            opacity: 0.7,
            finalOpacity: 0,
            animations: [ParticleAnimationType.FADE, ParticleAnimationType.SCALE],
            finalSize: 0
          }
        }]
      });
      setTrailEmitterId(id);
      setTrailActive(true);
    }
  };
  
  // Trigger a specific event
  const triggerEvent = (eventType: GameEventType) => {
    if (!containerRef.current) return;
    
    // Get center position of container
    const rect = containerRef.current.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    // Configure custom burst
    const config = {
      emitters: [{
        position: position,
        burstCount: particleCount,
        shape: emitterShape,
        size: emitterShape === EmitterShape.POINT ? 0 : 50,
        particleConfig: {
          size: [particleSize * 0.7, particleSize * 1.3] as [number, number],
          life: [particleLifetime * 0.7, particleLifetime * 1.3] as [number, number],
          shape: particleShape,
          colors: getColorsForEvent(eventType),
          opacity: 0.9,
          finalOpacity: 0
        }
      }]
    };
    
    // Trigger the burst
    actions.burst(position, config);
  };
  
  // Get appropriate colors for each event type
  const getColorsForEvent = (eventType: GameEventType): string[] => {
    switch (eventType) {
      case GameEventType.SUCCESS:
        return ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'];
      case GameEventType.ERROR:
        return ['#F44336', '#E91E63', '#FF5722'];
      case GameEventType.REWARD:
        return ['#FFD700', '#FFC107', '#FFEB3B', '#FFFFFF'];
      case GameEventType.EXPLOSION:
        return ['#FF5722', '#FF9800', '#FFEB3B', '#FFFFFF'];
      case GameEventType.SPARKLE:
        return ['#FFFFFF', '#E3F2FD', '#BBDEFB', '#90CAF9'];
      case GameEventType.TRAIL:
        return ['#2196F3', '#03A9F4', '#00BCD4'];
      case GameEventType.IMPACT:
        return ['#9C27B0', '#673AB7', '#3F51B5', '#FFFFFF'];
      case GameEventType.COLLECT:
        return ['#4CAF50', '#8BC34A', '#CDDC39'];
      case GameEventType.ENERGY:
        return ['#3F51B5', '#2196F3', '#03A9F4', '#00BCD4'];
      default:
        return ['#FFFFFF', '#EEEEEE', '#DDDDDD'];
    }
  };
  
  // Move the element in a circle
  useEffect(() => {
    let animationId: number;
    let angle = 0;
    
    const animateMovement = () => {
      if (movingElementRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const elementRect = movingElementRef.current.getBoundingClientRect();
        
        // Calculate center position
        const centerX = containerRect.width / 2 - elementRect.width / 2;
        const centerY = containerRect.height / 2 - elementRect.height / 2;
        
        // Calculate radius
        const radius = Math.min(containerRect.width, containerRect.height) * 0.3;
        
        // Calculate position
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Update position
        movingElementRef.current.style.left = `${x}px`;
        movingElementRef.current.style.top = `${y}px`;
        
        // Increment angle
        angle += 0.01;
        if (angle > Math.PI * 2) {
          angle = 0;
        }
      }
      
      animationId = requestAnimationFrame(animateMovement);
    };
    
    // Start animation
    animationId = requestAnimationFrame(animateMovement);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <DemoContainer ref={containerRef}>
      <DemoHeader>
        <h2>Game Particle Effects</h2>
        <p>
          Interactive particle effects for game-like animations in Galileo Glass UI.
          {prefersReducedMotion && " (Reduced motion mode active)"}
        </p>
      </DemoHeader>
      
      <InteractiveArea onClick={handleClick}>
        <p style={{ color: 'white', textAlign: 'center' }}>
          Click anywhere to trigger the selected effect
        </p>
        
        {/* Moving element with optional trail */}
        <MovingElement ref={movingElementRef} />
      </InteractiveArea>
      
      <ControlPanel>
        <Label>Event Types</Label>
        <ButtonRow>
          {Object.values(GameEventType).filter(type => type !== GameEventType.CUSTOM).map(eventType => (
            <EventButton
              key={eventType}
              $eventType={eventType}
              onClick={() => triggerEvent(eventType)}
            >
              {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
            </EventButton>
          ))}
        </ButtonRow>
        
        <OptionSection>
          <OptionGroup>
            <Label>Selected Effect</Label>
            <Select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value as GameEventType)}
            >
              {Object.values(GameEventType).filter(type => type !== GameEventType.CUSTOM).map(eventType => (
                <option key={eventType} value={eventType}>
                  {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                </option>
              ))}
            </Select>
          </OptionGroup>
          
          <OptionGroup>
            <Label>Particle Count</Label>
            <Select
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </OptionGroup>
          
          <OptionGroup>
            <Label>Particle Size</Label>
            <Select
              value={particleSize}
              onChange={(e) => setParticleSize(Number(e.target.value))}
            >
              <option value={4}>Small</option>
              <option value={8}>Medium</option>
              <option value={12}>Large</option>
              <option value={16}>Extra Large</option>
            </Select>
          </OptionGroup>
          
          <OptionGroup>
            <Label>Lifetime (seconds)</Label>
            <Select
              value={particleLifetime}
              onChange={(e) => setParticleLifetime(Number(e.target.value))}
            >
              <option value={0.5}>0.5s</option>
              <option value={1}>1s</option>
              <option value={2}>2s</option>
              <option value={3}>3s</option>
            </Select>
          </OptionGroup>
          
          <OptionGroup>
            <Label>Emitter Shape</Label>
            <Select
              value={emitterShape}
              onChange={(e) => setEmitterShape(e.target.value as EmitterShape)}
            >
              {Object.values(EmitterShape).map(shape => (
                <option key={shape} value={shape}>
                  {shape.charAt(0).toUpperCase() + shape.slice(1)}
                </option>
              ))}
            </Select>
          </OptionGroup>
          
          <OptionGroup>
            <Label>Particle Shape</Label>
            <Select
              value={particleShape}
              onChange={(e) => setParticleShape(e.target.value as ParticleShape)}
            >
              {Object.values(ParticleShape)
                .filter(shape => shape !== ParticleShape.IMAGE && shape !== ParticleShape.CUSTOM)
                .map(shape => (
                  <option key={shape} value={shape}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </option>
                ))
              }
            </Select>
          </OptionGroup>
        </OptionSection>
        
        <ButtonRow>
          <ToggleButton 
            $active={trailActive}
            onClick={toggleTrail}
          >
            {trailActive ? 'Disable Trail' : 'Enable Trail'}
          </ToggleButton>
        </ButtonRow>
      </ControlPanel>
    </DemoContainer>
  );
};

export default GameParticlesDemo;