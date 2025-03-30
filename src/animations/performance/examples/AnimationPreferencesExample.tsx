import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  useAnimationPreferences, 
  PreferenceMode,
  useQualityTier,
  QualityTier
} from '../'; 

// Styled components for our example
const Container = styled.div`
  background-color: #f5f8fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  max-width: 800px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
`;

const Title = styled.h2`
  color: #2b3a4a;
  margin-top: 0;
  border-bottom: 1px solid #e1e5ea;
  padding-bottom: 10px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #455565;
  font-size: 18px;
  margin-bottom: 12px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Label = styled.label`
  flex: 0 0 200px;
  font-weight: 500;
  color: #566b82;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e9eef4;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e9eef4;
  }
`;

const Button = styled.button`
  background-color: #2d7ff9;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1a6eeb;
  }
  
  &:active {
    background-color: #0d5cd7;
  }
`;

const InfoBox = styled.div`
  background-color: #e9f3ff;
  border-left: 4px solid #2d7ff9;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
`;

const FeatureTable = styled.div`
  border: 1px solid #e1e5ea;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 16px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: #f0f3f7;
  padding: 10px 16px;
  font-weight: 600;
  border-bottom: 1px solid #e1e5ea;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 8px 16px;
  border-bottom: 1px solid #e1e5ea;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background-color: #f8fafc;
  }
`;

const CustomFeatureToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #e1e5ea;
  border-radius: 4px;
`;

/**
 * Example component for animation preferences
 */
