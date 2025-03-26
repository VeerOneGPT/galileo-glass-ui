/**
 * Physics Animation Demo
 *
 * Demonstrates the usage of physics-based animations and effects
 */
import React, { useState } from 'react';
import styled from 'styled-components';

import { magneticEffect } from '../animations/physics/magneticEffect';
import { particleSystem } from '../animations/physics/particleSystem';
import { springAnimation } from '../animations/physics/springAnimation';
import { Box } from '../components/Box';
import { Button } from '../components/Button';
import { Paper } from '../components/Paper';
import { Stack } from '../components/Stack';
import { Typography } from '../components/Typography';
import { createThemeContext } from '../core/themeUtils';
import usePhysicsInteraction from '../hooks/usePhysicsInteraction';
import { AnyHTMLElement } from '../utils/elementTypes';

const DemoContainer = styled.div`
  padding: 24px;
`;

const DemoSection = styled.div`
  margin-bottom: 32px;
`;

const SpringElement = styled.div<{
  theme: any;
  mass: number;
  stiffness: number;
  dampingRatio: number;
}>`
  ${props =>
    springAnimation({
      mass: props.mass,
      stiffness: props.stiffness,
      dampingRatio: props.dampingRatio,
      properties: ['transform'],
      from: { transform: 'translateY(50px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
      duration: undefined,
      repeat: false,
      fillForwards: true,
      gpuAccelerated: true,
    })}

  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 16px;
  text-align: center;
`;

const ParticleElement = styled.div<{ theme: any; type: string }>`
  ${props =>
    particleSystem({
      particleCount: 20,
      type: props.type as any,
      duration: 1500,
      size: [3, 8],
      colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
      spread: 100,
      gravity: 0.3,
      fadeOut: true,
      turbulence: 0.2,
      performanceMode: false,
      gpuAccelerated: true,
    })}

  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 16px;
  text-align: center;
  cursor: pointer;
  user-select: none;
`;

