import React, { useState } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// Import hook and types (using relative paths)
import { 
  useAccessibleFocusAnimation,
  FocusAnimationStyle,
  FocusAnimationIntensity,
  focusAnimation // Mixin
} from '../../src/animations/accessibility/AccessibleFocusAnimation'; // Adjust path as needed
import { useReducedMotion } from '../../src/animations/accessibility/useReducedMotion'; // Adjust path as needed
import { useHighContrast } from '../../src/animations/accessibility/useHighContrast'; // Adjust path as needed

// --- Styled Components (condensed from demo) ---
const DemoContainer = styled.div` /* ... */ `;
const ControlsSection = styled.div` /* ... */ `;
const ControlRow = styled.div` /* ... */ `;
const ControlGroup = styled.div` /* ... */ `;
const Label = styled.label` /* ... */ `;
const Select = styled.select` /* ... */ `;
const ToggleContainer = styled.label` /* ... */ `;
const ToggleSwitch = styled.div<{ $checked: boolean }>` /* ... */ `;
const ColorInputContainer = styled.div` /* ... */ `;
const ColorInput = styled.input` /* ... */ `;
const DemoSection = styled.div` /* ... */ `;
const ElementsGrid = styled.div` /* ... */ `;
const FocusButton = styled.button<{ $customFocusStyle: any; $highVisibility: boolean }>` /* ... */ `;
const FocusInput = styled.input<{ $customFocusStyle: any; }>` /* ... */ `;
const FocusLink = styled.a<{ $customFocusStyle: any; }>` /* ... */ `;
const DynamicCard = styled.div<{ $focusCSS: any }>` /* ... */ `;
const StatusIndicator = styled.div<{ $active: boolean }>` /* ... */ `;
const StatusDisplay = styled.div` /* ... */ `;

// Mock Theme
const mockTheme: DefaultTheme = { /* ... basic theme structure ... */ };