const AnimationPreferencesExample: React.FC = () => {
  // Get the animation preferences hooks
  const preferences = useAnimationPreferences();
  const qualityTier = useQualityTier({ useDetailedPreferences: true });
  
  // Custom feature toggle state
  const [showCustomFeatures, setShowCustomFeatures] = useState(false);
  
  // Handle preference mode change
  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    preferences.updatePreferenceMode(e.target.value as PreferenceMode);
  };
  
  // Handle quality tier change
  const handleTierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    preferences.updateQualityTier(e.target.value as QualityTier);
  };
  
  // Handle reduced motion toggle
  const handleReducedMotionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    preferences.toggleReducedMotion(e.target.checked);
  };
  
  // Handle battery saver toggle
  const handleBatterySaverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    preferences.toggleBatterySaver(e.target.checked);
  };
  
  // Reset preferences to defaults
  const handleReset = () => {
    preferences.resetPreferences();
  };
  
  // Toggle custom feature
  const toggleCustomFeature = (feature: string, value: boolean | number) => {
    preferences.updateCustomFeatures({
      [feature]: value,
    });
  };
  
  return (
    <Container>
      <Title>Animation Preferences</Title>
      
      <InfoBox>
        This example demonstrates the user preference system for animation quality settings.
        Changes made here will persist across page reloads using localStorage.
      </InfoBox>
      
      <Section>
        <SectionTitle>Preference Mode</SectionTitle>
        <RadioGroup>
          {Object.values(PreferenceMode).map(mode => (
            <RadioLabel key={mode}>
              <input 
                type="radio" 
                name="preferenceMode"
                value={mode}
                checked={preferences.preferences.mode === mode}
                onChange={handleModeChange}
              />
              {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
            </RadioLabel>
          ))}
        </RadioGroup>
      </Section>
      
      {preferences.preferences.mode === PreferenceMode.CUSTOM && (
        <Section>
          <SectionTitle>Quality Tier</SectionTitle>
          <RadioGroup>
            {Object.values(QualityTier).map(tier => (
              <RadioLabel key={tier}>
                <input 
                  type="radio" 
                  name="qualityTier"
                  value={tier}
                  checked={preferences.preferences.qualityTier === tier}
                  onChange={handleTierChange}
                />
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </RadioLabel>
            ))}
          </RadioGroup>
          
          <CustomFeatureToggle>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={showCustomFeatures}
                onChange={() => setShowCustomFeatures(!showCustomFeatures)}
              />
              Show custom feature settings
            </CheckboxLabel>
          </CustomFeatureToggle>
          
          {showCustomFeatures && (
            <>
              <SectionTitle>Custom Feature Settings</SectionTitle>
              <Row>
                <Label>Blur Effects</Label>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={qualityTier.featureFlags.blurEffects}
                    onChange={(e) => toggleCustomFeature('blurEffects', e.target.checked)}
                  />
                  Enable blur effects
                </CheckboxLabel>
              </Row>
              
              <Row>
                <Label>Reflection Effects</Label>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={qualityTier.featureFlags.reflectionEffects}
                    onChange={(e) => toggleCustomFeature('reflectionEffects', e.target.checked)}
                  />
                  Enable reflection effects
                </CheckboxLabel>
              </Row>
              
              <Row>
                <Label>Shadow Effects</Label>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={qualityTier.featureFlags.shadowEffects}
                    onChange={(e) => toggleCustomFeature('shadowEffects', e.target.checked)}
                  />
                  Enable shadow effects
                </CheckboxLabel>
              </Row>
              
              <Row>
                <Label>Depth Effects</Label>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={qualityTier.featureFlags.depthEffects}
                    onChange={(e) => toggleCustomFeature('depthEffects', e.target.checked)}
                  />
                  Enable depth effects (parallax)
                </CheckboxLabel>
              </Row>
              
              <Row>
                <Label>Max Particles</Label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={qualityTier.featureFlags.maxParticles}
                  onChange={(e) => toggleCustomFeature('maxParticles', parseInt(e.target.value))}
                />
                <span style={{ marginLeft: '10px' }}>{qualityTier.featureFlags.maxParticles}</span>
              </Row>
              
              <Row>
                <Label>Physics Simulation Rate</Label>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={qualityTier.featureFlags.physicsHz}
                  onChange={(e) => toggleCustomFeature('physicsHz', parseInt(e.target.value))}
                />
                <span style={{ marginLeft: '10px' }}>{qualityTier.featureFlags.physicsHz} Hz</span>
              </Row>
            </>
          )}
        </Section>
      )}
      
      <Section>
        <SectionTitle>Accessibility Settings</SectionTitle>
        <Row>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={preferences.preferences.prefersReducedMotion}
              onChange={handleReducedMotionChange}
            />
            Prefer reduced motion
          </CheckboxLabel>
        </Row>
        
        <Row>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={preferences.preferences.mode === PreferenceMode.BATTERY_SAVER}
              onChange={handleBatterySaverChange}
            />
            Battery saving mode
          </CheckboxLabel>
        </Row>
      </Section>
      
      <Section>
        <SectionTitle>Current Settings</SectionTitle>
        <FeatureTable>
          <TableHeader>
            <div>Setting</div>
            <div>Value</div>
          </TableHeader>
          <TableRow>
            <div>Preference Mode</div>
            <div>{preferences.preferences.mode}</div>
          </TableRow>
          <TableRow>
            <div>Quality Tier</div>
            <div>{qualityTier.qualityTier}</div>
          </TableRow>
          <TableRow>
            <div>Reduced Motion</div>
            <div>{preferences.preferences.prefersReducedMotion ? 'Yes' : 'No'}</div>
          </TableRow>
          <TableRow>
            <div>Using Custom Features</div>
            <div>{preferences.preferences.useCustomFeatures ? 'Yes' : 'No'}</div>
          </TableRow>
          <TableRow>
            <div>Max Physics Objects</div>
            <div>{qualityTier.featureFlags.maxPhysicsObjects}</div>
          </TableRow>
          <TableRow>
            <div>Max Particles</div>
            <div>{qualityTier.featureFlags.maxParticles}</div>
          </TableRow>
          <TableRow>
            <div>Physics Simulation Rate</div>
            <div>{qualityTier.featureFlags.physicsHz} Hz</div>
          </TableRow>
        </FeatureTable>
      </Section>
      
      <Section style={{ textAlign: 'center' }}>
        <Button onClick={handleReset}>Reset to Default Settings</Button>
      </Section>
    </Container>
  );
};

export default AnimationPreferencesExample; 