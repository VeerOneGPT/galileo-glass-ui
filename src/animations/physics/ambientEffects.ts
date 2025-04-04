/**
 * Ambient Physics Effects
 * 
 * Provides physics-based ambient animations and effects for UI components
 */

import { useRef, useEffect } from 'react';
import { Vector2D } from './types';

// Types for ambient effects
export interface AmbientEffectOptions {
  strength?: number;
  frequency?: number;
  enabled?: boolean;
  amplitude?: number;
}

const defaultOptions: AmbientEffectOptions = {
  strength: 1.0,
  frequency: 0.5,
  enabled: true,
  amplitude: 1.0
};

/**
 * Creates a gentle ambient movement effect
 */
export const useAmbientMovement = (options: AmbientEffectOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  const positionRef = useRef<Vector2D>({ x: 0, y: 0 });
  
  return positionRef;
};

/**
 * Creates a floating effect that mimics hovering in space
 */
export const useFloatingEffect = (options: AmbientEffectOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  const transformRef = useRef<{ y: number; rotation: number }>({ y: 0, rotation: 0 });
  const requestRef = useRef<number>(null);

  useEffect(() => {
    if (!opts.enabled) return;
    
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // Subtle floating motion
      const yOffset = Math.sin(time * 0.0008 * opts.frequency) * opts.amplitude * opts.strength;
      const rotation = Math.sin(time * 0.0005 * opts.frequency) * opts.amplitude * 0.5 * opts.strength;
      
      transformRef.current = {
        y: yOffset,
        rotation: rotation,
      };
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [opts.enabled, opts.frequency, opts.strength, opts.amplitude]);
  
  return transformRef;
};

/**
 * Applies a breathing effect (subtle scale animation)
 */
export const useBreathingEffect = (options: AmbientEffectOptions = {}) => {
  const opts = { ...defaultOptions, ...options };
  const scaleRef = useRef<number>(1);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    if (!opts.enabled) return;
    
    const animate = (time: number) => {
      // Gentle "breathing" scaling effect
      const scale = 1 + Math.sin(time * 0.0006 * opts.frequency) * 0.02 * opts.amplitude * opts.strength;
      scaleRef.current = scale;
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [opts.enabled, opts.frequency, opts.strength, opts.amplitude]);
  
  return scaleRef;
};