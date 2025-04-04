import React, { useState, CSSProperties } from 'react';
import styled, { keyframes, css, Keyframes, ThemeProvider } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

import { useReducedMotion, EnhancedReducedMotionResult } from '../../src/animations/accessibility/useReducedMotion';
import { AnimationCategory, MotionSensitivityLevel, AnimationComplexity } from '../../src/animations/accessibility/MotionSensitivity';
import { AlternativeType } from '../../src/animations/accessibility/ReducedMotionAlternatives';
// Removed unused AnimationPreset and UiCard imports
import { ThemeProvider as AppThemeProvider } from '../../src/theme';

// --- Copied Styles ---
const Container = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #e2e8f0; /* Light text */
  background: rgba(30, 41, 59, 0.7); /* Darker bg */
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #ffffff;
`;

const Subtitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #e0e0e0;
`;

const Card = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.08); /* Adjusted card bg */
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
`;

const Column = styled.div<{ $width?: string }>`
  flex: ${props => props.$width || '1'};
  padding: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #4f46e5; /* Adjusted button color */
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  
  &:hover {
    background-color: #6366f1;
  }
  
  &:disabled {
    background-color: #374151; /* Darker disabled */
    cursor: not-allowed;
  }
`;

const Badge = styled.span<{ $type: 'original' | 'alternative' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-right: 0.5rem;
  color: white;
  background-color: ${props => props.$type === 'original' ? '#10b981' : '#f59e0b'}; /* Adjusted badge colors */
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 0.5rem;
  input { opacity: 0; width: 0; height: 0; }
  span {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background-color: #4b5563; transition: .4s; border-radius: 24px;
    &:before {
      position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
      background-color: white; transition: .4s; border-radius: 50%;
    }
  }
  input:checked + span { background-color: #6366f1; }
  input:checked + span:before { transform: translateX(26px); }
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-right: 0.5rem;
`;

const SettingsGroup = styled.div`
  margin-bottom: 1rem;
  > div { display: flex; flex-wrap: wrap; align-items: center; margin-bottom: 0.5rem; }
  label { margin-right: 0.5rem; min-width: 180px; }
`;

const AnimationBox = styled.div<{
  $animate: boolean;
  $animation: Keyframes | 'none'; // Expect Keyframes object or 'none'
  $duration: number;
}>`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background-color: rgba(79, 70, 229, 0.4); /* Adjusted box color */
  color: white;
  font-weight: 500;
  
  ${props => props.$animate && props.$animation !== 'none' && css`
    animation: ${props.$animation} ${props.$duration}ms ease forwards;
  `}
`;

const StatusIndicator = styled.div<{ $enabled: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
  background-color: ${props => props.$enabled ? '#10b981' : '#ef4444'}; /* Adjusted status colors */
`;

// --- Animations (Keyframes) ---
const slideInAnimation = keyframes`from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;
const bounceAnimation = keyframes`0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-30px); } 60% { transform: translateY(-15px); }`;
const rotateAnimation = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const scaleAnimation = keyframes`0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; }`;
const shakeAnimation = keyframes`0%, 100% {transform: translateX(0);} 10%, 30%, 50%, 70%, 90% {transform: translateX(-10px);} 20%, 40%, 60%, 80% {transform: translateX(10px);}`; // Added shake
const spinAndScaleAnimation = keyframes`0% { transform: rotate(0deg) scale(0.8); opacity: 0; } 50% { transform: rotate(180deg) scale(1.1); opacity: 0.5; } 100% { transform: rotate(360deg) scale(1); opacity: 1; }`;

// --- Helper Components ---

interface AnimationComparisonProps {
  category: AnimationCategory;
  animationName: string;
  animation: Keyframes;
  duration?: number;
  triggerAnimation: () => void;
  isAnimating: boolean;
  enhanced: EnhancedReducedMotionResult;
}

const AnimationComparison: React.FC<AnimationComparisonProps> = ({ 
  category, animationName, animation, duration = 1000, 
  triggerAnimation, isAnimating, enhanced 
}) => {
  const { isAnimationAllowed, getAdjustedDuration, getAlternativeForCategory, getDistanceScale } = enhanced;
  const isEnabled = isAnimationAllowed(category);
  const alternativeType = getAlternativeForCategory(category);
  const adjustedDuration = getAdjustedDuration(duration, category);
  const distanceScale = getDistanceScale(category);

  const appliedAnimation = isEnabled ? animation : (alternativeType === AlternativeType.NONE ? 'none' : animation);
  
  return (
    <Card>
      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{animationName}</strong>
          <div> <Badge $type={isEnabled ? 'original' : 'alternative'}> {isEnabled ? 'Original' : alternativeType} </Badge> </div>
        </div>
        <Button onClick={triggerAnimation}>Play</Button>
      </div>
      <AnimationBox
        $animate={isAnimating}
        $animation={appliedAnimation}
        $duration={adjustedDuration}
      >
        {category}
      </AnimationBox>
      <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        <div>Duration: {adjustedDuration}ms</div>
        <div>Dist Scale: {distanceScale}</div>
      </div>
    </Card>
  );
};

// --- Storybook Setup ---

export default {
  title: 'Accessibility/ReducedMotionAlternatives',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AppThemeProvider forceColorMode="dark">
        <Story />
      </AppThemeProvider>
    ),
  ],
} as Meta;

