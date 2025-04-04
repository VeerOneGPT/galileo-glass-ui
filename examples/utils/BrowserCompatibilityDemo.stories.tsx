import React, { useState, useEffect, useMemo } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { ThemeProvider } from '../../src/theme';
import { Typography } from '../../src/components/Typography';
import { GlassButton } from '../../src/components/Button';
import {
    detectFeatures,
    getFeatureSupportLevel,
    GLASS_REQUIREMENTS, // Core requirements for glass effect
    FeatureLevel,
    createGlassStyle, // Utility to create styles with fallbacks
    BrowserFeatures
} from '../../src/utils/browserCompatibility';

// --- Styled Components ---
const DemoContainer = styled.div`
  padding: 24px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
`;

const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled(Typography).attrs({ variant: 'h3' })`
  margin-bottom: 16px;
`;

const MetricsCard = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetricValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-family: monospace;
  display: flex;
  align-items: center;
`;

const StatusIndicator = styled.div<{ $status: 'good' | 'warning' | 'critical' }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props =>
    props.$status === 'good' ? props.theme.colors.success : props.$status === 'warning' ? props.theme.colors.warning : props.theme.colors.error};
`;

const GlassDemoElement = styled.div`
  width: 200px;
  height: 150px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text};
  // Styles will be applied dynamically
`;

// --- Compatibility Demo Component ---
const BrowserCompatibilityComponent: React.FC = () => {
  const [features, setFeatures] = useState<BrowserFeatures | null>(null);
  const [demoKey, setDemoKey] = useState(0); // To force re-render of styled element

  // Run feature detection on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFeatures(detectFeatures());
    }
  }, []);

  const refreshFeatures = () => {
    if (typeof window !== 'undefined') {
        setFeatures(detectFeatures());
        setDemoKey(prev => prev + 1); // Force refresh of the demo element
    }
  };

  // Memoize glass style generation
  const glassStyle = useMemo(() => {
    if (!features) return undefined;
    return createGlassStyle(
      {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backgroundOpacity: 0.1,
        blurStrength: 8,
        borderColor: 'rgb(255, 255, 255)',
        borderOpacity: 0.15,
      },
      features
    );
  }, [features, demoKey]); // Re-calculate when features change or forced refresh

  // Explicitly type glassStyle after memoization
  const typedGlassStyle = glassStyle as React.CSSProperties | undefined;

  // Log the full style object for inspection
  useEffect(() => {
    if (glassStyle) {
        console.log('Full Generated Glass Style Object:', glassStyle);
    }
  }, [glassStyle]);

  // Apply only known safe styles directly, log the rest
  const safeStyles: React.CSSProperties = {
      backgroundColor: typedGlassStyle?.backgroundColor, // Use typed variable and optional chaining
      border: typedGlassStyle?.border, // Use typed variable and optional chaining
      // Add other known safe properties if necessary
  };

  if (!features) {
    return <Section><SectionTitle>Loading Browser Compatibility...</SectionTitle></Section>;
  }

  const glassSupportLevel = getFeatureSupportLevel(GLASS_REQUIREMENTS, features);
  const getStatus = (supported: boolean): 'good' | 'warning' | 'critical' => supported ? 'good' : 'critical';
  const getSupportLevelStatus = (level: FeatureLevel): 'good' | 'warning' | 'critical' =>
    level === FeatureLevel.FULL ? 'good' : level === FeatureLevel.PARTIAL ? 'warning' : 'critical';

  return (
    <Section>
      <SectionTitle>Browser Compatibility & Fallbacks</SectionTitle>
      <Typography variant="body1" gutterBottom>
          Demonstrates detection of browser features relevant to Glass UI and applying appropriate styles with fallbacks.
      </Typography>
      <GlassButton onClick={refreshFeatures} variant="outlined">Refresh Detection</GlassButton>

      <MetricsCard>
        <Typography variant="h5" gutterBottom>Detected Features</Typography>
        <MetricRow>
          <MetricLabel>Browser:</MetricLabel>
          <MetricValue>{features.browser} {features.browserVersion}</MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>OS:</MetricLabel>
          <MetricValue>{features.os}</MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>Backdrop Filter:</MetricLabel>
          <MetricValue>
            <StatusIndicator $status={getStatus(features.backdropFilter)} />
            {features.backdropFilter ? 'Supported' : 'Not Supported'}
          </MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>CSS Grid:</MetricLabel>
          <MetricValue>
            <StatusIndicator $status={getStatus(features.cssGrid)} />
            {features.cssGrid ? 'Supported' : 'Not Supported'}
          </MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel>CSS Variables:</MetricLabel>
          <MetricValue>
            <StatusIndicator $status={getStatus(features.cssVariables)} />
            {features.cssVariables ? 'Supported' : 'Not Supported'}
          </MetricValue>
        </MetricRow>
         <MetricRow>
          <MetricLabel>CSS Animations:</MetricLabel>
          <MetricValue>
            <StatusIndicator $status={getStatus(features.cssAnimations)} />
            {features.cssAnimations ? 'Supported' : 'Not Supported'}
          </MetricValue>
        </MetricRow>
         <MetricRow>
          <MetricLabel>Hardware Acceleration:</MetricLabel>
          <MetricValue>
            <StatusIndicator $status={features.hardwareAcceleration ? 'good' : 'warning'} />
            {features.hardwareAcceleration ? 'Available' : 'Limited'}
          </MetricValue>
        </MetricRow>
        <MetricRow>
          <MetricLabel><strong>Glass UI Support:</strong></MetricLabel>
          <MetricValue>
            <StatusIndicator $status={getSupportLevelStatus(glassSupportLevel)} />
            <strong>{glassSupportLevel}</strong>
          </MetricValue>
        </MetricRow>
      </MetricsCard>

      <div style={{ marginTop: '2rem' }}>
        <Typography variant="h5">Glass Effect with Fallbacks Demo</Typography>
        <Typography variant="body2">
          This element uses `createGlassStyle` which applies blur and transparency
          if supported, or a solid fallback background otherwise.
        </Typography>
        <GlassDemoElement style={safeStyles}>
            Styled using createGlassStyle()
        </GlassDemoElement>
      </div>
    </Section>
  );
};

// --- Storybook Configuration ---
export default {
  title: 'Utils/BrowserCompatibility',
  decorators: [
    (Story) => (
      <ThemeProvider initialTheme="standard" initialColorMode="dark">
        <DemoContainer>
             <Typography variant="h2" gutterBottom>Browser Compatibility Utilities</Typography>
            <Story />
        </DemoContainer>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    notes: 'Demonstrates browser feature detection and the createGlassStyle utility for graceful degradation.',
  },
} as Meta;

// --- Story ---
export const Default: StoryFn = () => <BrowserCompatibilityComponent />; 