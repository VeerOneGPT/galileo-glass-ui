/**
 * Accessibility Demo
 * 
 * Demonstrates the usage of accessibility mixins and features
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '../components/Typography';
import { Box } from '../components/Box';
import { Button } from '../components/Button';
import { Stack } from '../components/Stack';
import { Paper } from '../components/Paper';
import { createThemeContext } from '../core/themeUtils';
import { highContrast } from '../core/mixins/accessibility/highContrast';
import { reducedTransparency } from '../core/mixins/accessibility/reducedTransparency';
import { focusStyles } from '../core/mixins/accessibility/focusStyles';
import { visualFeedback } from '../core/mixins/accessibility/visualFeedback';
import { textStyles } from '../core/mixins/typography/textStyles';

const DemoContainer = styled.div`
  padding: 24px;
`;

const DemoSection = styled.div`
  margin-bottom: 32px;
`;

const HighContrastDemo = styled.div<{ theme: any, type: string }>`
  ${props => highContrast({
    enabled: true,
    type: props.type as any,
    borderWidth: 2,
    removeBackgroundImages: true,
    removeShadows: true,
    respectSystemPreference: false, // For demo purposes, we don't respect system preference
    themeContext: createThemeContext(props.theme)
  })}
  
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const ReducedTransparencyDemo = styled.div<{ theme: any, type: string }>`
  ${props => reducedTransparency({
    enabled: true,
    backgroundAdjustment: props.type as any,
    removeBackdropFilters: true,
    respectSystemPreference: false, // For demo purposes, we don't respect system preference
    themeContext: createThemeContext(props.theme)
  })}
  
  background-color: rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(10px);
  color: #3b82f6;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 16px;
`;

const FocusStylesDemo = styled.button<{ theme: any, type: string }>`
  ${props => focusStyles({
    type: props.type as any,
    width: 3,
    color: '#3b82f6',
    opacity: 0.8,
    offset: 3,
    focusVisible: true,
    highContrast: true,
    animated: true,
    themeContext: createThemeContext(props.theme)
  })}
  
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin: 8px;
  cursor: pointer;
`;

const VisualFeedbackDemo = styled.div<{ theme: any, type: string }>`
  ${props => visualFeedback({
    type: props.type as any,
    intensity: 'medium',
    color: '#3b82f6',
    animated: true,
    colorblindFriendly: true,
    loadingStyle: 'spinner',
    themeContext: createThemeContext(props.theme)
  })}
  
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextStylesDemo = styled.div<{ theme: any, variant: string }>`
  ${props => textStyles({
    variant: props.variant as any,
    color: '#3b82f6',
    shadow: props.variant.includes('glass'),
    glass: props.variant.includes('glass'),
    gradient: props.variant === 'title',
    truncate: false,
    themeContext: createThemeContext(props.theme)
  })}
  
  margin-bottom: 16px;
`;

const ReducedMotionSection = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const AccessibilityDemo = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrastEnabled, setHighContrastEnabled] = useState(false);
  
  return (
    <DemoContainer>
      <Typography variant="h2">Accessibility Features & Mixins Demo</Typography>
      
      <DemoSection>
        <Typography variant="h4">Accessibility Settings (Demo Controls)</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Toggle these settings to simulate different user preferences:
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button onClick={() => setReducedMotion(!reducedMotion)}>
            {reducedMotion ? 'Disable' : 'Enable'} Reduced Motion
          </Button>
          
          <Button onClick={() => setHighContrastEnabled(!highContrastEnabled)}>
            {highContrastEnabled ? 'Disable' : 'Enable'} High Contrast
          </Button>
        </Stack>
        
        <Typography variant="body2" style={{ marginTop: '8px', fontStyle: 'italic' }}>
          Note: These demo controls only affect the examples below. Real accessibility features would respect the user's system settings.
        </Typography>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">High Contrast Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          High contrast alternatives for better visibility:
        </Typography>
        
        <HighContrastDemo type="borders" style={{ opacity: highContrastEnabled ? 1 : 0.7 }}>
          <Typography variant="h5">Borders High Contrast</Typography>
          <Typography variant="body1">
            This example uses the borders high contrast mode, which adds strong border outlines to elements.
          </Typography>
        </HighContrastDemo>
        
        <HighContrastDemo type="colors" style={{ opacity: highContrastEnabled ? 1 : 0.7 }}>
          <Typography variant="h5">Colors High Contrast</Typography>
          <Typography variant="body1">
            This example uses the colors high contrast mode, which enhances color contrast for better readability.
          </Typography>
        </HighContrastDemo>
        
        <HighContrastDemo type="both" style={{ opacity: highContrastEnabled ? 1 : 0.7 }}>
          <Typography variant="h5">Full High Contrast</Typography>
          <Typography variant="body1">
            This example uses the full high contrast mode, which combines both border and color enhancements.
          </Typography>
        </HighContrastDemo>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Reduced Transparency Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Alternatives for users who prefer reduced transparency:
        </Typography>
        
        <ReducedTransparencyDemo type="solid">
          <Typography variant="h5">Solid Background</Typography>
          <Typography variant="body1">
            This example replaces transparent backgrounds with solid colors for users who prefer reduced transparency.
          </Typography>
        </ReducedTransparencyDemo>
        
        <ReducedTransparencyDemo type="increase">
          <Typography variant="h5">Increased Opacity</Typography>
          <Typography variant="body1">
            This example increases the opacity of transparent elements to improve readability.
          </Typography>
        </ReducedTransparencyDemo>
        
        <ReducedTransparencyDemo type="pattern">
          <Typography variant="h5">Pattern Background</Typography>
          <Typography variant="body1">
            This example uses a pattern instead of transparency for visual distinction.
          </Typography>
        </ReducedTransparencyDemo>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Focus Styles Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Accessible focus styles for keyboard navigation (tab to focus buttons):
        </Typography>
        
        <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
          <FocusStylesDemo type="outline">
            Outline Focus
          </FocusStylesDemo>
          
          <FocusStylesDemo type="ring">
            Ring Focus
          </FocusStylesDemo>
          
          <FocusStylesDemo type="border">
            Border Focus
          </FocusStylesDemo>
          
          <FocusStylesDemo type="highlight">
            Highlight Focus
          </FocusStylesDemo>
        </Stack>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Visual Feedback Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Enhanced visual feedback for different states:
        </Typography>
        
        <VisualFeedbackDemo type="hover">
          <Typography variant="body1">Hover Feedback (Hover Me)</Typography>
        </VisualFeedbackDemo>
        
        <VisualFeedbackDemo type="active">
          <Typography variant="body1">Active Feedback (Click Me)</Typography>
        </VisualFeedbackDemo>
        
        <VisualFeedbackDemo type="loading">
          <Typography variant="body1">Loading Feedback</Typography>
        </VisualFeedbackDemo>
        
        <VisualFeedbackDemo type="success">
          <Typography variant="body1">Success Feedback</Typography>
        </VisualFeedbackDemo>
        
        <VisualFeedbackDemo type="error">
          <Typography variant="body1">Error Feedback</Typography>
        </VisualFeedbackDemo>
        
        <VisualFeedbackDemo type="warning">
          <Typography variant="body1">Warning Feedback</Typography>
        </VisualFeedbackDemo>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Text Styles Mixin</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Accessible text styling variations:
        </Typography>
        
        <TextStylesDemo variant="title">
          Title Style - Large Bold Text
        </TextStylesDemo>
        
        <TextStylesDemo variant="heading">
          Heading Style - Section Heading
        </TextStylesDemo>
        
        <TextStylesDemo variant="subheading">
          Subheading Style - Smaller Heading
        </TextStylesDemo>
        
        <TextStylesDemo variant="body">
          Body Style - Regular text used for paragraphs and general content. Provides good readability with appropriate line height and spacing for comfortable reading.
        </TextStylesDemo>
        
        <TextStylesDemo variant="caption">
          Caption Style - Smaller text for captions and secondary information
        </TextStylesDemo>
        
        <TextStylesDemo variant="glassTitle">
          Glass Title - Title with Glass Effect
        </TextStylesDemo>
        
        <TextStylesDemo variant="glassHeading">
          Glass Heading - Heading with Glass Effect
        </TextStylesDemo>
        
        <TextStylesDemo variant="code">
          Code Style - for displaying code snippets
        </TextStylesDemo>
        
        <TextStylesDemo variant="quote">
          Quote Style - Used for blockquotes and citations in the text
        </TextStylesDemo>
      </DemoSection>
      
      <DemoSection>
        <Typography variant="h4">Reduced Motion Support</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Examples with alternatives for users who prefer reduced motion:
        </Typography>
        
        <ReducedMotionSection>
          <Typography variant="h5">Reduced Motion Example</Typography>
          <Typography variant="body1" style={{ marginBottom: '16px' }}>
            The animations below will adapt based on reduced motion preference:
          </Typography>
          
          <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
            <Box style={{ 
              padding: '16px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              animation: reducedMotion ? 'none' : 'pulse 2s infinite ease-in-out'
            }}>
              <Typography variant="body1">Pulsing Animation</Typography>
              <style jsx>{`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                }
              `}</style>
            </Box>
            
            <Box style={{ 
              padding: '16px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              animation: reducedMotion ? 'none' : 'slideIn 2s infinite alternate ease-in-out',
              opacity: reducedMotion ? 0.7 : 1 // Alternative feedback for reduced motion
            }}>
              <Typography variant="body1">Slide Animation</Typography>
              <style jsx>{`
                @keyframes slideIn {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(20px); }
                }
              `}</style>
            </Box>
            
            <Box style={{ 
              padding: '16px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              animation: reducedMotion ? 'fadeOnly 2s infinite alternate ease-in-out' : 'spin 2s infinite linear'
            }}>
              <Typography variant="body1">Spin (with Fade Alternative)</Typography>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes fadeOnly {
                  0% { opacity: 0.7; }
                  100% { opacity: 1; }
                }
              `}</style>
            </Box>
          </Stack>
        </ReducedMotionSection>
      </DemoSection>
    </DemoContainer>
  );
};

export default AccessibilityDemo;