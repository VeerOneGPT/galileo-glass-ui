/**
 * usePositionInertia Hook
 * 
 * A custom hook that manages 2D position with inertia physics for smooth scrolling
 * and interactions. Used by the GlassTimeline for scrolling behaviors.
 */
import { useState, useCallback, useMemo } from 'react';
import { useInertialMovement, type InertialMovementOptions } from '../../../animations/physics/useInertialMovement';
import { InertialPresets, type InertialConfig } from '../../../animations/physics/inertialMovement';

// Types for position in 2D space
export interface Position2D {
  x: number;
  y: number;
}

// Return type for the hook
export interface UsePositionInertiaResult {
  position: Position2D;
  setPosition: (position: Position2D, velocity?: Position2D) => void;
  flick: (velocity: Position2D) => void;
  stop: () => void;
  updateConfig: (newConfig: Partial<InertialConfig>) => void;
}

/**
 * Hook for managing position with inertia in 2D space
 * 
 * @param initialPosition - Starting position
 * @param options - Inertial movement configuration options
 * @returns Methods for controlling and monitoring the position
 */
export const usePositionInertia = (
  initialPosition: Position2D = { x: 0, y: 0 },
  options: InertialMovementOptions = {}
): UsePositionInertiaResult => {

  // --- Refined Config Handling --- 
  const getAxisConfig = (axis: 'x' | 'y'): Partial<InertialConfig> => {
    let configPart: Partial<InertialConfig> = {};
    if (typeof options.config === 'string') {
      // If it's a preset string, get the preset object
      configPart = InertialPresets[options.config] || {}; 
    } else if (options.config) {
      // If it's an object, use it directly
      configPart = options.config;
    }
    // Return only the config part, assuming bounds are handled correctly within InertialConfig type
    return configPart;
  };

  // Initialize configs (without options spread initially, just the config part)
  const initialConfigX = useMemo(() => getAxisConfig('x'), [options.config]);
  const initialConfigY = useMemo(() => getAxisConfig('y'), [options.config]);

  // Initialize x-axis inertial movement
  const { 
    position: xPosition, 
    setPosition: setXInternal,
    flick: flickX,
    stop: stopX,
    updateConfig: updateConfigX
  } = useInertialMovement({
    initialPosition: initialPosition.x,
    // Pass initial velocity/autoStart from options if they exist
    initialVelocity: options.initialVelocity,
    autoStart: options.autoStart,
    config: initialConfigX // Pass the calculated config object
  });
  
  // Initialize y-axis inertial movement
  const { 
    position: yPosition, 
    setPosition: setYInternal,
    flick: flickY,
    stop: stopY,
    updateConfig: updateConfigY
  } = useInertialMovement({
    initialPosition: initialPosition.y,
    initialVelocity: options.initialVelocity,
    autoStart: options.autoStart,
    config: initialConfigY // Pass the calculated config object
  });
  
  // Combine x and y positions into a single state object
  const position = useMemo(() => ({ x: xPosition, y: yPosition }), [xPosition, yPosition]);

  // Set both x and y positions together
  const setPosition = useCallback((newPosition: Position2D, velocity?: Position2D) => {
    setXInternal(newPosition.x, velocity?.x);
    setYInternal(newPosition.y, velocity?.y);
  }, [setXInternal, setYInternal]);

  // Apply a velocity in both dimensions (flick gesture)
  const flick = useCallback((velocity: Position2D) => {
    flickX(velocity.x);
    flickY(velocity.y);
  }, [flickX, flickY]);

  // Stop all movement
  const stop = useCallback(() => {
    stopX();
    stopY();
  }, [stopX, stopY]);

  // Update config options for both axes
  const updateConfig = useCallback((newConfigPart: Partial<InertialConfig>) => {
    // Update each axis hook with the new partial config
    // The hook internally merges this with its existing config
    updateConfigX(newConfigPart); 
    updateConfigY(newConfigPart);
  }, [updateConfigX, updateConfigY]);
  
  return { position, setPosition, flick, stop, updateConfig };
};

// Utility function for clamping values within a range
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));