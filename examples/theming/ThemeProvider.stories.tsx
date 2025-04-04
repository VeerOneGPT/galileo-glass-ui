import React, { useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider as ScThemeProvider } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';
// Adjust paths as needed
import {
  ThemeProvider,
  ThemeTransition,
  ThemePerformanceMonitor,
  useTheme,
  useColorMode,
  useThemeVariant,
  useGlassEffects,
  useResponsive,
  // Don't import themes directly since they aren't exported
} from '../../src/theme';
import { Paper } from '../../src/components/Paper';
import { GlassButton } from '../../src/components/Button';
import { Select, SelectOption } from '../../src/components/Select';
import { Typography } from '../../src/components/Typography';

// --- Styled Components (Adapted, using theme from context) ---
const StoryContainer = styled.div`
  /* ThemeProvider applies background/color */
  padding: 2rem;
  min-height: 100vh;
  /* Use theme variables for transition */
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Title = styled(Typography).attrs({ variant: 'h3' })`
  text-align: center;
  margin-bottom: 2rem;
`;

const Section = styled(Paper)`
  margin-bottom: 2rem;
  padding: 1.5rem;
`;

const SectionTitle = styled(Typography).attrs({ variant: 'h5' })`
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ControlPanel = styled(Section)`
  background-color: ${({ theme }) => theme.colors.backgroundVariant};
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoCard = styled.div`
    background-color: ${({ theme }) => theme.colors.backgroundVariant};
    padding: 1rem;
    border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    border: 1px solid ${({ theme }) => theme.colors.border};
`;

const CanvasWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    canvas {
        border: 1px solid ${({ theme }) => theme.colors.border};
        border-radius: 4px;
    }
`;

const TransitionCard = styled(Paper)`
    flex: 1;
    min-width: 200px;
    padding: 1rem;
    background: ${({ theme }) => theme.colors.backgroundVariant};
`;

// --- Theme Info Component (Internal) ---
const ThemeInfoComponent: React.FC = () => {
  const { colorMode, isDarkMode, toggleColorMode } = useColorMode();
  const { themeVariant, setThemeVariant, availableThemes } = useThemeVariant();
  const { qualityTier, setQualityTier } = useGlassEffects();
  const { currentBreakpoint, isMobile, isTablet, isDesktop } = useResponsive();
  const theme = useTheme(); // Get full theme object if needed

  const qualityOptions: SelectOption[] = [
    { value: 'ultra', label: 'Ultra' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'minimal', label: 'Minimal' },
  ];

  const themeOptions: SelectOption[] = availableThemes.map(t => ({ value: t, label: t }));

  return (
    <InfoGrid>
      <InfoCard>
        <Typography variant="h6">Color Mode</Typography>
        <Typography variant="body2">Mode: {colorMode}</Typography>
        <Typography variant="body2">Dark: {isDarkMode ? 'Yes' : 'No'}</Typography>
        <GlassButton onClick={toggleColorMode} size="small" style={{ marginTop: '0.5rem' }}>Toggle Mode</GlassButton>
      </InfoCard>

      <InfoCard>
        <Typography variant="h6">Theme Variant</Typography>
        <Typography variant="body2">Variant: {themeVariant}</Typography>
        <Select
          value={themeVariant}
          onChange={(value) => setThemeVariant(value)}
          options={themeOptions}
          placeholder="Select Theme"
          size="small"
        />
      </InfoCard>

      <InfoCard>
        <Typography variant="h6">Glass Quality</Typography>
        <Typography variant="body2">Tier: {qualityTier}</Typography>
        <Select
          value={qualityTier}
          onChange={(value) => setQualityTier(value as any)}
          options={qualityOptions}
          placeholder="Select Quality"
          size="small"
        />
      </InfoCard>

      <InfoCard>
        <Typography variant="h6">Responsive</Typography>
        <Typography variant="body2">Breakpoint: {currentBreakpoint}</Typography>
        <Typography variant="body2">
          Type: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : isDesktop ? 'Desktop' : 'Unknown'}
        </Typography>
      </InfoCard>
    </InfoGrid>
  );
};

