import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import { Meta, StoryObj } from '@storybook/react';

// Import hook and types (using relative paths)
import { useAnimationEvent } from '../../src/hooks/useAnimationEvent'; // Adjust path
import {
  AnimationEventType,
  AnimationInteractionType,
  AnimationEvent,
  animationEventManager
} from '../../src/animations/orchestration/AnimationEventSystem'; // Adjust path
import { AnimationState } from '../../src/animations/orchestration/AnimationStateMachine'; // Adjust path

// --- Styled Components (condensed from demo) ---
const DemoContainer = styled.div` /* ... */ `;
const Title = styled.h1` /* ... */ `;
const Description = styled.p` /* ... */ `;
const DemoSection = styled.div` /* ... */ `;
const AnimationStage = styled.div` /* ... */ `;
const Controls = styled.div` /* ... */ `;
const ControlSection = styled.div` /* ... */ `;
const ControlTitle = styled.h3` /* ... */ `;
const ButtonGrid = styled.div` /* ... */ `;
const Button = styled.button<{ $active?: boolean }>` /* ... */ `;
const EventLog = styled.div` /* ... */ `;
const EventEntry = styled.div<{ $type: string }>` /* ... */ `;
const AnimatedElement = styled.div<{ $x: number; $y: number; $color: string; $selected?: boolean; }>` /* ... */ `;

// Mock Theme
const mockTheme: DefaultTheme = { /* ... */ };

