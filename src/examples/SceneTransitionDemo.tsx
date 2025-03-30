/**
 * SceneTransitionDemo.tsx
 * 
 * A demonstration of the scene transition system for creating fluid
 * application experiences with smooth transitions between different views or levels.
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  useSceneTransition,
  TransitionEffect,
  SceneDepthEffect,
  ContentPreservation
} from '../animations/physics/useSceneTransition';
import {
  SceneConfig,
  SceneTransition,
  SceneType,
} from '../animations/physics/SceneTransitionManager';
import { TransitionDirection } from '../animations/game/useGameAnimation';
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
  background-color: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

// Home scene
const HomeScene = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
`;

// Game scene
const GameScene = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
  color: white;
`;

// Settings scene
const SettingsScene = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #373b44 0%, #4286f4 100%);
  color: white;
`;

// Level scene
const LevelScene = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #654ea3 0%, #eaafc8 100%);
  color: white;
`;

// Level complete scene
const LevelCompleteScene = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  color: white;
`;

// Background element
const BackgroundElement = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

// Interactive element
const InteractiveElement = styled.div`
  position: relative;
  z-index: 10;
`;

// Title
const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 40px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

// Subtitle
const Subtitle = styled.h2`
  font-size: 28px;
  margin-bottom: 30px;
  opacity: 0.9;
`;

// Info text
const InfoText = styled.p`
  margin: 15px 0;
  font-size: 16px;
  line-height: 1.5;
  max-width: 80%;
  text-align: center;
`;

// Button container
const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

// Button
const Button = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  padding: 12px 30px;
  font-size: 18px;
  font-weight: 600;
  margin: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Level grid
const LevelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
`;

// Level button
const LevelButton = styled.button<{ $completed?: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ $completed }) => 
    $completed ? 'rgba(59, 230, 132, 0.3)' : 'rgba(255, 255, 255, 0.15)'};
  border: 2px solid ${({ $completed }) => 
    $completed ? 'rgba(59, 230, 132, 0.6)' : 'rgba(255, 255, 255, 0.3)'};
  color: white;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
    background: ${({ $completed }) => 
      $completed ? 'rgba(59, 230, 132, 0.4)' : 'rgba(255, 255, 255, 0.25)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Game element
const GameElement = styled.div`
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  margin: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

// Game grid
const GameGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
  max-width: 300px;
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

// Form group
const FormGroup = styled.div`
  margin-bottom: 10px;
`;

// Label
const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
`;

// Select
const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  min-width: 200px;
`;

// Progress bar container
const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
`;

// Progress bar
const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => `${$progress * 100}%`};
  background: linear-gradient(to right, #4facfe, #00f2fe);
  border-radius: 10px;
  transition: width 0.1s ease;
`;

// Background floating elements for visual interest
const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

const FloatingElement = styled.div<{ $size: number, $x: number, $y: number, $delay: number }>`
  position: absolute;
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  top: ${({ $y }) => `${$y}%`};
  left: ${({ $x }) => `${$x}%`};
  animation: float ${({ $delay }) => `${5 + $delay}s`} ease-in-out infinite;
  animation-delay: ${({ $delay }) => `${$delay}s`};
  
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
`;

// Status text
const StatusText = styled.div`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
`;

/**
 * Generate random floating background elements
 */
const randomFloatingElements = (count: number) => {
  const elements = [];
  for (let i = 0; i < count; i++) {
    elements.push({
      id: i,
      size: 20 + Math.random() * 80,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    });
  }
  return elements;
};

/**
 * Scene Transition Demo Component
 */