// --- Theme Observer Example (Internal) ---
const ThemeObserverExampleComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastUpdate, setLastUpdate] = useState('N/A');
  const theme = useTheme(); // Get the current theme directly

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Use the theme from the context - access properties safely
      const bgColor = theme.getColor('backgroundVariant', '#1e1e1e');
      const primaryColor = theme.getColor('primary', '#6366f1');
      const accentColor = theme.getColor('secondary', '#ec4899');

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = primaryColor;
      ctx.beginPath(); ctx.arc(100, 75, 50, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = accentColor;
      ctx.beginPath(); ctx.arc(200, 75, 30, 0, Math.PI * 2); ctx.fill();
      setLastUpdate(new Date().toLocaleTimeString());
    };

    // Initial draw with current theme from the hook
    draw();
    
    // Re-draw when theme changes (via the hook dependencies)
  }, [theme]);

  return (
     <CanvasWrapper>
        <Typography variant="body2">Observer Canvas (updates with theme changes)</Typography>
        <canvas ref={canvasRef} width={300} height={150} />
        <Typography variant="caption">Last Update: {lastUpdate}</Typography>
    </CanvasWrapper>
  );
};

// --- Theme Transition Demo (Internal) ---
const TransitionDemoComponent: React.FC = () => {
  const { currentTheme, isDark } = useTheme();

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <TransitionCard elevation={2}>
        <Typography variant="h6">Fade</Typography>
        <ThemeTransition duration={300} transitionType="fade">
          <div> {/* Content needs a wrapper for transition */} 
             <Typography variant="body2">Theme: {currentTheme}</Typography>
             <Typography variant="body2">Mode: {isDark ? 'Dark' : 'Light'}</Typography>
          </div>
        </ThemeTransition>
      </TransitionCard>

      <TransitionCard elevation={2}>
        <Typography variant="h6">Zoom</Typography>
        <ThemeTransition duration={400} transitionType="zoom">
           <div>
             <Typography variant="body2">Theme: {currentTheme}</Typography>
             <Typography variant="body2">Mode: {isDark ? 'Dark' : 'Light'}</Typography>
           </div>
        </ThemeTransition>
      </TransitionCard>

      <TransitionCard elevation={2}>
        <Typography variant="h6">Slide Up</Typography>
        <ThemeTransition duration={400} transitionType="slide" slideDirection="up">
          <div>
            <Typography variant="body2">Theme: {currentTheme}</Typography>
            <Typography variant="body2">Mode: {isDark ? 'Dark' : 'Light'}</Typography>
          </div>
        </ThemeTransition>
      </TransitionCard>
    </div>
  );
};

// --- Main Story Component ---
interface ThemeProviderStoryProps {
    initialColorMode?: 'light' | 'dark' | 'system';
    initialTheme?: string;
    respectSystemPreference?: boolean;
    disableTransitions?: boolean;
    enableScrollOptimization?: boolean;
    initialQualityTier?: 'ultra' | 'high' | 'medium' | 'low' | 'minimal';
    enablePerformanceMonitor?: boolean;
}

const ThemeProviderDemoComponent: React.FC<ThemeProviderStoryProps> = (props) => {
  const [monitorVisible, setMonitorVisible] = useState(props.enablePerformanceMonitor);

  // Update monitor visibility if prop changes
  useEffect(() => {
    setMonitorVisible(props.enablePerformanceMonitor);
  }, [props.enablePerformanceMonitor]);

  return (
    <ThemeProvider
      initialColorMode={props.initialColorMode}
      initialTheme={props.initialTheme}
      respectSystemPreference={props.respectSystemPreference}
      disableTransitions={props.disableTransitions}
      enableScrollOptimization={props.enableScrollOptimization}
      initialQualityTier={props.initialQualityTier}
      performanceMonitoring={monitorVisible} // Use state here
      // Assuming themes are registered or passed if needed
      // availableThemes={{ standard: standardTheme, dark: darkTheme, ... }}
    >
      {/* StoryContainer now gets theme styles from ThemeProvider */}
      <StoryContainer>
        <Title>ThemeProvider System Demo</Title>

        <ControlPanel elevation={2}>
          <Typography variant="body1">Controls:</Typography>
          <GlassButton onClick={() => setMonitorVisible(!monitorVisible)} size="small">
            {monitorVisible ? 'Hide' : 'Show'} Perf Monitor
          </GlassButton>
          {/* More controls can be added here if needed, e.g., forcing a theme */} 
        </ControlPanel>

        <Section elevation={1}>
          <SectionTitle>Theme Information & Controls</SectionTitle>
          <ThemeInfoComponent />
        </Section>

        <Section elevation={1}>
          <SectionTitle>Theme Transitions</SectionTitle>
          <TransitionDemoComponent />
        </Section>

        <Section elevation={1}>
          <SectionTitle>Theme Observer Pattern</SectionTitle>
          <ThemeObserverExampleComponent />
        </Section>

        {/* Conditionally render based on state, not prop, so button works */}
        {monitorVisible && <ThemePerformanceMonitor position="bottom-right" />}
      </StoryContainer>
    </ThemeProvider>
  );
};

