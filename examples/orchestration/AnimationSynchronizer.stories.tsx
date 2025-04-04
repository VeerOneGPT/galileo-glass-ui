import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import styled, { keyframes, Keyframes, ThemeProvider } from 'styled-components';
import { Meta, StoryFn } from '@storybook/react';

import { 
  useAnimationSynchronization,
  UseAnimationSynchronizationOptions 
} from '../../src/hooks/useAnimationSynchronization';
import { 
  SyncedAnimation,
  AnimationPhase,
  SynchronizationStrategy,
  SyncGroupState
} from '../../src/animations/orchestration/AnimationSynchronizer';
import type { SyncPoint } from '../../src/animations/orchestration/AnimationSynchronizer';
import { AnimationPreset } from '../../src/animations/core/types';
import { ThemeProvider as AppThemeProvider } from '../../src/theme';

// --- Copied Styles ---
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  color: #e2e8f0; /* Light text */
  background: rgba(30, 41, 59, 0.7); /* Darker bg */
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  margin-bottom: 20px;
  line-height: 1.5;
`;

const DemoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AnimationStage = styled.div`
  position: relative;
  height: 400px;
  background-color: rgba(15, 23, 42, 0.8); /* Darker stage bg */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2); /* Light border */
  background-color: ${props => props.$active ? '#4f46e5' : '#374151'}; /* Adjusted colors */
  color: white;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${props => props.$active ? '#6366f1' : '#4b5563'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #1f2937; /* Darkest disabled */
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 10px;
  background-color: #374151; /* Darker background */
  border-radius: 5px;
  margin-top: 5px;
  position: relative;
  overflow: hidden;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.$progress * 100}%;
    background-color: #6366f1; /* Adjusted progress color */
    transition: width 0.05s linear;
  }
`;

const StrategySelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const SelectorTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 5px;
`;

const StrategyButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const AnimationElement = styled.div<{ 
  $color: string; 
  $size?: string;
  $inactive?: boolean;
  $highlight?: boolean;
}>`
  position: absolute;
  background-color: ${props => props.$color};
  width: ${props => props.$size || '80px'};
  height: ${props => props.$size || '80px'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Adjusted shadow */
  opacity: ${props => props.$inactive ? 0.3 : 1};
  border: ${props => props.$highlight ? '3px solid white' : 'none'};
  z-index: ${props => props.$highlight ? 2 : 1};
`;

const SyncPointIndicator = styled.div<{ $active?: boolean }>`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const SyncPointMarker = styled.div<{ $active?: boolean }>` // Renamed from SyncPoint to avoid conflict
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#6366f1' : '#4b5563'}; /* Adjusted colors */
  transition: background-color 0.3s ease;
  position: relative;
  
  &:after {
    content: attr(data-label);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 5px;
    font-size: 12px;
    white-space: nowrap;
    color: ${props => props.$active ? '#a5b4fc' : '#9ca3af'}; /* Adjusted label colors */
  }
`;

const InfoPanel = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  font-size: 14px;
`;

// --- Keyframes and Animation Presets ---
const fadeInKeyframes = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const moveRightKeyframes = keyframes`from { transform: translateX(0); } to { transform: translateX(200px); }`;
const moveDownKeyframes = keyframes`from { transform: translateY(0); } to { transform: translateY(200px); }`;
const rotateKeyframes = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const scaleKeyframes = keyframes`from { transform: scale(1); } to { transform: scale(1.5); }`;

const fadeIn: AnimationPreset = { keyframes: fadeInKeyframes, duration: 1000, easing: 'ease-out', fillMode: 'forwards' };
const moveRight: AnimationPreset = { keyframes: moveRightKeyframes, duration: 1500, easing: 'ease-in-out', fillMode: 'forwards' };
const moveDown: AnimationPreset = { keyframes: moveDownKeyframes, duration: 2000, easing: 'ease-in-out', fillMode: 'forwards' };
const rotate: AnimationPreset = { keyframes: rotateKeyframes, duration: 3000, easing: 'linear', fillMode: 'forwards' };
const scale: AnimationPreset = { keyframes: scaleKeyframes, duration: 1200, easing: 'ease-out', fillMode: 'forwards' };

// --- Data (Positions, Strategies, Colors, Presets, Sync Points) ---
const positions: CSSProperties[] = [
  { top: '80px', left: '80px' }, { top: '80px', left: '300px' }, { top: '80px', left: '520px' },
  { top: '240px', left: '80px' }, { top: '240px', left: '300px' }, { top: '240px', left: '520px' }
];
const strategies = [
  { id: SynchronizationStrategy.COMMON_DURATION, name: 'Common Duration', description: 'Match a common duration.' },
  { id: SynchronizationStrategy.ALIGN_SYNC_POINTS, name: 'Align Sync Points', description: 'Align specific sync points (e.g., middle).' },
  { id: SynchronizationStrategy.SIMULTANEOUS_START, name: 'Simultaneous Start', description: 'Start together, original durations.' },
  { id: SynchronizationStrategy.SIMULTANEOUS_END, name: 'Simultaneous End', description: 'End together by adjusting start times.' },
  { id: SynchronizationStrategy.CASCADE, name: 'Cascade', description: 'Start sequentially with a delay.' }
];
const colors = ['#4287f5', '#f542a7', '#42f5b3', '#f5a742', '#a342f5', '#f54242'];
const animationPresets: AnimationPreset[] = [fadeIn, moveRight, moveDown, rotate, scale];
const demoSyncPoints: SyncPoint[] = [
  { id: 'start', name: 'Start', phase: AnimationPhase.START, position: 0 },
  { id: 'quarter', name: '25%', phase: AnimationPhase.MIDDLE, position: 0.25 },
  { id: 'middle', name: 'Middle', phase: AnimationPhase.MIDDLE, position: 0.5 },
  { id: 'threeQuarter', name: '75%', phase: AnimationPhase.MIDDLE, position: 0.75 },
  { id: 'end', name: 'End', phase: AnimationPhase.END, position: 1 }
];

