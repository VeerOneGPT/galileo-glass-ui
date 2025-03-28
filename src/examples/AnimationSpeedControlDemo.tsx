import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { 
  AnimationSpeedPreference,
  DurationAdjustmentMode
} from '../animations/accessibility/AnimationSpeedController';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';
import { useAnimationSpeed, getSpeedPreferenceLabel } from '../hooks/useAnimationSpeed';
import { presets } from '../animations/presets';
import { useAccessibleAnimation } from '../animations/accessibility/accessibleAnimation';

// Container for the demo
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

// Section styling
const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// Title styling
const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #ffffff;
`;

// Subtitle styling
const Subtitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #e0e0e0;
`;

// Card styling
const Card = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
`;

// Row layout
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
`;

// Column layout
const Column = styled.div<{ $width?: string }>`
  flex: ${props => props.$width || '1'};
  padding: 0.5rem;
`;

// Button styling
const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #3f51b5;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  
  &:hover {
    background-color: #303f9f;
  }
  
  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
  }
`;

// Toggle switch
const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 34px;
    
    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: #2196F3;
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

// Label styling
const Label = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  span {
    margin-left: 0.5rem;
    color: #e0e0e0;
  }
`;

// Form group
const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

// Animation demo box with specified category and duration
const AnimationBox = ({ 
  category, 
  animate, 
  duration, 
  label 
}: { 
  category: AnimationCategory; 
  animate: boolean; 
  duration: number;
  label: string;
}) => {
  // Use accessible animation with the specified category - fix animation usage
  const animation = useAccessibleAnimation(presets.basic.slideUp.keyframes, {
    category: AnimationCategory.ENTRANCE,
    duration: duration.toString() + 'ms',
  });
  
  // Get speed controller to display adjusted duration
  const { adjustDuration } = useAnimationSpeed();
  const adjustedDuration = adjustDuration(duration, AnimationCategory.ENTRANCE);
  
  // Use a simple animation reference
  const animationRef = animate ? `${adjustedDuration}ms ease-out both` : 'none';
  
  return (
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>{label}</div>
      <div
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: 'rgba(63, 81, 181, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          animation: animationRef,
        }}
      >
        {category}
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
        {duration}ms → {adjustedDuration}ms
      </div>
    </div>
  );
};

/**
 * Animation Speed Control Demo Component
 */
