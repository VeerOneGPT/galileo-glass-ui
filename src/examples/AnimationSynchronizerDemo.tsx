/**
 * Animation Synchronizer Demo
 * 
 * Demonstrates the timing-agnostic animation synchronization system with
 * multiple animation elements synchronized using different strategies.
 */

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  useAnimationSynchronization,
  UseAnimationSynchronizationOptions 
} from '../hooks/useAnimationSynchronization';
import { 
  SyncedAnimation,
  AnimationPhase,
  SynchronizationStrategy,
  SyncGroupState
} from '../animations/orchestration/AnimationSynchronizer';
// Use type-only import for SyncPoint to avoid conflicts
import type { SyncPoint } from '../animations/orchestration/AnimationSynchronizer';
import { AnimationPreset } from '../animations/core/types';

// Styled components for demo
const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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
  background-color: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
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
  border: 1px solid #ccc;
  background-color: ${props => props.$active ? '#4287f5' : 'white'};
  color: ${props => props.$active ? 'white' : 'black'};
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${props => props.$active ? '#3a7add' : '#f0f0f0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 10px;
  background-color: #eee;
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
    background-color: #4287f5;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

const SyncPoint = styled.div<{ $active?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#4287f5' : '#ccc'};
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
    color: ${props => props.$active ? '#4287f5' : '#999'};
  }
`;

const InfoPanel = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  font-size: 14px;
`;

// Keyframe animations - fix to use proper keyframes
const fadeInKeyframes = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const moveRightKeyframes = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(200px); }
`;

const moveDownKeyframes = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(200px); }
`;

