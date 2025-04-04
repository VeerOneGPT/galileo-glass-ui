import React, { forwardRef, useCallback, useRef, useEffect, useState, createRef, CSSProperties, useMemo } from 'react';
import styled from 'styled-components';
import { GlassStepperProps } from './types';
import { Box } from '../Box';
import { GlassStep } from './GlassStep';
import { useVectorSpring } from '../../animations/physics/useVectorSpring';

// --- Styled Components ---

const StepperContainer = styled.div<{ $orientation?: 'horizontal' | 'vertical' }>`
  display: flex;
  flex-direction: ${props => props.$orientation === 'vertical' ? 'column' : 'row'};
  align-items: ${props => props.$orientation === 'vertical' ? 'stretch' : 'center'};
  position: relative;
  &:focus {
    outline: 2px solid ${props => props.theme.colors?.primary?.main || 'blue'};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const StepConnector = styled(Box)<{
  $orientation: 'horizontal' | 'vertical';
  $completed: boolean;
}>`
  flex-grow: 1;
  height: ${props => props.$orientation === 'vertical' ? 'auto' : '2px'};
  width: ${props => props.$orientation === 'vertical' ? '2px' : 'auto'};
  background-color: ${props => 
    props.$completed ? (props.theme.colors?.primary?.main || 'blue') : 
    (props.theme.colors?.divider || '#ccc')
  };
  margin: ${props => props.$orientation === 'vertical' ? '8px 0 8px 11px' : '0 16px'};
  align-self: ${props => props.$orientation === 'vertical' ? 'stretch' : 'center'};
  min-height: ${props => props.$orientation === 'vertical' ? '20px' : '2px'};
  min-width: ${props => props.$orientation !== 'vertical' ? '20px' : '2px'};
  opacity: ${props => props.$completed ? 1 : 0.5};
  transition: background-color 0.3s ease, opacity 0.3s ease;
  position: ${props => props.$orientation === 'vertical' ? 'absolute' : 'relative'};
  left: ${props => props.$orientation === 'vertical' ? '11px' : 'auto'};
  top: ${props => props.$orientation === 'vertical' ? '32px' : 'auto'};
  bottom: ${props => props.$orientation === 'vertical' ? '8px' : 'auto'};
  z-index: 0;
`;

// Styled component for the moving indicator
const StyledIndicator = styled(Box)<{ $orientation: 'horizontal' | 'vertical' }>`
  position: absolute;
  background-color: ${props => props.theme.colors?.primary?.main || 'blue'};
  border-radius: ${props => props.$orientation === 'horizontal' ? '2px' : '12px'};
  z-index: 0;
  width: ${props => props.$orientation === 'horizontal' ? '32px' : '4px'};
  height: ${props => props.$orientation === 'horizontal' ? '4px' : '32px'};
  left: 0;
  top: 0;
  will-change: transform;
`;

export const GlassStepper = forwardRef<HTMLDivElement, GlassStepperProps>(
    ({ steps, activeStep = 0, orientation = 'horizontal', className, style, onStepClick }, ref) => {
        
        const containerRef = useRef<HTMLDivElement>(null);
        const stepRefs = useMemo(() => 
            Array.from({ length: steps.length }, () => createRef<HTMLDivElement>()), 
            [steps.length]
        );

        const positionSpring = useVectorSpring({
            config: { tension: 210, friction: 20 },
        });

        useEffect(() => {
            const activeStepRef = stepRefs[activeStep]?.current;
            const containerElement = containerRef.current;

            if (activeStepRef && containerElement) {
                const stepRect = activeStepRef.getBoundingClientRect();
                const containerRect = containerElement.getBoundingClientRect();

                let targetX = 0;
                let targetY = 0;
                const indicatorWidth = orientation === 'horizontal' ? 32 : 4;
                const indicatorHeight = orientation === 'horizontal' ? 4 : 32;

                if (orientation === 'horizontal') {
                    const relativeLeft = stepRect.left - containerRect.left;
                    targetX = relativeLeft + (stepRect.width / 2) - (indicatorWidth / 2);
                    targetY = stepRect.height;
                } else {
                    const relativeTop = stepRect.top - containerRect.top;
                    targetX = -4;
                    targetY = relativeTop + (stepRect.height / 2) - (indicatorHeight / 2);
                }
                
                positionSpring.start({ to: { x: targetX, y: targetY } });
            }
        }, [activeStep, orientation, steps.length, stepRefs, positionSpring]);

        const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
            let newIndex = activeStep;
            let shouldUpdate = false;

            const lastIndex = steps.length - 1;

            switch (event.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    if (activeStep < lastIndex) {
                        newIndex = activeStep + 1;
                        shouldUpdate = true;
                    }
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                     if (activeStep > 0) {
                        newIndex = activeStep - 1;
                        shouldUpdate = true;
                    }
                    break;
                case 'Home':
                    if (activeStep !== 0) {
                        newIndex = 0;
                        shouldUpdate = true;
                    }
                    break;
                case 'End':
                    if (activeStep !== lastIndex) {
                        newIndex = lastIndex;
                        shouldUpdate = true;
                    }
                    break;
                default:
                    return;
            }

            if (shouldUpdate) {
                event.preventDefault();
                onStepClick?.(newIndex); 
            }
        }, [activeStep, steps.length, onStepClick]);

        const mergeRefs = (...refs: Array<React.Ref<HTMLDivElement> | undefined>) => {
            return (instance: HTMLDivElement | null) => {
                refs.forEach(ref => {
                    if (typeof ref === 'function') {
                        ref(instance);
                    } else if (ref != null) {
                        (ref as React.MutableRefObject<HTMLDivElement | null>).current = instance;
                    }
                });
            };
        };

        return (
            <StepperContainer 
                ref={mergeRefs(ref, containerRef)} 
                $orientation={orientation} 
                className={className} 
                style={style}
                role="tablist"
                aria-orientation={orientation}
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                <StyledIndicator 
                    data-testid="stepper-indicator"
                    $orientation={orientation} 
                    style={{ 
                        transform: `translate3d(${positionSpring.value.x.toFixed(1)}px, ${positionSpring.value.y.toFixed(1)}px, 0)` 
                    }}
                 />
                
                {steps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;
                    const isLast = index === steps.length - 1; 
                    
                    return (
                        <Box 
                            key={step.id} 
                            display="flex" 
                            alignItems="center" 
                            style={{ 
                                flexGrow: orientation === 'horizontal' ? 1 : 0, 
                                position: 'relative', 
                                zIndex: 1
                            }}
                        >
                            <GlassStep
                                ref={stepRefs[index]} 
                                step={step} 
                                index={index}
                                active={isActive}
                                completed={isCompleted}
                                orientation={orientation}
                                onClick={onStepClick ? () => onStepClick(index) : undefined}
                            />
                            {!isLast && (
                                <StepConnector 
                                    $orientation={orientation} 
                                    $completed={isCompleted}
                                    aria-hidden="true"
                                />
                            )}
                        </Box>
                    );
                })}
            </StepperContainer>
        );
    }
);

GlassStepper.displayName = 'GlassStepper';

// TODO: Implement physics animations for active step indicator 