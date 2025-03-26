/**
 * Magnetic Effect System
 *
 * Physics-based magnetic attraction/repulsion effects for interactive elements
 */
import { css } from 'styled-components';

import { cssWithKebabProps } from '../../core/cssUtils';

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
  type?: 'attract' | 'repel' | 'follow' | 'orbit' | 'custom';

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
            
            // Calculate magnetic pull based on distance
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
              
              // Calculate magnetic pull based on distance
              if (distance < ${radius}) {
                const pull = (1 - distance / ${radius}) * ${adjustedStrength};
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
                  const scaleTarget = 1 + (1 - distance / ${radius}) * ${adjustedScaleAmplitude};
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
            
            // Calculate magnetic repulsion based on distance
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
              
              // Calculate magnetic repulsion based on distance
              if (distance < ${radius}) {
                const repel = (1 - distance / ${radius}) * ${adjustedStrength};
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
                  const scaleTarget = 1 - (1 - distance / ${radius}) * ${adjustedScaleAmplitude};
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

    default:
      // Default to attract if type is not recognized
      magneticEffectScript = generateMagneticScript({ ...options, type: 'attract' });
  }

  return magneticEffectScript;
};

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