const MagneticElement = styled.div<{ theme: any; type: string }>`
  ${props =>
    magneticEffect({
      strength: 0.5,
      radius: 200,
      type: props.type as any,
      easeFactor: 0.15,
      maxDisplacement: 40,
      affectsRotation: props.type === 'attract',
      affectsScale: props.type === 'attract',
      smooth: true,
      gpuAccelerated: true,
    })}

  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 16px;
  text-align: center;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InteractionBox = styled(Box)`
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 16px;
  text-align: center;
  height: 100px;
  width: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ControlPanel = styled.div`
  background-color: rgba(0, 0, 0, 0.05);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const PhysicsDemo = () => {
  const [springMass, setSpringMass] = useState(1);
  const [springStiffness, setSpringStiffness] = useState(170);
  const [springDamping, setSpringDamping] = useState(0.8);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [particleTrigger, setParticleTrigger] = useState(0);

  // Use physics interaction hooks with proper HTML element types
  const springHook = usePhysicsInteraction<HTMLDivElement>({
    type: 'spring',
    strength: 0.5,
    radius: 150,
    mass: 1,
    stiffness: 170,
    dampingRatio: 0.8,
    reducedMotion,
  });

  const magneticHook = usePhysicsInteraction<HTMLDivElement>({
    type: 'magnetic',
    strength: 0.7,
    radius: 150,
    reducedMotion,
  });

  const gravityHook = usePhysicsInteraction<HTMLDivElement>({
    type: 'gravity',
    strength: 0.3,
    radius: 150,
    mass: 2,
    reducedMotion,
  });

  const particleHook = usePhysicsInteraction<HTMLDivElement>({
    type: 'particle',
    strength: 0.3,
    radius: 100,
    reducedMotion,
  });

  // Function to force re-render of spring elements
  const resetSprings = () => {
    const root = document.documentElement;
    const currentClass = root.className;
    root.className = currentClass + ' reset-springs';
    setTimeout(() => {
      root.className = currentClass;
    }, 10);
  };

  // Function to trigger particle effects
  const triggerParticles = (e: React.MouseEvent<HTMLDivElement>) => {
    // Add a new className to force re-render of the particleSystem animation
    setParticleTrigger(prev => prev + 1);

    // Create animated particles at click position using the DOM
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create a temporary element for particles
    const particleContainer = document.createElement('div');
    particleContainer.style.position = 'absolute';
    particleContainer.style.left = `${x}px`;
    particleContainer.style.top = `${y}px`;
    particleContainer.style.width = '10px';
    particleContainer.style.height = '10px';
    particleContainer.style.pointerEvents = 'none';

    // Add particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 8 + 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 40;
      const color = ['#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)];

      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      particle.style.opacity = '1';

      // Add animation
      particle.animate(
        [
          {
            transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
            opacity: 1,
          },
          {
            transform: `translate(${Math.cos(angle) * speed}px, ${
              Math.sin(angle) * speed
            }px) scale(0) rotate(${Math.random() * 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: Math.random() * 1000 + 500,
          easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
          fill: 'forwards',
        }
      );

      particleContainer.appendChild(particle);
    }

    element.appendChild(particleContainer);

    // Remove the container after animation completes
    setTimeout(() => {
      element.removeChild(particleContainer);
    }, 2000);
  };

  return (
    <DemoContainer>
      <Typography variant="h2">Physics Animation System</Typography>

      <ControlPanel>
        <Typography variant="h5" style={{ marginBottom: '16px' }}>
          Control Panel
        </Typography>

        <Stack direction="row" spacing={2} style={{ marginBottom: '16px' }}>
          <Button onClick={resetSprings}>Reset Spring Animations</Button>

          <Button onClick={() => setReducedMotion(!reducedMotion)}>
            {reducedMotion ? 'Disable' : 'Enable'} Reduced Motion
          </Button>
        </Stack>

        <Typography variant="body2" style={{ marginBottom: '8px' }}>
          Spring Parameters:
        </Typography>

        <Stack direction="row" spacing={2} style={{ marginBottom: '8px' }}>
          <Stack direction="column" spacing={1}>
            <Typography variant="caption">Mass: {springMass.toFixed(1)}</Typography>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={springMass}
              onChange={e => setSpringMass(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </Stack>

          <Stack direction="column" spacing={1}>
            <Typography variant="caption">Stiffness: {springStiffness}</Typography>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={springStiffness}
              onChange={e => setSpringStiffness(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </Stack>

          <Stack direction="column" spacing={1}>
            <Typography variant="caption">Damping: {springDamping.toFixed(2)}</Typography>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.05"
              value={springDamping}
              onChange={e => setSpringDamping(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </Stack>
        </Stack>

        <Typography variant="body2" style={{ fontStyle: 'italic', marginTop: '8px' }}>
          Note: Hover over the demo elements to see the physics interactions in action.
        </Typography>
      </ControlPanel>

      <DemoSection>
        <Typography variant="h4">Spring Animation</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Physics-based spring animations with configurable parameters:
        </Typography>

        <Stack spacing={2}>
          <SpringElement mass={springMass} stiffness={springStiffness} dampingRatio={springDamping}>
            <Typography variant="body1">Underdamped Spring (Bouncy)</Typography>
          </SpringElement>

          <SpringElement
            mass={springMass * 1.5}
            stiffness={springStiffness * 0.7}
            dampingRatio={springDamping * 0.7}
          >
            <Typography variant="body1">Heavy Spring (Slow)</Typography>
          </SpringElement>

          <SpringElement
            mass={springMass * 0.5}
            stiffness={springStiffness * 1.5}
            dampingRatio={springDamping * 1.5}
          >
            <Typography variant="body1">Light Spring (Fast)</Typography>
          </SpringElement>
        </Stack>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Particle System</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Physics-based particle animations with different presets (click to activate):
        </Typography>

        <Stack spacing={2}>
          <ParticleElement
            type="confetti"
            key={`confetti-${particleTrigger}`}
            onClick={triggerParticles}
          >
            <Typography variant="body1">Confetti Particles (Click Me)</Typography>
          </ParticleElement>

          <ParticleElement
            type="sparkle"
            key={`sparkle-${particleTrigger}`}
            onClick={triggerParticles}
          >
            <Typography variant="body1">Sparkle Particles (Click Me)</Typography>
          </ParticleElement>

          <ParticleElement type="dust" key={`dust-${particleTrigger}`} onClick={triggerParticles}>
            <Typography variant="body1">Dust Particles (Click Me)</Typography>
          </ParticleElement>
        </Stack>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Magnetic Effects</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          Magnetic attraction and repulsion effects (hover near elements):
        </Typography>

        <Stack spacing={2}>
          <MagneticElement type="attract">
            <Typography variant="body1">Attraction Effect (Hover Near Me)</Typography>
          </MagneticElement>

          <MagneticElement type="repel">
            <Typography variant="body1">Repulsion Effect (Hover Near Me)</Typography>
          </MagneticElement>

          <MagneticElement type="follow">
            <Typography variant="body1">Follow Effect (Hover Near Me)</Typography>
          </MagneticElement>
        </Stack>
      </DemoSection>

      <DemoSection>
        <Typography variant="h4">Physics Interaction Hook</Typography>
        <Typography variant="body1" style={{ marginBottom: '16px' }}>
          React hook for physics-based interactions (hover near elements):
        </Typography>

        <Stack direction="row" spacing={3} style={{ flexWrap: 'wrap' }}>
          <InteractionBox ref={springHook.ref} style={springHook.style}>
            <Typography variant="body1">Spring Physics</Typography>
          </InteractionBox>

          <InteractionBox ref={magneticHook.ref} style={magneticHook.style}>
            <Typography variant="body1">Magnetic Physics</Typography>
          </InteractionBox>

          <InteractionBox ref={gravityHook.ref} style={gravityHook.style}>
            <Typography variant="body1">Gravity Physics</Typography>
          </InteractionBox>

          <InteractionBox ref={particleHook.ref} style={particleHook.style}>
            <Typography variant="body1">Particle Physics</Typography>
          </InteractionBox>
        </Stack>
      </DemoSection>
    </DemoContainer>
  );
};

export default PhysicsDemo;
