import { useRef, useCallback } from 'react';

export interface Vector2D {
  x: number;
  y: number;
}

export interface MomentumResult {
  x: number;
  y: number;
}

export interface UseMomentumOptions {
  /**
   * Friction coefficient for momentum tracking
   */
  friction?: number;
  
  /**
   * Velocity threshold before coming to rest
   */
  restVelocityThreshold?: number;
  
  /**
   * Minimum time in ms required for a press gesture
   */
  minimumPressTime?: number;
  
  /**
   * Number of samples to track for velocity calculation
   */
  sampleSize?: number;
  
  /**
   * Use weighted average for velocity calculation
   */
  weightedAverage?: boolean;
  
  /**
   * Multiplier for velocity
   */
  velocityMultiplier?: number;
  
  /**
   * Enable predictive tracking
   */
  predictiveTracking?: boolean;
}

/**
 * Simplified momentum tracking hook for user interactions
 * Tracks pointer movements and calculates velocity
 */
export function useMomentum(options: UseMomentumOptions = {}) {
  const {
    friction = 0.8,
    restVelocityThreshold = 0.1,
    minimumPressTime = 100,
    sampleSize = 5,
    weightedAverage = true,
    velocityMultiplier = 1.0,
    predictiveTracking = false
  } = options;
  
  // Store position and time samples for velocity calculation
  const samples = useRef<Array<{x: number, y: number, time: number}>>([]);
  const startTimeRef = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);
  
  // Start tracking momentum
  const start = useCallback((x: number, y: number) => {
    samples.current = [{x, y, time: Date.now()}];
    startTimeRef.current = Date.now();
    isTrackingRef.current = true;
  }, []);
  
  // Update tracking with new position
  const update = useCallback((x: number, y: number) => {
    if (!isTrackingRef.current) return {x: 0, y: 0};
    
    const now = Date.now();
    
    // Add new sample, keeping only the last N samples
    samples.current.push({x, y, time: now});
    if (samples.current.length > sampleSize) {
      samples.current.shift();
    }
    
    // If we don't have at least 2 samples, can't calculate velocity
    if (samples.current.length < 2) {
      return {x: 0, y: 0};
    }
    
    // Calculate raw delta
    const oldest = samples.current[0];
    const newest = samples.current[samples.current.length - 1];
    const deltaX = newest.x - oldest.x;
    const deltaY = newest.y - oldest.y;
    const deltaTime = newest.time - oldest.time;
    
    // Return raw delta
    return {x: deltaX, y: deltaY};
  }, [sampleSize]);
  
  // End tracking and calculate final velocity
  const end = useCallback(() => {
    if (!isTrackingRef.current || samples.current.length < 2) {
      isTrackingRef.current = false;
      samples.current = [];
      return {x: 0, y: 0};
    }
    
    const now = Date.now();
    const gestureTime = now - startTimeRef.current;
    
    // If the gesture was too short, don't apply momentum
    if (gestureTime < minimumPressTime) {
      isTrackingRef.current = false;
      samples.current = [];
      return {x: 0, y: 0};
    }
    
    // Calculate weighted or simple average of velocity
    let velocityX = 0;
    let velocityY = 0;
    
    if (weightedAverage) {
      // Use weighted average giving more importance to recent movements
      let totalWeight = 0;
      let weightedSumX = 0;
      let weightedSumY = 0;
      
      for (let i = 1; i < samples.current.length; i++) {
        const prev = samples.current[i-1];
        const curr = samples.current[i];
        const deltaTime = curr.time - prev.time;
        
        if (deltaTime > 0) {
          // More recent samples get higher weight
          const weight = i / samples.current.length;
          const velocityFactorX = (curr.x - prev.x) / deltaTime;
          const velocityFactorY = (curr.y - prev.y) / deltaTime;
          
          weightedSumX += velocityFactorX * weight;
          weightedSumY += velocityFactorY * weight;
          totalWeight += weight;
        }
      }
      
      if (totalWeight > 0) {
        velocityX = (weightedSumX / totalWeight) * 1000; // Convert to px/sec
        velocityY = (weightedSumY / totalWeight) * 1000; // Convert to px/sec
      }
    } else {
      // Simple velocity calculation using oldest and newest samples
      const oldest = samples.current[0];
      const newest = samples.current[samples.current.length - 1];
      const deltaX = newest.x - oldest.x;
      const deltaY = newest.y - oldest.y;
      const deltaTime = newest.time - oldest.time;
      
      if (deltaTime > 0) {
        velocityX = (deltaX / deltaTime) * 1000; // Convert to px/sec
        velocityY = (deltaY / deltaTime) * 1000; // Convert to px/sec
      }
    }
    
    // Apply velocity multiplier
    velocityX *= velocityMultiplier;
    velocityY *= velocityMultiplier;
    
    // If predictive tracking is enabled, try to predict momentum direction
    if (predictiveTracking && samples.current.length >= 3) {
      // Analyze pattern to predict if the motion was accelerating or decelerating
      const acceleration = calculateAcceleration(samples.current);
      
      if (acceleration.x !== 0) {
        // Apply a boost in the direction of acceleration
        velocityX += Math.sign(acceleration.x) * Math.abs(velocityX) * 0.2;
      }
      
      if (acceleration.y !== 0) {
        // Apply a boost in the direction of acceleration
        velocityY += Math.sign(acceleration.y) * Math.abs(velocityY) * 0.2;
      }
    }
    
    // Reset tracking state
    isTrackingRef.current = false;
    samples.current = [];
    
    return {x: velocityX, y: velocityY};
  }, [minimumPressTime, weightedAverage, velocityMultiplier, predictiveTracking]);
  
  // Calculate acceleration from samples
  const calculateAcceleration = (samples: Array<{x: number, y: number, time: number}>) => {
    if (samples.length < 3) return {x: 0, y: 0};
    
    const first = samples[0];
    const middle = samples[Math.floor(samples.length / 2)];
    const last = samples[samples.length - 1];
    
    const firstToMiddleTime = middle.time - first.time;
    const middleToLastTime = last.time - middle.time;
    
    if (firstToMiddleTime <= 0 || middleToLastTime <= 0) return {x: 0, y: 0};
    
    const firstToMiddleVelocityX = (middle.x - first.x) / firstToMiddleTime;
    const middleToLastVelocityX = (last.x - middle.x) / middleToLastTime;
    
    const firstToMiddleVelocityY = (middle.y - first.y) / firstToMiddleTime;
    const middleToLastVelocityY = (last.y - middle.y) / middleToLastTime;
    
    const accelerationX = middleToLastVelocityX - firstToMiddleVelocityX;
    const accelerationY = middleToLastVelocityY - firstToMiddleVelocityY;
    
    return {
      x: Math.sign(accelerationX),
      y: Math.sign(accelerationY)
    };
  };
  
  return {
    start,
    update,
    end
  };
} 