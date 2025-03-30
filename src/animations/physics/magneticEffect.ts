/**
 * Magnetic Effect System
 *
 * Physics-based magnetic attraction/repulsion effects for interactive elements
 */
import { css } from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';

/**
 * Magnetic force direction vector
 */
export interface ForceVector {
  /**
   * X component of the force direction
   */
  x: number;
  
  /**
   * Y component of the force direction
   */
  y: number;
}

/**
 * Field shape for magnetic effects
 */
export type FieldShape = 'circular' | 'elliptical' | 'rectangular' | 'custom';

/**
 * Field decay function determines how force changes with distance
 */
export type FieldDecayFunction = 'linear' | 'quadratic' | 'exponential' | 'inverse' | 'constant' | 'custom';

/**
 * Magnetic effect options
 */
export interface MagneticEffectOptions {
  /**
   * Strength of the magnetic effect (higher = stronger)
   */
  strength?: number;

  /**
   * Distance at which the effect starts to be noticeable
   */
  radius?: number;

  /**
   * Type of magnetic effect
   */
  type?: 'attract' | 'repel' | 'follow' | 'orbit' | 'directional' | 'vortex' | 'custom';

  /**
   * Ease factor for smoothing the movement (0-1, lower = more smoothing)
   */
  easeFactor?: number;

  /**
   * Maximum displacement in pixels
   */
  maxDisplacement?: number;

  /**
   * If true, applies magnetic effect to rotation as well
   */
  affectsRotation?: boolean;

  /**
   * If true, applies magnetic effect to scale as well
   */
  affectsScale?: boolean;

  /**
   * Rotation amplitude in degrees (if affectsRotation is true)
   */
  rotationAmplitude?: number;

  /**
   * Scale amplitude (if affectsScale is true)
   */
  scaleAmplitude?: number;

  /**
   * For custom type, a custom animation function
   */
  customFunction?: string;

  /**
   * If true, applies transition to movement for smoother effect
   */
  smooth?: boolean;

  /**
   * Smoothing duration in milliseconds
   */
  smoothingDuration?: number;

  /**
   * If true, will optimize for GPU acceleration
   */
  gpuAccelerated?: boolean;

  /**
   * If true, reduces the effect for accessibility
   */
  reducedMotion?: boolean;
  
  /**
   * Shape of the magnetic field
   */
  fieldShape?: FieldShape;
  
  /**
   * Width of the field for non-circular shapes (in pixels)
   */
  fieldWidth?: number;
  
  /**
   * Height of the field for non-circular shapes (in pixels)
   */
  fieldHeight?: number;
  
  /**
   * Rotation of the field in degrees
   */
  fieldRotation?: number;
  
  /**
   * How force decays with distance from the center
   */
  decayFunction?: FieldDecayFunction;
  
  /**
   * Custom decay function as a string (JavaScript function)
   */
  customDecayFunction?: string;
  
  /**
   * Fixed force direction for directional field type
   */
  forceDirection?: ForceVector;
  
  /**
   * Oscillation frequency for force effects (Hz)
   */
  oscillationFrequency?: number;
  
  /**
   * If true, enables physics-based momentum for more natural movement
   */
  useMomentum?: boolean;
  
  /**
   * Friction factor when using momentum (0-1, higher = more friction)
   */
  friction?: number;
  
  /**
   * Mass factor for physics calculations (higher = more inertia)
   */
  mass?: number;
  
  /**
   * Multiple force points for complex fields
   */
  forcePoints?: Array<{
    x: number;
    y: number;
    strength: number;
    type: 'attract' | 'repel';
  }>;
  
  /**
   * If true, enables collision with other magnetic elements
   */
  enableCollision?: boolean;
  
  /**
   * If true, force is relative to element size
   */
  sizeRelativeForce?: boolean;
  
  /**
   * Delay before effect starts (milliseconds)
   */
  delay?: number;
  
  /**
   * Duration of the effect (milliseconds, 0 = infinite)
   */
  duration?: number;
  
  /**
   * Directional field configuration for sophisticated field behaviors
   * If provided, this will override the standard magnetic effects
   */
  directionalField?: any; // Using any here as the actual type will be imported by users
}

/**
 * Generate the JavaScript function for the magnetic effect
 */
