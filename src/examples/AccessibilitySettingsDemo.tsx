/**
 * AccessibilitySettingsDemo component
 * 
 * Demonstrates the AccessibilitySettings component with all its features.
 */
import React, { useState } from 'react';
import styled from 'styled-components';

import { AccessibilitySettings } from '../components/AccessibilitySettings';
import { AccessibilityProvider } from '../components/AccessibilityProvider';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Typography } from '../components/Typography';

// Demo container with examples
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  gap: 32px;
`;

const ExampleSection = styled.div`
  margin-top: 32px;
`;

const ExampleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const DemoCard = styled(Card)`
  padding: 24px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const SettingsTrigger = styled(Button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
`;

/**
 * Component for demonstrating the AccessibilitySettings
 */
export const AccessibilitySettingsDemo = () => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Animations for demo cards to show the effects of settings
  const animations = [
    {
      name: 'Fade In',
      style: 'fade',
      description: 'Simple opacity transition'
    },
    {
      name: 'Slide Up',
      style: 'slideUp',
      description: 'Element slides up from below'
    },
    {
      name: 'Scale',
      style: 'scale',
      description: 'Element grows or shrinks'
    },
    {
      name: 'Rotate',
      style: 'rotate',
      description: 'Element rotates around its center'
    },
    {
      name: 'Bounce',
      style: 'bounce',
      description: 'Element bounces into place'
    },
    {
      name: 'Wiggle',
      style: 'wiggle',
      description: 'Element wiggles to attract attention'
    },
  ];
  
  return (
    <AccessibilityProvider>
      <DemoContainer>
        <div>
          <Typography variant="h1">Accessibility Settings Demo</Typography>
          <Typography variant="body1" style={{ marginTop: '16px' }}>
            This demo showcases the comprehensive accessibility settings component that allows users
            to personalize their motion preferences and other accessibility options.
          </Typography>
          
          <ButtonContainer>
            <Button 
              variant="contained" 
              onClick={() => setShowSettings(true)}
            >
              Open Accessibility Settings
            </Button>
          </ButtonContainer>
        </div>
        
        <ExampleSection>
          <Typography variant="h2">Animation Examples</Typography>
          <Typography variant="body1" style={{ marginTop: '8px' }}>
            These examples demonstrate different types of animations. Try changing the
            accessibility settings to see how they affect these animations.
          </Typography>
          
          <ExampleGrid>
            {animations.map((animation) => (
              <DemoCard key={animation.name} className={`animation-${animation.style}`}>
                <div>
                  <Typography variant="h3">{animation.name}</Typography>
                  <Typography variant="body2" style={{ marginTop: '8px' }}>
                    {animation.description}
                  </Typography>
                </div>
                <Button variant="outlined" size="small">
                  Trigger Animation
                </Button>
              </DemoCard>
            ))}
          </ExampleGrid>
        </ExampleSection>
        
        {showSettings && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}>
            <div style={{ maxHeight: '90vh', overflowY: 'auto', width: '100%' }}>
              <AccessibilitySettings 
                onClose={() => setShowSettings(false)}
                onChange={(settings) => {
                  console.log('Settings changed:', settings);
                }}
              />
            </div>
          </div>
        )}
      </DemoContainer>
      
      {!showSettings && (
        <SettingsTrigger
          variant="contained"
          onClick={() => setShowSettings(true)}
          aria-label="Open Accessibility Settings"
        >
          Accessibility Settings
        </SettingsTrigger>
      )}
    </AccessibilityProvider>
  );
};

export default AccessibilitySettingsDemo;