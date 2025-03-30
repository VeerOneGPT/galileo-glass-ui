/**
 * High Contrast Animations Demo
 * 
 * Demonstrates the useHighContrast hook for creating animations that remain
 * visible and perceivable in high contrast mode.
 */
import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

import { 
  useHighContrast, 
  HighContrastAnimationType
} from '../animations/accessibility/useHighContrast';

// Container styling
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

// Main title styling
const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

// Description text
const Description = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 800px;
`;

// Section styling
const Section = styled.section`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// Section title
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

// Control panel styling
const ControlPanel = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
`;

// Control row layout
const ControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Label styling
const Label = styled.label`
  display: flex;
  align-items: center;
  min-width: 180px;
  margin-right: 1rem;
`;

// Toggle switch styling
const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 0.5rem;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: #2196F3;
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

// Select dropdown styling
const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  min-width: 200px;
`;

// Button styling
const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: ${props => props.$primary ? '#3f51b5' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: ${props => props.$primary ? '#303f9f' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

// Examples grid layout
const ExamplesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

// Example card base styling
const ExampleCard = styled.div<{ $isAnimating?: boolean }>`
  position: relative;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  overflow: hidden;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
`;

// Status indicator styling
const StatusIndicator = styled.div<{ $active: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#4caf50' : '#f44336'};
`;

// Info panel styling
const InfoPanel = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
`;

// Info item styling
const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// Info item label
const InfoLabel = styled.span`
  font-weight: bold;
`;

// Info item value
const InfoValue = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

// High contrast animation example card
const AnimationExample = ({ 
  title, 
  type, 
  isAnimating, 
  onTrigger,
  highContrastHook,
  description
}: { 
  title: string; 
  type: HighContrastAnimationType; 
  isAnimating: boolean;
  onTrigger: () => void;
  highContrastHook: any;
  description: string;
}) => {
  // Get animation CSS from the hook
  const animation = highContrastHook.getHighContrastAnimation({
    type,
    primaryColor: '#ffffff',
    secondaryColor: '#000000',
    duration: 1000
  });
  
  // Get ARIA attributes for accessibility
  const ariaAttrs = highContrastHook.getAriaAttributes(description);
  
  return (
    <ExampleCard 
      onClick={onTrigger} 
      $isAnimating={isAnimating}
      css={isAnimating ? animation : ''}
      {...ariaAttrs}
    >
      <StatusIndicator $active={isAnimating} />
      <h3>{title}</h3>
      <p>{type}</p>
      <Button>Click to Trigger</Button>
    </ExampleCard>
  );
};

/**
 * High Contrast Animations Demo Component
 */
const HighContrastAnimationsDemo: React.FC = () => {
  // Use the high contrast hook
  const highContrast = useHighContrast({
    defaultAnimationType: HighContrastAnimationType.BORDER_FOCUS,
    primaryColor: '#ffffff',
    secondaryColor: '#000000',
    borderWidth: 2,
    duration: 1000,
    iterations: 1,
    easing: 'ease-in-out',
    includeAriaAttributes: true
  });
  
  // Destructure for convenience
  const {
    isHighContrast,
    systemHighContrast,
    appHighContrast,
    setHighContrast
  } = highContrast;
  
  // State for selected animation type
  const [selectedType, setSelectedType] = useState<HighContrastAnimationType>(
    HighContrastAnimationType.BORDER_FOCUS
  );
  
  // State to track which animations are currently playing
  const [animatingExamples, setAnimatingExamples] = useState<Record<string, boolean>>({});
  
  // Play an animation for a specific example
  const playAnimation = (id: string) => {
    setAnimatingExamples(prev => ({
      ...prev,
      [id]: true
    }));
    
    // Reset after animation completes
    setTimeout(() => {
      setAnimatingExamples(prev => ({
        ...prev,
        [id]: false
      }));
    }, 1500); // Animation duration + small buffer
  };
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast(!appHighContrast);
  };
  
  // Handle animation type change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as HighContrastAnimationType);
  };
  
  // Play all animations sequentially
  const playAllAnimations = () => {
    // Get all animation examples
    const examples = Object.keys(HighContrastAnimationType);
    
    // Play each animation with a delay
    examples.forEach((example, index) => {
      setTimeout(() => {
        playAnimation(example);
      }, index * 500);
    });
  };
  
  // Animation examples configuration
  const animationExamples = [
    {
      id: 'border_focus',
      title: 'Border Focus',
      type: HighContrastAnimationType.BORDER_FOCUS,
      description: 'Animation that emphasizes the border to show focus'
    },
    {
      id: 'border_pulse',
      title: 'Border Pulse',
      type: HighContrastAnimationType.BORDER_PULSE,
      description: 'Pulsing border to draw attention'
    },
    {
      id: 'background_flash',
      title: 'Background Flash',
      type: HighContrastAnimationType.BACKGROUND_FLASH,
      description: 'Background color changes to indicate state change'
    },
    {
      id: 'color_inversion',
      title: 'Color Inversion',
      type: HighContrastAnimationType.COLOR_INVERSION,
      description: 'Colors invert to show a toggled state'
    },
    {
      id: 'outline_expansion',
      title: 'Outline Expansion',
      type: HighContrastAnimationType.OUTLINE_EXPANSION,
      description: 'Outline expands to show selection'
    },
    {
      id: 'size_change',
      title: 'Size Change',
      type: HighContrastAnimationType.SIZE_CHANGE,
      description: 'Element changes size to show interaction'
    },
    {
      id: 'color_shift',
      title: 'Color Shift',
      type: HighContrastAnimationType.COLOR_SHIFT,
      description: 'Colors shift to indicate transition'
    },
    {
      id: 'static_indicator',
      title: 'Static Indicator',
      type: HighContrastAnimationType.STATIC_INDICATOR,
      description: 'Non-animated visual indicator'
    },
    {
      id: 'content_reveal',
      title: 'Content Reveal',
      type: HighContrastAnimationType.CONTENT_REVEAL,
      description: 'Content appears with emphasis'
    },
    {
      id: 'text_emphasis',
      title: 'Text Emphasis',
      type: HighContrastAnimationType.TEXT_EMPHASIS,
      description: 'Text is emphasized for importance'
    },
    {
      id: 'icon_change',
      title: 'Icon Change',
      type: HighContrastAnimationType.ICON_CHANGE,
      description: 'Icon changes to show state change'
    },
    {
      id: 'custom',
      title: 'Custom Animation',
      type: HighContrastAnimationType.CUSTOM,
      description: 'Custom animation for specific needs'
    }
  ];
  
  return (
    <Container>
      <Title>High Contrast Animations</Title>
      <Description>
        This demo showcases the useHighContrast hook which provides animations that maintain
        visibility in high contrast mode, ensuring critical state changes remain perceivable
        to all users, including those with visual impairments.
      </Description>
      
      <Section>
        <SectionTitle>High Contrast Settings</SectionTitle>
        <ControlPanel>
          <ControlRow>
            <Label>System High Contrast:</Label>
            <StatusIndicator $active={systemHighContrast} />
            <span>{systemHighContrast ? 'Enabled' : 'Disabled'}</span>
          </ControlRow>
          
          <ControlRow>
            <Label>App High Contrast:</Label>
            <Switch>
              <input
                type="checkbox"
                checked={appHighContrast}
                onChange={toggleHighContrast}
              />
              <span></span>
            </Switch>
            <span>{appHighContrast ? 'Enabled' : 'Disabled'}</span>
          </ControlRow>
          
          <ControlRow>
            <Label>Effective Setting:</Label>
            <StatusIndicator $active={isHighContrast} />
            <strong>{isHighContrast ? 'High Contrast Mode' : 'Standard Mode'}</strong>
          </ControlRow>
          
          <ControlRow>
            <Label>Animation Type:</Label>
            <Select value={selectedType} onChange={handleTypeChange}>
              {Object.values(HighContrastAnimationType).map(type => (
                <option key={type} value={type}>
                  {type
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')}
                </option>
              ))}
            </Select>
          </ControlRow>
          
          <ControlRow>
            <Button $primary onClick={playAllAnimations}>
              Play All Animations Sequentially
            </Button>
            <Button onClick={toggleHighContrast}>
              Toggle High Contrast Mode
            </Button>
          </ControlRow>
        </ControlPanel>
        
        <InfoPanel>
          <InfoItem>
            <InfoLabel>Current Mode:</InfoLabel>
            <InfoValue>{isHighContrast ? 'High Contrast' : 'Standard'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Selected Animation Type:</InfoLabel>
            <InfoValue>{selectedType}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>How to Use:</InfoLabel>
            <InfoValue>Click on any animation example to see it in action</InfoValue>
          </InfoItem>
        </InfoPanel>
      </Section>
      
      <Section>
        <SectionTitle>Animation Examples</SectionTitle>
        <Description>
          Each example demonstrates a different type of high contrast animation.
          These animations are designed to be perceivable in high contrast mode,
          ensuring critical state changes remain visible to all users.
        </Description>
        
        <ExamplesGrid>
          {animationExamples.map(example => (
            <AnimationExample
              key={example.id}
              title={example.title}
              type={example.type}
              isAnimating={animatingExamples[example.id] || false}
              onTrigger={() => playAnimation(example.id)}
              highContrastHook={highContrast}
              description={example.description}
            />
          ))}
        </ExamplesGrid>
      </Section>
      
      <Section>
        <SectionTitle>Implementation Details</SectionTitle>
        <InfoPanel>
          <h3>Using High Contrast Animations</h3>
          <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', overflow: 'auto', fontSize: '0.9rem' }}>
{`// Using the high contrast animations hook
import { useHighContrast, HighContrastAnimationType } from '../animations/accessibility/useHighContrast';

const MyComponent = () => {
  // Initialize the hook with options
  const {
    isHighContrast,
    getHighContrastAnimation,
    getHighContrastStyles,
    getAriaAttributes
  } = useHighContrast({
    defaultAnimationType: HighContrastAnimationType.BORDER_FOCUS,
    primaryColor: '#ffffff',
    secondaryColor: '#000000',
    duration: 1000
  });
  
  // State to track animation
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Get animation CSS
  const animation = getHighContrastAnimation({
    type: HighContrastAnimationType.BORDER_FOCUS
  });
  
  // Get ARIA attributes
  const ariaAttrs = getAriaAttributes('Button is focused');
  
  // Trigger animation
  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };
  
  return (
    <button
      onClick={handleClick}
      css={isAnimating ? animation : ''}
      {...ariaAttrs}
    >
      Click Me
    </button>
  );
};`}
          </pre>
          
          <h3>Animation Types for Different Use Cases</h3>
          <ul>
            <li><strong>BORDER_FOCUS:</strong> Ideal for focus states and selection</li>
            <li><strong>BORDER_PULSE:</strong> Great for drawing attention to an element</li>
            <li><strong>BACKGROUND_FLASH:</strong> Effective for state changes and alerts</li>
            <li><strong>COLOR_INVERSION:</strong> Perfect for toggle states</li>
            <li><strong>OUTLINE_EXPANSION:</strong> Good for selection and focus</li>
            <li><strong>SIZE_CHANGE:</strong> Useful for button presses and clicks</li>
            <li><strong>COLOR_SHIFT:</strong> Suitable for transitions between states</li>
            <li><strong>STATIC_INDICATOR:</strong> For permanent indicators (no animation)</li>
            <li><strong>CONTENT_REVEAL:</strong> For showing new content with emphasis</li>
            <li><strong>TEXT_EMPHASIS:</strong> For highlighting important text</li>
            <li><strong>ICON_CHANGE:</strong> For state changes with icon updates</li>
            <li><strong>CUSTOM:</strong> For custom animations with specific requirements</li>
          </ul>
        </InfoPanel>
      </Section>
    </Container>
  );
};

export default HighContrastAnimationsDemo;