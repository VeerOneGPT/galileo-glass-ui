/**
 * VestibularFallbacksDemo.tsx
 * 
 * Demonstrates the vestibular fallbacks that provide alternative feedback
 * mechanisms for users with vestibular disorders who need to disable animations.
 */

import React, { useState, useCallback, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { 
  useVestibularFallback, 
  vestibularFallback,
  FeedbackType, 
  StateChangeType, 
  ImportanceLevel,
  setVestibularFallbackPreferences,
  getVestibularFallbackPreferences,
  resetVestibularFallbackPreferences
} from '../animations/accessibility/VestibularFallbacks';
import { useReducedMotion } from '../animations/accessibility/useReducedMotion';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';

// Animation keyframes
const slideIn = keyframes`
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

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

// Control row
const ControlRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
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

// Toggle switch container
const ToggleContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

// Toggle switch
const ToggleSwitch = styled.div<{ $checked: boolean }>`
  position: relative;
  width: 40px;
  height: 20px;
  background: ${({ $checked }) => $checked ? '#4CAF50' : '#ccc'};
  border-radius: 20px;
  transition: background 0.3s;
  margin-right: 10px;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $checked }) => $checked ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    transition: left 0.3s;
  }
`;

// Status indicator
const StatusBadge = styled.div<{ $active: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.$active ? '#2ecc71' : '#e74c3c'};
  color: white;
  font-size: 12px;
  margin-left: 8px;
`;

// Example section
const ExampleSection = styled.div`
  margin-bottom: 30px;
`;

// Example grid
const ExampleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 15px;
`;

// Example card base
const CardBase = styled.div`
  padding: 15px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;
`;

// Card title
const CardTitle = styled.h4`
  margin: 0 0 10px 0;
`;

// Card demo area
const DemoArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

// Card controls
const CardControls = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: space-between;
`;

// Card with regular animation
const AnimatedCard = styled(CardBase)<{ $animationType: string }>`
  .demo-element {
    width: 100px;
    height: 100px;
    background: #3498db;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
    
    ${props => {
      switch(props.$animationType) {
        case 'pulse':
          return css`animation-name: ${pulse}; animation-timing-function: ease-in-out;`;
        case 'shake':
          return css`animation-name: ${shake}; animation-timing-function: ease-in-out;`;
        case 'spin':
          return css`animation-name: ${spin}; animation-timing-function: linear;`;
        case 'bounce':
          return css`animation-name: ${bounce}; animation-timing-function: ease;`;
        case 'slide':
          return css`animation-name: ${slideIn}; animation-timing-function: ease-out; animation-iteration-count: 1;`;
        default:
          return '';
      }
    }}
  }
`;

// Card with vestibular fallback
const FallbackCard = styled(CardBase)`
  .demo-element {
    width: 100px;
    height: 100px;
    background: #3498db;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    
    &.color-fallback {
      ${vestibularFallback({
        stateChangeType: StateChangeType.TOGGLE,
        preferredFallbacks: [FeedbackType.COLOR],
        color: '#e74c3c',
        duration: 1000
      })}
    }
    
    &.border-fallback {
      ${vestibularFallback({
        stateChangeType: StateChangeType.SELECT,
        preferredFallbacks: [FeedbackType.BORDER],
        color: '#f39c12',
        duration: 0
      })}
    }
    
    &.icon-fallback::before {
      content: attr(data-icon);
      margin-right: 5px;
    }
    
    &.shadow-fallback {
      ${vestibularFallback({
        stateChangeType: StateChangeType.FOCUS,
        preferredFallbacks: [FeedbackType.SHADOW],
        color: 'rgba(0, 0, 0, 0.5)',
        duration: 0
      })}
    }
    
    &.opacity-fallback {
      ${vestibularFallback({
        stateChangeType: StateChangeType.APPEAR,
        preferredFallbacks: [FeedbackType.OPACITY],
        duration: 0
      })}
    }
  }
`;

