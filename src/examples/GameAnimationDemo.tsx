/**
 * GameAnimationDemo.tsx
 * 
 * A demonstration of the useGameAnimation hook for creating interactive
 * state transitions with animation.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  useGameAnimation, 
  TransitionType, 
  TransitionDirection,
  GameAnimationState,
  StateTransition
} from '../animations/game/useGameAnimation';
import { StaggerPattern } from '../animations/orchestration/useAnimationSequence';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';
import { useReducedMotion } from '../animations/accessibility/useReducedMotion';

// Demo container
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

// Scene container
const SceneContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  background-color: #f0f5ff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// Scene background
const SceneBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e9ff 0%, #f0f5ff 100%);
  z-index: 1;
`;

// Menu state
const MenuScene = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

// Game state
const GameScene = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

// Settings state
const SettingsScene = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

// Game over state
const GameOverScene = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

// Title
const Title = styled.h1`
  font-size: 48px;
  color: #1a2a5e;
  margin-bottom: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Button
const Button = styled.button`
  background: #3a5bd9;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 30px;
  font-size: 18px;
  font-weight: 600;
  margin: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(58, 91, 217, 0.2);
  
  &:hover {
    background: #2a4bc8;
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(58, 91, 217, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(58, 91, 217, 0.2);
  }
  
  &:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
    transform: none;
  }
`;

// Settings form
const SettingsForm = styled.div`
  background: rgba(255, 255, 255, 0.8);
  padding: 30px;
  border-radius: 12px;
  width: 80%;
  max-width: 500px;
`;

// Form group
const FormGroup = styled.div`
  margin-bottom: 20px;
`;

// Label
const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1a2a5e;
`;

// Select
const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 2px solid #d0d8f0;
  border-radius: 8px;
  background: white;
  font-size: 16px;
`;

// Game element
const GameElement = styled.div`
  width: 80px;
  height: 80px;
  background: #3a5bd9;
  border-radius: 10px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

// Game grid
const GameGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 400px;
`;

// Game score
const GameScore = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a2a5e;
`;

// Controls bar
const ControlsBar = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

// Control row
const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
  align-items: center;
`;

// Info text
const InfoText = styled.div`
  margin: 15px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
`;

/**
 * Game animation demo component
 */
