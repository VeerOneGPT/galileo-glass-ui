import React, { useState } from 'react';
import styled, { DefaultTheme, ThemeProvider, createGlobalStyle } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// Import Components (using relative paths where needed)
import { Box } from '../../src/components/Box';
import { Button } from '../../src/components/Button'; // Use relative path
import { Paper } from '../../src/components/Paper'; // Use relative
import { Stack } from '../../src/components/Stack'; // Use relative
import { Typography } from '../../src/components/Typography'; // Use relative

// Import Mixins & Utils (using relative paths)
import { focusStyles } from '../../src/core/mixins/accessibility/focusStyles';
import { highContrast } from '../../src/core/mixins/accessibility/highContrast';
import { reducedTransparency } from '../../src/core/mixins/accessibility/reducedTransparency';
import { visualFeedback } from '../../src/core/mixins/accessibility/visualFeedback';
import { textStyles } from '../../src/core/mixins/typography/textStyles';
import { createThemeContext } from '../../src/core/themeUtils';

// Type Aliases for potentially unexported mixin option types (using any)
type HighContrastType = any;
type ReducedTransparencyBgAdjustment = any;
type FocusStyleType = any;
type VisualFeedbackType = any;
type TextStyleVariant = any;

// Mock Theme (consistent with previous stories)
const mockTheme: DefaultTheme = {
    isDarkMode: false, colorMode: 'light', themeVariant: 'nebula',
    colors: { nebula: { accentPrimary: '#6366F1', accentSecondary: '#8B5CF6', accentTertiary: '#EC4899', stateCritical: '#EF4444', stateOptimal: '#10B981', stateAttention: '#F59E0B', stateInformational: '#3B82F6', neutralBackground: '#F9FAFB', neutralForeground: '#1F2937', neutralBorder: '#E5E7EB', neutralSurface: '#FFFFFF' }, glass: { light: { background: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', highlight: 'rgba(255, 255, 255, 0.3)', shadow: 'rgba(0, 0, 0, 0.1)', glow: 'rgba(255, 255, 255, 0.2)' }, dark: { background: 'rgba(0, 0, 0, 0.2)', border: 'rgba(255, 255, 255, 0.1)', highlight: 'rgba(255, 255, 255, 0.1)', shadow: 'rgba(0, 0, 0, 0.3)', glow: 'rgba(255, 255, 255, 0.1)' }, tints: { primary: 'rgba(99, 102, 241, 0.1)', secondary: 'rgba(139, 92, 246, 0.1)' } } },
    zIndex: { hide: -1, auto: 'auto', base: 0, docked: 10, dropdown: 1000, sticky: 1100, banner: 1200, overlay: 1300, modal: 1400, popover: 1500, skipLink: 1600, toast: 1700, tooltip: 1800, glacial: 9999 }
};

// --- Story Layout Components ---
const StoryContainer = styled.div`
  padding: 24px;
`;

const DemoSection = styled.div`
  margin-bottom: 32px;
`;

const ReducedMotionSection = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
`;

// Global styles for animations (needed for Reduced Motion demo)
const GlobalAnimations = createGlobalStyle`
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes slideIn { 0% { transform: translateX(0); } 100% { transform: translateX(20px); } }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes fadeOnly { 0% { opacity: 0.7; } 100% { opacity: 1; } }
`;

// --- Styled Components Demonstrating Mixins (from original demo) ---

const HighContrastDemo = styled.div<{ theme: DefaultTheme; type: HighContrastType }>`
  ${props =>
    highContrast({
      enabled: true, type: props.type, borderWidth: 2, removeBackgroundImages: true,
      removeShadows: true, respectSystemPreference: false, // Force enable for demo
      themeContext: createThemeContext(props.theme),
    })}
  background-color: rgba(59, 130, 246, 0.1); color: #3b82f6;
  padding: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const ReducedTransparencyDemo = styled.div<{ theme: DefaultTheme; type: ReducedTransparencyBgAdjustment }>`
  ${props =>
    reducedTransparency({
      enabled: true, backgroundAdjustment: props.type, removeBackdropFilters: true,
      respectSystemPreference: false, // Force enable for demo
      themeContext: createThemeContext(props.theme),
    })}
  background-color: rgba(59, 130, 246, 0.1); backdrop-filter: blur(10px);
  color: #3b82f6; padding: 24px; border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3); margin-bottom: 16px;
`;

const StyledFocusButton = styled.button<{ theme: DefaultTheme; focusType: FocusStyleType }>`
  ${props =>
    focusStyles({
      type: props.focusType, width: 3, color: '#3b82f6', opacity: 0.8, offset: 3,
      focusVisible: true, highContrast: true, animated: true,
      themeContext: createThemeContext(props.theme),
    })}
  background-color: rgba(59, 130, 246, 0.1); color: #3b82f6;
  padding: 12px 24px; border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3); margin: 8px; cursor: pointer;
`;

const VisualFeedbackDemo = styled.div<{ theme: DefaultTheme; type: VisualFeedbackType }>`
  ${props =>
    visualFeedback({
      type: props.type, intensity: 'medium', color: '#3b82f6', animated: true,
      colorblindFriendly: true, loadingStyle: 'spinner',
      themeContext: createThemeContext(props.theme),
    })}
  background-color: rgba(59, 130, 246, 0.1); color: #3b82f6;
  padding: 24px; border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3); margin-bottom: 16px;
  display: flex; align-items: center; justify-content: center;
`;

const TextStylesDemo = styled.div<{ theme: DefaultTheme; variant: TextStyleVariant }>`
  ${props =>
    textStyles({
      variant: props.variant, color: '#3b82f6',
      shadow: String(props.variant).includes('glass'), // Ensure variant is string before includes
      glass: String(props.variant).includes('glass'),
      gradient: props.variant === 'title',
      truncate: false, themeContext: createThemeContext(props.theme),
    })}
  margin-bottom: 16px;
`;

// --- Storybook Meta Configuration ---
const meta: Meta = {
  title: 'Core/Accessibility Mixins & Features',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={mockTheme}>
        <GlobalAnimations /> {/* Include global styles for animations */}
        <StoryContainer>
          <Story />
        </StoryContainer>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// --- Individual Stories ---

export const HighContrastMixin: Story = {
  render: () => (
    <DemoSection>
      <Typography variant="h4">highContrast Mixin</Typography>
       <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Simulates high contrast modes (forced enabled for demo):
        </Typography>
      <HighContrastDemo theme={mockTheme} type="borders">
        <Typography variant="h5">Borders</Typography>
      </HighContrastDemo>
      <HighContrastDemo theme={mockTheme} type="colors">
        <Typography variant="h5">Colors</Typography>
      </HighContrastDemo>
      <HighContrastDemo theme={mockTheme} type="both">
        <Typography variant="h5">Both</Typography>
      </HighContrastDemo>
    </DemoSection>
  ),
};

export const ReducedTransparencyMixin: Story = {
  render: () => (
    <DemoSection>
      <Typography variant="h4">reducedTransparency Mixin</Typography>
       <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Simulates reduced transparency modes (forced enabled for demo):
        </Typography>
      <ReducedTransparencyDemo theme={mockTheme} type="solid">
        <Typography variant="h5">Solid Background</Typography>
      </ReducedTransparencyDemo>
      <ReducedTransparencyDemo theme={mockTheme} type="increase">
        <Typography variant="h5">Increased Opacity</Typography>
      </ReducedTransparencyDemo>
      <ReducedTransparencyDemo theme={mockTheme} type="pattern">
        <Typography variant="h5">Pattern Background</Typography>
      </ReducedTransparencyDemo>
    </DemoSection>
  ),
};

export const FocusStylesMixin: Story = {
  render: () => (
    <DemoSection>
      <Typography variant="h4">focusStyles Mixin</Typography>
      <Typography variant="body1" style={{ marginBottom: '16px' }}>
        Tab to focus buttons:
      </Typography>
      <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
        <StyledFocusButton theme={mockTheme} focusType="outline">Outline</StyledFocusButton>
        <StyledFocusButton theme={mockTheme} focusType="ring">Ring</StyledFocusButton>
        <StyledFocusButton theme={mockTheme} focusType="border">Border</StyledFocusButton>
        <StyledFocusButton theme={mockTheme} focusType="highlight">Highlight</StyledFocusButton> { /* Added highlight based on original code */ }
      </Stack>
    </DemoSection>
  ),
};

export const ReducedMotionSupport: Story = {
    render: () => {
        const [reducedMotion, setReducedMotion] = useState(false);
        return (
            <DemoSection>
                <Typography variant="h4">Reduced Motion Support (Demo)</Typography>
                <Button onClick={() => setReducedMotion(!reducedMotion)} style={{ marginBottom: '16px' }}>
                    Toggle Reduced Motion (Currently: {reducedMotion ? 'ON' : 'OFF'})
                </Button>
                <ReducedMotionSection>
                    <Typography variant="h5">Animated Examples</Typography>
                     <Typography variant="body1" style={{ marginBottom: '16px' }}>
                        Animations adapt based on the toggle above:
                    </Typography>
                    <Stack direction="row" spacing={2} style={{ flexWrap: 'wrap' }}>
                        <Box style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', animation: reducedMotion ? 'none' : 'pulse 2s infinite ease-in-out' }}>
                            <Typography variant="body1">Pulsing</Typography>
                        </Box>
                        <Box style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', animation: reducedMotion ? 'none' : 'slideIn 2s infinite alternate ease-in-out', opacity: reducedMotion ? 0.7 : 1 }}>
                            <Typography variant="body1">Sliding</Typography>
                        </Box>
                        <Box style={{ padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', animation: reducedMotion ? 'fadeOnly 2s infinite alternate ease-in-out' : 'spin 2s infinite linear' }}>
                            <Typography variant="body1">Spin/Fade</Typography>
                        </Box>
                    </Stack>
                </ReducedMotionSection>
            </DemoSection>
        );
    }
};

// Note: visualFeedback and textStyles mixins were less visually distinct in the demo code
// Adding basic stories for completeness, but they might need more specific examples.

export const VisualFeedbackMixin: Story = {
  render: () => (
    <DemoSection>
      <Typography variant="h4">visualFeedback Mixin (Example)</Typography>
      <VisualFeedbackDemo theme={mockTheme} type="highlight">
          <Typography variant="body1">Highlight Feedback</Typography>
      </VisualFeedbackDemo>
      <VisualFeedbackDemo theme={mockTheme} type="ripple">
          <Typography variant="body1">Ripple Feedback</Typography>
      </VisualFeedbackDemo>
    </DemoSection>
  ),
};

export const TextStylesMixin: Story = {
  render: () => (
    <DemoSection>
      <Typography variant="h4">textStyles Mixin (Example)</Typography>
      <TextStylesDemo theme={mockTheme} variant="title">
        Title Text Style (Gradient)
      </TextStylesDemo>
      <TextStylesDemo theme={mockTheme} variant="glassSubtitle">
        Glass Subtitle Style
      </TextStylesDemo>
       <TextStylesDemo theme={mockTheme} variant="bodyEmphasized">
        Body Emphasized Style
      </TextStylesDemo>
    </DemoSection>
  ),
}; 