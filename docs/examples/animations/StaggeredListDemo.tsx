import React, { useEffect, useRef } from 'react';
import {
  useAnimationSequence,
  AnimationSequenceConfig,
  AnimationStage,
  StaggerPattern,
  StaggerAnimationStage,
} from '../../../src/animations/orchestration/useAnimationSequence';
import { AnimationCategory } from '../../../src/animations/accessibility/MotionSensitivity';
import { Easings } from '../../../src/animations/physics/interpolation';
import { Box } from '../../../src/components/Box';
import { Paper } from '../../../src/components/Paper';
import { Typography } from '../../../src/components/Typography';
import { Button } from '../../../src/components/Button';

// Sample data
const listItems = Array.from({ length: 5 }, (_, i) => `List Item ${i + 1}`);

export const StaggeredListDemo: React.FC = () => {
  const listRef = useRef<HTMLDivElement>(null);

  // Define the stagger stage with the correct type
  const staggerStage: StaggerAnimationStage = {
    id: 'stagger-fade-in',
    type: 'stagger',
    targets: '.stagger-list-item',
    duration: 400,
    staggerDelay: 80,
    staggerPattern: StaggerPattern.SEQUENTIAL,
    from: { opacity: 0, transform: 'translateY(20px)' },
    properties: { opacity: 1, transform: 'translateY(0px)' },
    easing: Easings.easeOutCubic.function,
  };

  // Configure the animation sequence
  const sequenceConfig: AnimationSequenceConfig = {
    id: 'list-entrance-demo',
    autoplay: false,
    stages: [staggerStage],
    category: AnimationCategory.ENTRANCE,
  };

  const sequenceResult = useAnimationSequence(sequenceConfig);
  const { play, restart } = sequenceResult;

  // Function to replay the animation
  const handleReplay = () => {
    // Reset initial styles (opacity: 0, transform: translateY(20px))
    const items = listRef.current?.querySelectorAll('.stagger-list-item');
    items?.forEach((item: any) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
    });
    // Reset sequence state
    restart?.();
    // Play after a short delay to allow styles to apply
    setTimeout(() => play?.(), 50);
  };

  // Play the animation once on mount
  useEffect(() => {
    handleReplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Paper elevation={2} style={{ padding: '24px', margin: '16px' }}>
      <Typography variant="h6" style={{ marginBottom: '16px' }}>
        Staggered List Entrance Demo
      </Typography>
      <Button onClick={handleReplay} style={{ marginBottom: '16px' }}>
        Replay Animation
      </Button>
      <Box ref={listRef}>
        {listItems.map((item, index) => (
          <Box
            key={index}
            className="stagger-list-item"
            style={{
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              border: '1px solid',
              borderColor: '#e0e0e0',
              opacity: 0,
              transform: 'translateY(20px)',
              willChange: 'opacity, transform',
            }}
          >
            {item}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}; 