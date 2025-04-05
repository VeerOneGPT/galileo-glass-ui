import React, { useRef, useEffect, useState, CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';

import {
    GesturePhysicsOptions,
    GesturePhysicsResult,
    GestureTransform
} from '@veerone/galileo-glass-ui';

// Correct: Import hook from hooks subpath
import { useGesturePhysics } from '@veerone/galileo-glass-ui/hooks';

// Import Galileo components
import {
    GlassBox,
    GlassTypography,
} from '@veerone/galileo-glass-ui';

// Styled component for the draggable element - Keep base styles only
const DraggableCircle = styled(GlassBox)`
  width: 80px;
  height: 80px;
  background-color: var(--glass-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: grab;
  position: absolute;
  /* Position is set dynamically via style prop */
  will-change: transform;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  /* touchAction and userSelect will be applied via style prop */
`;

// Story Component Wrapper
const GesturePhysicsDemoComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<HTMLDivElement>(null);

  // Call useGesturePhysics directly in the component scope
  // Ensure draggableRef.current exists before passing it, or handle null case
  // We'll assume draggableRef is valid after initial render for simplicity here,
  // but a real app might need a check or conditional rendering.
  const { style, reset } = useGesturePhysics({
    elementRef: draggableRef as React.RefObject<HTMLElement>, // Keep type assertion for now
    pan: { enabled: true },
    swipe: { enabled: true },
    friction: 20,
    inertia: true,
    // Remove onTransformChange:
    // onTransformChange: (newTransform) => { ... }
  });

  // Remove the useEffect hook entirely:
  // useEffect(() => { ... }, []);

  // No need for combinedStyle anymore, we use `style` directly from the hook.
  // const combinedStyle: React.CSSProperties = { ... };

  return (
    <GlassBox elevation={2} style={{ padding: '24px', margin: '16px', minWidth: 350, background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <GlassTypography variant="h6" style={{ marginBottom: '8px' }}>
        Gesture Physics Demo
      </GlassTypography>
      <GlassTypography variant="body2" style={{ marginBottom: '24px' }}>
        Click and drag the circle. Flick it to see momentum.
      </GlassTypography>
      <GlassBox
        ref={containerRef}
        style={{
          width: '100%',
          height: '300px',
          border: '1px dashed var(--glass-border-color)',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)'
        }}
      >
        {/* Apply the style directly from the hook */}
        <DraggableCircle ref={draggableRef} style={style}>
          Drag
        </DraggableCircle>
      </GlassBox>
      {/* Optional: Add a button to test reset */}
      {/* <button onClick={() => reset()}>Reset</button> */}
    </GlassBox>
  );
};

// Storybook Meta
const meta: Meta<typeof GesturePhysicsDemoComponent> = {
    title: 'Examples/Animations/useGesturePhysics',
    component: GesturePhysicsDemoComponent,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Default Story
export const Default: Story = {}; 