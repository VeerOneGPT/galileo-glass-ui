import React, { useState } from 'react';
import styled from 'styled-components';

import {
  ThemeProvider,
  ThemeTransition,
  ThemePerformanceMonitor,
  useTheme,
  useColorMode,
  useThemeVariant,
  useGlassEffects,
  useResponsive,
} from '../theme';

// Styled components for the demo
const DemoContainer = styled.div`
  padding: 24px;
  min-height: 100vh;
  background-color: ${props => (props.theme.isDarkMode ? '#0F172A' : '#F1F5F9')};
  color: ${props => (props.theme.isDarkMode ? '#E2E8F0' : '#1E293B')};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Title = styled.h1`
  font-family: ${props => props.theme.typography.fontFamily};
  font-size: 2rem;
  margin-bottom: 24px;
`;

const Section = styled.section`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  border-bottom: 1px solid
    ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  padding-bottom: 8px;
`;

const ControlPanel = styled.div`
  background-color: ${props =>
    props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const Button = styled.button`
  background-color: ${props => (props.theme.isDarkMode ? '#3B82F6' : '#2563EB')};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: ${props => (props.theme.isDarkMode ? '#60A5FA' : '#3B82F6')};
  }

  &:active {
    background-color: ${props => (props.theme.isDarkMode ? '#2563EB' : '#1D4ED8')};
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid
    ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)')};
  background-color: ${props => (props.theme.isDarkMode ? '#1E293B' : '#FFFFFF')};
  color: ${props => (props.theme.isDarkMode ? '#E2E8F0' : '#1E293B')};
  min-width: 150px;
`;

const Card = styled.div`
  background-color: ${props =>
    props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px
    ${props => (props.theme.isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)')};
  backdrop-filter: blur(10px);
  border: 1px solid
    ${props => (props.theme.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

// Theme info component - uses specific context hooks for optimization
const ThemeInfo = () => {
  // Use specific hook for color mode - only re-renders when color mode changes
  const { colorMode, isDarkMode, toggleColorMode } = useColorMode();

  // Use specific hook for theme variant - only re-renders when theme variant changes
  const { themeVariant, setThemeVariant, availableThemes } = useThemeVariant();

  // Use specific hook for glass effects - only re-renders when glass effects change
  const { qualityTier, setQualityTier } = useGlassEffects();

  // Use specific hook for responsive info - only re-renders on breakpoint changes
  const { currentBreakpoint, isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <Card>
      <SectionTitle>Theme Information</SectionTitle>

      <InfoGrid>
        <div>
          <h3>Color Mode</h3>
          <p>Current Mode: {colorMode}</p>
          <p>Is Dark: {isDarkMode ? 'Yes' : 'No'}</p>
          <Button onClick={toggleColorMode}>Toggle Dark Mode</Button>
        </div>

        <div>
          <h3>Theme Variant</h3>
          <p>Current Variant: {themeVariant}</p>
          <Select value={themeVariant} onChange={e => setThemeVariant(e.target.value)}>
            {availableThemes.map(theme => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <h3>Glass Quality</h3>
          <p>Current Tier: {qualityTier}</p>
          <Select value={qualityTier} onChange={e => setQualityTier(e.target.value as any)}>
            <option value="ultra">Ultra</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="minimal">Minimal</option>
          </Select>
        </div>

        <div>
          <h3>Responsive</h3>
          <p>Current Breakpoint: {currentBreakpoint}</p>
          <p>
            Device Type:{' '}
            {isMobile ? 'Mobile' : isTablet ? 'Tablet' : isDesktop ? 'Desktop' : 'Unknown'}
          </p>
        </div>
      </InfoGrid>
    </Card>
  );
};

// ThemeObserver example - updates without re-rendering
const ThemeObserverExample = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [lastUpdate, setLastUpdate] = useState('');

  // Import the useThemeObserver hook
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw function that updates with theme
    const draw = (isDark: boolean) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set colors based on theme
      const bgColor = isDark ? '#1E293B' : '#F8FAFC';
      const primaryColor = isDark ? '#60A5FA' : '#2563EB';
      const accentColor = isDark ? '#A78BFA' : '#7C3AED';

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw circles
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(100, 75, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(200, 75, 30, 0, Math.PI * 2);
      ctx.fill();

      // Update last update time
      setLastUpdate(new Date().toLocaleTimeString());
    };

    // Initial draw
    draw(document.documentElement.classList.contains('dark-mode'));

    // Observer setup for theme changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark-mode');
          draw(isDark);
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return (
    <Card>
      <SectionTitle>Theme Observer Example</SectionTitle>
      <p>This canvas updates when theme changes without re-rendering the React component.</p>
      <p>Last Update: {lastUpdate}</p>
      <canvas ref={canvasRef} width={300} height={150} style={{ border: '1px solid #ccc' }} />
    </Card>
  );
};

// Theme transition example
const TransitionDemo = () => {
  const { currentTheme, isDark } = useTheme();

  return (
    <Card>
      <SectionTitle>Theme Transition Demo</SectionTitle>
      <p>Change theme or color mode to see transitions.</p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
        <Card style={{ flex: '1', minWidth: '200px' }}>
          <h3>Fade Transition</h3>
          <ThemeTransition duration={300} transitionType="fade">
            <div
              style={{
                padding: '16px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              }}
            >
              <p>Current Theme: {currentTheme}</p>
              <p>Dark Mode: {isDark ? 'Yes' : 'No'}</p>
            </div>
          </ThemeTransition>
        </Card>

        <Card style={{ flex: '1', minWidth: '200px' }}>
          <h3>Zoom Transition</h3>
          <ThemeTransition duration={400} transitionType="zoom">
            <div
              style={{
                padding: '16px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              }}
            >
              <p>Current Theme: {currentTheme}</p>
              <p>Dark Mode: {isDark ? 'Yes' : 'No'}</p>
            </div>
          </ThemeTransition>
        </Card>

        <Card style={{ flex: '1', minWidth: '200px' }}>
          <h3>Slide Transition</h3>
          <ThemeTransition duration={400} transitionType="slide" slideDirection="up">
            <div
              style={{
                padding: '16px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              }}
            >
              <p>Current Theme: {currentTheme}</p>
              <p>Dark Mode: {isDark ? 'Yes' : 'No'}</p>
            </div>
          </ThemeTransition>
        </Card>
      </div>
    </Card>
  );
};

/**
 * ThemeProviderDemo
 *
 * Demonstrates the complete ThemeProvider system with all its features.
 */
const ThemeProviderDemo = () => {
  // State for URL-based theme
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  return (
    <ThemeProvider
      initialColorMode="light"
      initialTheme="standard"
      enableAutoDetection={true}
      respectSystemPreference={true}
      disableTransitions={false}
      enableScrollOptimization={true}
      initialQualityTier="high"
      debug={true}
      performanceMonitoring={true}
    >
      <DemoContainer>
        <Title>Galileo Glass UI - ThemeProvider Demo</Title>

        <ControlPanel>
          <Button onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}>
            {showPerformanceMonitor ? 'Hide' : 'Show'} Performance Monitor
          </Button>
        </ControlPanel>

        <Section>
          <ThemeInfo />
        </Section>

        <Section>
          <TransitionDemo />
        </Section>

        <Section>
          <ThemeObserverExample />
        </Section>

        {showPerformanceMonitor && <ThemePerformanceMonitor position="bottom-right" />}
      </DemoContainer>
    </ThemeProvider>
  );
};

export default ThemeProviderDemo;
