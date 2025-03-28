/**
 * Animation State Machine Demo
 * 
 * Demonstrates the usage of the animation state machine for managing
 * complex animation transitions.
 */
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useAnimationStateMachine } from '../animations/orchestration/useAnimationStateMachine';
import { AnimationState, StateTransition } from '../animations/orchestration/AnimationStateMachine';
import { MotionSensitivityLevel } from '../animations/accessibility/MotionSensitivity';

// Styled components
const DemoContainer = styled.div`
  padding: 24px;
  max-width: 960px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

const Header = styled.header`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const DemoSection = styled.section`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const SectionDescription = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 24px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $primary?: boolean; $disabled?: boolean; $state?: string }>`
  background-color: ${props => 
    props.$disabled ? '#ccc' : 
    props.$primary ? '#2a6ef5' : 
    props.$state === 'idle' ? '#4CAF50' :
    props.$state === 'active' ? '#2196F3' :
    props.$state === 'loading' ? '#FF9800' :
    props.$state === 'error' ? '#F44336' :
    props.$state === 'success' ? '#4CAF50' :
    '#f5f5f5'
  };
  color: ${props => 
    props.$disabled ? '#666' : 
    (props.$primary || ['active', 'loading', 'error', 'success'].includes(props.$state || '')) ? 'white' : 
    '#333'
  };
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s ease, transform 0.1s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => 
      props.$primary ? '#1d5ed9' : 
      props.$state === 'idle' ? '#43A047' :
      props.$state === 'active' ? '#1E88E5' :
      props.$state === 'loading' ? '#FB8C00' :
      props.$state === 'error' ? '#E53935' :
      props.$state === 'success' ? '#43A047' :
      '#e0e0e0'
    };
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

const AnimationArea = styled.div`
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 300px;
  margin-bottom: 24px;
  overflow: hidden;
  background-color: #f9f9f9;
`;

const StateInfo = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 12px;
  }
  
  pre {
    margin: 0;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
  }
`;

const Card = styled.div`
  position: absolute;
  width: 200px;
  height: 160px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
`;

const CardContent = styled.div`
  margin-top: 12px;
  text-align: center;