// --- Interfaces & Data (from demo) ---
interface AnimationBox { id: string; position: { x: number; y: number }; animations: AnimationState[]; currentState: string; }
const animationStates: AnimationState[] = [
    { id: 'idle', name: 'Idle', styles: { transform: 'scale(1)', backgroundColor: 'currentColor', opacity: '1', } },
    { id: 'hover', name: 'Hover', styles: { transform: 'scale(1.1)', backgroundColor: 'currentColor', opacity: '1', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' } },
    { id: 'active', name: 'Active', styles: { transform: 'scale(0.95)', backgroundColor: 'currentColor', opacity: '1', } },
    { id: 'pulsing', name: 'Pulsing', styles: { transform: 'scale(1)', backgroundColor: 'currentColor', opacity: '1', animation: 'pulse 1.5s infinite' } }, // Requires pulse keyframes
    { id: 'fadeOut', name: 'Fade Out', styles: { transform: 'scale(1)', backgroundColor: 'currentColor', opacity: '0.5', } },
];
const colors = ['#4287f5', '#f542a7', '#42f5b3', '#f5a742', '#a342f5'];
const initialBoxes: AnimationBox[] = [
    { id: 'box1', position: { x: 50, y: 50 }, animations: animationStates, currentState: 'idle' },
    { id: 'box2', position: { x: 200, y: 50 }, animations: animationStates, currentState: 'idle' },
    { id: 'box3', position: { x: 350, y: 50 }, animations: animationStates, currentState: 'idle' }
];

// Helper to get background color for log entries
const getEventBgColor = (type: string) => {
    switch (type) {
        case AnimationEventType.START: return 'rgba(66, 135, 245, 0.2)';
        case AnimationEventType.COMPLETE: return 'rgba(66, 245, 179, 0.2)';
        // ... other cases
        default: return 'rgba(0, 0, 0, 0.05)';
    }
};

// --- Story Component ---
const EventSystemStoryComponent: React.FC = () => {
    const [eventLog, setEventLog] = useState<AnimationEvent[]>([]);
    const eventLogRef = useRef<HTMLDivElement>(null);
    const [boxes, setBoxes] = useState<AnimationBox[]>(initialBoxes);
    const [selectedBox, setSelectedBox] = useState<string | null>(null);
    const { on, off, emit } = useAnimationEvent({ id: 'story-event-demo', immediate: true });

    useEffect(() => { eventLogRef.current?.scrollTo(0, eventLogRef.current.scrollHeight); }, [eventLog]);

    useEffect(() => {
        animationEventManager.setDebugMode(true);
        animationEventManager.setMaxHistorySize(50);
        const sub = on('*', (event) => setEventLog(prev => [...prev.slice(-49), event]), { priority: -999 });
        return () => { sub.unsubscribe(); animationEventManager.setDebugMode(false); };
    }, [on]);

    const handleChangeState = useCallback((boxId: string, stateId: string) => {
        setBoxes(prev => prev.map(box => box.id === boxId ? { ...box, currentState: stateId } : box));
        emit(AnimationEventType.START, boxId, { stateId, timestamp: Date.now() });
        setTimeout(() => emit(AnimationEventType.COMPLETE, boxId, { stateId, timestamp: Date.now() }), 300);
    }, [emit]);

    const clearEventLog = useCallback(() => {
        setEventLog([]);
        animationEventManager.clearEventHistory();
    }, []);

    const handleSelectBox = useCallback((boxId: string) => {
        setSelectedBox(prev => (prev === boxId ? null : boxId));
        if (selectedBox !== boxId) emit('boxSelected', boxId, { timestamp: Date.now() });
    }, [emit, selectedBox]);

    const BoxElement: React.FC<{ box: AnimationBox, index: number }> = ({ box, index }) => {
        const currentState = box.animations.find(state => state.id === box.currentState);
        const style: React.CSSProperties = currentState?.styles ?? {};
        const handleMouseEnter = () => emit(AnimationInteractionType.MOUSE_ENTER, box.id);
        const handleMouseLeave = () => emit(AnimationInteractionType.MOUSE_LEAVE, box.id);
        const handleMouseDown = () => { emit(AnimationInteractionType.MOUSE_DOWN, box.id); handleChangeState(box.id, 'active'); };
        const handleMouseUp = () => { emit(AnimationInteractionType.MOUSE_UP, box.id); handleChangeState(box.id, selectedBox === box.id ? 'hover' : 'idle'); };

        return (
            <AnimatedElement
                $x={box.position.x} $y={box.position.y} $color={colors[index % colors.length]}
                $selected={selectedBox === box.id} onClick={() => handleSelectBox(box.id)}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} style={style}
            >
                {box.id}
            </AnimatedElement>
        );
    };

    return (
        <DemoContainer>
            <Title>Animation Event System</Title>
            <Description>Interact with boxes and see events logged below. Select a box to control its state.</Description>
            <DemoSection>
                <AnimationStage>{boxes.map((box, index) => <BoxElement key={box.id} box={box} index={index} />)}</AnimationStage>
                <Controls>
                    {selectedBox && (
                        <ControlSection>
                             <ControlTitle>Controls for {selectedBox}</ControlTitle>
                             <ButtonGrid>
                                {animationStates.map(state => (
                                    <Button key={state.id} $active={boxes.find(b=>b.id===selectedBox)?.currentState === state.id} onClick={() => handleChangeState(selectedBox, state.id)}>{state.name}</Button>
                                ))}
                            </ButtonGrid>
                        </ControlSection>
                    )}
                    <ControlSection>
                        <ControlTitle>Event Log</ControlTitle>
                        <Button onClick={clearEventLog}>Clear Log</Button>
                        <EventLog ref={eventLogRef}>
                            {eventLog.map((event, i) => <EventEntry key={i} $type={event.type} style={{ backgroundColor: getEventBgColor(event.type) }}>{`[${event.type}] ${event.target} @ ${new Date(event.timestamp).toLocaleTimeString()}${event.data ? ` - ${JSON.stringify(event.data)}` : ''}`}</EventEntry>)}
                            {eventLog.length === 0 && <div>No events yet.</div>}
                        </EventLog>
                    </ControlSection>
                 </Controls>
             </DemoSection>
        </DemoContainer>
    );
};

// --- Storybook Meta Configuration ---
const meta: Meta<typeof EventSystemStoryComponent> = {
  title: 'Orchestration/Animation Event System',
  component: EventSystemStoryComponent,
  parameters: { layout: 'padded' },
  decorators: [(Story) => (<ThemeProvider theme={mockTheme}><Story /></ThemeProvider>)],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} }; 