import React, { useState, useCallback, useEffect } from 'react';
import styled, { css, keyframes, createGlobalStyle, DefaultTheme, ThemeProvider } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// Import hook and types (using relative paths)
import { 
  useVestibularFallback,
  vestibularFallback, // Mixin for direct application
  FeedbackType, 
  StateChangeType, 
  ImportanceLevel,
  setVestibularFallbackPreferences,
  getVestibularFallbackPreferences,
  resetVestibularFallbackPreferences
} from '../../src/animations/accessibility/VestibularFallbacks'; // Adjust path as needed
import { useReducedMotion } from '../../src/animations/accessibility/useReducedMotion'; // Adjust path as needed
import { AnimationCategory } from '../../src/animations/accessibility/MotionSensitivity'; // Adjust path as needed

// --- Styled Components (from original demo) ---

// Type Aliases for potentially unexported mixin option types (using any)

// Add Mock Theme definition
const mockTheme: DefaultTheme = {
    isDarkMode: false, colorMode: 'light', themeVariant: 'nebula',
    colors: { nebula: { accentPrimary: '#6366F1', accentSecondary: '#8B5CF6', accentTertiary: '#EC4899', stateCritical: '#EF4444', stateOptimal: '#10B981', stateAttention: '#F59E0B', stateInformational: '#3B82F6', neutralBackground: '#F9FAFB', neutralForeground: '#1F2937', neutralBorder: '#E5E7EB', neutralSurface: '#FFFFFF' }, glass: { light: { background: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', highlight: 'rgba(255, 255, 255, 0.3)', shadow: 'rgba(0, 0, 0, 0.1)', glow: 'rgba(255, 255, 255, 0.2)' }, dark: { background: 'rgba(0, 0, 0, 0.2)', border: 'rgba(255, 255, 255, 0.1)', highlight: 'rgba(255, 255, 255, 0.1)', shadow: 'rgba(0, 0, 0, 0.3)', glow: 'rgba(255, 255, 255, 0.1)' }, tints: { primary: 'rgba(99, 102, 241, 0.1)', secondary: 'rgba(139, 92, 246, 0.1)' } } },
    zIndex: { hide: -1, auto: 'auto', base: 0, docked: 10, dropdown: 1000, sticky: 1100, banner: 1200, overlay: 1300, modal: 1400, popover: 1500, skipLink: 1600, toast: 1700, tooltip: 1800, glacial: 9999 }
};

// Animation keyframes
const slideIn = keyframes` /* ... */ `;
const pulse = keyframes` /* ... */ `;
const shake = keyframes` /* ... */ `;
const spin = keyframes` /* ... */ `;
const bounce = keyframes` /* ... */ `;

const DemoContainer = styled.div` /* ... */ `;
const ControlsSection = styled.div` /* ... */ `;
const ControlRow = styled.div` /* ... */ `;
const Button = styled.button<{ $primary?: boolean }>` /* ... */ `;
const ToggleContainer = styled.label` /* ... */ `;
const ToggleSwitch = styled.div<{ $checked: boolean }>` /* ... */ `;
const StatusBadge = styled.div<{ $active: boolean }>` /* ... */ `;
const ExampleSection = styled.div` /* ... */ `;
const ExampleGrid = styled.div` /* ... */ `;
const CardBase = styled.div` /* ... */ `;
const CardTitle = styled.h4` /* ... */ `;
const DemoArea = styled.div` /* ... */ `;
const CardControls = styled.div` /* ... */ `;
const AnimatedCard = styled(CardBase)<{ $animationType: string }>` /* ... */ `;
const FallbackCard = styled(CardBase)` /* ... */ `;

// Condense styles for brevity in story code
// Keyframes
const slideInKeyframes = keyframes`from{transform:translateX(-50px);opacity:0}to{transform:translateX(0);opacity:1}`; 
const pulseKeyframes = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.05)}`; 
const shakeKeyframes = keyframes`0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}`; 
const spinKeyframes = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`; 
const bounceKeyframes = keyframes`0%,20%,50%,80%,100%{transform:translateY(0)}40%{transform:translateY(-20px)}60%{transform:translateY(-10px)}`; 
// Global styles for animations
const GlobalAnimations = createGlobalStyle`
  @keyframes pulse { ${pulseKeyframes} }
  @keyframes slideIn { ${slideInKeyframes} }
  @keyframes shake { ${shakeKeyframes} }
  @keyframes spin { ${spinKeyframes} }
  @keyframes bounce { ${bounceKeyframes} }
`;
// Layout & Control Styles
const DemoContainerStyled = styled.div`padding: 20px; max-width: 900px; margin: 0 auto; font-family: sans-serif;`; 
const ControlsSectionStyled = styled.div`background: rgba(0, 0, 0, 0.05); border-radius: 8px; padding: 15px; margin-bottom: 20px;`; 
const ControlRowStyled = styled.div`display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; align-items: center;`; 
const ButtonStyled = styled.button<{ $primary?: boolean }>`background: ${props => props.$primary ? '#3498db' : '#f1f1f1'}; color: ${props => props.$primary ? 'white' : 'black'}; border: none; border-radius: 4px; padding: 8px 12px; cursor: pointer; font-weight: ${props => props.$primary ? 'bold' : 'normal'}; &:hover { background: ${props => props.$primary ? '#2980b9' : '#e1e1e1'}; } &:disabled { opacity: 0.5; cursor: not-allowed; }`; 
const ToggleContainerStyled = styled.label`display: flex; align-items: center; cursor: pointer;`; 
const ToggleSwitchStyled = styled.div<{ $checked: boolean }>`position: relative; width: 40px; height: 20px; background: ${({ $checked }) => $checked ? '#4CAF50' : '#ccc'}; border-radius: 20px; transition: background 0.3s; margin-right: 10px; &::after { content: ''; position: absolute; top: 2px; left: ${({ $checked }) => $checked ? '22px' : '2px'}; width: 16px; height: 16px; border-radius: 50%; background: white; transition: left 0.3s; }`; 
const StatusBadgeStyled = styled.div<{ $active: boolean }>`display: inline-block; padding: 4px 8px; border-radius: 12px; background: ${props => props.$active ? '#2ecc71' : '#e74c3c'}; color: white; font-size: 12px; margin-left: 8px;`; 
const ExampleSectionStyled = styled.div`margin-bottom: 30px;`; 
const ExampleGridStyled = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 15px;`; 
const CardBaseStyled = styled.div`padding: 15px; border-radius: 8px; background: white; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; gap: 10px; min-height: 180px;`; 
const CardTitleStyled = styled.h4`margin: 0 0 10px 0;`; 
const DemoAreaStyled = styled.div`flex: 1; display: flex; align-items: center; justify-content: center; position: relative;`; 
const CardControlsStyled = styled.div`display: flex; gap: 10px; margin-top: 10px; justify-content: space-between;`;
// Animation Card
const AnimatedCardStyled = styled(CardBaseStyled)<{ $animationType: string }>`
  .demo-element {
    width: 100px; height: 100px; background: #3498db; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;
    animation-duration: 2s; animation-iteration-count: infinite; animation-fill-mode: both;
    ${props => { switch(props.$animationType) {
        case 'pulse': return css`animation-name: ${pulseKeyframes}; animation-timing-function: ease-in-out;`;
        case 'shake': return css`animation-name: ${shakeKeyframes}; animation-timing-function: ease-in-out;`;
        case 'spin': return css`animation-name: ${spinKeyframes}; animation-timing-function: linear;`;
        case 'bounce': return css`animation-name: ${bounceKeyframes}; animation-timing-function: ease;`;
        case 'slide': return css`animation-name: ${slideInKeyframes}; animation-timing-function: ease-out; animation-iteration-count: 1;`;
        default: return ''; }}}
  }
