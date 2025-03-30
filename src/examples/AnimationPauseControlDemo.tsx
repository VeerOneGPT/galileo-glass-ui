/**
 * AnimationPauseControlDemo.tsx
 * 
 * Demonstrates the use of animation pause controls to improve accessibility
 * for users with vestibular disorders or motion sensitivity.
 */

import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  AnimationPauseControllerProvider,
  useAnimationPauseController,
  useControllableAnimation,
  usePauseableAnimation,
  createGlobalPauseControl,
  installAnimationPauseButton,
  removeAnimationPauseButton,
  removeGlobalPauseControl
} from '../animations/accessibility/AnimationPauseController';

// Demo container
const DemoContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

// Controls section
const ControlsSection = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

// Animation section
const AnimationSection = styled.div`
  margin-bottom: 30px;
`;

// Animation grid
const AnimationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 15px;
`;

// Control panel
const ControlPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  align-items: center;
`;

// Button
const Button = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#3498db' : '#f1f1f1'};
  color: ${props => props.$primary ? 'white' : 'black'};
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: ${props => props.$primary ? 'bold' : 'normal'};
  
  &:hover {
    background: ${props => props.$primary ? '#2980b9' : '#e1e1e1'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Speed control
const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

// Status badge
const StatusBadge = styled.div<{ $active: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.$active ? '#2ecc71' : '#e74c3c'};
  color: white;
  font-size: 12px;
  margin-left: 8px;
`;

// Animation presets
const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

const slideAnimation = keyframes`
  0% { transform: translateX(-50px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const colorShiftAnimation = keyframes`
  0% { background: #3498db; }
  25% { background: #2ecc71; }
  50% { background: #f1c40f; }
  75% { background: #e74c3c; }
  100% { background: #3498db; }
`;

// Animated shapes
const AnimatedShape = styled.div<{ $paused: boolean }>`
  width: 100px;
  height: 100px;
  background: #3498db;
  border-radius: 4px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  animation-play-state: ${props => props.$paused ? 'paused' : 'running'};
`;

const RotatingSquare = styled(AnimatedShape)<{ $paused: boolean }>`
  animation: ${rotateAnimation} 3s linear infinite;
`;

const PulsingCircle = styled(AnimatedShape)<{ $paused: boolean }>`
  animation: ${pulseAnimation} 2s ease-in-out infinite;
  border-radius: 50%;
  background: #e74c3c;
`;

const BouncingBox = styled(AnimatedShape)<{ $paused: boolean }>`
  animation: ${bounceAnimation} 2s ease infinite;
  background: #2ecc71;
`;

const SlidingRectangle = styled(AnimatedShape)<{ $paused: boolean }>`
  animation: ${slideAnimation} 1s ease-out forwards;
  background: #f1c40f;
  width: 150px;
  height: 80px;
`;

const ColorShiftingShape = styled(AnimatedShape)<{ $paused: boolean }>`
  animation: ${colorShiftAnimation} 8s linear infinite;
`;

// Animation info card
const AnimationCard = styled.div`
  padding: 15px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CardTitle = styled.h4`
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardControls = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 10px;
`;

// Global pause control component
const GlobalPauseControl: React.FC = () => {
  const { 
    globalPaused, 
    toggleGlobalPause, 
    globalSpeed, 
    setGlobalSpeed,
    getRegisteredAnimations
  } = useAnimationPauseController();
  
  const animations = getRegisteredAnimations();
  const totalAnimations = animations.length;
  const pausedAnimations = animations.filter(a => a.paused).length;
  
  return (
    <ControlsSection>
      <h3>Global Animation Controls</h3>
      <p>
        These controls affect all animations on the page. Similar controls can be installed
        for users with vestibular disorders or motion sensitivity.
      </p>
      
      <ControlPanel>
        <Button $primary onClick={toggleGlobalPause}>
          {globalPaused ? 'Resume All Animations' : 'Pause All Animations'}
        </Button>
        
        <SpeedControl>
          <label htmlFor="global-speed">Speed:</label>
          <input
            type="range"
            id="global-speed"
            min="0"
            max="1"
            step="0.1"
            value={globalSpeed}
            onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
          />
          <span>{Math.round(globalSpeed * 100)}%</span>
        </SpeedControl>
        
        <div>
          Status: 
          <StatusBadge $active={!globalPaused}>
            {globalPaused ? 'Paused' : 'Playing'}
          </StatusBadge>
        </div>
        
        <div>
          Animations: {totalAnimations} total, {pausedAnimations} paused
        </div>
      </ControlPanel>
    </ControlsSection>
  );
};

// Individual animation with controls
const AnimationWithControls: React.FC<{
  name: string;
  children: React.ReactNode;
  animationRef: React.RefObject<HTMLDivElement>;
  essential?: boolean;
}> = ({ name, children, animationRef, essential = false }) => {
  const animation = usePauseableAnimation(animationRef, { 
    name,
    isEssential: essential,
    canPause: true,
    canAdjustSpeed: true
  });
  
  return (
    <AnimationCard>
      <CardTitle>
        {name}
        {essential && <small>(Essential)</small>}
        <StatusBadge $active={!animation.paused}>
          {animation.paused ? 'Paused' : 'Playing'}
        </StatusBadge>
      </CardTitle>
      
      <div ref={animationRef}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              $paused: animation.paused
            });
          }
          return child;
        })}
      </div>
      
      <CardControls>
        <Button onClick={animation.togglePause}>
          {animation.paused ? 'Play' : 'Pause'}
        </Button>
        <Button onClick={animation.restart}>
          Restart
        </Button>
        
        <SpeedControl>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={animation.speed}
            onChange={(e) => animation.setSpeed(parseFloat(e.target.value))}
          />
          <span>{Math.round(animation.speed * 100)}%</span>
        </SpeedControl>
      </CardControls>
    </AnimationCard>
  );
};

// Installation controls
const InstallationControls: React.FC = () => {
  const [hasButton, setHasButton] = useState(false);
  const [hasControl, setHasControl] = useState(false);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      removeAnimationPauseButton();
      removeGlobalPauseControl();
    };
  }, []);
  
  const handleInstallButton = () => {
    installAnimationPauseButton({
      position: 'bottom-right',
      showLabel: true,
      theme: 'dark',
      onToggle: (paused) => {
        console.log('Animation button toggled:', paused);
      }
    });
    
    setHasButton(true);
  };
  
  const handleUninstallButton = () => {
    removeAnimationPauseButton();
    setHasButton(false);
  };
  
  const handleInstallControl = () => {
    createGlobalPauseControl();
    setHasControl(true);
  };
  
  const handleUninstallControl = () => {
    removeGlobalPauseControl();
    setHasControl(false);
  };
  
  return (
    <ControlsSection>
      <h3>Installation Controls Demo</h3>
      <p>
        These controls demonstrate how to install global animation controls
        that can be used anywhere on the page. These are especially helpful
        for users with vestibular disorders.
      </p>
      
      <ControlPanel>
        <div>
          <h4>Simple Pause Button</h4>
          <div>
            {!hasButton ? (
              <Button $primary onClick={handleInstallButton}>
                Install Pause Button
              </Button>
            ) : (
              <Button onClick={handleUninstallButton}>
                Remove Pause Button
              </Button>
            )}
          </div>
        </div>
        
        <div>
          <h4>Advanced Control Panel</h4>
          <div>
            {!hasControl ? (
              <Button $primary onClick={handleInstallControl}>
                Install Control Panel
              </Button>
            ) : (
              <Button onClick={handleUninstallControl}>
                Remove Control Panel
              </Button>
            )}
          </div>
        </div>
      </ControlPanel>
    </ControlsSection>
  );
};

// Main demo component
export const AnimationPauseControlDemo: React.FC = () => {
  // Refs for animation elements
  const rotatingRef = useRef<HTMLDivElement>(null);
  const pulsingRef = useRef<HTMLDivElement>(null);
  const bouncingRef = useRef<HTMLDivElement>(null);
  const slidingRef = useRef<HTMLDivElement>(null);
  const colorShiftingRef = useRef<HTMLDivElement>(null);
  
  return (
    <AnimationPauseControllerProvider>
      <DemoContainer>
        <h2>Animation Pause Controls Demo</h2>
        <p>
          This demo shows how animation pause controls can improve accessibility
          for users with vestibular disorders or motion sensitivity.
        </p>
        
        <GlobalPauseControl />
        
        <InstallationControls />
        
        <AnimationSection>
          <h3>Controllable Animations</h3>
          <p>
            Each animation below can be individually controlled, but they also
            respond to the global pause state. This allows users to control
            exactly which animations they want to see.
          </p>
          
          <AnimationGrid>
            <AnimationWithControls 
              name="Rotating Square" 
              animationRef={rotatingRef}
            >
              <RotatingSquare $paused={false}>
                Rotate
              </RotatingSquare>
            </AnimationWithControls>
            
            <AnimationWithControls 
              name="Pulsing Circle" 
              animationRef={pulsingRef}
            >
              <PulsingCircle $paused={false}>
                Pulse
              </PulsingCircle>
            </AnimationWithControls>
            
            <AnimationWithControls 
              name="Bouncing Box" 
              animationRef={bouncingRef}
            >
              <BouncingBox $paused={false}>
                Bounce
              </BouncingBox>
            </AnimationWithControls>
            
            <AnimationWithControls 
              name="Sliding Rectangle" 
              animationRef={slidingRef}
            >
              <SlidingRectangle $paused={false}>
                Slide
              </SlidingRectangle>
            </AnimationWithControls>
            
            <AnimationWithControls 
              name="Color Shifting" 
              animationRef={colorShiftingRef}
              essential={true}
            >
              <ColorShiftingShape $paused={false}>
                Colors
              </ColorShiftingShape>
            </AnimationWithControls>
          </AnimationGrid>
        </AnimationSection>
        
        <AnimationSection>
          <h3>Accessibility Benefits</h3>
          <p>
            Animation pause controls provide several accessibility benefits:
          </p>
          <ul>
            <li>Allows users with vestibular disorders to pause animations that may cause discomfort</li>
            <li>Provides control over animation speed for those with cognitive processing concerns</li>
            <li>Respects user preferences for reduced motion</li>
            <li>Allows essential animations to continue while pausing decorative ones</li>
            <li>Improves focus for users with attention disorders</li>
          </ul>
          <p>
            These controls can be integrated into any application to improve accessibility
            and provide a better experience for all users.
          </p>
        </AnimationSection>
      </DemoContainer>
    </AnimationPauseControllerProvider>
  );
};

export default AnimationPauseControlDemo;