// Interaction Card with Dynamic Fallback
const InteractionCard: React.FC<{
  title: string;
  stateChangeType: StateChangeType;
  importance: ImportanceLevel;
  fallbackTypes: FeedbackType[];
  children: React.ReactNode;
}> = ({ title, stateChangeType, importance, fallbackTypes, children }) => {
  // State for interaction state
  const [isActive, setIsActive] = useState(false);
  
  // Get fallback styles and behavior
  const fallback = useVestibularFallback({
    stateChangeType,
    importance,
    preferredFallbacks: fallbackTypes,
    duration: stateChangeType === StateChangeType.TOGGLE ? 1500 : 0,
    message: `${title} ${isActive ? 'activated' : 'deactivated'}`
  });
  
  // Toggle active state
  const handleToggle = useCallback(() => {
    setIsActive(!isActive);
    fallback.applyFallback();
  }, [isActive, fallback]);
  
  // Apply fallback on mount if needed
  useEffect(() => {
    if (isActive && fallback.isActive) {
      fallback.applyFallback();
    }
  }, [isActive, fallback]);
  
  return (
    <CardBase>
      <CardTitle>{title}</CardTitle>
      
      <DemoArea>
        <div 
          className="demo-element"
          style={{
            width: '100px',
            height: '100px',
            background: isActive ? '#e74c3c' : '#3498db',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            transition: 'background-color 0.3s',
            ...(fallback.isActive && isActive && { 
              // Apply dynamic fallback styles if active
              background: '#e74c3c' 
            })
          }}
          {...fallback.props}
          onClick={handleToggle}
        >
          {fallback.props['data-icon'] && <span style={{ marginRight: '5px' }}>{fallback.props['data-icon']}</span>}
          {children}
        </div>
      </DemoArea>
      
      <CardControls>
        <Button onClick={handleToggle}>
          {isActive ? 'Deactivate' : 'Activate'}
        </Button>
        
        <StatusBadge $active={isActive}>
          {isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      </CardControls>
    </CardBase>
  );
};

// Main demo component
export const VestibularFallbacksDemo: React.FC = () => {
  // Get reduced motion preferences
  const { 
    prefersReducedMotion, 
    setAppReducedMotion, 
    appReducedMotion,
    isAnimationAllowed 
  } = useReducedMotion();
  
  // State for preferences
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [visualEnabled, setVisualEnabled] = useState(true);
  
  // Load preferences on mount
  useEffect(() => {
    const prefs = getVestibularFallbackPreferences();
    setAudioEnabled(prefs.audioEnabled);
    setHapticEnabled(prefs.hapticEnabled);
    setVisualEnabled(prefs.visualEnabled);
  }, []);
  
  // Update preferences when they change
  useEffect(() => {
    setVestibularFallbackPreferences({
      audioEnabled,
      hapticEnabled,
      visualEnabled
    });
  }, [audioEnabled, hapticEnabled, visualEnabled]);
  
  // Reset all preferences
  const handleResetPreferences = useCallback(() => {
    resetVestibularFallbackPreferences();
    const prefs = getVestibularFallbackPreferences();
    setAudioEnabled(prefs.audioEnabled);
    setHapticEnabled(prefs.hapticEnabled);
    setVisualEnabled(prefs.visualEnabled);
  }, []);
  
  return (
    <DemoContainer>
      <h2>Vestibular Fallbacks Demo</h2>
      <p>
        This demo shows alternative feedback mechanisms for users with vestibular 
        disorders who need to disable animations. These fallbacks ensure critical 
        state changes remain perceivable without motion.
      </p>
      
      <ControlsSection>
        <h3>Motion and Feedback Controls</h3>
        
        <ControlRow>
          <ToggleContainer>
            <ToggleSwitch 
              $checked={appReducedMotion}
              onClick={() => setAppReducedMotion(!appReducedMotion)}
            />
            <span>Reduced Motion</span>
            <StatusBadge $active={prefersReducedMotion}>
              {prefersReducedMotion ? 'Enabled' : 'Disabled'}
            </StatusBadge>
          </ToggleContainer>
          
          <ToggleContainer>
            <ToggleSwitch 
              $checked={visualEnabled}
              onClick={() => setVisualEnabled(!visualEnabled)}
            />
            <span>Visual Fallbacks</span>
          </ToggleContainer>
          
          <ToggleContainer>
            <ToggleSwitch 
              $checked={audioEnabled}
              onClick={() => setAudioEnabled(!audioEnabled)}
            />
            <span>Audio Fallbacks</span>
          </ToggleContainer>
          
          <ToggleContainer>
            <ToggleSwitch 
              $checked={hapticEnabled}
              onClick={() => setHapticEnabled(!hapticEnabled)}
            />
            <span>Haptic Fallbacks</span>
          </ToggleContainer>
          
          <Button onClick={handleResetPreferences}>
            Reset Preferences
          </Button>
        </ControlRow>
        
        <div>
          <p>
            <strong>Current State:</strong> When reduced motion is {prefersReducedMotion ? 'enabled' : 'disabled'},
            animations will {prefersReducedMotion ? 'be replaced with alternative feedback' : 'function normally'}.
          </p>
          <p>
            <small>Toggle "Reduced Motion" above to see how the examples below change.</small>
          </p>
        </div>
      </ControlsSection>
      
      <ExampleSection>
        <h3>Comparison: Animations vs. Fallbacks</h3>
        <p>
          These examples show standard animations on the left, and what users with 
          vestibular disorders would see with fallbacks on the right.
        </p>
        
        <ExampleGrid>
          <AnimatedCard $animationType="pulse">
            <CardTitle>Pulse Animation</CardTitle>
            <DemoArea>
              <div className="demo-element">
                Pulse
              </div>
            </DemoArea>
            <CardControls>
              <StatusBadge $active={isAnimationAllowed(AnimationCategory.ATTENTION)}>
                Animation {isAnimationAllowed(AnimationCategory.ATTENTION) ? 'Enabled' : 'Disabled'}
              </StatusBadge>
            </CardControls>
          </AnimatedCard>
          
          <FallbackCard>
            <CardTitle>Color Fallback</CardTitle>
            <DemoArea>
              <div className="demo-element color-fallback">
                No Motion
              </div>
            </DemoArea>
            <CardControls>
              <StatusBadge $active={true}>
                Fallback {prefersReducedMotion ? 'Active' : 'Inactive'}
              </StatusBadge>
            </CardControls>
          </FallbackCard>
          
          <AnimatedCard $animationType="shake">
            <CardTitle>Shake Animation</CardTitle>
            <DemoArea>
              <div className="demo-element">
                Shake
              </div>
            </DemoArea>
            <CardControls>
              <StatusBadge $active={isAnimationAllowed(AnimationCategory.ATTENTION)}>
                Animation {isAnimationAllowed(AnimationCategory.ATTENTION) ? 'Enabled' : 'Disabled'}
              </StatusBadge>
            </CardControls>
          </AnimatedCard>
          
          <FallbackCard>
            <CardTitle>Border Fallback</CardTitle>
            <DemoArea>
              <div className="demo-element border-fallback">
                No Motion
              </div>
            </DemoArea>
            <CardControls>
              <StatusBadge $active={true}>
                Fallback {prefersReducedMotion ? 'Active' : 'Inactive'}
              </StatusBadge>
            </CardControls>
          </FallbackCard>
          
          <AnimatedCard $animationType="spin">
            <CardTitle>Spin Animation</CardTitle>
            <DemoArea>
              <div className="demo-element">
                Spin
              </div>
            </DemoArea>
            <CardControls>
              <StatusBadge $active={isAnimationAllowed(AnimationCategory.ATTENTION)}>
                Animation {isAnimationAllowed(AnimationCategory.ATTENTION) ? 'Enabled' : 'Disabled'}
              </StatusBadge>
            </CardControls>
          </AnimatedCard>
          
          <FallbackCard>
            <CardTitle>Icon Fallback</CardTitle>
            <DemoArea>
              <div 
                className="demo-element icon-fallback" 
                data-icon="🔄"
              >
                No Motion
              </div>
            </DemoArea>
            <CardControls>
              <StatusBadge $active={true}>
                Fallback {prefersReducedMotion ? 'Active' : 'Inactive'}
              </StatusBadge>
            </CardControls>
          </FallbackCard>
        </ExampleGrid>
      </ExampleSection>
      
      <ExampleSection>
        <h3>Interactive State Changes</h3>
        <p>
          Try activating these elements to see how state changes are communicated
          without animations for users with vestibular disorders.
        </p>
        
        <ExampleGrid>
          <InteractionCard
            title="Toggle Element"
            stateChangeType={StateChangeType.TOGGLE}
            importance={ImportanceLevel.IMPORTANT}
            fallbackTypes={[FeedbackType.COLOR, FeedbackType.ICON, FeedbackType.ARIA]}
          >
            Toggle
          </InteractionCard>
          
          <InteractionCard
            title="Selection Element"
            stateChangeType={StateChangeType.SELECT}
            importance={ImportanceLevel.IMPORTANT}
            fallbackTypes={[FeedbackType.BORDER, FeedbackType.ARIA, FeedbackType.SOUND]}
          >
            Select
          </InteractionCard>
          
          <InteractionCard
            title="Error State"
            stateChangeType={StateChangeType.ERROR}
            importance={ImportanceLevel.CRITICAL}
            fallbackTypes={[FeedbackType.COLOR, FeedbackType.ICON, FeedbackType.SOUND, FeedbackType.HAPTIC]}
          >
            Error
          </InteractionCard>
          
          <InteractionCard
            title="Success State"
            stateChangeType={StateChangeType.SUCCESS}
            importance={ImportanceLevel.IMPORTANT}
            fallbackTypes={[FeedbackType.COLOR, FeedbackType.ICON, FeedbackType.ARIA]}
          >
            Success
          </InteractionCard>
        </ExampleGrid>
      </ExampleSection>
      
      <ExampleSection>
        <h3>Accessibility Benefits</h3>
        <p>
          Vestibular fallbacks provide several accessibility benefits:
        </p>
        <ul>
          <li>Provide alternatives to motion for users with vestibular disorders</li>
          <li>Ensure critical state changes remain perceivable without animation</li>
          <li>Offer multiple feedback channels (visual, auditory, haptic)</li>
          <li>Maintain the usability of interactive elements when animations are disabled</li>
          <li>Support WCAG compliance for accessible animations</li>
        </ul>
        <p>
          By implementing these fallbacks, you ensure your application remains
          fully usable for all users, regardless of their animation preferences.
        </p>
      </ExampleSection>
    </DemoContainer>
  );
};

export default VestibularFallbacksDemo;