/**
 * KeyboardGestureNavigationDemo.tsx
 * 
 * Demonstrates the keyboard navigation alternatives for gesture interactions,
 * showing how users can interact with gesture-based UI elements using only keyboard controls.
 */

import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useGesturePhysics, GesturePhysicsPreset } from '../animations/physics/gestures/useGesturePhysics';
import { 
  useKeyboardGestureAlternatives,
  KeyboardActivationMode,
  KeyboardFeedbackType,
  GestureKeyboardMapping,
  createKeyboardMapping
} from '../animations/physics/gestures/GestureKeyboardNavigation';
import { GestureType, GestureState, GestureEventData } from '../animations/physics/gestures/GestureDetector';
import { useReducedMotion } from '../animations/accessibility/useReducedMotion';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';

// Custom keyboard mapping using a simplified helper
const customKeyboardMapping = createKeyboardMapping({
  tap: ['Enter', ' '],
  doubleTap: ['Enter', ' '],
  longPress: ['Enter', ' '],
  panUp: ['ArrowUp', 'w', 'W'],
  panDown: ['ArrowDown', 's', 'S'],
  panLeft: ['ArrowLeft', 'a', 'A'],
  panRight: ['ArrowRight', 'd', 'D'],
  panFaster: ['Shift'],
  panSlower: ['Alt'],
  zoomIn: ['+', '='],
  zoomOut: ['-', '_'],
  zoomReset: ['0'],
  rotateClockwise: [']', '}', '.', '>'],
  rotateCounterclockwise: ['[', '{', ',', '<'],
  rotateReset: ['\\', '|'],
  swipeUp: ['Shift+ArrowUp', 'Shift+w', 'Shift+W'],
  swipeDown: ['Shift+ArrowDown', 'Shift+s', 'Shift+S'],
  swipeLeft: ['Shift+ArrowLeft', 'Shift+a', 'Shift+A'],
  swipeRight: ['Shift+ArrowRight', 'Shift+d', 'Shift+D'],
  exit: ['Escape'],
  reset: ['Home']
});

// Styled components for the demo
const DemoContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const GestureCard = styled.div<{ $isActive: boolean; $hasKeyboardFocus: boolean }>`
  width: 300px;
  height: 200px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  user-select: none;
  cursor: grab;
  transition: all 0.2s ease-out;
  
  ${({ $isActive }) => $isActive && `
    box-shadow: 0 12px 48px rgba(0, 100, 255, 0.2);
    cursor: grabbing;
  `}
  
  ${({ $hasKeyboardFocus }) => $hasKeyboardFocus && `
    outline: 3px solid rgba(0, 100, 255, 0.8);
    outline-offset: 2px;
  `}
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    pointer-events: none;
  }
`;

const CardContent = styled.div`
  color: white;
  font-family: sans-serif;
  text-align: center;
  padding: 20px;
  z-index: 1;
`;

const ControlPanel = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
`;

const ControlRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
`;

const InstructionPanel = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 5px;
  }
`;

const StatusIndicator = styled.div<{ $active: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${({ $active }) => $active ? '#4CAF50' : '#ccc'};
`;

/**
 * Component that demonstrates keyboard alternatives for gesture interactions
 */
export const KeyboardGestureNavigationDemo: React.FC = () => {
  // Reference to the interactive element
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Track keyboard focus state
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  
  // Track last gesture for display
  const [lastGesture, setLastGesture] = useState<string>('None');
  
  // Reduced motion preferences
  const { isAnimationAllowed } = useReducedMotion();
  const allowMotion = isAnimationAllowed(AnimationCategory.ACTIVE);
  
  // Handle both touch/mouse gestures through useGesturePhysics
  const gesturePhysics = useGesturePhysics({
    elementRef: cardRef,
    preset: GesturePhysicsPreset.NATURAL,
    preventDefaultEvents: true,
    disableScroll: true
  });
  
  // Handle keyboard gesture alternatives
  const keyboardGesture = useKeyboardGestureAlternatives({
    elementRef: cardRef,
    keyboardMapping: customKeyboardMapping,
    activationMode: KeyboardActivationMode.FOCUS,
    feedbackType: KeyboardFeedbackType.BOTH,
    movementStep: 10,
    rotationStep: 15,
    zoomStep: 0.1,
    
    // Pass gesture events to the same physics system
    onGestureEvent: (event: GestureEventData) => {
      setLastGesture(`${event.type} (keyboard) - ${event.state}`);
    },
    
    // Update focus state when keyboard mode changes
    onKeyboardModeActivate: () => {
      setHasKeyboardFocus(true);
    },
    onKeyboardModeDeactivate: () => {
      setHasKeyboardFocus(false);
    }
  });
  
  // Reset the element to its original state
  const handleReset = () => {
    gesturePhysics.reset();
    keyboardGesture.resetGestureState();
    setLastGesture('Reset to initial state');
  };
  
  return (
    <DemoContainer>
      <h2>Keyboard Gesture Navigation Demo</h2>
      <p>
        This demo shows how gesture-based interactions can be made accessible through keyboard controls.
        Try interacting with the card below using both mouse/touch gestures and keyboard controls.
      </p>
      
      <GestureCard
        ref={cardRef}
        style={{ transform: gesturePhysics.style.transform }}
        $isActive={!!keyboardGesture.activeGestureType}
        $hasKeyboardFocus={hasKeyboardFocus}
        onFocus={() => setHasKeyboardFocus(true)}
        onBlur={() => setHasKeyboardFocus(false)}
        {...keyboardGesture.ariaAttributes}
      >
        <CardContent>
          <h3>Interactive Card</h3>
          <p>Use touch/mouse or keyboard to manipulate</p>
          {hasKeyboardFocus && (
            <p><small>Keyboard controls active</small></p>
          )}
        </CardContent>
      </GestureCard>
      
      <ControlPanel>
        <ControlRow>
          <div>
            <strong>Current Transform:</strong>
            <div>X: {Math.round(gesturePhysics.transform.x)}px, Y: {Math.round(gesturePhysics.transform.y)}px</div>
            <div>Scale: {gesturePhysics.transform.scale.toFixed(2)}, Rotation: {Math.round(gesturePhysics.transform.rotation)}°</div>
          </div>
          <button onClick={handleReset}>Reset Position</button>
        </ControlRow>
        
        <ControlRow>
          <div>
            <strong>Status:</strong>
            <div>
              <StatusIndicator $active={hasKeyboardFocus} /> Keyboard Focus
            </div>
            <div>
              <StatusIndicator $active={!!keyboardGesture.activeGestureType} /> Active Gesture: {keyboardGesture.activeGestureType || 'None'}
            </div>
            <div>Last Gesture: {lastGesture}</div>
          </div>
        </ControlRow>
      </ControlPanel>
      
      <InstructionPanel>
        <h3>Keyboard Controls</h3>
        <ul>
          <li><strong>Arrow keys</strong> - Pan/move card</li>
          <li><strong>Shift + Arrow keys</strong> - Swipe (with momentum)</li>
          <li><strong>+ / -</strong> - Zoom in/out</li>
          <li><strong>[ / ]</strong> - Rotate counter-clockwise/clockwise</li>
          <li><strong>Enter / Space</strong> - Tap (hold for long press)</li>
          <li><strong>Home</strong> - Reset to initial position</li>
          <li><strong>Escape</strong> - Exit keyboard gesture mode</li>
        </ul>
        <p><small>Keyboard controls are enabled automatically when the card has focus.</small></p>
      </InstructionPanel>
    </DemoContainer>
  );
};

export default KeyboardGestureNavigationDemo;