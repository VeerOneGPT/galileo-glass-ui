import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

import {
  MotionIntensityLevel,
  MotionAreaImpact,
  MotionTrigger,
  AnimationPropertyType
} from '../animations/accessibility/MotionIntensityProfiler';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';
import { useMotionProfiler, useGlobalMotionIntensity, registerAnimation } from '../hooks/useMotionProfiler';
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

// Progress bar
const ProgressBar = styled.div<{ $value: number; $color?: string }>`
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => `${props.$value}%`};
    background-color: ${props => props.$color || '#3f51b5'};
    transition: width 0.3s ease;
  }
`;

// Badge styling
const Badge = styled.span<{ $level: MotionIntensityLevel }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 0.5rem;
  color: white;
  
  background-color: ${props => {
    switch (props.$level) {
      case MotionIntensityLevel.NONE:
        return '#4CAF50';
      case MotionIntensityLevel.MINIMAL:
        return '#8BC34A';
      case MotionIntensityLevel.LOW:
        return '#CDDC39';
      case MotionIntensityLevel.MODERATE:
        return '#FFC107';
      case MotionIntensityLevel.HIGH:
        return '#FF9800';
      case MotionIntensityLevel.VERY_HIGH:
        return '#F44336';
      case MotionIntensityLevel.EXTREME:
        return '#D32F2F';
      default:
        return '#9E9E9E';
    }
  }};
`;

// Define sample animations for the demo
const fadeAnimation = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideAnimation = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

const complexAnimation = keyframes`
  0% { transform: translateY(50px) scale(0.8) rotate(0deg); opacity: 0; }
  25% { transform: translateY(40px) scale(0.9) rotate(90deg); opacity: 0.25; }
  50% { transform: translateY(25px) scale(1) rotate(180deg); opacity: 0.5; }
  75% { transform: translateY(10px) scale(1.1) rotate(270deg); opacity: 0.75; }
  100% { transform: translateY(0) scale(1) rotate(360deg); opacity: 1; }
`;

const flashingAnimation = keyframes`
  0%, 20%, 40%, 60%, 80%, 100% { opacity: 1; }
  10%, 30%, 50%, 70%, 90% { opacity: 0.2; }
`;

const zoomAnimation = keyframes`
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const threeDAnimation = keyframes`
  0% { transform: perspective(400px) rotateY(0deg) translateZ(0); opacity: 0; }
  100% { transform: perspective(400px) rotateY(20deg) translateZ(50px); opacity: 1; }
`;

// Animation box that uses the profiler
const ProfiledAnimationBox = ({
  id,
  animation,
  duration = 1000,
  category = AnimationCategory.ENTRANCE,
  trigger = MotionTrigger.AUTO_PLAY,
  areaImpact = 15,
  importance = 5,
  uses3D = false,
  hasFlashing = false,
  animationName,
  animate,
}: {
  id: string;
  animation: any;
  duration?: number;
  category?: AnimationCategory;
  trigger?: MotionTrigger;
  areaImpact?: number;
  importance?: number;
  uses3D?: boolean;
  hasFlashing?: boolean;
  animationName: string;
  animate: boolean;
}) => {
  // Use the motion profiler hook
  const { profile, isHighIntensity, shouldReduceMotion } = useMotionProfiler(id, {
    name: animationName,
    keyframes: animation,
    duration,
    category,
    trigger,
    areaImpact,
    importance,
    uses3D,
    hasFlashing,
  });
  
  return (
    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>{animationName}</strong>
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
          margin: '0 auto 0.5rem',
          animation: animate ? `${animation} ${duration}ms ease forwards` : 'none',
        }}
      >
        {animationName}
      </div>
      
      <Badge $level={profile.intensityLevel}>
        {profile.intensityLevel}
      </Badge>
      
      <div style={{ marginTop: '0.5rem' }}>
        <small>Intensity Score: {profile.intensityScore.toFixed(1)}/100</small>
        <ProgressBar 
          $value={profile.intensityScore} 
          $color={shouldReduceMotion ? '#F44336' : '#2196F3'}
        />
      </div>
      
      {shouldReduceMotion && (
        <div style={{ marginTop: '0.5rem', color: '#F44336', fontSize: '0.8rem' }}>
          Recommended: Reduce motion for this animation
        </div>
      )}
    </div>
  );
};

