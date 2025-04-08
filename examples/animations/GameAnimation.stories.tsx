import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameAnimation } from '../../src/animations/game/useGameAnimation';
import { TransitionType, TransitionDirection, AnimationCategory } from '../../src/animations/types';
import { SpringPresets } from '../../src/animations/physics/springPhysics';
import { MotionSensitivityLevel } from '../../src/animations/accessibility/MotionSensitivity';

export default {
  title: 'Animations/GameAnimation',
  parameters: {
    componentSubtitle: 'State-based animation system for advanced transitions',
  },
};

// Styled components for our demo
const GameContainer = styled.div`
  position: relative;
  width: 600px;
  height: 400px;
  background: rgba(10, 15, 25, 0.7);
  border-radius: 8px;
  overflow: hidden;
  perspective: 1000px;
`;

const Screen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  opacity: 0;
  background: rgba(20, 30, 50, 0.6);
  backdrop-filter: blur(0px);
  overflow: hidden;
`;

const MenuScreen = styled(Screen)`
  background: linear-gradient(135deg, rgba(30, 40, 70, 0.7), rgba(20, 30, 60, 0.7));
`;

const GameScreen = styled(Screen)`
  background: linear-gradient(135deg, rgba(50, 70, 90, 0.7), rgba(40, 60, 80, 0.7));
`;

const SettingsScreen = styled(Screen)`
  background: linear-gradient(135deg, rgba(60, 50, 80, 0.7), rgba(50, 40, 70, 0.7));
`;

const NavButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  background: rgba(100, 150, 255, 0.3);
  border: 1px solid rgba(160, 200, 255, 0.5);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: background 0.2s;

  &:hover {
    background: rgba(120, 170, 255, 0.4);
  }
`;

const ControlPanel = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  width: 600px;
  padding: 16px;
  background: rgba(20, 30, 50, 0.7);
  border-radius: 8px;
`;

const ControlRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  color: white;
  margin-right: 10px;
`;

const Select = styled.select`
  background: rgba(40, 50, 70, 0.7);
  color: white;
  border: 1px solid rgba(100, 150, 255, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
`;

