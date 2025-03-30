/**
 * SpriteAnimationDemo.tsx
 * 
 * Demo component showcasing the sprite animation system for the
 * Galileo Glass UI animation framework.
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  useSpriteAnimation,
  PlaybackMode,
  SpriteAnimation,
  Spritesheet
} from '../animations/physics/useSpriteAnimation';
import { useReducedMotion } from '../animations/accessibility/useReducedMotion';

// Animation container
const AnimationContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

// Animation display area
const AnimationDisplay = styled.div`
  position: relative;
  width: 100%;
  min-height: 400px;
  margin: 20px 0;
  background-color: #f5f8ff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Sprite view
const SpriteView = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  overflow: hidden;
`;

// Controls container
const ControlsContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: #f0f5ff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

// Control row
const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
`;

// Button
const Button = styled.button`
  background: #3a5bd9;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #2a4bc8;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
    transform: none;
  }
`;

// Select
const Select = styled.select`
  padding: 8px 12px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  margin-left: 8px;
`;

// Label
const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  margin-right: 8px;
`;

// Slider container
const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 8px;
`;

// Frame display
const FrameDisplay = styled.div`
  background: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  margin-left: auto;
`;

// Frame bar
const FrameBar = styled.div`
  width: 100%;
  height: 30px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin: 10px 0;
  position: relative;
  overflow: hidden;
`;

// Frame progress
const FrameProgress = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${props => props.$progress * 100}%;
  background: rgba(58, 91, 217, 0.3);
  transition: width 0.1s ease;
`;

// Animation item
const AnimationItem = styled.div<{ $active: boolean }>`
  padding: 10px;
  margin: 5px 0;
  border-radius: 4px;
  background: ${props => props.$active ? 'rgba(58, 91, 217, 0.2)' : 'rgba(0, 0, 0, 0.05)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? 'rgba(58, 91, 217, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

// Section
const Section = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

// Section title
const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
`;

// Info text
const InfoText = styled.div`
  padding: 15px;
  margin: 15px 0;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
`;

// Column layout
const Columns = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Column
const Column = styled.div`
  flex: 1;
`;

/**
 * Define our sample animations
 */
