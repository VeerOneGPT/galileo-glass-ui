/**
 * Animation Event System Demo
 * 
 * Demonstrates the animation event system with interactive animations and event visualization.
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAnimationEvent } from '../hooks/useAnimationEvent';
import {
  AnimationEventType,
  AnimationInteractionType,
  AnimationEvent,
  animationEventManager
} from '../animations/orchestration/AnimationEventSystem';
import { useAnimationStateMachine } from '../animations/orchestration/useAnimationStateMachine';
import { AnimationState } from '../animations/orchestration/AnimationStateMachine';

// Styled components
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  margin-bottom: 20px;
  line-height: 1.5;
`;

const DemoSection = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AnimationStage = styled.div`
  flex: 1;
  min-height: 400px;
  border-radius: 12px;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
`;

const Controls = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ControlSection = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
`;

const ControlTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
`;

const Button = styled.button<{ $active?: boolean }>`
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: ${props => props.$active ? '#4287f5' : 'white'};
  color: ${props => props.$active ? 'white' : 'black'};
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${props => props.$active ? '#3a7add' : '#f0f0f0'};
  }
`;

const EventLog = styled.div`
  height: 150px;
  overflow-y: auto;
  background-color: #f0f0f0;
  border-radius: 6px;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 10px;
`;

const EventEntry = styled.div<{ $type: string }>`
  margin-bottom: 6px;
  padding: 4px;
  border-radius: 4px;
  background-color: ${props => {
    switch (props.$type) {
      case AnimationEventType.START:
        return 'rgba(66, 135, 245, 0.2)';
      case AnimationEventType.COMPLETE:
        return 'rgba(66, 245, 179, 0.2)';
      case AnimationEventType.PAUSE:
        return 'rgba(245, 167, 66, 0.2)';
      case AnimationEventType.RESUME:
        return 'rgba(163, 66, 245, 0.2)';
      case AnimationEventType.CANCEL:
        return 'rgba(245, 66, 66, 0.2)';
      case AnimationInteractionType.MOUSE_ENTER:
      case AnimationInteractionType.MOUSE_LEAVE:
        return 'rgba(255, 255, 255, 0.5)';
      default:
        return 'rgba(0, 0, 0, 0.05)';
    }
  }};
`;

interface AnimationBox {
  id: string;
  position: { x: number; y: number };
  animations: AnimationState[];
  currentState: string;
}

// Animation element
const AnimatedElement = styled.div<{ 
  $x: number;
  $y: number;
  $color: string;
  $selected?: boolean;
}>`
  position: absolute;
  width: 80px;
  height: 80px;
  background-color: ${props => props.$color};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translate(${props => props.$x}px, ${props => props.$y}px);
  transition: transform 0.3s ease, background-color 0.3s ease;
  border: ${props => props.$selected ? '3px solid white' : 'none'};
  cursor: pointer;
  z-index: ${props => props.$selected ? 2 : 1};
`;

// Animation states
const animationStates: AnimationState[] = [
  {
    id: 'idle',
    name: 'Idle',
    styles: {
      transform: 'scale(1)',
      backgroundColor: 'currentColor',
      opacity: '1',
    }
  },
  {
    id: 'hover',
    name: 'Hover',
    styles: {
      transform: 'scale(1.1)',
      backgroundColor: 'currentColor',
      opacity: '1',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    }
  },
  {
    id: 'active',
    name: 'Active',
    styles: {
      transform: 'scale(0.95)',
      backgroundColor: 'currentColor',
      opacity: '1',
    }
  },
  {
    id: 'pulsing',
    name: 'Pulsing',
    styles: {
      transform: 'scale(1)',
      backgroundColor: 'currentColor',
      opacity: '1',
      animation: 'pulse 1.5s infinite',
    }
  },
  {
    id: 'fadeOut',
    name: 'Fade Out',
    styles: {
      transform: 'scale(1)',
      backgroundColor: 'currentColor',
      opacity: '0.5',
    }
  },
];

// Colors for animation boxes
const colors = [
  '#4287f5', // blue
  '#f542a7', // pink
  '#42f5b3', // teal
  '#f5a742', // orange
  '#a342f5', // purple
];

// Initial animation boxes
const initialBoxes: AnimationBox[] = [
  {
    id: 'box1',
    position: { x: 50, y: 50 },
    animations: animationStates,
    currentState: 'idle'
  },
  {
    id: 'box2',
    position: { x: 200, y: 50 },
    animations: animationStates,
    currentState: 'idle'
  },
  {
    id: 'box3',
    position: { x: 350, y: 50 },
    animations: animationStates,
    currentState: 'idle'
  }
];

/**
 * Animation Event System Demo Component
 */