export const EnhancedGameAnimationDemo = () => {
  // State for controls
  const [transitionType, setTransitionType] = useState<TransitionType>(TransitionType.FADE);
  const [direction, setDirection] = useState<TransitionDirection>(TransitionDirection.LEFT_TO_RIGHT);
  const [duration, setDuration] = useState(600);
  const [usePhysics, setUsePhysics] = useState(false);
  const [useGlassEffects, setUseGlassEffects] = useState(false);
  const [use3DEffects, setUse3DEffects] = useState(false);
  const [useComponentSync, setUseComponentSync] = useState(false);
  const [useGesturePhysics, setUseGesturePhysics] = useState(false);
  const [motionSensitivity, setMotionSensitivity] = useState<MotionSensitivityLevel>(MotionSensitivityLevel.MEDIUM);

  // State for component sync demo
  const [syncCounter, setSyncCounter] = useState(0);
  const [syncColor, setSyncColor] = useState('rgba(100, 150, 255, 0.3)');

  // Set up game animation
  const gameAnimation = useGameAnimation({
    initialState: 'menu',
    states: [
      {
        id: 'menu',
        name: 'Main Menu',
        enterElements: '.menu-screen',
        exitElements: '.menu-screen',
        exclusive: true,
      },
      {
        id: 'game',
        name: 'Game',
        enterElements: '.game-screen',
        exitElements: '.game-screen',
        exclusive: true,
      },
      {
        id: 'settings',
        name: 'Settings',
        enterElements: '.settings-screen',
        exitElements: '.settings-screen',
        exclusive: true,
      },
    ],
    transitions: [
      // The transitions will be created dynamically based on user selections
    ],
    defaultTransitionType: TransitionType.FADE,
    defaultDuration: 600,
    defaultPhysicsConfig: SpringPresets.GENTLE,
    category: AnimationCategory.INTERACTION,
    motionSensitivity,
    debug: true,
  });

  // Navigate to a specific screen with custom transition
  const navigate = (targetState: string) => {
    // Determine the appropriate transition type based on user selections
    let effectiveType = transitionType;
    
    // Apply physics if requested
    if (usePhysics) {
      if (transitionType === TransitionType.FADE) effectiveType = TransitionType.PHYSICS_FADE;
      else if (transitionType === TransitionType.SLIDE) effectiveType = TransitionType.PHYSICS_SLIDE;
      else if (transitionType === TransitionType.ZOOM) effectiveType = TransitionType.PHYSICS_ZOOM;
      else if (transitionType === TransitionType.FLIP) effectiveType = TransitionType.PHYSICS_FLIP;
    }
    
    // Apply glass effects if requested
    if (useGlassEffects) {
      effectiveType = TransitionType.GLASS_BLUR;
    }
    
    // Apply 3D effects if requested
    if (use3DEffects) {
      if (transitionType === TransitionType.ROTATE_3D || 
          transitionType === TransitionType.PUSH_3D || 
          transitionType === TransitionType.FLIP_3D) {
        effectiveType = transitionType;
      } else {
        effectiveType = TransitionType.ROTATE_3D;
      }
    }
    
    // Create the custom transition
    const customTransition = {
      type: effectiveType,
      direction,
      duration,
      physicsConfig: usePhysics ? {
        tension: 170,
        friction: 26,
        mass: 1
      } : undefined,
      glassEffect: useGlassEffects ? {
        blur: 'medium' as 'medium',
        opacity: 0.8,
        glow: 'subtle' as 'subtle'
      } : undefined,
      transform3D: use3DEffects ? {
        rotateX: 15,
        rotateY: 15,
        translateZ: 150,
        perspective: 1000,
        origin: 'center'
      } : undefined,
      // Add component state synchronization if enabled
      componentSync: useComponentSync ? {
        targets: '.nav-button',
        fromState: {
          counter: syncCounter,
          bgColor: syncColor,
          enabled: true
        },
        toState: {
          counter: syncCounter + 1,
          bgColor: 'rgba(150, 200, 255, 0.5)',
          enabled: true
        },
        // Custom function to apply state updates to components
        applyStateUpdate: (el, props) => {
          if (props.counter !== undefined) {
            el.setAttribute('data-counter', String(props.counter));
            // Also update our React state when complete
            if (props.counter === syncCounter + 1) {
              setSyncCounter(props.counter);
            }
          }
          if (props.bgColor) {
            el.style.backgroundColor = props.bgColor;
            // Also update our React state when complete
            if (props.bgColor === 'rgba(150, 200, 255, 0.5)') {
              setSyncColor(props.bgColor);
            }
          }
        }
      } : undefined,
      // Add gesture physics if enabled
      gesturePhysics: useGesturePhysics ? {
        enabled: true,
        interactionType: 'drag' as 'drag',
        springBack: true,
        boundsCheck: true
      } : undefined
    };
    
    // Trigger the transition
    gameAnimation.transitionTo(targetState, customTransition);
  };

  // Initialize screens once mounted
  useEffect(() => {
    // Set the active screen visible immediately on mount
    const activeScreens = document.querySelectorAll('.menu-screen');
    activeScreens.forEach((screen) => {
      (screen as HTMLElement).style.opacity = '1';
    });
  }, []);

  return (
    <>
      <GameContainer>
        <MenuScreen className="menu-screen">
          <h2>Main Menu</h2>
          <div>
            <NavButton className="nav-button" onClick={() => navigate('game')}>
              Start Game {useComponentSync && `(${syncCounter})`}
            </NavButton>
            <NavButton className="nav-button" onClick={() => navigate('settings')}>
              Settings {useComponentSync && `(${syncCounter})`}
            </NavButton>
          </div>
        </MenuScreen>
        
        <GameScreen className="game-screen">
          <h2>Game Screen</h2>
          <div>
            <NavButton onClick={() => navigate('menu')}>Back to Menu</NavButton>
            <NavButton onClick={() => navigate('settings')}>Settings</NavButton>
          </div>
        </GameScreen>
        
        <SettingsScreen className="settings-screen">
          <h2>Settings</h2>
          <div>
            <NavButton onClick={() => navigate('menu')}>Back to Menu</NavButton>
            <NavButton onClick={() => navigate('game')}>Back to Game</NavButton>
          </div>
        </SettingsScreen>
      </GameContainer>
      
      <ControlPanel>
        <ControlRow>
          <Label>
            Transition Type:
            <Select 
              value={transitionType} 
              onChange={(e) => setTransitionType(e.target.value as TransitionType)}
            >
              <option value={TransitionType.FADE}>Fade</option>
              <option value={TransitionType.SLIDE}>Slide</option>
              <option value={TransitionType.ZOOM}>Zoom</option>
              <option value={TransitionType.FLIP}>Flip</option>
              <option value={TransitionType.ROTATE_3D}>Rotate 3D</option>
              <option value={TransitionType.PUSH_3D}>Push 3D</option>
              <option value={TransitionType.FLIP_3D}>Flip 3D</option>
              <option value={TransitionType.GLASS_BLUR}>Glass Blur</option>
              <option value={TransitionType.GLASS_OPACITY}>Glass Opacity</option>
              <option value={TransitionType.GLASS_GLOW}>Glass Glow</option>
            </Select>
          </Label>
          
          <Label>
            Direction:
            <Select 
              value={direction} 
              onChange={(e) => setDirection(e.target.value as TransitionDirection)}
            >
              <option value={TransitionDirection.LEFT_TO_RIGHT}>Left to Right</option>
              <option value={TransitionDirection.RIGHT_TO_LEFT}>Right to Left</option>
              <option value={TransitionDirection.TOP_TO_BOTTOM}>Top to Bottom</option>
              <option value={TransitionDirection.BOTTOM_TO_TOP}>Bottom to Top</option>
              <option value={TransitionDirection.FROM_CENTER}>From Center</option>
              <option value={TransitionDirection.TO_CENTER}>To Center</option>
            </Select>
          </Label>
          
          <Label>
            Duration:
            <Select 
              value={duration} 
              onChange={(e) => setDuration(parseInt(e.target.value))}
            >
              <option value="300">Fast (300ms)</option>
              <option value="600">Medium (600ms)</option>
              <option value="1000">Slow (1000ms)</option>
            </Select>
          </Label>
        </ControlRow>
        
        <ControlRow>
          <Label>
            <input 
              type="checkbox" 
              checked={usePhysics} 
              onChange={(e) => setUsePhysics(e.target.checked)} 
            />
            Use Physics
          </Label>
          
          <Label>
            <input 
              type="checkbox" 
              checked={useGlassEffects} 
              onChange={(e) => setUseGlassEffects(e.target.checked)} 
            />
            Use Glass Effects
          </Label>
          
          <Label>
            <input 
              type="checkbox" 
              checked={use3DEffects} 
              onChange={(e) => setUse3DEffects(e.target.checked)} 
            />
            Use 3D Effects
          </Label>
          
          <Label>
            Motion Sensitivity:
            <Select 
              value={motionSensitivity} 
              onChange={(e) => setMotionSensitivity(e.target.value as MotionSensitivityLevel)}
            >
              <option value={MotionSensitivityLevel.NONE}>None</option>
              <option value={MotionSensitivityLevel.LOW}>Low</option>
              <option value={MotionSensitivityLevel.MEDIUM}>Medium</option>
              <option value={MotionSensitivityLevel.HIGH}>High</option>
              <option value={MotionSensitivityLevel.MAXIMUM}>Maximum</option>
            </Select>
          </Label>
        </ControlRow>
        
        <ControlRow>
          <Label>
            <input 
              type="checkbox" 
              checked={useComponentSync} 
              onChange={(e) => setUseComponentSync(e.target.checked)} 
            />
            Use Component State Sync
          </Label>
          
          <Label>
            <input 
              type="checkbox" 
              checked={useGesturePhysics} 
              onChange={(e) => setUseGesturePhysics(e.target.checked)} 
            />
            Use Gesture Physics
          </Label>
        </ControlRow>
      </ControlPanel>
    </>
  );
};

EnhancedGameAnimationDemo.storyName = 'Enhanced Game Animation';
EnhancedGameAnimationDemo.parameters = {
  docs: {
    description: {
      story: 'Demonstrates the enhanced useGameAnimation hook with physics-based transitions, glass effects, and 3D animations.',
    },
  },
}; 