// --- Story Component ---
const AccessibleFocusStoryComponent: React.FC = () => {
    const [focusStyle, setFocusStyle] = useState<FocusAnimationStyle>(FocusAnimationStyle.OUTLINE_PULSE);
    const [intensity, setIntensity] = useState<FocusAnimationIntensity>(FocusAnimationIntensity.STANDARD);
    const [primaryColor, setPrimaryColor] = useState<string>('#0078FF');
    const [secondaryColor, setSecondaryColor] = useState<string>('#C6E0FF');
    const [highVisibility, setHighVisibility] = useState<boolean>(false);
    
    const { prefersReducedMotion, setAppReducedMotion, appReducedMotion } = useReducedMotion();
    const { isHighContrast, setHighContrast, appHighContrast } = useHighContrast();

    // Generate focus styles dynamically based on controls using the MIXIN
    const dynamicFocusCSS = focusAnimation({
        style: focusStyle,
        intensity: intensity,
        color: primaryColor,
        secondaryColor: secondaryColor,
        highVisibility: highVisibility,
        // We let the mixin handle reducedMotion/highContrast internally based on context/prefs
    });

    // Pre-generate styles for specific examples using the MIXIN
    const buttonFocusCSS = focusAnimation({ style: FocusAnimationStyle.GLOW, highVisibility: true, color: primaryColor, secondaryColor });
    const inputFocusCSS = focusAnimation({ style: FocusAnimationStyle.BORDER, intensity: FocusAnimationIntensity.STRONG, color: primaryColor });
    const linkFocusCSS = focusAnimation({ style: FocusAnimationStyle.UNDERLINE, duration: 500, color: primaryColor });

    const allFocusStyles = Object.values(FocusAnimationStyle);

    return (
        <DemoContainer>
            <h2>Accessible Focus Animation</h2>
            <p>Focus animations adapt to user accessibility preferences.</p>

            <ControlsSection>
                 <h3>Customize Focus Animation</h3>
                 <ControlRow>
                     <ControlGroup>
                         <Label htmlFor="focus-style">Style:</Label>
                         <Select id="focus-style" value={focusStyle} onChange={(e) => setFocusStyle(e.target.value as FocusAnimationStyle)}>
                             {allFocusStyles.map(style => <option key={style} value={style}>{style.replace('_',' ').toUpperCase()}</option>)} 
                         </Select>
                     </ControlGroup>
                     <ControlGroup>
                         <Label htmlFor="intensity">Intensity:</Label>
                         <Select id="intensity" value={intensity} onChange={(e) => setIntensity(e.target.value as FocusAnimationIntensity)}>
                             {Object.values(FocusAnimationIntensity).map(level => <option key={level} value={level}>{level.toUpperCase()}</option>)} 
                         </Select>
                     </ControlGroup>
                 </ControlRow>
                 <ControlRow>
                     <ControlGroup>
                         <Label htmlFor="primary-color">Primary Color:</Label>
                         <ColorInputContainer><ColorInput type="color" id="primary-color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} /><span>{primaryColor}</span></ColorInputContainer>
                     </ControlGroup>
                     <ControlGroup>
                         <Label htmlFor="secondary-color">Secondary Color:</Label>
                         <ColorInputContainer><ColorInput type="color" id="secondary-color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} /><span>{secondaryColor}</span></ColorInputContainer>
                     </ControlGroup>
                 </ControlRow>
                 <ControlRow>
                     <ControlGroup>
                         <ToggleContainer><ToggleSwitch $checked={highVisibility} onClick={() => setHighVisibility(!highVisibility)} /><span>High Visibility</span></ToggleContainer>
                     </ControlGroup>
                     <ControlGroup>
                         <ToggleContainer><ToggleSwitch $checked={appReducedMotion} onClick={() => setAppReducedMotion(!appReducedMotion)} /><span>Reduced Motion</span></ToggleContainer>
                     </ControlGroup>
                     <ControlGroup>
                         <ToggleContainer><ToggleSwitch $checked={appHighContrast} onClick={() => setHighContrast(!appHighContrast)} /><span>High Contrast</span></ToggleContainer>
                     </ControlGroup>
                 </ControlRow>
            </ControlsSection>

            <DemoSection>
                 <h3>Dynamic Focus Example</h3>
                 <p>Tab through elements. Focus style uses above controls.</p>
                 <ElementsGrid>
                    <DynamicCard tabIndex={0} $focusCSS={dynamicFocusCSS}>Dynamic Card</DynamicCard>
                    <FocusButton $customFocusStyle={buttonFocusCSS} $highVisibility={true}>Focus Button</FocusButton>
                    <FocusInput placeholder="Focus Input" $customFocusStyle={inputFocusCSS} />
                    <FocusLink href="#" tabIndex={0} $customFocusStyle={linkFocusCSS}>Focus Link</FocusLink>
                 </ElementsGrid>
            </DemoSection>
            
            <DemoSection>
                <h3>All Focus Styles</h3>
                 <p>Tab through to see all styles with current settings.</p>
                <ElementsGrid>
                    {allFocusStyles.map(style => (
                        <DynamicCard key={style} tabIndex={0} $focusCSS={focusAnimation({ style, intensity, color: primaryColor, secondaryColor, highVisibility })}>
                           {style.replace('_', ' ').toUpperCase()}
                        </DynamicCard>
                    ))}
                </ElementsGrid>
            </DemoSection>

             <StatusDisplay>
                 <h3>Accessibility Status</h3>
                 <p><StatusIndicator $active={appReducedMotion} style={{ backgroundColor: appReducedMotion ? '#4CAF50' : '#ccc' }} /> Reduced Motion: {appReducedMotion ? 'On' : 'Off'} (System: {prefersReducedMotion ? 'On' : 'Off'})</p>
                 <p><StatusIndicator $active={appHighContrast} style={{ backgroundColor: appHighContrast ? '#4CAF50' : '#ccc' }} /> High Contrast: {appHighContrast ? 'On' : 'Off'} (Effective: {isHighContrast ? 'On' : 'Off'})</p>
                 <p><StatusIndicator $active={highVisibility} style={{ backgroundColor: highVisibility ? '#4CAF50' : '#ccc' }}/> High Visibility Mode: {highVisibility ? 'On' : 'Off'}</p>
             </StatusDisplay>
        </DemoContainer>
    );
};

// --- Storybook Meta Configuration ---
const meta: Meta<typeof AccessibleFocusStoryComponent> = {
  title: 'Accessibility/Accessible Focus Animation',
  component: AccessibleFocusStoryComponent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Demonstrates focus animations that adapt to user accessibility preferences (reduced motion, high contrast) using `useAccessibleFocusAnimation` or the `focusAnimation` mixin.',
      },
    },
  },
   decorators: [
    (Story) => (<ThemeProvider theme={mockTheme}><Story /></ThemeProvider>)
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 