const rotateKeyframes = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const scaleKeyframes = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.5); }
`;

// Fix animation presets to use proper Keyframes objects
const fadeIn: AnimationPreset = {
  keyframes: fadeInKeyframes,
  duration: 1000,
  easing: 'ease-out',
  fillMode: 'forwards'
};

const moveRight: AnimationPreset = {
  keyframes: moveRightKeyframes,
  duration: 1500,
  easing: 'ease-in-out',
  fillMode: 'forwards'
};

const moveDown: AnimationPreset = {
  keyframes: moveDownKeyframes,
  duration: 2000,
  easing: 'ease-in-out',
  fillMode: 'forwards'
};

const rotate: AnimationPreset = {
  keyframes: rotateKeyframes,
  duration: 3000,
  easing: 'linear',
  fillMode: 'forwards'
};

const scale: AnimationPreset = {
  keyframes: scaleKeyframes,
  duration: 1200,
  easing: 'ease-out',
  fillMode: 'forwards'
};

// Animation positions
const positions = [
  { top: '80px', left: '80px' },
  { top: '80px', left: '300px' },
  { top: '80px', left: '520px' },
  { top: '240px', left: '80px' },
  { top: '240px', left: '300px' },
  { top: '240px', left: '520px' }
];

// Strategy definitions
const strategies = [
  { 
    id: SynchronizationStrategy.COMMON_DURATION,
    name: 'Common Duration',
    description: 'All animations are stretched or compressed to match a common duration.'
  },
  { 
    id: SynchronizationStrategy.ALIGN_SYNC_POINTS,
    name: 'Align Sync Points',
    description: 'Specific sync points are aligned across all animations (e.g., middle points occur simultaneously).'
  },
  { 
    id: SynchronizationStrategy.SIMULTANEOUS_START,
    name: 'Simultaneous Start',
    description: 'All animations start at the same time but run at their original durations.'
  },
  { 
    id: SynchronizationStrategy.SIMULTANEOUS_END,
    name: 'Simultaneous End',
    description: 'All animations end at the same time by adjusting their start times.'
  },
  { 
    id: SynchronizationStrategy.CASCADE,
    name: 'Cascade',
    description: 'Animations start sequentially with a fixed delay between them.'
  }
];

// Animation colors
const colors = [
  '#4287f5', // blue
  '#f542a7', // pink
  '#42f5b3', // teal
  '#f5a742', // orange
  '#a342f5', // purple
  '#f54242'  // red
];

// Animation presets
const animationPresets: AnimationPreset[] = [
  fadeIn,
  moveRight,
  moveDown,
  rotate,
  scale
];

// Demo sync points
const demoSyncPoints: SyncPoint[] = [
  {
    id: 'start',
    name: 'Start',
    phase: AnimationPhase.START,
    position: 0
  },
  {
    id: 'quarter',
    name: '25%',
    phase: AnimationPhase.MIDDLE,
    position: 0.25
  },
  {
    id: 'middle',
    name: 'Middle',
    phase: AnimationPhase.MIDDLE,
    position: 0.5
  },
  {
    id: 'threeQuarter',
    name: '75%',
    phase: AnimationPhase.MIDDLE,
    position: 0.75
  },
  {
    id: 'end',
    name: 'End',
    phase: AnimationPhase.END,
    position: 1
  }
];

/**
 * Animation Synchronizer Demo Component
 */
const AnimationSynchronizerDemo: React.FC = () => {
  // Active strategy state
  const [activeStrategy, setActiveStrategy] = useState<SynchronizationStrategy>(
    SynchronizationStrategy.COMMON_DURATION
  );
  
  // Active strategy info
  const activeStrategyInfo = strategies.find(s => s.id === activeStrategy);
  
  // Sync point tracking
  const [activeSyncPoints, setActiveSyncPoints] = useState<Set<string>>(new Set());
  
  // Animation elements refs
  const elementRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Options for animation synchronization
  const syncOptions: UseAnimationSynchronizationOptions = {
    strategy: activeStrategy,
    syncPoints: demoSyncPoints,
    adaptTimings: true,
    duration: 3000,
    onSyncPoint: (point, animations) => {
      // Add sync point to active set
      setActiveSyncPoints(prev => {
        const next = new Set(prev);
        next.add(point.id);
        
        // Remove sync point after a delay for visual feedback
        setTimeout(() => {
          setActiveSyncPoints(prev => {
            const next = new Set(prev);
            next.delete(point.id);
            return next;
          });
        }, 500);
        
        return next;
      });
    }
  };
  
  // Use the animation synchronization hook
  const { 
    addAnimation,
    initialize,
    play,
    pause,
    cancel,
    groupState,
    progress,
    groupRef
  } = useAnimationSynchronization('demo-sync', syncOptions);
  
  // Create animation elements
  const createAnimations = () => {
    const animations: SyncedAnimation[] = [];
    
    // Create 5 animations with different durations
    for (let i = 0; i < 5; i++) {
      const animation: SyncedAnimation = {
        id: `animation-${i}`,
        target: elementRefs.current[i] || '',
        animation: animationPresets[i],
        duration: (i + 1) * 800, // Increasing durations
        order: i, // For cascade strategy
        adaptTiming: true,
        syncPoints: demoSyncPoints
      };
      
      animations.push(animation);
    }
    
    return animations;
  };
  
  // Initialize animations when strategy changes
  useEffect(() => {
    // If group state is playing or paused, cancel first
    if (groupRef.current && 
        (groupState === SyncGroupState.PLAYING || groupState === SyncGroupState.PAUSED)) {
      cancel();
    }
    
    // After a short delay, initialize with new strategy
    const timer = setTimeout(() => {
      const animations = createAnimations();
      animations.forEach(animation => {
        addAnimation(animation);
      });
      
      initialize();
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [activeStrategy, addAnimation, initialize, cancel]);
  
  // Reset active sync points when playing new animation
  useEffect(() => {
    if (groupState === SyncGroupState.PLAYING) {
      setActiveSyncPoints(new Set());
    }
  }, [groupState]);
  
  return (
    <DemoContainer>
      <Title>Animation Synchronizer</Title>
      <Description>
        This demo showcases the timing-agnostic animation synchronization system.
        Each colored square has a different animation with a different duration, but
        they are synchronized using the selected strategy.
      </Description>
      
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
      
      <InfoPanel>
        <strong>{activeStrategyInfo?.name}:</strong> {activeStrategyInfo?.description}
      </InfoPanel>
      
      <Controls>
        <Button 
          onClick={() => play()}
          disabled={groupState === SyncGroupState.PLAYING}
        >
          Play
        </Button>
        <Button 
          onClick={() => pause()}
          disabled={groupState !== SyncGroupState.PLAYING}
        >
          Pause
        </Button>
        <Button 
          onClick={() => cancel()}
          disabled={groupState !== SyncGroupState.PLAYING && groupState !== SyncGroupState.PAUSED}
        >
          Reset
        </Button>
      </Controls>
      
      <div>
        <div>Progress: {Math.round(progress * 100)}%</div>
        <ProgressBar $progress={progress} />
      </div>
      
      <DemoSection>
        <AnimationStage>
          {/* Animation elements */}
          {positions.slice(0, 5).map((pos, index) => (
            <AnimationElement
              key={index}
              ref={(el) => { elementRefs.current[index] = el; }}
              style={pos}
              $color={colors[index]}
              $inactive={groupState === SyncGroupState.COMPLETED}
              $highlight={groupState === SyncGroupState.PLAYING}
            >
              {index < animationPresets.length ? animationPresets[index].keyframes?.getName() || `Animation ${index}` : `Animation ${index}`}
            </AnimationElement>
          ))}
          
          {/* Sync point indicators */}
          <SyncPointIndicator>
            {demoSyncPoints.map(point => (
              <SyncPoint
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

export default AnimationSynchronizerDemo;