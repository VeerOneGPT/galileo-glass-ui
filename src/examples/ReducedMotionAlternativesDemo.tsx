import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { 
  AlternativeType,
  getReducedMotionAlternative
} from '../animations/accessibility/ReducedMotionAlternatives';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';
import { MotionIntensityLevel } from '../animations/accessibility/MotionIntensityProfiler';
import { 
  useReducedMotionAlternative,
  useFlexibleAnimation
} from '../hooks/useReducedMotionAlternative';
import { useReducedMotion } from '../hooks/useReducedMotion';
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

// Animation comparison component
const AnimationComparison = ({
  animationName,
  originalAnimation,
  category,
  intensity = MotionIntensityLevel.MODERATE,
  duration = 1000,
  animate,
  forceAlternative = false,
}: {
  animationName: string;
  originalAnimation: any;
  category: AnimationCategory;
  intensity?: MotionIntensityLevel;
  duration?: number;
  animate: boolean;
  forceAlternative?: boolean;
}) => {
  // Convert keyframes to CSS
  const originalAnimationCSS = css`
    animation: ${originalAnimation} ${duration}ms ease forwards;
  `;
  
  // Get reduced motion alternative
  const alternativeAnimationCSS = useReducedMotionAlternative(
    originalAnimationCSS,
    {
      id: `${animationName}-animation`,
      category,
      intensity,
      duration,
      forceAlternative,
    }
  );
  
  // Determine if using alternative
  const isUsingAlternative = alternativeAnimationCSS !== originalAnimationCSS;
  
  return (
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>{animationName}</strong>
        <div>
          <Badge $type={isUsingAlternative ? 'alternative' : 'original'}>
            {isUsingAlternative ? 'Alternative' : 'Original'}
          </Badge>
          <span style={{ fontSize: '0.8rem' }}>{category}</span>
        </div>
      </div>
      
      <div
        style={{
          width: '120px',
          height: '120px',
          backgroundColor: 'rgba(63, 81, 181, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          ...(animate ? { animation: alternativeAnimationCSS.toString() } : {}),
        }}
      >
        {animationName}
      </div>
    </div>
  );
};

/**
 * Reduced Motion Alternatives Demo
 */