const AnimationSpeedControlDemo: React.FC = () => {
  // Get animation speed controller functions
  const { 
    config, 
    setGlobalSpeedPreference, 
    setCategorySpeedPreference,
    resetCategoryPreference,
    resetAllPreferences,
    updateConfig,
    AnimationSpeedPreference,
    DurationAdjustmentMode,
  } = useAnimationSpeed();
  
  // Animation state
  const [animate, setAnimate] = useState(false);
  
  // Play all animations
  const playAnimations = () => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 10);
  };
  
  // Generate options for speed preferences
  const speedPreferenceOptions = Object.values(AnimationSpeedPreference).map(pref => ({
    value: pref,
    label: getSpeedPreferenceLabel(pref),
  }));
  
  // Generate options for duration adjustment modes
  const adjustmentModeOptions = Object.values(DurationAdjustmentMode).map(mode => ({
    value: mode,
    label: mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase(),
  }));
  
  return (
    <Container>
      <Title>Animation Speed Control</Title>
      
      <Section>
        <Subtitle>Global Animation Speed</Subtitle>
        <Row>
          <Column $width="60%">
            <FormGroup>
              <label>
                Global Animation Speed:
                <select 
                  value={config.globalSpeedPreference}
                  onChange={e => setGlobalSpeedPreference(e.target.value as AnimationSpeedPreference)}
                  style={{ margin: '0 0.5rem', padding: '0.25rem' }}
                >
                  {speedPreferenceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </FormGroup>
            
            <FormGroup>
              <label>
                Duration Adjustment Mode:
                <select 
                  value={config.adjustmentMode}
                  onChange={e => updateConfig({ adjustmentMode: e.target.value as DurationAdjustmentMode })}
                  style={{ margin: '0 0.5rem', padding: '0.25rem' }}
                >
                  {adjustmentModeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </FormGroup>
            
            <FormGroup>
              <label>
                Smart Duration Scaling:
                <input 
                  type="checkbox" 
                  checked={config.smartDurationScaling}
                  onChange={e => updateConfig({ smartDurationScaling: e.target.checked })}
                  style={{ margin: '0 0.5rem' }}
                />
                (Apply different scaling to short vs long animations)
              </label>
            </FormGroup>
            
            <FormGroup>
              <Button onClick={resetAllPreferences}>
                Reset to Defaults
              </Button>
            </FormGroup>
          </Column>
          
          <Column $width="40%">
            <Card>
              <h4>Current Settings</h4>
              <ul>
                <li>Global Speed Preference: {getSpeedPreferenceLabel(config.globalSpeedPreference)}</li>
                <li>Adjustment Mode: {config.adjustmentMode}</li>
                <li>Smart Duration Scaling: {config.smartDurationScaling ? 'Enabled' : 'Disabled'}</li>
                <li>Adjust Hover Animations: {config.adjustHoverAnimations ? 'Yes' : 'No'}</li>
                <li>Adjust Focus Animations: {config.adjustFocusAnimations ? 'Yes' : 'No'}</li>
                <li>Adjust Loading Animations: {config.adjustLoadingAnimations ? 'Yes' : 'No'}</li>
              </ul>
            </Card>
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Category-Specific Speed Settings</Subtitle>
        <Row>
          {Object.values(AnimationCategory).map(category => {
            const categoryPreference = config.categoryPreferences?.[category];
            const isUsingGlobal = !categoryPreference;
            
            return (
              <Column key={category} $width="25%">
                <Card>
                  <h4>{category}</h4>
                  <FormGroup>
                    <select 
                      value={categoryPreference || config.globalSpeedPreference}
                      onChange={e => setCategorySpeedPreference(category, e.target.value as AnimationSpeedPreference)}
                      style={{ width: '100%', padding: '0.25rem' }}
                      disabled={isUsingGlobal}
                    >
                      {speedPreferenceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                  
                  <FormGroup>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={!isUsingGlobal}
                        onChange={e => {
                          if (e.target.checked) {
                            setCategorySpeedPreference(category, config.globalSpeedPreference);
                          } else {
                            resetCategoryPreference(category);
                          }
                        }}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Custom setting
                    </label>
                  </FormGroup>
                </Card>
              </Column>
            );
          })}
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Animation Previews</Subtitle>
        <Button onClick={playAnimations}>
          Play All Animations
        </Button>
        
        <Row>
          {/* Short animation */}
          <Column $width="33%">
            <AnimationBox 
              category={AnimationCategory.ENTRANCE} 
              animate={animate} 
              duration={200}
              label="Short Animation (200ms)"
            />
          </Column>
          
          {/* Medium animation */}
          <Column $width="33%">
            <AnimationBox 
              category={AnimationCategory.ENTRANCE} 
              animate={animate} 
              duration={500}
              label="Medium Animation (500ms)"
            />
          </Column>
          
          {/* Long animation */}
          <Column $width="33%">
            <AnimationBox 
              category={AnimationCategory.ENTRANCE} 
              animate={animate} 
              duration={1500}
              label="Long Animation (1500ms)"
            />
          </Column>
        </Row>
        
        <Subtitle style={{ marginTop: '2rem' }}>Different Categories</Subtitle>
        <Row>
          {/* Categories with different speed settings */}
          <Column $width="20%">
            <AnimationBox 
              category={AnimationCategory.ENTRANCE} 
              animate={animate} 
              duration={1000}
              label="Entrance"
            />
          </Column>
          
          <Column $width="20%">
            <AnimationBox 
              category={AnimationCategory.HOVER} 
              animate={animate} 
              duration={1000}
              label="Hover"
            />
          </Column>
          
          <Column $width="20%">
            <AnimationBox 
              category={AnimationCategory.LOADING} 
              animate={animate} 
              duration={1000}
              label="Loading"
            />
          </Column>
          
          <Column $width="20%">
            <AnimationBox 
              category={AnimationCategory.ATTENTION} 
              animate={animate} 
              duration={1000}
              label="Attention"
            />
          </Column>
          
          <Column $width="20%">
            <AnimationBox 
              category={AnimationCategory.BACKGROUND} 
              animate={animate} 
              duration={1000}
              label="Background"
            />
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Implementation Details</Subtitle>
        <Card>
          <h4>How It Works</h4>
          <ul>
            <li>
              <strong>Global and Category-Specific Settings:</strong> Allows users to set global animation speed preferences or override them for specific animation categories.
            </li>
            <li>
              <strong>Smart Duration Scaling:</strong> Applies different scaling factors based on animation duration to maintain natural feel.
            </li>
            <li>
              <strong>Multiple Adjustment Modes:</strong> Supports different ways to adjust durations (multiply, add, min/max, fixed).
            </li>
            <li>
              <strong>Seamless Integration:</strong> Integrates with existing accessible animation system to respect both motion sensitivity and speed preferences.
            </li>
            <li>
              <strong>Persistence:</strong> Settings are saved to localStorage for consistent experience across sessions.
            </li>
          </ul>
          
          <h4>Usage in Code</h4>
          <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Using the hook to adjust animation duration
import { useAnimationSpeed } from '../hooks/useAnimationSpeed';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';

const MyComponent = () => {
  const { adjustDuration } = useAnimationSpeed();
  
  // Get adjusted duration based on user preferences
  const baseDuration = 500;
  const category = AnimationCategory.ENTRANCE;
  const adjustedDuration = adjustDuration(baseDuration, category);
  
  return (
    <div style={{ 
      animation: \`fade \${adjustedDuration}ms ease-in-out\` 
    }}>
      Content with user-preferred animation speed
    </div>
  );
};`}
          </pre>
        </Card>
      </Section>
    </Container>
  );
};

export default AnimationSpeedControlDemo;