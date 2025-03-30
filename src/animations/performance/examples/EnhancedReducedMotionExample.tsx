/**
 * Enhanced Reduced Motion Example
 * 
 * Demonstrates the enhanced useReducedMotion hook with configurable alternatives
 */
import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

import { useReducedMotion } from '../../accessibility/useReducedMotion';
import { AnimationCategory, MotionSensitivityLevel, AnimationComplexity } from '../../accessibility/MotionSensitivity';
import { AlternativeType } from '../../accessibility/ReducedMotionAlternatives';
import { animationPresets } from '../../presets';

// Styled components for the demo
const ExampleContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
`;

const Section = styled.section`
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 15px;
`;

const ControlRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
`;

const Select = styled.select`
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

// Animation examples for different categories
const AnimationExample = styled.div<{
  $animate: boolean;
  $animation: any;
  $duration: number;
  $distanceScale: number;
}>`
  padding: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  text-align: center;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 18px;
  position: relative;
  overflow: hidden;
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  ${props =>
    props.$animate &&
    css`
      animation: ${props.$animation} ${props.$duration}ms ease-out forwards;
      transform-origin: center;
    `}
`;

const StatusBadge = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  background: ${props => (props.$active ? '#4caf50' : '#f44336')};
  color: white;
`;

const InfoPanel = styled.div`
  margin-top: 16px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-size: 14px;
`;

const InfoItem = styled.div`
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: bold;
`;

const InfoValue = styled.span`
  color: #666;
`;

const SettingsPanel = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background: ${props => (props.$variant === 'primary' ? '#3f51b5' : '#f5f5f5')};
  color: ${props => (props.$variant === 'primary' ? '#fff' : '#333')};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => (props.$variant === 'primary' ? '#303f9f' : '#e0e0e0')};
  }
