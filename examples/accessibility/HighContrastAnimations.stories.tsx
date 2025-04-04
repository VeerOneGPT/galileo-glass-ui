import React, { useState } from 'react';
import styled, { css, DefaultTheme, ThemeProvider } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// Import hook and types (using relative paths)
import { 
  useHighContrast,
  HighContrastAnimationType
} from '../../src/animations/accessibility/useHighContrast'; // Adjust path as needed

// --- Styled Components (condensed from demo) ---
const Container = styled.div` /* ... */ `;
const Title = styled.h1` /* ... */ `;
const Description = styled.p` /* ... */ `;
const Section = styled.section` /* ... */ `;
const SectionTitle = styled.h2` /* ... */ `;
const ControlPanel = styled.div` /* ... */ `;
const ControlRow = styled.div` /* ... */ `;
const Label = styled.label` /* ... */ `;
const Switch = styled.label` /* ... */ `;
const Select = styled.select` /* ... */ `;
const Button = styled.button<{ $primary?: boolean }>` /* ... */ `;
const ExamplesGrid = styled.div` /* ... */ `;
const ExampleCard = styled.div<{ $isAnimating?: boolean }>` /* ... */ `;
const StatusIndicator = styled.div<{ $active: boolean }>` /* ... */ `;
const InfoPanel = styled.div` /* ... */ `;
const InfoItem = styled.div` /* ... */ `;
const InfoLabel = styled.span` /* ... */ `;
const InfoValue = styled.span` /* ... */ `;

// Mock Theme (if needed by components/context)
const mockTheme: DefaultTheme = { /* ... basic theme structure ... */ };

// --- Animation Example Component (from demo) ---
const AnimationExample = ({ 
  title, type, isAnimating, onTrigger, highContrastHook, description
}: { 
  title: string; type: HighContrastAnimationType; isAnimating: boolean;
  onTrigger: () => void; highContrastHook: any; description: string;
}) => {
  const animation = highContrastHook.getHighContrastAnimation({ type, duration: 1000 });
  const ariaAttrs = highContrastHook.getAriaAttributes(description);
  
  return (
    <ExampleCard 
      onClick={onTrigger} $isAnimating={isAnimating}
      // Apply animation styles directly using css prop from styled-components
      css={isAnimating ? css`${animation}` : ''} 
      {...ariaAttrs}
    >
      <StatusIndicator $active={isAnimating} style={{ backgroundColor: isAnimating ? '#4caf50' : '#f44336' }} />
      <h3>{title}</h3>
      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{type}</p>
      <Button>Trigger</Button>
    </ExampleCard>
  );
};

// --- Story Component ---
const HighContrastStoryComponent: React.FC = () => {
    const highContrast = useHighContrast({
        defaultAnimationType: HighContrastAnimationType.BORDER_FOCUS,
        primaryColor: '#000000', // Use colors that contrast with typical light/dark modes
        secondaryColor: '#FFFF00',
        borderWidth: 3, // Slightly thicker for visibility
        duration: 1000, includeAriaAttributes: true
    });

    const { isHighContrast, systemHighContrast, appHighContrast, setHighContrast } = highContrast;
    const [selectedType, setSelectedType] = useState<HighContrastAnimationType>(HighContrastAnimationType.BORDER_FOCUS);
    const [animatingExamples, setAnimatingExamples] = useState<Record<string, boolean>>({});

    const playAnimation = (id: string) => {
        setAnimatingExamples(prev => ({ ...prev, [id]: true }));
        setTimeout(() => { setAnimatingExamples(prev => ({ ...prev, [id]: false })); }, 1500);
    };

    const toggleHighContrast = () => setHighContrast(!appHighContrast);
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value as HighContrastAnimationType);

    const animationExamples = Object.values(HighContrastAnimationType).map(type => ({
        id: type.toLowerCase(),
        title: type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
        type: type,
        description: `Example of ${type}`
    }));

    return (
        <Container>
             <Title>High Contrast Animations</Title>
             <Description>Demonstrates animations that remain perceivable in high contrast mode.</Description>
             
             <Section>
                <SectionTitle>Controls</SectionTitle>
                <ControlPanel>
                     <ControlRow>
                         <Label>System High Contrast:</Label>
                         <StatusIndicator $active={systemHighContrast} style={{ backgroundColor: systemHighContrast ? '#4caf50' : '#f44336' }} />
                         <span>{systemHighContrast ? 'Enabled' : 'Disabled (by OS)'}</span>
                     </ControlRow>
                     <ControlRow>
                         <Label>App High Contrast:</Label>
                         {/* Simple checkbox for story toggle */}
                         <input type="checkbox" checked={appHighContrast} onChange={toggleHighContrast} />
                         <span>{appHighContrast ? 'Enabled' : 'Disabled'}</span>
                     </ControlRow>
                     <ControlRow>
                         <Label>Effective Mode:</Label>
                         <StatusIndicator $active={isHighContrast} style={{ backgroundColor: isHighContrast ? '#4caf50' : '#f44336' }} />
                         <strong>{isHighContrast ? 'High Contrast' : 'Standard'}</strong>
                     </ControlRow>
                      <ControlRow>
                         <Label>Selected Animation Type:</Label>
                         <Select value={selectedType} onChange={handleTypeChange}>
                             {Object.values(HighContrastAnimationType).map(type => (
                                <option key={type} value={type}>{type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}</option>
                             ))}
                         </Select>
                     </ControlRow>
                 </ControlPanel>
            </Section>

            <Section>
                 <SectionTitle>Animation Examples</SectionTitle>
                 <Description>Click on an example to trigger the selected animation type ({selectedType}) in the current mode ({isHighContrast ? 'High Contrast' : 'Standard'}).</Description>
                 <ExamplesGrid>
                     {animationExamples.map(example => (
                        <AnimationExample
                            key={example.id}
                            title={example.title}
                            type={selectedType} // Use selected type for all examples
                            isAnimating={animatingExamples[example.id] || false}
                            onTrigger={() => playAnimation(example.id)}
                            highContrastHook={highContrast}
                            description={example.description}
                        />
                    ))}
                </ExamplesGrid>
            </Section>
        </Container>
    );
};

// --- Storybook Meta Configuration ---
const meta: Meta<typeof HighContrastStoryComponent> = {
  title: 'Accessibility/useHighContrast',
  component: HighContrastStoryComponent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Demonstrates the `useHighContrast` hook providing animations perceivable in high contrast modes.',
      },
    },
  },
  // Add ThemeProvider decorator if components require it
  decorators: [
    (Story) => (<ThemeProvider theme={mockTheme}><Story /></ThemeProvider>)
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