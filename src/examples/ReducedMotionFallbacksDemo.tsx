import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { 
  AnimationFallbackType,
  determineAnimationFallback,
  useIntelligentAnimationFallbacks,
  applyAnimationFallback,
  conditionalIntelligentAnimation
} from '../animations/accessibility/IntelligentFallbacks';
import { 
  MotionSensitivityLevel, 
  AnimationComplexity,
  AnimationCategory
} from '../animations/accessibility/MotionSensitivity';
import {
  useEnhancedReducedMotion,
  ReducedMotionDetectionMethod
} from '../hooks/useEnhancedReducedMotion';
import { presets } from '../animations/presets';

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

// Badge styling
const Badge = styled.span<{ $type: 'info' | 'success' | 'warning' | 'error' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 0.5rem;
  
  background-color: ${props => {
    switch (props.$type) {
      case 'info': return '#2196F3';
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
    }
  }};
  
  color: white;
`;

// Animation box
const AnimationBox = styled.div<{ $animate: boolean; $animation: any }>`
  width: 100px;
  height: 100px;
  background-color: rgba(63, 81, 181, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  
  ${props => props.$animate && props.$animation ? props.$animation : ''}
`;

// Information list
const InfoList = styled.ul`
  margin: 1rem 0;
  padding-left: 1.5rem;
  color: #e0e0e0;
  
  li {
    margin-bottom: 0.5rem;
  }
`;

// Animation demo with fallbacks
const AnimationDemo = () => {
  const [animate, setAnimate] = useState(false);
  const [category, setCategory] = useState<AnimationCategory>(AnimationCategory.ENTRANCE);
  const [complexity, setComplexity] = useState<AnimationComplexity>(AnimationComplexity.STANDARD);
  const [importance, setImportance] = useState(5);
  
  // Get enhanced reduced motion information
  const reducedMotionInfo = useEnhancedReducedMotion();
  
  // Get animation with intelligent fallbacks
  const animationStyle = useIntelligentAnimationFallbacks(presets.basic.slideUp.keyframes, {
    category,
    importance,
    duration: 1000,
  });
  
  // Determine fallback for display purposes
  const fallback = determineAnimationFallback(presets.basic.slideUp.keyframes, {
    category,
    importance,
    duration: 1000,
  }, reducedMotionInfo);
  
  // Reset animation
  const resetAnimation = () => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 10);
  };
  
  // Get badge type for fallback type
  const getFallbackBadgeType = (type: AnimationFallbackType): 'info' | 'success' | 'warning' | 'error' => {
    switch (type) {
      case AnimationFallbackType.ORIGINAL:
        return 'success';
      case AnimationFallbackType.SIMPLIFIED:
      case AnimationFallbackType.REDUCED_MAGNITUDE:
      case AnimationFallbackType.REDUCED_SPEED:
        return 'info';
      case AnimationFallbackType.FADE_ONLY:
        return 'warning';
      case AnimationFallbackType.SKIP:
      case AnimationFallbackType.STATIC_IMAGE:
        return 'error';
      default:
        return 'info';
    }
  };
  
  return (
    <Container>
      <Title>Intelligent Reduced Motion Fallbacks</Title>
      
      <Section>
        <Subtitle>Reduced Motion Detection</Subtitle>
        <Row>
          <Column $width="60%">
            <Card>
              <h4>Detection Results</h4>
              <InfoList>
                <li>
                  <strong>Prefers Reduced Motion:</strong> {reducedMotionInfo.prefersReducedMotion ? 'Yes' : 'No'}
                </li>
                <li>
                  <strong>Primary Detection Method:</strong> {reducedMotionInfo.detectionMethod}
                </li>
                <li>
                  <strong>Confidence Score:</strong> {Math.round(reducedMotionInfo.confidence * 100)}%
                </li>
                <li>
                  <strong>Recommended Sensitivity:</strong> {reducedMotionInfo.recommendedSensitivityLevel}
                </li>
              </InfoList>
              
              <h4>Additional Detection Methods</h4>
              {reducedMotionInfo.additionalDetectionMethods.length > 0 ? (
                <ul>
                  {reducedMotionInfo.additionalDetectionMethods.map(method => (
                    <li key={method}>{method}</li>
                  ))}
                </ul>
              ) : (
                <p>No additional detection methods activated</p>
              )}
            </Card>
          </Column>
          
          <Column $width="40%">
            <Card>
              <h4>User Override</h4>
              <p>Override the system's reduced motion detection:</p>
              
              <div style={{ marginTop: '1rem' }}>
                <Button 
                  onClick={() => reducedMotionInfo.setUserOverride(true)}
                  disabled={reducedMotionInfo.prefersReducedMotion === true}
                >
                  Enable Reduced Motion
                </Button>
                <Button 
                  onClick={() => reducedMotionInfo.setUserOverride(false)}
                  disabled={reducedMotionInfo.prefersReducedMotion === false}
                >
                  Disable Reduced Motion
                </Button>
                <Button 
                  onClick={() => reducedMotionInfo.setUserOverride(null)}
                >
                  Reset to System Default
                </Button>
              </div>
            </Card>
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Animation Fallbacks Demo</Subtitle>
        <Row>
          <Column $width="60%">
            <div>
              <label>
                Animation Category:
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value as AnimationCategory)}
                  style={{ margin: '0 0.5rem', padding: '0.25rem' }}
                >
                  {Object.values(AnimationCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div style={{ marginTop: '0.5rem' }}>
              <label>
                Animation Complexity:
                <select 
                  value={complexity}
                  onChange={e => setComplexity(e.target.value as AnimationComplexity)}
                  style={{ margin: '0 0.5rem', padding: '0.25rem' }}
                >
                  {Object.values(AnimationComplexity).map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div style={{ marginTop: '0.5rem' }}>
              <label>
                Animation Importance (1-10):
                <input 
                  type="range"
                  min={1}
                  max={10}
                  value={importance}
                  onChange={e => setImportance(parseInt(e.target.value))}
                  style={{ margin: '0 0.5rem', width: '200px' }}
                />
                {importance}
              </label>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={resetAnimation}>
                Play Animation
              </Button>
            </div>
            
            <AnimationBox $animate={animate} $animation={animationStyle}>
              Animation
            </AnimationBox>
          </Column>
          
          <Column $width="40%">
            <Card>
              <h4>Fallback Applied</h4>
              <div style={{ marginBottom: '1rem' }}>
                <Badge $type={getFallbackBadgeType(fallback.type)}>
                  {fallback.type}
                </Badge>
              </div>
              
              <InfoList>
                {fallback.duration && (
                  <li>
                    <strong>Adjusted Duration:</strong> {fallback.duration}ms
                  </li>
                )}
                {fallback.distanceScale && (
                  <li>
                    <strong>Distance Scale:</strong> {fallback.distanceScale}
                  </li>
                )}
                {fallback.speedMultiplier && (
                  <li>
                    <strong>Speed Multiplier:</strong> {fallback.speedMultiplier}
                  </li>
                )}
                {fallback.alternativeAnimation && (
                  <li>
                    <strong>Using Alternative Animation</strong>
                  </li>
                )}
              </InfoList>
              
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                This fallback was selected based on your device's capabilities, motion preferences, and the animation's characteristics.
              </p>
            </Card>
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Multiple Animation Types</Subtitle>
        <p>
          Each animation type responds differently to reduced motion preferences:
        </p>
        
        <Row>
          {Object.entries({
            Entrance: { anim: presets.basic.slideUp.keyframes, category: AnimationCategory.ENTRANCE },
            Hover: { anim: presets.ui.button.hover.keyframes, category: AnimationCategory.HOVER },
            Background: { anim: presets.basic.pulse.keyframes, category: AnimationCategory.BACKGROUND },
            Loading: { anim: presets.ui.button.loading.keyframes, category: AnimationCategory.LOADING },
            Attention: { anim: presets.ui.button.shake.keyframes, category: AnimationCategory.ATTENTION },
          }).map(([name, { anim, category }]) => (
            <Column key={name} $width="20%">
              <div style={{ textAlign: 'center' }}>
                <h4>{name}</h4>
                <AnimationBox 
                  $animate={animate} 
                  $animation={useIntelligentAnimationFallbacks(anim, { category })}
                >
                  {name}
                </AnimationBox>
              </div>
            </Column>
          ))}
        </Row>
        
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={resetAnimation}>
            Play All Animations
          </Button>
        </div>
      </Section>
      
      <Section>
        <Subtitle>Implementation Details</Subtitle>
        <Row>
          <Column>
            <h4>How It Works</h4>
            <InfoList>
              <li>
                <strong>Multiple Detection Methods:</strong> Uses a combination of media queries, device detection, power saving mode detection, and performance analysis.
              </li>
              <li>
                <strong>Confidence Scoring:</strong> Calculates a confidence score for reduced motion preference.
              </li>
              <li>
                <strong>Intelligent Fallbacks:</strong> Selects the most appropriate fallback based on animation properties and user preferences.
              </li>
              <li>
                <strong>Contextual Adaptation:</strong> Considers the animation's purpose, category, and importance.
              </li>
              <li>
                <strong>Performance Optimization:</strong> Applies lightweight fallbacks for lower-end devices.
              </li>
            </InfoList>
            
            <h4>Usage in Code</h4>
            <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Using the hook in components
const MyComponent = () => {
  const animationStyle = useIntelligentAnimationFallbacks(
    presets.slideUp.keyframes,
    {
      category: AnimationCategory.ENTRANCE,
      complexity: AnimationComplexity.STANDARD,
      importance: 5,
      duration: 1000,
    }
  );
  
  return (
    <AnimatedDiv style={animationStyle}>
      Content with intelligent animation fallbacks
    </AnimatedDiv>
  );
};`}
            </pre>
          </Column>
        </Row>
      </Section>
    </Container>
  );
};

export default AnimationDemo;