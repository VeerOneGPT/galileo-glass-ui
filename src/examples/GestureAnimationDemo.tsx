import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { 
  useGestureAnimation, 
  GestureAnimationPresets, 
  GestureTypes 
} from '../hooks/useGestureAnimation';
import { GestureTransform } from '../animations/physics/gestures/GestureAnimation';

// Container for the demo with some padding
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

// Header with glass effect
const Header = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

// Title styling
const Title = styled.h2`
  margin: 0 0 10px 0;
  color: #444;
`;

// Description text
const Description = styled.p`
  margin: 0;
  color: #666;
  line-height: 1.5;
`;

// Interactive area
const InteractionArea = styled.div`
  height: 400px;
  border-radius: 10px;
  background: rgba(220, 230, 240, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid rgba(200, 210, 220, 0.4);
`;

// Base for all draggable items
const DraggableBase = styled.div`
  user-select: none;
  position: absolute;
  transform-origin: center center;
  will-change: transform;
  transition: box-shadow 0.3s ease;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

// Card with glass effect for dragging
const GlassCard = styled(DraggableBase)`
  width: 200px;
  height: 140px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  &:hover {
    box-shadow: 0 8px 42px rgba(0, 0, 0, 0.15);
  }
`;

// Image element for dragging
const DraggableImage = styled(DraggableBase)`
  width: 180px;
  height: 180px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }
`;

// Controls section
const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
`;

// Control button
const ControlButton = styled.button<{ active?: boolean }>`
  padding: 10px 15px;
  background: ${props => props.active ? 'rgba(120, 170, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)'};
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(120, 170, 255, 0.5);
  }
`;

// Status display
const Status = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 10px 15px;
  margin-top: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: monospace;
  font-size: 13px;
  color: #333;
`;

// Card title
const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #444;
`;

// Card content
const CardContent = styled.div`
  font-size: 14px;
  color: #666;
`;

// Interface for the demo card properties
interface DemoCardProps {
  preset: keyof typeof GestureAnimationPresets;
  title: string;
  description: string;
  disableScale?: boolean;
  disableRotate?: boolean;
  backgroundUrl?: string;
}

// Demo card component
const DemoCard: React.FC<DemoCardProps> = ({
  preset,
  title,
  description,
  disableScale,
  disableRotate,
  backgroundUrl
}) => {
  // Ref for the card element
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Set up gesture animation
  const { transform, reset, isActive } = useGestureAnimation({
    ref: cardRef,
    preset: GestureAnimationPresets[preset],
    gestures: [
      GestureTypes.PAN, 
      GestureTypes.SWIPE,
      ...(disableScale ? [] : [GestureTypes.PINCH]),
      ...(disableRotate ? [] : [GestureTypes.ROTATE])
    ],
    allowScale: !disableScale,
    allowRotate: !disableRotate,
    boundaries: {
      x: { min: -300, max: 300 },
      y: { min: -200, max: 200 },
      scale: { min: 0.5, max: 2 }
    },
    snapPoints: [
      { x: 0, y: 0 },
      { x: -150, y: -100 },
      { x: 150, y: -100 },
      { x: -150, y: 100 },
      { x: 150, y: 100 }
    ],
    snapThreshold: 40
  });
  
  // Render different card types based on props
  if (backgroundUrl) {
    return (
      <DraggableImage
        ref={cardRef}
        style={{ boxShadow: isActive ? '0 15px 45px rgba(0, 0, 0, 0.3)' : undefined }}
      >
        <img src={backgroundUrl} alt={title} />
      </DraggableImage>
    );
  }
  
  return (
    <GlassCard
      ref={cardRef}
      style={{ boxShadow: isActive ? '0 15px 45px rgba(0, 0, 0, 0.3)' : undefined }}
    >
      <CardTitle>{title}</CardTitle>
      <CardContent>{description}</CardContent>
    </GlassCard>
  );
};

/**
 * Demo component for the gesture animation system
 */
