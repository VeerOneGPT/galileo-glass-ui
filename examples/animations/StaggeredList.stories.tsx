import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { useOrchestration } from '../../src/hooks/useOrchestration';
import type { AnimationStage, ProgressCallback } from '../../src/animations/types';
import { GlassBox, GlassButton, GlassTypography } from '@veerone/galileo-glass-ui';

const NUM_ITEMS = 5;
const dummyCallback: ProgressCallback = () => {}; // Dummy callback

// Styled list item
const AnimatedListItem = styled(GlassBox)<{ $isActive: boolean; $progress: number }>`
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: rgba(var(--glass-accent-rgb), 0.2);
  opacity: ${({ $isActive, $progress }) => ($isActive ? $progress : 0)};
  transform: ${({ $isActive, $progress }) => 
    `translateX(${($isActive ? (1 - $progress) * -20 : -20)}px)`};
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  will-change: opacity, transform;
`;

// Demo Component
const StaggeredListDemoComponent: React.FC = () => {
  // Define animation stages as CallbackAnimationStage
  const stages: AnimationStage[] = [
    { id: 'item-1', type: 'callback', duration: 300, delay: 0, callback: dummyCallback },
    { id: 'item-2', type: 'callback', duration: 300, delay: 0, callback: dummyCallback },
    { id: 'item-3', type: 'callback', duration: 300, delay: 0, callback: dummyCallback },
    { id: 'item-4', type: 'callback', duration: 300, delay: 0, callback: dummyCallback },
    { id: 'item-5', type: 'callback', duration: 300, delay: 0, callback: dummyCallback },
  ];

  const { 
    start, 
    reset, 
    isStageActive, 
    getStageInfo 
  } = useOrchestration({
    stages, // Pass the stages with default delay
    pattern: 'staggered', // Specify the pattern
    staggerDelay: 100,   // Specify the delay between items
    autoStart: false,    // Start manually
  });

  useEffect(() => {
    start(); // Start animation on mount
  }, [start]);

  return (
    <GlassBox style={{ padding: '24px', width: '300px' }}>
      <GlassTypography variant="h6" gutterBottom>
        Staggered List Animation
      </GlassTypography>
      {stages.map((stage, index) => {
        const stageInfo = getStageInfo(stage.id);
        const isActive = stageInfo?.isActive || stageInfo?.isCompleted || false;
        // Use stage progress if available, otherwise simple active state
        const progress = stageInfo?.progress ?? (isActive ? 1 : 0);

        return (
          <AnimatedListItem
            key={stage.id}
            $isActive={isActive} // Pass active state for transition trigger
            $progress={progress} // Pass progress for fine-grained animation
          >
            Item {index + 1}
          </AnimatedListItem>
        );
      })}
      <GlassButton onClick={reset} style={{ marginTop: '16px' }}>
        Replay
      </GlassButton>
    </GlassBox>
  );
};

// Storybook Meta
const meta: Meta<typeof StaggeredListDemoComponent> = {
    title: 'Examples/Animations/useOrchestration (Staggered)',
    component: StaggeredListDemoComponent,
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const StaggeredList: Story = {};