// Demo component showing animation intensity profiling
const MotionIntensityProfilerDemo: React.FC = () => {
  // Animation state
  const [animate, setAnimate] = useState(false);
  
  // Global motion intensity metrics
  const globalMetrics = useGlobalMotionIntensity();
  
  // Register some global animations
  useEffect(() => {
    registerAnimation('global-navigation', presets.basic.slideUp.keyframes, {
      name: 'Navigation Animation',
      duration: 500,
      category: AnimationCategory.ENTRANCE,
      trigger: MotionTrigger.AUTO_PLAY,
      areaImpact: 20,
      importance: 8,
    });
    
    registerAnimation('global-loading', presets.ui.card.hover.keyframes, {
      name: 'Loading Spinner',
      duration: 1500,
      category: AnimationCategory.LOADING,
      trigger: MotionTrigger.AUTO_PLAY,
      areaImpact: 5,
      importance: 7,
    });
    
    registerAnimation('global-hover', presets.ui.button.hover.keyframes, {
      name: 'Button Hover',
      duration: 300,
      category: AnimationCategory.HOVER,
      trigger: MotionTrigger.HOVER,
      areaImpact: 2,
      importance: 4,
    });
  }, []);
  
  // Play all animations
  const playAnimations = () => {
    setAnimate(false);
    setTimeout(() => setAnimate(true), 10);
  };
  
  return (
    <Container>
      <Title>Motion Intensity Profiler</Title>
      
      <Section>
        <Subtitle>Animation Intensity Analysis</Subtitle>
        <p>
          The Motion Intensity Profiler analyzes animations to determine their intensity level, 
          helping to improve accessibility and performance.
        </p>
        
        <Button onClick={playAnimations}>
          Play All Animations
        </Button>
        
        <Row>
          <Column $width="25%">
            <ProfiledAnimationBox
              id="fade-animation"
              animation={fadeAnimation}
              duration={800}
              category={AnimationCategory.ENTRANCE}
              trigger={MotionTrigger.AUTO_PLAY}
              areaImpact={10}
              importance={5}
              animationName="Fade"
              animate={animate}
            />
          </Column>
          
          <Column $width="25%">
            <ProfiledAnimationBox
              id="slide-animation"
              animation={slideAnimation}
              duration={800}
              category={AnimationCategory.ENTRANCE}
              trigger={MotionTrigger.AUTO_PLAY}
              areaImpact={10}
              importance={5}
              animationName="Slide"
              animate={animate}
            />
          </Column>
          
          <Column $width="25%">
            <ProfiledAnimationBox
              id="rotate-animation"
              animation={rotateAnimation}
              duration={1500}
              category={AnimationCategory.LOADING}
              trigger={MotionTrigger.CONTINUOUS}
              areaImpact={5}
              importance={6}
              animationName="Rotate"
              animate={animate}
            />
          </Column>
          
          <Column $width="25%">
            <ProfiledAnimationBox
              id="pulse-animation"
              animation={pulseAnimation}
              duration={1200}
              category={AnimationCategory.ATTENTION}
              trigger={MotionTrigger.AUTO_PLAY}
              areaImpact={15}
              importance={7}
              animationName="Pulse"
              animate={animate}
            />
          </Column>
        </Row>
        
        <Row>
          <Column $width="25%">
            <ProfiledAnimationBox
              id="shake-animation"
              animation={shakeAnimation}
              duration={500}
              category={AnimationCategory.ATTENTION}
              trigger={MotionTrigger.AUTO_PLAY}
              areaImpact={10}
              importance={8}
              animationName="Shake"
              animate={animate}
            />
          </Column>
          
          <Column $width="25%">
            <ProfiledAnimationBox
              id="complex-animation"
              animation={complexAnimation}
              duration={2000}
              category={AnimationCategory.ENTRANCE}
              trigger={MotionTrigger.AUTO_PLAY}
              areaImpact={20}
              importance={6}
              animationName="Complex"
              animate={animate}
            />
          </Column>
          
          <Column $width="25%">
            <ProfiledAnimationBox
              id="flashing-animation"
              animation={flashingAnimation}
              duration={1000}
              category={AnimationCategory.ATTENTION}
              trigger={MotionTrigger.AUTO_PLAY}
              areaImpact={15}
              importance={9}
              hasFlashing={true}
              animationName="Flashing"
              animate={animate}
            />
          </Column>
          
          <Column $width="25%">
            <ProfiledAnimationBox
              id="3d-animation"
              animation={threeDAnimation}
              duration={1500}
              category={AnimationCategory.ENTRANCE}
              trigger={MotionTrigger.AUTO_PLAY}
              areaImpact={25}
              importance={7}
              uses3D={true}
              animationName="3D Effect"
              animate={animate}
            />
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Global Intensity Analysis</Subtitle>
        <Row>
          <Column $width="60%">
            <Card>
              <h4>Overall Animation Metrics</h4>
              <div>
                <strong>Total Animations:</strong> {globalMetrics.totalAnimations}
              </div>
              <div>
                <strong>Average Intensity:</strong> {globalMetrics.averageScore.toFixed(1)}/100
                <ProgressBar $value={globalMetrics.averageScore} />
              </div>
              <div>
                <strong>Maximum Intensity:</strong> {globalMetrics.maxScore.toFixed(1)}/100
                <ProgressBar 
                  $value={globalMetrics.maxScore} 
                  $color={globalMetrics.maxScore > 70 ? '#F44336' : '#2196F3'} 
                />
              </div>
              
              <h4 style={{ marginTop: '1rem' }}>Intensity Level Distribution</h4>
              {Object.entries(globalMetrics.countByLevel)
                .filter(([, count]) => count > 0)
                .map(([level, count]) => (
                  <div key={level} style={{ marginBottom: '0.5rem' }}>
                    <Badge $level={level as MotionIntensityLevel}>
                      {level}
                    </Badge>
                    <span style={{ marginLeft: '0.5rem' }}>{count} animation(s)</span>
                  </div>
                ))
              }
            </Card>
          </Column>
          
          <Column $width="40%">
            <Card>
              <h4>Animation Categories</h4>
              {Object.entries(globalMetrics.countByCategory)
                .filter(([, count]) => count > 0)
                .map(([category, count]) => (
                  <div key={category} style={{ marginBottom: '0.5rem' }}>
                    <strong>{category}:</strong> {count} animation(s)
                  </div>
                ))
              }
              
              <h4 style={{ marginTop: '1rem' }}>Recommendations</h4>
              {globalMetrics.maxScore > 80 && (
                <div style={{ color: '#F44336', marginBottom: '0.5rem' }}>
                  Some animations exceed recommended intensity levels. Consider providing reduced motion alternatives.
                </div>
              )}
              
              {globalMetrics.averageScore > 60 && (
                <div style={{ color: '#FF9800', marginBottom: '0.5rem' }}>
                  Overall animation intensity is high. Consider reducing animation complexity or duration.
                </div>
              )}
              
              {(globalMetrics.countByLevel[MotionIntensityLevel.EXTREME] > 0 || 
                globalMetrics.countByLevel[MotionIntensityLevel.VERY_HIGH] > 1) && (
                <div style={{ color: '#F44336', marginBottom: '0.5rem' }}>
                  Multiple high-intensity animations detected. This may impact users with motion sensitivity.
                </div>
              )}
            </Card>
          </Column>
        </Row>
      </Section>
      
      <Section>
        <Subtitle>Implementation Details</Subtitle>
        <Card>
          <h4>How Motion Intensity Profiling Works</h4>
          <ul>
            <li><strong>Animation Analysis:</strong> Analyzes properties like movement distance, duration, and effects</li>
            <li><strong>Category-Based Assessment:</strong> Different types of animations have different impact levels</li>
            <li><strong>Comprehensive Metrics:</strong> Considers factors like area impact, 3D effects, and flashing</li>
            <li><strong>Recommendations Engine:</strong> Provides suggestions for improving accessibility</li>
            <li><strong>Global Monitoring:</strong> Tracks overall application animation intensity</li>
          </ul>
          
          <h4>Factors Considered in Intensity Calculation</h4>
          <ul>
            <li><strong>Animation Properties:</strong> Position, scale, rotation, color, etc.</li>
            <li><strong>Visual Area:</strong> How much screen space is affected</li>
            <li><strong>Duration:</strong> How long the animation plays</li>
            <li><strong>Trigger Mechanism:</strong> Auto-play vs. user-initiated</li>
            <li><strong>3D Effects:</strong> Perspective, 3D transforms</li>
            <li><strong>Flashing Content:</strong> Rapid opacity or color changes</li>
            <li><strong>Movement Distance:</strong> How far elements move</li>
          </ul>
          
          <h4>Usage in Code</h4>
          <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`// Using the hook in a component
import { useMotionProfiler } from '../hooks/useMotionProfiler';
import { AnimationCategory } from '../animations/accessibility/MotionSensitivity';
import { MotionTrigger } from '../animations/accessibility/MotionIntensityProfiler';

const MyAnimatedComponent = () => {
  // Profile animation
  const { profile, shouldReduceMotion } = useMotionProfiler('unique-id', {
    keyframes: myAnimation,
    duration: 1000,
    category: AnimationCategory.ENTRANCE,
    trigger: MotionTrigger.AUTO_PLAY,
    areaImpact: 20,
    importance: 7,
  });
  
  // Use profile to adjust animation
  return (
    <div style={{
      animation: shouldReduceMotion 
        ? 'fadeIn 500ms ease' // Use simpler animation if needed
        : \`\${myAnimation} \${profile.duration}ms ease\`,
    }}>
      Content with intensity-aware animation
    </div>
  );
};`}
          </pre>
        </Card>
      </Section>
    </Container>
  );
};

export default MotionIntensityProfilerDemo;