export const SceneTransitionDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEffect, setSelectedEffect] = useState<string>(TransitionEffect.FADE);
  const [selectedDirection, setSelectedDirection] = useState<string>(TransitionDirection.LEFT_TO_RIGHT);
  const [selectedDepthEffect, setSelectedDepthEffect] = useState<string>(SceneDepthEffect.NONE);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [floatingElements] = useState(randomFloatingElements(10));
  
  // Reduced motion support
  const { appReducedMotion, setAppReducedMotion } = useReducedMotion();
  
  // Define scenes for the demo
  const scenes: SceneConfig[] = [
    {
      id: 'home',
      name: 'Home',
      type: SceneType.MENU,
      container: '.home-scene',
      enterElements: '.home-element',
      exitElements: '.home-element',
      backgroundElements: '.home-background',
      enterDuration: 800,
      exitDuration: 400
    },
    {
      id: 'levels',
      name: 'Levels',
      type: SceneType.MENU,
      container: '.levels-scene',
      enterElements: '.levels-element',
      exitElements: '.levels-element',
      backgroundElements: '.levels-background',
      enterDuration: 600,
      exitDuration: 300
    },
    {
      id: 'game',
      name: 'Game',
      type: SceneType.GAME_LEVEL,
      container: '.game-scene',
      enterElements: '.game-element',
      exitElements: '.game-element',
      backgroundElements: '.game-background',
      enterDuration: 500,
      exitDuration: 300
    },
    {
      id: 'settings',
      name: 'Settings',
      type: SceneType.SETTINGS,
      container: '.settings-scene',
      enterElements: '.settings-element',
      exitElements: '.settings-element',
      backgroundElements: '.settings-background',
      enterDuration: 600,
      exitDuration: 400
    },
    {
      id: 'level-complete',
      name: 'Level Complete',
      type: SceneType.ACHIEVEMENT,
      container: '.level-complete-scene',
      enterElements: '.level-complete-element',
      exitElements: '.level-complete-element',
      backgroundElements: '.level-complete-background',
      enterDuration: 1000,
      exitDuration: 500
    }
  ];
  
  // Define transitions between scenes
  const transitions: SceneTransition[] = [
    // Home to Levels
    {
      from: 'home',
      to: 'levels',
      effect: TransitionEffect.SLIDE,
      direction: TransitionDirection.LEFT_TO_RIGHT,
      duration: 600,
      easing: 'easeInOutCubic',
      depthEffect: SceneDepthEffect.PERSPECTIVE,
      category: AnimationCategory.ACTIVE,
      reducedMotionAlternative: {
        effect: TransitionEffect.FADE,
        duration: 300
      }
    },
    
    // Levels to Home
    {
      from: 'levels',
      to: 'home',
      effect: TransitionEffect.SLIDE,
      direction: TransitionDirection.RIGHT_TO_LEFT,
      duration: 600,
      easing: 'easeInOutCubic',
      depthEffect: SceneDepthEffect.PERSPECTIVE,
      category: AnimationCategory.ACTIVE,
      reducedMotionAlternative: {
        effect: TransitionEffect.FADE,
        duration: 300
      }
    },
    
    // Levels to Game
    {
      from: 'levels',
      to: 'game',
      effect: TransitionEffect.ZOOM,
      direction: TransitionDirection.FROM_CENTER,
      duration: 800,
      easing: 'easeOutCubic',
      depthEffect: SceneDepthEffect.PERSPECTIVE,
      category: AnimationCategory.ACTIVE,
      reducedMotionAlternative: {
        effect: TransitionEffect.FADE,
        duration: 400
      }
    },
    
    // Game to Levels
    {
      from: 'game',
      to: 'levels',
      effect: TransitionEffect.ZOOM,
      direction: TransitionDirection.TO_CENTER,
      duration: 600,
      easing: 'easeInCubic',
      depthEffect: SceneDepthEffect.PERSPECTIVE,
      category: AnimationCategory.ACTIVE,
      reducedMotionAlternative: {
        effect: TransitionEffect.FADE,
        duration: 300
      }
    },
    
    // Home to Settings
    {
      from: 'home',
      to: 'settings',
      effect: TransitionEffect.SLIDE,
      direction: TransitionDirection.BOTTOM_TO_TOP,
      duration: 500,
      easing: 'easeOutBack',
      category: AnimationCategory.ACTIVE,
      reducedMotionAlternative: {
        effect: TransitionEffect.FADE,
        duration: 300
      }
    },
    
    // Settings to Home
    {
      from: 'settings',
      to: 'home',
      effect: TransitionEffect.SLIDE,
      direction: TransitionDirection.TOP_TO_BOTTOM,
      duration: 500,
      easing: 'easeInOutCubic',
      category: AnimationCategory.ACTIVE,
      reducedMotionAlternative: {
        effect: TransitionEffect.FADE,
        duration: 300
      }
    },
    
    // Game to Level Complete
    {
      from: 'game',
      to: 'level-complete',
      effect: TransitionEffect.CROSSFADE,
      duration: 800,
      easing: 'easeOutCubic',
      depthEffect: SceneDepthEffect.FLOATING,
      category: AnimationCategory.ATTENTION,
      reducedMotionAlternative: {
        effect: TransitionEffect.FADE,
        duration: 400
      }
    },
    
    // Level Complete to Levels
    {
      from: 'level-complete',
      to: 'levels',
      effect: TransitionEffect.SLIDE,
      direction: TransitionDirection.TOP_TO_BOTTOM,
      duration: 600,
      easing: 'easeInOutCubic',
      category: AnimationCategory.ACTIVE,
      reducedMotionAlternative: {
        effect: TransitionEffect.FADE,
        duration: 300
      }
    }
  ];
  
  // Initialize scene transition hook
  const sceneTransition = useSceneTransition({
    initialScene: 'home',
    scenes,
    transitions,
    defaultEffect: TransitionEffect.FADE,
    defaultDuration: 500,
    defaultEasing: 'easeInOutCubic',
    handleHistory: true,
    containerRef,
    category: AnimationCategory.ACTIVE,
    debug: true,
    onSceneChangeStart: (fromId, toId) => {
      console.log(`Scene changing from ${fromId} to ${toId}`);
    },
    onSceneChangeComplete: (fromId, toId) => {
      console.log(`Scene changed from ${fromId} to ${toId}`);
    }
  });
  
  // Destructure the hook result
  const { 
    activeScene, 
    isTransitioning, 
    isPaused, 
    progress, 
    actions,
    reducedMotion 
  } = sceneTransition;
  
  // Handle custom transition
  const handleCustomTransition = (targetScene: string) => {
    actions.changeScene(targetScene, {
      effect: selectedEffect as TransitionEffect,
      direction: selectedDirection as TransitionDirection,
      depthEffect: selectedDepthEffect as SceneDepthEffect,
      duration: 800
    });
  };
  
  // Handle level selection
  const selectLevel = (level: number) => {
    setCurrentLevel(level);
    actions.changeScene('game');
  };
  
  // Handle level completion
  const completeLevel = () => {
    if (currentLevel !== null && !completedLevels.includes(currentLevel)) {
      setCompletedLevels([...completedLevels, currentLevel]);
    }
    actions.changeScene('level-complete');
  };
  
  // Generate game elements
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
      <h2>Scene Transition and Level Change Demo</h2>
      
      <p>
        This demo showcases the scene transition system for creating fluid application 
        experiences with smooth transitions between different views or game levels. It 
        demonstrates various transition effects, depth perception techniques, and context
        preservation during navigation.
      </p>
      
      <ControlsBar>
        <ControlRow>
          <Button onClick={() => actions.changeScene('home')}>
            Home
          </Button>
          <Button onClick={() => actions.changeScene('levels')}>
            Levels
          </Button>
          <Button onClick={() => actions.changeScene('settings')}>
            Settings
          </Button>
          
          <div style={{ marginLeft: 'auto' }}>
            <label>
              Reduced Motion: 
              <input 
                type="checkbox" 
                checked={appReducedMotion}
                onChange={() => setAppReducedMotion(!appReducedMotion)}
                style={{ marginLeft: '8px' }}
              />
            </label>
          </div>
        </ControlRow>
        
        <ControlRow>
          <div>
            <FormGroup>
              <Label>Transition Effect:</Label>
              <Select 
                value={selectedEffect} 
                onChange={(e) => setSelectedEffect(e.target.value)}
              >
                {Object.values(TransitionEffect).map(effect => (
                  <option key={effect} value={effect}>{effect}</option>
                ))}
              </Select>
            </FormGroup>
          </div>
          
          <div>
            <FormGroup>
              <Label>Direction:</Label>
              <Select 
                value={selectedDirection} 
                onChange={(e) => setSelectedDirection(e.target.value)}
              >
                {Object.values(TransitionDirection).map(direction => (
                  <option key={direction} value={direction}>{direction}</option>
                ))}
              </Select>
            </FormGroup>
          </div>
          
          <div>
            <FormGroup>
              <Label>Depth Effect:</Label>
              <Select 
                value={selectedDepthEffect} 
                onChange={(e) => setSelectedDepthEffect(e.target.value)}
              >
                {Object.values(SceneDepthEffect).map(effect => (
                  <option key={effect} value={effect}>{effect}</option>
                ))}
              </Select>
            </FormGroup>
          </div>
          
          <Button 
            onClick={() => handleCustomTransition('home')}
            disabled={isTransitioning}
          >
            Apply Custom Transition
          </Button>
        </ControlRow>
        
        <ControlRow>
          <Label>Transition Progress:</Label>
          <ProgressBarContainer>
            <ProgressBar $progress={progress} />
          </ProgressBarContainer>
          
          <Button 
            onClick={actions.pauseTransition}
            disabled={!isTransitioning || isPaused}
          >
            Pause
          </Button>
          <Button 
            onClick={actions.resumeTransition}
            disabled={!isTransitioning || !isPaused}
          >
            Resume
          </Button>
          <Button 
            onClick={actions.completeTransition}
            disabled={!isTransitioning}
          >
            Complete
          </Button>
          <Button 
            onClick={actions.cancelTransition}
            disabled={!isTransitioning}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={actions.back}
            disabled={isTransitioning}
          >
            Back
          </Button>
          <Button 
            onClick={actions.forward}
            disabled={isTransitioning}
          >
            Forward
          </Button>
        </ControlRow>
      </ControlsBar>
      
      <SceneContainer ref={containerRef}>
        {isTransitioning && (
          <StatusText>
            Transitioning: {(parseFloat(progress.toFixed(2)) * 100).toFixed(0)}%
          </StatusText>
        )}
        
        {/* Home Scene */}
        <HomeScene className="home-scene">
          <BackgroundElement className="home-background">
            <FloatingElements>
              {floatingElements.map(el => (
                <FloatingElement
                  key={el.id}
                  $size={el.size}
                  $x={el.x}
                  $y={el.y}
                  $delay={el.delay}
                />
              ))}
            </FloatingElements>
          </BackgroundElement>
          
          <InteractiveElement>
            <Title className="home-element">Galileo Glass</Title>
            <Subtitle className="home-element">Scene Transition System</Subtitle>
            
            <InfoText className="home-element">
              Experience smooth transitions between application scenes with depth effects,
              customizable animations, and context preservation.
            </InfoText>
            
            <ButtonContainer className="home-element">
              <Button onClick={() => actions.changeScene('levels')}>
                Play Game
              </Button>
              <Button onClick={() => actions.changeScene('settings')}>
                Settings
              </Button>
            </ButtonContainer>
          </InteractiveElement>
        </HomeScene>
        
        {/* Levels Scene */}
        <LevelScene className="levels-scene">
          <BackgroundElement className="levels-background">
            <FloatingElements>
              {floatingElements.map(el => (
                <FloatingElement
                  key={el.id}
                  $size={el.size}
                  $x={el.x}
                  $y={el.y}
                  $delay={el.delay}
                />
              ))}
            </FloatingElements>
          </BackgroundElement>
          
          <InteractiveElement>
            <Title className="levels-element">Select Level</Title>
            
            <LevelGrid className="levels-element">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                <LevelButton
                  key={level}
                  $completed={completedLevels.includes(level)}
                  onClick={() => selectLevel(level)}
                  disabled={level > 3 && !completedLevels.includes(level - 3)}
                >
                  {level}
                </LevelButton>
              ))}
            </LevelGrid>
            
            <ButtonContainer className="levels-element">
              <Button onClick={() => actions.changeScene('home')}>
                Back to Home
              </Button>
            </ButtonContainer>
          </InteractiveElement>
        </LevelScene>
        
        {/* Game Scene */}
        <GameScene className="game-scene">
          <BackgroundElement className="game-background">
            <FloatingElements>
              {floatingElements.map(el => (
                <FloatingElement
                  key={el.id}
                  $size={el.size}
                  $x={el.x}
                  $y={el.y}
                  $delay={el.delay}
                />
              ))}
            </FloatingElements>
          </BackgroundElement>
          
          <InteractiveElement>
            <Title className="game-element">
              {currentLevel !== null ? `Level ${currentLevel}` : 'Game'}
            </Title>
            
            <GameGrid className="game-element">
              {renderGameElements()}
            </GameGrid>
            
            <ButtonContainer className="game-element">
              <Button onClick={completeLevel}>
                Complete Level
              </Button>
              <Button onClick={() => actions.changeScene('levels')}>
                Exit to Level Select
              </Button>
            </ButtonContainer>
          </InteractiveElement>
        </GameScene>
        
        {/* Settings Scene */}
        <SettingsScene className="settings-scene">
          <BackgroundElement className="settings-background">
            <FloatingElements>
              {floatingElements.map(el => (
                <FloatingElement
                  key={el.id}
                  $size={el.size}
                  $x={el.x}
                  $y={el.y}
                  $delay={el.delay}
                />
              ))}
            </FloatingElements>
          </BackgroundElement>
          
          <InteractiveElement>
            <Title className="settings-element">Settings</Title>
            
            <div className="settings-element" style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              padding: '20px', 
              borderRadius: '10px',
              backdropFilter: 'blur(10px)',
              width: '70%',
              maxWidth: '400px'
            }}>
              <FormGroup>
                <Label style={{ color: 'white' }}>Difficulty</Label>
                <Select>
                  <option>Easy</option>
                  <option>Normal</option>
                  <option>Hard</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label style={{ color: 'white' }}>Animation Speed</Label>
                <Select>
                  <option>Slow</option>
                  <option>Normal</option>
                  <option>Fast</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label style={{ color: 'white' }}>Reduced Motion</Label>
                <input 
                  type="checkbox" 
                  checked={appReducedMotion}
                  onChange={() => setAppReducedMotion(!appReducedMotion)}
                  style={{ marginLeft: '8px' }}
                />
              </FormGroup>
            </div>
            
            <ButtonContainer className="settings-element">
              <Button onClick={() => actions.changeScene('home')}>
                Save & Return
              </Button>
            </ButtonContainer>
          </InteractiveElement>
        </SettingsScene>
        
        {/* Level Complete Scene */}
        <LevelCompleteScene className="level-complete-scene">
          <BackgroundElement className="level-complete-background">
            <FloatingElements>
              {floatingElements.map(el => (
                <FloatingElement
                  key={el.id}
                  $size={el.size}
                  $x={el.x}
                  $y={el.y}
                  $delay={el.delay}
                />
              ))}
            </FloatingElements>
          </BackgroundElement>
          
          <InteractiveElement>
            <Title className="level-complete-element">Level Complete!</Title>
            
            <div className="level-complete-element" style={{ fontSize: '24px', marginBottom: '20px' }}>
              {currentLevel !== null && `You completed Level ${currentLevel}`}
            </div>
            
            <ButtonContainer className="level-complete-element">
              {currentLevel !== null && currentLevel < 9 && (
                <Button onClick={() => {
                  const nextLevel = currentLevel + 1;
                  setCurrentLevel(nextLevel);
                  actions.changeScene('game');
                }}>
                  Next Level
                </Button>
              )}
              <Button onClick={() => actions.changeScene('levels')}>
                Level Select
              </Button>
              <Button onClick={() => actions.changeScene('home')}>
                Main Menu
              </Button>
            </ButtonContainer>
          </InteractiveElement>
        </LevelCompleteScene>
      </SceneContainer>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li><strong>Smooth Scene Transitions</strong> - Fluid animations between different application views</li>
          <li><strong>Multiple Transition Effects</strong> - Fade, slide, zoom, crossfade, and more</li>
          <li><strong>3D Depth Effects</strong> - Creates spatial hierarchy with layering and perspective</li>
          <li><strong>Context Preservation</strong> - Maintains state between scene changes</li>
          <li><strong>Transition Controls</strong> - Pause, resume, and cancel transitions in progress</li>
          <li><strong>Accessibility</strong> - Respects reduced motion preferences</li>
          <li><strong>Navigation History</strong> - Backward and forward navigation through scenes</li>
          <li><strong>Customizable Transitions</strong> - Configure transitions dynamically</li>
          <li><strong>Event Callbacks</strong> - Hooks for transition start, progress, and completion</li>
        </ul>
        
        <h3>Use Cases:</h3>
        <ul>
          <li><strong>Game Level Navigation</strong> - Smooth transitions between game levels and menus</li>
          <li><strong>Multi-step Processes</strong> - Wizards, onboarding flows, and guided experiences</li>
          <li><strong>Interactive Applications</strong> - Any app with distinct views or scenes</li>
          <li><strong>Content Showcases</strong> - Presentations, galleries, and storytelling interfaces</li>
          <li><strong>Spatial User Interfaces</strong> - Applications with 3D-like navigation</li>
        </ul>
      </div>
    </DemoContainer>
  );
};

export default SceneTransitionDemo;