// --- Template Component ---

const ReducedMotionDemoTemplate: React.FC = () => {
  const enhanced = useReducedMotion({ defaultSensitivity: MotionSensitivityLevel.MEDIUM, useGranularControl: true });
  const { 
    systemReducedMotion, appReducedMotion, prefersReducedMotion, motionSensitivity, 
    sensitivityConfig, preferredAlternativeType, setAppReducedMotion, 
    setMotionSensitivity, setPreferredAlternativeType, resetPreferences 
  } = enhanced;
  const [animatingCategory, setAnimatingCategory] = useState<AnimationCategory | null>(null);

  const playAnimation = (category: AnimationCategory) => {
    setAnimatingCategory(category);
    setTimeout(() => setAnimatingCategory(null), enhanced.getAdjustedDuration(1500, category));
  };

  const categories = [
    { name: 'Entrance', value: AnimationCategory.ENTRANCE, animation: slideInAnimation },
    { name: 'Exit', value: AnimationCategory.EXIT, animation: slideInAnimation }, // Using slideIn as placeholder
    { name: 'Attention', value: AnimationCategory.ATTENTION, animation: bounceAnimation },
    { name: 'Loading', value: AnimationCategory.LOADING, animation: rotateAnimation },
    { name: 'Hover', value: AnimationCategory.HOVER, animation: scaleAnimation },
    { name: 'Focus', value: AnimationCategory.FOCUS, animation: scaleAnimation }, // Using scale as placeholder
    { name: 'Active', value: AnimationCategory.ACTIVE, animation: scaleAnimation }, // Using scale as placeholder
    { name: 'Background', value: AnimationCategory.BACKGROUND, animation: spinAndScaleAnimation },
  ];

  return (
    <Container>
      <Title>Enhanced Reduced Motion</Title>
      <Section>
        <Subtitle>Motion Sensitivity Settings</Subtitle>
        <SettingsGroup>
          <div> <label>System Preference:</label> <StatusIndicator $enabled={systemReducedMotion} /> {systemReducedMotion ? 'Reduced' : 'Standard'} </div>
          <div> <label>App Setting:</label> <Switch> <input type="checkbox" checked={appReducedMotion} onChange={e => setAppReducedMotion(e.target.checked)} /> <span /> </Switch> {appReducedMotion ? 'Reduced' : 'Standard'} </div>
          <div> <label>Effective Setting:</label> <StatusIndicator $enabled={prefersReducedMotion} /> <strong>{prefersReducedMotion ? 'Reduced' : 'Standard'}</strong> </div>
          <div> <label>Sensitivity Level:</label> <Select value={motionSensitivity} onChange={e => setMotionSensitivity(e.target.value as MotionSensitivityLevel)}>
            {Object.values(MotionSensitivityLevel).map(level => <option key={level} value={level}> {level.replace('_', ' ')} </option>)} </Select> </div>
          <div> <label>Alternative Type:</label> <Select value={preferredAlternativeType} onChange={e => setPreferredAlternativeType(e.target.value as AlternativeType)}>
            {Object.values(AlternativeType).map(type => <option key={type} value={type}> {type.replace('_', ' ')} </option>)} </Select> </div>
          <div> <Button onClick={resetPreferences}>Reset Preferences</Button> </div>
        </SettingsGroup>
        <Card>
          <h4>Active Configuration</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div>Sensitivity:</div><div>{motionSensitivity}</div>
            <div>Speed Multiplier:</div><div>{sensitivityConfig.speedMultiplier.toFixed(2)}x</div>
            <div>Distance Scale:</div><div>{sensitivityConfig.distanceScale}</div>
            <div>Max Complexity:</div><div>{sensitivityConfig.maxAllowedComplexity}</div>
            <div>Use Alternatives:</div><div>{sensitivityConfig.useAlternativeAnimations ? 'Yes' : 'No'}</div>
          </div>
        </Card>
      </Section>
      <Section>
        <Subtitle>Animation Categories</Subtitle>
        <p> Play animations to see effects based on current settings. </p>
        <Row>
          {categories.map(cat => (
            <Column key={cat.value} $width="25%">
              <AnimationComparison
                category={cat.value}
                animationName={cat.name}
                animation={cat.animation}
                duration={800}
                triggerAnimation={() => playAnimation(cat.value)}
                isAnimating={animatingCategory === cat.value}
                enhanced={enhanced}
              />
            </Column>
          ))}
        </Row>
      </Section>
      {/* ... Implementation Details Section ... */}
    </Container>
  );
};

// --- Export Story ---

export const Demo: StoryFn = () => <ReducedMotionDemoTemplate />;
Demo.storyName = 'Reduced Motion Alternatives'; 