const ReducedMotionAlternativesDemo: React.FC = () => {
  // Animation state
  const [animate, setAnimate] = useState(false);
  
  // Force alternative state
  const [forceAlternatives, setForceAlternatives] = useState(false);
  
  // Get reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Play all animations
  const playAnimations = () => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 10);
  };
  
  // Define animation categories for demo
  const categories = [
    { name: 'Entrance', value: AnimationCategory.ENTRANCE },
    { name: 'Exit', value: AnimationCategory.EXIT },
    { name: 'Hover', value: AnimationCategory.HOVER },
    { name: 'Focus', value: AnimationCategory.FOCUS },
    { name: 'Active', value: AnimationCategory.ACTIVE },
    { name: 'Loading', value: AnimationCategory.LOADING },
    { name: 'Background', value: AnimationCategory.BACKGROUND },
    { name: 'Attention', value: AnimationCategory.ATTENTION },
  ];
  
  // Define intensity levels for demo
  const intensityLevels = [
    { name: 'Minimal', value: MotionIntensityLevel.MINIMAL },
    { name: 'Low', value: MotionIntensityLevel.LOW },
    { name: 'Moderate', value: MotionIntensityLevel.MODERATE },
    { name: 'High', value: MotionIntensityLevel.HIGH },
    { name: 'Very High', value: MotionIntensityLevel.VERY_HIGH },
    { name: 'Extreme', value: MotionIntensityLevel.EXTREME },
  ];
  
  return (
    <Container>
      <Title>Reduced Motion Alternatives</Title>
      
      <Section>
        <Subtitle>Animation Alternative System</Subtitle>
        <p>
          This demo showcases our system for providing alternative animations for users who prefer reduced motion.
          Each animation category has specific alternatives designed to be less motion-intensive while maintaining
          the functional purpose of the animation.
        </p>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <Switch>
              <input
                type="checkbox"
                checked={forceAlternatives}
                onChange={e => setForceAlternatives(e.target.checked)}
              />
              <span></span>
            </Switch>
            <span>Force Alternatives (Currently: {forceAlternatives ? 'On' : 'Off'})</span>
          </div>
          
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>System Preference:</strong> {prefersReducedMotion ? 'Prefers Reduced Motion' : 'Standard Motion'}
          </div>
          
          <Button onClick={playAnimations}>
            Play All Animations
          </Button>
        </div>
      </Section>
      
      <Section>
        <Subtitle>Animation Categories with Alternatives</Subtitle>
        <Row>
          {/* Original animations with alternatives */}
          <Column $width="25%">
            <AnimationComparison
              animationName="Slide In"
              originalAnimation={slideInAnimation}
              category={AnimationCategory.ENTRANCE}
              duration={1000}
              animate={animate}
              forceAlternative={forceAlternatives}
            />
          </Column>
          
          <Column $width="25%">
            <AnimationComparison
              animationName="Bounce"
              originalAnimation={bounceAnimation}
              category={AnimationCategory.ATTENTION}
              intensity={MotionIntensityLevel.HIGH}
              duration={1500}
              animate={animate}
              forceAlternative={forceAlternatives}
            />
          </Column>
          
          <Column $width="25%">
            <AnimationComparison
              animationName="Rotate"
              originalAnimation={rotateAnimation}
              category={AnimationCategory.LOADING}
              duration={2000}
              animate={animate}
              forceAlternative={forceAlternatives}
            />
          </Column>
          
          <Column $width="25%">
            <AnimationComparison
              animationName="Scale"
              originalAnimation={scaleAnimation}
              category={AnimationCategory.ENTRANCE}
              intensity={MotionIntensityLevel.MODERATE}
              duration={800}
              animate={animate}
              forceAlternative={forceAlternatives}
            />
          </Column>
        </Row>
        
        <Row>
          <Column $width="25%">
            <AnimationComparison
              animationName="Shake"
              originalAnimation={shakeAnimation}
              category={AnimationCategory.ATTENTION}
              intensity={MotionIntensityLevel.VERY_HIGH}
              duration={500}
              animate={animate}
              forceAlternative={forceAlternatives}
            />
          </Column>
          
          <Column $width="25%">
            <AnimationComparison
              animationName="Complex"
              originalAnimation={spinAndScaleAnimation}
              category={AnimationCategory.ENTRANCE}
              intensity={MotionIntensityLevel.EXTREME}
              duration={1200}
              animate={animate}
              forceAlternative={forceAlternatives}
            />
          </Column>
          
          <Column $width="25%">
            <AnimationComparison
              animationName="Hover"
              originalAnimation={presets.ui.hover?.keyframes || scaleAnimation}
              category={AnimationCategory.HOVER}
              duration={300}
              animate={animate}
              forceAlternative={forceAlternatives}
            />
          </Column>
          
          <Column $width="25%">
            <AnimationComparison
              animationName="Focus"
              originalAnimation={presets.ui.button?.hover?.keyframes || scaleAnimation}
              category={AnimationCategory.FOCUS}
              duration={300}
              animate={animate}
              forceAlternative={forceAlternatives}
            />
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Category-Specific Alternatives</Subtitle>
        <div style={{ marginBottom: '1rem' }}>
          <p>
            Each animation category has specific alternatives designed to maintain the functional
            purpose of the animation while reducing motion intensity.
          </p>
        </div>
        
        <Card>
          <h4>Alternative Types by Category</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Alternative Type</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.value} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '0.5rem' }}>{category.name}</td>
                  <td style={{ padding: '0.5rem' }}>
                    {(() => {
                      const alternative = getReducedMotionAlternative(
                        category.value,
                        MotionIntensityLevel.MODERATE
                      );
                      return alternative.toString() === '' ? 'None' : alternative.toString().slice(0, 50) + '...';
                    })()}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {category.value === AnimationCategory.ENTRANCE && 'Simple fade or subtle scale'}
                    {category.value === AnimationCategory.EXIT && 'Simple fade or subtle scale'}
                    {category.value === AnimationCategory.HOVER && 'Border highlight or opacity change'}
                    {category.value === AnimationCategory.FOCUS && 'Border highlight or color change'}
                    {category.value === AnimationCategory.ACTIVE && 'Background color change'}
                    {category.value === AnimationCategory.LOADING && 'Opacity pulse'}
                    {category.value === AnimationCategory.BACKGROUND && 'Disabled or subtle opacity change'}
                    {category.value === AnimationCategory.ATTENTION && 'Border pulse or opacity change'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>
      
      <Section>
        <Subtitle>Intensity-Based Alternatives</Subtitle>
        <p>
          The animation alternatives are also adjusted based on the intensity level of the original
          animation. More intense animations get more significant reductions.
        </p>
        
        <Row>
          {intensityLevels.map(intensity => (
            <Column key={intensity.value} $width="50%">
              <Card>
                <h4>{intensity.name} Intensity</h4>
                <Row>
                  <Column $width="50%">
                    <AnimationComparison
                      animationName={intensity.name}
                      originalAnimation={slideInAnimation}
                      category={AnimationCategory.ENTRANCE}
                      intensity={intensity.value}
                      duration={800}
                      animate={animate}
                      forceAlternative={forceAlternatives}
                    />
                  </Column>
                  <Column $width="50%">
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong>Strategy:</strong>
                      {intensity.value === MotionIntensityLevel.MINIMAL && (
                        <span> Simple fade, very short duration</span>
                      )}
                      {intensity.value === MotionIntensityLevel.LOW && (
                        <span> Subtle scale or fade, reduced duration</span>
                      )}
                      {intensity.value === MotionIntensityLevel.MODERATE && (
                        <span> Alternative property or reduced distance</span>
                      )}
                      {intensity.value === MotionIntensityLevel.HIGH && (
                        <span> Simplified animation or property change</span>
                      )}
                      {intensity.value === MotionIntensityLevel.VERY_HIGH && (
                        <span> Minimal animation or simple property change</span>
                      )}
                      {intensity.value === MotionIntensityLevel.EXTREME && (
                        <span> Disable or use simplest alternative</span>
                      )}
                    </div>
                  </Column>
                </Row>
              </Card>
            </Column>
          ))}
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Implementation Details</Subtitle>
        <Card>
          <h4>Using Reduced Motion Alternatives in Components</h4>
          <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Using the reduced motion alternatives hook
import { useReducedMotionAlternative } from '../hooks/useReducedMotionAlternative';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';
import { css, keyframes } from 'styled-components';

const MyComponent = () => {
  // Define original animation
  const originalAnimation = css\`
    animation: \${myKeyframes} 1000ms ease forwards;
  \`;
  
  // Get appropriate animation based on user preferences
  const animation = useReducedMotionAlternative(
    originalAnimation,
    {
      id: 'my-animation',
      category: AnimationCategory.ENTRANCE,
      duration: 1000,
    }
  );
  
  return (
    <div style={{ animation }}>
      Content with accessibility-aware animation
    </div>
  );
}`}
          </pre>
          
          <h4>Alternative Types</h4>
          <ul>
            <li><strong>FADE:</strong> Simple opacity animation without movement</li>
            <li><strong>REDUCED_DISTANCE:</strong> Same animation with scaled down distance</li>
            <li><strong>ALTERNATIVE_PROPERTY:</strong> Animation of a different CSS property</li>
            <li><strong>SIMPLIFIED:</strong> Simpler version of the original animation</li>
            <li><strong>ADJUSTED:</strong> Original with adjusted parameters</li>
            <li><strong>STATIC:</strong> Static indicator instead of animation</li>
            <li><strong>NONE:</strong> No animation at all</li>
          </ul>
        </Card>
      </Section>
    </Container>
  );
};

export default ReducedMotionAlternativesDemo;