export const GameAnimationDemo: React.FC = () => {
  const [score, setScore] = useState(0);
  const [selectedTransition, setSelectedTransition] = useState<string>('fade');
  const [selectedDirection, setSelectedDirection] = useState<string>('left-to-right');
  
  // Reduced motion support
  const { appReducedMotion, setAppReducedMotion } = useReducedMotion();
  
  // Define game states
  const states: GameAnimationState[] = [
    {
      id: 'menu',
      name: 'Main Menu',
      enterElements: '.menu-element',
      exitElements: '.menu-element',
      exclusive: true,
      enterDuration: 800,
      exitDuration: 400,
      backgroundElements: '.scene-background'
    },
    {
      id: 'game',
      name: 'Gameplay',
      enterElements: '.game-element',
      exitElements: '.game-element',
      exclusive: true,
      enterDuration: 500,
      exitDuration: 300,
      backgroundElements: '.scene-background'
    },
    {
      id: 'settings',
      name: 'Settings',
      enterElements: '.settings-element',
      exitElements: '.settings-element',
      exclusive: true,
      enterDuration: 600,
      exitDuration: 400,
      backgroundElements: '.scene-background'
    },
    {
      id: 'game-over',
      name: 'Game Over',
      enterElements: '.gameover-element',
      exitElements: '.gameover-element',
      exclusive: true,
      enterDuration: 1000,
      exitDuration: 500,
      backgroundElements: '.scene-background'
    }
  ];
  
  // Define transitions between states
  const transitions: StateTransition[] = [
    // Menu to Game
    {
      from: 'menu',
      to: 'game',
      type: TransitionType.FADE,
      duration: 500,
      direction: TransitionDirection.LEFT_TO_RIGHT,
      easing: 'easeInOutCubic',
      stagger: true,
      staggerPattern: StaggerPattern.SEQUENTIAL,
      staggerDelay: 50,
      category: AnimationCategory.ATTENTION,
      reducedMotionAlternative: {
        type: TransitionType.FADE,
        duration: 300,
        stagger: false
      }
    },
    
    // Game to Menu
    {
      from: 'game',
      to: 'menu',
      type: TransitionType.FADE,
      duration: 500,
      direction: TransitionDirection.RIGHT_TO_LEFT,
      easing: 'easeInOutCubic',
      stagger: true,
      staggerPattern: StaggerPattern.FROM_EDGES,
      staggerDelay: 50,
      category: AnimationCategory.ATTENTION,
      reducedMotionAlternative: {
        type: TransitionType.FADE,
        duration: 300,
        stagger: false
      }
    },
    
    // Menu to Settings
    {
      from: 'menu',
      to: 'settings',
      type: TransitionType.SLIDE,
      duration: 500,
      direction: TransitionDirection.BOTTOM_TO_TOP,
      easing: 'easeOutBack',
      category: AnimationCategory.ATTENTION,
      reducedMotionAlternative: {
        type: TransitionType.FADE,
        duration: 300
      }
    },
    
    // Settings to Menu
    {
      from: 'settings',
      to: 'menu',
      type: TransitionType.SLIDE,
      duration: 500,
      direction: TransitionDirection.TOP_TO_BOTTOM,
      easing: 'easeInOutCubic',
      category: AnimationCategory.ATTENTION,
      reducedMotionAlternative: {
        type: TransitionType.FADE,
        duration: 300
      }
    },
    
    // Game to Game Over
    {
      from: 'game',
      to: 'game-over',
      type: TransitionType.ZOOM,
      duration: 800,
      direction: TransitionDirection.FROM_CENTER,
      easing: 'easeInExpo',
      category: AnimationCategory.ATTENTION,
      reducedMotionAlternative: {
        type: TransitionType.FADE,
        duration: 400
      }
    },
    
    // Game Over to Menu
    {
      from: 'game-over',
      to: 'menu',
      type: TransitionType.SLIDE,
      duration: 700,
      direction: TransitionDirection.BOTTOM_TO_TOP,
      easing: 'easeInOutCubic',
      category: AnimationCategory.ATTENTION,
      reducedMotionAlternative: {
        type: TransitionType.FADE,
        duration: 300
      }
    }
  ];
  
  // Initialize game animation hook
  const gameAnimation = useGameAnimation({
    initialState: 'menu',
    states,
    transitions,
    defaultTransitionType: TransitionType.FADE,
    defaultDuration: 500,
    defaultEasing: 'easeInOutCubic',
    autoTransition: true,
    allowMultipleActiveStates: false,
    category: AnimationCategory.ATTENTION,
    onStateChange: (prevState, newState) => {
      console.log(`State changed from ${prevState} to ${newState}`);
    }
  });
  
  // Handle custom transition
  const handleCustomTransition = (targetState: string) => {
    gameAnimation.transitionTo(targetState, {
      type: selectedTransition as TransitionType,
      direction: selectedDirection as TransitionDirection,
      stagger: true,
      staggerPattern: StaggerPattern.FROM_CENTER,
      duration: 800
    });
  };
  
  // Generate game elements for the game screen
  const renderGameElements = () => {
    const elements = [];
    for (let i = 1; i <= 9; i++) {
      elements.push(
        <GameElement key={i} className="game-element">
          {i}
        </GameElement>
      );
    }
    return elements;
  };
  
  return (
    <DemoContainer>
      <h2>Game Animation Demo</h2>
      
      <InfoText>
        This demo showcases the useGameAnimation hook, which provides a system for managing
        animated transitions between application states. It's particularly useful for game-like
        interfaces, wizards, multi-step forms, or any interface with distinct screens or modes
        that transition between each other.
      </InfoText>
      
      <ControlsBar>
        <ControlRow>
          <Button 
            onClick={() => gameAnimation.transitionTo('menu')}
            disabled={gameAnimation.isStateActive('menu') || gameAnimation.isTransitioning}
          >
            Main Menu
          </Button>
          
          <Button 
            onClick={() => gameAnimation.transitionTo('game')}
            disabled={gameAnimation.isStateActive('game') || gameAnimation.isTransitioning}
          >
            Start Game
          </Button>
          
          <Button 
            onClick={() => gameAnimation.transitionTo('settings')}
            disabled={gameAnimation.isStateActive('settings') || gameAnimation.isTransitioning}
          >
            Settings
          </Button>
          
          <Button 
            onClick={() => gameAnimation.transitionTo('game-over')}
            disabled={gameAnimation.isStateActive('game-over') || gameAnimation.isTransitioning}
          >
            Game Over
          </Button>
        </ControlRow>
        
        <ControlRow>
          <div>
            <Label>Animation Status: {gameAnimation.isTransitioning ? 'Transitioning' : 'Idle'}</Label>
            <Label>Current State: {gameAnimation.activeStates[0]?.name || 'None'}</Label>
            <Label>Reduced Motion: 
              <input 
                type="checkbox" 
                checked={appReducedMotion}
                onChange={() => setAppReducedMotion(!appReducedMotion)}
                style={{ marginLeft: '10px' }}
              />
            </Label>
          </div>
        </ControlRow>
        
        <ControlRow>
          <FormGroup>
            <Label>Custom Transition Type:</Label>
            <Select value={selectedTransition} onChange={(e) => setSelectedTransition(e.target.value)}>
              {Object.keys(TransitionType).map(type => (
                <option key={type} value={TransitionType[type as keyof typeof TransitionType]}>
                  {type}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Direction:</Label>
            <Select value={selectedDirection} onChange={(e) => setSelectedDirection(e.target.value)}>
              {Object.keys(TransitionDirection).map(dir => (
                <option key={dir} value={TransitionDirection[dir as keyof typeof TransitionDirection]}>
                  {dir}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          <Button onClick={() => handleCustomTransition('menu')}>
            Custom Transition
          </Button>
        </ControlRow>
        
        <ControlRow>
          <Button onClick={gameAnimation.pauseTransition} disabled={!gameAnimation.isTransitioning}>
            Pause
          </Button>
          <Button onClick={gameAnimation.resumeTransition} disabled={!gameAnimation.isTransitioning}>
            Resume
          </Button>
          <Button onClick={gameAnimation.completeTransition} disabled={!gameAnimation.isTransitioning}>
            Complete
          </Button>
          <Button onClick={gameAnimation.cancelTransition} disabled={!gameAnimation.isTransitioning}>
            Cancel
          </Button>
        </ControlRow>
      </ControlsBar>
      
      <SceneContainer>
        <SceneBackground className="scene-background" />
        
        {/* Menu State */}
        {gameAnimation.isStateActive('menu') && (
          <MenuScene>
            <Title className="menu-element">Galaxy Quest</Title>
            <Button className="menu-element" onClick={() => gameAnimation.transitionTo('game')}>
              Start Game
            </Button>
            <Button className="menu-element" onClick={() => gameAnimation.transitionTo('settings')}>
              Settings
            </Button>
            <div className="menu-element" style={{ marginTop: '20px', color: '#1a2a5e' }}>
              High Score: {score}
            </div>
          </MenuScene>
        )}
        
        {/* Game State */}
        {gameAnimation.isStateActive('game') && (
          <GameScene>
            <GameScore className="game-element">Score: {score}</GameScore>
            <GameGrid>
              {renderGameElements()}
            </GameGrid>
            <div style={{ marginTop: '20px' }}>
              <Button 
                className="game-element" 
                onClick={() => {
                  setScore(score + 10);
                }}
              >
                +10 Points
              </Button>
              <Button 
                className="game-element" 
                onClick={() => gameAnimation.transitionTo('game-over')}
              >
                End Game
              </Button>
            </div>
          </GameScene>
        )}
        
        {/* Settings State */}
        {gameAnimation.isStateActive('settings') && (
          <SettingsScene>
            <Title className="settings-element">Settings</Title>
            <SettingsForm className="settings-element">
              <FormGroup>
                <Label>Difficulty</Label>
                <Select>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Animation Speed</Label>
                <Select>
                  <option>Slow</option>
                  <option>Normal</option>
                  <option>Fast</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Sound</Label>
                <Select>
                  <option>Off</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Select>
              </FormGroup>
            </SettingsForm>
            <Button 
              className="settings-element"
              onClick={() => gameAnimation.transitionTo('menu')}
              style={{ marginTop: '20px' }}
            >
              Back to Menu
            </Button>
          </SettingsScene>
        )}
        
        {/* Game Over State */}
        {gameAnimation.isStateActive('game-over') && (
          <GameOverScene>
            <Title className="gameover-element">Game Over!</Title>
            <div className="gameover-element" style={{ fontSize: '24px', marginBottom: '20px', color: '#1a2a5e' }}>
              Final Score: {score}
            </div>
            <Button 
              className="gameover-element"
              onClick={() => {
                setScore(0);
                gameAnimation.transitionTo('menu');
              }}
            >
              Back to Menu
            </Button>
          </GameOverScene>
        )}
      </SceneContainer>
      
      <InfoText>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li><strong>State Management</strong> - Define distinct application states with enter/exit animations</li>
          <li><strong>Transition System</strong> - Configure how transitions between states should animate</li>
          <li><strong>Multiple Transition Types</strong> - Fade, slide, zoom, and more transition effects</li>
          <li><strong>Staggered Animations</strong> - Elements can animate in sequence with various patterns</li>
          <li><strong>Accessibility</strong> - Automatic respect for reduced motion preferences</li>
          <li><strong>Playback Controls</strong> - Ability to pause, resume, complete, or cancel transitions</li>
          <li><strong>Custom Transitions</strong> - On-the-fly modification of transition properties</li>
        </ul>
        
        <h3>Common Use Cases:</h3>
        <ul>
          <li><strong>Game UIs</strong> - Transitions between menus, gameplay, and other screens</li>
          <li><strong>Multi-step Wizards</strong> - Animated progression through a sequence of steps</li>
          <li><strong>Page Transitions</strong> - Create cohesive navigation experiences</li>
          <li><strong>State-based Applications</strong> - Any app with distinct modes or states</li>
          <li><strong>Interactive Presentations</strong> - Create engaging slide transitions</li>
        </ul>
      </InfoText>
    </DemoContainer>
  );
};

export default GameAnimationDemo;