// --- Storybook Configuration ---
export default {
  title: 'Theming/ThemeProvider',
  component: ThemeProviderDemoComponent,
  decorators: [
    // No top-level ThemeProvider needed here, the component itself provides it.
    // However, Storybook needs *a* theme for its UI, so we wrap in a basic one.
    (Story) => (
       <ScThemeProvider theme={mockDarkTheme}>
           <Story />
       </ScThemeProvider>
    )
  ],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    initialColorMode: {
        control: 'select',
        options: ['light', 'dark', 'system'],
        description: 'Initial color mode setting.',
        defaultValue: 'system',
        table: { category: 'Initialization' }
    },
    initialTheme: {
        control: 'text', // Or select if themes are known
        description: 'Name of the initial theme variant.',
        defaultValue: 'standard',
         table: { category: 'Initialization' }
    },
    initialQualityTier: {
        control: 'select',
        options: ['ultra', 'high', 'medium', 'low', 'minimal'],
        description: 'Initial quality tier for glass effects.',
        defaultValue: 'high',
         table: { category: 'Initialization' }
    },
    respectSystemPreference: {
        control: 'boolean',
        description: 'Whether to use system color mode preference.',
        defaultValue: true,
        table: { category: 'Behavior' }
    },
    disableTransitions: {
        control: 'boolean',
        description: 'Globally disable theme transitions.',
        defaultValue: false,
        table: { category: 'Behavior' }
    },
    enableScrollOptimization: {
        control: 'boolean',
        description: 'Enable optimizations during scrolling.',
        defaultValue: true,
        table: { category: 'Performance' }
    },
    enablePerformanceMonitor: {
        control: 'boolean',
        description: 'Show the theme performance monitor overlay.',
        defaultValue: false,
        table: { category: 'Performance' }
    }
  }
} as Meta<typeof ThemeProviderDemoComponent>;

// --- Stories ---
const Template: StoryFn<ThemeProviderStoryProps> = (args) => <ThemeProviderDemoComponent {...args} />;

export const Default = Template.bind({});
Default.args = {
  // Uses defaults from argTypes
};

export const DarkModeDefault = Template.bind({});
DarkModeDefault.args = {
  initialColorMode: 'dark',
};

export const TransitionsDisabled = Template.bind({});
TransitionsDisabled.args = {
  disableTransitions: true,
};

export const PerformanceMonitorEnabled = Template.bind({});
PerformanceMonitorEnabled.args = {
  enablePerformanceMonitor: true,
};

// Create a mock darkTheme similar to the one used in PointerFollow.stories.tsx
const mockDarkTheme = {
  colors: {
    background: '#121212',
    backgroundVariant: '#1e1e1e',
    primary: '#6366f1',
    secondary: '#ec4899',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  },
  shape: {
    borderRadius: 8,
  },
  shadows: {
    small: '0 2px 5px rgba(0, 0, 0, 0.2)',
    medium: '0 4px 10px rgba(0, 0, 0, 0.3)',
    large: '0 8px 20px rgba(0, 0, 0, 0.4)'
  }
}; 