const GestureAnimationDemo: React.FC = () => {
  // State for selected preset
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof GestureAnimationPresets>(
    'SPRING_BOUNCE'
  );
  
  // State for demo options
  const [options, setOptions] = useState({
    disableScale: false,
    disableRotate: false,
    showImage: false,
  });
  
  // Sample image URLs for demo
  const imageSrc = 'https://via.placeholder.com/400x400/3080E8/FFFFFF?text=Gesture+Demo';
  
  // Ref for the main demo element
  const mainDemoRef = useRef<HTMLDivElement>(null);
  
  // Set up gesture animation for the main demo element
  const { transform, reset, isActive } = useGestureAnimation({
    ref: mainDemoRef,
    preset: GestureAnimationPresets[selectedPreset],
    gestures: [
      GestureTypes.PAN, 
      GestureTypes.SWIPE,
      ...(options.disableScale ? [] : [GestureTypes.PINCH]),
      ...(options.disableRotate ? [] : [GestureTypes.ROTATE])
    ],
    allowScale: !options.disableScale,
    allowRotate: !options.disableRotate,
    boundaries: {
      x: { min: -300, max: 300 },
      y: { min: -200, max: 200 },
      scale: { min: 0.5, max: 2 }
    },
    snapPoints: [
      { x: 0, y: 0 },
      { x: -150, y: -100 },
      { x: 150, y: -100 },
      { x: -150, y: 100 },
      { x: 150, y: 100 }
    ],
    snapThreshold: 40
  });
  
  // Toggle an option
  const toggleOption = (option: keyof typeof options) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  // Format transform values for display
  const formatTransform = (transform: GestureTransform) => {
    return {
      translateX: Math.round(transform.translateX),
      translateY: Math.round(transform.translateY),
      scale: transform.scale.toFixed(2),
      rotation: Math.round(transform.rotation),
      velocity: {
        x: Math.round(transform.velocity.x * 100) / 100,
        y: Math.round(transform.velocity.y * 100) / 100
      }
    };
  };
  
  return (
    <DemoContainer>
      <Header>
        <Title>Gesture Animation System</Title>
        <Description>
          Interact with the card below using gestures. Try dragging, swiping, pinching (to zoom), 
          and rotating. The card will respond with physics-based animations.
        </Description>
      </Header>
      
      <InteractionArea>
        {options.showImage ? (
          <DraggableImage
            ref={mainDemoRef}
            style={{ boxShadow: isActive ? '0 15px 45px rgba(0, 0, 0, 0.3)' : undefined }}
          >
            <img src={imageSrc} alt="Draggable demo" />
          </DraggableImage>
        ) : (
          <GlassCard
            ref={mainDemoRef}
            style={{ boxShadow: isActive ? '0 15px 45px rgba(0, 0, 0, 0.3)' : undefined }}
          >
            <CardTitle>Physics-Based Gestures</CardTitle>
            <CardContent>
              {`Using the "${selectedPreset}" preset`}
              <br />
              Drag me, pinch to zoom, or rotate with gestures!
            </CardContent>
          </GlassCard>
        )}
      </InteractionArea>
      
      <div>
        <h3>Presets</h3>
        <Controls>
          {(Object.keys(GestureAnimationPresets) as Array<keyof typeof GestureAnimationPresets>).map(
            preset => (
              <ControlButton
                key={preset}
                active={selectedPreset === preset}
                onClick={() => setSelectedPreset(preset)}
              >
                {preset.split('_').map(word => 
                  word.charAt(0) + word.slice(1).toLowerCase()
                ).join(' ')}
              </ControlButton>
            )
          )}
        </Controls>
        
        <h3>Options</h3>
        <Controls>
          <ControlButton
            active={!options.disableScale}
            onClick={() => toggleOption('disableScale')}
          >
            {options.disableScale ? 'Enable Scaling' : 'Disable Scaling'}
          </ControlButton>
          
          <ControlButton
            active={!options.disableRotate}
            onClick={() => toggleOption('disableRotate')}
          >
            {options.disableRotate ? 'Enable Rotation' : 'Disable Rotation'}
          </ControlButton>
          
          <ControlButton
            active={options.showImage}
            onClick={() => toggleOption('showImage')}
          >
            {options.showImage ? 'Show Card' : 'Show Image'}
          </ControlButton>
          
          <ControlButton onClick={() => reset()}>
            Reset Position
          </ControlButton>
        </Controls>
        
        <h3>Current Transform</h3>
        <Status>
          <pre>{JSON.stringify(formatTransform(transform), null, 2)}</pre>
        </Status>
      </div>
    </DemoContainer>
  );
};

export default GestureAnimationDemo;