`;
// Fallback Card (using mixin)
const FallbackCardStyled = styled(CardBaseStyled)`
  .demo-element {
    width: 100px; height: 100px; background: #3498db; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;
    &.color-fallback { ${vestibularFallback({ stateChangeType: StateChangeType.TOGGLE, preferredFallbacks: [FeedbackType.COLOR], color: '#e74c3c', duration: 1000 })} }
    &.border-fallback { ${vestibularFallback({ stateChangeType: StateChangeType.SELECT, preferredFallbacks: [FeedbackType.BORDER], color: '#f39c12', duration: 0 })} }
    &.icon-fallback::before { content: attr(data-icon); margin-right: 5px; }
    &.shadow-fallback { ${vestibularFallback({ stateChangeType: StateChangeType.FOCUS, preferredFallbacks: [FeedbackType.SHADOW], color: 'rgba(0,0,0,0.5)', duration: 0 })} }
    &.opacity-fallback { ${vestibularFallback({ stateChangeType: StateChangeType.APPEAR, preferredFallbacks: [FeedbackType.OPACITY], duration: 0 })} }
  }
`;

// --- Interaction Card Component (from demo) ---
const InteractionCard: React.FC<{
  title: string;
  stateChangeType: StateChangeType;
  importance: ImportanceLevel;
  fallbackTypes: FeedbackType[];
  children: React.ReactNode;
}> = ({ title, stateChangeType, importance, fallbackTypes, children }) => {
  const [isActive, setIsActive] = useState(false);
  const fallback = useVestibularFallback({
    stateChangeType, importance, preferredFallbacks: fallbackTypes,
    duration: stateChangeType === StateChangeType.TOGGLE ? 1500 : 0,
    message: `${title} ${isActive ? 'activated' : 'deactivated'}`
  });
  const handleToggle = useCallback(() => { setIsActive(!isActive); fallback.applyFallback(); }, [isActive, fallback]);
  useEffect(() => { if (isActive && fallback.isActive) fallback.applyFallback(); }, [isActive, fallback]);

  return (
    <CardBaseStyled>
      <CardTitleStyled>{title}</CardTitleStyled>
      <DemoAreaStyled>
        <div 
          className="demo-element" 
          style={{ background: isActive ? '#e74c3c' : '#3498db', ...(fallback.isActive && isActive && { /* Apply dynamic styles if needed */ }) }}
          {...fallback.props}
          onClick={handleToggle}
        >
          {fallback.props['data-icon'] && <span style={{ marginRight: '5px' }}>{fallback.props['data-icon']}</span>}
          {children}
        </div>
      </DemoAreaStyled>
      <CardControlsStyled>
        <ButtonStyled onClick={handleToggle}>{isActive ? 'Deactivate' : 'Activate'}</ButtonStyled>
        <StatusBadgeStyled $active={isActive}>{isActive ? 'Active' : 'Inactive'}</StatusBadgeStyled>
      </CardControlsStyled>
    </CardBaseStyled>
  );
};

// --- Story Component ---
const VestibularFallbacksStoryComponent: React.FC = () => {
    const { prefersReducedMotion, setAppReducedMotion, appReducedMotion, isAnimationAllowed } = useReducedMotion();
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [hapticEnabled, setHapticEnabled] = useState(true);
    const [visualEnabled, setVisualEnabled] = useState(true);

    useEffect(() => {
        const prefs = getVestibularFallbackPreferences();
        setAudioEnabled(prefs.audioEnabled); setHapticEnabled(prefs.hapticEnabled); setVisualEnabled(prefs.visualEnabled);
    }, []);

    useEffect(() => {
        setVestibularFallbackPreferences({ audioEnabled, hapticEnabled, visualEnabled });
    }, [audioEnabled, hapticEnabled, visualEnabled]);

    const handleResetPreferences = useCallback(() => {
        resetVestibularFallbackPreferences();
        const prefs = getVestibularFallbackPreferences();
        setAudioEnabled(prefs.audioEnabled); setHapticEnabled(prefs.hapticEnabled); setVisualEnabled(prefs.visualEnabled);
    }, []);

    return (
        <DemoContainerStyled>
            <h2>Vestibular Fallbacks Demo</h2>
            <p>Shows alternative feedback for users who need to disable animations.</p>

            <ControlsSectionStyled>
                 <h3>Motion and Feedback Controls</h3>
                 <ControlRowStyled>
                    <ToggleContainerStyled>
                        <ToggleSwitchStyled $checked={appReducedMotion} onClick={() => setAppReducedMotion(!appReducedMotion)} />
                        <span>Reduced Motion</span>
                        <StatusBadgeStyled $active={prefersReducedMotion}>{prefersReducedMotion ? 'Enabled' : 'Disabled'}</StatusBadgeStyled>
                    </ToggleContainerStyled>
                    <ToggleContainerStyled><ToggleSwitchStyled $checked={visualEnabled} onClick={() => setVisualEnabled(!visualEnabled)} /><span>Visual Fallbacks</span></ToggleContainerStyled>
                    <ToggleContainerStyled><ToggleSwitchStyled $checked={audioEnabled} onClick={() => setAudioEnabled(!audioEnabled)} /><span>Audio Fallbacks</span></ToggleContainerStyled>
                    <ToggleContainerStyled><ToggleSwitchStyled $checked={hapticEnabled} onClick={() => setHapticEnabled(!hapticEnabled)} /><span>Haptic Fallbacks</span></ToggleContainerStyled>
                    <ButtonStyled onClick={handleResetPreferences}>Reset Preferences</ButtonStyled>
                 </ControlRowStyled>
                 <p><small>Toggle "Reduced Motion" to see how examples change.</small></p>
            </ControlsSectionStyled>

            <ExampleSectionStyled>
                 <h3>Comparison: Animations vs. Fallbacks</h3>
                 <ExampleGridStyled>
                     {/* Pulse */} 
                    <AnimatedCardStyled $animationType="pulse">
                        <CardTitleStyled>Pulse Animation</CardTitleStyled>
                        <DemoAreaStyled><div className="demo-element">Pulse</div></DemoAreaStyled>
                        <CardControlsStyled><StatusBadgeStyled $active={isAnimationAllowed(AnimationCategory.ATTENTION)}>Anim {isAnimationAllowed(AnimationCategory.ATTENTION) ? 'ON' : 'OFF'}</StatusBadgeStyled></CardControlsStyled>
                    </AnimatedCardStyled>
                    <FallbackCardStyled>
                        <CardTitleStyled>Color Fallback</CardTitleStyled>
                        <DemoAreaStyled><div className="demo-element color-fallback">No Motion</div></DemoAreaStyled>
                        <CardControlsStyled><StatusBadgeStyled $active={prefersReducedMotion}>Fallback {prefersReducedMotion ? 'ON' : 'OFF'}</StatusBadgeStyled></CardControlsStyled>
                    </FallbackCardStyled>
                     {/* Shake */} 
                     <AnimatedCardStyled $animationType="shake">/* ... */</AnimatedCardStyled>
                    <FallbackCardStyled>
                         <CardTitleStyled>Border Fallback</CardTitleStyled>
                         <DemoAreaStyled><div className="demo-element border-fallback">No Motion</div></DemoAreaStyled>
                         <CardControlsStyled>/* ... */</CardControlsStyled>
                    </FallbackCardStyled>
                    {/* Spin */} 
                     <AnimatedCardStyled $animationType="spin">/* ... */</AnimatedCardStyled>
                     <FallbackCardStyled>
                         <CardTitleStyled>Icon Fallback</CardTitleStyled>
                         <DemoAreaStyled><div className="demo-element icon-fallback" data-icon="🔄">No Motion</div></DemoAreaStyled>
                         <CardControlsStyled>/* ... */</CardControlsStyled>
                     </FallbackCardStyled>
                 </ExampleGridStyled>
            </ExampleSectionStyled>

            <ExampleSectionStyled>
                <h3>Interactive State Changes</h3>
                <ExampleGridStyled>
                    <InteractionCard title="Toggle" stateChangeType={StateChangeType.TOGGLE} importance={ImportanceLevel.IMPORTANT} fallbackTypes={[FeedbackType.COLOR, FeedbackType.ICON, FeedbackType.ARIA]}>Toggle</InteractionCard>
                    <InteractionCard title="Select" stateChangeType={StateChangeType.SELECT} importance={ImportanceLevel.IMPORTANT} fallbackTypes={[FeedbackType.BORDER, FeedbackType.ARIA, FeedbackType.SOUND]}>Select</InteractionCard>
                    <InteractionCard title="Error" stateChangeType={StateChangeType.ERROR} importance={ImportanceLevel.CRITICAL} fallbackTypes={[FeedbackType.COLOR, FeedbackType.ICON, FeedbackType.SOUND, FeedbackType.HAPTIC]}>Error</InteractionCard>
                    <InteractionCard title="Success" stateChangeType={StateChangeType.SUCCESS} importance={ImportanceLevel.IMPORTANT} fallbackTypes={[FeedbackType.COLOR, FeedbackType.ICON, FeedbackType.ARIA]}>Success</InteractionCard>
                </ExampleGridStyled>
            </ExampleSectionStyled>

        </DemoContainerStyled>
    );
};

// --- Storybook Meta Configuration ---
const meta: Meta<typeof VestibularFallbacksStoryComponent> = {
  title: 'Accessibility/Vestibular Fallbacks',
  component: VestibularFallbacksStoryComponent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Demonstrates vestibular fallbacks providing non-motion feedback (color, border, icon, sound, haptics) when animations are disabled.',
      },
    },
  },
    decorators: [
    (Story) => (
      <ThemeProvider theme={mockTheme}> {/* Add ThemeProvider if needed */} 
         <GlobalAnimations />
         <Story />
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // No args needed, component is self-contained
  },
}; 