const generateMagneticScript = (options: MagneticEffectOptions): string => {
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
    customFunction,
    smooth = true,
    smoothingDuration = 200,
    reducedMotion = false,
  } = options;

  // If custom function is provided, use that
  if (customFunction) {
    return customFunction;
  }

  // Reduced motion handling - much more subtle effect
  const adjustedStrength = reducedMotion ? Math.min(strength * 0.3, 0.1) : strength;
  const adjustedMaxDisplacement = reducedMotion
    ? Math.min(maxDisplacement * 0.3, 10)
    : maxDisplacement;
  const adjustedRotationAmplitude = reducedMotion ? 0 : rotationAmplitude;
  const adjustedScaleAmplitude = reducedMotion ? 0 : scaleAmplitude;

  // Create magnetic effect function based on type
  let magneticEffectScript = '';

  switch (type) {
    case 'attract':
      magneticEffectScript = `
        function applyMagneticEffect(element) {
          if (!element) return;
          
          let active = false;
          let mouseX = 0;
          let mouseY = 0;
          let elementX = 0;
          let elementY = 0;
          let currentX = 0;
          let currentY = 0;
          let currentRotation = 0;
          let currentScale = 1;
          
          // Mouse movement listener
          const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            elementX = rect.left + rect.width / 2;
            elementY = rect.top + rect.height / 2;
            
            const distanceX = mouseX - elementX;
            const distanceY = mouseY - elementY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // Use our new field calculation
            ${generateFieldCalculationFunction(options)}
            
            // Calculate magnetic pull based on the field
            if (normalizedDistance < 1) {
              const pull = forceMultiplier * ${adjustedStrength};
              const targetX = distanceX * pull;
              const targetY = distanceY * pull;
              
              // Apply max displacement
              const magnitude = Math.sqrt(targetX * targetX + targetY * targetY);
              if (magnitude > ${adjustedMaxDisplacement}) {
                const scale = ${adjustedMaxDisplacement} / magnitude;
                currentX = targetX * scale;
                currentY = targetY * scale;
              } else {
                // Smooth movement with ease factor
                currentX = currentX + (targetX - currentX) * ${easeFactor};
                currentY = currentY + (targetY - currentY) * ${easeFactor};
              }
              
              // Apply rotation based on distance from center
              if (${affectsRotation}) {
                const rotationTarget = (distanceX / ${radius}) * ${adjustedRotationAmplitude};
                currentRotation = currentRotation + (rotationTarget - currentRotation) * ${easeFactor};
              }
              
              // Apply scale based on distance from center
              if (${affectsScale}) {
                const scaleTarget = 1 + forceMultiplier * ${adjustedScaleAmplitude};
                currentScale = currentScale + (scaleTarget - currentScale) * ${easeFactor};
              }
            }
            
            // Apply transforms
            element.style.transform = \`translate(\${currentX}px, \${currentY}px) \${
              ${affectsRotation} ? \`rotate(\${currentRotation}deg)\` : ''
            } \${
              ${affectsScale} ? \`scale(\${currentScale})\` : ''
            }\`;
            
            // Continue animation loop
            window.requestAnimationFrame(updatePosition);
          };
          
          // Animation loop for smooth movement
          const updatePosition = () => {
            if (!active) {
              // Reset position smoothly when not active
              currentX = currentX * (1 - ${easeFactor});
              currentY = currentY * (1 - ${easeFactor});
              currentRotation = currentRotation * (1 - ${easeFactor});
              currentScale = 1 + (currentScale - 1) * (1 - ${easeFactor});
              
              // Stop animation when close to original position
              if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1 && 
                  Math.abs(currentRotation) < 0.1 && Math.abs(currentScale - 1) < 0.01) {
                element.style.transform = '';
                return;
              }
            } else {
              const distanceX = mouseX - elementX;
              const distanceY = mouseY - elementY;
              const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
              
              // Use our new field calculation
              ${generateFieldCalculationFunction(options)}
              
              // Calculate magnetic pull based on the field
              if (normalizedDistance < 1) {
                const pull = forceMultiplier * ${adjustedStrength};
                const targetX = distanceX * pull;
                const targetY = distanceY * pull;
                
                // Apply max displacement
                const magnitude = Math.sqrt(targetX * targetX + targetY * targetY);
                if (magnitude > ${adjustedMaxDisplacement}) {
                  const scale = ${adjustedMaxDisplacement} / magnitude;
                  currentX = targetX * scale;
                  currentY = targetY * scale;
                } else {
                  // Smooth movement with ease factor
                  currentX = currentX + (targetX - currentX) * ${easeFactor};
                  currentY = currentY + (targetY - currentY) * ${easeFactor};
                }
                
                // Apply rotation based on distance from center
                if (${affectsRotation}) {
                  const rotationTarget = (distanceX / ${radius}) * ${adjustedRotationAmplitude};
                  currentRotation = currentRotation + (rotationTarget - currentRotation) * ${easeFactor};
                }
                
                // Apply scale based on distance from center
                if (${affectsScale}) {
                  const scaleTarget = 1 + forceMultiplier * ${adjustedScaleAmplitude};
                  currentScale = currentScale + (scaleTarget - currentScale) * ${easeFactor};
                }
              }
            }
            
            // Apply transforms
            element.style.transform = \`translate(\${currentX}px, \${currentY}px) \${
              ${affectsRotation} ? \`rotate(\${currentRotation}deg)\` : ''
            } \${
              ${affectsScale} ? \`scale(\${currentScale})\` : ''
            }\`;
            
            // Continue animation loop
            window.requestAnimationFrame(updatePosition);
          };
          
          // Add smooth transition when moving the mouse away
          if (${smooth}) {
            element.style.transition = \`transform ${smoothingDuration}ms ease-out\`;
          }
          
          // Add event listeners
          document.addEventListener('mousemove', handleMouseMove);
          
          // Return a cleanup function
          return () => {
            document.removeEventListener('mousemove', handleMouseMove);
          };
        }
      `;
      break;

    case 'repel':
      magneticEffectScript = `
        function applyMagneticEffect(element) {
          if (!element) return;
          
          let active = false;
          let mouseX = 0;
          let mouseY = 0;
          let elementX = 0;
          let elementY = 0;
          let currentX = 0;
          let currentY = 0;
          let currentRotation = 0;
          let currentScale = 1;
          
          // Mouse movement listener
          const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            elementX = rect.left + rect.width / 2;
            elementY = rect.top + rect.height / 2;
            
            const distanceX = mouseX - elementX;
            const distanceY = mouseY - elementY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // Use our new field calculation
            ${generateFieldCalculationFunction(options)}
            
            // Calculate magnetic repulsion based on the field
            if (normalizedDistance < 1) {
              const repel = forceMultiplier * ${adjustedStrength};
              const targetX = -distanceX * repel; // Negative to repel
              const targetY = -distanceY * repel; // Negative to repel
              
              // Apply max displacement
              const magnitude = Math.sqrt(targetX * targetX + targetY * targetY);
              if (magnitude > ${adjustedMaxDisplacement}) {
                const scale = ${adjustedMaxDisplacement} / magnitude;
                currentX = targetX * scale;
                currentY = targetY * scale;
              } else {
                // Smooth movement with ease factor
                currentX = currentX + (targetX - currentX) * ${easeFactor};
                currentY = currentY + (targetY - currentY) * ${easeFactor};
              }
              
              // Apply rotation based on distance from center (inverse for repel)
              if (${affectsRotation}) {
                const rotationTarget = -((distanceX / ${radius}) * ${adjustedRotationAmplitude});
                currentRotation = currentRotation + (rotationTarget - currentRotation) * ${easeFactor};
              }
              
              // Apply scale based on distance from center (inverse for repel)
              if (${affectsScale}) {
                const scaleTarget = 1 - forceMultiplier * ${adjustedScaleAmplitude};
                currentScale = currentScale + (scaleTarget - currentScale) * ${easeFactor};
              }
            }
            
            // Apply transforms
            element.style.transform = \`translate(\${currentX}px, \${currentY}px) \${
              ${affectsRotation} ? \`rotate(\${currentRotation}deg)\` : ''
            } \${
              ${affectsScale} ? \`scale(\${currentScale})\` : ''
            }\`;
            
            // Continue animation loop
            window.requestAnimationFrame(updatePosition);
          };
          
          // Animation loop for smooth movement
          const updatePosition = () => {
            if (!active) {
              // Reset position smoothly when not active
              currentX = currentX * (1 - ${easeFactor});
              currentY = currentY * (1 - ${easeFactor});
              currentRotation = currentRotation * (1 - ${easeFactor});
              currentScale = 1 + (currentScale - 1) * (1 - ${easeFactor});
              
              // Stop animation when close to original position
              if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1 && 
                  Math.abs(currentRotation) < 0.1 && Math.abs(currentScale - 1) < 0.01) {
                element.style.transform = '';
                return;
              }
            } else {
              const distanceX = mouseX - elementX;
              const distanceY = mouseY - elementY;
              const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
              
              // Use our new field calculation
              ${generateFieldCalculationFunction(options)}
              
              // Calculate magnetic repulsion based on the field
              if (normalizedDistance < 1) {
                const repel = forceMultiplier * ${adjustedStrength};
                const targetX = -distanceX * repel; // Negative to repel
                const targetY = -distanceY * repel; // Negative to repel
                
                // Apply max displacement
                const magnitude = Math.sqrt(targetX * targetX + targetY * targetY);
                if (magnitude > ${adjustedMaxDisplacement}) {
                  const scale = ${adjustedMaxDisplacement} / magnitude;
                  currentX = targetX * scale;
                  currentY = targetY * scale;
                } else {
                  // Smooth movement with ease factor
                  currentX = currentX + (targetX - currentX) * ${easeFactor};
                  currentY = currentY + (targetY - currentY) * ${easeFactor};
                }
                
                // Apply rotation based on distance from center (inverse for repel)
                if (${affectsRotation}) {
                  const rotationTarget = -((distanceX / ${radius}) * ${adjustedRotationAmplitude});
                  currentRotation = currentRotation + (rotationTarget - currentRotation) * ${easeFactor};
                }
                
                // Apply scale based on distance from center (inverse for repel)
                if (${affectsScale}) {
                  const scaleTarget = 1 - forceMultiplier * ${adjustedScaleAmplitude};
                  currentScale = currentScale + (scaleTarget - currentScale) * ${easeFactor};
                }
              }
            }
            
            // Apply transforms
            element.style.transform = \`translate(\${currentX}px, \${currentY}px) \${
              ${affectsRotation} ? \`rotate(\${currentRotation}deg)\` : ''
            } \${
              ${affectsScale} ? \`scale(\${currentScale})\` : ''
            }\`;
            
            // Continue animation loop
            window.requestAnimationFrame(updatePosition);
          };
          
          // Add smooth transition when moving the mouse away
          if (${smooth}) {
            element.style.transition = \`transform ${smoothingDuration}ms ease-out\`;
          }
          
          // Add event listeners
          document.addEventListener('mousemove', handleMouseMove);
          
          // Return a cleanup function
          return () => {
            document.removeEventListener('mousemove', handleMouseMove);
          };
        }
      `;
      break;

    case 'follow':
      magneticEffectScript = `
        function applyMagneticEffect(element) {
          if (!element) return;
          
          let active = false;
          let mouseX = 0;
          let mouseY = 0;
          let elementX = 0;
          let elementY = 0;
          let currentX = 0;
          let currentY = 0;
          
          // Mouse movement listener
          const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            elementX = rect.left + rect.width / 2;
            elementY = rect.top + rect.height / 2;
            
            // Always follow the mouse, but with decreasing strength as distance increases
            active = true;
            
            // Start animation loop if not already running
            if (active && !animationRunning) {
              animationRunning = true;
              window.requestAnimationFrame(updatePosition);
            }
          };
          
          let animationRunning = false;
          
          // Animation loop for smooth movement
          const updatePosition = () => {
            const rect = element.getBoundingClientRect();
            elementX = rect.left + rect.width / 2;
            elementY = rect.top + rect.height / 2;
            
            const distanceX = mouseX - elementX;
            const distanceY = mouseY - elementY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // Calculate target position
            let targetX = 0;
            let targetY = 0;
            
            // Follow with decreasing strength as distance increases
            const follow = Math.min(${adjustedStrength}, ${adjustedStrength} * (1 - distance / (${radius} * 2)));
            targetX = distanceX * follow;
            targetY = distanceY * follow;
            
            // Apply max displacement
            const magnitude = Math.sqrt(targetX * targetX + targetY * targetY);
            if (magnitude > ${adjustedMaxDisplacement}) {
              const scale = ${adjustedMaxDisplacement} / magnitude;
              targetX = targetX * scale;
              targetY = targetY * scale;
            }
            
            // Smooth movement with ease factor
            currentX = currentX + (targetX - currentX) * ${easeFactor};
            currentY = currentY + (targetY - currentY) * ${easeFactor};
            
            // Apply transforms
            element.style.transform = \`translate(\${currentX}px, \${currentY}px)\`;
            
            // Continue animation loop if there's still movement
            if (Math.abs(currentX - targetX) > 0.1 || Math.abs(currentY - targetY) > 0.1) {
              window.requestAnimationFrame(updatePosition);
            } else {
              animationRunning = false;
            }
          };
          
          // Add smooth transition when moving the mouse away
          if (${smooth}) {
            element.style.transition = \`transform ${smoothingDuration}ms ease-out\`;
          }
          
          // Add event listeners
          document.addEventListener('mousemove', handleMouseMove);
          
          // Initial update
          window.requestAnimationFrame(updatePosition);
          
          // Return a cleanup function
          return () => {
            document.removeEventListener('mousemove', handleMouseMove);
          };
        }
      `;
      break;

    case 'orbit':
      magneticEffectScript = `
        function applyMagneticEffect(element) {
          if (!element) return;
          
          let active = false;
          let mouseX = 0;
          let mouseY = 0;
          let elementX = 0;
          let elementY = 0;
          let angle = 0;
          let orbitDistance = 0;
          let currentX = 0;
          let currentY = 0;
          
          // Mouse movement listener
          const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            elementX = rect.left + rect.width / 2;
            elementY = rect.top + rect.height / 2;
            
            const distanceX = mouseX - elementX;
            const distanceY = mouseY - elementY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // Calculate orbit parameters based on distance
            if (distance < ${radius}) {
              if (!active) {
                active = true;
                
                // Calculate initial orbit angle and distance
                angle = Math.atan2(distanceY, distanceX);
                orbitDistance = distance * ${adjustedStrength};
                
                // Start animation loop
                window.requestAnimationFrame(updatePosition);
              }
            } else {
              active = false;
            }
          };
          
          // Animation loop for orbit movement
          const updatePosition = () => {
            if (!active) {
              // Reset position smoothly when not active
              currentX = currentX * (1 - ${easeFactor});
              currentY = currentY * (1 - ${easeFactor});
              
              // Stop animation when close to original position
              if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
                element.style.transform = '';
                return;
              }
            } else {
              const distanceX = mouseX - elementX;
              const distanceY = mouseY - elementY;
              const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
              
              // Orbit around mouse position
              if (distance < ${radius}) {
                // Update angle for orbit
                angle += 0.05; // Speed of orbit
                
                // Calculate orbit position
                const targetX = Math.cos(angle) * orbitDistance;
                const targetY = Math.sin(angle) * orbitDistance;
                
                // Apply max displacement
                const magnitude = Math.sqrt(targetX * targetX + targetY * targetY);
                if (magnitude > ${adjustedMaxDisplacement}) {
                  const scale = ${adjustedMaxDisplacement} / magnitude;
                  currentX = targetX * scale;
                  currentY = targetY * scale;
                } else {
                  // Smooth movement with ease factor
                  currentX = currentX + (targetX - currentX) * ${easeFactor};
                  currentY = currentY + (targetY - currentY) * ${easeFactor};
                }
              }
            }
            
            // Apply transforms
            element.style.transform = \`translate(\${currentX}px, \${currentY}px)\`;
            
            // Continue animation loop
            window.requestAnimationFrame(updatePosition);
          };
          
          // Add event listeners
          document.addEventListener('mousemove', handleMouseMove);
          
          // Return a cleanup function
          return () => {
            document.removeEventListener('mousemove', handleMouseMove);
          };
        }
      `;
      break;

    case 'directional':
      magneticEffectScript = `
        function applyMagneticEffect(element) {
          if (!element) return;
          
          let active = false;
          let mouseX = 0;
          let mouseY = 0;
          let elementX = 0;
          let elementY = 0;
          let currentX = 0;
          let currentY = 0;
          let currentRotation = 0;
          let currentScale = 1;
          
          // Force direction vector (normalized)
          const forceVector = ${options.forceDirection ? 
            `{ x: ${options.forceDirection.x}, y: ${options.forceDirection.y} }` : 
            '{ x: 1, y: 0 }'};
          
          // Normalize the vector
          const forceMagnitude = Math.sqrt(forceVector.x * forceVector.x + forceVector.y * forceVector.y);
          const normalizedForce = {
            x: forceVector.x / (forceMagnitude || 1),
            y: forceVector.y / (forceMagnitude || 1)
          };
          
          // Mouse movement listener
          const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            elementX = rect.left + rect.width / 2;
            elementY = rect.top + rect.height / 2;
            
            const distanceX = mouseX - elementX;
            const distanceY = mouseY - elementY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // Calculate directional field effect
            if (distance < ${radius}) {
              if (!active) {
                active = true;
                // Start animation loop
                window.requestAnimationFrame(updatePosition);
              }
            } else {
              active = false;
            }
          };
          
          // Animation loop for smooth movement
          const updatePosition = () => {
            if (!active) {
              // Reset position smoothly when not active
              currentX = currentX * (1 - ${easeFactor});
              currentY = currentY * (1 - ${easeFactor});
              currentRotation = currentRotation * (1 - ${easeFactor});
              currentScale = 1 + (currentScale - 1) * (1 - ${easeFactor});
              
              // Stop animation when close to original position
              if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1 && 
                  Math.abs(currentRotation) < 0.1 && Math.abs(currentScale - 1) < 0.01) {
                element.style.transform = '';
                return;
              }
            } else {
              const distanceX = mouseX - elementX;
              const distanceY = mouseY - elementY;
              const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
              
              // Use our field calculations to determine force
              ${generateFieldCalculationFunction(options)}
              
              // Apply directional force (always in the same direction)
              if (normalizedDistance < 1) {
                // Scale the force by distance and strength
                const forceStrength = forceMultiplier * ${adjustedStrength};
                
                // Calculate force direction
                const targetX = normalizedForce.x * forceStrength * ${adjustedMaxDisplacement};
                const targetY = normalizedForce.y * forceStrength * ${adjustedMaxDisplacement};
                
                // Smooth movement with ease factor
                currentX = currentX + (targetX - currentX) * ${easeFactor};
                currentY = currentY + (targetY - currentY) * ${easeFactor};
                
                // Apply rotation based on force direction
                if (${affectsRotation}) {
                  // Rotate toward force direction
                  const rotationTarget = Math.atan2(normalizedForce.y, normalizedForce.x) * 180 / Math.PI;
                  currentRotation = currentRotation + (rotationTarget - currentRotation) * ${easeFactor};
                }
                
                // Apply scale based on distance from center
                if (${affectsScale}) {
                  const scaleTarget = 1 + forceMultiplier * ${adjustedScaleAmplitude};
                  currentScale = currentScale + (scaleTarget - currentScale) * ${easeFactor};
                }
              }
            }
            
            // Apply transforms
            element.style.transform = \`translate(\${currentX}px, \${currentY}px) \${
              ${affectsRotation} ? \`rotate(\${currentRotation}deg)\` : ''
            } \${
              ${affectsScale} ? \`scale(\${currentScale})\` : ''
            }\`;
            
            // Continue animation loop
            window.requestAnimationFrame(updatePosition);
          };
          
          // Add smooth transition when moving the mouse away
          if (${smooth}) {
            element.style.transition = \`transform ${smoothingDuration}ms ease-out\`;
          }
          
          // Add event listeners
          document.addEventListener('mousemove', handleMouseMove);
          
          // Return a cleanup function
          return () => {
            document.removeEventListener('mousemove', handleMouseMove);
          };
        }
      `;
      break;

    case 'vortex':
      magneticEffectScript = `
        function applyMagneticEffect(element) {
          if (!element) return;
          
          let active = false;
          let mouseX = 0;
          let mouseY = 0;
          let elementX = 0;
          let elementY = 0;
          let currentX = 0;
          let currentY = 0;
          let currentRotation = 0;
          let currentScale = 1;
          let startTime = performance.now();
          
          // Mouse movement listener
          const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            elementX = rect.left + rect.width / 2;
            elementY = rect.top + rect.height / 2;
            
            const distanceX = mouseX - elementX;
            const distanceY = mouseY - elementY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            // Calculate vortex field effect
            if (distance < ${radius}) {
              if (!active) {
                active = true;
                startTime = performance.now();
                // Start animation loop
                window.requestAnimationFrame(updatePosition);
              }
            } else {
              active = false;
            }
          };
          
          // Animation loop for smooth movement
          const updatePosition = () => {
            if (!active) {
              // Reset position smoothly when not active
              currentX = currentX * (1 - ${easeFactor});
              currentY = currentY * (1 - ${easeFactor});
              currentRotation = currentRotation * (1 - ${easeFactor});
              currentScale = 1 + (currentScale - 1) * (1 - ${easeFactor});
              
              // Stop animation when close to original position
              if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1 && 
                  Math.abs(currentRotation) < 0.1 && Math.abs(currentScale - 1) < 0.01) {
                element.style.transform = '';
                return;
              }
            } else {
              const distanceX = mouseX - elementX;
              const distanceY = mouseY - elementY;
              const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
              
              // Use our field calculations to determine force
              ${generateFieldCalculationFunction(options)}
              
              // Calculate vortex effect (circular motion around the center)
              if (normalizedDistance < 1) {
                // Get the current time for oscillation
                const oscillationFreq = ${options.oscillationFrequency || 1};
                const now = performance.now();
                const timeDelta = (now - startTime) / 1000; // in seconds
                
                // Calculate angle for the point relative to mouse position
                const angle = Math.atan2(distanceY, distanceX);
                
                // Add time-based rotation for the vortex swirl
                const rotationAngle = angle + timeDelta * Math.PI * oscillationFreq;
                
                // Calculate force to create circular motion
                const forceStrength = forceMultiplier * ${adjustedStrength};
                const orbitRadius = distance * forceStrength;
                const maxRadius = Math.min(orbitRadius, ${adjustedMaxDisplacement});
                
                // Calculate target position for vortex motion
                const targetX = maxRadius * Math.cos(rotationAngle);
                const targetY = maxRadius * Math.sin(rotationAngle);
                
                // Smooth movement with ease factor
                currentX = currentX + (targetX - currentX) * ${easeFactor};
                currentY = currentY + (targetY - currentY) * ${easeFactor};
                
                // Apply rotation following the vortex
                if (${affectsRotation}) {
                  const rotationTarget = (rotationAngle * 180 / Math.PI) % 360;
                  currentRotation = currentRotation + (rotationTarget - currentRotation) * ${easeFactor};
                }
                
                // Apply scale based on distance from center
                if (${affectsScale}) {
                  const scaleTarget = 1 + forceMultiplier * ${adjustedScaleAmplitude};
                  currentScale = currentScale + (scaleTarget - currentScale) * ${easeFactor};
                }
              }
            }
            
            // Apply transforms
            element.style.transform = \`translate(\${currentX}px, \${currentY}px) \${
              ${affectsRotation} ? \`rotate(\${currentRotation}deg)\` : ''
            } \${
              ${affectsScale} ? \`scale(\${currentScale})\` : ''
            }\`;
            
            // Continue animation loop
            window.requestAnimationFrame(updatePosition);
          };
          
          // Add smooth transition when moving the mouse away
          if (${smooth}) {
            element.style.transition = \`transform ${smoothingDuration}ms ease-out\`;
          }
          
          // Add event listeners
          document.addEventListener('mousemove', handleMouseMove);
          
          // Return a cleanup function
          return () => {
            document.removeEventListener('mousemove', handleMouseMove);
          };
        }
      `;
      break;

    default:
      // Default to attract if type is not recognized
      magneticEffectScript = generateMagneticScript({ ...options, type: 'attract' });
  }

  return magneticEffectScript;
};