const sampleAnimations: SpriteAnimation[] = [
  // Walking animation
  {
    id: 'walk',
    name: 'Walking',
    frames: [
      {
        id: 'walk_1',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/4c4d8d4242ad56f1dc8eca1a26fd75c3/sprite-walk-1.png',
        width: 64,
        height: 64,
        duration: 150
      },
      {
        id: 'walk_2',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/b9ffeb2c9c40c8ff0a3f1aa5bb93a94c/sprite-walk-2.png',
        width: 64,
        height: 64,
        duration: 150
      },
      {
        id: 'walk_3',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/2fd3fc6c3bd41c8ba5af5b6ac95c76d2/sprite-walk-3.png',
        width: 64,
        height: 64,
        duration: 150
      },
      {
        id: 'walk_4',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/908e9cff8e0fd9e47aea43c28c16ae17/sprite-walk-4.png',
        width: 64,
        height: 64,
        duration: 150
      }
    ],
    playbackMode: PlaybackMode.LOOP
  },
  
  // Idle animation
  {
    id: 'idle',
    name: 'Idle',
    frames: [
      {
        id: 'idle_1',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/3ba9a4a16b3f6f8c9e1ceb78c8dfbc17/sprite-idle-1.png',
        width: 64,
        height: 64,
        duration: 500
      },
      {
        id: 'idle_2',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/df5fcdb18e91ceff92b4a21f95dbb84b/sprite-idle-2.png',
        width: 64,
        height: 64,
        duration: 500
      }
    ],
    playbackMode: PlaybackMode.LOOP
  },
  
  // Jump animation
  {
    id: 'jump',
    name: 'Jump',
    frames: [
      {
        id: 'jump_1',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/0e4a9f0fe5c61e03c0aa2c7dec9e56df/sprite-jump-1.png',
        width: 64,
        height: 64,
        duration: 200,
        transform: {
          translateY: 0
        }
      },
      {
        id: 'jump_2',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/64064af66ec3fc44ebd4d3e3efcbdd62/sprite-jump-2.png',
        width: 64,
        height: 64,
        duration: 300,
        transform: {
          translateY: -20
        }
      },
      {
        id: 'jump_3',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/b14a6e7fc2b81c43d56b0efe36f5eb9a/sprite-jump-3.png',
        width: 64,
        height: 64,
        duration: 300,
        transform: {
          translateY: -30
        }
      },
      {
        id: 'jump_4',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/9c1cde5b62ccdb4b29bc3c89e2ee9cf1/sprite-jump-4.png',
        width: 64,
        height: 64,
        duration: 200,
        transform: {
          translateY: -10
        }
      },
      {
        id: 'jump_5',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/4c4d8d4242ad56f1dc8eca1a26fd75c3/sprite-walk-1.png',
        width: 64,
        height: 64,
        duration: 100,
        transform: {
          translateY: 0
        }
      }
    ],
    playbackMode: PlaybackMode.ONCE
  },
  
  // Attack animation
  {
    id: 'attack',
    name: 'Attack',
    frames: [
      {
        id: 'attack_1',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/86c98d4f5dfa7d6a5ecad1f8dfcbdade/sprite-attack-1.png',
        width: 64,
        height: 64,
        duration: 100
      },
      {
        id: 'attack_2',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/b8ef9011651de6ae97e52f4c1ded97c1/sprite-attack-2.png',
        width: 64,
        height: 64,
        duration: 100,
        onDisplay: () => console.log('Attack frame 2 - wind up')
      },
      {
        id: 'attack_3',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/8cf6ee93c2b00b67a1b68a97fd1a6fd5/sprite-attack-3.png',
        width: 64,
        height: 64,
        duration: 200,
        onDisplay: () => console.log('Attack frame 3 - impact!')
      },
      {
        id: 'attack_4',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/ab1c9a53de824246e5bbab74b1296d44/sprite-attack-4.png',
        width: 64,
        height: 64,
        duration: 200
      }
    ],
    playbackMode: PlaybackMode.ONCE,
    onComplete: () => console.log('Attack animation completed!')
  },
  
  // Spin animation
  {
    id: 'spin',
    name: 'Spin',
    frames: [
      {
        id: 'spin_1',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/4c4d8d4242ad56f1dc8eca1a26fd75c3/sprite-walk-1.png',
        width: 64,
        height: 64,
        duration: 100,
        transform: {
          rotate: 0
        }
      },
      {
        id: 'spin_2',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/4c4d8d4242ad56f1dc8eca1a26fd75c3/sprite-walk-1.png',
        width: 64,
        height: 64,
        duration: 100,
        transform: {
          rotate: 90
        }
      },
      {
        id: 'spin_3',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/4c4d8d4242ad56f1dc8eca1a26fd75c3/sprite-walk-1.png',
        width: 64,
        height: 64,
        duration: 100,
        transform: {
          rotate: 180
        }
      },
      {
        id: 'spin_4',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/4c4d8d4242ad56f1dc8eca1a26fd75c3/sprite-walk-1.png',
        width: 64,
        height: 64,
        duration: 100,
        transform: {
          rotate: 270
        }
      },
      {
        id: 'spin_5',
        src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/4c4d8d4242ad56f1dc8eca1a26fd75c3/sprite-walk-1.png',
        width: 64,
        height: 64,
        duration: 100,
        transform: {
          rotate: 360
        }
      }
    ],
    playbackMode: PlaybackMode.LOOP
  }
];

// Reduced motion alternative for jump animation
const reducedJumpAnimation: SpriteAnimation = {
  id: 'jump_reduced',
  name: 'Jump (Reduced Motion)',
  frames: [
    {
      id: 'jump_reduced_1',
      src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/0e4a9f0fe5c61e03c0aa2c7dec9e56df/sprite-jump-1.png',
      width: 64,
      height: 64,
      duration: 300
    },
    {
      id: 'jump_reduced_2',
      src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/b14a6e7fc2b81c43d56b0efe36f5eb9a/sprite-jump-3.png',
      width: 64,
      height: 64,
      duration: 300
    },
    {
      id: 'jump_reduced_3',
      src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/4c4d8d4242ad56f1dc8eca1a26fd75c3/sprite-walk-1.png',
      width: 64,
      height: 64,
      duration: 300
    }
  ],
  playbackMode: PlaybackMode.ONCE
};

