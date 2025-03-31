/**
 * ParticleBackground Component
 *
 * A dynamic background with animated particles.
 */
import React, { forwardRef, useRef, useEffect, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ParticleBackgroundProps } from '../surfaces/types';

// Particle interface
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

// Canvas Style
const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ParticleCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
`;

const BlurLayer = styled.div<{
  $blur: boolean;
  $blurAmount: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: ${props => (props.$blur ? `blur(${props.$blurAmount}px)` : 'none')};
  -webkit-backdrop-filter: ${props => (props.$blur ? `blur(${props.$blurAmount}px)` : 'none')};
  pointer-events: none;
  z-index: 1;
`;

const BackgroundLayer = styled.div<{
  $baseColor: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$baseColor};
  z-index: -1;
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
`;

/**
 * ParticleBackground Component Implementation
 */
const ParticleBackgroundComponent = (
  props: ParticleBackgroundProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    children,
    className,
    style,
    baseColor = 'rgba(10, 10, 20, 0.8)',
    particleColor = 'rgba(255, 255, 255, 0.7)',
    particleCount = 50,
    particleSize = 2,
    particleSpeed = 1,
    connectParticles = true,
    interactive = true,
    blur = false,
    blurAmount = 5,
    ...rest
  } = props;

  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // State for mouse position
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Create particles
  const particles = useMemo(() => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: Math.random() * 100, // Percentage
        y: Math.random() * 100, // Percentage
        size: Math.random() * particleSize + 1,
        speedX: (Math.random() - 0.5) * particleSpeed * 0.1,
        speedY: (Math.random() - 0.5) * particleSpeed * 0.1,
        opacity: Math.random() * 0.5 + 0.3,
        color: particleColor,
      });
    }

    return newParticles;
  }, [particleCount, particleSize, particleSpeed, particleColor]);

  // Handle canvas animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, index) => {
        // Convert percentage to actual coordinates
        const x = (particle.x / 100) * canvas.width;
        const y = (particle.y / 100) * canvas.height;

        // Draw particle
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        if (connectParticles) {
          for (let j = index + 1; j < particles.length; j++) {
            const otherParticle = particles[j];
            const otherX = (otherParticle.x / 100) * canvas.width;
            const otherY = (otherParticle.y / 100) * canvas.height;

            const distance = Math.sqrt(Math.pow(x - otherX, 2) + Math.pow(y - otherY, 2));

            if (distance < canvas.width * 0.07) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(${particle.color}, ${
                0.3 - (distance / (canvas.width * 0.07)) * 0.3
              })`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(x, y);
              ctx.lineTo(otherX, otherY);
              ctx.stroke();
            }
          }
        }

        // Connect to mouse if interactive
        if (interactive && mousePosition) {
          const mouseX = mousePosition.x * canvas.width;
          const mouseY = mousePosition.y * canvas.height;

          const distance = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));

          if (distance < canvas.width * 0.1) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${particle.color}, ${
              0.5 - (distance / (canvas.width * 0.1)) * 0.5
            })`;
            ctx.lineWidth = 1;
            ctx.moveTo(x, y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Handle boundaries
        if (particle.x < 0 || particle.x > 100) {
          particle.speedX *= -1;
        }

        if (particle.y < 0 || particle.y > 100) {
          particle.speedY *= -1;
        }
      });

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particles, connectParticles, interactive, mousePosition, prefersReducedMotion]);

  // Handle mouse movement
  useEffect(() => {
    if (!interactive || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive, prefersReducedMotion]);

  // Combine external ref with internal containerRef
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    },
    [ref]
  );

  return (
    <CanvasContainer ref={setRefs} className={className} style={style} {...rest}>
      <BackgroundLayer $baseColor={baseColor} />

      <ParticleCanvas ref={canvasRef} />

      <BlurLayer $blur={blur} $blurAmount={blurAmount} />

      <ContentLayer>{children}</ContentLayer>
    </CanvasContainer>
  );
};

// Wrap the component function with forwardRef
const ParticleBackground = forwardRef(ParticleBackgroundComponent);
ParticleBackground.displayName = 'ParticleBackground';

export default ParticleBackground;
