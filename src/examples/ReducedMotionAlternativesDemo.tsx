/**
 * Reduced Motion Alternatives Demo
 * 
 * Demonstrates the enhanced useReducedMotion hook with configurable alternatives
 */
import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { useReducedMotion } from '../animations/accessibility/useReducedMotion';
import { AnimationCategory, MotionSensitivityLevel, AnimationComplexity } from '../animations/accessibility/MotionSensitivity';
import { AlternativeType } from '../animations/accessibility/ReducedMotionAlternatives';
import { animationPresets } from '../animations/presets';

// Styled components for the demo
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

// Badge styling
const Badge = styled.span<{ $type: 'original' | 'alternative' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 0.5rem;
  color: white;
  background-color: ${props => props.$type === 'original' ? '#4CAF50' : '#FF9800'};
`;

// Toggle switch
const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 0.5rem;
  
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
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
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

// Select styling
const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 0.5rem;
`;

// Settings group styling
const SettingsGroup = styled.div`
  margin-bottom: 1rem;
  
  > div {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  label {
    margin-right: 0.5rem;
    min-width: 180px;
  }
`;

// Animation examples area
const AnimationBox = styled.div<{
  $animate: boolean;
  $animation: any;
  $duration: number;
}>`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background-color: rgba(63, 81, 181, 0.3);
  color: white;
  font-weight: 500;
  
  ${props => props.$animate && css`
    animation: ${props.$animation} ${props.$duration}ms ease forwards;
  `}
`;

// Status indicator
const StatusIndicator = styled.div<{ $enabled: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: ${props => props.$enabled ? '#4CAF50' : '#F44336'};
`;

// Define some animations for demo
const slideInAnimation = keyframes`
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`;

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const scaleAnimation = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const shakeAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
`;

const spinAndScaleAnimation = keyframes`
  0% {
    transform: rotate(0deg) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 1;
  }
`;

/**
 * Animation comparison component
 */
const AnimationComparison = ({
  category,
  animationName,
  animation,
  duration = 1000,
  triggerAnimation,
  isAnimating,
  enhanced
}: {
  category: AnimationCategory;
  animationName: string;
  animation: any;
  duration?: number;
  triggerAnimation: () => void;
  isAnimating: boolean;
  enhanced: EnhancedReducedMotionResult;
}) => {
  const {
    isAnimationAllowed,
    getAdjustedDuration,
    getAlternativeForCategory,
    getDistanceScale
  } = enhanced;
  
  const isEnabled = isAnimationAllowed(category);
  const alternativeType = getAlternativeForCategory(category);
  const adjustedDuration = getAdjustedDuration(duration, category);
  const distanceScale = getDistanceScale(category).toFixed(2);
  
  return (
    <Card>
      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{animationName}</strong>
          <div>
            <Badge $type={isEnabled ? 'original' : 'alternative'}>
              {isEnabled ? 'Original' : alternativeType}
            </Badge>
          </div>
        </div>
        <Button onClick={triggerAnimation}>Play</Button>
      </div>
      
      <AnimationBox
        $animate={isAnimating}
        $animation={animation}
        $duration={adjustedDuration}
      >
        {category}
      </AnimationBox>
      
      <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        <div>Duration: {adjustedDuration}ms</div>
        <div>Distance Scale: {distanceScale}</div>
        <div>Category: {category}</div>
      </div>
    </Card>
  );
};

// Type definition for the enhanced hook result
type EnhancedReducedMotionResult = ReturnType<typeof useReducedMotion>;

/**
 * Reduced Motion Alternatives Demo
 */
const ReducedMotionAlternativesDemo: React.FC = () => {
  // Use our enhanced hook
  const enhanced = useReducedMotion({
    defaultSensitivity: MotionSensitivityLevel.MEDIUM,
    useGranularControl: true
  });
  
  // Destructure some values for convenience
  const {
    systemReducedMotion,
    appReducedMotion,
    prefersReducedMotion,
    motionSensitivity,
    sensitivityConfig,
    preferredAlternativeType,
    setAppReducedMotion,
    setMotionSensitivity,
    setPreferredAlternativeType,
    resetPreferences
  } = enhanced;
  
  // Track animation state for each category
  const [animatingCategory, setAnimatingCategory] = useState<AnimationCategory | null>(null);
  
  // Play animation for a category
  const playAnimation = (category: AnimationCategory) => {
    setAnimatingCategory(category);
    
    // Reset after animation completes
    setTimeout(() => {
      setAnimatingCategory(null);
    }, enhanced.getAdjustedDuration(1500, category));
  };
  
  // Update preferences
  const updateMotionSensitivity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMotionSensitivity(e.target.value as MotionSensitivityLevel);
  };
  
  const updateAlternativeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferredAlternativeType(e.target.value as AlternativeType);
  };
  
  // Animation category info for demo
  const categories = [
    { name: 'Entrance', value: AnimationCategory.ENTRANCE, animation: slideInAnimation },
    { name: 'Exit', value: AnimationCategory.EXIT, animation: slideInAnimation },
    { name: 'Attention', value: AnimationCategory.ATTENTION, animation: bounceAnimation },
    { name: 'Loading', value: AnimationCategory.LOADING, animation: rotateAnimation },
    { name: 'Hover', value: AnimationCategory.HOVER, animation: scaleAnimation },
    { name: 'Focus', value: AnimationCategory.FOCUS, animation: scaleAnimation },
    { name: 'Active', value: AnimationCategory.ACTIVE, animation: scaleAnimation },
    { name: 'Background', value: AnimationCategory.BACKGROUND, animation: spinAndScaleAnimation },
  ];
  
  return (
    <Container>
      <Title>Enhanced Reduced Motion</Title>
      
      <Section>
        <Subtitle>Motion Sensitivity Settings</Subtitle>
        
        <SettingsGroup>
          <div>
            <label>System Preference:</label>
            <StatusIndicator $enabled={systemReducedMotion} />
            {systemReducedMotion ? 'Prefers Reduced Motion' : 'Standard Motion'}
          </div>
          
          <div>
            <label>App Setting:</label>
            <Switch>
              <input
                type="checkbox"
                checked={appReducedMotion}
                onChange={e => setAppReducedMotion(e.target.checked)}
              />
              <span></span>
            </Switch>
            {appReducedMotion ? 'Reduced Motion' : 'Standard Motion'}
          </div>
          
          <div>
            <label>Effective Setting:</label>
            <StatusIndicator $enabled={prefersReducedMotion} />
            <strong>{prefersReducedMotion ? 'Reduced Motion' : 'Standard Motion'}</strong>
          </div>
          
          <div>
            <label>Sensitivity Level:</label>
            <Select value={motionSensitivity} onChange={updateMotionSensitivity}>
              {Object.values(MotionSensitivityLevel).map(level => (
                <option key={level} value={level}>
                  {level
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <label>Alternative Type:</label>
            <Select value={preferredAlternativeType} onChange={updateAlternativeType}>
              {Object.values(AlternativeType).map(type => (
                <option key={type} value={type}>
                  {type
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')}
                </option>
              ))}
            </Select>
          </div>
          
          <div>
            <Button onClick={resetPreferences}>Reset All Preferences</Button>
          </div>
        </SettingsGroup>
        
        <Card>
          <h4>Active Configuration</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>Motion Sensitivity:</div>
            <div>{motionSensitivity}</div>
            
            <div>Speed Multiplier:</div>
            <div>{sensitivityConfig.speedMultiplier.toFixed(2)}x</div>
            
            <div>Distance Scale:</div>
            <div>{sensitivityConfig.distanceScale}</div>
            
            <div>Max Complexity:</div>
            <div>{sensitivityConfig.maxAllowedComplexity}</div>
            
            <div>Using Alternatives:</div>
            <div>{sensitivityConfig.useAlternativeAnimations ? 'Yes' : 'No'}</div>
          </div>
        </Card>
      </Section>
      
      <Section>
        <Subtitle>Animation Categories</Subtitle>
        <p>
          Each animation category has specific settings and alternatives. Click "Play" to see
          the animation with current settings applied.
        </p>
        
        <Row>
          {categories.map(category => (
            <Column key={category.value} $width="25%">
              <AnimationComparison
                category={category.value}
                animationName={category.name}
                animation={category.animation}
                duration={800}
                triggerAnimation={() => playAnimation(category.value)}
                isAnimating={animatingCategory === category.value}
                enhanced={enhanced}
              />
            </Column>
          ))}
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Implementation Details</Subtitle>
        <Card>
          <h4>Using Enhanced Reduced Motion in Components</h4>
          <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '0.9rem' }}>
{`// Using the enhanced hook in a component
import { useReducedMotion } from '../animations/accessibility/useReducedMotion';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';

const MyComponent = () => {
  // Use the enhanced hook with options
  const {
    prefersReducedMotion,
    isAnimationAllowed,
    getAdjustedDuration,
    getAlternativeForCategory,
    getDistanceScale
  } = useReducedMotion({
    defaultSensitivity: MotionSensitivityLevel.MEDIUM,
    useGranularControl: true
  });
  
  // Check if animation is allowed for a specific category
  const shouldAnimateEntrance = isAnimationAllowed(AnimationCategory.ENTRANCE);
  
  // Get adjusted duration for an animation
  const duration = getAdjustedDuration(1000, AnimationCategory.ENTRANCE);
  
  // Get appropriate distance scale
  const distanceScale = getDistanceScale(AnimationCategory.ENTRANCE);
  
  // Use in your component
  return (
    <div
      style={{
        animation: shouldAnimateEntrance
          ? \`\${myAnimation} \${duration}ms ease\`
          : 'none',
        transform: \`translateY(\${20 * distanceScale}px)\`
      }}
    >
      Content with accessibility-aware animation
    </div>
  );
}`}
          </pre>
          
          <h4>Enhanced Features</h4>
          <ul>
            <li><strong>Fine-grained motion control:</strong> Multiple sensitivity levels beyond just on/off</li>
            <li><strong>Category-specific settings:</strong> Different settings for different types of animations</li>
            <li><strong>Custom alternative types:</strong> Choose between different alternative styles</li>
            <li><strong>Persistence:</strong> User preferences are saved in localStorage</li>
            <li><strong>Adjustable parameters:</strong> Duration and distance scaling based on sensitivity</li>
            <li><strong>System synchronization:</strong> Respects both system and app-level settings</li>
          </ul>
        </Card>
      </Section>
    </Container>
  );
};

export default ReducedMotionAlternativesDemo;