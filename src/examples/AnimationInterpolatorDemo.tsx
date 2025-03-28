/**
 * Animation Interpolator Demo
 * 
 * Demonstrates the animation interpolator system with interactive UI for creating
 * smooth transitions between different states.
 */

import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useAnimationInterpolator, StateTransitionOptions } from '../hooks/useAnimationInterpolator';
import { AnimationState } from '../animations/orchestration/AnimationStateMachine';
import { BlendMode } from '../animations/orchestration/AnimationInterpolator';
import { MotionSensitivityLevel } from '../animations/accessibility/MotionSensitivity';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Styled components for demo
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

const InterpolatedElement = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  transition-property: none;
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

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  label {
    flex: 1;
    margin-right: 10px;
  }
  
  input, select {
    flex: 2;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  margin-top: 5px;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress * 100}%;
    background-color: #4287f5;
    transition: width 0.05s linear;
  }
`;

const StatePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const StateProperty = styled.div`
  font-family: monospace;
  font-size: 12px;
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 4px 8px;
`;

// Define animation states
const states: Record<string, AnimationState> = {
  default: {
    id: 'default',
    name: 'Default',
    styles: {
      backgroundColor: '#4287f5',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      opacity: '1',
      transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
    }
  },
  expanded: {
    id: 'expanded',
    name: 'Expanded',
    styles: {
      backgroundColor: '#f542a7',
      width: '180px',
      height: '180px',
      borderRadius: '24px',
      opacity: '1',
      transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      boxShadow: '0 15px 30px rgba(245, 66, 167, 0.3)',
    }
  },
  minimized: {
    id: 'minimized',
    name: 'Minimized',
    styles: {
      backgroundColor: '#42f5b3',
      width: '50px',
      height: '50px',
      borderRadius: '10px',
      opacity: '0.8',
      transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      boxShadow: '0 3px 8px rgba(66, 245, 179, 0.3)',
    }
  },
  upperLeft: {
    id: 'upperLeft',
    name: 'Upper Left',
    styles: {
      backgroundColor: '#f5a742',
      width: '120px',
      height: '120px',
      borderRadius: '20px',
      opacity: '1',
      transform: 'translate(-250%, -250%) scale(1) rotate(0deg)',
      boxShadow: '0 10px 20px rgba(245, 167, 66, 0.3)',
    }
  },
  lowerRight: {
    id: 'lowerRight',
    name: 'Lower Right',
    styles: {
      backgroundColor: '#a342f5',
      width: '120px',
      height: '120px',
      borderRadius: '20px',
      opacity: '1',
      transform: 'translate(150%, 150%) scale(1) rotate(0deg)',
      boxShadow: '0 10px 20px rgba(163, 66, 245, 0.3)',
    }
  },
  rotated: {
    id: 'rotated',
    name: 'Rotated',
    styles: {
      backgroundColor: '#42a9f5',
      width: '150px',
      height: '150px',
      borderRadius: '16px',
      opacity: '1',
      transform: 'translate(-50%, -50%) scale(1) rotate(135deg)',
      boxShadow: '0 10px 20px rgba(66, 169, 245, 0.3)',
    }
  },
  transparent: {
    id: 'transparent',
    name: 'Transparent',
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      width: '200px',
      height: '200px',
      borderRadius: '100px',
      opacity: '0.5',
      transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      boxShadow: '0 15px 30px rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(10px)',
    }
  },
  stretched: {
    id: 'stretched',
    name: 'Stretched',
    styles: {
      backgroundColor: '#f54242',
      width: '250px',
      height: '80px',
      borderRadius: '40px',
      opacity: '1',
      transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
      boxShadow: '0 10px 20px rgba(245, 66, 66, 0.3)',
    }
  }
};

// Easing options
const easingOptions = [
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'linear', label: 'Linear' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'elastic', label: 'Elastic' },
  { value: 'step', label: 'Step' },
];

// Blend mode options
const blendModeOptions = [
  { value: BlendMode.OVERRIDE, label: 'Override' },
  { value: BlendMode.ADD, label: 'Add' },
  { value: BlendMode.MULTIPLY, label: 'Multiply' },
  { value: BlendMode.AVERAGE, label: 'Average' },
  { value: BlendMode.MIN, label: 'Min' },
  { value: BlendMode.MAX, label: 'Max' },
];

/**
 * Animation Interpolator Demo Component
 */
const AnimationInterpolatorDemo: React.FC = () => {
  // Reduced motion check
  const prefersReducedMotion = useReducedMotion();
  
  // Current state tracking
  const [currentStateId, setCurrentStateId] = useState('default');
  
  // Transition options state
  const [transitionOptions, setTransitionOptions] = useState<StateTransitionOptions>({
    duration: 1000,
    easing: 'ease-out',
    delay: 0,
  });
  
  // Blend mode state
  const [blendMode, setBlendMode] = useState<BlendMode>(BlendMode.OVERRIDE);
  
  // Progress tracking for UI
  const [displayProgress, setDisplayProgress] = useState(0);
  
  // Use the interpolator hook
  const {
    transitionTo,
    getCurrentState,
    pause,
    resume,
    cancel,
    isTransitioning,
    progress,
    ref
  } = useAnimationInterpolator(states.default, {
    defaultTransition: {
      duration: prefersReducedMotion ? 100 : 1000,
      easing: 'ease-out',
    },
    blendMode,
    immediate: true,
  });
  
  // Update display progress when progress changes
  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);
  
  // Handle transition to a new state
  const handleTransition = useCallback((stateId: string) => {
    const state = states[stateId];
    if (state) {
      transitionTo(state, {
        ...transitionOptions,
        duration: prefersReducedMotion ? 100 : transitionOptions.duration,
        onUpdate: (p) => setDisplayProgress(p),
      });
      setCurrentStateId(stateId);
    }
  }, [transitionOptions, transitionTo, prefersReducedMotion]);
  
  // Handle transition option changes
  const handleOptionChange = useCallback((option: keyof StateTransitionOptions, value: any) => {
    setTransitionOptions(prev => ({
      ...prev,
      [option]: option === 'duration' || option === 'delay' ? Number(value) : value
    }));
  }, []);
  
  // Handle blend mode change
  const handleBlendModeChange = useCallback((mode: BlendMode) => {
    setBlendMode(mode);
  }, []);
  
  return (
    <DemoContainer>
      <Title>Animation Interpolator System</Title>
      <Description>
        This demo showcases the animation interpolator system for creating smooth transitions
        between different UI states. The system supports various easing functions, blending modes,
        and property-specific interpolation.
      </Description>
      
      <DemoSection>
        <AnimationStage>
          <InterpolatedElement ref={ref}>
            {currentStateId}
          </InterpolatedElement>
        </AnimationStage>
        
        <Controls>
          <ControlSection>
            <ControlTitle>Transition States</ControlTitle>
            <ButtonGrid>
              {Object.entries(states).map(([id, state]) => (
                <Button
                  key={id}
                  $active={currentStateId === id}
                  onClick={() => handleTransition(id)}
                >
                  {state.name}
                </Button>
              ))}
            </ButtonGrid>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Transition Options</ControlTitle>
            <ControlRow>
              <label htmlFor="duration">Duration (ms):</label>
              <input
                id="duration"
                type="number"
                min="50"
                max="5000"
                step="50"
                value={transitionOptions.duration}
                onChange={(e) => handleOptionChange('duration', e.target.value)}
              />
            </ControlRow>
            <ControlRow>
              <label htmlFor="delay">Delay (ms):</label>
              <input
                id="delay"
                type="number"
                min="0"
                max="2000"
                step="50"
                value={transitionOptions.delay}
                onChange={(e) => handleOptionChange('delay', e.target.value)}
              />
            </ControlRow>
            <ControlRow>
              <label htmlFor="easing">Easing:</label>
              <select
                id="easing"
                value={transitionOptions.easing}
                onChange={(e) => handleOptionChange('easing', e.target.value)}
              >
                {easingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </ControlRow>
            <ControlRow>
              <label htmlFor="blendMode">Blend Mode:</label>
              <select
                id="blendMode"
                value={blendMode}
                onChange={(e) => handleBlendModeChange(e.target.value as BlendMode)}
              >
                {blendModeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </ControlRow>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Animation Controls</ControlTitle>
            <ButtonGrid>
              <Button onClick={() => pause()} disabled={!isTransitioning}>
                Pause
              </Button>
              <Button onClick={() => resume()} disabled={isTransitioning || progress === 0}>
                Resume
              </Button>
              <Button onClick={() => cancel()} disabled={!isTransitioning && progress === 0}>
                Cancel
              </Button>
            </ButtonGrid>
            <div>
              <div>Progress: {Math.round(displayProgress * 100)}%</div>
              <ProgressBar $progress={displayProgress} />
            </div>
          </ControlSection>
          
          <ControlSection>
            <ControlTitle>Current State Properties</ControlTitle>
            <StatePreview>
              {getCurrentState()?.styles && 
                Object.entries(getCurrentState()?.styles || {}).map(([key, value]) => (
                  <StateProperty key={key}>
                    {key}: {value.toString().substring(0, 25)}
                    {value.toString().length > 25 ? '...' : ''}
                  </StateProperty>
                ))
              }
            </StatePreview>
          </ControlSection>
        </Controls>
      </DemoSection>
    </DemoContainer>
  );
};

export default AnimationInterpolatorDemo;