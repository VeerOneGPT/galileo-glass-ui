import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { DefaultTheme, ThemeProvider, keyframes } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// Import hook and types (using relative paths)
import { useAnimationStateMachine } from '../../src/animations/orchestration/useAnimationStateMachine'; // Adjust path
import { AnimationState, StateTransition } from '../../src/animations/orchestration/AnimationStateMachine'; // Adjust path
import { MotionSensitivityLevel } from '../../src/animations/accessibility/MotionSensitivity'; // Adjust path

// --- Keyframes (needed for animation definitions) ---
const fadeIn = keyframes`from{opacity:0}to{opacity:1}`; 
const fadeOut = keyframes`from{opacity:1}to{opacity:0}`; 
const pulse = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.05)}`; 
const shake = keyframes`0%,100%{transform:translateX(0)}25%{transform:translateX(-10px)}75%{transform:translateX(10px)}`; 
const bounceIn = keyframes`/* ... complex bounce keyframes ... */`; 

// --- Styled Components (condensed from demo) ---
const DemoContainer = styled.div` /* ... */ `;
const Header = styled.header` /* ... */ `;
const Title = styled.h1` /* ... */ `;
const Description = styled.p` /* ... */ `;
const DemoSection = styled.section` /* ... */ `;
const SectionTitle = styled.h2` /* ... */ `;
const Controls = styled.div` /* ... */ `;
const Button = styled.button<{ $primary?: boolean; $disabled?: boolean; $state?: string }>` /* ... */ `;
const AnimationArea = styled.div` /* ... */ `;
const StateInfo = styled.div` /* ... */ `;
const Card = styled.div` /* ... */ `;
const CardTitle = styled.h3` /* ... */ `;
const CardContent = styled.div` /* ... */ `;
const LoadingIndicator = styled.div` /* ... */ `;
const ErrorIcon = styled.div` /* ... */ `;
const SuccessIcon = styled.div` /* ... */ `;
const TransitionHistory = styled.div` /* ... */ `;

// Mock Theme
const mockTheme: DefaultTheme = { /* ... */ };

// --- State Definitions (using animation names) ---
const formStates: AnimationState[] = [
    { id: 'idle', name: 'Idle', enterAnimation: 'fadeIn', styles: { backgroundColor:'white', transform:'translate(-50%, -50%) scale(1)', boxShadow:'0 4px 20px rgba(0,0,0,0.1)'} },
    { id: 'active', name: 'Active', enterAnimation: 'pulse', exitAnimation: 'fadeOut', styles: { backgroundColor:'#f0f7ff', transform:'translate(-50%, -50%) scale(1.05)', boxShadow:'0 8px 30px rgba(0,0,0,0.15)'} },
    { id: 'loading', name: 'Loading', enterAnimation: 'pulse', exitAnimation: 'fadeOut', styles: { backgroundColor:'#fff9f0', transform:'translate(-50%, -50%) scale(1)', boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}, duration: 2000 },
    { id: 'error', name: 'Error', enterAnimation: 'shake', styles: { backgroundColor:'#fff0f0', transform:'translate(-50%, -50%) scale(1)', boxShadow:'0 4px 20px rgba(42,0,0,0.15)'} },
    { id: 'success', name: 'Success', enterAnimation: 'bounceIn', styles: { backgroundColor:'#f0fff5', transform:'translate(-50%, -50%) scale(1.05)', boxShadow:'0 4px 20px rgba(0,42,0,0.15)'} }
];

// --- Transition Definitions (using animation names) ---
const formTransitions: StateTransition[] = [
    { from: 'idle', to: 'active', on: 'focus', animation: 'fadeIn' },
    { from: 'active', to: 'idle', on: 'blur', animation: 'fadeOut' },
    { from: 'active', to: 'loading', on: 'submit', animation: 'pulse' },
    { from: 'loading', to: 'error', on: 'fail', animation: 'shake' },
    { from: 'loading', to: 'success', on: 'succeed', animation: 'bounceIn' },
    { from: 'error', to: 'active', on: 'retry', animation: 'fadeIn' },
    { from: 'success', to: 'idle', on: 'reset', animation: 'fadeOut' },
    { from: 'loading', to: 'error', on: 'timeout', animation: 'shake', actions: [(ctx) => { ctx.data.timeoutCount = (ctx.data.timeoutCount || 0) + 1; }] },
    { from: '*', to: 'idle', on: 'reset_all', animation: 'fadeOut' }
];

// --- Story Component ---
const StateMachineStoryComponent: React.FC = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [simulateSuccess, setSimulateSuccess] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]); // Store history locally for display

    const machine = useAnimationStateMachine({
        states: formStates, transitions: formTransitions, initialState: 'idle',
        targets: cardRef.current,
        sensitivity: MotionSensitivityLevel.MEDIUM,
        debug: true, persist: false, // Disable persist for Storybook clarity
        onStateChange: (from, to, context) => {
             console.log(`State changed: ${from} -> ${to}`);
             setHistory(prev => [...prev.slice(-19), { timestamp: Date.now(), from, to, event: context.event }]);
             if (from === 'loading' && (to === 'error' || to === 'success')) setIsLoading(false);
         }
    });

    const handleSubmit = async () => {
        await machine.send('submit');
        setIsLoading(true);
        setTimeout(() => machine.send(simulateSuccess ? 'succeed' : 'fail'), 1500);
    };

    return (
        <DemoContainer>
            <Header><Title>Animation State Machine</Title></Header>
            <DemoSection>
                <AnimationArea>
                     <Card ref={cardRef}>
                         <CardTitle>{machine.currentState?.toUpperCase()}</CardTitle> { /* Display current state */ }
                         <CardContent>
                             {machine.currentState === 'idle' && <p>Ready</p>}
                             {machine.currentState === 'active' && <p>Active</p>}
                             {machine.currentState === 'loading' && <LoadingIndicator />}
                             {machine.currentState === 'error' && <ErrorIcon>!</ErrorIcon>}
                             {machine.currentState === 'success' && <SuccessIcon>✓</SuccessIcon>}
                         </CardContent>
                     </Card>
                 </AnimationArea>
                 <div>
                    <Controls>
                         <Button onClick={() => machine.send('focus')} $state="idle" disabled={!machine.can('focus') || machine.transitioning}>Focus</Button>
                         <Button onClick={() => machine.send('blur')} $state="idle" disabled={!machine.can('blur') || machine.transitioning}>Blur</Button>
                         <Button onClick={handleSubmit} $state="active" disabled={!machine.can('submit') || machine.transitioning || isLoading}>Submit</Button>
                         <Button onClick={() => machine.send('retry')} $state="error" disabled={!machine.can('retry') || machine.transitioning}>Retry</Button>
                         <Button onClick={() => machine.send('reset')} $state="success" disabled={!machine.can('reset') || machine.transitioning}>Reset</Button>
                         <Button onClick={() => machine.send('reset_all')} disabled={machine.transitioning}>Reset All</Button>
                         <Button onClick={() => setSimulateSuccess(!simulateSuccess)} $state={simulateSuccess ? "success" : "error"}>Simulate: {simulateSuccess ? 'Success' : 'Error'}</Button>
                     </Controls>
                     <TransitionHistory>
                         <h3>Transition History</h3>
                         <ul>
                             {history.map((entry, index) => (
                                 <li key={index}>{`${new Date(entry.timestamp).toLocaleTimeString()}: ${entry.from} -> ${entry.to} (on: ${entry.event})`}</li>
                             ))}
                             {history.length === 0 && <li>No transitions yet.</li>}
                         </ul>
                     </TransitionHistory>
                </div>
            </DemoSection>
         </DemoContainer>
    );
};

// --- Storybook Meta Configuration ---
const meta: Meta<typeof StateMachineStoryComponent> = {
  title: 'Orchestration/useAnimationStateMachine',
  component: StateMachineStoryComponent,
  parameters: { layout: 'padded' },
  decorators: [(Story) => (<ThemeProvider theme={mockTheme}><Story /></ThemeProvider>)],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} }; 