`;

// Example component that demonstrates the enhanced useReducedMotion hook
const EnhancedReducedMotionExample: React.FC = () => {
  // Use the enhanced hook with default options
  const {
    systemReducedMotion,
    appReducedMotion,
    prefersReducedMotion,
    motionSensitivity,
    sensitivityConfig,
    preferredAlternativeType,
    categoryPreferences,
    setAppReducedMotion,
    setMotionSensitivity,
    setPreferredAlternativeType,
    setCategoryPreference,
    resetPreferences,
    isAnimationAllowed,
    getAlternativeForCategory,
    getAdjustedDuration,
    getDistanceScale
  } = useReducedMotion({
    defaultSensitivity: MotionSensitivityLevel.MEDIUM,
    defaultAlternativeType: AlternativeType.FADE
  });

  // State to track animation triggers for each category
  const [animationStates, setAnimationStates] = useState<Record<AnimationCategory, boolean>>(
    Object.values(AnimationCategory).reduce((acc, category) => {
      if (typeof AnimationCategory[category as any] === 'string') {
        acc[category] = false;
      }
      return acc;
    }, {} as Record<AnimationCategory, boolean>)
  );

  // Trigger an animation for a specific category
  const triggerAnimation = (category: AnimationCategory) => {
    setAnimationStates(prev => ({
      ...prev,
      [category]: true
    }));

    // Reset after animation completes
    setTimeout(() => {
      setAnimationStates(prev => ({
        ...prev,
        [category]: false
      }));
    }, getAdjustedDuration(1500, category));
  };

  // Sensible default animation presets for each category
  const getCategoryAnimationPreset = (category: AnimationCategory) => {
    switch (category) {
      case AnimationCategory.ENTRANCE:
        return animationPresets.slideUp;
      case AnimationCategory.EXIT:
        return animationPresets.slideDown;
      case AnimationCategory.HOVER:
        return animationPresets.fadeScale;
      case AnimationCategory.FOCUS:
        return animationPresets.pulse;
      case AnimationCategory.ACTIVE:
        return animationPresets.fadeScale;
      case AnimationCategory.LOADING:
        return animationPresets.pulse;
      case AnimationCategory.BACKGROUND:
        return animationPresets.fade;
      case AnimationCategory.SCROLL:
        return animationPresets.slideLeft;
      case AnimationCategory.ATTENTION:
        return animationPresets.pulse;
      case AnimationCategory.ESSENTIAL:
      default:
        return animationPresets.fade;
    }
  };

  // Get category name for display
  const getCategoryDisplayName = (category: AnimationCategory): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get sensitivity level name for display
  const getSensitivityLevelName = (level: MotionSensitivityLevel): string => {
    return level
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <ExampleContainer>
      <Header>
        <Title>Enhanced Reduced Motion Example</Title>
        <Description>
          Demonstrates the enhanced useReducedMotion hook with configurable alternatives
          for different animation categories.
        </Description>
      </Header>

      <Section>
        <SectionTitle>Motion Preferences</SectionTitle>
        <ControlRow>
          <Label>
            <Checkbox
              checked={appReducedMotion}
              onChange={e => setAppReducedMotion(e.target.checked)}
            />
            App Reduced Motion
          </Label>

          <Label>
            System Reduced Motion: {systemReducedMotion ? 'Enabled' : 'Disabled'}
          </Label>

          <Label>
            Effective Setting: {prefersReducedMotion ? 'Reduced Motion' : 'Normal Motion'}
          </Label>
        </ControlRow>

        <ControlRow>
          <Label>
            Motion Sensitivity:
            <Select
              value={motionSensitivity}
              onChange={e => setMotionSensitivity(e.target.value as MotionSensitivityLevel)}
            >
              {Object.values(MotionSensitivityLevel).map(level => (
                <option key={level} value={level}>
                  {getSensitivityLevelName(level)}
                </option>
              ))}
            </Select>
          </Label>

          <Label>
            Default Alternative:
            <Select
              value={preferredAlternativeType}
              onChange={e => setPreferredAlternativeType(e.target.value as AlternativeType)}
            >
              {Object.values(AlternativeType).map(type => (
                <option key={type} value={type}>
                  {type
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')}
                </option>
              ))}
            </Select>
          </Label>
        </ControlRow>

        <ButtonGroup>
          <Button $variant="primary" onClick={resetPreferences}>
            Reset All Preferences
          </Button>
          <Button onClick={() => setAppReducedMotion(!appReducedMotion)}>
            Toggle Reduced Motion
          </Button>
        </ButtonGroup>

        <InfoPanel>
          <InfoItem>
            <InfoLabel>Sensitivity Level:</InfoLabel>
            <InfoValue>{getSensitivityLevelName(motionSensitivity)}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Speed Multiplier:</InfoLabel>
            <InfoValue>{sensitivityConfig.speedMultiplier.toFixed(2)}x</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Distance Scale:</InfoLabel>
            <InfoValue>{sensitivityConfig.distanceScale}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Max Complexity:</InfoLabel>
            <InfoValue>{sensitivityConfig.maxAllowedComplexity}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Using Alternatives:</InfoLabel>
            <InfoValue>{sensitivityConfig.useAlternativeAnimations ? 'Yes' : 'No'}</InfoValue>
          </InfoItem>
        </InfoPanel>
      </Section>

      <Section>
        <SectionTitle>Animation Categories</SectionTitle>
        <Description>
          Click on any category to see its animation with current settings applied.
          You can customize settings for each category individually.
        </Description>

        <Grid>
          {Object.keys(AnimationCategory)
            .filter(key => isNaN(Number(key)))
            .map(key => {
              const category = AnimationCategory[key as keyof typeof AnimationCategory];
              const isEnabled = isAnimationAllowed(category);
              const alternativeType = getAlternativeForCategory(category);
              const baseDuration = 1000;
              const adjustedDuration = getAdjustedDuration(baseDuration, category);
              const distanceScale = getDistanceScale(category);
              const categoryPrefs = categoryPreferences[category];

              return (
                <div key={category}>
                  <AnimationExample
                    $animate={animationStates[category]}
                    $animation={getCategoryAnimationPreset(category).keyframes}
                    $duration={adjustedDuration}
                    $distanceScale={distanceScale}
                    onClick={() => triggerAnimation(category)}
                  >
                    {getCategoryDisplayName(category)}
                    <StatusBadge $active={isEnabled}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </StatusBadge>
                  </AnimationExample>

                  <SettingsPanel>
                    <ControlRow>
                      <Label>
                        <Checkbox
                          checked={categoryPrefs.enabled}
                          onChange={e =>
                            setCategoryPreference(category, { enabled: e.target.checked })
                          }
                        />
                        Enabled
                      </Label>

                      <Label>
                        Alternative:
                        <Select
                          value={categoryPrefs.alternativeType}
                          onChange={e =>
                            setCategoryPreference(category, {
                              alternativeType: e.target.value as AlternativeType
                            })
                          }
                        >
                          {Object.values(AlternativeType).map(type => (
                            <option key={type} value={type}>
                              {type
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ')}
                            </option>
                          ))}
                        </Select>
                      </Label>
                    </ControlRow>

                    <ControlRow>
                      <Label>
                        Max Complexity:
                        <Select
                          value={categoryPrefs.maxComplexity}
                          onChange={e =>
                            setCategoryPreference(category, {
                              maxComplexity: e.target.value as AnimationComplexity
                            })
                          }
                        >
                          {Object.values(AnimationComplexity).map(complexity => (
                            <option key={complexity} value={complexity}>
                              {complexity
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ')}
                            </option>
                          ))}
                        </Select>
                      </Label>
                    </ControlRow>

                    <InfoItem>
                      <InfoLabel>Duration:</InfoLabel>
                      <InfoValue>
                        {adjustedDuration}ms ({(adjustedDuration / baseDuration).toFixed(2)}x)
                      </InfoValue>
                    </InfoItem>
                  </SettingsPanel>
                </div>
              );
            })}
        </Grid>
      </Section>
    </ExampleContainer>
  );
};

export default EnhancedReducedMotionExample;