// --- Storybook Setup ---

export default {
  title: 'Orchestration/AnimationSynchronizer',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AppThemeProvider forceColorMode="dark">
        <Story />
      </AppThemeProvider>
    ),
  ],
} as Meta;

// --- Template Component ---

const SynchronizerDemoTemplate: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<SynchronizationStrategy>(SynchronizationStrategy.COMMON_DURATION);
  const activeStrategyInfo = strategies.find(s => s.id === activeStrategy);
  const [activeSyncPoints, setActiveSyncPoints] = useState<Set<string>>(new Set());
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);

  const syncOptions: UseAnimationSynchronizationOptions = {
    strategy: activeStrategy,
    syncPoints: demoSyncPoints,
    adaptTimings: true,
    duration: 3000,
    onSyncPoint: (point) => {
      setActiveSyncPoints(prev => new Set(prev).add(point.id));
      setTimeout(() => {
        setActiveSyncPoints(prev => {
          const next = new Set(prev);
          next.delete(point.id);
          return next;
        });
      }, 500);
    }
  };

  const { addAnimation, initialize, play, pause, cancel, groupState, progress } = 
    useAnimationSynchronization('demo-sync-story', syncOptions);

  const createAnimations = React.useCallback(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `animation-${i}`,
      target: elementRefs.current[i],
      animation: animationPresets[i],
      duration: (i + 1) * 800,
      order: i,
      adaptTiming: true,
      syncPoints: demoSyncPoints
    } as SyncedAnimation));
  }, []);

  useEffect(() => {
    if (elementRefs.current.some(ref => !ref)) return;

    const animations = createAnimations();
    animations.forEach(animation => addAnimation(animation));
    initialize();

    return () => {
      cancel();
    };
  }, [activeStrategy, addAnimation, initialize, cancel, createAnimations]);

  useEffect(() => {
    if (groupState === SyncGroupState.PLAYING) {
      setActiveSyncPoints(new Set());
    }
  }, [groupState]);

  const getKeyframeName = (preset: AnimationPreset): string => {
    const keyframeMap: { [key: string]: string } = {
      [fadeInKeyframes.getName()]: 'Fade In',
      [moveRightKeyframes.getName()]: 'Move Right',
      [moveDownKeyframes.getName()]: 'Move Down',
      [rotateKeyframes.getName()]: 'Rotate',
      [scaleKeyframes.getName()]: 'Scale',
    };
    return keyframeMap[preset.keyframes?.getName() ?? ''] || 'Animation';
  };

  return (
    <DemoContainer>
      <Title>Animation Synchronizer</Title>
      <Description> Demonstrates synchronizing animations with different durations using various strategies. </Description>
      
      <StrategySelector>
        <SelectorTitle>Synchronization Strategy</SelectorTitle>
        <StrategyButtons>
          {strategies.map(strategy => (
            <Button 
              key={strategy.id}
              $active={activeStrategy === strategy.id}
              onClick={() => setActiveStrategy(strategy.id as SynchronizationStrategy)}
              disabled={groupState === SyncGroupState.PLAYING}
            >
              {strategy.name}
            </Button>
          ))}
        </StrategyButtons>
      </StrategySelector>
      
      <InfoPanel> <strong>{activeStrategyInfo?.name}:</strong> {activeStrategyInfo?.description} </InfoPanel>
      
      <Controls>
        <Button onClick={play} disabled={groupState === SyncGroupState.PLAYING}> Play </Button>
        <Button onClick={pause} disabled={groupState !== SyncGroupState.PLAYING}> Pause </Button>
        <Button onClick={cancel} disabled={groupState !== SyncGroupState.PLAYING && groupState !== SyncGroupState.PAUSED}> Reset </Button>
      </Controls>
      
      <div>
        <div>Progress: {Math.round(progress * 100)}%</div>
        <ProgressBar $progress={progress} />
      </div>
      
      <DemoSection>
        <AnimationStage>
          {Array.from({ length: 5 }).map((_, index) => (
            <AnimationElement
              key={index}
              ref={(el) => { elementRefs.current[index] = el; }}
              style={positions[index]}
              $color={colors[index]}
              $inactive={groupState === SyncGroupState.COMPLETED}
              $highlight={groupState === SyncGroupState.PLAYING}
            >
              {getKeyframeName(animationPresets[index])} {`(${(index + 1) * 0.8}s)`}
            </AnimationElement>
          ))}
          
          <SyncPointIndicator>
            {demoSyncPoints.map(point => (
              <SyncPointMarker
                key={point.id}
                data-label={point.name}
                $active={activeSyncPoints.has(point.id)}
              />
            ))}
          </SyncPointIndicator>
        </AnimationStage>
      </DemoSection>
    </DemoContainer>
  );
};

// --- Export Story ---

export const Default: StoryFn = () => <SynchronizerDemoTemplate />;
Default.storyName = 'Synchronizer Demo'; 