/**
 * Calculate field strength based on distance and shape
 */
const generateFieldCalculationFunction = (options: MagneticEffectOptions): string => {
  const {
    fieldShape = 'circular',
    fieldWidth = 200,
    fieldHeight = 200,
    fieldRotation = 0,
    decayFunction = 'linear',
    customDecayFunction,
  } = options;

  // First generate the field shape calculation
  let shapeFunction = '';
  
  switch (fieldShape) {
    case 'elliptical':
      shapeFunction = `
        // Convert to field local coordinates
        const angle = ${fieldRotation} * Math.PI / 180;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        
        // Rotate coordinates to align with field orientation
        const rotatedX = distanceX * cosAngle + distanceY * sinAngle;
        const rotatedY = -distanceX * sinAngle + distanceY * cosAngle;
        
        // Calculate normalized elliptical distance (0-1)
        const normalizedX = rotatedX / (${fieldWidth} / 2);
        const normalizedY = rotatedY / (${fieldHeight} / 2);
        
        // Elliptical distance formula
        const fieldDistance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
        
        // Normalized distance from 0 to 1 where 1 is at the edge of the field
        const normalizedDistance = Math.min(1, fieldDistance);
      `;
      break;
      
    case 'rectangular':
      shapeFunction = `
        // Convert to field local coordinates
        const angle = ${fieldRotation} * Math.PI / 180;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        
        // Rotate coordinates to align with field orientation
        const rotatedX = distanceX * cosAngle + distanceY * sinAngle;
        const rotatedY = -distanceX * sinAngle + distanceY * cosAngle;
        
        // Calculate normalized rectangular distance (0-1 in each dimension)
        const normalizedX = Math.abs(rotatedX) / (${fieldWidth} / 2);
        const normalizedY = Math.abs(rotatedY) / (${fieldHeight} / 2);
        
        // Use the maximum component as the field distance
        const fieldDistance = Math.max(normalizedX, normalizedY);
        
        // Normalized distance from 0 to 1 where 1 is at the edge of the field
        const normalizedDistance = Math.min(1, fieldDistance);
      `;
      break;
      
    case 'custom':
      // For custom shape, we expect the logic to be defined in the custom function
      shapeFunction = `
        // Custom field shape should be implemented in customFunction
        // Default to circular if no custom function is provided
        const fieldDistance = distance / ${options.radius || 200};
        const normalizedDistance = Math.min(1, fieldDistance);
      `;
      break;
      
    case 'circular':
    default:
      shapeFunction = `
        // Simple circular field
        const fieldDistance = distance / ${options.radius || 200};
        const normalizedDistance = Math.min(1, fieldDistance);
      `;
      break;
  }
  
  // Now generate the decay function
  let decayFunctionCode = '';
  
  switch (decayFunction) {
    case 'quadratic':
      decayFunctionCode = `
        // Quadratic decay: force decreases with square of distance
        const forceMultiplier = 1 - normalizedDistance * normalizedDistance;
      `;
      break;
      
    case 'exponential':
      decayFunctionCode = `
        // Exponential decay: force decreases exponentially with distance
        const forceMultiplier = Math.exp(-4 * normalizedDistance);
      `;
      break;
      
    case 'inverse':
      decayFunctionCode = `
        // Inverse decay: force is inversely proportional to distance
        const forceMultiplier = normalizedDistance < 0.1 ? 1 : 1 / (10 * normalizedDistance);
      `;
      break;
      
    case 'constant':
      decayFunctionCode = `
        // Constant force within the field
        const forceMultiplier = normalizedDistance < 1 ? 1 : 0;
      `;
      break;
      
    case 'custom':
      if (customDecayFunction) {
        // Use the custom decay function if provided
        decayFunctionCode = `
          // Custom decay function
          const forceMultiplier = (${customDecayFunction})(normalizedDistance);
        `;
      } else {
        // Fall back to linear if no custom function is provided
        decayFunctionCode = `
          // Linear decay: force decreases linearly with distance
          const forceMultiplier = 1 - normalizedDistance;
        `;
      }
      break;
      
    case 'linear':
    default:
      decayFunctionCode = `
        // Linear decay: force decreases linearly with distance
        const forceMultiplier = 1 - normalizedDistance;
      `;
      break;
  }
  
  // Combine shape and decay functions
  return `
    ${shapeFunction}
    
    // Only apply force if within the field
    if (normalizedDistance < 1) {
      ${decayFunctionCode}
    } else {
      const forceMultiplier = 0;
    }
  `;
}

