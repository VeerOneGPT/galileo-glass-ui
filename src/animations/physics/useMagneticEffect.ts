/**
 * React hook for magnetic effects
 */

import { useRef, useEffect, useState } from 'react';
import { ForceVector, MagneticEffectOptions } from './magneticEffect';
import { useReducedMotion } from '../accessibility/useReducedMotion';
import { 
  DirectionalFieldConfig, 
  PointerData,
  DirectionalForceResult,
} from './directionalField';
import { 
  calculateDirectionalForce,
  vectorMagnitude,
  vectorAngle
} from './directionalFieldImpl';

/**
 * Helper interface for element position tracking
 */
interface Position {
  x: number;
  y: number;
}

/**
 * Hook to apply magnetic effects to a React element
 * @param options Magnetic effect configuration options
 * @returns A ref to attach to the target element
 */
export const useMagneticEffect = (options: MagneticEffectOptions = {}) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Track the mouse position
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  
  // Track the element's current transform state
  const transformRef = useRef({
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    active: false,
  });
  
  // Handle animation frame requests
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());
  
  // Combine options with defaults and accessibility
  const combinedOptions = {
    ...options,
    reducedMotion: prefersReducedMotion || options.reducedMotion,
  };
  
  const {
    strength = 0.5,
    radius = 200,
    type = 'attract',
    easeFactor = 0.15,
    maxDisplacement = 50,
    affectsRotation = false,
    affectsScale = false,
    rotationAmplitude = 10,
    scaleAmplitude = 0.1,
    smooth = true,
    smoothingDuration = 200,
    fieldShape = 'circular',
    decayFunction = 'linear',
    useMomentum = false,
    friction = 0.9,
    directionalField = null, // New option for directional field
  } = combinedOptions;
  
  // Adjust for reduced motion
  const adjustedStrength = combinedOptions.reducedMotion 
    ? Math.min(strength * 0.3, 0.1) 
    : strength;
  
  const adjustedMaxDisplacement = combinedOptions.reducedMotion
    ? Math.min(maxDisplacement * 0.3, 10)
    : maxDisplacement;
  
  const adjustedRotationAmplitude = combinedOptions.reducedMotion 
    ? 0 
    : rotationAmplitude;
    
  const adjustedScaleAmplitude = combinedOptions.reducedMotion 
    ? 0 
    : scaleAmplitude;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Apply smooth transition if enabled
    if (smooth) {
      element.style.transition = `transform ${smoothingDuration}ms ease-out`;
    } else {
      element.style.transition = '';
    }
    
    // Set start time for animations
    startTimeRef.current = Date.now();
    
    // Mouse movement handler for tracking mouse position
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Get element position
      const rect = element.getBoundingClientRect();
      const elementCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      
      // Calculate distance
      const distanceX = e.clientX - elementCenter.x;
      const distanceY = e.clientY - elementCenter.y;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Check if within magnetic field
      if (distance < radius) {
        transformRef.current.active = true;
        
        // Start animation if not already running
        if (!requestRef.current) {
          requestRef.current = requestAnimationFrame(updatePosition);
        }
      } else {
        transformRef.current.active = false;
      }
    };
    
    // Animation update function
    const updatePosition = () => {
      const transform = transformRef.current;
      
      if (!element) {
        // Cancel animation if element is gone
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = undefined;
        }
        return;
      }
      
      if (!transform.active) {
        // Reset position smoothly when not active
        transform.x *= (1 - easeFactor);
        transform.y *= (1 - easeFactor);
        transform.rotation *= (1 - easeFactor);
        transform.scale = 1 + (transform.scale - 1) * (1 - easeFactor);
        
        // Stop animation when close to original position
        if (
          Math.abs(transform.x) < 0.1 && 
          Math.abs(transform.y) < 0.1 && 
          Math.abs(transform.rotation) < 0.1 && 
          Math.abs(transform.scale - 1) < 0.01
        ) {
          element.style.transform = '';
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = undefined;
          }
          return;
        }
      } else {
        // Get element position
        const rect = element.getBoundingClientRect();
        const elementCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        
        // Calculate distance
        const distanceX = mousePosition.x - elementCenter.x;
        const distanceY = mousePosition.y - elementCenter.y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        if (distance < radius) {
          let targetX = 0;
          let targetY = 0;
          let forceAngle = 0;
          
          // Check if directional field is provided
          if (directionalField) {
            // Create pointer data for directional field
            const pointerData: PointerData = {
              position: { 
                x: distanceX / radius, // Normalize to -1 to 1
                y: distanceY / radius
              },
              distance: distance,
              normalizedDistance: distance / radius,
              angle: Math.atan2(distanceY, distanceX),
              elapsedTime: Date.now() - startTimeRef.current
            };
            
            // Calculate directional force
            const result = calculateDirectionalForce(
              directionalField as DirectionalFieldConfig, 
              pointerData
            );
            
            // Apply force with strength and max displacement scaling
            targetX = result.force.x * adjustedMaxDisplacement * adjustedStrength;
            targetY = result.force.y * adjustedMaxDisplacement * adjustedStrength;
            forceAngle = result.angle;
          } else {
            // Standard magnetic field calculation
            const normalizedDistance = distance / radius;
            let forceMultiplier = 0;
            
            // Apply decay function
            switch (decayFunction) {
              case 'quadratic':
                forceMultiplier = 1 - normalizedDistance * normalizedDistance;
                break;
              case 'exponential':
                forceMultiplier = Math.exp(-4 * normalizedDistance);
                break;
              case 'inverse':
                forceMultiplier = normalizedDistance < 0.1 ? 1 : 1 / (10 * normalizedDistance);
                break;
              case 'constant':
                forceMultiplier = 1;
                break;
              case 'linear':
              default:
                forceMultiplier = 1 - normalizedDistance;
                break;
            }
            
            // Calculate target position based on type
            switch (type) {
              case 'repel':
                targetX = -distanceX * forceMultiplier * adjustedStrength;
                targetY = -distanceY * forceMultiplier * adjustedStrength;
                break;
              case 'orbit':
                const angle = Math.atan2(distanceY, distanceX) + 0.5; // Rotate 90 degrees
                const orbitDistance = distance * forceMultiplier * adjustedStrength;
                targetX = Math.cos(angle) * orbitDistance;
                targetY = Math.sin(angle) * orbitDistance;
                forceAngle = angle;
                break;
              case 'attract':
              default:
                targetX = distanceX * forceMultiplier * adjustedStrength;
                targetY = distanceY * forceMultiplier * adjustedStrength;
                forceAngle = Math.atan2(distanceY, distanceX);
                break;
            }
            
            // Apply max displacement
            const magnitude = Math.sqrt(targetX * targetX + targetY * targetY);
            if (magnitude > adjustedMaxDisplacement) {
              const scale = adjustedMaxDisplacement / magnitude;
              targetX *= scale;
              targetY *= scale;
            }
          }
          
          // Apply smooth movement
          if (useMomentum) {
            // Physics-based momentum
            transform.x += (targetX - transform.x) * easeFactor;
            transform.y += (targetY - transform.y) * easeFactor;
            
            // Apply friction
            transform.x *= friction;
            transform.y *= friction;
          } else {
            // Simple ease
            transform.x = transform.x + (targetX - transform.x) * easeFactor;
            transform.y = transform.y + (targetY - transform.y) * easeFactor;
          }
          
          // Apply rotation based on magnetic effect or directional field
          if (affectsRotation) {
            let rotationTarget = 0;
            
            if (directionalField) {
              // Use the force angle from directional field
              rotationTarget = (forceAngle * 180 / Math.PI) % 360;
            } else if (type === 'repel') {
              rotationTarget = -((distanceX / radius) * adjustedRotationAmplitude);
            } else {
              rotationTarget = (distanceX / radius) * adjustedRotationAmplitude;
            }
            
            transform.rotation = transform.rotation + (rotationTarget - transform.rotation) * easeFactor;
          }
          
          // Apply scale based on magnetic effect
          if (affectsScale) {
            let scaleTarget = 1;
            
            if (directionalField) {
              // Calculate scale based on force magnitude
              const forceMagnitude = Math.sqrt(targetX * targetX + targetY * targetY) / adjustedMaxDisplacement;
              scaleTarget = 1 + forceMagnitude * adjustedScaleAmplitude;
            } else if (type === 'repel') {
              const forceMultiplier = 1 - (distance / radius);
              scaleTarget = 1 - forceMultiplier * adjustedScaleAmplitude;
            } else {
              const forceMultiplier = 1 - (distance / radius);
              scaleTarget = 1 + forceMultiplier * adjustedScaleAmplitude;
            }
            
            transform.scale = transform.scale + (scaleTarget - transform.scale) * easeFactor;
          }
        }
      }
      
      // Apply the transform
      element.style.transform = `
        translate(${transform.x}px, ${transform.y}px)
        ${affectsRotation ? `rotate(${transform.rotation}deg)` : ''}
        ${affectsScale ? `scale(${transform.scale})` : ''}
      `;
      
      // Continue animation
      requestRef.current = requestAnimationFrame(updatePosition);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      // Clean up event listeners and animations
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
      
      // Reset element transform
      if (element) {
        element.style.transform = '';
        element.style.transition = '';
      }
    };
  }, [
    adjustedMaxDisplacement,
    adjustedRotationAmplitude,
    adjustedScaleAmplitude,
    adjustedStrength,
    affectsRotation,
    affectsScale,
    decayFunction,
    directionalField,
    easeFactor,
    fieldShape,
    friction,
    radius,
    smooth,
    smoothingDuration,
    type,
    useMomentum,
  ]);

  return elementRef;
};

export default useMagneticEffect; 