const AnimationEventSystemDemo: React.FC = () => {
  // Event logging state
  const [eventLog, setEventLog] = useState<AnimationEvent[]>([]);
  const eventLogRef = useRef<HTMLDivElement>(null);
  
  // Animation boxes state
  const [boxes, setBoxes] = useState<AnimationBox[]>(initialBoxes);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  
  // Use the animation event hook
  const { on, off, emit } = useAnimationEvent({
    id: 'event-demo',
    immediate: true
  });
  
  // Scroll event log to bottom when new events are added
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [eventLog]);
  
  // Enable debug mode for the event manager
  useEffect(() => {
    animationEventManager.setDebugMode(true);
    animationEventManager.setMaxHistorySize(50);
    
    // Subscribe to all events for logging
    const subscription = on('*', (event) => {
      setEventLog(prev => [...prev.slice(-49), event]);
    }, { priority: -999 }); // Low priority to run last
    
    return () => {
      subscription.unsubscribe();
      animationEventManager.setDebugMode(false);
    };
  }, [on]);
  
  // Handle box state changes
  const handleChangeState = (boxId: string, stateId: string) => {
    // Update box state
    setBoxes(prev => 
      prev.map(box => 
        box.id === boxId 
          ? { ...box, currentState: stateId } 
          : box
      )
    );
    
    // Emit event
    emit(AnimationEventType.START, boxId, {
      stateId,
      timestamp: Date.now()
    });
    
    // Emit complete event after animation duration
    setTimeout(() => {
      emit(AnimationEventType.COMPLETE, boxId, {
        stateId,
        timestamp: Date.now()
      });
    }, 300);
  };
  
  // Clear event log
  const clearEventLog = () => {
    setEventLog([]);
    animationEventManager.clearEventHistory();
  };
  
  // Handle box selection
  const handleSelectBox = (boxId: string) => {
    if (selectedBox === boxId) {
      setSelectedBox(null);
    } else {
      setSelectedBox(boxId);
      
      // Emit selection event
      emit('boxSelected', boxId, {
        timestamp: Date.now()
      });
    }
  };
  
  // Get box element
  const getBox = (boxId: string) => {
    return boxes.find(box => box.id === boxId);
  };
  
  // Box element component
  const BoxElement: React.FC<{ box: AnimationBox, index: number }> = ({ box, index }) => {
    // Get current state of the box
    const currentState = box.animations.find(state => state.id === box.currentState);
    
    // Mouse event handlers
    const handleMouseEnter = () => {
      emit(AnimationInteractionType.MOUSE_ENTER, box.id);
    };
    
    const handleMouseLeave = () => {
      emit(AnimationInteractionType.MOUSE_LEAVE, box.id);
    };
    
    const handleMouseDown = () => {
      emit(AnimationInteractionType.MOUSE_DOWN, box.id);
      handleChangeState(box.id, 'active');
    };
    
    const handleMouseUp = () => {
      emit(AnimationInteractionType.MOUSE_UP, box.id);
      handleChangeState(box.id, selectedBox === box.id ? 'hover' : 'idle');
    };
    
    // Apply current state styles
    const style: React.CSSProperties = {};
    if (currentState && currentState.styles) {
      Object.entries(currentState.styles).forEach(([key, value]) => {
        // @ts-ignore - dynamic styles
        style[key] = value;
      });
    }
    
    return (
      <AnimatedElement
        $x={box.position.x}
        $y={box.position.y}
        $color={colors[index % colors.length]}
        $selected={selectedBox === box.id}
        onClick={() => handleSelectBox(box.id)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={style}
      >
        {box.id}
      </AnimatedElement>
    );
  };
  
  return (
    <DemoContainer>
      <Title>Animation Event System</Title>
      <Description>
        This demo showcases the animation event system with interactive animations and event visualization.
        The system allows components to communicate and react to animation lifecycle events.
      </Description>
      
      <DemoSection>
        <AnimationStage>
          {boxes.map((box, index) => (
            <BoxElement key={box.id} box={box} index={index} />
          ))}
        </AnimationStage>
        
        <Controls>
          {selectedBox && (
            <ControlSection>
              <ControlTitle>Animation States for {selectedBox}</ControlTitle>
              <ButtonGrid>
                {animationStates.map(state => (
                  <Button
                    key={state.id}
                    $active={getBox(selectedBox)?.currentState === state.id}
                    onClick={() => handleChangeState(selectedBox, state.id)}
                  >
                    {state.name}
                  </Button>
                ))}
              </ButtonGrid>
            </ControlSection>
          )}
          
          <ControlSection>
            <ControlTitle>Event Controls</ControlTitle>
            <ButtonGrid>
              <Button onClick={() => {
                if (selectedBox) {
                  emit(AnimationEventType.START, selectedBox);
                }
              }} disabled={!selectedBox}>
                Start
              </Button>
              <Button onClick={() => {
                if (selectedBox) {
                  emit(AnimationEventType.PAUSE, selectedBox);
                }
              }} disabled={!selectedBox}>
                Pause
              </Button>
              <Button onClick={() => {
                if (selectedBox) {
                  emit(AnimationEventType.RESUME, selectedBox);
                }
              }} disabled={!selectedBox}>
                Resume
              </Button>
              <Button onClick={() => {
                if (selectedBox) {
                  emit(AnimationEventType.COMPLETE, selectedBox);
                }
              }} disabled={!selectedBox}>
                Complete
              </Button>
              <Button onClick={() => {
                if (selectedBox) {
                  emit(AnimationEventType.CANCEL, selectedBox);
                  handleChangeState(selectedBox, 'idle');
                }
              }} disabled={!selectedBox}>
                Cancel
              </Button>
              <Button onClick={() => {
                emit('resetAll', 'event-demo');
                setBoxes(boxes.map(box => ({ ...box, currentState: 'idle' })));
              }}>
                Reset All
              </Button>
            </ButtonGrid>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Event Log</ControlTitle>
            <Button onClick={clearEventLog}>Clear Log</Button>
            <EventLog ref={eventLogRef}>
              {eventLog.map((event, index) => (
                <EventEntry key={index} $type={event.type}>
                  {`[${event.type}] ${event.target} @ ${new Date(event.timestamp).toLocaleTimeString()}`}
                  {event.data && ` - ${JSON.stringify(event.data)}`}
                </EventEntry>
              ))}
              {eventLog.length === 0 && (
                <div>No events yet. Interact with the animation elements to generate events.</div>
              )}
            </EventLog>
          </ControlSection>
        </Controls>
      </DemoSection>
    </DemoContainer>
  );
};

export default AnimationEventSystemDemo;