/**
 * Creates a magnetic effect for interactive elements
 */
export const magneticEffect = (options: MagneticEffectOptions = {}) => {
  const {
    strength = 0.5,
    radius = 200,
    type = 'attract',
    gpuAccelerated = true,
    reducedMotion = false,
  } = options;

  // Generate the JavaScript for the magnetic effect
  const magneticScript = generateMagneticScript({ ...options, reducedMotion });

  // Generate a unique ID for the effect
  const effectId = Math.random().toString(36).substring(2, 9);

  // Add GPU acceleration if requested
  const gpuStyles = gpuAccelerated
    ? `
    will-change: transform;
    backface-visibility: hidden;
  `
    : '';

  // Return CSS and JS to apply the magnetic effect
  return cssWithKebabProps`
    ${gpuStyles}
    position: relative;
    
    /* CSS to inject JavaScript */
    &[data-magnetic-effect="${effectId}"] {
      transform-style: preserve-3d;
    }
    
    /* Add the effect on mount using JavaScript */
    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      pointer-events: none;
      visibility: hidden;
      background: url("data:text/javascript;base64,${Buffer.from(
        `
        (() => {
          // Wait for the element to be rendered
          setTimeout(() => {
            const element = document.querySelector('[data-magnetic-effect="${effectId}"]');
            if (!element) return;
            
            ${magneticScript}
            
            // Apply the magnetic effect
            applyMagneticEffect(element);
          }, 100);
        })();
      `
      ).toString('base64')}");
    }
    
    /* Add data attribute for JavaScript targeting */
    attribute: data-magnetic-effect ${effectId};
  `;
};

export default magneticEffect;