`;

const LoadingIndicator = styled.div`
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2a6ef5;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f44336;
  color: white;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 10px;
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 10px;
`;

const TransitionHistory = styled.div`
  height: 200px;
  overflow-y: auto;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  li {
    font-family: monospace;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const SyntaxHighlight = styled.pre`
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow: auto;
  tab-size: 2;
`;

/**
 * Animation State Machine Demo Component
 */
const AnimationStateMachineDemo: React.FC = () => {
  // Create refs for demo elements
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Define states for the form state machine demo
  const formStates: AnimationState[] = [
    {
      id: 'idle',
      name: 'Idle State',
      enterAnimation: 'fadeIn',
      styles: {
        'background-color': 'white',
        'transform': 'translate(-50%, -50%) scale(1)',
        'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.1)'
      }
    },
    {
      id: 'active',
      name: 'Active State',
      enterAnimation: 'pulse',
      exitAnimation: 'fadeOut',
      styles: {
        'background-color': '#f0f7ff',
        'transform': 'translate(-50%, -50%) scale(1.05)',
        'box-shadow': '0 8px 30px rgba(0, 0, 0, 0.15)'
      }
    },
    {
      id: 'loading',
      name: 'Loading State',
      enterAnimation: 'pulse',
      exitAnimation: 'fadeOut',
      styles: {
        'background-color': '#fff9f0',
        'transform': 'translate(-50%, -50%) scale(1)',
        'box-shadow': '0 4px 20px rgba(0, 0, 0, 0.1)'
      },
      duration: 2000 // Auto-transition after 2 seconds
    },
    {
      id: 'error',
      name: 'Error State',
      enterAnimation: 'shake',
      styles: {
        'background-color': '#fff0f0',
        'transform': 'translate(-50%, -50%) scale(1)',
        'box-shadow': '0 4px 20px rgba(42, 0, 0, 0.15)'
      }
    },
    {
      id: 'success',
      name: 'Success State',
      enterAnimation: 'bounceIn',
      styles: {
        'background-color': '#f0fff5',
        'transform': 'translate(-50%, -50%) scale(1.05)',
        'box-shadow': '0 4px 20px rgba(0, 42, 0, 0.15)'
      }
    }
  ];
  
  // Define transitions for the form state machine demo
  const formTransitions: StateTransition[] = [
    {
      from: 'idle',
      to: 'active',
      on: 'focus',
      animation: 'fadeIn'
    },
    {
      from: 'active',
      to: 'idle',
      on: 'blur',
      animation: 'fadeOut'
    },
    {
      from: 'active',
      to: 'loading',
      on: 'submit',
      animation: 'pulse'
    },
    {
      from: 'loading',
      to: 'error',
      on: 'fail',
      animation: 'shake'
    },
    {
      from: 'loading',
      to: 'success',
      on: 'succeed',
      animation: 'bounceIn'
    },
    {
      from: 'error',
      to: 'active',
      on: 'retry',
      animation: 'fadeIn'
    },
    {
      from: 'success',
      to: 'idle',
      on: 'reset',
      animation: 'fadeOut'
    },
    {
      from: 'loading',
      to: 'error',
      on: 'timeout',
      animation: 'shake',
      actions: [(context) => {
        context.data.timeoutCount = (context.data.timeoutCount || 0) + 1;
      }]
    },
    // Special reset transition
    {
      from: '*',
      to: 'idle',
      on: 'reset_all',
      animation: 'fadeOut'
    }
  ];
  
  // Track if we should simulate success
  const [simulateSuccess, setSimulateSuccess] = useState(true);
  
  // Use the animation state machine hook
  const machine = useAnimationStateMachine({
    states: formStates,
    transitions: formTransitions,
    initialState: 'idle',
    targets: cardRef,
    sensitivity: MotionSensitivityLevel.MEDIUM,
    debug: true,
    persist: false,
    onStateChange: (from, to, context) => {
      console.log(`State changed from ${from} to ${to}`, context);
      // If loading state has moved to error or success, clear the loading state
      if (from === 'loading' && (to === 'error' || to === 'success')) {
        setIsLoading(false);
      }
    }
  });
  
  // Track loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle submit with simulated API call
  const handleSubmit = async () => {
    await machine.send('submit');
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (simulateSuccess) {
        machine.send('succeed');
      } else {
        machine.send('fail');
      }
    }, 1500);
  };
  
  return (
    <DemoContainer>
      <Header>
        <Title>Animation State Machine</Title>
        <Description>
          This demo showcases the animation state machine system, which allows for declarative
          definition of complex state transitions with animations. The example below demonstrates
          a typical form submission flow with various states and transitions between them.
        </Description>
      </Header>
      
      <DemoSection>
        <SectionTitle>Form Submission State Machine</SectionTitle>
        <SectionDescription>
          This example shows a form card that transitions between different states: idle, active,
          loading, error, and success. Each state has specific styles and animations, and the transitions
          between states are triggered by events like focus, submit, success, or failure.
        </SectionDescription>
        
        <StateInfo>
          <h3>Current State: {machine.currentState}</h3>
          <pre>
            Previous State: {machine.previousState || 'none'}{'\n'}
            Available Transitions: {
              machine.getAvailableTransitions()
                .map(t => t.on)
                .join(', ')
            }
          </pre>
        </StateInfo>
        
        <Controls>
          <Button 
            onClick={() => machine.send('focus')} 
            disabled={!machine.can('focus') || machine.transitioning}
            $state="idle"
          >
            Focus
          </Button>
          <Button 
            onClick={() => machine.send('blur')} 
            disabled={!machine.can('blur') || machine.transitioning}
            $state="idle"
          >
            Blur
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!machine.can('submit') || machine.transitioning || isLoading}
            $state="active"
          >
            Submit
          </Button>
          <Button 
            onClick={() => machine.send('retry')} 
            disabled={!machine.can('retry') || machine.transitioning}
            $state="error"
          >
            Retry
          </Button>
          <Button 
            onClick={() => machine.send('reset')} 
            disabled={!machine.can('reset') || machine.transitioning}
            $state="success"
          >
            Reset
          </Button>
          <Button 
            onClick={() => machine.send('reset_all')} 
            disabled={machine.transitioning}
          >
            Reset All
          </Button>
          <Button 
            onClick={() => setSimulateSuccess(!simulateSuccess)} 
            $state={simulateSuccess ? "success" : "error"}
          >
            Simulate: {simulateSuccess ? 'Success' : 'Error'}
          </Button>
        </Controls>
        
        <AnimationArea>
          <Card ref={cardRef}>
            <CardTitle>
              {machine.currentState === 'idle' && 'Form'}
              {machine.currentState === 'active' && 'Enter Information'}
              {machine.currentState === 'loading' && 'Processing...'}
              {machine.currentState === 'error' && 'Submission Failed'}
              {machine.currentState === 'success' && 'Success!'}
            </CardTitle>
            
            <CardContent>
              {machine.currentState === 'idle' && (
                <p>Click the form to begin</p>
              )}
              {machine.currentState === 'active' && (
                <p>Ready to submit your information</p>
              )}
              {machine.currentState === 'loading' && (
                <>
                  <LoadingIndicator />
                  <p>Please wait...</p>
                </>
              )}
              {machine.currentState === 'error' && (
                <>
                  <ErrorIcon>!</ErrorIcon>
                  <p>Something went wrong</p>
                </>
              )}
              {machine.currentState === 'success' && (
                <>
                  <SuccessIcon>✓</SuccessIcon>
                  <p>Information submitted successfully</p>
                </>
              )}
            </CardContent>
          </Card>
        </AnimationArea>
        
        <TransitionHistory>
          <h3>Transition History</h3>
          <ul>
            {machine.getHistory().map((entry, index) => (
              <li key={index}>
                {new Date(entry.timestamp).toLocaleTimeString()}: {entry.from} → {entry.to} (on: {entry.event})
              </li>
            ))}
          </ul>
        </TransitionHistory>
        
        <SyntaxHighlight>
{`// Define states
const states: AnimationState[] = [
  {
    id: 'idle',
    name: 'Idle State',
    enterAnimation: 'fadeIn',
    styles: {
      'background-color': 'white',
      'transform': 'translate(-50%, -50%) scale(1)'
    }
  },
  {
    id: 'active',
    name: 'Active State',
    enterAnimation: 'pulse',
    exitAnimation: 'fadeOut',
    styles: {
      'background-color': '#f0f7ff',
      'transform': 'translate(-50%, -50%) scale(1.05)'
    }
  },
  {
    id: 'loading',
    name: 'Loading State',
    enterAnimation: 'pulse',
    exitAnimation: 'fadeOut',
    styles: {
      'background-color': '#fff9f0'
    },
    duration: 2000 // Auto-transition after 2 seconds
  },
  // ... more states
];

// Define transitions
const transitions: StateTransition[] = [
  {
    from: 'idle',
    to: 'active',
    on: 'focus',
    animation: 'fadeIn'
  },
  {
    from: 'active',
    to: 'loading',
    on: 'submit',
    animation: 'pulse'
  },
  {
    from: 'loading',
    to: 'error',
    on: 'fail',
    animation: 'shake'
  },
  // ... more transitions
];

// Use the hook in a component
const machine = useAnimationStateMachine({
  states,
  transitions,
  initialState: 'idle',
  targets: cardRef,
  sensitivity: MotionSensitivityLevel.MEDIUM,
  debug: true,
  persist: false,
  onStateChange: (from, to, context) => {
    console.log(\`State changed from \${from} to \${to}\`, context);
  }
});

// Send events to trigger transitions
const handleSubmit = async () => {
  await machine.send('submit');
  // ... simulated API call
  machine.send('succeed'); // or machine.send('fail')
};`}
        </SyntaxHighlight>
      </DemoSection>
    </DemoContainer>
  );
};

export default AnimationStateMachineDemo;