// Add reduced motion alternative to jump animation
const jumpAnimationWithReducedMotion = {
  ...sampleAnimations[2],
  reducedMotionAlternative: reducedJumpAnimation
};

// Sample spritesheet
const sampleSpritesheet: Spritesheet = {
  src: 'https://image-assets.web-assets.jamfnode.com/7e5S9EDvwkhbVHg4Kd2KVQ/25c5a23bec8fe3f7fc4fe17a70e46281/character-spritesheet.png',
  frameWidth: 64,
  frameHeight: 64,
  framesPerRow: 8,
  frameCount: 32,
  margin: 0,
  padding: 0
};

/**
 * Sprite Animation Demo Component
 */
export const SpriteAnimationDemo: React.FC = () => {
  // Reference to animation container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reduced motion
  const { prefersReducedMotion, setAppReducedMotion } = useReducedMotion();
  
  // Initialize the sprite animation hook
  const [state, actions] = useSpriteAnimation({
    containerRef,
    autoPlay: false,
    preloadFrames: true,
    autoCleanup: true,
    onAnimationStart: (id) => console.log(`Animation started: ${id}`),
    onAnimationComplete: (id) => console.log(`Animation completed: ${id}`),
    onAnimationLoop: (id) => console.log(`Animation looped: ${id}`),
    onFrameChange: (id, frame) => console.log(`Animation ${id} - Frame changed to ${frame}`)
  });
  
  // Animation selections
  const [selectedAnimation, setSelectedAnimation] = useState<string>('idle');
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(PlaybackMode.LOOP);
  const [speed, setSpeed] = useState<number>(1);
  
  // Initialize animations
  useEffect(() => {
    // Register our animations
    const updatedAnimations = [...sampleAnimations];
    // Replace jump animation with one that has reduced motion alternative
    updatedAnimations[2] = jumpAnimationWithReducedMotion;
    
    actions.registerAnimations(updatedAnimations);
    
    // Register the sample spritesheet
    actions.registerSpritesheet('character', sampleSpritesheet);
    
    // Create an animation from the spritesheet
    actions.createFromSpritesheet(
      'run',
      'Running',
      'character',
      {
        startFrame: 8,
        endFrame: 15,
        frameDuration: 100,
        playbackMode: PlaybackMode.LOOP
      }
    );
    
    // Play the default animation
    actions.play('idle');
  }, []);
  
  // Play selected animation
  const handlePlay = () => {
    actions.play(selectedAnimation);
  };
  
  // Change animation speed
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    actions.setSpeed(newSpeed);
  };
  
  // Change playback mode
  const handlePlaybackModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as PlaybackMode;
    setPlaybackMode(mode);
    
    // Update current animation with new playback mode
    if (state.currentAnimation) {
      const currentAnim = sampleAnimations.find(a => a.id === state.currentAnimation);
      if (currentAnim) {
        actions.registerAnimation({
          ...currentAnim,
          playbackMode: mode
        });
      }
    }
  };
  
  // Toggle reduced motion
  const toggleReducedMotion = () => {
    setAppReducedMotion(!prefersReducedMotion);
  };
  
  return (
    <AnimationContainer>
      <h2>Sprite Animation Demo</h2>
      
      <InfoText>
        This demo showcases the sprite animation system for the Galileo Glass UI framework.
        It supports frame-based animations, spritesheets, transformations, and events.
        The system also respects reduced motion preferences for accessibility.
      </InfoText>
      
      <Columns>
        <Column>
          <AnimationDisplay>
            <SpriteView ref={containerRef} />
          </AnimationDisplay>
        </Column>
        
        <Column>
          <Section>
            <SectionTitle>Animation Controls</SectionTitle>
            
            <ControlRow>
              <Label>Animation:</Label>
              <Select 
                value={selectedAnimation} 
                onChange={(e) => setSelectedAnimation(e.target.value)}
              >
                <option value="idle">Idle</option>
                <option value="walk">Walking</option>
                <option value="jump">Jump</option>
                <option value="attack">Attack</option>
                <option value="spin">Spin</option>
                <option value="run">Run (Spritesheet)</option>
              </Select>
              
              <Button onClick={handlePlay}>
                Play
              </Button>
            </ControlRow>
            
            <ControlRow>
              <Button onClick={actions.stop} disabled={!state.isPlaying}>
                Stop
              </Button>
              
              <Button onClick={actions.pause} disabled={!state.isPlaying || state.isPaused}>
                Pause
              </Button>
              
              <Button onClick={actions.resume} disabled={!state.isPaused}>
                Resume
              </Button>
            </ControlRow>
            
            <ControlRow>
              <Label>Playback Mode:</Label>
              <Select 
                value={playbackMode} 
                onChange={handlePlaybackModeChange}
              >
                <option value={PlaybackMode.ONCE}>Once</option>
                <option value={PlaybackMode.LOOP}>Loop</option>
                <option value={PlaybackMode.PING_PONG}>Ping Pong</option>
                <option value={PlaybackMode.HOLD}>Hold</option>
              </Select>
            </ControlRow>
            
            <ControlRow>
              <Label>Speed: {speed.toFixed(1)}x</Label>
              <SliderContainer>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={handleSpeedChange}
                  style={{ width: '150px' }}
                />
              </SliderContainer>
            </ControlRow>
            
            <ControlRow>
              <Label>Reduced Motion:</Label>
              <input 
                type="checkbox" 
                checked={prefersReducedMotion}
                onChange={toggleReducedMotion}
              />
              <Label style={{ marginLeft: '10px' }}>
                {prefersReducedMotion ? 'Enabled' : 'Disabled'}
              </Label>
            </ControlRow>
            
            <ControlRow>
              <Label>Current Frame:</Label>
              <FrameDisplay>
                {state.currentFrame + 1} / {state.totalFrames}
              </FrameDisplay>
            </ControlRow>
            
            <FrameBar>
              <FrameProgress 
                $progress={state.totalFrames > 0 ? (state.currentFrame + 1) / state.totalFrames : 0} 
              />
            </FrameBar>
          </Section>
          
          <Section>
            <SectionTitle>Animation Library</SectionTitle>
            
            {sampleAnimations.map((animation) => (
              <AnimationItem 
                key={animation.id}
                $active={state.currentAnimation === animation.id}
                onClick={() => {
                  setSelectedAnimation(animation.id);
                  actions.play(animation.id);
                }}
              >
                <div><strong>{animation.name}</strong></div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {animation.frames.length} frames • {animation.playbackMode} mode
                </div>
              </AnimationItem>
            ))}
            
            <AnimationItem 
              $active={state.currentAnimation === 'run'}
              onClick={() => {
                setSelectedAnimation('run');
                actions.play('run');
              }}
            >
              <div><strong>Running (Spritesheet)</strong></div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                8 frames • {PlaybackMode.LOOP} mode
              </div>
            </AnimationItem>
          </Section>
        </Column>
      </Columns>
      
      <InfoText>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li><strong>Frame-based Animations</strong> - Sequences of images with timing controls</li>
          <li><strong>Spritesheet Support</strong> - Efficient rendering from packed image sheets</li>
          <li><strong>Transformation Effects</strong> - Scale, rotate, and translate individual frames</li>
          <li><strong>Accessibility</strong> - Reduced motion alternatives for animations</li>
          <li><strong>Playback Controls</strong> - Play, pause, resume, and control animation speed</li>
          <li><strong>Animation Events</strong> - Callbacks for animation start, complete, and frame changes</li>
          <li><strong>Multiple Animation Types</strong> - Once, loop, ping-pong, and hold playback modes</li>
        </ul>
        
        <h3>Common Use Cases:</h3>
        <ul>
          <li><strong>Character Animations</strong> - Walking, running, attacking in game interfaces</li>
          <li><strong>UI Feedback</strong> - Animated buttons, loading indicators, and progress visualizations</li>
          <li><strong>Visual Effects</strong> - Explosions, sparkles, and ambient animations</li>
          <li><strong>State Transitions</strong> - Animated indicators for different application states</li>
          <li><strong>Interactive Elements</strong> - Educational and game elements with user interaction</li>
        </ul>
      </InfoText>
    </AnimationContainer>
  );
};

export default SpriteAnimationDemo;