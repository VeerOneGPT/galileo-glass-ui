import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { GlassStepInternalProps, Step } from './types';
import { Box } from '../Box';
// Import the new sub-components
import { GlassStepIcon } from './GlassStepIcon';
import { GlassStepLabel } from './GlassStepLabel';

// Props for the internal GlassStep
interface GlassStepProps {
  step: Step;
  index: number;
  active: boolean;
  completed: boolean;
  orientation: 'horizontal' | 'vertical';
  isLast?: boolean;
  onClick?: () => void;
}

// Wrapper for the entire step including icon and label
const StepWrapper = styled(Box)<{ $orientation: 'horizontal' | 'vertical', $clickable: boolean }>`
  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'column' : 'row'};
  align-items: center;
  position: relative; // Needed for vertical connector positioning maybe?
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  flex: 1; // Allow steps to take space, especially horizontally
  padding: ${props => props.theme.spacing?.sm ?? 4}px 0; // Add some padding
  text-align: ${props => props.$orientation === 'vertical' ? 'center' : 'left'};
`;

// Use the specific internal props type
export const GlassStep = forwardRef<HTMLDivElement, GlassStepInternalProps>((
  {
    step, 
    index,
    active,
    completed,
    orientation,
    onClick
  }, 
  ref // Receive the forwarded ref
) => {
  const isClickable = !!onClick;
  const isDisabled = step.disabled || false;

  return (
    // Attach the ref to the StepWrapper
    <StepWrapper 
      ref={ref} 
      $orientation={orientation} 
      $clickable={isClickable && !isDisabled} 
      onClick={isDisabled ? undefined : onClick} 
      style={{ opacity: isDisabled ? 0.5 : 1 }} // Dim disabled steps
    >
      {/* Use GlassStepIcon component */}
      <GlassStepIcon 
          index={index} 
          active={active} 
          completed={completed} 
          icon={step.icon} 
      />
      {/* Use GlassStepLabel component */}
      <GlassStepLabel 
          label={step.label} 
          active={active} 
          completed={completed} 
          orientation={orientation} 
      />
    </StepWrapper>
  );
});

GlassStep.displayName = 'GlassStep';
